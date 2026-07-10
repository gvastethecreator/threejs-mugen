# Choose next runtime gap after actor-scoped audio channels

Type: research
Status: open
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should follow actor-scoped numbered Web Audio channels while moving the playable MUGEN-lite port toward broader real-content correctness?

## Candidate Inputs

- Exact bounded behavior for omitted/`-1` free-channel playback.
- Voice channel `0` cancellation when the owning actor is hit.
- Common/FightFX/system SND ownership across multiple imported actors.
- Remaining helper/Projectile/target gates whose sound packages lack required typed audio assertions.
- A non-audio Common1, ownership, Studio, renderer, or IKEMEN slice with stronger evidence leverage.
