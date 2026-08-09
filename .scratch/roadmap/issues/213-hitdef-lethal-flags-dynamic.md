# Issue 213 — HitDef dynamic lethal flags

- Status: `closed-bounded`
- Lane: `R1 contact and damage precision`
- Priority: `P1`

## Objective

Resolve direct HitDef `kill`, `guard.kill`, and `hitonce` in root and Helper
caller contexts. Support root or redirected `ModifyHitDef` replacement before
accepted contact uses the live lethal and one-contact policies.

## Source gate

M.U.G.E.N 1.1 documents all three fields. Pinned Ikemen GO compiles them as
`VT_Bool`, evaluates them against the caller, and lets `ModifyHitDef` reuse the
live HitDef evaluator.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:218-226`
- pinned Ikemen `compiler_functions.go:1778-1795`
- pinned Ikemen `bytecode.go:7586-7593`
- pinned Ikemen direct contact use at `char.go:10761-10764` and
  `char.go:11464-11469`

## Acceptance fixture

- Compile and resolve finite dynamic `kill`, `guard.kill`, and `hitonce` in
  root and Helper caller contexts.
- Let root or redirected `ModifyHitDef` replace each live flag independently.
- Preserve accepted hit/guard damage clamps and the current direct-contact
  one-hit memory path.
- Add one required imported trace with an authored dynamic lethal flag.

## Claim ceiling

Do not claim Projectile or ModifyProjectile changes, Helper-owned
`ModifyHitDef`, exact throw defaults, full target-drop ordering, simultaneous
multi-attacker arbitration, teams, rollback, or full damage/KO parity.

## Verification

- Core compiler, direct runtime, and Helper coverage: `187/187`.
- Real root `RedirectID` mutation route: `1/1`.
- Full suite: `3548/3606`; the same 58 inherited retired-roster failures remain.
- Build: `363` modules.
- Required trace `synthetic-imported-hitdef-dynamic-lethal-flags`: checksum
  `bf9a76a0`, final-frame checksum `aebf3ff6`, defender life `1`.
- Aggregate traces: `711/711` (`677` required, `34` optional).
