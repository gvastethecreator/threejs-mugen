# Domain Docs

Last audited: 2026-06-29

This is a single-context repo for a Three.js-based progressive MUGEN/Ikemen-GO port, playable sandbox, and future modular engine/studio.

## Read Before Broad Work

Read these first when the task is architectural, compatibility-sensitive, or cross-cutting:

- `AGENTS.md`
- `CONTEXT.md`
- `README.md`
- `docs/ROADMAP_NAVIGATION.md`
- `docs/ROADMAP_PROGRESS_SYSTEM.md`
- `docs/ROADMAP_PACKAGE_MILESTONES.md`
- `docs/NEXT_BUILD_ROADMAP.md`
- `docs/ROADMAP_CONTINUITY_GUIDE.md`
- `docs/DELIVERY_ROADMAP.md`
- `docs/ROADMAP_OPERATIONAL_CHECKLIST.md`
- `docs/ROADMAP_EXECUTION_BOARD.md`
- `docs/ROADMAP_RELEASE_TARGETS.md`
- `docs/PORT_COMPLETION_SCORECARD.md`
- `docs/WORKPLAN.md`
- `docs/PROGRESS_TRACKER.md`
- `docs/BUILD_EXECUTION_BACKLOG.md`
- `docs/ENGINE_PORT_ARCHITECTURE.md`
- `docs/CONTROLLER_SUPPORT_REGISTRY.md`
- `docs/SUPPORTED_FEATURES.md`
- `docs/QA_AND_ACCEPTANCE_GATES.md`

Also read relevant ADRs under:

- `docs/adr/`

## Conflict Resolution

When docs disagree, prefer this order for current implementation truth:

1. Latest numbered entry in `docs/BUILD_EXECUTION_BACKLOG.md`.
2. `docs/ROADMAP_PACKAGE_MILESTONES.md`.
3. `docs/ROADMAP_EXECUTION_BOARD.md`.
4. `.scratch/roadmap/issues/<NN>-*.md`.

Then update stale roadmap docs in the same pass. Do not preserve an older "next" gate if the backlog proves it already closed.

## Autonomous Pass Routing

Use this routing before editing:

1. If the task is setup-project, AGENTS, tracker, roadmap, or closeout process, treat it as G1 project-control work and update `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md`.
2. If the task changes imported runtime behavior, use R1/R2 docs and require trace or focused system evidence.
3. If the task changes Studio, runtime visuals, generated sprites, stages, or renderer presentation, require browser smoke and screenshot inspection.
4. If the task is scanner-only IKEMEN research, keep findings classified as recognized, unsupported, or unknown and do not claim runtime execution.
5. If the task touches shared module boundaries, prove the contract does not import MUGEN/CNS/CMD/HitDef/Common1 concepts before calling it shared.

After docs/setup work, return to `docs/ROADMAP_PACKAGE_MILESTONES.md` and `docs/NEXT_BUILD_ROADMAP.md` for the next evidence-producing cut.

## Domain Vocabulary

Use these terms consistently:

- **Runtime Mode**: playable fight sandbox.
- **Inspector Mode**: imported character/stage inspection.
- **Studio Mode**: project/workbench/evidence/build workflow.
- **Compatibility gate**: falsifiable trace/test proving one bounded behavior.
- **Claim allowed**: what evidence proves.
- **Claim blocked**: what remains unsupported or unproven.
- **Imported fighter**: character data loaded from MUGEN-like files.
- **Native/generated fighter**: project-owned atlas-backed fighter.
- **MatchWorld**: renderer-independent world/evidence boundary for actors, effects, target links, lifecycle, and snapshots.

## ADR Guidance

Use `docs/adr/` for durable decisions that constrain future agents. Start with `docs/adr/0001-roadmap-control-and-local-issues.md` before changing issue-tracker, scorecard, release-train, or source-of-truth rules.

## Local Roadmap Tracker

Use `.scratch/roadmap/PRD.md` and `.scratch/roadmap/issues/` as local markdown slicing aids. They do not replace `docs/ROADMAP_PROGRESS_SYSTEM.md`, `docs/WORKPLAN.md`, or `docs/BUILD_EXECUTION_BACKLOG.md`; they help agents pick the next small, evidence-backed cut.

When a user asks "how far are we?" or "0 to 100?", answer from `docs/PORT_COMPLETION_SCORECARD.md` first, then qualify with the latest trace/build evidence.

## Skill Routing Notes

- `setup-project` output for this repo is local markdown issues, canonical labels, and single-context docs.
- If an agent starts in `D:\DEV\mugen-sandbox-prototypes`, first enter `mugen-web-sandbox`; parent `AGENTS.md` is only a router.
- `ROADMAP_CONTINUITY_GUIDE.md` is the handoff bridge from broad roadmap intent to the next evidence-backed implementation slice.
- `ROADMAP_PACKAGE_MILESTONES.md` is the compact package ladder for choosing the next code slice after setup/docs work.
- `NEXT_BUILD_ROADMAP.md` is the tactical next-10-slices board for continuing the port without re-planning.
- Product/interface skills should improve Studio/workbench usability without inventing status not backed by runtime/project/evidence data.
- `imagegen` and `sprite-atlas-builder` work belongs to generated/native assets. Keep provenance, QA, and bad-source regeneration rules visible.
- Runtime/Three.js skills must preserve the playable match and close visible changes with browser smoke plus visual inspection.
