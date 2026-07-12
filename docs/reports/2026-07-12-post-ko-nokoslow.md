# Post-KO and NoKOSlow implementation report

Date: 2026-07-12
Roadmap entry: 456

## Delivered

- Separate bounded 255-tick post-round and 60-tick slowdown clocks instead of immediate KO stop.
- Default 0.25 slowdown with 45-tick fade to normal speed.
- KO-frame `NoKOSlow` capture with normal playback and unchanged timeline length.
- Immediate time-over behavior preserved.
- TimerFreeze no longer blocks post-round progression; Pause/HitPause branches share the same post-round clock.
- Versioned `RuntimePostRound/v0` snapshot and trace evidence.
- One-shot KO sound behavior preserved.
- Required normal-KO and NoKOSlow trace routes.

## Evidence

- Latest focused round, match, and trace preset verification passes: 3 files / 36 selected tests.
- Full suite: 181 files / 1922 tests.
- TypeScript 7 typecheck, production build, boundaries, and diff hygiene pass.
- `pnpm qa:trace`: 564/564 artifacts, 533 required and 31 optional.
- Normal KO checksum: `11628b78`.
- NoKOSlow checksum: `1c0803a2`.
- Time-over checksum remains historical `7d9f7907` after excluding KO-only telemetry.
- Build retains the existing large-chunk advisory at 1,656.63 kB.
- Browser smoke is N/A because no renderer, Studio, CSS, sprite, material, or visible layout changed.

## Global status

MUGEN-lite gains one ordered post-KO route. Studio/editor, Three.js renderer, assets, and IKEMEN multi-root gameplay are unchanged. No score movement is claimed from this bounded round slice.

## Remaining debt

Exact render interpolation, configurable motif timing, over.hittime/waittime/wintime, winpose/continue flow, post-KO input, pause layering, teams, lifebars, audio echo timing, and full MUGEN/IKEMEN round parity remain open.

## Review reconciliation

Independent review rejected the first cut. Accepted findings changed the artifact: TimerFreeze no longer deadlocks KO, slowdown and post-round clocks are separate, and trace tests compare external frames with logical ticks. Exact Pause/SuperPause/HitPause phase parity remains explicitly blocked.
