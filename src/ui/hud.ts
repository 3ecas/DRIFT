/** DOM overlay: timer, lap counter, hint text and the restart button. */
import { formatTime } from './format'
import type { Phase } from '../race/run'

export interface HudView {
  timeMs: number
  lap: number
  laps: number
  phase: Phase
}

const HAS_TOUCH = matchMedia('(pointer: coarse)').matches

const HINTS: Record<Phase, string> = {
  ready: HAS_TOUCH ? 'touch left / right to steer' : '← → or A / D to steer · R to restart',
  racing: '',
  finished: HAS_TOUCH ? 'finished · tap ↻ to go again' : 'finished · R to go again',
}

export class Hud {
  private readonly time: HTMLElement
  private readonly lap: HTMLElement
  private readonly hint: HTMLElement
  private last = { time: '', lap: '', hint: '' }

  constructor(root: HTMLElement, onRestart: () => void) {
    root.innerHTML = `
      <div class="hud-top">
        <div id="hud-time" class="hud-time">0.000</div>
        <div id="hud-lap" class="hud-lap"></div>
      </div>
      <div id="hud-hint" class="hud-hint"></div>
      <button id="hud-restart" class="hud-restart" type="button" aria-label="Restart">↻</button>`
    this.time = root.querySelector('#hud-time')!
    this.lap = root.querySelector('#hud-lap')!
    this.hint = root.querySelector('#hud-hint')!
    const button = root.querySelector<HTMLButtonElement>('#hud-restart')!
    button.addEventListener('click', () => {
      onRestart()
      button.blur()
    })
  }

  update(view: HudView): void {
    this.set('time', this.time, formatTime(view.timeMs))
    const lap = Math.min(view.lap + 1, view.laps)
    this.set('lap', this.lap, `LAP ${lap}/${view.laps}`)
    this.set('hint', this.hint, HINTS[view.phase])
  }

  private set(key: keyof typeof this.last, el: HTMLElement, text: string): void {
    if (this.last[key] === text) return
    this.last[key] = text
    el.textContent = text
  }
}
