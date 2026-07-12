# IKEMEN Root-key Effect Stores

Date: 2026-07-12
Wayfinder: 109
Verdict: implemented and verified

## Delivered

- Replaced implicit two-owner routing with exact actor-keyed effect stores while retaining P1/P2 compatibility keys.
- Registered every authoritative runtime root before identity and runtime execution.
- Rejected unknown owners instead of aliasing their effects into P1 or P2.
- Reset and helper run-order normalization traverse every unique registered store.
- Routed Helper get-hit cleanup through its root owner store.
- Exposed deterministic P1-P8 store ownership through live actor-registry and trace evidence.

## Quality Evidence

- Focused effect/runtime/registry/helper/reversal/trace tests: 809 passed.
- TypeScript 7 typecheck: passed.
- Full tests: 178 files / 1813 tests passed.
- Trace gate: 543/543 artifacts passed (512 required, 31 optional).
- TypeScript 7 + Vite build: 260 modules; JS 1,614.56 kB, gzip 405.71 kB.
- Architecture boundaries and `git diff --check`: passed.
- Adversarial checks cover unknown owners, P3/P4 isolation, duplicate store references, reset persistence, helper root ownership, pair compatibility, and reserve zero-store trace evidence.

## Claim Boundary

This cut proves exact storage ownership only. It does not execute P3-P8 effect lifecycle, presentation, projectile/helper combat, direct hit mutation, target lifecycle, round/HUD/audio, or resource ownership. `RuntimeRootPhaseCapabilities/v4.effects` reflects registered storage ownership under the current schema, not active effect execution.

## Next

Wayfinder 110 maps target aging, bindings, buffered acquisition, and deferred commit before active-root hit mutation can proceed.
