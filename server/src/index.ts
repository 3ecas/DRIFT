/** Daily Ghost Race leaderboard server: node:http + node:sqlite, no dependencies. */
import { createServer } from 'node:http'
import { SERVER } from './config.ts'
import { RunStore } from './db.ts'
import { handle } from './routes.ts'

const store = new RunStore(SERVER.DB_PATH)
const server = createServer((req, res) => void handle(store, req, res))

server.listen(SERVER.PORT, () => {
  console.log(`leaderboard server listening on http://localhost:${SERVER.PORT} (db: ${SERVER.DB_PATH})`)
})

const shutdown = (): void => {
  server.close()
  store.close()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
