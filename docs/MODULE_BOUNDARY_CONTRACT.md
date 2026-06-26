# Module Boundary Contract

This document defines how the project can grow from a MUGEN/IKEMEN fighting sandbox into a broader browser game engine without polluting the shared core with fighting-specific rules.

## Rule

Shared core is extracted from proven contracts. It is not invented ahead of the fighting runtime.

The first non-fighting module is blocked until the fighting module proves stable enough boundaries through runtime traces, project/build contracts, and Studio evidence.

Do not promote `src/game`, `MugenSnapshot`, `ActorSnapshot`, `MugenSprite`, `ThreeMugenRenderer`, or `MugenAudioSystem` into shared core by renaming them. They are candidate shared seams only after MUGEN-specific types are hidden behind generic interfaces.

## Layers

```txt
core
  project/assets/input/tick/snapshot/render-audio/debug/build/qa contracts

modules/fighting-mugen
  DEF/AIR/CMD/CNS/SFF/SND/stage compatibility, HitDef, rounds, Common1, helpers

modules/platformer-later
  level tiles, platform physics, camera follow, collectibles, hazards, enemies

adapters
  Three.js renderer, Web Audio, DOM Studio, local package/export
```

## Shared Core May Own

- project metadata
- asset records and provenance
- source package records
- input action maps
- deterministic tick loop interface
- snapshot envelope
- render adapter interface
- audio event interface
- debug/evidence bus
- build/export package schema
- QA artifact registry
- module descriptor/status schema

The first shared extraction should come from Studio/Build/Evidence records because those are more stable than gameplay semantics: project records, asset records, actionable statuses, evidence ids, build outputs, export package metadata, and QA registry. Fighting-specific summaries should be produced by a `fighting-mugen` adapter.

## Shared Core Must Not Own

- CNS parsing/execution
- CMD command syntax
- HitDef
- Common1 states
- round/fight rules
- helper/projectile/explod semantics
- target memory
- MUGEN guard/get-hit/fall logic
- MUGEN/IKEMEN compatibility labels

If shared core needs a generic concept, name it generically and prove that it works for fighting plus one non-fighting slice before promoting it.

## Fighting Module Owns

- MUGEN/IKEMEN profile handling
- DEF/AIR/CMD/CNS/ST/SFF/SND/stage parsers
- compatibility reports
- controller compiler/IR
- MUGEN command buffer
- fighting actor runtime
- HitDef/combat/get-hit/guard/fall
- helpers/projectiles/explods/targets
- round HUD and match rules
- KFM/Common1 fixture gates

## Platformer Slice Gate

The first platformer slice can start only after:

- `MatchWorld` ownership is no longer just a derived facade for key actor/effect lifecycle
- project/runtime manifest contracts are stable enough for fighting
- Studio Evidence/Build can show module-specific gates
- shared core import-boundary review passes
- a generic runtime snapshot envelope exists without CNS, HitDef, rounds, helpers, projectiles, explods, targets, MUGEN, or IKEMEN terms

The gate is intentionally strict because the project should not become a generic engine by renaming folders. The shared core is allowed to emerge only from behavior already proven by the fighting module and Studio build loop.

## Extraction Plan

Use this order when turning the fighting sandbox into a modular engine:

| Phase | Build | Acceptance |
| --- | --- | --- |
| 1 | Keep `mugen-compat` as the only executable gameplay module while the runtime spine hardens. | Fighting smoke and trace gates pass; Module Studio marks future modules as planned/read-only. |
| 2 | Extract shared project, source-package, asset, evidence, build, and QA record shapes from Studio contracts. | Shared contracts do not import or name CNS, CMD, HitDef, rounds, Common1, helpers, targets, or command routing. |
| 3 | Define a generic `RuntimeSnapshotEnvelope` candidate with module id, tick, actors/renderables, camera, audio events, debug events, and QA events. | Fighting keeps CNS state, HitDef, guard, targets, helpers, explods, projectiles, and rounds inside fighting-owned payload/adapters. |
| 4 | Extract generic input action, tick loop, render adapter, audio adapter, and debug bus contracts from proven runtime seams. | Three.js and Web Audio consume snapshots/events, not MUGEN-specific runtime objects. |
| 5 | Add module descriptors for fighting and planned future modules. | Build Center and Module Studio show active/planned/missing gates without implying unshipped support. |
| 6 | Run an import-boundary review, then automate it. | `core` has no MUGEN/IKEMEN terminology or imports; module code imports shared contracts, not the other way around. |
| 7 | Implement the tiny platformer slice. | Platformer runs from project/build data and fighting smoke/trace still pass. |

The first slice should include:

- one level/tile model
- one player
- platform collision
- camera follow
- one collectible
- one hazard
- one simple enemy
- runtime snapshot
- Studio playtest route
- package/build evidence

## Module Descriptor Shape

Future module descriptors should include:

```ts
type GameModuleDescriptor = {
  id: string
  label: string
  projectTypes: string[]
  assetKinds: string[]
  inputActions: string[]
  runtimeManifestVersion: string
  editorSurfaces: string[]
  qaGates: string[]
}
```

This is a planning shape, not a committed API until the fighting module extraction proves it.

## Import Boundary Review

Before promoting shared core code, verify:

- core does not import `src/mugen`
- core does not mention CNS, CMD, HitDef, Common1, rounds, helpers, projectiles, explods, targets, MUGEN, IKEMEN, or command routing
- module code imports core contracts, not the other way around
- Three.js adapters consume snapshots/events only
- Studio surfaces use module descriptors instead of fighting assumptions where practical

Future automation target:

```bash
pnpm check:boundaries
```

The first version can be a small script or `rg` gate. It should fail if `src/core/**` imports `src/mugen/**` or contains fighting/MUGEN terminology, and it should fail if a future `platformer` module imports the fighting module.

## Anti-Claims

Do not claim:

- `generic engine`
- `module SDK`
- `platformer support`
- `multi-genre editor`

until a non-fighting module runs from project/build data and the fighting smoke/trace gates still pass.
