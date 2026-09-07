---
name: mugen-runtime-evidence
description: "MUGEN/Ikemen evidence freshness and compatibility claim review."
---

# MUGEN Runtime Evidence

Resolve the checkout through the workspace `AGENTS.md` router and run commands from the repository root. Before a progress claim or next slice, match the claim to the code, upstream pin, corpus, and gate that proved it. The upstream revision and local subject revision identify different repositories; record both.

Read `AGENTS.md` and `docs/COMPATIBILITY_PROFILES.md` for public claim boundaries. For queued work, follow `docs/agents/issue-tracker.md` to the local issue and checkpoint. A clean clone may have no local queue: use tracked code, tests, and `docs/evidence/` to identify the next gap, and record it through that tracker contract. Do not recreate removed public roadmaps or infer completion percentages from ticket counts.

## Process

1. Name the lane and the exact claim. `git status --short --branch`.
2. Each evidence row needs subject SHA, input identity, command, and `current | stale | unknown`. Green without SHA is unknown.
3. One source pin per claim. Mixed normative/candidate pins block the claim.
4. Newest backlog entry is not the latest runtime checkpoint. Keep lane cursors separate.
5. Run only the gate the lane owns (`pnpm qa:trace`, `pnpm qa:smoke`, Studio gate). Docs-only work does not move the score.

## Done

Allowed claim, blocked claim, evidence SHA, and next proof-producing slice.
