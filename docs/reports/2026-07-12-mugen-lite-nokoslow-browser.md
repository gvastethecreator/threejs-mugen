# MUGEN-lite Legal NoKOSlow Browser Report

Date: 2026-07-12
Roadmap entry: 468
Wayfinder ticket: 115

## Delivered

- The repository-owned CC0 MUGEN-lite ZIP now provides command `finisher = z`, state/action `210`, a visible AIR/SFF pose, and a lethal `HitDef` with tick-active `AssertSpecial NoKOSlow`.
- The legal trace loads the ZIP through the production loader and requires command, state, controller, operation, hit, sound, actor-frame, KO, post-round, and final-life evidence.
- Production browser smoke selects imported P1 versus demo Nova Boxer CPU, drives physical `d -> z`, pauses on imported `210,0`, and proves `nokoslow`, P2 life `0`, post-round progress, playback `1`, and reset recovery on desktop and mobile.

## Evidence

- Primary semantics: [Elecbyte State Controller Reference: AssertSpecial](https://www.elecbyte.com/mugendocs-11b1/sctrls.html#assertspecial).
- `pnpm qa:trace`: `566/566` passed, `535` required; `mugen-lite-journey-nokoslow` checksum `ceac9f37`, final checksum `1d5b25e4`, `141` frames.
- `pnpm qa:smoke`: passed in Playwright/SwiftShader with desktop and mobile KO captures.
- `pnpm test`: `183` files / `1937` tests passed.
- `pnpm typecheck`, `pnpm build`, and `pnpm check:boundaries`: passed. Build retains the existing Vite chunk advisory (`1,659.19 kB` JavaScript).
- Captures: `.scratch/qa/qa-smoke/mugen-lite-runtime-{desktop,mobile}-nokoslow[-canvas].png`.

## Claim Boundary

Proven: one legal imported MUGEN fixture can assert `NoKOSlow` on a lethal KO and preserve the current sandbox's normal post-KO playback through the browser route.

Blocked: exact slowdown curve/duration, motif/lifebar/KO echo behavior, win/continue flow, teams, broad audio parity, score movement, and full MUGEN/IKEMEN round parity.
