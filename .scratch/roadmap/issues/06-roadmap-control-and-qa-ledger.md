# 06 - Roadmap Control And QA Ledger

Status: ready-for-agent
Labels: docs, roadmap, ready-for-agent

## Objective

Keep the roadmap, scorecard, issue tracker, and QA closeout rules synchronized so future work does not drift into partial claims or stale task lists.

## Next Useful Cuts

- Current cut: `AGENTS.md` and `docs/agents/*` now document setup-project defaults; `docs/adr/0001-roadmap-control-and-local-issues.md` records the local markdown tracker/source-of-truth decision; `docs/ROADMAP_RELEASE_TARGETS.md` defines release trains, usable milestone gates, and score-movement rules.
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
