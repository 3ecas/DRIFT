/** Rejects centrelines that overlap themselves or bend too tightly. */
import { TRACK } from '../config.ts'
import type { Vec2 } from './types.ts'
import { distance } from './geometry.ts'

/** Returns null for a usable loop, otherwise the reason it was rejected. */
export function validateLoop(points: Vec2[], width: number, spacing: number): string | null {
  if (tightestCornerRadius(points) < TRACK.MIN_CORNER_RADIUS) return 'corner too tight'
  if (!isWellSeparated(points, width * TRACK.MIN_SEPARATION, spacing)) return 'track overlaps itself'
  return null
}

/** Smallest circumradius over the triples (i - k, i, i + k) around the loop. */
export function tightestCornerRadius(points: Vec2[], k = 3): number {
  const n = points.length
  let min = Infinity
  for (let i = 0; i < n; i++) {
    const r = circumradius(points[(i - k + n) % n], points[i], points[(i + k) % n])
    if (r < min) min = r
  }
  return min
}

function circumradius(a: Vec2, b: Vec2, c: Vec2): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const acx = c.x - a.x
  const acy = c.y - a.y
  const twiceArea = Math.abs(abx * acy - aby * acx)
  if (twiceArea < 1e-9) return Infinity
  return (distance(a, b) * distance(b, c) * distance(c, a)) / (2 * twiceArea)
}

/**
 * True when every pair of points further apart along the loop than
 * SEPARATION_SKIP is at least `minDistance` apart in the plane.
 */
export function isWellSeparated(points: Vec2[], minDistance: number, spacing: number): boolean {
  const n = points.length
  const skip = Math.ceil(TRACK.SEPARATION_SKIP / spacing)
  const min2 = minDistance * minDistance
  for (let i = 0; i < n; i++) {
    for (let j = i + skip; j < n; j++) {
      if (n - (j - i) < skip) continue // closer the other way round the loop
      const dx = points[j].x - points[i].x
      const dy = points[j].y - points[i].y
      if (dx * dx + dy * dy < min2) return false
    }
  }
  return true
}
