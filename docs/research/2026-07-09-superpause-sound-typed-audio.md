# SuperPause Sound Typed Audio Research

Date: 2026-07-09

## Question

Can bounded imported `SuperPause sound = Svar(0),var(1)` be treated as typed `audio:playsnd` telemetry while preserving pause semantics and authored raw sound evidence?

## Primary Source

- Elecbyte State Controller Reference: https://www.elecbyte.com/mugendocs/sctrls.html

## Findings

- Elecbyte documents state-controller numeric parameters as arithmetic-expression capable unless otherwise specified.
- Elecbyte documents `SuperPause sound = snd_grp, snd_no`, with default `-1`, and says prefixing `snd_grp` with `S` uses the player's own SND data.
- `SuperPause sound` is pause-start audio metadata, not a full `PlaySnd` controller. Treating it as typed `audio:playsnd` telemetry is valid only for the bounded trace/debug operation family, while the runtime still preserves the raw authored sound ref in `RuntimeSoundEvent.raw`.

## Implementation Posture

Allowed claim: bounded imported dynamic SuperPause sound refs can resolve at pause start into typed `audio:playsnd` operation evidence plus existing sound-event telemetry.

Blocked claim: exact common/player SND archive lookup, channel priority, timing, mixing, panning semantics, super-background audio, helper/redirect ownership, direct HitDef audio operation telemetry, score movement, and full audio parity remain out of scope.
