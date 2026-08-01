# Roadmap Operational Checklist

Last updated: 2026-07-30

## Current post-T438 continuation (2026-07-30)

1. Recheck Git and preserve the existing dirty DA32/roadmap work.
2. Read the official comparison and the one selected issue; do not execute
   multiple runtime tasks at once.
3. T424 remains closed-bounded with its historical 305/3234 gate; T425 is
   closed-bounded with 305/3240 current tests and 668/668 trace artifacts.
   Do not regress T424 special-state scheduling, legacy `unknown`, or T425's
   05b-only P2 contract.
4. Preserve T426's direct-entry manifest boundary; do not promote scanner-only
   findings, random/select parameters, or screenpack behavior to execution.
5. Preserve T425 candidate eligibility, `EnemyNear`, Partner, and
   M.U.G.E.N profiles outside the T429 cut.
6. T427-T438 are closed: their loader/shared-IR/live-pause and bounded raw-CNS
   persistence paths are evidence, but do not authorize generic ZSS or CNS
   persistence. T434 proves only sparse trigger-count behavior in ordinary
   active-root scans; T435 covers `StateDef -2`; T436 covers `StateDef -3` only
   without `stateOwner`; T437 covers imported CMD State -1 setup only. No interval range, pause/owner expansion, ZSS grammar,
   helper/player-owned custom-state expansion, or generic VM claim follows. The
   DA30 model is not a product consumer.
7. Keep scores, watermarks, and delivery authority held until independent
   evidence adjudication.

Task authority:
[official comparison](research/2026-07-30-official-mugen-ikemen-roadmap-comparison.md)
and issues 09-22.

Content lane: [ROADMAP_CONTENT_PACK.md](ROADMAP_CONTENT_PACK.md) owns T439-T460
and issues 24-45. Use `spritesheet-expert` + `imagegen`; use `grok-imagine`
only after dry-run and explicit run approval. Keep content QA separate from
official parity and score adjudication.

## Current post-DA32-026 start (2026-07-28)

1. Re-run Git status and capture exact HEAD.
2. Keep formal/global, focal runtime, visual/product, source, recorded and
   adjudicated cursors separate.
3. Do not promote the current HEAD until a subject-bound full gate passes.
4. Fill the missing DA32 task contracts.
5. Execute Studio recovery windows before multi-file claims.
6. Review the 05b/4aa source family before more IKEMEN runtime cuts.
7. Use a second legal imported route before any score review.
8. Require review independent from the implementer for watermarks and scores.

Detailed order and evidence live in the
[post-DA32-026 audit](research/2026-07-28-daily-roadmap-architecture-audit-post-da32-026.md).

## Historical post-DA30-120 start

Treat DA30-120 as a machine record and DA30-020 as the proposed consecutive
human ceiling. Before product or runtime work, execute DA31-002…008: freeze
original contracts, split watermarks, compute verdicts, separate tests from
evidence promotion, bind exact subjects, review all 120 rows, and gate one
clean SHA. Do not use file presence or fixed success data as acceptance.

Then select the next task only from
`docs/DA31_EVIDENCE_ADOPTION_ROADMAP.md`. Keep every claim at its named route,
profile, source pin, environment, failure set, and revision.

## Historical post-DA30-025 start

Before new implementation, adjudicate DA30-021/024/025 against their written
clauses. A green command exit, route load, key dispatch, text match, or
screenshot can support a narrow observation. Task closure requires its named
semantic deltas, failure cases, revision rule, environment, and claim ceiling.

Run the full formal command manifest at one SHA, store raw logs and exact facts,
then repair Play and Studio/Inspect journeys. DA30-026 follows. See
`docs/research/2026-07-27-daily-roadmap-architecture-audit-post-da30-025.md`.

This checklist turns the roadmap into repeatable execution steps. It is not a new source of truth. Use it with `AGENTS.md`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_PROGRESS_SYSTEM.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.

## Current post-DA28 start

The expanded audit is complete and the generated queue remains empty. Execute
DA29-001 before taking an implementation task from
`docs/MASTER_REVIEW_ROADMAP.md`. The DA28-02 formal/global pin cannot prove
current HEAD. A model or materializer alone cannot prove product adoption.

## Universal Start

Before changing code or docs:

1. Run `git status --short --branch`.
2. Read `AGENTS.md`, `CONTEXT.md`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.
3. Open the relevant local issue under `.scratch/roadmap/issues/`.
4. Identify the work type: runtime compatibility, visual runtime, Studio/product workflow, generated assets, IKEMEN scanner/reference, IKEMEN bounded runtime, modular engine boundary, or docs/project control.
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

## IKEMEN Bounded Runtime

Use only for explicit `ikemen-go` runtime behavior such as RunOrder, Pause/SuperPause, team topology, root participation, activation, redirects, scheduling, or later team gameplay.

Required closeout:

- Pin every semantic claim to an official Ikemen-GO source revision or official stable documentation.
- Name the compatibility profile and the exact consumers changed; structural ownership is not scheduler/input/combat/render support.
- Close runtime behavior with focused tests and `pnpm qa:trace`; add `pnpm qa:smoke` plus visual inspection only when renderer, camera, HUD, lifebar, Studio, or other visible consumers change.
- Keep identity lookup, team/member topology, active-root projection, Enemy/P2 eligibility, scheduling, input, effects, combat, round, presentation, lifebar, and resource ownership as separable claims.
- Record allowed and blocked scope in `.scratch/roadmap/issues/07-ikemen-runtime-topology.md`.

Update when relevant:

- `docs/COMPATIBILITY_PROFILES.md`
- `docs/SUPPORTED_FEATURES.md`
- `docs/WORKPLAN.md`
- `docs/BUILD_EXECUTION_BACKLOG.md`
- `docs/PROGRESS_TRACKER.md`
- `.scratch/roadmap/issues/07-ikemen-runtime-topology.md`

Scanner findings stay under I1/issue 04. They never close an I2 runtime gate.

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

Setup-project refresh sequence:

1. Verify repo root, remote, `AGENTS.md`, optional `CLAUDE.md`, `CONTEXT.md`, `docs/adr/`, `docs/agents/`, and `.scratch/roadmap/`.
2. Keep existing repo file choice: edit `AGENTS.md` here because no `CLAUDE.md` exists and the parent `AGENTS.md` is only a router.
3. Keep default decisions unless the user asks to switch: local markdown issue tracker, canonical triage labels, single-context domain docs.
4. Update `docs/agents/*` only when the tracker, labels, domain layout, or skill routing changed.
5. Update roadmap docs only where the queue, closeout gate, setup profile, or next-slice routing changed.
6. Append evidence to `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md` and `docs/BUILD_EXECUTION_BACKLOG.md`.
7. Close with normal docs-only gates and explicit no-score movement.
8. If the latest overall backlog entry is not runtime work, preserve the latest runtime/port checkpoint separately from Studio/UI or docs-only checkpoint wording.

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
