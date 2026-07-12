# MUGEN PlayerPush minimum-width report

## Outcome

Legacy imported MUGEN characters now retain IKEMEN-GO's hidden five-world-unit minimum push width. Definitions declaring a nonzero `ikemenversion` keep authored narrow widths.

## Evidence

- DEF parser coverage proves `ikemenversion` preservation.
- Root body-push tests prove legacy separation, `0.0` routing, IKEMEN exclusion, asymmetric facing, and equivalent 640x480 localcoord behavior.
- Full tests: 180 files / 1892 tests passed.
- TypeScript 7 typecheck, build, and boundaries passed; existing large-chunk advisory remains.
- Trace QA: 563/563 artifacts, 532 required and 31 optional; no checksum drift.

## Global port state

Root PlayerPush now covers legacy minimum-width compatibility. Remaining constraint debt centers on Clsn overrides/proxies, Width/Height size-box deltas, duplicate visitation, helpers, Z corner/tie policy, interpolation, combined required trace coverage, and exact pause/reset ordering.
