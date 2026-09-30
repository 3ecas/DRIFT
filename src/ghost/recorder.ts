/** Samples the car's pose every few ticks while a run is in progress. */
import { GHOST } from '../config.ts'
import type { Pose } from '../car/state.ts'
import type { GhostRun } from './types.ts'

export class GhostRecorder {
  private frames: number[] = []

  constructor(private readonly interval = GHOST.SAMPLE_INTERVAL) {}

  reset(): void {
    this.frames = []
  }

  /** Call once per tick with the tick number *after* stepping (0 for the start pose). */
  sample(tick: number, pose: Pose): void {
    if (tick % this.interval !== 0) return
    this.frames.push(round(pose.x, 100), round(pose.y, 100), round(pose.heading, 1000))
  }

  toRun(seed: string, finishTicks: number): GhostRun {
    return { seed, finishTicks, interval: this.interval, frames: this.frames.slice() }
  }
}

function round(v: number, scale: number): number {
  return Math.round(v * scale) / scale
}
