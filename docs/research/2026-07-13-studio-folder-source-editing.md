# Research: Studio folder source editing

Date: 2026-07-13

## Question

How can the browser Studio edit an imported MUGEN source without silently
writing a stale package or claiming that ZIP archives are directly writable?

## Findings

The File System Access contract separates read and readwrite permission modes
and resolves a directory source through directory/file handles. The writable
stream is staged: the browser does not replace the represented file until the
stream closes, and permission, missing-entry, lock, and safety failures can
reject the operation. The implementation therefore uses an existing folder
file only, requests no creation, opens the stream in exclusive mode, closes it
before reimport, and aborts a still-open stream after a write/close failure.

The local project already had the necessary runtime path: folder handles can
be enumerated, the VFS can be parsed again, and source fingerprints gate the
relink transaction. The missing boundary was admission plus an explicit
baseline replacement. Save now allows a changed fingerprint only through the
source editor's explicit folder reimport path; ordinary relinks still reject
changed identity.

## Sources

- [File System Access specification](https://wicg.github.io/file-system-access/)
- [`FileSystemFileHandle.createWritable()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)

## Repository evidence

- `StudioSourceWrite` blocks ZIP, stale/unknown identity, revision conflict,
  missing permission, unsafe paths, and unsupported handles.
- `StudioSourceDocument` keeps local text drafts separate from the project
  manifest and marks navigation dirty until discard or successful save.
- `StudioSourceTransaction` accepts the changed fingerprint only when
  `allowChangedSource` is explicitly passed by the save/reimport path.
- The editor is intentionally limited to existing files in a directory handle;
  it does not create, delete, merge, watch, or rewrite ZIP archives.
