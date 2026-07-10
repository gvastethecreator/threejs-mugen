# Wayfinder: MUGEN/IKEMEN Three.js Port

## Destination

Complete the evidence-first route from the private playable sandbox to a fuller MUGEN/IKEMEN-compatible Three.js runtime, Studio editor, and modular browser fighting-game engine.

## Notes

- Repo truth starts in `AGENTS.md`, `CONTEXT.md`, `docs/WORKPLAN.md`, `docs/PROGRESS_TRACKER.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, and `.scratch/roadmap/issues/`.
- Implementation remains feature-sliced, evidence-gated, and committed per completed feature.
- Use primary-source research for external/toolchain/compatibility claims.
- Use trace gates for runtime compatibility claims; use smoke/browser evidence for visible Studio/runtime UI claims.
- Current verified toolchain: TypeScript 7.0.2 with explicit `rootDir: "src"` and no TS6 compatibility alias.

## Decisions So Far

- [TypeScript 7 upgrade posture](tickets/001-typescript-7-upgrade-posture.md) - upgrade directly to `typescript@~7.0.2`; keep `rootDir: "src"` explicit; no TS6 compatibility alias unless a future API-importing tool fails.
- [Choose next runtime compatibility gap](tickets/002-next-runtime-compatibility-gap.md) - dynamic `EnvShake` and dynamic `EnvColor value/time/under` now record typed telemetry after expression resolution; no camera/presentation-parity score movement.
- [Choose next runtime gap after EnvColor](tickets/005-next-runtime-gap-after-envcolor.md) - selected dynamic `AttackMulSet` / `DefenceMulSet` typed telemetry; required `synthetic-imported-damage-scale-dynamic.json` is green.
- [Choose next runtime gap after dynamic damage-scale](tickets/006-next-runtime-gap-after-damage-scale.md) - selected dynamic active-state audio typed telemetry; required dynamic sound pan/value traces now record `audio:*` operations.
- [Choose next runtime gap after dynamic audio](tickets/007-next-runtime-gap-after-dynamic-audio.md) - selected and resolved bounded dynamic `SuperPause sound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after SuperPause sound typed audio](tickets/008-next-runtime-gap-after-superpause-sound.md) - selected and resolved bounded direct `HitDef hitsound` / `guardsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after HitDef contact sound typed audio](tickets/009-next-runtime-gap-after-hitdef-contact-sound-audio.md) - selected and resolved bounded player-owned `Projectile hitsound` / `guardsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after Projectile contact sound typed audio](tickets/010-next-runtime-gap-after-projectile-contact-sound-audio.md) - selected and resolved bounded helper-parented/root-owned Projectile guard-contact `guardsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after helper Projectile guard sound typed audio](tickets/011-next-runtime-gap-after-helper-projectile-guard-sound-audio.md) - selected and resolved bounded helper-parented/root-owned Projectile normal-hit GetHitVar `hitsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after helper Projectile normal-hit sound typed audio](tickets/012-next-runtime-gap-after-helper-projectile-normal-hit-sound-audio.md) - selected and resolved bounded helper-parented/root-owned Projectile attacker-side HitCount `hitsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after helper Projectile HitCount sound typed audio](tickets/013-next-runtime-gap-after-helper-projectile-hitcount-sound-audio.md) - selected and resolved bounded player-owned Projectile attacker-side HitCount `hitsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after player Projectile HitCount sound typed audio](tickets/014-next-runtime-gap-after-player-projectile-hitcount-sound-audio.md) - selected and resolved the three player-owned Projectile normal-hit GetHitVar sound typed-audio routes.
- Runtime claims need required trace artifacts, checksums, and explicit allowed/blocked wording.
- Historical docs can keep superseded evidence, but latest/current docs must not describe closed gaps as still open.

## Frontier

- [Choose next runtime gap after player Projectile GetHitVar sound typed audio](tickets/015-next-runtime-gap-after-player-projectile-gethitvar-sound-audio.md)
- [Define Studio editor authoring spine](tickets/003-studio-editor-authoring-spine.md)
- [Define renderer parity proof ladder](tickets/004-renderer-parity-proof-ladder.md)

## Not Yet Specified

- Exact next runtime gap after player-owned and helper-parented/root-owned `Projectile` normal-hit GetHitVar sound typed audio telemetry.
- Minimum Studio editing surface that graduates the current workbench from evidence shell to practical editor.
- Visual parity acceptance ladder for axis pivot, draw order, palettes, afterimages, effects, and screenpack/lifebar composition.
- IKEMEN transition point from scanner/reporting into executable IKEMEN-specific behavior.

## Out Of Scope

- Replacing the existing roadmap docs; this map only points at decisions and fog.
- Claiming full MUGEN/IKEMEN parity without current required artifacts.
- Creating broad design docs when the next action is already implementation-ready.
