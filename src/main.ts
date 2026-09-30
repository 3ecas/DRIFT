/** Entry point: wires DOM input and rendering to the simulation. */
import { SIM } from './config'
import { startLoop } from './core/loop'
import { attachInput, steerOf } from './core/input'
import { generateTrack } from './track/generate'
import { Session } from './race/session'
import { runTimeMs } from './race/run'
import { lerpPose } from './car/state'
import { Scene } from './render/scene'
import { Hud } from './ui/hud'

// Milestone 1: one fixed track. Override with ?seed=anything to try others.
const seed = new URLSearchParams(location.search).get('seed') ?? 'milestone-1'

const canvas = document.getElementById('game') as HTMLCanvasElement
const hudRoot = document.getElementById('hud') as HTMLElement

const session = new Session(generateTrack(seed))
const scene = new Scene(canvas)
scene.setTrack(session.track)
const restart = (): void => session.restart()
const hud = new Hud(hudRoot, restart)
const input = attachInput(canvas, restart)

startLoop({
  tickRate: SIM.TICK_RATE,
  update: () => session.update(steerOf(input)),
  render: (alpha) => {
    const { run } = session
    scene.draw({
      car: run.phase === 'racing' ? lerpPose(run.prev, run.car, alpha) : run.car,
      onTrack: run.car.onTrack,
      ghosts: [],
    })
    hud.update({
      timeMs: runTimeMs(run),
      lap: run.progress.lap,
      laps: SIM.LAPS,
      phase: run.phase,
    })
  },
})
