# Issue 159 — Ikemen ModifyProjectile point metadata

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile `dizzypoints` and `guardpoints` with current Projectile
contact and `GetHitVar` metadata.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates both shared HitDef
integers and replaces them on every selected live Projectile. Later hit or
guard contact exposes the changed authored values through get-hit metadata.

## Acceptance fixture

- Compile static ModifyProjectile values.
- Retain bounded dynamic root/helper values.
- Prove later hit and guard contact expose the changed `GetHitVar` values.
- Keep omitted values unchanged and separate from current dizzy/guard pools.

## Claim ceiling

Do not claim dizzy/guard resource drain, score adjudication, red-life mutation,
exact Ikemen integer sentinels, exact tick order, rollback/netplay
serialization, or full ModifyProjectile parity.

## Closure evidence

- Static and bounded dynamic values replace both authored point fields.
- Root and helper-parented paths share the typed resolver boundary.
- Later hit and guard contacts expose changed `GetHitVar` values while current
  dizzy and guard pools remain unchanged.
- Four core files / 251 tests plus the focused root runtime case pass.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, `git diff --check`, and `pnpm qa:trace` pass.
  Trace coverage is 686/686 (652 required, 34 optional).
- The full suite retains 13 failed files / 58 inherited failures with
  3393/3451 tests passing.
