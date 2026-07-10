# Player Projectile GetHitVar Sound Typed Audio

Date: 2026-07-10

## Question

Can the three required player-owned Projectile normal-hit `GetHitVar` routes require typed contact `audio:playsnd` telemetry and FightFX package evidence without claiming full audio or Projectile parity?

## Answer

Yes. The existing routes already prove defender Common1 branches, target links, contact ids, and Projectile lifecycle. Adding distinct player-SND refs and the existing FightFX package contract closes the typed-audio evidence gap shared by:

- `synthetic-imported-projectile-gethitvar-hit-metadata.json`
- `synthetic-imported-projectile-gethitvar-hitid-chainid.json`
- `synthetic-imported-projectile-gethitvar-hitcount.json`

## Primary Sources

- Elecbyte State Controller Reference: <https://www.elecbyte.com/mugendocs/sctrls.html>
- Elecbyte Trigger Reference: <https://www.elecbyte.com/mugendocs/trigger.html>

Relevant source facts:

- `Projectile` takes all HitDef parameters.
- `hitsound` identifies a sound group/item; prefixing the group with `S` selects the player's SND file.
- `GetHitVar` exposes `damage`, `hittime`, `xvel`, `yvel`, `hitid`, `chainid`, `hitcount`, and `guarded`, matching the three gated defender expressions.

## Baseline

- The player-owned routes required only `projectile` operation telemetry and had no required sound/effect package.
- The corresponding helper-parented routes already required helper-local `S5,40/41/42`, `audio:playsnd`, and FightFX `F7002` package metadata.

## Local Evidence

- `src/mugen/runtime/RuntimeTraceGatePresets.ts` adds player-owned `S5,45/46/47`, FightFX `F7002`, required `audio:playsnd`, and typed contact package requirements.
- `src/tests/RuntimeTraceGatePresets.test.ts` asserts operation, sound index, multi-frame FightFX asset metadata, and offset `18,-68` for all three artifacts.
- Red test: the focused suite failed 3/3 because `audio:playsnd` was absent.
- Green test: `pnpm vitest run src/tests/RuntimeTraceGatePresets.test.ts -t "synthetic imported Projectile GetHitVar hit"` passed 3 selected tests.
- Trace gate: `pnpm qa:trace` passed 524/524 artifacts, 493 required and 31 optional.
- Full closeout: 153 files / 1503 tests, typecheck, build, and modular boundaries passed under TypeScript 7.0.2.

Required artifact checksums:

- hit metadata: trace `8e5df79b`, final `4d078c5d`, sound `S5,45`.
- hitid/chainid: trace `4356b5cb`, final `4b270d45`, sound `S5,46`.
- hitcount: trace `df2619f9`, final `5469bc69`, sound `S5,47`.

## Claim Allowed

The three bounded player-owned Projectile normal-hit GetHitVar routes resolve attacker-side `hitsound` refs into typed `audio:playsnd` evidence and FightFX contact package metadata while preserving defender states `5000 -> 335/337/339`, target links, and Projectile lifecycle evidence.

## Claim Blocked

Exact SND archive lookup/playback, channel priority/timing/mixing/panning, exact combo and chain-hit arbitration, Projectile/helper `hitcountpersist`, helper-owned custom states, broader helper/redirect/team ownership, renderer parity, score movement, and full MUGEN/IKEMEN Projectile/GetHitVar or audio parity remain blocked.

## Next Decision

Use Wayfinder ticket `015-next-runtime-gap-after-player-projectile-gethitvar-sound-audio.md` to choose the next bounded runtime gap.
