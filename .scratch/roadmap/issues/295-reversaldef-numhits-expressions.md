# Issue 295 — `ReversalDef` `numhits` expressions

Status: **closed-bounded** (T721, 2026-08-11)

## Contract

Direct/root `ReversalDef` and root/RedirectID `ModifyReversalDef` now retain
`numhits` as a typed static or caller-context expression. Fresh activation
resolves the authored value once in the original caller context. A live
root/RedirectID modification resolves the replacement against that same
caller and updates the active reversal metadata without changing omitted
fields. Accepted reversal contact consumes the resolved hit-count value
through the existing reversal contact path.

This is a bounded Ikemen compatibility slice. The pinned Ikemen source
reuses the HitDef integer parameter runner for ReversalDef, while the local
M.U.G.E.N 1.1 ReversalDef reference does not document `numhits` as an
optional ReversalDef parameter. The claim therefore follows the pinned
Ikemen implementation and the shared HitDef `numhits` semantics rather than
claiming a standalone M.U.G.E.N ReversalDef field.

## Upstream basis

- Pinned Ikemen GO `compiler_functions.go` around `1814-1815` compiles
  ReversalDef `numhits` as an integer expression.
- Pinned `bytecode.go` around `7611-7612` evaluates the value in the caller
  context; the ReversalDef runtime reuses the HitDef parameter path.
- Pinned `char.go` defaults `numhits` to `1` and consumes the value during
  accepted reversal contact and hit-count accounting.

## Implementation and evidence

- Core commit `c1fe841f` adds typed IR/compiler retention, caller-context
  integer resolution for fresh and live root/RedirectID paths, and focused
  compiler/runtime regression coverage.
- Focused `RuntimeCompiler` + `ReversalSystem` coverage passes `172/172`;
  the dynamic path, malformed rejection, caller ownership, live replacement,
  and contact consumption are covered.
- Evidence commit `c402c1bc` adds the required imported trace fixture, gate
  test, and QA registry entry.
- Required trace artifact:
  `synthetic-imported-ikemen-root-modifyreversaldef-numhits-golden`.
- Trace checksums: `92c3151e` and final `4cecfee3`.
- `pnpm typecheck`, `git diff --check`, and `pnpm qa:trace` pass; aggregate
  QA is `812/812` artifacts (`778` required, `34` optional).

## Explicit exclusions

Helper-owned `ModifyReversalDef`, Projectile/ModifyProjectile reversal
reflection, negative or overflow int32 parity, exact combo accumulation and
UI ordering, exact pause/contact tick synchronization, custom-state breadth,
teams, rollback, and full M.U.G.E.N/Ikemen ReversalDef parity remain open.
