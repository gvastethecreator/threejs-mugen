# Folder Source Handle Recovery Research

Date: 2026-07-13

## Question

Can a persisted `FileSystemDirectoryHandle` recover a MUGEN folder without
changing the existing VFS, source fingerprint, or transaction boundary?

## Decision

Yes, for a bounded read-only adapter. Enumerate the directory handle with its
async `values()` iterator, recurse only through entries whose `kind` is
`directory`, read `file` entries through `getFile()`, and rebuild explicit
relative paths rooted at the selected directory name. Feed those entries into
the existing `FolderCharacterSource`; fingerprinting and `SourceTransaction/v0`
remain the admission boundary.

## Official Sources

- [MDN: FileSystemDirectoryHandle.values()](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/values)
  defines `values()` as an asynchronous iterator over directory entries and
  documents `NotAllowedError` for missing read permission and `NotFoundError`
  for a missing current entry.
- [MDN: FileSystemHandle.kind](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/kind)
  defines `file` and `directory` as the entry kinds used to distinguish
  recursive traversal from file reads.
- [MDN: FileSystemHandle.queryPermission()](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/queryPermission)
  states that a handle loaded from IndexedDB may return `prompt`, so recovery
  must request read permission before enumeration.

## Local Contract

- `readSourceHandleFolder()` returns `{ file, relativePath }` records, never
  native paths or source writes.
- The selected directory name is the first relative-path segment, matching
  the browser `webkitRelativePath` contract used by manual folder import.
- Empty, dot, dot-dot, slash-containing, backslash-containing, or NUL path
  segments are rejected before VFS insertion.
- ZIP and folder handles share permission/storage metadata, but use distinct
  file versus directory read adapters.

## Blocked Scope

- Write permission, mutation, deletion, or automatic background reacquire.
- Directory change watching or incremental re-fingerprinting.
- Exact native filesystem ordering; VFS sorting remains canonical.
- Full MUGEN/IKEMEN filesystem and editor parity.
