# HitDef Contact Sound Typed Audio

Date: 2026-07-09

## Question

Can bounded direct `HitDef hitsound` / `guardsound` refs that already resolve through runtime expression fallback be recorded as typed `audio:playsnd` telemetry without claiming exact MUGEN/IKEMEN playback parity?

## Answer

Yes, for the current direct-contact trace routes only. The bounded implementation may record a typed `audio:playsnd` operation after a direct `HitDef` contact sound ref resolves to a concrete group/index pair, while preserving the authored raw ref in `RuntimeSoundEvent` debug/trace telemetry.

## Primary Source

- Elecbyte State Controller Reference: https://www.elecbyte.com/mugendocs/sctrls.html

## Findings

- Elecbyte documents numeric state-controller parameters as arithmetic-expression capable unless a parameter says otherwise, with bottom resolving to `0`.
- `HitDef` defines `hitsound = snd_grp, snd_item` and `guardsound = snd_grp, snd_item` as sound group/index pairs.
- The `S` prefix selects the player's SND for `hitsound`; the same opponent-SND prefix behavior is not available for `guardsound`.
- The reference describes parameter shape, not browser playback, channel priority, timing, mixing, helper ownership, or archive lookup behavior.

## Implementation Decision

- Record typed `audio:playsnd` telemetry only when the direct `HitDef` contact path already has a resolved `RuntimeResolvedSoundRef`.
- Keep `RuntimeSoundEvent.raw` as the authored expression, such as `Fvar(0),var(1)`.
- Keep exact playback, archive lookup, channel priority, timing, mixing, panning, helper/redirect ownership, projectile contact sound operations, and full audio parity outside this slice.

## Evidence Hook

- `synthetic-imported-hitdef-dynamic-hitsound.json`: trace checksum `fe3c0f3d`, final checksum `855df386`, requires `audio:playsnd`.
- `synthetic-imported-hitdef-dynamic-guardsound.json`: trace checksum `bb38362a`, final checksum `3e0ddeb0`, requires `audio:playsnd`.
