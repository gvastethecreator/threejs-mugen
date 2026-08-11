# Issue 316 — Fresh dynamic `HitDef snap` X/Y offsets

Status: closed-bounded (T742, 2026-08-11)

## Scope

Close the fresh direct `HitDef snap` X/Y expression seam for root and Helper
caller contexts. A finite one-component expression resolves X and leaves Y
omitted; a finite pair resolves X/Y independently. Fresh activation does not
inherit stale snap offsets from the previous move. The accepted contact stores
the values in `GetHitVar(xoff/yoff/zoff)` and applies the bounded X/Y position
offset to the defender.

## Source authority

- Ikemen GO pin `149402f`: `compiler_functions.go` compiles `snap` as a
  caller-evaluated float parameter; `bytecode.go` evaluates the authored
  components before contact; `char.go` applies the snap and exposes xoff/yoff/
  zoff to `GetHitVar`.
- M.U.G.E.N 1.1 `sctrls.html` documents `snap = x_pos, y_pos` as an integer
  HitDef parameter with expression-capable numeric syntax. The bounded runtime
  claim below intentionally excludes the extra Ikemen components.

## Implementation

- `ControllerOps` retains static snap pairs separately from expression pairs and
  rejects malformed/triple dynamic input.
- `HitDefSystem` resolves fresh X/Y once in caller context for root and Helper,
  preserves component count, and clears stale fresh offsets on omission.
- Existing direct contact and `RuntimeHitVarSystem` seams consume the resolved
  X/Y pair; no new renderer or Projectile path is implied.

## Evidence

Required trace:

- `synthetic-imported-hitdef-dynamic-snap.json`
- trace checksum `3d153556`
- final checksum `fe79d540`
- `VarSet -> HitDef -> hit`, caller values `var(0)=7`, `var(1)=-5`
- accepted target link `p1 -> p2 / 77`
- get-hit state frame observes `xoff=7`, `yoff=-5`, `zoff=0`; the defender's
  Y position is `-5` during the owner-backed get-hit route

Aggregate gate: `pnpm qa:trace` passed `828/828` artifacts (`794` required,
`34` optional). Focused compiler/runtime/Helper coverage is `317/317` for the
new core batch, the trace preset gate passes, `pnpm typecheck` passes, and
`git diff --check` passes.

## Explicit exclusions

Snap Z, `snaptime`/bind timing, live `ModifyHitDef` snap mutation, Projectile
and `ModifyProjectile` inheritance, guard snap behavior, exact localcoord,
facing, tick/bind order, full Common1 positioning, teams, rollback, and full
M.U.G.E.N/Ikemen parity remain outside this bounded claim. T743 should select
the next seam only after preserving these exclusions.
