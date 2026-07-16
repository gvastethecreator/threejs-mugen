# Helper-to-helper Target RedirectID selection

Date: 2026-07-15

## Question

Can a live helper execute the bounded `Target*` family through `RedirectID`
when the destination `PlayerID` belongs to another live helper?

## Answer

Yes, within a bounded `ikemen-go` route. Resolve the destination helper from
the live character identity registry, execute against that helper's target
memory, then commit the destination and any helper target actors back to their
live wrappers. Root destinations keep the existing root-owned route. Invalid,
missing, destroyed, or unsupported destinations fail closed.

## Official sources

- [Elecbyte trigger reference](https://www.elecbyte.com/mugendocs/trigger.html)
  gives every player a unique `ID`; helpers created during a match also
  receive unique IDs, and `PlayerIDExist` exposes the existence check.
- [Elecbyte state-controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines the target-memory `Target*` controllers separately from
  `BindToTarget` and custom-state entry.
- [IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines `RedirectID` as optional execution on the player designated by
  `PlayerID`, and warns that processing order can limit individual controller
  support.
- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html) records
  that helpers do not receive the ordinary `-3`/`-2`/`-1` special-state pass;
  helper `-1` execution is conditional on keyboard input and is not a generic
  substitute for this ownership route.

## Findings

1. A helper `PlayerID` is a live actor identity, not merely a root alias. The
   redirect resolver therefore has to enumerate active helper wrappers in
   addition to root fighters.
2. Helper target memory is owned by the destination helper. A temporary actor
   wrapper is safe only when runtime resources, target links, and bindings are
   synchronized back after the redirected controller executes.
3. Target controllers can mutate root actors and helper actors. Root actors are
   already live match state; helper actors need explicit writeback, including
   helper-local resource values and target memory.
4. Redirected controller and operation telemetry is attributed to the helper's
   owning root so the compatibility gates remain observable without confusing
   helper identity with root identity.
5. `TargetState` and `BindToTarget` toward helper destinations remain blocked.
   They require separate state-data and binding-anchor ownership contracts and
   are not widened by this target-memory mutation route.

## Decision

Implement helper-to-helper `RedirectID` for the bounded target-memory family:
`TargetLifeAdd`, `TargetPowerAdd`, `TargetVelSet`, `TargetVelAdd`,
`TargetFacing`, `TargetBind`, and `TargetDrop`. Use live helper `PlayerID`
resolution, preserve the authored target ID, commit helper wrappers after
execution, and keep unsupported helper destinations fail closed.

## Boundary

- Profile: `ikemen-go`.
- Caller: live helper state controller.
- Destination: live, non-destroyed, non-disabled helper resolved by `PlayerID`.
- Target selection: destination helper target memory; authored target ID is
  preserved.
- Mutation: target actor values and helper-owned target memory are committed to
  their live owners.
- Failure: invalid, missing, destroyed, disabled, `TargetState`, and
  `BindToTarget` helper redirects fail closed.

Exact multi-target order, recursive redirects, helper state ownership,
projectile/team/neutral ownership, target persistence, rollback/netplay,
cross-localcoord behavior, presentation parity, and full MUGEN/IKEMEN parity
remain open.

## Local evidence

- Runtime commit: `3b586805`.
- Fixture and QA commit: `5a4aa3fc`.
- Required trace: `synthetic-imported-helper-target-helper-redirect`, checksum
  `caf7af02`.
- Full trace batch: `629/629` passed, `595` required, `34` optional, `0`
  skipped.
- Affected suite: `639/639` passed.

## Next decision

Select a separate helper-owned auxiliary target-resource boundary or a
dedicated helper destination `BindToTarget` contract. Do not infer either from
the target-memory mutation route.
