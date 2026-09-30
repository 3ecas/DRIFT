/** Canvas setup and per-frame drawing. Draws what it is given; no game logic. */
import { COLORS, RENDER } from '../config.ts'
import type { Pose } from '../car/state.ts'
import type { Track } from '../track/types.ts'
import { fitCamera, type Camera } from './camera.ts'
import { drawTrack } from './track.ts'
import { drawCar } from './car.ts'

export interface Frame {
  car: Pose
  onTrack: boolean
  ghosts: { pose: Pose; color: string }[]
}

export class Scene {
  private readonly ctx: CanvasRenderingContext2D
  private camera: Camera = { scale: 1, offsetX: 0, offsetY: 0 }
  private dpr = 1
  private track: Track | null = null

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D is not available')
    this.ctx = ctx
    window.addEventListener('resize', () => this.resize())
    this.resize()
  }

  setTrack(track: Track): void {
    this.track = track
    this.resize()
  }

  private resize(): void {
    this.dpr = window.devicePixelRatio || 1
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.canvas.width = Math.round(w * this.dpr)
    this.canvas.height = Math.round(h * this.dpr)
    if (this.track) this.camera = fitCamera(this.track.arena, w, h, RENDER.MARGIN)
  }

  draw(frame: Frame): void {
    const { ctx, camera, dpr } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = COLORS.BACKGROUND
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    if (!this.track) return

    const s = camera.scale * dpr
    ctx.setTransform(s, 0, 0, s, camera.offsetX * dpr, camera.offsetY * dpr)
    drawTrack(ctx, this.track)
    for (const g of frame.ghosts) drawCar(ctx, g.pose, g.color, COLORS.GHOST_ALPHA)
    drawCar(ctx, frame.car, COLORS.ACCENT, frame.onTrack ? 1 : 0.6)
  }
}
