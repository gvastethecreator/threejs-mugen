# AGENTS.md

## Project Rules

- Use `caveman` mode for implementation-only work that does not need user questions.
- Reconstruct current truth from repo state, docs, traces, screenshots, and tests before editing.
- Keep the active objective intact: progressive MUGEN/Ikemen-GO port foundation on Three.js, playable sandbox, real-content loading by compatibility layers, honest docs, and visual QA.
- Do not claim full MUGEN/Ikemen-GO parity from partial gates. Every compatibility claim needs evidence plus explicit blocked scope.
- Do not add commercial or third-party character assets to the repo. Use local fixtures under `.scratch/fixtures/` or generated/native assets under `public/`.
- Do not hardcode one character, one stage, or one fixture path into runtime behavior.
- Preserve user work. Never revert unrelated changes.

## Repo Entry Points

- This git repo root is `mugen-web-sandbox`. If the shell starts in `D:\DEV\mugen-sandbox-prototypes`, enter `mugen-web-sandbox` before running git, pnpm, or repo-wide searches.
- Read `CONTEXT.md` first for domain vocabulary, then `docs/ROADMAP_PROGRESS_SYSTEM.md` for progress ownership, then `docs/ROADMAP_EXECUTION_BOARD.md` for the current queue.
- Use `.scratch/roadmap/` only as local issue slicing. Public/private compatibility truth belongs in `docs/`.

## Work Cadence

- Prefer small runtime/evidence cuts over broad rewrites.
- Start each non-trivial round by checking `git status --short --branch`, then reading the queue docs named below. Do not trust stale chat memory over repo truth.
- Before answering port progress or choosing next work, read `docs/PORT_COMPLETION_SCORECARD.md` and `docs/PROGRESS_TRACKER.md`.
- Before starting a new implementation slice, read `docs/ROADMAP_EXECUTION_BOARD.md` and the linked `.scratch/roadmap/issues/<NN>-*.md`.
- Runtime/CNS/CMD work must close with:
  - typed operation or named runtime-system boundary where possible
  - trace artifact or focused unit coverage
  - docs update with claim allowed / claim blocked language
- Frontend or visual changes require `pnpm qa:smoke` and visual inspection before closeout.
- Run tests/checks at the end of the round, not after every tiny edit.
- If docs, backlog, or trackers are part of the workflow, keep them honest against current code and gates.
- For architecture reviews, use subagents when available and reconcile their findings into one narrow plan.

## Session Bootstrap Checklist

Use this checklist when resuming the goal or starting a new autonomous pass:

1. Confirm repo root with `git status --short --branch`.
2. Read `CONTEXT.md`, then `docs/ROADMAP_PROGRESS_SYSTEM.md`, then `docs/ROADMAP_EXECUTION_BOARD.md`.
3. If the user asks "how far are we?", read `docs/PORT_COMPLETION_SCORECARD.md` and `docs/PROGRESS_TRACKER.md` before answering.
4. If picking implementation work, open the linked `.scratch/roadmap/issues/<NN>-*.md` issue and keep claim allowed / claim blocked wording aligned.
5. Before editing, identify whether the work is runtime trace, UI/visual, Studio/product, generated assets, IKEMEN scanner, modular contract, or docs-only; use the matching verification row in `docs/ROADMAP_PROGRESS_SYSTEM.md`.
6. Close with gates, docs/backlog update, and a checkpoint commit when the user has asked for persistent progress.

## Roadmap Update Protocol

When a change affects support level, priority, or claimed progress:

1. Update `docs/ROADMAP_EXECUTION_BOARD.md` first if the next queue or package status changes.
2. Update `docs/PROGRESS_TRACKER.md` for compact current truth.
3. Update `docs/PORT_COMPLETION_SCORECARD.md` only when score, band, or evidence ledger changes.
4. Update `docs/WORKPLAN.md` for execution authority and `docs/BUILD_EXECUTION_BACKLOG.md` for historical closeout.
5. Update the relevant `.scratch/roadmap/issues/` file with status, next cut, evidence, and blocked claims.

## Verification Baseline

Default closeout for code/runtime/docs rounds:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Runtime compatibility or trace changes also require:

```bash
pnpm qa:trace
```

Frontend, Studio, renderer, stage, sprite, or debug UI changes also require:

```bash
pnpm qa:smoke
```

## Roadmap Control

- `docs/PORT_COMPLETION_SCORECARD.md` is the 0-100 status source for playable sandbox, MUGEN MVP, full MUGEN, IKEMEN, Studio, and modular-engine horizons.
- `docs/ROADMAP_PROGRESS_SYSTEM.md` explains source-of-truth order, package lifecycle, horizon ladder, update matrix, and closeout template.
- `docs/ROADMAP_RELEASE_TARGETS.md` translates scores into release trains, gates, and "usable" milestones.
- `docs/PROGRESS_TRACKER.md` is the compact current truth board.
- `docs/WORKPLAN.md` is the execution authority.
- `docs/BUILD_EXECUTION_BACKLOG.md` is the detailed append-style history.
- `.scratch/roadmap/PRD.md` and `.scratch/roadmap/issues/` are local slicing aids.
- `docs/ROADMAP_EXECUTION_BOARD.md` is the current queue and handoff map.
- Update all affected roadmap files when a gate changes a score, claim, priority, or blocked scope.

## Setup Project Profile

- `setup-project` profile: local markdown issue tracker, canonical triage labels, single-context domain docs.
- Issue tracker: local markdown under `.scratch/<feature-slug>/`; GitHub remote exists, but local markdown remains the working tracker unless the user explicitly asks to publish GitHub issues.
- Triage vocabulary: canonical labels in `docs/agents/triage-labels.md`, plus repo evidence tags for runtime, Studio, generated assets, IKEMEN, docs, and visual QA.
- Domain layout: single-context repo with root `CONTEXT.md`; durable decisions live under `docs/adr/`.
- Broad web-app readiness or architecture sweeps should use this setup before `web-project-readiness`, `improve-codebase-architecture`, `diagnose`, `triage`, `tdd`, `to-issues`, or `to-prd`.

## Current Milestone Focus

- Primary: MUGEN-lite playable MVP, not full IKEMEN parity.
- Near-term runtime focus: R1 KFM/Common1 recovery/guard precision and R2 MatchWorld ownership deepening.
- Parallel product focus: Studio Evidence/Build trust chain, generated asset provenance/QA, IKEMEN scanner/reference expansion, and shared contract readiness.
- Score movement rule: docs-only/setup work can improve project control but must not raise port scores without runtime trace, focused test, browser visual QA, fixture evidence, or build/export proof.

## Agent skills

### Issue tracker

Issues and PRDs are tracked as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical local labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. Read root `CONTEXT.md` first, then `docs/ROADMAP_EXECUTION_BOARD.md`, relevant roadmap/architecture docs, and ADRs under `docs/adr/` if present. See `docs/agents/domain.md`.
