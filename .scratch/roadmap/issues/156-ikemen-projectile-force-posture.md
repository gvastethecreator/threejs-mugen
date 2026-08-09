# Issue 156 — Ikemen Projectile forced hit posture

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align Projectile and ModifyProjectile HitDef `forcestand` and `forcecrouch`
with the current default get-hit state seam.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` parses both values as HitDef
booleans, stores them on Projectile HitDef data, and replaces them through
ModifyProjectile. On accepted non-guard contact, `forcestand` changes a
crouching target to standing before Common get-hit selection, while
`forcecrouch` changes a standing target to crouching. Guard contact does not
copy these fields into get-hit state.

## Acceptance fixture

- Compile static Projectile spawn and ModifyProjectile mutation values.
- Retain bounded dynamic root/helper mutation values.
- Prove crouch-to-stand and stand-to-crouch default get-hit selection.
- Keep airborne, guarded, custom-state, and omitted-value routes unchanged.

## Claim ceiling

Do not claim every Common1 state transition, exact Ikemen integer sentinel
defaults, simultaneous contradictory flags, exact tick order,
rollback/netplay serialization, or full ModifyProjectile parity.

## Closure evidence

- Typed Projectile spawn and ModifyProjectile mutation retain both static
  booleans.
- Root and helper-parented dynamic expressions mutate the selected Projectile.
- Accepted default get-hit selection maps forced crouch-to-stand to state 5000
  and stand-to-crouch to state 5010.
- Airborne, guarded, custom P2 state, and omitted-value paths remain unchanged.
- Five core files / 299 tests plus the focused root runtime case pass.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, and `pnpm qa:trace` pass. Trace coverage is
  686/686 (652 required, 34 optional).
