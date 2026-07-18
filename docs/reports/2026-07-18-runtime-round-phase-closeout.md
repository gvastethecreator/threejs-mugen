# Runtime Round Phase Closeout

Date: 2026-07-18  
Ticket: Wayfinder 271  
Commit: `89403690`

## Result

The runtime now owns a typed `RuntimeRoundPhase/v0` boundary with official
values `0..4`, named legal transitions, invalid-transition diagnostics, and a
profile label. `RuntimeRoundSystem` publishes phase `3` on round finish and
phase `4` after the bounded KO post-round window; reset and next-round restore
phase `2`. Actor snapshots synchronize with the round phase, while normal
phase-2 snapshots keep their historical shape. `RoundState` now reads actor
phase with legacy fallback `2`.

## Evidence

- Focused runtime/expression/playable coverage: `5` files / `295` tests passed.
- `pnpm typecheck` passed with TypeScript 7.
- `git diff --check` passed for the implementation surface.
- Browser smoke: N/A, no visible consumer changed.
- Official value reference: [Elecbyte RoundState trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html).

## Claim Ceiling

Allowed: bounded typed phase lifecycle and dynamic `RoundState` for the
current runtime. Blocked: exact intro/motif timing, winpose execution,
MatchOver timing, Common1/ZSS execution, Turns transaction parity,
rollback/netplay, and full MUGEN/IKEMEN parity. No score movement.
