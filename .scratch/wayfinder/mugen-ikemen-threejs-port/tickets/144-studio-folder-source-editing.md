# Implement Studio folder source editing

Type: task
Status: resolved
Blocked by: None

## Question

What is the smallest authoring cut that turns the existing source-handle and
reimport path into a real Studio editor without pretending ZIP archives or
stale sources are writable?

## Decision

Use a bounded folder-only source document editor. A source write is admitted
only when the package is linked, its fingerprint is matched, the project has
no revision conflict, a remembered directory handle has granted permission,
and the target path is safe. The browser writable stream uses exclusive mode;
the editor closes the staged stream before requesting an explicit folder
reimport. The reimport transaction may replace the fingerprint baseline only
for that explicit action and only when the edited folder still satisfies the
required package paths.

## Evidence

- `src/app/StudioSourceWrite.ts` owns the write plan, safe path resolution,
  directory traversal, staged stream close, and abort-on-failure behavior.
- `src/app/StudioSourceDocument.ts` owns the draft/commit/discard state used by
  the Studio Build source package panel.
- `src/app/App.ts` exposes a source document textarea for focused required
  paths, Save & Reimport, and Discard. A successful save refreshes the VFS,
  parser/runtime, source identity, and persisted handle metadata together.
- `src/tests/StudioSourceWrite.test.ts` and
  `src/tests/StudioSourceTransaction.test.ts` cover admission, path safety,
  exclusive stream closure, abort-on-conflict, and explicit fingerprint
  replacement.

## Official grounding

- [File System Access specification](https://wicg.github.io/file-system-access/)
  defines read/readwrite permission modes and directory/file handle traversal.
- [`FileSystemFileHandle.createWritable()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
  documents staged writes, close-time replacement, and permission/lock
  failures.

## Claim boundary

Claim allowed: existing source-file text edits for matched local folder
handles, with explicit reimport and fail-closed admission.

Claim blocked: ZIP archive rewrite, creation/deletion of source files,
background watching, automatic conflict merge, source-write rollback after a
successful close, state/controller/collision semantic editing, and full
MUGEN/IKEMEN parity.
