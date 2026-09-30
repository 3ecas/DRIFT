/**
 * Fixed-timestep game loop (accumulator pattern).
 * `update` runs exactly `tickRate` times per simulated second regardless of
 * frame rate; `render` runs once per animation frame with the interpolation
 * factor between the last two simulation states.
 */

export interface LoopOptions {
  tickRate: number
  update: () => void
  render: (alpha: number) => void
}

/** Longest frame we try to catch up on; longer gaps (tab hidden) are dropped. */
const MAX_FRAME_MS = 250

/** Starts the loop and returns a function that stops it. */
export function startLoop({ tickRate, update, render }: LoopOptions): () => void {
  const stepMs = 1000 / tickRate
  let last = performance.now()
  let accumulator = 0
  let handle = 0

  const frame = (now: number): void => {
    accumulator += Math.min(now - last, MAX_FRAME_MS)
    last = now
    while (accumulator >= stepMs) {
      update()
      accumulator -= stepMs
    }
    render(accumulator / stepMs)
    handle = requestAnimationFrame(frame)
  }

  handle = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(handle)
}
