# Issue 163 — Ikemen ModifyProjectile attack depth

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile `attack.depth` mutation with the existing Projectile
depth-contact admission seam.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates one or two floating-point
values. Two values replace both depth bounds on each selected live Projectile
HitDef. If the second value is absent, ModifyProjectile writes `0`. This differs
from normal HitDef, which copies one value to both bounds.

## Port ledger

- `adapted`: `src/bytecode.go`, `hitDef_attack_depth` in ModifyProjectile.
- `local extension`: typed operation and bounded root/Helper expression paths.
- `reused`: the existing Projectile depth-contact admission system.
- `omitted`: full 3D transforms, camera parity, rollback, and netplay state.

## Acceptance fixture

- Compile one- and two-value static attack-depth pairs. One value uses a zero
  second bound.
- Resolve bounded dynamic root/helper pairs with fractional fidelity.
- Prove later depth contact admission consumes the changed pair.
- Keep omitted values and unrelated Projectile depth state unchanged.

## Claim ceiling

Do not claim full 3D collision parity, every local-coordinate/camera transform,
exact tick order, rollback/netplay serialization, or full ModifyProjectile
parity.

## Verification

- Focused compiler/projectile/helper/contact coverage: `256/256` passing.
- Full suite: `3398/3456` passing with the same 58 inherited failures.
- Typecheck, build, `686/686` traces, boundaries, and redirect-boundary gates
  pass.
