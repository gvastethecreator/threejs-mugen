# Roadmap Package Milestones

Last updated: 2026-06-28

This file is the compact package ladder between the scorecard and the local issues. It answers which package is active, what proof moves it, what is blocked, and what the next agent should build first.

Docs-only changes here do not move scores. Scores move only through trace, test, fixture, visual QA, or build/export evidence.

## Active Package Ladder

| Package | Status | Next proof | Required evidence | Blocked claim |
| --- | --- | --- | --- | --- |
| G1 Roadmap control | Active control layer | Keep setup-project, AGENTS, local issues, and roadmap docs synchronized. | `pnpm test`, `pnpm typecheck`, `pnpm build` for docs-only closeout. | Any runtime, Studio, IKEMEN, or modular compatibility score movement. |
| R1 Runtime compatibility | Active score-moving lane | Add one bounded imported runtime oracle or deepen one Common1/FightFX route. | Required `pnpm qa:trace` artifact or focused runtime test. | Full CNS VM, exact tick-order parity, helpers/custom states/teams, screenpacks. |
| R2 Runtime ownership | Active debt-reduction lane | Move one mutable behavior behind a named world/system boundary with stable traces. | Focused system tests; trace stability or documented checksum drift. | Claiming parity from extraction alone. |
| S1 Studio trust chain | Active product lane | Evidence and Build consume one shared status and next-action contract. | `pnpm qa:smoke` plus visual inspection using real evidence rows. | Decorative dashboard states, fake green exports, editing workflows without persistence. |
| A1 Generated assets | Planned/active support lane | Store prompt/source/atlas/QA/collision/playtest provenance as one record. | Asset QA record plus visual QA when shown in runtime or Studio. | Imported MUGEN compatibility credit. |
| I1 IKEMEN scanner | Active scanner-only lane | Classify one more Ikemen-GO signal as recognized, unsupported, or unknown. | Focused scanner tests and blocked runtime wording. | ZSS/Lua/runtime execution, rollback, netplay, IKEMEN system parity. |
| M1 Modular boundary | Guarded architecture lane | Prove one shared contract has no fighting-specific leakage. | `pnpm check:boundaries` or focused boundary tests. | Platformer/runtime SDK claims before fighting contracts stay stable. |

## Milestone Exit Gates

| Milestone | Meaning | Exit gate |
| --- | --- | --- |
| M0 Project control | Agents can resume without re-discovering tracker, docs, scores, or gates. | `AGENTS.md`, `docs/agents/*`, ADR, roadmap docs, and local issues agree. |
| M1 Playable private sandbox | Generated/native match remains usable while compatibility grows. | Browser smoke, visual inspection, stable controls/HUD/stage/debug. |
| M2 Imported MUGEN-lite MVP | One KFM/Common1-style imported package can run core routes with honest gaps. | Required traces for idle/walk/crouch/jump/attack/guard/get-hit/fall/recovery-style routes, plus compatibility report. |
| M3 Broader MUGEN subset | Multiple local characters/stages load partially without hardcoded patches. | Fixture corpus results, unsupported features reported, app does not crash on missing support. |
| M4 Studio working loop | Studio can inspect, explain, repair, playtest, and export local projects. | Evidence and Build share status contract; source/provenance and export blockers are actionable. |
| M5 IKEMEN scanner-plus | IKEMEN-only assets are recognized and reported without runtime overclaim. | Source-mapped scanner tests for ZSS/Lua/config/screenpack/stage/system signals. |
| M6 Modular engine seed | Shared contracts can support future non-fighting projects. | Boundary tests prove shared packages do not import MUGEN/CNS/CMD/HitDef/Common1 runtime concepts. |

## Next Recommended Slice

Latest implementation checkpoint:

```txt
R2 RuntimeRandomSystem ownership extraction
  -> deterministic seed/advance/clamp/fallback ownership named after VarRandom
  -> synthetic-imported-variable.json checksum 3b33f7a8
  -> focused RuntimeRandomSystem tests cover the ownership seam
  -> qa:trace aggregate 156/156, 138 required, 18 optional, 77 controller families
```

Default next implementation slice after docs/setup work:

```txt
R1 Common1/FightFX precision
  -> move one guard/fall/recovery or FightFX/common route beyond current bounded evidence
  -> prefer deeper VM loop order, broader fixture-backed confirmation, or visible package presentation evidence
```

Alternate next slice: R2 `MatchWorld` ownership around helper lifecycle, target ownership, presentation effects, or combat/effect ordering if it can preserve trace behavior. See `docs/NEXT_BUILD_ROADMAP.md` for the next-10-slices queue.

## Slice Selection Guardrails

Before starting work, check the latest numbered entry in `docs/BUILD_EXECUTION_BACKLOG.md`, this section, and the linked `.scratch/roadmap/issues/` file. Do not rebuild a gate that is already listed as closed.

Current closed gates that must not be reselected as "next":

- `synthetic-imported-hitby-allow.json`
- `synthetic-imported-hitby-reject.json`
- `synthetic-imported-hitdef-hit-sound.json`
- `synthetic-imported-target-owned-custom-state.json`
- `synthetic-imported-default-guard-state.json` actor-frame telemetry
- `synthetic-imported-crouch-guard-state.json` actor-frame telemetry
- `synthetic-imported-diagonal-crouch-guard-state.json` actor-frame telemetry
- `synthetic-imported-air-guard-state.json` actor-frame telemetry
- `synthetic-imported-auto-guard-start.json` controller-order evidence
- `synthetic-imported-auto-guard-end.json` controller-order evidence
- `synthetic-imported-noop.json` debug clipboard plus `MakeDust` no-op coverage
- `synthetic-imported-variable.json` `VarRandom` variable compatibility
- `RuntimeContactMemoryWorld` direct/projectile contact-memory ownership extraction
- `RuntimeRandomSystem` deterministic random ownership extraction

After docs-only/setup work, return to one of these evidence-producing cuts:

1. R1 Common1 recovery/guard controller-loop precision.
2. R1 FightFX/common presentation proof beyond current package-frame handoff.
3. R2 `MatchWorld` ownership around target/helper/effect ordering with stable or documented trace behavior.

## Package Closeout Contract

Every package closeout must include:

```txt
Changed:
Evidence:
Claim allowed:
Claim blocked:
Next:
```

If the work is visible, add `pnpm qa:smoke` plus visual inspection. If the work changes runtime compatibility, add `pnpm qa:trace`. If it is docs-only, state `No score movement`.

## Update Map

| Package | Must update when moved |
| --- | --- |
| G1 | `AGENTS.md`, `docs/agents/*`, `docs/ROADMAP_NAVIGATION.md`, `docs/ROADMAP_PROGRESS_SYSTEM.md`, `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md` |
| R1 | `docs/SUPPORTED_FEATURES.md`, `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/QA_AND_ACCEPTANCE_GATES.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` |
| R2 | `docs/ENGINE_PORT_ARCHITECTURE.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` |
| S1 | `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, `docs/PROGRESS_TRACKER.md`, `.scratch/roadmap/issues/02-studio-evidence-workflow.md` |
| A1 | `docs/GENERATED_ASSET_QA_CONTRACT.md`, `docs/ENGINE_STUDIO_ROADMAP.md`, `.scratch/roadmap/issues/03-generated-assets-pipeline.md` |
| I1 | `docs/IKEMEN_GO_REFERENCE.md`, `docs/COMPATIBILITY_PROFILES.md`, `docs/MUGEN_COMPATIBILITY_PLAN.md`, `.scratch/roadmap/issues/04-ikemen-scan-and-reference.md` |
| M1 | `docs/MODULE_BOUNDARY_CONTRACT.md`, `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`, `docs/ENGINE_PORT_ARCHITECTURE.md`, `.scratch/roadmap/issues/05-modular-engine-boundaries.md` |
