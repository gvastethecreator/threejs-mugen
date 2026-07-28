# DA32-021 Studio IndexedDB authority

Date: 2026-07-28  
Type: product storage and browser evidence  
Status: closed-bounded

## Question

Can the Studio project index use a versioned IndexedDB object store as its
browser authority while keeping the existing localStorage payload useful for
fast UI boot, migration, and cross-tab conflict signals?

## Sources

- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: IDBTransaction](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction)
- [MDN: IDBObjectStore.getAll](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/getAll)
- [W3C: Indexed Database API 3.0](https://w3c.github.io/IndexedDB/)

## Findings

- IndexedDB stores structured clone values through asynchronous transactions.
  It fits the manifest index better than a string-only Web Storage record and
  keeps storage work off the synchronous UI path.
- A read/write transaction can read the current entries, compare the expected
  revision, and replace the bounded list before completion. This gives the
  project save path an optimistic conflict check across same-origin pages.
- Browser quota and eviction rules vary by browser. The gate therefore proves
  the authority and transaction path only; it does not close quota recovery or
  large source-blob persistence.
- The existing `ProjectStorage` v1 payload remains useful during startup. It
  gives the UI an immediate recents list and becomes the migration input when
  the IndexedDB store has no entries.

## Decision

Implement `StudioProjectStore/v1` in the separate
`mugen-web-sandbox-projects` database with a `projects` object store. Store each
project as a versioned record keyed by `entry.id`. Keep `ProjectStorage` as the
local cache and mirror successful authority reads and writes into it. Retain
the storage event listener as a cache-change signal for same-origin pages.

When IndexedDB is unavailable or fails, use the local cache for the current
session and expose that fallback in the App diagnostics. A save still writes
the existing local index so a browser restart does not silently discard the
project. The fallback remains a lower claim ceiling than persistent IndexedDB.

## Implementation

- `src/app/StudioProjectStore.ts` owns schema, database opening, bounded reads,
  atomic revision checks, memory fallback, and diagnostics.
- `src/app/App.ts` hydrates authority data after the first UI render, migrates
  an existing cache, uses authority data for save/open/reload/copy flows, and
  exposes `projectStorageBackend` plus `studioStorage` in the QA bridge. A
  visible fallback status and retry action keep storage failures inspectable.
- `src/app/ProjectStorage.ts` adds an exact cache replacement helper without
  changing the authority revision.
- `scripts/qa_browser_gate_da32_021_studio_storage.cjs` uses the real browser
  IndexedDB API and covers desktop/mobile save, direct record read, mirror,
  reload, reopen, and a two-page revision conflict.

## Evidence

- Subject: `c95c871a`, clean tree, `provisional: false`.
- Browser result: `ok: true`, desktop `1440x900`, mobile `390x844`, and a
  no-IndexedDB fallback case, zero unexpected console/page errors.
- Focused tests: `ProjectStorage` and `StudioProjectStore`, 10/10 passed.
- TypeScript 7 typecheck passed.

## Claim ceiling

Allowed: named browser IndexedDB project authority, local cache mirroring,
reload/reopen, the named desktop revision conflict route, and the visible
no-IndexedDB cache fallback/retry route.

Open: quota and eviction recovery, storage permission failure UX, source
folder/file blobs, all browser implementations, screen-reader flow, public
release, and full MUGEN/IKEMEN authoring parity.
