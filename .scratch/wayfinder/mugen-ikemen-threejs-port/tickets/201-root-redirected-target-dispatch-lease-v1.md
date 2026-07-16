# Implement Root Redirected Target Dispatch Lease/v1

Type: task
Status: resolved
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

## Resolution

The generic `RuntimeRedirectedTargetDispatchWorld` adapter is implemented.
Resolution is fail-closed and returns a short-lived lease containing the exact
destination object, destination revision label, target store, state owner,
and frozen deduplicated candidate actor references. `execute` revalidates
liveness and object identity immediately before the synchronous target
dispatcher runs; the lease then closes as committed or aborted. No async or
rollback behavior is introduced by this slice.

Root active CNS and root State -1 target/binding dispatch now use the lease
adapter. The existing target dispatcher remains the semantic executor and
the ticket 200 selection/mutation projection remains authoritative.

## Evidence

- `src/tests/RuntimeRedirectedTargetDispatchSystem.test.ts`: valid commit,
  candidate projection, stale destination, explicit abort, invalid PlayerID,
  missing destination, and dead destination cases.
- Existing root active and State -1 RedirectID route tests remain green.
- Focused batch: `268/268` tests passed across the lease, target, telemetry,
  and PlayableMatchRuntime suites.
- TypeScript 7 check: `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed for the feature changes.

## Commits

- `f0ac78cc docs(wayfinder): select root redirected dispatch lease`
- `d4afe782 feat(runtime): add root redirected target leases`

## Next

Migrate helper-to-root and helper-to-helper through the same lease interface.
Keep helper-destination `TargetState`, resource controllers, projectiles,
teams, recursive redirects, and `TargetScoreAdd` outside the next migration
until separately characterized.
