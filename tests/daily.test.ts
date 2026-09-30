import { describe, expect, it } from 'vitest'
import { msUntilNextUtcDay, previousUtcDate, utcDateSeed } from '../src/core/daily.ts'
import { advanceStreak, currentStreak, loadStreak, saveStreak } from '../src/core/streak.ts'
import { formatCountdown } from '../src/ui/format.ts'
import { shareText } from '../src/ui/share.ts'
import type { KeyValueStore } from '../src/core/storage.ts'

describe('daily dates', () => {
  it('is the UTC date', () => {
    expect(utcDateSeed(Date.UTC(2026, 8, 30, 23, 59))).toBe('2026-09-30')
    expect(utcDateSeed(Date.UTC(2026, 9, 1, 0, 0))).toBe('2026-10-01')
  })

  it('steps back a day across month and year boundaries', () => {
    expect(previousUtcDate('2026-10-01')).toBe('2026-09-30')
    expect(previousUtcDate('2027-01-01')).toBe('2026-12-31')
    expect(previousUtcDate('2028-03-01')).toBe('2028-02-29')
  })

  it('counts down to the next UTC midnight', () => {
    expect(msUntilNextUtcDay(Date.UTC(2026, 8, 30, 23, 59, 30))).toBe(30_000)
    expect(msUntilNextUtcDay(Date.UTC(2026, 8, 30, 0, 0, 0))).toBe(86_400_000)
    expect(formatCountdown(3_723_000)).toBe('1:02:03')
    expect(formatCountdown(30_000)).toBe('0:00:30')
  })
})

describe('streak', () => {
  it('grows on consecutive days, holds within a day, and resets after a gap', () => {
    const d1 = advanceStreak(null, '2026-09-28')
    expect(d1).toEqual({ lastDay: '2026-09-28', count: 1 })
    expect(advanceStreak(d1, '2026-09-28')).toBe(d1)
    const d2 = advanceStreak(d1, '2026-09-29')
    expect(d2.count).toBe(2)
    expect(advanceStreak(d2, '2026-10-02')).toEqual({ lastDay: '2026-10-02', count: 1 })
  })

  it('reports the live streak before today’s first run', () => {
    const s = { lastDay: '2026-09-29', count: 4 }
    expect(currentStreak(s, '2026-09-29')).toBe(4)
    expect(currentStreak(s, '2026-09-30')).toBe(4)
    expect(currentStreak(s, '2026-10-01')).toBe(0)
    expect(currentStreak(null, '2026-10-01')).toBe(0)
  })

  it('round-trips through storage and ignores junk', () => {
    const map = new Map<string, string>()
    const store: KeyValueStore = { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) }
    expect(loadStreak(store)).toBeNull()
    saveStreak({ lastDay: '2026-09-30', count: 3 }, store)
    expect(loadStreak(store)).toEqual({ lastDay: '2026-09-30', count: 3 })
    store.setItem('dgr.streak', '"nope"')
    expect(loadStreak(store)).toBeNull()
  })
})

describe('share text', () => {
  it('mentions the best and the streak only when they add something', () => {
    const base = { seed: '2026-09-30', timeMs: 23294, bestMs: 23160, streak: 3, url: 'https://x.test/' }
    expect(shareText(base)).toBe('Daily Ghost Race 2026-09-30\n⏱ 23.294 (best 23.160)\n🔥 3-day streak\nhttps://x.test/')
    expect(shareText({ ...base, bestMs: 23294, streak: 1 })).toBe('Daily Ghost Race 2026-09-30\n⏱ 23.294\nhttps://x.test/')
  })
})
