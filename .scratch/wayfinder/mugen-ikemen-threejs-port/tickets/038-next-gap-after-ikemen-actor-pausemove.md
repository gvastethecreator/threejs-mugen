# Choose next gap after IKEMEN actor-local pause movement

Type: research
Status: resolved
Blocked by: None

## Question

What minimal deferred Pause/SuperPause activation boundary lets every eligible actor finish the current paused RunOrder pass before newly requested pause state becomes visible, while preserving same-frame arbitration and defense-multiplier restoration?

## Candidate Inputs

- Pinned IKEMEN GO character-list action loop and pause buffer commit timing.
- Current `RuntimePausedActorAdvanceWorld` interruption behavior.
- Existing same-frame pause arbitration and actor-local movement traces.
- Helper-created Pause/SuperPause and exact hitpause ordering as adjacent blocked scope.

## Answer

Use profile-gated pending Pause and SuperPause slots while `RuntimePausedActorAdvanceWorld` executes. Controller requests still record actor-local movement and arbitrate pending same-type candidates, but `current()` remains the active session until every eligible actor and paused presentation finish. The active timer ticks once; pending slots are then committed for the next runtime branch. On failure, pending activation is cancelled.

Deferred SuperPause target-defense effects receive the newly created session explicitly, avoiding accidental association with the old current Pause. Required trace `synthetic-imported-ikemen-deferred-pause-activation.json` proves P2 still executes after P1 requests a replacement during the paused frame. Exact post-frame buffer visibility remains a bounded source-oracle gap.
