# Issue 167 — Ikemen ModifyProjectile guard hit time

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port ModifyProjectile `guard.hittime` mutation through the existing Projectile
guard-stun consumer.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates one integer
`guard.hittime` value and replaces that field on every selected live
Projectile HitDef.

## Port ledger

- `adapted`: `src/bytecode.go`, `hitDef_guard_hittime` in ModifyProjectile.
- `local extension`: typed static operation and bounded root/Helper expression
  resolution.
- `reused`: existing Projectile guarded-contact timing resolution.
- `omitted`: exact common-state choreography, rollback, and netplay.

## Acceptance fixture

- Compile static `guard.hittime` without changing hit durations.
- Resolve bounded dynamic root/helper values.
- Mutate only selected live Projectiles and preserve omitted/unmatched state.
- Prove later guard contact consumes the changed duration.

## Claim ceiling

Do not claim complete guard common-state timing, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Verification

- Five focused files: 569 passing; the same 19 inherited PlayableMatchRuntime
  failures remain outside this slice.
- Isolated root, Helper, and guarded-contact cases pass.
- Typecheck passes.
