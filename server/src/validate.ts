/** Sanity checks on submitted runs. Not anti-cheat, just enough to reject junk. */
import { CAR, GHOST, SIM, TRACK } from '../../src/config.ts'
import { generateTrack } from '../../src/track/generate.ts'
import type { Track } from '../../src/track/types.ts'
import type { SubmitRequest } from '../../src/net/types.ts'
import { SERVER } from './config.ts'

const tracks = new Map<string, Track>()

export function trackFor(seed: string): Track {
  let track = tracks.get(seed)
  if (!track) {
    track = generateTrack(seed)
    tracks.set(seed, track)
  }
  return track
}

export const isSeed = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
export const isPlayerId = (s: unknown): s is string => typeof s === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(s)

/** Today's and yesterday's UTC dates. */
export function acceptedSeeds(now = Date.now()): string[] {
  const day = 24 * 60 * 60 * 1000
  return Array.from({ length: SERVER.SEED_WINDOW_DAYS + 1 }, (_, i) =>
    new Date(now - i * day).toISOString().slice(0, 10),
  )
}

export function cleanNickname(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const name = raw.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, SERVER.NICKNAME_MAX)
  return name.length > 0 ? name : null
}

/** Returns null when the submission is acceptable, otherwise the reason. */
export function validateSubmission(body: unknown, now = Date.now()): string | null {
  if (!body || typeof body !== 'object') return 'body must be an object'
  const r = body as Partial<SubmitRequest>
  if (!isSeed(r.seed)) return 'bad seed'
  if (!acceptedSeeds(now).includes(r.seed)) return 'seed is not today'
  if (!isPlayerId(r.playerId)) return 'bad playerId'
  if (cleanNickname(r.nickname) === null) return 'bad nickname'
  if (r.interval !== GHOST.SAMPLE_INTERVAL) return 'bad interval'
  if (typeof r.finishTicks !== 'number' || !Number.isFinite(r.finishTicks)) return 'bad finishTicks'
  if (r.finishTicks > SERVER.MAX_TICKS) return 'run too long'

  const track = trackFor(r.seed)
  const lapLength = track.points.length * TRACK.SAMPLE_SPACING
  const minTicks = ((lapLength * SIM.LAPS) / CAR.MAX_SPEED) * SIM.TICK_RATE * SERVER.MIN_TIME_FACTOR
  if (r.finishTicks < minTicks) return 'run too fast to be real'

  const frames = r.frames
  if (!Array.isArray(frames) || frames.length % 3 !== 0) return 'bad frames'
  const expected = Math.floor(r.finishTicks / r.interval) + 1
  if (Math.abs(frames.length / 3 - expected) > 2) return 'frame count does not match time'
  const { arena } = track
  for (let i = 0; i < frames.length; i += 3) {
    const x = frames[i]
    const y = frames[i + 1]
    const h = frames[i + 2]
    if (![x, y, h].every((v) => typeof v === 'number' && Number.isFinite(v))) return 'bad frame value'
    if (x < arena.minX || x > arena.maxX || y < arena.minY || y > arena.maxY) return 'frame outside arena'
  }
  const dx = frames[0] - track.start.pos.x
  const dy = frames[1] - track.start.pos.y
  if (dx * dx + dy * dy > TRACK.WIDTH * TRACK.WIDTH) return 'run does not start at the start line'
  return null
}
