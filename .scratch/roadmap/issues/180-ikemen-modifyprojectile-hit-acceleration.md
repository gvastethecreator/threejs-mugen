# Issue 180 — Ikemen ModifyProjectile hit acceleration

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port selected live Projectile `xaccel`, `yaccel`, and `zaccel` HitDef metadata.
Later accepted contact must expose the changed values through
`GetHitVar(xaccel)`, `GetHitVar(yaccel)`, and `GetHitVar(zaccel)`.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles the three fields as float
expressions. `ModifyProjectile` resolves each value once and replaces the same
field on every selected live Projectile. Contact copies the resulting HitDef
metadata into the target get-hit variables.

Source symbols:

- `src/compiler_functions.go`: `projectileSub`
- `src/bytecode.go`: `hitDef_xaccel`, `hitDef_yaccel`, and `hitDef_zaccel`
- `src/char.go`: Projectile contact get-hit metadata

## Port ledger

| Item | Decision |
| --- | --- |
| Static float compilation | copy |
| Bounded dynamic root/helper expressions | copy |
| Selected live Projectile mutation | copy |
| Later accepted-contact GetHitVar reads | adapt to current typed hit vars |

## Acceptance fixture

- Compile all three static fields.
- Resolve bounded dynamic root and helper fields.
- Mutate only selected live Projectiles.
- Prove later contact exposes all three changed values through GetHitVar.

## Claim ceiling

Do not claim integration into velocity formulas, localcoord scaling, exact
contact tick order, rollback serialization, or full Projectile parity.

## Verification

- Focused compiler, Projectile, and Projectile combat coverage: `221/221`.
- Isolated root dynamic consumer: `1/1`.
- Isolated helper Parent/Root redirect consumer: `1/1`.
- Full suite: `3433/3491`; the same 58 roster-reset failures remain inherited.
- `pnpm typecheck`, `pnpm build`, `pnpm qa:trace` (`686/686`), boundary,
  redirect-boundary, and `git diff --check` gates pass.
