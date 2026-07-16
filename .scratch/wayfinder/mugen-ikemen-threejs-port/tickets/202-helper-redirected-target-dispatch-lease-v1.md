# Implement Helper Redirected Target Dispatch Lease/v1

Type: task
Status: open
Blocked by: 201

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
