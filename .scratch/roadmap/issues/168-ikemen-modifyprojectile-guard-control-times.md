# Issue 168 — Ikemen ModifyProjectile guard control times

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port ModifyProjectile `guard.slidetime`, `guard.ctrltime`, and
`airguard.ctrltime` through the existing guarded-contact timers.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates each parameter as one
integer and replaces its field on every selected live Projectile HitDef.

## Port ledger

- `adapted`: `src/bytecode.go`, `hitDef_guard_slidetime`,
  `hitDef_guard_ctrltime`, and `hitDef_airguard_ctrltime`.
- `local extension`: typed static operations and bounded root/Helper expression
  resolution.
- `reused`: existing ground/air guard timer consumers.
- `omitted`: exact common-state choreography, rollback, and netplay.

## Acceptance fixture

- Compile all three static values independently.
- Resolve bounded dynamic root/helper values.
- Mutate only selected live Projectiles and preserve omitted/unmatched state.
- Prove later ground and air guard contacts consume the changed timers.

## Claim ceiling

Do not claim complete guard common-state timing, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Verification

- Five focused files: 570 passing; the same 19 inherited PlayableMatchRuntime
  failures remain outside this slice.
- Isolated root, Helper, and ground/air guard cases pass.
- Typecheck passes.
