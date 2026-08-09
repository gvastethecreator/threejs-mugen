# Issue 135 — Ikemen ModifyProjectile selection

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile selection and ID mutation with pinned Ikemen source:
`id` filters active owned Projectiles, `index` selects one oldest-first match,
and `projid` mutates the selected Projectile ID.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles separate `id` and `index`
selector fields before the shared Projectile parameter block. Runtime
`getMultipleProjs(id,index)` filters active owner Projectiles in insertion
order; negative `id` accepts all and negative `index` returns all matches.
Within the mutation block, `projid` replaces each selected Projectile ID.

## Acceptance fixture

- Compile static `id`, `index`, and `projid` into distinct typed fields.
- Resolve dynamic selector/mutation values through the existing bounded
  ModifyProjectile expression resolver.
- Select active matches oldest-first; explicit non-negative index mutates only
  one match, while negative/omitted index mutates all matches.
- Keep removed and terminal Projectiles excluded and preserve helper ownership
  filtering.

## Claim ceiling

Do not claim exact redirected localcoord scaling, team/simul namespaces,
arbitrary helper ownership, warning text, controller parameter evaluation
order, rollback/netplay serialization, or complete ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Separate `id`, `index`, and `projid` roles; negative selector defaults; active-projectile filtering; oldest-first insertion-order selection. |
| Adapted | The local effect store keeps newest-first arrays, so the selector boundary reverses active matches before applying `index`. |
| Replaced | Ikemen's no-match warning/console path returns a zero mutation count through the local typed dispatch boundary. |
| Omitted | Exact controller-parameter evaluation order, rollback serialization, warning text, and full helper/team namespaces. |
| Local extension | Typed operation/resolver fields keep static and dynamic selector values separate and preserve existing RedirectID dispatch. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, EffectActorSystem, and EffectSpawnSystem:
  4 files / 190 tests pass.
- PlayableMatchRuntime focused `ModifyProjectile` gate: 3 tests pass.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
  `pnpm check:redirect-boundary` pass.
- `pnpm qa:trace` passes 686/686 artifacts (652 required, 34 optional).
- The full suite retains the inherited 13 failed files / 58 failures with
  3381/3439 tests passing; the failures remain in retired-roster, Studio,
  movement-delta, stale-log-label, and Tag-member baselines.
