import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { RunStore } from '../src/db.ts'
import { handle } from '../src/routes.ts'
import { fakeRun, today } from './helpers.ts'

test('submit, leaderboard and ghosts over HTTP', async () => {
  const store = new RunStore(':memory:')
  const server = createServer((req, res) => void handle(store, req, res))
  await new Promise<void>((r) => server.listen(0, r))
  const port = (server.address() as { port: number }).port
  const base = `http://127.0.0.1:${port}`
  const seed = today()

  const post = await fetch(`${base}/api/runs`, { method: 'POST', body: JSON.stringify(fakeRun({ finishTicks: 1950 })) })
  assert.equal(post.status, 200)
  const submitted = (await post.json()) as { improved: boolean; leaderboard: { me: { rank: number } | null; total: number } }
  assert.equal(submitted.improved, true)
  assert.equal(submitted.leaderboard.me?.rank, 1)
  assert.equal(submitted.leaderboard.total, 1)

  const bad = await fetch(`${base}/api/runs`, { method: 'POST', body: JSON.stringify(fakeRun({ finishTicks: 10 })) })
  assert.equal(bad.status, 400)
  assert.deepEqual(await bad.json(), { error: 'run too fast to be real' })
  assert.equal((await fetch(`${base}/api/runs`, { method: 'POST', body: '{oops' })).status, 400)

  const lb = await fetch(`${base}/api/leaderboard?seed=${seed}&player=player-0001`)
  assert.equal(lb.headers.get('access-control-allow-origin'), '*')
  const board = (await lb.json()) as { entries: { nickname: string }[] }
  assert.equal(board.entries[0].nickname, 'tester')

  const ghosts = (await (await fetch(`${base}/api/ghosts?seed=${seed}&player=player-9999&count=2`)).json()) as { ghosts: unknown[] }
  assert.equal(ghosts.ghosts.length, 1)
  assert.equal((await fetch(`${base}/api/leaderboard?seed=bad&player=player-0001`)).status, 400)
  assert.equal((await fetch(`${base}/nope`)).status, 404)
  assert.equal((await fetch(`${base}/api/runs`, { method: 'OPTIONS' })).status, 204)

  server.close()
  store.close()
})
