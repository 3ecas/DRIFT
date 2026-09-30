/** The daily seed is the current UTC date, so everyone gets the same track. */

const DAY_MS = 24 * 60 * 60 * 1000

export function utcDateSeed(now: number = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10)
}

/** The UTC date one day before a YYYY-MM-DD date. */
export function previousUtcDate(date: string): string {
  return utcDateSeed(Date.parse(`${date}T00:00:00Z`) - DAY_MS)
}

/** Milliseconds until the next track (next UTC midnight). */
export function msUntilNextUtcDay(now: number = Date.now()): number {
  return DAY_MS - (((now % DAY_MS) + DAY_MS) % DAY_MS)
}
