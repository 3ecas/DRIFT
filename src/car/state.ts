/** Car state and pose helpers. No physics here. */

export interface Pose {
  x: number
  y: number
  heading: number
}

export interface CarState extends Pose {
  vx: number
  vy: number
  onTrack: boolean
}

export function createCar(x: number, y: number, heading: number): CarState {
  return { x, y, heading, vx: 0, vy: 0, onTrack: true }
}

export function copyCar(from: CarState, to: CarState): void {
  to.x = from.x
  to.y = from.y
  to.heading = from.heading
  to.vx = from.vx
  to.vy = from.vy
  to.onTrack = from.onTrack
}

export function speedOf(car: CarState): number {
  return Math.sqrt(car.vx * car.vx + car.vy * car.vy)
}

/** Wraps an angle into [-π, π). */
export function wrapAngle(a: number): number {
  const twoPi = Math.PI * 2
  return a - twoPi * Math.floor((a + Math.PI) / twoPi)
}

/** Linear interpolation between two poses, taking the short way round for heading. */
export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const dh = wrapAngle(b.heading - a.heading)
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    heading: a.heading + dh * t,
  }
}
