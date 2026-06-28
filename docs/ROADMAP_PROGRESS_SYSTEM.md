# Roadmap Progress System

Last updated: 2026-06-28

This document explains how progress is tracked for the Three.js MUGEN/Ikemen-GO port, Creator Studio, generated asset pipeline, and future modular engine. It is operational glue: it tells agents where truth lives, how a slice moves, and what must not be claimed.

## Source Of Truth Stack

Read these in order when planning or reporting status:

| Layer | File | Owns |
| --- | --- | --- |
| Working rules | `AGENTS.md` | Repo-specific agent behavior, verification baseline, setup-project config. |
| Domain map | `CONTEXT.md` | Product shape, vocabulary, hard rules, current priority. |
| Release targets | `docs/ROADMAP_RELEASE_TARGETS.md` | Usable milestones, release trains, and score-movement rules. |
| Current queue | `docs/ROADMAP_EXECUTION_BOARD.md` | Active packages, acceptance gates, handoff contract. |
| Scoreboard | `docs/PORT_COMPLETION_SCORECARD.md` | 0-100 status by horizon and evidence ledger. |
| Compact truth | `docs/PROGRESS_TRACKER.md` | Short current state and next cuts. |
| Execution authority | `docs/WORKPLAN.md` | Ordered construction program and task-type done definitions. |
| Detailed ledger | `docs/BUILD_EXECUTION_BACKLOG.md` | Historical implementation evidence and claim pairs. |
| Local issues | `.scratch/roadmap/issues/` | Agent-sized work slices with acceptance and blocked claims. |

Rule: when two docs disagree, prefer the more specific owner above. Then update stale docs in the same round if the task touched that scope.

## Resume And Checkpoint Protocol

Use this sequence when a new agent, resumed thread, or subtask starts work:

1. Run `git status --short --branch` from the repo root.
2. Read `CONTEXT.md`, `AGENTS.md`, this file, `docs/ROADMAP_RELEASE_TARGETS.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.
3. For status answers, read `docs/PORT_COMPLETION_SCORECARD.md` and `docs/PROGRESS_TRACKER.md`.
4. For implementation slices, read the linked `.scratch/roadmap/issues/<NN>-*.md` issue and update it with evidence, next cut, and blocked claims.
5. For score/support/queue changes, update every owner listed in the update matrix below.
6. For checkpoint requests, commit only after the required closeout gates pass; docs-only/setup work still needs normal build/test gates and must state no score movement.

## Package Lifecycle

Every roadmap package should move through this lifecycle:

| State | Meaning | Required evidence |
| --- | --- | --- |
| `candidate` | Useful idea, not yet selected. | Listed in a horizon/roadmap doc with anti-claim. |
| `active` | Current build target. | Linked issue under `.scratch/roadmap/issues/` with acceptance. |
| `implemented` | Code or docs changed. | Focused tests, trace, smoke, or explicit docs-only note. |
| `claimed` | User-facing support wording changed. | Claim allowed / claim blocked wording in docs. |
| `closed` | Slice can be picked up later without ambiguity. | Checks listed, backlog entry added, next cut named. |

Do not mark runtime compatibility done from parser counts alone. Do not mark UI/Studio done without visual QA. Do not raise scores from docs-only setup.

## Horizon Ladder

| Horizon | Current band | Next exit criteria |
| --- | --- | --- |
| Private playable sandbox | 65 / 100 | Native/generated match stays stable while imported-runtime work continues; smoke evidence remains green. |
| MUGEN-lite imported MVP | 35 / 100 practical compatibility, 20 / 100 MVP port | KFM/Common1-style fixture can run idle, walk, crouch, jump, attack, guard, get-hit, fall, and recovery with trace/report gaps visible. |
| Broad MUGEN subset | Future 45-55+ | Multiple local character/stage packages load without hardcoded patches; unsupported controllers/triggers remain reportable instead of fatal. |
| IKEMEN scanner-plus | Scanner-only today | More Ikemen-GO source signals map into recognized/unsupported/unknown findings; ZSS/Lua execution remains blocked until separately gated. |
| Creator Studio MVP | 25 / 100 | Evidence and Build surfaces become single trust chain for stale, partial, blocked, unsupported, and exportable states. |
| Modular engine extraction | 10 / 100 | One shared contract proves no CNS, CMD, HitDef, Common1, rounds, helpers, targets, or MUGEN command routing leakage. |

## Update Matrix

| If work changes... | Update... | Run... |
| --- | --- | --- |
| Runtime/controller/combat behavior | `docs/SUPPORTED_FEATURES.md`, `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, relevant issue | `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm qa:trace` |
| Trace schema/gates | `docs/QA_AND_ACCEPTANCE_GATES.md`, `docs/FIXTURE_GOLDENS.md` if applicable, backlog, relevant issue | `pnpm qa:trace` plus normal gates |
| Score or "how far are we?" answer | `docs/PORT_COMPLETION_SCORECARD.md`, `docs/PROGRESS_TRACKER.md`, `docs/ROADMAP_EXECUTION_BOARD.md` | Evidence command that justifies score movement |
| Release train or usable milestone wording | `docs/ROADMAP_RELEASE_TARGETS.md`, `docs/ROADMAP_EXECUTION_BOARD.md`, `docs/PROGRESS_TRACKER.md` | Evidence command if score/support wording changes; normal gates for docs-only |
| Studio/UI/product workflow | `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, `docs/PROGRESS_TRACKER.md`, relevant issue | `pnpm qa:smoke` plus visual inspection |
| Generated asset pipeline | `docs/GENERATED_ASSET_QA_CONTRACT.md`, `docs/ENGINE_STUDIO_ROADMAP.md`, relevant issue | Atlas/QA/script proof plus visual check when visible |
| IKEMEN scanner/reference | `docs/COMPATIBILITY_PROFILES.md`, `docs/MUGEN_COMPATIBILITY_PLAN.md`, relevant issue | Focused scanner tests plus normal gates |
| Modular shared boundary | `docs/MODULE_BOUNDARY_CONTRACT.md`, `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`, relevant issue | Boundary tests or docs-only note if no code |

## Closeout Template

Use this shape at the end of each meaningful slice:

```txt
Changed:
- exact files or systems

Evidence:
- test/trace/smoke/build outputs

Claim allowed:
- bounded behavior proven, with artifact/test name

Claim blocked:
- parity, edge cases, or horizons still unsupported

Next:
- one or two safe cuts from ROADMAP_EXECUTION_BOARD
```

## Current Priority Rule

Default next work remains:

```txt
RuntimeTrace / ControllerOp depth
  -> MatchWorld ownership
  -> KFM/Common1 fixture precision
  -> Studio Evidence/Build trust
  -> generated asset QA/provenance
  -> IKEMEN scanner expansion
  -> shared module contract
```

Parallel docs are allowed when they reduce drift. Parallel UI is allowed when it binds to real runtime/project/evidence data and passes visual QA.
