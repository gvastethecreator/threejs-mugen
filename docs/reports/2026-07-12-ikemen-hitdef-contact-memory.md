# IKEMEN HitDef Contact Memory

Date: 2026-07-12
Wayfinder: 113
Verdict: implemented and verified

## Delivered

- Actor-local committed and pending direct-HitDef getter ids.
- Source-order pending append and post-direct-combat commit with duplicate preservation.
- Immediate, deduplicated CNS target memory retained.
- Direct hit, guard, accepted HitOverride, and direct ReversalDef buffering.
- MoveStart, HitDef, and ReversalDef reset ownership.
- Exact contacted-getter read-only root admission.
- Detached `RuntimeHitDefContactMemory/v0` diagnostics and actor-scoped schedule proof.

## Evidence

- Focused runtime/contact/admission/schedule/trace suite: 9 files / 770 tests passed.
- Full tests: 179 files / 1819 tests passed.
- Trace gate: 543/543 artifacts passed (512 required, 31 optional).
- TypeScript 7 + Vite build: 261 modules; JS 1,617.49 kB, gzip 406.44 kB.
- Architecture boundaries passed; active-root checksum remains `fdd687cb`.

## Pressure

- Corrected prior false premise: live CNS target acquisition is immediate; only HitDef contact memory is deferred.
- Scalar `hasHit` remains in pair mutation and still blocks real multi-getter execution. This is deliberately not claimed complete.
- Projectile and Helper target/contact routes remain separate and unchanged.

## Next

Wayfinder 114 maps the first safe active-root direct-hit mutation route across state, resources, presentation, and team round ownership.
