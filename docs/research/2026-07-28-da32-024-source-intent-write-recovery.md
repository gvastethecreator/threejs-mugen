# DA32-024 Studio source-intent write recovery

Date: 2026-07-28  
Type: source permissions, native handles, write/reimport recovery, and browser evidence  
Status: closed-bounded

## Question

Can Studio reconnect a pending source-write intent through a native folder
handle, restore the exact preimage as a dirty editor draft, complete an
explicit write and reimport, and show the read and write permission states
without merging them into one false status?

## Sources

- [MDN: FileSystemHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle)
- [MDN: FileSystemHandle.queryPermission](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/queryPermission)
- [MDN: FileSystemDirectoryHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle)
- [MDN: FileSystemFileHandle.createWritable](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
- [MDN: File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## Findings

- The File System Access API exposes read and `readwrite` permission modes as
  separate queries/requests. A source handle record must keep those states
  separate so a successful write does not leave the transaction panel at
  `not-requested`.
- A pending intent remains a durable preimage record. Relink uses the native
  folder picker, reads the folder into the existing VFS, and then loads the
  preimage through the active VFS path. When the linked source differs, the
  editor stays dirty and requires the visible Save & Reimport action.
- Save first requests `readwrite`, persists the granted write state, captures
  the preimage, writes the selected source path, reimports the folder, and
  settles the recovered intent only after the write receipt and reimport path
  agree. The bridge now reports read `granted`, write `granted`, and a writable
  source transaction together.
- Existing source-handle records remain readable. The parser defaults a
  missing `writePermission` field to `not-requested`, so the schema change does
  not treat old records as invalid.
- The browser gate uses a deterministic mock native folder handle. It proves
  the named route and state transitions, not physical permission prompts,
  browser-specific handle persistence, or OS-level write guarantees.

## Decision

Keep `SourceHandleRecord.permission` as the read permission and add
`SourceHandleRecord.writePermission` for the independent write capability.
Use the write state for folder source transactions and keep the existing read
state as the admission boundary for source recovery. A write remains explicit:
the recovery panel never writes while loading a preimage.

## Implementation

- `src/app/StudioSourceHandle.ts` persists and migrates the separate write
  permission field.
- `src/app/App.ts` preserves the field across relink/recovery, records it after
  a write permission request, exposes it in the source package row, and feeds it
  into folder `SourceTransactionRecord` diagnostics.
- `src/tests/StudioSourceHandle.test.ts` covers the split permission state.
- `scripts/qa_browser_gate_da32_024_source_intent_write_recovery.cjs` checks
  native relink, dirty preimage replay, readwrite request, bridge reflection,
  exact file bytes, committed reimport, original intent settlement, desktop,
  mobile, overflow, and console errors.

## Evidence

- Feature commit: `42bf475c`.
- Clean browser evidence pin: `ae16132a`.
- Global smoke checkpoint: `bd9680fb`; `pnpm qa:smoke` passed with zero
  failures after the smoke assertion adopted the separate write permission
  state.
- Browser subject recorded in the report: `0c39d9e9`, clean and
  `provisional: false`.
- Browser result: `ok: true`; desktop `1440x900` and mobile `390x844`; ten
  steps passed in each viewport; unexpected console errors: zero.
- Evidence:
  `docs/evidence/da32/da32-024-source-intent-write-recovery-browser-gate.json`
  and the matching desktop/mobile captures.

## Claim ceiling

Allowed: named Studio folder recovery route, native-picker relink in the
recorded browser harness, exact preimage replay, dirty-state admission,
separate read/write permission reporting, explicit write/reimport, original
intent settlement, exact recovered bytes, and the recorded desktop/mobile
layout and console checks.

Open: physical permission prompts, browser variance, durable native handle
survival across every browser restart, crash injection between stream close and
receipt finalization, quota/eviction recovery, multi-file atomic recovery, ZIP
archive rewrite, binary source blobs, release authority, and full
MUGEN/IKEMEN Studio parity.
