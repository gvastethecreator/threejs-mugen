# Helper Projectile Normal-Hit Sound Typed Audio

Date: 2026-07-09

## Question

Can the three bounded helper-parented/root-owned Projectile normal-hit `GetHitVar` routes require typed contact `audio:playsnd` telemetry without claiming full audio or Projectile parity?

## Answer

Yes, bounded to the existing first-generation visual-helper Projectile routes:

- `synthetic-imported-helper-projectile-gethitvar-hit-metadata.json`
- `synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json`
- `synthetic-imported-helper-projectile-gethitvar-hitcount.json`

These gates can require helper-local `hitsound` refs, typed `audio:playsnd`, and shared FightFX package metadata while preserving the existing owner/helper target-link and defender-owned Common1-style `GetHitVar` evidence.

## Primary Source

- Elecbyte State Controller Reference: <https://www.elecbyte.com/mugendocs/sctrls.html>

Relevant source facts:

- `Projectile` takes HitDef parameters.
- Helper-created Projectiles become root-owned after creation.
- Numeric state-controller parameters are expression-capable unless otherwise specified.
- `HitDef hitsound` / `guardsound` define sound group/index contact refs.

## Local Evidence

- `src/mugen/runtime/RuntimeTraceGatePresets.ts` adds helper-local `hitsound = S5,40/41/42`, FightFX `F7002`, `requiredExecutedOperations` with `audio:playsnd`, and required contact-effect packages for the three helper Projectile normal-hit GetHitVar traces.
- `src/tests/RuntimeTraceGatePresets.test.ts` asserts the three gates require `audio:playsnd` plus sound/effect package metadata.
- Focused verification: `pnpm vitest run src/tests/RuntimeTraceGatePresets.test.ts -t "Helper Projectile GetHitVar hit metadata|Helper Projectile GetHitVar hitid|Helper Projectile GetHitVar hitcount"` passed 1 file / 3 selected tests.
- Trace verification: `pnpm qa:trace` passed 524/524 artifacts, 493 required and 31 optional.

## Findings

- The previous helper Projectile normal-hit GetHitVar routes already had enough metadata, target-link, and lifecycle evidence to attach bounded sound/effect package requirements.
- Adding `hitsound` alone was insufficient for package evidence because the trace package summary needs a shared contact id between sound and hit effect. Pairing `S5,40/41/42` with FightFX `F7002` creates the required package evidence.
- The implementation should claim only the three GetHitVar oracles, not all helper Projectile normal-hit sound behavior.

## Claim Allowed

The three bounded first-generation helper-parented/root-owned Projectile normal-hit GetHitVar routes can resolve helper-local `hitsound` refs into typed `audio:playsnd` operation evidence while preserving target links, Common1-style defender routes, and FightFX contact package metadata.

## Claim Blocked

Broader helper Projectile normal-hit contact sound breadth, exact SND archive lookup/playback, channel priority classes, timing/mixing/panning, broader helper/redirect/team ownership, exact presentation ordering, renderer parity, score movement, and full MUGEN/IKEMEN audio/Projectile parity remain blocked.

## Next Decision

Use Wayfinder ticket `012-next-runtime-gap-after-helper-projectile-normal-hit-sound-audio.md` to choose the next bounded runtime gap.
