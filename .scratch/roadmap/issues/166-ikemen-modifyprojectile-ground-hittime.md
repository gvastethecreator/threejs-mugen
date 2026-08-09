# Issue 166 — Ikemen ModifyProjectile ground hit time

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port ModifyProjectile `ground.hittime` mutation through the existing grounded
Projectile hit-stun consumer.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates one integer
`ground.hittime` value and replaces that field on every selected live
Projectile HitDef.

## Port ledger

- `adapted`: `src/bytecode.go`, `hitDef_ground_hittime` in ModifyProjectile.
- `local extension`: typed static operation and bounded root/Helper expression
  resolution.
- `reused`: existing Projectile grounded hit timing resolution.
- `omitted`: exact common-state choreography, rollback, and netplay.

## Acceptance fixture

- Compile static `ground.hittime` without changing `air.hittime`.
- Resolve bounded dynamic root/helper values.
- Mutate only selected live Projectiles and preserve omitted/unmatched state.
- Prove later grounded hit contact consumes the changed duration.

## Claim ceiling

Do not claim complete get-hit common-state timing, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Verification

- Five focused files: 568 passing; the same 19 inherited PlayableMatchRuntime
  failures remain outside this slice.
- Isolated root, Helper, and grounded-contact cases pass.
- Typecheck passes.
