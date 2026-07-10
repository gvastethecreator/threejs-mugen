# Actor-Scoped Web Audio Channels

Date: 2026-07-10
Status: implemented and focused-test verified

## Question

Should numbered browser playback channels be global across the match or scoped to the runtime actor that emitted the sound event?

## Answer

They must be actor-local. Elecbyte defines the number as one of the player's sound channels. The explicit cross-player exception is `StopSnd channel = -1`, which stops all sounds including those belonging to other players.

## Primary Source

- Elecbyte State Controller Reference: <https://www.elecbyte.com/mugendocs/sctrls.html>
  - `PlaySnd channel`: one voice may play on a particular player channel; omitted channel defaults to `-1`, any free channel.
  - `lowpriority`: applies only to a selected non-`-1` channel.
  - `SndPan channel`: pans the selected currently playing channel.
  - `StopSnd channel`: stops the selected channel; `-1` stops all sounds including other players.

## Baseline Risk

`MugenAudioSystem` used `Map<number, RuntimeAudioSourceHandle>`. Two actors using channel `2` shared one entry, so one could interrupt, block through `lowpriority`, pan, or stop the other's source.

## Implementation

- Added `RuntimeAudioChannelStore`, keyed by runtime actor id plus channel.
- Routed active checks, replacement, `SndPan`, numbered `StopSnd`, and `ended` cleanup through actor-local identity.
- Added per-actor/channel request generations so stale asynchronous WAV decodes cannot start after a newer request.
- Kept channel `-1` and `stopAll()` global.

## Evidence

- Focused red: two actor-scope store tests failed before the store existed.
- Focused green: 9/9 `MugenAudioSystem` tests.
- Controlled AudioContext integration proves P1/P2 channel `2` coexist and a later P1 event stops only P1's prior source.
- The same integration route proves numbered P1 `StopSnd` stops P1's current source without stopping P2's matching channel.
- Deferred-decode integration proves the newest actor-channel request wins when WAV decoding completes out of order.
- TypeScript 7 typecheck passes.

## Claim Boundary

Allowed: bounded browser playback prevents matching numbered channels from cross-interrupting, cross-blocking, cross-panning, or cross-stopping between runtime actors.

Blocked: exact free-channel allocation for omitted/`-1`, channel `0` cancellation on hit, common/system/BGM ownership, broader priority/mix rules, perceptual/device parity, and full MUGEN/IKEMEN audio parity.
