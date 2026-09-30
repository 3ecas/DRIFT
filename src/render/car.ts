/** Draws a car (or ghost) as a small arrow head pointing along its heading. */
import { CAR } from '../config'
import type { Pose } from '../car/state'

export function drawCar(ctx: CanvasRenderingContext2D, pose: Pose, color: string, alpha = 1): void {
  const l = CAR.LENGTH / 2
  const w = CAR.WIDTH / 2
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(pose.x, pose.y)
  ctx.rotate(pose.heading)
  ctx.beginPath()
  ctx.moveTo(l, 0)
  ctx.lineTo(-l, w)
  ctx.lineTo(-l * 0.55, 0)
  ctx.lineTo(-l, -w)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}
