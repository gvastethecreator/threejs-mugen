# Progress Report: Turns Terminal Outcome and Score Ownership

## Delivered

Entry 521 closes the bounded automatic Turns score and terminal boundary. The
runtime now derives side-specific win targets from the opposing roster, keeps
the elimination score owned by the winning side, and publishes the score event
alongside the continuation evidence.

When a healthy standby member exists, the score is committed once after the
handoff, resource reset, and state-5900 transaction. When no replacement
exists, the terminal branch commits the score, marks the round context as
`matchOver`, stops playback, and exposes the terminal winner in `round.match`.

## Official basis

IKEMEN's official start flow derives Turns `matchWins` from the enemy roster,
then `System.matchOver()` compares per-side wins to those targets. The official
post-round path increments the winner from the opposing effective loss and only
continues promotion while the match remains open. Sources are recorded in
`docs/research/2026-07-14-turns-terminal-outcome-score.md`.

## Evidence

- Focal outcome and Playable suite: 206 tests passed.
- TypeScript 7 typecheck: passed.
- `git diff --check`: passed.
- Full suite: 209 test files / 2112 tests passed with `--maxWorkers=4`.
- Build: passed with 289 modules; the existing large JavaScript chunk warning
  remains visible (1,778.39 kB / 446.45 kB gzip).
- Boundaries and CSS budget: passed. CSS budget stayed at 324085/536051 bytes,
  1519/2364 rules, zero duplicate selector keys, and zero exact duplicates.
- Trace corpus: 600/600 artifacts passed (566 required / 34 optional), with no
  failed artifacts or skipped optional fixtures.
- Playwright core smoke: passed in
  `.scratch/qa/qa-smoke-turns-terminal-outcome-score-core-rerun/` after a
  258.8-second run. Runtime, MUGEN-lite, Tag, Studio Workbench/Build/Modules,
  source relink, folder recovery, IKEMEN scan, stage/BGCtrl, asset replacement,
  storage conflict, evidence, and debug captures are present. The diagnostic
  reports zero console issues and zero page errors.

## Quality audit

- Score mutation occurs once per successful continuation or terminal side
  defeat; blocked handoffs do not receive a score event.
- Asymmetric roster targets are preserved through `matchWinsBySide` without
  breaking the existing scalar HUD summary.
- Terminal state is visible in the snapshot and playback stops deterministically.

## Claim ceiling

This is bounded in-memory roster score/terminal behavior. It does not claim
exact Lua draw-limit/effective-loss configuration, winpose/motif choreography,
preloaded asset loading, rollback/netplay, or full MUGEN/IKEMEN parity.

## Next

Select the next source-backed runtime slice after terminal Turns adjudication.
The optional Code Fu Man `upper_x` browser oracle was skipped because its
fixture was absent; its deterministic trace remains the available evidence.
Exact Lua draw-limit/effective-loss behavior is the next nearby Turns risk.
