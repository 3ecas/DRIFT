import { GHOST } from '../../src/config.ts'
import { generateTrack } from '../../src/track/generate.ts'
import type { SubmitRequest } from '../../src/net/types.ts'

export const today = (): string => new Date().toISOString().slice(0, 10)

/** A plausible submission: frames that sit on the start line for the whole run. */
export function fakeRun(overrides: Partial<SubmitRequest> = {}): SubmitRequest {
  const seed = overrides.seed ?? today()
  const track = generateTrack(seed)
  const finishTicks = overrides.finishTicks ?? 1800
  const count = Math.floor(finishTicks / GHOST.SAMPLE_INTERVAL) + 1
  const frames: number[] = []
  for (let i = 0; i < count; i++) frames.push(track.start.pos.x, track.start.pos.y, track.start.heading)
  return {
    seed,
    playerId: 'player-0001',
    nickname: 'tester',
    finishTicks,
    interval: GHOST.SAMPLE_INTERVAL,
    frames,
    ...overrides,
  }
}
