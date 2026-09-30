/** Today's leaderboard inside the results panel, plus the nickname control. */
import { formatTime } from './format.ts'
import type { LeaderboardResponse } from '../net/types.ts'

const ticksToMs = (ticks: number, tickRate: number): number => (ticks * 1000) / tickRate

export class Leaderboard {
  private readonly root: HTMLElement
  private readonly status: HTMLElement
  private readonly list: HTMLElement
  private readonly name: HTMLButtonElement

  constructor(parent: HTMLElement, private readonly tickRate: number, onRename: () => void) {
    this.root = document.createElement('div')
    this.root.className = 'board'
    this.root.innerHTML = `
      <div class="board-head">
        <span class="board-status"></span>
        <button class="board-name" type="button" title="Change nickname"></button>
      </div>
      <ol class="board-list"></ol>`
    this.status = this.root.querySelector('.board-status')!
    this.list = this.root.querySelector('.board-list')!
    this.name = this.root.querySelector('.board-name')!
    this.name.addEventListener('click', onRename)
    parent.appendChild(this.root)
  }

  setNickname(nickname: string): void {
    this.name.textContent = `${nickname} ✎`
  }

  setStatus(text: string): void {
    this.status.textContent = text
    this.list.replaceChildren()
  }

  show(board: LeaderboardResponse, playerId: string): void {
    const me = board.me
    this.status.textContent = me ? `#${me.rank} of ${board.total} today` : `${board.total} racers today`
    const rows = board.entries.slice()
    if (me && !rows.some((e) => e.playerId === playerId)) rows.push(me)
    this.list.replaceChildren(
      ...rows.map((e) => {
        const li = document.createElement('li')
        li.classList.toggle('me', e.playerId === playerId)
        li.innerHTML = `<span>${e.rank}</span><span class="board-nick"></span><span>${formatTime(ticksToMs(e.finishTicks, this.tickRate))}</span>`
        li.querySelector('.board-nick')!.textContent = e.nickname
        return li
      }),
    )
  }
}
