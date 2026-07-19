# Ticket 281: Round force-win timeout

- Status: resolved bounded
- Date: 2026-07-18
- Scope: connect imported `over.forcewintime` to the phase-4 readiness boundary
  without taking ownership of release choreography, motif, or team winpose
  execution
- Depends on: [T277](277-imported-fight-screen-timing.md) and [T280](280-round-no-damage-resource-controllers.md)
- Research: [`docs/research/2026-07-18-round-force-win-time.md`](../../../../docs/research/2026-07-18-round-force-win-time.md)

## Contract

1. Add `forceWinTimeFrames` to the normalized `RuntimeRoundTiming` contract
   and map the imported `fight.def` `[Round]` value `over.forcewintime` into
   it when no explicit runtime timing override replaces the source.
2. During the source-backed force window, hold the phase-4 boundary when an
   active root is still controllable, standing, idle, and outside animation 5.
   Keep the post-round frame and remaining clock stable while that boundary is
   held, preserving the `roundNoDamage` wait-frame projection.
3. Release phase 4 as soon as all active roots are ready, or when the bounded
   force window expires. Dead, disabled, standby, or `overKo` roots do not hold
   the boundary.
4. Preserve the IKEMEN time-over exception: the animation-5 readiness check is
   skipped for time-over. Timing without a source/override force value keeps the
   prior local phase behavior through a zero default.

## Evidence

- Implementation commit: `1e8cdda`.
- Focused runtime coverage: `RuntimeRoundSystem.test.ts`,
  `RuntimeMatchRoundSystem.test.ts`, and `PlayableMatchRuntime.test.ts` pass,
  `3` files / `295` tests.
- `pnpm typecheck` passes with TypeScript `7.0.2`.
- `git diff --check` passes for the implementation and focused test files.

## Claim ceiling

Allowed: bounded imported/root phase-4 readiness hold and force release,
including source timing mapping and a playable imported regression.

Blocked: exact `activelyFighting`/Common1 state predicates, exact MUGEN versus
IKEMEN `intro` ordering, winwait accounting beyond the bounded local clock,
force release into unavailable states, skip-input, fade/motif/dialogue,
lifebars, Common1/ZSS winpose execution, Teams/Turns choreography,
rollback/netplay, score movement, and full MUGEN/IKEMEN parity.
