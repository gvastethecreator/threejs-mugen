# Engine And Studio Roadmap

This is the construction plan for turning `mugen-web-sandbox` into a progressive MUGEN/Ikemen-compatible Three.js engine plus a creator studio that can later host other game modules.

The project should keep shipping usable slices. Each slice must improve one of three outcomes:

1. A better playable fighting sandbox.
2. A better compatibility layer for real MUGEN/Ikemen content.
3. A better creator workflow that can inspect, repair, generate, package, and validate projects.

## Product Shape

The app has two products inside one shell:

| Product | Purpose | First useful promise |
| --- | --- | --- |
| Runtime Sandbox | Playtest a local match with imported or authored content. | Two fighters, one stage, input, combat, debug overlays, trace evidence. |
| Creator Studio | Build, inspect, repair, and export projects. | Asset library, inspector, debug, evidence, module settings, build/export center. |

The first genre module is `fighting/mugen`. The engine core should not assume that every project is MUGEN forever.

## Studio Operational Chain

Studio screens should not be seven equivalent reports. They should form a chain:

```txt
Workbench -> Assets -> Evidence -> Build
       \-> Character Studio / Stage Studio / Debug Studio
```

Each surface owns one question:

| Surface | Question it answers | Primary action |
| --- | --- | --- |
| Runtime | Can the game be played right now? | Play, pause, step, reset, or switch fighters/stage. |
| Workbench | What project am I testing and what needs attention first? | Playtest or open the highest-priority attention item. |
| Assets | What content do I have, where did it come from, and what depends on it? | Inspect, relink, or replace the selected asset. |
| Evidence | What has been proven, by which artifact, and what failed or stayed partial? | Open the relevant trace/report or jump to the affected asset/runtime state. |
| Build | What can be exported now, what is blocked, and what is the next build action? | Compile/export or resolve the highest blocking item. |
| Character Studio | What action/frame/sprite/state/command is this character using? | Preview, diagnose, or later edit the selected action/state. |
| Stage Studio | What are this stage's bounds, starts, floor, camera, and layers? | Preview/report the selected layer or stage parameter. |
| Debug Studio | What did the runtime do this frame and why? | Select an actor/event and jump to trace/controller evidence. |
| Module Studio | Which capabilities are active, planned, missing, or module-specific? | Read status; editing waits for a real module slice. |

Product rule: every readiness badge should either link to evidence, point to the affected asset/module, or expose the next action that moves the project forward.

Product-design rule: before a major Studio interface rebuild, create three focused visual directions for the workbench shell and choose one. Those visuals are planning targets only; implementation must still use live project/runtime/evidence data and must close with browser visual QA.

UX acceptance rule: every Studio surface must expose one primary next action, every `partial`/`warn`/`blocked` state must explain cause and repair path, and every `ok` state must link to evidence. The current visual audit found the shell broadly usable with no horizontal overflow, but flagged repeated status/action patterns across Assets, Evidence, Build, Debug, and Modules as the main coherence risk.

## Non-Negotiable Architecture Rules

- Keep parser, compiler IR, runtime simulation, Three.js rendering, UI, and QA evidence separate.
- MUGEN/Ikemen compatibility must be layered and report-driven, not a single all-or-nothing claim.
- Runtime state must be renderer-independent. Three.js renders snapshots; it does not own gameplay truth.
- Every unsupported parser feature, trigger, controller, asset format, or runtime behavior must be recorded in reports.
- Studio features must point at the active playtest or preview. Avoid detached config pages that cannot be validated visually.
- Package exports must be schema-versioned and honest about missing binary assets or partial compatibility.
- New game genres should enter as modules with their own runtime contracts, not as forks of the fighting runtime.

## Build Tracks

### Track A: MUGEN/Ikemen Compatibility

Goal: load more real content without crashing, report exact coverage, and execute a growing subset.

| Phase | Scope | Acceptance |
| --- | --- | --- |
| A1 Parser hardening | DEF/AIR/CMD/CNS/ST/SFF/SND edge cases, Ikemen extensions catalog, fixture corpus. | Parser tests plus compatibility report deltas for official KFM and local fixtures. |
| A2 Runtime IR migration | More controllers and triggers compiled into typed IR instead of ad hoc parsed params. | Controller execution evidence comes from typed operations in trace artifacts. |
| A3 Combat parity pass | HitDef priority, guard states, fall/bounce, target ownership, custom states, pause layering. | Multiple KFM/common attacks route, hit, guard, recover, and exit states visually. |
| A4 Actor world | Helpers/projectiles/explods become first-class world actors with lifecycle, ownership, and collision rules. | Actor registry is not just derived; systems tick from stable world ownership. |
| A5 Ikemen bridge | Compare docs/source behavior from Ikemen-GO for controllers, constants, stage, camera, and Lua-like extensions where relevant. | Every adopted behavior links to a doc/source note and has a compatibility flag. |

### Track B: Three.js Runtime And Rendering

Goal: keep a 2D fighting game readable while using Three.js as the long-term render platform.

| Phase | Scope | Acceptance |
| --- | --- | --- |
| B1 Snapshot renderer contract | Fighters, effects, stages, camera, HUD overlays, hitbox layers render from snapshots only. | Runtime and Inspector can render the same actor/collision data paths. |
| B2 Stage renderer | More DEF BG features, parallax, tiling, animation, camera/zoom, debug layers. | Imported stage visual report shows decoded/rendered/skipped BG elements. |
| B3 Material/effect pipeline | PalFX, AfterImage, explods, blend modes, transparency, palette remap hooks. | Effects are visible, bounded, and can be toggled/debugged from Studio. |
| B4 Multi-module renderer adapters | Fighting, platformer, and custom modules share renderer primitives but keep module-specific cameras/HUD. | A non-fighting demo can run without importing fighting runtime types. |

### Track C: Creator Studio

Goal: make the project editable and understandable, not just playable.

| Phase | Scope | Acceptance |
| --- | --- | --- |
| C1 Workbench shell | URL-backed Studio tabs around the active playtest. | Workbench, Assets, Inspector, Debug, Evidence, Modules, Build are stable routes. |
| C2 Asset Library | Provenance, dependency graph, replacement flow, source-runtime map, validation queue. | Replacing P1/P2/stage invalidates compile/package evidence and updates playtest. |
| C3 Character Studio | AIR timeline, frame/sprite browser, Clsn overlays, command/state graph. | A user can answer "why did this attack not play?" from one screen. |
| C4 Stage Studio | Bounds, starts, zoffset, BG layers, parallax/camera debugger. | Imported stage can be inspected layer-by-layer with unsupported features listed. |
| C5 Build Center | Project manifest, runtime manifest, trace artifact, package bundle, readiness gates. | Exported ZIP contains versioned contracts, evidence, and browser-fetchable local assets/checksums. |
| C6 Repair/Generation tools | Sprite replacement, atlas QA, manifest fixes, missing-reference repair. | Generated assets can be traced from prompt/source to runtime entry and QA report. |

Studio construction order for the approved horizon:

1. Preserve the central playable/preview viewport.
2. Make Assets, Evidence, and Build denser and more truthful before broad editing.
3. Absorb Inspector into Character Studio only after the preview can show AIR/CMD/CNS/SFF, Clsn, unsupported features, and linked evidence.
4. Add Stage Studio preview before BGCtrl/layer editing.
5. Add generated-authoring records only where prompt/source, atlas QA, collision/action data, and runtime playtest evidence can be linked.
6. Keep Module Studio read-only/planned until a non-fighting slice actually runs.

### Track D: Package, Evidence, And QA

Goal: every claim about "usable" has a repeatable artifact.

| Phase | Scope | Acceptance |
| --- | --- | --- |
| D1 Trace gates | Scripted runtime traces with deterministic checksums and event summaries. | `pnpm qa:trace` emits pass/fail artifacts for native and imported scenarios. |
| D2 Smoke automation | Runtime desktop/mobile plus Studio surfaces with screenshots and bridge checks. | `pnpm qa:smoke` verifies visible shell, bridge data, downloads, and package contents. |
| D3 Package export | `export-bundle/v0` with contracts, evidence, browser-fetchable local assets, current-session imported sources, and `sourcePackages` relink metadata in `project.json`. | Build Center can export a ZIP whose manifest tells the truth about bundled, skipped, failed, linked, and missing source assets. |
| D4 Fixture matrix | Official KFM, CodeFuMan, generated characters, imported stages, and known edge fixtures. | Compatibility trend is measurable per fixture and per subsystem. |
| D5 Visual regression | Stable screenshots/contact sheets for sprites, stages, UI, hitboxes, and effects. | Frontend/runtime changes are closed with visual proof, not only unit tests. |

### Track E: Modular Engine Beyond Fighting

Goal: use MUGEN as the first demanding module, not as the permanent ceiling.

| Phase | Scope | Acceptance |
| --- | --- | --- |
| E1 Core contracts | Project, asset, input, snapshot, renderer, audio, evidence, and package schemas. | Fighting code imports core contracts; core does not import fighting code. |
| E2 Module SDK | Module registration, settings schema, runtime factory, renderer adapter, QA presets. | A small module can declare assets, controls, and a playtest entry without editing Studio core. |
| E3 Platformer prototype | Minimal platformer module with tile/level data, camera, collision, and one player. | It runs in the same Studio shell and exports a module-specific runtime manifest. |
| E4 Cross-module tools | Shared Asset Library, Build Center, Evidence, and Debug shell with module-specific panels. | Studio remains coherent when switching project type. |

The first platformer slice is deliberately late. It should validate extracted contracts, not create them by wishful abstraction. Shared core may include project manifests, assets, input actions, tick/snapshot shape, renderer/audio adapters, debug bus, build outputs, and QA records; it must not import CNS, HitDef, rounds, helper ownership, or MUGEN command routing.

## Milestones

| Milestone | Result | Main tracks |
| --- | --- | --- |
| M0 Current playable baseline | Three local fighters, one native stage, imported KFM/fixtures partial bridge, Studio shell, trace evidence. | A, B, C, D |
| M1 Honest package MVP | Build Center exports `export-bundle/v0` with contracts, source-runtime maps, evidence, report, README, latest trace. | C, D |
| M2 Binary workspace package | Bundle browser-fetchable local generated/stage assets, current-session imported source files, asset checksums, source-package relink metadata, and repairable missing references. | C, D |
| M3 Character triage studio | AIR/CMD/CNS graph that explains commands, state routing, controllers, and unsupported gaps. | A, C |
| M4 KFM compatibility push | One real KFM route can idle, walk, crouch, jump, attack, guard/hit, recover, and use common effects. | A, B, D |
| M5 Stage parity push | Imported MUGEN stage layers, parallax, camera, bounds, and debug overlays become inspectable. | B, C, D |
| M6 Actor world refactor | Helpers, projectiles, explods, targets, and custom-state ownership move into first-class world systems. | A, B |
| M7 Studio repair loop | Generated sprites/atlases, replacement flow, QA contact sheets, and runtime manifest updates become one workflow. | C, D |
| M8 First non-fighting module | Minimal platformer module proves the core/studio/package architecture is not fighting-only. | B, C, E |

## Immediate Construction Order

Use `docs/ROADMAP_EXECUTION_BOARD.md` as the short current queue. The Studio roadmap keeps the product order:

1. R2: deepen `MatchWorld` lifecycle ownership: Projectile, Helper, Explod, and Target typed-operation cuts already exist; the next work is promoting actor/effect lifecycle and ownership behind world/system boundaries without checksum drift.
2. R1: expand KFM/Common1 gates beyond default `5000` entry, stand progression, guard-hit routing, fall branch, bounded synthetic recovery, bounded synthetic recovery input, bounded synthetic recovery-threshold handoff, bounded synthetic ground-recovery selection/velocity, official KFM ground-impact/bounce/lie-down entry, official KFM lie-down/get-up, official KFM air recovery-input, official KFM ground recovery-input, and early-recovery reject evidence into exact threshold tables/velocity math, exact tick-order parity, broader recovery parity, and exact guard-rule parity.
3. S1: expand Evidence Browser persistence, comparison, and links from badges/warnings to trace/controller records.
4. Expand the visible relink flow with persisted File System Access/IndexedDB source handles for reopened project manifests where the browser allows it.
5. Build the Character Studio graph around existing parsed data only after the evidence path can explain why a move ran or did not run.
6. Build Stage Studio Preview from current stage reports, then add Stage BG IR slices.
7. Add generated-authoring records after Asset/Build/Evidence can show provenance and QA.
8. Add IKEMEN scanner/profile reports before any IKEMEN execution.
9. Define shared module contracts after the fighting runtime gates above hold.
10. Only after fighting contracts stabilize, add the minimal platformer module to test the modular engine boundary.

## Risk Register

| Risk | Why it matters | Control |
| --- | --- | --- |
| CNS semantics sprawl | Personality and combat behavior live in triggers/controllers. | Typed IR, fixture matrix, compatibility report, small executable slices. |
| Renderer-owned logic | Three.js convenience can leak gameplay truth into scene objects. | Snapshot-only renderer contract and trace tests that run without DOM rendering. |
| Studio surface sprawl | Too many panels can become incoherent. | Keep playtest/preview central, route state in URL, every panel answers one debugging/build question. |
| Asset provenance loss | Generated/imported assets become impossible to trust. | Source-runtime map, checksums, replacement invalidation, package manifest. |
| False "MUGEN compatible" claims | Users need to know what works per character. | Per-character reports with loaded/parsed/compiled/routable/executed layers. |
| Future module lock-in | Fighting assumptions could block platformer/other genres. | Core contracts first, fighting module boundaries, module SDK before second genre grows. |

## Definition Of Usable

The project is "usable" for the current horizon when:

- A user can open the app, select or import content, and play a visible local match.
- The Studio can show why assets, states, commands, traces, and packages are valid or partial.
- Build Center can export project/runtime/package artifacts with schema versions and evidence.
- Unsupported behavior is visible in reports and does not crash the app.
- At least one real imported MUGEN character and the generated local roster can be visually verified through scripted QA.
- The next developer can add a controller, parser feature, renderer effect, or module without rewriting the shell.
