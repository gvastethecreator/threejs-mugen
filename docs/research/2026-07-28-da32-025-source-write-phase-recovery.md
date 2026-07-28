# DA32-025 Studio source-write phase recovery

Date: 2026-07-28  
Type: durable write phases, post-reload recovery, and browser evidence  
Status: closed-bounded

## Question

Can Studio tell which part of a source write survived a reload when the
writable stream boundary has closed but the receipt has not settled, then load
the exact preimage without inventing a commit or writing a source handle?

## Sources

- [MDN: FileSystemHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle)
- [MDN: FileSystemHandle.queryPermission](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/queryPermission)
- [MDN: FileSystemFileHandle.createWritable](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
- [MDN: File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: IDBObjectStore.getAll](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/getAll)
- [MDN: IDBTransaction](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction)

## Findings

- File System Access exposes permission queries and writable streams, but it
  does not provide the Studio receipt or the product-level meaning of a
  partially completed source operation. That boundary belongs in the app
  journal.
- IndexedDB gives the browser route a durable object store and asynchronous
  transaction boundary. A reload can read the last intent record, but the
  record must carry enough state to avoid treating a closed stream as a
  committed reimport.
- `StudioSourceWriteIntent/v1` now records four ordered phases:
  `preimage-captured`, `write-closed`, `reimported`, and `settled`. The record
  also keeps the write byte length, observed source fingerprint, and receipt
  id when those values exist.
- The Studio recovery panel renders the phase and keeps the intent pending
  until a result exists. `Load preimage` replays the stored bytes into the
  editor and does not request permission, open a writable stream, or synthesize
  a receipt.
- Older intent records remain readable. Missing phase data normalizes to
  `preimage-captured`, while invalid phase values fail the record validator.

## Decision

Keep phase tracking inside `StudioSourceWriteIntent/v1`. Persist the phase
after the writable stream closes and after explicit reimport, then settle it
only with the existing `SourceWriteReceipt`. Recovery stays inspectable and
manual: the route may replay the preimage, but it cannot claim a write or retry
one without the explicit source-handle path.

## Implementation

- `src/app/StudioIndexedDbSnapshot.ts` adds the phase union, optional write
  evidence, backward-compatible normalization, and validation.
- `src/app/App.ts` persists the phase at preimage capture, stream close,
  reimport, and receipt settlement, then exposes the phase in the recovery
  surface.
- `src/tests/StudioIndexedDbSnapshot.test.ts` covers default normalization,
  settled receipt evidence, and a durable `write-closed` record with no result.
- `scripts/qa_browser_gate_da32_025_source_write_phase_recovery.cjs` seeds a
  real IndexedDB intent, reloads the Studio route, checks the bridge and DOM,
  replays exact bytes, and proves no source-handle write at desktop and mobile
  viewports.
- `scripts/qa_smoke.cjs` checks settled phase, write byte length, observed
  fingerprint, receipt id, and the matching durable IndexedDB record in the
  global folder write/reimport route.

## Evidence

- Feature commit: `4e0d399c`.
- Clean browser evidence pin: `a258bea7`.
- Browser report:
  `docs/evidence/da32/da32-025-source-write-phase-recovery-browser-gate.json`.
- The clean gate passed at desktop `1440x900` and mobile `390x844`; all seven
  steps passed in each viewport and unexpected console errors were zero.
- Focal verification passed 40 tests, `pnpm typecheck`, `pnpm build`, gate
  syntax, and `git diff --check` before the feature commit.
- Global smoke passed with zero failures at `5c0d0c68` after the phase and
  receipt assertions were added.

## Claim ceiling

Allowed: durable phase readback for the named Studio route, exact preimage
replay, pending retention, no source-handle write during replay, the recorded
desktop/mobile layout check, and the global folder write/reimport phase fields.

Open: physical crash injection between stream close and receipt finalization,
automatic receipt synthesis, automatic source retry, quota and eviction
recovery, multi-file atomic recovery, ZIP archive rewrite, binary source blobs,
physical permission prompts, release authority, and full MUGEN/IKEMEN authoring
parity.
