/** Daily streak: consecutive UTC days with at least one finished run. */
import { STORAGE } from '../config'
import { previousUtcDate } from './daily'
import { readJson, writeJson, type KeyValueStore } from './storage'

export interface Streak {
  /** Last UTC date (YYYY-MM-DD) a run was finished on. */
  lastDay: string
  /** Consecutive days up to and including lastDay. */
  count: number
}

/** The streak after finishing a run today. Same day: unchanged; yesterday: +1; otherwise restarts at 1. */
export function advanceStreak(streak: Streak | null, today: string): Streak {
  if (!streak || streak.count < 1) return { lastDay: today, count: 1 }
  if (streak.lastDay === today) return streak
  if (streak.lastDay === previousUtcDate(today)) return { lastDay: today, count: streak.count + 1 }
  return { lastDay: today, count: 1 }
}

/** The streak as it stands today: still alive if the last run was today or yesterday. */
export function currentStreak(streak: Streak | null, today: string): number {
  if (!streak) return 0
  return streak.lastDay === today || streak.lastDay === previousUtcDate(today) ? streak.count : 0
}

const KEY = `${STORAGE.PREFIX}.streak`

export function loadStreak(store: KeyValueStore = localStorage): Streak | null {
  const s = readJson<Streak>(store, KEY)
  return s && typeof s.lastDay === 'string' && typeof s.count === 'number' ? s : null
}

export function saveStreak(streak: Streak, store: KeyValueStore = localStorage): void {
  writeJson(store, KEY, streak)
}
