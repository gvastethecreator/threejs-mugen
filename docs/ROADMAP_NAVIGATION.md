# Roadmap Navigation

Last updated: 2026-06-28

This is the fast map for agents and humans who need to know where to look, what to update, and when a task is allowed to claim progress.

## Start Here

For any non-trivial pass, read in this order:

1. `AGENTS.md`
2. `CONTEXT.md`
3. `docs/ROADMAP_NAVIGATION.md`
4. `docs/ROADMAP_PROGRESS_SYSTEM.md`
5. `docs/ROADMAP_EXECUTION_BOARD.md`
6. Relevant `.scratch/roadmap/issues/<NN>-*.md`

For a status answer, also read:

1. `docs/PORT_COMPLETION_SCORECARD.md`
2. `docs/PROGRESS_TRACKER.md`

For architecture or source-of-truth changes, also read:

1. `docs/adr/`
2. `docs/ARCHITECTURE.md`
3. `docs/ENGINE_PORT_ARCHITECTURE.md`
4. `docs/MODULE_BOUNDARY_CONTRACT.md`

## Ownership Map

| Question | Source |
| --- | --- |
| What rules should agents follow? | `AGENTS.md` |
| What is this product/engine trying to become? | `CONTEXT.md` |
| What is the current queue? | `docs/ROADMAP_EXECUTION_BOARD.md` |
| How far are we from playable/full ports? | `docs/PORT_COMPLETION_SCORECARD.md` |
| What changed recently? | `docs/BUILD_EXECUTION_BACKLOG.md` |
| What is the compact current truth? | `docs/PROGRESS_TRACKER.md` |
| What gates define done? | `docs/ROADMAP_PROGRESS_SYSTEM.md` and `docs/QA_AND_ACCEPTANCE_GATES.md` |
| What checklist should I follow for this task type? | `docs/ROADMAP_OPERATIONAL_CHECKLIST.md` |
| What can the runtime currently support? | `docs/SUPPORTED_FEATURES.md` and `docs/CONTROLLER_SUPPORT_REGISTRY.md` |
| What must Studio become? | `docs/ENGINE_STUDIO_ROADMAP.md` and `docs/INTERFACE_SYSTEM.md` |
| What must generated assets prove? | `docs/GENERATED_ASSET_QA_CONTRACT.md` |
| What is only scanner-level IKEMEN work? | `docs/IKEMEN_GO_REFERENCE.md` and `docs/COMPATIBILITY_PROFILES.md` |
| What is shared-core vs fighting-specific? | `docs/MODULE_BOUNDARY_CONTRACT.md` |

## Package Lanes

| Lane | Current goal | Issue |
| --- | --- | --- |
| R1 runtime compatibility | KFM/Common1, FightFX/common assets, guard/fall/recovery precision. | `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` |
| R2 runtime ownership | Move mutable match behavior behind named worlds/systems. | `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` |
| S1 Studio trust chain | Evidence and Build share one status/next-action contract. | `.scratch/roadmap/issues/02-studio-evidence-workflow.md` |
| A1 generated assets | Prompt/source/atlas/QA/collision/playtest provenance. | `.scratch/roadmap/issues/03-generated-assets-pipeline.md` |
| I1 IKEMEN scanner | More recognized/unsupported/unknown scanner findings. | `.scratch/roadmap/issues/04-ikemen-scan-and-reference.md` |
| M1 modular engine | One shared contract proven free of fighting leakage. | `.scratch/roadmap/issues/05-modular-engine-boundaries.md` |
| G1 roadmap control | Keep docs, issue tracker, gates, and claims synchronized. | `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md` |

## Score Movement Rules

Scores move only when evidence moves.

Allowed score evidence:

- focused unit/integration tests for parser, compiler, runtime, or boundary behavior
- `pnpm qa:trace` artifacts/checksums for compatibility behavior
- `pnpm qa:smoke` plus screenshot inspection for visible runtime, renderer, Studio, sprite, stage, or debug UI work
- private fixture evidence when the fixture exists locally
- exported build/package evidence for Studio or modular-engine claims

Not score evidence:

- docs-only cleanup
- UI mockups without data binding
- parser counts without execution/reporting gates
- generated/native assets counted as imported MUGEN compatibility
- IKEMEN scanner findings counted as IKEMEN execution

## Claim Checklist

Every meaningful closeout should answer:

```txt
Changed:
Evidence:
Claim allowed:
Claim blocked:
Next:
```

Compatibility claims must name the trace, test, fixture, checksum, or browser evidence that proves them.

## Setup-Project Profile

Current setup:

- Agent file: `AGENTS.md`
- Issue tracker: local markdown under `.scratch/<feature-slug>/`
- Triage labels: canonical `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`
- Domain layout: single-context repo with root `CONTEXT.md` and ADRs under `docs/adr/`
- GitHub remote: present, but not the working issue tracker unless user asks

See:

- `docs/agents/issue-tracker.md`
- `docs/agents/triage-labels.md`
- `docs/agents/domain.md`

## Anti-Drift Rules

- Do not raise port scores from docs-only work.
- Do not call scanner support runtime support.
- Do not call generated/native roster compatibility with imported MUGEN.
- Do not bundle commercial or third-party characters.
- Do not close an issue without evidence and blocked claims.
- Do not start platformer or generic SDK runtime work before fighting contracts stay green.
