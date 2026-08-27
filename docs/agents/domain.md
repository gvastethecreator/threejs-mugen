# Domain docs

Last audited: 2026-08-27

This is a single-context repo for a Three.js progressive MUGEN/Ikemen-GO port, playable sandbox, and future studio/engine.

## Read before broad work

- `AGENTS.md`
- `CONTEXT.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/COMPATIBILITY_PROFILES.md`
- `docs/SUPPORTED_FEATURES.md`
- `docs/QUALITY_AUDIT.md`
- `docs/PLAYABLE_V0_STATUS.md`
- `docs/adr/` when the task is architectural

Live operator roadmaps, construction ledgers, and ticket dumps live in ignored `.scratch/architecture/` and `.scratch/roadmap/`. They are not public docs.

## Conflict resolution

When docs disagree, prefer this order:

1. Current code, tests, and `docs/evidence/` artifacts.
2. `docs/QUALITY_AUDIT.md` for engineering-gate snapshot.
3. `docs/adr/` for durable decisions.
4. Linked `.scratch/roadmap/issues/<NN>-*.md` for in-flight work.

Then update stale operator notes in `.scratch/` in the same pass.

## Autonomous pass routing

1. If the task is setup-project, AGENTS, tracker, or closeout process, treat it as project-control work. It does not raise port scores.
2. If the task changes imported runtime behavior, require trace or focused system evidence.
3. If the task changes Studio, runtime visuals, generated sprites, stages, or renderer presentation, require browser smoke and screenshot inspection.
4. If the task is scanner-only IKEMEN research, keep findings classified as recognized, unsupported, or unknown and do not claim runtime execution.
5. If the task touches shared module boundaries, prove the contract does not import MUGEN/CNS/CMD/HitDef/Common1 concepts before calling it shared.

## Domain vocabulary

- **Runtime Mode**: playable fight sandbox.
- **Inspector Mode**: imported character/stage inspection.
- **Studio Mode**: project/workbench/evidence/build workflow.
- **Compatibility gate**: falsifiable trace/test proving one bounded behavior.
- **Claim allowed**: what evidence proves.
- **Claim blocked**: what remains unsupported or unproven.
- **Imported fighter**: character data loaded from MUGEN-like files.
- **Native/generated fighter**: project-owned atlas-backed fighter.
- **MatchWorld**: renderer-independent world/evidence boundary for actors, effects, target links, lifecycle, and snapshots.

## ADR guidance

Use `docs/adr/` for durable decisions that constrain future agents. Start with `docs/adr/0001-roadmap-control-and-local-issues.md` before changing issue-tracker or source-of-truth rules.
