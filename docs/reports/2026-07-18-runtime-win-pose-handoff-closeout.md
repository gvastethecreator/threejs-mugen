# Runtime Win-Pose Handoff Closeout

Date: 2026-07-18  
Ticket: Wayfinder 273  
Implementation commits: `4d9d6f76`, `2bb4a476`

## Result

The runtime now owns a bounded `RuntimeRoundWinPose/v0` handoff at phase `4`.
For the active normal/tag pair it requests state `180` for the winner, `170`
for the loser, and `175` for a draw. The existing state-entry availability
boundary decides whether the requested state can start; unavailable states and
ambiguous winner labels remain explicit diagnostics. The result is exposed in
both actor `runtime.winPose` and round `winPose` snapshots, while score
projection and commit ownership remain unchanged.

## Evidence

- Focused runtime/playable coverage: `2` files / `266` tests passed.
- `pnpm typecheck` passed.
- `pnpm test`: `233` files / `2453` tests passed.
- `pnpm build` passed with the existing Vite large-chunk warning.
- `pnpm check:boundaries` passed.
- `pnpm check:redirect-boundary` passed.
- Final `pnpm qa:trace` passed `633/633` artifacts: `599` required and `34`
  optional, with no additional golden drift.
- Browser smoke: N/A; no visible UI or renderer contract changed.

## Global status

The port now has bounded evidence for the transition from KO phase `4` into
available reserved win/lose states in normal/tag local rounds. This does not
advance the full compatibility score. Exact MUGEN/IKEMEN timing, Common1/ZSS
controller execution, `RoundNotOver`, time-over win/draw states, motif/fade
ownership, Turns/effective-loss, Studio editing, rollback/netplay, and complete
parity remain open.

## Next frontier

The next match-end slice should connect the handoff to Common1 `RoundNotOver`
and timing readiness, with an independent source-backed contract. Keep score
commit and the current projection separate.
