# Implement Helper Resource Redirected Dispatch Lease/v1

Type: task
Status: open
Blocked by: 203

## Question

Can helper-local resource controllers reuse the helper lease for
`RedirectID`, targeting a live root or helper while preserving caller-owned
dynamic values and helper wrapper synchronization?

## Scope

Migrate current helper CNS resource controllers through the shared
`RuntimeRedirectedTargetDispatchWorld` lease: `CtrlSet`, life, power,
guard-point, dizzy-point, and red-life resource families. Support
helper-to-root and helper-to-helper destinations already represented by the
character identity registry.

Use an empty candidate projection because resources mutate one destination and
do not select target memory. Keep the existing helper controller dispatcher as
the concrete executor and commit helper destination wrappers only inside the
lease operation.

Do not add helper State -1/global-state scheduling, helper custom-state
`TargetState`, projectile/team ownership, recursive redirects, `TargetScoreAdd`,
persistence, rollback/netplay, or full parity in this ticket.

## Evidence required

- helper resource lease unit/integration coverage for root and helper
  destinations;
- invalid RedirectID remains fail-closed and omitted RedirectID stays local;
- TypeScript 7 check, focused helper/runtime batch, and diff hygiene pass;
- closeout report records no score movement and the scheduling boundary.

## Research basis

- IKEMEN state-controller reference:
  <https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29>
- Elecbyte controller reference:
  <https://www.elecbyte.com/mugendocs/sctrls.html>
- ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md`
- Existing helper target lease and root resource lease closeouts.

## Exit

Helper CNS resource RedirectID resolves and executes through one synchronous
lease for root/helper destinations, with local operation semantics,
fail-closed invalid identity, and wrapper commits preserved.
