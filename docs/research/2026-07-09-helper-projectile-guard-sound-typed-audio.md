# Helper Projectile Guard Sound Typed Audio

Date: 2026-07-09

## Question

Can bounded first-generation helper-parented/root-owned Projectile guard-contact sound refs be promoted from sound-event telemetry to typed `audio:playsnd` operation telemetry without claiming full helper/audio parity?

## Answer

Yes, for the current helper Projectile guard-contact routes. The helper-local micro-VM can resolve `guardsound` when the helper spawns the Projectile, carry that resolved sound ref into the root-owned Projectile payload, and let contact presentation record typed `audio:playsnd` telemetry while preserving existing sound-event and FightFX package metadata.

## Sources

- Elecbyte State Controller Reference, `Projectile`: https://www.elecbyte.com/mugendocs/sctrls.html
- Elecbyte State Controller Reference, `HitDef hitsound` / `guardsound`: https://www.elecbyte.com/mugendocs/sctrls.html
- Local traces: `synthetic-imported-helper-projectile-guard-ko.json`, `synthetic-imported-helper-projectile-guard-kill.json`, `synthetic-imported-helper-projectile-guard-terminal.json`.

## Findings

- Elecbyte documents `Projectile` as using HitDef parameters plus Projectile-specific parameters.
- Elecbyte states that Projectiles created by helpers immediately become owned by the root.
- Elecbyte documents numeric controller params as expression-capable unless stated otherwise.
- Elecbyte documents `HitDef hitsound` and `guardsound` as sound group/index refs, with `S` selecting the player's SND data.
- Existing helper Projectile guard gates already preserved root-owned guard contact package evidence, so this slice only needed helper-local sound-ref resolution plus typed operation telemetry requirements.

## Evidence

- `synthetic-imported-helper-projectile-guard-ko.json`: trace checksum `05dbcded`, final checksum `98b8bf17`, required executed ops include `helper`, `projectile`, and `audio:playsnd`.
- `synthetic-imported-helper-projectile-guard-kill.json`: trace checksum `33930a00`, final checksum `8412e638`, required executed ops include `helper`, `projectile`, and `audio:playsnd`.
- `synthetic-imported-helper-projectile-guard-terminal.json`: trace checksum `c6937f42`, final checksum `e0835e33`, required executed ops include `helper`, `projectile`, and `audio:playsnd`.
- Focused tests cover helper-local sound value resolution and trace preset requirements.
- `pnpm qa:trace` passes 524/524 artifacts, 493 required and 31 optional.

## Uncertainty

- This does not prove helper Projectile normal-hit contact sound typed telemetry, exact SND archive lookup, channel priority, panning, timing, mixing, broader helper/redirect/team ownership, or renderer/audio parity.

## Decision Impact

Treat bounded helper Projectile guard-contact sound typed telemetry as closed. Keep helper Projectile normal-hit sound, broader ownership, and exact audio/presentation parity as future tickets.
