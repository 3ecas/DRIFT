/** Formats milliseconds as s.mmm, or m:ss.mmm past a minute. */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms))
  const minutes = Math.floor(total / 60000)
  const seconds = Math.floor((total % 60000) / 1000)
  const millis = total % 1000
  const secText = `${seconds}.${String(millis).padStart(3, '0')}`
  return minutes > 0 ? `${minutes}:${secText.padStart(6, '0')}` : secText
}

/** Formats a duration as h:mm:ss. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
