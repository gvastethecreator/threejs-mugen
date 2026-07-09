# Choose next runtime gap after helper Projectile normal-hit sound typed audio

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after first-generation helper-parented/root-owned Projectile normal-hit GetHitVar sound typed `audio:playsnd` telemetry to keep the port moving with evidence?

## Answer

Resolved 2026-07-09: select the existing required helper-parented/root-owned Projectile attacker-side `HitCount` / `UniqHitCount` route as the next bounded R1 runtime gap.

Implementation result:

- `synthetic-imported-helper-projectile-hitcount.json` trace checksum `c8f5dc55` / final checksum `e1569fab`.
- The route still branches helper `1257 -> 1258` through helper-local `HitCount >= 1 && UniqHitCount >= 1`.
- It now requires `helper`, `projectile`, and `audio:playsnd` operation telemetry.
- It packages helper-local `hitsound = S5,43` with FightFX `F7002`, owner/helper target links for target id `8893`, helper/projectile lifecycle payloads, and shared contact package evidence.

Evidence:

- `pnpm vitest run src/tests/RuntimeTraceGatePresets.test.ts -t "Helper Projectile HitCount"` passed 1 file / 1 selected test.
- `pnpm qa:trace` passed 524/524 artifacts, 493 required and 31 optional.

Claim allowed:

- Bounded first-generation helper-parented/root-owned Projectile attacker-side HitCount route resolves helper-local `hitsound = S5,43` into typed `audio:playsnd` evidence plus FightFX package telemetry.

Claim blocked:

- Player-owned Projectile HitCount sound, broader helper Projectile normal-hit sound breadth beyond this route and the three GetHitVar routes, Projectile/helper `hitcountpersist` breadth, exact SND lookup/playback, channel priority/timing/mixing/panning, helper/redirect/team ownership, renderer parity, and full Projectile/HitCount or audio parity.

Next frontier:

- Continue with `013-next-runtime-gap-after-helper-projectile-hitcount-sound-audio.md`.
