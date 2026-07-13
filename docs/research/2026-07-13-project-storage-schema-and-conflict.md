# Project Storage Schema And Conflict Boundary

Date: 2026-07-13

## Question

Can the current browser-local Studio project index move from an implicit
`project-index/v0` payload to an explicit versioned payload without claiming
multi-tab conflict resolution yet?

## Answer

Yes. Keep the existing origin-scoped `localStorage` key, read both the legacy
`project-index/v0` payload and the new `project-index/v1` payload, normalize
legacy entries with an initial revision, and write the migrated index back as
v1. This is a compatibility migration, not conflict resolution.

## Sources

- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: Window storage event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)
- [WHATWG HTML Standard: Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html)

## Findings

- `localStorage` persists string data for the document origin across browser
  sessions; protocol and origin boundaries matter. `file:` URL behavior is not
  a stable contract, so Studio should keep using the dev/production origin.
- A `storage` event reaches other same-origin browsing contexts, not the
  document that performed the write. It is therefore a future signal for
  external edits, not a substitute for a revision check before autosave.
- The current implementation silently discards an index whose schema is not
  exactly v0. That makes future evolution indistinguishable from data loss.
- A v1 entry revision can establish the identity needed for optimistic
  conflict detection later, while keeping this slice independent from UI
  prompts or source-file writes.

## Decision

Implement v0 -> v1 read/migrate/write behavior in `ProjectStorage`, assign
revision `1` to migrated entries, increment revisions on replacement, and add
tests for migration, malformed entries, and revision increments. Defer
`storage` event handling, conflict UI, and IndexedDB/File System Access until a
separate transaction-boundary slice can prove recovery behavior.

## Uncertainty

`localStorage` quota/security failures remain runtime errors on explicit save;
this migration must not turn a read-only refresh into a hard failure when the
browser refuses the migration write. The next conflict slice must test this
failure path and external-tab edits through a real browser context.
