# DA32-022 Studio durable snapshot binding

Date: 2026-07-28  
Type: product storage and browser evidence  
Status: closed-bounded

## Question

Does a saved Studio project produce a durable, inspectable snapshot record that
can be read after reload without treating the snapshot as a source-file or
release artifact?

## Sources

- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: IDBTransaction](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction)
- [MDN: IDBObjectStore.getAll](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/getAll)
- [W3C: Indexed Database API 3.0](https://w3c.github.io/IndexedDB/)

## Findings

- IndexedDB gives the snapshot path asynchronous transactions and structured
  clone storage. The browser gate reads the `snapshots` object store directly;
  it does not infer durability from an in-memory return value.
- The project save path already creates `StudioProjectSnapshot/v1` for local
  reopen identity. DA32-022 keeps that identity record and serializes the
  verified snapshot into a separate `StudioIndexedDbSnapshot/v1` record keyed
  by project id.
- The durable record stores bounded metadata plus a JSON payload. It does not
  store source folder bytes, ZIP contents, decoded textures, or a release
  package. Those larger and higher-risk paths stay separate.
- Backend diagnostics distinguish IndexedDB authority from memory fallback.
  A failed IndexedDB write does not claim persistence; the App reports the
  fallback and the retry action reopens both project and snapshot stores.

## Decision

Keep `StudioProjectStore/v1` as project-manifest authority. Use
`StudioIndexedDbSnapshot/v1` as the durable saved-project snapshot channel.
Keep `ProjectStorage` and `StudioProjectSnapshot` local records for fast UI
boot and reopen identity, with explicit fallback wording when IndexedDB is
unavailable.

## Implementation

- `src/app/StudioIndexedDbSnapshot.ts` now owns database constants, backend
  diagnostics, open/retry behavior, and failover state for snapshots and
  source-write intents.
- `src/app/App.ts` awaits snapshot persistence after an authoritative project
  save, exposes `studioSnapshotStorage`, and retries both stores from the
  existing recovery action.
- `src/app/ProjectSnapshotBridge.ts` returns the snapshot even when the small
  local identity write fails, so the durable path can still report its own
  result.
- `scripts/qa_browser_gate_da32_022_studio_snapshot.cjs` covers desktop,
  mobile, direct object-store readback, reload survival, no-IndexedDB fallback,
  overflow, and console/page errors.

## Evidence

- Implementation commit: `14df21ef`.
- Browser subject: `14df21ef`, clean tree, `provisional: false`.
- Browser result: `ok: true`; desktop `1440x900`, mobile `390x844`, and
  no-IndexedDB fallback; zero unexpected console/page errors.
- Focused tests: 12/12 passed. TypeScript 7 typecheck passed.
- Report: `docs/evidence/da32/da32-022-studio-snapshot-browser-gate.json`.

## Claim ceiling

Allowed: named browser durable snapshot record, revision/payload readback,
reload survival, backend diagnostics, and named fallback behavior.

Open: live source-write intent replay, quota and eviction recovery, permission
repair, large binary source blobs, multi-file transactions, physical browser
coverage, release authority, and full MUGEN/IKEMEN Studio parity.
