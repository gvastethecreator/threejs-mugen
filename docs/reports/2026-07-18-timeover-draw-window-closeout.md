# Time-over Draw Window Closeout

Date: 2026-07-18
Ticket: Wayfinder 278
Implementation commit: `a2ce3298`

## Result

Time-over now uses the same bounded post-round authority as KO. The runtime
keeps `playing = true` through the initial phase-3 close, opens phase `4` at
the configured boundary, and stops only when the resolved post-round duration
expires. When both imported roots expose reserved state `175`, the existing
win-pose system now reaches the draw pose before terminal closure.

`RoundNotOver` holds the phase-4 time-over clock, while KO-only slowdown remains
KO-only. `MatchWorld`, the repository stage journey, and stage/runtime tests
now wait for the terminal frame before opening the next round.

## Evidence

- Focused runtime/world/journey checkpoint: `928/928` assertions passed across
  `7` test files.
- `pnpm typecheck`: passed with TypeScript `7.0.2`.
- `pnpm test`: passed with `233` test files / `2462` tests.
- `pnpm build`: passed with Vite `8.0.16`; bundle `dist/assets/index-D6ohALx9.js`
  is about `1,985.23 kB` and retains the existing large-chunk warning.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `pnpm qa:trace`: passed `633/633` artifacts: `599` required and `34`
  optional. Controller families remained `92`, operation families `87`, and
  default goldens stayed stable, including `mugen-lite-journey-nokoslow` at
  `3013c0b8`.
- `git diff --check`: passed before commit.

## Changed ownership

| Surface | Result |
| --- | --- |
| `RuntimeRoundSystem` | Time-over owns a bounded `postRound` frame window and phase-4 transition. |
| `RuntimeMatchRoundWorld` | Phase-4 `RoundNotOver` hold covers KO and time-over. |
| `RuntimeRoundWinPoseWorld` consumer | Existing draw mapping can now enter `175` when available. |
| `MatchWorld` / stage journeys | Next-round calls drain terminal post-round state first. |
| KO defaults | Preserved; no KO golden refresh was required by the focused checkpoint. |

## Claim ceiling

This closeout allows only bounded local time-over progression, optional draw
state `175`, and terminal stop ownership. It does not claim exact upstream
release/fade/motif/dialogue behavior, `over.hittime`, `over.forcewintime`, skip
input, Common1/ZSS, full team/Turns choreography, rollback/netplay, or full
MUGEN/IKEMEN parity.

## Next frontier

The next independent round debt is release ownership: source-map
`over.hittime`, `over.forcewintime`, skip behavior, and fade/motif boundaries
before widening any full match-end choreography. Score movement remains
blocked until those behaviors have their own executable evidence.
