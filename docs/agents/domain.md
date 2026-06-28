# Domain Docs

This is a single-context repo for a Three.js-based progressive MUGEN/Ikemen-GO port, playable sandbox, and future modular engine/studio.

## Read Before Broad Work

Read these first when the task is architectural, compatibility-sensitive, or cross-cutting:

- `AGENTS.md`
- `CONTEXT.md`
- `README.md`
- `docs/ROADMAP_NAVIGATION.md`
- `docs/ROADMAP_PROGRESS_SYSTEM.md`
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
- Product/interface skills should improve Studio/workbench usability without inventing status not backed by runtime/project/evidence data.
- `imagegen` and `sprite-atlas-builder` work belongs to generated/native assets. Keep provenance, QA, and bad-source regeneration rules visible.
- Runtime/Three.js skills must preserve the playable match and close visible changes with browser smoke plus visual inspection.
