import { describe, expect, it } from 'vitest'
import { TRACK } from '../src/config'
import { generateTrack } from '../src/track/generate'
import { validateLoop } from '../src/track/validate'
import { distance } from '../src/track/geometry'

describe('track generation', () => {
  it('is deterministic for a seed', () => {
    const a = generateTrack('2026-09-30')
    const b = generateTrack('2026-09-30')
    expect(a).toEqual(b)
  })

  it('differs between seeds', () => {
    const a = generateTrack('2026-09-30')
    const b = generateTrack('2026-10-01')
    expect(a.points).not.toEqual(b.points)
  })

  it('produces a valid, evenly spaced, closed loop with gates', () => {
    const track = generateTrack('2026-09-30')
    expect(validateLoop(track.points, track.width, TRACK.SAMPLE_SPACING)).toBeNull()
    const n = track.points.length
    for (let i = 0; i < n; i++) {
      const gap = distance(track.points[i], track.points[(i + 1) % n])
      expect(Math.abs(gap - TRACK.SAMPLE_SPACING)).toBeLessThan(0.2)
    }
    expect(track.gates).toHaveLength(TRACK.CHECKPOINTS)
    expect(track.gates[0].index).toBe(0)
    expect(track.start.pos).not.toEqual(track.gates[0].center)
  })

  it('generates a track for every UTC date in the next three years', () => {
    const day = 24 * 60 * 60 * 1000
    const start = Date.UTC(2026, 0, 1)
    for (let t = start; t < start + 3 * 366 * day; t += day) {
      const seed = new Date(t).toISOString().slice(0, 10)
      expect(() => generateTrack(seed)).not.toThrow()
    }
  })
})

describe('arena', () => {
  it('encloses the track with room to run wide', () => {
    const track = generateTrack('2026-09-30')
    const { bounds, arena, width } = track
    expect(arena.minX).toBeLessThan(bounds.minX - width * 0.5)
    expect(arena.maxY).toBeGreaterThan(bounds.maxY + width * 0.5)
  })
})
