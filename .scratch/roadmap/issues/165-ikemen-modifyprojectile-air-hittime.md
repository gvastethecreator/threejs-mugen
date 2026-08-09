# Issue 165 — Ikemen ModifyProjectile air hit time

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port ModifyProjectile `air.hittime` mutation through the existing airborne
Projectile hit-stun consumer.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates one integer
`air.hittime` value and replaces that field on every selected live Projectile
HitDef.

## Port ledger

- `adapted`: `src/bytecode.go`, `hitDef_air_hittime` in ModifyProjectile.
- `local extension`: typed static operation and bounded root/Helper expression
  resolution.
- `reused`: existing Projectile airborne hit timing resolution.
- `omitted`: exact common-state choreography, rollback, and netplay.

## Acceptance fixture

- Compile static `air.hittime` without changing `ground.hittime`.
- Resolve bounded dynamic root/helper values.
- Mutate only selected live Projectiles and preserve omitted/unmatched state.
- Prove later airborne hit contact consumes the changed duration.

## Claim ceiling

Do not claim complete get-hit common-state timing, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Verification

- Five focused files: 567 passing; the same 19 inherited PlayableMatchRuntime
  failures remain outside this slice.
- Isolated root, Helper, and airborne-contact cases pass.
- Typecheck passes.
