# Roadmap Progress System

Last updated: 2026-07-18

This document explains how progress is tracked for the Three.js MUGEN/Ikemen-GO port, Creator Studio, generated asset pipeline, and future modular engine. It is operational glue: it tells agents where truth lives, how a slice moves, and what must not be claimed.

## Current control override: T288 / Entry 562 frontier

Implementation HEAD is `a12a2672`; T288 closes the bounded FightScreen
character-reset event after the T287 shutter edge. The timer-owned signal is
consumed before the active fighter pass; roots restore stage position/state
`0`/idle/control, transient memory, command history, and owner-scoped effects,
while resources, variables, team state, and compatibility history persist. The
focused gate is 5 files / 392 tests plus TypeScript 7; the grouped full
checkpoint is pending. Scores remain 65 / 36 / 20 / 10-12 / 6-8 / 25.

The next executable gate is FightScreen announcement/display ownership. Exact
global asset clearing, display suppression, motif/dialogue, Common1/ZSS,
teams/Turns, rollback/netplay, and full parity are not implied by T288.

## Historical control override: T287 / Entry 561 frontier

Implementation HEAD is `4d615c8f`; T287 closes the bounded FightScreen
`shutter.time`/`shutter.col` loader, edge-triggered intro skip, raw
`roundnotskip` guard, `RuntimeRoundShutter/v0`, and symmetric shutter renderer.
The focused gate is 4 files / 300 tests; the full gate also passes TypeScript
7.0.2, 233 / 2484 tests, Vite 317 modules, 633/633 traces, boundaries, CSS
budget, and 64 browser capture paths with no console/page errors. Scores
remain 65 / 36 / 20 / 10-12 / 6-8 / 25.

The next executable gate is announcement/display ownership or an independent
character control/reset slice. Character reset, exact display suppression,
motif/dialogue, Common1/ZSS, teams/Turns, rollback/netplay, and full parity
are not implied by T287.

## Historical control override: T286 / Entry 560 frontier

Implementation HEAD is `e978fa3c`; T286 closes the bounded FightScreen
`start.waittime`/`ctrl.time` loader, reset-owned `RuntimeRoundIntro/v0`,
pre-intro/intro/fight phase boundary, and live timer/finish hold. The focused
gate is 3 files / 289 tests; the full gate also passes TypeScript 7.0.2,
233 / 2480 tests, Vite 316 modules, 633/633 traces, boundaries, CSS budget,
and 64 browser capture paths with no console/page errors. Scores remain 65 /
36 / 20 / 10-12 / 6-8 / 25.

The next executable gate is announcement/shutter/skip ownership or an
independent character-breadth slice. Exact character intro control/reset,
screenpack transforms, motif/dialogue, Common1/ZSS, teams/Turns, rollback/
netplay, and full parity are not implied by T286.

## Historical control override: post-T268 frontier

The latest runtime HEAD is `b241cc65`; the concurrent roadmap docs retain the
open Wayfinder 257 work. The latest grouped aggregate is 633/633 traces and
the full suite is 231/231 files and 2435/2435 tests. Scores remain 65 / 36 / 20
/ 10-12 / 6-8 / 25.

Do not replan Wayfinders 230-256: asset/release/evidence/export, redirected
dispatch, global-state/common-source loading, helper buffers, and base SOCD
are closed at their written ceilings. T266-T268 now provide source manifest
metadata, bounded stateful SOCD, and explicit resolution authority. Next
reconcile normative `05b7d98` with mutable local `044da720` and complete
semantic review; settle match-level input ownership and Common.Fx browser
evidence; then proceed through state-5900 provenance, round phases, atomic
Turns, global projectile order, character breadth, reanalysis, and
non-vacuous evidence extraction. Full contracts:
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.

## Historical control override: post-Wayfinder-229 frontier

The audited control tuple is HEAD `83f85bae`, maximum numbered Entry 555, and
latest lane closeout Wayfinder 229. Since Wayfinder 209, bounded AffectTeam,
projectile depth, snapshot v1.1 plus the second CC0 stage route, Studio evidence
and write receipts, productive PackageAnalysis v1/multikind, and asset
permission/path hygiene closed. Do not plan them again. Scores remain
65 / 36 / 20 / 10-12 / 6-8 / 25. The latest declared trace aggregate is
633/633; the latest declared full suite is Wayfinder 221 at 2294/2294, not a
whole-HEAD projection.

Next use revision-bound evidence and reconcile snapshot claims; then close the
reserved asset policy, redirected lease/ADR, atomic Turns and round phases,
global projectile order, a second character-centered route, scanner
reanalysis, and non-vacuous modular boundaries. The exact contracts are in
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md`.

## Historical control override: post-Wayfinder-209 frontier

Entry 555 is the maximum numbered backlog entry. Wayfinder 209 then closed as
an unnumbered runtime checkpoint at audited HEAD `90ab79b7`. The latest report
keeps `qa:trace` at 633/633 (599 required, 34 optional) and reports the full
suite at 2262/2263 with one residual scheduling-contract failure. Scores remain
65 / 36 / 20 / 10-12 / 6-8 / 25.

Do not plan Wayfinder 209 again and do not treat the materialized
`CompatibilityCorpusSnapshot/v1` as independent breadth or freshness proof.
Resume with control/baseline/pin reconciliation, snapshot v1.1, a second
repository-authored CC0 route, redirected-lease acceptance gaps, and atomic
Turns/round phases. Product lanes remain GateEvidenceResult, source receipts,
PackageAnalysis v1, one asset release decision, and only then shared Evidence.
The exact 30 task contracts are in
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.

## Historical control override: post-Entry-554 frontier

Entry 554 remains the maximum numbered backlog entry and declares 617/617
traces. The implementation chain then continued for 30 commits without new
numeric backlog headings. At audited HEAD 05d85137 the latest committed report
declares 633/633 traces, 599 required and 34 optional, through bounded root and
helper auxiliary Target resource RedirectID. Call this the post-Entry-554
report frontier; do not invent Entries 555 onward.

No score moved. The next evidence order is control reconciliation, a
materialized CompatibilityCorpusSnapshot/v1, an independent legal route,
redirected-target dispatch ADR/characterization, atomic Turns plus State 5900
and RoundState policy, then evidence-backed Studio/scanner/asset consumers.
The 30 task contracts and claims are in
docs/research/2026-07-15-daily-roadmap-architecture-audit-post-entry-554.md.
Older current/next selectors below are historical unless this override points
to them explicitly.

Historical Entry-549 control override: numbered backlog maximum 549 is the committed
implementation cursor. Entries 517-549 close bounded round/Turns progression,
the first compatibility corpus and score adjudication, one legal stage journey,
BGCtrl/stage behavior, Studio semantic preflight, PackageAnalysis/v0,
AssetProvenance/v2, root identity reads, and root RedirectID through active-CNS
TargetPowerAdd. Entry 530 is the only score movement: Practical MUGEN 35 -> 36.
The uncommitted State -1 TargetPowerAdd diff is reserved in-flight work, not
evidence. Next prioritize a materialized corpus snapshot, a target-family
dispatch seam, atomic Turns preflight/commit, evidence-backed Studio readiness,
one complete asset release record, and a real PackageAnalysis consumer. See
`docs/research/2026-07-15-daily-roadmap-architecture-audit-entry-549.md`.

## Source Of Truth Stack

Read these in order when planning or reporting status:

| Layer | File | Owns |
| --- | --- | --- |
| Working rules | `AGENTS.md` | Repo-specific agent behavior, verification baseline, setup-project config. |
| Domain map | `CONTEXT.md` | Product shape, vocabulary, hard rules, current priority. |
| Navigation | `docs/ROADMAP_NAVIGATION.md` | Fast route map for docs ownership, package lanes, score evidence, and anti-drift rules. |
| Package ladder | `docs/ROADMAP_PACKAGE_MILESTONES.md` | Active package status, milestone exits, next recommended slice, and package closeout ownership. |
| Tactical queue | `docs/NEXT_BUILD_ROADMAP.md` | Next 10 build slices and lane-specific done evidence. |
| Release targets | `docs/ROADMAP_RELEASE_TARGETS.md` | Usable milestones, release trains, and score-movement rules. |
| Current queue | `docs/ROADMAP_EXECUTION_BOARD.md` | Active packages, acceptance gates, handoff contract. |
| Scoreboard | `docs/PORT_COMPLETION_SCORECARD.md` | 0-100 status by horizon and evidence ledger. |
| Compact truth | `docs/PROGRESS_TRACKER.md` | Short current state and next cuts. |
| Execution authority | `docs/WORKPLAN.md` | Ordered construction program and task-type done definitions. |
| Detailed ledger | `docs/BUILD_EXECUTION_BACKLOG.md` | Historical implementation evidence and claim pairs. |
| Local issues | `.scratch/roadmap/issues/` | Agent-sized work slices with acceptance and blocked claims. |

Rule: when two docs disagree, prefer the more specific owner above. Then update stale docs in the same round if the task touched that scope.

## Checkpoint Taxonomy

Use lane-specific checkpoints instead of collapsing every recent entry into one "latest implementation" label:

| Lane checkpoint | What it means | Current owner doc |
| --- | --- | --- |
| Latest overall closeout | Top entry in the detailed history, regardless of lane. | `docs/BUILD_EXECUTION_BACKLOG.md` |
| Latest runtime/port checkpoint | Most recent runtime, parser, controller, trace, or MatchWorld evidence cut. | `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/ROADMAP_EXECUTION_BOARD.md` |
| Latest Studio/UI checkpoint | Most recent visible Studio, runtime UI, browser smoke, or visual QA cut. | `docs/PROGRESS_TRACKER.md`, `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md` |
| Latest generated-asset checkpoint | Most recent source/provenance/atlas/QA/playtest evidence cut. | `docs/GENERATED_ASSET_QA_CONTRACT.md` |
| Latest IKEMEN scanner checkpoint | Most recent scanner-only recognized/unsupported/unknown signal. | `docs/IKEMEN_GO_REFERENCE.md`, `docs/COMPATIBILITY_PROFILES.md` |
| Latest IKEMEN runtime checkpoint | Most recent explicit-profile IKEMEN scheduling, pause, topology, root-participation, or team-runtime evidence cut. | `docs/ROADMAP_EXECUTION_BOARD.md`, `.scratch/roadmap/issues/07-ikemen-runtime-topology.md` |
| Latest modular-boundary checkpoint | Most recent shared-contract or boundary proof. | `docs/MODULE_BOUNDARY_CONTRACT.md` |
| Latest G1 control checkpoint | Most recent AGENTS/setup-project/roadmap/issue-tracker refresh. | `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md` |

When the backlog top entry is Studio/UI or docs-only work, do not overwrite the runtime next slice with that lane. Add or refresh the lane checkpoint summary, state no score movement if applicable, then return to the evidence-producing queue.

## Roadmap Health Check

Run this lightweight check during G1 setup/project-control work:

1. Confirm `AGENTS.md` and `docs/agents/*` still describe the same tracker, labels, and domain layout.
2. Confirm `docs/BUILD_EXECUTION_BACKLOG.md` latest top entry matches the latest checkpoint named in `docs/ROADMAP_EXECUTION_BOARD.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, and `docs/NEXT_BUILD_ROADMAP.md`.
3. Confirm `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md` records the current docs/setup pass.
4. Confirm docs-only work says "no score movement" and does not edit `docs/PORT_COMPLETION_SCORECARD.md` unless evidence changed.
5. Confirm next work points back to R1/R2/S1/A1/I1/M1 evidence-producing cuts, not another docs loop.

This check is project-control evidence only. It never proves runtime compatibility by itself.

## Resume And Checkpoint Protocol

Use this sequence when a new agent, resumed thread, or subtask starts work:

1. Run `git status --short --branch` from the repo root.
2. Read `CONTEXT.md`, `AGENTS.md`, `docs/ROADMAP_NAVIGATION.md`, this file, `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/NEXT_BUILD_ROADMAP.md`, `docs/ROADMAP_RELEASE_TARGETS.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.
3. For status answers, read `docs/PORT_COMPLETION_SCORECARD.md` and `docs/PROGRESS_TRACKER.md`.
4. For implementation slices, read the linked `.scratch/roadmap/issues/<NN>-*.md` issue and update it with evidence, next cut, and blocked claims.
5. For score/support/queue changes, update every owner listed in the update matrix below.
6. For checkpoint requests, commit only after the required closeout gates pass; docs-only/setup work still needs normal build/test gates and must state no score movement.

If the shell starts in `D:\DEV\mugen-sandbox-prototypes`, first enter `mugen-web-sandbox`. The parent `AGENTS.md` is only a routing file; repo rules live in root `AGENTS.md` inside `mugen-web-sandbox`.

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
| IKEMEN scanner-plus | Scanner/reporting lane | More Ikemen-GO source signals map into recognized/unsupported/unknown findings; scanner evidence never implies execution. |
| IKEMEN bounded runtime | 6-8 / 100 full-port horizon | Explicit-profile root/helper RunOrder, Pause/SuperPause, team topology/eligibility/registry/state, and inert P3-P8 ownership have bounded evidence. Next exit is a versioned root-participation read model and then a separate activation contract; tag gameplay remains blocked. |
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
| IKEMEN runtime semantics | `docs/COMPATIBILITY_PROFILES.md`, `docs/SUPPORTED_FEATURES.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, `.scratch/roadmap/issues/07-ikemen-runtime-topology.md` | Focused runtime tests, `pnpm qa:trace`, and visual smoke only when a visible consumer changes |
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

## Historical Current Priority Rule

Default next work remains:

```txt
RuntimeTrace / ControllerOp depth
  -> MatchWorld ownership
  -> KFM/Common1 fixture precision
  -> one explicitly bounded I2 IKEMEN runtime slice only when its source, isolation, and anti-claims are named
  -> Studio Evidence/Build trust
  -> generated asset QA/provenance
  -> IKEMEN scanner expansion
  -> shared module contract
```

I1 scanner and I2 runtime are independent lanes. Scanner findings do not move I2, and a bounded I2 gate does not imply ZSS/Lua, tag/simul gameplay, rollback, netplay, or broad IKEMEN parity. The product target remains MUGEN-lite; after a small I2 risk-reduction cut, return to the first falsifiable MUGEN-lite gate unless the queue explicitly records a different dependency.

Parallel docs are allowed when they reduce drift. Parallel UI is allowed when it binds to real runtime/project/evidence data and passes visual QA.

## Docs-Only Setup Rule

`setup-project`, roadmap routing, issue tracker docs, and AGENTS changes are valid control work, but they are not compatibility evidence. Close them with normal build/test gates, update `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md`, and keep `docs/PORT_COMPLETION_SCORECARD.md` unchanged unless runtime, visual, fixture, scanner, Studio, or package evidence also changed.

Every setup/docs pass must locate the highest numbered `Entry N` or numbered ledger item in `docs/BUILD_EXECUTION_BACKLOG.md`, regardless of whether newer entries were prepended or appended, then compare it with `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/NEXT_BUILD_ROADMAP.md`, `docs/ROADMAP_EXECUTION_BOARD.md`, and the linked roadmap issue. Convenience summaries and physical file position do not override the numeric maximum. If an older "next" gate has already closed, refresh the route before selecting more code.

After any docs-only setup pass, return to `docs/ROADMAP_PACKAGE_MILESTONES.md` and `docs/NEXT_BUILD_ROADMAP.md`, then choose the next evidence-producing package. Entries 349-476 close the earlier inert-root, post-KO, first legal journey, and active-root admission/contact/priority/reversal/depth/HitOverride/guard queues. Preserve open Wayfinder 127, then return to MUGEN-lite evidence generalization and package/palette independence. Do not create a duplicate combat-candidate module; current admission ownership already fills that seam. Decide global AssertSpecial ownership before team KO or Helper/Projectile round widening.
