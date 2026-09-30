# Daily Ghost Race

A minimalist top-down drift racer. Every day, every player gets the same
procedurally generated track. A run is 3 laps; race the clock and the ghosts
of your earlier runs.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173 (also exposed on your LAN for phones)
npm test           # unit tests (rng, track generation, checkpoints, physics)
npm run typecheck  # tsc --noEmit
npm run build      # production build in dist/
```

The track changes every UTC day. Add `?seed=anything` to the URL to practise another one.

## Controls

| Action  | Desktop            | Touch                         |
| ------- | ------------------ | ----------------------------- |
| Steer   | ← → or A / D       | touch left / right half       |
| Restart | R                  | ↻ button                      |

A finished run counts towards your daily streak. The results screen has a
share button that copies a short text result and shows the countdown to the
next track (UTC midnight).

The car accelerates by itself. The timer starts on your first steer input.

## File structure

```
index.html              canvas + HUD container
src/main.ts             entry point: wires input, simulation and rendering
src/config.ts           every tunable constant (speed, grip, track size, colours)
src/style.css           page and HUD styles
src/core/rng.ts         string hash + seeded PRNG (integer maths, engine independent)
src/core/loop.ts        fixed-timestep accumulator loop
src/core/input.ts       keyboard + touch → steer state, restart event
src/core/daily.ts       UTC date → daily seed, countdown to the next day
src/core/storage.ts     safe JSON read/write over localStorage
src/core/streak.ts      daily streak logic and storage
src/track/types.ts      Vec2, Gate, Track
src/track/geometry.ts   vector helpers, point-to-loop distance, segment crossing
src/track/spline.ts     closed Catmull-Rom sampling and arc-length re-sampling
src/track/validate.ts   rejects tight corners and self-overlapping loops
src/track/checkpoints.ts gate placement and in-order lap counting
src/track/generate.ts   seed → Track
src/car/state.ts        CarState, Pose, interpolation
src/car/physics.ts      drift physics step (auto-accelerate, steer, grip, off-track)
src/race/run.ts         one attempt: car + laps + tick timer (pure simulation)
src/race/session.ts     owns the current run, records it, plays the ghost
src/ghost/types.ts      GhostRun
src/ghost/recorder.ts   samples the car pose every few ticks
src/ghost/playback.ts   interpolated ghost pose at a tick
src/ghost/storage.ts    best run per day in localStorage
src/render/camera.ts    fit-the-track camera
src/render/track.ts     track, gates, start line
src/render/car.ts       car / ghost arrow
src/render/scene.ts     canvas setup and frame drawing
src/ui/format.ts        time formatting
src/ui/hud.ts           DOM overlay: timer, lap, hint, restart button, touch zones
src/ui/results.ts       end-of-run overlay: time, gap, best, streak, share, countdown
src/ui/share.ts         share text and clipboard copy
src/net/                (milestone 4) API client
tests/                  vitest unit tests
```

Simulation code (`core/rng`, `track/*`, `car/*`, `race/*`) never touches the
canvas or the DOM. Run time is counted in simulation ticks, so frame rate
cannot change a result.

## Milestones

1. ✅ Car, one generated track, lap timer.
2. ✅ Daily seed, local best ghost, instant restart, results screen.
3. ✅ Streak, share button, countdown, polished touch controls.
4. Online leaderboard and ghosts (Node + SQLite server in `/server`).
