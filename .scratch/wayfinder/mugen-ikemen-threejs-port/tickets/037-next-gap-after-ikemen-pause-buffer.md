# Choose next gap after IKEMEN Pause buffers

Type: research
Status: resolved
Blocked by: None

## Question

What minimal actor-local pause ledger and paused actor loop can support simultaneous root/helper `pausemovetime` / `supermovetime` and SuperPause `p2defmul` stacking without regressing legacy profiles?

## Candidate Inputs

- Pinned IKEMEN GO per-character `pauseMovetime`, `superMovetime`, `unhittableTime`, and `superDefenseMulBuffer` behavior.
- Current unified root/helper RunOrder and single-source `RuntimePausedMatchWorld` branch.
- Existing helper pause/supermovetime, SuperPause defense multiplier, and pause interruption traces.
- Profile boundary preserving `mugen-1.1` and `unknown` behavior.

## Answer

Use one profile-gated per-pause actor ledger in `RuntimePauseWorld` and one ordered paused-actor executor shared by roots/helpers. Each Pause/SuperPause request records the caller's local move allowance even when that request does not win global ownership; the paused pass consumes root allowances and existing helper allowances independently in prepared RunOrder, appending helpers created during action. Positive same-frame SuperPause `p2defmul` requests multiply the current target defense scale and retain one original value for session-end restoration.

Required traces prove simultaneous root/helper movement and multiplicative target scaling. Legacy profiles retain their established paused branch. Pause/SuperPause created during the paused pass still replace immediately and interrupt the remaining list; defer that lifecycle question to ticket 038.
