# Choose next runtime gap after helper Projectile HitCount sound typed audio

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after first-generation helper-parented/root-owned Projectile attacker-side HitCount sound typed `audio:playsnd` telemetry to keep the port moving with evidence?

## Answer

Resolved 2026-07-09: select the existing required player-owned Projectile attacker-side `HitCount` / `UniqHitCount` route as the next bounded R1 runtime gap.

Implementation result:

- `synthetic-imported-projectile-hitcount.json` trace checksum `ee8f4e19` / final checksum `0fd4adf8`.
- The route still branches P1 `200 -> 341` through `HitCount >= 1 && UniqHitCount >= 1` after target id `77` contact.
- It now requires `projectile` and `audio:playsnd` operation telemetry.
- It packages `hitsound = S5,44` with FightFX `F7002`, target-link evidence, and Projectile lifecycle payloads.

Evidence:

- `pnpm vitest run src/tests/RuntimeTraceGatePresets.test.ts -t "Projectile HitCount artifact"` passed 1 file / 2 selected tests.
- `pnpm qa:trace` passed 524/524 artifacts, 493 required and 31 optional.

Claim allowed:

- Bounded player-owned Projectile attacker-side HitCount route resolves `hitsound = S5,44` into typed `audio:playsnd` evidence plus FightFX package telemetry.

Claim blocked:

- Projectile/helper `hitcountpersist` breadth, exact SND lookup/playback, channel priority/timing/mixing/panning, broader helper/redirect/team ownership, renderer parity, and full Projectile/HitCount or audio parity.

Next frontier:

- Continue with `014-next-runtime-gap-after-player-projectile-hitcount-sound-audio.md`.
