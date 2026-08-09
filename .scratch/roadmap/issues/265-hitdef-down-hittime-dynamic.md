# Issue 265 — direct HitDef down.hittime dynamic

- Status: closed-bounded
- Lane: R1 direct contact timing
- Priority: P1
- Cursor: T691

## Contract

Port the pinned direct-HitDef `down.hittime` scalar for root and Helper
callers. Fresh HitDefs resolve authored expressions once in the caller
context, use the fresh default `20` when omitted, and do not inherit a prior
move value. Root-owned `ModifyHitDef` resolves the same scalar in caller
context, replaces a live value when authored, and preserves it when omitted.
An accepted lying hit with `down.velocity.y = 0` must expose the resolved
timer through `GetHitVar(hittime)` and the imported Common1-style progression.

## Authority

- M.U.G.E.N 1.1 documents `down.hittime` as the lying-hit duration and says
  it is ignored when `down.velocity.y` is non-zero:
  `.scratch/external/mugen-1.1b1/docs/sctrls.html` around lines 1721-1724.
- Ikemen GO pin `149402f` compiles/evaluates the scalar in
  `compiler_functions.go:1961-1962` and `bytecode.go:7680-7681`, resets fresh
  `down_hittime` to `20` in `char.go:729`, and copies it to the lying
  defender's GetHitVar timing in `char.go:11032-11033`.

## Verification

- Focused compiler/HitDef/Helper coverage: `263/263` tests across the three
  nearest suites.
- Required trace:
  `synthetic-imported-dynamic-direct-down-hittime`
- Trace checksum: `e3cfd800`; final checksum: `6401d0a9`.
- Aggregate QA: `766/766` artifacts (`732` required, `34` optional).
- Full Vitest: `3788/3788` tests across `328` files.
- Typecheck and production build pass (`363` modules).

## Exclusions

Projectile support (already covered by its own path), fresh omission/profile
variants beyond the pinned direct default, live Helper-owned ModifyHitDef,
`ModifyProjectile`, non-zero `down.velocity.y` launch semantics, negative or
overflow values, exact lying countdown/landing timing, teams, rollback, and
full M.U.G.E.N/Ikemen timing parity remain outside this bounded claim.
