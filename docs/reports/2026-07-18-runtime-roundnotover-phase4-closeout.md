# Runtime Phase-4 RoundNotOver Closeout

Date: 2026-07-18  
Ticket: Wayfinder 274  
Implementation commit: `db36894c`

## Result

The runtime now opens bounded phase `4` during the post-KO window instead of
waiting for terminal expiry. An imported state `180` can execute its authored
`AssertSpecial RoundNotOver` controller; while that flag remains active, the
post-KO frame and remaining values stay stable and `playing` remains true. When
the flag clears, the same clock resumes.

## Evidence

- Focused runtime/playable coverage: `4` files / `287` tests passed.
- `pnpm typecheck` passed.
- `git diff --check` passed before commit.
- Browser smoke: N/A; this slice changes renderer-independent round timing and
  snapshot state only.

## Global status

Bounded local match-end coverage now includes phase progression, reserved
win/lose state entry, and a live `RoundNotOver` hold for active normal/tag
actors. This does not advance the full compatibility score. Exact IKEMEN
`over_waittime`/`over_wintime` readiness, Common1/ZSS execution, time-over draw
state `175`, motif/dialogue/fade choreography, Turns/effective-loss, Simul,
rollback/netplay, Studio editing, and complete parity remain open.

## Next frontier

Connect the hold to source-backed Common1/ZSS readiness and exact timing data,
then audit release conditions and time-over separately. Keep score projection
and next-round commit ownership unchanged.

## Source record

- [Elecbyte MatchOver trigger](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
- [Elecbyte AssertSpecial](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
- [Pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683)
- [Pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3330)
