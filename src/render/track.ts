/** Draws the track surface, checkpoint gates and the start line. */
import { COLORS } from '../config'
import type { Gate, Track, Vec2 } from '../track/types'

export function drawTrack(ctx: CanvasRenderingContext2D, track: Track): void {
  traceLoop(ctx, track.points)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = COLORS.TRACK_EDGE
  ctx.lineWidth = track.width + 4
  ctx.stroke()
  ctx.strokeStyle = COLORS.TRACK
  ctx.lineWidth = track.width
  ctx.stroke()

  for (let i = 1; i < track.gates.length; i++) {
    drawGate(ctx, track.gates[i], COLORS.GATE, 2)
  }
  drawGate(ctx, track.gates[0], COLORS.START_LINE, 4)
}

function traceLoop(ctx: CanvasRenderingContext2D, points: Vec2[]): void {
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
  ctx.closePath()
}

function drawGate(ctx: CanvasRenderingContext2D, gate: Gate, color: string, width: number): void {
  ctx.beginPath()
  ctx.moveTo(gate.a.x, gate.a.y)
  ctx.lineTo(gate.b.x, gate.b.y)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'butt'
  ctx.stroke()
}
