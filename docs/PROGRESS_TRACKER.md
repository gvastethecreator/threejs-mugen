# Progress Tracker

## Daily roadmap report - 2026-07-15 Entry 551

- Entry 551 and 612/612 traces are the committed evidence frontier. Active
  TargetLifeAdd now has a required imported RedirectID route with checksum
  `74f63e7d`.
- Full affected runtime suites pass 3 files / 860 tests; TypeScript 7, trace
  syntax, and `git diff --check` pass.
- Next runtime cut: State -1 TargetLifeAdd scheduling. Helpers, projectiles,
  teams, exact multi-target ordering, persistence, rollback/netplay,
  presentation, and full parity remain blocked.
- No browser smoke or score movement claimed; no visible renderer or Studio
  path changed.
- See `docs/reports/2026-07-15-target-life-redirectid-v1-closeout.md`.

## Global report - 2026-07-15 TargetLifeAdd RedirectID v1 closeout

- Imported active-CNS TargetLifeAdd RedirectID now routes target-memory life
  mutation through a live root PlayerID destination while the caller retains
  typed target operation context.
- Required trace proves PlayerID 57, target id 77, both target links, final
  p1/p2 life `980/1000`, target count `1` each, and checksum `74f63e7d`.
- Verification passes 3 files / 860 tests, TypeScript 7, trace-script syntax,
  `git diff --check`, and full `qa:trace` 612/612 (578 required / 34 optional /
  0 skipped).
- State-entry TargetLifeAdd, helper/projectile/team ownership, exact
  multi-target ordering, persistence, rollback/netplay, presentation, score,
  and full parity remain blocked.
- See docs/reports/2026-07-15-target-life-redirectid-v1-closeout.md and
  docs/research/2026-07-15-target-life-redirectid-v1.md.

## Daily roadmap report - 2026-07-15 Entry 550

- Entry 550 and 611/611 traces are the committed evidence frontier. State -1
  TargetPowerAdd now has a required imported RedirectID route with checksum
  `e531fcdc`.
- Entries 539-542 close the old StudioSemanticDraft, PackageAnalysis/v0, and
  AssetProvenance/v2 selectors. No score changes in this planning pass.
- Next evidence cuts are a materialized corpus snapshot, target-family dispatch
  seam, atomic Turns plan, phase-aware RoundState, evidence-backed Studio greens,
  one complete asset release record, and a real scanner consumer.
- `CONTEXT.md` is a known stale cursor outside this automation's allowed write
  surface.
- See `docs/reports/2026-07-15-target-power-state-entry-redirectid-v1-closeout.md`.

## Global report - 2026-07-15 TargetPowerAdd state-entry RedirectID v1 closeout

- Imported State -1 TargetPowerAdd RedirectID now routes target-memory power
  mutation through a live root PlayerID destination while the caller retains
  value and RedirectID expression ownership.
- The required trace proves PlayerID 56, target id 77, both target links, one
  target controller and operation, final p1/p2 power 35/110, and checksum
  `e531fcdc`.
- Verification passes 3 files / 814 tests, TypeScript 7, trace-script syntax,
  `git diff --check`, and full `qa:trace` 611/611 (577 required / 34
  optional / 0 skipped). No browser smoke or score movement.
- Helpers, projectiles, neutral identity, team/simul targets, other Target*
  families, persistent timing, rollback/netplay, presentation, and full
  parity remain blocked.
- See docs/reports/2026-07-15-target-power-state-entry-redirectid-v1-closeout.md
  and docs/research/2026-07-15-target-power-state-entry-redirectid-v1.md.

## Global report - 2026-07-15 TargetPowerAdd RedirectID v1 closeout

- Root-only IKEMEN TargetPowerAdd RedirectID now routes active CNS target
  power mutation through the live PlayerID destination's target memory.
- The caller retains ownership of the controller value and RedirectID
  expression context; missing RedirectID stays local, while invalid,
  unavailable, and legacy routes fail closed before mutation.
- Verification passes 3 focused files / 855 tests, TypeScript 7, trace-script
  syntax, git diff --check, and full qa:trace 610/610 (576 required / 34
  optional / 0 skipped). Required checksum: bf1cb5ce.
- State-entry controllers, helpers, projectiles, neutral identity,
  aggregate/team target semantics, persistent timing, rollback/netplay,
  presentation, and full parity remain blocked. No browser smoke or score
  movement.
- See docs/reports/2026-07-15-target-power-redirectid-v1-closeout.md and
  docs/research/2026-07-15-target-power-redirectid-v1.md.

## Global report - 2026-07-15 CtrlSet RedirectID v1 closeout

- Root-only IKEMEN `CtrlSet` RedirectID now routes active CNS and state-entry
  control mutation to the live PlayerID destination while the caller keeps its
  own control and resource ownership.
- Missing RedirectID remains local. Empty, malformed, negative, missing,
  disabled, destroyed, and legacy-profile targets fail closed before mutation;
  dynamic value and RedirectID expression evaluation remain caller-owned.
- Verification passes 3 focused files / 852 tests, TypeScript 7, trace-script
  syntax, `git diff --check`, and full `qa:trace` 609/609 (575 required / 34
  optional / 0 skipped). Required checksums: `9c62ad5b` and `2f21266e`.
- Helpers, projectiles, neutral identity, aggregate/team control, persistent
  controller timing, rollback/netplay, presentation, and full parity remain
  blocked. No browser smoke or score movement.
- See `docs/reports/2026-07-15-control-redirectid-v1-closeout.md` and
  `docs/research/2026-07-15-control-redirectid-v1.md`.

## Global report - 2026-07-15 auxiliary resource RedirectID v1 closeout

- Root-only IKEMEN `RedirectID` now covers GuardPointsAdd/Set,
  DizzyPointsAdd/Set, and RedLifeAdd/Set in active CNS and state-entry setup,
  in addition to the basic life/power resource slice.
- Dynamic values and `absolute` remain caller-owned; omitted RedirectID stays
  local, while empty/malformed/negative/missing/disabled/destroyed/legacy
  routes fail closed before resource mutation.
- Verification passes 3 focused files / 848 tests, TypeScript 7, trace syntax,
  `git diff --check`, and full `qa:trace` 607/607 (573 required / 34 optional /
  0 skipped). Required checksums: `79f60677` and `0e280069`.
- CtrlSet, helpers, projectiles, neutral identity, shared/team banks, exact
  red-life recovery, KO/persistence/rollback/netplay, and full parity remain
  blocked. No browser smoke or score movement.
- See `docs/reports/2026-07-15-resource-redirectid-auxiliary-v1-closeout.md`
  and `docs/research/2026-07-15-resource-redirectid-auxiliary-v1.md`.

## Global report - 2026-07-15 root resource RedirectID v0 closeout

- IKEMEN root `RedirectID` now mutates `LifeAdd`, `LifeSet`, `PowerAdd`, and
  `PowerSet` destinations through the live PlayerID registry in active CNS and
  state-entry setup paths.
- Dynamic resource values resolve against the imported caller before dispatch;
  malformed, negative, missing, and legacy-profile routes fail closed, with
  imported telemetry preserved for non-imported targets.
- Verification passes 3 focused files / 843 tests, TypeScript 7, trace syntax,
  `git diff --check`, and full `qa:trace` 605/605 (571 required / 34 optional /
  0 skipped). Required checksums: `a10bfbff` and `6adde9e8`.
- Helpers, projectiles, neutral identity, shared banks, auxiliary resource
  families, exact `LifeAdd absolute`, KO/persistence/rollback/netplay, and full
  parity remain blocked. No browser smoke or score movement.
- See `docs/reports/2026-07-15-resource-redirectid-v0-closeout.md` and
  `docs/research/2026-07-15-resource-redirectid-v0.md`.

## Global report - 2026-07-15 PlayerID root-roster trigger v1 closeout

- Active expression contexts now project the full live root roster for bounded
  `PlayerID(id), trigger` reads while retaining the caller-bound identity
  resolver and legacy-profile fail-closed behavior.
- A required imported tag trace proves standby P3 reads P1 and reaches state
  2794 with reserve/effective-control evidence; `Enemy` and `EnemyNear` keep
  their existing opponent projection.
- Verification passes 7 focused files / 845 tests, TypeScript 7, trace-script
  syntax, `git diff --check`, and `qa:trace` 603/603 (569 required / 34
  optional / 0 skipped). No browser smoke was needed and no score moved.
- Helper/neutral identity, generic `RedirectID` mutation, exact tag
  scheduling/input ownership, lifecycle promotion, and full MUGEN/IKEMEN parity
  remain blocked.
- See `docs/reports/2026-07-15-playerid-root-roster-trigger-v1-closeout.md`
  and `docs/research/2026-07-15-playerid-root-roster-trigger-v1.md`.

## Global report - 2026-07-15 PlayerID trigger redirection v0 closeout

- Runtime/compiler support now resolves static and dynamic non-negative
  `PlayerID(id), trigger` reads through the live root identity registry.
- The resolver is present in active, paused, standby, and state-entry
  controller contexts; legacy profiles fail closed. A required imported trace
  proves the opposing-root state route.
- Verification passes 7 focused files / 685 tests, TypeScript 7, trace-script
  syntax, `git diff --check`, and `qa:trace` 602/602 (568 required / 34
  optional / 0 skipped). No browser smoke was needed and no score moved.
- Helper/neutral identity, generic controller `RedirectID` mutation, exact
  roster lifecycle, input/combat/effect ownership, and full MUGEN/IKEMEN parity
  remain blocked.
- See `docs/reports/2026-07-15-playerid-trigger-redirection-v0-closeout.md`
  and `docs/research/2026-07-15-playerid-trigger-redirection-v0.md`.

## Global report - 2026-07-15 Identity and roster redirection v0 closeout

- Runtime expression contexts now project bounded `Partner`/`Enemy` rosters
  from `RuntimeRootSelection/v0`, with stable `Enemy` order kept distinct from
  nearest `EnemyNear` order.
- `NumPartner`, `P3Name`, `P4Name`, dynamic non-negative indices, compiler
  support scanning, typed invalid-index diagnostics, and fail-closed missing
  destinations are covered by focused tests and a required synthetic trace.
- Verification passes 4 focused files / 95 tests, TypeScript 7, trace-script
  syntax, new Enemy trace, and full `qa:trace` 601/601 (567 required / 34
  optional / 0 skipped). No browser smoke was needed and no score moved.
- Exact Simul/Tag/P3-P8 lifecycle, helper/neutral/playerid redirects,
  input/combat/effect ownership, and full MUGEN/IKEMEN parity remain blocked.
- See `docs/reports/2026-07-15-identity-redirection-v0-closeout.md` and
  `docs/research/2026-07-15-identity-redirection-v0.md`.

## Global report - 2026-07-14 AssetProvenance/v2 closeout

- Studio now emits deterministic, redacted `asset-provenance/v2` records with
  explicit license state, input/output digests, ordered transforms, config
  digests, QA links, and safe v1 migration.
- Build `asset-validation` blocks release readiness for incomplete legal or
  technical evidence. ZIP export remains available only as a diagnostic-only
  snapshot and reports the blocking count.
- Focal coverage passes 1 file / 8 tests, TypeScript 7, smoke-script syntax,
  and the focused browser/ZIP gate: 6 records, 6 blocked, 12 transforms, zero
  path leaks, and no browser errors. The broad smoke wrapper timed out later
  and is not counted as global smoke green.
- No score movement. Automatic license discovery, legal approval, full package
  parity, and runtime/IKEMEN claims remain blocked.
- See `docs/reports/2026-07-14-asset-provenance-v2-closeout.md` and
  `docs/research/2026-07-14-asset-provenance-v2.md`.

## Global report - 2026-07-14 PackageAnalysis/v0 closeout

- I1 now has a versioned VFS/package report for character, stage, system, and
  screenpack inputs. Findings preserve source path/line, dependency, profile or
  version, and `recognized` / `unsupported` / `unknown` status.
- Mixed, stage-only, and system-only fixtures pass the same deterministic
  checksum-protected report path: 1 focal file / 4 tests; TypeScript 7 passes.
- `ikemen-go-scan` remains explicitly scanner-only. No runtime, screenpack
  parity, license, rollback, netplay, or score claim moved.
- See `docs/reports/2026-07-14-package-analysis-v0-closeout.md` and
  `docs/research/2026-07-14-package-analysis-v0.md`.

## Global report - 2026-07-14 StudioSemanticDraft/v0 closeout

- The official KFM Studio browser route proves 58 states / 318 controllers
  compiled, invalid semantic input blocked, repaired CNS accepted, explicit
  reimport completed, and the final draft clean with matched source identity.
- Accumulated verification passes 212 test files / 2145 tests, TypeScript 7,
  290-module build, boundaries, CSS budget, `qa:trace` 600/600, and
  `qa:stage` desktop/mobile browser evidence.
- The complete smoke gate remains open: automatic startup timed out once and a
  stable-server rerun stopped at the pre-existing MUGEN Lite attack-frame
  route before Studio. This does not lower the Studio claim, but it prevents a
  global smoke-green report.
- No score movement. ZIP rewrite, create/delete, watch/merge, rollback, and
  broad structured editors remain blocked. Next candidates: `PackageAnalysis/v0`
  or `AssetProvenance/v2`.
- See `docs/reports/2026-07-14-studio-semantic-draft-v0-closeout.md`.

## Global report - 2026-07-14 StudioSemanticDraft/v0

- Studio source editing now preflights one CNS/ST document in memory through
  parsing and Runtime IR compilation before a write stream can open.
- Invalid syntax and unsupported formats keep a repairable editor state but
  disable Save; source fingerprint or project revision drift becomes stale and
  blocks editing until explicit recovery.
- The write path re-requests permission, re-fingerprints the physical folder
  immediately before `createWritable()`, explicitly reimports, and verifies the
  final edited-document digest after close.
- Focal coverage passes 1 file / 5 tests and TypeScript 7 passes. Broad native,
  build, and browser evidence is accumulated at the next closeout.
- No score movement. ZIP rewrite, create/delete, watch/merge, post-close
  rollback, and broad structured editors remain outside the claim.
- See `docs/research/2026-07-14-studio-semantic-draft-v0.md` and
  `docs/reports/2026-07-14-studio-semantic-draft-v0.md`.

## Global report - 2026-07-14 Stage quality checkpoint Entry 538

- Entries 535-537 pass the accumulated closeout: native 211/2140, focal stage
  4/28, TypeScript 7, 289-module build, boundaries, CSS budget, official stage
  browser, and trace 600/600 (566 required / 34 optional / 0 skipped).
- Browser evidence keeps Training Room at 2 decoded sprites and 2 rendered
  backgrounds with nonblank desktop/mobile canvases and zero page/console
  issues. The existing large-chunk advisory remains tracked.
- No score movement. Exact parallax, camera/window/mask, shared BGCtrl state,
  localcoord normalization, and full stage parity remain outside the claim.
- See `docs/research/2026-07-14-stage-quality-checkpoint-entry-538.md` and
  `docs/reports/2026-07-14-stage-quality-checkpoint-entry-538.md`.

## Global report - 2026-07-14 Legacy stage vertical scale

- Entry 537 preserves and projects deprecated `yscalestart`/`yscaledelta`
  values with the documented reciprocal formula when general scale is absent.
- Focal stage/parser/report coverage passes 3 files / 25 tests and TypeScript 7
  passes. Exact parallax mesh deformation remains outside the claim.
- No score movement. Legacy `xscale`, camera/window/mask behavior,
  localcoord normalization, and full stage parity remain open.
- See `docs/research/2026-07-14-stage-legacy-vertical-scale.md` and
  `docs/reports/2026-07-14-stage-legacy-vertical-scale.md`.

## Global report - 2026-07-14 Stage positionlink

- Entry 536 preserves typed `positionlink` offsets and inherited delta through
  import, the compatibility report, Studio details, and same-tick stage
  projection. Linked layers follow bounded target motion without mutable
  renderer state.
- Focal stage/parser/report coverage passes 3 files / 23 tests and TypeScript 7
  passes after the final Studio formatting helper addition.
- No score movement. Exact shared BGCtrl state, all-target ordering, parallax,
  camera/window/mask behavior, and full stage parity remain open.
- See `docs/research/2026-07-14-stage-positionlink.md` and
  `docs/reports/2026-07-14-stage-positionlink.md`.

## Global report - 2026-07-14 Stage layer scaling

- Entry 535 parses and projects `scalestart`, `scaledelta`, and scalar-or-pair
  `zoomdelta` through normal, animated, asset, and placeholder stage layers.
- Focal stage/parser/report coverage passes 3 files / 21 tests and TypeScript 7
  passes. The compatibility report and Studio layer detail expose authored
  scale values.
- No score movement. Exact parallax, legacy scale paths, window/mask zoom,
  camera-anchor/localcoord normalization, and full stage parity remain open.
- See `docs/research/2026-07-14-bg-layer-scaling.md` and
  `docs/reports/2026-07-14-bg-layer-scaling.md`.

## Global report - 2026-07-14 Stage quality checkpoint

- Entry 534 audits the three accumulated BGCtrl slices. Native 211/2134,
  TypeScript 7, build 289 modules, boundaries, CSS budget, official stage
  browser, and trace 600/600 all pass.
- Trace coverage is 566 required / 34 optional with no skipped fixtures. The
  first five-minute shell window timed out; the 15-minute rerun passed in
  294.5s, so no compatibility failure is recorded.
- No score movement. Exact multi-group BGCtrl state, advanced camera/window/mask
  behavior, and full stage parity remain outside the claim.
- Next: select the next independent runtime or Studio slice.
- See `docs/research/2026-07-14-stage-quality-checkpoint-entry-534.md` and
  `docs/reports/2026-07-14-stage-quality-checkpoint-entry-534.md`.

## Global report - 2026-07-14 Stateful BGCtrl motion

- Entry 533 retains imported initial layer velocity and resolves bounded
  authored-order `VelSet`, `VelAdd`, `PosSet`, and `PosAdd` motion from
  immutable stage data.
- Focal stage/parser coverage passes 2 files / 17 tests and TypeScript 7 passes.
- Broad regression, build, trace, and browser gates remain deferred until the
  next accumulated stage quality checkpoint.
- Independent multi-group state, exact pause ordering, zoom/window/mask/parallax
  parity, and full stage parity remain open.
- See `docs/research/2026-07-14-bgctrl-stateful-motion.md` and
  `docs/reports/2026-07-14-bgctrl-stateful-motion.md`.

## Global report - 2026-07-14 BGCtrl Enabled animation clock

- Entry 532 pauses action-backed stage animation while a targeted
  `Enabled = 0` controller is active; `Visible` continues advancing its clock.
- Focused stage projection coverage passes 1 file / 12 tests. TypeScript 7 and
  broad gates stay deferred until the accumulated stage slices are complete.
- Stateful controller motion, multi-group ordering, exact window/zoom/mask
  behavior, and full stage parity remain open.
- See `docs/research/2026-07-14-bgctrl-enabled-animation-clock.md` and
  `docs/reports/2026-07-14-bgctrl-enabled-animation-clock.md`.

## Global report - 2026-07-14 Composed BGCtrl timing

- Entry 531 preserves explicit controller `looptime` and parent
  `BGCtrlDef looptime` independently, then resolves the latest applicable reset
  in the stage projection clock.
- Focused stage/parser coverage passes 2 files / 15 tests. TypeScript 7 and
  broad gates are intentionally deferred to the next implementation batch.
- This is bounded timing evidence only: stateful velocity/position history,
  `Enabled` animation pause, exact window/zoom/mask behavior, and full stage
  parity remain open.
- See `docs/research/2026-07-14-bgctrl-composed-timing.md` and
  `docs/reports/2026-07-14-bgctrl-composed-timing.md`.

## Global report - 2026-07-14 Score-band adjudication

- Entry 530 applies the written `36-55` practical MVP criterion to the
  expanded corpus. Passed local official KFM movement, attack/special, guard,
  get-hit, fall, and recovery traces plus visible compatibility/Studio reports
  satisfy the bounded entry gate.
- Practical MUGEN compatibility moves conservatively from `35` to `36 / 100`,
  the first point inside the band. Private sandbox `65`, MUGEN MVP `20`, full
  MUGEN `10-12`, IKEMEN `6-8`, and Studio `25` remain unchanged.
- This is not public breadth or parity: local optional KFM and optional-private
  Training Room evidence retain their claim ceilings. Scores do not move again
  without a new written criterion and independent evidence.
- Next: select the next source-backed stage/runtime gap.
- See `docs/research/2026-07-14-score-band-adjudication-entry-530.md` and
  `docs/reports/2026-07-14-score-band-adjudication-entry-530.md`.

## Global report - 2026-07-14 Official stage corpus promotion

- Entry 529 extends `CompatibilityCorpus/v0` to index both character and stage
  journeys. The official Training Room route is represented as
  `optional-private`, with its journey schema, package identity, expected
  routes, `stage:*` unsupported density, and evidence references preserved.
- The corpus remains reference-only: no DEF/SFF/readme payload is copied, and
  the parser rejects an unknown journey schema. The promotion is covered by
  4/4 focal tests and TypeScript 7 typecheck.
- Native closeout is green: 211 test files / 2129 tests, typecheck, build,
  boundaries, CSS budget, and 600/600 trace artifacts. The official stage
  browser gate is green at desktop/mobile. Scores remain unchanged.
- Next: adjudicate the written score band, then select the next source-backed
  stage/runtime gap. Full MUGEN/IKEMEN stage parity and commercial
  redistribution remain blocked.
- See `docs/research/2026-07-14-official-stage-corpus-promotion.md` and
  `docs/reports/2026-07-14-official-stage-corpus-promotion.md`.

## Global report - 2026-07-14 Official stage browser compatibility gate

- Entry 528 adds `pnpm qa:stage`, a focused Playwright route that imports the
  external official Training Room sample through the production ZIP input and
  opens the real Studio Stage surface.
- The browser gate passes Training Room DEF/SFF evidence, 2 decoded sprites, 2
  rendered/tiled layers, nonblank desktop/mobile canvases (106/213 sampled
  colors), no horizontal overflow, and zero page/console errors.
- Evidence lives in `.scratch/qa/official-stage-compatibility-browser/`; the
  generated binary is temporary and not committed. Native regression/build/
  boundary closeout is green in Entry 529, and the optional-private corpus
  promotion is recorded there.
- Scores remain unchanged; exact stage parity remains blocked.
- See `docs/research/2026-07-14-official-stage-browser-gate.md` and
  `docs/reports/2026-07-14-official-stage-browser-gate.md`.

## Global report - 2026-07-14 Official stage compatibility journey

- Entry 527 adds `StageCompatibilityJourney/v1` and the official local
  Elecbyte MUGEN 1.1b1 Training Room manifest. The production
  `MugenStageLoader` loads DEF/SFF, `StageCompatibilityReport` records decoded
  and ordered background evidence, and the playable runtime proves the
  `resetBG` round-local clock.
- The package provenance is classified as legal noncommercial sample content;
  no binary asset is copied into the repository. Browser and native gates are
  explicit `not-run`, so the deferred-gate fixture scenario remains `partial`;
  executed browser/native evidence is recorded by Entries 528-529.
- Focal StageJourney/StageReport/StageDefParser/Playable coverage passes 4
  files / 213 tests; TypeScript 7 typecheck passes. Scores remain unchanged.
- Next: keep the route optional-private and adjudicate the written score band;
  exact stage parity remains outside the claim ceiling.
- Sources: [official MUGEN 1.1b1 distribution](https://www.elecbyte.com/mugenfiles/1.1/mugen-1.1b1.zip),
  [Elecbyte 1.1b1 background docs](https://www.elecbyte.com/mugendocs-11b1/bgs.html), and
  [Elecbyte stage tutorial](https://www.elecbyte.com/mugendocs/bg-tut.html).
- See `docs/research/2026-07-14-official-stage-compatibility-journey.md` and
  `docs/reports/2026-07-14-official-stage-compatibility-journey.md`.

## Global report - 2026-07-14 Stage resetBG round clock

- Entry 526 closes a bounded stage lifecycle gap from the official MUGEN stage contract: `StageInfo.resetBG = 1` resets stage animation/BGCtrl time at a real numbered round boundary, while `resetBG = 0` continues the global tick.
- `MugenStageDefinition`, `StageSnapshot`, the runtime presentation bridge, and `AxisRenderer` share explicit `backgroundTick`; Turns continuation keeps the current round clock and full reset returns it to zero.
- Focal parser/stage projection/Playable coverage passes 3 files / 218 tests; TypeScript 7 typecheck passes. Broad regression, build, trace, and browser closeout is deferred until the next implementation batch.
- Scores remain unchanged. Exact BGCtrl timing, stage zoom, window/mask, motif, and complete MUGEN/IKEMEN stage parity remain open. Sources: [Elecbyte 1.1b1 background docs](https://www.elecbyte.com/mugendocs-11b1/bgs.html), [Elecbyte stage tutorial](https://www.elecbyte.com/mugendocs/bg-tut.html), and [Elecbyte 1.1b1 state-controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html).
- See `docs/research/2026-07-14-stage-resetbg-round-clock.md` and `docs/reports/2026-07-14-stage-resetbg-round-clock.md`.

## Global report - 2026-07-14 CompatibilityCorpus/v0

- Entry 525 adds a deterministic `CompatibilityCorpus/v0` index over existing
  journey evidence, with `required-legal`, `portable-legal`, and
  `optional-private` classes.
- The aggregate stores package identity, routes, unsupported-feature density,
  claims, diagnostics, and checksum without copying ZIP or browser payloads.
- Focal 3/3 tests and the broad 210-file / 2125-test suite pass. TypeScript 7,
  build, boundaries, CSS budget, and 600/600 trace artifacts are green.
- Scores remain unchanged. Next: written score-band adjudication, then one
  independent legal stage/package route.
- See `docs/research/2026-07-14-compatibility-corpus-v0.md` and
  `docs/reports/2026-07-14-compatibility-corpus-v0.md`.

## Global report - 2026-07-14 Turns match-wins runtime command

- Entry 524 adds a typed, profile-gated `set-match-wins` command backed by the
  official IKEMEN `setMatchWins(teamSide, wins)` contract.
- The live mutation changes one bounded side target, keeps the aggregate target
  coherent, and closes an already reached positive score.
- Focal verification passes 2 files / 24 tests and TypeScript 7 typecheck.
- Broad verification passes 209 test files / 2122 tests, 289-module build,
  boundaries, CSS budget, and 600/600 trace artifacts. The focused browser
  command probe passes with zero console/page errors; the optional Code Fu Man
  visual fixture remains absent.
- See `docs/research/2026-07-14-turns-match-wins-runtime-command.md` and
  `docs/reports/2026-07-14-turns-match-wins-runtime-command.md`.

## Global report - 2026-07-14 Turns max-draws runtime command

- Entry 523 adds a typed, profile-gated `set-match-max-draws` command backed by
  the official IKEMEN `setMatchMaxDrawGames(teamSide, count)` contract.
- `MatchWorldOptions` now forwards scalar and side-specific initial limits;
  live mutation changes only the selected side and is visible in the outcome
  snapshot.
- Focal verification passes 2 files / 23 tests and TypeScript 7 typecheck; the
  broad verification is shared with Entry 524 above.
- See `docs/research/2026-07-14-turns-max-draws-runtime-command.md` and
  `docs/reports/2026-07-14-turns-max-draws-runtime-command.md`.

## Global report - 2026-07-14 Turns draw and effective loss

- Entry 522 closes the bounded automatic Turns draw boundary. A simultaneous
  KO without an active draw limit records a neutral draw and starts the next
  round; a reached per-side limit exposes effective loss, awards the opposing
  side, and limits reserve replacement to that side.
- Double effective loss can close the match as a draw with no fabricated
  winner. The snapshot includes the configured draw limits and the terminal
  message is `Match over - Draw`.
- Focal outcome/decision/continuation/Playable coverage passes 230 tests and
  TypeScript 7 typecheck passes. The full suite passes 209 test files / 2118
  tests; build, boundaries, CSS budget, and 600/600 trace artifacts are green.
  Runtime/Tag/Studio browser smoke passes with 64 screenshots, zero console
  issues, and zero page errors. The optional Code Fu Man fixture is absent and
  explicitly skipped.
- See `docs/research/2026-07-14-turns-draw-effective-loss.md` and
  `docs/reports/2026-07-14-turns-draw-effective-loss.md`.

## Global report - 2026-07-14 Turns terminal outcome and score ownership

- Entry 521 closes bounded automatic Turns score ownership and terminal
  playback. Side 1 and side 2 targets derive from the opposing live roster;
  successful replacement and terminal side-defeat events each commit one
  winner-owned score event.
- No-replacement side defeat now publishes `matchOver`, terminal winner, and a
  stopped playable loop. Asymmetric targets remain explicit through optional
  `matchWinsBySide` while the scalar HUD summary stays compatible.
- Focal outcome/Playable coverage passes 206 tests and TypeScript 7 typecheck
  passes. The full suite passes 209 files / 2112 tests, the build passes with
  289 modules, boundaries and CSS budget pass, and the trace corpus is 600/600
  (566 required / 34 optional).
- Core Playwright smoke passes under
  `.scratch/qa/qa-smoke-turns-terminal-outcome-score-core-rerun/` with zero
  console issues and page errors across Runtime, Tag, Studio, relink, stage,
  evidence, debug, and storage-conflict flows. The optional Code Fu Man
  browser fixture was absent and explicitly skipped.
- Next runtime risk: official draw-limit/effective-loss semantics.
- See `docs/research/2026-07-14-turns-terminal-outcome-score.md` and
  `docs/reports/2026-07-14-turns-terminal-outcome-score.md`.

## Global report - 2026-07-14 Turns roster and recovery

- Entry 520 extends automatic Turns continuation with the source-backed
  fallback recovery formula from remaining round ticks and an ordered
  `RuntimeTurnsRoster/v0` projection. Repeated `p2 -> p4 -> p6` promotion is
  accepted; promoted active roots are no longer invalid standby candidates.
- Entry 520 passes 209 test files / 2110 tests, TypeScript 7, a 289-module
  build, boundaries, CSS budget, 600/600 traces, and core desktop/mobile plus
  Studio smoke under `.scratch/qa/qa-smoke-turns-roster-recovery-core/`.
- The optional Code Fu Man `upper_x` browser oracle remains a residual risk
  outside this runtime slice. Next runtime audit: terminal Turns outcome and
  score ownership.
- See `docs/research/2026-07-14-turns-roster-recovery.md` and
  `docs/reports/2026-07-14-turns-roster-recovery.md`.

## Global report - 2026-07-14 sequential round context

- Entry 518 closes the bounded per-root round-context gap. The reset transaction
  now preserves the live counter, CNS receives `RoundNo`/`RoundsExisted`/
  `MatchOver`, and an imported two-KO trace publishes rounds 1 -> 2 -> 3.
- Focal round-context/Playable coverage passes 202 tests; the full suite passes
  207 files / 2102 tests with `--maxWorkers=4`. TypeScript 7, build,
  boundaries, CSS budget, and desktop/mobile/Studio smoke pass. The aggregate
  corpus is 600/600 artifacts: 566 required and 34 optional.
  Required artifact: `synthetic-imported-round-context-sequence` (`f2529cc2`).
- Scores remain unchanged. Next runtime gate: automatic Turns decision ->
  handoff -> resource reset -> state 5900 -> continuation.
- See `docs/research/2026-07-14-round-context-sequence.md` and
  `docs/reports/2026-07-14-round-context-sequence.md`.

## Global report - 2026-07-14 match outcome and state 5900

- Entry 517 closes the reserved match-outcome/state-5900 slice. Bounded side
  wins and draws, terminal match-over blocking, imported state-5900 preflight,
  score HUD/control state, and the required trace are implemented.
- Aggregate evidence is 599/599 artifacts: 565 required and 34 optional.
  TypeScript 7, build, boundaries, CSS budget, and desktop/mobile/Studio smoke
  pass. Scores remain unchanged.
- The next runtime gate is atomic 1 -> 2 -> 3 continuity with per-actor
  `RoundsExisted`, then automatic Turns decision -> handoff -> state-5900 ->
  continuation. Exact winpose/motif ownership remains separate.
- See `docs/research/2026-07-14-match-outcome-state-5900.md` and
  `docs/reports/2026-07-14-match-outcome-state-5900.md`.

## Planning report - 2026-07-14 entry-516 reconciliation

- Since the prior automation cutoff, 19 commits advanced the numbered frontier
  to entry 516. Entries 506-516 close guard/dizzy/red-life behavior, LifeShare,
  lifecycle, HUD, and the first post-KO resource reset. The entry declares
  598/598 traces; this planning pass did not re-run gates or move scores.
- Product priority remains `CompatibilityCorpus/v0 -> score-band adjudication
  -> independent legal stage/package`. Documentation is not corpus evidence.
- Match-outcome/state-5900 is now closed as Entry 517. The next runtime risk
  gate is 1 -> 2 -> 3 continuity with per-actor `RoundsExisted`, then automatic
  Turns continuation.
- Studio semantic preflight, provenance v2, package analysis, and later shared
  contract promotion are parallel lanes with independent acceptance gates.
- See
  `docs/research/2026-07-14-match-outcome-state-5900.md`.

## Global report - 2026-07-14 exact red-life round reset

- Entry 516 adds a verified post-KO next-round boundary. The typed reset
  restores life, carries bounded power/guard/dizzy resources, clears red-life,
  preserves variables and match tick continuity, and publishes round 2 through
  `PlayableMatchRuntime`, `MatchWorld`, the toolbar, and command palette.
- The required imported trace proves red-life is nonzero before KO and zero
  after the next-round transition. Focused resource/round/trace coverage passes
  592/592; the Playable/trace set passes 778/778.
- TypeScript 7, build, 598/598 trace artifacts (564 required / 34 optional),
  boundaries, CSS budget, and desktop/mobile/Studio smoke pass. Evidence is in
  `.scratch/qa/qa-smoke-round-redlife/diagnostics.json`.
- Claim ceiling: typed red-life/resource reset only. Match-over adjudication,
  state-5900 choreography, complete variable/map/remap persistence,
  rollback/netplay, and full parity remain separate gates; scores remain
  unchanged.
- See `docs/research/2026-07-14-red-life-round-reset.md` and
  `docs/reports/2026-07-14-red-life-round-reset.md`.

## Global report - 2026-07-14 red-life HUD presentation

- Entry 515 adds a separate recoverable-life meter to solo and IKEMEN team HUD
  paths. Root red-life is forwarded through `RuntimeTeamRoundLifebar/v0` as
  normalized `redLife`/`redLifeRatio`; P2 and mobile layout remain bounded.
- Focused lifebar/match coverage passes 17/17 tests. TypeScript 7, build,
  597/597 trace artifacts, architecture boundaries, CSS budget, and
  desktop/mobile Playwright smoke pass. Evidence is under
  `.scratch/qa/qa-smoke-redlife-hud/`.
- Claim ceiling: runtime-owned red-life presentation only. Exact screenpack,
  motif, animation, round persistence, rollback/netplay, native HUD triggers,
  and full parity remain separate gates. Scores remain unchanged.
- See `docs/research/2026-07-14-red-life-hud.md` and
  `docs/reports/2026-07-14-red-life-hud.md`.

## Global report - 2026-07-14 red-life lifecycle rebind

- Entry 514 closes the bounded imported red-life lifecycle edge. Typed team
  handoff now reconciles the root-only red-life bank immediately; standby and
  active-root changes preserve bank topology; match `reset()` rebinds shared
  value from the representative root.
- Focused lifecycle, handoff, and trace coverage passes 588/588 tests. The
  accumulated gate passes 203 test files / 2082 tests with `--maxWorkers=4`,
  TypeScript 7 typecheck, build, 597/597 trace artifacts, architecture
  boundaries, CSS budget, and desktop/mobile Playwright smoke. Scores remain
  unchanged.
- The unconstrained default Vitest run exposed one byte-level JSZip round-trip
  nondeterminism; the bounded worker command remains the reproducible gate.
  The build keeps the existing large-JS-chunk warning. Smoke evidence is in
  `.scratch/qa/qa-smoke-entry514/diagnostics.json`.
- Claim ceiling: bounded reset/rebind lifecycle only. Exact multi-round
  persistence, native triggers, projectile/Explod/team-helper sharing, HUD,
  rollback/netplay, and full MUGEN/IKEMEN parity remain separate gates.
- See `docs/research/2026-07-14-red-life-lifecycle.md` and
  `docs/reports/2026-07-14-red-life-lifecycle.md`.

## Global report - 2026-07-14 red-life LifeShare root adapter

- Entry 513 closes the bounded imported IKEMEN `TeamLifeShare` red-life route.
  `RuntimeRedLifeShareSystem/v0` owns a separate shared-team bank for root
  actors, mirrors positive mutations only when sharing is enabled, preserves
  local mode, clamps positive values to current life through life max, and
  clears red-life for KO sides.
- Required artifacts
  `synthetic-imported-team-red-life-share`,
  `synthetic-imported-team-red-life-local`, and
  `synthetic-imported-team-red-life-helper` pass. Focal coverage is 611/611
  tests; `git diff --check` is clean. Full corpus regeneration, typecheck,
  build, and repository gates remain intentionally batched.
- Claim ceiling: imported root LifeShare and Helper-local routing only.
  Native red-life triggers, projectile/Explod/team-helper sharing,
  reset/persistence, HUD bars, exact round semantics, rollback/netplay, and
  full parity remain separate gates. Scores remain unchanged.
- See `docs/research/2026-07-14-red-life-lifeshare.md` and
  `docs/reports/2026-07-14-red-life-lifeshare.md`.

## Global report - 2026-07-14 dizzy break transition

- Entry 512 closes the bounded imported direct-hit dizzy break transition.
  A positive-to-zero actor-local dizzy resource now requests the available
  common `StateDizzy` `6565300` / `AnimDizzy` `5300` route after generic get-hit
  resolution.
- The route preserves explicit `p2stateno`, fails closed when the common state
  is unavailable, and does not re-trigger on repeated hits at zero.
- Required artifact `synthetic-imported-dizzy-state` and the focused dizzy
  transition tests pass. Full trace-corpus regeneration and repository gates
  remain intentionally batched for the next accumulated checkpoint.
- Claim ceiling: bounded imported direct-hit transition only. Red-life
  `LifeShare`, dizzy sharing/reset/persistence, HUD, rollback/netplay, and full
  parity remain separate gates.
- See `docs/research/2026-07-14-dizzy-break-transition.md` and
  `docs/reports/2026-07-14-dizzy-break-transition.md`.

## Global report - 2026-07-14 dizzy-points defaults and AttackMulSet

- Entry 511 closes omitted direct HitDef dizzy defaults using authored
  `Default.LifeToDizzyPointsMul` / `Super.LifeToDizzyPointsMul` constants and
  dedicated signed `AttackMulSet.DizzyPoints` scaling before defender
  defence scaling.
- Required artifacts `synthetic-imported-dizzypoints-default` and
  `synthetic-imported-dizzypoints-attack-scale` pass their focused gates.
- Full trace-corpus regeneration and repository gates remain intentionally
  batched for the next accumulated checkpoint.
- Claim ceiling: direct imported HitDef defaults and AttackMulSet scaling only.
  Break transitions, sharing, reset/persistence, HUD, rollback/netplay, and
  full parity remain separate gates.
- See `docs/research/2026-07-14-dizzy-points-defaults-attack-scale.md` and
  `docs/reports/2026-07-14-dizzy-points-defaults-attack-scale.md`.

## Global report - 2026-07-14 dizzy-points suppression

- Entry 510 closes defender-owned `AssertSpecial NoDizzyPointsDamage` for
  explicit direct HitDef `dizzypoints`; guard and explicit resource writes stay
  independent.
- Required artifact `synthetic-imported-dizzypoints-suppression` passes with
  checksum `29e75f2a`; global coverage is 591/591 artifacts, 557 required and
  34 optional. Scores remain unchanged.
- Focal coverage is 23 tests across four files. Full repository gates are
  intentionally batched into the next implementation round.
- Claim ceiling: explicit direct-hit suppression only. Omitted defaults,
  `AttackMulSet DizzyPoints`, break transitions, sharing, reset/persistence,
  HUD, and full parity remain blocked.
- See `docs/research/2026-07-14-dizzy-points-suppression.md` and
  `docs/reports/2026-07-14-dizzy-points-suppression.md`.

## Previous global report - 2026-07-14 dizzy-points runtime

- Entry 509 closes bounded actor-local dizzy points: authored max/life fallback,
  fighter/Helper state, `DizzyPointsAdd`/`DizzyPointsSet`, explicit direct
  HitDef `dizzypoints`, signed scaling, projection, and trace evidence.
- Required artifact `synthetic-imported-dizzypoints` passes with checksum
  `00d3b052`; global coverage is 590/590 artifacts, 556 required and 34
  optional. Scores remain unchanged.
- Claim ceiling: explicit actor-local mutation and projection. Omitted defaults,
  `NoDizzyPointsDamage`, `AttackMulSet DizzyPoints`, break transitions,
  sharing, reset/persistence, HUD, and full parity remain blocked.
- Full gates: 201 files / 2061 tests, TypeScript 7, 280-module build,
  boundaries, CSS QA, and diff check. Browser smoke N/A.
- See `docs/research/2026-07-14-dizzy-points-runtime.md` and
  `docs/reports/2026-07-14-dizzy-points-runtime.md`.

## Previous global report - 2026-07-14 auxiliary resource projection

- Entry 508 is the active implementation cut: explicit IKEMEN snapshots/traces
  publish `RuntimeAuxiliaryResourceProjection/v0` for roots and live Helpers.
- The projection is read-only and outside behavior checksums. It records
  actor-local red-life/guard-point owners and maxima, dizzy-point
  unavailability, suppression status, deterministic ordering, finite clamps,
  and orphan diagnostics; Projectile/Explod actors are excluded.
- Claim ceiling: ownership/value projection only. Dizzy mutation, red-life
  LifeShare, suppression, team/projectile sharing, HUD, reset/persistence,
  rollback/netplay, and full parity remain blocked. Scores remain unchanged.
- Verification: 201 files / 2056 tests, TypeScript 7, 280-module build,
  589/589 traces, boundaries, CSS QA, and diff check all pass. Browser smoke
  is N/A.

## Global report - 2026-07-14 guard-points ownership

- Entry 507 closes explicit direct `HitDef guardpoints` plus actor-local
  `GuardPointsAdd`/`GuardPointsSet`; authored maxima fall back to life and
  signed guard deltas remain visible in the required trace.
- Required artifact `synthetic-imported-guardpoints` passes with checksum
  `b4942998`; global trace coverage is 589/589 artifacts, 555 required and 34
  optional. Scores remain unchanged.
- Claim ceiling: explicit direct guard points and actor-local resource writes.
  Omitted defaults, `NoGuardPointsDamage`, `AttackMulSet`/`TargetGuardPointsAdd`,
  projectile/helper/team sharing, reset, persistence, HUD, and full parity
  remain blocked.
- Full gates: 200 files / 2052 tests, TypeScript 7, 279-module build,
  boundaries, CSS QA, and diff check. Browser smoke N/A: no visual surface
  changed.
- See `docs/research/2026-07-14-guard-points-ownership.md` and
  `docs/reports/2026-07-14-guard-points-ownership.md`.

## Previous global report - 2026-07-14 daily roadmap and architecture audit

- Entry 505 was the committed cursor for this historical audit; its report declares 587/587 traces. The complete 2026-07-13 selected sequence was closed, including M2 bounded adjudication, independent legal character evidence, Studio folder editing, team handoff/lifebar/life-power banks, and Helper-local resources.
- Scores remain 65/35/20/10-12/6-8/25. The next promotion decision requires `CompatibilityCorpus/v0`, not a documentation-only inference.
- Next ordered cuts: corpus -> score adjudication -> independent legal stage/package route. Parallel bounded lanes are Studio semantic draft preflight, auxiliary-resource ownership then red life, and provenance v2.
- Red life may mirror through LifeShare; guard and dizzy remain actor-local. Do not widen `RuntimeTeamResourceBank/v1` beyond life/power.
- See `docs/research/2026-07-14-daily-roadmap-architecture-audit.md`.

## Global report - 2026-07-13 source handle recovery

- Studio `SourceHandle/v0` now separates remembered ZIP handles from project
  manifests, tracks permission/storage/stale/recovery state, and exposes real
  Build Center actions through the diagnostics bridge.
- IndexedDB is used when available; memory fallback is explicitly session-only.
  Changed fingerprints, missing handles, folder recovery, source writes, and
  background reacquire remain blocked.
- This moves the Studio trust-chain lane only. Port and compatibility scores
  remain unchanged until browser recovery evidence and a separate folder/write
  contract are proven.

## Global report - 2026-07-13 daily roadmap and architecture audit

- Current committed truth: numbered backlog maximum 476 declares 576/576 traces, 545 required. Wayfinder 127 is open uncommitted air-guard-landing work and was not validated or claimed here.
- Closed since the last successful planning cutoff: bounded post-KO/`NoKOSlow`, the legal CC0 package/ZIP/loader/trace/browser journey, and active-root admission/contact/priority/reversal/depth/HitOverride/guard breadth.
- Product priority after 127: `CompatibilityJourney/v1`, explicit MUGEN-lite milestone/score adjudication, then an independent legal package or ACT/palette route.
- Architecture risk: global AssertSpecial ownership must be decided before team KO, Helper/Projectile, lifebar, or resource widening.
- Parallel lanes remain Studio source transaction, permission-aware provenance, I1 package analysis, and a real shared contract only after two adapters/consumers prove it. No score movement; no code suite run.

## Previous global report - 2026-07-12 daily roadmap and architecture audit

- Current truth: entry 411 closes Wayfinder 105 plural X/Width body push in the current working tree; its report declares full gates and 543/543 traces. This automation did not re-run them.
- Product priority: return now to R1 post-KO / `NoKOSlow`, then one legal end-to-end MUGEN-format fixture journey.
- I2 next risk boundary: getter-order/direct-attacker candidate diagnostics before P3-P8 contact mutation; Projectiles, Helpers, targets, effects, round, lifebars, and resources remain separate.
- Parallel lanes: Studio source transaction -> permission-aware provenance; independent I1 VFS/package analyzer; M1 real shared contract only after Studio stabilizes it.
- Evidence: pinned IKEMEN source, local owner/diff audit, entry 411/report reconciliation, roadmap/issue sync, and diff gate. No score movement; concurrent runtime evidence is declared, not re-run by this automation.

## Global report - 2026-07-12 IKEMEN active-root body-push research

- Source: push is a run-order global pass before hits, with independent eligibility, AffectTeam, size-box Y/X/Z, priority/weight/factor, tie, clamp, and interpolation policy.
- Local gap: current `separate` is P1/P2-only, symmetric X/Width; root storage and diagnostic collision ids cannot become implicit gameplay authority.
- Decision: Wayfinder 105 adds a plural owner over stable runtime roots, resolves each eligible unordered pair once, and reclamps without widening combat/effects/targets.
- Evidence: pinned primary source, owner map, adversarial/deletion audit, roadmap sync, diff gate. No runtime/test/trace/browser/score movement.
- Global status: Wayfinder 104 resolved; Wayfinder 105 ready.

## Previous global report - 2026-07-12 IKEMEN active-root diagnostic collision runtime

- Contract: `RuntimeRootPresentation/v1` publishes independent draw, camera, and collision-debug decisions plus exact ordered ids.
- Renderer: strict pair/reserve resolution feeds selected active roots plus unchanged effect actors into `CollisionBoxRenderer`; collision diagnostics expose actor/Clsn counts.
- Isolation: collision ids never enter push, hit admission, targets, effects, HUD/audio, round, or resources; standby/disabled/nonplayer/invalid roots fail closed.
- Trace/browser: 543/543 traces pass; smoke proves `[p1,p2] -> [p3,p2] -> [p1,p2]` collision handoff/reset on desktop/mobile with two boxes and 1006/1163-color nonblank canvases.
- Verification: 176 files / 1798 tests, TypeScript 7 build, boundaries, smoke, visual inspection, and diff gate pass. Build bundle: 1,609.20 kB.
- Global status: Wayfinder 103 resolved without score movement; Wayfinder 104 maps plural active-root body push.

## Previous global report - 2026-07-12 IKEMEN active-root diagnostic collision research

- Source: debug Clsn enrollment is distinct from collision/hit admission; standby Clsn1 is suppressed while standby Clsn2 has its own class.
- Decision: presentation v1 adds independent collision reasons/ids; initial Tag cut excludes standby proxies but includes invisible/camera-excluded active roots.
- Renderer: strict pair/reserve resolution feeds only collision debug; effects and gameplay owners remain unchanged.
- Evidence: pinned source, owner map, adversarial/deletion audit, roadmap sync, diff gate. No runtime/trace/browser/score movement.
- Global status: Wayfinder 102 resolved; Wayfinder 103 ready.

## Previous global report - 2026-07-12 IKEMEN active-root stage constraints

- Runtime: already-live Tag P3-P8 active-motion roots apply actor-local stage-X constraints after animation; `ScreenBound bound = 0` opts out.
- Contract: `RuntimeRootPhaseCapabilities/v2` adds explicit `constraints`; schedule adds actor-scoped `fighter:constraints` with cross-root-safe order comparison.
- Isolation: plural push, collision debug, effects, targets, guard distance, combat, round, HUD/audio, resources, Pause/hitpause, and same-pass TagIn remain unchanged.
- Trace: required checksum `870f8871`, frames `37e1175b` / `63a42885` / `842716e7`, final P3 `x = -154`, zero targets/effects, no hit/guard evidence.
- Verification: 176 files / 1797 tests, TypeScript 7, build, 543/543 traces (512 required, 31 optional), boundaries, and diff gate pass. Browser N/A.
- Global status: Wayfinder 101 resolved without score movement; Wayfinder 102 maps diagnostic collision projection.

## Previous global report - 2026-07-12 IKEMEN active-root constraint/collision research

- Source: actor-local bounds run before global push/hit detection; push has plural team/geometry/priority semantics; standby independently blocks collision/hits.
- Local audit: stage clamp is reusable actor-locally, but `separate`, collision rendering, combat, targets, and effects remain pair-owned.
- Decision: Wayfinder 101 promotes only stage-X clamp after active-root motion, with explicit constraint capability and actor-scoped schedule row.
- Evidence: pinned source, local owner map, adversarial/vacuity audit, roadmap sync, and diff gate. No runtime, browser, trace, test-count, build-size, or score movement.
- Global status: Wayfinder 100 resolved; Wayfinder 101 ready.

## Previous global report - 2026-07-11 IKEMEN active-root presentation runtime

- Contract: `RuntimeRootPresentation/v0` publishes stable per-root draw/camera decisions plus ordered ids without widening `snapshot.actors` beyond P1/P2.
- Runtime/renderer: explicit Tag handoff selects `[p3,p2]` for body, shadow, and camera; Three.js changes only `CharacterRenderer`, while collision debug, hit sparks, effects, HUD, audio, combat, round, and resources remain pair-owned.
- Safety: draw/camera eligibility is independent; disabled, standby, invisible, `moveCameraX`, over-KO, empty-side, missing/invalid state, duplicate id, reset, and stale-mesh paths are covered.
- Trace: required `synthetic-imported-ikemen-active-root-presentation` checksum `97255586`, frames `65b85d54` / `65b00e8f`, exact `[p3,p2]` ids, stable pair/reserve arrays, and absent combat/effect evidence pass inside 542/542 artifacts.
- Browser: desktop `1440x960` and mobile `390x844` prove baseline, handoff, reset, stable HUD, matching capabilities, and nonblank canvases with 994/1173 unique colors; screenshots were visually inspected.
- Verification: 176 files / 1794 tests, TypeScript 7, production build, 542/542 traces (511 required, 31 optional), browser smoke, boundaries, and final diff gate pass.
- Global status: Wayfinder 099 is closed without score movement; Wayfinder 100 maps active-root stage constraints, body push, collision, and combat admission.

## Previous global report - 2026-07-11 IKEMEN active-root presentation research

- Source: pinned IKEMEN draw enrollment does not reject standby; `invisible` suppresses body and shadow, while camera independently rejects standby and honors `movecamera`.
- Local audit: `snapshot.actors` is a shared P1/P2 contract for renderer, HUD, audio, collision, hit sparks, and app indexing; reserves cannot be appended safely.
- Decision: Wayfinder 099 adds `RuntimeRootPresentation/v0` draw/camera ids while preserving `actors` and `reserveActors` storage.
- Bounded divergence: the first handoff hides the outgoing standby root immediately; exact leaving overlap waits for executable Tag ZSS choreography.
- Evidence: pinned source, local owner map, adversarial/deletion audit, roadmap sync, and diff gate only. Runtime/build/trace/browser evidence remains unchanged from 097.
- Global status: Wayfinder 098 is closed without behavior or score movement; Wayfinder 099 is the next browser-visible I2 gate.

## Previous global report - 2026-07-11 IKEMEN active-root motion runtime

- Runtime: one immutable normal-tick phase snapshot selects `playable`, `active-motion`, or `bounded-standby`; a TagIn cannot widen the same actor pass.
- Motion: already-live explicit-Tag P3-P8 roots run state clock, restricted side-effect-free CNS, local kinematics, then animation. `RuntimeRootPhaseCapabilities/v1` publishes the result.
- Isolation: direct native input/AI, Pause/hitpause motion, sprite/effect lifecycle, hit/contact/recovery, stage clamp/push, combat, round, presentation, camera/HUD/audio, and resources remain unchanged.
- Trace: required `synthetic-imported-ikemen-active-root-motion` checksum `8ee92f65` proves next-tick P3 TagIn-to-motion, two `VelSet` operations, final `x = -152`, inert P4, and blocked Helper/effect/contact routes.
- Verification: 174 files / 1781 tests, TypeScript 7, build, 541/541 traces (510 required, 31 optional), boundaries, and final diff gate pass; browser smoke is N/A while presentation remains false.
- Global status: Wayfinder 097 is closed without score movement; Wayfinder 098 maps incoming/outgoing actor presentation and camera ownership before a browser-visible implementation.

## Previous global report - 2026-07-11 IKEMEN active-root phase promotion research

- Source: pinned IKEMEN updates every character command list, then runs controller state logic before position physics and animation-frame commit; standby masks interaction rather than removing the whole character tick.
- Local audit: full `advanceFighter` mixes motion with sprite effects, hit/contact/recovery, unrestricted CNS, and constraints, so it is not safe for P3-P8.
- Decision: Wayfinder 097 will add a normal-tick `active-motion` phase with a precomputed participation snapshot, restricted motion CNS, kinematics, and animation only.
- Blocked: direct input/AI handoff, Pause/hitpause widening, effects, combat, round, presentation, camera/HUD/audio, resources, exact same-frame Tag timing, and scores.
- Evidence: pinned-source order map, local owner reconciliation, hidden-side-effect/deletion audit, roadmap sync, and diff check only; runtime/build/trace/browser evidence remains unchanged from 095.
- Global status: Wayfinder 096 is closed as docs-only research; Wayfinder 097 is the next executable I2 gate.

## Global report - 2026-07-11 IKEMEN active-root phase capabilities

- Contract: explicit IKEMEN `MatchWorld` registries publish `RuntimeRootPhaseCapabilities/v0` across commands, CNS, direct input, AI, kinematics, animation, effects, combat, round, presentation, and resources.
- Current truth: P1/P2 retain playable owners; Tag P3-P8 expose mapped commands plus bounded reserve CNS only. Non-standby does not imply playable.
- Safety: availability, standby, structural activity, scheduling, and effective control stay separate; id/state/side drift rejects the complete matrix and returned snapshots are isolated.
- Compatibility: Single reserves remain command-disabled, legacy/unknown publish no schema, and no scheduler/runtime/trace/visual behavior changed.
- Verification: 172 files / 1769 tests, TypeScript 7 build, 540/540 traces (509 required, 31 optional), boundaries, and diff check pass.
- Global status: Wayfinder 095 is closed without trace, visual, or score movement; Wayfinder 096 maps the first source-backed playable phase promotion.

## Global report - 2026-07-11 IKEMEN Tag side command routing

- Runtime: `RuntimeRootInputRouting/v0` separates side command mapping, direct control, AI, standby, and effective control for every present root.
- Tag policy: normal active ticks clone P1 commands into odd roots and P2 commands into even roots; every buffer updates once and opposite-side input stays isolated.
- Claim boundary: P3-P8 gain command state only. Direct input, full fighter phases, effects, combat, round, presentation, HUD/audio, and resources remain P1/P2-owned; Pause/hitpause stay pair-only.
- Trace: required `synthetic-imported-ikemen-tag-side-command` checksum `dff92731` proves P2 cannot trigger P3, then P1 drives standby P3 from state `0` to `1284`.
- Verification: 171 files / 1762 tests, TypeScript 7 build, 540/540 traces (509 required, 31 optional), boundaries, and diff check pass.
- Global status: Wayfinder 094 is closed without visual or score movement; Wayfinder 095 models per-phase active-root capabilities before any broader gameplay owner changes.

## Global report - 2026-07-11 IKEMEN active-root gameplay ownership

- Research: pinned IKEMEN Tag maps each human side controller to every same-side root while each character keeps its own command list; standby masks effective control rather than command-buffer maintenance.
- Local audit: root structure and live standby are already plural, but normal input stamping, direct control, effects, combat, round, presentation, HUD/audio, resources, and behavior traces retain P1/P2 ownership. The effect store currently aliases every non-P2 actor into P1.
- Decision: Wayfinder 094 implements only versioned side command routing plus reserve-root trace observability. Full fighter advancement, combat, round, renderer, resources, and scores remain unchanged.
- Evidence: pinned-source research note, owner inventory, adversarial audit, roadmap reconciliation, and `git diff --check`; runtime/build/trace/browser gates are N/A for this docs-only checkpoint.
- Global status: Wayfinder 093 is closed; the next I2 gate is executable command routing, followed by a separate phase-capability model before any playable or visible P3 claim.

## Global report - 2026-07-11 IKEMEN Helper-originated Tag trace

- Trace: required `synthetic-imported-ikemen-helper-self-tag` executes default-self TagOut then TagIn from Helper CNS and pins checksum `08014285`.
- Participation: ordered actor-frame evidence proves standby/effective-control suppression, restoration, and continued CNS into state `1283`.
- Effects: a Helper-parented Projectile is present before TagOut and remains live through TagIn and the later state transition.
- Telemetry: concrete TagOut/TagIn/Projectile controllers and `team-standby:*`/`projectile` operations remain root-owner plus Helper-state scoped.
- Verification: 170 files / 1749 tests, TypeScript 7 build, 539/539 traces, boundaries, and diff check pass.
- Global status: Wayfinder 092 is closed without runtime, visual, or score movement; Wayfinder 093 maps active-root gameplay ownership before implementation.

## Global report - 2026-07-11 IKEMEN Helper-originated self Tag runtime

- Runtime: Helper CNS now resolves omitted/static/deferred self and routes concrete self-only TagIn/TagOut through an explicit owner hook.
- Participation: true/default self toggles only Helper standby; CNS, projectiles, identity, snapshots, and presentation continue while effective control/direct HitDef remain filtered.
- Failure: RedirectID/aggregate payloads, invalid expressions, disabled Helpers, and legacy profiles preserve state and suppress success telemetry.
- Recovery: reset now clears stale optional actor fields and reattaches all Helper target, telemetry, team-standby, pause, and damage hooks.
- Verification: 170 files / 1748 tests, TypeScript 7 build, 538/538 traces, boundaries, and diff check pass.
- Global status: Wayfinder 091 is closed without visual or score movement; Wayfinder 092 promotes the stable cycle to a required trace.

## Global report - 2026-07-11 IKEMEN Helper aggregate closure audit

- Closure: root-to-Helper static/deferred self, partner, state, control, member, and TagIn leader reconcile with pinned source order and local ownership.
- Divergence: upstream partial mutation remains incremental; the bounded local route intentionally keeps complete atomic prevalidation.
- Open runtime: Helper-authored Tag controllers still stop before a team-standby hook; active P3-P8 gameplay crosses four separate P1/P2-only consumers.
- Decision: Wayfinder 091 executes unredirected Helper-originated self Tag standby only.
- Verification: official wiki and pinned SHA links plus local compiler/runtime/test ownership rechecked; `git diff --check` is the docs-only gate.
- Global status: Wayfinder 090 closes research without runtime, visual, trace, or score movement.

## Global report - 2026-07-11 IKEMEN Helper-relative Tag member runtime

- Ownership: exact Helper root anchors team side, while a dedicated operation swaps from mutable position one without creating a Helper order slot.
- Evaluation: static/deferred TagIn/TagOut member positions remain original-caller-owned, truncate toward zero, and require a positive one-based result.
- Mutation: complete prevalidation precedes Helper state, member, control, leader, self, and partner order.
- Failure: invalid position/expression, non-Tag mode, missing root, unavailable aggregate targets, and legacy profile preserve state, order, and telemetry.
- Verification: 170 files / 1736 tests, TypeScript 7 build, 538/538 traces, boundaries, and diff check pass.
- Global status: Wayfinder 089 is closed without visual or score movement; Wayfinder 090 audits bounded Helper aggregate closure and selects one next runtime slice.

## Global report - 2026-07-11 IKEMEN Helper-relative TagIn leader runtime

- Ownership: exact Helper root anchors stable same-side PlayerNo leader selection under explicit Tag mode.
- Evaluation: static/deferred leader remains original-caller-owned and uses shared source order.
- Mutation: Helper state/control precede leader rotation; Helper self and partner-root effects follow.
- Failure: opposing/missing leader, non-Tag mode, missing root, and member axes preserve all state and telemetry.
- Verification: 170 files / 1730 tests, TypeScript 7 build, 538/538 traces, boundaries, and diff check pass.
- Global status: Wayfinder 088 is closed without visual or score movement; Wayfinder 089 executes Helper `memberno` position-one ownership.

## Global report - 2026-07-11 IKEMEN Helper-relative partner Tag runtime

- Compiler: source-valid caller `stateno` now composes with partner identity/state/control in one typed Tag operation.
- Runtime: exact Helper root anchors stable same-side partner selection; dynamic values stay original-caller-owned and source-ordered.
- Mutation: Helper state/control/self precede partner-root standby/state/control after complete prevalidation.
- Failure: missing roots/partners and unavailable states roll back Helper, partner, and telemetry atomically; member/leader stay blocked.
- Verification: 170 files / 1727 tests, TypeScript 7 build, 538/538 traces, boundaries, and diff check pass.
- Global status: Wayfinder 087 is closed without visual or score movement; Wayfinder 088 executes Helper-relative TagIn leader.

## Global report - 2026-07-11 IKEMEN Helper aggregate Tag ownership research

- Source: pinned compiler/runtime confirms original-caller expression evaluation and Helper-relative aggregate mutation order.
- Partner: inherited PlayerNo selects a same-side root; partner standby/state/control occur after Helper-local state/control/self standby.
- Team order: `memberno` and leader mutate roots; zero-initialized Helper `memberNo` makes member swaps originate from position one.
- Failure: upstream is incremental; local bounded execution retains prevalidated atomicity.
- Global status: Wayfinder 086 is closed without runtime, visual, or score movement; Wayfinder 087 executes partner only.

## Global report - 2026-07-11 IKEMEN initial Helper standby runtime

- Compiler/runtime: Helper `standby` supports static zero/non-zero and one caller-owned deferred expression under explicit `ikemen-go`.
- Lifecycle: final standby and StateDef-over-true control are stored before identity observation and same-tick Helper CNS.
- Safety: invalid/unresolved IKEMEN values block spawn; legacy/unknown profiles ignore the parameter; effective control/direct combat stay filtered without stopping projectiles or presentation.
- Verification: 170 files / 1721 tests, TypeScript 7 build, 538/538 traces, boundaries, and diff check pass.
- Global status: initial root-created Helper standby is closed without score or visual movement; Wayfinder 086 maps Helper aggregate Tag ownership.

## Global report - 2026-07-11 IKEMEN static Tag member order

- Compiler: positive static TagIn/TagOut `memberno` lowers to one-based mutable position.
- Runtime: explicit Tag mode validates caller/position before any Tag mutation.
- Result: same-tick member order swaps; stable P1-P8 slots and leader remain unchanged.
- Failure: invalid position or non-Tag mode preserves order, state, control, standby, and telemetry.
- Next: Wayfinder 065 static TagIn stable-PlayerNo leader rotation.

## Global report - 2026-07-11 IKEMEN Tag team-order model

- Model: `RuntimeTagTeamOrder/v0` separates stable roots, mutable member order, and leader id by side.
- Mode: only explicit IKEMEN `teamMode: "tag"` creates/publishes the model.
- Operations: atomic member swap, leader rotation, dead-member sinking, deterministic reset.
- Isolation: scheduler, root selection, standby, gameplay, and rendering remain unchanged.
- Next: Wayfinder 064 static one-based `memberno` execution.

## Global report - 2026-07-11 IKEMEN Tag member/leader research

- Identity: `leader` targets stable one-based PlayerNo; stable P1-P8 slots never reorder.
- Order: `memberno` targets one-based mutable team position and swaps caller position.
- Leader mutation: rotates selected same-side root front, sinks dead members, rewrites member positions.
- Gap: runtime has no explicit Tag mode, mutable order, or leader owner.
- Next: Wayfinder 063 `RuntimeTagTeamOrder/v0` diagnostic/model prefactor.

## Global report - 2026-07-11 IKEMEN static TagIn control

- Compiler: exact static `ctrl` / `partnerctrl` lower to typed booleans; TagOut control remains blocked.
- Runtime: control applies after corresponding state metadata and therefore overrides it.
- Atomicity: caller/partner/state validation completes before standby, state, or control mutation.
- Defaults: caller control implies omitted self; partner control requires static partner.
- Next: Wayfinder 062 member/leader order research.

## Global report - 2026-07-11 IKEMEN TagIn control research

- Official order: caller state then caller control; partner standby/state then partner control.
- Precedence: explicit control overrides StateDef control metadata.
- Defaults: caller `ctrl` implies self; partner control requires selected partner.
- Next: Wayfinder 061 exact static `ctrl` / `partnerctrl` with aggregate prevalidation.

## Global report - 2026-07-11 IKEMEN static Tag partner state

- Compiler: static non-negative `partnerstateno` requires static partner selection.
- Runtime: partner and partner-owned state validate before standby and state entry.
- Failure: missing target/state leaves caller and partner unchanged and records no successful operation.
- Isolation: caller state combinations, control, redirects, dynamic values, and gameplay remain blocked.
- Next: Wayfinder 060 research for TagIn `ctrl` / `partnerctrl` order.

## Global report - 2026-07-11 IKEMEN static Tag caller state

- Compiler: static non-negative caller-only `stateno` is typed for TagIn/TagOut.
- Runtime: caller-owned state availability validates before state entry and standby mutation.
- Ownership: state entry clears foreign owner; `self = 0` supports state-only execution.
- Failure: missing state blocks both mutations and successful telemetry.
- Next: Wayfinder 059 static partner-owned state; partner control remains blocked.

## Global report - 2026-07-11 IKEMEN Tag state research

- Official order: caller `stateno` precedes caller standby; partner standby precedes `partnerstateno`.
- Ownership: caller and partner enter their own state programs; no cross-character state owner is implied.
- Risk: IKEMEN mutates incrementally, while sandbox Tag standby currently validates atomically.
- Next: Wayfinder 058 static caller-only `stateno` with state prevalidation; partner state/control remain blocked.

## Global report - 2026-07-11 IKEMEN static Tag self

- Compiler: exact static `self = 0|1` works with or without static partner; omitted self follows IKEMEN partner-sensitive defaults.
- Runtime: self+partner targets validate before one deduplicated standby batch; missing partner rolls back caller mutation.
- Edge cases: self-zero/no-partner executes as a typed no-op; wrapped partner selection cannot duplicate a root mutation.
- Isolation: dynamic/invalid self, remaining optional parameters, legacy profile, and gameplay ownership remain blocked.
- Next: Wayfinder 057 research for `stateno` / partner state ownership and execution order.

## Global report - 2026-07-11 IKEMEN self TagIn/TagOut runtime

- Latest extension: static non-negative Tag `partner` now performs cyclic same-side partner-only standby mutation with missing-target fail-closed behavior.
- Verification: 168 files / 1628 tests and 538/538 traces; TypeScript 7 build and boundaries pass.
- Next: Wayfinder 056 static `self` plus atomic self/partner combinations.

- Latest runtime: parameterless self TagIn/TagOut now mutate caller standby under explicit IKEMEN and refresh later-root Enemy/P2 selection in the same tick.
- Safety: any optional parameter and every non-IKEMEN execution fail closed; no implicit partner transition or gameplay ownership.
- Next: Wayfinder 054 maps stable PlayerNo/partner identity before optional Tag targeting.

## Previous report - 2026-07-11 IKEMEN standby-root CNS scheduling

- Scheduler: explicit IKEMEN RunOrder includes P3-P8 roots.
- Execution: reserves advance state time and controller-only standby CNS in active and pause branches.
- Isolation: no reserve auto-guard, input, physics, animation, lifecycle, target binding, clamp, combat, round, presentation, or effect stores.
- Diagnostics: reserve participation marks scheduled true; tick schedule emits only `fighter:controllers` rows for P3-P8.
- Score: unchanged. No TagIn/TagOut or playable team phases.
- Next: Wayfinder 052 bounded typed TagIn/TagOut and same-tick selection refresh.

## Global report - 2026-07-11 IKEMEN CNS capability boundary

- Runtime: `RuntimeRootCnsExecutionWorld` owns explicit playable/standby controller capabilities.
- Dispatch: state, individual runtime-controller types, side-effect routes, and unsupported handlers can be blocked before hooks execute and counted separately.
- Compatibility: P1/P2 explicitly use full playable capabilities; behavior and phase order remain unchanged.
- Isolation: standby profile permits only state/control/state-type/turn/variable/no-op controllers and blocks life/power/position/combat/presentation runtime types plus all side effects; P3-P8 are scheduled only through this controller boundary.
- Score: unchanged. This is prerequisite architecture, not standby CNS support.
- Next: Wayfinder 051 controller-only P3-P8 scheduling.

## Global report - 2026-07-11 IKEMEN expression selection

- Expression VM: optional root-selection input separates EnemyNear roster from P2 identity/state.
- Failure policy: explicit empty P2 candidates fail closed; missing registry ids are ignored.
- Compatibility: omitted root selection preserves existing 1v1 expression behavior.
- Partner: still diagnostic-only; no unsupported redirect grammar is claimed.
- Score: unchanged. Reserve roots still do not execute CNS.
- Next: Wayfinder 049 standby-root CNS scheduling and same-tick TagIn/TagOut research.

## Global report - 2026-07-11 IKEMEN root selection

- Runtime/IKEMEN: `RuntimeRootSelection/v0` separates identity, Partner, Enemy, and P2 candidate domains.
- Partner: complete same-side root slots remain addressable even while standby/disabled.
- Enemy: active opposing roots only; over-KO remains eligible.
- P2: active opposing player roots only; over-KO and helper candidates are excluded.
- Activation: selection refreshes immediately after atomic standby changes.
- Score: unchanged. Expressions and gameplay still use existing bounded routes.
- Next: Wayfinder 048 read-only expression-context integration.

## Global report - 2026-07-11 IKEMEN structural root activation

- Runtime/IKEMEN: explicit-profile host/test command applies atomic plural standby changes.
- Read model: `activeRootIdsBySide` preserves stable root order and allows multiple active roots per side.
- Isolation: activated reserves stay in `reserveActors`; schedule, input, combat, round, presentation, and effect stores remain P1/P2.
- Reset: authored P1/P2 active and P3-P8 standby topology is restored.
- Score: unchanged. No CNS TagIn/TagOut or playable teams.
- Next: Wayfinder 047 identity/Partner versus Enemy/P2 eligibility matrix.

## Global report - 2026-07-11 IKEMEN root participation

- Runtime/IKEMEN: `RuntimeRootParticipation/v0` exposes stable P1-P8 ownership and structural state.
- Isolation: schedule, input, combat, round, presentation, and effect-store ownership remain explicit P1/P2 lists; P3-P8 are false on every executable axis.
- Lifecycle: live `MatchWorld` coverage includes all six reserves and registry lifecycle rows.
- API safety: registry snapshots deep-clone the participation diagnostic.
- Score: unchanged. No standby mutation or active multi-root gameplay.
- Next: atomic plural standby transition plus active-root projection, still without scheduler widening.

## Global report - 2026-07-11 IKEMEN inert roots

- Runtime/IKEMEN: explicit IKEMEN options can construct P3-P8 roots in stable interleaved slots with standby state.
- Snapshot/registry: reserves publish through `reserveActors`, registry, lifecycle, topology, and team diagnostics.
- Isolation: reserves do not enter active actors, renderer/camera, schedule, input, combat, round, compatibility execution, helpers, or effect stores.
- Reset: reserve objects are recreated in place with standby restored.
- Score: unchanged. No active multi-root gameplay.
- Next at that checkpoint was Wayfinder 046; root-participation observability now resolves it.

## Planning report - 2026-07-11 daily architecture audit

- Since the previous automation, 23 commits closed the selected HitDef policy/contact, semantic presentation order, schedule, Common1/guard, and later IKEMEN RunOrder/Pause/team-topology sequence.
- Highest numbered backlog truth is entry 348 and the declared current trace total is 538/538; older 524/524 and 523/523 values remain historical cut baselines.
- I1 remains scanner/reporting. New I2 owns explicit-profile IKEMEN runtime gates and routes through `.scratch/roadmap/issues/07-ikemen-runtime-topology.md`.
- Next I2 prefactor: direct P3-P8/cap/start/reset/lifecycle evidence plus a versioned root-participation read model with all executable consumers still P1/P2. Activation, redirects, and standby CNS scheduling are later separate gates.
- After the small I2 prefactor, return the primary lane to a bounded MUGEN-lite post-KO / `NoKOSlow` timeline.
- Scores unchanged; this report adds no runtime evidence.

## Previous report - 2026-07-11 IKEMEN live team state

- Runtime/IKEMEN: `CharacterRuntimeState.teamState` carries disabled, standby, over-KO, and player-type state for roots/helpers.
- Snapshot/registry: player/helper snapshots clone team state; `MatchWorld.teamRoster` now consumes it directly.
- Compatibility: legacy snapshots normalize safely; current roots remain active player-types, current Helpers active non-player-types.
- Score: unchanged. No P3/P4 construction or playable team phase exists.
- Next frontier at that checkpoint was Wayfinder 045; inert root construction now resolves it.

## Previous report - 2026-07-11 IKEMEN public multi-root registry

- Runtime/IKEMEN: parallel unique-id character registry now supports P1-P8 roots/helpers without widening the scheduler tuple.
- Public registry snapshot: `MatchWorldActorRegistrySnapshot` exposes `RuntimeTeamRoster/v0`, `byId`, and `teamSides`; synthetic P1-P4 plus helper route is covered.
- Compatibility: duplicate character ids fail before publication; existing P1/P2 roster, effect stores, round, combat, and presentation remain unchanged.
- Score: unchanged. Registry visibility is structural proof, not a playable team match.
- Next frontier at that checkpoint was Wayfinder 044; live team-state projection now resolves it.

## Previous report - 2026-07-11 IKEMEN team eligibility

- Runtime/IKEMEN: complete-team enumeration now remains distinct from active EnemyNear/P2 candidates; disabled, standby, neutral, and P2 `overKo` states are explicitly filtered from the appropriate projections.
- Diagnostics: `RuntimeTeamRoster/v0` serializes P1-P4 side/kind/status/player-type plus explicit base-enemy, EnemyNear, and P2 candidate flags for registry integration tests.
- Toolchain: TypeScript 7.0.2 direct route re-audited with 0 errors / 0 warnings.
- Score: unchanged. No playable multi-root registry, scheduler, combat, round, or presentation path exists yet.
- Next frontier at that checkpoint was Wayfinder 043; the newer public-registry closeout resolves it.

## Previous report - 2026-07-10 IKEMEN team topology

- IKEMEN runtime: shared topology now resolves P1/P3/P5/P7 versus P2/P4/P6/P8 and helper root inheritance.
- Consumers: CNS `TeamSide` and SuperPause complete opposing-character projection use one stable policy; unknown/neutral ids fail closed.
- Evidence: 163 files / 1599 tests, TypeScript 7.0.2 typecheck/build, boundaries, and 538/538 traces green; team-defense checksum remains `76873f0d` / final `b4425c66`.
- Studio, renderer, assets, scanner, modular engine: unchanged. No visual gate required. Overall score unchanged.
- Next frontier: active/standby eligibility and public multi-root registry diagnostics before scheduling/input/combat expansion.

## Previous global report - 2026-07-10 IKEMEN SuperPause team defense

- IKEMEN runtime: omitted/non-positive `p2defmul` now uses game-level `1.5`; a positive `MatchWorld` override is supported.
- Defense ownership: temporary SuperPause scale is separate from base `Data.Defence` / `DefenceMulSet`, stacks per active session, and restores without erasing base changes.
- Required artifact: `synthetic-imported-ikemen-superpause-team-defense.json`, checksum `76873f0d`, final `b4425c66`; P2 and `p2-helper-0` expose `0.6667`, final P2 life `950`.
- Aggregate: 538/538 artifacts, 507 required and 31 optional. Full verification: 162 files / 1597 tests, TypeScript 7.0.2 typecheck/build, and boundaries green.
- Studio, renderer, assets, scanner, modular engine: unchanged. No visual gate required. Overall score unchanged.
- This checkpoint's pair-only topology frontier is resolved by the newer shared-team-topology closeout; global config loading, helper defender combat, nested ancestry, exact hitpause timing, and rollback remain blocked.

## Previous global report - 2026-07-10 IKEMEN helper-owned Pause

- IKEMEN runtime: explicit `ikemen-go` now owns separate Pause/SuperPause slots, same-frame duration arbitration, same-owner overwrite, stable ties, and SuperPause-first timer progression.
- Required artifact: `synthetic-imported-ikemen-helper-superpause.json`, checksum `d1444550`, final `f6c7da6a`; helper `p1-helper-0` owns SuperPause, root power reaches `125`, sound resolves `S9,4`, and target P2 ends at life `959` under `p2defmul = 0.5`.
- Aggregate: 537/537 artifacts, 506 required and 31 optional. Full verification: 161 files / 1587 tests, TypeScript 7.0.2 build/typecheck, and boundaries green.
- Studio, renderer, assets: unchanged; no visual gate required. Overall score unchanged.
- Remaining scheduler gaps: opposing-team defense breadth, `p2defmul = 0`, nested helper ancestry, exact post-frame buffer/audio visibility, exact hitpause interaction, teams/simul/tag, and rollback.

## Previous global report - 2026-07-10 IKEMEN root/helper actor RunOrder

- IKEMEN runtime: explicit `ikemen-go` now schedules roots and helpers in one source-backed actor list and advances newly appended helpers later in the same tick.
- Required artifact: `synthetic-imported-ikemen-helper-runorder.json`, checksum `174f927d`, final `3906023d`; helper index `3`, state `1282`, age `1`, and one `helper:controllers` phase in frame 1.
- Aggregate: 532/532 artifacts, 501 required and 31 optional. Full verification: 160 files / 1572 tests, TypeScript 7 build/typecheck, and boundaries green.
- Studio, renderer, assets: unchanged; no visual gate required. Overall score unchanged.
- Remaining scheduler gaps: simultaneous Pause/SuperPause ownership, teams/simul/tag, nested helper creation, exact Pause/hitpause ordering, and rollback.

## Previous global report - 2026-07-10 IKEMEN root RunOrder trigger

- IKEMEN runtime: explicit `ikemen-go` now stamps one-based sorted root indices before frame triggers; bounded CNS can branch on `RunOrder`.
- Required artifact: `synthetic-imported-ikemen-runorder.json`, checksum `04d433de`, final `390fb921`, P2 index `1` and state `282`.
- Aggregate: 531/531 artifacts, 500 required and 31 optional. No score movement and no visual change.
- Remaining scheduler gaps: helpers/appended actors, teams/simul/tag, simultaneous Pause ownership, exact Pause/hitpause ordering, and rollback.

## Previous global report - 2026-07-10 IKEMEN root run flags

- IKEMEN runtime: explicit `ikemen-go` now consumes previous-tick root `RunFirst` / `RunLast` before MoveType/id priority; exclusive flags are `100/-100`, both neutralize.
- Trace quality: reusable schedule-phase actor-order requirements now gate `synthetic-imported-ikemen-runfirst.json` checksum `56e17803` / final `aabad0c5`.
- Aggregate: 530/530 artifacts, 499 required and 31 optional. No score movement and no visual change.
- Remaining scheduler gaps: `RunOrder`, helpers/appended actors, teams/simul/tag, simultaneous Pause ownership, rollback, and exact pause/hitpause flag lifetime.

## Previous global report - 2026-07-10 IKEMEN root RunOrder

- IKEMEN runtime: explicit `ikemen-go` matches now execute bounded two-root MoveType/id RunOrder.
- MUGEN/native stability: `mugen-1.1` and `unknown` preserve pair order; 529/529 traces remain green.
- Verification: focused 4 files / 86 tests; full 158 files / 1556 tests; TS7 build/typecheck and boundaries pass.
- Studio, renderer, assets: unchanged; no visual gate required.
- Overall score: unchanged; helpers, run flags/triggers, teams, rollback, and broader IKEMEN execution remain blocked.

## Global report - 2026-07-10 same-tick Pause symmetry

- Runtime scheduling: advanced. P1-started Pause/SuperPause no longer cancels P2's prepared active pass on the creation tick; freeze begins on the next paused branch.
- Automatic guard: both root players retain pre/post checks on active ticks; paused ticks remain free of automatic guard-state entry.
- Trace compatibility: 529/529 artifacts pass, with 498 required and 31 optional; focused runtime coverage passes 2 files / 75 tests.
- Studio, renderer, and IKEMEN executable breadth: unchanged in this slice.
- Toolchain: TypeScript 7.0.2 direct route remains green.
- Overall score: unchanged; dynamic RunOrder, helper/team/simul/tag scheduling, simultaneous Pause ownership, and rollback timing remain blocked.

## Planning report - 2026-07-10 daily architecture audit

- Current global evidence remains 524/524; backlog entry 332's 523/523 is the baseline of that numbered slice, not the newest global total.
- Selected next R1/renderer sequence: preserve authored/omitted HitDef p1/p2 values behind a minimal profile policy, then gate static direct player/helper contact semantics, then semantic overlap.
- Selected next R2 risk cut: `MatchTickSchedule/v0` diagnostics outside the legacy behavior-checksum projection before any tick-order correction or further transparent seam extraction.
- Studio next: source identity/conflict/write-reimport/invalidation/rollback before state/collision editing; undo/migration later. IKEMEN next: package-level analyzer, not runtime. Assets next: permission-aware content-addressed provenance. Modular next remains after these dependencies.
- No score movement and no new implementation claim.

## Global report - 2026-07-10 SprPriority draw order

- Renderer/runtime presentation: advanced. Player SprPriority uses official range and effective z ordering is browser-gated desktop/mobile.
- Effect actors: existing broader priority range preserved; no accidental collapse.
- Studio and IKEMEN breadth: unchanged in this slice.
- Trace compatibility: retained at 524/524.
- Overall score: unchanged pending contact pair priorities, stage/effect ordering, overlap baselines, and L4/L5 evidence.

## Global report - 2026-07-10 TypeScript 7 control follow-up

- Toolchain: TypeScript remains `7.0.2` (`typescript@~7.0.2`) and direct CLI `tsc` posture is preserved.
- Evidence check: `pnpm exec tsc --version` returns `Version 7.0.2`; workspace dependency remains `typescript@7.0.2` only.
- Constraint check: `rootDir` and `types` are explicit in `tsconfig.json`; no `@typescript/typescript6` alias is present because no compiler-API consumers were detected.
- Score movement: none in this cut; this is a toolchain control checkpoint before continuing runtime or Studio feature slices.

## Global report - 2026-07-10 renderer axis-parity oracle

- Renderer/Three.js: advanced. Player sprite axis/facing/scale now reaches proof ladder L2 with effective mesh diagnostics and independent desktop/mobile oracle.
- Runtime and Studio usability: retained; screenshots and canvas framing remain L3-visible.
- Trace compatibility: unchanged at 524/524.
- IKEMEN breadth: unchanged in this slice.
- Overall score: unchanged because L4 deterministic baselines and L5 reference parity remain absent.

## Global report - 2026-07-10 persistent Studio scene authoring

- Studio editor: advanced. A complete single-match scene identity (name/P1/CPU/stage) now has explicit dirty/save/reopen semantics.
- Runtime: authored scene rebuild remains immediate and playable.
- Trace compatibility: unchanged at 524/524.
- Renderer and IKEMEN breadth: unchanged in this slice.
- Browser QA: dirty transition, exact stored entry, reload/reopen, saved baseline, screenshot, and responsive overflow are green.
- Overall score: unchanged pending deeper source-bound editors and multi-scene workflows.

## Global report - 2026-07-10 persistent Studio project naming

- Studio editor: advanced from selection-only controls to a validated persistent authored field with save/reload/reopen proof.
- Runtime/audio and trace compatibility: unchanged; 524/524 trace baseline retained.
- Renderer and IKEMEN breadth: unchanged in this slice.
- Browser QA: desktop/1024px overflow, manifest propagation, local persistence, and reopen are green.
- Overall score: unchanged; one identity field does not yet satisfy scene/state/collision authoring.

## Global report - 2026-07-10 KO sound handoff

- Runtime/round/audio: advanced. KO now emits `f:11,0`; double KO and `NoKOSnd` are bounded; time-over stays silent.
- Trace compatibility: 524/524, including required KO trace `bfd5f073` / final `33b91196`.
- Studio, renderer, IKEMEN breadth: unchanged in this slice.
- Toolchain: TypeScript 7.0.2 remains green.
- Overall score: unchanged pending post-KO timeline and broader round/audio parity.

## Global report - 2026-07-10 contextual SND banks

- Runtime/audio: context-dependent player/common selection implemented and fail-closed.
- Trace compatibility: 524/524, with 493 required and 31 optional artifacts.
- Studio, renderer, and IKEMEN breadth: unchanged in this slice.
- Toolchain: TypeScript 7.0.2 remains green.
- Overall score: unchanged; this closes correctness debt inside partial audio scope.

Last updated: 2026-07-11

This document is the compact truth board for progress. It does not replace detailed docs; it points to the evidence that keeps claims honest.

## Progress Control System

Use these files together:

| File | Role |
| --- | --- |
| `CONTEXT.md` | Fast project/domain map for future agents. |
| `AGENTS.md` | Working rules, verification baseline, skill setup. |
| `docs/ROADMAP_NAVIGATION.md` | Fast route map for docs ownership, package lanes, score evidence, setup-project profile, and anti-drift rules. |
| `docs/ROADMAP_PROGRESS_SYSTEM.md` | Source-of-truth order, package lifecycle, horizon ladder, update matrix, and closeout template. |
| `docs/ROADMAP_PACKAGE_MILESTONES.md` | Compact active package ladder, milestone exits, next recommended slice, and package closeout ownership. |
| `docs/NEXT_BUILD_ROADMAP.md` | Tactical next-10-slices queue and lane-specific done evidence. |
| `docs/ROADMAP_CONTINUITY_GUIDE.md` | Continuity rules, next useful gates, documentation update matrix, and closeout template for long-running work. |
| `docs/ROADMAP_OPERATIONAL_CHECKLIST.md` | Task-type checklist for runtime, renderer, Studio, generated assets, IKEMEN scanner, modular boundaries, docs-only setup, and score movement. |
| `docs/ROADMAP_RELEASE_TARGETS.md` | Release-train targets, usable milestones, and score-movement rules. |
| `docs/ROADMAP_EXECUTION_BOARD.md` | Current implementation queue, package acceptance, and handoff checklist. |
| `docs/PORT_COMPLETION_SCORECARD.md` | Authoritative 0-100 scorecard for playable sandbox, MUGEN, IKEMEN, Studio, and modular engine horizons. |
| `docs/WORKPLAN.md` | Current execution authority. |
| `docs/BUILD_EXECUTION_BACKLOG.md` | Detailed history and backlog ledger. |
| `.scratch/roadmap/PRD.md` | Local roadmap-tracking PRD. |
| `.scratch/roadmap/issues/` | Small actionable issue slices for runtime, Studio, assets, IKEMEN, and modular-engine tracks. |

Rule: this tracker stays short. Update score changes in `docs/PORT_COMPLETION_SCORECARD.md`, add detailed implementation history to `docs/BUILD_EXECUTION_BACKLOG.md`, and use `.scratch/roadmap/issues/` for next-slice planning.

Latest global report: Runtime/audio now implements official channel `0` voice cancellation from an explicit accepted-hit sequence rather than hitstun inference. The hit actor loses only its voice channel once; other actors and later same-sequence voices remain active. Trace coverage stays 524/524 without checksum drift. Studio/UI, renderer, IKEMEN scanner, generated assets, modular boundaries, and published scores do not move in this slice.

Latest global report: Runtime/audio now isolates numbered Web Audio channels by runtime actor, preventing P1/P2/helper cross-interruption when channel numbers match while retaining global `StopSnd -1`. This advances playable imported audio and R2 ownership without changing the 524-artifact runtime trace baseline or published scores. Studio/UI, renderer, IKEMEN scanner, generated assets, and modular boundaries are unchanged in this slice.

Latest global report: Runtime/port remains at 524/524 trace artifacts, 493 required and 31 optional. The newest R1 slice upgrades five first-generation helper-local direct HitDef/persistence routes to resolve `S5,0/1/2/3` or `S6,4` and record owner-attributed typed `audio:playsnd`, including a fail-closed no-audio proof on HitBy rejection. TypeScript remains 7.0.2. Studio/UI, IKEMEN scanner, modular-engine boundaries, and published completion scores do not move in this runtime-only cut; no visual smoke is required because no renderer or UI surface changed.

## Lane Checkpoints

Use this table to avoid mixing unrelated "latest" facts:

| Lane | Latest checkpoint | Next read |
| --- | --- | --- |
| Overall closeout | Latest global closeout is player `SprPriority` draw order with 524/524 retained and bounded L2 plus general L3 renderer evidence. The next selected gate is direct HitDef p1/p2 contact sprite priority; entry 332 remains the latest numbered backlog item but its 523/523 count is slice-local history. | `docs/BUILD_EXECUTION_BACKLOG.md`, `docs/research/2026-07-10-daily-roadmap-architecture-audit.md` |
| Runtime/port | Latest required runtime evidence proves three bounded player-owned Projectile normal-hit GetHitVar routes carry typed audio and FightFX package telemetry while preserving Common1 metadata branches. Previous required traces still prove helper Projectile normal-hit GetHitVar sound typed audio telemetry, helper Projectile guard-contact sound typed audio telemetry, player-owned Projectile contact sound typed audio telemetry, dynamic direct HitDef contact sound typed audio telemetry, dynamic SuperPause sound typed audio telemetry, dynamic active-state `PlaySnd` / `SndPan` / `StopSnd` audio typed telemetry, dynamic `AttackMulSet` / `DefenceMulSet`, dynamic `EnvColor`, dynamic `AfterImage`, dynamic `AngleSet` / `AngleAdd` / `AngleMul` / `AngleDraw`, dynamic `PalFX`, dynamic `AfterImageTime`, dynamic `RemapPal`, dynamic `Trans`, dynamic `SprPriority`, dynamic `LifeSet` / `PowerAdd` / `PowerSet`, dynamic `LifeAdd`, dynamic `CtrlSet`, dynamic `StateTypeSet`, dynamic `ScreenBound`, dynamic `PosFreeze`, dynamic `PlayerPush`, dynamic `Width`, helper-local dynamic kinematics, active-state dynamic kinematic typed telemetry with `Const240p` / `Const480p` / `Const720p` controller params, State -1 const routing, config-derived screen/game-space expression support, zoom-stable `ScreenWidth` / `ScreenHeight`, stage-localcoord `GameWidth` / `GameHeight`, owner/helper `ModifyProjectile`, localcoord-derived Projectile defaults, terminal, guard, ReversalDef, SuperPause, audio/presentation, target, helper, and Common1 routes. This does not prove broader helper Projectile normal-hit contact sound breadth, exact SND lookup, channel priority classes, timing, mixing, panning semantics, broader helper/team/redirect ownership, exact damage-scaling stack/order, renderer parity, dynamic typed lowering for every controller, score movement, or full runtime/presentation VM parity. | `docs/ROADMAP_PACKAGE_MILESTONES.md` |
| Studio/UI | Studio Build and Evidence share a Trust Chain sourced from Build Readiness data for runtime manifest, QA evidence, project package, asset validation, source packages, compatibility gates, and architecture boundaries. Trust Chain package/source rows now drill into concrete `package-file` export-manifest entries and `source-file` required paths, and clicks leave visible focused Trust Chain plus destination rows. The desktop command palette and bottom console now have stronger readable rows, aligned meta/source columns, severity cells, hard neutral surfaces, visible scrollbars, and smoke-verified keyboard/focus behavior. The Studio playfield toolbar now sits as a compact bottom-right dock instead of a full-width viewport strip. Assets right-pane collapsible panels now share one `studio-ledger-drawer` helper/class instead of parallel summary/body markup. The CSS ownership baseline remains: `src/style.css` is a small base/reset stylesheet; `src/styles/studio.css` is the ordered Studio/app CSS entrypoint; app shell, command shell, workbench/assets, Build/Evidence, Modules/Debug, Command Palette, Stage, Inspector, and shared status rails live in named category modules under `src/styles/*`, with shared primitive/header/ledger-badge ownership in `src/styles/surfaces/studio-primitives.css`, shared rail ownership in `src/styles/surfaces/studio-status-rails.css`, drawer styling in `src/styles/surfaces/studio-ledger-drawers.css`, Assets rows in `src/styles/workflows/studio-assets-ledger.css`, and Build/Evidence trust-ledger styling in `src/styles/workflows/studio-trust-ledgers.css`. `pnpm qa:smoke` validates Trust Chain row ids, next actions, package/source file targets, and focused-row state on Build/Evidence; `pnpm qa:css` passes as an audit, while `pnpm qa:css:budget` is currently red against older CSS debt ceilings and remains a cleanup follow-up. | `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md` |
| Toolchain/process | TypeScript is now `7.0.2` via `typescript@~7.0.2`, with primary-source research captured in `docs/research/2026-07-08-typescript-7-upgrade.md`. Current TS7 posture is direct CLI `tsc`, explicit `rootDir: "src"`, explicit `types: ["vite/client"]`, and no TypeScript 6 compatibility alias because the repo currently has no local compiler API imports. The 2026-07-09 TS7 re-audit is clean at 0 errors / 0 warnings, and current TS7 gates are green: `pnpm typecheck`, `pnpm build`, `pnpm test` 153 files / 1503 tests, `pnpm qa:trace` 524/524 artifacts, `pnpm check:boundaries`, and `git diff --check` with CRLF warnings only. | `docs/research/2026-07-08-typescript-7-upgrade.md` |
| G1 project control | Setup-project profile and roadmap docs remain local markdown, canonical labels, single-context docs, now with lane checkpoint taxonomy. | `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md` |

Current global port report: Runtime/port is at `pnpm qa:trace` 537/537 artifacts, 506 required and 31 optional. Explicit `ikemen-go` combines root/helper RunOrder, appended-helper execution, separate buffers, actor-local movement, deferred replacement activation, positive `p2defmul` stacking, and helper-created Pause/SuperPause with helper identity plus root resource ownership. Toolchain remains TypeScript 7.0.2 with trace/typecheck green; full test/build/boundary closeout is recorded per feature. No visual surface changed. IKEMEN remains scanner/report-only outside bounded INI/FightFX handoff and explicitly gated runtime slices. Opposing-team defense breadth, `p2defmul = 0`, nested helper ancestry, exact buffer/audio/hitpause parity, teams/simul/tag, renderer parity, config/ZSS/Lua, rollback/netplay, and full compatibility remain open.

Latest focused runtime/port trace addendum: player-owned Projectile normal-hit GetHitVar artifacts `8e5df79b` / `4d078c5d`, `4356b5cb` / `4b270d45`, and `df2619f9` / `5469bc69` require `projectile` plus `audio:playsnd`, attacker-side `S5,45/46/47`, FightFX `F7002`, Common1 `5000 -> 335/337/339`, target links, and Projectile lifecycle evidence. Official Elecbyte docs were checked for Projectile HitDef inheritance, `hitsound`, and GetHitVar fields. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-projectile-hitcount.json` trace checksum `ee8f4e19` / final checksum `0fd4adf8` and `synthetic-imported-helper-projectile-hitcount.json` trace checksum `c8f5dc55` / final checksum `e1569fab` are required artifacts for bounded player-owned/helper-parented Projectile normal-hit attacker-side HitCount sound typed audio telemetry. Focused tests cover trace preset requirements, required `projectile`/`audio:playsnd` and `helper`/`projectile`/`audio:playsnd` evidence, preserved `hitsound = S5,44/S5,43`, FightFX `F7002`, target links, P1 `200 -> 341`, helper `1257 -> 1258`, and shared contact package metadata. Official Elecbyte State Controller docs were checked for `Projectile` taking HitDef parameters and helper-created Projectiles becoming root-owned; Elecbyte Trigger docs were checked for `HitCount` / `UniqHitCount`. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-helper-projectile-gethitvar-hit-metadata.json` trace checksum `28afbcea` / final checksum `c960b1cf`, `synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json` trace checksum `616e0b2c` / final checksum `0aebcc73`, and `synthetic-imported-helper-projectile-gethitvar-hitcount.json` trace checksum `40ec4f4b` / final checksum `6f15ff30` are required artifacts for bounded helper-parented/root-owned Projectile normal-hit GetHitVar sound typed audio telemetry. Focused tests cover trace preset requirements, required `helper`/`projectile`/`audio:playsnd` evidence, preserved helper-local `hitsound = S5,40/41/42`, FightFX `F7002`, owner/helper target links, and shared contact package metadata. Official Elecbyte State Controller docs were checked for `Projectile` taking HitDef parameters, helper-created Projectiles becoming root-owned, expression-capable numeric controller params, and `HitDef hitsound` / `guardsound`. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-helper-projectile-guard-ko.json` trace checksum `05dbcded` / final checksum `98b8bf17`, `synthetic-imported-helper-projectile-guard-kill.json` trace checksum `33930a00` / final checksum `8412e638`, and `synthetic-imported-helper-projectile-guard-terminal.json` trace checksum `c6937f42` / final checksum `e0835e33` are required artifacts for bounded helper-parented/root-owned Projectile guard-contact sound typed audio telemetry. Focused tests cover helper-local sound resolution, trace preset requirements, required `Helper`/`Projectile` controller evidence, typed `audio:playsnd`, preserved `guardsound = S6,0`, FightFX `F7004`, and shared contact package metadata. Official Elecbyte State Controller docs were checked for `Projectile` taking HitDef parameters, helper-created Projectiles becoming root-owned, expression-capable numeric controller params, and `HitDef hitsound` / `guardsound`. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-projectile-contact.json` trace checksum `57b3b556` / final checksum `e0f3e41c` and `synthetic-imported-projectile-guard.json` trace checksum `eb9c2e58` / final checksum `b1c74e5e` are required artifacts for bounded imported player-owned Projectile contact sound typed audio telemetry. Focused tests cover spawn-time sound resolution, contact presentation operation recording after Projectile contact, trace preset requirements, required `HitDef`/`Projectile` controller evidence, typed `audio:playsnd`, preserved attacker-side `S5,0` / `S6,0`, FightFX `F7002` / `F7004`, and shared contact package metadata. Official Elecbyte State Controller docs were checked for `Projectile` taking HitDef parameters, expression-capable numeric controller params, and `HitDef hitsound` / `guardsound`. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-hitdef-dynamic-hitsound.json` trace checksum `fe3c0f3d` / final checksum `855df386` and `synthetic-imported-hitdef-dynamic-guardsound.json` trace checksum `bb38362a` / final checksum `3e0ddeb0` remain required artifacts for bounded imported dynamic direct HitDef contact sound typed audio telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-sound-dynamic-pan.json` trace checksum `879afcf4` / final checksum `b780e5e9` and `synthetic-imported-sound-dynamic-value.json` trace checksum `bcdafe32` / final checksum `31b8a7b3` are required artifacts for bounded imported dynamic active-state audio typed telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-damage-scale-dynamic.json` trace checksum `3433b369` / final checksum `e3db6dd9` remains the required artifact for bounded imported dynamic `AttackMulSet` / `DefenceMulSet` typed telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-envcolor-dynamic.json` trace checksum `845c3d5e` / final checksum `282fc77f` remains the required artifact for bounded active imported dynamic EnvColor typed telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-afterimage-dynamic.json` trace checksum `e7299ac5` / final checksum `b946d805` remains the required artifact for bounded active imported dynamic AfterImage typed sprite-effect telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-angle-dynamic.json` checksum `13560dcd` / final checksum `4d7c4726` and `synthetic-imported-anglemul-dynamic.json` checksum `0bb54a1c` / final checksum `c9f2b557` remain required artifacts for bounded active imported dynamic Angle typed sprite-effect telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-palfx-dynamic.json` checksum `36cdca15` / final checksum `7a1a4525` remains the required artifact for bounded active imported dynamic `PalFX time/add/mul/color/invertall` typed sprite-effect telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-afterimagetime-dynamic.json` checksum `c5ef6fff` / final checksum `661a233d` remains the required artifact for bounded active imported dynamic `AfterImageTime value/time` typed sprite-effect telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-remappal-dynamic.json` checksum `5f04f2d4` / final checksum `71ad06f0` remains the required artifact for bounded active imported dynamic `RemapPal source/dest` typed sprite-effect telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-trans-dynamic.json` checksum `4bffcd82` / final checksum `5beea0f0` remains the required artifact for bounded active imported dynamic `Trans alpha` typed sprite-effect telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-resourceset-dynamic.json` checksum `1bd04945` / final checksum `35db4dcd` remains the required artifact for bounded active imported dynamic `LifeSet` / `PowerAdd` / `PowerSet` typed resource telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-lifeadd-dynamic.json` checksum `8b0493f8` / final checksum `cbe4ab51` remains the required artifact for bounded active imported dynamic `LifeAdd` typed resource telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-control-dynamic.json` checksum `885cc464` / final checksum `ecf2bec6` remains the required artifact for bounded active imported dynamic `CtrlSet` typed resource telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-statetypeset-dynamic.json` checksum `577404e4` / final checksum `083a76de` remains the required artifact for bounded active imported dynamic `StateTypeSet` typed metadata telemetry. Focused tests cover raw enum-expression fallback, runtime dispatcher operation recording, trace preset requirements, required `StateTypeSet` controller evidence, `variable:varset`, `metadata:statetypeset`, `hitdef` operation evidence, actor-frame `stateType = C` / `moveType = A` / `physics = N`, and final actor metadata. Official Elecbyte State Controller Reference was checked for `StateTypeSet` metadata semantics, and Elecbyte Trigger Reference was checked for `IfElse` branch-return semantics. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-screenbound-dynamic.json` checksum `9797bdfe` / final checksum `d76b641a` remains the required artifact for bounded active imported dynamic `ScreenBound` typed bounds telemetry. Focused tests cover raw expression fallback, runtime dispatcher operation recording, trace preset requirements, required `ScreenBound` controller evidence, `variable:varset`, `bounds:screenbound`, `kinematic:posadd` operation evidence, actor-frame `screenBound = false` / `moveCameraX = false` / `moveCameraY = true`, and stage-frame camera/clamp telemetry. Official Elecbyte State Controller Reference was checked for numeric-param expressions and `ScreenBound` one-tick screen/camera constraint semantics. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-posfreeze-dynamic.json` checksum `8de0c2e9` / final checksum `6c40bb79` remains the required artifact for bounded active imported dynamic `PosFreeze` typed bounds telemetry. Focused tests cover raw expression fallback, runtime dispatcher operation recording, trace preset requirements, required `PosFreeze` controller evidence, `variable:varset`, `bounds:posfreeze`, `hitdef` operation evidence, actor-frame `posFreezeX = true` / `posFreezeY = false`, and final actor `posFreeze` telemetry. Official Elecbyte State Controller Reference was checked for numeric-param expressions and `PosFreeze` one-tick position freeze semantics. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-helper-dynamic-posadd.json` checksum `97ec15d0` remains the required artifact for bounded helper-local dynamic `PosAdd` typed telemetry. Focused tests cover helper dispatcher operation recording, trace preset requirements, required `PosSet` seed evidence, required `PosAdd` controller evidence, `kinematic:posset` and `kinematic:posadd` operation evidence, actor-frame position telemetry, and helper effect payload state. Official Elecbyte State Controller Reference was checked for numeric-param expressions and `PosAdd` position-offset semantics. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-helper-dynamic-posset.json` checksum `50596bc2` remains a required artifact for bounded helper-local dynamic `PosSet` typed telemetry. Focused tests cover helper dispatcher operation recording, trace preset requirements, required `PosSet` controller evidence, `kinematic:posset` operation evidence, actor-frame position telemetry, and helper effect payload state. Official Elecbyte State Controller Reference was checked for numeric-param expressions and `PosSet` coordinate-set semantics. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-helper-dynamic-veladd.json` checksum `fbb8bcae` remains a required artifact for bounded helper-local dynamic `VelAdd` typed telemetry. Focused tests cover helper dispatcher operation recording, trace preset requirements, required `VelSet` and `VelAdd` controller evidence, `kinematic:velset` and `kinematic:veladd` operation evidence, actor-frame velocity telemetry, and helper effect payload state. Official Elecbyte State Controller Reference was checked for numeric-param expressions and `VelAdd` velocity-add semantics. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-helper-controller-param-parentroot.json` checksum `94919326` remains the required artifact for bounded helper-local dynamic `VelSet` typed telemetry. Focused tests cover helper telemetry bridging, helper dispatcher operation recording, trace preset requirements, required `VelSet` controller evidence, `kinematic:velset` operation evidence, actor-frame velocity telemetry, and helper effect payload state. Official Elecbyte State Controller Reference was checked for numeric-param expressions.

Previous focused runtime/port trace addendum: `synthetic-imported-dynamic-posadd.json` checksum `8ac604b1` remains a required artifact for bounded active-state dynamic `PosAdd` typed telemetry. Focused tests cover direct dispatcher position mutation, returned kinematic operation shape, trace preset requirements, controller order, required `variable:varset`, `kinematic:posset`, and `kinematic:posadd` evidence, and actor-frame position telemetry. Official Elecbyte State Controller Reference was checked for numeric-param expressions and `PosAdd` offset semantics.

Previous focused runtime/port trace addendum: `synthetic-imported-dynamic-posset.json` checksum `aeb730fb` remains a required artifact for bounded active-state dynamic `PosSet` typed telemetry. Focused tests cover direct dispatcher position mutation, returned kinematic operation shape, trace preset requirements, controller order, required `variable:varset` and `kinematic:posset` evidence, and actor-frame position telemetry. Official Elecbyte State Controller Reference was checked for numeric-param expressions and `PosSet` coordinate semantics.

Previous focused runtime/port trace addendum: `synthetic-imported-dynamic-velmul.json` checksum `4d241401` remains a required artifact for bounded active-state dynamic `VelMul` typed telemetry. Focused tests cover direct dispatcher velocity mutation, returned kinematic operation shape, trace preset requirements, controller order, required `variable:varset`, `kinematic:velset`, and `kinematic:velmul` evidence, and actor-frame velocity telemetry. Official Elecbyte State Controller Reference was checked for numeric-param expressions and `VelMul` velocity-multiply semantics.

Previous focused runtime/port trace addendum: `synthetic-imported-dynamic-veladd.json` checksum `daf99fb4` remains a required artifact for bounded active-state dynamic `VelAdd` typed telemetry. Focused tests cover direct dispatcher velocity mutation, returned kinematic operation shape, trace preset requirements, controller order, required `variable:varset`, `kinematic:velset`, and `kinematic:veladd` evidence, and actor-frame velocity telemetry.

Previous focused runtime/port trace addendum: `synthetic-imported-const-controller-param.json` checksum `2dad3a50` remains a required artifact for bounded `Const240p` / `Const480p` / `Const720p` player-local coordinate conversion inside active-state `VelSet` params. Focused tests cover trace preset requirements, controller order, required static and dynamic resolved `kinematic:velset` evidence, and actor-frame velocity telemetry. Official Elecbyte State Controller and Trigger references were checked for numeric-param expressions and player-coordinate width-ratio conversion. This adds no score movement.

Previous focused runtime/port trace addendum: `synthetic-imported-const-coordinate.json` checksum `ea879c1b` remains a required artifact for bounded `Const240p` / `Const480p` / `Const720p` player-local coordinate conversion in State -1 routing. Focused tests cover evaluator conversion, fallback width, nested numeric args, compiler support scanning, controller contexts, and trace preset routing. Official Elecbyte Trigger Reference was checked for width-ratio conversion into the player's coordinate space.

Previous focused runtime/port trace addendum: `synthetic-imported-config-gamespace.json` checksum `2f3c0a63` remains the required artifact for bounded INI `[Config] GameWidth` / `GameHeight` parsing plus runtime game-space override. Focused tests cover parser diagnostics, system/stage loader attachment, runtime game-space precedence, evaluator/context reads, and trace preset routing. Official Elecbyte coordinate-space and trigger docs were checked for `mugen.cfg` game coordinate dimensions, inverse zoom scaling, and non-zooming `ScreenWidth` / `ScreenHeight` semantics.

Previous focused runtime/port trace addendum: `synthetic-imported-screenspace.json` checksum `5330bacd` remains the required artifact for bounded `ScreenWidth` / `ScreenHeight` trigger support. Focused tests cover evaluator reads, compiler support, runtime expression contexts, controller expression contexts, and trace preset routing.

Previous focused runtime/port trace addendum: `synthetic-imported-gamespace.json` checksum `b6f248ab` remains the required artifact for bounded `GameWidth` / `GameHeight` trigger support through stage localcoord plus camera zoom.

Previous focused runtime/port trace addendum: owner-side and helper-local `ModifyProjectile` omitted-bound routes now preserve existing explicit Projectile bounds while still mutating non-bound payload fields. Required `synthetic-imported-modifyprojectile-omitted-bounds.json` checksum `24cbb1dc` / final checksum `e94d1480` and `synthetic-imported-helper-modifyprojectile-omitted-bounds.json` checksum `9db04bbc` / final checksum `555d744b` are the required artifacts. Focused tests cover both routes plus the existing `ModifyProjectile` regression set. Previous dynamic/static `ModifyProjectile` gates remain required: owner dynamic params `6ffbef92` / `5665a98e`, helper dynamic params `2d88a550` / `edb6d2d2`, owner dynamic bounds `e2f7a077` / `aa78704a`, helper dynamic bounds `f582153e` / `adc63407`, owner static bounds `63a87da1`, and helper static bounds `09d3f7e4`.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-localcoord-default-bounds-terminal.json` checksum `af7ee80e` / final checksum `3fcb4661` and `synthetic-imported-helper-projectile-localcoord-default-bounds-terminal.json` checksum `46b0164c` / final checksum `b1531c44` prove bounded 640x480 character localcoord-derived omitted Projectile defaults with visible terminal playback. Official Elecbyte docs define character `localcoord`, width-ratio coordinate translation, 480p omitted Projectile defaults, and Helper-created Projectiles as root-owned. Exact GameWidth/GameHeight negotiation, exact camera/screen/stage split, full localcoord scaling across all Projectile params/controllers, exact terminal timing, exact sprite/layer/palette parity, team/simul breadth, score movement, and full Projectile bounds parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-default-bounds-terminal.json` checksum `e85d7bbf` / final checksum `bea653fa` proves bounded helper-parented/root-owned Projectile official 240p omitted bounds defaults and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-stagebound-terminal.json` checksum `488ce550` / final checksum `dd0d956d` proves bounded helper-parented/root-owned Projectile explicit `projstagebound = 24` terminal playback and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-edgebound-terminal.json` checksum `8482f4f3` / final checksum `1ab7d718` proves bounded helper-parented/root-owned Projectile explicit `projedgebound = 24` terminal playback and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-heightbound-terminal.json` checksum `debb08b1` / final checksum `0821ec70` proves bounded helper-parented/root-owned Projectile explicit `projheightbound = -120,60` terminal playback and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-heightbound-terminal.json` checksum `1164a584` / final checksum `363aced8` proves bounded player-owned Projectile explicit `projheightbound = -120,60` terminal playback and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-edgebound-terminal.json` checksum `e4361063` / final checksum `6dcae566` proves bounded player-owned Projectile explicit `projedgebound = 24` terminal playback and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-stagebound-terminal.json` checksum `fe3df8e7` / final checksum `b467573f` proves bounded player-owned Projectile explicit `projstagebound = 24` terminal playback and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-bounds-remove-terminal.json` checksum `1d7479d3` / final checksum `39b81931` proves bounded player-owned Projectile generic bounds-removal terminal playback and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-remove-hit-fallback-terminal.json` checksum `0ed9e229` / final checksum `9cd6d27b` proves bounded helper-parented/root-owned Projectile timeout-removal fallback playback from omitted `projremanim` to authored `projhitanim = 1122` and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-cancel-remove-fallback-terminal.json` checksum `cf33c924` / final checksum `bd3a1279` proves bounded helper-parented/root-owned Projectile cancel-removal fallback playback from omitted `projcancelanim` to authored `projremanim = 1028` and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-cancel-remove-fallback-terminal.json` checksum `4966ed30` / final checksum `98170d08` proves bounded player-owned Projectile cancel-removal fallback playback from omitted `projcancelanim` to authored `projremanim = 921` and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-remove-hit-fallback-terminal.json` checksum `3bbdfbfc` / final checksum `76ca3f77` proves bounded player-owned Projectile timeout-removal fallback playback from omitted `projremanim` to authored `projhitanim = 920` and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-remove-terminal.json` checksum `8a65629c` / final checksum `7ba3479b` proves bounded player-owned Projectile timeout-removal terminal playback from authored `projremanim = 919` and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-guard-terminal.json` checksum `c6937f42` / final checksum `e0835e33` proves bounded helper-parented/root-owned Projectile guarded-contact terminal playback and remains required. That checkpoint passed 481/481 artifacts, 451 required and 30 optional.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-guard-terminal.json` checksum `26f1e7f9` / final checksum `f9df24d0` proves bounded player-owned Projectile guarded-contact terminal playback and remains required. That checkpoint passed 480/480 artifacts, 450 required and 30 optional.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-guard-kill.json` checksum `905eb8e3` / final checksum `c6cc7787` proves bounded player-owned Projectile `guard.kill = 0` nonlethal guard-chip clamp. The synthetic route executes imported Projectile id `77` with `damage = 31,2000` and explicit `guard.kill = 0`; it records typed projectile operation evidence, Projectile spawn/remove lifecycle evidence, target-link evidence, guard event/reason evidence, no KO round frame, and ends P2 at life `1`. That checkpoint passed 479/479 artifacts, 449 required and 30 optional. Official Elecbyte docs define Projectile as taking HitDef parameters, including `guard.kill`, and `guard.kill = 0` as the nonlethal chip clamp. Exact KO slowdown/lifebar/guard-finish timing, exact no-KO guard recovery timing, team/simul guard KO/no-KO breadth, score movement, and full Projectile guard round-flow parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-guard-kill.json` checksum `33930a00` / final checksum `8412e638` proves bounded helper-parented/root-owned Projectile `guard.kill = 0` nonlethal guard-chip clamp. The synthetic route spawns helper `p1-helper-0`, then root-owned Projectile `p1-projectile-0` with parent `p1-helper-0`, `damage = 18,2000`, and explicit `guard.kill = 0`; it records typed helper/projectile operation evidence, helper/projectile spawn+active evidence, owner/helper target-link evidence, guard event/reason evidence, helper branch state `1313`, no KO round frame, and ends P2 at life `1`. That checkpoint passed 478/478 artifacts, 448 required and 30 optional.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-guard-ko.json` checksum `05dbcded` / final checksum `98b8bf17` proves bounded helper-parented/root-owned Projectile default lethal guard-chip KO. The synthetic route spawns helper `p1-helper-0`, then root-owned Projectile `p1-projectile-0` with parent `p1-helper-0`, `damage = 18,2000`, and default `guard.kill`; it records typed helper/projectile operation evidence, helper/projectile spawn evidence, owner/helper target-link evidence, guard event/reason evidence, round KO winner/message evidence, and ends P2 at life `0`. That checkpoint passed 477/477 artifacts, 447 required and 30 optional.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-guard-ko.json` checksum `2285474a` / final checksum `c968c723` proves bounded player-owned Projectile default lethal guard-chip KO. The synthetic route executes an imported Projectile with `damage = 31,2000` and default `guard.kill`, records typed `projectile` operation evidence, Projectile lifecycle and target-link evidence, guard event/reason evidence, round KO winner/message evidence, and ends P2 at life `0`. That checkpoint passed 476/476 artifacts, 446 required and 30 optional.

Previous required runtime/port trace addendum: `synthetic-imported-hitdef-guard-ko.json` checksum `b7db75f4` / final checksum `0f9afa50` proves bounded default lethal direct guard-chip KO. The synthetic route executes a guarded imported direct `HitDef` with `guard.damage = 2000` and default `guard.kill`, records typed `hitdef` operation evidence, guard event/reason evidence, round KO winner/message evidence, and ends P2 at life `0`. That checkpoint passed 475/475 artifacts, 445 required and 30 optional.

Previous required runtime/port trace addendum: `synthetic-imported-guarddist-reversal-no-contact.json` checksum `ca20c823` / final checksum `2bc9b86d` proves bounded negative `guard.dist` / `ReversalDef` priority. The synthetic route executes a guardable imported direct `HitDef` with `guard.dist = 96` in the near-but-not-contacting guard-distance stage while P2 has active `ReversalDef p1stateno = 777` / `p2stateno = 888` and an explicit `InGuardDist` guard-start route. It records typed `hitdef` and `reversaldef` operation evidence, P2 state-0 `ReversalDef` controller events, guard-start `ChangeState` evidence, whiff combat reason, forbids reversal/get-hit/guard-hit states `777`, `888`, `5000`, `150`, and `151`, and ends P2 in state/action `130` with life `1000`. That checkpoint passed 474/474 artifacts, 444 required and 30 optional. Official Elecbyte docs define `guard.dist` guard-entry distance and ReversalDef Clsn1/Clsn1 contact. Exact guard-distance boxes, positive proximity-only `guard.dist` ReversalDef contact, exact guard-start timing, custom-state breadth beyond direct routes, projectile reflection/removal semantics after reversal, helper-owned custom-state tables, exact attr grammar, hitpause/tick order, multi-projectile/multi-target/team breadth, score movement, and full ReversalDef/guard parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-walkback-guard-reversal.json` checksum `70c83b8c` / final checksum `b7a8cb9d` proves bounded authored walk-back state `20` `ReversalDef` priority and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-air-guard-reversal.json` checksum `966b17b8` / final checksum `2fa19142` proves bounded air guard-input `ReversalDef` priority and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-crouch-guard-reversal.json` checksum `405f475e` / final checksum `d1f39c08` proves bounded crouch guard-input `ReversalDef` priority and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-guard-reversal.json` checksum `6f8df3a4` / final checksum `e0771a15` proves bounded stand guard-input `ReversalDef` priority and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-custom-state-reversal.json` checksum `18065db0` / final checksum `ac8d0073` proves bounded direct custom-state `ReversalDef` priority and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-reversal.json` checksum `a1d82380` / final checksum `ca66a49a` proves bounded helper-parented/root-owned Projectile `ReversalDef` priority and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-reversal.json` checksum `5c4ddf48` / final checksum `bb0bbb99` proves bounded player-owned Projectile `ReversalDef` priority and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-superpause-unhittable.json` checksum `1598af8f` / final checksum `f59f5704` proves bounded imported default SuperPause `unhittable = 1` source immunity. The synthetic route executes imported SuperPause while a demo striker attempts same-tick direct contact, records `pause:superpause` operation evidence, requires match-pause/freeze evidence, requires reject event substring `via SuperPause unhittable`, and observes final P1 life `1000`. That checkpoint passed 466/466 artifacts, 436 required and 30 optional. Official Elecbyte State Controller docs define `unhittable` as making the player unable to be hit during SuperPause by default and `unhittable = 0` as the opt-out. Exact MUGEN/IKEMEN projectile/helper/team breadth, broader reversal priority, exact pause layering, renderer/super-background presentation, score movement, and full SuperPause parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-superpause-pausebg.json` checksum `49bcfe16` / final checksum `397a8fae` proves bounded imported SuperPause `pausebg = 0` metadata. The synthetic route executes `SuperPause pausebg = 0`, records `hitdef` and `pause:superpause` operation evidence, requires match-pause/freeze evidence, and observes required `pauseBg = false`. That checkpoint passed 465/465 artifacts, 435 required and 30 optional. Official Elecbyte State Controller docs define `pausebg = 0` as letting the background continue updating during pause and default `pausebg = 1` as stopping it. Actual renderer/background update parity, exact stage/BGCtrl pause timing, renderer visual suppression/playback parity, actual FightFX/common asset lookup/rendering, dynamic `S` player-AIR prefix breadth, super backgrounds, helper/team/redirect ownership, score movement, and full super presentation parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-superpause-anim-disabled.json` checksum `fc7a2ca4` / final checksum `5be3ca6c` proves bounded imported SuperPause `anim = -1` metadata suppression.

Previous required runtime/port trace addendum: `synthetic-imported-superpause-default-anim.json` checksum `318c5e9f` / final checksum `747e7619` proves bounded imported SuperPause omitted-`anim` default metadata.

Previous required runtime/port trace addendum: `synthetic-imported-superpause-dynamic-anim-pos.json` checksum `e6bfbf75` / final checksum `eb49d9db` proves bounded imported dynamic `SuperPause anim/pos` telemetry. The synthetic route seeds `var(6)=7001`, `var(7)=18`, and `var(8)=-36`, executes `anim = var(6)` and `pos = var(7),var(8)`, records `variable:varset`, `hitdef`, and `pause:superpause` operation evidence, requires match-pause/freeze evidence, and observes `superAnim` metadata `raw = var(6)`, `source = fightfx`, `actionNo = 7001`, and `offset = 18,-36`.

Previous required runtime/port trace addendum: `synthetic-imported-superpause-anim-pos.json` checksum `f7dcdc9d` / final checksum `7bd4afe8` proves bounded imported explicit `SuperPause anim/pos` telemetry. The synthetic route executes `anim = S200` and `pos = 24,-48`, records `hitdef` and `pause:superpause` operation evidence, requires match-pause/freeze evidence, and observes `superAnim` metadata `raw = S200`, `source = player`, `actionNo = 200`, and `offset = 24,-48`. That checkpoint passed 461/461 artifacts, 431 required and 30 optional.

Previous required runtime/port trace addendum: `synthetic-imported-superpause-dynamic-params.json` current checksum `052bb481` / final checksum `1847a3f3` proves bounded imported dynamic `SuperPause time/movetime/darken/poweradd` fallback. The synthetic route seeds `var(2)=9`, `var(3)=2`, `var(4)=0`, and `var(5)=75`, executes `SuperPause time = var(2), movetime = var(3), darken = var(4), poweradd = var(5)`, records `variable:varset`, `hitdef`, and `pause:superpause` operation evidence, requires match-pause/freeze and source-movetime evidence, and observes final P1 power `75`. Current checksum includes default `superAnim` metadata from the default-anim cut. Official Elecbyte State Controller docs define numeric controller-expression behavior, `Pause movetime`, and `SuperPause time/darken/poweradd`. Typed-operation lowering for dynamic pause params, bottom-to-zero exactness, Pause-over-Pause/SuperPause preemption/delay, `pausebg`, `unhittable`, super backgrounds, helper/team/redirect ownership, score movement, and full pause VM parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-superpause-p2defmul.json` current checksum `ec1ba95e` / final checksum `6d009665` proves bounded imported positive `SuperPause p2defmul` target damage scaling. The synthetic route executes `SuperPause p2defmul = 2` after direct target memory exists, records `hitdef`, `pause:superpause`, and `target:targetlifeadd` operation evidence, requires match-pause/freeze and source-movetime evidence, and observes final P2 life `953` after the initial hit leaves P2 at `963` and a later non-absolute `TargetLifeAdd -20` applies as `-10`. Current checksum includes default `superAnim` metadata from the default-anim cut. Official Elecbyte State Controller docs define numeric controller-expression behavior, `SuperPause p2defmul`, and `TargetLifeAdd` defense scaling. `p2defmul = 0` / `Super.TargetDefenceMul`, exact recovery lifetime, stacking, helper/redirect/multi-target ownership, score movement, and full super damage-scaling parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-superpause-sound.json` checksum `de3ac4b2` / final checksum `6e227fe6` proves bounded imported `SuperPause sound` fallback. The synthetic route seeds `var(0)=10` and `var(1)=0`, executes `SuperPause sound = Svar(0),var(1)`, records `variable:varset`, `hitdef`, and `pause:superpause` operation evidence, requires match-pause/freeze evidence, and observes attacker-side sound telemetry for group `10`, index `0`, raw `Svar(0),var(1)` while typed `audio:*` operation evidence stays absent. Current checksum includes default `superAnim` metadata from the default-anim cut. Official Elecbyte State Controller docs define `SuperPause sound = snd_grp, snd_no` and numeric controller-expression behavior. Exact common/player SND archive lookup, channel priority/timing/mixing, super-background audio, helper/redirect ownership, score movement, and full audio parity remain blocked.

Superseded required runtime/port trace addendum: `synthetic-imported-hitdef-dynamic-guardsound.json` previously checksumed `cb061b1c` / final checksum `8d25e54e` as bounded imported guarded direct `HitDef guardsound` fallback without typed `audio:*` operation evidence. The current checksum `bb38362a` / final checksum `3e0ddeb0` keeps the guard contact sound telemetry and adds typed `audio:playsnd` for `F6,4`.

Superseded required runtime/port trace addendum: `synthetic-imported-hitdef-dynamic-hitsound.json` previously checksumed `c891e888` / final checksum `a0d1bbfc` as bounded imported direct `HitDef hitsound` fallback without typed `audio:*` operation evidence. The current checksum `fe3c0f3d` / final checksum `855df386` keeps the hit contact sound telemetry and adds typed `audio:playsnd` for `F5,4`.

Previous required runtime/port trace addendum: `synthetic-imported-sound-dynamic-value.json` checksum `cd0bf458` / final checksum `0ded35cd` proves bounded active imported dynamic `PlaySnd value` fallback. The synthetic route seeds `var(0)=5` and `var(1)=3`, executes `PlaySnd value = Fvar(0),var(1), channel = 4`, requires `PlaySnd` controller evidence, records `variable:varset` and `hitdef` operation evidence, intentionally has no typed `audio:*` operation evidence, and observes sound event telemetry for group `5`, index `3`, channel `4`, and `soundPrefix = kfm`. That checkpoint passed 455/455 artifacts, 425 required and 30 optional. Official Elecbyte State Controller docs define `PlaySnd value = group_no, sound_no`, F-prefixed common/fight sound lookup, and numeric controller-expression behavior. SuperPause sound refs, typed-operation lowering for dynamic audio params, exact Web Audio archive lookup/panning/channel priority/timing/mixing, helper/redirect ownership, score movement, and full audio parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-sound-dynamic-pan.json` checksum `24c0cce2` / final checksum `dea16ed4` proves bounded active imported dynamic audio numeric fallback. The synthetic route seeds `var(0)=-24`, `var(1)=2`, and `var(2)=64`, executes `PlaySnd value = S5,2, channel = var(1), pan = var(0)`, `SndPan channel = var(1), abspan = var(2)`, and `StopSnd channel = var(1)`, requires `PlaySnd`, `SndPan`, and `StopSnd` controller evidence, records `variable:varset` and `hitdef` operation evidence, intentionally has no typed `audio:*` operation evidence, and observes sound events for `PlaySnd` channel `2` pan `-24`, `SndPan` channel `2` absPan `64`, and `StopSnd` channel `2`. That checkpoint passed 454/454 artifacts, 424 required and 30 optional. Official Elecbyte State Controller docs define `SndPan`, `StopSnd`, PlaySnd panning linkage, and numeric controller-expression behavior. Typed-operation lowering for dynamic audio params, exact Web Audio panning, channel priority/timing/mixing, helper/redirect ownership, score movement, and full audio parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-playerpush-dynamic.json` checksum `b7775652` / final checksum `92aca1cd` proves bounded active imported dynamic `PlayerPush value` typed collision telemetry. The synthetic route seeds `var(0)=0`, executes `PlayerPush value = var(0)`, requires `PlayerPush` controller evidence, records `variable:varset`, `hitdef`, and typed `collision:playerpush` operation evidence after runtime expression resolution, and observes actor-frame/final `playerPush = false`. That checkpoint passed 517/517 artifacts, 486 required and 31 optional. Official Elecbyte State Controller docs define `PlayerPush value` and numeric controller-expression behavior. Exact overlap resolution, team/helper ownership, exact tick order, score movement, and full constraint parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-width-dynamic.json` checksum `51554c91` / final checksum `84a85277` proves bounded active imported dynamic `Width player` typed collision telemetry. The synthetic route seeds `var(0)=21` and `var(1)=43`, executes `Width player = var(0),var(1)`, requires `Width` controller evidence, records `variable:varset`, `hitdef`, and typed `collision:width` operation evidence after runtime expression resolution, and observes actor-frame/final body-width telemetry `front = 21`, `back = 43`. That checkpoint passed 517/517 artifacts, 486 required and 31 optional. Official Elecbyte State Controller docs define `Width player/value` and numeric controller-expression behavior. `edge` width parity, exact push overlap, team/helper ownership, exact tick order, score movement, and full constraint parity remain blocked.

Superseded runtime/port trace addendum: `synthetic-imported-envcolor-dynamic.json` previously checksumed `dbe548a7` / final checksum `2ff8dd42` proved bounded active imported dynamic `EnvColor value/time/under` fallback without typed `envcolor` evidence. Current checksum `845c3d5e` / final checksum `282fc77f` upgrades the same route to require typed `envcolor` operation evidence after runtime expression resolution while retaining stage-frame telemetry `color = 32,128,240`, `under = true`. `pnpm qa:trace` passes 523/523 artifacts, 492 required and 31 optional. Official Elecbyte State Controller and CNS docs define `EnvColor value/time/under` and numeric controller-expression behavior. Exact MUGEN/IKEMEN blend math, layer/window behavior, pause timing, renderer parity, score movement, and full presentation parity remain blocked.

Current required runtime/port trace addendum: `synthetic-imported-envshake-dynamic.json` checksum `e1bf593f` / final checksum `8f52f1f4` proves bounded active imported dynamic `EnvShake time/freq/ampl/phase` typed telemetry. The synthetic route seeds `var(0)=18`, `var(1)=45`, `var(2)=-9`, and `fvar(0)=0.25`, executes `EnvShake time = var(0), freq = var(1), ampl = var(2), phase = fvar(0)`, requires `EnvShake` controller evidence, records `variable:varset`, `envshake`, and `hitdef` operation evidence, and observes runtime env-shake telemetry `time = 18`, `freq = 45`, `ampl = -9`, and `phase = 0.25`. That checkpoint passed 523/523 artifacts, 492 required and 31 optional. Official Elecbyte State Controller docs define `EnvShake time` as required duration, `freq` as shake speed, `ampl` as amplitude, and `phase` as phase offset. `mul`, exact MUGEN/IKEMEN camera waveform, pause/stage/layer interaction, helper ownership, screenpack ownership, score movement, and full presentation parity remain blocked.

Superseded required runtime/port trace addendum: `synthetic-imported-anglemul-dynamic.json` previously checksumed `418ed880` / final checksum `4a6a3045` proved bounded active imported dynamic `AngleMul value` fallback without typed `sprite-effect:angleset` / `sprite-effect:anglemul` evidence. Current checksum `0bb54a1c` / final checksum `c9f2b557` upgrades the same route to require typed `sprite-effect:angleset`, `sprite-effect:anglemul`, and `sprite-effect:angledraw` telemetry after runtime expression resolution while retaining imported actor-frame `renderAngle = 45`. Exact MUGEN/IKEMEN axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, score movement, and full presentation parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-anglemul.json` checksum `e0dae072` / final checksum `5048aa5c` proves bounded active imported static `AngleMul value` lowering. The synthetic route executes `AngleSet value = 30`, `AngleMul value = 1.5`, and `AngleDraw`, requires `AngleSet`, `AngleMul`, and `AngleDraw` controller evidence, records typed `sprite-effect:angleset`, `sprite-effect:anglemul`, and `sprite-effect:angledraw` operation evidence, and observes imported actor-frame `renderAngle = 45`. That checkpoint passed 448/448 artifacts, 418 required and 30 optional. Exact MUGEN/IKEMEN axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, score movement, and full presentation parity remain blocked.

Superseded required runtime/port trace addendum: `synthetic-imported-angle-dynamic.json` previously checksumed `8f788bf8` proved bounded active imported dynamic `AngleSet value`, `AngleAdd value`, and `AngleDraw value/scale` expression fallback without typed `sprite-effect:angle*` evidence. Current checksum `13560dcd` / final checksum `4d7c4726` upgrades the same route to require typed `sprite-effect:angleset`, `sprite-effect:angleadd`, and `sprite-effect:angledraw` telemetry after runtime expression resolution while retaining imported actor-frame/final `renderAngle = 35` plus `renderScale = 2,0.5`. Exact MUGEN/IKEMEN axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, score movement, and full presentation parity remain blocked.

Superseded required runtime/port trace addendum: `synthetic-imported-afterimagetime-dynamic.json` previously checksumed `16edc106` proved bounded active imported dynamic `AfterImageTime value/time` expression fallback without typed operation evidence. Current checksum `c5ef6fff` / final checksum `661a233d` upgrades the same route to require `sprite-effect:afterimagetime` after runtime expression resolution while preserving imported actor-frame/final ghost-trail telemetry. Official Elecbyte State Controller docs allow numeric controller params as expressions and define `AfterImageTime` `time` plus alternate `value`. Exact no-active-afterimage behavior, trail blending, palette math, sampling cadence, renderer parity, helper/redirect ownership, score movement, and full MUGEN/IKEMEN presentation parity remain blocked.

Superseded required runtime/port trace addendum: `synthetic-imported-afterimage-dynamic.json` previously checksumed `2342c3f1` as bounded active imported dynamic `AfterImage` expression fallback without typed operation evidence. The current upgraded route uses trace checksum `e7299ac5` / final checksum `b946d805`, requires `sprite-effect:afterimage` after runtime expression resolution, and retains imported actor-frame/final `afterImageTime = 18`, `afterImageLength = 5`, `afterImageTimeGap = 2`, `afterImageFrameGap = 3`, at least one ghost-trail sample, and opacity `0.34`. Official Elecbyte State Controller docs allow numeric controller params as expressions and define `AfterImage` time/length/gap/palette/trans params. Exact trail blending, palette math, sampling cadence, renderer parity, helper/redirect ownership, score movement, and full MUGEN/IKEMEN presentation parity remain blocked.

Superseded required runtime/port trace addendum: `synthetic-imported-trans-dynamic.json` previously checksumed `91a7baf9` proved bounded active imported dynamic `Trans alpha` expression fallback without typed operation evidence. Current checksum `4bffcd82` / final checksum `5beea0f0` requires `sprite-effect:trans` after runtime expression resolution while retaining imported actor-frame/final `renderOpacity = 0.375`. Official Elecbyte State Controller docs allow numeric controller params as expressions and define `Trans alpha = source_alpha, dest_alpha`. Dynamic typed lowering for other sprite-effect params, exact add/sub alpha math, palette/remap interaction, draw-order parity, renderer parity, helper/redirect ownership, score movement, and full MUGEN/IKEMEN presentation parity remain blocked.

Superseded required runtime/port trace addendum: `synthetic-imported-palfx-dynamic.json` previously checksumed `c56e955a` proved bounded active imported dynamic `PalFX` expression fallback without typed operation evidence. Current checksum `36cdca15` / final checksum `7a1a4525` upgrades the same route to require `sprite-effect:palfx` after runtime expression resolution while retaining imported actor-frame/final `paletteFx.time = 12`, `add [64,-16,255]`, `mul [224,144,256]`, `color = 200`, and `invert = true`. Official Elecbyte State Controller docs allow numeric controller params as expressions and define `PalFX` material params. `sinadd`, exact palette math/blend/remap order, ACT/SFF pixel parity beyond existing bounded handoff, renderer parity, helper/redirect ownership, score movement, and full MUGEN/IKEMEN presentation parity remain blocked.

Superseded runtime/port trace addendum: `synthetic-imported-sprpriority-dynamic.json` previously checksumed `b57c1bfa` proved bounded active imported dynamic `SprPriority value` expression fallback without typed operation evidence. Current checksum `a9e0862d` / final checksum `4919326d` requires `VarSet`, `SprPriority`, `variable:varset`, `sprite-effect:sprpriority`, `hitdef`, actor-frame `spritePriority = 4`, and final owner `spritePriority = 4` after runtime expression resolution. Dynamic typed lowering for other sprite-effect params, exact layer/shadow/helper/Explod draw-order parity, renderer parity, helper/redirect ownership, score movement, and full MUGEN/IKEMEN presentation parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-remappal-dynamic.json` checksum `a44ec542` proves bounded active imported dynamic `RemapPal` source/dest expression fallback. The synthetic route seeds `var(0) = 5` and `var(1) = 7`, executes `source = 1,var(0)` and `dest = 2,var(1)`, requires `VarSet` plus `RemapPal` controller evidence, and observes final imported actor `paletteRemap` `source [1,5] -> dest [2,7]`. That checkpoint passed 441/441 artifacts, 411 required and 30 optional. Official Elecbyte State Controller docs allow numeric controller params as expressions and define `RemapPal source/dest`. Typed-operation lowering for dynamic params, exact source-bank/default/removal semantics, ACT/SFF pixel parity, truecolor/PNG remap, helper/redirect ownership, exact PalFX ordering/math, score movement, and full MUGEN/IKEMEN palette parity remain blocked.

Previous focused R2 runtime ownership addendum: active-state `RemapPal` now routes through the sprite-effect side-effect boundary instead of the generic runtime-controller path. `StateProgramExecutor` classifies `RemapPal` as side-effect `remappal`, `RuntimeActiveSideEffectDispatchWorld` forwards it through `spriteEffect`, and `RuntimeSpriteEffectControllerWorld` hands typed `sprite-effect:remappal` operations into `RuntimeSpriteEffectWorld.applyRemapPal` for bounded `paletteRemap` mutation while `StateControllerExecutor` keeps dynamic raw fallback via a resolver. Focused verification passed 4 files / 68 tests. This is ownership cleanup only; it does not add exact source-bank semantics, truecolor/PNG remap, helper/redirect palette ownership, exact PalFX ordering, score movement, or full palette parity.

Historical runtime table override at 509/509: the then-latest required runtime trace was `synthetic-imported-const-controller-param.json` checksum `2dad3a50`, proving bounded imported active-state `VelSet` params can evaluate `Const240p(3) + Const480p(6)` to velocity `12` and `0 - Const720p(12)` to velocity `-6` for a 640x480 player localcoord while emitting static and dynamic resolved `kinematic:velset` telemetry. Previous const/config/screen/game-space, owner/helper `ModifyProjectile`, dynamic params, dynamic bounds, and paired player/helper Projectile localcoord default-bounds gates, `synthetic-imported-const-coordinate.json` checksum `ea879c1b`, `synthetic-imported-config-gamespace.json` checksum `2f3c0a63`, `synthetic-imported-screenspace.json` checksum `5330bacd`, `synthetic-imported-gamespace.json` checksum `b6f248ab`, `synthetic-imported-modifyprojectile-omitted-bounds.json` checksum `24cbb1dc` / final checksum `e94d1480`, `synthetic-imported-helper-modifyprojectile-omitted-bounds.json` checksum `9db04bbc` / final checksum `555d744b`, `synthetic-imported-modifyprojectile-dynamic-params.json` checksum `6ffbef92` / final checksum `5665a98e`, `synthetic-imported-helper-modifyprojectile-dynamic-params.json` checksum `2d88a550` / final checksum `edb6d2d2`, `synthetic-imported-helper-modifyprojectile-dynamic-bounds.json` checksum `f582153e` / final checksum `adc63407`, `synthetic-imported-modifyprojectile-dynamic-bounds.json` checksum `e2f7a077` / final checksum `aa78704a`, `synthetic-imported-projectile-localcoord-default-bounds-terminal.json` checksum `af7ee80e` / final checksum `3fcb4661`, and `synthetic-imported-helper-projectile-localcoord-default-bounds-terminal.json` checksum `46b0164c` / final checksum `b1531c44`, remain required. Current global evidence is 524/524 as recorded in the lane checkpoint near the top.

Previous required runtime/port trace addendum: `synthetic-imported-assertspecial-juggle-telemetry.json` checksum `9436dfa0` proves bounded official `AssertSpecial NoJuggleCheck` telemetry. Static `NoJuggleCheck` lowers into typed `assertspecial` operation evidence, runtime execution stores `noJuggleCheck`, and final imported actor evidence requires normalized `assertSpecialFlags: ["nojugglecheck"]`. Official Elecbyte `AssertSpecial` docs list `nojugglecheck`. That checkpoint passed 440/440 artifacts, 410 required and 30 optional. Juggle-point accounting, actual juggle bypass behavior, helper/team/global ownership, pause layering, score movement, and full MUGEN/IKEMEN juggle parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projtime-same-id-last-contact.json` checksum `4e74aec3` proves bounded helper-local same-ID `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` guard-then-hit last-contact-kind arbitration. Two root-owned helper-parented Projectiles share id `8918`; guard contact first emits `S6,34`, FightFX `F7038`, and `sparkxy = 35,-77`, later hit emits `S5,35`, FightFX `F7038`, and `sparkxy = 36,-78`. Helper route `1200 -> 1306 -> 1307` reads fixed-id plus ID `0` hit/contact times while fixed-id plus ID `0` guarded times are inactive, with forbidden helper trap state `1308`, two Projectile controller/op executions, helper/projectile lifecycle rows, owner/root `p1`, parent `p1-helper-0`, and owner target-link id `8918`. That checkpoint passed 439/439 artifacts, 409 required and 30 optional. Exact Proj*Time tick order/lifetime, helper custom-state breadth beyond these routes, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, visual/audio parity beyond the bounded packages, score movement, and full Projectile parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projtime-same-id-hit-then-guard.json` checksum `f4c1da3b` proves bounded helper Projectile same-ID hit-then-guard `Proj*Time` last-contact-kind arbitration and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-projtime-same-id-hit-then-guard.json` checksum `d49ee334` proves bounded player Projectile same-ID hit-then-guard `Proj*Time` last-contact-kind arbitration and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-projtime-same-id-last-contact.json` checksum `fb4c2450` proves bounded player Projectile same-ID guard-then-hit `Proj*Time` last-contact-kind arbitration and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-projhittime-multi-id.json` checksum `5d897825`, `synthetic-imported-projectile-projcontacttime-multi-id.json` checksum `d9b3cecf`, and `synthetic-imported-projectile-projguardedtime-multi-id.json` checksum `e52d0d01` prove bounded player Projectile fixed-id plus ID `0` `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` arbitration across two live Projectiles and remain required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-projhit-multi-id.json` checksum `ab0f3fb3` and `synthetic-imported-projectile-projguarded-multi-id.json` checksum `023921e3` prove bounded player Projectile fixed-id plus any-id `ProjHit` / `ProjGuarded` arbitration across two live Projectiles and remain required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-projcontact-multi-id.json` checksum `e790ec3e` proves bounded player Projectile fixed-id plus any-id `ProjContact` arbitration across two live Projectiles and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-projcontact-suffix-any.json` checksum `2fb80418` proves bounded player Projectile omitted-ID / ID `0` any-projectile legacy `ProjContact` suffix syntax and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-projhit-suffix-any.json` checksum `35ffd57d` and `synthetic-imported-projectile-projguarded-suffix-any.json` checksum `4000bc4f` prove bounded player Projectile omitted-ID / ID `0` any-projectile legacy `ProjHit` and `ProjGuarded` suffix syntax and remain required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-projhit-suffix.json` checksum `dd3db5ee` and `synthetic-imported-projectile-projguarded-suffix.json` checksum `80bbe439` prove bounded fixed-id player Projectile legacy `ProjHit[ID] = value, [oper] value2` and `ProjGuarded[ID] = value, [oper] value2` suffix syntax and remain required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-projcontact-suffix.json` checksum `c904ded7` proves bounded player Projectile legacy `ProjContact[ID] = value, [oper] value2` suffix syntax and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-projcontactpersist.json` checksum `8e678b1b` proves bounded player Projectile `ProjContact` state-transition behavior and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projcontactpersist.json` checksum `65639428` proves bounded helper Projectile `ProjContact` state-transition behavior and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-helper-movereversedpersist.json` checksum `ef8ffdf5` proves bounded helper-owned reversed `StateDef movehitpersist` behavior and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-helper-moveguardedpersist.json` checksum `d5ce7897` proves bounded helper-owned guarded `StateDef movehitpersist` behavior and remains required. Previous helper hit-route `synthetic-imported-helper-movehitpersist.json` checksum `2354ef95` remains required too.

Previous required runtime/port trace addendum: `synthetic-imported-helper-hitcountpersist.json` checksum `fc9588d8` proves bounded helper-owned `StateDef hitcountpersist` behavior and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-helper-hitdefpersist.json` checksum `9d5c64c4` proves bounded helper-owned `StateDef hitdefpersist` behavior and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-hitdefpersist.json` checksum `4bb3e86c` proves bounded direct `StateDef hitdefpersist` behavior and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-movehitpersist.json` checksum `5c1ef583` proves bounded direct `StateDef movehitpersist` behavior and remains required.

Previous required runtime/port trace addendum: `synthetic-imported-hitcountpersist.json` checksum `6f032088` proves bounded direct `StateDef hitcountpersist` behavior and remains required.

Previous required runtime/port trace addendum, upgraded by the player/helper typed-audio cuts: `synthetic-imported-projectile-hitcount.json` trace checksum `ee8f4e19` / final checksum `0fd4adf8` and `synthetic-imported-helper-projectile-hitcount.json` trace checksum `c8f5dc55` / final checksum `e1569fab` prove bounded Projectile/helper normal-hit attacker-side `HitCount` / `UniqHitCount` contact memory. Both routes now require typed `audio:playsnd` and FightFX `F7002` package telemetry, with player `S5,44` and helper-local `S5,43`. That checkpoint remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-gethitvar-hitcount.json` trace checksum `df2619f9` / final checksum `5469bc69` and upgraded `synthetic-imported-helper-projectile-gethitvar-hitcount.json` trace checksum `40ec4f4b` / final checksum `6f15ff30` prove bounded Projectile/helper normal-hit `GetHitVar(hitcount)` metadata, with player/helper typed `audio:playsnd`, `S5,47/S5,42`, and FightFX `F7002` package telemetry. That checkpoint remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-gethitvar-hitid-chainid.json` trace checksum `4356b5cb` / final checksum `4b270d45` and upgraded `synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json` trace checksum `616e0b2c` / final checksum `0aebcc73` prove bounded Projectile/helper normal-hit `GetHitVar(hitid/chainid)` metadata, with player/helper typed `audio:playsnd`, `S5,46/S5,41`, and FightFX `F7002` package telemetry. That checkpoint remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-gethitvar-hit-metadata.json` trace checksum `8e5df79b` / final checksum `4d078c5d` and upgraded `synthetic-imported-helper-projectile-gethitvar-hit-metadata.json` trace checksum `28afbcea` / final checksum `c960b1cf` prove bounded Projectile/helper normal-hit `GetHitVar(damage/hittime/xvel/yvel)` metadata, with player/helper typed `audio:playsnd`, `S5,45/S5,40`, and FightFX `F7002` package telemetry. That checkpoint remains required.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-guard-slide-stop.json` trace checksum `965c2d12` / final checksum `0973a73c` and `synthetic-imported-helper-projectile-guard-slide-stop.json` trace checksum `6c42a378` / final checksum `df8b7a42` extend the existing direct `synthetic-imported-default-guard-slide-stop.json` proof to player-owned Projectile and helper-parented Projectile routes. That `pnpm qa:trace` pass was 405/405 artifacts, 375 required and 30 optional. Exact guard control tick order, HitOver vs CtrlSet parity, proximity guard, guard effects, guard velocity decay/friction, wall friction, visual/audio guard effects, score movement, and full guard/projectile parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-guard-velocity-default.json` checksum `e6bd9b40`, `synthetic-imported-projectile-guard-velocity-default.json` checksum `b72451a4`, and `synthetic-imported-helper-projectile-guard-velocity-default.json` checksum `2067ba99` prove official default `guard.velocity` derivation for direct HitDef, player-owned Projectile, and helper-parented Projectile routes. That `pnpm qa:trace` pass was 400/400 artifacts, 370 required and 30 optional. Exact guard velocity decay/friction, wall friction, visual/audio guard effects, score movement, and full guard/projectile parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-guard-cornerpush-default.json` checksum `95293bc4`, `synthetic-imported-projectile-guard-cornerpush-default.json` checksum `58798e7a`, and `synthetic-imported-helper-projectile-guard-cornerpush-default.json` checksum `292b2015` prove bounded default `guard.cornerpush.veloff` derivation for direct HitDef, player-owned Projectile, and helper-parented Projectile routes. That `pnpm qa:trace` pass was 397/397 artifacts, 367 required and 30 optional. Exact guard timing/effects, corner-push timing/decay, wall friction, visual/audio guard effects, score movement, and full guard/projectile parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-air-hit-cornerpush-default.json` checksum `73129a04`, `synthetic-imported-projectile-air-hit-cornerpush-default.json` checksum `9bfae4d6`, and `synthetic-imported-helper-projectile-air-hit-cornerpush-default.json` checksum `9c81047d` prove bounded default `air.cornerpush.veloff` derivation for direct HitDef, player-owned Projectile, and helper-parented Projectile routes. That `pnpm qa:trace` pass was 388/388 artifacts, 358 required and 30 optional. Exact corner-push timing/decay, wall friction, exact air get-hit physics/timing, visual/audio hit effects, score movement, and full Common1/projectile parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-air-guard-cornerpush-default.json` checksum `c32781ad`, `synthetic-imported-projectile-air-guard-cornerpush-default.json` checksum `90f5e385`, and `synthetic-imported-helper-projectile-air-guard-cornerpush-default.json` checksum `0271a2b9` prove bounded default `airguard.cornerpush.veloff` support for direct HitDef, player-owned Projectile, and helper-parented Projectile routes. That `pnpm qa:trace` pass was 385/385 artifacts, 355 required and 30 optional. Exact corner-push timing/decay, wall friction, exact air guard physics/landing/timing, visual/audio guard effects, score movement, and full guard parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-air-guard-cornerpush.json` checksum `9fdb8a81`, `synthetic-imported-projectile-air-guard-cornerpush.json` checksum `15f26082`, and `synthetic-imported-helper-projectile-air-guard-cornerpush.json` checksum `35d7148b` prove bounded explicit `airguard.cornerpush.veloff` support for direct HitDef, player-owned Projectile, and helper-parented Projectile routes. That `pnpm qa:trace` pass was 382/382 artifacts, 352 required and 30 optional. Exact corner-push timing/decay, wall friction, exact air guard physics/landing/timing, visual/audio guard effects, score movement, and full guard parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-air-guard-velocity-default.json` checksum `b1710269`, `synthetic-imported-projectile-air-guard-velocity-default.json` checksum `bd1a774e`, and `synthetic-imported-helper-projectile-air-guard-velocity-default.json` checksum `3351e770` prove bounded official default `airguard.velocity` derivation for direct HitDef, player-owned Projectile, and helper-parented Projectile routes. That `pnpm qa:trace` pass was 379/379 artifacts, 349 required and 30 optional. Exact air guard physics/landing/timing, visual/audio guard effects, score movement, and full guard parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-hitoverride-missonoverride-default-guardflag-filter.json` checksum `05725ecb`, `synthetic-imported-projectile-hitoverride-missonoverride-default-guardflag-filter.json` checksum `c1402d31`, and `synthetic-imported-helper-projectile-hitoverride-missonoverride-default-guardflag-filter.json` checksum `889d77c1` prove bounded direct/player/helper default `missonoverride = -1` custom-state HitOverride guardflag filtering. Direct `HitDef` omits `missonoverride`, carries `guardflag = H`, and rejects before target memory or override/custom-state/default-get-hit/guard states. Player Projectile id `77` and helper Projectile id `8882` omit `missonoverride`, use `guardflag = H`, skip slots `1/2`, select slot `5`, suppress projectile custom state `889`, and final P2 is state/action `779`, life `1000`, moveType `I`. Helper route records owner/helper target links, helper payload, projectile payload, and suppresses helper branch `1293`. That `pnpm qa:trace` pass was 370/370 artifacts, 340 required and 30 optional. Exact guard timing/guarded contact semantics, score movement, and full HitOverride/custom-state parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-hitoverride-missonoverride-zero-guardflag-filter.json` checksum `058b335f`, `synthetic-imported-projectile-hitoverride-missonoverride-zero-guardflag-filter.json` checksum `af29f125`, and `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-guardflag-filter.json` checksum `9edbf3d0` prove bounded direct/player/helper explicit `missonoverride = 0` custom-state HitOverride guardflag filtering. Direct `HitDef`, player-owned Projectile id `77`, and helper-parented Projectile id `8881` all use `guardflag = H`; P2 slots `1 -> 776` with `guardflag.not = HA`, `2 -> 778` with `guardflag = A`, and `5 -> 779` with `guardflag = H` are active; all three contacts skip slots `1/2`, select slot `5`, suppress the custom state, and final P2 is state/action `779`, life `1000`, moveType `I`. Helper route records owner/helper target links, helper payload, projectile payload, and suppresses helper branch `1291`. That `pnpm qa:trace` pass was 367/367 artifacts, 337 required and 30 optional. Exact guard timing/guarded contact semantics, forceair/forceguard priority combinations, score movement, and full HitOverride/custom-state parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-slot-priority.json` checksum `9a5a149f` plus `synthetic-imported-projectile-hitoverride-missonoverride-zero-slot-priority.json` checksum `96b6b7de` prove bounded Projectile explicit `missonoverride = 0` custom-state HitOverride slot priority. That `pnpm qa:trace` pass was 364/364 artifacts, 334 required and 30 optional. Player-owned Projectile id `77` and helper-parented Projectile id `8878` both select slot `2`, suppress custom-state `889`, and final P2 is state/action `778`, life `1000`, moveType `I`.

Previous required runtime/port trace addendum: `synthetic-imported-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json` checksum `20e40425` proves bounded direct-HitDef default `missonoverride = -1` custom-state `HitOverride forceair` / `forceguard` / `keepstate` miss behavior. That `pnpm qa:trace` pass was 360/360 artifacts, 330 required and 30 optional. Direct default custom-state force flags still do not apply after the direct default custom-state reject.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` checksum `e23a33af` proves bounded helper-parented Projectile explicit `missonoverride = 0` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. A visual Helper spawns owner-side Projectile id `8876` with `parentId = p1-helper-0`, `p2stateno = 889`, `p2getp1state = 1`, and `missonoverride = 0`; P2 installs slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records target links `p1 -> p2 / 8876` and `p1-helper-0 -> p2 / 8876`, consumes/removes the projectile, selects slot `3`, emits override telemetry, records helper payload `targetCount = 1` plus projectile payload `hasHit = true` / `hitsRemaining = 0`, keeps P2 in state/action `0` instead of entering state `780`, suppresses projectile custom-state `889` and helper `ProjHit` branch `1284`, and actor-frame evidence observes `stateType = A`, `physics = A`, and `guardingFrames >= 1`. That `pnpm qa:trace` pass was 359/359 artifacts, 329 required and 30 optional. Helper/projectile default `missonoverride` custom-state breadth, custom-state guardflag inheritance/timing, score movement, and full helper Projectile HitOverride/custom-state parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` checksum `15bc955b` proves bounded player-owned Projectile explicit `missonoverride = 0` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. That `pnpm qa:trace` pass was 358/358 artifacts, 328 required and 30 optional. Default direct `missonoverride = -1` breadth, custom-state guardflag inheritance/timing, score movement, and full Projectile HitOverride/custom-state parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-hitoverride-forceair-forceguard-keepstate.json` checksum `3806a769` proves bounded player-owned Projectile `HitOverride forceair` / `forceguard` / `keepstate` behavior. That `pnpm qa:trace` pass was 355/355 artifacts, 325 required and 30 optional. Final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state guardflag inheritance/timing, score movement, and full Projectile HitOverride parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-hitoverride-forceair-forceguard-keepstate.json` checksum `19787fb2` proves bounded direct-HitDef `HitOverride forceair` / `forceguard` / `keepstate` behavior. That `pnpm qa:trace` pass was 354/354 artifacts, 324 required and 30 optional. Final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state forceair/forceguard/keepstate breadth, custom-state guardflag inheritance/timing, score movement, and full HitOverride parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-hitoverride-guardflag-filter.json` checksum `41a87267` proves bounded helper-parented Projectile `HitOverride guardflag` / `guardflag.not` filtering before slot priority. A visual Helper spawns owner-side Projectile id `8874` with `guardflag = H` and `p2stateno = 889`; P2 installs attr-matching slots `1 -> 776` with `guardflag.not = HA`, `2 -> 778` with `guardflag = A`, and `5 -> 779` with `guardflag = H`; contact records owner target link `p1 -> p2 / 8874` plus helper target link `p1-helper-0 -> p2 / 8874`, marks projectile payload `hitsRemaining = 0` / `hasHit = true`, skips slots `1` and `2`, selects slot `5`, redirects P2 to state `779` / life `1000`, and forbids states `776`, `778`, `889`, `1280`, `5000`, `150`, and `151`. `pnpm qa:trace` passed 353/353 artifacts, 323 required and 30 optional. Custom-state guardflag inheritance/timing, custom-state forceair/forceguard/keepstate breadth, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, score movement, and full helper Projectile/HitOverride parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-hitoverride-guardflag-filter.json` checksum `b88a2da3` proves bounded direct-HitDef `HitOverride guardflag` / `guardflag.not` filtering before slot priority. P1 hits with `attr = S,NA` and `guardflag = H`; P2 installs attr-matching slots `1 -> 776` with `guardflag.not = HA`, `2 -> 778` with `guardflag = A`, and `5 -> 779` with `guardflag = H`; contact records target link `p1 -> p2 / 77`, skips slots `1` and `2`, selects slot `5`, redirects P2 to state `779` / life `1000`, and forbids states `776`, `778`, `5000`, `150`, and `151`. `pnpm qa:trace` passed 351/351 artifacts, 321 required and 30 optional. Helper/projectile guardflag breadth, custom-state guardflag inheritance/timing, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, score movement, and full HitOverride parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-hitoverride-missonoverride-zero-slot-priority.json` checksum `92fefd6a` proves bounded direct-HitDef `missonoverride = 0` custom-state HitOverride slot priority. P1 declares `p2stateno = 888`, `p2getp1state = 1`, and explicit `missonoverride = 0`; P2 installs matching slots `5 -> 779` and `2 -> 778`; contact records target link `p1 -> p2 / 77`, selects the lowest matching active slot `2`, redirects P2 to state `778` / life `1000`, and forbids states `779`, `888`, `5000`, `150`, and `151`. `pnpm qa:trace` passed 350/350 artifacts, 320 required and 30 optional. Helper/projectile custom-state slot-priority breadth, broader guardflag breadth beyond the latest direct-HitDef route, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, score movement, and full HitOverride parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-hitoverride-slot-priority.json` checksum `378d9ce8` proves bounded player-owned Projectile HitOverride slot priority. P2 installs matching slots `5 -> 779` and `2 -> 778`, P1 fires Projectile id `77` with `p2stateno = 889`, contact records target link `p1 -> p2 / 77`, consumes/removes the projectile as a hit, selects the lowest matching active slot `2`, redirects P2 to state `778` / life `1000`, and forbids states `779`, `889`, `5000`, `150`, and `151`. `pnpm qa:trace` passed 348/348 artifacts, 318 required and 30 optional. Custom-state slot-priority breadth, `guardflag` edge timing, forceair/forceguard/keepstate combinations, score movement, and full Projectile/HitOverride parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-hitoverride-slot-priority.json` checksum `8de62354` proves bounded direct-HitDef HitOverride slot priority. P2 installs matching slots `5 -> 779` and `2 -> 778`, P1 hits with `attr = S,NA`, combat selects the lowest matching active slot `2`, redirects P2 to state `778` / life `1000`, and forbids states `779`, `5000`, `150`, and `151`. `pnpm qa:trace` passed 347/347 artifacts, 317 required and 30 optional. Helper-parented Projectile/custom-state slot-priority breadth, `guardflag` edge timing, forceair/forceguard/keepstate combinations, score movement, and full HitOverride parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero.json` checksum `62d7d6b8` proves bounded helper-parented Projectile `missonoverride = 0` HitOverride redirect behavior. A visual Helper spawns Projectile id `8872` with `parentId = p1-helper-0`, `p2stateno = 889`, `p2getp1state = 1`, and explicit `missonoverride = 0`; defender P2 has active matching `HitOverride` slot `777`; contact records owner/helper target links, marks the projectile payload `hitsRemaining = 0` / `hasHit = true`, redirects P2 to state `777` / life `1000`, and forbids states `889`, `1276`, `5000`, `150`, and `151`. `pnpm qa:trace` passed 346/346 artifacts, 316 required and 30 optional. Broader `missonoverride` custom-state breadth, helper/projectile/custom-state slot-priority breadth, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, score movement, and full Projectile/HitOverride parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-hitoverride-missonoverride-zero.json` checksum `5c12f3cc` proves bounded player-owned Projectile `missonoverride = 0` HitOverride redirect behavior. A Projectile declares `p2stateno = 889` / `p2getp1state = 1` / `missonoverride = 0`, defender P2 has active matching `HitOverride` slot `777`, contact records target id `77`, consumes/removes the projectile as a hit, P2 redirects to state `777` / life `1000`, and states `889`, `5000`, `150`, and `151` are forbidden. `pnpm qa:trace` passed 345/345 artifacts, 315 required and 30 optional.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-hitoverride-missonoverride-one.json` checksum `a99979bb` proves bounded helper-parented Projectile `missonoverride = 1` HitOverride miss behavior. A visual Helper spawns Projectile id `8871` with `parentId = p1-helper-0` and `missonoverride = 1`, defender P2 has active matching `HitOverride` slot `777`, contact rejects before owner/helper target memory/contact consumption/damage/guard/redirect/helper `ProjHit`, P2 remains state `0` / life `1000` / control, the projectile remains active with `hitsRemaining = 1` / `hasHit = false`, and states `777`, `889`, `1275`, `5000`, `150`, and `151` are forbidden. `pnpm qa:trace` passed 344/344 artifacts, 314 required and 30 optional.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-hitoverride-missonoverride-one.json` checksum `2dc86467` proves bounded player-owned Projectile `missonoverride = 1` HitOverride miss behavior. A Projectile declares `missonoverride = 1`, defender P2 has active matching `HitOverride` slot `777`, contact rejects before target memory/contact consumption/damage/guard/redirect, P2 remains state `0` / life `1000` / control, the projectile remains active with `hitsRemaining = 1`, and states `777`, `889`, `5000`, `150`, and `151` are forbidden. `pnpm qa:trace` passed 343/343 artifacts, 313 required and 30 optional.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-hitoverride-p2stateno.json` checksum `ce4c1d9a` proves bounded helper-parented Projectile `p2stateno` HitOverride redirect behavior. A visual Helper spawns Projectile id `8870` with `parentId = p1-helper-0`, `p2stateno = 889`, and `p2getp1state = 0`; defender P2 has active matching `HitOverride` slot `777`; contact records owner/helper target links; P2 redirects to state `777`; and states `889`, `1273`, `5000`, `150`, and `151` are forbidden. `pnpm qa:trace` passed 342/342 artifacts, 312 required and 30 optional.

Previous required runtime/port trace addendum: `synthetic-imported-projectile-hitoverride-p2stateno.json` checksum `2ec0725a` proves bounded player-owned Projectile `p2stateno` HitOverride redirect behavior. A Projectile declares `p2stateno = 889` / `p2getp1state = 0`, defender P2 has active matching `HitOverride` slot `777`, contact records target id `77`, P2 redirects to state `777`, and states `889`, `5000`, `150`, and `151` are forbidden. `pnpm qa:trace` passed 341/341 artifacts, 311 required and 30 optional. Projectile `missonoverride` breadth, exact slot priority, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, score movement, and full Projectile/HitOverride parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-hitoverride-p2getp1state-zero-miss.json` checksum `656730c8` proves bounded IKEMEN direct-HitDef `p2getp1state = 0` HitOverride miss behavior. A direct `HitDef` declares `p2stateno = 889` / `p2getp1state = 0`, defender P2 has active matching `HitOverride` slot `777`, target-owned state `889` data exists, contact rejects before target memory, damage, guard, redirect, or target-owned custom-state entry, and states `777`, `889`, `888`, `5000`, `150`, and `151` are forbidden. `pnpm qa:trace` passed 340/340 artifacts, 310 required and 30 optional. Helper/projectile `p2stateno`, exact slot priority, helper/projectile `missonoverride` breadth, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, score movement, and full HitOverride/custom-state parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-hitoverride-missonoverride-one.json` checksum `78cfedf4` proves bounded IKEMEN `HitDef missonoverride = 1` HitOverride miss behavior. A direct `HitDef` declares `missonoverride = 1` without `p1stateno` / `p2stateno`, defender P2 has active matching `HitOverride` slot `777`, contact rejects before target memory, damage, guard, redirect, or custom-state entry, and states `777`, `888`, `5000`, `150`, and `151` are forbidden. `pnpm qa:trace` passed 339/339 artifacts, 309 required and 30 optional. Helper/projectile `p2stateno`, exact slot priority, helper/projectile `missonoverride` breadth, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, score movement, and full HitOverride/custom-state parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-hitoverride-missonoverride-zero.json` checksum `8ffd5678` proves bounded IKEMEN `HitDef missonoverride = 0` HitOverride redirect behavior. A direct `HitDef` declares `p2stateno = 888` / `p2getp1state = 1` / `missonoverride = 0`, defender P2 has active matching `HitOverride` slot `777`, target id `77` is recorded, P2 redirects to state `777`, and owner-backed custom state `888` plus default get-hit/guard states are forbidden. `pnpm qa:trace` passed 338/338 artifacts, 308 required and 30 optional. Helper/projectile `p2stateno`, exact slot priority, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, score movement, and full HitOverride/custom-state parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-hitoverride-p2stateno-miss.json` checksum `6f41eeb1` proves bounded direct-HitDef HitOverride plus owner-backed `p2stateno` miss behavior. A direct `HitDef` declares `p2stateno = 888` / `p2getp1state = 1`, defender P2 has active matching `HitOverride` slot `777`, and the contact is rejected before target memory, damage, guard, normal HitOverride redirect, or custom-state entry; states `777`, `888`, `5000`, `150`, and `151` are forbidden. `pnpm qa:trace` passed 337/337 artifacts, 307 required and 30 optional. Helper/projectile `p2stateno`, exact slot priority, `missonoverride = 1` breadth, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, score movement, and full HitOverride/custom-state parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-p2stateno-guard-ignored.json` checksum `76d1becd` proves bounded direct-HitDef `p2stateno` ignored-on-successful-guard behavior. A guarded direct `HitDef` declares `p2stateno = 888` / `p2getp1state = 1`, records target memory for id `77`, and P2 still routes through defender-owned guard states `150 -> 151 -> 130 -> 20`; state `888` is forbidden. `pnpm qa:trace` passed 336/336 artifacts, 306 required and 30 optional. Exact guard KO/no-KO round flow, helper/projectile `p2stateno` behavior, exact guard timing/proximity/effects, score movement, and full guard parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-custom-state-gethitvar-guard-kill.json` checksum `c889a534` proves bounded owner-backed custom-state guard-hit `GetHitVar(kill)` metadata. A guarded direct `HitDef` with `guard.kill = 0` records target memory, owner-local `TargetState` sends P2 into P1-owned state data, and `GetHitVar(kill) = 0 && GetHitVar(guarded) = 1 && GetHitVar(hitshaketime) > 0` branches `888 -> 904` before `SelfState` returns P2 to state `0`/control. `pnpm qa:trace` passed 335/335 artifacts, 305 required and 30 optional. Exact guard KO/no-KO round flow, helper/projectile custom-state guard kill inheritance, exact guard timing/proximity/effects, score movement, and full custom-state/guard parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-helper-projectile-gethitvar-guard-kill.json` checksum `7f9aa699` proves bounded helper-parented Projectile guard-hit `GetHitVar(kill)` metadata. A guarded helper-spawned Projectile with `guard.kill = 0` records owner/helper target memory and stores `kill = false`, P2 enters defender-owned Common1-style states `150 -> 151`, and `GetHitVar(kill) = 0 && GetHitVar(guarded)` branches `151 -> 334` with helper-local `Projectile` controller/op telemetry from helper state `1200`. `pnpm qa:trace` passed 334/334 artifacts, 304 required and 30 optional. Exact helper Projectile guard KO/no-KO round flow, exact helper/projectile target lifetime/tick order, exact guard timing/proximity/effects, score movement, and full guard/projectile parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-gethitvar-air-guard-kill.json` checksum `4382207e` proves bounded defender-owned air guard-hit `GetHitVar(kill)` metadata. Direct air guard against `HitDef guard.kill = 0` records target memory and stores `kill = false`, P2 enters defender-owned Common1-style states `154 -> 155`, and `GetHitVar(kill) = 0 && GetHitVar(guarded)` branches `155 -> 332`. `pnpm qa:trace` passed 332/332 artifacts, 302 required and 30 optional. Exact guard KO/no-KO round flow, helper/projectile/custom-state inheritance, exact air guard timing/landing/proximity/effects, score movement, and full guard parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-gethitvar-crouch-guard-kill.json` checksum `2976fb8c` proves bounded defender-owned crouch guard-hit `GetHitVar(kill)` metadata. Direct crouch guard against `HitDef guard.kill = 0` records target memory and stores `kill = false`, P2 enters defender-owned Common1-style states `152 -> 153`, and `GetHitVar(kill) = 0 && GetHitVar(guarded)` branches `153 -> 331`. `pnpm qa:trace` passed 331/331 artifacts, 301 required and 30 optional. Exact guard KO/no-KO round flow, helper/projectile/custom-state inheritance, exact guard timing/proximity/effects, score movement, and full guard parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-gethitvar-guard-kill.json` checksum `abb4e468` proves bounded defender-owned stand guard-hit `GetHitVar(kill)` metadata. Direct stand guard against `HitDef guard.kill = 0` records target memory and stores `kill = false`, P2 enters defender-owned Common1-style states `150 -> 151`, and `GetHitVar(kill) = 0 && GetHitVar(guarded)` branches `151 -> 330`. `pnpm qa:trace` passed 330/330 artifacts, 300 required and 30 optional. Exact guard KO/no-KO round flow, helper/projectile/custom-state inheritance, exact guard timing/proximity/effects, score movement, and full guard parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-gethitvar-kill.json` checksum `ef5ffabf` proves bounded defender-owned normal-hit `GetHitVar(kill)` metadata. Direct normal `HitDef kill = 0` records target memory and stores `kill = false`, P2 enters defender-owned Common1-style state `5000`, and `GetHitVar(kill) = 0 && !GetHitVar(guarded)` branches `5000 -> 329`. `pnpm qa:trace` passed 329/329 artifacts, 299 required and 30 optional. KO/round-flow behavior, helper/projectile/custom-state inheritance, exact target lifetime/tick order, score movement, and full get-hit parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-custom-state-gethitvar-fall-metadata.json` checksum `4a3a1c6b` proves bounded owner-backed custom-state `GetHitVar(fall.damage/fall.kill/fall.xvel/fall.yvel)` metadata inheritance. Direct fall `HitDef p2stateno = 888` / `p2getp1state = 1` routes P2 into P1-owned state data, branches `888 -> 903` through `GetHitVar(fall) && GetHitVar(fall.damage) = 70 && GetHitVar(fall.kill) = 0 && GetHitVar(fall.xvel) = 3 && GetHitVar(fall.yvel) = -6`, preserves `customOwnerId = p1` and target id `77`, and returns through `SelfState` to state `0`/control. `pnpm qa:trace` passed 328/328 artifacts, 298 required and 30 optional. Exact metadata lifetime/stacking, helper/projectile inheritance, throws, teams/simul, score movement, and full custom-state fall parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-custom-state-gethitvar-fall-envshake.json` checksum `5c9d1653` proves bounded owner-backed custom-state `GetHitVar(fall.envshake.time/freq/ampl/phase)` metadata inheritance. Direct fall `HitDef p2stateno = 888` / `p2getp1state = 1` routes P2 into P1-owned state data, branches `888 -> 902` through `GetHitVar(fall) && GetHitVar(fall.envshake.time) = 15 && GetHitVar(fall.envshake.freq) = 178 && GetHitVar(fall.envshake.ampl) = 6 && GetHitVar(fall.envshake.phase) = 0`, preserves `customOwnerId = p1` and target id `77`, and returns through `SelfState` to state `0`/control. `pnpm qa:trace` passed 327/327 artifacts, 297 required and 30 optional. Exact camera waveform, pause/stage/layer interaction, metadata lifetime/stacking, helper/projectile inheritance, throws, teams/simul, score movement, and full custom-state fall presentation parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-custom-state-gethitvar-guard-timing.json` checksum `ba77beec` proves bounded owner-backed custom-state guarded timing metadata inheritance. Guarded direct `HitDef` target memory feeds owner-local `TargetState`, P2 enters P1-owned state data, branches `888 -> 901` through `GetHitVar(guarded) = 1 && GetHitVar(slidetime) = 5 && GetHitVar(ctrltime) = 7 && GetHitVar(hitshaketime) > 0`, preserves `customOwnerId = p1` and target id `77`, and returns through `SelfState` to state `0`/control. `pnpm qa:trace` passed 326/326 artifacts, 296 required and 30 optional. `p2stateno`-on-guard behavior, exact guard timing, throws, helper/root/parent redirects, teams/simul, score movement, and full custom-state/get-hit parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-custom-state-gethitvar-hitcount-hitid-chainid.json` checksum `250f77c2` proves bounded owner-backed custom-state `GetHitVar(hitcount/hitid/chainid)` metadata inheritance. Direct `HitDef id = 77, chainID = 43, numhits = 3` routes P2 through `p2stateno = 888` / `p2getp1state = 1` into P1-owned state data, branches `888 -> 900`, preserves `customOwnerId = p1` and target id `77`, and returns through `SelfState` to state `0`/control. `pnpm qa:trace` passed 325/325 artifacts, 295 required and 30 optional. Exact combo accumulation, chain-hit eligibility arbitration, helper/projectile inheritance, exact target lifetime, teams/simul, score movement, and full custom-state/get-hit parity remain blocked.

Previous required runtime/port trace addendum: `synthetic-imported-gethitvar-fallcount.json` checksum `c391d938` proves bounded owner-backed get-hit `GetHitVar(fallcount)` routing. `RuntimeHitVarSystem` reads `hitFall.fallCount` with `0` fallback, `HitFallDamage` records one Common1-style ground-impact count in state `5100` and consumes stored `fall.damage`, and imported CNS branches `5100 -> 328` through `GetHitVar(fallcount) = 1 && GetHitVar(fall.damage) = 0`. `pnpm qa:trace` passed 324/324 artifacts, 294 required and 30 optional. Exact multi-ground-hit accumulation, lifetime/reset parity, non-Common1 impact detection, helper/projectile/custom-state inheritance, score movement, and full fall/get-hit parity remain blocked.

Previous required runtime/port trace addendum: required `synthetic-imported-custom-state-gethitvar-snap.json` checksum `ce4680b9` proves bounded owner-backed custom-state `GetHitVar(xoff/yoff/zoff)` metadata inheritance. Direct `HitDef snap = 16,-24` plus `p2stateno = 888` records bounded snap metadata, P2 executes P1-owned state data, `GetHitVar(xoff) = 16 && GetHitVar(yoff) = -24 && GetHitVar(zoff) = 0` branches `888 -> 899`, actor-frame evidence preserves `customOwnerId = p1`, and `SelfState` returns P2 to state `0`/control. That `pnpm qa:trace` pass was 323/323 artifacts, 293 required and 30 optional. This is bounded direct-HitDef snap metadata inheritance only; exact throw positioning, z-axis support, guard snap behavior, helper/projectile inheritance, broader custom-state inheritance breadth, teams/simul, visual/audio parity, score movement, and full throw/custom-state parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-gethitvar-snap.json` checksum `312a53fc` proves bounded owner-backed get-hit `GetHitVar(xoff/yoff/zoff)` metadata reads. Direct `HitDef snap = 16,-24` records bounded snap metadata, applies simple attacker-relative direct-contact positioning, P2 enters owner-backed state `5100`, and `GetHitVar(xoff) = 16 && GetHitVar(yoff) = -24 && GetHitVar(zoff) = 0` branches `5100 -> 288`. `pnpm qa:trace` passed 322/322 artifacts, 292 required and 30 optional. This is bounded direct-HitDef snap metadata and simple positioning only; exact throw positioning, z-axis support, guard snap behavior, helper/projectile/custom-state inheritance breadth, teams/simul, visual/audio parity, score movement, and full throw/get-hit parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-gethitvar-hitcount.json` checksum `a4685842` proves bounded defender-owned normal get-hit `GetHitVar(hitcount)` metadata reads. Direct `HitDef numhits = 3` records bounded hit-count metadata, P2 enters defender-owned state `5000`, and `GetHitVar(hitcount) = 3 && !GetHitVar(guarded)` branches `5000 -> 327`. `pnpm qa:trace` passed 321/321 artifacts, 291 required and 30 optional. This is bounded direct-HitDef numhits metadata only; exact combo accumulation, multi-hit timing, helper/projectile/custom-state inheritance breadth, teams/simul, exact target lifetime/tick order, score movement, and full get-hit parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-gethitvar-hitid-chainid.json` checksum `18df99ed` proves bounded defender-owned normal get-hit `GetHitVar(hitid)` / `GetHitVar(chainid)` metadata reads. Direct `HitDef id = 77, chainID = 43` records target memory and stores bounded hit id / chain id metadata, P2 enters defender-owned state `5000`, `GetHitVar(hitid) = 77 && GetHitVar(chainid) = 43 && !GetHitVar(guarded)` branches `5000 -> 326`, and target-link evidence preserves target id `77`. `pnpm qa:trace` passed 320/320 artifacts, 290 required and 30 optional. This is bounded direct-HitDef id/chainID metadata only; exact chain-hit eligibility arbitration, helper/projectile/custom-state inheritance breadth, teams/simul, exact target lifetime/tick order, score movement, and full get-hit parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-custom-state-gethitvar-yaccel.json` checksum `549fe48d` proves bounded owner-backed custom-state `GetHitVar(yaccel)` metadata inheritance. Direct `HitDef p2stateno = 888` stores `yaccel = 0.62`, P2 enters P1-owned state data, `GetHitVar(yaccel) = .62 && GetHitVar(hittime) > 0 && !GetHitVar(guarded)` branches `888 -> 898`, actor-frame evidence preserves `customOwnerId = p1`, and `SelfState` returns P2 to state `0`/control. `pnpm qa:trace` passed 319/319 artifacts, 289 required and 30 optional. This is bounded direct-hit yaccel metadata inheritance only; exact physics integration, fall acceleration arbitration, guard metadata inheritance, throws, helper/root/parent redirects, teams/simul, exact bind tick-order, score movement, and full custom-state parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-custom-state-gethitvar-guarded.json` checksum `54f62821` proves bounded owner-backed custom-state `GetHitVar` guarded metadata inheritance. Guarded direct `HitDef` target memory feeds typed owner-local `TargetState`, P2 enters P1-owned state data, `GetHitVar(guarded) = 1 && GetHitVar(hitshaketime) > 0 && GetHitVar(hittime) > 0` branches `888 -> 895`, actor-frame evidence preserves `customOwnerId = p1`, and `SelfState` returns P2 to state `0`/control. That `pnpm qa:trace` aggregate was 316/316 artifacts, 286 required and 30 optional. This is guarded target-memory-to-custom-state metadata inheritance only; `p2stateno`-on-guard behavior, exact guard timing, throws, helper/root/parent redirects, teams/simul, exact bind/tick order, score movement, and full custom-state parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-custom-state-gethitvar-velocity.json` checksum `e9d8da9e` proves bounded owner-backed custom-state `GetHitVar` velocity metadata inheritance. Direct `HitDef p2stateno = 888` with `ground.velocity = 4,-2` routes P2 into P1-owned state data, `GetHitVar(xvel) = 4 && GetHitVar(yvel) = -2 && !GetHitVar(fall) && !GetHitVar(guarded)` branches `888 -> 894`, actor-frame evidence preserves `customOwnerId = p1`, state `888` observes impact velocity extrema, and `SelfState` returns P2 to state `0`/control. That `pnpm qa:trace` aggregate was 315/315 artifacts, 285 required and 30 optional. This is direct-hit velocity metadata inheritance only; exact velocity lifetime after later physics/controllers, throws, helper/root/parent redirects, teams/simul, exact bind/tick order, score movement, and full custom-state parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-custom-state-gethitvar-down-recover.json` checksum `5bd94568` proves bounded owner-backed custom-state `GetHitVar` down-recovery metadata inheritance. Direct fall `HitDef p2stateno = 888` routes P2 into P1-owned state data, `GetHitVar(down.recover) = 1 && GetHitVar(down.recovertime) = 45 && GetHitVar(recovertime) = 45` branches `888 -> 893`, actor-frame evidence preserves `customOwnerId = p1`, and `SelfState` returns P2 to state `0`/control. That `pnpm qa:trace` aggregate was 314/314 artifacts, 284 required and 30 optional. This is direct-hit down-recovery metadata inheritance only; exact lie-down tables, guard metadata inheritance, throws, helper/root/parent redirects, teams/simul, exact bind/tick order, exact recovery threshold behavior, score movement, and full custom-state parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-custom-state-gethitvar-animtype.json` checksum `bbe8777c` proves bounded owner-backed custom-state `GetHitVar` HitDef type metadata inheritance through `888 -> 892` while P2 executes P1-owned state data. It remains required coverage but no longer latest.

Previous focused runtime/port addendum: `RuntimeSpriteEffectControllerWorld` now owns active-state `Trans` sprite-effect dispatch beside `SprPriority`, `PalFX`, `AfterImage`, `AfterImageTime`, and `Angle*`. Focused `SpriteEffectSystem`, `RuntimeActiveSideEffectDispatchSystem`, and `StateProgramExecutor` coverage proves side-effect classification, route dispatch, typed `sprite-effect:trans` telemetry, and bounded `renderOpacity` mutation. That ownership checkpoint kept `pnpm qa:trace` stable at 439/439 artifacts, 409 required and 30 optional; `pnpm qa:smoke` also passed because presentation-state routing was touched. This is R2 ownership cleanup only; exact visual tick order, blend/material parity, helper/redirect ownership, renderer parity, score movement, and full presentation parity remain blocked.

Previous focused runtime/port addendum: `RuntimeEffectActorAdvanceWorld` owns bounded effect-actor advance ordering inside `RuntimeEffectActorWorld`: active effects advance Helpers before Projectiles, paused presentation advances Helpers before Explods, and normal presentation advances Explods without ticking Helpers. Focused `EffectActorSystem` coverage proves both order contracts. This is R2 ownership cleanup only; exact helper pause/combat ordering, projectile lifetime parity, remove-trigger timing, teams/simul roster ownership, visual/audio parity, score movement, and full Helper/Projectile VM parity remain blocked.

Previous focused runtime/port addendum: `RuntimeMatchEnvShakeBridgeWorld` owns bounded active `EnvShake` / `FallEnvShake` controller emission before `RuntimeEnvShakeWorld` mutates actor event history. Focused `RuntimeMatchEnvShakeBridgeSystem` coverage proves typed `EnvShake` forwarding, controller/operation telemetry forwarding, `FallEnvShake` hit-fall metadata emission/clearing, and no-pending-fall no-event behavior. This is R2 ownership cleanup only; exact camera waveform, pause/stage/layer timing, helper/redirect ownership breadth, renderer parity, score movement, and full presentation parity remain blocked.

Previous focused runtime/port addendum: `RuntimeMatchEnvColorBridgeWorld` owns bounded match-level EnvColor callback routing for active, pause, and hitpause ignored-controller paths. The bridge preserves controller source, optional typed `envcolor` operation data, runtime tick, and `RuntimeEnvColorWorld` emission, with focused tests for typed-operation forwarding, stage-flash projection, and zero-time no-event behavior. This is R2 ownership cleanup only; exact EnvColor blend math, layer/window ordering, pause layering/timing, renderer parity, score movement, and full presentation parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-assertspecial-round-flow-telemetry.json` trace checksum `10f95bdb` proves bounded official `AssertSpecial Intro` / `NoKOSlow` telemetry. Official-style grouped controllers lower into typed `assertspecial` operation evidence, final actor `assertSpecialGlobalFlags` require `intro` and `nokoslow`, and runtime telemetry exposes `intro` / `noKoSlow`. `pnpm qa:trace` now passes 310/310 artifacts, 280 required and 30 optional. This is bounded flag telemetry only; exact intro state ownership, KO slow-motion suppression, winpose/round transitions, helper/team/global ownership, pause/layer behavior, score movement, and full round-flow parity remain blocked.

Current focused runtime/port addendum: required `synthetic-imported-helper-controller-param-parentroot.json` trace checksum `94919326` proves bounded helper-local controller-param `Parent` / `Root` redirect evaluation with typed `kinematic:velset` telemetry. A first-generation visual Helper runs dynamic `VelSet x = Parent,Life - 995` / `y = Root,StateNo - 203`, reaches velocity `5,-3`, and routes to state `1401` / anim `941`. Current `pnpm qa:trace` passes 513/513 artifacts, 482 required and 31 optional. This is bounded helper-local dynamic `VelSet` typed telemetry only; nested helper ancestry where root differs from parent, helper-spawned helpers, player `Parent` controller-param redirects, helper-local dynamic typed lowering beyond this route, recursive redirection, debug warning text, teams/simul, score movement, and full helper/controller expression parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-assertspecial-helper-explod-shadow.json` trace checksum `83f61b48` proves bounded `AssertSpecial GlobalNoShadow` helper/explod shadow actor-frame evidence. The gate requires `AssertSpecial` controller evidence, typed `assertspecial` operation evidence, `Helper` controller evidence, helper/explod lifecycle evidence, final-actor `assertSpecialGlobalFlags` evidence, and actor-frame `shadowVisible=false` evidence for P1, P2, Helper, and Explod. Previous required `synthetic-imported-assertspecial-shadow-telemetry.json` trace checksum `2b9c8fac` remains the bounded player shadow renderer oracle for normalized `noshadow` and `globalnoshadow`. At that checkpoint `pnpm qa:trace` passed 308/308 artifacts, 278 required and 30 optional. Exact shadow skew/stage parameters, projectile shadow semantics, exact ownership beyond the current spawned helper/explod route, pause/layer behavior, score movement, and full shadow/global renderer parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-assertspecial-global-telemetry.json` checksum `fc793d29` proves bounded `AssertSpecial` global-style flag telemetry for normalized `nobardisplay`, `nobg`, `nofg`, `nokosnd`, and `nomusic`. The gate requires `AssertSpecial` controller evidence, typed `assertspecial` operation evidence, and final-actor `assertSpecialGlobalFlags` evidence. This is telemetry/gate evidence only; lifebar hiding, stage BG/FG suppression, KO sound suppression, music pause, exact global/team/helper ownership, pause/layer behavior, score movement, and full global flag parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-default-liedown-fast-recovery.json` checksum `74bdac97` proves bounded positive fast lie-down recovery in Common1-style state `5110`. The fixture omits the authored `5110` `Get Up` `ChangeState`, keeps fresh `recovery` command input active while `down.recovertime` is still positive, and still routes `5110 -> 5120 -> 0` through the runtime shortcut. Previous `synthetic-imported-assertspecial-nofastrecoverfromliedown.json` checksum `74bf5d85` remains required for bounded IKEMEN suppression of that shortcut. This is bounded synthetic recovery evidence only; exact mashing thresholds, public KFM proof, global/team/helper ownership, pause/hitpause layering, score movement, and full recovery parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-controller-param-root-redirect.json` checksum `1d4a73f7` proves bounded controller-parameter `Root` redirect evaluation in current player controller execution. A static `VelSet` seeds P1 velocity `4,-2`, then dynamic `VelSet` params read `Root, Life` and `Root, StateNo` and set velocity to `5,-3`; the gate requires named controller order, static typed `kinematic:velset` seed evidence, and actor-frame velocity range. This is bounded current player `VelSet` controller-param Root redirect evidence only; player Parent controller-param redirects, nested helper ancestry where root differs from parent, helper-spawned helpers, dynamic-parameter typed lowering, recursive redirect evaluation, debug warning text, broad bottom/redirect parity for every controller/parameter family, teams/simul, helper-owned custom-state target breadth, score movement, and full controller/expression parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-controller-param-target-redirect.json` checksum `55bb7b1f` proves bounded controller-parameter `Target(77)` redirect evaluation in current controller execution. A static `VelSet` seeds P1 velocity `4,-2`, direct `HitDef` records target id `77`, then dynamic `VelSet` params read `Target(77), Life` and set velocity to `3,-3`; the gate requires target-link evidence, named controller order, static typed `kinematic:velset` seed evidence, `HitDef`, and actor-frame velocity range. This is bounded current `VelSet` controller-param Target redirect evidence only; broad controller-param redirect parity remains blocked.

Previous focused runtime/port addendum: required `synthetic-imported-controller-param-bottom.json` checksum `28ef21ad` proves bounded controller-parameter bottom fallback in current controller execution. A static `VelSet` seeds P1 velocity `4,-2`, then a dynamic `VelSet` whose `Parent,Vel X` / `Parent,Vel Y` params have no parent destination falls back to `0,0`; the gate requires named controller order, static typed `kinematic:velset` evidence, and actor-frame velocity range `4 -> 0` / `-2 -> 0`. This is bounded controller-param bottom evidence only; broad bottom parity remains blocked.

Previous focused runtime/port addendum: required `synthetic-imported-target-ifelse-bottom.json` checksum `be7554d4` proves bounded `IfElse(...)` invalid-redirect branch-result isolation: `IfElse(0, MoveHit >= 1, (Target(999), Life = 0))` cannot route into forbidden state `400` when the target destination is selected and missing, and `IfElse(1, MoveHit >= 1, (Target(999), Life = 0))` selects valid `MoveHit`, isolates the unused missing target branch from the returned value, and falls through to state/action `401` after real direct `HitDef` contact. Focused `RuntimeCnsSubset` coverage also proves `IfElse(...)` still eagerly evaluates unused missing branches and reports warning-style unsupported diagnostics, unlike `Cond(...)`. This is bounded IfElse/bottom result-isolation evidence only; Cond-style lazy evaluation, recursive redirection, debug warning text, broader invalid-destination bottom parity, teams/simul, target mutation through redirects, score movement, and full redirect/bottom parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-target-cond-bottom.json` checksum `e882a2bb` proves bounded `Cond(...)` invalid-redirect branch isolation: `Cond(1, (Target(999), Life = 0), MoveHit >= 1)` cannot route into forbidden state `398` when the target destination is missing, and `Cond(0, (Target(999), Life = 0), MoveHit >= 1)` skips that missing target branch and falls through to state/action `399` after real direct `HitDef` contact. Focused `RuntimeCnsSubset` coverage also proves skipped `Cond(...)` branches do not call the unsupported-redirect reporter while selected missing redirects still fail closed. This is bounded Cond/bottom evidence only; recursive redirection, debug warning text, broader invalid-destination bottom parity, teams/simul, target mutation through redirects, score movement, and full redirect/bottom parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-target-redirect-bottom.json` checksum `5e50a90a` proves bounded invalid-redirect bottom propagation: `(Target(999), Life = 0) || 1` cannot route into forbidden state `396` when the target destination is missing, and the owner falls through to state/action `397` after real direct `HitDef` contact. Focused `RuntimeCnsSubset` coverage also proves missing `Parent` redirects propagate through composite expressions while unused `IfElse(...)` branches stay isolated. This is bounded parser-expression bottom evidence only; recursive redirection, debug warning text, broader invalid-destination bottom parity, teams/simul, target mutation through redirects, score movement, and full redirect/bottom parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-helper-parentroot.json` checksum `5154220c` proves bounded helper-local `Parent` / `Root` redirect routing: a first-generation visual Helper reads cloned owner/root state through `Parent,StateNo`, `Parent,Vel X`, `Root,Anim`, and a redirected-value `ChangeState` expression before routing `1200 -> 1400` / anim `940`. This is read-only helper-local redirect evidence only; nested helper ancestry where root differs from parent, player-state parent/root ownership, team/helper-owned redirects, keyctrl, score movement, and full helper redirect parity remain blocked.

Previous focused runtime/port addendum: required `synthetic-imported-assertspecial-nogetupfromliedown.json` checksum `4c3b6281` proves bounded IKEMEN `AssertSpecial NoGetUpFromLieDown` support through typed `assertspecial` operation data, runtime `noGetUpFromLieDown`, state `5110` `down.recovertime` countdown to `0`, forbidden `5120`, and final P2 state `5110`. Focused `RuntimeRecoverySystem`, `RuntimeCompiler`, and `RuntimeCnsSubset` coverage still proves the path. This is bounded synthetic get-up suppression evidence only; no public KFM proof, no score movement, and no full recovery parity are claimed.

Latest runtime/QA hardening addendum: `scripts/qa_traces.cjs` now includes `synthetic-imported-default-fall-official-air-recovery` in the required artifact coverage-summary contract. The artifact was already required with checksum `b0363be9`; this only closes coverage drift between the generated required artifact list and the required coverage summary. No runtime behavior, checksum, score, public KFM, exact threshold, velocity, or full recovery-parity claim changed.

Latest Studio/UI addendum: `pnpm qa:css` currently passes as an audit at 581,084 bytes, 2,576 rules, 1 duplicate selector key, 126 repeated declaration groups, 155 cross-file overlaps, and 17 fully shadowed cross-file rules; `pnpm qa:css:budget` is red against older CSS debt ceilings, so budget recovery remains a dedicated cleanup task. Build/Evidence Trust Chain rows are shared and action-bound through Build Readiness data, and smoke checks the visible/bridge contract. Desktop command-palette and console readability now have focused screenshot coverage. Build/Evidence right-rail header chrome reuses `src/styles/surfaces/studio-primitives.css`, Assets right-pane drawers use a shared ledger drawer primitive, shared Studio status rails live in `src/styles/surfaces/studio-status-rails.css`, and the current package/source-file drilldown work stays scoped to `src/styles/workflows/studio-trust-ledgers.css`. This is S1 product workflow/control evidence only; it does not prove new editor tools, runtime compatibility, CSS budget recovery, or score movement.

Latest S1 UI addendum: Trust Chain clicks now set `studioFocusedTrustRowId`, mark the selected row with visible focus, and add smoke coverage plus `studio-build-trust-focus.png`. Package/source Trust Chain rows also set `studioFocusedPackageFilePath`, `studioFocusedSourcePackageId`, and `studioFocusedSourcePath`, scroll the right pane to the concrete package/source destination row, and smoke verifies those destination rows are visible. Current `pnpm qa:css` is 581,084 bytes, 2,576 rules, 126 repeated declaration groups, and 155 cross-file overlaps; `pnpm qa:css:budget` is red against older ceilings. This is product workflow/CSS-audit visibility only; no score movement.

Previous runtime/port trace addendum: required `synthetic-imported-air-guard-landing.json` checksum `d6986d7f` proves bounded synthetic Common1-style air guard-hit landing walk-control: held-back airborne P2 blocks an A-guardable direct `HitDef`, routes `154 -> 155 -> 52 -> 20`, keeps active `holdback`/`x`, preserves controller/typed-operation landing order, records state-`52` y = 0 evidence, and ends in imported walk state/action `20` with control. Optional private-fixture `kfm-official-default-air-guard-state.json` checksum `62367dac` mirrors the real KFM/Common1 air route. Previous guard evidence remains active: `kfm-official-default-crouch-guard-hold-crouch-return.json` checksum `d11153d0`, `synthetic-imported-crouch-guard-hold-crouch-return.json` checksum `83ecb699`, `synthetic-imported-default-guard-hold-walk-return.json` checksum `75d4db9c`, and `kfm-official-default-guard-hold-walk-return.json` checksum `885bb1da`. Previous required `synthetic-imported-default-fall-ground-recovery-priority.json` checksum `e83b2db7` proves bounded Common1-style ground-recovery priority through `5000 -> 5030 -> 5050 -> 5200 -> 5201 -> 52 -> 0`; optional private-fixture `kfm-official-default-fall-ground-recovery-priority.json` checksum `6079c8c9` mirrors that route on real KFM data. `pnpm qa:trace` passes 295/295 artifacts, 265 required and 30 optional. This is bounded synthetic air/crouch/stand guard-hold return plus private-fixture mirrors and ground-over-air selection evidence only; public KFM support, required portable KFM-specific fixture coverage when the private fixture is absent, exact guard-hold duration, exact air guard physics/landing/state-52 internals, exact guard timing/proximity/effects, exact thresholds, controller-loop timing, ground/air recovery arbitration constants, velocity math, visual/audio parity, score movement, and full Common1 guard/recovery parity remain blocked. Previous trace addendum: required `synthetic-imported-default-fall-recovery-input-priority.json` checksum `f5e72e07` proves generic recovery input over a competing `HitFall && CanRecover` probe; latest optional private-fixture movement remains `kfm-official-basic-movement.json` checksum `ef30066c`; latest required portable movement remains `synthetic-imported-basic-movement.json` checksum `917ff3e5`.

Latest runtime/port ownership addendum: `RuntimeControllerExpressionContextSystem` owns current shared raw controller-number expression context construction for passive/runtime controller worlds. Dynamic fallback params now reuse one redirect-aware helper for `Target(...)`, `Parent`, `Root`, `Const`, `HitPauseTime`, `StageTime`, and `GetHitVar` reads. Focused coverage proves redirect-aware numeric evaluation plus helper/team metadata forwarding. This is R2 ownership cleanup only; new expression language support, `ID`/player unique-id semantics, recursive redirection, helper/team scope expansion, exact CNS controller-loop timing, visual/audio parity, score movement, and full controller VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeFighterAdvanceHookSetWorld` owns current bounded per-fighter advance hook-set construction outside `PlayableMatchRuntime`: sprite effects, hit eligibility, HitOverride ticking, contact timers, state clock, frame constraints, recovery windows, stun, move lifecycle, kinematics, animation, active controllers, recovery landing, lie-down recovery, and frozen-position preservation now share one named seam before `RuntimeFighterAdvanceWorld` executes. Focused coverage proves every current hook route is forwarded without callback replacement. This is R2 ownership cleanup only; new player-advance semantics, exact MUGEN/IKEMEN tick order, persistent-controller timing, helper/team/redirect actor advance semantics, recovery/stun/physics arbitration, visual/audio parity, score movement, and full player VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeActiveExpressionContextWorld` owns current bounded active CNS expression-context factory construction outside `PlayableMatchRuntime`: dynamic controller-param fallback and trigger evaluation share one named seam for stage bounds/time, owner const routing, runtime RNG, animation timing callbacks, and `InGuardDist`. Focused coverage proves the context handoff beside dispatch and trigger evaluation. This is R2 ownership cleanup only; new expression semantics, exact CNS VM timing, helper/team/redirect expansion, exact `InGuardDist` parity, deterministic MUGEN/IKEMEN RNG stream parity, visual/audio parity, score movement, and full expression/trigger VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeActiveControllerHookSetWorld` owns current bounded active-controller hook-set construction outside `PlayableMatchRuntime`: state mutation hooks, side-effect controller hooks, and fallback runtime-controller hooks now route through one named seam before active controller execution. Focused coverage proves every current hook route is preserved and optional unsupported-hook omission stays exact. This is R2 ownership cleanup only; new controller semantics, exact hook ordering parity, helper/team/redirect scopes, unsupported-controller breadth, visual/audio parity, score movement, and full CNS VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchPausedBridgeWorld` owns the current bounded match-level bridge into `RuntimePausedMatchWorld.advanceRuntime(...)` outside `PlayableMatchRuntime`: pause snapshot lookup, source-movetime eligibility, pause tick mutation, hitpause-style command buffering, stage/time metadata, actor-constraint/effect-lifecycle forwarding, and paused player/AI/fighter callbacks now route through one named seam. Focused coverage proves bridge payload and callback hooks. This is R2 ownership cleanup only; new Pause/SuperPause semantics, exact pause layering, helper/team/redirect pause ownership, pause/hitpause command parity, visual/audio parity, score movement, and full paused-match VM parity remain blocked.

Previous runtime/render addendum: bounded stage BG clipping handoff exists. Stage DEF `[BG ...]` layers preserve `maskwindow` and deprecated `window` as rectangular clip metadata, `StageCompatibilityReport` and Studio Stage layer rows expose the bounded clip, and the Three.js stage renderer clips fallback/asset/SFF sprite geometry with UV adjustment so source textures are cropped instead of squeezed. Focused parser/report/projection tests and smoke visual QA own this cut. This is stage presentation subset evidence only; exact MUGEN `windowdelta`, zoom, endpoint, render-mode, and color-zero `mask` semantics, BGCtrl timing, motif/screenpack ownership, score movement, and full stage parity remain blocked.

Previous runtime/render addendum: bounded stage BG transparency handoff exists. Stage DEF `[BG ...]` layers preserve `trans = none/add/add1/addalpha/sub` plus optional `alpha = src,dst`, `StageCompatibilityReport` and Studio Stage layer rows expose the bounded transparency metadata, and the Three.js stage renderer maps the subset into normal/additive/subtractive material params with bounded `addalpha` opacity. Focused parser/report/material tests and smoke visual QA own this cut. This is stage presentation subset evidence only; exact MUGEN blend math, palette interaction, BGCtrl timing, motif/screenpack ownership, score movement, and full stage parity remain blocked.

Previous runtime/render addendum: first-pass ACT + indexed SFF `RemapPal` texture handoff exists. DEF `pal1..pal12` ACT refs are parsed and loaded, indexed SFF decoders preserve pixel indices and palette bytes, `SffSpriteProvider` can rebuild a decoded indexed sprite canvas using a loaded ACT destination palette, `CharacterRenderer` forwards actor runtime `paletteRemap`, and `CompatibilityReport.palettes` exposes total/parsed/color/transparency counts. Focused parser/provider/renderer/loader/report tests prove this handoff. The required `synthetic-imported-palfx-remappal.json` trace still gates same-actor `PalFX` + `RemapPal` telemetry with checksum `ba5fc1e6` inside the current 290/290 trace aggregate. This proves bounded pixel handoff only; exact source-bank semantics, helper/team/redirect ownership, truecolor/PNG remap, exact palette math, `sinadd`, palette/blend ordering, renderer visual parity, score movement, and full palette/presentation parity remain blocked.

Previous runtime/port QA addendum: `scripts/qa_traces.cjs` includes `synthetic-imported-assertspecial-unguardable` in the `requiredArtifactNames` coverage contract. The artifact was already required; this hardening makes `pnpm qa:trace` fail if the bounded attacker-side `AssertSpecial Unguardable` oracle stops appearing in required coverage summaries. `synthetic-imported-assertspecial-unguardable.json` checksum is `e84aa12d`. This proves coverage presence for an existing oracle only; exact priority, lifetime/persistence layering, pause interaction, helper/team/global ownership, KFM/Common1 confirmation, visual parity, score movement, and full guard parity remain blocked.

Previous runtime/port audio addendum: required `synthetic-imported-sound.json` checksum `cc9c8c49` now gates static imported `PlaySnd abspan = -64` as `absPan: -64` in the required sound-event rule, trace evidence, and final actor sound-event telemetry beside the existing `legacyVolume: -8`, `lowPriority`, `volumeScale`, `freqMul`, `loop`, `pan`, `SndPan`, and `StopSnd` evidence. The typed operation, runtime event, and trace matcher preserve this diagnostic/playback metadata; browser playback still uses bounded pan math and ignores legacy `volume` gain. `pnpm qa:trace` now passes 281/281 artifacts, 256 required and 25 optional. This proves bounded static abspan telemetry only; dynamic HitDef/SuperPause sound refs, exact panning semantics, pre-RC8 gain semantics, exact priority classes, global channel fallback, pause/superpause audio, timing/mixing, visual/audio parity, score movement, and full audio parity remain blocked.

Previous runtime/port trace addendum: required `synthetic-imported-envcolor-under.json` checksum `0a7b5c96` gates bounded imported EnvColor under-layer presentation evidence: static `value = 16,96,255`, `time = 12`, and `under = 1` lower into typed `envcolor` operation evidence and reach stage-frame flash telemetry with opacity evidence. `pnpm qa:trace` now passes 281/281 artifacts, 256 required and 25 optional. This proves bounded stage-flash layer flag handoff only; exact blend math, layer/window ordering, pause timing, renderer parity, visual parity, score movement, and full presentation parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchPresentationSnapshotWorld` now owns bounded match presentation snapshot input construction outside `PlayableMatchRuntime`: camera shake, stage flash, and P1/P2 effect snapshot groups route through one seam before `RuntimeSnapshotWorld.match()` builds the renderer-independent snapshot. Focused coverage proves shake/flash/effect-group forwarding and P1/P2 ordering. This is R2 ownership cleanup only; exact stage/motif camera logic, effect lifecycle semantics, renderer/audio parity, visual/debug UI parity, score movement, and full match snapshot parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeActiveControllerTelemetryWorld` owns bounded active-controller telemetry hook construction outside `PlayableMatchRuntime`: active state hooks, side-effect dispatchers, and fallback runtime-controller dispatch share one controller/operation hook set before `RuntimeCompatibilityTelemetryWorld`. Focused coverage proves controller and operation forwarding through the seam. This is R2 ownership cleanup only; exact telemetry event semantics, imported-only filtering, event retention limits, helper/team/redirect telemetry breadth, visual/debug UI parity, score movement, and full CNS VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchCombatStateHooksWorld` owns bounded combat state-hook adapter construction outside `PlayableMatchRuntime`: direct/projectile combat hooks preserve state-owner availability and entry options, while helper combat hooks keep self-owned availability checks and still forward entry options. Focused coverage proves both contracts, and the match runtime creates both hook sets through the seam before combat bridge handoff. This is R2 ownership cleanup only; helper-owned custom-state table breadth, throws, teams/simul actor registries, multi-target helper ownership, exact combat/helper tick order, visual/audio parity, score movement, and full combat/helper VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchOpponentContextWorld` owns bounded current 1v1 match-opponent context construction for active/pause/hitpause lifecycle bridges outside `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld`: mirrored P1/P2 opponent selection, singleton lifecycle `opponents` list projection, and unknown-actor fail-closed behavior sit behind one named seam. Focused coverage proves mirrored contexts and fail-closed behavior, while existing bridge coverage proves active, pause, and hitpause callers still forward direct opponent plus explicit one-opponent lifecycle context. This is R2 ownership cleanup only; real teams/simul roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond actor refs, exact helper lifecycle/pause/combat ordering, visual/audio parity, score movement, and full match/helper VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeEffectHelperContextWorld` owns bounded visual Helper lifecycle context construction outside `RuntimeEffectLifecycleWorld`: complete-owner validation, parent/root runtime-state projection, current opponent id/state fallback, explicit lifecycle opponent-list to nearest-order helper `opponentRoster` projection, explicit roster override, target-candidate forwarding, and helper `TargetState` / telemetry hook forwarding now sit behind one named seam. Focused coverage proves nearest roster ordering, explicit roster preservation, target/hook forwarding, and incomplete-owner fail-closed behavior, while existing lifecycle coverage proves callers still forward active/paused context. This is R2 ownership cleanup only; real teams/simul lifecycle roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond ids/runtime state, exact helper lifecycle/pause/combat ordering, visual/audio parity, score movement, and full Helper VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchHelperProjectileTargetWorld` owns bounded match-level helper-parented Projectile target-memory bridge wiring outside `PlayableMatchRuntime`: normal post-fighter combat forwards owner, defender, projectile, and `RuntimeTargetWorld` through one named seam before lower helper target-memory logic runs. Focused coverage proves forwarding and owner-projectile fail-closed behavior. This is R2 ownership cleanup only; helper-owned Projectile contact timing, helper-owned custom-state tables, teams/simul actor registries, multi-target helper ownership, exact target lifetime, visual/audio parity, score movement, and full Helper/Projectile VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchHelperBindingWorld` now owns bounded match-level helper callback wiring outside `PlayableMatchRuntime`: helper-owned `TargetState` owner handlers and helper-local Projectile telemetry handlers attach through one named seam, while target entry still delegates to `RuntimeMatchHelperTargetStateWorld` and telemetry filtering stays in `RuntimeHelperTelemetryWorld`. Focused coverage proves owner-specific target-state route forwarding, stale handler replacement, helper-state/owner-state telemetry attribution, and non-Projectile telemetry ignore behavior. This is R2 ownership cleanup only; helper-owned custom-state tables, throws, teams/simul actor registries, multi-target helper ownership, exact helper TargetState/projectile timing, broad helper telemetry semantics, visual/audio parity, score movement, and full Helper VM parity remain blocked.

Previous runtime/port trace addendum: required `synthetic-imported-hitfall-recover-true.json` checksum `f1e3424a` gates bounded Common1-style recover-enabled-but-not-yet-recoverable fall routing: a defender hit by a fall `HitDef` with `fall.recover = 1` and without `p2stateno` routes `5000 -> 5030 -> 5050 -> 5240 -> 0`, branches through named `HitFall Recover Enabled Probe`, requires ordered controller/actor-frame evidence, preserves positive `fall.recovertime` metadata in `5050` and `5240`, returns to idle/control, and forbids recovery states `5210`/`5200`. That checkpoint passed 280/280 artifacts, 255 required and 25 optional. This is bounded synthetic trigger/order evidence only; exact recovery threshold tables, exact Common1 controller-loop timing, recovery arbitration, fall/CanRecover precedence, visual/audio parity, score movement, and full fall/recovery parity remain blocked.

Previous runtime/port trace addendum: required `synthetic-imported-hitfall-recover-false.json` checksum `236df0a8` gates bounded Common1-style recover-disabled fall routing through `5000 -> 5030 -> 5050 -> 5230 -> 0`. This remains recover-disabled trigger evidence only; exact recovery threshold tables, controller-loop timing, recovery arbitration, fall/CanRecover precedence, visual/audio parity, score movement, and full fall/recovery parity remain blocked.

Previous runtime/port trace addendum: required `synthetic-imported-hitfall-false.json` checksum `1d538e43` gates bounded Common1-style normal get-hit `!HitFall` / `!GetHitVar(fall)` routing through `5000 -> 325`. This remains normal-trigger evidence only; exact normal get-hit timing, fall arbitration, custom-state/helper/team inheritance, visual/audio parity, score movement, and full Common1 get-hit parity remain blocked.

Previous runtime/port trace addendum: required `synthetic-imported-hitfall-canrecover.json` checksum `7cf7ab46` gates bounded Common1-style `HitFall` true / `CanRecover` false routing through `5000 -> 5030 -> 5050 -> 5220 -> 0`. This remains fall-trigger evidence only; exact recovery threshold tables, exact controller-loop timing, recovery arbitration, visual/audio parity, score movement, and full fall/recovery parity remain blocked.

Previous runtime/port trace addendum: required `synthetic-imported-air-guard-landing.json` checksum `d6986d7f` gates bounded Common1-style air guard landing handoff: an airborne held-back defender blocks an A-guardable direct `HitDef`, routes `154 -> 155 -> 52`, executes `155` `HitVelSet`, `kinematic:hitvelset`, `VelAdd`, `CtrlSet`, `resource:ctrlset`, landing `VelSet`, `kinematic:velset`, landing `PosSet`, `kinematic:posset`, and final `ChangeState`, with state-`52` y = 0 actor-frame evidence. This is bounded synthetic air guard landing handoff evidence only; exact air guard physics/timing, state-`52` internals, proximity, effects, visual/audio parity, score movement, and full guard parity remain blocked.

Previous runtime/port trace addendum: optional private `kfm-official-default-crouch-guard-slide-stop.json` checksum `d11153d0` now gates real KFM/Common1 crouch guard-hit state `153` slide-stop/control order when `.scratch/fixtures/kfm-official.zip` exists: `HitVelSet`, `kinematic:hitvelset`, `VelSet`, `kinematic:velset`, `CtrlSet`, `resource:ctrlset`, and final `ChangeState` after direct guarded contact while holding down-back. The previous required crouch trace remains `synthetic-imported-crouch-guard-slide-stop.json` checksum `2bea7311`, proving bounded Common1-style crouch guard slide-stop/control `152 -> 153 -> 130` with actor-frame velocity-before-stop/control telemetry. This is private-fixture plus bounded synthetic crouch guard slide-stop/control evidence only; exact guard timing, proximity, effects, public `130` guard-hold return for KFM, controller-loop tick parity, visual/audio parity, score movement, and full guard parity remain blocked.

Previous runtime/port audio baseline addendum: static `PlaySnd lowpriority = 1`, `volume = -8`, `volumescale = 50`, `freqmul = 0.5`, `loop = 1`, `pan = 32`, and static `SndPan channel = 2, pan = -48` now lower into typed `audio:playsnd` / `audio:sndpan` metadata, survive as `RuntimeSoundEvent.lowPriority` / `legacyVolume` / `volumeScale` / `freqMul` / `loop` / `pan`, and are required by `synthetic-imported-sound.json` checksum `91574367`; focused tests also prove static `abspan` lowering/event projection. The partial Web Audio route now owns bounded explicit-channel arbitration, `volumescale` gain scaling, playback-rate scaling, source looping, active-channel SndPan, actor/camera-aware stereo panning, unchannelled-source stop-all cleanup, and legacy `volume` diagnostic telemetry without applying legacy gain. This is bounded channel, `legacyVolume`, `volumescale`, `freqmul`, `loop`, `pan`, `abspan`, and `SndPan` behavior only; exact priority classes, dynamic HitDef/SuperPause sound refs, pre-RC8 legacy volume gain semantics, exact panning semantics, global channel fallback, pause/superpause audio, timing/mixing, score movement, and full MUGEN/IKEMEN audio parity remain blocked.

Previous runtime/port FightFX addendum: imported DEF `[Info] fightfx.prefix` now becomes lowercase runtime `fightFxPrefix` metadata, F-prefixed FightFX asset frames and `HitSpark` events preserve it, F-prefixed sound refs preserve `soundPrefix`, `RuntimeTrace.requiredHitEffectEvents` can require both metadata fields, and character `[Files] fx = ...` packages with matching FightFX `[Info] prefix` can supply the runtime `F` spark AIR/SFF frames plus prefixed SND lookup before global `data/fightfx.*` fallback. Required `synthetic-imported-hitdef-fightfx-spark.json` remains checksum `11537b56` and validates `fightFxPrefix = kfm`; required `synthetic-imported-hitdef-hit-effect-package.json` remains checksum `46aa5ce1` and validates `hitsound = F5,0` plus `soundPrefix = kfm`. This is bounded package-selection and prefixed-SND lookup support only; exact `sys.ffx` lifetime/refcount/cache semantics, global channel fallback, motif/screenpack ownership, renderer/audio timing/layering/scale/palette/mixing parity, helper/team/custom-state presentation ownership, score movement, and full hit-effect parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchHelperTargetStateWorld` now owns bounded match-roster target resolution for helper-owned `TargetState` entry outside `PlayableMatchRuntime`: helper owner validation still routes through `RuntimeHelperTargetStateWorld`, but roster lookup, state availability, and state entry now sit behind one match-level seam. Focused `RuntimeMatchHelperTargetStateSystem` coverage proves roster-backed target resolution, stale target payload isolation, missing-target no-op behavior, and owner-mismatch fail-closed behavior. This is ownership cleanup only; helper-owned custom-state tables, throws, teams/simul actor registries, multi-target helper ownership, exact helper TargetState timing, visual/audio parity, score movement, and full Helper VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeSnapshotWorld.match()` now owns bounded full match snapshot envelope assembly outside `PlayableMatchRuntime`: selected P1 action, playback/speed/toggles, match pause handoff, stage/camera snapshot, round snapshot, player actor snapshots, effect snapshots, compatibility-session handoff, and 80-line log trimming route through one named boundary. Focused `RuntimeSnapshotSystem` coverage proves envelope fields, actor/effect clone isolation, and log cap behavior. This is ownership cleanup only; snapshot schema changes, compatibility telemetry semantics, exact camera/effect/renderer parity, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchTickBranchWorld` now owns bounded per-tick hitpause / pause / active branch arbitration outside `PlayableMatchRuntime`: hitpause consumes the tick before pause or active, match pause consumes the tick before active after hitpause clears, and active match runs only when neither pause layer owns the tick. Focused `RuntimeMatchTickBranchSystem` coverage proves branch order. This is ownership cleanup only; exact pause layering/arbitration, hitpause/pause tick semantics, helper/team scheduling, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchStepWorld` now owns bounded public match-step cadence outside `PlayableMatchRuntime`: stopped playback returns a snapshot without ticking frame clock, forced steps advance exactly once, sub-1x speed samples on frame-clock divisors, multi-step speed loops advance in order, and round-over checks stop remaining iterations. Focused `RuntimeMatchStepSystem` coverage proves the cadence boundary. This is ownership cleanup only; exact pause/round arbitration, frame pacing, replay/rollback timing, helper/team scheduling, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous runtime/port trace addendum: required `synthetic-imported-envshake.json` checksum `061f17d5` is restored to the `pnpm qa:trace` artifact set and gates bounded imported `EnvShake` evidence through `ChangeState`, `EnvShake`, `HitDef`, typed `envshake` operation telemetry, and a `RuntimeEnvShakeEvent` for P1 state `200` with `time = 16`, `freq = 30`, `ampl = -7`, and `phase = 0.5`. Current `pnpm qa:trace` after later presentation/Common1 gates passes 281/281 artifacts, 256 required and 25 optional. This is evidence-pipeline restoration only; exact camera waveform, pause/stage/layer interaction, helper/redirect ownership, visual/audio parity, score movement, and full MUGEN/IKEMEN presentation parity remain blocked.

Previous runtime/port trace addendum: optional private `kfm-official-default-guard-slide-stop.json` checksum `885bb1da` proves real KFM/Common1 stand guard-hit state `151` executes ordered `HitVelSet`, `kinematic:hitvelset`, `VelSet`, `kinematic:velset`, `CtrlSet`, `resource:ctrlset`, and final `ChangeState` after direct guarded contact when `.scratch/fixtures/kfm-official.zip` exists. The newer optional stand addendum `kfm-official-default-guard-hold-walk-return.json` checksum `885bb1da` now proves that same route returns through observable guard-hold state `130` and then resumes held-back walking state/action `20` with control; `kfm-official-default-guard-hold-return.json` remains the hold-only subset. This remains private-fixture confidence only; public KFM support, exact guard-hold duration, exact guard timing, proximity guard, guard effects, crouch guard-hold and exact air guard physics/landing parity, visual/audio parity, score movement, and full MUGEN/IKEMEN guard parity remain blocked.

Previous runtime/port trace addendum: required `synthetic-imported-default-guard-slide-stop.json` checksum `a9663641` proves bounded defender-owned stand guard-hit routing through `150 -> 151 -> 130` after direct guarded contact. The gate requires named controller/typed-operation order through `ChangeAnim`, `ChangeState`, `HitVelSet`, `kinematic:hitvelset`, `VelSet`, `kinematic:velset`, `CtrlSet`, `resource:ctrlset`, and final `ChangeState`, plus actor-frame velocity evidence showing guard-slide velocity before stop/control. This is stand guard slide-stop/control evidence only; exact guard timing, proximity guard, guard effects, crouch/air parity, controller-loop tick parity, visual/audio parity, score movement, and full MUGEN/IKEMEN guard parity remain blocked.

Previous runtime/port trace addendum: required `synthetic-imported-gethitvar-velocity.json` checksum `878a03f7` proves bounded defender-owned normal get-hit CNS can branch from `5000` into state/action `324` through `GetHitVar(xvel) = 4 && GetHitVar(yvel) = -2 && !GetHitVar(fall) && !GetHitVar(guarded)` after direct `HitDef` contact. `RuntimeExpressionContextWorld` / `runtimeHitVar` coverage explicitly proves `xvel` / `yvel` reads. This is direct-contact velocity metadata trigger evidence only; exact velocity lifetime after later physics/controllers, helper/projectile/custom-state inheritance breadth, teams/simul, visual/audio parity, score movement, and full MUGEN/IKEMEN get-hit parity remain blocked.

Previous runtime/port trace addendum: required `synthetic-imported-gethitvar-damage.json` checksum `2c726114` proves bounded defender-owned normal get-hit CNS can branch from `5000` into state/action `323` through `GetHitVar(damage) = 37 && !GetHitVar(guarded)` after direct `HitDef` contact. Direct and projectile combat now store bounded applied damage in shared runtime hit vars. This is direct-contact damage metadata trigger evidence only; exact damage lifetime/rounding, guard-chip semantics, helper/projectile/custom-state inheritance breadth, teams/simul, visual/audio parity, score movement, and full MUGEN/IKEMEN get-hit parity remain blocked.

Previous runtime/port trace addendum: optional private `kfm-official-default-crouch-gethit-progression.json` checksum `3d197fae` proves real KFM held-crouch prep state `11`, then Common1 `5010 -> 5011 -> 0` through `HitShakeOver` / `HitOver` after a direct `HitDef` without `p2stateno`, with final checksum `f469a942`, `5010` anim `5010`, `5011` anim `5020`, `Clsn2 = 2/3`, body width `39/39`, ordered KFM crouch slide `HitVelSet` / `VelMul` / `VelSet` / `DefenceMulSet` typed-operation evidence, and final idle/control. This is private-fixture confidence only; public KFM support, exact tick timing, exact crouch get-hit animation/slide tables beyond this bounded frame/controller profile, fall routing, custom-state/helper/team breadth, visual/audio parity, score movement, and full Common1 get-hit parity remain blocked.

Previous runtime/port trace addendum: required `synthetic-imported-default-crouch-gethit-progression.json` checksum `fd986a9e` proves bounded held-crouch Common1-style get-hit progression through `5010 -> 5011 -> 0` after a direct `HitDef` without `p2stateno`. The gate requires ordered `5010:ChangeState -> 5011:ChangeState` controller evidence, ordered actor-frame `5010 -> 5011` evidence, crouch state/physics telemetry, collision telemetry, and final idle/control; that `pnpm qa:trace` aggregate was 267/267 artifacts, 245 required and 22 optional. This is crouch progression evidence only; exact tick timing, exact crouch get-hit animation/slide tables, fall routing, custom-state/helper/team breadth, visual/audio parity, score movement, and full Common1 get-hit parity remain blocked.

Previous runtime/port addendum: `RuntimeFighterAdvanceWorld` now owns bounded per-fighter advance order from `PlayableMatchRuntime`: sprite-effect tick, hit eligibility slots, HitOverride slots, contact timers, render-angle reset, state clock, frame constraints, recovery-window tick, preserve-moveType read, stun, move lifecycle, kinematics, animation, active controllers, ground-recovery landing, lie-down recovery, and frozen-position preservation. Focused `RuntimeFighterAdvanceSystem` coverage proves order, render-angle cleanup before state-clock handoff, preserve flag forwarding, and tick-start position capture after the recovery-window tick but before kinematics. This is ownership cleanup only; exact MUGEN/IKEMEN player tick order, persistent-controller timing, helper/team/redirect actor advance semantics, recovery/stun/physics arbitration, visual parity, score movement, and full VM parity remain blocked.

Latest runtime/port ownership addendum: `RuntimeMatchPostFighterWorld` now owns bounded normal active-match post-fighter bridge wiring outside `PlayableMatchRuntime`: combat resolver construction and `RuntimeMatchInteractionWorld.advanceRuntime` handoff route through one named boundary. Focused `RuntimeMatchPostFighterSystem` coverage proves target memory, effect lifecycle, projectile clash, actor constraints, target bindings, direct/projectile/helper combat, clamps, and presentation effect forwarding after resolver construction. This is ownership cleanup only; exact MUGEN/IKEMEN post-fighter tick order, combat priority parity, projectile/helper contact timing, helper/team/redirect ownership, target lifetime parity, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchInputControlWorld` now owns bounded normal active-match P1/P2-controlled/simple-AI input dispatch outside `PlayableMatchRuntime`: P1 player input, controlled P2 player input, and uncontrolled P2 simple-AI fallback route through one named boundary after normal command-buffer writes. Focused `RuntimeMatchInputControlSystem` coverage proves P1-before-controlled-P2 ordering, mirrored opponent arguments, and P1-before-AI fallback ordering. This is ownership cleanup only; exact MUGEN/IKEMEN input priority, command timing, input-conflict resolution, pause/hitpause command parity, helper/team/redirect command ownership, AI parity, visual/audio parity, score movement, and full input VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchRoundWorld` now owns bounded active-match round timer delegation plus finish side effects outside `PlayableMatchRuntime`: timer tick routes through the boundary, and KO/time-over finish routes match stop plus log emission through one named world. Focused `RuntimeMatchRoundSystem` coverage proves timer delegation, finish stop/log mutation, and no-finish no-op behavior. This is ownership cleanup only; exact MUGEN/IKEMEN round-flow timing, intros/winposes, KO slowdown, continue flow, teams/simul/turns, lifebar/screenpack behavior, visual/audio parity, score movement, and full round VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchFighterAdvanceWorld` now owns bounded active 1v1 fighter-advance orchestration outside `PlayableMatchRuntime`: P1 advance, P2 auto-guard start, pause-gated P2 advance, and P1 auto-guard start route through one named world. Focused `RuntimeMatchFighterAdvanceSystem` coverage proves normal P1/P2 ordering and pause-after-P1 skip behavior. This is ownership cleanup only; exact MUGEN/IKEMEN player tick order, pause-start arbitration, teams/simul roster advance, helper/team/redirect actor advance semantics, guard-start parity, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchPauseControllerWorld` owns bounded Pause/SuperPause controller result side effects outside `PlayableMatchRuntime`: pause application routes through `RuntimePauseWorld`, SuperPause power delta routes through an injected resource hook, and the existing match log line emits through one named world. Focused `PauseSystem` coverage proves tick/controller/op forwarding, power-delta handoff, log emission, and zero-length no-side-effect behavior. This is ownership cleanup only; exact MUGEN/IKEMEN pause layering, SuperPause background/effects/sound timing, helper/team/redirect pause ownership, pause/hitpause command parity, exact paused side-effect tick order, visual/audio parity, score movement, and full pause VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchCombatBridgeWorld` now owns bounded combat resolver construction outside `PlayableMatchRuntime`: priority clash, direct combat, projectile combat, and helper combat callbacks route through one bridge before `RuntimeMatchInteractionWorld.advanceRuntime`. Focused `RuntimeMatchCombatBridgeSystem` coverage proves priority/direct/projectile/helper wiring, hurtbox callback forwarding, projectile target-memory callback forwarding, and log forwarding. This is ownership cleanup only; exact MUGEN/IKEMEN direct-combat priority, helper-owned combat/contact timing, projectile hit/cancel timing, teams/simul/multi-target combat breadth, visual/audio parity, score movement, and full combat VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMoveStartWorld` now owns bounded native/imported state-move startup outside `PlayableMatchRuntime`: selected `currentMove`, `currentMoveLabel`, `moveTick`, `hasHit`, reversal cleanup, attack `moveType`, control handoff, and authored action state-entry handoff. Focused `RuntimeMoveStartSystem` coverage proves selected move metadata/reset behavior and control-before-state-entry hook order. This is ownership cleanup only; exact MUGEN/IKEMEN command timing, cancel windows, combo/input priority, helper/team/redirect move startup, persistent-controller timing, visual parity, score movement, and full move VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeMatchTickInputWorld` now owns bounded normal-match input/tick stamping outside `PlayableMatchRuntime`: per-frame actor `compatibilityTick`, cloned `currentInput`, and non-hitpause command-buffer writes. Focused `RuntimeMatchTickInputSystem` coverage proves clone isolation, actor tick stamping, normal command-buffer writes without `hitPause`, and separation from pause/hitpause buffering. This is ownership cleanup only; exact MUGEN/IKEMEN command timing, input conflict priority, pause/hitpause command parity, helper/team/redirect command ownership, visual parity, score movement, and full input VM parity remain blocked.

Previous runtime/port ownership addendum: `RuntimeHelperTelemetryWorld` owns bounded helper-local Projectile controller/op telemetry binding outside `PlayableMatchRuntime`. Focused `RuntimeHelperTelemetrySystem` coverage proves projectile controller/op recording, helper-state attribution, owner-state fallback, non-projectile ignore behavior, and stale handler replacement. This is ownership cleanup only; exact helper Projectile tick timing, helper-owned Projectile combat/contact presentation, teams/simul helper telemetry, broader helper telemetry semantics, visual/audio parity, score movement, and full Helper VM parity remain blocked.

Previous runtime/port addendum: `RuntimeActiveControllerDispatchWorld` owns bounded active-controller route orchestration after scan/trigger pass. It tries active state/animation mutation dispatch first, routes shared runtime-controller execution second, routes active side effects third, and keeps unsupported dispatches fail-soft/reportable. Focused `RuntimeActiveControllerDispatchSystem` coverage proves state-first stop, runtime-controller handoff, side-effect handoff, and unsupported pass-through. This is ownership cleanup only; exact CNS VM timing, persistent-controller semantics, helper/team/redirect scopes, side-effect ordering parity, missing-action fallback parity, visual parity, score movement, and full active-controller parity remain blocked.

Latest runtime/port trace addendum: optional private KFM fixtures now confirm the bounded air-entry recovery routes against real KFM Common1 data when `.scratch/fixtures/kfm-official.zip` is present. `kfm-official-default-air-fall-recovery-input.json` checksum `a431028a` proves `5020 -> 5030 -> 5035 -> 5050 -> 5210 -> 52 -> 0`, with KFM's `5030` `fall.recovertime` countdown reaching `0` before intermediate `5035`; `kfm-official-default-air-fall-recovery-too-early.json` checksum `a1db1589` proves the same `5020 -> 5030 -> 5035 -> 5050` entry rejects early `command = "recovery"` while `fall.recovertime` stays positive and recovery/landing/ground-impact states are forbidden. Current `pnpm qa:trace` aggregate is 266/266 artifacts, 244 required and 22 optional. This is private-fixture confidence only; public KFM support, exact threshold tables, exact velocity math, exact controller-loop timing, visual/audio parity, score movement, and full Common1 recovery parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-default-air-fall-recovery-too-early.json` checksum `48a2e708` remains required and proves bounded defender-owned Common1-style air-entry recovery-input rejection. When P2 is airborne and a fall imported `HitDef` omits `p2stateno`, P2 routes through `5020 -> 5030 -> 5050`, keeps `command = "recovery"` active too early, forbids recovery/landing states `5210`, `5200`, `5201`, `52`, `5100`, `5101`, `5110`, and `5120`, and remains in `5050` while `fall.recovertime` is positive from `11` to `6`; that `pnpm qa:trace` aggregate was 264/264 artifacts, 244 required and 20 optional. This is air-entry early recovery-input rejection evidence only; exact MUGEN/IKEMEN recovery threshold tables, exact air get-hit animation, exact velocity math, exact controller-loop timing, recovery arbitration between air/ground branches, visual/audio parity, score movement, and full Common1 recovery parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-default-air-fall-recovery-input.json` checksum `334a419e` remains required and proves bounded defender-owned Common1-style air-entry recovery input. When P2 is airborne and a fall imported `HitDef` omits `p2stateno`, P2 routes through `5020 -> 5030 -> 5050`, accepts `command = "recovery"` after positive-to-zero `fall.recovertime`, enters `5210`, lands through `52`, and returns to idle/control; that checkpoint passed 263/263 artifacts, 243 required and 20 optional. This is air-entry recovery-input evidence only; exact MUGEN/IKEMEN recovery threshold tables, exact air get-hit animation, exact velocity math, exact controller-loop timing, recovery arbitration between air/ground branches, visual/audio parity, score movement, and full Common1 recovery parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-default-air-liedown-recovery.json` checksum `56a8f236` remains required and proves bounded defender-owned Common1-style air fall bounce/lie-down/get-up state order. When P2 is airborne and a fall imported `HitDef` omits `p2stateno`, P2 routes through `5020 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0` with `5101` `HitFallVel`, `5110` `HitFallDamage`, typed `hitfall:hitfallvel` / `hitfall:hitfalldamage`, bounded `5110` `downRecoverTime` countdown, and final idle/control evidence; that checkpoint passed 262/262 artifacts, 242 required and 20 optional. This is state/order, bounce, lie-down countdown, get-up, and idle-return evidence only; exact air get-hit animation, exact `HitShakeOver` / `HitOver` timing, exact ground-impact timing/position, exact bounce physics, exact lie-down duration tables, recovery input, landing nuance, controller-loop timing, visual/audio parity, score movement, and full Common1 fall/get-hit parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-default-air-ground-impact.json` checksum `0ba3c80f` remains required and proves bounded defender-owned Common1-style air fall ground-impact state order. When P2 is airborne and a fall imported `HitDef` omits `p2stateno`, P2 routes through `5020 -> 5030 -> 5050 -> 5100` with `5100` `HitFallDamage` / `hitfall:hitfalldamage` evidence; that checkpoint passed 261/261 artifacts, 241 required and 20 optional. This is state/order plus ground-impact controller evidence only; exact air get-hit animation, exact `HitShakeOver` / `HitOver` timing, exact ground-impact timing/position, bounce physics, lie-down timing, landing, recovery input, controller-loop timing, visual/audio parity, score movement, and full Common1 fall/get-hit parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-default-air-fall-gethit.json` checksum `1230a2f3` remains required and proves bounded defender-owned Common1-style air fall get-hit state order. When P2 is airborne and a fall imported `HitDef` omits `p2stateno`, P2 routes through `5020 -> 5030 -> 5050`; that checkpoint passed 260/260 artifacts, 240 required and 20 optional. This is state/order evidence only; exact air get-hit animation, exact `HitShakeOver` / `HitOver` timing, ground impact, bounce, lie-down, landing, recovery input, controller-loop timing, visual/audio parity, score movement, and full Common1 fall/get-hit parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-default-air-gethit.json` checksum `dc4fb7c9` remains required and proves bounded defender-owned Common1-style air default get-hit state selection. When P2 is airborne and a direct imported `HitDef` omits `p2stateno`, P2 enters state `5020`; that checkpoint passed 259/259 artifacts, 239 required and 20 optional. This is state-selection evidence only; exact air get-hit animation, fall route, landing route, air recovery, `HitShakeOver`/`HitOver` progression, controller-loop timing, visual/audio parity, score movement, and full Common1 get-hit parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-default-crouch-gethit.json` checksum `7ec18c61` remains required and proves bounded defender-owned Common1-style crouch default get-hit state selection. When P2 holds crouch and a direct imported `HitDef` omits `p2stateno`, P2 enters state `5010`; that checkpoint passed 258/258 artifacts, 238 required and 20 optional. This is state-selection evidence only; exact crouch get-hit animation, slide timing, fall routing, `HitShakeOver`/`HitOver` progression, controller-loop timing, visual/audio parity, score movement, and full Common1 get-hit parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-projectile-contacttime-id.json` checksum `e9ebf36a` and `synthetic-imported-projectile-guardedtime-id.json` checksum `dfd08f28` are now required and prove bounded owner-state `ProjContactTime(77)` / `ProjGuardedTime(77)` routing after player-owned Projectile contact/guard markers. P1 branches from state/action `200` into `321` and `322` with hit/guard event/reason, Projectile lifecycle, effect-store, and target-link evidence. That checkpoint passed `pnpm qa:trace` at 257/257 artifacts, 237 required and 20 optional. This is fixed-id contact/guard-time trigger evidence only; exact contact/guard tick-order/lifetime, multi-projectile same-id selection, helper-owned projectile routing, redirects, teams/simul, visual/audio parity, score movement, and full Projectile timing parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-projectile-canceltime-any.json` checksum `5bff1961` remains required and proves bounded owner-state `ProjCancelTime(0)` routing after that owner's player-owned Projectile id `77` is canceled. P2 branches from state/action `200` into `320` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `918`, projectile lifecycle, effect-store, and payload evidence. This is owner-state any-id cancel-time trigger evidence for one canceled Projectile route only; exact cancel tick-order/lifetime, broad dynamic expression parity, multi-projectile any-id arbitration beyond this route, exact priority classes, helper-owned projectile routing, redirects, teams/simul, visual/audio parity, score movement, and full Projectile cancel parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-projectile-canceltime-var.json` checksum `e057e102` remains required and proves bounded owner-state `ProjCancelTime(var(0))` routing after owner-local `VarSet` seeds canceled player-owned Projectile id `77`. This is owner-state var-backed cancel-time trigger evidence only; exact cancel tick-order/lifetime, broad dynamic expression parity, multi-projectile any-id arbitration, exact priority classes, helper-owned projectile routing, redirects, teams/simul, visual/audio parity, score movement, and full Projectile cancel parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-projectile-canceltime-dynamic.json` checksum `0da26c87` remains required and proves bounded owner-state expression-derived `ProjCancelTime(77 + var(0))` routing after that owner's player-owned Projectile is canceled by an opposing Projectile clash. This is owner-state dynamic-id cancel-time trigger evidence only; exact cancel tick-order/lifetime, broad dynamic expression parity, multi-projectile id `0` selection, exact priority classes, helper-owned projectile routing, redirects, teams/simul, visual/audio parity, score movement, and full Projectile cancel parity remain blocked.

Previous runtime/port trace addendum: `synthetic-imported-helper-projcanceltime-dynamic.json` checksum `cc78dde2` remains required and proves bounded helper-local expression-derived `ProjCancelTime(8869 + var(0))` routing after a matching helper-parented owner-side Projectile is canceled by an opposing Projectile clash. The Helper branches from state/action `1270` into `1271` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `1018`, helper/projectile lifecycle, effect-store, and payload evidence. Focused helper-local runtime coverage also proves nonzero `ProjCancelTime(var(n))` id selection. This is helper-local dynamic-id cancel-time trigger evidence only; exact cancel tick-order/lifetime, broad dynamic expression parity, multi-projectile same-id selection, exact priority classes, helper-owned custom states, redirects, teams/simul, visual/audio parity, score movement, and full Helper/Projectile cancel parity remain blocked.

Previous runtime/port addendum: `RuntimeEffectLifecycleWorld` now accepts an explicit lifecycle `opponents` list, builds an id-bearing nearest-order `opponentRoster` through `RuntimeOpponentSelectionWorld`, and keeps the legacy current `opponentId` / `opponentState` separate for one-opponent fallback routes. Focused `EffectLifecycleSystem` coverage proves an unsorted `[far, near, tied]` list becomes a nearest-order helper roster and the `opponents` control field does not leak into helper options. This is ownership cleanup only; real teams/simul roster registry, automatic match-level multi-opponent lifecycle wiring, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous runtime/port addendum: `RuntimeOpponentSelectionWorld` now builds id-bearing `opponentRoster` entries in nearest order without cloning runtime states, and `RuntimeEffectLifecycleWorld` delegates current-opponent lifecycle roster construction through that boundary. Focused `RuntimeOpponentSelectionSystem` coverage proves ids and state refs survive nearest ordering; `EffectLifecycleSystem` coverage keeps active/paused lifecycle forwarding green. This is ownership cleanup only; real teams/simul roster registry, multi-opponent lifecycle roster sources, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous runtime/port addendum: `RuntimeEffectLifecycleWorld` now forwards the current opponent as an id-bearing `opponentRoster` into active and paused Helper lifecycle contexts while preserving legacy `opponentId` / `opponentState`. Focused `EffectLifecycleSystem` coverage proves active and paused lifecycle options carry the current opponent id plus runtime state. This is ownership cleanup only; real teams/simul roster registry, multi-opponent lifecycle roster construction, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous runtime/port addendum: `HelperSystem` now accepts caller-supplied helper-local `opponentRoster` entries with id plus runtime state, and `RuntimeOpponentSelectionWorld` keeps that metadata attached while sorting. Focused `EffectActorSystem` coverage proves an unsorted roster with ids resolves `EnemyNear(1), TeamSide = 2` after nearest/stable-tie ordering. This is ownership cleanup only; real teams/simul roster registry, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous runtime/port addendum: `HelperSystem` routes caller-supplied helper-local `opponentStates` through `RuntimeOpponentSelectionWorld`, so helper-local `EnemyNear(index)`, `EnemyNear(var(n))`, `NumEnemy`, and direct helper opponent context share nearest-roster ordering with active runtime expression contexts. Focused `RuntimeOpponentSelectionSystem` coverage proves raw runtime-state list ordering, and focused `EffectActorSystem` coverage proves a visual Helper resolves an unsorted `[far, near, tie]` list by nearest/stable-tie order.

Previous runtime/port addendum: `RuntimeOpponentSelectionWorld` owns bounded horizontal body-distance scoring and stable nearest-roster ordering for runtime opponent lists, and `RuntimeExpressionContextWorld` delegates explicit `EnemyNear(index)` roster ordering through that boundary. Focused `RuntimeOpponentSelectionSystem` coverage proves nearest ordering, stable ties, finite-before-nonfinite sorting, and distance values, while focused `RuntimeExpressionContextSystem` coverage keeps `EnemyNear` integration green.

Previous runtime/port addendum: `RuntimeExpressionContextWorld` now sorts explicit opponent rosters by bounded nearest body-distance before resolving `EnemyNear(index)`, preserving caller order for stable ties and keeping `NumEnemy` tied to supplied roster length. Focused `RuntimeExpressionContextSystem` coverage proves `EnemyNear(0..3)` resolves nearest/stable-tie/far order from an unsorted roster. This is shared read-context cleanup only; real teams/simul roster ownership, helper-owned opponent rosters, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous runtime/port addendum: `RuntimeDispatchEvaluationWorld` and `RuntimeTriggerEvaluationWorld` now forward optional explicit opponent rosters into their context factories, and `PlayableMatchRuntime` routes its current one-opponent list through the same seam. Focused `RuntimeDispatchEvaluationSystem` and `RuntimeTriggerEvaluationSystem` coverage proves roster forwarding plus `NumEnemy` evaluation through dynamic controller-param and trigger paths. This is shared adapter/read-context cleanup only; real teams/simul roster ownership, helper-owned opponent rosters, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous runtime/port addendum: `RuntimeExpressionContextWorld` accepts an optional explicit opponent roster and wires `EnemyNear(index)` plus `NumEnemy` through that list. Focused `RuntimeExpressionContextSystem` coverage proves roster-backed `EnemyNear(1)` / `EnemyNear(var(n))`, `NumEnemy = 2`, default one-opponent fallback, and missing-index fail-closed behavior. This is shared read-context cleanup only; real teams/simul roster ownership, helper-owned opponent rosters, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous runtime/port addendum: `ExpressionEvaluator` resolves `EnemyNear(index)` through an explicit enemy-near redirect callback and can read `NumEnemy` from an explicit provider, while `HelperSystem` derives helper-local `NumEnemy` from supplied `opponentStates`. Focused `RuntimeCnsSubset` and `EffectActorSystem` coverage proves direct evaluator support, dynamic index expressions through `var(n)`, helper-local indexed routing, explicit opponent-count reads, and missing-index fail-closed behavior. This is context/redirect/count cleanup only; teams/simul opponent ordering, helper-owned opponent rosters, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper VM parity remain blocked.

Previous runtime/port addendum: `RuntimeEffectLifecycleWorld` now forwards `stageBounds`, `stageTime`, and `runtimeTick` into helper-local active and paused lifecycle passes. `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, `RuntimeHitPauseWorld`, and `PlayableMatchRuntime` pass current tick context through that boundary. Focused `EffectLifecycleSystem` coverage proves helper-local `GameTime` rejection/pass behavior, `FrontEdgeDist` param evaluation from stage bounds, `PlaySnd` `runtimeTick` telemetry, and `ChangeState` handoff. This is ownership/context cleanup only; exact helper clock parity, pause/combat ordering parity, broader indexed/team redirects, teams/simul, visual parity, score movement, and full helper VM parity remain blocked.

Previous runtime/port addendum: `RuntimeAnimationWorld` now owns bounded active action lookup/reset plus `elem` / `elemtime` seeding for known AIR actions. `PlayableMatchRuntime` delegates its local `changeAction` helper through that boundary while still owning active controller dispatch, state-owner selection, concrete state/action entry, and controller ordering. Focused `RuntimeAnimationSystem` coverage proves authored-action retargeting, same-action element retargeting, and missing-action no-mutation behavior. Current `pnpm qa:trace` aggregate remains 251/251 artifacts, 231 required and 20 optional. This is ownership cleanup only; exact AIR negative-duration semantics, missing-action fallback parity, full `elem` / `elemtime` parity, helper/team redirect namespaces, controller tick-order parity, visual parity, score movement, and full animation VM parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-helper-projcanceltime-id.json` checksum `fc412176` is now required and proves bounded helper-local `ProjCancelTime(8868)` routing after a matching helper-parented owner-side Projectile is canceled by an opposing Projectile clash. The Helper branches from state/action `1268` into `1269` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `1008`, helper/projectile lifecycle, effect-store, and payload evidence. Current `pnpm qa:trace` aggregate is 251/251 artifacts, 231 required and 20 optional. This is helper-local fixed-id cancel-time trigger evidence only; exact cancel tick-order/lifetime, dynamic ids, multi-projectile same-id selection, exact priority classes, helper-owned custom states, redirects, teams/simul, visual/audio parity, score movement, and full Helper/Projectile cancel parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-helper-projcanceltime-any.json` checksum `f7e7fa01` remains required and proves bounded helper-local `ProjCancelTime(0)` routing after a helper-parented owner-side Projectile is canceled by an opposing Projectile clash. The Helper branches from state/action `1266` into `1267` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `998`, helper/projectile lifecycle, effect-store, and payload evidence. This is helper-local cancel-time trigger evidence only; exact cancel tick-order/lifetime, exact priority classes, multi-projectile any-id selection semantics beyond this route, helper-owned custom states, redirects, teams/simul, visual/audio parity, score movement, and full Helper/Projectile cancel parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-projectile-canceltime.json` checksum `64e8dec4` remains required and proves bounded owner-state `ProjCancelTime(77)` routing after that owner's player-owned Projectile is canceled by an opposing Projectile clash. P2 branches into state/action `283` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback, projectile lifecycle, effect-store, and payload evidence. This is owner-state cancel-time trigger evidence only; exact cancel tick-order/lifetime, exact priority classes, multi-projectile id `0` selection, redirects, teams/simul, visual/audio parity, score movement, and full Projectile cancel parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-helper-projguardedtime-any.json` checksum `1f1a38e4` and `synthetic-imported-helper-projcontacttime-any.json` checksum `0d9f7829` remain required and prove bounded helper-local `ProjGuardedTime(0)` / `ProjContactTime(0)` any-projectile routing after helper-parented Projectile guard/contact markers. The Helper branches into state/actions `1263` and `1265` with guard event/reason, helper/projectile lifecycle, effect-store, target-link, and sound/FightFX package evidence. This is helper-local guard/contact-time trigger evidence only; exact contact/guard tick-order/lifetime, multi-projectile any-id selection, helper-owned custom-state targets, redirects, teams/simul, visual/audio parity, score movement, and full Helper/Projectile parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-helper-projhittime-any.json` checksum `bca9f47b` remains required and proves bounded helper-local `ProjHitTime(0)` any-projectile hit-time routing after a helper-parented Projectile hit. The Helper branches into state/action `1261` with hit event/reason, helper/projectile lifecycle, effect-store, target-link, and sound/FightFX package evidence. This is helper-local hit-time trigger evidence only; exact hit tick-order/lifetime, multi-projectile any-id selection, helper-owned custom-state targets, redirects, teams/simul, visual/audio parity, score movement, and full Helper/Projectile parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-projectile-hittime-any.json` checksum `47c1cf7f` remains required and proves bounded owner-state `ProjHitTime(0)` any-projectile hit-time routing after a player-owned Projectile hit. P1 branches into state/action `282` with hit event/reason, Projectile lifecycle, effect-store, and target-link evidence. This is player-owned hit-time trigger evidence only; exact hit tick-order/lifetime, multi-projectile id=0 selection, exact helper-local timing beyond bounded helper gates, redirects, teams/simul, visual/audio parity, score movement, and full Projectile hit parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-projectile-contacttime-any.json` checksum `f1751155` remains required and proves bounded owner-state `ProjContactTime(0)` any-projectile contact-time routing after a player-owned Projectile hit. P1 branches into state/action `281` with hit event/reason, Projectile lifecycle, effect-store, and target-link evidence. This is contact-time trigger evidence only; exact contact tick-order/lifetime, multi-projectile id=0 selection, exact helper-local timing beyond bounded helper gates, redirects, teams/simul, visual/audio parity, score movement, and full Projectile contact parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-projectile-guardedtime-any.json` checksum `c8473340` remains required and proves bounded owner-state `ProjGuardedTime(0)` any-projectile guard-time routing after a player-owned Projectile guard. P1 branches into state/action `279` with guard event/reason, Projectile lifecycle, effect-store, and target-link evidence. This is guarded contact-time trigger evidence only; exact guard tick-order/lifetime, multi-projectile id=0 selection, exact helper-local timing beyond bounded helper gates, redirects, teams/simul, visual/audio parity, score movement, and full Projectile guard parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-hitdef-projectile-target-mix.json` checksum `e98d4857` remains required and proves bounded owner-local target-memory mixing: direct `HitDef` id `77` and player-owned `Projectile` id `78` both hit P2, then `NumTarget(77)`, `Target(77), Life`, `NumTarget(78)`, and `Target(78), Life` route P1 into state/action `278`. This is target-memory trigger evidence only; Target* mutation mixing, helper-owned projectile targets, helper-owned custom state tables, throws, teams/simul, multi-target/helper-owned opponent selection, exact target lifetime/tick order, visual parity, score movement, and full target/combat parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-helper-projectile-gethitvar-air-guard-hitshaketime.json` checksum `3c3f2e25` remains required and proves bounded defender-owned helper Projectile air guard-hit routing through `GetHitVar(hitshaketime)` into state/action `317`.

Previous runtime/port addendum: `synthetic-imported-projectile-gethitvar-air-guard-hitshaketime.json` checksum `3fcf1421` remains required and proves bounded defender-owned player Projectile air guard-hit routing through `GetHitVar(hitshaketime)` into state/action `316`.

Previous runtime/port addendum: `synthetic-imported-gethitvar-air-guard-hitshaketime.json` checksum `703e9328` remains required and proves bounded defender-owned direct-`HitDef` air guard-hit routing through `GetHitVar(hitshaketime)` into state/action `315`.

Previous runtime/port addendum: `synthetic-imported-gethitvar-crouch-guard-hitshaketime.json` checksum `b31d1dac` remains required and proves bounded defender-owned crouch guard-hit routing through `GetHitVar(hitshaketime)` into state/action `314`.

Previous runtime/port addendum: `synthetic-imported-gethitvar-guard-hitshaketime.json` checksum `31d76de9` remains required and proves bounded defender-owned direct guard-hit routing through `GetHitVar(hitshaketime)` into state/action `311`.

Previous runtime/port addendum: `synthetic-imported-gethitvar-hitshaketime.json` checksum `655107b9` remains required and proves bounded defender-owned normal get-hit routing through `GetHitVar(hitshaketime)` into state/action `310`.

Previous runtime/port addendum: `synthetic-imported-gethitvar-hittime.json` checksum `a11beef0` remains required and proves bounded defender-owned normal get-hit routing through `GetHitVar(hittime)` into state/action `309`.

Previous runtime/port addendum: `synthetic-imported-gethitvar-guard-timing.json` checksum `cf92c669` remains required and proves bounded defender-owned guard-hit routing through `GetHitVar(hittime)`, `GetHitVar(slidetime)`, and `GetHitVar(ctrltime)` into state/action `308`.

Previous runtime/port addendum: `synthetic-imported-gethitvar-down-recover.json` checksum `b8a7aef0` remains required and proves bounded owner-backed get-hit routing through `GetHitVar(down.recover)`, `GetHitVar(down.recovertime)`, and alias `GetHitVar(recovertime)` into state/action `307`.

Previous runtime/port addendum: `synthetic-imported-gethitvar-fall-envshake.json` checksum `6364632a` remains required and proves bounded owner-backed get-hit routing through `GetHitVar(fall.envshake.time)`, `GetHitVar(fall.envshake.freq)`, `GetHitVar(fall.envshake.ampl)`, and `GetHitVar(fall.envshake.phase)` into state/action `306` before `FallEnvShake` presentation executes.

Previous runtime/port addendum: `synthetic-imported-teamside.json` checksum `f55695b7` is required and proves bounded imported State -1 side-context routing: P1 presses `x`, then `TeamSide = 1` and `EnemyNear, TeamSide = 2` route into state/action `299` without `HitDef` / combat side effects. This is bounded one-on-one side trigger evidence only; teams/simul/turns, indexed opponent selection, helper-owned opponent lists, dynamic side ownership, visual parity, score movement, and full MUGEN/IKEMEN `TeamSide` semantics remain blocked.

Previous runtime/port addendum: `synthetic-imported-helper-projectile-gethitvar-guarded.json` checksum `2b413bd7` is now required and proves bounded helper-parented `Projectile` guard metadata can survive into defender-owned Common1-style guard-hit CNS: P2 blocks a helper-spawned Projectile, runs `150 -> 151`, executes `HitVelSet` / `CtrlSet`, then branches from state `151` through `GetHitVar(guarded) = 1` into state/action `304` before returning to idle/control. The gate now also requires helper-local `Projectile` controller/op telemetry from helper state `1200`. This is bounded helper-parented Projectile guard metadata trigger evidence only; custom-state guarded metadata, exact guard timing/effects, visual parity, score movement, and full MUGEN/IKEMEN Common1/guard parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-gethitvar-fall-recover.json` checksum `259b300f` remains required and proves bounded owner-backed get-hit routing can read `GetHitVar(fall.recover)` as the HitDef recovery-allowed flag while `GetHitVar(fall.recovertime) > 0` and `!CanRecover` still hold, routing P2 from state `5100` to state/action `301`. This is bounded get-hit metadata trigger evidence only; exact recovery threshold tables, custom-state lifetime, helper/projectile inheritance, visual parity, score movement, and full MUGEN/IKEMEN Common1/get-hit parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-animelem-offset.json` checksum `4484031d` remains required and proves bounded imported active-state legacy `AnimElem` elapsed-time routing: P1 enters state `200`, advances through authored AIR frame durations `[2,6,4]`, then exits through `AnimElem = 2, = 4` into state/action `300` without `HitDef` / combat side effects. Previous required `synthetic-imported-animelem.json` checksum `683d9a10` still proves `AnimElem = 2, = 0` into state/action `299`. This is bounded current-actor animation-element trigger evidence only; AIR loop semantics, negative-duration semantics, helper/state-owner namespaces, visual parity, score movement, and full MUGEN/IKEMEN animation VM parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-owner-metrics.json` checksum `1a61aaeb` remains required and proves bounded imported State -1 current-owner metric routing: P1 presses `x`, then `StateNo = 0`, `Anim = 0`, `Time >= 0`, `Life = 1000`, `Power = 0`, `Pos X < 0`, `Pos Y = 0`, `Vel X = 0`, and `Vel Y = 0` route into state/action `298` without `HitDef` / combat side effects. `RuntimeExpressionContextWorld` exposes the post-transition `stateElapsed = -1` sentinel as observable `Time` / `StateTime` zero for CNS reads. This is bounded owner metric trigger evidence only; exact VM tick ordering, helper/team/redirect state namespaces, localcoord scaling, visual parity, score movement, and full MUGEN/IKEMEN trigger parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-p2-distance.json` checksum `2c584be0` remains required and proves bounded imported State -1 current-opponent spacing routing: P1 presses `x`, then `P2Dist X = 55`, `P2Dist Y = 0`, `P2BodyDist X = 7`, and `P2BodyDist Y = 0` route into state/action `297` without `HitDef` / combat side effects. This is bounded two-actor opponent-spacing evidence only; teams/simul, helpers, exact opponent selection, localcoord scaling, push/corner adjustment, visual parity, score movement, and full MUGEN/IKEMEN spacing parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-p2-state-context.json` checksum `caf32557` remains required and proves bounded imported State -1 current-opponent metadata routing: P1 presses `x`, then `P2StateType = S` and `P2MoveType = I` route into state/action `296` without `HitDef` / combat side effects. This is bounded two-actor opponent-context evidence only; teams/simul, helpers, custom-state opponent ownership, exact opponent selection, visual parity, score movement, and full MUGEN/IKEMEN trigger parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-state-context.json` checksum `cb9c3d1e` is required and proves bounded imported State -1 owner-context routing: P1 presses `x`, then `ctrl`, `StateType = S`, `MoveType = I`, and `Physics = S` route into state/action `295` without `HitDef` / combat side effects. This is bounded trigger-context evidence only; helper/team/redirect metadata ownership, exact controller-loop ordering, visual parity, score movement, and full MUGEN/IKEMEN trigger parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-gametime.json` checksum `bab573f3` is required and proves bounded imported State -1 global-tick routing: P1 delays the `x` command until `GameTime >= 4`, then enters state/action `294` without `HitDef` / combat side effects. This is bounded trigger evidence only; exact pause accounting, replay/rollback timing, multi-round timer ownership, IKEMEN round-system behavior, visual parity, score movement, and full MUGEN/IKEMEN global timing parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-edge-distance.json` checksum `785de452` is required and proves bounded imported State -1 edge-distance routing: P1 presses `x`, evaluates `FrontEdgeDist = 340`, `BackEdgeDist = 300`, `FrontEdgeBodyDist = 301`, and `BackEdgeBodyDist = 261` against supplied stage bounds, then enters state/action `293` without `HitDef` / combat side effects. That checkpoint passed `pnpm qa:trace` at 215/215 artifacts, 195 required and 20 optional. Focused tests still cover direct evaluator values, `RuntimeExpressionContextWorld`, helper-local trigger branches, helper-local controller expressions, and no-stage fallback. This is bounded trigger/expression plumbing only; exact camera/screen edge parity, localcoord scaling, push/corner behavior, teams/simul/helper namespace breadth, visual parity, score movement, and full MUGEN/IKEMEN edge-distance parity remain blocked.

Previous runtime/port addendum: `synthetic-imported-default-fall-recovery.json` checksum `d83797d9` is stricter and proves bounded imported Common1 full-chain fall recovery order: P2 must show ordered controller/actor-frame evidence for `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120`, with `5110` down-recovery countdown-range and first-to-last-drop evidence before `5120`. That checkpoint passed `pnpm qa:trace` at 214/214 artifacts, 194 required and 20 optional. This is synthetic Common1 route evidence only; it does not prove exact controller-loop timing, bounce physics, threshold/down-recovery tables, visual parity, score movement, public KFM parity, or full MUGEN/IKEMEN Common1 VM parity.

Previous runtime/port addendum: `synthetic-imported-animelemtime.json` checksum `2036557d` is required and proves bounded imported active-state animation-element timing: state `200` advances through authored AIR frame durations `[2,4,4]`, then exits through `AnimElemTime(2) = 2` into state `292` without `HitDef` / combat side effects. This is trigger evidence only; it does not prove exact AIR loop semantics, invalid-element bottom values, negative-duration semantics, state-owner/helper namespaces, persistent-controller timing, visual parity, score movement, or full MUGEN/IKEMEN animation VM parity.

Previous runtime/port addendum: `RuntimeFighterStateWorld` now owns bounded fighter runtime-state construction for resource maxima, damage multipliers, initial action/control/resource state, command buffers, contact memory, telemetry buckets, injected world references, deterministic RNG seed, and lazy runtime-program compilation. This is R2 ownership cleanup only; it does not prove exact player lifecycle parity, helper/custom-state clone breadth, team/simul roster ownership, intro/round lifecycle, visual parity, or score movement.

Previous runtime/port addendum: `RuntimeMatchResetWorld` now owns bounded match reset orchestration for round/pause/env/effect resets, in-place P1/P2 recreation, helper TargetState handler reattachment, and reset logging. This is R2 ownership cleanup only; it does not prove exact round-flow parity, continue/round intro semantics, helper/custom-state reset breadth, screenpack/lifebar reset behavior, visual parity, or score movement.

Previous runtime/port addendum: `RuntimeHelperTargetStateWorld` now owns bounded helper TargetState handler attach/re-attach wiring for match actors. This is R2 ownership cleanup only; it does not prove helper-owned custom-state table parity, throws, teams/simul, multi-target/helper-owned opponent selection, exact helper TargetState timing, visual parity, or score movement.

Previous runtime/port addendum: `RuntimeFrameWorld` now owns bounded current AIR frame lookup plus cloned `Clsn1` / `Clsn2` projection for runtime and snapshot consumers. This is R2 ownership cleanup only; it does not prove exact collision priority, frame timing, guard-distance thresholds, rotated/scaled box semantics, helper/team/redirect collision ownership, renderer parity, visual parity, or score movement.

Previous runtime/port addendum: `RuntimeAfterImageSampleWorld` owns bounded `AfterImage` sample projection from actor runtime state plus current AIR frame before `RuntimeSpriteEffectWorld` captures ghost-trail samples. This is R2 ownership cleanup only; it does not prove exact ghost-trail sampling cadence, material/blend parity, helper/team/redirect presentation ownership, renderer parity, visual parity, or score movement.

Previous runtime/port addendum: `RuntimeControllerEvaluationContextWorld` now owns bounded `StateControllerExecutor` context creation for active runtime-controller dispatch. This is R2 ownership cleanup only; it does not prove full passive-controller parity, exact CNS controller-loop timing, helper/team/redirect context scopes, exact random stream parity, visual parity, or score movement.

Previous runtime/port addendum: `RuntimeDispatchEvaluationWorld` owns bounded dynamic active-controller dispatch-param fallback between compiled dispatch data and `RuntimeExpressionContextWorld` read-model creation. This is R2 ownership cleanup only; it does not prove full dynamic-param parity, persistent-controller timing, exact CNS controller tick order, helper/team/redirect parameter scopes, visual parity, or score movement.

Previous runtime/port addendum: `RuntimeTriggerEvaluationWorld` owns bounded normalized `TriggerIr` expression evaluation between `RuntimeTriggerGateWorld` grouping and `RuntimeExpressionContextWorld` read-model creation. This is R2 ownership cleanup only; it does not prove full expression language parity, persistent-controller timing, exact CNS trigger tick order, helper/team/redirect trigger scopes, visual parity, or score movement.

Previous runtime/port addendum: `synthetic-imported-projectile-target-redirect.json` checksum `cd099094` is required and proves bounded player-owned Projectile target redirect routing: state `200` spawns Projectile id `77`, the Projectile hits P2 for 31, owner target memory records target id `77`, and owner-local `NumTarget(77)` / `Target(77), Life <= 969` branches P1 to `277`. That checkpoint passed `pnpm qa:trace` at 204/204 artifacts, 184 required and 20 optional. Previous helper Projectile bare Target proof remains required as `synthetic-imported-helper-projectile-bare-target.json` checksum `8c9129c1`; previous helper Projectile default/explicit TargetState proofs remain required as `synthetic-imported-helper-projectile-default-targetstate.json` checksum `918c42a1` and `synthetic-imported-helper-projectile-targetstate.json` checksum `b12e1cb3`; previous helper Projectile default/explicit Target-controller proofs remain required as `synthetic-imported-helper-projectile-default-target-controllers.json` checksum `0c4c69ae` and `synthetic-imported-helper-projectile-target-controllers.json` checksum `58688be8`. This does not prove Target* mutation mixing, helper-owned projectile targets, teams/simul, multi-target/helper-owned opponent selection, exact target lifetime/tick order, visual parity, score movement, or full Projectile target parity.

Previous runtime/port addendum: `RuntimeTraceGate.requiredHitEffectEvents` can require selected AIR-frame offset/duration metadata through `assetFrameOffsetX`, `assetFrameOffsetY`, and `assetFrameDuration`, in addition to authored spark offsets with `offsetX` / `offsetY`. Direct common/FightFX hit/guard gates, direct hit/guard effect package gates, Projectile hit/guard package gates, and helper-parented Projectile `ProjHit` / `ProjGuarded` / `ProjContact` package gates require the first selected HitSpark frame's authored `3,-4` offset and `5` duration already present in runtime evidence. This is presentation evidence precision only; it does not prove exact visual binding, render timing, layering, scale, palette, SND playback, helper-owned presentation ownership, score movement, or full MUGEN/IKEMEN presentation parity.

Previous runtime/port addendum: `synthetic-imported-default-fall-official-air-recovery.json` checksum `b0363be9` is now required and proves bounded official-style synthetic Common1 air recovery through `5050 -> 5210 -> 52 -> 0` after `command = "recovery"` while airborne. It requires positive-to-zero `fall.recovertime` actor-frame order, bounded `5210` recovery velocity telemetry, `52` landing evidence, final idle/control, and controller/typed-operation order for recovery and landing. Previous ground proof remains required: `synthetic-imported-default-fall-official-ground-recovery.json` checksum `74b72495`. `RuntimeTargetWorld.resolveCandidates` remains the latest R2 ownership checkpoint. Current helper proof remains required and stricter: `synthetic-imported-helper-projcontact.json` checksum `4dcbdd25` for helper-local `ProjContact(8855)` / `ProjContactTime(8855) >= 1` now requires owner-side target-link evidence, shared guard sound/FightFX spark package metadata, and Projectile payload `parentId = p1-helper-0`; `synthetic-imported-helper-projguard.json` checksum `d2e2f20d` and `synthetic-imported-helper-projhit.json` checksum `2d9a281e` carry matching guard/hit package requirements. Previous Common1 proof remains required but is now stricter: `synthetic-imported-default-fall-recovery.json` checksum `d83797d9` gates `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120` full-chain order plus `5110` down-recovery countdown evidence, alongside the official-style threshold / too-early pair (`86804271` / `ef945ff5`). This air-recovery proof does not prove exact `fall.recovertime` tables, velocity math, controller-loop timing, public bundled KFM support, full Common1 parity, visual parity, score movement, or full MUGEN/IKEMEN recovery parity.

## Current Score

| Horizon | Score | Meaning |
| --- | ---: | --- |
| Playable private sandbox | 65 / 100 | Local match is playable with generated/native fighters, imported KFM route, stages, debug panels, and Studio workflow. |
| Practical MUGEN compatibility by layers | 35 / 100 | DEF/AIR/CMD/CNS/SFF/SND pieces exist, many controllers/triggers have bounded gates, but broad character compatibility remains partial. |
| MUGEN 1.0/1.1 MVP port | 20 / 100 | Infrastructure is in place for KFM/Common1-style authored routes, but exact VM/combat/helper/screenpack parity is still open. |
| Full MUGEN/Ikemen-GO port | 10-12 / 100 | Foundation exists. Full VM parity, helpers, redirects, teams, lifebars/screenpacks, Lua/ZSS, exact tick order, rollback/netplay, and broad fixture matrix remain future work. |

Docs/setup work alone does not change scores. The current official-style air-recovery sequence cut also keeps score bands unchanged because it tightens bounded Common1 evidence without broad parity claims.

Previous implementation checkpoint: `synthetic-imported-helper-projectile-bare-target.json` checksum `8c9129c1` gates bounded helper-parented Projectile bare Target routing, owner/helper target-link evidence for target id `8863`, helper state `1242/978`, projectile anim `979`, helper payload `targetCount = 1`, projectile payload `parentId = p1-helper-0` / `effectId = 8863`, final P2 `life = 982`, and shared `S5,11` / FightFX `F7017` contact-package evidence. That checkpoint passed `pnpm qa:trace` at 203/203 artifacts, 183 required and 20 optional. This is direct player target trigger evidence plus helper HitDef/Projectile explicit/default/bare target evidence plus bounded helper-owned direct-HitDef and explicit/default helper-parented Projectile Target mutation plus owner-backed direct-HitDef/explicit-default Projectile TargetState evidence only; it does not prove helper-owned custom state tables, throws, teams, exact target lifetime/tick order, exact helper hitpause/tick order, full target/combat/projectile parity, or score movement.

Previous implementation checkpoint: selected HitSpark AIR-frame offsets and duration are now first-class trace requirements through `RuntimeTraceGate.requiredHitEffectEvents.assetFrameOffsetX` / `assetFrameOffsetY` / `assetFrameDuration`, alongside authored `sparkxy` offsets. The current common/FightFX and contact-package gates require that metadata before renderer/audio handoff. This is presentation evidence precision only; it does not prove exact renderer binding/timing/layering/scale/palette, SND playback, helper-owned presentation ownership, full presentation parity, or score movement.

Previous implementation checkpoint: required `synthetic-imported-default-fall-official-air-recovery.json` checksum `b0363be9` gates official-style synthetic Common1 air recovery through `5050 -> 5210 -> 52 -> 0`. This is Common1 recovery precision only; it does not prove exact `fall.recovertime` tables, velocity math, controller-loop timing, public bundled KFM support, visual parity, full recovery parity, or score movement.

Previous implementation checkpoint: required `synthetic-imported-changeanim2-elem.json` checksum `b0b46d33` promotes a bounded active-state `ChangeAnim2` `elem = 3` / `elemtime = 1` owner-AIR route into `pnpm qa:trace`. The trace enters imported state `200`, retargets to action `207` with authored frame durations `[4,5,6]`, and final P1 evidence ends at `frameIndex = 2` / `animTime = 20`. That R1 animation-controller trace precision cut does not prove missing-action fallback, redirects, helper/custom-state ownership, multi-import SFF namespaces, exact controller tick order, visual parity, score movement, or full animation-source parity.

Previous implementation checkpoint: required `synthetic-imported-default-fall-official-recovery-threshold.json` checksum `86804271` and `synthetic-imported-default-fall-official-recovery-too-early.json` checksum `ef945ff5` promote official-style synthetic Common1 recovery threshold / too-early rejection routes into `pnpm qa:trace`. That R1 trace precision cut does not prove exact `fall.recovertime` tables, velocity math, controller-loop tick order, public bundled KFM support, full Common1 recovery parity, or score movement.

Previous implementation checkpoint: `RuntimeTargetWorld.resolveCandidates` owns bounded target-candidate filtering from live target memory before current Target* / BindToTarget controller application and active TargetBind / BindToTarget position application. Focused `TargetSystem` coverage proves actor-id and target-id filtering plus mutation only against remembered targets. This is R2 ownership cleanup only; it does not prove helper/projectile target ownership, exact team/multi-target selection, exact target lifetime, throw binding, exact bind tick order, visual parity, or score movement.

Previous implementation checkpoint: `RuntimeExpressionContextWorld` now owns bounded active runtime expression/trigger context creation for imported state triggers and dynamic controller-param fallback. Focused `RuntimeExpressionContextSystem` coverage proves numeric reads, `Target` redirects, compiled trigger evaluation, const/state/HitVar helpers, and shared context creation. This is R2 ownership cleanup only; it does not prove full expression language parity, composite `HitDefAttr` parity, helper/team redirect mutation, exact VM timing, visual parity, or score movement.

Previous implementation checkpoint: `RuntimeStateTransitionControllerWorld` now owns bounded passive `ChangeState` / `SelfState` setup from raw controller params in the basic `StateControllerExecutor` path. Focused `StateTransitionControllerSystem` coverage proves expression fallback, previous-state metadata writes, frame/time reset, optional `ctrl`, missing-value reporting, unchanged-state timing reset behavior, and `StateControllerExecutor` routing. This is R2 ownership cleanup only; it does not prove exact active-state entry tick order, persistent controller semantics, redirects/helper/team ownership, custom-state breadth, full state-entry VM parity, or score movement.

Previous implementation checkpoint: `RuntimeAnimationControllerWorld` now owns bounded passive `ChangeAnim` / `ChangeAnim2` setup from raw controller params in the basic `StateControllerExecutor` path. Focused `AnimationControllerSystem` coverage proves expression fallback, self/state-owner source marking, reset, bounded `elem` / `elemtime` seeding against known AIR frame durations, no-value no-op behavior, and `StateControllerExecutor` routing. This is R2 ownership cleanup only; it does not prove missing-action fallback, full active-state `elem`/`elemtime` parity, redirects/helper/team ownership, full state-owner namespace behavior, exact animation-source parity, or score movement.

Previous implementation checkpoint: `RuntimeKinematicControllerWorld` now owns bounded passive `VelSet`, `VelAdd`, `VelMul`, `HitVelSet`, `PosSet`, `PosAdd`, and `Gravity` setup from typed `kinematic:*` operations or raw controller params. Focused `KinematicControllerSystem` coverage proves typed setup, raw expression fallback, default-axis behavior, hit-velocity flags, gravity defaults, and `StateControllerExecutor` routing. This is R2 ownership cleanup only; it does not prove exact MUGEN/IKEMEN physics, velocity tick order, `yaccel` constants, helper/team/redirect ownership, full kinematic VM parity, or score movement.

Previous implementation checkpoint: `RuntimeBoundsControllerWorld` now owns bounded passive `PlayerPush`, `PosFreeze`, and `ScreenBound` setup from typed `collision:playerpush` / `bounds:*` operations or raw controller params. Focused `BoundsControllerSystem` coverage proves typed setup, raw defaults, raw expression fallback, and `StateControllerExecutor` routing. This is R2 ownership cleanup only; it does not prove exact player/edge collision, team/helper push behavior, screen-edge/camera parity, PosFreeze tick order, full constraint VM parity, or score movement.

Previous implementation checkpoint: `RuntimeHitFallControllerWorld` now owns bounded passive `HitFallVel`, `HitFallDamage`, and `HitFallSet` mutation from typed `hitfall:*` operations or raw controller params. Focused `HitFallControllerSystem` coverage proves typed `HitFallSet`, raw expression fallback, stored fall velocity application, bounded `fall.defence_up` scaling, and nonlethal deferred fall damage. This is R2 ownership cleanup only; it does not prove exact Common1 controller-loop order, helper/team/redirect ownership, exact recovery thresholds/velocity math, full fall/get-hit parity, or score movement.

Previous implementation checkpoint: `RuntimeStateTypeWorld` owns bounded passive `StateTypeSet` `stateType` / `moveType` / `physics` setup from typed `metadata:statetypeset` operations, raw controller params, and the later bounded enum-expression gate. Focused `StateTypeSystem` coverage proves typed setup, raw case-normalized fallback, invalid raw no-op behavior, and bounded dynamic enum fallback evidence through the current required artifact. This is R2/R1 evidence only; it does not prove broad dynamic metadata expressions, helper/team/redirect ownership, exact physics/tick-order interactions, full StateTypeSet parity, or score movement.

Previous implementation checkpoint: `RuntimeDamageScaleWorld` owns bounded passive `AttackMulSet` and `DefenceMulSet` multiplier setup from typed `damage-scale:*` operations or raw controller params. Focused `DamageScaleSystem` coverage proves typed setup, raw expression fallback, clamp behavior, and no-value no-op behavior. This is R2 ownership cleanup only; it does not prove exact MUGEN/IKEMEN scaling stack/order, helper/projectile/custom-state/guard edge cases, redirect ownership, controller-loop timing, full damage-scale parity, or score movement.

Previous implementation checkpoint: `RuntimeHitDefenseWorld` owns bounded passive `HitBy`, `NotHitBy`, and `HitOverride` slot setup/removal from typed `eligibility:*` / `hitoverride` operations or raw controller params. Focused `HitDefenseSystem` coverage proves typed and raw setup/removal semantics. This is R2 ownership cleanup only; it does not prove exact attr grammar, slot priority, helper/custom-state redirect breadth, forceair/forceguard edge order, controller-loop timing, full defensive-slot parity, or score movement.

Previous implementation checkpoint: `RuntimeHitDefControllerDispatchWorld` now owns bounded active-state HitDef activation dispatch from compiled CNS classification into the current attack payload: controller telemetry, typed `hitdef` operation selection, raw fallback attack params, fired-HitDef dedupe, current-frame `Clsn1` hitbox handoff, currentMove mutation, attack movetype/control writes, and operation telemetry. Focused `HitDefSystem` coverage proves activation payloads and duplicate suppression through the boundary. This is R2 ownership cleanup only; it does not prove exact HitDef trigger lifetime, contact ordering, multi-hit windows, helper/projectile/custom-state ownership, broad attr grammar, hitpause/tick order, full HitDef VM parity, or score movement.

Previous implementation checkpoint: `RuntimeReversalControllerDispatchWorld` now owns bounded active-state ReversalDef side-effect dispatch from compiled CNS classification into `RuntimeReversalWorld`: controller telemetry, typed `reversaldef` operation selection, raw fallback activation payload, activation handoff, and operation telemetry. Focused `ReversalSystem` coverage proves controller/op telemetry plus ReversalDef activation through the boundary. This is R2 ownership cleanup only; it does not prove exact ReversalDef priority, guard/projectile/helper/custom-state counter breadth, attr grammar, trigger lifetime, hitpause/tick order, full ReversalDef VM parity, or score movement.

Previous implementation checkpoint: `RuntimeEffectSpawnControllerDispatchWorld` now owns bounded active-state Explod / RemoveExplod / ModifyExplod / Helper / Projectile / ModifyProjectile side-effect dispatch from compiled CNS classification into `RuntimeEffectSpawnWorld`: controller telemetry, typed effect operation selection, spawn/count mutation handoff, and success-gated operation telemetry. Focused `EffectSpawnSystem` coverage proves successful Explod telemetry/mutation and failed ModifyExplod no-operation gating through the boundary. This is R2 ownership cleanup only; it does not prove exact effect spawn tick order, helper-owned effect namespaces, dynamic effect params, helper-owned projectile combat/contact/target memory, full effect/helper/projectile VM parity, or score movement.

Previous implementation checkpoint: `RuntimeActorConstraintControllerDispatchWorld` owns bounded active-state `Width` side-effect dispatch from compiled CNS classification into `RuntimeActorConstraintWorld`: controller telemetry, typed `collision:width` operation selection, operation telemetry, and body-width mutation handoff. Focused `ActorConstraintSystem` coverage proves `Width` telemetry/mutation through the boundary. This is R2 ownership cleanup only; it does not prove exact player/edge collision, team/helper push behavior, screen-edge/camera parity, Width edge semantics, full constraint VM parity, or score movement.

Previous implementation checkpoint: `RuntimePauseControllerDispatchWorld` owns bounded active-state Pause/SuperPause side-effect dispatch from compiled CNS classification into the match pause handler: controller telemetry, typed `pause` operation selection, apply-controller callback handoff, and operation telemetry after a real pause result. Focused `PauseSystem` coverage proves `SuperPause` telemetry/application through the boundary. This is R2 ownership cleanup only; it does not prove exact pause layering, super background/sound/spark timing, helper/redirect ownership, full pause VM parity, or score movement.

Previous implementation checkpoint: `RuntimeEnvShakeControllerDispatchWorld` owns bounded active-state EnvShake side-effect dispatch from compiled CNS classification into `RuntimeEnvShakeWorld`: controller telemetry, typed `envshake` operation selection, operation telemetry, and camera-shake event handoff. Focused `EnvShakeSystem` coverage proves `EnvShake` telemetry/mutation through the boundary. This is R2 ownership cleanup only; it does not prove exact waveform, pause/stage/layer interaction, helper/redirect ownership, full presentation parity, or score movement.

Previous implementation checkpoint: `RuntimeEnvColorControllerDispatchWorld` owns bounded active-state EnvColor side-effect dispatch from compiled CNS classification into `RuntimeEnvColorWorld`: controller telemetry, typed `envcolor` operation selection, operation telemetry, and stage-flash event handoff. Focused `EnvColorSystem` coverage proves `EnvColor` telemetry/mutation through the boundary. This is R2 ownership cleanup only; it does not prove exact blend math, layer/window ordering, pause timing, renderer parity, full presentation parity, or score movement.

Previous implementation checkpoint: `RuntimeAudioControllerDispatchWorld` owns bounded active-state audio side-effect dispatch from compiled CNS classification into `RuntimeAudioWorld`: controller telemetry, typed `audio:*` operation selection, operation telemetry, and `PlaySnd` / `StopSnd` event handoff. Focused `AudioEventSystem` coverage proves `PlaySnd` telemetry/mutation through the boundary. This is R2 ownership cleanup only; it does not prove exact SND playback, channel priority, mixing, FightFX/common fallback, full CNS/audio parity, or score movement.

Previous implementation checkpoint: `RuntimeContactControllerDispatchWorld` owns bounded active-state contact-memory side-effect dispatch from compiled CNS classification into `RuntimeContactMemoryWorld`: controller telemetry, typed `contact:*` operation selection, operation telemetry, `HitAdd` mutation, and `MoveHitReset` direct contact reset. Focused `ContactMemorySystem` coverage proves `HitAdd` telemetry/mutation and `MoveHitReset` reset telemetry through the boundary. This is R2 ownership cleanup only; it does not prove exact combo lifetime, helper/projectile contact ownership, guard-count parity, full CNS VM parity, or score movement.

Previous implementation checkpoint: `RuntimeTargetControllerDispatchWorld` owns bounded active-state Target / BindToTarget side-effect dispatch from compiled CNS classification into `RuntimeTargetWorld`: controller telemetry, typed `target:*` / `bindtotarget` operation selection, operation telemetry, and mutation handoff with match-owned callbacks for damage scaling, TargetState entry, and target constants. Focused `TargetSystem` coverage proves `TargetLifeAdd` telemetry/mutation and `BindToTarget` anchor/position telemetry through the boundary. This is R2 ownership cleanup only; it does not prove helper/projectile target ownership, exact multi-target semantics, throw binding, full CNS VM parity, or score movement.

Previous implementation checkpoint: `RuntimeSpriteEffectControllerWorld` owns bounded active-state sprite-effect side-effect dispatch from compiled CNS classification into `RuntimeSpriteEffectWorld`: controller telemetry, typed `sprite-effect:*` operation selection, operation telemetry, and mutation handoff for `SprPriority`, `PalFX`, `AfterImage`, `AfterImageTime`, `Trans`, and `AngleSet` / `AngleAdd` / `AngleDraw`. Focused `SpriteEffectSystem` coverage proves PalFX telemetry/mutation, AfterImage sampling, and `Trans` render-opacity mutation through the boundary. This is R2 ownership cleanup only; it does not prove exact visual tick order, helper/redirect ownership, renderer parity, full CNS VM parity, or score movement.

Previous implementation checkpoint: `RuntimeStateEntrySetupWorld` owns bounded imported State -1 setup-controller selection before command routing while concrete mutation still routes through `RuntimeControllerDispatchWorld`. Focused `RuntimeStateEntrySetupSystem` coverage proves imported setup execution, non-imported skip, trigger failure, and non-setup filtering. This is R2 ownership cleanup only; it does not prove exact State -1 ordering, persistent controller semantics, redirect/helper/team scopes, full CNS VM parity, or score movement.

Latest implementation checkpoint: `RuntimeActiveSideEffectDispatchWorld` owns bounded active-state side-effect dispatch routing from `PlayableMatchRuntime`: singleton routes for `HitDef`, `ReversalDef`, `Width`, `FallEnvShake`, `Pause` / `SuperPause`, sound, `EnvColor`, `EnvShake`, and contact controllers plus grouped routes for sprite effects, effect spawns, and `Target*` / `BindToTarget`. Focused `RuntimeActiveSideEffectDispatchSystem` coverage proves every current side-effect route maps to the expected handler, missing hooks fail soft, and non-side-effect dispatches pass through. This is R2 ownership cleanup only; it does not prove exact CNS VM tick order, persistent-controller semantics, helper/team/redirect controller scopes, side-effect ordering parity, target/combat/presentation semantic parity, visual parity, or score movement.

Previous implementation checkpoint: `RuntimeActiveStateDispatchWorld` owns bounded active-state `ChangeState` / `SelfState` and `ChangeAnim` / `ChangeAnim2` dispatch mutation from `PlayableMatchRuntime`: dynamic numeric/boolean param resolution, controller telemetry, state-entry handoff, optional ctrl mutation, state-owner animation source selection, and `elem` / `elemtime` handoff. Focused `RuntimeActiveStateDispatchSystem` coverage proves dynamic SelfState with anim/ctrl, ChangeAnim2 owner/elem routing, unresolved state/animation fail-closed behavior, and non-state dispatch pass-through. This is R2 ownership cleanup only; it does not prove exact CNS VM tick order, persistent-controller semantics, helper/team/redirect controller scopes, missing-action fallback parity, full ChangeState/ChangeAnim VM parity, visual parity, or score movement.

Previous implementation checkpoint: `RuntimeResourceWorld` owns bounded resource/control/variable mutation behind a named resource-world boundary, with legacy helper functions delegating through that world. Focused `RuntimeResourceSystem` coverage proves direct world mutation for life, power, ctrl, and vars while preserving existing semantics. This is R2 ownership cleanup only; it does not prove exact CNS resource timing, helper/team/redirect resource ownership, round/KO flow, dynamic lowering, full controller VM parity, or score movement.

Previous implementation checkpoint: `TargetSystem` now gates active `TargetBind` and `BindToTarget` position application against live target memory, so stale bindings no longer move actors after target memory disappears. Focused `TargetSystem` coverage proves active binding success and stale-binding no-mutation behavior. This is R2 ownership cleanup only; it does not prove exact bind/drop tick order, helper/team/multi-target ownership, custom-state throw binding, full target parity, or score movement.

Previous implementation checkpoint: `TargetSystem` now owns bounded `BindToTarget` `postype` anchor resolution previously inline in `PlayableMatchRuntime`. Focused `TargetSystem` coverage proves `Foot` / `Mid` / `Head` anchor math against MUGEN `size.*.pos` constants while preserving current bind placement. This is R2 ownership cleanup only; it does not prove exact bind tick order, helper/team/multi-target ownership, custom-state throw binding, full target parity, or score movement.

Previous implementation checkpoint: `RuntimeContactPresentationWorld` now owns bounded direct `HitDef` and `Projectile` contact presentation package emission previously inline in `PlayableMatchRuntime`. Focused `RuntimeContactPresentationSystem` coverage proves direct hit and projectile guard package metadata are shared across attacker-side `PlaySnd` and HitSpark events while preserving existing hit-spark asset-frame handoff. This is R2 ownership cleanup only; it does not prove exact intra-tick audio/spark ordering, SND playback/mixing/channel priority, exact FightFX/common lookup/binding/layering/timing/scale/palette, helper-owned contact presentation, multi-target presentation, broad imported runtime parity, or score movement.

Previous implementation checkpoint: `RuntimeGuardDistanceWorld` owns bounded `InGuardDist`/auto-guard proximity checks previously inline in `PlayableMatchRuntime`. Focused `RuntimeGuardDistanceSystem` coverage proves the pre-active guard-distance window, missing/spent/out-of-window rejects, guardflag and AssertSpecial rejects, unguardable attacks, and authored `guard.dist` thresholds. This is R2 ownership cleanup only; it does not prove exact proximity guard parity, guard-end timing, guard effects, air-guard landing, broad Common1 controller-loop parity, broad imported runtime parity, or score movement.

Previous implementation checkpoint: `HelperSystem` owns a bounded helper-local micro-VM for current visual Helper actors spawned with owner runtime-program data; `RuntimeEffectSpawnWorld` passes owner runtime programs and animation maps into Helpers, and `RuntimeEffectLifecycleWorld` supplies owner runtime state for bounded helper-local `Parent, ...` / `Root, ...` read-only redirects. Focused `EffectActorSystem`, `RuntimeCnsSubset`, and `EffectSpawnSystem` coverage proves helper-local `Time` trigger evaluation, `VelSet`, `ChangeAnim`, `ChangeState`, `DestroySelf` removal, helper-local `CtrlSet` / `StateTypeSet`, helper-local `LifeAdd` / `LifeSet` / `PowerAdd` / `PowerSet`, helper-local `VarSet` / `VarAdd` / `VarRandom` / `VarRangeSet` trigger branches, helper-local `PlaySnd` / `StopSnd` sound-event telemetry in helper snapshots, leading parent/root redirect branches and values, parent/root operands inside composite arithmetic/boolean/`IfElse(...)` expressions, and the spawn handoff. Existing R1 trace gates still include required `synthetic-imported-hitdef-hit-effect-package.json` checksum `46aa5ce1`, required `synthetic-imported-hitdef-guard-effect-package.json` checksum `1c3167b7`, required `synthetic-imported-default-fall-gethit.json` checksum `6af73a91`, required `synthetic-imported-default-fall-recovery.json` checksum `d83797d9`, required common/FightFX hit spark gates `synthetic-imported-hitdef-common-spark.json` checksum `5ea054d7` / `synthetic-imported-hitdef-fightfx-spark.json` checksum `11537b56`, and required common/FightFX guard spark gates `7650a09c` / `32f3e92d`.

Current runtime evidence checkpoint: required `synthetic-imported-projectile-gethitvar-hitcount.json` trace checksum `df2619f9` / final checksum `5469bc69` and upgraded `synthetic-imported-helper-projectile-gethitvar-hitcount.json` trace checksum `40ec4f4b` / final checksum `6f15ff30` prove bounded player-owned and helper-parented/root-owned Projectile normal-hit `GetHitVar(hitcount)` metadata. The gates route P2 through defender-owned Common1-style `5000 -> 339/340`, preserve HitDef `numhits` separately from Projectile `projhits` plus target/lifecycle evidence, prove non-guarded hitcount reads, and require player/helper typed `audio:playsnd`, `S5,47/S5,42`, and FightFX `F7002` package telemetry. `pnpm qa:trace` passes 524/524 artifacts, 493 required and 31 optional. This is R1 evidence only; no score movement, exact combo accumulation, chain-hit eligibility arbitration, multi-hit timing, exact hitpause lifetime, exact target lifetime/tick order, helper-owned custom states, custom-state inheritance, broader helper Projectile normal-hit sound breadth, visual/audio parity, and full Projectile/GetHitVar parity remain blocked.

Previous runtime evidence checkpoint: required `synthetic-imported-projectile-gethitvar-hitid-chainid.json` trace checksum `4356b5cb` / final checksum `4b270d45` and upgraded `synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json` trace checksum `616e0b2c` / final checksum `0aebcc73` prove bounded player-owned/helper-parented Projectile `GetHitVar(hitid/chainid)` metadata, with player/helper typed `audio:playsnd`, `S5,46/S5,41`, and FightFX `F7002` package telemetry. That checkpoint remains required.

Previous runtime evidence checkpoint: required `synthetic-imported-projectile-gethitvar-hit-metadata.json` trace checksum `8e5df79b` / final checksum `4d078c5d` and upgraded `synthetic-imported-helper-projectile-gethitvar-hit-metadata.json` trace checksum `28afbcea` / final checksum `c960b1cf` prove bounded player-owned/helper-parented Projectile `GetHitVar(damage/hittime/xvel/yvel)` metadata, with player/helper typed `audio:playsnd`, `S5,45/S5,40`, and FightFX `F7002` package telemetry. That checkpoint remains required.

Previous runtime evidence checkpoint: required `synthetic-imported-projectile-guard-slide-stop.json` trace checksum `965c2d12` / final checksum `0973a73c` and `synthetic-imported-helper-projectile-guard-slide-stop.json` trace checksum `6c42a378` / final checksum `df8b7a42` extend existing direct guard slide-stop/control evidence to player-owned Projectile and helper-parented Projectile routes. That checkpoint passed 405/405 artifacts, 375 required and 30 optional, and remains required.

Previous runtime evidence checkpoint: required `synthetic-imported-guard-cornerpush-default.json` checksum `95293bc4`, `synthetic-imported-projectile-guard-cornerpush-default.json` checksum `58798e7a`, and `synthetic-imported-helper-projectile-guard-cornerpush-default.json` checksum `292b2015` add bounded default `guard.cornerpush.veloff` derivation coverage. That checkpoint passed 397/397 artifacts, 367 required and 30 optional, and remains required.

Previous runtime evidence checkpoint: required `synthetic-imported-down-hit-cornerpush-default.json` checksum `04557813`, `synthetic-imported-projectile-down-hit-cornerpush-default.json` checksum `b302e3b9`, and `synthetic-imported-helper-projectile-down-hit-cornerpush-default.json` checksum `fe0c3ff1` add bounded default `down.cornerpush.veloff` derivation coverage. That checkpoint passed 394/394 artifacts, 364 required and 30 optional, and remains required.

Previous runtime evidence checkpoint: required `synthetic-imported-air-hit-cornerpush-default.json` checksum `73129a04`, `synthetic-imported-projectile-air-hit-cornerpush-default.json` checksum `9bfae4d6`, and `synthetic-imported-helper-projectile-air-hit-cornerpush-default.json` checksum `9c81047d` add bounded default `air.cornerpush.veloff` derivation coverage. That checkpoint passed 388/388 artifacts, 358 required and 30 optional, and remains required.

## Immediate Execution Order

| Slot | Cut | Done when |
| --- | --- | --- |
| 1 | I2 Wayfinder 127 | Its implementation owner closes fixture-specific active-root air-guard landing with focused, full-trace, and diff evidence; no generic physics claim. |
| 2 | R1 Compatibility Journey | Existing legal package/ZIP/loader/trace/browser evidence is aggregated behind versioned `CompatibilityJourney/v1`. |
| 3 | R1 milestone decision | Every written MUGEN-lite exit criterion is accepted, deferred, or blocked with artifact links; scores move only if the gate is met. |
| 4 | R1 independent breadth | A second legal package or ACT/palette route proves a materially different compatibility dimension. |
| 5 | S1/A1/I1 | Source transaction, permission-aware provenance, and package analysis advance as independent evidence packages. |
| 6 | I2/M1 architecture | Global AssertSpecial ownership precedes team-round widening; shared-core promotion waits for two real adapters/consumers. |

Docs/setup work is Slot 0: keep future agents aligned, then preserve the owner of Slot 1. Once that cut closes independently, Slots 2-4 restore the stated MUGEN-lite product priority. Use `docs/ROADMAP_PACKAGE_MILESTONES.md` to choose the exact package.

## Historical Evidence Snapshot - 509/509 Baseline

This table is retained as a historical snapshot. Current declared global evidence is 541/541 near the top of this document and in the backlog; do not use the 509/509 row below as the current aggregate.

| Area | Current Proof | Still Weak |
| --- | --- | --- |
| Runtime | `pnpm qa:trace` aggregate is 509/509 artifacts, 478 required and 31 optional. Latest required runtime trace is `synthetic-imported-const-controller-param.json` checksum `2dad3a50`, proving bounded `Const240p` / `Const480p` / `Const720p` player-local coordinate conversion can execute inside imported active-state `VelSet` params for a 640x480 player localcoord, with static and dynamic resolved `kinematic:velset` telemetry. Previous `synthetic-imported-const-coordinate.json`, `synthetic-imported-config-gamespace.json`, `synthetic-imported-screenspace.json`, `synthetic-imported-gamespace.json`, owner/helper `ModifyProjectile`, dynamic params, helper/owner dynamic bounds, static owner/helper `ModifyProjectile`, paired localcoord default-bound, 240p player/helper default-bound, helper/player explicit-bound, generic bounds-removal, terminal fallback/cancel, guard, ReversalDef, Projectile, helper, HitOverride, Common1, custom-state, presentation, audio, and SuperPause gates remain required and detailed in `docs/BUILD_EXECUTION_BACKLOG.md`. | Broad coordinate translation across all controller params, dynamic typed-operation lowering beyond active-state `VelSet`, exact player-local coordinate translation, exact renderer/screenpack viewport ownership, exact camera/screen/stage/height semantics, full localcoord scaling across Projectile params/controllers, exact terminal timing, exact sprite/layer/palette parity, exact cancel tick-order/lifetime, exact KO slowdown/lifebar/guard-finish timing, exact no-KO guard recovery timing, team/simul guard KO/no-KO breadth, exact guard-distance boxes, custom-state breadth beyond direct routes, projectile reflection/removal semantics after reversal, helper-owned custom-state tables, exact attr grammar, exact `ProjHit` / `ProjGuarded` / `ProjContact` tick order/lifetime, Move* interaction breadth, helper Projectile/custom-state breadth, exact combo accumulation, chain-hit eligibility arbitration, multi-hit/multi-target/team counting, exact hitpause/target lifetime, throws, teams/simul, visual/audio parity, public KFM support, score movement, and full MUGEN/IKEMEN parity. |
| Three.js rendering | `pnpm qa:smoke` screenshots and canvas checks, including active desktop/mobile diagnostics for `HitSparkRenderer` resolving `S`-prefixed player AIR spark frames into sprites when available, plus bounded common/FightFX system lookup-frame, first-pass `fight.def`/FightFX AIR/SFF loading, decoded system-SFF provider registration, package-frame handoff coverage, and 180-frame fallback geometry when AIR/sprite lookup fails. | Pixel-perfect MUGEN render parity, exact FightFX/common layering/timing/scale/palette, full spark animation timing, palette application, screenpack/lifebar parity. |
| Parsers/loaders | DEF/AIR/CMD/CNS/SFF/SND parsers with reports. | SFF v2 edge formats, full CNS expression language, all controller params, broader corpus. |
| Studio | Workbench, Assets, Evidence, Debug, Modules, Build surfaces. Latest visual proof: `pnpm qa:smoke` passes with compact Studio navigator/mission/control rows, denser Build/Evidence route copy, tightened stage toolbar placement, wrapped replacement rows, dense Studio Assets ledger, Studio Build / Modules release-desk screenshots, dense Studio Evidence audit screenshot, a shared command-desk viewport/status strip with icon-backed real metrics plus live Pause/HitPause state, fixed visible command labels, and a text `Readiness` band in Workbench Project Health. Desktop command-palette and console readability have keyboard/focus smoke coverage. Build and Evidence prepend the same Trust Chain rows from Build Readiness data for runtime manifest, QA trace evidence, project package, asset validation, source packages, compatibility gates, and architecture boundaries; package/source Trust Chain rows now target concrete package files and required source paths, with smoke bridge/DOM checks for shared ids, next actions, target paths, and focused destination rows after Trust Chain clicks. The current CSS ownership pass keeps the ordered Studio/app cascade behind `src/styles/studio.css` and named category modules, with Build/Evidence trust-ledger styling in `src/styles/workflows/studio-trust-ledgers.css`. `pnpm qa:css` passes as an audit, but `pnpm qa:css:budget` is currently red against older debt ceilings and should be treated as a cleanup task. These remain bound to QA bridge/runtime data for project asset records, replacement flow, source/runtime maps, compiled project, trace artifact, persisted trace history, shared/module contracts, source packages, architecture evidence, Stage imported layer reports, and Debug CNS/command evidence. | True editing workflows, persistent source handles, regenerate/relink automation, multi-artifact trace diff depth, deeper trace/asset/gate/report drilldowns, CSS budget recovery, deeper shared CSS primitives for chrome/ledger/status rows, token/typography cleanup, and remaining cross-file module selector-cascade reduction. |
| IKEMEN | Scanner profile for ZSS/Lua/config/screenpack/model-stage signals; bounded FightFX handoff; root/helper RunOrder; separate buffers; actor-local movement; deferred activation; positive `p2defmul`; and helper-created Pause/SuperPause with required trace evidence. Scanner findings such as ZSS and text controllers remain report-only. | No opposing-team defense breadth, `p2defmul = 0`, nested helper ancestry, exact buffer/audio/hitpause parity, teams/simul/tag, full `sys.ffx`, ZSS/Lua, text lifecycle, rollback/netplay, model/video stages, or broad IKEMEN runtime extensions. |
| Modular engine | Shared contracts and boundary tests. | Platformer proof slice blocked until fighting contracts stay stable. |
| Project control | `AGENTS.md`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/NEXT_BUILD_ROADMAP.md`, `docs/agents/*`, `docs/adr/0001-roadmap-control-and-local-issues.md`, `docs/ROADMAP_RELEASE_TARGETS.md`, and `.scratch/roadmap/*` define setup, issue tracking, skill routing, release targets, next concrete gates, score evidence, G1 health checks, and closeout. Latest setup-project refresh confirms local markdown issues, canonical triage labels, and single-context docs. | Must keep docs synchronized after every score/support/queue change. Docs-only control work must return to R1/R2/S1/A1/I1/M1 evidence cuts. |

Runtime row note: the blocked helper scope now excludes the bounded helper-local `Parent, ...` / `Root, ...` read-only slice, static `BindToParent` / `BindToRoot` owner-binding slice, and caller-provided `EnemyNear(index)` opponent-list slice proven by focused tests. Broader indexed/team/helper-owned redirects, player-state binding parity, team/keyctrl ownership, helper-owned side effects, and exact helper VM parity remain blocked.

## Historical Required Cuts - Superseded

The numbered list below is retained as implementation history. It is superseded by the 2026-07-10 Planning Report and Immediate Execution Order above and must not be used to choose the next slice.

0. **Common1/FightFX precision**
   - Current selected next runtime cut: move beyond summarized guard/fall/recovery or FightFX/common presentation evidence into a narrower trace, fixture, or visible package proof.
   - Done when focused trace or fixture evidence names the exact route and blocked claims stay explicit.
   - This should not reselect `VarRandom`, `RuntimeRandomSystem`, `RuntimeSnapshotWorld` match envelope ownership, `RuntimeSnapshotWorld` stage/camera ownership, `RuntimeSnapshotWorld` player actor/effect snapshot projection, `RuntimeCompatibilityTelemetryWorld`, `HitSparkAssetSystem`, `RuntimeRecoverySystem`, `BindToTarget` target-system ownership, active target-binding position ownership, `RuntimeTargetWorld.resolveCandidates`, `RuntimeHitEligibilityWorld`, `RuntimeAssertSpecialWorld`, `RuntimeOrientationWorld`, `RuntimeGuardWorld`, `RuntimeGetHitStateWorld`, `RuntimeHitStateTransitionWorld`, `RuntimeStateAvailabilityWorld`, `MakeDust`, no-op `DestroySelf`, target-owned custom-state, default stand get-hit progression order, common/FightFX source-frame plus selected-frame/multi-frame HitSpark metadata, or already-closed guard/auto-guard evidence.

1. **MatchWorld ownership**
   - Move more lifecycle/combat/pause/target behavior behind named systems.
   - Keep trace checksum drift intentional and documented.
   - Current proof added: `RuntimeContactPresentationWorld` owns bounded direct `HitDef` and `Projectile` contact presentation package emission consumed by `PlayableMatchRuntime`. Focused tests prove direct hit and projectile guard packages share contact metadata across sound/spark telemetry. This is ownership cleanup, not exact audio/spark ordering, SND playback/mixing, channel priority, exact FightFX/common lookup, helper-owned contact presentation, multi-target presentation, or score movement.
   - Previous proof added: `RuntimeGuardDistanceWorld` owns bounded `InGuardDist`/auto-guard proximity checks consumed by `PlayableMatchRuntime`. Focused `RuntimeGuardDistanceSystem` tests prove pre-active guard-distance windows, missing/spent/out-of-window rejects, guardflag/AssertSpecial/unguardable filtering, and authored `guard.dist` thresholds. This is ownership cleanup, not exact proximity guard, guard-end timing, guard effects, air-guard landing, or score movement.
   - Current proof added: `RuntimeAnimationWorld` owns bounded actor animation advancement and timing helpers consumed by `PlayableMatchRuntime`. Focused `RuntimeAnimationSystem` tests prove empty actions, authored durations, frame changes, `loopStart` completion, final-frame hold, invalid-duration clamping, and `AnimTime` / `AnimElemTime` helper math. This is ownership cleanup, not exact AIR negative-duration semantics, `elem` / `elemtime` parity, state-owner namespace behavior, controller tick order, or score movement.
   - Current proof added: `RuntimeInputControlWorld` owns bounded local player/simple AI control intent consumed by `PlayableMatchRuntime`. Focused `RuntimeInputControlSystem` tests prove blocked input, State -1 setup/entry precedence, crouch/jump/walk/idle, NoWalk suppression, air drift, AI chase, AI cooldown, and local punch/kick intent. This is ownership cleanup, not new input semantics, exact command timing, exact AI behavior parity, or score movement.
   - Current proof added: `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld` now pass explicit one-opponent lifecycle `opponents` lists into `RuntimeEffectLifecycleWorld` from concrete 1v1 match/pause/hitpause routes. Focused `MatchInteractionSystem`, `PauseSystem`, and `RuntimeHitPauseSystem` tests prove active and paused lifecycle options carry `[current opponent]` plus stage/runtime ticks while preserving the legacy direct opponent argument. This is ownership cleanup, not teams/simul roster ownership, automatic multi-opponent match roster discovery, helper-owned opponent discovery, or score movement.
   - Current proof added: `RuntimeHitPauseWorld.advanceRuntime(...)` now owns the concrete hitpause bridge for command buffering and paused presentation. Focused `RuntimeHitPauseSystem` tests prove current tick/input buffering with `hitPause: true` and paused presentation through `RuntimeEffectLifecycleWorld` with pause kind `hitpause`. This is ownership cleanup, not new hitpause semantics, helper-owned hitpause execution, broad hitpause side-effect ordering, or score movement.
   - Current proof added: `RuntimePausedMatchWorld.advanceRuntime(...)` now owns the concrete paused-match bridge for source-movetime target-memory aging, active-effect advance, presentation-effect advance, active target binding, stage clamp, and frozen-actor paused presentation. Focused `PauseSystem` tests prove actor-local `targetWorld`, `effectLifecycleWorld`, and `RuntimeActorConstraintWorld` wiring. This is ownership cleanup, not new pause semantics, helper VM during pause, exact pause layering, or score movement.
   - Current proof added: `RuntimeMatchInteractionWorld.advanceRuntime(...)` now owns the concrete normal-loop runtime bridge for target-memory aging, active-effect advance, projectile clash, body separation, active target binding, stage clamp, and presentation-effect advance. Focused `MatchInteractionSystem` tests prove actor-local `targetWorld`, `effectLifecycleWorld`, `effectActorWorld.resolveProjectileClashes(...)`, and `RuntimeActorConstraintWorld` wiring while `pnpm qa:trace` stays stable at the current 163/163. This is ownership cleanup, not helper VM execution, new target/projectile/effect semantics, exact post-fighter tick-order parity, pause-specific bridge ownership, or score movement.
   - Current proof added: `RuntimeRoundSystem` owns bounded round timer, KO/time-over finish state, winner/message snapshot wording, and reset behavior with focused unit coverage. This is sandbox round-state ownership, not MUGEN/IKEMEN round/lifebar/team/screenpack parity.
   - Current proof added: required `synthetic-imported-round-ko.json` checksum `bfd5f073` gates `RoundSnapshot` KO/winner/message/timer evidence through `RuntimeTraceGate.requiredRoundFrames`, plus final P2 life `0`. This proves trace visibility for bounded sandbox KO state, not exact MUGEN/IKEMEN round flow.
   - Current proof added: required `synthetic-imported-round-timeover.json` checksum `7d9f7907` gates `RoundSnapshot` `timeover` draw/winner/message/timer evidence with a short `roundTimerFrames` fixture. This proves bounded time-over trace visibility, not exact timer or round-transition parity.
   - Current proof added: `RuntimeTargetWorld.snapshotRuntimeState` now owns cloned target-memory snapshots consumed by `MatchWorld` actor records. Focused tests prove target refs, TargetBind bindings, `BindToTarget`, and DebugPanel registry rendering remain stable. This is ownership cleanup, not broader target redirect/team/helper parity.
   - Current proof added: `RuntimePauseWorld` now owns current match pause state, snapshot projection, source-movetime checks, countdown ticks, controller application, and reset. Focused tests prove the boundary and existing trace gates still cover bounded `Pause`/`SuperPause` evidence. This is ownership cleanup, not exact pause-layering parity.
   - Current proof added: `RuntimeEnvShakeWorld` now owns bounded EnvShake/FallEnvShake event insertion and deterministic multi-actor camera-shake projection. Focused tests prove the boundary while preserving existing actor event histories for renderer/debug/trace consumers. This is ownership cleanup, not exact EnvShake waveform or pause/stage/layer parity.
   - Current proof added: `RuntimeAudioWorld` now owns bounded `PlaySnd`/`StopSnd` event insertion. Focused tests prove the boundary while preserving existing actor sound-event histories for Web Audio/debug/trace consumers. This is ownership cleanup, not exact sound timing/mixing/channel parity.
   - Current proof added: `RuntimeEnvColorWorld` now owns bounded `EnvColor` event history, stage-flash projection, and reset. Focused tests prove the boundary while preserving existing stage-frame color/opacity trace behavior. This is ownership cleanup, not exact blend/layer/window/pause parity.
   - Current proof added: `RuntimeSnapshotWorld` now owns bounded stage/camera snapshot projection for `ScreenBound` camera-follow exclusion, all-disabled fallback, stage camera offsets, EnvShake camera shake, and EnvColor stage flash, plus bounded player actor snapshot projection for actor/source/sprite-owner metadata, cloned runtime state, target refs/bindings, collision boxes, fallback hurtbox, event histories, and final effect snapshot aggregation in stable cloned p1/p2 explod/helper/projectile order. Focused tests prove the boundary and `pnpm qa:trace` stays stable. This is ownership cleanup, not exact stage/motif camera logic, exact effect VM semantics, compatibility session projection, target semantics, or renderer parity.
   - Current proof added: `RuntimeCompatibilityTelemetryWorld` now owns imported compatibility telemetry/session projection for executed states, routed entries, controller/operation counts, bounded controller events, active commands, and command history. Focused tests prove the boundary and `pnpm qa:trace` stays stable at 156/156 artifacts. This is ownership cleanup, not new controller semantics, exact CNS VM timing, or imported-runtime parity.
   - Current proof added: `RuntimeSpriteEffectWorld` now owns current match-runtime `SprPriority`, `PalFX`, `AfterImage`, `AfterImageTime`, `Trans`, and `Angle*` mutation/ticking. Focused tests prove the boundary while preserving existing actor presentation telemetry. This is ownership cleanup, not exact draw-order, trail, palette, or renderer parity.
   - Current proof added: `RuntimeSpriteEffectControllerWorld` now owns active-state sprite-effect controller dispatch/telemetry into `RuntimeSpriteEffectWorld` for `SprPriority`, `PalFX`, `AfterImage`, `AfterImageTime`, `Trans`, and `Angle*`. Focused tests prove the dispatch boundary while preserving existing presentation mutation semantics. This is ownership cleanup, not exact visual tick order, helper/redirect ownership, or renderer parity.
   - Current proof added: `RuntimeTargetControllerDispatchWorld` now owns active-state Target / BindToTarget controller dispatch/telemetry into `RuntimeTargetWorld` for current two-actor target side effects. Focused tests prove TargetLifeAdd mutation and BindToTarget anchor/position dispatch while preserving match-owned callbacks. This is ownership cleanup, not helper/projectile target ownership, exact multi-target semantics, or throw parity.
   - Current proof added: `RuntimeContactControllerDispatchWorld` now owns active-state HitAdd / MoveHitReset dispatch/telemetry into `RuntimeContactMemoryWorld`. Focused tests prove HitAdd mutation and MoveHitReset reset dispatch while preserving existing contact-memory semantics. This is ownership cleanup, not exact combo lifetime, helper/projectile contact ownership, or guard-count parity.
   - Current proof added: `RuntimeAudioControllerDispatchWorld` now owns active-state PlaySnd / StopSnd dispatch/telemetry into `RuntimeAudioWorld`. Focused tests prove PlaySnd telemetry and sound-event mutation through the dispatch boundary while preserving existing sound-event semantics. This is ownership cleanup, not exact SND playback, channel priority, mixing, FightFX/common fallback, helper/redirect ownership, or audio parity.
   - Current proof added: `RuntimeEnvColorControllerDispatchWorld` now owns active-state EnvColor dispatch/telemetry into `RuntimeEnvColorWorld`. Focused tests prove EnvColor telemetry and stage-flash event mutation through the dispatch boundary while preserving existing stage-flash semantics. This is ownership cleanup, not exact blend math, layer/window ordering, pause timing, renderer parity, helper/redirect ownership, or presentation parity.
   - Current proof added: `RuntimeEnvShakeControllerDispatchWorld` now owns active-state EnvShake dispatch/telemetry into `RuntimeEnvShakeWorld`. Focused tests prove EnvShake telemetry and camera-shake event mutation through the dispatch boundary while preserving existing camera-shake semantics. This is ownership cleanup, not exact waveform, pause/stage/layer interaction, helper/redirect ownership, or presentation parity.
   - Current proof added: `RuntimePauseControllerDispatchWorld` now owns active-state Pause/SuperPause dispatch/telemetry into the match pause handler. Focused tests prove SuperPause telemetry and pause application through the dispatch boundary while preserving existing pause semantics. This is ownership cleanup, not exact pause layering, super background/sound/spark timing, helper/redirect ownership, or full pause VM parity.
   - Current proof added: `RuntimeActorConstraintControllerDispatchWorld` now owns active-state Width dispatch/telemetry into `RuntimeActorConstraintWorld`. Focused tests prove Width telemetry and body-width mutation through the dispatch boundary while preserving existing actor-constraint semantics. This is ownership cleanup, not exact player/edge collision, team/helper push behavior, screen-edge/camera parity, or full constraint VM parity.
   - Current proof added: `RuntimeEffectSpawnControllerDispatchWorld` now owns active-state Explod / RemoveExplod / ModifyExplod / Helper / Projectile / ModifyProjectile dispatch/telemetry into `RuntimeEffectSpawnWorld`. Focused tests prove successful Explod telemetry/mutation and failed ModifyExplod no-operation gating while preserving existing trace semantics. This is ownership cleanup, not exact effect spawn tick order, helper-owned effect namespaces, dynamic effect params, helper-owned projectile combat/contact/target memory, or full effect/helper/projectile VM parity.
   - Current proof added: `RuntimeActorConstraintWorld` now owns bounded `Width`, one-frame `PlayerPush`/`PosFreeze`/`ScreenBound` constraint reset/projection, stage clamping, and body-push separation. Focused tests prove the boundary while preserving existing actor body/bounds telemetry. This is ownership cleanup, not exact player/edge collision, team/helper push, or screen/camera parity.
   - Current proof added: `RuntimeDirectCombatWorld` now owns bounded direct hit/guard result mutation plus same-tick direct `HitDef` priority win/trade mutation: life, pause, stun, velocity, hit vars, hit fall metadata, power gain, contact memory, received-damage memory, and get-hit cleanup. Focused tests prove the boundary while preserving existing direct HitDef telemetry. This is ownership cleanup, not exact priority classes, throws, multi-hit, helper/team/redirect, or tick-order parity.
   - Current proof added: `RuntimeContactMemoryWorld` now owns bounded direct/projectile contact-memory creation, reset, mutation, and readback consumed by `PlayableMatchRuntime`, `RuntimeDirectCombatWorld`, and `RuntimeReversalWorld`. Focused tests prove injection/readback while preserving existing contact-trigger trace behavior. This is ownership cleanup, not exact contact/combo lifetime, helper/team/redirect ownership, or hitpause/tick-order parity.
   - Current proof added: `RuntimeGuardWorld` now owns bounded guard-hit state selection and auto guard-start eligibility/mutation consumed by direct combat, projectile combat, and `PlayableMatchRuntime`. Focused tests prove state fallback, held-back/current-move/pause/stun/guard-state rejection, and the start mutation while `pnpm qa:trace` stays stable. This is ownership cleanup, not exact proximity guard, guard-end timing, guard effects, air-guard landing, or full guard VM parity.
   - Current proof added: `RuntimeGetHitStateWorld` now owns bounded default get-hit state selection consumed by imported direct and projectile hit routes. Focused tests prove stand/crouch/air fallback selection while `pnpm qa:trace` stays stable. This is ownership cleanup, not exact Common1 get-hit animation selection, helper/team/redirect get-hit routing, projectile-specific get-hit parity, or full get-hit VM parity.
   - Current proof added: `RuntimeHitStateTransitionWorld` now owns bounded direct-hit and ReversalDef `p1stateno` / `p2stateno` / `p2getp1state` transition routing consumed by `PlayableMatchRuntime`. Focused tests prove attacker-owned, target-owned, and unavailable-state behavior while `pnpm qa:trace` stays stable. This is ownership cleanup, not exact throws, helper/root/parent redirects, team ownership, bind/tick-order parity, or full custom-state VM parity.
   - Current proof added: `RuntimeStateAvailabilityWorld` now owns bounded compiled-state, parsed-state, animation-fallback, and owner-backed availability lookup consumed by `PlayableMatchRuntime`. Focused tests prove the boundary while `pnpm qa:trace` stays stable. This is ownership cleanup, not exact StateDef lookup edge cases, helper/root/parent/team lookup, state-entry mutation, or full CNS VM state ownership.
   - Current proof added: `RuntimeHitOverrideWorld` now owns bounded HitOverride slot ticking and redirect mutation for direct and projectile combat paths. Focused tests prove the boundary while preserving existing HitOverride telemetry. This is ownership cleanup, not exact slot priority, attr grammar, helper/custom-state redirect breadth, or edge timing parity.
   - Current proof added: `RuntimeReversalWorld` now owns bounded ReversalDef activation, active counter detection, and counter-result mutation for direct HitDef contact paths. Focused tests prove the boundary while preserving existing ReversalDef telemetry. This is ownership cleanup, not exact priority, guard/projectile/helper/custom-state breadth, attr grammar, trigger lifetime, or tick-order parity.
   - Current proof added: `RuntimeProjectileCombatWorld` now owns bounded projectile contact/reject/HitOverride/hit-or-guard/cleanup mutation plus projectile clash trade/cancel/decrement mutation consumed by `RuntimeEffectActorWorld`. Focused tests prove the boundary while preserving existing projectile telemetry. This is ownership cleanup, not exact priority classes, multi-targets, helper-owned projectiles, terminal timing, guard effects, or tick-order parity.
   - Current proof added: `RuntimeEffectSpawnWorld` now owns bounded Explod/Helper/Projectile spawn resolution, RemoveExplod dispatch, ModifyProjectile dispatch, and ModifyExplod dispatch before those calls reach `RuntimeEffectActorWorld`. Focused tests prove the boundary while preserving existing effect actor telemetry. `synthetic-imported-modifyexplod.json` checksum `bca75991` proves bounded live owner-side Explod mutation through typed operation evidence. This is ownership cleanup plus one bounded controller cut, not exact effect lifecycle, helper VM, parent/root/redirect, FightFX, or spawn timing parity.
   - Current proof added: `RuntimeEffectActorWorld.countActors(...)` now owns the unified bounded effect-count query consumed by `PlayableMatchRuntime` for `NumExplod`, `NumHelper`, and `NumProj`/`NumProjID` trigger callbacks. Focused tests prove Explod/Helper/Projectile counts, id filters, and removed-projectile exclusion through one world query. This is ownership cleanup, not new effect semantics, helper VM execution, exact projectile lifetime, redirects, parent/root/team scopes, or full effect-trigger parity.
   - Current proof added: `HelperSystem` / `RuntimeEffectActorWorld` now own explicit visual-helper removal by helper id or runtime serial, including owner-wide clear and p1/p2 store isolation. `RuntimeEffectSpawnWorld` exposes the same handoff for future controller dispatch. This is ownership cleanup, not helper VM execution, real `DestroySelf`, redirects, helper-owned combat, or score movement.
   - Current proof added: `RuntimeResourceSystem` now owns authored max-resource resolution, runtime power-delta clamping, bounded life deltas, and control-flag writes used by the match loop, direct combat, projectile combat, target controllers, and reversals. Focused tests prove existing resource/controller, direct-combat, projectile-combat, target-system, reversal, and playable-runtime behavior remains bounded and unchanged. This is ownership cleanup, not new resource semantics, exact CNS tick-order, helper/team/redirect resource ownership, target/projectile parity, or score movement.
   - Current proof added: `RuntimeEffectLifecycleWorld` now owns bounded active-effect tick, presentation tick, paused presentation tick, effect snapshot grouping, and shared get-hit cleanup orchestration for the current effect actor families. Focused tests prove the boundary while preserving existing effect telemetry. This is ownership cleanup, not helper VM lifecycle, exact effect pause/combat ordering, exact remove-trigger timing, parent/root/redirect parity, or full effect lifecycle parity.

2. **KFM/Common1 precision**
   - Tighten guard/fall/recovery timing and velocity semantics.
   - Current proof added: required `synthetic-imported-default-fall-recovery-threshold.json` checksum `7bb15a5f` observes imported defender actor-frame `5050` while `hitFall.recoverTime` is positive, requires first-to-last `recoverTime` drop evidence in that bucket, and later observes actor-frame `5210` with `recoverTime = 0` after `CanRecover` plus `command = "recovery"` routes.
   - Current proof added: required `synthetic-imported-default-fall-recovery-tick-order.json` checksum `e2691aab` gates summarized actor-frame order where dropping `5050` countdown evidence must precede `5210` recovery evidence, plus a bounded named controller/operation sequence requiring `5050` `VelAdd` `Gravity` before `ChangeState` `Recovery Input`, then `5210` `VelSet`, `kinematic:velset`, `HitFallSet`, `hitfall:hitfallset`, and `ChangeState`.
   - Current proof added: required `synthetic-imported-default-fall-air-recovery-velocity.json` checksum `560f6308` gates bounded air-recovery velocity telemetry in `5210` after `CanRecover` plus `command = "recovery"`.
   - Current proof added: required `synthetic-imported-default-fall-ground-recovery.json` checksum `7945fd93` gates bounded near-ground recovery selection through `5050 -> 5200 -> 5201 -> 52 -> 0`, including `SelfState`, `VelSet`, `PosSet`, actor-frame velocity telemetry for synthetic ground-recovery constants, and ordered named controller/typed-operation evidence from `5050` gravity/recovery input through `5200` self-land, `5201` safety/land, and `52` control restore.
   - Current proof added: required `synthetic-imported-default-fall-recovery-too-early.json` checksum `050e7e3c` detects `command = "recovery"` while `fall.recovertime` is still positive, requires state `5050` actor-frame evidence with minimum observed `recoverTime >= 1` plus first-to-last drop, forbids `5210`, and keeps the defender in `5050`.
   - Current optional fixture proof added: `kfm-official-default-fall-recovery-too-early.json` checksum `0ad7ae02` confirms real KFM/Common1 rejects the same early recovery window locally with positive-minimum `5050` recovery-timer evidence and forbids `5210`, `5200`, and `5201`.
   - Current optional fixture proof added: `kfm-official-default-fall-recovery-threshold.json` checksum `19ec5148` confirms real KFM/Common1 exposes ordered state-frame threshold evidence: `5050` while `hitFall.recoverTime` is still positive with a first-to-last `recoverTime` drop inside the summarized bucket, before `5200` with `recoverTime = 0` and ground recovery branch `5200 -> 5201 -> 52 -> 0` after `command = "recovery"` is accepted near the ground.
   - Current optional fixture proof added: `kfm-official-default-crouch-guard-hold-crouch-return.json` checksum `d11153d0` now proves real KFM crouch guard-hit `152 -> 153` returns through observable crouch guard-hold state `131` and then resumes held-down crouch state/action `11` with control while preserving the slide-stop controller/typed-operation order. Previous optional fixture proof `kfm-official-default-guard-hold-walk-return.json` checksum `885bb1da` proves the matching stand route; `kfm-official-default-fall-ground-recovery-priority.json` checksum `6079c8c9` still mirrors the real KFM ground-recovery route while forbidding generic air recovery `5210` and lie-down chain states. `kfm-official-default-fall-ground-recovery.json` checksum `6079c8c9` still requires bounded real KFM controller/typed-operation order through `5050` gravity/recovery input, `5200` self-land, and `52` landing operations.
   - Current guard proof added: required `synthetic-imported-default-guard-state.json` checksum `016938a1`, `synthetic-imported-crouch-guard-state.json` checksum `6c4321af`, `synthetic-imported-diagonal-crouch-guard-state.json` checksum `1dd33fb5`, `synthetic-imported-air-guard-state.json` checksum `ce9cc9ba`, and `synthetic-imported-air-guard-landing.json` checksum `d6986d7f` now gate ordered named controller/typed-operation evidence plus actor-frame state/physics/body/push or landing telemetry for bounded stand, crouch, atomic-`DB`, air guard-hit, and synthetic air landing handoff routes, including `kinematic:hitvelset`, `resource:ctrlset`, bounded stand/air velocity evidence where present, and state-`52` y = 0 landing evidence in the new air gate.
   - Current auto guard proof added: required `synthetic-imported-auto-guard-start.json` checksum `0c734290` now gates P2 state `120` `ChangeState` `Guard Start Done` plus actor-frame order `120` before `130`, and required `synthetic-imported-auto-guard-end.json` checksum `d1dc0aa3` gates P2 `120` `Guard Start Done` before state `130` `ChangeState` `Stop Guarding`, actor-frame `120 -> 130 -> 140`, plus final `0`/control. This is bounded controller/state-order evidence, not exact proximity guard, full Common1 controller-loop parity, or full guard-end parity.
   - Current HitDef-effect proof added: required `synthetic-imported-hitdef-hit-sound.json` checksum `6fc00d8a` proves bounded `HitDef hitsound = S5,0` event telemetry as an attacker-side `PlaySnd`, required `synthetic-imported-hitdef-guard-sound.json` checksum `fdf1f7f6` proves bounded `HitDef guardsound = S6,0` event telemetry as an attacker-side `PlaySnd`, required `synthetic-imported-hitdef-hit-spark.json` checksum `b6554124` proves bounded `sparkno = S7001` plus `sparkxy = 10,-72` event telemetry as an attacker-side hit `HitSpark`, required `synthetic-imported-hitdef-guard-spark.json` checksum `72c8fa3a` proves bounded `guard.sparkno = S7000` plus `sparkxy = 12,-64` event telemetry as an attacker-side guard `HitSpark` after imported direct-hit routes, required `synthetic-imported-hitdef-common-spark.json` checksum `5ea054d7` and `synthetic-imported-hitdef-fightfx-spark.json` checksum `11537b56` prove hit common/FightFX source-frame plus selected-frame/multi-frame AIR metadata, required `synthetic-imported-hitdef-common-guard-spark.json` checksum `7650a09c` plus `synthetic-imported-hitdef-fightfx-guard-spark.json` checksum `32f3e92d` prove guard common/FightFX source-frame plus selected-frame/multi-frame AIR metadata, required `synthetic-imported-hitdef-hit-effect-package.json` checksum `46aa5ce1` now proves combined `hitsound = F5,0` / `soundPrefix = kfm` + FightFX spark metadata package routing, and required `synthetic-imported-hitdef-guard-effect-package.json` checksum `1c3167b7` proves the matching guard package route. `HitSparkRenderer` now treats `S` refs as player AIR actions, resolves a first frame to sprite texture when possible, classifies unprefixed refs as common/default and `F` refs as FightFX, preserves runtime-provided package frames from `hitSparkLibraries`, synthesizes bounded common/FightFX system lookup frames through the global sprite namespace when no package frame exists, and `pnpm qa:smoke` gates active desktop/mobile sparks plus player-source resolved-sprite diagnostics on the native route. `MugenCharacterLoader` also has first-pass `fight.def`/FightFX AIR/SFF/SND loading, decoded system-SFF provider registration, and prefix-keyed SND archive handoff. This is not exact channel/timing/mixing, render lookup/binding/layering/scale/palette, visual frame timing, hit/guard-effect parity, or spark parity.
   - Current optional KFM guard proof added: `kfm-official-default-air-guard-state.json` checksum `62367dac` now gates real KFM/Common1 air guard-hit `154 -> 155 -> 52 -> 20` with final held-back walk/control; `kfm-official-default-crouch-guard-hold-crouch-return.json` checksum `d11153d0` now gates real KFM/Common1 crouch guard-hit `152 -> 153 -> 131 -> 11` actor-frame sequence evidence; `kfm-official-default-guard-hold-walk-return.json` checksum `885bb1da` gates real KFM/Common1 stand guard-hit `150 -> 151 -> 130 -> 20`; `kfm-official-default-guard-hold-return.json` checksum `885bb1da` remains the hold-only subset; `kfm-official-default-crouch-guard-slide-stop.json` checksum `d11153d0` gates real KFM/Common1 crouch guard-hit `153` slide-stop/control order on top of `kfm-official-default-crouch-guard-state.json` checksum `d11153d0`; `kfm-official-default-guard-slide-stop.json` checksum `885bb1da` gates the matching stand `151` slide-stop/control order; `kfm-official-default-air-guard-state.json` checksum `62367dac` gates real KFM/Common1 air guard-hit controller/operation order plus actor-frame `154 -> 155 -> 52 -> 20` state/physics/body/landing/walk-control telemetry when the private fixture exists; `kfm-official-auto-guard-start.json` checksum `ad493cde` and `kfm-official-auto-guard-end.json` checksum `ee962d04` gate real KFM auto guard-start/end controller/typed-operation order through `120 -> 130 -> 140 -> 0`.
   - Optional official fixture gates cannot become public compatibility claims unless fixture is present and passing.

3. **Compatibility trace coverage**
   - Add missing required traces for controller families currently covered only by unit/runtime tests.
   - Current proof added: dedicated `synthetic-imported-hitby-allow.json` checksum `c75d5c7d` for bounded `HitBy` allow-list acceptance through typed `eligibility:hitby`, `synthetic-imported-hitby-reject.json` checksum `65185fd1` for bounded `HitBy` allow-list mismatch rejection through typed `eligibility:hitby`, `synthetic-imported-reject.json` checksum `5aca7dc0` for `NotHitBy` deny-list rejection through typed `eligibility:nothitby`, `synthetic-imported-hitdef-hit-sound.json` checksum `6fc00d8a` for bounded `HitDef hitsound` telemetry, `synthetic-imported-assertspecial-guarddeny.json`, `synthetic-imported-assertspecial-crouch-guarddeny.json`, `synthetic-imported-assertspecial-air-guarddeny.json`, and `synthetic-imported-assertspecial-lifetime.json` trace artifacts for bounded defender-side `NoStandGuard` / `NoCrouchGuard` / `NoAirGuard` hit-over-guard evidence plus one-frame `NoStandGuard` expiry evidence, `synthetic-imported-animation.json` for bounded `ChangeAnim` / partial `ChangeAnim2` active AIR retargeting evidence, `synthetic-imported-changeanim2-elem.json` checksum `b0b46d33` for bounded active-state `ChangeAnim2` `elem` / `elemtime` positioning against a known owner AIR action, `synthetic-imported-control.json` for typed `CtrlSet` / `resource:ctrlset` control-restore evidence, `synthetic-imported-kinematic.json` for typed `VelSet` / `VelAdd` / `VelMul` / `PosSet` / `PosAdd` position/velocity evidence, `synthetic-imported-gravity.json` for typed `Gravity` / `kinematic:gravity` vertical velocity evidence, `synthetic-imported-envshake.json` for partial `EnvShake` runtime event evidence, `synthetic-imported-sound.json` for partial `PlaySnd` / `StopSnd`, `synthetic-imported-noop.json` checksum `2877b222` for `Null`, browser no-op `ForceFeedback`, debug clipboard no-op controllers, deprecated `MakeDust`, and helper-lifecycle no-op `DestroySelf` typed `noop:*` operation visibility, plus `synthetic-imported-resource.json` for typed `LifeAdd` / `LifeSet` / `PowerAdd` / `PowerSet` and `synthetic-imported-variable.json` for `VarSet` / `VarAdd` / `VarRandom` / `VarRangeSet`.

4. **Studio trust workflow**
   - Improve Evidence/Build as the authority for current state, stale inputs, blocked exports, and next actions.

5. **Roadmap hygiene**
   - Use `docs/ROADMAP_NAVIGATION.md` as the first fast map for ownership, lanes, score evidence, setup-project profile, and anti-drift rules.
   - Use `docs/ROADMAP_PROGRESS_SYSTEM.md` to decide which doc owns each fact.
   - Use `docs/ROADMAP_OPERATIONAL_CHECKLIST.md` to decide closeout gates for the current work type.
   - Use `docs/ROADMAP_RELEASE_TARGETS.md` to keep release trains and usable milestones aligned with scores.
   - Use `docs/ROADMAP_EXECUTION_BOARD.md` as the first queue/handoff map.
   - Keep `docs/BUILD_EXECUTION_BACKLOG.md` append-only enough to preserve history.
   - Keep `docs/WORKPLAN.md` as execution authority.
   - Keep this tracker short and updated after meaningful milestones.

## Active Queue Snapshot

| Package | Linked issue | Next proof |
| --- | --- | --- |
| R1 MUGEN-lite evidence | `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` | Publish `CompatibilityJourney/v1`, adjudicate the milestone, then add an independent legal package or ACT/palette route. |
| R2 runtime ownership | `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` | Keep `RuntimeRootMotionAdvanceWorld` shallow and stun semantics behind `RuntimeStunWorld`; avoid a duplicate combat-candidate seam. |
| S1 Studio source workflow | `.scratch/roadmap/issues/02-studio-evidence-workflow.md` | Source identity/fingerprint/conflict plus one atomic write/reimport/invalidation/rollback transaction. |
| A1 Generated asset provenance/QA | `.scratch/roadmap/issues/03-generated-assets-pipeline.md` | Permission-aware, content-addressed origin/license/input/tool/transform/output/QA record. |
| I1 IKEMEN scanner/reference | `.scratch/roadmap/issues/04-ikemen-scan-and-reference.md` | `PackageAnalysis/v0` with source-located character/stage/system/screenpack findings; runtime credit stays blocked. |
| I2 IKEMEN bounded runtime | `.scratch/roadmap/issues/07-ikemen-runtime-topology.md` | Preserve Wayfinder 127; then decide global per-tick AssertSpecial ownership before team-round or cross-entity widening. |
| M1 Shared contract readiness | `.scratch/roadmap/issues/05-modular-engine-boundaries.md` | Promote one contract only after two real adapters/consumers prove it is free of fighting-specific leakage. |

## Closeout Contract

Every compatibility milestone should leave:

- focused code/test changes
- docs update with claim allowed / claim blocked
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm qa:trace` for runtime/compat changes
- `pnpm qa:smoke` plus visual inspection for frontend/render changes

### 2026-07-11 - Static IKEMEN TagIn leader

- Added static positive `leader` compilation only for TagIn.
- Added atomic same-side stable-PlayerNo validation and live-life leader rotation.
- Preserved stable slots, scheduler, selection, gameplay, rendering, and fail-closed telemetry.
- Focused proof: 3 files / 153 tests plus TypeScript 7 typecheck.
- Global status: bounded Tag order now executes `memberno` and `leader`; dynamic params, redirects, and gameplay consumption remain open.

### 2026-07-11 - Dynamic IKEMEN Tag parameter research

- Pinned runtime coercion: integer axes use `evalI`; boolean axes use `evalB`.
- Pinned redirect-first and serialized parameter execution, including partial-mutation failure risk.
- Kept sandbox aggregate atomicity explicit; selected dynamic `self` as next bounded slice.
- Global status: static Tag optional axes complete through leader; dynamic execution and redirects remain open.

### 2026-07-11 - Dynamic IKEMEN Tag self

- Added typed deferred `selfExpression` lowering for TagIn/TagOut.
- Added caller-context runtime coercion with resolved-operation telemetry.
- Proved changing `var(0)` false-to-true behavior and malformed structural rejection.
- Preserved partner-sensitive omission, aggregate validation, and all non-Tag consumers.
- Global status: first dynamic Tag axis executes; control, target, state, order, and redirects remain open.

### 2026-07-11 - Dynamic IKEMEN TagIn caller control

- Added deferred `callerControlExpression` lowering only for TagIn.
- Resolves jointly with dynamic self before aggregate mutation and telemetry.
- Proved per-tick false-to-true variable reevaluation and post-state-entry control precedence.
- Global status: dynamic caller self/control execute; dynamic partner control and target/state/order/redirect axes remain open.

### 2026-07-11 - Dynamic IKEMEN TagIn partner control

- Added deferred `partnerControlExpression` with required static partner selection.
- Resolves in caller context before aggregate mutation; applies after partner state entry.
- Proved StateDef precedence, caller-variable false-to-true reevaluation, and missing-partner rollback.
- Global status: all Tag boolean axes execute dynamically; dynamic integer target/state/order axes and redirects remain open.

### 2026-07-11 - Dynamic IKEMEN Tag caller state

- Added deferred `callerStateExpression` for TagIn/TagOut.
- Resolves/truncates in caller context before own-state and aggregate validation.
- Proved same-tick variable-selected state, post-entry control precedence, unavailable rollback, and negative rejection.
- Global status: dynamic caller state plus all boolean axes execute; partner state/identity/order and redirects remain open.

### 2026-07-11 - Dynamic IKEMEN Tag partner state

- Added deferred `partnerStateExpression` for TagIn/TagOut with required static partner identity.
- Resolves/truncates in caller context before partner-owned state and aggregate validation.
- Proved same-tick variable-selected TagIn/TagOut state, post-entry partner control, and negative/unavailable/missing-partner rollback.
- Global status: caller and partner Tag state numbers plus all boolean axes execute dynamically; partner identity/order and redirects remain open.

### 2026-07-11 - Dynamic IKEMEN Tag partner selection

- Added deferred `partnerOrdinalExpression` for TagIn/TagOut while preserving authored partner-sensitive self defaults.
- Resolves/truncates in caller context before cyclic same-side target and aggregate validation.
- Proved P5 variable selection with partner-owned state/control, TagOut omission behavior, and negative/missing/state rollback.
- Global status: Tag partner identity, state numbers, and all boolean axes execute dynamically; member/leader order and redirects remain open.

### 2026-07-11 - Dynamic IKEMEN Tag member order

- Added deferred `memberPositionExpression` for TagIn/TagOut.
- Resolves/truncates one-based position in caller context before explicit Tag-order validation.
- Proved same-tick P1/P3 swap plus zero/negative/out-of-range/non-Tag rollback.
- Global status: dynamic partner/state/control/member axes execute; dynamic leader and redirects remain open.

### 2026-07-11 - Dynamic IKEMEN TagIn leader

- Added deferred `leaderPlayerNoExpression` only for TagIn.
- Resolves/truncates stable PlayerNo in caller context before same-side explicit-Tag validation.
- Proved same-tick P3 leader rotation plus zero/negative/opposing/missing/non-Tag rollback.
- Global status: every currently admitted Tag optional axis supports bounded dynamic expressions; RedirectID mutation remains open.

### 2026-07-11 - IKEMEN Tag RedirectID research

- Pinned RedirectID as a caller-evaluated integer selecting a global numeric root/Helper PlayerID.
- Pinned redirect-first failure for negative, missing, destroyed, and disabled characters; standby remains eligible.
- Audited the sandbox's string actor registry, expression context, and Tag mutation hook; no numeric PlayerID owner exists.
- Selected a standalone character-identity world as Wayfinder 076 before runtime or Helper integration.
- Global status: RedirectID semantics are mapped; identity ownership, triggers, lifecycle integration, and mutation remain open.

### 2026-07-11 - Standalone IKEMEN character identity

- Added numeric PlayerID ownership separate from stable actor ids and one-based PlayerNo.
- Matched default baseline 56 and present odd-root-then-even-root allocation.
- Added monotonic later allocation, unregister/no-reuse lifecycle, active lookup, and frozen diagnostics.
- Full gates: 170 files / 1687 tests, TypeScript 7 build, 538/538 traces, and boundaries.
- Global status: identity model closed; P1-P8/expression/Helper integration and RedirectID mutation remain open.

### 2026-07-11 - IKEMEN root identity and Tag RedirectID

- Integrated stable P1-P8 PlayerNo plus registry-owned PlayerID and explicit `ID`/`PlayerNo` expression contexts.
- TagIn/TagOut now resolve root RedirectID first while later expressions remain original-caller-owned.
- Root-relative state/control/partner/member/leader/standby mutation retains bounded aggregate validation.
- Full gates at the latest root checkpoint: 170 files / 1696 tests, TypeScript 7 build, 538/538 traces, and boundaries.
- Global status: root identity and redirected Tag execution are closed; Helper identity and mutation follow separately.

### 2026-07-11 - IKEMEN Helper character identity

- Registered root-created Helpers before same-tick execution with monotonic PlayerID and inherited PlayerNo.
- Added explicit self/parent/root numeric identity plus removal/reset lifecycle ownership.
- Full gates: 170 files / 1700 tests, TypeScript 7 build, 538/538 traces, and boundaries.
- Global status: Helper lookup/identity is closed; Helper-created Helpers and broad redirected controller behavior remain open.

### 2026-07-11 - IKEMEN Helper Tag semantics and local execution

- Mapped Helper-local state/control/standby versus root-owned partner/member/leader semantics from pinned source.
- Executed explicit/dynamic `self = 0` root-to-Helper Tag state/control with redirect-first caller ownership.
- Proved state validation, state-before-control order, stale/disabled rejection, aggregate blocking, and legacy rejection.
- Full gates: 170 files / 1710 tests, TypeScript 7 build, 538/538 traces, and boundaries.
- Global status: Helper local Tag state/control is closed; standby and aggregate axes remain open.

### 2026-07-11 - IKEMEN Helper standby participation research

- Pinned standby as direct-character participation rather than lifecycle or visibility.
- Standby keeps CNS, projectiles, targets, identity, animation, snapshots, and drawing active.
- Effective control, direct hit/hurt, push, camera, Enemy, and P2 participation are filtered.
- Local audit found direct Helper HitDef and effective-control projection as the only blockers for bounded self standby.
- Global status: Wayfinder 083 is implementation-ready; no score movement from this research checkpoint.

### 2026-07-11 - IKEMEN Helper standby participation runtime

- Default/static and dynamic-true Helper self now set/clear standby after local state/control mutation.
- One reusable predicate suppresses destroyed/disabled/standby Helper direct HitDef; TagIn resumes contact.
- Helper expressions expose effective `Ctrl = 0` while preserving stored control and continuing CNS/state time.
- IKEMEN single-Helper RunOrder now carries bulk-equivalent effect context; standby Helper projectiles spawn and advance with parent provenance.
- Identity lookup, targets, snapshots, animation/drawing, projectiles, and all 538 trace artifacts remain active/stable.
- Full gates: 170 files / 1714 tests, TypeScript 7 build, 538/538 traces, boundaries, and diff check.
- Global status: Wayfinder 083 is closed without score movement; Wayfinder 084 maps initial Helper `standby` creation.

### 2026-07-11 - IKEMEN initial Helper standby research

- Pinned optional boolean syntax, zero/non-zero coercion, original-caller evaluation, and pre-state-entry mutation order.
- Confirmed fresh Helpers default non-standby; init requests control enabled, then authored StateDef `ctrl` may override it before same-frame CNS.
- Local audit found typed IR/profile resolution and hardcoded standby/control initialization as the bounded gaps; identity/scheduler order already aligns.
- Unsupported or unresolved authored standby will block explicit IKEMEN spawn; legacy/unknown behavior remains unchanged.
- Global status: Wayfinder 084 is closed without score movement; Wayfinder 085 executes root-created initial standby.

### 2026-07-11 - IKEMEN initial Helper standby runtime

- Compiled optional static/deferred standby with zero/non-zero coercion and original-root expression ownership.
- Explicit IKEMEN invalid/unresolved values block atomically; omitted/zero/non-zero/dynamic and legacy/unknown boundaries are covered.
- Final standby reaches Helper identity before same-tick discovery; StateDef `ctrl` overrides a true omission fallback while standby only projects effective control false.
- Same-tick CNS/state time and Helper-parented Projectile creation continue; existing direct-interaction suppression remains active.
- Full gates: 170 files / 1721 tests, TypeScript 7 build, 538/538 traces, boundaries, and diff check.
- Global status: Wayfinder 085 is closed without score or visual movement; Wayfinder 086 maps aggregate Helper Tag ownership.

### 2026-07-11 - IKEMEN Helper aggregate Tag ownership research

- Partner selection is rooted in the redirected Helper's inherited stable PlayerNo and always returns a same-side root.
- Helper local state/control/self precede partner-root standby/state/control; member/leader mutate separate root team-order state.
- Helpers do not inherit mutable `memberNo`; pinned-source inference makes Helper `memberno` originate from position one.
- Exact upstream failure preserves earlier mutations; the local cut keeps atomic prevalidation and documents this divergence.
- Global status: Wayfinder 086 is closed without executable, visual, trace, or score movement; Wayfinder 087 executes partner ownership only.

### 2026-07-11 - IKEMEN Helper-relative partner Tag runtime

- Removed the historical compiler prohibition against source-valid caller-state plus partner composition.
- Static/dynamic Helper partner selection resolves through the exact live root anchor and returns a stable same-side root.
- Helper local state/control/self execute before partner-root standby/state/control; dynamic values stay in original-caller context.
- Missing anchor/partner and unavailable partner state preserve Helper/partner state and suppress success telemetry.
- Full gates: 170 files / 1727 tests, TypeScript 7 build, 538/538 traces, boundaries, and diff check.
- Global status: Wayfinder 087 is closed without browser or score movement; Wayfinder 088 executes Helper-relative TagIn leader.

### 2026-07-11 - IKEMEN Helper-relative TagIn leader runtime

- Static/dynamic leader uses original-root expressions and the redirected Helper's exact root/team anchor.
- Stable same-side PlayerNo rotates through existing Tag order; stable slots and reset behavior remain unchanged.
- Full local/self/partner composition applies state/control, leader, self standby, then partner standby/state/control.
- Opposing/missing leader and non-Tag mode roll back Helper, order, standby, partner, and success telemetry.
- Full gates: 170 files / 1730 tests, TypeScript 7 build, 538/538 traces, boundaries, and diff check.
- Global status: Wayfinder 088 is closed without browser or score movement; Wayfinder 089 executes Helper `memberno` position-one ownership.

### 2026-07-11 - IKEMEN Helper-relative Tag member runtime

- Static/deferred TagIn/TagOut member positions resolve in original-root caller context and require a positive one-based result.
- Exact Helper root anchors team side, but mutable position one is always the swap source; Helpers gain no stable or mutable root slot.
- Full composition applies Helper state, member, control, leader, self, then partner after complete atomic prevalidation.
- Invalid/out-of-range/non-Tag/missing-root/legacy paths preserve Helper, roots, order, partner, and success telemetry.
- Full gates: 170 files / 1736 tests, TypeScript 7 build, 538/538 traces, boundaries, and diff check.
- Global status: Wayfinder 089 is closed without browser or score movement; Wayfinder 090 audits aggregate closure before selecting broader gameplay work.

### 2026-07-11 - IKEMEN Helper aggregate closure audit

- Root-to-Helper TagIn/TagOut now covers every source-valid static/deferred aggregate axis under documented local atomicity.
- Helper-authored Tag remains unsupported at the Helper runtime-controller boundary despite shared typed IR and complete Helper expression context.
- Active-root gameplay remains structurally visible but input, combat, round, and presentation ownership still target P1/P2.
- Residual debt ranks Helper-originated self Tag, required Tag traces, active-root gameplay, incoming Helper breadth, then exact incremental failure.
- Global status: Wayfinder 090 is closed without executable or score movement; Wayfinder 091 executes Helper-originated self standby only.

### 2026-07-11 - IKEMEN Helper-originated self Tag runtime

- Helper-authored unredirected TagIn/TagOut now resolves omitted/static/deferred self in live Helper context and mutates only local standby.
- Standby keeps CNS, projectiles, identity, snapshots, and presentation active while effective control and direct HitDef remain filtered.
- Concrete controller/operation telemetry remains attributed to the root owner with Helper state context; blocked aggregate/legacy/lifecycle routes record no success.
- Reset replacement now removes stale optional fighter state and reattaches every Helper-owned runtime hook before replay.
- Full gates: 170 files / 1748 tests, TypeScript 7 build, 538/538 traces, boundaries, and diff check.
- Global status: Wayfinder 091 is closed without browser or score movement; Wayfinder 092 promotes the behavior to required trace evidence.

### 2026-07-14 - Browser smoke gate closeout

- Fresh external-server smoke passed with `status=passed`, `0` console issues, `0` page errors, and `64` capture paths.
- Desktop/mobile MUGEN Lite evidence covers combat, recovery, guard, NoKOSlow, palette remap, movement, nonblank canvas, and idle return.
- Imported Code Fu Man evidence covers normal `200`, QCF `1000`, upper `1100`, and idle return.
- Studio workbench, build, debug, source relink, stage, assets, and IKEMEN scan journeys completed.
- Commits: `9a19bd9e`, `ea50030e`.
- Global status: browser smoke and the batched TypeScript 7, tests, trace, boundaries, CSS, production build, and diff gate are closed; full parity remains out of scope.

## Not Done

- Full MUGEN VM
- Full Ikemen-GO runtime
- ZSS/Lua execution
- Full helper VM
- Full screenpack/lifebar engine
- Full teams/simul/tag/turns
- Rollback/netplay
- Exact palette/render parity
- Broad public fixture corpus
