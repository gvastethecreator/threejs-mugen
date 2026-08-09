# Issue 178 — Ikemen ModifyProjectile spark payload

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port the selected live Projectile spark payload used by Ikemen GO:
`sparkno`, `sparkangle`, `guard.sparkno`, `guard.sparkangle`, and `sparkxy`.
Later hit and guard presentation must consume the changed payload.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles hit and guard spark
references, one hit angle, one guard angle, and a one- or two-value offset.
`ModifyProjectile` replaces each field on every selected live Projectile. A
missing second `sparkxy` value becomes zero.

Source symbols:

- `src/compiler_functions.go`: `projectileSub`
- `src/bytecode.go`: `hitDef_sparkno`, `hitDef_sparkangle`,
  `hitDef_guard_sparkno`, `hitDef_guard_sparkangle`, and `hitDef_sparkxy`
- `src/char.go`: Projectile contact spark presentation

## Port ledger

| Item | Decision |
| --- | --- |
| Hit and guard spark reference replacement | copy through current string refs |
| Hit and guard spark angle replacement | copy |
| One- or two-value `sparkxy` replacement | copy |
| Omitted second offset becomes zero | copy |
| Selected live Projectile mutation | copy |
| Later hit/guard VFX event consumption | adapt to current presentation event |
| `cornerpush.veloff` family | omit because Ikemen ModifyProjectile cases are commented out |

## Acceptance fixture

- Compile static spark refs, angles, and one-/two-value offsets.
- Resolve bounded dynamic root and helper numeric fields.
- Mutate only selected live Projectiles.
- Prove later hit and guard events use the changed reference, angle, and
  offset.

## Claim ceiling

Do not claim exact localcoord scaling, dynamic string-prefix parity, renderer
rotation, corner-push mutation, exact contact tick order, rollback
serialization, or full Projectile parity.

## Verification

- Focused compiler, Projectile, and contact-presentation coverage: `133/133`.
- Isolated Playable root and Helper controller coverage: `1/1` each.
- Full suite: `3429/3487`; the same 58 inherited roster-reset failures remain.
- `pnpm typecheck`, `pnpm build`, `pnpm qa:trace` (`686/686`), boundaries,
  redirect-boundary, and `git diff --check` pass.
