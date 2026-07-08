# Wayfinder: MUGEN/IKEMEN Three.js Port

## Destination

Complete the evidence-first route from the private playable sandbox to a fuller MUGEN/IKEMEN-compatible Three.js runtime, Studio editor, and modular browser fighting-game engine.

## Notes

- Repo truth starts in `AGENTS.md`, `CONTEXT.md`, `docs/WORKPLAN.md`, `docs/PROGRESS_TRACKER.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, and `.scratch/roadmap/issues/`.
- Implementation remains feature-sliced, evidence-gated, and committed per completed feature.
- Use primary-source research for external/toolchain/compatibility claims.
- Use trace gates for runtime compatibility claims; use smoke/browser evidence for visible Studio/runtime UI claims.
- Current verified toolchain: TypeScript 7.0.2.

## Decisions So Far

- [TypeScript 7 upgrade posture](tickets/001-typescript-7-upgrade-posture.md) - upgrade directly to `typescript@~7.0.2`; no TS6 compatibility alias unless a future API-importing tool fails.
- [Choose next runtime compatibility gap](tickets/002-next-runtime-compatibility-gap.md) - dynamic `EnvShake time/freq/ampl/phase` now records typed `envshake` telemetry after expression resolution; no camera-parity score movement.
- Runtime claims need required trace artifacts, checksums, and explicit allowed/blocked wording.
- Historical docs can keep superseded evidence, but latest/current docs must not describe closed gaps as still open.

## Frontier

- [Choose next runtime compatibility gap](tickets/002-next-runtime-compatibility-gap.md)
- [Define Studio editor authoring spine](tickets/003-studio-editor-authoring-spine.md)
- [Define renderer parity proof ladder](tickets/004-renderer-parity-proof-ladder.md)

## Not Yet Specified

- Exact next runtime gap after dynamic Angle and TS7.
- Minimum Studio editing surface that graduates the current workbench from evidence shell to practical editor.
- Visual parity acceptance ladder for axis pivot, draw order, palettes, afterimages, effects, and screenpack/lifebar composition.
- IKEMEN transition point from scanner/reporting into executable IKEMEN-specific behavior.

## Out Of Scope

- Replacing the existing roadmap docs; this map only points at decisions and fog.
- Claiming full MUGEN/IKEMEN parity without current required artifacts.
- Creating broad design docs when the next action is already implementation-ready.
