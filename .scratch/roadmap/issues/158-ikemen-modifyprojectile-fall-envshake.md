# Issue 158 — Ikemen ModifyProjectile fall envshake

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align supported ModifyProjectile `fall.envshake.time`, `freq`, `ampl`, `phase`,
and `mul` fields with the existing Projectile fall-contact metadata.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates and replaces each fall
envshake field on selected live Projectiles. Frequency is clamped to zero or
above. Later accepted hit contact copies the changed fall envshake payload into
the target get-hit variables.

## Acceptance fixture

- Compile static ModifyProjectile fall-envshake values.
- Retain bounded dynamic root/helper values with float fidelity.
- Prove later hit contact consumes the changed envshake payload.
- Clamp negative frequency and keep guard/omitted routes unchanged.

## Claim ceiling

Do not claim `dir`, `diradd`, or `decay`, actual camera shake playback, exact
localcoord amplitude conversion, exact tick order, rollback/netplay
serialization, or full ModifyProjectile parity.

## Closure evidence

- Static and bounded dynamic values replace supported fall envshake metadata.
- Root and helper dynamic floats preserve fractions; negative frequency clamps
  to zero.
- Later accepted hit contact consumes the changed metadata; guard and omitted
  paths remain unchanged.
- Four core files / 250 tests plus the focused root runtime case pass.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, `git diff --check`, and `pnpm qa:trace` pass.
  Trace coverage is 686/686 (652 required, 34 optional).
- The latest full-suite baseline remains 3392/3450 with 58 inherited failures.
