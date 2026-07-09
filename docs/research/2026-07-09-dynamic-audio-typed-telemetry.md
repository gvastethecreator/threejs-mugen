# Dynamic Audio Typed Telemetry Research

Date: 2026-07-09

## Question

Can the runtime safely record typed `audio:*` operation telemetry for bounded dynamic `PlaySnd`, `SndPan`, and `StopSnd` controller params after active expression resolution?

## Answer

Yes, for the current bounded imported active-state routes. Elecbyte's State Controller Reference says numeric controller params, except `persistent` and `ignorehitpause`, can be arithmetic expressions unless otherwise specified. The same reference defines `PlaySnd value = group_no, sound_no`, the optional `F` prefix for common/fight sounds, `PlaySnd channel/pan/abspan` metadata, `SndPan channel/pan/abspan`, and `StopSnd channel`. That supports recording resolved typed telemetry after the active controller expression context has evaluated the params, while preserving the authored raw sound ref for debug/event evidence.

## Sources

- Elecbyte State Controller Reference, version 1.0 docs, updated 2010-09-13: https://www.elecbyte.com/mugendocs/sctrls.html
- Local trace evidence after implementation: `.scratch/qa/trace-gates/synthetic-imported-sound-dynamic-pan.json`
- Local trace evidence after implementation: `.scratch/qa/trace-gates/synthetic-imported-sound-dynamic-value.json`

## Findings

- Numeric controller params may be arithmetic expressions unless a controller says otherwise; bottom resolves to `0`.
- `PlaySnd` has a required `value = group_no, sound_no` pair and optional channel, low priority, volume scale, frequency multiplier, looping, pan, and absolute pan params.
- A leading `F` on the `PlaySnd` group selects the common/fight sound namespace in the official docs; preserving that prefix after dynamic resolution is required for bounded `soundPrefix` telemetry.
- `SndPan` and `StopSnd` are channel-oriented audio controllers, so resolved dynamic channel/pan/abspan params can be recorded as typed operation evidence without claiming actual Web Audio parity.

## Implementation Impact

- Add a runtime-side dynamic audio operation resolver for active `PlaySnd`, `SndPan`, and `StopSnd` dispatch when compiler-time static lowering intentionally returned no operation.
- Keep `RuntimeSoundEvent.raw` as the authored raw expression for dynamic sound refs, while using the resolved operation value to compute group/index/prefix telemetry.
- Strengthen required traces so `synthetic-imported-sound-dynamic-pan.json` requires `audio:playsnd`, `audio:sndpan`, and `audio:stopsnd`, and `synthetic-imported-sound-dynamic-value.json` requires `audio:playsnd`.

## Uncertainty

This does not prove exact channel priority, playback timing, SND archive lookup, stereo panning math, helper/redirect ownership, super-background audio, or full MUGEN/IKEMEN audio parity. Dynamic direct `HitDef` sounds and `SuperPause sound` remain event/pause telemetry paths without active-state `audio:*` operation claims.
