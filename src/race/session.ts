/**
 * Owns the current run, records it as a ghost and plays the ghosts to beat.
 * Pure simulation: no DOM. Persistence and networking happen in main.ts.
 */
import type { Pose } from '../car/state.ts'
import type { Track } from '../track/types.ts'
import { GhostRecorder } from '../ghost/recorder.ts'
import { ghostPose } from '../ghost/playback.ts'
import type { GhostRun } from '../ghost/types.ts'
import { createRun, stepRun, type Run } from './run.ts'

export interface RacingGhost {
  run: GhostRun
  color: string
}

export class Session {
  run: Run
  /** Ghosts being raced: the local best and any fetched from the leaderboard. */
  ghosts: RacingGhost[] = []
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

  /** Ghost poses for rendering; `alpha` is the fraction of the next tick. */
  ghostPoses(alpha: number): { pose: Pose; color: string }[] {
    if (this.run.phase === 'ready') return []
    const tick = this.run.phase === 'finished' ? this.run.finishTicks : this.run.ticks + alpha
    const out: { pose: Pose; color: string }[] = []
    for (const g of this.ghosts) {
      const pose = ghostPose(g.run, tick)
      if (pose) out.push({ pose, color: g.color })
    }
    return out
  }
}
