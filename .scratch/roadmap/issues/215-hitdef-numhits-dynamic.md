# Issue 215 — HitDef dynamic numhits

- Status: `closed-bounded`
- Lane: `R1 contact and damage precision`
- Priority: `P1`

## Objective

Resolve direct HitDef `numhits` in root and Helper caller contexts. Support root
or redirected `ModifyHitDef` replacement before accepted contact updates the
attacker `HitCount` path while preserving the separate consecutive-contact
`GetHitVar(hitcount)` counter.

## Source gate

M.U.G.E.N 1.1 documents `numhits` as a non-negative integer with default `1`.
Pinned Ikemen GO compiles and evaluates it against the caller, and
`ModifyHitDef` reuses the live HitDef evaluator.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:230-231`
- pinned Ikemen `compiler_functions.go:1814-1816`
- pinned Ikemen `bytecode.go:7611-7612`
- pinned Ikemen accepted-contact consumers at `char.go:11342-11343` and
  `char.go:12412-12414`

## Acceptance fixture

- Compile and resolve finite dynamic `numhits` in root and Helper caller
  contexts.
- Default a fresh omitted HitDef to `1` and let root or redirected
  `ModifyHitDef` replace the live value.
- Add authored `numhits` to accepted direct-hit `HitCount` while preserving
  `GetHitVar(hitcount)` as the separate consecutive-contact counter.
- Add one required imported trace with authored dynamic `numhits`.

## Closure evidence

- Fresh root and Helper HitDef expressions resolve from caller vars; root or
  redirected `ModifyHitDef` replaces the live value.
- Accepted direct hit applies authored `numhits` to `HitCount`; focused tests
  keep `GetHitVar(hitcount)` at one for the first contact and two for the next.
- Focused coverage passes 250 tests. Typecheck, 363-module build, boundaries,
  redirect boundary, and 713/713 traces pass.
- Required `synthetic-imported-hitdef-dynamic-numhits` trace checksum is
  `280d23dc`; final checksum is `64811f55`.
- Full suite passes 3555/3613. The 58 failures are the inherited removed
  Nova/Mira/Rook fixture and old roster expectation failures.

## Claim ceiling

Do not claim Projectile or ModifyProjectile changes, ReversalDef or
ModifyReversalDef dynamic values, negative-value clamp parity, Helper-owned
`ModifyHitDef`, exact delayed combo UI ordering, teams, rollback, or full combo
counter parity.
