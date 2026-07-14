# Report: stage quality checkpoint

## Result

Entry 534 audits the accumulated BGCtrl timing, Enabled animation-clock, and
stateful motion cuts. The repository remains green across native regression,
TypeScript 7, production build, architecture/CSS hygiene, runtime trace
artifacts, and the official browser stage route.

## Verification

- Native: 211 test files / 2134 tests passed.
- TypeScript 7: `pnpm typecheck` passed.
- Build: 289 modules; JS gzip 448.04 kB and CSS gzip 36.76 kB. The existing
  large-chunk advisory remains non-blocking.
- Boundaries and CSS budget passed; CSS totals are 324085 bytes / 1519 rules,
  zero duplicate selector keys, and zero shadowed rules.
- Trace: 600/600 passed, 566 required / 34 optional, skipped `[]`.
- Official stage browser: Training Room loaded with DEF/SFF, 2 decoded sprites,
  2 rendered/tiled backgrounds, desktop/mobile nonblank canvases, no overflow,
  and zero console/page errors.

## Audit note

The first trace run timed out at the five-minute shell limit. The rerun used a
fifteen-minute window and passed in 294.5s; no code failure was observed.

## Claim ceiling

No score movement. The result validates bounded stage compatibility evidence,
not full BGCtrl, stage, MUGEN, or IKEMEN parity.

## Next

Select the next independent runtime or Studio slice, keeping exact stage
multi-group state and advanced camera/window/mask behavior outside the current
claim until separately evidenced.
