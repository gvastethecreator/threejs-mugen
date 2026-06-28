# 06 - Roadmap Control And QA Ledger

Status: in-progress
Labels: docs, roadmap, ready-for-agent

## Objective

Keep the roadmap, scorecard, issue tracker, and QA closeout rules synchronized so future work does not drift into partial claims or stale task lists.

## Next Useful Cuts

- Current cut: `AGENTS.md` and `docs/agents/*` now document setup-project defaults; `docs/adr/0001-roadmap-control-and-local-issues.md` records the local markdown tracker/source-of-truth decision; `docs/ROADMAP_RELEASE_TARGETS.md` defines release trains, usable milestone gates, and score-movement rules.
- Current cut: `AGENTS.md` and `docs/ROADMAP_PROGRESS_SYSTEM.md` now share a resume/checkpoint protocol so a new agent can recover repo truth, select the correct issue, run the right gates, and avoid score inflation.
- Current audit: `setup-project` was rechecked against repo state on 2026-06-28: GitHub remote exists, `AGENTS.md` is the active agent file, `docs/agents/*` exists, `CONTEXT.md` plus `docs/adr/` make this a single-context repo, and `.scratch/roadmap/` remains the working issue tracker.
- Keep `docs/ROADMAP_EXECUTION_BOARD.md` as the current queue/handoff board.
- Keep `docs/PROGRESS_TRACKER.md` compact and current after meaningful milestones.
- Keep `docs/PORT_COMPLETION_SCORECARD.md` as the only 0-100 answer source.
- Keep `docs/BUILD_EXECUTION_BACKLOG.md` append-only enough to preserve the real history.
- Add or split `.scratch/roadmap/issues/` only when a workstream needs its own acceptance and blocked claims.

## Acceptance

- Any score change updates `docs/PORT_COMPLETION_SCORECARD.md`, `docs/PROGRESS_TRACKER.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.
- Any runtime/compatibility support change updates the relevant support docs and issue.
- Any visible UI/render/stage/sprite change records `pnpm qa:smoke` and visual inspection.
- Docs-only changes explicitly state that scores did not move.
- Durable source-of-truth changes add or update an ADR.

## Blocked Claims

- Roadmap docs do not prove runtime compatibility.
- Score increases without tests, traces, visual QA, fixture evidence, or package/build evidence are invalid.
- Closed issues without evidence paths/checksums are invalid.
- Docs-only setup/project-control work does not prove runtime behavior.

## Evidence

- `AGENTS.md` owns repo rules, setup-project profile, session bootstrap, roadmap update protocol, and verification baseline.
- `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, and `docs/agents/domain.md` define the local markdown tracker, canonical triage vocabulary, and single-context domain-doc layout.
- `docs/ROADMAP_PROGRESS_SYSTEM.md` owns source-of-truth order, resume/checkpoint protocol, package lifecycle, horizon ladder, update matrix, and closeout template.
- `docs/adr/0001-roadmap-control-and-local-issues.md` records the local tracker/source-of-truth decision.
- `AGENTS.md` now records the latest setup-project audit date.

## Claim Allowed

Project-control setup is explicit enough for future agents to resume, pick the next roadmap issue, and close work with the correct gates.

## Claim Blocked

This docs/setup issue does not prove runtime, parser, renderer, Studio, generated asset, IKEMEN, or modular-engine compatibility.
