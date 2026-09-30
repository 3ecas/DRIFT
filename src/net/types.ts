/** API contract shared by the game client and the server in /server. */
import type { GhostRun } from '../ghost/types.ts'

export interface SubmitRequest extends GhostRun {
  playerId: string
  nickname: string
}

export interface LeaderboardEntry {
  rank: number
  playerId: string
  nickname: string
  finishTicks: number
}

export interface LeaderboardResponse {
  seed: string
  total: number
  entries: LeaderboardEntry[]
  /** The requesting player's own entry, or null if they have no run today. */
  me: LeaderboardEntry | null
}

export interface OnlineGhost extends GhostRun {
  nickname: string
  rank: number
}

export interface GhostsResponse {
  seed: string
  ghosts: OnlineGhost[]
}

export interface SubmitResponse {
  /** Whether this run replaced the player's stored best. */
  improved: boolean
  leaderboard: LeaderboardResponse
}
