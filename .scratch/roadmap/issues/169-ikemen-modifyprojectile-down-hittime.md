# Issue 169 — Ikemen ModifyProjectile down hit time

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port ModifyProjectile `down.hittime` mutation through the existing lying-state
Projectile hit-stun consumer.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates one integer
`down.hittime` value and replaces that field on every selected live Projectile
HitDef.

## Port ledger

- `adapted`: `src/bytecode.go`, `hitDef_down_hittime` in ModifyProjectile.
- `local extension`: typed static operation and bounded root/Helper expression
  resolution.
- `reused`: existing Projectile lying-hit timing resolution.
- `omitted`: exact common-state choreography, rollback, and netplay.

## Acceptance fixture

- Compile static `down.hittime` without changing ground/air hit durations.
- Resolve bounded dynamic root/helper values.
- Mutate only selected live Projectiles and preserve omitted/unmatched state.
- Prove later lying-state hit contact consumes the changed duration.

## Claim ceiling

Do not claim complete lying/get-up common-state timing, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Verification

- Five focused files: 571 passing; the same 19 inherited PlayableMatchRuntime
  failures remain outside this slice.
- Isolated root, Helper, and lying-state contact cases pass.
- Typecheck passes.
