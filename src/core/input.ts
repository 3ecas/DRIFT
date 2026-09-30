/**
 * Keyboard and touch input. Steering is level-based (held or not);
 * restart is an event. The simulation only ever sees the InputState.
 */

export interface InputState {
  left: boolean
  right: boolean
}

/** Steering as -1 (left), 0 or 1 (right). Both held cancels out. */
export function steerOf(state: InputState): number {
  return (state.right ? 1 : 0) - (state.left ? 1 : 0)
}

const LEFT_KEYS = new Set(['ArrowLeft', 'KeyA'])
const RIGHT_KEYS = new Set(['ArrowRight', 'KeyD'])

/**
 * Attaches listeners: arrow keys / A / D steer, R restarts, and touching the
 * left or right half of `surface` steers that way. Returns the live state.
 */
export function attachInput(surface: HTMLElement, onRestart: () => void): InputState {
  const state: InputState = { left: false, right: false }
  const keys = { left: false, right: false }
  const pointers = new Map<number, 'left' | 'right'>()

  const sync = (): void => {
    const sides = [...pointers.values()]
    state.left = keys.left || sides.includes('left')
    state.right = keys.right || sides.includes('right')
  }

  const onKey = (e: KeyboardEvent, down: boolean): void => {
    if (e.ctrlKey || e.metaKey || e.altKey) return // leave browser shortcuts alone
    if (LEFT_KEYS.has(e.code)) keys.left = down
    else if (RIGHT_KEYS.has(e.code)) keys.right = down
    else if (e.code === 'KeyR' && down && !e.repeat) onRestart()
    else return
    e.preventDefault()
    sync()
  }
  window.addEventListener('keydown', (e) => onKey(e, true))
  window.addEventListener('keyup', (e) => onKey(e, false))
  const releaseAll = (): void => {
    keys.left = keys.right = false
    pointers.clear()
    sync()
  }
  window.addEventListener('blur', releaseAll)
  document.addEventListener('visibilitychange', () => document.hidden && releaseAll())

  surface.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    pointers.set(e.pointerId, e.clientX < window.innerWidth / 2 ? 'left' : 'right')
    sync()
  })
  const release = (e: PointerEvent): void => {
    pointers.delete(e.pointerId)
    sync()
  }
  // On window, so a pointer released outside the canvas can't leave a steer stuck.
  window.addEventListener('pointerup', release)
  window.addEventListener('pointercancel', release)
  surface.addEventListener('contextmenu', (e) => e.preventDefault())

  return state
}
