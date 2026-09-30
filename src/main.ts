/** Entry point: wires DOM input, storage, network and rendering to the simulation. */
import { COLORS, SIM } from './config.ts'
import { startLoop } from './core/loop.ts'
import { attachInput, steerOf } from './core/input.ts'
import { msUntilNextUtcDay, utcDateSeed } from './core/daily.ts'
import { advanceStreak, currentStreak, loadStreak, saveStreak } from './core/streak.ts'
import { generateTrack } from './track/generate.ts'
import { Session } from './race/session.ts'
import { runTimeMs } from './race/run.ts'
import { lerpPose } from './car/state.ts'
import { loadBest, saveIfBest } from './ghost/storage.ts'
import type { GhostRun } from './ghost/types.ts'
import { Scene } from './render/scene.ts'
import { Hud } from './ui/hud.ts'
import { Results } from './ui/results.ts'
import { copyText, shareText } from './ui/share.ts'
import { Online } from './online.ts'

const ticksToMs = (ticks: number): number => (ticks * 1000) / SIM.TICK_RATE

// Today's track for everyone. Override with ?seed=anything to practise another.
const seedParam = new URLSearchParams(location.search).get('seed')
const seed = seedParam ?? utcDateSeed()

const canvas = document.getElementById('game') as HTMLCanvasElement
const hudRoot = document.getElementById('hud') as HTMLElement

const session = new Session(generateTrack(seed))
const scene = new Scene(canvas)
scene.setTrack(session.track)

let lastResult: GhostRun | null = null
let localBest = loadBest(seed)

const restart = (): void => {
  // A new UTC day means a new track: reload rather than keep racing yesterday's.
  if (!seedParam && utcDateSeed() !== seed) location.reload()
  session.restart()
  results.hide()
}
const share = async (): Promise<boolean> => {
  if (!lastResult) return false
  const url = location.origin + location.pathname
  const best = localBest ?? lastResult
  const streak = currentStreak(loadStreak(), utcDateSeed())
  return copyText(shareText({ seed, timeMs: ticksToMs(lastResult.finishTicks), bestMs: ticksToMs(best.finishTicks), streak, url }))
}
const hud = new Hud(hudRoot, restart)
const results = new Results(hudRoot, restart, share)
const input = attachInput(canvas, restart)
const online = new Online(seed, results.element, (ghosts) => syncGhosts(ghosts))

/** The local best in the accent colour, online ghosts in their own colour. */
const syncGhosts = (onlineGhosts: GhostRun[]): void => {
  session.ghosts = [
    ...(localBest ? [{ run: localBest, color: COLORS.ACCENT }] : []),
    ...onlineGhosts.map((run) => ({ run, color: COLORS.ONLINE_GHOST })),
  ]
}
syncGhosts([])
void online.loadGhosts()

const onFinish = (recorded: GhostRun): void => {
  const raced = localBest
  localBest = saveIfBest(recorded)
  const streak = advanceStreak(loadStreak(), utcDateSeed())
  saveStreak(streak)
  lastResult = recorded
  results.show({
    timeMs: ticksToMs(recorded.finishTicks),
    bestMs: ticksToMs(localBest.finishTicks),
    ghostMs: raced ? ticksToMs(raced.finishTicks) : null,
    isNewBest: localBest === recorded,
    streak: streak.count,
  })
  syncGhosts(online.ghosts)
  void online.submit(recorded)
}

startLoop({
  tickRate: SIM.TICK_RATE,
  update: () => {
    const finished = session.update(steerOf(input))
    if (finished) onFinish(finished)
  },
  render: (alpha) => {
    const { run } = session
    scene.draw({
      car: run.phase === 'racing' ? lerpPose(run.prev, run.car, alpha) : run.car,
      onTrack: run.car.onTrack,
      ghosts: session.ghostPoses(alpha),
    })
    hud.update({
      timeMs: runTimeMs(run),
      lap: run.progress.lap,
      laps: SIM.LAPS,
      phase: run.phase,
      steerLeft: input.left,
      steerRight: input.right,
    })
    results.tick(msUntilNextUtcDay())
  },
})
