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

- Focal draw/outcome/decision/continuation/Playable suite: 222 tests passed.
- TypeScript 7 typecheck: passed.
- `git diff --check`: passed.
- Code commit: `91f19a89 feat: implement Turns draw effective-loss boundary`.
- Broad suite, trace corpus, build, boundaries, CSS budget, and Playwright
  smoke remain the closeout gate for this entry.

## Quality audit

- A prior draw limit is applied only to the next simultaneous draw; it does not
  contaminate a later decisive KO.
- A normal DKO has no score owner, no reserve handoff, and a deterministic next
  round.
- A terminal double effective-loss reports draw state with no winner id.
- Existing scalar `matchWins` and generic single/tag outcome behavior remain
  compatible when no draw limit is configured.

## Claim ceiling

This is bounded source-backed draw/effective-loss behavior for automatic Turns.
It does not claim exact motif/winpose timing, every Lua mutation path,
rollback/netplay, preloaded loading, or full MUGEN/IKEMEN parity.

## Next

Run the broad quality gate and browser smoke, then select the next independent
source-backed runtime slice. The optional Code Fu Man `upper_x` browser oracle
remains separate until its fixture is available.
