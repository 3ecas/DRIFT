/** Interpolated ghost pose at any (fractional) tick. Ghosts have no collision. */
import { lerpPose, type Pose } from '../car/state'
import type { GhostRun } from './types'

export function ghostPose(ghost: GhostRun, tick: number): Pose | null {
  const count = ghost.frames.length / 3
  if (count === 0) return null
  const position = Math.max(0, tick / ghost.interval)
  const i0 = Math.min(Math.floor(position), count - 1)
  const i1 = Math.min(i0 + 1, count - 1)
  const t = i1 === i0 ? 0 : position - i0
  return lerpPose(frameAt(ghost, i0), frameAt(ghost, i1), t)
}

function frameAt(ghost: GhostRun, i: number): Pose {
  const f = ghost.frames
  return { x: f[i * 3], y: f[i * 3 + 1], heading: f[i * 3 + 2] }
}
