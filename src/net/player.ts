/** Anonymous identity: a random id plus a nickname, both kept in localStorage. */
import { STORAGE } from '../config.ts'
import { readJson, writeJson, type KeyValueStore } from '../core/storage.ts'

export interface Player {
  id: string
  nickname: string
}

export const NICKNAME_MAX = 16

const KEY = `${STORAGE.PREFIX}.player`

/** Trims, strips control characters and caps the length. Empty → null. */
export function cleanNickname(raw: string): string | null {
  const name = raw.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, NICKNAME_MAX)
  return name.length > 0 ? name : null
}

export function loadPlayer(store: KeyValueStore = localStorage): Player {
  const saved = readJson<Player>(store, KEY)
  if (saved && typeof saved.id === 'string' && typeof saved.nickname === 'string') return saved
  const id = randomId()
  const player = { id, nickname: `anon-${id.slice(0, 4)}` }
  writeJson(store, KEY, player)
  return player
}

export function savePlayer(player: Player, store: KeyValueStore = localStorage): void {
  writeJson(store, KEY, player)
}

function randomId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
