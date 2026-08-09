# Issue 160 — Ikemen ModifyProjectile red-life and score pairs

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile `redlife` and `score` hit/guard pairs with Projectile
contact and `GetHitVar` metadata.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates each field as a pair.
The first value replaces hit metadata and an authored second value replaces
guard metadata on every selected live Projectile. Later contact exposes the
effective hit or guard value.

## Acceptance fixture

- Compile one- and two-value static mutations with official zero second-value
  defaults.
- Retain bounded dynamic root/helper pairs with float fidelity for score.
- Prove hit and guard contacts expose their respective red-life and score
  values.
- Keep current red-life/score resources and omitted values unchanged.

## Claim ceiling

Do not claim red-life resource application, match score adjudication, exact
Ikemen integer sentinels, team score sharing, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Closure evidence

- Projectile and ModifyProjectile compile one- or two-value typed pairs; one
  value uses the official zero guard default.
- Static and bounded dynamic root/helper pairs preserve fractional score
  values, including `Parent`/`Root` redirects.
- Later hit and guard contacts expose the effective `redlife` and `score`
  through the existing last-hit metadata without changing current resources.
- Four core files / 252 tests and focused root/helper runtime cases pass.
- Typecheck, production build, boundaries, redirected dispatch boundaries,
  diff hygiene, and 686/686 trace artifacts pass.
- The full suite remains at the inherited 13 failed files / 58 failures, with
  3394/3452 tests passing.
