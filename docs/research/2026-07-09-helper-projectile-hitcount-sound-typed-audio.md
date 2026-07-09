# Helper Projectile HitCount Sound Typed Audio

Date: 2026-07-09

## Question

Can the existing bounded helper-parented/root-owned Projectile attacker-side `HitCount` route require typed contact `audio:playsnd` telemetry without claiming full audio or Projectile parity?

## Answer

Yes, bounded to the existing first-generation visual-helper Projectile route:

- `synthetic-imported-helper-projectile-hitcount.json`

This gate can require helper-local `hitsound = S5,43`, typed `audio:playsnd`, and shared FightFX package metadata while preserving the existing helper `1257 -> 1258` branch, owner/helper target links, and helper/projectile lifecycle evidence.

## Primary Sources

- Elecbyte State Controller Reference: <https://www.elecbyte.com/mugendocs/sctrls.html>
- Elecbyte Trigger Reference: <https://www.elecbyte.com/mugendocs/trigger.html>

Relevant source facts:

- `Projectile` takes HitDef parameters.
- Helper-created Projectiles become root-owned after creation.
- `HitDef hitsound` / `guardsound` define sound group/index contact refs.
- `HitCount` / `UniqHitCount` are current-attack hit counters, with `UniqHitCount` differing under multi-opponent hits.

## Local Evidence

- `src/mugen/runtime/RuntimeTraceGatePresets.ts` adds helper-local `hitsound = S5,43`, FightFX `F7002`, `requiredExecutedOperations` with `audio:playsnd`, and a required contact-effect package to the helper Projectile HitCount trace.
- `src/tests/RuntimeTraceGatePresets.test.ts` asserts the gate requires `audio:playsnd` plus sound/effect package metadata.
- Focused verification: `pnpm vitest run src/tests/RuntimeTraceGatePresets.test.ts -t "Helper Projectile HitCount"` passed 1 file / 1 selected test.
- Trace verification: `pnpm qa:trace` passed 524/524 artifacts, 493 required and 31 optional.
- Required artifact: `synthetic-imported-helper-projectile-hitcount.json` trace checksum `c8f5dc55`, final checksum `e1569fab`.

## Findings

- The previous helper Projectile HitCount route already had enough branch, target-link, helper, and Projectile lifecycle evidence to attach bounded sound/effect package requirements.
- Pairing helper-local `S5,43` with FightFX `F7002` creates a trace-verifiable contact package with shared contact id, matching the existing contact presentation evidence model.
- This should be claimed as one attacker-side HitCount route only, not as blanket helper Projectile normal-hit sound parity.

## Claim Allowed

The bounded first-generation helper-parented/root-owned Projectile attacker-side HitCount route can resolve helper-local `hitsound = S5,43` into typed `audio:playsnd` operation evidence while preserving helper-local hit-count branching, owner/helper target links, and FightFX contact package metadata.

## Claim Blocked

Player-owned Projectile HitCount sound, broader helper Projectile normal-hit contact sound breadth beyond this route and the three GetHitVar routes, Projectile/helper `hitcountpersist` breadth, exact SND archive lookup/playback, channel priority classes, timing/mixing/panning, broader helper/redirect/team ownership, exact presentation ordering, renderer parity, score movement, and full MUGEN/IKEMEN audio/Projectile/HitCount parity remain blocked.

## Next Decision

Use Wayfinder ticket `013-next-runtime-gap-after-helper-projectile-hitcount-sound-audio.md` to choose the next bounded runtime gap.
