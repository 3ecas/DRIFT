/**
 * One attempt at the track: car + lap progress + tick counter.
 * Pure simulation: no DOM, no canvas, no wall clock.
 */
import { DT, SIM } from '../config'
import { copyCar, createCar, type CarState } from '../car/state'
import { stepCar } from '../car/physics'
import { advanceProgress, createProgress, type LapProgress } from '../track/checkpoints'
import { clampToBounds, distanceToLoop } from '../track/geometry'
import type { Track } from '../track/types'

export type Phase = 'ready' | 'racing' | 'finished'

export interface Run {
  readonly track: Track
  car: CarState
  /** Car state one tick earlier, for render interpolation. */
  prev: CarState
  progress: LapProgress
  phase: Phase
  /** Whole ticks simulated since the timer started. */
  ticks: number
  /** Exact finish time in ticks (fractional). Valid once finished. */
  finishTicks: number
}

export function createRun(track: Track): Run {
  const { pos, heading } = track.start
  return {
    track,
    car: createCar(pos.x, pos.y, heading),
    prev: createCar(pos.x, pos.y, heading),
    progress: createProgress(),
    phase: 'ready',
    ticks: 0,
    finishTicks: 0,
  }
}

/** One fixed simulation step. The timer starts with the first steer input. Returns the new phase. */
export function stepRun(run: Run, steer: number): Phase {
  if (run.phase === 'ready' && steer !== 0) run.phase = 'racing'
  if (run.phase !== 'racing') return run.phase

  copyCar(run.car, run.prev)
  const onTrack = distanceToLoop(run.car, run.track.points) <= run.track.width / 2
  stepCar(run.car, steer, onTrack, DT)
  clampToBounds(run.car, run.track.arena)
  run.ticks++

  const crossing = advanceProgress(run.progress, run.track.gates, run.prev, run.car)
  if (crossing?.lapCompleted && run.progress.lap >= SIM.LAPS) {
    run.phase = 'finished'
    // The line was crossed part-way through this tick.
    run.finishTicks = run.ticks - 1 + crossing.t
  }
  return run.phase
}

/** Elapsed time in milliseconds, derived from simulation ticks only. */
export function runTimeMs(run: Run): number {
  const ticks = run.phase === 'finished' ? run.finishTicks : run.ticks
  return (ticks * 1000) / SIM.TICK_RATE
}
