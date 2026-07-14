# ADR 0005 - Runtime Team Round Handoff

Status: accepted

Date: 2026-07-13

## Context

`RuntimeTeamRoundDecisionWorld/v0` can identify a Turns replacement, but the
runtime still needs a transaction boundary that does not accidentally become
the owner of slot swapping, life reset, input, effects, presentation, or
resources. Ikemen-GO evaluates effective loss before its later Turns
promotion step, so those responsibilities must remain separate here too.

## Decision

1. Add `RuntimeTeamRoundHandoffWorld/v0` with explicit `plan` and `apply`
   phases.
2. Require a decision with a healthy standby actor explicitly marked
   `replacementEligible`.
3. Preflight every outgoing/incoming change before mutating any actor. A
   two-sided handoff therefore commits all changes or none.
4. Mark an outgoing KO actor `standby = true, overKo = true` and an incoming
   Turns actor `standby = false, overKo = false`.
5. Keep life, player number, state ownership, command buffers, round state,
   input, effects, presentation, lifebars, and resources outside this ADR.
6. Expose the boundary through `PlayableMatchRuntime` and `MatchWorld`, with
   `teamMode: "turns"` available as a policy input.

## Alternatives

### Mutate `RuntimeRoundSystem` directly

Rejected. The pair round system owns current P1/P2 timer and finish state, not
team promotion or slot identity.

### Infer a replacement from any standby actor

Rejected. Standby is a participation flag; Turns loading/order must be an
explicit owner decision.

### Swap P1/P2 slots in this cut

Deferred. Ikemen also remaps player-indexed references and initializes the new
fighter. Doing that here would silently widen input, state ownership, effects,
resources, and presentation.

## Claim boundary

Allowed: typed, deterministic, ordered, atomic `standby/overKo` promotion for
the supplied Turns actor set.

Blocked: full Turns match flow, exact slot/ref remapping, life reset, round
restart, lifebars, shared resources, win poses, rollback, netplay, and broad
MUGEN/IKEMEN parity.
