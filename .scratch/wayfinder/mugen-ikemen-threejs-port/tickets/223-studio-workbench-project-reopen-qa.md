# Stabilize Studio Workbench project reopen QA

Date: 2026-07-16
Status: resolved
Depends on: Wayfinder 222
Implementation commit: `1de6e0dd`

## Outcome

The Studio Workbench local-project reopen journey is now covered by a
dedicated browser command and by the broad smoke path. The failure was in the
test runner's timing and visibility assumptions, not in the persisted project
loader: the stored row was attached while its navigator panel was collapsed,
and the runner sampled the bridge before the click had committed the project.

## Contract

- After reload, the broad smoke waits for the stored project row to be
  attached, allowing the Workbench layout to keep the row in a collapsed
  navigator without weakening the interaction check.
- The click is followed by a bridge-state wait for the authored project name,
  rather than a fixed sleep as the primary synchronization mechanism.
- `pnpm run qa:studio:project-reopen` reproduces the author, autosave, reload,
  and reopen path and writes a concise browser artifact.

## Evidence

- Dedicated reopen QA: passed; authored name, project id, `training-grid`, and
  `dirty: false` restored after reload and stored-row selection.
- Broad `pnpm run qa:smoke`: passed across the runtime, MUGEN-lite, Studio,
  package, and mobile checks.
- Broad Studio Workbench assertion: `reopenedName` is
  `QA Authored Fight Project`; the authored stage is `training-grid`.
- Browser diagnostics: `0` console issues and `0` page errors.
- Node syntax checks and `git diff --check`: passed.

Artifacts:

- `.scratch/qa/studio-project-reopen/browser-diagnostics.json`
- `.scratch/qa/qa-smoke/diagnostics.json`
- `.scratch/qa/qa-smoke/studio-project-authoring.png`

## Audit

The first post-fix broad run exposed an overly strict `visible` selector: the
stored row existed but was hidden by the current navigator state. The final
runner uses `attached` plus bridge-state synchronization, and the focused
journey independently proves the row click and restored project state. This
keeps the QA fix scoped to synchronization and does not change application
storage or project semantics.

## Claim ceiling

This closes the browser regression for the current local-project persistence
journey. It does not claim filesystem persistence, arbitrary project
migration, external Ikemen-Go execution, complete MUGEN/IKEMEN parity, or
release readiness.

## Next

Continue the open Studio authoring contracts and runtime compatibility breadth
from the roadmap, using the promoted snapshot and the now-green Workbench
journey as gates.
