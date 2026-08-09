# Issue 214 — HitDef dynamic air.juggle

- Status: `closed-bounded`
- Lane: `R1 contact and damage precision`
- Priority: `P1`

## Objective

Resolve fresh direct HitDef `air.juggle` in root and Helper caller contexts.
Under the `ikemen-go` profile, arm the attacker's active juggle cost with the
resolved integer before direct contact uses the existing admission and spend
path.

## Source gate

M.U.G.E.N 1.1 documents `air.juggle` as an integer HitDef field. Pinned Ikemen
GO evaluates it against the caller and, for a non-Projectile Ikemen character,
copies the finalized value into the active character juggle cost.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:135`
- pinned Ikemen `compiler_functions.go:1798-1800`
- pinned Ikemen `bytecode.go:7594-7595`
- pinned Ikemen finalization at `char.go:1000-1005`
- pinned Ikemen direct-contact spend at `char.go:11547-11552`

## Acceptance fixture

- Compile and resolve finite dynamic `air.juggle` in root and Helper caller
  contexts.
- Preserve the current M.U.G.E.N profile behavior and the existing omitted
  compatibility policy.
- Under `ikemen-go`, update both the active HitDef metadata and attacker juggle
  cost before the current direct-contact admission path runs.
- Add one required imported trace with authored dynamic `air.juggle`.

## Claim ceiling

Do not claim `ModifyHitDef air.juggle`, Projectile or ModifyProjectile changes,
M.U.G.E.N direct-HitDef juggle cost, exact target-list timing, Helper
inherit-juggle topology, teams, rollback, or full juggle parity.

## Verification

- Compiler, direct runtime, and Helper coverage: `189/189`.
- Full suite: `3551/3609`; the same 58 inherited retired-roster failures remain.
- Build: `363` modules.
- Required trace `synthetic-imported-hitdef-dynamic-air-juggle`: checksum
  `8493e479`, final-frame checksum `3129764a`, attacker juggle `3` from HitDef.
- Aggregate traces: `712/712` (`678` required, `34` optional).
