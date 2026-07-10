# Choose next gap after IKEMEN helper RunOrder

Type: research
Status: resolved
Blocked by: None

## Question

What bounded source-backed contract should govern simultaneous root Pause/SuperPause creation, ownership, overwrite priority, and movetime on the prepared actor list?

## Candidate Inputs

- Pinned IKEMEN GO Pause/SuperPause controller execution and global pause storage.
- Existing `RuntimePauseWorld`, `RuntimeMatchPauseControllerWorld`, and same-tick prepared actor-pass behavior.
- Required Pause/SuperPause, movetime, defense-multiplier, and schedule-phase traces.
- Explicit compatibility-profile boundary between IKEMEN policy and preserved MUGEN/unknown behavior.

## Answer

Selected bounded root ownership and timer arbitration before actor-local movetime. Explicit `ikemen-go` now keeps separate Pause/SuperPause slots, retains longer same-frame same-type requests, preserves first-owner ties, permits same-owner replacement, and gives SuperPause precedence without decrementing retained Pause. Required `synthetic-imported-ikemen-pause-buffer.json` passes at checksum `5ea4a969` / final `04c85ed6` inside 533/533 gates. IKEMEN stores movetime per actor and stacks SuperPause `p2defmul` independently, so those behaviors remain an explicit follow-up rather than being approximated through the single-source paused branch.
