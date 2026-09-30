/** Server-side tunables. Game constants come from the shared ../../src/config.ts. */
export const SERVER = {
  PORT: Number(process.env.PORT ?? 8787),
  /** SQLite file; ':memory:' for tests. */
  DB_PATH: process.env.DB_PATH ?? 'data/runs.sqlite',
  /** Largest accepted request body (bytes). A 60 s ghost is ~20 KB. */
  MAX_BODY_BYTES: 256 * 1024,
  /** Runs are accepted for today's and yesterday's seed (midnight rollover). */
  SEED_WINDOW_DAYS: 1,
  /** Runs faster than lapLength × laps ÷ MAX_SPEED × this factor are rejected. */
  MIN_TIME_FACTOR: 0.8,
  /** Runs longer than this are rejected (ticks). */
  MAX_TICKS: 60 * 60 * 10,
  LEADERBOARD_SIZE: 10,
  MAX_GHOSTS: 5,
  NICKNAME_MAX: 16,
} as const
