# Map Global AssertSpecial Ownership

Type: task
Status: resolved
Blocked by: None

## Question

What ownership boundary must close before team KO/replacement work can consume
global `AssertSpecial` flags without duplicating per-actor interpretation or
claiming IKEMEN-only semantics?

## Known Facts

- Elecbyte `AssertSpecial` flags deassert every game tick.
- `RoundNotOver`, `TimerFreeze`, `NoKOSlow`, and `NoKOSnd` affect round-flow
  consumers in the current MUGEN-compatible lane.
- The current runtime had four local round helpers and only a P1/P2 round
  consumer.
- Ikemen-GO has profile-specific round additions and historical
  `RoundNotOver` fixes.

## Answer

Close `RuntimeGlobalAssertSpecialWorld/v0` as a stateless pair-round read
model. It canonicalizes known global flags, records deterministic source actor
ids, reports unknown global names, and exposes typed round booleans. Route
`RuntimeMatchRoundWorld` through that snapshot. Keep team roots, replacement,
Helper/Projectile ownership, KO echoes, and IKEMEN-only flags as separate
frontier decisions.

## Evidence

- Research note: `docs/research/2026-07-13-global-assertspecial-ownership.md`.
- ADR: `docs/adr/0003-runtime-global-assertspecial-ownership.md`.
- Implementation: `src/mugen/runtime/RuntimeGlobalAssertSpecialSystem.ts` and
  `src/mugen/runtime/RuntimeMatchRoundSystem.ts`.
- Focused contract: `src/tests/RuntimeGlobalAssertSpecialSystem.test.ts`.

## Claim Boundary

Allowed: current pair-round global flag ownership and source diagnostics.

Blocked: team KO/replacement, multi-root precedence, Helper/Projectile global
ownership, exact KO echo timing, IKEMEN `roundFreeze`, and full parity.
