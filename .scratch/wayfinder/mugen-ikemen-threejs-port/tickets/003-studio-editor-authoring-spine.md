# Define Studio editor authoring spine

Type: task
Status: open
Blocked by: None

## Question

What is the smallest Studio editing spine that turns the current evidence/workbench shell into a practical editor while preserving runtime proof and export contracts?

## Answer

Open. Candidate inputs: `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, Studio Build/Evidence readiness rows, project manifest/export bundle contracts, and current browser smoke coverage.

## Latest Progress (2026-07-09)

- Implemented a practical in-shell authoring spine improvement: Studio Workbench now includes direct `P1`, `CPU`, and `Stage` controls in the mission section so operators can switch matchup inputs without leaving Studio.
- This keeps the edit path tied to verified runtime/evidence outputs and remains blocked only by deeper editor ambitions (action/state/callback editors, saveable scene edits).
