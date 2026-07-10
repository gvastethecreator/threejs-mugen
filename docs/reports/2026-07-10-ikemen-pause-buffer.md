# IKEMEN Simultaneous Pause Buffer Closeout

Date: 2026-07-10

## Result

Explicit `ikemen-go` matches now keep Pause and SuperPause in separate slots. Same-frame requests of one type retain the longer duration, preserve the first owner on ties, and permit same-owner replacement. SuperPause runs first; buffered Pause does not decrement until SuperPause ends. Other profiles retain last-controller-wins behavior.

## Source Contract

- [IKEMEN GO Pause/SuperPause selection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8985-L9030).
- [IKEMEN GO timer precedence](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2634-L2649).
- Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Evidence

- Required trace: `synthetic-imported-ikemen-pause-buffer.json`.
- Checksum: `5ea4a969`; final checksum: `04c85ed6`.
- P1 requests Pause `9`; P2 requests Pause `4` plus SuperPause `2` in the same active frame.
- Evidence observes P2 SuperPause for two frames, then P1 Pause at full remaining `9`.
- Aggregate: 533/533 artifacts; 502 required and 31 optional.
- Verification: 160 files / 1576 tests, `pnpm typecheck`, `pnpm build`, and `pnpm check:boundaries` pass. Build retains the known large-chunk warning.

## Claims

Allowed: explicit IKEMEN 1v1 roots use bounded same-frame Pause/SuperPause owner arbitration and separate timer precedence.

Blocked: actor-local simultaneous movetime, helper/custom-state pause ownership, simultaneous SuperPause `p2defmul` stacking, exact hitpause interaction, teams/simul/tag, rollback/netplay, score movement, and full IKEMEN pause parity.

No visual surface changed, so browser smoke was not required.
