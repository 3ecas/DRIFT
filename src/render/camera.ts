/** World → screen mapping that fits the whole track into the viewport. */
import type { Bounds } from '../track/types.ts'

export interface Camera {
  scale: number
  offsetX: number
  offsetY: number
}

export function fitCamera(b: Bounds, viewW: number, viewH: number, margin: number): Camera {
  const w = b.maxX - b.minX
  const h = b.maxY - b.minY
  const scale = Math.max(0.01, Math.min((viewW - 2 * margin) / w, (viewH - 2 * margin) / h))
  const cx = (b.minX + b.maxX) / 2
  const cy = (b.minY + b.maxY) / 2
  return { scale, offsetX: viewW / 2 - cx * scale, offsetY: viewH / 2 - cy * scale }
}
