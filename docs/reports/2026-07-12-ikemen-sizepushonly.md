# IKEMEN SizePushOnly report

## Outcome

`AssertSpecial SizePushOnly` now reaches root body-push admission and bypasses Clsn2 without bypassing size geometry or team policy.

## Evidence

- Compiler test proves typed normalized `sizepushonly` lowering.
- Body-push tests prove disjoint/missing Clsn2 pushes only with the flag and Y-separated roots still fail.
- Full tests: 180 files / 1887 tests passed.
- TypeScript 7 typecheck, build, and boundaries passed; existing large-chunk advisory remains.
- Trace QA: 563/563 artifacts, 532 required and 31 optional; no checksum drift.

## Global port state

Root PlayerPush now includes SizePushOnly. Remaining constraint debt: Clsn overrides/proxies, minimum-width clamp, Width/Height controller deltas, helpers, tie/corner resolution, interpolation, and exact pause/reset order.
