# DA32-026 Studio source-write receipt recovery

Date: 2026-07-28
Type: receipt persistence, digest validation, post-reload Studio evidence
Status: closed-bounded

## Question

Can Studio restore the full `SourceWriteReceipt/v1` after a reload instead of
keeping only a receipt id on the durable source-write intent, while rejecting a
tampered receipt before it reaches the bridge or recovery UI?

## Sources

- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: IDBObjectStore.getAll](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/getAll)
- [MDN: IDBTransaction](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction)
- [MDN: FileSystemHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle)
- [MDN: FileSystemFileHandle.createWritable](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)

## Findings

- The source-write intent already survived reload, but `receiptId` alone could
  not restore the receipt detail used by Studio trust rows, evidence export, or
  the recovery panel.
- IndexedDB structured-clone storage can retain the receipt object beside the
  intent. The record must still be checked by the existing receipt parser and
  digest before the App consumes it.
- A settled receipt is a readback fact. Rehydrating it must not request source
  permission, reopen a writable stream, or turn the reload path into a retry.
- A tampered receipt fails closed. The intent save rejects it, and an invalid
  record read from IndexedDB is filtered from the usable intent list.

## Decision

Persist the validated `SourceWriteReceipt/v1` payload as an optional field on
`StudioSourceWriteIntent/v1`, alongside the existing `receiptId`. On startup,
select the same intent used by the recovery surface and restore its receipt to
the App bridge. Keep the receipt optional so older intent records remain
readable and pending recovery keeps its current behavior.

## Implementation

- `src/app/StudioIndexedDbSnapshot.ts` stores an optional receipt, validates it
  with `parseSourceWriteReceipt`, and rejects invalid digests before writing.
- `src/app/App.ts` writes the receipt when an intent settles, rehydrates it on
  startup, and renders the settled receipt in the recovery surface.
- `src/tests/StudioIndexedDbSnapshot.test.ts` covers receipt round-trip and a
  tampered digest rejection.
- `scripts/qa_browser_gate_da32_026_source_write_receipt_recovery.cjs` seeds a
  settled intent in the real IndexedDB object store, reloads Studio, checks the
  bridge and DOM receipt, verifies the durable digest, and checks desktop/mobile
  overflow and no-handle-write state.
- `scripts/qa_smoke.cjs` checks the receipt id, status, digest, and durable
  record after the real folder write/reimport route.

## Evidence

- Feature commit: `f18adb2d`.
- Clean browser evidence pin: `5bc4cb90`.
- Browser report:
  `docs/evidence/da32/da32-026-source-write-receipt-recovery-browser-gate.json`.
- The clean gate passed at desktop `1440x900` and mobile `390x844`; all six
  steps passed in each viewport and unexpected console errors were zero.
- Focused verification passed 20 tests, then the receipt integrity case passed
  as 5/5 in `StudioIndexedDbSnapshot.test.ts`; `pnpm typecheck`, gate syntax,
  and `git diff --check` passed.
- Global smoke passed with zero failures at `c632ceba` after the receipt
  assertions were added.

## Claim ceiling

Allowed: validated settled receipt persistence and rehydration for the named
Studio route, intact receipt digest/status, visible recovery evidence, the
recorded desktop/mobile layout checks, and no-handle-write behavior during
readback.

Open: physical crash injection between stream close and receipt finalization,
automatic receipt synthesis, automatic source retry, quota and eviction
recovery, multi-file atomic recovery, ZIP archive rewrite, binary source blobs,
physical permission prompts, release authority, and full MUGEN/IKEMEN authoring
parity.
