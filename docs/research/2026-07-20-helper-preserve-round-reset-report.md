# Implementation report: Helper preserve round reset

Date: 2026-07-20
Area: effect-store and match reset ownership
Scope: T352, bounded Ikemen `preserve` lifecycle

## Result

The effect world now accepts an explicit reset policy. An Ikemen round reset
keeps Helpers with `preserve === true`, removes transient Explods and
Projectiles, and keeps Helper serial allocation monotonic. The match reset
boundary passes that policy only for `ikemen-go` round/Turns continuation
resets. Full reset and intro-skip reset keep destructive behavior.

Ikemen's round-start backup copies complete Helper state, while this slice only
retains live Helper objects. State snapshot/restore remains an open boundary.

## Implementation

- `EffectActorSystem.ts` filters retained Helpers, notifies removal only for
  discarded Helpers, resets transient effect stores, and retains serial state.
- `RuntimeMatchResetSystem.ts` carries `preserveHelpers` through the typed
  reset contract.
- `PlayableMatchRuntime.ts` enables the option only when `preserveRound` and
  `ikemen-go` both hold.
- `EffectActorSystem.test.ts` covers filtered retention, removal notification,
  transient cleanup, serial continuity, and force cleanup.
- `RuntimeMatchResetSystem.test.ts` covers option propagation.

## Evidence

- Feature commit: `3d61ad92`.
- Focused affected modules: `3` files, `348/348` tests.
- `pnpm qa:trace`: `634/634` artifacts, `600` required and `34` optional,
  unchanged from T351.
- TypeScript 7 typecheck, build (`326` modules), and boundaries: passed.
- Full Vitest is intentionally deferred to the next multi-feature checkpoint;
  latest full baseline before T352: `239/239` files, `2601/2601` tests.

The existing Vite large-chunk warning remains. Browser smoke is deferred for
this runtime-only reset contract.

## Claim ceiling

Evidence covers the reset option, filtered Helper retention, serial continuity,
and current Playable runtime policy wiring. It does not cover exact backup
state restoration, F4/input parity, child effect persistence, nested/team
Helper restoration, renderer output, or full MUGEN/IKEMEN parity.

## Primary source

- [Ikemen-GO `system.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go)
