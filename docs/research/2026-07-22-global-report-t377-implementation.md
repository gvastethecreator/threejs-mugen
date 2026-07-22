# Global Report: T377 Root HitBy/NotHitBy RedirectID

Date: 2026-07-22

## Runtime

T377 closes the current root HitBy/NotHitBy RedirectID gap in `37ab9baf`.
Both controller types now resolve a verified root under explicit `ikemen-go`.
Dynamic legacy-slot durations materialize with the caller before the receiver
uses the existing hit-defense boundary. The required trace proves a redirected
NotHitBy denies a matching P1 contact on P2.

## Studio and presentation

No Studio, editor, or renderer surface changed. Browser evidence is not
applicable to this runtime-only slice.

## Verification state

- Focused compiler, hit-defense, imported-match, and trace coverage: `4/4`
  files and `994/994` tests pass.
- Diff hygiene passed before the feature commit.
- TypeScript, complete Vitest, trace aggregate, build, and boundary checks are
  deliberately deferred until several runtime slices share one checkpoint.

## Global claim ceiling

This report does not change compatibility scores or claim full-port progress.
It records only current root legacy HitBy/NotHitBy RedirectID behavior. New
IKEMEN syntax, exact slot timing, source scheduling, Helpers, teams,
hitpause, rollback/netplay, upstream differentials, and full parity remain
open.
