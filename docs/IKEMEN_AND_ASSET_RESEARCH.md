# Ikemen GO And Asset Research

## Why Ikemen GO Matters

Ikemen GO is the best public successor/reference engine for this prototype because it is open source, targets MUGEN 1.1 Beta compatibility, and supports MUGEN resources while extending the ecosystem with Lua and ZSS.

The immediate lesson is architectural, not feature-chasing:

- Separate immutable character data from mutable fighter instances.
- Treat CNS/ZSS as a compilation problem before execution.
- Keep a command buffer with real fighting-game semantics instead of one-frame key checks.
- Keep stage data separate from renderer code.
- Make unsupported features visible and countable.

## Local Source Review

Reviewed source snapshot: `ikemen-engine/Ikemen-GO` `develop` at commit `044da72`, cloned under `.scratch/external/Ikemen-GO` for local-only research.

Actionable observations for this sandbox:

- `src/input.go` models input as `CommandList -> Command -> CommandStep -> CommandStepKey`, with explicit button/direction keys, slash, tilde, dollar, charge time, command buffering, and SOCD handling. Our `CommandBuffer` should keep moving in that direction instead of treating commands as plain strings.
- `src/anim.go` normalizes AIR collision rectangles while reading them. This directly informed the local AIR parser fix that normalizes reversed Clsn coordinates, which KFM uses in Action `1000`.
- `src/compiler.go` compiles CNS/ZSS concepts into bytecode and maps controllers/triggers through explicit registries. Our TypeScript runtime should not keep growing ad hoc string checks; the next compatibility layer should introduce a compiled/intermediate expression/controller representation.
- `src/image.go` treats SFF as a shared archive/cache with version-specific header handling, palettes, linked sprites, and sprite lookup by group/index. Our `ISffReader` + `SpriteProvider` split is aligned with that, but palette remapping and linked/borrowed sprite behavior need to keep improving.
- `src/system.go` keeps debug collision visualization separate from normal rendering. Our Three.js collision renderer should stay a debug overlay layer, not be baked into character sprite rendering.

Immediate backlog created from this review:

1. Keep command semantics close to Ikemen: SOCD policy, release/charge modifiers, command step timing, and held-vs-fresh activation.
2. Normalize all collision boxes at parser boundary and add regression tests from real KFM data.
3. Replace the growing expression evaluator with an AST/bytecode-like intermediate form before adding many more triggers.
4. Split imported CNS execution into compile, evaluate triggers, execute controllers, and report unsupported branches.
5. Extend compatibility reports to separate `parsed`, recognized-controller states, `trigger-supported`, and `executed` rather than a single broad executable count. Initial report fields and runtime session telemetry are now in place; a real `compiled` layer should wait for a controller/trigger IR.

## MVP Decision

This sandbox should not claim full MUGEN compatibility yet. The current runtime is a playable compatibility harness:

- Three local demo fighters.
- Training stage.
- Keyboard input.
- Idle, walk, crouch, jump, punch, kick, hitstun.
- Clsn1/Clsn2 overlays.
- Damage, hit pause, hit stun, knockback, power, and life.

Imported MUGEN characters can now enter `Runtime Mode` through an AIR/SFF/CMD bridge when decoded sprites are available. Simple CMD `[State -1]` `ChangeState` routing is executable; full authored CNS/CMD behavior is still not complete.

## SFF Decision

SFF decoding was the biggest blocker to "load any character and see its real art" in browser. The current blocker has moved upward: decoded imported sprites can be driven by a partial CMD/CNS Runtime bridge, but real character behavior needs broader tick-by-tick controller execution.

Recommended order:

1. Atlas PNG + manifest for first playable private characters.
2. SFF v1 + PCX + palette/ACT support.
3. SFF v2 metadata and uncompressed/RLE8/RLE5/LZ5 images.
4. SFF v2.01 PNG paths, broader palette remapping, and malformed/edge encodings.

This is why the renderer depends on `SpriteProvider`. The current implementations are:

- `MockSpriteProvider`: deterministic procedural sprites, used as the inspector fallback when imported SFF images cannot be decoded.
- `AtlasSpriteProvider`: consumes `sprite-atlas-builder` output from `sprite-sheet-alpha.png` and `manifest.json.frame_layout`.
- `CompositeSpriteProvider`: routes atlas-backed group ranges and falls back to procedural sprites.
- `SffParser`: detects version, records compatibility diagnostics, and decodes SFF v1 PCX, including previous-palette subfiles, plus SFF v2 RAW/RLE8/RLE5/LZ5 sprites for Inspector Mode.

## Sprite Atlas Contract

Generated/private characters should use the `sprite-atlas-builder` contract that matches the current runtime layer. Runtime v0 uses a compact `custom-atlas` row set:

```txt
idle
walk-forward
crouch
jump
punch
kick
hitstun
```

Future production passes should grow toward the full `fighting-game-character` preset, adding rows such as `walk-back`, `special`, `knockdown`, and `win` when the runtime consumes them.

The runtime should read `manifest.json.frame_layout` as the single source of truth for rectangles. It should not rediscover frames from alpha at runtime.

For locomotion, run `sprite-atlas-builder/scripts/check_motion_variation.py --states locomotion` and treat warnings as requiring visual review or regeneration. If a deliberate slow-walk cadence triggers low-body-drift warnings, keep the warning surfaced in the runtime QA badge instead of silently marking it clean.

Generated character rows must also preserve scale. Imagegen can vary apparent camera size between standing, crouch, and jump poses; the local normalizer therefore uses a character-level reference scale and foot/baseline anchoring rather than fitting each frame independently. If locomotion poses are wrong, regenerate the row as new art and replace it through `scripts/replace_atlas_state_from_imagegen_row.py`; do not treat better cutting as a gameplay-quality fix.

Current runtime proof assets:

- `public/characters/nova-boxer/`
- `public/characters/mira-volt/`
- `public/characters/rook-apprentice/`

Each folder contains an imagegen reference, `sprite-sheet-alpha.png`, `manifest.json`, and QA previews. These are runtime atlas characters, not complete MUGEN character packages.

## Official References

- Ikemen GO website: https://ikemen-engine.github.io/
- Ikemen GO repository: https://github.com/ikemen-engine/Ikemen-GO
- MUGEN overview: https://www.elecbyte.com/mugendocs-11b1/mugen.html
- AIR format: https://www.elecbyte.com/mugendocs-11b1/air.html
- CNS format: https://www.elecbyte.com/mugendocs/cns.html
- State controllers: https://www.elecbyte.com/mugendocs/sctrls.html
