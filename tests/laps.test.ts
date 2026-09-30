import { describe, expect, it } from 'vitest'
import { advanceProgress, buildGates, createProgress } from '../src/track/checkpoints.ts'
import type { Vec2 } from '../src/track/types.ts'

/** A circle of radius 100 with 4 gates at 0°, 90°, 180° and 270°. */
const N = 72
const points: Vec2[] = Array.from({ length: N }, (_, i) => {
  const a = (i / N) * Math.PI * 2
  return { x: Math.cos(a) * 100, y: Math.sin(a) * 100 }
})
const gates = buildGates(points, 4, 20)
const at = (i: number): Vec2 => points[((i % N) + N) % N]

/** Move along the loop from point index `from` to `to`, one point at a time. */
function walk(progress: ReturnType<typeof createProgress>, from: number, to: number): void {
  for (let i = from; i < to; i++) advanceProgress(progress, gates, at(i), at(i + 1))
}

describe('checkpoints and laps', () => {
  it('places gate 0 at the first point', () => {
    expect(gates[0].index).toBe(0)
    expect(gates.map((g) => g.index)).toEqual([0, 18, 36, 54])
  })

  it('counts a lap only after every gate has been passed in order', () => {
    const p = createProgress()
    walk(p, 0, 36) // past gates 1 and 2
    expect(p.next).toBe(3)
    expect(p.lap).toBe(0)
    walk(p, 36, 72) // past gate 3 and back over the start line
    expect(p.lap).toBe(1)
    expect(p.next).toBe(1)
  })

  it('ignores gates crossed out of order (shortcuts)', () => {
    const p = createProgress()
    walk(p, 0, 18) // gate 1 done, next is 2
    // Jump straight across the circle to just past gate 3, skipping gate 2.
    advanceProgress(p, gates, at(20), at(56))
    expect(p.next).toBe(2)
    walk(p, 56, 72) // crossing the start line without gates 2 and 3 does nothing
    expect(p.lap).toBe(0)
    expect(p.next).toBe(2)
  })

  it('ignores backwards crossings', () => {
    const p = createProgress()
    walk(p, 0, 17) // just before gate 1
    advanceProgress(p, gates, at(19), at(17)) // cross gate 1 the wrong way
    expect(p.next).toBe(1)
    advanceProgress(p, gates, at(17), at(19)) // now the right way
    expect(p.next).toBe(2)
  })

  it('reports where within the move the line was crossed', () => {
    const p = createProgress()
    const crossing = advanceProgress(p, gates, { x: 105, y: 0 }, { x: 105, y: 0 })
    expect(crossing).toBeNull()
    walk(p, 0, 17)
    const c = advanceProgress(p, gates, at(17), at(19))
    expect(c?.t).toBeGreaterThan(0.4)
    expect(c?.t).toBeLessThan(0.6)
    expect(c?.lapCompleted).toBe(false)
  })

  it('counts three laps', () => {
    const p = createProgress()
    for (let lap = 0; lap < 3; lap++) walk(p, 0, 72)
    expect(p.lap).toBe(3)
  })
})
