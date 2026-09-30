/** Checkpoint gates and in-order lap counting. */
import type { Gate, Vec2 } from './types'
import { dot, normalize, perp, segmentCrossing, sub } from './geometry'

/** Evenly spaced gates along the loop. Gate 0 is the start/finish line. */
export function buildGates(points: Vec2[], count: number, halfWidth: number): Gate[] {
  const n = points.length
  const gates: Gate[] = []
  for (let g = 0; g < count; g++) {
    const index = Math.floor((g * n) / count)
    const center = points[index]
    const forward = normalize(sub(points[(index + 1) % n], points[(index - 1 + n) % n]))
    const side = perp(forward)
    gates.push({
      index,
      center,
      forward,
      a: { x: center.x + side.x * halfWidth, y: center.y + side.y * halfWidth },
      b: { x: center.x - side.x * halfWidth, y: center.y - side.y * halfWidth },
    })
  }
  return gates
}

export interface LapProgress {
  /** Index of the next gate that has to be crossed. */
  next: number
  /** Completed laps. */
  lap: number
}

/** The car starts just behind gate 0, so the first gate to collect is gate 1. */
export const createProgress = (): LapProgress => ({ next: 1, lap: 0 })

export interface Crossing {
  /** Fraction of the move at which the gate was crossed, in (0, 1]. */
  t: number
  lapCompleted: boolean
}

/**
 * Advances progress when the move from→to crosses the next gate in the
 * racing direction. Any other gate, or a backwards crossing, is ignored,
 * so shortcuts and reversing never count.
 */
export function advanceProgress(
  progress: LapProgress,
  gates: Gate[],
  from: Vec2,
  to: Vec2,
): Crossing | null {
  const gate = gates[progress.next]
  if (dot(sub(to, from), gate.forward) <= 0) return null
  const t = segmentCrossing(from, to, gate.a, gate.b)
  if (t === null) return null
  const lapCompleted = progress.next === 0
  if (lapCompleted) progress.lap++
  progress.next = (progress.next + 1) % gates.length
  return { t, lapCompleted }
}
