# Construction Waves

This document turns the approved horizon into a buildable sequence of waves. It is the practical bridge between the broad release train in `MASTER_CONSTRUCTION_PLAN.md` and the current task ledger in `WORKPLAN.md`. For the cross-cutting orchestration blueprint that connects every accepted idea to code anchors, dependencies, evidence, and anti-claims, use `HORIZON_IMPLEMENTATION_BLUEPRINT.md`.

`WORKPLAN.md` owns the current execution authority. When this wave map and an older backlog disagree, use `WORKPLAN.md -> Current Execution Authority` to choose the next build.

The goal is to build every agreed direction:

- Progressive MUGEN / IKEMEN-GO compatibility in a TypeScript runtime.
- A playable Three.js fighting sandbox that never stops working while the port grows.
- A Creator Studio for projects, assets, evidence, preview, debug, build, and export.
- A generated-asset pipeline using image generation plus sprite-atlas QA.
- A modular browser game engine that can later host platformers, beat-em-ups, arena games, and custom sprite projects.

The project must not call any slice done until it has runtime behavior, linked evidence, validation output, and visual QA when the change is visible.

## Product Brief

Build a local private workbench where the user can import legacy MUGEN/IKEMEN content, inspect exactly what parsed and executed, play a match, create original generated fighters/stages, package projects, and later reuse the same shell for other game modules.

Interface register: dense product workbench, not marketing. The center of the screen should remain a live playtest or preview. Side panels should be tables, filters, timelines, warnings, and contextual inspectors. No green state exists without linked evidence.

## Current Truth Lock

- The current engine is partial MUGEN compatibility with fixture gates, not full MUGEN parity.
- IKEMEN-GO is a reference engine and profile target, not an execution claim yet.
- Generated fighters are native/authored assets, not imported-MUGEN compatibility proof.
- The Studio is an evidence workbench first. Editing comes after save -> compile -> playtest -> export can prove or warn.
- Modular engine work is an extraction horizon. A platformer slice starts only after the fighting runtime proves clean shared contracts.

Recent Ikemen reference check, 2026-06-25:

- Ikemen GO publicly describes itself as an open-source fighting engine that supports MUGEN resources and targets compatibility around MUGEN 1.1 Beta.
- Its current public feature language includes Lua, ZSS, rollback/delay netplay, and actively developed source.
- The wiki explicitly scopes itself to IKEMEN-introduced features and points legacy MUGEN behavior back to Elecbyte docs.

Implication for this project: implement an IKEMEN scanner/profile first. Do not execute ZSS, Lua, netplay, or IKEMEN-only runtime behavior until the MUGEN fighting spine is evidence-backed.

## Fixture Gate Policy

Fixture evidence is split into three levels so compatibility claims do not drift:

| Gate Kind | Meaning | Claim It Can Support |
| --- | --- | --- |
| Required synthetic | A small controlled character/stage constructed to prove one engine behavior. | Runtime plumbing, regression coverage, and bounded behavior support. |
| Required native | Built-in generated/authored content that must always run. | Playable baseline, renderer/HUD/input/stage stability, and native authoring pipeline health. |
| Optional official/external | Local `.scratch/` fixture such as official KFM, KFM720, CodeFuMan, or third-party parser stress content. | Fixture-specific imported compatibility, only when the artifact actually ran. |

Rules:

- Missing optional fixtures are `skipped`, not `passed`.
- Synthetic traces never prove fixture parity by themselves.
- A fixture claim must name the exact artifact, executed states/controllers, support level, and remaining gaps.
- Third-party assets stay local/private and out of the repository.

## Review Consensus Matrix

The current construction plan is approved, but only under these gates:

| Lens | Build now | May run in parallel | Blocked until |
| --- | --- | --- | --- |
| Runtime architecture | Deepen `RuntimeTrace`, typed `ControllerOp`, and `MatchWorld` ownership. | Stage/audio IR and Studio evidence surfaces that read runtime truth. | New broad CNS semantics that bypass typed systems or traces. |
| Fixture compatibility | Real KFM/Common1 gates for get-hit, fall, recovery, guard-state, and state exits. | Synthetic trace plumbing and optional fixture packaging. | Claims like "KFM works" without official fixture evidence. |
| Product/UX | Workbench, Assets, Evidence, Build, Character/Stage Preview, Runtime Debug. | Three visual Studio directions before a major redesign. | Advanced editing before save -> compile -> playtest -> export is honest. |
| Generated authoring | Prompt/source provenance, atlas QA, motion/scale proof, collisions, trace. | Regenerating source sprite rows and contact-sheet review. | Treating generated fighters as imported MUGEN compatibility. |
| IKEMEN | Scanner/profile/reporting and source notes. | Research against Ikemen GO docs/source. | ZSS, Lua, rollback, netplay, or IKEMEN runtime execution. |
| Modular engine | Shared contracts extracted from proven fighting seams. | Module Studio as read-only status. | Platformer/beat-em-up implementation before import-boundary proof. |

The planning test for every proposed task is: can it name the artifact, fixture, screenshot, report, or trace that will prove it? If not, it stays a future idea.

## Execution Lock: Next Five Cuts

This is the immediate construction plan approved by the current review. It overrides older broad "next step" language when choosing the next implementation round.

| Order | Cut | Build | Acceptance |
| --- | --- | --- | --- |
| 1 | `MatchWorld` lifecycle ownership | Move the next helper/projectile/explod/target/effect lifecycle slice behind world/system boundaries. | No checksum drift unless documented; Debug Studio and trace artifacts show owner/root/parent facts. |
| 2 | KFM/Common1 recovery chain | Extend current get-hit/fall evidence beyond the bounded synthetic bounce/lie-down/get-up chain and optional official KFM `5110` lie-down entry into official get-up/recovery completion plus exact tick-order parity. | Required synthetic plus optional official KFM artifacts name executed states/controllers and unsupported gaps. |
| 3 | Guard-rule parity | Extend the current held-back/down-back guard plus bounded stand/crouch guard-hit `150 -> 151` / `152 -> 153` routes into documented guard start/end, proximity, air, and effect behavior where supported. | Trace proves guard reason, damage/stun/push, state/anim route, and unsupported guard features. |
| 4 | Evidence persistence | Store and compare trace/report records across Studio sessions, then add relink/regenerate actions. | Evidence Browser shows checksums, same/different/missing-current comparisons, stale/missing-source state, affected asset links, and next action. |
| 5 | Character/Stage Studio previews | Absorb Inspector and stage reports into project-aware Studio previews before editing tools. | Preview surfaces bind to live parsed/runtime/evidence data and pass browser visual QA. |

## Wave Map

| Wave | Name | Primary result | Starts after | Done when |
| --- | --- | --- | --- | --- |
| W0 | Baseline Lock | Current Runtime, Inspector, Studio, generated roster, stage, QA commands stay stable. | Current app. | `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm qa:smoke`, `pnpm qa:trace` pass when relevant. |
| W1 | Evidence Kernel | Deterministic trace artifacts explain input, states, controllers, actors, combat reasons, and checksums. | W0. | Failed gates name exact missing evidence; Studio can ingest recent artifacts. |
| W2 | Typed Compatibility Path | More CNS side effects enter through typed `ControllerOp` / compiler IR instead of raw params. | W1. | Reports show parsed, recognized, compiled, routed, executed partial, parity, unsupported, and unknown separately. |
| W3 | MatchWorld Ownership | Actors, helpers, projectiles, explods, targets, pause, audio, and effects become inspectable world facts. | W1-W2. | Runtime Debug Studio shows ownership tree; unchanged traces keep checksums. |
| W4 | KFM Official Fixture Route Gate | Official KFM/Common1 paths execute enough real data to prove partial fixture routes. | W2-W3 plus local fixture. | KFM fixture routes can idle, walk, crouch, jump, normal, special, hit/guard, exit/recover with exported evidence and named gaps. |
| W5 | Stage/Audio/Presentation IR | Stage, camera, floor, layer, sound, and FightFX behavior become renderer-independent facts. | W3. | Imported stage/audio reports separate rendered/decoded, fallback, partial, unsupported, and missing. |
| W6 | Creator Studio MVP | Project, assets, evidence, build, character/stage previews, runtime debug, and modules form one local workspace. | W1-W5 data contracts. | User can create/save/reopen/compile/playtest/export with provenance and warnings. |
| W7 | Generated Authoring | Original fighters/stages are prompt-tracked, atlas-normalized, QA-gated, collision-authored, and playable. | W6 asset/evidence/build surfaces. | One generated fighter has source prompt, atlas QA, scale/motion proof, collisions, trace, and screenshot. |
| W8 | IKEMEN Profile Scanner | IKEMEN-only content is classified separately from MUGEN 1.0/1.1. | W2 reports and W4 fixture discipline. | ZSS/Lua/config/stage/system features are counted and reported without execution claims. |
| W9 | Shared Module Contracts | Core project/input/assets/snapshot/render/audio/debug/build/QA contracts are extracted from proven runtime seams. | W6 and stable fighting contracts. | Shared core imports no CNS, HitDef, round, helper, target, or MUGEN command-routing concepts. |
| W10 | Platformer Slice | A tiny non-fighting module proves the engine can host another genre. | W9. | Platformer scene runs from project/build data through the same Three.js/audio/debug/QA adapters. |

## Construction Packages

### Package A: Runtime Spine

Build order:

1. Keep trace gates stable for current native and synthetic imported cases.
2. Keep typed operation coverage for `HitFall*`/`FallEnvShake`, `Projectile`, `Helper`, and `Explod` locked behind required trace gates.
3. Move helper/projectile/explod lifecycle behind runtime/world systems without checksum drift, or add real KFM/Common1 get-hit/fall gates.
4. Expand structured combat reasons: hit, guard, whiff, rejected, override, reversal, projectile interaction.
5. Keep target memory and ownership world-visible through `targetLinks`, then deepen exact target semantics.

Acceptance:

- Trace artifact includes operation payloads, owner/root/parent metadata, target-link evidence, combat reason, and final actor/effect snapshot.
- Raw `controller.source` paths shrink or are listed as transition debt with tests and docs.
- Every tick-order change has a deterministic trace gate.

Do not start:

- Full helper VM.
- Throws/custom states at broad parity.
- Rollback/netplay.

### Package B: Fixture Compatibility

Build order:

1. Make official KFM fixture presence explicit: missing fixture means skipped compatibility gate, not passed compatibility.
2. Route KFM normal and one special through real CMD/CNS data.
3. Add real Common1 get-hit/fall/bounce/liedown/recovery evidence. Current cuts prove official KFM defender-owned state `5000` entry, stand progression `5000 -> 5001 -> 0`, fall/ground-impact/bounce/lie-down entry `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110`, official lie-down/get-up completion `5110 -> 5120 -> 0`, official air recovery-input completion `5050 -> 5210 -> 52 -> 0`, official ground recovery-input completion `5050 -> 5200 -> 5201 -> 52 -> 0`, partial stand/crouch guard-hit `150 -> 151` and `152 -> 153`, a required synthetic bounded recovery chain `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0`, a required synthetic recovery-input branch `5050 -> 5210 -> 0`, a required synthetic recovery-threshold actor-frame handoff, a required synthetic air-recovery velocity route, and a required synthetic ground-recovery selection/velocity route; next cuts must prove exact threshold/velocity math, broader recovery parity, exact guard rules, and exact tick-order parity.
4. Improve guard rules beyond held-back guard plus bounded guard-hit routing.
5. Add KFM720 scale/localcoord and CodeFuMan SFF v1/PCX stress gates.
6. Keep SF3 Ryu-style content as parser/report stress until runtime support is targeted.

Acceptance:

- Official fixture gates are required to claim KFM partial playability.
- Synthetic traces remain plumbing tests only; docs and UI must not label them parity.
- Reports show unsupported and unknown features near the affected state/controller/asset.

Do not start:

- Broad character compatibility claims.
- IKEMEN execution.

### Package C: Stage, Camera, Audio, And Presentation

Build order:

1. Build a stage BG IR for currently parsed/rendered layers.
2. Add camera/floor/bounds/zoffset/localcoord/player-start visual and unit evidence.
3. Add delta/parallax/tiling/velocity/window/mask/layer diagnostics.
4. Add first BGCtrl classification.
5. Add SND channel diagnostics and Web Audio source/stop behavior records.
6. Add FightFX/common effect lookup plan before deeper effects.

Acceptance:

- Every imported stage layer is `rendered`, `animated`, `fallback`, `unsupported`, or `missing`.
- Visual screenshots show stage projection, floor, starts, and unsupported fallback labels where relevant.
- Audio events cannot disappear silently.

Do not start:

- Full BGCtrl/model-stage parity.
- Screenpack/motif parity.

### Package D: Creator Studio MVP

Build order:

1. Evidence Browser persistence, artifact filters, first current-vs-persisted trace comparison, basic frame scrubber, and stale/missing-source warnings.
2. Asset Library replacement/relink flows and dependency invalidation.
3. Build Center source-package truth: linked vs missing, blocked vs exportable, package contents and checksums.
4. Runtime Debug Studio actor detail, filters, and trace/controller links.
5. Character Studio Preview: DEF/AIR/SFF/CMD/CNS summary, action timeline, frame, sprite, axis, Clsn1/Clsn2, related evidence.
6. Stage Studio Preview: floor, bounds, starts, zoffset, camera, layers, report links.
7. Project Dashboard only after the save/reopen/compile/playtest/export loop is coherent.

Acceptance:

- A user can create, save, reopen, compile, playtest, and export a local project.
- Every `ok`, `partial`, `blocked`, and `unsupported` state links to evidence or an affected asset.
- The central playtest/preview stays visible in workbench flows.
- UI passes browser visual QA after visible changes.

Do not start:

- Advanced editing that cannot save/compile/playtest/export.
- Large UI redesign without selected visual direction and live-data binding.

### Package E: Generated Asset Authoring

Build order:

1. Add concept brief records for generated fighters/stages.
2. Store image generation prompts, source images, tool versions, and provenance.
3. Regenerate bad sprite rows or sheets when motion, pose, baseline, or scale is wrong.
4. Run sprite-atlas normalization and record manifest/checksums.
5. Add contact sheet, GIF, scale, baseline, and motion QA ingestion.
6. Add collision/action authoring placeholders in Character Studio.
7. Export runtime atlas manifests and MUGEN-lite DEF/AIR/CMD/CNS templates.

Acceptance:

- One generated fighter can be regenerated, normalized, visually reviewed, collision-authored, and played.
- Walk reads as walking with alternating legs.
- Crouch and jump stay scale-consistent with idle.
- Bad art cannot receive a green badge by cropping.

Do not start:

- Treat generated assets as imported MUGEN proof.
- Hide missing prompt/provenance or QA reports.

### Package F: IKEMEN Profile

Build order:

1. Add `ikemen-go-scan` profile labels in compatibility reporting.
2. Scan for ZSS, Lua, IKEMEN config, extended state controllers, new triggers, stage features, screenpack/system features, and module hooks.
3. Classify as recognized unsupported, unknown, or future research item.
4. Link research notes to exact source/wiki pages before implementation.

Acceptance:

- IKEMEN-only content is visible and counted.
- MUGEN 1.0, MUGEN 1.1, and IKEMEN-compatible claims stay separate.

Do not start:

- ZSS execution.
- Lua execution.
- IKEMEN netplay/rollback.

### Package G: Modular Engine

Build order:

1. Extract shared contracts from proven fighting runtime seams: project, asset, input, tick, snapshot, render, audio, debug, build, and QA.
2. Add module descriptors and settings schemas.
3. Add a read-only Module Studio status that does not imply shipped support.
4. Add a tiny platformer project template.
5. Add level/tile model, simple platform collision, camera follow, collectible, hazard, and one enemy.
6. Prove the platformer runs from project/build data without importing fighting types.

Acceptance:

- Shared core has no CNS, HitDef, round, helper, target, or MUGEN command routing imports.
- Platformer smoke passes while fighting smoke/trace still pass.

Do not start:

- Production platformer tooling.
- Beat-em-up/arena runtime before one platformer slice proves the contract.

## Studio Visual Direction Checkpoint

Before a major Studio UI rebuild, generate three focused visual directions and choose one. These are planning targets, not implementation permission.

### Concept 1: Command Center / Evidence-First

- Central playtest/preview.
- Left rail for Project, Assets, Character, Stage, Runtime Debug, Evidence, Build, Modules.
- Right contextual inspector for selected asset/frame/layer/actor/warning and the next blocking item.
- Bottom trace/timeline/log strip.
- Best for: the base Studio shell across Build, Evidence, and Runtime Debug.

### Concept 2: Asset Repair Workbench

- Dense Asset Library table.
- Selected asset preview, dependency graph, source/runtime map, QA badges, and missing/relink status.
- Warnings, blocked actions, provenance, and repair actions are always close to the affected asset.
- Best for: import triage, source relink, replacement, regeneration, and build invalidation.

### Concept 3: Character Authoring Timeline

- Character preview with Clsn overlays.
- AIR/action timeline at the bottom.
- Sprite/frame/axis inspector.
- CMD/CNS graph, unsupported features, prompt/provenance, atlas QA, and collision/action authoring side panels.
- Best for: generated fighter authoring and imported character diagnosis.

Implementation rule: whichever direction is selected must bind to live project/runtime/evidence data and close with browser visual QA.

Recommended blend: use Concept 1 as the global shell, Concept 2 for Assets/Build/Evidence flows, and Concept 3 as the specialized Character Studio surface. Module Studio stays read-only and visually restrained until a non-fighting slice actually runs.

## Creator Studio IA Contract

The destination Studio IA is not a row of equivalent tabs. It is a workbench flow:

```txt
Project / Workbench -> Assets -> Evidence -> Build
                   \-> Character / Stage / Debug as contextual tools
                   \-> Modules as readiness/status until another module exists
```

Each surface owns one question and one primary action:

| Surface | Question | Primary Action |
| --- | --- | --- |
| Project / Workbench | What am I testing, and what needs attention first? | Playtest or open the highest-priority blocker. |
| Assets | What content exists, where did it come from, and what is broken? | Relink, replace, or inspect the selected asset. |
| Character | Why does this fighter/action/state/command behave this way? | Preview the selected action/state and open related evidence. |
| Stage | What are this stage's floor, bounds, camera, layers, and unsupported features? | Preview the selected layer or affected stage property. |
| Evidence | What has actually been proven? | Open, compare, or filter trace/report artifacts. |
| Debug | What did the runtime do this frame, and why? | Select an actor/event and jump to controller/trace evidence. |
| Build | What can be exported, and what blocks it? | Export package or resolve the top blocker. |
| Modules | Which capabilities are active, planned, missing, or blocked? | Readiness review only until a real non-fighting module runs. |

UX rules:

- One primary call to action per surface.
- `ok`, `partial`, `warn`, `blocked`, and `unsupported` states must be actionable or linked to evidence.
- Assets should separate dense list, selected detail, dependency/source map, and repair action instead of stacking everything as equal panels.
- Build should have one readiness authority; duplicated readiness summaries must either be removed or clearly scoped.
- Character and Stage start as preview/diagnostic surfaces. Editing waits until save -> compile -> playtest -> export can prove or block changes.

Required sketches before a major Studio rewrite:

1. Creator Studio shell on desktop and narrow viewport.
2. Asset Library repair workbench.
3. Character Studio and Stage Studio sibling previews.
4. Evidence Browser plus Build Center.

Those sketches are planning contracts only. Implementation must still bind to `studioAssets`, `studioEvidence`, `compiledProject`, `projectBundle`, and current runtime/renderer bridge data.

## Studio Flow Scripts

These are product acceptance flows. Each flow must have one primary action, visible partial/blocked state, and linked evidence.

1. Create/open project: template -> `project.json` -> select P1/P2/stage -> save -> reopen -> playtest -> compile.
2. Import legacy content: ZIP/folder -> parse report -> asset record -> Character/Stage Preview -> runtime route if supported -> evidence.
3. Inspect character: asset -> AIR timeline -> frame/sprite/axis/Clsn -> CMD/CNS graph -> unsupported features -> trace link.
4. Repair asset: attention queue -> affected asset -> source/runtime map -> relink, replace, or regenerate -> invalidate build -> recompile.
5. Generate character: brief -> imagegen provenance -> sprite-atlas-builder normalization -> motion/scale QA -> collision/action authoring -> playtest -> export.
6. Debug runtime: playtest -> pause/step -> select actor -> commands/controllers/state/targets/effects -> trace event -> evidence record.
7. Build/export: `project.json` -> `runtime-manifest/v0` -> trace artifact -> export bundle -> source-package status -> package validation.
8. Review modules: active fighting module plus planned modules; no editable non-fighting support until the platformer slice exists.

## Done Rules

| Task type | Minimum closeout |
| --- | --- |
| Parser/compiler | Focused tests, `pnpm test`, support docs if coverage changed. |
| Runtime/controller/combat/tick order | Focused tests, `pnpm qa:trace`, artifact inspection, docs. |
| Type/API/build/package | `pnpm typecheck`, `pnpm build`, schema/package docs. |
| UI/renderer/stage/sprite/debug | Browser visual QA, preferably `pnpm qa:smoke`, screenshots and diagnostics. |
| Studio data surface | QA bridge data, linked evidence, save/reopen behavior if persistent. |
| Generated assets | Prompt/provenance, atlas QA, contact sheet/GIF, visual QA, trace when playable. |
| IKEMEN scanner | Fixture/report tests, explicit unsupported/unknown labels, source references. |
| Modular engine | Import-boundary proof, fighting regression, platformer smoke when implemented. |

Negative fixture work closes like parser/compiler work, but its success condition is honest failure: missing `common1.cns`, malformed DEF paths, unknown controllers/triggers, unsupported SFF/SND data, and IKEMEN-only ZSS/Lua/config must land as `unsupported` or `unknown` with affected system, impact, and next action. A skipped official fixture blocks official compatibility claims.

## Anti-Claims

These statements are not allowed until their gates exist:

- "Full MUGEN compatible."
- "IKEMEN supported" when only the scanner exists.
- "KFM works" when only synthetic imported traces pass.
- "Generated fighter fixed" when source motion was cropped instead of regenerated.
- "Stage supported" when layers silently fallback or disappear.
- "Exportable" when source packages are missing or checksums are absent.
- "Modular engine done" before a non-fighting scene runs through shared contracts.

## Next Four Implementation Rounds

1. Runtime spine: move exact projectile parity, exact effect pause/tick decisions, or exact target semantics through `RuntimeEffectActorWorld`/`MatchWorld`, or add real KFM/Common1 fall/bounce/recovery gates; keep typed operation evidence and trace checksums stable.
2. Fixture gate: extend the real KFM Common1 `5000 -> 5001 -> 0`, `150 -> 151`, `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110`, `5110 -> 5120 -> 0`, `5050 -> 5210 -> 52 -> 0`, and `5050 -> 5200 -> 5201 -> 52 -> 0` evidence into exact threshold/velocity math, tick-order, and exact guard-rule evidence that is harder to skip or mislabel.
3. Studio evidence: first persisted trace history/comparison, metric/gate review, and frame checksum/event scrubber cut is done; next add replay-style trace diff review and link warnings to affected assets/controllers/fixtures.
4. Studio previews: build Character Studio and Stage Studio over existing parsed/runtime data, then visually verify before retiring the standalone Inspector route.

Generated authoring begins after round 3 or 4 has enough Asset/Evidence/Build truth to show prompt/source -> atlas -> QA -> collision -> runtime without hiding failures.
