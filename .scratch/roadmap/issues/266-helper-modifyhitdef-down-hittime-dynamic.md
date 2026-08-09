# Issue 266 — Helper ModifyHitDef down.hittime dynamic

- Status: closed-bounded
- Lane: R1 Helper direct contact timing
- Priority: P1
- Cursor: T692

## Contract

Close the Helper-owned live `ModifyHitDef down.hittime` seam from the pinned
Ikemen runtime. A Helper-owned normal HitDef may be active on the Helper, then
its `ModifyHitDef` evaluates `down.hittime` once in the Helper caller context
and mutates the live HitDef before contact. With `down.velocity.y = 0`, an
accepted lying hit exposes the resulting timer through the defender's
`GetHitVar(hittime)` and the imported Common1-style get-hit route. Helper/root
ownership, target link, and Helper lifecycle must remain observable.

## Authority

- Ikemen GO pin `149402f`: `compiler_functions.go:1961-1962` compiles the
  scalar, `bytecode.go:7680-7681` evaluates it in the active caller, and
  `bytecode.go:8332-8355` reuses `runSub` for live `ModifyHitDef` without a
  fresh reset. Lying contact copies the active value at `char.go:11032-11033`.
- M.U.G.E.N 1.1 documents the lying-hit duration and its interaction with
  non-zero `down.velocity.y`; Helper-owned `ModifyHitDef` is an Ikemen source
  compatibility surface, not a M.U.G.E.N controller claim.

## Verification

- Focused Helper regression: `1/1` new test, with typecheck green.
- Required trace:
  `synthetic-imported-helper-modifyhitdef-dynamic-down-hittime`
- Trace checksum: `7e836797`; final checksum: `3597b35b`.
- Aggregate QA: `767/767` artifacts (`733` required, `34` optional).
- Full-suite/build baseline remains green from T691; rerun the full suite at
  the next release checkpoint after the queued T692 documentation commit.

## Exclusions

Root-owned fresh/default variants are covered by T691; Projectile and
ModifyProjectile remain separate, as do non-zero down-velocity launch rules,
exact lying countdown/landing timing, negative/overflow values, team/rollback
topology, and full Helper timing parity.
