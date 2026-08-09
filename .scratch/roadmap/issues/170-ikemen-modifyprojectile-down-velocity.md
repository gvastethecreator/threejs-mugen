# Issue 170 — Ikemen ModifyProjectile down velocity

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port ModifyProjectile `down.velocity` mutation through the existing lying-hit
Projectile velocity consumer.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates one to three floating
values and replaces the available X/Y/Z `down.velocity` fields on every
selected live Projectile HitDef.

## Port ledger

- `adapted`: `src/bytecode.go`, `hitDef_down_velocity` in ModifyProjectile.
- `local extension`: typed static operation and bounded root/Helper expression
  resolution.
- `reused`: existing Projectile lying-hit velocity resolution.
- `omitted`: exact common-state choreography, rollback, and netplay.

## Acceptance fixture

- Compile one-, two-, and three-component static values; omitted components
  write zero like the pinned switch.
- Resolve bounded dynamic root/helper values with fractional fidelity.
- Mutate only selected live Projectiles and preserve unmatched Projectiles.
- Prove later lying-state hit contact consumes the changed velocity.

## Claim ceiling

Do not claim complete lying/get-up common-state motion, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Verification

- Five focused files: 573 passing tests plus the same 19 inherited
  `PlayableMatchRuntime` failures.
- Isolated root, helper, and lying-contact cases pass.
- Full suite: 3405/3463 pass; the same 58 inherited failures remain.
- Typecheck/build, 686/686 traces, boundaries, and redirect-boundary pass.
