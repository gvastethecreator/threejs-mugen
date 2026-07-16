# Research: Studio Workbench project reopen QA

Date: 2026-07-16
Lane: R2 Studio editor reliability
Wayfinder ticket: 223

## Question

Why did the broad browser smoke report that a saved Studio project reopened as
`Local Fighting Project` when the application could restore the authored
project in a focused journey?

## Decision

Treat the failure as a runner synchronization defect. The smoke path now waits
for the stored project row to be attached after reload and then waits for the
bridge project name after selection. A dedicated Playwright command preserves
the same journey as a smaller diagnostic artifact.

## Findings

- The stored project survives autosave and explicit local save in
  `mugen-web-sandbox:projects:v0`.
- After reload, the application intentionally starts on `Local Fighting
  Project`; the persisted project row is present while the Workbench navigator
  may be collapsed, so `visible` is not a valid readiness condition.
- Selecting the attached stored row changes the bridge project to
  `QA Authored Fight Project` and restores `training-grid` with no dirty state.
- A fixed delay alone was weaker than observing the bridge state, because
  reload and project selection have independent render/commit timing.

## Verification policy

The focused command checks before-reload state, after-reload stored entries,
row presence, and after-open identity/stage. The broad smoke remains the
release-facing regression because it also exercises authoring, dirty navigation,
undo/redo, autosave, and the other runtime/editor surfaces.

## Boundaries

The result proves local browser storage and Workbench reopen behavior only. It
does not extend the compatibility snapshot claim to external engines or
general filesystem projects.
