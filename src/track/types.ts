export interface Vec2 {
  x: number
  y: number
}

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** A checkpoint line across the track. Gate 0 is the start/finish line. */
export interface Gate {
  /** Index of the centreline point the gate sits on. */
  index: number
  center: Vec2
  /** Unit vector pointing in the racing direction. */
  forward: Vec2
  /** Gate end points. */
  a: Vec2
  b: Vec2
}

export interface Track {
  seed: string
  width: number
  /** Closed centreline; consecutive points are evenly spaced. */
  points: Vec2[]
  gates: Gate[]
  start: { pos: Vec2; heading: number }
  /** Tight box around the track surface. */
  bounds: Bounds
  /** The car can never leave this box; the camera shows all of it. */
  arena: Bounds
}
