# Choose next gap after IKEMEN deferred pause activation

Type: research
Status: open
Blocked by: None

## Question

What minimal helper execution context can route helper-created Pause/SuperPause through the helper's runtime identity, root/team ownership, local movement allowance, sounds, and target-defense scope without duplicating root controller behavior?

## Candidate Inputs

- Pinned IKEMEN GO helper character identity and Pause/SuperPause controller paths.
- Current helper controller context, owner-backed effects, and paused actor list.
- Root-only `applyMatchPauseController` and current-target `p2defmul` bridge.
- Existing helper pause/supermovetime traces and helper RunOrder evidence.

## Answer

Pending source/runtime-shape and migration-risk review.
