# Roadmap Operational Checklist

Last updated: 2026-06-28

This checklist turns the roadmap into repeatable execution steps. It is not a new source of truth. Use it with `AGENTS.md`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_PROGRESS_SYSTEM.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.

## Universal Start

Before changing code or docs:

1. Run `git status --short --branch`.
2. Read `AGENTS.md`, `CONTEXT.md`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.
3. Open the relevant local issue under `.scratch/roadmap/issues/`.
4. Identify the work type: runtime compatibility, visual runtime, Studio/product workflow, generated assets, IKEMEN scanner/reference, modular engine boundary, or docs/project control.
5. Name the expected evidence before editing.

Do not raise a score unless the evidence type is allowed by `docs/PORT_COMPLETION_SCORECARD.md`.

## Runtime Compatibility

Use for CNS, CMD, Common1, combat, controller, expression, or trace work.

Required closeout:

- Focused test or required `pnpm qa:trace` artifact.
- Compatibility docs updated when behavior changes.
- Claim allowed names the exact controller, trigger, fixture, trace artifact, checksum, or test.
- Claim blocked names the unsupported parity surface.

Update when relevant:

- `docs/SUPPORTED_FEATURES.md`
- `docs/CONTROLLER_SUPPORT_REGISTRY.md`
- `docs/QA_AND_ACCEPTANCE_GATES.md`
- `docs/WORKPLAN.md`
- `docs/BUILD_EXECUTION_BACKLOG.md`
- `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

Run at end:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm qa:trace
```

## Renderer Or Visual Runtime

Use for Three.js scene, sprites, hit sparks, collision overlays, camera, stage, HUD, and debug visuals.

Required closeout:

- `pnpm qa:smoke` plus visual inspection.
- Screenshot or diagnostics inspected manually.
- No visual claim without observed browser evidence.
- If runtime trace semantics changed, also run `pnpm qa:trace`.

## Studio Product Workflow

Use for Studio Mode, Evidence, Build, Assets, Inspector, project workflow, or interface polish.

Required closeout:

- UI binds to real project, runtime, or evidence data.
- One primary next action is visible for blocked or stale state.
- Visual QA confirms no decorative status or fake completion.
- Product copy does not overclaim compatibility.

Update when relevant:

- `docs/ENGINE_STUDIO_ROADMAP.md`
- `docs/INTERFACE_SYSTEM.md`
- `docs/PROGRESS_TRACKER.md`
- `.scratch/roadmap/issues/02-studio-evidence-workflow.md`

Run at end:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm qa:smoke
```

## Generated Assets

Use for `imagegen`, `sprite-atlas-builder`, native/generated fighters, generated stages, contact sheets, motion QA, and provenance.

Required closeout:

- Source prompt/path, generated image/sheet path, atlas manifest, collision/action data, and QA result are linked together.
- Bad walk, crouch, jump, or scale frames are source-regeneration failures, not cosmetic atlas-cropping tasks.
- Generated/native assets stay separate from imported MUGEN compatibility score.
- Visual QA when the asset is visible in runtime or Studio.

Update when relevant:

- `docs/GENERATED_ASSET_QA_CONTRACT.md`
- `docs/ENGINE_STUDIO_ROADMAP.md`
- `docs/PROGRESS_TRACKER.md`
- `.scratch/roadmap/issues/03-generated-assets-pipeline.md`

## IKEMEN Scanner

Use for Ikemen-GO source/docs research, scanner findings, compatibility profiles, and unsupported-runtime reporting.

Required closeout:

- Scanner/test proves new recognized, unsupported, or unknown finding.
- Runtime execution remains explicitly blocked unless separately implemented and gated.
- Do not count scanner support as IKEMEN runtime support.

Update when relevant:

- `docs/IKEMEN_GO_REFERENCE.md`
- `docs/COMPATIBILITY_PROFILES.md`
- `docs/MUGEN_COMPATIBILITY_PLAN.md`
- `.scratch/roadmap/issues/04-ikemen-scan-and-reference.md`

## Modular Engine Boundary

Use for shared project, asset, input, tick, snapshot, render, audio, debug, build, or QA contracts.

Required closeout:

- The shared contract proves no dependency on CNS, CMD, HitDef, Common1, rounds, helpers, targets, or MUGEN command routing.
- Platformer or non-fighting runtime work stays blocked until fighting contracts remain green.
- Boundary tests are preferred when code moves.

Update when relevant:

- `docs/MODULE_BOUNDARY_CONTRACT.md`
- `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`
- `docs/ENGINE_PORT_ARCHITECTURE.md`
- `.scratch/roadmap/issues/05-modular-engine-boundaries.md`

## Docs Or Project Control

Use for `setup-project`, `AGENTS.md`, roadmap, issue tracker, ADR, scorecard routing, and handoff rules.

Required closeout:

- State that scores did not move.
- Update `docs/adr/` if a durable source-of-truth rule changed.
- Keep `AGENTS.md`, `docs/agents/*`, roadmap docs, and `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md` aligned.

Run at end:

```bash
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

`pnpm qa:trace` and `pnpm qa:smoke` are not required for docs-only work unless docs changed generated gates, trace fixtures, or visible UI.

## Score Movement Gate

A score can move only when at least one is true:

- Required trace artifact or checksum proves new runtime behavior.
- Focused test proves parser, compiler, runtime, or boundary behavior.
- Browser smoke plus visual inspection proves a visible runtime or Studio workflow.
- Local fixture evidence proves a private imported package route.
- Build/export evidence proves new Studio or modular-engine capability.

If a score moves, update all three in the same round:

- `docs/PORT_COMPLETION_SCORECARD.md`
- `docs/PROGRESS_TRACKER.md`
- `docs/ROADMAP_EXECUTION_BOARD.md`

## Closeout Shape

Use this shape for meaningful rounds:

```txt
Changed:
Evidence:
Claim allowed:
Claim blocked:
Next:
```
