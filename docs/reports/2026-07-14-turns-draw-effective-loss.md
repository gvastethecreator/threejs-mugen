# Progress Report: Turns draw and effective loss

## Delivered

Entry 522 closes the next Turns compatibility boundary. A simultaneous KO no
longer promotes reserves by default: when no draw limit is active, the runtime
records a neutral draw and starts the ordinary next round. When the configured
per-side limit is reached, the runtime exposes effective loss, awards the
opposing side, and limits replacement eligibility to the affected side.

Double effective loss is represented as a terminal draw when both score
thresholds are reached. The snapshot and message expose `Match over - Draw`
without inventing a winning side.

## Official basis

The behavior follows IKEMEN's side-scoped `maxDrawsReached`, Lua
`setMatchMaxDrawGames`, effective-loss calculation, post-round score update,
and `runNextRound` branch. Full links and line anchors are recorded in
`docs/research/2026-07-14-turns-draw-effective-loss.md`.

## Evidence

- Focal draw/outcome/decision/continuation/Playable suite: 230 tests passed
  after qualifying the bilateral handoff regression with explicit effective
  loss input.
- Full suite: 209 test files / 2118 tests passed with
  `pnpm test -- --maxWorkers=4`.
- TypeScript 7 typecheck and production build passed: 289 modules, 1,781.24
  kB JavaScript output / 447.18 kB gzip. The existing large-chunk warning
  remains a packaging follow-up, not a runtime failure.
- Boundaries and CSS budget passed: 324085/536051 bytes, 1519/2364 rules,
  zero duplicate selector keys, zero exact duplicate rules, and zero fully
  shadowed cross-file rules.
- Aggregate trace gate passed 600/600 artifacts: 566 required and 34 optional,
  with zero failed artifacts.
- Browser smoke passed at
  `.scratch/qa/qa-smoke-turns-draw-effective-loss-dev/`: 64 screenshot
  artifacts, zero console issues, zero page errors, and all Runtime, Tag, and
  Studio routes green. The optional Code Fu Man fixture was skipped because it
  is not present.
- `git diff --check` passed.
- Code commits: `91f19a89 feat: implement Turns draw effective-loss
  boundary` and `235a8f58 test: qualify bilateral Turns effective loss`.

## Quality audit

- A prior draw limit is applied only to the next simultaneous draw; it does not
  contaminate a later decisive KO.
- A normal DKO has no score owner, no reserve handoff, and a deterministic next
  round.
- A terminal double effective-loss reports draw state with no winner id.
- Existing scalar `matchWins` and generic single/tag outcome behavior remain
  compatible when no draw limit is configured.
- A cold self-started Vite smoke hit the runner's 30-second navigation timeout
  while transforming the large development graph; a warmed external Vite
  graph then passed the complete smoke. Production build and preview remain
  green.

## Claim ceiling

This is bounded source-backed draw/effective-loss behavior for automatic Turns.
It does not claim exact motif/winpose timing, every Lua mutation path,
rollback/netplay, preloaded loading, or full MUGEN/IKEMEN parity.

## Next

Entry 522 is closed with broad gates and browser evidence. Select the next
independent source-backed runtime slice. The optional Code Fu Man `upper_x`
browser oracle remains separate until its fixture is available.
