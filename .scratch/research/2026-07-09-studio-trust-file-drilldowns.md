# Studio Trust Chain File Drilldowns

## Question

Should package/source file drilldowns become separate Studio status surfaces, or should they stay inside the existing Trust Chain rows?

## Answer

Keep them inside the existing Trust Chain contract. The current interface contract says Build and Evidence must share rows derived from Build Readiness data, and the roadmap calls for package-file and source-file drilldowns without duplicating per-surface status logic. The app already has authoritative package file metadata in `ProjectExportBundleManifest.files` and source file metadata in `GameProjectSourcePackage.requiredPaths`, so the smallest reliable implementation is to add target path metadata and visible destination rows to the same Trust Chain flow.

## Sources

- `docs/INTERFACE_SYSTEM.md` - Studio Build/Evidence Trust Chain rows must derive from Build Readiness and expose target kind/id, evidence, freshness/delta, impact, blockers, and one primary next action.
- `docs/ROADMAP_EXECUTION_BOARD.md` - S1 asks for package-file and source-file drilldowns in the same Trust Chain contract.
- `.scratch/roadmap/issues/02-studio-evidence-workflow.md` - Current next useful cut names package-file and source-file drilldowns as the active Studio workflow improvement.
- `src/app/App.ts` - `ProjectExportBundleManifest.files` already records package file paths, and `GameProjectSourcePackage.requiredPaths` already records source package paths.

## Implementation Impact

- Add `package-file` and `source-file` Trust Chain target kinds.
- Preserve the seven Build Readiness-backed Trust Chain rows.
- Add visible Build panel rows for package files and required source paths so Trust Chain clicks can land on inspectable data.
- Extend QA smoke to click the Trust Chain rows and verify focused destination rows through the bridge and DOM.

## Uncertainty

This does not create persistent browser source handles or a full package file browser. Those remain future Studio editor work after the manual relink and export package flows stay stable.
