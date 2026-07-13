# ADR 0004 - Runtime Team Round Decision Read Model

Status: accepted

Date: 2026-07-13

## Context

The current runtime has complete team topology and bounded active-root
diagnostics, but `RuntimeRoundSystem` still owns only pair P1/P2 life and timer
completion. Implementing member KO, Turns replacement, or Tag defeat directly
inside that pair system would conflate actor KO, `overKo`, side defeat, and the
later replacement transaction.

The global `AssertSpecial` ownership decision is now accepted separately. The
next safe contract is therefore a read-only team decision, not mutation.

## Decision

1. Add `RuntimeTeamRoundDecisionWorld/v0` as a pure reducer over root actor
   facts and explicit per-side mode/policy input.
2. Treat `overKo` as actor state, not as side defeat. Evaluate side defeat from
   the selected mode and `LoseOnKO` policy.
3. Admit a Turns replacement candidate only when its owner explicitly marks a
   healthy standby root as `replacementEligible`.
4. Keep helper actors out of the team-round set and report their exclusion.
5. Preserve side facts when `RoundNotOver` blocks the global outcome.
6. Expose the reducer through `RuntimeMatchRoundWorld` without changing the
   pair round mutation, snapshots, or trace payloads.

## Alternatives

### Count the first KO as round defeat

Rejected. It fails for Simul/Tag continuation and makes actor KO equivalent to
side defeat.

### Infer replacement from standby alone

Rejected. Standby is a participation state and does not by itself define Turns
loading, member order, or replacement eligibility.

### Mutate the active roster in this cut

Deferred. Replacement requires a separate transaction for slot identity,
state ownership, input, effects, combat, presentation, and reset behavior.

## Claim boundary

Allowed: deterministic, read-only team KO/side-defeat/replacement decision
facts for explicitly supplied root actors and policies.

Blocked: exact MUGEN/IKEMEN team rules, ordered KO/handoff traces, replacement
mutation, lifebars/resources, win-pose flow, score promotion, rollback, and
full parity.
