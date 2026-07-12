# IKEMEN Active-root HitDef Runtime

Date: 2026-07-12
Wayfinder: 115
Verdict: implemented and verified

## Delivered

- Active-motion CNS admits only direct `HitDef` among side effects.
- Standby CNS still blocks every side effect.
- Active P3 authors HitDef before root admission and damages passive active P4.
- Exact target id and HitDef getter memory prevent repeated same-getter damage.
- `RuntimeRootPhaseCapabilities/v5` reports direct combat for structurally active Tag roots.
- Required trace registered in `qa:trace`.

## Focused Evidence

- Capability and required-trace tests passed.
- P3->P4 admission exact; P4 life 1000 -> 963 once.
- Second frame reports `already-hit`.
- Target link `p3 -> p4`, id 115.
- Focused runtime/trace suite: 4 files / 555 tests passed.
- Full suite: 179 files / 1820 tests passed.
- Trace gate: 544/544 artifacts passed (513 required, 31 optional).
- TypeScript 7 + Vite build: 261 modules; JS 1,618.09 kB, gzip 406.60 kB.
- Architecture boundaries and `git diff --check` passed.

## Blocked

Plural priority/trade/ReversalDef, projectile/helper/throw combat, team KO/replacement, shared resources, broad effect lifecycle, exact contact rendering/playback, rollback, and full parity.

## Next

Wayfinder 116: replace pair-only priority clash with deterministic plural active-root arbitration and simultaneous P3/P4 oracle.
