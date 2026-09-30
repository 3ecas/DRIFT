/** Closed Catmull-Rom spline sampling and arc-length re-sampling. */
import type { Vec2 } from './types'
import { distance } from './geometry'

/** Samples a closed uniform Catmull-Rom spline through the control points. */
export function catmullRomLoop(ctrl: Vec2[], samplesPerSegment: number): Vec2[] {
  const n = ctrl.length
  const out: Vec2[] = []
  for (let i = 0; i < n; i++) {
    const p0 = ctrl[(i - 1 + n) % n]
    const p1 = ctrl[i]
    const p2 = ctrl[(i + 1) % n]
    const p3 = ctrl[(i + 2) % n]
    for (let s = 0; s < samplesPerSegment; s++) {
      const t = s / samplesPerSegment
      out.push({
        x: catmullRom(p0.x, p1.x, p2.x, p3.x, t),
        y: catmullRom(p0.y, p1.y, p2.y, p3.y, t),
      })
    }
  }
  return out
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t
  const t3 = t2 * t
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  )
}

/**
 * Re-samples a closed polyline at equal arc-length steps, as close to
 * `spacing` as a whole number of points allows.
 */
export function resampleLoop(points: Vec2[], spacing: number): Vec2[] {
  const n = points.length
  const segLen: number[] = []
  let total = 0
  for (let i = 0; i < n; i++) {
    segLen.push(distance(points[i], points[(i + 1) % n]))
    total += segLen[i]
  }
  const count = Math.max(3, Math.round(total / spacing))
  const step = total / count

  const out: Vec2[] = []
  let seg = 0
  let segStart = 0
  for (let k = 0; k < count; k++) {
    const target = k * step
    while (seg < n - 1 && segStart + segLen[seg] < target) {
      segStart += segLen[seg]
      seg++
    }
    const t = segLen[seg] > 0 ? (target - segStart) / segLen[seg] : 0
    const a = points[seg]
    const b = points[(seg + 1) % n]
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
  }
  return out
}
