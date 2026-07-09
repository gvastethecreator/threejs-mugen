# Choose next runtime gap after Projectile contact sound typed audio

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after player-owned `Projectile hitsound` / `guardsound` typed `audio:playsnd` telemetry to keep the MUGEN/IKEMEN Three.js port moving without weakening evidence quality?

## Answer

Selected and resolved bounded helper-parented/root-owned Projectile guard-contact sound typed telemetry.

Why: player-owned Projectile and direct HitDef contact sounds already had typed `audio:playsnd` evidence, while helper Projectile guard KO / `guard.kill = 0` / terminal routes still preserved only sound-event/FightFX package metadata. Elecbyte documents helper-created Projectiles as immediately root-owned, and the repo already had first-generation visual-helper Projectile guard traces with stable target/package evidence, so this was the smallest next gap that improved compatibility without broad helper ownership drift.

Result:

- `synthetic-imported-helper-projectile-guard-ko.json`: trace checksum `05dbcded`, final checksum `98b8bf17`.
- `synthetic-imported-helper-projectile-guard-kill.json`: trace checksum `33930a00`, final checksum `8412e638`.
- `synthetic-imported-helper-projectile-guard-terminal.json`: trace checksum `c6937f42`, final checksum `e0835e33`.
- Required executed operations now include `helper`, `projectile`, and `audio:playsnd`.
- Focused tests and `pnpm qa:trace` 524/524 passed.

Still open after this ticket: helper Projectile normal-hit sound telemetry, broader helper/redirect/team ownership, exact SND lookup/channel/timing/mixing/panning, renderer parity, and full audio/Projectile parity. Ticket 011 later closed the first bounded helper Projectile normal-hit GetHitVar sound typed telemetry oracles; broader normal-hit sound breadth remains open.
