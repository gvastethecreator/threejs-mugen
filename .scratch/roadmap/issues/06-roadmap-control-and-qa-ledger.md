# 06 - Roadmap Control And QA Ledger

Status: ready-for-agent
Labels: docs, roadmap, ready-for-agent

## Objective

Keep the roadmap, scorecard, issue tracker, and QA closeout rules synchronized so future work does not drift into partial claims or stale task lists.

## Current Post-T268 Reconciliation

Runtime closeout HEAD is `b241cc65`; concurrent roadmap edits retain open
Wayfinder 257, excluded from claims. Entry 555 and Wayfinder 256 are historical
control cursors. T266-T268 provide current grouped gates of 633/633 traces and
231/231 files / 2435/2435 tests. Scores remain unchanged. Current docs must not
replan Wayfinders 230-256 or project their old evidence to later
HEADs. `CONTEXT.md` and the root milestone focus remain stale outside this
automation's write surface. The current 30-task contract is
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.

## Historical Post-Wayfinder-229 Reconciliation

The control tuple is audited HEAD `83f85bae`, maximum numbered Entry 555, and
latest lane closeout Wayfinder 229. The latest declared trace aggregate is
633/633; Wayfinder 221 owns the latest declared full suite at 2294/2294, which
must not be projected onto later HEADs. Scores remain unchanged. Current docs
must not replan gates closed in Wayfinders 210-229 or count dirty source.
`CONTEXT.md` and the root milestone focus remain stale outside this
automation's write surface. The 30-task contract is
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md`.

## Historical Post-Wayfinder-209 Reconciliation

Entry 555 is the maximum numbered ledger entry and Wayfinder 209 is a later
unnumbered closeout at HEAD `90ab79b7`. Current documents must not call 209
next or Entry 554 maximum. The latest report declares 633/633 traces and
2262/2263 full-suite tests; scores remain unchanged. `CONTEXT.md` remains a
stale root-file cursor outside this automation's permitted write surface. The
current 30-task contract is
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.

## Historical Post-Entry-554 Reconciliation

Entry 554 is the maximum numbered ledger entry and declares 617/617 traces.
Thirty later commits lead to audited HEAD 05d85137 and a latest report frontier
of 633/633, 599 required and 34 optional. Do not synthesize Entries 555 onward.
Update active owner docs to name this split cursor, and add a durable rule for
numbered versus unnumbered closeouts. Scores remain unchanged. CONTEXT.md
remains a stale root-file cursor outside this automation's allowed write
surface. Full contracts:
docs/research/2026-07-15-daily-roadmap-architecture-audit-post-entry-554.md.

## Historical Current Entry-549 Reconciliation

Entry 549 is the committed cursor and declares 610/610 traces. The dirty
State -1 TargetPowerAdd follow-up is reserved work, not evidence. Entries
539-542 close the old StudioSemanticDraft, PackageAnalysis/v0, and
AssetProvenance/v2 selectors. This reconciliation changes no score and leaves
`CONTEXT.md` recorded as a stale root-file cursor outside the automation's
allowed write surface. Current task contracts live in
`docs/research/2026-07-15-daily-roadmap-architecture-audit-entry-549.md`.

## Historical Entry-525 Reconciliation

The committed implementation cursor is Entry 525. `CompatibilityCorpus/v0`
provides the legal/portable/optional denominator over existing journey
references and has no score effect. Evidence is 210 test files / 2125 tests,
TypeScript 7 build, boundaries, CSS budget, and 600/600 traces. The next
control gate is written score-band adjudication followed by one independent
legal stage/package route. The detailed report is
`docs/reports/2026-07-14-compatibility-corpus-v0.md`.

## Next Useful Cuts

- Current entry-516 reconciliation: numbered backlog maximum 516 declares 598/598 traces, 564 required and 34 optional, with scores unchanged. The old 505/510 selectors are superseded. Preserve uncommitted match-outcome/state-5900 work as in-flight, not evidence, and avoid allocating entry 517 from a docs-only audit while that owner is active. `CONTEXT.md` remains a known stale root-file cursor outside this automation's permitted edit surface. The current plan is recorded in `docs/research/2026-07-14-daily-roadmap-architecture-audit-entry-516.md`.

- Current 2026-07-14 daily audit: numbered backlog maximum 505 supersedes entry 476 and Wayfinder 127. The entry-505 report declares 587/587 traces. The prior journey/milestone/independent-package/global-flag/team-round/lifebar/resource/Helper-resource queue is closed. Scores remain unchanged; the next control gate is a versioned compatibility corpus followed by explicit score-band adjudication. `CONTEXT.md` and the root milestone rule remain stale but are outside this automation's allowed edit surface.

- Current 2026-07-13 daily audit: numbered backlog maximum 476 supersedes entry 411. Closed gates now include post-KO/`NoKOSlow`, the legal MUGEN-lite ZIP/loader/trace/browser journey, and active-root admission/contact/priority/reversal/depth/HitOverride/guard. Wayfinder 127 is open dirty-tree work. After it closes, route to `CompatibilityJourney/v1`, milestone adjudication, and independent package/palette evidence. `CONTEXT.md` remains stale but is outside this automation's allowed paths.

- Current 2026-07-12 daily audit: backlog entry 411 closes Wayfinder 105 in the current working tree with declared full gates and no score movement. Return now to R1 post-KO / `NoKOSlow`; Wayfinder 106 maps hit admission, and later executable I2 combat begins with a candidate/getter-order read model. `CONTEXT.md` remains a known out-of-scope root-file cursor drift for this automation.

- Current 2026-07-12 checkpoint: backlog entry 407 and 543/543 traces (512 required, 31 optional). Wayfinder 101 closes actor-local active-root stage-X constraints with zero interaction widening. Wayfinder 102 maps diagnostic collision projection.
- Current lane decision: I1 remains scanner/reporting; I2 routes through issue 07. `RuntimeRootPhaseCapabilities/v2` is current machine-readable phase truth.
- Current delivery order: source-map active-root stage constraints/body push/collision admission, then implement only the selected bounded consumer; root-key effects, combat, round, and resources remain separate gates. Direct native input/AI remains an independent policy. The bounded MUGEN-lite post-KO / `NoKOSlow` timeline remains the next competing runtime lane rather than being folded into team work.
- ADR 0002 is now accepted from landed HitDef policy/contact and semantic presentation-order evidence; equal ties, Projectile/dynamic priority, `Explod ontop`, and full renderer parity remain blocked.
- Current 2026-07-10 daily roadmap/architecture audit: the newest global closeout is player `SprPriority` draw order with 524/524 retained; entry 332 is only the latest numbered backlog entry and its 523/523 count is slice-local history. Wayfinder 024 maps to issue 01's two-step HitDef priority policy/contact sequence. Shared Trust Chain creation/package-source drilldowns and `RuntimeEffectActorAdvanceWorld` remain closed and must not be replanned. Scores remain unchanged.
- Current architecture decision: authored/omitted HitDef priority survives compilation and named-profile defaults resolve only at contact; semantic MUGEN order stays separate from Three.js queues; `MatchTickSchedule/v0` diagnostics stay outside legacy behavior checksums. Proposed ADR 0002 must be adopted or replaced before runtime mutation.
- Open scope-bound G1 follow-up: root `AGENTS.md` Current Milestone Focus still names the pre-audit Common1/FightFX or generic MatchWorld choice. This automation may edit only `docs/` and `.scratch/roadmap/`, so it records but does not mutate that root rule file.
- Current setup-project/continuity cut: `AGENTS.md`, `docs/agents/domain.md`, `docs/ROADMAP_PROGRESS_SYSTEM.md`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/NEXT_BUILD_ROADMAP.md`, `docs/ROADMAP_EXECUTION_BOARD.md`, and `docs/PROGRESS_TRACKER.md` now separate lane checkpoints so the latest Studio/UI or docs-only closeout does not replace the latest runtime/port checkpoint. This is project-control work only; no score movement.
- Current setup-project/roadmap pass: added `docs/NEXT_BUILD_ROADMAP.md` as the tactical next-10-slices board and linked it from AGENTS/setup/roadmap docs. This docs/control setup initially selected R2 random ownership after the latest `VarRandom` gate; that first slice is now implemented below, with no score movement.
- Current setup-project/G1 refresh: `AGENTS.md`, `docs/agents/*`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_PROGRESS_SYSTEM.md`, `docs/ROADMAP_OPERATIONAL_CHECKLIST.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/NEXT_BUILD_ROADMAP.md`, and `docs/PROGRESS_TRACKER.md` now make the local tracker, canonical labels, single-context docs, G1 health check, decision tree, and no-score rule explicit.
- Current setup-project/roadmap pass: confirmed the existing `setup-project` profile remains local markdown issues, canonical triage labels, and single-context domain docs; roadmap docs now point at `RuntimeGuardWorld` as the latest closed R2 ownership checkpoint before returning to R1 Common1/FightFX precision or deeper R2 helper/effect/combat ownership.
- Current implementation follow-up: R2 `HitSparkAssetSystem` ownership extraction is now implemented after the random ownership slice, so future docs/setup work should return to R1 Common1/FightFX precision or deeper R2 MatchWorld ownership instead of reselecting spark lookup or random ownership.
- Current setup-project/AGENTS refresh: setup-project profile remains local markdown issues, canonical triage labels, and single-context domain docs. Repo `AGENTS.md`, `docs/agents/*`, package milestones, execution board, progress tracker, scorecard, continuity guide, and checklist now route future agents through the latest `HitSparkAssetSystem` checkpoint instead of older closed gates.
- Current roadmap sync: `docs/ROADMAP_PACKAGE_MILESTONES.md` now names the latest R2 ownership checkpoint and the next evidence-producing options: R1 Common1/FightFX precision or deeper R2 helper/effect/target ownership. This is docs/control only and does not move scores.
- Current setup-project refresh: parent workspace `AGENTS.md` now routes agents into `mugen-web-sandbox`; repo `AGENTS.md` remains authoritative and records setup-project defaults, slice-selection priority, verification baseline, and docs-only no-score rule.
- Current setup-project verification: repo setup already exists (`AGENTS.md`, `docs/agents/*`, `CONTEXT.md`, `docs/adr/`, local `.scratch/roadmap/`, GitHub remote). This pass refreshes alignment rather than creating a duplicate agent contract.
- Current roadmap drift fix: `docs/ROADMAP_PROGRESS_SYSTEM.md` no longer points future docs-only closeout to the already-closed `HitBy` mismatch-reject gate; it now routes back to R1 Common1/FightFX precision or R2 `MatchWorld` ownership after the target-owned custom-state gate.
- Current roadmap-control cut: `docs/ROADMAP_EXECUTION_BOARD.md` now includes an operating snapshot table that maps P0/P1/P2/P3 workstreams to next shippable proof, evidence gate, and score effect.
- Current tracker cut: `docs/PROGRESS_TRACKER.md` now includes the immediate execution order so future autonomous passes can return from docs/setup work to the first score-moving runtime or ownership gate.
- Current cut: `AGENTS.md` and `docs/agents/*` now document setup-project defaults; `docs/adr/0001-roadmap-control-and-local-issues.md` records the local markdown tracker/source-of-truth decision; `docs/ROADMAP_RELEASE_TARGETS.md` defines release trains, usable milestone gates, and score-movement rules.
- Current cut: `AGENTS.md` and `docs/ROADMAP_PROGRESS_SYSTEM.md` now share a resume/checkpoint protocol so a new agent can recover repo truth, select the correct issue, run the right gates, and avoid score inflation.
- Current audit: `setup-project` was rechecked against repo state on 2026-06-28: GitHub remote exists, `AGENTS.md` is the active agent file, `docs/agents/*` exists, `CONTEXT.md` plus `docs/adr/` make this a single-context repo, and `.scratch/roadmap/` remains the working issue tracker.
- Current cut: `AGENTS.md` now records named-skill routing for setup-project, caveman, product/interface, imagegen/sprite-atlas, and Three.js visual QA work; `docs/ROADMAP_EXECUTION_BOARD.md` now has a twelve-item concrete gate queue for R1/R2/S1/A1/I1/M1 follow-up.
- Current closeout: `docs/ROADMAP_NAVIGATION.md` now gives the fast route map for source ownership, package lanes, score movement evidence, setup-project profile, and anti-drift rules; `AGENTS.md`, `docs/agents/domain.md`, `docs/PROGRESS_TRACKER.md`, `docs/ROADMAP_PROGRESS_SYSTEM.md`, and `.scratch/roadmap/PRD.md` link to it.
- Current closeout: `docs/ROADMAP_OPERATIONAL_CHECKLIST.md` now maps runtime, renderer, Studio, generated asset, IKEMEN scanner, modular boundary, and docs-only work to required evidence, docs, commands, and score-movement rules.
- Current setup-project/roadmap refresh: `docs/ROADMAP_PACKAGE_MILESTONES.md` now gives the package ladder, milestone exits, closeout contract, update map, and default next code slice after docs/setup work: R1 Common1/FightFX precision, with deeper R2 MatchWorld ownership as alternate.
- Current setup-project checkpoint: `docs/agents/*` audit dates now match the 2026-06-29 repo `AGENTS.md` setup profile after the `RuntimeHitEligibilityWorld` ownership pass. The profile remains local markdown issues, canonical triage labels, and single-context domain docs; no score movement.
- Current setup-project checkpoint: repo setup-project profile was rechecked during the `RuntimeHitStateTransitionWorld` pass. `AGENTS.md`, `docs/agents/*`, parent router `AGENTS.md`, root `CONTEXT.md`, `docs/adr/`, and `.scratch/roadmap/` remain aligned; no new tracker or duplicate agent file was created.
- Current roadmap sync: roadmap/package/progress docs now name `RuntimeHitStateTransitionWorld` as the latest R2 ownership checkpoint so future work does not reselect default get-hit or custom-state transition ownership.
- Current roadmap sync: roadmap/package/progress docs now name `RuntimeStateAvailabilityWorld` as the latest R2 ownership checkpoint so future work does not reselect state/action availability lookup.
- Current setup-project checkpoint: repo setup-project profile was rechecked during the `RuntimeStunWorld` ownership pass. `AGENTS.md`, `docs/agents/*`, parent router `AGENTS.md`, root `CONTEXT.md`, `docs/adr/`, and `.scratch/roadmap/` remain aligned; no new tracker or duplicate agent file was created.
- Keep `docs/ROADMAP_EXECUTION_BOARD.md` as the current queue/handoff board.
- Keep `docs/PROGRESS_TRACKER.md` compact and current after meaningful milestones.
- Keep `docs/PORT_COMPLETION_SCORECARD.md` as the only 0-100 answer source.
- Keep `docs/BUILD_EXECUTION_BACKLOG.md` append-only enough to preserve the real history.
- Add or split `.scratch/roadmap/issues/` only when a workstream needs its own acceptance and blocked claims.

## Acceptance

- Any score change updates `docs/PORT_COMPLETION_SCORECARD.md`, `docs/PROGRESS_TRACKER.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.
- Any runtime/compatibility support change updates the relevant support docs and issue.
- Any visible UI/render/stage/sprite change records `pnpm qa:smoke` and visual inspection.
- Docs-only changes explicitly state that scores did not move.
- Durable source-of-truth changes add or update an ADR.

## Blocked Claims

- Roadmap docs do not prove runtime compatibility.
- Score increases without tests, traces, visual QA, fixture evidence, or package/build evidence are invalid.
- Closed issues without evidence paths/checksums are invalid.
- Docs-only setup/project-control work does not prove runtime behavior.

## Evidence

- Lane checkpoint taxonomy added to `docs/ROADMAP_PROGRESS_SYSTEM.md`, linked from `AGENTS.md`, `docs/agents/domain.md`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/NEXT_BUILD_ROADMAP.md`, `docs/ROADMAP_EXECUTION_BOARD.md`, and `docs/PROGRESS_TRACKER.md`.
- Parent `AGENTS.md` routes agents from `D:\DEV\mugen-sandbox-prototypes` into the repo instead of letting work happen at the wrong folder level.
- `AGENTS.md` owns repo rules, setup-project profile, session bootstrap, roadmap update protocol, and verification baseline.
- `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, and `docs/agents/domain.md` define the local markdown tracker, canonical triage vocabulary, and single-context domain-doc layout.
- The latest G1 setup-project refresh keeps those decisions as defaults and adds explicit skill-consumer, lane-tag, autonomous-pass-routing, decision-tree, and health-check guidance.
- `docs/ROADMAP_PROGRESS_SYSTEM.md` owns source-of-truth order, resume/checkpoint protocol, package lifecycle, horizon ladder, update matrix, and closeout template.
- `docs/ROADMAP_NAVIGATION.md` owns the fast route map for future agents who need to find the right doc/issue/gate quickly.
- `docs/ROADMAP_PACKAGE_MILESTONES.md` owns compact package selection, milestone exits, and the next recommended evidence-producing slice.
- `docs/BUILD_EXECUTION_BACKLOG.md` records the latest closed gate, so future agents can avoid treating already-closed gates as next work.
- `docs/ROADMAP_OPERATIONAL_CHECKLIST.md` owns task-type execution checklists and closeout commands.
- `docs/ROADMAP_EXECUTION_BOARD.md` owns the next concrete gates, currently I2 inert-root evidence/participation, the R1 post-KO return gate, and later isolated I2 activation/redirect/schedule work.
- The former `RuntimeStunWorld`-as-latest statement is retired. Current numbered-history truth is the highest numbered `Entry N` or numbered ledger item anywhere in `docs/BUILD_EXECUTION_BACKLOG.md`; physical top/bottom placement and convenience summaries do not override the numeric maximum. The daily audit distinguishes those ledgers explicitly.
- `docs/adr/0001-roadmap-control-and-local-issues.md` records the local tracker/source-of-truth decision.
- `AGENTS.md` now records the latest setup-project audit date.
- Previous implementation truth before this docs refresh came from the then-current top entry in `docs/BUILD_EXECUTION_BACKLOG.md`: `HitSparkAssetSystem` owns bounded player/common/FightFX spark asset-frame lookup before hit-effect event insertion. Newer runtime and Studio/UI checkpoints are recorded above it in the backlog; the latest aggregate after optional KFM presentation gates is 159/159 artifacts, 139 required, and 20 optional.

## Claim Allowed

Allowed-scope roadmap docs and local issues are explicit enough for future agents to resume, pick the next package, check the latest implementation checkpoint, and close work with the correct gates; root `AGENTS.md` milestone-focus wording remains a known G1 follow-up.

## Claim Blocked

This docs/setup issue does not prove runtime, parser, renderer, Studio, generated asset, IKEMEN, or modular-engine compatibility.
