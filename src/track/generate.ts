/** Deterministic track generation: seed string → Track. */
import { TRACK } from '../config.ts'
import { createRng, type Rng } from '../core/rng.ts'
import { catmullRomLoop, resampleLoop } from './spline.ts'
import { validateLoop } from './validate.ts'
import { buildGates } from './checkpoints.ts'
import type { Bounds, Track, Vec2 } from './types.ts'

/** The same seed always yields the same track. Throws if no attempt is valid. */
export function generateTrack(seed: string): Track {
  const rng = createRng(seed)
  for (let attempt = 0; attempt < TRACK.MAX_ATTEMPTS; attempt++) {
    const dense = catmullRomLoop(controlPoints(rng), TRACK.SPLINE_SAMPLES)
    const points = resampleLoop(dense, TRACK.SAMPLE_SPACING)
    if (validateLoop(points, TRACK.WIDTH, TRACK.SAMPLE_SPACING) === null) {
      return assemble(seed, points)
    }
  }
  throw new Error(`No valid track found for seed "${seed}"`)
}

/** Points around the origin with jittered angle and varied radius. */
function controlPoints(rng: Rng): Vec2[] {
  const n = TRACK.CONTROL_POINTS
  const spacing = (Math.PI * 2) / n
  const pts: Vec2[] = []
  for (let i = 0; i < n; i++) {
    const angle = i * spacing + rng.range(-0.5, 0.5) * TRACK.ANGLE_JITTER * spacing
    const radius = rng.range(TRACK.RADIUS_MIN, TRACK.RADIUS_MAX)
    pts.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius })
  }
  if (rng.next() < 0.5) pts.reverse() // race clockwise or anticlockwise
  return pts
}

function assemble(seed: string, points: Vec2[]): Track {
  const width = TRACK.WIDTH
  const gates = buildGates(points, TRACK.CHECKPOINTS, width * TRACK.GATE_HALF_WIDTH)
  const { center, forward } = gates[0]
  const start = {
    pos: { x: center.x - forward.x * TRACK.START_OFFSET, y: center.y - forward.y * TRACK.START_OFFSET },
    heading: Math.atan2(forward.y, forward.x),
  }
  return {
    seed,
    width,
    points,
    gates,
    start,
    bounds: boundsOf(points, width / 2),
    arena: boundsOf(points, width / 2 + width * TRACK.ARENA_PADDING),
  }
}

function boundsOf(points: Vec2[], pad: number): Bounds {
  const b: Bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  for (const p of points) {
    b.minX = Math.min(b.minX, p.x - pad)
    b.minY = Math.min(b.minY, p.y - pad)
    b.maxX = Math.max(b.maxX, p.x + pad)
    b.maxY = Math.max(b.maxY, p.y + pad)
  }
  return b
}
