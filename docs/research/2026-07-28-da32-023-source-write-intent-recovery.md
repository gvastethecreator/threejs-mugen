# DA32-023 Studio source-write intent recovery

Date: 2026-07-28  
Type: product storage, source recovery, and browser evidence  
Status: closed-bounded

## Question

Can Studio retain enough durable source-write context to recover a pending
write in the live editor without pretending that a file-system handle or the
write itself survived?

## Sources

- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: IDBObjectStore.getAll](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/getAll)
- [MDN: IDBTransaction](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction)
- [MDN: FileSystemWritableFileStream](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream)

## Findings

- IndexedDB object stores can hold structured intent records and return all
  records through an asynchronous transaction. The implementation uses that
  path for pending-intent enumeration and direct browser-gate readback.
- A source write has two different facts: the durable intent/preimage and the
  capability to write a file. The intent survives in the Studio database; the
  browser gate keeps the source package unlinked and checks that no persistent
  handle write occurs during recovery.
- Recovery must restore exact text before any later authoring action. The
  browser gate compares the source editor value with the seeded preimage and
  checks that the intent remains pending after the load.
- A successful source-folder write now settles the same intent from the
  `SourceWriteReceipt`. The full smoke assertion checks the bridge result,
  path, draft digest, preimage byte length, and the durable IndexedDB record.
- The existing `preimageSha256` field retains the current project digest
  implementation. This slice claims exact bytes and byte length, not a new
  cryptographic digest contract.

## Decision

Keep `StudioSourceWriteIntent/v1` as a recovery journal for one source-write
attempt. Store the source package id, path, preimage bytes, current project and
draft identity, byte length, and outcome metadata. Replay only loads the
preimage into the active editor; it does not silently request permission or
write a file. Settle the intent only after the existing source-write receipt
is available.

## Implementation

- `src/app/StudioIndexedDbSnapshot.ts` now lists, validates, stores, and
  replays source-write intents in the `mugen-web-sandbox-studio` database.
- `src/app/App.ts` creates an intent before source-folder writes, settles it
  from `SourceWriteReceipt`, exposes pending recovery data, and loads exact
  preimage text through an explicit action.
- `src/tests/StudioIndexedDbSnapshot.test.ts` covers pending -> committed
  lifecycle, metadata retention, direct list, and byte replay.
- `scripts/qa_smoke.cjs` checks the committed bridge and durable intent after
  source write/reimport.
- `scripts/qa_browser_gate_da32_023_source_write_intent.cjs` covers the seeded
  pending recovery route at desktop and mobile viewports.

## Evidence

- Implementation commit: `96a918b0`.
- Smoke checkpoint: `72a19141`; zero failures in the accumulated
  `pnpm qa:smoke` run.
- Browser subject: `ef2bf99c`, clean tree, `provisional: false`.
- Browser result: `ok: true`; desktop `1440x900` and mobile `390x844`; zero
  unexpected console errors.
- Focused verification: 14/14 Studio/source-write tests, TypeScript 7
  typecheck, build, `node --check`, and `git diff --check` passed. Build keeps
  the existing Vite large-chunk warning.
- Evidence:
  `docs/evidence/da32/da32-023-source-write-intent-browser-gate.json` and its
  desktop/mobile captures.

## Claim ceiling

Allowed: named IndexedDB pending-intent recovery, exact preimage loading,
pending-state retention, and no-handle-write behavior at the recorded route
and viewports; committed intent readback after the named source-folder
write/reimport smoke path.

Open: automatic permission repair, handle-backed write after recovery, quota
and eviction recovery, multi-file transactions, binary source blobs, physical
browser coverage, release authority, and full MUGEN/IKEMEN Studio parity.
