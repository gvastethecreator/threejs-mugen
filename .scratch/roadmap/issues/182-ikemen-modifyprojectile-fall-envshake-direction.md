# Issue 182 — Ikemen ModifyProjectile fall EnvShake direction

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port selected live Projectile `fall.envshake.dir` HitDef metadata. Later
accepted hit contact must store the changed value for
`GetHitVar(fall.envshake.dir)` and a later `FallEnvShake` controller must emit
the same camera direction.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles `fall.envshake.dir` as a
float expression. `ModifyProjectile` replaces the field on selected live
Projectiles. Accepted contact copies `fall_envshake_dir` into the target get-hit
variables, and `FallEnvShake` copies it into the global shake state.

Source symbols:

- `src/compiler_functions.go`: `projectileSub`
- `src/bytecode.go`: `hitDef_fall_envshake_dir` and `fallEnvShake.Run`
- `src/char.go`: direct and Projectile get-hit metadata copies

## Port ledger

| Item | Decision |
| --- | --- |
| Static spawn and ModifyProjectile field | copy |
| Bounded dynamic root/helper expression | copy |
| Accepted-hit GetHitVar storage | adapt to current typed hit-fall metadata |
| FallEnvShake event direction | adapt to current deterministic projection |
| `fall.envshake.diradd` and `fall.envshake.decay` | omit; pinned contact does not copy them to the getter |

## Acceptance fixture

- Compile static Projectile and ModifyProjectile direction.
- Resolve bounded dynamic root and helper direction.
- Mutate only selected live Projectiles.
- Prove accepted hit stores the changed direction.
- Prove `GetHitVar` reads it and `FallEnvShake` emits it.

## Claim ceiling

Do not claim localcoord amplitude scaling, exact waveform or tick order,
pause/stage/layer interaction, rollback serialization, `diradd`, `decay`, or
full fall/Projectile parity.

## Closure evidence

- Static and bounded dynamic root/helper Projectile and ModifyProjectile
  direction coverage passes.
- Accepted Projectile and direct HitDef contacts retain direction for
  `GetHitVar`; imported definitions preserve the same field.
- `FallEnvShake` events and runtime trace summaries retain direction.
- Focused coverage: 350/350.
- Full suite: 3436/3494 with the same 58 inherited roster-reset failures.
- Typecheck, build, 686/686 trace artifacts, boundaries, redirected-target
  boundary, and diff hygiene pass.
