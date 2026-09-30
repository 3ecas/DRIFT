/** Entry point: wires DOM input, storage and rendering to the simulation. */
import { SIM } from './config'
import { startLoop } from './core/loop'
import { attachInput, steerOf } from './core/input'
import { utcDateSeed } from './core/daily'
import { generateTrack } from './track/generate'
import { Session } from './race/session'
import { runTimeMs } from './race/run'
import { lerpPose } from './car/state'
import { loadBest, saveIfBest } from './ghost/storage'
import type { GhostRun } from './ghost/types'
import { Scene } from './render/scene'
import { Hud } from './ui/hud'
import { Results } from './ui/results'

const ticksToMs = (ticks: number): number => (ticks * 1000) / SIM.TICK_RATE

// Today's track for everyone. Override with ?seed=anything to practise another.
const seed = new URLSearchParams(location.search).get('seed') ?? utcDateSeed()

const canvas = document.getElementById('game') as HTMLCanvasElement
const hudRoot = document.getElementById('hud') as HTMLElement

const session = new Session(generateTrack(seed))
session.ghost = loadBest(seed)
const scene = new Scene(canvas)
scene.setTrack(session.track)

const restart = (): void => {
  session.restart()
  results.hide()
}
const hud = new Hud(hudRoot, restart)
const results = new Results(hudRoot, restart)
const input = attachInput(canvas, restart)

const onFinish = (recorded: GhostRun): void => {
  const raced = session.ghost
  const best = saveIfBest(recorded)
  results.show({
    timeMs: ticksToMs(recorded.finishTicks),
    bestMs: ticksToMs(best.finishTicks),
    ghostMs: raced ? ticksToMs(raced.finishTicks) : null,
    isNewBest: best === recorded,
  })
  session.ghost = best
}

startLoop({
  tickRate: SIM.TICK_RATE,
  update: () => {
    const finished = session.update(steerOf(input))
    if (finished) onFinish(finished)
  },
  render: (alpha) => {
    const { run } = session
    const ghost = session.ghostPose(alpha)
    scene.draw({
      car: run.phase === 'racing' ? lerpPose(run.prev, run.car, alpha) : run.car,
      onTrack: run.car.onTrack,
      ghosts: ghost ? [ghost] : [],
    })
    hud.update({ timeMs: runTimeMs(run), lap: run.progress.lap, laps: SIM.LAPS, phase: run.phase })
  },
})
