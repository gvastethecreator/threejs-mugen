# Issue 171 — Ikemen ModifyProjectile fall flags

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port ModifyProjectile `fall`, `air.fall`, and `down.bounce` mutation through
the existing Projectile fall-contact consumer.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates each field as a boolean
and replaces `ground_fall`, `air_fall`, or `down_bounce` on every selected live
Projectile HitDef.

## Port ledger

- `adapted`: `src/bytecode.go`, `hitDef_fall`, `hitDef_air_fall`, and
  `hitDef_down_bounce` in ModifyProjectile.
- `local extension`: typed static operation and bounded root/Helper expression
  resolution.
- `reused`: existing Projectile fall and lying-bounce contact metadata.
- `omitted`: exact common-state choreography, rollback, and netplay.

## Acceptance fixture

- Compile and apply static booleans only to selected live Projectiles.
- Resolve bounded dynamic root/helper boolean values.
- Prove later grounded, airborne, and lying-state contacts consume the changed
  fall flags.
- Preserve omitted fields and unmatched Projectiles.

## Claim ceiling

Do not claim complete fall/get-up common-state choreography, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Verification

- Five focused files: 574 passing tests plus the same 19 inherited
  `PlayableMatchRuntime` failures.
- Isolated root/helper and two contact-consumer cases pass.
- Full suite: 3406/3464 pass; the same 58 inherited failures remain.
- Typecheck/build, 686/686 traces, boundaries, and redirect-boundary pass.
