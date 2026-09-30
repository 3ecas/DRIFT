/** Glue between the leaderboard API, the player's identity and the leaderboard UI. */
import { SIM } from './config.ts'
import { fetchGhosts, isOnline, submitRun } from './net/api.ts'
import { cleanNickname, loadPlayer, savePlayer, type Player } from './net/player.ts'
import type { GhostRun } from './ghost/types.ts'
import { Leaderboard } from './ui/leaderboard.ts'

export class Online {
  /** Online ghosts currently being raced. */
  ghosts: GhostRun[] = []
  private readonly player: Player
  private readonly board: Leaderboard

  constructor(
    private readonly seed: string,
    panel: HTMLElement,
    private readonly onGhosts: (ghosts: GhostRun[]) => void,
  ) {
    this.player = loadPlayer()
    this.board = new Leaderboard(panel, SIM.TICK_RATE, () => this.rename())
    this.board.setNickname(this.player.nickname)
    this.board.setStatus(isOnline() ? 'leaderboard loads after your run' : 'offline · no leaderboard configured')
  }

  /** Fetches the ghosts ranked just above the player and hands them to the session. */
  async loadGhosts(): Promise<void> {
    const res = await fetchGhosts(this.seed, this.player.id)
    if (!res) return
    this.ghosts = res.ghosts
    this.onGhosts(this.ghosts)
  }

  async submit(run: GhostRun): Promise<void> {
    if (!isOnline()) return
    this.board.setStatus('submitting…')
    const res = await submitRun({ ...run, playerId: this.player.id, nickname: this.player.nickname })
    if (!res) {
      this.board.setStatus('leaderboard unavailable')
      return
    }
    this.board.show(res.leaderboard, this.player.id)
    if (res.improved) await this.loadGhosts()
  }

  private rename(): void {
    const raw = window.prompt('Nickname (shown on the leaderboard)', this.player.nickname)
    const name = raw === null ? null : cleanNickname(raw)
    if (!name) return
    this.player.nickname = name
    savePlayer(this.player)
    this.board.setNickname(name)
  }
}
