/** Small 2D vector helpers. Only +, -, ×, ÷ and sqrt: deterministic everywhere. */
import type { Bounds, Vec2 } from './types'

export const vec = (x: number, y: number): Vec2 => ({ x, y })
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y })
export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y })
export const scale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s })
export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y
export const cross = (a: Vec2, b: Vec2): number => a.x * b.y - a.y * b.x
export const length = (a: Vec2): number => Math.sqrt(a.x * a.x + a.y * a.y)
export const distance = (a: Vec2, b: Vec2): number => length(sub(a, b))
/** Rotated 90° anticlockwise (in y-down screen space: clockwise). */
export const perp = (a: Vec2): Vec2 => ({ x: -a.y, y: a.x })

export function normalize(a: Vec2): Vec2 {
  const l = length(a)
  return l > 0 ? scale(a, 1 / l) : vec(0, 0)
}

/** Squared distance from p to the segment ab. */
export function distanceToSegmentSq(p: Vec2, a: Vec2, b: Vec2): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const l2 = abx * abx + aby * aby
  let t = l2 > 0 ? ((p.x - a.x) * abx + (p.y - a.y) * aby) / l2 : 0
  t = t < 0 ? 0 : t > 1 ? 1 : t
  const dx = a.x + abx * t - p.x
  const dy = a.y + aby * t - p.y
  return dx * dx + dy * dy
}

/** Moves p (in place) inside the box, if it is outside. */
export function clampToBounds(p: Vec2, b: Bounds): void {
  if (p.x < b.minX) p.x = b.minX
  else if (p.x > b.maxX) p.x = b.maxX
  if (p.y < b.minY) p.y = b.minY
  else if (p.y > b.maxY) p.y = b.maxY
}

/** Distance from p to the closest point of a closed polyline. */
export function distanceToLoop(p: Vec2, points: Vec2[]): number {
  let best = Infinity
  const n = points.length
  for (let i = 0; i < n; i++) {
    const d = distanceToSegmentSq(p, points[i], points[(i + 1) % n])
    if (d < best) best = d
  }
  return Math.sqrt(best)
}

/**
 * Where the directed segment p1→p2 crosses the segment q1–q2, as a fraction
 * t in (0, 1] along p1→p2, or null if they don't touch. t = 0 is excluded so
 * a point sitting exactly on a line is not counted twice on consecutive moves.
 */
export function segmentCrossing(p1: Vec2, p2: Vec2, q1: Vec2, q2: Vec2): number | null {
  const rx = p2.x - p1.x
  const ry = p2.y - p1.y
  const sx = q2.x - q1.x
  const sy = q2.y - q1.y
  const denom = rx * sy - ry * sx
  if (denom === 0) return null
  const qpx = q1.x - p1.x
  const qpy = q1.y - p1.y
  const t = (qpx * sy - qpy * sx) / denom
  const u = (qpx * ry - qpy * rx) / denom
  return t > 0 && t <= 1 && u >= 0 && u <= 1 ? t : null
}
