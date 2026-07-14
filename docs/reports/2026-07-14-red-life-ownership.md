# Progress Report - Red-life ownership

Date: 2026-07-14
Area: 046j direct combat/resource compatibility
Status: bounded evidence implementation

## Delivered

- Added typed `HitDef redlife` hit/guard parsing and direct-combat propagation.
- Added actor-local `RedLifeAdd` and `RedLifeSet` compiler/runtime support,
  including `absolute` handling and life-max clamping.
- Added conditional trace evidence for positive red-life values and a required
  synthetic imported gate covering direct HitDef red life plus both resource
  controllers.
- Preserved existing behavior checksums when red life remains zero.

## Evidence

- `src/mugen/compiler/ControllerOps.ts`
- `src/mugen/runtime/RuntimeResourceSystem.ts`
- `src/mugen/runtime/CombatResolver.ts`
- `src/mugen/runtime/DirectCombatSystem.ts`
- `src/mugen/runtime/HitDefSystem.ts`
- `src/mugen/runtime/RuntimeTraceGatePresets.ts`
- `src/tests/RuntimeResourceSystem.test.ts`
- `src/tests/CombatResolver.test.ts`
- `src/tests/RuntimeTraceGatePresets.test.ts`
- `scripts/qa_traces.cjs`

## Claim boundary

Allowed: explicit direct HitDef hit/guard red life, actor-local
`RedLifeAdd`/`RedLifeSet`, bounded defence/absolute scaling, clamping, and
trace observability.

Blocked: omitted HitDef defaults, `NoRedLifeDamage`, `AttackMulSet RedLife`,
`TargetRedLifeAdd`, projectile/helper/team ownership, guard/stun coupling,
round persistence, rollback/netplay, visible lifebar rendering, and full
MUGEN/IKEMEN parity.

## Verification record

The focused red-life trace and resource/combat tests are the first evidence
pass. Full repository gates are recorded after the implementation audit and
commit.
