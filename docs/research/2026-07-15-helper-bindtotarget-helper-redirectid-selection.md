# Helper-to-helper BindToTarget RedirectID selection

Date: 2026-07-15

## Question

Can a live helper execute `BindToTarget` through `RedirectID` when the
destination `PlayerID` belongs to another live helper?

## Answer

Yes, within a bounded `ikemen-go` route. Resolve the destination helper from
the live identity registry, select the target from that helper's target memory,
store the binding on the destination helper, and commit its binding and runtime
position back to the live wrapper. Invalid, missing, destroyed, or disabled
destinations fail closed.

## Official sources

- [Elecbyte trigger reference](https://www.elecbyte.com/mugendocs/trigger.html)
  assigns unique IDs to players and helpers created during a match.
- [Elecbyte state-controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines `BindToTarget` as binding the executing actor to a remembered target
  with authored position and time parameters.
- [IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines `RedirectID` as execution on the player designated by `PlayerID`,
  distinct from custom-state ownership.

## Findings

1. The redirect destination owns the binding record. Writing the binding only
   into a temporary target actor would lose it on the next helper tick.
2. The destination helper's target memory supplies the selected actor and its
   authored target ID; the caller's target memory remains independent.
3. `Mid` anchor, logical `Z`, and duration are controller-owned payload and must
   survive the redirect unchanged.
4. Binding evidence is time-windowed. The target link can expire before the
   final trace snapshot, so the gate asserts binding during its live window and
   does not confuse target-memory expiry with binding dispatch failure.
5. `TargetState` toward helper destinations remains separate because it needs
   state-data and custom-state owner contracts, not only binding writeback.

## Decision

Allow helper `BindToTarget` `RedirectID` to resolve another live helper. Reuse
the existing target-controller dispatch, commit helper runtime and target
memory after execution, and preserve fail-closed behavior for unsupported
helper custom-state routes.

## Boundary

- Profile: `ikemen-go`.
- Caller: live helper state controller.
- Destination: live, non-destroyed, non-disabled helper resolved by `PlayerID`.
- Target selection: destination helper target memory; authored target ID is
  preserved.
- Binding payload: `Mid` anchor, logical `Z`, offset, and duration are retained.
- Failure: invalid, missing, destroyed, disabled, and helper `TargetState`
  redirects fail closed.

Helper custom-state destinations, helper State -1/global-state execution,
projectile/team/neutral ownership, recursive redirects, exact multi-target
order, persistence, rollback/netplay, cross-localcoord behavior, presentation
parity, and full MUGEN/IKEMEN parity remain open.

## Local evidence

- Runtime commit: `f252a01c`.
- Fixture and QA commit: `f242c84a`.
- Required trace: `synthetic-imported-helper-bind-helper-redirect`, checksum
  `6132bd42`.
- Full trace batch: `630/630` passed, `596` required, `34` optional, `0`
  skipped.
- Affected suite: `641/641` passed.

## Next decision

Select a separate helper custom-state destination contract or an auxiliary
target-resource ownership boundary. Do not infer either from binding
writeback.
