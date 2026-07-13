# SourceTransaction/v0 Read Model Research

Date: 2026-07-13

## Question

What should Studio expose before it can edit an external MUGEN or IKEMEN source
package without confusing readable session bytes with durable write capability?

## Sources

- [W3C IndexedDB 3.0](https://www.w3.org/TR/IndexedDB/)
- [MDN `FileSystemFileHandle.createWritable()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
- [File System Access API draft](https://wicg.github.io/file-system-access/)

## Findings

- A browser session can read an imported ZIP or folder through the existing
  virtual file system while having no durable file handle or write permission.
- `createWritable()` has an explicit close/commit boundary for external file
  replacement, but permission state and recovery still belong to the caller.
- IndexedDB transactions can make project metadata changes atomic, but they do
  not make a separately replaced external file atomic with that metadata.
- A saved source fingerprint is an identity check, not a way to reacquire bytes
  or grant write access.
- A project revision mismatch must block a source write even when the source
  package is readable and the browser previously granted permission.

## Decision

Implement `SourceTransaction/v0` as a pure read model. Each source package
reports:

- linked, changed, missing, or conflict state;
- permission capability without requesting permission;
- expected and observed fingerprint/revision metadata;
- separate `canRead` and `canWrite` flags;
- one deterministic next action;
- outputs invalidated while the source is not safely linked.

The current invalidation set is `runtime-manifest`, `trace-artifact`, and
`project-bundle`. It is deliberately conservative until a future write
protocol can rebuild those outputs.

## Local Boundary

`createSourceTransactionRecord` is consumed by the Studio diagnostics bridge
and Source Packages panel. The browser smoke path proves that a successfully
relinked package is readable but not writable when permission is not requested,
and that a changed reimport keeps the prior linked/matched session while its
transaction remains non-writable.

## Deferred Work

Durable handle persistence, permission requests, permission revocation,
temporary-file replacement, crash recovery, IndexedDB metadata commits,
streaming digests, and source editor writes remain separate milestones. No
claim of durable source editing is allowed from this read model alone.
