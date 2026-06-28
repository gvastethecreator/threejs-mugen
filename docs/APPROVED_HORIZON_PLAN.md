# Approved Horizon Construction Plan

This is the approved construction plan for the expanded direction: a progressive MUGEN / IKEMEN-GO TypeScript + Three.js port, a playable local fighting sandbox, a Creator Studio, a generated-asset pipeline, and a later modular game-engine foundation.

The decision is to build all of it, but not as one giant feature drop. The project advances through evidence-backed cuts where the runtime stays playable, the Studio exposes real data, and future modules inherit proven contracts instead of speculative abstractions.

Use `WORKPLAN.md` for the current execution ledger and `ARCHITECTURE_DECISIONS.md` for implementation constraints.

## Approved Product Shape

The project now has five connected products inside one local app:

| Product Slice | Purpose | First Real Proof |
| --- | --- | --- |
| Playable Runtime | Keep a usable fighting game loop alive for every change. | Default match opens with three local fighters, a stage, HUD, controls, combat, debug, and smoke screenshots. |
| Compatibility Engine | Load and execute MUGEN / IKEMEN content progressively. | KFM-style real CMD/CNS routes execute visible state changes and export parsed/compiled/executed evidence. |
| Creator Studio | Manage local projects, assets, evidence, build outputs, previews, and debug data. | User can save/reopen `project.json`, compile `runtime-manifest/v0`, playtest, and export reports. |
| Generated Asset Pipeline | Create original playable fighters/stages with image generation plus sprite-atlas QA. | Generated fighter passes motion, scale, collision, atlas, browser, and trace evidence gates. |
| Modular Engine Foundation | Reuse the same project/render/audio/debug/QA contracts for future genres. | A later platformer slice runs from project data without MUGEN-specific leakage into shared core. |

## Consensus Lock

Architecture review and product/UX review agree on the same construction lock:

```txt
RuntimeTrace
  -> typed ControllerOp / Runtime IR
  -> MatchWorld ownership
  -> official KFM compatibility gates
  -> stage/audio/presentation IR
  -> evidence-first Creator Studio
  -> generated asset authoring
  -> IKEMEN profile scanner
  -> modular engine slice
```

Do not invert this order. Studio and asset work can proceed in parallel only when they expose the current runtime truth rather than inventing new truth.

The 2026-06-25 review tightened the rule: finish Build/Asset/Evidence surfaces only as evidence carriers, then return to the runtime spine. The next usability unlock is not another broad Studio screen; it is an official KFM fixture route gate backed by typed runtime evidence for hit/guard/state-exit/get-hit behavior. First hit, guard, partial stand/crouch guard-hit `150 -> 151` and `152 -> 153`, partial hitstun/get-hit, fall-metadata, attacker-owned custom get-hit controller-flow, defender-owned default Common1-style state `5000` entry, defender-owned stand get-hit progression `5000 -> 5001 -> 0`, defender-owned fall branch `5000 -> 5030 -> 5050`, bounded synthetic Common1 fall recovery `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0`, bounded synthetic recovery-input route `5050 -> 5210 -> 0`, bounded synthetic recovery-threshold actor-frame handoff, bounded synthetic air-recovery velocity, bounded synthetic ground-recovery selection/velocity, bounded synthetic too-early recovery-input rejection in `5050`, optional official KFM fall/ground-impact/bounce/lie-down entry `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110`, optional official KFM lie-down/get-up recovery `5110 -> 5120 -> 0`, optional official KFM air recovery-input completion `5050 -> 5210 -> 52 -> 0`, optional official KFM too-early recovery-input rejection in `5050`, optional official KFM ground recovery-input completion `5050 -> 5200 -> 5201 -> 52 -> 0`, and state-exit cuts now exist; exact tick-order parity, exact recovery threshold tables/velocity math beyond the bounded threshold/air/ground/reject windows, broader recovery parity beyond the bounded air/ground routes, and exact guard start/end/proximity/air/broader-crouch parity are the next runtime gaps.

## 2026-06-25 Architecture Review Synthesis

A fresh runtime, QA, and product/UX review approved the full horizon with one constraint: every product promise must attach to a gate that can fail. The consensus is:

- `MatchWorld` is the target runtime boundary, but today it is still partly a facade over `PlayableMatchRuntime`; future runtime work should deepen ownership instead of adding more raw behavior to the integration runtime.
- Typed `ControllerOp` evidence proves plumbing, not full MUGEN semantics. Synthetic traces are required regression gates, but official fixture gates are required before claiming fixture compatibility.
- Studio should be a local evidence workbench before it becomes a mature editor. Each `ok`, `partial`, `blocked`, `unsupported`, or `unknown` badge must point to evidence, an affected asset/system, impact, and the next action.
- Generated fighters prove the native authoring/runtime pipeline. They never count as imported MUGEN compatibility evidence.
- IKEMEN starts as scanner/profile/reporting only. ZSS, Lua, rollback, netplay, and IKEMEN-only runtime behavior stay blocked until the MUGEN fighting spine is evidence-backed.
- The modular engine is extracted from proven contracts. Do not invent a generic SDK, ECS, or platformer runtime before shared input, asset, tick, snapshot, render, audio, debug, build, and QA seams survive the fighting module.

The anti-self-deception bar is simple: if a claim cannot name a trace, fixture, compatibility record, screenshot, or exported artifact that could fail, it is not a current feature.

The follow-up construction review adds three stricter rules:

- Runtime claims close with an explicit pair: **claim allowed** and **claim blocked**. Parser coverage, compiled IR, and typed `ControllerOp` plumbing are separate support levels; none of them become runtime compatibility until a trace or fixture proves execution.
- Studio IA is a workflow, not a flat tab list: `Project / Workbench -> Assets -> Evidence -> Build`, with `Character`, `Stage`, and `Debug` as contextual tools. `Build` is the visual authority for runnable, partial, blocked, stale, missing-source, and exportable status.
- Modularization starts with Studio/Build/Evidence contracts and import-boundary gates, not by promoting `src/game` or `MugenSnapshot` to shared core. A future platformer slice is only a proof of contract after the fighting smoke/trace gates still pass.

Negative fixtures are part of the plan, not cleanup: missing `common1.cns`, malformed DEF paths, unknown controllers/triggers, unsupported SFF/SND features, and IKEMEN-only ZSS/Lua/config files should report `unsupported` or `unknown` with impact and next action, never crash or show green status.

The approved 2026-06-25 construction refresh accepts every proposed horizon, but pins the language to current truth:

- The near-term engine is **fixture-tested partial MUGEN compatibility**, not full MUGEN parity.
- The IKEMEN work is **scanner/profile/reporting first**, not ZSS/Lua/IKEMEN execution.
- The Studio is **a local evidence workbench first**, not a mature editor until save/compile/playtest/export loops prove edits.
- Generated fighters and stages are **native/authored assets**, not imported MUGEN compatibility evidence.
- The modular engine is **an extraction horizon**, not a generic SDK to build before the fighting module earns stable contracts.

## Build Package Plan

All approved ideas are grouped into build packages so they can be constructed without drifting into disconnected prototypes.

| Package | Build First | Depends On | First Acceptance |
| --- | --- | --- | --- |
| Runtime spine | Typed `ControllerOp` expansion, side-effect systems, trace gates, actor ownership. | Current playable runtime and trace harness. | A controller family such as `Projectile`, `Helper`, or `Explod` produces typed operation evidence and stable trace output. |
| Fixture compatibility | Real KFM/Common1 fall, bounce-entry, liedown, recovery, guard-state, normal and special routes. | Runtime spine and optional local fixtures. | Artifact proves what real fixture state/controller chain executed and what stayed partial. |
| Studio workbench | Evidence Browser persistence, Character Studio preview, Stage Studio preview, Runtime Debug detail, Build/Assets relink truth. | Project/runtime/evidence contracts. | User can inspect an asset, see linked evidence, compile/playtest/export, and understand blocked or partial status. |
| Generated authoring | Brief/provenance records, image source tracking, atlas QA ingestion, collision/action authoring, replacement flow. | Asset Library, Evidence, Build Center. | One generated fighter shows prompt/source -> atlas -> QA -> collision -> runtime evidence without hiding bad motion or scale. |
| IKEMEN profile | Feature scanner for ZSS, Lua, IKEMEN config, extended stage/system features. | Compatibility report levels and fixture discipline. | IKEMEN-only content is recognized and reported separately from MUGEN 1.0/1.1 support. |
| Shared modules | Core input/assets/tick/snapshot/render/audio/debug/build/QA contracts. | Fighting runtime contracts proven by traces and Studio. | Shared core contains no CNS, HitDef, round, helper, or MUGEN command-routing assumptions. |
| Platformer slice | Tiny module with level/tile data, player movement, camera, collectible/hazard/enemy basics. | Shared module contracts. | Platformer runs from project/build data through the same Three.js/audio/debug/QA adapters. |

Visual and product design work belongs inside the Studio package: before a large Studio redesign, generate three focused interface directions, select one, then implement it with browser visual QA. Planning images can guide layout, but shipped UI must still bind to real runtime/project/evidence data.

The Studio construction object is `Project -> assets/sourcePackages/modules/entry/compatibility/evidence/buildOutputs`. `project.json` is the editable project source of truth; `runtime-manifest/v0` is the compiled runtime handoff. Every authoring surface should eventually close the same loop: save, compile, playtest, evidence, export. Until that loop exists, Character Studio, Stage Studio, Module Studio, and generated-asset tools stay diagnostic or preview-first rather than pretending to be full editors.

## Milestone Program

| Milestone | Build | Acceptance Gate |
| --- | --- | --- |
| M0: Baseline Lock | Keep Runtime, Inspector, Studio, generated fighters, Rooftop Dojo, loader, smoke, and trace gates stable. | `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm qa:smoke`, runtime/studio screenshots. |
| M1: Evidence Kernel | Expand traces into command, controller, actor, combat, checksum, and artifact evidence. | A scripted match proves input route, controller execution, combat reason, final snapshot, and gate result. |
| M2: Typed Compatibility Path | Move high-value controllers into typed operations and compiler/runtime reports. | Reports separate parsed, decoded, recognized, compiled, routed, executed partial, parity, unsupported, and unknown. |
| M3: MatchWorld Ownership | Make players, helpers, projectiles, explods, targets, effects, pause, and audio inspectable world facts. | Runtime Debug Studio shows ownership tree and stable actor/effect metadata without checksum drift. |
| M4: KFM Official Fixture Route Gate | Broaden official KFM from routed attacks into hit/guard/state-exit/get-hit evidence without claiming full parity. | KFM fixture routes can stand, walk, crouch, jump, execute one normal and one special, and hit or guard a dummy through real data with explicit gaps. |
| M5: Stage / Audio / Presentation IR | Move stage/audio/presentation behavior toward renderer-independent contracts. | Imported stage/audio reports show parsed, rendered/decoded, fallback, partial, and unsupported reasons. |
| M6: Creator Studio MVP | Build project dashboard, asset library, evidence browser, build center, character/stage previews, debug studio. | User can create/save/reopen/compile/playtest/export locally with warnings and provenance. |
| M7: Generated Authoring | Add briefs, imagegen provenance, atlas QA ingestion, collision/action authoring, and MUGEN-lite/runtime exports. | One generated fighter can be regenerated, validated, collision-authored, and played without hiding bad art. |
| M8: IKEMEN Profile Scanner | Detect IKEMEN-only files/features separately from MUGEN support. | IKEMEN content is classified and reported without silent failure or false MUGEN parity claims. |
| M9: Shared Module Contracts | Extract only proven shared contracts for input, assets, tick loop, snapshots, debug, render, audio, build. | Shared core contains no CNS, HitDef, round, helper, or MUGEN command-routing assumptions. |
| M10: Platformer Slice | Add one tiny platformer template after shared seams are proven. | Platformer scene runs from project/build data through the same Three.js/audio/debug/QA adapters. |

## Parallel Work Rules

Parallel work is allowed when it does not fake maturity:

- Runtime kernel work can continue while Studio surfaces are built, as long as Studio reads real trace/project/runtime data.
- Asset Library and Evidence Browser can be built before advanced editors because they expose truth.
- Generated fighters can be regenerated and QA-gated while KFM compatibility grows, but they must be labeled generated/native, not imported MUGEN support.
- Stage Studio can start as preview/reporting before BGCtrl editing exists.
- Platformer planning can be documented, but runtime implementation waits until the fighting module proves shared contracts.

## Studio IA Construction

The destination public IA has two modes:

```txt
Playable Runtime
Creator Studio
```

The current standalone Inspector is transitional. Its destination is `Creator Studio -> Character Studio / Data Inspector`.

Build the Studio in this product order:

| Order | Surface | First Useful Version |
| --- | --- | --- |
| 1 | Runtime Workbench | Central playtest with active project, selected assets, warnings, and latest evidence. |
| 2 | Evidence Browser | Filter parser/compiler/runtime/asset/stage/audio/trace evidence with attention queue. |
| 3 | Asset Library | Dense table of assets, provenance, validation status, reports, missing refs, blocked warnings. |
| 4 | Build Center | `project.json`, `runtime-manifest/v0`, warnings, trace/report export, blocked/exportable states. |
| 5 | Character Studio Preview | AIR actions, timeline, sprite source, axis, Clsn1/Clsn2, command/state summaries. |
| 6 | Stage Studio Preview | Floor, bounds, starts, zoffset, camera, layers, stage report, unsupported BG features. |
| 7 | Runtime Debug Studio | Actors, commands, states, controllers, targets, helpers, projectiles, explods, pause/audio/effects. |
| 8 | Generated Authoring | Character briefs, source prompts, atlas QA, collision/action authoring, sprite replacement. |
| 9 | Module Studio | Initially read-only module status and SDK notes; editable settings only after real module contracts exist. |

UX guardrails:

- Keep preview/playtest central.
- Use dense product-tool UI: filters, tables, badges, tabs, warnings, and contextual inspectors.
- Do not show green status without linked QA evidence.
- Show `partial`, `unsupported`, `unknown`, and missing assets near the affected item.
- Do not make modular engine support look shipped until a non-fighting slice runs.

## Generated Asset Construction

Generated fighters and stages are part of the approved scope, but they must use a stricter pipeline than the early experiments:

```txt
concept brief
  -> image generation prompt/source records
  -> full-row or full-sheet regeneration when pose/motion/scale is wrong
  -> sprite-atlas-builder normalization
  -> contact sheets, GIFs, baseline/scale/motion QA
  -> collision/action authoring
  -> runtime manifest + MUGEN-lite templates
  -> browser playtest + trace evidence
```

Rules:

- Bad walk cycles require regenerated source art, not cosmetic slicing.
- Crouch, jump, hitstun, punch, and kick must keep scale/baseline consistent with idle.
- Studio badges must distinguish QA pass, QA warning, QA fail, missing report, and not checked.
- Generated runtime assets do not count as imported MUGEN compatibility evidence.
- Image generation is provenance, not magic: store prompt/source, tool/version when available, generated source sheet, atlas manifest, contact sheet/GIF, motion/scale QA, collision/action edits, and trace evidence. If source motion or scale is bad, regenerate source art.

## Runtime And Compatibility Construction

The runtime path remains the hard spine:

1. Stabilize deterministic trace artifacts and checksums.
2. Move controller side effects into typed operations.
3. Turn `MatchWorld` from facade/read model into actor ownership boundary.
4. Expand KFM gates from command routing into combat, guard, target memory, get-hit/fall, and deeper state-exit proof.
5. Keep reports honest about support level.

Every new compatibility claim must identify its level:

```txt
Parsed
Decoded
Recognized
Compiled
Routable
Executed Partial
Executed Parity
Unsupported
Unknown
```

## Do Not Build Yet

These remain intentionally blocked until prerequisite gates pass:

- ZSS execution.
- Lua execution.
- Rollback or netplay.
- Full screenpack/motif parity.
- Full custom states, throws, helper VM, and advanced target redirects.
- Full BGCtrl/model-stage parity.
- Production platformer, beat-em-up, or arena tooling.
- Advanced Studio editing before project/assets/evidence/build truth is stable.
- Large folder reshuffles that do not reduce runtime or Studio risk.

## Immediate Construction Queue

Use this as the next implementation order:

1. Done first refreshed runtime cut: `Projectile` now has typed `projectile` operation evidence and a required trace gate.
2. Done second refreshed runtime cut: `Helper` now has typed `helper` operation evidence and a required trace gate.
3. Done third refreshed runtime cut: `Explod` now has typed `explod` operation evidence and a required trace gate; `RemoveExplod` also compiles into typed operation data.
4. Done fourth refreshed runtime cut: `HitFallVel`, `HitFallDamage`, `HitFallSet`, and `FallEnvShake` now have typed operation evidence in the required common get-hit trace.
5. Done fifth refreshed runtime cut: `HitDef` without `p2stateno` can route imported defenders into known defender-owned Common1-style state `5000`, with required synthetic and optional official KFM trace artifacts.
6. Choose the next runtime spine cut from `docs/ROADMAP_EXECUTION_BOARD.md`.
7. R1: after the recovery-threshold, bounded synthetic air-recovery velocity, and bounded synthetic ground-selection/velocity gates, add exact tick-order, optional KFM threshold oracle, broader recovery parity, or guard/Common1 evidence beyond the current positive route plus early reject pair.
8. R2: deepen one `MatchWorld` ownership boundary without claiming new behavior.
9. S1: expand Studio Evidence/Build trust chain from real evidence/status data, with visual QA.
10. Add selectable actor detail, filters, and trace/controller links in Runtime Debug Studio.
11. Build Character Studio Preview from existing AIR/CMD/CNS/SFF data and absorb the transitional Inspector flow only after visual QA.
12. Build Stage Studio Preview from existing stage reports.
13. Expand source-package relink with persistent browser handles/IndexedDB source metadata where the browser allows it.
14. A1: add generated-fighter authoring records, prompt/source provenance, atlas QA ingestion, and collision/action placeholders.
15. I1: add IKEMEN scanner/profile expansion before any IKEMEN execution work.
16. M1: define shared module contracts after the fighting runtime gates above hold.
17. Start the tiny platformer slice only after those shared contracts are clean.

## Round Closeout

Each focused implementation round closes with the minimum relevant evidence:

- Logic changed: focused unit tests plus `pnpm test`.
- Type or API contracts changed: `pnpm typecheck`.
- Build/runtime packaging changed: `pnpm build`.
- Runtime trace, combat, actor ownership, tick order, or controller behavior changed: `pnpm qa:trace`.
- UI, renderer, runtime visuals, stage, or generated asset rendering changed: browser visual QA, preferably `pnpm qa:smoke`.
- Docs updated whenever support level, limitations, or workflow changed.
