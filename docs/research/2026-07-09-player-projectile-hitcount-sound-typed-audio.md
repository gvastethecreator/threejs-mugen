# Player Projectile HitCount Sound Typed Audio

Date: 2026-07-09

## Question

Can the existing bounded player-owned Projectile attacker-side `HitCount` route require typed contact `audio:playsnd` telemetry without claiming full audio or Projectile parity?

## Answer

Yes, bounded to the existing player-owned Projectile route:

- `synthetic-imported-projectile-hitcount.json`

The gate can require `hitsound = S5,44`, typed `audio:playsnd`, and shared FightFX package metadata while preserving owner `200 -> 341`, target id `77`, and Projectile lifecycle evidence.

## Primary Sources

- Elecbyte State Controller Reference: <https://www.elecbyte.com/mugendocs/sctrls.html>
- Elecbyte Trigger Reference: <https://www.elecbyte.com/mugendocs/trigger.html>

Relevant source facts:

- `Projectile` takes HitDef parameters, including contact sound/effect references.
- `HitDef hitsound` / `guardsound` define sound group/index contact refs.
- `HitCount` / `UniqHitCount` are current-attack hit counters, with `UniqHitCount` differing under multi-opponent hits.

## Local Evidence

- `src/mugen/runtime/RuntimeTraceGatePresets.ts` adds `hitsound = S5,44`, FightFX `F7002`, required `audio:playsnd`, and a required contact-effect package to the player Projectile HitCount trace.
- `src/tests/RuntimeTraceGatePresets.test.ts` asserts the operation and sound/effect package contract.
- Focused verification: `pnpm vitest run src/tests/RuntimeTraceGatePresets.test.ts -t "Projectile HitCount artifact"` passed 1 file / 2 selected tests.
- Trace verification: `pnpm qa:trace` passed 524/524 artifacts, 493 required and 31 optional.
- Required artifact: `synthetic-imported-projectile-hitcount.json` trace checksum `ee8f4e19`, final checksum `0fd4adf8`.

## Findings

- The player Projectile HitCount route already had sufficient branch, target-link, contact-id, and Projectile lifecycle evidence to require a bounded sound/effect package.
- Pairing `S5,44` with FightFX `F7002` creates a trace-verifiable contact package aligned with the helper counterpart.
- The result closes symmetry for these two attacker-side HitCount oracle routes, not blanket Projectile sound or hit-count persistence parity.

## Claim Allowed

The bounded player-owned Projectile attacker-side HitCount route can resolve `hitsound = S5,44` into typed `audio:playsnd` evidence while preserving owner hit-count branching, target-link evidence, and FightFX contact package metadata.

## Claim Blocked

Projectile/helper `hitcountpersist` breadth, broader helper Projectile normal-hit contact sound breadth, exact SND archive lookup/playback, channel priority classes, timing/mixing/panning, broader helper/redirect/team ownership, exact presentation ordering, renderer parity, score movement, and full MUGEN/IKEMEN audio/Projectile/HitCount parity remain blocked.

## Next Decision

Use Wayfinder ticket `014-next-runtime-gap-after-player-projectile-hitcount-sound-audio.md` to choose the next bounded runtime gap.
