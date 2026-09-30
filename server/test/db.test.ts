import { test } from 'node:test'
import assert from 'node:assert/strict'
import { RunStore } from '../src/db.ts'
import { fakeRun, today } from './helpers.ts'

const seed = today()

test('keeps the best run per player and ranks players', () => {
  const store = new RunStore(':memory:')
  assert.equal(store.submit(fakeRun({ playerId: 'player-aaaa', finishTicks: 2000 }), 'A'), true)
  assert.equal(store.submit(fakeRun({ playerId: 'player-aaaa', finishTicks: 2100 }), 'A2'), false)
  assert.equal(store.submit(fakeRun({ playerId: 'player-bbbb', finishTicks: 1900 }), 'B'), true)
  assert.equal(store.submit(fakeRun({ playerId: 'player-cccc', finishTicks: 2200 }), 'C'), true)

  const top = store.top(seed, 10)
  assert.deepEqual(top.map((e) => [e.rank, e.nickname, e.finishTicks]), [[1, 'B', 1900], [2, 'A2', 2000], [3, 'C', 2200]])
  assert.equal(store.count(seed), 3)
  assert.deepEqual(store.entryFor(seed, 'player-cccc'), { rank: 3, playerId: 'player-cccc', nickname: 'C', finishTicks: 2200 })
  assert.equal(store.entryFor(seed, 'player-zzzz'), null)
  assert.equal(store.count('2020-01-01'), 0)
  store.close()
})

test('serves the ghosts ranked just above the player', () => {
  const store = new RunStore(':memory:')
  for (const [id, t] of [['player-aaaa', 1800], ['player-bbbb', 1900], ['player-cccc', 2000], ['player-dddd', 2100]] as const) {
    store.submit(fakeRun({ playerId: id, finishTicks: t }), id)
  }
  const above = store.ghostsAbove(seed, 'player-dddd', 2)
  assert.deepEqual(above.map((g) => [g.rank, g.nickname]), [[3, 'player-cccc'], [2, 'player-bbbb']])
  assert.equal(above[0].frames.length % 3, 0)
  assert.deepEqual(store.ghostsAbove(seed, 'player-aaaa', 2), [])
  const newcomer = store.ghostsAbove(seed, 'player-new1', 2)
  assert.deepEqual(newcomer.map((g) => [g.rank, g.nickname]), [[4, 'player-dddd'], [3, 'player-cccc']])
  store.close()
})
