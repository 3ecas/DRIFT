import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateSubmission, acceptedSeeds, cleanNickname } from '../src/validate.ts'
import { fakeRun } from './helpers.ts'

test('accepts a plausible run', () => {
  assert.equal(validateSubmission(fakeRun()), null)
})

test('accepts yesterday but not older seeds', () => {
  const [todaySeed, yesterday] = acceptedSeeds()
  assert.equal(validateSubmission(fakeRun({ seed: yesterday })), null)
  assert.equal(validateSubmission(fakeRun({ seed: todaySeed })), null)
  assert.equal(validateSubmission(fakeRun({ seed: '2020-01-01' })), 'seed is not today')
  assert.equal(validateSubmission(fakeRun({ seed: 'nope' })), 'bad seed')
})

test('rejects impossible times and wrong frame counts', () => {
  assert.equal(validateSubmission(fakeRun({ finishTicks: 100 })), 'run too fast to be real')
  assert.equal(validateSubmission({ ...fakeRun(), finishTicks: 1e9, frames: [] }), 'run too long')
  const run = fakeRun()
  assert.equal(validateSubmission({ ...run, frames: run.frames.slice(0, 30) }), 'frame count does not match time')
  assert.equal(validateSubmission({ ...run, interval: 5 }), 'bad interval')
})

test('rejects frames outside the arena or away from the start', () => {
  const run = fakeRun()
  const far = run.frames.slice()
  far[3] = 1e6
  assert.equal(validateSubmission({ ...run, frames: far }), 'frame outside arena')
  const shifted = run.frames.slice()
  shifted[0] += 500
  assert.equal(validateSubmission({ ...run, frames: shifted }), 'frame outside arena')
  const bad = run.frames.slice()
  bad[4] = Number.NaN
  assert.equal(validateSubmission({ ...run, frames: bad }), 'bad frame value')
})

test('rejects bad identities and cleans nicknames', () => {
  assert.equal(validateSubmission(fakeRun({ playerId: 'x' })), 'bad playerId')
  assert.equal(validateSubmission(fakeRun({ nickname: '   ' })), 'bad nickname')
  assert.equal(cleanNickname('  Speedy\u0000 McFast  '), 'Speedy McFast')
  assert.equal(cleanNickname('a'.repeat(40))?.length, 16)
  assert.equal(validateSubmission(null), 'body must be an object')
})
