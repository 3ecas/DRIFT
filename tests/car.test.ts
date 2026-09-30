import { describe, expect, it } from 'vitest'
import { CAR, DT } from '../src/config'
import { stepCar } from '../src/car/physics'
import { createCar, speedOf } from '../src/car/state'
import { createRun, runTimeMs, stepRun } from '../src/race/run'
import { generateTrack } from '../src/track/generate'

describe('car physics', () => {
  it('is deterministic for the same inputs', () => {
    const a = createCar(0, 0, 0)
    const b = createCar(0, 0, 0)
    for (let i = 0; i < 600; i++) {
      const steer = i % 90 < 30 ? 1 : i % 90 < 60 ? -1 : 0
      stepCar(a, steer, i % 200 > 150, DT)
      stepCar(b, steer, i % 200 > 150, DT)
    }
    expect(a).toEqual(b)
  })

  it('accelerates on its own up to the speed cap', () => {
    const car = createCar(0, 0, 0)
    stepCar(car, 0, true, DT)
    expect(speedOf(car)).toBeGreaterThan(0)
    for (let i = 0; i < 600; i++) stepCar(car, 0, true, DT)
    expect(speedOf(car)).toBeCloseTo(CAR.MAX_SPEED, 6)
    expect(car.x).toBeGreaterThan(0)
    expect(Math.abs(car.y)).toBeLessThan(1e-9)
  })

  it('turns right for positive steer and left for negative', () => {
    const right = createCar(0, 0, 0)
    const left = createCar(0, 0, 0)
    for (let i = 0; i < 60; i++) {
      stepCar(right, 1, true, DT)
      stepCar(left, -1, true, DT)
    }
    expect(right.heading).toBeGreaterThan(0)
    expect(left.heading).toBeLessThan(0)
  })

  it('is much slower off the track', () => {
    const on = createCar(0, 0, 0)
    const off = createCar(0, 0, 0)
    for (let i = 0; i < 300; i++) {
      stepCar(on, 0, true, DT)
      stepCar(off, 0, false, DT)
    }
    expect(speedOf(off)).toBeLessThan(speedOf(on) * 0.5)
  })
})

describe('run', () => {
  it('waits for the first steer input, then counts ticks', () => {
    const run = createRun(generateTrack('test'))
    for (let i = 0; i < 10; i++) stepRun(run, 0)
    expect(run.phase).toBe('ready')
    expect(runTimeMs(run)).toBe(0)
    stepRun(run, 1)
    expect(run.phase).toBe('racing')
    for (let i = 0; i < 59; i++) stepRun(run, 0)
    expect(run.ticks).toBe(60)
    expect(runTimeMs(run)).toBe(1000)
  })
})
