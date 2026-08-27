---
name: mugen-runtime-evidence
description: "MUGEN/Ikemen evidence: pin, checkpoint, corpus, and claim must share one SHA."
---

# MUGEN Runtime Evidence

Work in `X:\threejs-mugen\mugen-web-sandbox`. The parent `X:\threejs-mugen` is a router only; do not run git or pnpm there. Before a progress claim or next slice, match the claim to the code, pin, corpus, and gate that proved it.

Read `AGENTS.md`, then `docs/ROADMAP_PROGRESS_SYSTEM.md` and `docs/ROADMAP_EXECUTION_BOARD.md`. For scores also `docs/PORT_COMPLETION_SCORECARD.md` and `docs/PROGRESS_TRACKER.md`.

## Process

1. Name the lane and the exact claim. `git status --short --branch`.
2. Each evidence row needs subject SHA, input identity, command, and `current | stale | unknown`. Green without SHA is unknown.
3. One source pin per claim. Mixed normative/candidate pins block the claim.
4. Newest backlog entry is not the latest runtime checkpoint. Keep lane cursors separate.
5. Run only the gate the lane owns (`pnpm qa:trace`, `pnpm qa:smoke`, Studio gate). Docs-only work does not move the score.

## Done

Allowed claim, blocked claim, evidence SHA, and next proof-producing slice.
