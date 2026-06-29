# 06 - Roadmap Control And QA Ledger

Status: closed
Labels: docs, roadmap, ready-for-agent

## Objective

Keep the roadmap, scorecard, issue tracker, and QA closeout rules synchronized so future work does not drift into partial claims or stale task lists.

## Next Useful Cuts

- Current setup-project/roadmap pass: added `docs/NEXT_BUILD_ROADMAP.md` as the tactical next-10-slices board and linked it from AGENTS/setup/roadmap docs. This docs/control setup initially selected R2 random ownership after the latest `VarRandom` gate; that first slice is now implemented below, with no score movement.
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

- Parent `AGENTS.md` routes agents from `D:\DEV\mugen-sandbox-prototypes` into the repo instead of letting work happen at the wrong folder level.
- `AGENTS.md` owns repo rules, setup-project profile, session bootstrap, roadmap update protocol, and verification baseline.
- `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, and `docs/agents/domain.md` define the local markdown tracker, canonical triage vocabulary, and single-context domain-doc layout.
- `docs/ROADMAP_PROGRESS_SYSTEM.md` owns source-of-truth order, resume/checkpoint protocol, package lifecycle, horizon ladder, update matrix, and closeout template.
- `docs/ROADMAP_NAVIGATION.md` owns the fast route map for future agents who need to find the right doc/issue/gate quickly.
- `docs/ROADMAP_PACKAGE_MILESTONES.md` owns compact package selection, milestone exits, and the next recommended evidence-producing slice.
- `docs/BUILD_EXECUTION_BACKLOG.md` records the latest closed gate, so future agents can avoid treating already-closed gates as next work.
- `docs/ROADMAP_OPERATIONAL_CHECKLIST.md` owns task-type execution checklists and closeout commands.
- `docs/ROADMAP_EXECUTION_BOARD.md` owns the next concrete gates, including deeper FightFX/common spark presentation after the current package loading/provider/source-metadata route.
- Latest implementation truth after this refresh comes from the top entry in `docs/BUILD_EXECUTION_BACKLOG.md`: `RuntimeGuardWorld` owns bounded guard-hit state selection and auto guard-start eligibility/mutation, with stable trace aggregate 156/156 artifacts, 138 required, 18 optional.
- `docs/adr/0001-roadmap-control-and-local-issues.md` records the local tracker/source-of-truth decision.
- `AGENTS.md` now records the latest setup-project audit date.
- Latest implementation truth before this docs refresh comes from the top entry in `docs/BUILD_EXECUTION_BACKLOG.md`: `HitSparkAssetSystem` owns bounded player/common/FightFX spark asset-frame lookup before hit-effect event insertion. The latest trace aggregate remains 156/156 artifacts, 138 required, 18 optional, with `synthetic-imported-variable.json` checksum `3b33f7a8`.

## Claim Allowed

Project-control setup is explicit enough for future agents to resume, pick the next roadmap issue, choose the next package, check the latest implementation checkpoint, and close work with the correct gates.

## Claim Blocked

This docs/setup issue does not prove runtime, parser, renderer, Studio, generated asset, IKEMEN, or modular-engine compatibility.
