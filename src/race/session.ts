/**
 * Owns the current run on a track and restarts it. This is where ghost
 * recording and playback attach in later milestones. Still no DOM.
 */
import type { Track } from '../track/types'
import { createRun, stepRun, type Run } from './run'

export class Session {
  run: Run

  constructor(readonly track: Track) {
    this.run = createRun(track)
  }

  restart(): void {
    this.run = createRun(this.track)
  }

  update(steer: number): void {
    stepRun(this.run, steer)
  }
}
