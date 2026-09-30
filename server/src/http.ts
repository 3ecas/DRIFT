/** Small helpers over node:http: JSON responses, CORS, body parsing. */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { SERVER } from './config.ts'

export const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
} as const

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json', ...CORS_HEADERS })
  res.end(JSON.stringify(body))
}

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Reads and parses a JSON body, rejecting oversized or malformed ones. */
export function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > SERVER.MAX_BODY_BYTES) {
        reject(new HttpError(413, 'body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new HttpError(400, 'invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}
