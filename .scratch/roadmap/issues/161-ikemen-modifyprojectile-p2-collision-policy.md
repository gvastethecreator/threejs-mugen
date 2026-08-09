# Issue 161 — Ikemen ModifyProjectile P2 collision policy

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile `p2clsncheck` and `p2clsnrequire` mutations with the
existing Projectile contact-admission seam.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles both parameters through
`paramClsnType`, which accepts only the static names none/Clsn1/Clsn2/size.
ModifyProjectile then replaces both fields on each selected live Projectile.

## Acceptance fixture

- Compile supported static collision policies into typed ModifyProjectile ops.
- Prove root and helper-parented static values share the typed mutation seam.
- Prove a later contact uses the changed check/require policy.
- Fail closed for invalid or expression-shaped enum values.
- Keep omitted values and unrelated Projectile collision fields unchanged.

## Claim ceiling

Do not claim exact Ikemen integer sentinels, collision-mask internals, dynamic
enum support, exact tick order, rollback/netplay serialization, or full
ModifyProjectile parity.

## Closure evidence

- Static official collision names compile into typed ModifyProjectile fields;
  invalid or expression-shaped names fail closed.
- Root and helper-owned selected Projectiles retain the changed check and
  requirement policies; omitted values remain unchanged.
- Later contact admission consumes both changed fields.
- Four core files / 253 tests and focused root/helper runtime cases pass.
- Typecheck, production build, boundaries, redirected dispatch boundaries,
  diff hygiene, and 686/686 trace artifacts pass.
- The full suite remains at the inherited 13 failed files / 58 failures, with
  3395/3453 tests passing.
