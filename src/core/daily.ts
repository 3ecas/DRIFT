/** The daily seed is the current UTC date, so everyone gets the same track. */

export function utcDateSeed(now: number = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10)
}
