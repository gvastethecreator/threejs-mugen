# Source Import Transaction Research

Date: 2026-07-13

## Question

What is the smallest transaction boundary that prevents a changed external
MUGEN source from replacing the active Studio session while keeping future
durable writes honest?

## Sources

- [W3C IndexedDB 3.0](https://www.w3.org/TR/IndexedDB/)
- [MDN `FileSystemFileHandle.createWritable()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
- [File System Access API draft](https://wicg.github.io/file-system-access/)

## Findings

- IndexedDB transactions provide atomic metadata changes: an abort rolls back
  the transaction's changes, and commit writes the transaction as one unit.
  That property is useful for project metadata, not for an external file that
  is being replaced outside the database.
- `createWritable()` does not expose a durable write as soon as a stream is
  opened. The replacement becomes visible after the writable stream closes,
  which gives the application a natural commit point but still requires
  permission handling and recovery around the external file operation.
- File System Access permissions and user activation are separate browser
  concerns. A project can remember a handle only when the browser permits it;
  a fingerprint alone cannot reacquire bytes or grant write access.
- The current runtime path has several mutable consumers in sequence:
  manifest/source metadata, providers, audio, stage archives, match runtime,
  and inspector. Admission must therefore happen before any consumer is
  changed, while the session commit needs a rollback snapshot for failures
  after admission.

## Decision

Implement a read/import transaction in three parts: a pure source plan, one
session commit callback, and rollback of the prior session state on commit
failure. Keep durable file writing as a later protocol that combines a
permission-aware handle, temporary/replacement stream, persisted metadata
transaction, invalidation of stale outputs, and explicit recovery evidence.

## Local Boundary

`SourceImportTransaction` rejects changed fingerprints before `useCharacter`
can mutate the active runtime. Accepted imports update source metadata only in
the commit callback. The browser smoke fixture changes one DEF byte and proves
the rejection retains the old fingerprint, linked status, runtime, and Build
Center session.

## Uncertainty

The current boundary does not yet define crash recovery for a file replacement,
durable handle serialization, permission revocation, or large-source streaming.
Those should be researched and implemented only when the project adds source
editing or persisted workspace writes.
