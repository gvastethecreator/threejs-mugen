# Choose next runtime gap after helper HitDef persistence sound typed audio

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should follow first-generation helper direct-HitDef/persistence typed contact audio while preserving evidence quality and the playable sandbox?

## Candidate Inputs

- Remaining required traces with authored contact sound packages but no typed `audio:playsnd`.
- Nested helper ancestry, target ownership, redirect/team semantics, or another shared MatchWorld boundary.
- Exact SND lookup/playback only if it can be bounded without overclaiming channel/mix parity.
- Parser-only controller families that can graduate to deterministic typed operations.
- Studio or renderer work only with browser and visual evidence.

## Answer

Resolved 2026-07-10: select actor-scoped numbered Web Audio channels as the next R1/R2 gap.

The trace corpus proved broad sound-event/typed-operation flow, but `MugenAudioSystem` stored active numbered channels in one global `Map<number>`. Elecbyte defines `PlaySnd channel` as one of the player's channels, while only `StopSnd -1` explicitly stops sounds belonging to other players.

Implementation result: `RuntimeAudioChannelStore` keys sources by runtime actor plus channel. P1 and P2 can play channel `2` concurrently; a later P1 source replaces only P1's source; numbered pan/stop and `ended` cleanup use the same identity; request generations reject stale out-of-order WAV decodes; global stop remains explicit. Focused tests pass 9/9 with controlled and deferred AudioContext integration routes.

Claim blocked: exact free-channel allocation, channel `0` hit cancellation, broader priority/mix semantics, common/system/BGM ownership, perceptual parity, score movement, and full audio parity.

Next frontier: `017-next-runtime-gap-after-actor-scoped-audio-channels.md`.
