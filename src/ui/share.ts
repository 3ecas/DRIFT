/** Short text result for the clipboard. */
import { formatTime } from './format.ts'

export interface ShareView {
  seed: string
  timeMs: number
  bestMs: number
  streak: number
  url: string
}

export function shareText(v: ShareView): string {
  const lines = [`Daily Ghost Race ${v.seed}`, `⏱ ${formatTime(v.timeMs)}`]
  if (v.bestMs < v.timeMs) lines[1] += ` (best ${formatTime(v.bestMs)})`
  if (v.streak > 1) lines.push(`🔥 ${v.streak}-day streak`)
  lines.push(v.url)
  return lines.join('\n')
}

/** Copies text to the clipboard; falls back to a hidden textarea on older browsers. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}
