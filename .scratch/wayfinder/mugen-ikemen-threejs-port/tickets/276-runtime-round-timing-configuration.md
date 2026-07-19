# Ticket 276: Runtime round timing configuration

- Status: resolved bounded
- Date: 2026-07-18
- Scope: replace the phase-4 and post-KO timing constants used by the active
  runtime with a bounded, explicit timing contract while preserving defaults
- Depends on: [T275](275-runtime-win-pose-readiness.md)
- Research: [`docs/research/2026-07-18-runtime-round-timing-configuration.md`](../../../../docs/research/2026-07-18-runtime-round-timing-configuration.md)

## Question

How can the runtime stop treating `over.waittime`, `over.wintime`, and the
post-KO terminal window as inseparable constants, so parsed or fixture-owned
timing can be introduced without changing the default playable contract?

## Bounded contract

1. Add a typed `RuntimeRoundTiming` configuration with source-backed defaults:
   phase-4 opening `45`, win-pose readiness `45`, terminal post-KO window `255`,
   KO slowdown `60`, fade `45`, and rate `0.25`.
2. Accept partial timing overrides through `PlayableMatchRuntimeOptions` and
   normalize invalid values deterministically.
3. Derive phase-4 and win-pose readiness from the same resolved timing object;
   keep the default snapshot shape and values unchanged.
4. Keep `RoundNotOver`, score projection, state availability, Turns, and
   renderer ownership unchanged.

## Claim ceiling

Blocked: parsing fightscreen/system configuration, exact MUGEN/IKEMEN frame
ordering, `over.forcewintime`, skip-input behavior, Common1/ZSS, motif/fade
choreography, time-over release, rollback/netplay, and full parity.

## Acceptance evidence

- Implementation: `RuntimeRoundSystem` resolves one immutable-default-backed
  `RuntimeRoundTiming` object; `PlayableMatchRuntimeOptions.roundTiming` feeds
  bounded overrides into the round and win-pose readiness path.
- Commit: `14460d38`.
- Focused verification: `4` timing/readiness assertions passed;
  `pnpm typecheck` and `git diff --check` passed.
- Broad verification: `pnpm test` passed `233` files / `2458` tests; build,
  typecheck, both boundary checks, and `pnpm qa:trace` passed `633/633`
  artifacts (`599` required, `34` optional) without golden refresh.
- Closeout: [`docs/reports/2026-07-18-runtime-round-timing-configuration-closeout.md`](../../../../docs/reports/2026-07-18-runtime-round-timing-configuration-closeout.md).
