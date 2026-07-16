# Studio Workbench project reopen closeout

Date: 2026-07-16
Wayfinder ticket: 223
Implementation commit: `1de6e0dd`

## Result

The Workbench local-project reopen regression is closed at the browser-QA
layer. The application path already restored the saved project; the broad
runner was sampling a hidden row and a not-yet-committed bridge state.

| Area | Result |
| --- | --- |
| Author, autosave, reload, reopen journey | passed |
| Restored project identity | `QA Authored Fight Project` |
| Restored stage | `training-grid` |
| Restored dirty state | `false` |
| Focused command | `pnpm run qa:studio:project-reopen`, passed |
| Broad smoke | `pnpm run qa:smoke`, passed |
| Browser console/page diagnostics | `0` / `0` |
| Syntax and diff hygiene | passed |

Artifacts:

- `.scratch/qa/studio-project-reopen/browser-diagnostics.json`
- `.scratch/qa/qa-smoke/diagnostics.json`
- `.scratch/qa/qa-smoke/studio-project-authoring.png`

## Change

`scripts/qa_smoke.cjs` now synchronizes on an attached stored-project row and
the expected bridge project name. `scripts/qa_studio_project_reopen.cjs`
provides a concise, repeatable focal journey with persisted diagnostics.

## Audit and residual risk

The first post-fix run showed that a `visible` selector was still too strict
for a collapsed navigator; the final run uses `attached` and a state-based
wait. No application storage code was changed. Filesystem persistence,
arbitrary project migration, external Ikemen-Go execution, full
MUGEN/IKEMEN parity, and release readiness remain open.
