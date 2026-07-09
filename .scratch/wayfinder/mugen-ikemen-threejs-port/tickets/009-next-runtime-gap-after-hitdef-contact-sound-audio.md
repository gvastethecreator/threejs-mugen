# Choose next runtime gap after HitDef contact sound typed audio

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after direct `HitDef hitsound` / `guardsound` typed `audio:playsnd` telemetry to keep the MUGEN/IKEMEN Three.js port moving without weakening evidence quality?

## Answer

Selected bounded player-owned `Projectile hitsound` / `guardsound` typed `audio:playsnd` telemetry.

Reason:

- It was the nearest unclosed audio/contact gap after direct `HitDef` and `SuperPause` sound typed telemetry.
- Existing required `synthetic-imported-projectile-contact.json` and `synthetic-imported-projectile-guard.json` already proved sound-event and FightFX contact package metadata, but did not require typed audio operation evidence.
- Official Elecbyte docs define `Projectile` as taking HitDef parameters, and `HitDef hitsound` / `guardsound` as sound group/index refs.

Resolved evidence:

- `synthetic-imported-projectile-contact.json` trace checksum `57b3b556`, final checksum `e0f3e41c`, required ops include `hitdef`, `projectile`, and `audio:playsnd`.
- `synthetic-imported-projectile-guard.json` trace checksum `eb9c2e58`, final checksum `b1c74e5e`, required ops include `hitdef`, `projectile`, and `audio:playsnd`.
- Focused runtime/contact/effect-spawn/bridge tests plus `pnpm qa:trace` pass 524/524 artifacts, 493 required and 31 optional.

Claim allowed: bounded player-owned Projectile hit/guard contacts can carry resolved `hitsound` / `guardsound` refs into typed `audio:playsnd` telemetry while preserving existing sound-event and FightFX package metadata.

Claim blocked: exact SND archive lookup, Web Audio timing/mixing, channel priority/panning, broader helper Projectile normal-hit sound breadth, helper/redirect/team ownership, exact presentation ordering, renderer parity, score movement, and full audio/Projectile parity. Bounded helper Projectile guard sound typed telemetry was closed later by ticket 010, and bounded helper Projectile normal-hit GetHitVar sound typed telemetry was closed later by ticket 011.
