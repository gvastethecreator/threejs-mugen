# Progress Report: Turns Roster and Recovery

## Delivered

Entry 520 extends the automatic Turns boundary with an explicit source-backed
recovery policy and full bounded roster projection. The continuation now uses
the remaining round timer, applies winner recovery before resource reset, and
reports ordered standby and future entrant state for both sides.

The production roster also rejects a promoted active root as a replacement
candidate until it is again a healthy standby member. This closes the bug that
blocked a second replacement after `p2 -> p4`.

## Evidence

- Focal Turns recovery, continuation, and round timer tests: passed.
- Automatic PlayableMatchRuntime continuation test: passed.
- Three-member sequence `p4 -> p6`: passed at the typed continuation boundary.
- Full suite: 209 test files / 2110 tests passed with `--maxWorkers=4`.
- TypeScript 7 typecheck, boundaries, and CSS budget: passed.
- Production build: passed at 289 modules; the existing large-JS-chunk warning
  remains.
- Aggregate trace corpus: 600/600 artifacts passed, 566 required and 34
  optional.
- Core desktop/mobile Runtime and Studio smoke: passed under
  `.scratch/qa/qa-smoke-turns-roster-recovery-core/` with Code Fu Man omitted
  from the optional browser fixture route.

## Quality Audit

- Recovery is fail-closed for malformed actor data and suppressed for terminal
  matches; defeated actors do not receive recovery.
- Recovery life is clamped before resource reset, so a winner cannot exceed its
  authored life maximum.
- Roster ordering is deterministic by `memberNo` and stable actor ID.
- The implementation keeps the existing claim ceiling: no external Lua
  recovery or complete native Turns loading semantics are implied.

## Next

Audit terminal Turns outcome and round-score ownership before selecting the
next runtime or Studio slice. The optional Code Fu Man `upper_x` browser oracle
remains the known residual risk outside this boundary.
