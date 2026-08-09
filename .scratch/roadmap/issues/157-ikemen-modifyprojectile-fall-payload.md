# Issue 157 — Ikemen ModifyProjectile fall payload

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile `fall.damage`, `fall.xvelocity`, `fall.yvelocity`,
`fall.zvelocity`, `fall.recover`, and `fall.recovertime` with the existing
Projectile fall-contact payload.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates these shared HitDef
fields and replaces each value on every selected live Projectile. Later
accepted hit contact copies the changed fall payload into the target get-hit
variables. Guard contact does not install the hit fall payload.

## Acceptance fixture

- Compile static ModifyProjectile fall-payload values.
- Retain bounded dynamic root/helper values.
- Prove later hit contact consumes changed damage, X/Y/Z velocity, recovery,
  and recovery time.
- Keep guard contact and omitted values unchanged.

## Claim ceiling

Do not claim full Common1 fall physics, bounce/recovery input timing, every
remaining fall/envshake field, exact tick order, rollback/netplay
serialization, or full ModifyProjectile parity.

## Closure evidence

- Static and bounded dynamic values replace fall damage, X/Y/Z velocity,
  recovery, and recovery time on selected active Projectiles.
- The typed resolver keeps float values fractional on root and helper paths.
- Later accepted hit contact consumes the changed payload; guard and omitted
  routes remain unchanged.
- Four core files / 250 tests plus the focused root runtime case pass.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, `git diff --check`, and `pnpm qa:trace` pass.
  Trace coverage is 686/686 (652 required, 34 optional).
- The full suite retains 13 failed files / 58 inherited failures with
  3392/3450 tests passing.
