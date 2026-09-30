/**
 * Tiny fetch client for the leaderboard server. Every call resolves to null
 * on any failure, so the game keeps working offline.
 */
import { NET } from '../config.ts'
import type { GhostsResponse, LeaderboardResponse, SubmitRequest, SubmitResponse } from './types.ts'

/** Base URL of the API, '' for same-origin (Vite dev proxy), or null when not configured. */
const configured = import.meta.env.VITE_API_URL as string | undefined
export const API_URL: string | null = configured ? configured.replace(/\/$/, '') : import.meta.env.DEV ? '' : null

export const isOnline = (): boolean => API_URL !== null

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (API_URL === null) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), NET.TIMEOUT_MS)
  try {
    const res = await fetch(API_URL + path, { ...init, signal: controller.signal })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export function submitRun(body: SubmitRequest): Promise<SubmitResponse | null> {
  return request('/api/runs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function fetchLeaderboard(seed: string, playerId: string): Promise<LeaderboardResponse | null> {
  return request(`/api/leaderboard?seed=${encodeURIComponent(seed)}&player=${encodeURIComponent(playerId)}`)
}

/** Ghosts ranked just above the player (or the slowest ones for a newcomer). */
export function fetchGhosts(seed: string, playerId: string): Promise<GhostsResponse | null> {
  const q = `seed=${encodeURIComponent(seed)}&player=${encodeURIComponent(playerId)}&count=${NET.GHOSTS_ABOVE}`
  return request(`/api/ghosts?${q}`)
}
