# IKEMEN PlayerPush X tie report

## Outcome

Exactly overlapping roots no longer remain unresolved. PlayerPush now selects X direction through IKEMEN priority, state, height, and facing policy.

## Evidence

- Focused tests cover default facing fallback, higher-priority candidate anchoring, and getter hit-state direction.
- Full tests: 180 files / 1888 tests passed.
- TypeScript 7 typecheck, build, and boundaries passed; existing large-chunk advisory remains.
- Trace QA: 563/563 artifacts, 532 required and 31 optional; no checksum drift.

## Global port state

Root PlayerPush now covers X tie direction. Remaining constraint debt: duplicate run-order visitation, Z tie/corner policy, interpolation, Clsn overrides/proxies, minimum-width clamp, Width/Height deltas, helpers, and exact pause/reset ordering.
