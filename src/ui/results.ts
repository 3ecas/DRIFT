/** End-of-run overlay: time, gap to the ghost, best today, streak, share, countdown. */
import { formatCountdown, formatTime } from './format.ts'

export interface ResultsView {
  timeMs: number
  bestMs: number
  /** Time of the ghost that was raced, or null when there was none. */
  ghostMs: number | null
  isNewBest: boolean
  streak: number
}

export class Results {
  /** The panel element; extra sections (leaderboard) are appended here. */
  readonly element: HTMLElement
  private readonly root: HTMLElement
  private readonly time: HTMLElement
  private readonly best: HTMLElement
  private readonly delta: HTMLElement
  private readonly streak: HTMLElement
  private readonly countdown: HTMLElement
  private readonly share: HTMLButtonElement
  private shareLabelTimer = 0

  constructor(parent: HTMLElement, onRestart: () => void, onShare: () => Promise<boolean>) {
    this.root = document.createElement('div')
    this.element = this.root
    this.root.className = 'results'
    this.root.hidden = true
    this.root.innerHTML = `
      <div class="results-title">FINISHED</div>
      <div class="results-time"></div>
      <div class="results-delta"></div>
      <div class="results-best"></div>
      <div class="results-streak"></div>
      <div class="results-buttons">
        <button class="results-again" type="button">race again</button>
        <button class="results-share" type="button">share</button>
      </div>
      <div class="results-countdown"></div>`
    const q = <T extends HTMLElement>(sel: string): T => this.root.querySelector(sel) as T
    this.time = q('.results-time')
    this.best = q('.results-best')
    this.delta = q('.results-delta')
    this.streak = q('.results-streak')
    this.countdown = q('.results-countdown')
    this.share = q('.results-share')
    q('.results-again').addEventListener('click', onRestart)
    this.share.addEventListener('click', async () => this.flashShare(await onShare()))
    parent.appendChild(this.root)
  }

  show(view: ResultsView): void {
    this.time.textContent = formatTime(view.timeMs)
    this.best.textContent = view.isNewBest ? 'new best today' : `best today ${formatTime(view.bestMs)}`
    this.delta.textContent = view.ghostMs === null ? 'first run today' : deltaText(view.timeMs - view.ghostMs)
    this.delta.classList.toggle('faster', view.ghostMs !== null && view.timeMs < view.ghostMs)
    this.streak.textContent = `🔥 ${view.streak}-day streak`
    this.root.hidden = false
  }

  /** Call every frame while visible with the time left until the next track. */
  tick(msUntilNextTrack: number): void {
    if (this.root.hidden) return
    const text = `next track in ${formatCountdown(msUntilNextTrack)}`
    if (this.countdown.textContent !== text) this.countdown.textContent = text
  }

  hide(): void {
    this.root.hidden = true
  }

  private flashShare(ok: boolean): void {
    this.share.textContent = ok ? 'copied!' : 'copy failed'
    clearTimeout(this.shareLabelTimer)
    this.shareLabelTimer = window.setTimeout(() => (this.share.textContent = 'share'), 1500)
  }
}

function deltaText(ms: number): string {
  const sign = ms < 0 ? '−' : '+'
  return `${sign}${formatTime(Math.abs(ms))} vs ghost`
}
