# Source Handle Recovery Report

Date: 2026-07-13
Status: implementation complete for the bounded ZIP recovery slice

## Delivered

- Added the `mugen-web-sandbox/source-handle/v0` contract.
- Added permission-aware native handle helpers and a versioned IndexedDB
  repository with a session-memory fallback.
- Added App bridge records and Build Center actions for remember, permission,
  and recovery flows.
- Reused the existing source fingerprint and `SourceTransaction/v0` boundary;
  changed or invalid source bytes cannot silently replace the active session.
- Added focused coverage for state transitions, stale fingerprints, permission
  requests, picker reads, and storage fallback.

## Claim Allowed

The Studio can represent a remembered ZIP handle, its read permission, storage
mode, and recovery action. A granted handle can be re-read through the current
ZIP loader and accepted only when the existing source transaction allows it.

## Claim Blocked

This is not durable source editing, folder recovery, automatic background
reacquire, or complete browser filesystem parity. IndexedDB persistence is
capability-dependent and the memory fallback is explicitly session-only.

## Evidence

- Focused `StudioSourceHandle`, `StudioSourceTransaction`, `StudioSourceIdentity`,
  and `StudioModel` suite: 4 files / 29 tests passed.
- Full `pnpm test`: 192 files / 1997 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm qa:trace`, `pnpm qa:css:budget`, `node --check scripts/qa_smoke.cjs`,
  and `git diff --check` passed. Build output: 1,703.26 kB JavaScript /
  428.16 kB gzip. Trace: 581/581 artifacts, 547 required, 34 optional.
- Browser smoke passed with 0 page errors and 0 console issues. Code Fu Man
  reached idle, state 200, QCF state 1000, upper state 1100, and returned to
  idle after each route. Source recovery evidence preserved the linked session
  after changed-source rejection; the source-handle row reported
  `available/indexeddb/not-linked` without path leakage.
- Export evidence: 64 package files, 53 bundled binaries, 14 source file
  digests, 10 provenance inputs, 53 outputs, 2 complete records, 0 absolute
  path leaks. Full closeout is indexed as backlog Entry 493.
