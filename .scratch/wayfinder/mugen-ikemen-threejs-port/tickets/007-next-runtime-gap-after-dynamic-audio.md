# Choose next runtime gap after dynamic audio

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after dynamic `PlaySnd` / `SndPan` / `StopSnd` typed telemetry to keep moving the port toward MUGEN/IKEMEN compatibility without weakening evidence quality?

## Answer

Selected and implemented the bounded dynamic `SuperPause sound` telemetry gap. The required `synthetic-imported-superpause-sound.json` gate now requires typed `audio:playsnd` operation evidence while preserving the authored raw pause-start sound ref `Svar(0),var(1)` in `RuntimeSoundEvent` telemetry.

Proof:

- Official source checked: Elecbyte State Controller Reference defines expression-capable numeric controller params and `SuperPause sound = snd_grp, snd_no`.
- Runtime route: `RuntimeMatchPauseControllerWorld` resolves the SuperPause sound once, emits the existing sound event, and records typed `audio:playsnd` telemetry through `PlayableMatchRuntime`.
- Trace gate: required `synthetic-imported-superpause-sound.json` trace checksum `3e19cb86` / final checksum `c5fb9428`; executed operations include `variable:varset`, `hitdef`, `pause:superpause`, and `audio:playsnd`.
- Focused tests: `PauseSystem.test.ts` and `RuntimeTraceGatePresets.test.ts`.

Still blocked: exact common/player SND archive lookup, channel priority, timing, mixing, panning semantics, super-background audio, helper/redirect ownership, broader helper Projectile normal-hit sound breadth, score movement, and full audio parity. Bounded direct HitDef contact sound operation telemetry was closed later by ticket 008, player-owned Projectile contact sound by ticket 009, helper Projectile guard sound by ticket 010, and the first helper Projectile normal-hit GetHitVar sound oracles by ticket 011.
