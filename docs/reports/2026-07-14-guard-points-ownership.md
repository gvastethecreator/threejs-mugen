# Progress Report - Guard-points ownership

Date: 2026-07-14
Area: 046k direct guard/resource compatibility
Status: bounded evidence implementation

## Delivered

- Added typed `HitDef guardpoints` parsing and signed direct-guard combat
  propagation with attack/defence scaling.
- Added actor-local `GuardPointsAdd` and `GuardPointsSet` compiler/runtime
  routes with authored-max/life fallback and clamping.
- Initialized fighter resources from `[Data] guardpoints`; preserved local
  Helper resource state plumbing and telemetry classification.
- Added required `synthetic-imported-guardpoints` trace proving guard damage,
  `GuardPointsAdd`, `GuardPointsSet`, and final values `p2 = 988`, `p1 = 900`.
- Kept existing golden behavior checksums stable while including non-default
  guard-point values in checksum projections.

## Evidence

- `src/mugen/compiler/ControllerOps.ts`
- `src/mugen/runtime/CombatResolver.ts`
- `src/mugen/runtime/RuntimeResourceSystem.ts`
- `src/mugen/runtime/RuntimeTraceGatePresets.ts`
- `src/mugen/runtime/RuntimeTrace.ts`
- `src/tests/RuntimeResourceSystem.test.ts`
- `src/tests/CombatResolver.test.ts`
- `src/tests/RuntimeTraceGatePresets.test.ts`
- `scripts/qa_traces.cjs`

## Claim boundary

Allowed: explicit direct HitDef guard points, signed attack/defence scaling,
actor-local max/init, `GuardPointsAdd`/`GuardPointsSet`, clamping, and trace
observability.

Blocked: omitted HitDef defaults, `NoGuardPointsDamage`, `AttackMulSet
GuardPoints`, `TargetGuardPointsAdd`, projectile/helper/team sharing, reset,
persistence, HUD bars, rollback/netplay, and full MUGEN/IKEMEN parity.

## Verification record

Focused resource/combat/HitDef/trace coverage passes 615 tests and
`pnpm typecheck` passes. Full repository gates run at closeout and are recorded
in the final roadmap entry. Browser smoke is not required because no visible
surface changed.
