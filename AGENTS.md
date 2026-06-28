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
- `docs/PROGRESS_TRACKER.md` is the compact current truth board.
- `docs/WORKPLAN.md` is the execution authority.
- `docs/BUILD_EXECUTION_BACKLOG.md` is the detailed append-style history.
- `.scratch/roadmap/PRD.md` and `.scratch/roadmap/issues/` are local slicing aids.
- `docs/ROADMAP_EXECUTION_BOARD.md` is the current queue and handoff map.
- Update all affected roadmap files when a gate changes a score, claim, priority, or blocked scope.

## Setup Project Profile

- Issue tracker: local markdown under `.scratch/<feature-slug>/`.
- Triage vocabulary: canonical labels in `docs/agents/triage-labels.md`.
- Domain layout: single-context repo with root `CONTEXT.md`; durable decisions should use `docs/adr/` when needed.
- Broad web-app readiness or architecture sweeps should use this setup before `web-project-readiness`, `improve-codebase-architecture`, `diagnose`, `triage`, `tdd`, `to-issues`, or `to-prd`.

## Agent skills

### Issue tracker

Issues and PRDs are tracked as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical local labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. Read root `CONTEXT.md` first, then `docs/ROADMAP_EXECUTION_BOARD.md`, relevant roadmap/architecture docs, and ADRs under `docs/adr/` if present. See `docs/agents/domain.md`.
