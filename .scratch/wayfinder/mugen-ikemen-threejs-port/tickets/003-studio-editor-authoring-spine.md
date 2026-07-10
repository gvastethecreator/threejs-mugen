# Define Studio editor authoring spine

Type: task
Status: claimed
Blocked by: None

## Question

What is the smallest Studio editing spine that turns the current evidence/workbench shell into a practical editor while preserving runtime proof and export contracts?

## Answer

Open. Candidate inputs: `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, Studio Build/Evidence readiness rows, project manifest/export bundle contracts, and current browser smoke coverage.

## Latest Progress (2026-07-09)

- 2026-07-10: expanded persistent identity authoring into a bounded scene-authoring workflow. Name, P1, CPU, stage, stage-list selection, and asset replacement mark explicit dirty state, invalidate stale outputs, save the current manifest entry, and reopen clean under browser proof.
- Remaining: autosave/navigation guards, undo/redo, multi-scene graphs, state/controller/collision authoring, filesystem persistence, conflicts, migrations, and source writes.
- 2026-07-10: added the first directly editable persistent project field. Workbench project names normalize whitespace, cap at 80 characters, invalidate stale build outputs, flow into manifests, save to the local project index, and survive browser reload/reopen under smoke coverage.
- Remaining: scene/state/collision authoring, autosave/conflicts, filesystem persistence, project-id rename policy, and migrations.

- Implemented a practical in-shell authoring spine improvement: Studio Workbench now includes direct `P1`, `CPU`, and `Stage` controls in the mission section so operators can switch matchup inputs without leaving Studio.
- This keeps the edit path tied to verified runtime/evidence outputs and remains blocked only by deeper editor ambitions (action/state/callback editors, saveable scene edits).
- Added the next authoring-spine slice for Build/Evidence: Trust Chain can now resolve package/source rows to concrete package files and required source paths while keeping the shared readiness contract as the source of truth.


## Work Started (2026-07-09)

- Next action: verify package-file and source-file drilldowns with `pnpm qa:smoke`, then continue toward deeper trace/asset/gate/report row jumps or persistent source handles.
- Scope: keep trust rows bound to real project/manifest/source-package metadata and avoid synthetic UI-only rows.
