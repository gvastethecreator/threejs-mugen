# Project Storage Conflict Boundary

Date: 2026-07-13

## Closure

Studio project saves now carry the revision that the current page opened. The
browser-local storage service rejects a save when another same-origin context
has already advanced that project revision, without replacing the remote
manifest. The Studio app also listens for the `storage` event, refreshes the
recent-project index, records the external revision in the diagnostics bridge,
and cancels a pending autosave while the mismatch is unresolved.

The browser smoke opens the same authored project in two pages, proves a clean
external update, proves a second update while local edits are dirty, and proves
that the stale page cannot overwrite the remote name.

## Evidence

- Focused storage/autosave/navigation/conflict check: `13/13` tests passed.
- Full Vitest: `188/188` files, `1974/1974` tests passed.
- TypeScript 7 typecheck: passed.
- Boundary check: passed.
- Production build: passed; JS output `1,671.04 kB` minified (`419.78 kB`
  gzip), with the existing large-chunk advisory.
- Runtime traces: `581/581` artifacts passed (`547` required, `34` optional),
  with no skipped optional fixtures.
- Playwright smoke: passed in `198.7s`; the two-page conflict proof recorded
  baseline revision `2`, remote revisions `3` and `4`, paused autosave, and a
  stale-save rejection that preserved remote revision `4` and its name.

The decision remains grounded in [MDN `localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage),
[MDN `storage` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event),
and the [WHATWG Web Storage specification](https://html.spec.whatwg.org/multipage/webstorage.html).

## Claim Ceiling

Allowed claim: same-origin external revision detection and optimistic local
save rejection for the browser-local Studio project index.

Still blocked: conflict presentation and resolution actions, IndexedDB or File
System Access persistence, source writes/reimport, multi-user merge, and full
MUGEN/IKEMEN parity.
