/** API handlers. Routing by method + path; query parameters via URL. */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { LeaderboardResponse, SubmitRequest } from '../../src/net/types.ts'
import { SERVER } from './config.ts'
import type { RunStore } from './db.ts'
import { HttpError, readJsonBody, sendJson, CORS_HEADERS } from './http.ts'
import { cleanNickname, isPlayerId, isSeed, validateSubmission } from './validate.ts'

export async function handle(store: RunStore, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost')
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS)
      res.end()
    } else if (req.method === 'POST' && url.pathname === '/api/runs') {
      await postRun(store, req, res)
    } else if (req.method === 'GET' && url.pathname === '/api/leaderboard') {
      const { seed, playerId } = seedAndPlayer(url)
      sendJson(res, 200, leaderboard(store, seed, playerId))
    } else if (req.method === 'GET' && url.pathname === '/api/ghosts') {
      const { seed, playerId } = seedAndPlayer(url)
      const count = Math.min(SERVER.MAX_GHOSTS, Math.max(1, Number(url.searchParams.get('count') ?? 2) || 1))
      sendJson(res, 200, { seed, ghosts: store.ghostsAbove(seed, playerId, count) })
    } else if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { ok: true })
    } else {
      throw new HttpError(404, 'not found')
    }
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500
    if (status === 500) console.error(err)
    sendJson(res, status, { error: err instanceof Error ? err.message : 'error' })
  }
}

async function postRun(store: RunStore, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await readJsonBody(req)
  const reason = validateSubmission(body)
  if (reason) throw new HttpError(400, reason)
  const run = body as SubmitRequest
  const nickname = cleanNickname(run.nickname) as string
  const improved = store.submit(run, nickname)
  sendJson(res, 200, { improved, leaderboard: leaderboard(store, run.seed, run.playerId) })
}

function leaderboard(store: RunStore, seed: string, playerId: string): LeaderboardResponse {
  return {
    seed,
    total: store.count(seed),
    entries: store.top(seed, SERVER.LEADERBOARD_SIZE),
    me: store.entryFor(seed, playerId),
  }
}

function seedAndPlayer(url: URL): { seed: string; playerId: string } {
  const seed = url.searchParams.get('seed')
  const playerId = url.searchParams.get('player')
  if (!isSeed(seed)) throw new HttpError(400, 'bad seed')
  if (!isPlayerId(playerId)) throw new HttpError(400, 'bad player')
  return { seed, playerId }
}
