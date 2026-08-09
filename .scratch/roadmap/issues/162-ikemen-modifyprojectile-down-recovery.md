# Issue 162 — Ikemen ModifyProjectile down recovery

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile `down.recover` and `down.recovertime` mutations with the
existing Projectile fall and get-up runtime.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates `down.recover` as a
boolean and `down.recovertime` as an integer, then replaces both fields on every
selected live Projectile HitDef.

## Acceptance fixture

- Compile static values into the typed ModifyProjectile operation.
- Resolve bounded dynamic root/helper values through the typed seam.
- Prove later Projectile contact carries the changed values into target fall
  metadata used by the existing get-up path.
- Keep omitted fields, guard contact, and unrelated fall metadata unchanged.

## Claim ceiling

Do not claim full Common1 get-up choreography, every recovery input route,
exact tick order, rollback/netplay serialization, or full ModifyProjectile
parity.

## Closure evidence

- Static and bounded dynamic root/helper values replace both fields on selected
  live Projectile fall metadata.
- Later accepted hit contact carries the changed values into target hit-fall
  metadata consumed by the existing get-up path; guard and omitted routes stay
  unchanged.
- Four core files / 253 tests and focused root/helper runtime cases pass.
- Typecheck, production build, boundaries, redirected dispatch boundaries,
  diff hygiene, and 686/686 trace artifacts pass.
- The latest full-suite baseline remains the T587 result: 13 failed files / 58
  inherited failures and 3395/3453 tests passing.
