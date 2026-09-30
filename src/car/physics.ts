/**
 * Arcade drift physics. The car always accelerates along its heading;
 * the only input is steer ∈ {-1, 0, 1}. Velocity follows the heading with a
 * lag (grip), which is what makes the car slide through corners.
 */
import { CAR } from '../config'
import { speedOf, wrapAngle, type CarState } from './state'

export function stepCar(car: CarState, steer: number, onTrack: boolean, dt: number): void {
  // Steering authority grows with speed so the car can't spin on the spot.
  const authority = Math.min(1, speedOf(car) / CAR.STEER_FULL_SPEED)
  if (steer !== 0) {
    car.heading = wrapAngle(car.heading + steer * CAR.STEER_RATE * authority * dt)
    const keep = 1 - CAR.STEER_COST * authority * dt
    car.vx *= keep
    car.vy *= keep
  }

  const fx = Math.cos(car.heading)
  const fy = Math.sin(car.heading)
  car.vx += fx * CAR.ACCEL * dt
  car.vy += fy * CAR.ACCEL * dt

  // Grip: pull the velocity towards the heading. The remaining gap is the drift.
  const speed = speedOf(car)
  const grip = Math.min(1, (onTrack ? CAR.GRIP : CAR.OFF_TRACK_GRIP) * dt)
  car.vx += (fx * speed - car.vx) * grip
  car.vy += (fy * speed - car.vy) * grip

  if (!onTrack) {
    const drag = 1 - CAR.OFF_TRACK_DRAG * dt
    car.vx *= drag
    car.vy *= drag
  }

  const finalSpeed = speedOf(car)
  if (finalSpeed > CAR.MAX_SPEED) {
    const k = CAR.MAX_SPEED / finalSpeed
    car.vx *= k
    car.vy *= k
  }

  car.x += car.vx * dt
  car.y += car.vy * dt
  car.onTrack = onTrack
}
