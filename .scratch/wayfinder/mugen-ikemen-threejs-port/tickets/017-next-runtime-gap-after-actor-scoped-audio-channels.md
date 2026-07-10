# Choose next runtime gap after actor-scoped audio channels

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should follow actor-scoped numbered Web Audio channels while moving the playable MUGEN-lite port toward broader real-content correctness?

## Candidate Inputs

- Exact bounded behavior for omitted/`-1` free-channel playback.
- Voice channel `0` cancellation when the owning actor is hit.
- Common/FightFX/system SND ownership across multiple imported actors.
- Remaining helper/Projectile/target gates whose sound packages lack required typed audio assertions.
- A non-audio Common1, ownership, Studio, renderer, or IKEMEN slice with stronger evidence leverage.

## Answer

Resolved 2026-07-10: select official channel `0` voice cancellation on accepted hit.

Implementation result: shared `RuntimeDirectCombatWorld` increments defender `receivedHitSequence` for accepted normal hit and leaves it unchanged on guard. `MugenAudioSystem` consumes each new sequence once after snapshot sound events, stopping only actor-local channel `0` and cancelling pending same-frame decode. Controlled integration proves P2 survives and later voices can play without repeated hitstun cancellation. `pnpm qa:trace` remains 524/524 with stable checksum projection.

Claim blocked: helper-as-defender breadth, exact simultaneous/multi-hit ordering, common/system/BGM ownership, KO voice policy, perceptual parity, score movement, and full audio parity.

Next frontier: `018-next-runtime-gap-after-voice-channel-hit-cancellation.md`.
