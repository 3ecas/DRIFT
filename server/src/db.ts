/** SQLite storage: one best run per (seed, player). */
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import type { LeaderboardEntry, OnlineGhost, SubmitRequest } from '../../src/net/types.ts'

interface Row {
  player_id: string
  nickname: string
  finish_ticks: number
  interval: number
  frames: string
}

export class RunStore {
  private readonly db: DatabaseSync

  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
    this.db = new DatabaseSync(path)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS runs (
        seed TEXT NOT NULL,
        player_id TEXT NOT NULL,
        nickname TEXT NOT NULL,
        finish_ticks REAL NOT NULL,
        interval INTEGER NOT NULL,
        frames TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (seed, player_id)
      );
      CREATE INDEX IF NOT EXISTS runs_seed_time ON runs (seed, finish_ticks);`)
  }

  /** Stores the run if it beats the player's previous best. Returns whether it did. */
  submit(run: SubmitRequest, nickname: string, now = Date.now()): boolean {
    const existing = this.db
      .prepare('SELECT finish_ticks FROM runs WHERE seed = ? AND player_id = ?')
      .get(run.seed, run.playerId) as { finish_ticks: number } | undefined
    if (existing && existing.finish_ticks <= run.finishTicks) {
      this.db.prepare('UPDATE runs SET nickname = ? WHERE seed = ? AND player_id = ?').run(nickname, run.seed, run.playerId)
      return false
    }
    this.db
      .prepare(
        `INSERT INTO runs (seed, player_id, nickname, finish_ticks, interval, frames, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (seed, player_id) DO UPDATE SET
           nickname = excluded.nickname, finish_ticks = excluded.finish_ticks,
           interval = excluded.interval, frames = excluded.frames, updated_at = excluded.updated_at`,
      )
      .run(run.seed, run.playerId, nickname, run.finishTicks, run.interval, JSON.stringify(run.frames), now)
    return true
  }

  top(seed: string, limit: number): LeaderboardEntry[] {
    const rows = this.db
      .prepare('SELECT player_id, nickname, finish_ticks FROM runs WHERE seed = ? ORDER BY finish_ticks, updated_at LIMIT ?')
      .all(seed, limit) as unknown as Row[]
    return rows.map((r, i) => toEntry(r, i + 1))
  }

  count(seed: string): number {
    const row = this.db.prepare('SELECT COUNT(*) AS n FROM runs WHERE seed = ?').get(seed) as { n: number }
    return row.n
  }

  entryFor(seed: string, playerId: string): LeaderboardEntry | null {
    const row = this.db
      .prepare('SELECT player_id, nickname, finish_ticks FROM runs WHERE seed = ? AND player_id = ?')
      .get(seed, playerId) as Row | undefined
    if (!row) return null
    const faster = this.db
      .prepare('SELECT COUNT(*) AS n FROM runs WHERE seed = ? AND finish_ticks < ?')
      .get(seed, row.finish_ticks) as { n: number }
    return toEntry(row, faster.n + 1)
  }

  /** The `count` runs ranked just above the player, slowest first. Unranked players get the slowest runs. */
  ghostsAbove(seed: string, playerId: string, count: number): OnlineGhost[] {
    const me = this.entryFor(seed, playerId)
    const rows = (
      me
        ? this.db
            .prepare('SELECT * FROM runs WHERE seed = ? AND finish_ticks < ? ORDER BY finish_ticks DESC LIMIT ?')
            .all(seed, me.finishTicks, count)
        : this.db.prepare('SELECT * FROM runs WHERE seed = ? ORDER BY finish_ticks DESC LIMIT ?').all(seed, count)
    ) as unknown as Row[]
    const baseRank = (me ? me.rank : this.count(seed) + 1) - 1
    return rows.map((r, i) => ({
      seed,
      nickname: r.nickname,
      rank: baseRank - i,
      finishTicks: r.finish_ticks,
      interval: r.interval,
      frames: JSON.parse(r.frames) as number[],
    }))
  }

  close(): void {
    this.db.close()
  }
}

const toEntry = (r: Row, rank: number): LeaderboardEntry => ({
  rank,
  playerId: r.player_id,
  nickname: r.nickname,
  finishTicks: r.finish_ticks,
})
