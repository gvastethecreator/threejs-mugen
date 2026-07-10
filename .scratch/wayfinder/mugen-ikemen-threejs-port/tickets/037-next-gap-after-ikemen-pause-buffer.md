# Choose next gap after IKEMEN Pause buffers

Type: research
Status: open
Blocked by: None

## Question

What minimal actor-local pause ledger and paused actor loop can support simultaneous root/helper `pausemovetime` / `supermovetime` and SuperPause `p2defmul` stacking without regressing legacy profiles?

## Candidate Inputs

- Pinned IKEMEN GO per-character `pauseMovetime`, `superMovetime`, `unhittableTime`, and `superDefenseMulBuffer` behavior.
- Current unified root/helper RunOrder and single-source `RuntimePausedMatchWorld` branch.
- Existing helper pause/supermovetime, SuperPause defense multiplier, and pause interruption traces.
- Profile boundary preserving `mugen-1.1` and `unknown` behavior.

## Answer

Pending source/runtime-shape and migration-risk review.
