# Progress Report - Dizzy points runtime

Date: 2026-07-14
Area: I2 auxiliary-resource mutation
Status: resolved bounded actor-local runtime evidence

## Delivered

- Added actor-local `dizzyPoints` / `dizzyPointsMax` state for fighters and
  Helpers, with authored `[Data] dizzypoints` and life fallback.
- Added typed `DizzyPointsAdd` / `DizzyPointsSet` compiler, dispatch, execution,
  and Helper telemetry routes with finite `[0, max]` bounds.
- Added explicit imported HitDef `dizzypoints` parsing and direct-hit mutation;
  guarded hits do not spend dizzy points.
- Promoted auxiliary projection status from unimplemented to bounded for dizzy
  points and carried the resource through snapshots/traces.
- Added required fixture `synthetic-imported-dizzypoints` with checksum
  `00d3b052`.

## Evidence

- `src/mugen/runtime/RuntimeResourceSystem.ts`
- `src/mugen/runtime/CombatResolver.ts`
- `src/mugen/runtime/DirectCombatSystem.ts`
- `src/mugen/runtime/HitDefSystem.ts`
- `src/mugen/runtime/RuntimeTraceGatePresets.ts`
- `src/tests/RuntimeResourceSystem.test.ts`
- `src/tests/RuntimeTraceGatePresets.test.ts`

## Verification record

- Full suite: 201 files, 2061 tests passed.
- TypeScript 7 typecheck passed.
- Production build passed: 280 modules; existing >500 kB chunk advisory remains.
- Trace gate passed: 590/590 artifacts, 556 required and 34 optional; checksum
  `00d3b052` is the new required dizzy-point route.
- Boundary check, CSS QA (323651 bytes / 1512 rules / 0 duplicate selectors),
  and `git diff --check` passed.
- Browser smoke is N/A because no visible surface changed.

## Claim boundary

Allowed: bounded actor-local dizzy initialization, Add/Set, explicit direct
HitDef amount, signed scaling, Helper plumbing, projection, and trace evidence.

Blocked: omitted defaults, `NoDizzyPointsDamage`, `AttackMulSet DizzyPoints`,
break transitions, team/projectile sharing, reset/persistence, HUD, rollback,
netplay, and full MUGEN/IKEMEN parity.
