# Implement Root Redirected Target Dispatch Lease/v1

Type: task
Status: open
Blocked by: None

## Question

What is the smallest ADR 0006 migration that centralizes redirected target
identity and freshness without changing concrete Target controller semantics?

## Scope

Migrate root active CNS and root State -1 `Target*`/`BindToTarget` dispatch
through one short-lived lease module. The lease owns caller identity,
RedirectID expression/value, destination actor identity, target-store adapter,
candidate projection, state-owner identity, and a synchronous freshness check.
The existing target dispatcher remains the semantic executor and continues to
emit the operation-specific selection/mutation projection from ticket 200.

Do not migrate resource controllers, helpers, projectiles/teams, helper
destination `TargetState`, `TargetScoreAdd`, or general scheduling in this
ticket.

## Evidence required

- lease unit tests for valid, invalid, stale, and closed destinations;
- root active and State -1 RedirectID route tests remain green;
- unselected candidates remain outside the lease candidate projection;
- TypeScript 7 check and focused runtime batch;
- closeout report with no score movement and explicit migration boundary.

## Decision

Use a generic `RuntimeRedirectedTargetDispatchWorld` adapter. Resolution is
fail-closed and returns an immutable short-lived lease containing the exact
destination object and candidate actor references. `execute` revalidates
liveness and object identity immediately before the synchronous target
dispatcher runs; the lease then closes as committed or aborted. No async or
rollback behavior is introduced by this slice.

## Next

After root active and State -1 close, migrate helper-to-root and
helper-to-helper through the same lease interface.
