# Issue 216 — HitDef dynamic sprite priorities

- Status: `closed-bounded`
- Lane: `R1 contact and presentation precision`
- Priority: `P1`

## Objective

Resolve direct HitDef `p1sprpriority` / `p2sprpriority` and the legacy
`sprpriority` alias in root and Helper caller contexts. Support root or
redirected `ModifyHitDef` replacement before accepted hit or guard contact
reaches the existing sprite-priority system.

## Source gate

M.U.G.E.N 1.1 documents integer P1/P2 drawing priorities with defaults `1`
and `0`. Pinned Ikemen GO compiles the fields as caller-context integers,
accepts `sprpriority` as the P1 alias, and applies direct-contact priorities.
`ModifyHitDef` reuses the live HitDef evaluator.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:149-153`
- pinned Ikemen `compiler_functions.go:1881-1895`
- pinned Ikemen `bytecode.go:7643-7646`
- pinned Ikemen direct-contact consumer `char.go:10900-10903`

## Acceptance fixture

- Compile finite dynamic P1/P2 priorities and the P1 alias.
- Resolve root and Helper caller expressions.
- Replace live values through root or redirected `ModifyHitDef`.
- Prove accepted direct hit and guard presentation priorities in one required
  imported trace plus focused tests.

## Claim ceiling

Do not claim Projectile P1 priority, ModifyProjectile P1 priority, ReversalDef
or ModifyReversalDef dynamic values, exact render sorting across Explods or
Projectiles, Helper-owned `ModifyHitDef`, teams, rollback, or full presentation
parity.

## Closure evidence

- Fresh root and Helper HitDef expressions resolve from caller vars, including
  the legacy `sprpriority` alias.
- Root or redirected `ModifyHitDef` replaces both live values; existing direct
  hit and guard contact paths apply the resolved priorities with authored
  provenance.
- Focused coverage passes 195 tests. Typecheck, 363-module build, boundaries,
  redirect boundary, and 714/714 traces pass.
- Required `synthetic-imported-hitdef-dynamic-sprite-priority` trace checksum
  is `19e6c03b`; final checksum is `2d18f025`.
- Full suite passes 3557/3615. The 58 failures remain inherited removed
  Nova/Mira/Rook fixture and old roster expectation failures.
