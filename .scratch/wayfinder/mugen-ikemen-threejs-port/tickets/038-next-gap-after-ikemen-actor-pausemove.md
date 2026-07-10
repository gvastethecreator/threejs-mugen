# Choose next gap after IKEMEN actor-local pause movement

Type: research
Status: open
Blocked by: None

## Question

What minimal deferred Pause/SuperPause activation boundary lets every eligible actor finish the current paused RunOrder pass before newly requested pause state becomes visible, while preserving same-frame arbitration and defense-multiplier restoration?

## Candidate Inputs

- Pinned IKEMEN GO character-list action loop and pause buffer commit timing.
- Current `RuntimePausedActorAdvanceWorld` interruption behavior.
- Existing same-frame pause arbitration and actor-local movement traces.
- Helper-created Pause/SuperPause and exact hitpause ordering as adjacent blocked scope.

## Answer

Pending source/runtime-shape and migration-risk review.
