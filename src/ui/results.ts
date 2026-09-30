/** End-of-run overlay: your time, today's best and the gap to the ghost. */
import { formatTime } from './format'

export interface ResultsView {
  timeMs: number
  bestMs: number
  /** Time of the ghost that was raced, or null when there was none. */
  ghostMs: number | null
  isNewBest: boolean
}

export class Results {
  private readonly root: HTMLElement
  private readonly time: HTMLElement
  private readonly best: HTMLElement
  private readonly delta: HTMLElement

  constructor(parent: HTMLElement, onRestart: () => void) {
    this.root = document.createElement('div')
    this.root.className = 'results'
    this.root.hidden = true
    this.root.innerHTML = `
      <div class="results-title">FINISHED</div>
      <div class="results-time"></div>
      <div class="results-delta"></div>
      <div class="results-best"></div>
      <button class="results-again" type="button">race again</button>`
    this.time = this.root.querySelector('.results-time')!
    this.best = this.root.querySelector('.results-best')!
    this.delta = this.root.querySelector('.results-delta')!
    this.root.querySelector('button')!.addEventListener('click', onRestart)
    parent.appendChild(this.root)
  }

  show(view: ResultsView): void {
    this.time.textContent = formatTime(view.timeMs)
    this.best.textContent = view.isNewBest ? 'new best today' : `best today ${formatTime(view.bestMs)}`
    this.delta.textContent = view.ghostMs === null ? 'first run today' : deltaText(view.timeMs - view.ghostMs)
    this.delta.classList.toggle('faster', view.ghostMs !== null && view.timeMs < view.ghostMs)
    this.root.hidden = false
  }

  hide(): void {
    this.root.hidden = true
  }
}

function deltaText(ms: number): string {
  const sign = ms < 0 ? '−' : '+'
  return `${sign}${formatTime(Math.abs(ms))} vs ghost`
}
