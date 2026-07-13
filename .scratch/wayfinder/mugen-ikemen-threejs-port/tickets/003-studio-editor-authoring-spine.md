# Define Studio editor authoring spine

Type: task
Status: open
Blocked by: None

## Question

What is the smallest Studio editing spine that turns the current evidence/workbench shell into a practical editor while preserving runtime proof and export contracts?

## Answer

Open. Candidate inputs: `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, Studio Build/Evidence readiness rows, project manifest/export bundle contracts, and current browser smoke coverage.

## Latest Progress (2026-07-09)

- 2026-07-13: added the transaction boundary for browser-local project edits.
  Saves carry the opened revision, stale writes are rejected without replacing
  the remote entry, and same-origin storage events cancel pending autosave and
  expose the mismatch through the diagnostics bridge. Explicit reload/keep
  actions remain the next slice.
- 2026-07-13: versioned the browser-local project index as
  `project-index/v1`. Legacy v0 entries migrate with revision `1`, project
  replacements increment revisions, and malformed entries remain fail-closed.
  Cross-tab storage events and conflict resolution remain a separate boundary.
- 2026-07-13: added debounced local autosave to the persistent identity
  authoring path. Dirty edits coalesce after `1.5s`, explicit save and source
  replacement cancel pending work, and browser smoke proves local persistence,
  `dirty=false`, and an empty pending state.
- 2026-07-13: added a bounded project-edit history to the persistent identity
  authoring path. Name, P1, CPU, and stage changes now record immutable state
  snapshots; the Workbench exposes undo/redo buttons and keyboard shortcuts;
  undo/redo rebuilds the runtime and invalidates stale outputs; new manifests
  and imported packages reset the history. Browser smoke proves four edits,
  branch-safe undo/redo, keyboard parity, dirty state, and save/reopen.
- 2026-07-13: added dirty-navigation protection. `beforeunload` cancels dirty
  Studio exits, project replacement asks for confirmation, and source-package
  replacement is guarded without blocking clean match/inspector flows. Smoke
  proves dismissal preserves the authored state.
- Remaining: multi-scene graphs, state/controller/collision authoring,
  conflict actions, filesystem persistence, and source writes.
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
