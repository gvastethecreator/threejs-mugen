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
- [Choose next runtime gap after player Projectile GetHitVar sound typed audio](tickets/015-next-runtime-gap-after-player-projectile-gethitvar-sound-audio.md) - selected and resolved five first-generation helper direct-HitDef/persistence typed contact-audio routes.
- [Choose next runtime gap after helper HitDef persistence sound typed audio](tickets/016-next-runtime-gap-after-helper-hitdef-persistence-sound-audio.md) - selected and resolved actor-scoped numbered Web Audio playback channels.
- [Choose next runtime gap after actor-scoped audio channels](tickets/017-next-runtime-gap-after-actor-scoped-audio-channels.md) - selected and resolved one-shot actor-local channel `0` voice cancellation on accepted hit.
- [Choose next runtime gap after voice channel hit cancellation](tickets/018-next-runtime-gap-after-voice-channel-hit-cancellation.md) - selected and resolved contextual player/common SND ownership with fail-closed common lookup.
- [Choose next runtime gap after contextual SND banks](tickets/019-next-runtime-gap-after-contextual-snd-banks.md) - selected and resolved automatic KO sound plus tick-active global `NoKOSnd` suppression.
- [Choose next gap after KO sound handoff](tickets/020-next-gap-after-ko-sound-handoff.md) - selected and resolved persistent Studio project-name authoring with browser save/reopen proof.
- [Choose next cross-area gap after Studio project naming](tickets/021-next-gap-after-studio-project-naming.md) - selected and resolved persisted scene/matchup authoring with explicit dirty-state lifecycle.
- [Choose next gap after persistent Studio scene authoring](tickets/022-next-gap-after-persistent-studio-scene.md) - selected and resolved the renderer L0-L5 proof ladder plus a desktop/mobile L2 player-axis oracle.
- [Choose next gap after renderer axis oracle](tickets/023-next-gap-after-renderer-axis-oracle.md) - selected and resolved official player SprPriority clamping plus effective desktop/mobile depth-order oracle.
- [Choose next gap after SprPriority draw order](tickets/024-next-gap-after-sprpriority-draw-order.md) - selected static direct HitDef P1/P2 priority policy, contact mutation, and trace evidence as the next R1 presentation-semantic package.
- HitDef contact-priority implementation now passes required player/helper provenance traces inside 526/526 gates; renderer adaptation and score movement remain blocked.
- [Choose next gap after HitDef contact priority](tickets/025-next-gap-after-hitdef-contact-priority.md) - selected and resolved runtime-owned `MugenPresentationOrder/v0`, a separate Three.js r184 adapter, and desktop/mobile stage-back < actor < effect < stage-front evidence.
- Runtime claims need required trace artifacts, checksums, and explicit allowed/blocked wording.
- Historical docs can keep superseded evidence, but latest/current docs must not describe closed gaps as still open.

## Frontier

- [Define Studio editor authoring spine](tickets/003-studio-editor-authoring-spine.md)
- [Choose next gap after PresentationOrder v0](tickets/026-next-gap-after-presentation-order-v0.md)

## Not Yet Specified

- Minimum Studio editing surface that graduates the current workbench from evidence shell to practical editor.
- IKEMEN transition point from scanner/reporting into executable IKEMEN-specific behavior.

## Out Of Scope

- Replacing the existing roadmap docs; this map only points at decisions and fog.
- Claiming full MUGEN/IKEMEN parity without current required artifacts.
- Creating broad design docs when the next action is already implementation-ready.
