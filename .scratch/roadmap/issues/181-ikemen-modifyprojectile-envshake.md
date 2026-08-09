# Issue 181 — Ikemen ModifyProjectile contact EnvShake

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port selected live Projectile `envshake.time`, `envshake.freq`,
`envshake.ampl`, `envshake.phase`, `envshake.mul`, and `envshake.dir` HitDef
metadata. A later accepted hit or guard contact must emit the changed camera
shake payload.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles these fields in
`projectileSub`. `ModifyProjectile` resolves each value once and replaces the
same HitDef field on every selected live Projectile. Accepted contact starts a
global EnvShake only when `envshake.time > 0`.

Source symbols:

- `src/compiler_functions.go`: `projectileSub`
- `src/bytecode.go`: `hitDef_envshake_*` ModifyProjectile cases
- `src/char.go`: accepted-contact EnvShake application

## Port ledger

| Item | Decision |
| --- | --- |
| Static spawn and ModifyProjectile fields | copy |
| Bounded dynamic root/helper expressions | copy |
| Non-negative `freq` | copy |
| Accepted hit/guard event emission | adapt to current typed EnvShake world |
| `mul` and `dir` camera projection | adapt to current deterministic waveform |
| `diradd` and `decay` | omit; pinned contact resets them to `0` and `1` |

## Acceptance fixture

- Compile the six static fields.
- Resolve the six bounded dynamic root and helper fields.
- Mutate only selected live Projectiles.
- Prove hit and guard contact emit the changed payload.
- Prove `mul` and `dir` affect the deterministic camera projection.

## Claim ceiling

Do not claim exact Ikemen phase defaults, localcoord amplitude scaling, exact
waveform or tick order, pause/stage/layer interaction, rollback serialization,
`diradd`, `decay`, or full Projectile parity.

## Verification

- Focused compiler, Projectile, combat, EnvShake, and bridge coverage:
  `285/285`.
- Isolated root dynamic consumer: `1/1`.
- Isolated helper Parent/Root redirect consumer: `1/1`.
- Full suite: `3436/3494`; the same 58 roster-reset failures remain inherited.
- Typecheck, build, `686/686` traces, boundaries, redirect-boundary, and diff
  hygiene pass.
