# Issue 203 — Dynamic HitDef givepower expressions

- Status: `closed-bounded`
- Lane: `R2 HitDef compiler/runtime semantics`
- Priority: `P1`

## Objective

Compile and resolve one- or two-component dynamic `givepower` expressions in
the caller context for fresh HitDef and Projectile payloads and supported
Ikemen mutations. Preserve each controller's official one-value behavior.

## Source gate

Pinned Ikemen GO commit `149402f` compiles `givepower` as one or two integer
expressions through the shared HitDef block. Fresh HitDef and Projectile
finalization derives guard power from half the hit value. `ModifyHitDef`
changes only supplied live components. `ModifyProjectile` resolves once and
uses zero for its omitted second component.

Source symbols:

- `src/compiler_functions.go:1706-1812`, `2275-2293`, `2363`, `2480-2483`,
  and `2558-2575`
- `src/bytecode.go:7606-7610`, `7938-7969`, `8070-8095`, `8305`,
  `8338-8355`, and `8895-8904`
- M.U.G.E.N 1.1 `sctrl.hitdef.html:236-237` and
  `sctrl.projectile.html:323-324`

## Port ledger

| Route | One-value behavior |
| --- | --- |
| Fresh HitDef | derive guard as half of resolved hit |
| Fresh Projectile | derive guard as half of resolved hit |
| ModifyHitDef | replace hit and preserve live guard |
| ModifyProjectile | replace hit and write guard as zero |

## Acceptance fixture

- Compile valid and malformed dynamic pairs for HitDef, ModifyHitDef, and
  Projectile.
- Resolve root and Helper fresh values in the caller context.
- Prove redirected root `ModifyHitDef` reads caller variables and preserves an
  omitted live guard value.
- Prove dynamic one-value `ModifyProjectile` keeps its zero guard rule.
- Add one required imported dynamic `givepower` trace with defender power and
  `GetHitVar(power)` evidence.

## Claim ceiling

Do not claim complete numeric grammar, exact overflow or `IErr` clamping,
Helper-owned `ModifyHitDef`, `ModifyProjectile getpower`, ReversalDef,
power-owner/team topology, exact deferred-frame power timing, rollback,
global `data/mugen.cfg`, or full HitDef parity.

## Closeout evidence

- Compiler/HitDef and Projectile/Helper focused suites: 322/322.
- Root redirected `ModifyHitDef`, root `ModifyProjectile`, and required trace
  integrations pass.
- Full suite: 3513/3571 with the same 58 inherited retired-roster failures.
- Production build: 362 modules.
- Required trace corpus: 701/701 (667 required, 34 optional).
- `synthetic-imported-hitdef-dynamic-givepower`: checksum `37f80f37`, final
  checksum `9da06f48`, defender power 22, and `GetHitVar(power) = 22` branch.
- Typecheck, boundary, redirect-boundary, and diff-hygiene gates pass.
