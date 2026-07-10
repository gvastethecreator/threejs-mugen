# Choose next runtime gap after player Projectile HitCount sound typed audio

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after player-owned and first-generation helper-parented/root-owned Projectile attacker-side HitCount sound typed `audio:playsnd` telemetry to keep the port moving with evidence?

## Answer

Resolved 2026-07-10: select the three existing required player-owned Projectile normal-hit `GetHitVar` routes as the next bounded R1 runtime gap.

Why this cut:

- `synthetic-imported-projectile-gethitvar-hit-metadata.json`, `synthetic-imported-projectile-gethitvar-hitid-chainid.json`, and `synthetic-imported-projectile-gethitvar-hitcount.json` already prove defender Common1 branches, target links, and Projectile lifecycle, but require only the `projectile` operation.
- Their first-generation helper-parented counterparts already require typed `audio:playsnd` plus FightFX `F7002` contact packages, exposing a symmetric player-owned evidence gap.
- Elecbyte State Controller Reference defines `Projectile` as taking all HitDef parameters and defines `hitsound` group/index refs with the `S` player-SND prefix. Elecbyte Trigger Reference lists the exact `GetHitVar` fields used by these routes.

Implementation target:

- Require player-owned `S5,45/46/47`, FightFX `F7002`, typed `audio:playsnd`, and shared contact package evidence while preserving states `5000 -> 335/337/339`, target ids, and Projectile lifecycle payloads.

Implementation result:

- hit metadata trace `8e5df79b`, final `4d078c5d` with `S5,45`.
- hitid/chainid trace `4356b5cb`, final `4b270d45` with `S5,46`.
- hitcount trace `df2619f9`, final `5469bc69` with `S5,47`.
- Focused test passed 3 selected routes; `pnpm qa:trace` passed 524/524 artifacts, 493 required and 31 optional.

Claim blocked:

- Exact SND lookup/playback, channel priority/timing/mixing/panning, Projectile/helper `hitcountpersist`, exact chain/combo arbitration, broader helper/redirect/team ownership, renderer parity, and full Projectile/GetHitVar or audio parity.

Next frontier:

- Continue with `015-next-runtime-gap-after-player-projectile-gethitvar-sound-audio.md` after implementation evidence lands.
