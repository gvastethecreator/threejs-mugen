# IKEMEN Root/Helper RunOrder Closeout

Date: 2026-07-10

## Result

Explicit `ikemen-go` matches now schedule roots and helpers through one ordered actor list. Existing helpers participate in source-backed priorities; a helper spawned while a root runs is appended and advanced later in that same tick. The legacy bulk helper pass remains active for `mugen-1.1` and `unknown`.

## Source Contract

- Pinned source: [IKEMEN GO `CharList.updateRunOrder` and `action`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13096-L13175).
- Priorities: exclusive RunFirst/RunLast, attacking actor, idle root, remaining root, idle helper, remaining helper; lower stable actor ID breaks ties.
- Action loop: prepare actors first, run sequentially, and permit appended helpers to be visited later in the same loop.

## Evidence

- Required trace: `synthetic-imported-ikemen-helper-runorder.json`.
- Checksum: `174f927d`; final checksum: `3906023d`.
- Trace proof: `p1-helper-0` is spawned by P1, receives `RunOrder = 3`, routes to state `1282`, reaches age `1`, and records one `helper:controllers` phase in frame 1.
- Aggregate: 532/532 trace artifacts; 501 required and 31 optional.
- Verification: 160 files / 1572 tests, `pnpm typecheck`, `pnpm build`, and `pnpm check:boundaries` pass. Build retains the known large-chunk warning.

## Claims

Allowed: explicit IKEMEN 1v1 roots and helpers share bounded source-backed RunOrder, including same-tick advancement of a newly appended helper.

Blocked: teams/simul/tag, nested helper creation, simultaneous Pause/SuperPause ownership, exact Pause/hitpause ordering, rollback/netplay, score movement, and full IKEMEN actor-loop parity.

No visual surface changed, so browser smoke was not required.
