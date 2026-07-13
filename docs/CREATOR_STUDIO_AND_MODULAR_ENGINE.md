# Creator Studio And Modular Engine

The long-term product is not only a MUGEN/IKEMEN compatibility runner. The broader direction is a local web game studio that starts with MUGEN as the first engine vertical, then grows into reusable modules for other 2D/2.5D game types such as platformers, arena fighters, beat-em-ups, and custom sprite-driven games.

For the operating build order across Studio, runtime, generated assets, QA evidence, and later modules, use `docs/FULL_BUILD_PROGRAM.md`.

## Product Vision

Build a private browser-based creation studio where a user can:

- Create and manage game projects.
- Import legacy MUGEN/IKEMEN assets.
- Generate original characters, stages, sprites, sounds, and UI assets.
- Inspect and edit data through visual tools.
- Run/playtest the project immediately.
- Export runtime-ready project packages.
- Swap or extend gameplay modules without rewriting the renderer or editor.

MUGEN compatibility is the first proof that the engine can ingest complex legacy game data. The studio should make that capability reusable beyond fighting games.

## Product Layers

```txt
Creator Studio UI
  -> Project workspace
  -> Asset library
  -> Editors and inspectors
  -> Playtest launcher
  -> Export pipeline

Game Engine Core
  -> Input actions
  -> Simulation modules
  -> Runtime entity model
  -> Asset manifests
  -> Save/build/export services

Genre Modules
  -> MUGEN/IKEMEN fighting module
  -> Platformer module
  -> Beat-em-up module
  -> Arena/action module

Render/Audio Adapters
  -> Three.js scene adapter
  -> Web Audio adapter
  -> DOM HUD/debug adapter
```

The studio is allowed to be opinionated, but the engine should stay modular.

The Studio object model is:

```txt
Project
  -> assets
  -> sourcePackages
  -> modules
  -> entry
  -> compatibility
  -> evidence
  -> buildOutputs
```

`project.json` is the editable/editorial source. `runtime-manifest/v0` is the compiled runtime handoff. Studio surfaces should not fork their own truth; they read and write the project object, then compile, playtest, record evidence, and export from that shared state.

Every authoring loop should eventually close:

```txt
save -> compile -> playtest -> evidence -> export
```

Until a tool can close that loop, it should be labeled as preview, diagnostic, or planned. This especially applies to Character Studio, Stage Studio, Module Studio, generated sprite tools, and future platformer/editor surfaces.

## Project Model

Every game project should have a manifest. The current Studio mode can already export, reopen, and save a first `project.json`-style manifest with schema `mugen-web-sandbox/project/v0` in browser-local recent projects; the recent-project index now has an explicit `mugen-web-sandbox/project-index/v1` payload and migrates legacy v0 indexes while retaining per-project revisions. It also has a first pure compiler step that turns that editor/project manifest into a compact `mugen-web-sandbox/runtime-manifest/v0` contract, plus a `mugen-web-sandbox/export-bundle/v0` ZIP that packages the project/runtime contracts, Studio summaries, source-runtime maps, evidence, reports, README, latest trace when available, browser-fetchable local assets with bytes/checksums, and current-session imported ZIP/folder source files from the in-memory VFS. `project.json` now records `sourcePackages` so reopened projects can say which original ZIP/folder must be relinked before imported MUGEN files can be embedded again; Build Center exposes manual ZIP/Folder relink actions and validates the loaded source against required paths. Future work is to edit, resolve external assets, and persist File System Access/IndexedDB source handles for automatic reacquire where browser APIs allow it.

```ts
type GameProjectManifest = {
  schemaVersion: "mugen-web-sandbox/project/v0";
  id: string;
  name: string;
  engineVersion: string;
  generatedAt: string;
  projectType: "mugen-port" | "platformer" | "beat-em-up" | "arena" | "custom";
  modules: string[];
  sourcePackages: Array<{
    id: string;
    name: string;
    kind: "zip" | "folder";
    fileCount: number;
    status: "linked" | "missing";
    characterId?: string;
    characterName?: string;
    defPath?: string;
    stageIds: string[];
    stageDefPaths: string[];
    requiredPaths: string[];
  }>;
  assets: {
    characters: string[];
    stages: string[];
    audio: string[];
    ui: string[];
    effects: string[];
  };
  entry: {
    mode: "match" | "level" | "scene" | "editor-preview";
    sceneId?: string;
    p1?: string;
    p2?: string;
    stage?: string;
  };
  assetRecords: StudioAssetRecord[];
  compatibility: {
    gates: StudioGateRecord[];
    stats: Record<string, number>;
  };
};
```

The current export/import/save path is intentionally derived from runtime/import state. Reopening a manifest applies the playtest entry when referenced fighters and stages are already available. Saving stores the manifest in browser `localStorage` for quick local recall. Later the manifest should become the source of truth for a project database/workspace format, including relink state, invalidated evidence, stale build outputs, missing sources, and the next action that unblocks export.

The current runtime compile contract is deliberately smaller than `project.json`:

```ts
type CompiledRuntimeManifest = {
  schemaVersion: "mugen-web-sandbox/runtime-manifest/v0";
  sourceSchemaVersion: "mugen-web-sandbox/project/v0";
  projectId: string;
  projectName: string;
  entry: GameProjectManifest["entry"];
  runtime: {
    primaryModule: "mugen-compat";
    renderer: "three-render";
    tickRate: 60;
    snapshotContract: "mugen-snapshot/v0";
  };
  modules: {
    requested: string[];
    active: RuntimeModuleRecord[];
    planned: RuntimeModuleRecord[];
    missing: RuntimeModuleRecord[];
  };
  assets: GameProjectManifest["assets"] & {
    records: StudioAssetRecord[];
  };
  diagnostics: {
    warnings: string[];
    errors: string[];
  };
};
```

`project.json` stays editor-facing and source-preserving. `runtime-manifest/v0` is the smaller build artifact the engine can load without inheriting every Studio concern.

## Project Workspace Contract

A studio project should be a folder-like workspace, even when the first browser build stores it in IndexedDB or imports it as a ZIP. The shape should stay stable:

```txt
project.json
assets/
  characters/
  stages/
  audio/
  ui/
  effects/
modules/
  fighting.mugen/
  platformer/
source/
  imported/
  generated/
  authored/
build/
  runtime/
  reports/
```

Workspace rules:

- `project.json` is the only required entry point.
- `source/imported` stores original user-provided legacy files when the user chooses to keep them.
- `source/generated` stores imagegen/sprite-atlas-builder outputs and intermediate QA reports.
- `source/authored` stores hand-edited project data.
- `build/runtime` stores compiled manifests that the game runtime consumes.
- `build/reports` stores compatibility, validation, and visual-QA artifacts.

The Studio should treat every asset as a record with provenance. The current implementation has a smaller `StudioAssetRecord`; this is the destination planning shape it should grow toward:

```ts
type StudioAssetRecord = {
  id: string;
  label: string;
  kind: "character" | "stage" | "sprite-atlas" | "sound" | "ui" | "effect" | "level" | "report";
  source: "mugen-import" | "ikemen-import" | "generated" | "authored" | "converted" | "runtime-demo";
  status: "ok" | "partial" | "warn" | "fail" | "pending" | "planned" | "active" | "blocked" | "unsupported" | "unknown";
  detail: string;
  editorPath?: string;
  runtimePath?: string;
  reports: string[];
  evidenceIds: string[];
  affectedBy?: string[];
  nextAction?: StudioNextAction;
  tags: string[];
};

type StudioNextAction = {
  kind:
    | "open-evidence"
    | "open-character-preview"
    | "open-stage-preview"
    | "open-build"
    | "relink-source"
    | "replace-asset"
    | "regenerate-source"
    | "run-trace"
    | "run-smoke"
    | "not-supported-yet";
  label: string;
  targetId?: string;
};
```

This keeps private imported characters, generated original characters, and authored future-platformer assets in the same product without pretending they have the same pipeline.

## Actionable Status Contract

The Studio should not treat status badges as decoration. Every status shown in Assets, Evidence, Build, Character, Stage, Debug, and Modules must answer:

- What is affected?
- How severe is it?
- What evidence proves it?
- What does it block?
- What is the next action?

Use this planning shape for gates, warnings, evidence records, and build rows:

```ts
type StudioActionableStatus = {
  id: string;
  label: string;
  status: "ok" | "partial" | "warn" | "blocked" | "unsupported" | "unknown";
  severity: "info" | "notice" | "warning" | "error";
  affectedAssetId?: string;
  affectedSystem?: "runtime" | "parser" | "renderer" | "audio" | "stage" | "studio" | "build" | "module";
  impact: string;
  evidenceIds: string[];
  blockedBy: string[];
  staleBecause?: string;
  canExport: boolean;
  nextAction: StudioNextAction;
};
```

Build Center is the authority for runnable, partial, blocked, and exportable truth. Other surfaces may summarize that truth, but they should link to the relevant Build row, evidence record, asset, actor, fixture, trace, or report instead of inventing a separate interpretation.

Current first cut:

- Generated/imported asset records and Studio gates now serialize severity, impact, evidence ids, blockers, exportability, and next action into `project.json`.
- Legacy manifests without those fields are normalized with safe actionable defaults when reopened.
- Selected asset detail, asset browser/list rows, Build readiness rows, Evidence records, and Evidence summary show actionable status data.
- `window.__MUGEN_WEB_SANDBOX__.studioAssets.selectedAsset.nextAction` and `.studioEvidence.topAction` expose the first actionable bridge for QA and future automation.
- `pnpm qa:smoke` requires selected asset next action and Evidence top action to be present.
- Exported trace artifacts now persist into bounded browser-local Studio evidence history with project id, entry, source package metadata, checksum, stale/current status, and QA bridge exposure through `.storedTraceEvidence` plus `.studioEvidence.stats.persistedTraceArtifacts`.
- Studio Evidence now compares persisted trace artifacts against the current session artifact and exposes same/different/missing-current status plus checksum and frame/event/gate/pass deltas through `.studioEvidence.persistedTraceComparisons`.
- The Evidence surface now renders a first Trace Comparison Review with metric rows and gate-diff rows, so the persisted evidence store is reviewable rather than only counted.
- Runtime trace artifacts now include compact per-frame summaries, and Studio Evidence renders a first Trace Frame Scrubber that can select frame checksum/event rows through `.traceFrameScrubber`.

Remaining work:

- Turn the first frame scrubber into replay-style trace diff workflow and extend persistence beyond trace artifacts.
- Expand source-package relink/regenerate actions beyond the first manual Build Center relink flow.
- Promote Character/Stage Preview from diagnostics into project-aware repair surfaces.

The first Studio implementation sequence is:

```txt
actionable status data
  -> persisted evidence records
  -> Build authority and source-package truth
  -> Asset repair/relink flow
  -> Character and Stage diagnostic previews
  -> authoring tools
```

Any authoring feature that cannot close `save -> compile -> playtest -> evidence -> export` stays labeled preview, diagnostic, or planned.

## Module Contract

Every gameplay module should expose the same high-level hooks:

```ts
interface GameModule {
  id: string;
  label: string;
  projectTypes: GameProjectManifest["projectType"][];
  compile(project: GameProjectManifest): Promise<ModuleCompileResult>;
  createRuntime(compiled: CompiledModuleProject): ModuleRuntime;
  createEditors(context: StudioEditorContext): StudioPanelDefinition[];
}
```

Runtime modules should return snapshots rather than renderer objects:

```ts
interface ModuleRuntime {
  step(input: RuntimeInputFrame): RuntimeSnapshot;
  dispatch(command: RuntimeCommand): RuntimeSnapshot;
  getSnapshot(): RuntimeSnapshot;
}
```

That contract is the bridge from MUGEN today to platformers later. The fighting module can own CNS, command buffers, HitDef, rounds, and helpers. A platformer module can own tile collision, checkpoints, hazards, and camera follow. Both still reuse the same project workspace, asset library, Three.js adapter, audio adapter, debug panel, QA bridge, and export path.

## Studio Surfaces

### Destination Information Architecture

The product should settle into two public modes:

- `Playable Runtime`: play, test, inspect current match status, export session reports, and keep the game loop immediately usable.
- `Creator Studio`: create/open/save projects, import assets, inspect legacy data, preview characters/stages, browse evidence, debug runtime actors, build/export, and manage modules.

The existing standalone `Inspector Mode` is a transitional tool. Its destination is `Character Studio / Data Inspector` inside Creator Studio, where DEF/AIR/CMD/CNS/SFF/SND inspection can connect to project assets, evidence records, warnings, and build/export state.

### Current First Cut

The browser app now has a first `Studio` mode at `?mode=studio`. It is intentionally small, but it is a real product surface rather than a static mock:

- It keeps the current Three.js match playtest alive in the center viewport for Workbench, Modules, and Build.
- It has URL-addressable internal surfaces: `Workbench`, `Assets`, `Inspector`, `Debug`, `Evidence`, `Modules`, and `Build`.
- Its Assets surface provides a first dense project asset library with provenance/status filters, selected entry assets, attention queue, and QA bridge summary at `.studioAssets`.
- Its Studio tab rail now surfaces each workspace summary, asset/evidence filters show visible counts, and asset rows separate detail, next action, status, and exportability so warnings can be triaged without opening JSON.
- It exposes a project summary with active P1/P2/stage entry data.
- It lists current assets with provenance: generated atlas fighters, imported MUGEN fighters when present, authored/demo stages, imported stages, compatibility reports, and SND records.
- It lists engine modules and acceptance gates from a typed `StudioModel` rather than hard-coded panel copy.
- Its Inspector surface can select AIR actions through the existing inspector runtime, switch the center viewport to AIR preview, and show frame/timeline/collision metadata without leaving Studio.
- Its Debug surface keeps the match playtest central while showing the live `MatchWorld` actor registry, ownership index, runtime snapshot facts, and current debug pipeline state.
- Its Modules surface presents module status as a graph-like workspace backed by the same module records used for compilation.
- Its Build surface groups project/runtime/report/local-save outputs, QA evidence, and first readiness rows for runnable, partial, blocked, and exportable states.
- It can export a `project.json`-style manifest from the current Studio state.
- It can reopen a compatible `project.json` manifest and apply its P1/P2/stage playtest entry when those IDs exist locally.
- It can save the current manifest into browser-local recent projects and reopen those entries.
- It can compile the current manifest into `runtime-manifest/v0`, show compiler warnings, and export the compiled runtime contract.
- It publishes the active Studio tab, summary, project manifest, compiled runtime manifest, and recent project records through `window.__MUGEN_WEB_SANDBOX__.studioTab`, `.studio`, `.project`, `.compiledProject`, and `.storedProjects` so QA scripts and future tools can inspect them.

Current limits:

- `project.json` export/import/local recent save, source-package relink metadata, and `runtime-manifest/v0` compilation exist, but persistent workspace editing is not implemented yet.
- The runtime manifest is a metadata/build contract only; binary/source bundling lives in `export-bundle/v0`.
- Imported manifests do not fetch or mount missing external assets yet; unavailable fighter/stage IDs and missing source packages are reported as warnings.
- Asset records are derived from current runtime/import state, not saved to a project database.
- Module settings are visible but not editable.
- The generated-character and stage-authoring flows are still external pipeline steps.

### Destination Vs Current State

The Studio destination is a creator workbench, but the current product promise is narrower:

| Area | Current Promise | Destination Promise |
| --- | --- | --- |
| Project | Derive, save, reopen, compile, and export a local manifest from current runtime/import state. | Persistent workspace where `project.json` is the editable source of truth. |
| Assets | Show provenance, status, dependencies, source-runtime map, and relink/missing-source truth for loaded assets. | Batch import, replacement, regeneration, authored edits, and build invalidation. |
| Character Studio | Preview existing imported/generated data: AIR frames, sprites, axis, Clsn, commands, states, evidence. | Edit collisions/actions, repair commands/states, regenerate sprite rows, and export templates. |
| Stage Studio | Preview floor, bounds, starts, zoffset, camera, layers, and unsupported stage report data. | Author layers, BGCtrl, camera rules, parallax, and reusable stage packages. |
| Evidence | Show current session artifacts, gates, reports, and diagnostics. | Persisted trace history, comparison, stale-source warnings, and project-scoped evidence review. |
| Modules | Show active/planned/missing module status. | Register and configure real non-fighting modules after shared contracts are proven. |

Rule: an editor is not mature until its save -> compile -> playtest -> export loop can either prove the change or explain why it is blocked.

Language rule: until that loop exists for a surface, label it as `Preview`, `Diagnostic`, `Planned`, or `Blocked`, not as a complete editor. `Build` remains the authority for runnable, partial, blocked, stale, missing-source, and exportable truth; other surfaces should link to Build/Evidence instead of inventing separate green status.

### Project Dashboard

Purpose:

- Open recent local projects.
- Create a project from a template.
- Show compatibility/build status.
- Launch Playtest.

Templates:

- MUGEN/IKEMEN compatibility project.
- Original fighting game.
- Side-scrolling platformer.
- Beat-em-up prototype.
- Blank Three.js sprite project.

### Asset Library

Purpose:

- List characters, stages, sprites, sounds, palettes, FX, UI assets.
- Show source provenance: imported MUGEN, generated, hand-authored, converted.
- Show validation badges: parsed, decoded, playable, missing refs, unsupported features.

### Character Studio

Purpose:

- Import MUGEN characters.
- Generate or replace sprite rows.
- Inspect AIR actions and collision boxes.
- Edit action metadata, axis, offsets, and collision boxes.
- Preview commands/states.
- Run a single-character test harness.

For generated characters, this surface should integrate the sprite-atlas pipeline:

```txt
concept prompt
  -> sprite sheet generation
  -> atlas normalization
  -> motion QA
  -> collision/action authoring
  -> playable character definition
```

### Stage Studio

Purpose:

- Import MUGEN stage DEF/SFF.
- Build original stages from layers.
- Edit floor, camera bounds, zoffset, player starts, parallax, tile settings.
- Preview stage without a match.

### Runtime Debug Studio

Purpose:

- Inspect current entities.
- Step frames deterministically.
- Watch commands, triggers, states, vars, hitdefs, targets, helpers, projectiles, explods.
- Export a compatibility/runtime trace.

### Module Studio

Purpose:

- Configure which gameplay module a project uses.
- Expose module-specific settings without changing the renderer.
- Eventually support new modules such as platformer physics or beat-em-up lanes.

## Engine Module Boundaries

### Core Module

Reusable across all genres:

- Asset manifest loading.
- Input action mapping.
- Runtime tick loop.
- Entity snapshots.
- Camera contracts.
- Collision primitives.
- Save/load state.
- Debug event bus.
- QA bridge.

### Fighting Module

MUGEN/IKEMEN-specific:

- Character package loader.
- MUGEN parsers and compatibility profiles.
- Command buffer.
- CNS state program executor.
- Hit/hurt boxes.
- HitDef, guard, hitpause, superpause, target, helper, projectile, explod systems.
- Round/HUD model.

### Platformer Module

Future reusable module:

- Tile/level loader.
- Platformer physics.
- One-player camera follow.
- Collectibles, hazards, enemies.
- Checkpoints and level transitions.
- Animation state machine not tied to CNS.

### Beat-Em-Up / Arena Module

Future reusable module:

- Multi-enemy actor manager.
- Lane/depth movement or arena movement.
- Spawn waves.
- Hit reactions, pickups, simple AI.
- Camera region constraints.

## Asset Strategy

Use stable manifest keys, not raw filenames, as the public API:

```txt
assets/
  characters/<id>/
    character.json
    sprites/
    audio/
    mugen/
  stages/<id>/
    stage.json
    layers/
    mugen/
  modules/<module-id>/
```

For the current project:

- MUGEN imported assets remain local/private and ignored when needed.
- Generated original assets can live under `public/characters` or `public/stages` when they are project-owned.
- Future exported projects should distinguish `source/`, `generated/`, and `runtime/` assets.

## Editor Data Vs Runtime Data

Keep two shapes:

- Editor data: verbose, annotated, undoable, source-preserving.
- Runtime data: compact, compiled, deterministic, fast to load.

Example:

```txt
AIR source + edit annotations
  -> editor action model
  -> compiled animation/action manifest
  -> runtime snapshots
```

## MVP Studio Slice

Do not build the entire studio first. The first useful slice should be:

1. Project manifest stored locally.
2. Asset Library listing loaded/generated characters and stages.
3. Character Studio for AIR animation/collision preview.
4. Stage Studio for bounds/floor/player-start preview.
5. Playtest launcher that opens Runtime Mode with selected assets.
6. Compatibility/validation panel shared with the current Inspector.

This keeps the current MUGEN MVP intact while opening the path to broader creation tools.

## Platformer Expansion Path

After the fighting/MUGEN port MVP is stable, a platformer prototype should reuse:

- Three.js render adapter.
- DOM HUD/debug framework.
- Asset manifests.
- Input action map.
- Snapshot/debug bridge.
- Sprite atlas provider.
- Collision primitives.

It should replace:

- CNS command/state runtime.
- Fighting round logic.
- HitDef/guard/target systems.

With:

- Level/room runtime.
- Gravity/platform collision.
- Enemy/collectible systems.
- Checkpoint/progression model.

This is the proof that the engine has become modular instead of only MUGEN-shaped.

## Risks

- Building editor UI before runtime contracts stabilize can create throwaway tools.
- Mixing MUGEN-specific assumptions into core modules will make platformer expansion painful.
- Treating generated sprites as final without motion QA will keep causing scale/pose issues.
- A project format without source/runtime separation will be hard to export cleanly.

## Decision

The next architecture horizon is:

```txt
MUGEN Web Sandbox
  -> MUGEN/IKEMEN compatibility engine module
  -> Creator Studio for project/assets/playtest
  -> Modular Three.js game engine foundation
  -> Other genre modules after the fighting MVP is trustworthy
```

This keeps the current work valuable while making the future bigger than one legacy engine.
