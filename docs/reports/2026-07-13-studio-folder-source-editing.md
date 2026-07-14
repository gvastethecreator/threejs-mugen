# Report: Studio folder source editing

Date: 2026-07-13

## Delivered

- Added a typed source-write admission boundary for linked, fingerprint-matched
  folder packages.
- Added safe relative-path traversal and exclusive staged writes with abort on
  failure.
- Added a focused Build source editor with `Save & Reimport` and `Discard`.
- Added explicit changed-source transaction admission for that user action only;
  the resulting parsed folder becomes the new fingerprint baseline.
- Kept ZIP sources read-only and preserved stale/conflict fail-closed behavior.

## Evidence

- `StudioSourceWrite` tests cover ZIP rejection, identity/handle/path gates,
  nested path writes, exclusive stream options, and abort-on-conflict.
- `StudioSourceTransaction` tests cover explicit folder reimport and baseline
  replacement.
- Closure evidence: `pnpm qa:smoke` passed with the Playwright browser flow, including
  folder source editing and explicit reimport. The broader gates also passed: `pnpm test`
  (200 files, 2045 tests), `pnpm build`, `pnpm check:boundaries`, `pnpm qa:css`, and
  `pnpm qa:trace` (587/587 artifacts). `pnpm typecheck` is rerun immediately before
  commit so this report records the final source state.

## Claim boundary

Allowed: bounded existing-file authoring for matched local folders, followed by
explicit parser/runtime reimport.

Blocked: ZIP rewrite, file creation/deletion, background watching, automatic
merge, source-write rollback after stream close, and semantic Character/Stage
state/controller/collision editing.
