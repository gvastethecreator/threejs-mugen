# Folder Source Handle Recovery Report

Date: 2026-07-13
Status: implementation complete for the bounded read-only folder slice

## Delivered

- Extended `mugen-web-sandbox/source-handle/v0` with recursive directory-handle
  enumeration through the asynchronous `values()` adapter.
- Preserved the selected directory as the first relative-path segment and
  rejected empty, dot, dot-dot, slash, backslash, and NUL path segments before
  VFS insertion.
- Extended `FolderCharacterSource` to accept explicit `{ file, relativePath }`
  records while keeping `FileList` and `File[]` imports compatible.
- Reused source fingerprinting and `SourceTransaction/v0` as the admission
  boundary; recovered bytes are readable but the transaction remains
  non-writable until a separate permission/write slice exists.
- Exposed `file` versus `directory` in the Build Center source-handle row and
  added recursive folder recovery evidence to the browser smoke.

## Claim Allowed

Studio can recover a missing folder package from a readable directory handle in
the current browser session, rebuild the expected VFS paths, fingerprint the
same bytes, and commit them only through the existing source transaction. The
browser proof reaches `directory/granted/canRead`, matched identity, and
`linked/canWrite=false` for the 14-entry Kung Fu Man fixture.

## Claim Blocked

This is not native cross-reload folder persistence proof, durable source
editing, directory watching, automatic background reacquire, or complete
MUGEN/IKEMEN filesystem/editor parity. The smoke uses a test directory handle
that intentionally falls back to memory because browser structured cloning is
not available for that fake object; native IndexedDB behavior remains
capability-dependent.

## Evidence

- Focused `StudioSourceHandle` plus `FolderCharacterSource` suite: 2 files / 9
  tests passed.
- Full `pnpm test`: 193 files / 2000 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, `pnpm qa:trace`,
  `pnpm qa:css:budget`, `node --check scripts/qa_smoke.cjs`, and
  `git diff --check` passed. Build output: 1,704.40 kB JavaScript / 428.45 kB
  gzip. Trace: 581/581 artifacts, 547 required, 34 optional, 0 skipped.
- Browser smoke passed with 0 page errors and 0 console issues. Code Fu Man
  reached idle, state 200, QCF state 1000, upper state 1100, and returned to
  idle after each route. Folder recovery enumerated 14 fixture files, matched
  the SHA-256 source identity, exposed `source-handle/v0` as
  `directory/granted/canRead`, and linked `source-transaction/v0` as readable
  and non-writable. The Build Center folder row was scrolled into the captured
  evidence surface.
- CSS budget: 319,446 bytes / 1,472 rules / 70 repeated declaration groups /
  51 cross-file overlaps / 0 duplicate keys.
- The browser diagnostics are in
  `.scratch/qa/qa-smoke/diagnostics.json`; the focused screenshot is
  `.scratch/qa/qa-smoke/studio-source-folder-handle.png`.

## Official Research

- [MDN: `FileSystemDirectoryHandle.values()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/values)
- [MDN: `FileSystemHandle.kind`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/kind)
- [MDN: `FileSystemHandle.queryPermission()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/queryPermission)

## Next

Choose between native browser persistence/permission evidence and the next
bounded source-write transaction. Keep background reacquire, directory watch,
and parity claims blocked until their own artifacts exist.
