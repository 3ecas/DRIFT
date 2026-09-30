/**
 * Owns the current run, records it as a ghost and plays the ghost to beat.
 * Pure simulation: no DOM. Persistence happens in main.ts.
 */
import type { Pose } from '../car/state'
import type { Track } from '../track/types'
import { GhostRecorder } from '../ghost/recorder'
import { ghostPose } from '../ghost/playback'
import type { GhostRun } from '../ghost/types'
import { createRun, stepRun, type Run } from './run'

export class Session {
  run: Run
  /** The ghost being raced, if any. */
  ghost: GhostRun | null = null
  private readonly recorder = new GhostRecorder()

  constructor(readonly track: Track) {
    this.run = createRun(track)
    this.recorder.sample(0, this.run.car)
  }

  restart(): void {
    this.run = createRun(this.track)
    this.recorder.reset()
    this.recorder.sample(0, this.run.car)
  }

  /** One tick. Returns the recorded run on the tick the player finishes. */
  update(steer: number): GhostRun | null {
    const { run } = this
    if (run.phase === 'finished') return null
    const phase = stepRun(run, steer)
    if (phase === 'ready') return null
    this.recorder.sample(run.ticks, run.car)
    return phase === 'finished' ? this.recorder.toRun(this.track.seed, run.finishTicks) : null
  }

  /** Ghost pose for rendering; `alpha` is the fraction of the next tick. */
  ghostPose(alpha: number): Pose | null {
    if (!this.ghost || this.run.phase === 'ready') return null
    const tick = this.run.phase === 'finished' ? this.run.finishTicks : this.run.ticks + alpha
    return ghostPose(this.ghost, tick)
  }
}
