# Ticket 274: Runtime phase-4 RoundNotOver hold

- Status: resolved
- Date: 2026-07-18
- Scope: open phase `4` before terminal post-KO expiry and hold that clock
  while an active imported win pose asserts `RoundNotOver`
- Depends on: [T273](273-runtime-win-pose-handoff.md)
- Research: [`docs/research/2026-07-18-runtime-roundnotover-phase4.md`](../../../../docs/research/2026-07-18-runtime-roundnotover-phase4.md)

## Question

How can the runtime let a reserved state `180` execute its authored
`AssertSpecial RoundNotOver` controller before the post-KO terminal window
closes, without coupling round timing to CNS parsing or changing score
ownership?

## Bounded contract

1. Open `RuntimeRoundSystem` phase `4` at post-KO frame `45` while
   `isOver === false`.
2. Keep the existing `255`-frame post-KO terminal duration for ordinary
   rounds.
3. In `RuntimeMatchRoundWorld`, hold the KO phase-4 clock when the existing
   global AssertSpecial projection reports `roundNotOver`, returning typed
   `held` evidence without stopping playback.
4. Resume clock advancement when the flag is no longer asserted.
5. Exercise the path through an imported CNS state `180`, preserving
   `RuntimeRoundWinPose/v0` as state-entry owner and keeping Turns outside the
   slice.

## Acceptance evidence

- `RuntimeRoundSystem` proves phase `4` opens at frame `45` before
  `isOver`/terminal frame `255`.
- `RuntimeMatchRoundWorld` proves hold, no stop callback, and later resume.
- `PlayableMatchRuntime` proves imported state `180` asserts
  `roundNotOver`, keeps `playing`, and leaves the post-KO frame/remaining
  values stable on the next tick.
- Implementation commit: `db36894c`.
- Focused verification: `4` files / `287` tests, `pnpm typecheck`, and
  `git diff --check` passed.

## Claim ceiling

Allowed: bounded local phase-4 readiness and post-KO hold for active normal/tag
actors using authored `RoundNotOver`. Blocked: exact IKEMEN timing variables,
Common1/ZSS execution breadth, release/readiness choreography, time-over `175`,
Turns/effective-loss, Simul, rollback/netplay, and full MUGEN/IKEMEN parity.
