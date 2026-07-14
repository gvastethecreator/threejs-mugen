# Progress Report: Turns max-draws runtime command

## Delivered

Entry 523 adds a source-backed typed runtime seam for the official IKEMEN
`setMatchMaxDrawGames(teamSide, count)` behavior. `PlayableMatchRuntime` now
accepts a profile-gated `set-match-max-draws` command, and `MatchWorld` forwards
initial scalar or side-specific limits.

The command changes only the requested side and reuses the outcome system's
bounded count policy. The next simultaneous draw therefore observes the live
mutation without widening team, score, or Lua ownership.

## Evidence

- Focal suite: 2 files / 23 tests passed.
- TypeScript 7 typecheck: passed.
- `git diff --check`: passed.
- Code commit: `646fa705 feat: expose IKEMEN match draw limit mutation`.
- Aggregate and browser gates are intentionally queued for the next batched
  checkpoint.

## Quality audit

- Non-IKEMEN profiles reject the command instead of silently mutating state.
- Side 1 and side 2 limits remain independent.
- Unlimited values preserve the existing omitted snapshot representation.
- This command is a host/runtime adapter, not Lua or ZSS execution.

## Claim ceiling

The project now has a bounded source-backed live mutation seam for draw limits.
It does not claim Lua VM execution, script registration, rollback/netplay,
unbounded official integer behavior, or full MUGEN/IKEMEN parity.

## Next

Batch the broad gates and select the next independent source-backed lifecycle
or compatibility-corpus slice.
