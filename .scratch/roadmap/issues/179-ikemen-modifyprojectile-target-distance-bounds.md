# Issue 179 — Ikemen ModifyProjectile target distance bounds

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port selected live Projectile `mindist` and `maxdist` X/Y/Z bounds. Later
accepted hit and guard contact must clamp the defender against the changed
bounds from the Projectile origin.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles each field as one to three
floats. `ModifyProjectile` resolves the values once, writes every selected
Projectile, and gives omitted Y/Z components a zero value. Contact evaluates X
against Projectile facing and evaluates Y/Z against the Projectile origin.

Source symbols:

- `src/compiler_functions.go`: `projectileSub`
- `src/bytecode.go`: `hitDef_mindist` and `hitDef_maxdist`
- `src/char.go`: `Char.hit` MinDist/MaxDist contact correction

## Port ledger

| Item | Decision |
| --- | --- |
| One- to three-value `mindist` | copy with zero defaults |
| One- to three-value `maxdist` | copy with zero defaults |
| Selected live Projectile mutation | copy |
| X clamp follows Projectile facing | copy |
| Y/Z clamp follows Projectile origin | adapt to current coordinates |
| Guard and hit contact consumer | copy bounded behavior |
| Localcoord scaling | omit for this slice |
| `snap` and `snaptime` | defer to a separate task |

## Acceptance fixture

- Compile one-, two-, and three-value static bounds.
- Resolve bounded dynamic root and helper bounds.
- Mutate only selected live Projectiles.
- Prove later hit and guard contacts clamp the defender using changed X/Y/Z
  bounds from the Projectile origin.

## Claim ceiling

Do not claim exact localcoord scaling, `snap`, `snaptime`, target binding,
exact contact tick order, rollback serialization, or full Projectile parity.

## Verification

- Focused compiler, Projectile, and Projectile-contact coverage: `220/220`.
- Isolated Playable root and Helper controller coverage: `1/1` each.
- Full suite: `3432/3490`; the same 58 inherited roster-reset failures remain.
- `pnpm typecheck`, `pnpm build`, `pnpm qa:trace` (`686/686`), boundaries,
  redirect-boundary, and `git diff --check` pass.
