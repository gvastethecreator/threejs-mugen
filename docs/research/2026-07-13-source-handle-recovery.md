# Persistent Source Handle Recovery Research

Date: 2026-07-13

## Decision

Use a browser-only `SourceHandle/v0` read model around the File System Access
API and IndexedDB. Keep the native handle out of `project.json`; persist only
the handle plus redacted, fingerprinted metadata in an IndexedDB object store.
The active source session still changes only through the existing
`SourceTransaction/v0` admission and rollback boundary.

## Official Sources

- [MDN: FileSystemFileHandle.getFile()](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/getFile)
  documents that the file read requires a secure context and can fail when
  permission is not granted or the file is no longer available. The returned
  `File` reflects the current on-disk state, so recovery must re-check the
  source fingerprint before treating it as the saved package.
- [W3C: Indexed Database API 3.0](https://www.w3.org/TR/IndexedDB/)
  defines object stores, transactions, version upgrades, persistence, and the
  `blocked`/`versionchange` lifecycle used by the browser metadata adapter.

## Local Contract

`src/app/StudioSourceHandle.ts` owns:

- `mugen-web-sandbox/source-handle/v0` records with explicit capability,
  permission, storage, read, stale, missing, and recovery state.
- Native picker and permission adapters for ZIP file handles. Folder handles
  are represented for future expansion but folder recovery remains manual in
  this slice because the current loader consumes a `FileList` contract.
- An IndexedDB store keyed by the redacted `source-handle:<sourcePackageId>`
  id, with a memory fallback when the API is absent or rejects structured
  cloning.
- Fingerprint comparison before recovery. A changed handle is reported as
  stale and cannot silently replace the active source package.

The App exposes `sourceHandles` in the diagnostics bridge and binds three
actions to real source-package rows: remember a ZIP handle, request read
permission, and recover a missing package. Recovery reads a `File`, routes it
through the existing ZIP loader, and persists the handle only as a separate
source capability. No source file write, automatic background reacquire, or
license assertion is introduced.

## Blocked Scope

- Native folder enumeration and folder-handle recovery.
- Source writes or write-permission requests.
- Crash-safe replacement beyond the existing in-session transaction rollback.
- Streaming digests for archives larger than the current loader policy.
- Full MUGEN/IKEMEN filesystem and editor parity.
