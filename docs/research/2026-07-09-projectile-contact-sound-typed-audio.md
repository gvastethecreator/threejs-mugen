# Projectile Contact Sound Typed Audio

Date: 2026-07-09

## Question

Can bounded imported Projectile hit/guard contact sound refs be promoted from sound-event telemetry to typed `audio:playsnd` operation telemetry without claiming full MUGEN audio parity?

## Answer

Yes, for the current player-owned Projectile contact routes. The repo can resolve `hitsound` / `guardsound` when the Projectile is spawned, carry the resolved sound refs through contact presentation, record typed `audio:playsnd` telemetry on hit/guard contact, and preserve existing `RuntimeSoundEvent` plus FightFX package metadata.

## Sources

- Elecbyte State Controller Reference, `Projectile`: https://www.elecbyte.com/mugendocs/sctrls.html
- Elecbyte State Controller Reference, `HitDef hitsound` / `guardsound`: https://www.elecbyte.com/mugendocs/sctrls.html
- Local traces: `synthetic-imported-projectile-contact.json`, `synthetic-imported-projectile-guard.json`.

## Findings

- Elecbyte documents `Projectile` as using HitDef parameters plus Projectile-specific parameters.
- Elecbyte documents numeric controller params as expression-capable unless stated otherwise.
- Elecbyte documents `HitDef hitsound` and `guardsound` as sound group/index refs, with `S` selecting the player's SND data and no opponent SND path for guard sound.
- Existing repo Projectile contact gates already preserved attacker-side sound events and FightFX package metadata, so this slice only needed to add typed operation telemetry for the resolved sound ref.

## Evidence

- `synthetic-imported-projectile-contact.json`: trace checksum `57b3b556`, final checksum `e0f3e41c`, executed ops include `hitdef = 1`, `projectile = 1`, and `audio:playsnd = 1`.
- `synthetic-imported-projectile-guard.json`: trace checksum `eb9c2e58`, final checksum `b1c74e5e`, executed ops include `hitdef = 1`, `projectile = 1`, and `audio:playsnd = 1`.
- Focused tests cover contact presentation, combat resolution, match bridge audio recording, effect-spawn sound resolution, and trace preset requirements.
- `pnpm qa:trace` passes 524/524 artifacts, 493 required and 31 optional.

## Uncertainty

- This does not prove exact SND archive lookup, channel priority, panning, timing, mixing, helper-owned Projectile contact sound operation telemetry, helper/redirect/team ownership, or renderer/audio parity.

## Decision Impact

Treat player-owned Projectile hit/guard contact sound typed telemetry as closed. Keep helper-owned Projectile contact sound operation telemetry and exact audio/presentation parity as future tickets.
