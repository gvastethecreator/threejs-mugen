# Helper TargetState/custom-state RedirectID selection

Date: 2026-07-15

## Question

Can a live helper execute `TargetState` through `RedirectID` while keeping
target selection and custom-state ownership deterministic?

## Answer

Yes, within a bounded `ikemen-go` route. Resolve `RedirectID` to a live root
`PlayerID`, select the target from that destination root's target memory, then
enter the selected target through the destination root as `stateOwner`. The
ordinary helper-owned route keeps its existing owner validation. Invalid,
missing, or unsupported destinations fail closed before state mutation.

## Official sources

- [Elecbyte state-controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines `TargetState` as a state change for remembered targets, filtered by
  the authored `ID`, and defines `SelfState` as the return to the target's own
  state data.
- [IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines `RedirectID` as an optional execution redirect to a designated
  `PlayerID`, distinct from putting a player into another player's custom
  states. It also warns that processing order can limit individual controller
  support.

## Findings

1. `TargetState` has two independent ownership decisions: the root whose
   controller executes and the actor whose target memory supplies the target.
   A redirect must switch both to the live destination root.
2. Custom-state entry needs a third explicit value: the destination root must
   be carried as `stateOwner`; otherwise the selected actor can enter the
   right state number under the wrong state data.
3. The callback must survive active helper advancement, post-fighter helper
   processing, and hit-pause presentation. Missing any route silently blocks a
   valid redirected controller.
4. `SelfState` remains an owner-return operation. The fixture proves the
   selected actor returns to its own state data after the redirected custom
   route.

## Decision

Implement a separate `enterRedirected` path in the helper target-state world.
It reuses target resolution and state availability checks but bypasses only
the normal helper-owner equality check. The runtime callback resolves the
destination against active root actors and passes that root as `stateOwner`.

## Boundary

- Profile: `ikemen-go`.
- Caller: live helper state controller.
- Destination: live root fighter resolved by `PlayerID`.
- Target selection: destination root target memory, authored target `ID`
  preserved.
- State ownership: destination root custom-state data.
- Failure: invalid or missing redirect fails closed before mutation.

Helper State -1/global-state execution, helper destinations, projectile/team
target memories, recursive redirects, exact multi-target order, persistence,
rollback/netplay, presentation parity, and full MUGEN/IKEMEN parity remain
open.

## Local evidence

- Runtime commit: `fd7336f7`.
- Fixture and QA commit: `121c0fee`.
- Required trace: `synthetic-imported-helper-target-state-redirect`, checksum
  `d995fa81`.
- Full trace batch: `628/628` passed, `594` required, `34` optional, `0`
  skipped.
- Affected suite: `882/882` passed.

## Next decision

Select the next independent helper ownership boundary. Keep helper State -1,
helper destinations, projectile/team ownership, and recursive redirects as
separate tickets instead of widening this custom-state route implicitly.
