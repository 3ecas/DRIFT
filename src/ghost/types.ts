/** A recorded run: poses sampled every `interval` ticks, starting at tick 0. */
export interface GhostRun {
  seed: string
  /** Finish time in simulation ticks (fractional). */
  finishTicks: number
  /** Ticks between samples. */
  interval: number
  /** Flat [x, y, heading, x, y, heading, ...]. */
  frames: number[]
}
