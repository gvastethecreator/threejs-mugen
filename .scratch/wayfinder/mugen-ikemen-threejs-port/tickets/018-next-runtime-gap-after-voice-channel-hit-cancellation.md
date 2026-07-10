# Choose next runtime gap after voice channel hit cancellation

Type: research
Status: open
Blocked by: None

## Question

Which bounded R1/R2 gap should follow actor-local channel `0` hit cancellation while maximizing playable MUGEN-lite correctness?

## Candidate Inputs

- Exact omitted/`-1` free-channel allocation.
- Common/FightFX/system SND ownership across multiple imported actors.
- KO voice/sound policy and `AssertSpecial nokosnd` browser handoff.
- HitOverride/reversal voice-channel cancellation policy.
- Broader helper-as-defender or team/simul actor audio ownership.
- A higher-leverage Common1, Studio, renderer, IKEMEN, or modular-boundary slice.
