# Roadmap Tracking PRD

Status: ready-for-agent
Labels: docs, roadmap, mugen-compat, studio

## Problem

The project has a large horizon: MUGEN/IKEMEN-GO compatibility, playable Three.js runtime, creator studio, generated asset pipeline, QA evidence, and future modular engine. Without a compact local tracker, agents can drift between vision docs, backlog entries, and runtime cuts.

## Goal

Keep progress trackable through local markdown issues that connect each workstream to:

- current evidence
- next implementation cut
- acceptance gate
- claim allowed / claim blocked wording
- docs that must stay synchronized

## Non-Goals

- Replace `docs/WORKPLAN.md` or `docs/BUILD_EXECUTION_BACKLOG.md`.
- Create public GitHub issues for private/local work.
- Add new product scope beyond the approved horizon.

## Tracker Layout

```txt
.scratch/roadmap/
  PRD.md
  issues/
    01-runtime-compatibility-gates.md
    02-studio-evidence-workflow.md
    03-generated-assets-pipeline.md
    04-ikemen-scan-and-reference.md
    05-modular-engine-boundaries.md
```

## Operating Rules

- `docs/PROGRESS_TRACKER.md` stays compact and current.
- `docs/PORT_COMPLETION_SCORECARD.md` owns 0-100 progress answers and score changes.
- `docs/WORKPLAN.md` stays the execution authority.
- `docs/BUILD_EXECUTION_BACKLOG.md` remains the detailed historical ledger.
- Issues under this directory are slicing aids, not a second source of truth.
- When an issue closes, update the linked docs and leave evidence paths/checksums.

## Done Definition

Roadmap tracking is useful when a new agent can read:

1. `CONTEXT.md`
2. `AGENTS.md`
3. `docs/PROGRESS_TRACKER.md`
4. this PRD
5. one relevant issue

and then identify the next safe implementation slice without asking for basic context.
