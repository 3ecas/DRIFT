/**
 * Every tunable constant lives here.
 * Units: world units (wu) for distance, seconds for time, radians for angles.
 */

export const SIM = {
  /** Fixed simulation rate in ticks per second. Frame rate never affects results. */
  TICK_RATE: 60,
  /** Laps needed to finish a run. */
  LAPS: 3,
} as const

/** Duration of one simulation tick in seconds. */
export const DT = 1 / SIM.TICK_RATE

export const CAR = {
  LENGTH: 22,
  WIDTH: 12,
  /** Automatic acceleration along the heading (wu/s²). */
  ACCEL: 320,
  /** Speed cap on the track (wu/s). */
  MAX_SPEED: 260,
  /** Turn rate at full steering authority (rad/s). */
  STEER_RATE: 3.4,
  /** Speed at which steering reaches full authority (no turning on the spot). */
  STEER_FULL_SPEED: 90,
  /** Fraction of speed lost per second while steering. */
  STEER_COST: 0.55,
  /** How quickly velocity aligns with heading (1/s). Lower = more drift. */
  GRIP: 4.5,
  /** Grip when off the track. */
  OFF_TRACK_GRIP: 2.0,
  /** Extra drag off the track (1/s). Cruise speed off track is ACCEL / OFF_TRACK_DRAG. */
  OFF_TRACK_DRAG: 3.0,
} as const

export const TRACK = {
  WIDTH: 72,
  /** Control points around the centre before smoothing. */
  CONTROL_POINTS: 10,
  RADIUS_MIN: 240,
  RADIUS_MAX: 400,
  /** Angular jitter of control points, as a fraction of their nominal spacing. */
  ANGLE_JITTER: 0.35,
  /** Spline samples per control segment before re-sampling. */
  SPLINE_SAMPLES: 16,
  /** Distance between centreline points after re-sampling (wu). */
  SAMPLE_SPACING: 8,
  /** Tracks with a corner tighter than this are rejected (wu). Keep above WIDTH / 2. */
  MIN_CORNER_RADIUS: 50,
  /** Minimum distance between non-adjacent centreline points, as a multiple of WIDTH. */
  MIN_SEPARATION: 1.3,
  /**
   * Centreline points closer than this along the track are not separation-checked (wu).
   * Must be at least the arc length at which a MIN_CORNER_RADIUS corner's chord
   * reaches MIN_SEPARATION × WIDTH, otherwise legal hairpins get rejected.
   */
  SEPARATION_SKIP: 130,
  /** Gates per lap, including the start/finish line. */
  CHECKPOINTS: 8,
  /** Gate half-length as a multiple of WIDTH (slightly wider than the track). */
  GATE_HALF_WIDTH: 0.7,
  /** The car starts this far behind the start line (wu). */
  START_OFFSET: 30,
  /** Room to run wide beyond the track edge before hitting the arena wall, × WIDTH. */
  ARENA_PADDING: 1,
  /** Generation attempts before giving up on a seed. */
  MAX_ATTEMPTS: 200,
} as const

export const GHOST = {
  /** Record a ghost frame every N ticks. */
  SAMPLE_INTERVAL: 3,
} as const

export const NET = {
  /** Give up on a request after this long. */
  TIMEOUT_MS: 5000,
  /** Rows shown on the leaderboard. */
  LEADERBOARD_SIZE: 10,
  /** Online ghosts fetched: the ones ranked just above the player. */
  GHOSTS_ABOVE: 2,
} as const

export const STORAGE = {
  /** localStorage key prefix. */
  PREFIX: 'dgr',
} as const

export const COLORS = {
  BACKGROUND: '#0b0e13',
  TRACK: '#1b2129',
  TRACK_EDGE: '#333c4a',
  GATE: '#2b3542',
  START_LINE: '#e8edf2',
  ACCENT: '#ffb020',
  /** Ghosts fetched from the leaderboard. */
  ONLINE_GHOST: '#8fd3ff',
  GHOST_ALPHA: 0.35,
  TEXT: '#e8edf2',
} as const

export const RENDER = {
  /** Screen-space margin around the arena (px). */
  MARGIN: 16,
} as const
