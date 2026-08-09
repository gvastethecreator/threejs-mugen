# Issue 199 — HitDef attacker facing

- Status: `closed-bounded`
- Lane: `R2 HitDef compiler/runtime semantics`
- Priority: `P1`

## Objective

Port direct-HitDef `p1facing` and `p1getp2facing` through normal HitDef
creation, live `ModifyHitDef` mutation, accepted contact, and attacker-facing
state.

## Source gate

The official M.U.G.E.N controller reference says `p1facing = -1` turns P1
after a successful hit. `p1getp2facing = 1|-1` derives P1 facing from P2 and
takes precedence over `p1facing`.

Pinned Ikemen GO `develop` commit `149402f` compiles both fields as one integer
expression, evaluates them on the active HitDef, selects the effective facing
only for successful non-Projectile contact, and applies the pending attacker
facing during fighter update. `ModifyHitDef` reuses the same HitDef mutation.
The pinned `ModifyProjectile` path explicitly leaves both parameters disabled.

Source symbols:

- M.U.G.E.N `mugendocs/sctrls.html`: HitDef `p1facing` and `p1getp2facing`
- `src/compiler_functions.go:1965-1971`
- `src/bytecode.go:7682-7685`, `8338-8355`, and `9076-9078`
- `src/char.go:10906-10920`, `11526-11531`, and `11926-11927`

## Port ledger

| Item | Decision |
| --- | --- |
| Typed HitDef IR | retain static or dynamic integer expressions |
| Fresh HitDef | reset both fields to no-change defaults |
| Root and Helper dispatch | resolve in the active caller context |
| ModifyHitDef | replace only supplied finite values on an active HitDef |
| Contact | apply only on accepted unguarded direct contact |
| Precedence | nonzero `p1getp2facing` wins over `p1facing` |
| Projectile | keep unsupported because the pinned engine disables it |

## Acceptance fixture

- Prove typed IR accepts static/dynamic values and rejects malformed input.
- Prove root, Helper, and redirected `ModifyHitDef` resolution and fresh reset.
- Prove `p1getp2facing` precedence and positive/negative selection.
- Prove guard and Projectile contact do not turn the attacker.
- Add one required imported trace with facing evidence.

## Claim ceiling

Do not claim Projectile or ModifyProjectile facing, ReversalDef or
ModifyReversalDef facing, exact deferred tick synchronization, complete
back-hit animation/velocity inversion, team topology, rollback, or full
HitDef parity.

## Closeout evidence

- Focused compiler/HitDef/direct-contact/Helper coverage: 234/234.
- Real root `ModifyHitDef RedirectID` consumer: 1/1.
- Full suite: 3494/3552 with the same 58 inherited retired character-package
  failures.
- Typecheck, 361-module build, 698/698 traces, boundaries,
  redirect-boundary, and diff hygiene pass.
- Required trace: `synthetic-imported-hitdef-attacker-facing`, checksum
  `65949aa4`, final-frame checksum `5bb54e40`.
- Next cut: issue 200 / T626, explicit HitDef attacker `getpower`.
