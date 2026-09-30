import { describe, expect, it } from 'vitest'
import { utcDateSeed } from '../src/core/daily'
import { GhostRecorder } from '../src/ghost/recorder'
import { ghostPose } from '../src/ghost/playback'
import { loadBest, saveIfBest, type KeyValueStore } from '../src/ghost/storage'
import type { GhostRun } from '../src/ghost/types'

const fakeStore = (): KeyValueStore => {
  const map = new Map<string, string>()
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) }
}

describe('daily seed', () => {
  it('is the UTC date', () => {
    expect(utcDateSeed(Date.UTC(2026, 8, 30, 23, 59))).toBe('2026-09-30')
    expect(utcDateSeed(Date.UTC(2026, 9, 1, 0, 0))).toBe('2026-10-01')
  })
})

describe('ghost recording and playback', () => {
  const record = (): GhostRun => {
    const rec = new GhostRecorder(3)
    for (let tick = 0; tick <= 12; tick++) rec.sample(tick, { x: tick * 10, y: 0, heading: 0 })
    return rec.toRun('s', 12)
  }

  it('samples every interval ticks starting at tick 0', () => {
    const run = record()
    expect(run.frames.length / 3).toBe(5)
    expect(run.frames.slice(0, 3)).toEqual([0, 0, 0])
    expect(run.frames.slice(12, 15)).toEqual([120, 0, 0])
  })

  it('interpolates between samples and holds the last one', () => {
    const run = record()
    expect(ghostPose(run, 0)?.x).toBe(0)
    expect(ghostPose(run, 3)?.x).toBe(30)
    expect(ghostPose(run, 4.5)?.x).toBeCloseTo(45)
    expect(ghostPose(run, 999)?.x).toBe(120)
    expect(ghostPose({ ...run, frames: [] }, 1)).toBeNull()
  })

  it('takes the short way round when interpolating heading', () => {
    const run: GhostRun = { seed: 's', finishTicks: 2, interval: 1, frames: [0, 0, 3, 0, 0, -3] }
    const h = ghostPose(run, 0.5)!.heading
    expect(Math.abs(Math.abs(h) - Math.PI)).toBeLessThan(0.3)
  })
})

describe('best run storage', () => {
  it('keeps the fastest run per seed', () => {
    const store = fakeStore()
    const slow: GhostRun = { seed: 'd', finishTicks: 3000, interval: 3, frames: [0, 0, 0] }
    const fast: GhostRun = { ...slow, finishTicks: 2500 }
    expect(loadBest('d', store)).toBeNull()
    expect(saveIfBest(slow, store)).toBe(slow)
    expect(saveIfBest(fast, store)).toBe(fast)
    expect(saveIfBest(slow, store).finishTicks).toBe(2500)
    expect(loadBest('d', store)?.finishTicks).toBe(2500)
    expect(loadBest('other', store)).toBeNull()
  })

  it('ignores corrupt data', () => {
    const store = fakeStore()
    store.setItem('dgr.best.d', '{not json')
    expect(loadBest('d', store)).toBeNull()
  })
})
