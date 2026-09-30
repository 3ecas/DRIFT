/** Minimal JSON persistence over a localStorage-like store. Never throws. */

/** The subset of the Storage API we use, so tests can pass a fake. */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function readJson<T>(store: KeyValueStore, key: string): T | null {
  try {
    const raw = store.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJson(store: KeyValueStore, key: string, value: unknown): void {
  try {
    store.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full, disabled or private mode: carry on without persistence.
  }
}
