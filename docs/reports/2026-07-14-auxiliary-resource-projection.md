# Progress Report - Auxiliary resource projection

Date: 2026-07-14
Area: I2 auxiliary-resource ownership
Status: resolved bounded read-only runtime evidence

## Delivered

- Added `RuntimeAuxiliaryResourceProjection/v0` with explicit root/Helper
  identity, actor-local resource owners, red-life and guard-point values/maxima,
  and explicit dizzy-point unavailability.
- Added deterministic ordering, finite normalization, clamping, orphan-owner
  diagnostics, suppression status, and Projectile/Explod exclusion.
- Published the contract through explicit IKEMEN `MugenSnapshot` and trace
  frames without adding it to behavior checksum projections.
- Added focused projection coverage plus explicit-profile snapshot coverage.

## Evidence

- `src/mugen/runtime/RuntimeAuxiliaryResourceProjectionSystem.ts`
- `src/mugen/runtime/PlayableMatchRuntime.ts`
- `src/mugen/runtime/RuntimeSnapshotSystem.ts`
- `src/mugen/runtime/RuntimeTrace.ts`
- `src/tests/RuntimeAuxiliaryResourceProjectionSystem.test.ts`
- `src/tests/PlayableMatchRuntime.test.ts`
- `docs/research/2026-07-14-auxiliary-resource-projection.md`

## Claim boundary

Allowed: read-only root/Helper ownership projection, actor-local red-life and
guard-point visibility, maxima diagnostics, explicit dizzy-point unavailability,
and behavior-checksum isolation.

Blocked: dizzy execution, red-life LifeShare mutation, suppression behavior,
projectile/team sharing, HUD bars, reset/persistence, rollback/netplay, and full
MUGEN/IKEMEN parity.

## Verification record

- Focused projection/runtime batch: 2 files, 198 tests passed.
- Full suite: 201 files, 2056 tests passed.
- TypeScript 7 typecheck passed.
- Production build passed: 280 modules; existing >500 kB chunk advisory remains.
- Trace gate passed: 589/589 artifacts, 555 required and 34 optional; existing
  behavior checksums remained stable.
- Boundary check, CSS QA (323651 bytes / 1512 rules / 0 duplicate selectors),
  and `git diff --check` passed.
- Browser smoke is N/A because no visible surface changed.
