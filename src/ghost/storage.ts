/** Persists the best run per daily seed in localStorage. */
import { STORAGE } from '../config.ts'
import { readJson, writeJson, type KeyValueStore } from '../core/storage.ts'
import type { GhostRun } from './types.ts'

const bestKey = (seed: string): string => `${STORAGE.PREFIX}.best.${seed}`

export function loadBest(seed: string, store: KeyValueStore = localStorage): GhostRun | null {
  const run = readJson<GhostRun>(store, bestKey(seed))
  return run && Array.isArray(run.frames) && run.seed === seed ? run : null
}

/** Stores `run` if it beats the saved best. Returns the best after the call. */
export function saveIfBest(run: GhostRun, store: KeyValueStore = localStorage): GhostRun {
  const previous = loadBest(run.seed, store)
  if (previous && previous.finishTicks <= run.finishTicks) return previous
  writeJson(store, bestKey(run.seed), run)
  return run
}
