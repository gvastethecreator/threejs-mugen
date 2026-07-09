# Choose next runtime gap after SuperPause sound typed audio

Type: research
Status: done
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after dynamic `SuperPause sound` typed `audio:playsnd` telemetry to keep the MUGEN/IKEMEN Three.js port moving without weakening evidence quality?

## Answer

Selected and implemented bounded direct `HitDef hitsound` / `guardsound` typed `audio:playsnd` telemetry.

Evidence:

- Official source checked: Elecbyte State Controller Reference defines expression-capable numeric controller params and `HitDef hitsound` / `guardsound` sound group/index params.
- Runtime route: direct contact presentation records a typed `audio:playsnd` operation when the resolved contact sound ref exists, while preserving the authored raw sound ref in `RuntimeSoundEvent`.
- Trace gates: `synthetic-imported-hitdef-dynamic-hitsound.json` trace checksum `fe3c0f3d` / final checksum `855df386`; `synthetic-imported-hitdef-dynamic-guardsound.json` trace checksum `bb38362a` / final checksum `3e0ddeb0`.
- Required operation evidence now includes `audio:playsnd` beside `variable:varset` and `hitdef`.

Still blocked: exact SND archive lookup, browser playback parity, channel priority, timing, mixing, panning semantics, helper/redirect ownership, projectile contact sound operations, super-background audio, score movement, and full audio parity.
