# MUGEN / IKEMEN-GO Three.js Port Roadmap

This project is now treated as a progressive browser port of the MUGEN/IKEMEN runtime model, not only as a character inspector. The port remains incremental: each layer must be playable, testable, and honest about missing parity before the next layer expands.

The broader product direction is a creation studio and modular Three.js game engine. MUGEN/IKEMEN is the first engine module because it is the hardest and most data-rich compatibility target. See `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md` for the studio/project/editor roadmap.

The immediate goal is a private local MVP that can run a small fight with real MUGEN data where supported, generated local fighters where useful, and compatibility reports that explain exactly what is native, imported, partial, or unsupported.

For construction order, dependencies, acceptance gates, and cross-track sequencing, use `docs/FULL_BUILD_PROGRAM.md` and `docs/BUILD_PLAN.md`. This roadmap describes the destination; those plans describe the order of execution.

## North Star

Build a TypeScript + Three.js engine that can eventually host MUGEN 1.0/1.1 and selected IKEMEN-GO content through compatibility profiles.

The browser engine should:

- Load packages from local ZIP/folder input without shipping third-party characters in the repo.
- Parse MUGEN character, stage, sprite, command, state, sound, and palette resources.
- Convert legacy data into stable renderer-independent models.
- Execute a deterministic match runtime with two or more actors, helpers, projectiles, explods, sounds, pause systems, camera, and stage layers.
- Render with Three.js while keeping the MUGEN runtime independent from WebGL details.
- Surface unsupported features as compatibility data, never as silent failure.
- Expose imported/generated assets through a creator studio that can later support non-fighting project types.

## Current Baseline

Already present:

- Three.js runtime with selectable local atlas-backed fighters.
- ZIP/folder loader, DEF/AIR/CMD/CNS/ST/SFF/SND parsing in partial form.
- SFF v1 PCX and SFF v2 RAW/RLE8/RLE5/LZ5 decoding for current fixtures.
- Imported character route for decoded AIR/SFF/CMD/CNS subsets.
- Imported stage route for basic DEF/SFF-backed stages.
- Partial controller execution for movement, state changes, hitdefs, guard, target memory, pause/superpause, visual effects, helpers, projectiles, sound hooks, envshake, and runtime flags.
- Compatibility reports, runtime session telemetry, and Playwright QA bridge.

This is not full MUGEN or IKEMEN-GO parity yet. The hard gap is the CNS/CMD expression VM, exact hit system, helper/custom-state ownership, stage scripting, palette/sound parity, and IKEMEN extensions.

## Expansion Layers

### Layer 0: Honest Playable Sandbox

Keep the local generated roster and native stages usable so renderer, input, HUD, and combat can be tested even when imported content fails.

Done means:

- Runtime Mode is playable on first load.
- Inspector Mode can load fixtures without crashing.
- QA screenshots and diagnostics prove the visible app still works after frontend/runtime changes.

### Layer 1: Package And Resource Parity

Target MUGEN packages as data:

- Characters: DEF, AIR, CMD, CNS, ST/common states, SFF, ACT, SND.
- Stages: DEF, SFF, embedded actions, BG layers, music.
- System/fightfx later: common sounds, common animations, fonts, motifs.

Done means:

- Missing files are resolved through a virtual file system and reported clearly.
- Each parser preserves raw data and diagnostics.
- Resource coverage is measurable per character and per stage.

### Layer 2: Compatibility Profiles

Add explicit profiles instead of one vague compatibility mode:

- `mugen-1.0`
- `mugen-1.1`
- `ikemen-go-scan`
- Later optional IKEMEN extensions: ZSS, Lua, 3D/model stages.

Done means:

- Parser/runtime behavior can branch only through profile decisions.
- Reports identify which profile a character or stage appears to target.
- IKEMEN-only features are not mixed into MUGEN parity by accident.

### Layer 3: Command And Expression Compiler

Move beyond ad hoc raw string evaluation:

- Compile CMD command steps into an intermediate representation.
- Compile trigger expressions into bounded AST/IR nodes.
- Separate unsupported trigger detection from runtime execution.
- Preserve source locations for debugger and compatibility reports.

Done means:

- `[State -1]` routing is explainable from compiled command + trigger groups.
- Runtime evaluation does not repeatedly parse raw strings every tick.
- Unsupported expressions are counted with location and context.

### Layer 4: State Controller IR

Convert supported state controllers into executable IR before match runtime execution.

Priority:

- State/anim/velocity/position/control/life/power/vars.
- HitDef, guard, HitBy/NotHitBy, partial HitOverride/ReversalDef, exact HitOverride/ReversalDef.
- Pause/SuperPause, AssertSpecial, Width, SprPriority.
- PlaySnd/StopSnd, PalFX, AfterImage, EnvShake.
- Explod/RemoveExplod, Projectile, Helper, DestroySelf.

Done means:

- `PlayableMatchRuntime` consumes typed operations, not raw controller params.
- Controller support can be tested without a renderer.
- Unsupported params inside otherwise known controllers are visible.

### Layer 5: Combat And Actor Ownership

Replace the current bounded two-actor shortcuts with MUGEN-like ownership rules:

- Hit attributes, priority, hit/guard states, fall states, juggle, recovery, hit overrides.
- Target memory and custom state ownership.
- Helpers as real actor instances with parent/root redirects.
- Projectiles as owned actors with cancel/trade/remove rules.
- Explods and afterimages with lifecycle, binding, palette, and pause rules.

Done means:

- KFM can execute a meaningful set of authored moves and recoveries.
- Helpers/projectiles can be debugged as first-class actors.
- The runtime can explain why a hit connected, guarded, whiffed, or was blocked by an override.

### Layer 6: Stage, Camera, Audio, And Presentation

Expand stage and audiovisual parity:

- BGCtrl, velocity, window/mask, layer rules, exact parallax/tiling, shadows/reflections, zoom.
- SND channel priority, looping, panning, frequency, stop semantics, common/system fallback.
- FightFX/common animations, sparks, hitsounds, guardsounds.
- IKEMEN 3D/model stages as a later Three.js-specific layer.

Done means:

- Stage reports separate parsed, rendered, animated, and unsupported BG features.
- Audio playback is deterministic enough for debug and does not spam channels.
- Camera/floor/projection rules are centralized and testable.

### Layer 7: IKEMEN Extensions And Future Horizons

Only after MUGEN MVP is stable:

- ZSS.
- Lua hooks.
- IKEMEN screenpack/system features.
- Model stages and richer Three.js scene composition.
- Multiplayer/rollback/netplay research.
- Authoring tools for original characters.

### Layer 8: Creator Studio And Other Game Modules

Once the fighting/MUGEN MVP has trustworthy runtime contracts, grow the product into a project-based creation studio:

- Project dashboard.
- Asset library.
- Character studio.
- Stage studio.
- Runtime debug studio.
- Playtest launcher.
- Export/build pipeline.
- Platformer, beat-em-up, arena, or custom modules that reuse the same asset, render, input, debug, and project foundations.

This layer should not be built by copying MUGEN-specific assumptions into every genre. It should extract reusable core systems while keeping the fighting module separate.

## Near-Term Controller Targets

Based on current fixture gap audits, the next controller families should be:

| Priority | Feature | Reason |
| --- | --- | --- |
| High | `AssertSpecial` | Appears in KFM/Common1 and affects walk, auto-turn, intro, invisibility, guard flags. |
| High | `ChangeAnim2` owner tables | Partial source marker exists; next step is true attacker/state-owner AIR/SFF rendering for custom get-hit states. |
| High | Exact `HitOverride` / `ReversalDef` | Partial `HitOverride` redirect and partial `ReversalDef` Clsn1 counter support exist; exact slot/guard/priority/custom-state parity remains required for defensive and counter-hit authored behavior. |
| High | Exact fall/get-hit flow | Partial `FallEnvShake`, `HitFallDamage`, `HitFallSet`, and `HitFallVel` support exists, including synthetic attacker-owned custom get-hit controller-flow gates, defender-owned Common1 stand progression `5000 -> 5001 -> 0`, required synthetic fall `5000 -> 5030 -> 5050`, required synthetic bounded recovery `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0`, required synthetic recovery input `5050 -> 5210 -> 0`, required synthetic recovery-threshold actor-frame handoff, required synthetic ground-recovery selection/velocity, required synthetic too-early recovery-input rejection in `5050`, optional official KFM ground-impact/bounce/lie-down entry `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110`, optional official KFM get-up completion `5110 -> 5120 -> 0`, optional official KFM air recovery-input completion `5050 -> 5210 -> 52 -> 0`, optional official KFM too-early recovery-input rejection in `5050`, optional official KFM ground recovery-input completion `5050 -> 5200 -> 5201 -> 52 -> 0`, and bounded stand/crouch guard-hit `150 -> 151` / `152 -> 153`; next step is exact recovery threshold tables/velocity math beyond the bounded threshold/ground-selection/reject windows, broader recovery parity, exact guard behavior, exact tick-order parity, and exact envshake timing. |
| Medium | Exact `RemapPal` / ACT application | Partial `RemapPal` telemetry exists; next step is decoded ACT/SFF palette application and renderer material routing. |
| Medium | `DestroySelf` | Required once helpers become real actors. |
| Medium | Exact `AttackMulSet` interactions | Partial outgoing damage scaling exists; next step is exact interaction with projectiles, helpers, custom states, and engine tick order. |
| Later | `ParentVarSet` / `ParentVarAdd` | Requires helper parent/root redirect semantics. |

## Definition Of Progress

Progress is not measured by "loads without crashing" alone. Each compatibility step should add:

- Parser/model coverage.
- Runtime execution coverage.
- UI/debug visibility.
- Compatibility report fields.
- Unit tests for parser/runtime behavior.
- Browser visual QA when frontend or renderer behavior changes.

## Non-Negotiables

- No hardcoded character names for runtime support.
- No commercial assets committed to the repository.
- No unsupported feature should disappear silently.
- No Three.js imports inside `src/mugen/*`.
- No "full support" wording unless tests and visual QA prove it.
