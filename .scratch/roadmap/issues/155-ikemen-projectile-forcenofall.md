# Issue 155 — Ikemen Projectile forcenofall

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align Projectile and ModifyProjectile HitDef `forcenofall` with the current
fall-contact seam.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` stores `forcenofall` in HitDef,
copies it into Projectile HitDef data, and replaces it through
ModifyProjectile's shared HitDef switch. On accepted hit, an enabled value
clears the target fall flag.

## Acceptance fixture

- Compile static Projectile spawn and ModifyProjectile mutation values.
- Retain bounded dynamic root/helper mutation values.
- Prove a later hit suppresses current Projectile fall metadata.
- Keep guarded contact and omitted values unchanged.

## Claim ceiling

Do not claim complete get-hit state selection, every fall/bounce interaction,
exact tick order, rollback/netplay serialization, or full ModifyProjectile
parity.

## Closure evidence

- Typed Projectile spawn and ModifyProjectile mutation retain static values.
- Root and helper-parented dynamic expressions mutate the selected Projectile.
- Accepted hit contact clears only the target fall flag and keeps the current
  fall payload; guard contact and omitted values remain unchanged.
- Four core files / 249 tests pass, plus the focused dynamic root runtime case.
  The broad five-file slice keeps 19 inherited PlayableMatchRuntime failures
  and passes 559/578 tests.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, and `pnpm qa:trace` pass. Trace coverage is
  686/686 (652 required, 34 optional).
