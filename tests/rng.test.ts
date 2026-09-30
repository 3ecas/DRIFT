import { describe, expect, it } from 'vitest'
import { createRng, hashString } from '../src/core/rng'

describe('seeded rng', () => {
  it('gives the same sequence for the same seed', () => {
    const a = createRng('2026-09-30')
    const b = createRng('2026-09-30')
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next())
  })

  it('gives different sequences for different seeds', () => {
    const a = createRng('2026-09-30')
    const b = createRng('2026-10-01')
    const same = Array.from({ length: 10 }, () => a.next() === b.next())
    expect(same).toContain(false)
  })

  it('stays within [0, 1) and honours ranges', () => {
    const rng = createRng(42)
    for (let i = 0; i < 1000; i++) {
      const v = rng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
      const n = rng.int(3, 5)
      expect([3, 4, 5]).toContain(n)
      const r = rng.range(-2, 2)
      expect(r).toBeGreaterThanOrEqual(-2)
      expect(r).toBeLessThan(2)
    }
  })

  it('has a stable hash and first values (guards against accidental algorithm changes)', () => {
    expect(hashString('daily-ghost-race')).toBe(hashString('daily-ghost-race'))
    expect(hashString('a')).not.toBe(hashString('b'))
    const rng = createRng('2026-01-01')
    const first = [rng.next(), rng.next(), rng.next()]
    // Known-good values recorded once; every engine must reproduce them.
    expect(first).toEqual(KNOWN_FIRST_VALUES)
  })
})

const KNOWN_FIRST_VALUES = [0.900545729091391, 0.48155506886541843, 0.09119733166880906]
