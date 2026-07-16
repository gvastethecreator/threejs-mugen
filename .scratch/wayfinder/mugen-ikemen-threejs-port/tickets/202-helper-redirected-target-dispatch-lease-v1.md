# Implement Helper Redirected Target Dispatch Lease/v1

Type: task
Status: resolved
Blocked by: None

## Question

Can helper-to-root and helper-to-helper `RedirectID` dispatches reuse the
root lease contract without changing helper target-controller semantics or
the existing fail-closed helper `TargetState` boundary?

## Scope

Migrate helper `Target*` and `BindToTarget` RedirectID dispatch through
`RuntimeRedirectedTargetDispatchWorld`. The lease must carry helper caller
identity, RedirectID expression/value, exact destination actor, helper target
store, candidate projection, destination state owner, and synchronous
freshness/liveness checks. The existing helper target dispatcher remains the
semantic executor and helper wrapper commits remain synchronous.

The migration includes helper-to-root and helper-to-helper destinations. It
does not widen helper destination `TargetState`, resource controllers,
projectiles/teams, recursive redirects, `TargetScoreAdd`, persistence,
rollback/netplay, or scheduling semantics.

## Evidence required

- lease unit coverage proves helper phase metadata and stale/closed execution
  behavior;
- existing helper-to-root and helper-to-helper RedirectID route tests remain
  green, including helper wrapper commit behavior;
- helper destination `TargetState` remains fail-closed;
- TypeScript 7 check, focused runtime batch, and diff hygiene pass;
- closeout report records claim ceiling, deferred surfaces, and no score
  movement.

## Research basis

- IKEMEN state-controller reference:
  <https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29>
- Elecbyte controller reference:
  <https://www.elecbyte.com/mugendocs/sctrls.html>
- ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md`
- Prior characterization: `docs/reports/2026-07-16-redirected-target-characterization-closeout.md`

## Exit

The helper adapter resolves a live destination into one synchronous lease,
executes the existing dispatcher only while fresh, commits selected helper
wrappers only after successful execution, and preserves all pre-existing
helper route telemetry and snapshots.

## Resolution

Implemented the helper lease migration. Helper RedirectID resolution now
creates a `helper`-phase lease with exact destination identity, destination
target store, state-owner metadata, frozen candidate projection, and a
synchronous current-destination check. The existing target dispatcher remains
the semantic executor; helper wrapper synchronization is performed inside the
lease operation after dispatch returns.

Helper-to-root and helper-to-helper routes now share the same lease contract.
The helper-destination `TargetState` rejection remains unchanged and
fail-closed.

## Evidence

- `src/tests/RuntimeRedirectedTargetDispatchSystem.test.ts` covers helper
  phase metadata in addition to valid, stale, closed, invalid, missing, and
  dead destinations.
- Existing HelperSystem and PlayableMatchRuntime route tests remain green:
  `274/274` tests passed across the lease, helper, PlayableMatchRuntime, and
  compatibility telemetry suites.
- TypeScript 7 check: `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed for the feature changes.
- Browser/renderer smoke: N/A; no visible UI or Three.js surface changed.
- Full repository suite and full compatibility trace remain deferred to the
  next multi-slice checkpoint.

## Claim boundary

Allowed: existing helper-to-root and helper-to-helper `Target*`/
`BindToTarget` RedirectID paths share the root lease identity/freshness/store
contract while preserving helper snapshots, wrapper commits, telemetry, and
the helper destination `TargetState` boundary.

Still open: helper resource controllers, projectile/team ownership,
recursive redirects, exact multi-target ordering, `TargetScoreAdd`,
persistence, rollback/netplay, presentation, and full MUGEN/IKEMEN parity.

## Commits

- `23ce9c34 docs(wayfinder): select helper redirected dispatch lease`
- `3093ed8f docs(wayfinder): update helper lease map`
- `cf3546f4 feat(runtime): lease helper redirected dispatch`

## Next frontier

Select one independent resource or actor-family RedirectID boundary. Keep
lease migration and concrete controller semantics separate so the next slice
can be characterized without widening helper custom-state behavior.
