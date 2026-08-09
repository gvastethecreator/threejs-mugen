# Issue 164 — Ikemen ModifyProjectile P2 facing

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port ModifyProjectile `p2facing` mutation through the existing Projectile
accepted-hit facing consumer.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates one integer
`p2facing` value and replaces that field on every selected live Projectile
HitDef. The guard path does not apply P2 facing.

## Port ledger

- `adapted`: `src/bytecode.go`, `hitDef_p2facing` in ModifyProjectile.
- `local extension`: typed static operation and bounded root/Helper expression
  resolution.
- `reused`: the existing Projectile accepted-hit `sourceFacing` consumer.
- `omitted`: full target-facing choreography, throws, rollback, and netplay.

## Acceptance fixture

- Compile a static `p2facing` value without conflating Projectile facing.
- Resolve bounded dynamic root/helper values.
- Mutate only selected live Projectiles and keep omitted/unmatched state.
- Prove a later accepted hit exposes the changed facing while guard does not.

## Claim ceiling

Do not claim full target-facing choreography, throw/custom-state facing parity,
exact tick order, rollback/netplay serialization, or full ModifyProjectile
parity.

## Verification

- Five focused files: 566 passing; the same 19 inherited PlayableMatchRuntime
  failures remain outside this slice.
- Isolated root and Helper dynamic cases pass.
- Typecheck passes.
