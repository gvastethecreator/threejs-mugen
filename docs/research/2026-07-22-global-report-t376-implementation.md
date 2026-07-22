# Global Report: T376 Root OverrideClsn RedirectID

Date: 2026-07-22

## Runtime

T376 closes the current root OverrideClsn RedirectID reset gap in `865af29b`.
Dynamic caller group, index, and rectangle values now materialize before a
verified target write. A later root receives the override after its one-frame
collision reset, and the trace records the resulting destination hurt-box
count.

## Studio and presentation

No Studio, editor, or renderer surface changed. Browser evidence is not
applicable to this runtime-only slice.

## Verification state

- Focused collision-override, imported-match, and trace coverage: `3/3` files
  and `933/933` tests pass.
- Diff hygiene passed before the feature commit.
- TypeScript, complete Vitest, trace aggregate, build, and boundary checks are
  deliberately deferred until several runtime slices share one checkpoint.

## Global claim ceiling

This report does not change compatibility scores or claim full-port progress.
It records bounded current root OverrideClsn RedirectID behavior only. Exact
collision geometry, source scheduler order, Helpers, nested ownership,
hitpause/reset parity, renderer parity, rollback/netplay, upstream
differentials, and full MUGEN/IKEMEN parity remain open.
