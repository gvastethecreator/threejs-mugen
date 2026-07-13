# Prove Legal MUGEN-lite NoKOSlow Browser Route

Type: implementation
Status: resolved
Blocked by: None

## Question

Can the repository-authored legal ZIP fixture assert `NoKOSlow` on the lethal KO tick and prove normal post-KO playback through the production browser route?

## Decision

Add one bounded fixture command (`z`) and lethal state (`210`) with an active-tick `AssertSpecial NoKOSlow` before `HitDef`. Reuse the existing runtime post-KO model and synthetic trace semantics, then add legal-package trace and desktop/mobile browser evidence.

## Acceptance

- The legal fixture parses and loads the command, state, AIR action, and visible sprite through the production ZIP path.
- A required trace proves `NoKOSlow`, a KO round frame, post-round progress, and playback rate `1`.
- Browser smoke drives physical `d -> z`, proves imported identity, lethal defender life, `NoKOSlow`, post-round progress, and a visible KO route on desktop and mobile.
- Existing nonlethal attack/recovery/guard journeys stay green.

## Claim Ceiling

Allowed: one legal imported `NoKOSlow` KO route through the current browser sandbox.

Blocked: exact slowdown curve/duration, motif/lifebar behavior, win/continue flow, teams, KO echoes, broad audio parity, and full MUGEN/IKEMEN round parity.

## Outcome

- Required trace `mugen-lite-journey-nokoslow` passes with checksum `ceac9f37`, final checksum `1d5b25e4`, and `141` frames.
- Desktop/mobile smoke proves `d -> z`, imported `210,0`, `nokoslow`, P2 life `0`, post-round progress/playback `1`, and Reset returning the fight/life baseline.
- Full closeout passes `183` files / `1937` tests, TypeScript 7 typecheck/build, boundaries, `566/566` traces (`535` required), browser smoke, and diff hygiene.
