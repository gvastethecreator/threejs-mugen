# Global AssertSpecial Ownership Research

Date: 2026-07-13
Status: decision closed for bounded pair-round scope

## Question

Where should global `AssertSpecial` flags be reduced before the next IKEMEN
team KO/replacement work, without widening Helpers, Projectiles, or team
round ownership?

## Answer

Use a stateless `RuntimeGlobalAssertSpecialWorld/v0` read model after the
per-actor frame reset and imported `AssertSpecial` pass. It aggregates the
known global flags for the current tick, records source actor ids, reports
unknown global names, and exposes the four round consumers currently needed by
the sandbox: `NoKOSlow`, `NoKOSnd`, `TimerFreeze`, and `RoundNotOver`.

`RuntimeMatchRoundWorld` consumes this snapshot for timer freeze, KO slowdown,
KO sound suppression, and round-finish blocking. The model does not latch flags
between ticks. The current consumer remains the P1/P2 pair; team KO,
replacement, Helper/Projectile ownership, and IKEMEN-only flags remain blocked.

## Primary Sources

- [Elecbyte State Controller Reference - AssertSpecial](https://www.elecbyte.com/mugendocs/sctrls.html)
- [Elecbyte MUGEN Upgrade Notes](https://www.elecbyte.com/mugendocs-11b1/upgrading.html)
- [Ikemen-GO official v0.99.0-rc.1 release](https://github.com/ikemen-engine/Ikemen-GO/releases/tag/v0.99.0-rc.1)

## Findings

1. Elecbyte documents that `AssertSpecial` flags are deasserted every game
   tick, so the reducer must be recomputed from the current frame rather than
   stored as a persistent round policy.
2. Elecbyte defines `RoundNotOver`, `TimerFreeze`, `NoKOSlow`, and `NoKOSnd`
   as match-flow controls. `NoKOSnd` also has a post-KO echo caveat; this cut
   preserves the existing one-shot sound boundary and does not claim echo
   parity.
3. The official Ikemen-GO release history records both a `RoundNotOver` fix
   and an Ikemen-only `roundFreeze` flag. That is enough evidence to keep
   profile-specific extensions outside this MUGEN-compatible v0 reducer until
   a pinned source slice defines their ownership and timing.
4. The previous round adapter duplicated flag interpretation in four local
   helpers. Moving that interpretation into one read model makes the next
   team-round decision explicit without changing trace payloads or public
   checksum projection.

## Uncertainty And Blocked Scope

- Exact IKEMEN `RoundNotOver`/`roundFreeze` interaction with `RoundState 3/4`
  is not resolved here.
- Global precedence across multiple active roots, team defeat/replacement,
  lifebar ownership, and Helper-originated flags remains unimplemented.
- Exact KO echo timing, motif policy, and full MUGEN/IKEMEN round parity remain
  blocked.

## Implementation Consequence

The next bounded implementation is `RuntimeGlobalAssertSpecialWorld/v0` plus
focused aggregation tests and `RuntimeMatchRoundWorld` integration. No score
promotion follows from this ownership prefactor alone.
