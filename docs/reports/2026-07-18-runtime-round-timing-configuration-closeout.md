# Runtime Round Timing Configuration Closeout

Date: 2026-07-18  
Ticket: Wayfinder 276  
Implementation commit: `14460d38`

## Result

The runtime now resolves one `RuntimeRoundTiming` contract at construction.
The defaults preserve the existing behavior: phase `4` opens at post-KO frame
`45`, reserved win/lose/draw state readiness waits another `45` frames,
terminal post-KO duration is `255`, slowdown is `60` frames, fade is `45`
frames, and slowdown rate is `0.25`.

`PlayableMatchRuntimeOptions.roundTiming` can provide bounded overrides. The
round clock and the win-pose caller read the same resolved values, so a fixture
cannot move one boundary without moving the other. Invalid values normalize
deterministically and the default snapshot shape remains unchanged.

## Evidence

- Focused proof passed: normalized timing reaches phase `4` at the configured
  frame, and configured win-pose readiness reaches the reserved-state handoff
  at the derived boundary (`4` targeted assertions).
- `pnpm typecheck` passed.
- `git diff --check` passed before documentation staging.
- `pnpm test` passed `233` test files / `2458` tests when run alone.
- `pnpm build` passed with Vite `8.0.16`; the production bundle is
  `dist/assets/index-3p4f0i5z.js` at about `1,984.05 kB` and retains the
  existing large-chunk warning.
- `pnpm check:boundaries` passed.
- `pnpm check:redirect-boundary` passed.
- `pnpm qa:trace` passed `633/633` artifacts: `599` required and `34`
  optional. Controller families remained `92`; operation families remained
  `87`. Default legal no-KO-slow checksum remained `3013c0b8`.

## Claim ceiling

This closes bounded timing configuration plumbing, not parsed source timing or
exact MUGEN/IKEMEN round behavior. Fightscreen parsing, exact frame-start
ordering, `over.forcewintime`, skip-input behavior, Common1/ZSS, time-over
release, motif/fade choreography, Turns/team release, rollback/netplay, and
complete parity remain open.

## Global status

The match-end lane now has one shared timing authority for phase progression,
win-pose readiness, post-KO duration, and KO slowdown. The next high-value
frontier is an adapter from imported fightscreen/round configuration into this
contract, followed by independent release and time-over evidence. This ticket
does not move the global compatibility score.

## Sources

- [Pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683)
- [Pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3268)
- [Pinned IKEMEN-GO fight-screen defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174)
