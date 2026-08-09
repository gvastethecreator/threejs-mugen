# Issue 198 — HitDef spark scale

- Status: `closed-bounded`
- Lane: `R2 HitDef compiler/runtime semantics`
- Priority: `P1`

## Objective

Port `sparkscale` and `guard.sparkscale` through normal HitDef and Projectile
creation, live `ModifyHitDef` mutation, accepted contact, and spark rendering.

## Source gate

The official M.U.G.E.N HitDef reference does not define either field. Pinned
Ikemen GO `develop` commit `149402f` compiles both fields through the
shared HitDef parameter table as one- or two-component float values. A fresh
HitDef starts with `[1, 1]` for both pairs. Evaluation replaces only supplied
components, and hit or guard presentation consumes the selected pair.

Source symbols:

- `src/compiler_functions.go`: `sparkscale` and `guard.sparkscale`
- `src/bytecode.go`: component-by-component evaluation in `hitDef.runSub`
- `src/char.go`: `[1, 1]` defaults and hit/guard spark presentation

## Port ledger

| Item | Decision |
| --- | --- |
| Typed HitDef IR | retain one or two static/dynamic float expressions |
| Fresh HitDef or Projectile | start omitted components at `1` |
| Root and Helper dispatch | resolve expressions in the active caller context |
| ModifyHitDef | replace only supplied finite components on the active HitDef |
| Contact | select normal or guard pair after accepted contact |
| Presentation | compose non-uniform X/Y scale with the existing spark size |
| Invalid or unresolved | preserve the current/default component |

## Acceptance fixture

- Prove typed IR accepts one/two static or dynamic components and rejects more.
- Prove root, Helper, Projectile, and redirected `ModifyHitDef` resolution.
- Prove one-component values preserve/default the second component.
- Prove hit and guard events select different scale pairs.
- Prove the renderer applies independent X and Y scale without changing size.

## Claim ceiling

Do not claim `ModifyProjectile` spark-scale mutation, Projectile HitOverride
presentation, exact localcoord scaling, rollback, or full hit-effect parity.

## Closeout evidence

- Focused compiler/runtime/contact/snapshot/trace/renderer coverage:
  1003/1003.
- Real root `ModifyHitDef RedirectID` consumer: 1/1.
- Full suite: 3488/3546 with the same 58 inherited retired character-package
  failures.
- Typecheck, 361-module build, 697/697 traces, boundaries,
  redirect-boundary, and diff hygiene pass.
- Required trace: `synthetic-imported-projectile-spark-scale`, checksum
  `95d51442`, final-frame checksum `221c7660`.
- Next cut: issue 199 / T625, direct-HitDef attacker facing.
