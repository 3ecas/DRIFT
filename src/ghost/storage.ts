/** Persists the best run per daily seed in localStorage. */
import { STORAGE } from '../config'
import type { GhostRun } from './types'

/** The subset of the Storage API we use, so tests can pass a fake. */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const bestKey = (seed: string): string => `${STORAGE.PREFIX}.best.${seed}`

export function loadBest(seed: string, store: KeyValueStore = localStorage): GhostRun | null {
  try {
    const raw = store.getItem(bestKey(seed))
    if (!raw) return null
    const run = JSON.parse(raw) as GhostRun
    return Array.isArray(run.frames) && run.seed === seed ? run : null
  } catch {
    return null
  }
}

/** Stores `run` if it beats the saved best. Returns the best after the call. */
export function saveIfBest(run: GhostRun, store: KeyValueStore = localStorage): GhostRun {
  const previous = loadBest(run.seed, store)
  if (previous && previous.finishTicks <= run.finishTicks) return previous
  try {
    store.setItem(bestKey(run.seed), JSON.stringify(run))
  } catch {
    // Storage full or unavailable: the run still counts for this session.
  }
  return run
}
