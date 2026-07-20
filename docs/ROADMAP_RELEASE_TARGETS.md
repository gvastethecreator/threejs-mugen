# Roadmap Release Targets

Last updated: 2026-07-18

This document translates the scorecard and roadmap into release trains. It does not replace `docs/PORT_COMPLETION_SCORECARD.md`; scores still move only when evidence moves. This file answers: what is the next usable milestone, what gates unlock it, and what stays blocked.

## 2026-07-18 T288 bounded release checkpoint

HEAD `a12a2672` and Entry 562 close only the timer-owned FightScreen
intro-skip character-reset boundary. Focused 5-file / 392-test and TypeScript
7 evidence pass; broad release evidence is pending. This does not unlock a
release or score movement. Exact global asset clearing, announcements/display
suppression, dialogue, Common1/ZSS, teams/Turns, rollback/netplay, and full
parity remain release blockers.

## 2026-07-18 Post-Wayfinder-256 Release Override

HEAD `50801d84`, Entry 555, and Wayfinder 256 do not move a release or score.
Studio can make and export local diagnostic/release decisions, and Nova has one
ready asset policy record, but the tracked corpus is not current-HEAD evidence,
the present full-project fixture is release-blocked, Common.Fx lacks browser
proof, and independent character breadth remains insufficient.

Release work must fail closed through source-authority reconciliation,
changed-source evidence, persisted reanalysis, a second character-centered
legal route, one releaseable saved-project fixture, crash/multi-file source
durability, and a second asset record. Full contracts:
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.

## Historical 2026-07-16 Post-Wayfinder-229 Release Override

HEAD `83f85bae`, Entry 555, and Wayfinder 229 do not move a release or score.
The corpus has two required legal passing routes, Studio has productive gate,
receipt, and multi-kind scanner records, and one asset has permission/path
hygiene. Release remains blocked by stale claim/revision binding, aggregate
release semantics, the reserved asset policy, and insufficient independent
character breadth. Diagnostic export may remain available with explicit
blockers; release must fail closed. Full contracts:
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md`.

## Historical 2026-07-16 Post-Wayfinder-209 Release Override

Entry 555 and the later unnumbered Wayfinder 209 checkpoint do not move a
release or score. The next release discriminator is not another projectile
microfeature: restore the evidence baseline, harden snapshot freshness, and
prove a second repository-authored CC0 route. Studio release progress requires
real gate records and explicit diagnostic/release intent; assets require one
path-clean first-party policy decision; scanner requires a productive v1
consumer. Runtime ownership work reduces risk but earns no release claim by
itself. Full contracts:
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.

## Historical 2026-07-15 Post-Entry-554 Release Override

Entry 554 remains the maximum numbered ledger entry. Audited HEAD 05d85137 is
the later report frontier at 633/633 traces after bounded root/helper
RedirectID expansion. Scores remain unchanged. The next release discriminators
are a materialized/fresh corpus snapshot, one independent legal route,
evidence-backed Studio greens, one complete asset release record, and a
production scanner consumer. Redirect dispatch, helper TargetState, atomic
Turns, State 5900, and RoundState are risk-reduction gates, not release or
score claims on their own.

Current contracts:
docs/research/2026-07-15-daily-roadmap-architecture-audit-post-entry-554.md.
Older next-slice menus below are historical when they conflict.

## Historical 2026-07-15 Entry 549 Release Override

Entry 549 is the committed evidence frontier. The MUGEN-lite route, first
corpus, Practical MUGEN 36 adjudication, one legal stage journey, bounded Turns,
StudioSemanticDraft/v0, AssetProvenance/v2, and PackageAnalysis/v0 are closed
at their stated ceilings. The next release discriminators are a materialized
corpus snapshot, evidence-backed Studio readiness, one complete asset release
record, and a production scanner consumer. Runtime breadth continues through a
redirected-target seam, atomic Turns transition, and phase-aware RoundState.
No score moves from this release-plan reconciliation.

## Release Train Summary

| Train | Target | Current basis | Exit gates | Score effect |
| --- | --- | --- | --- | --- |
| R0 Project Control | Agents can resume work without re-asking basic setup questions. | `AGENTS.md`, `docs/agents/*`, `.scratch/roadmap/*`, `docs/ROADMAP_PROGRESS_SYSTEM.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, this file. | Local issue tracker documented, source-of-truth stack clear, ADR recorded. | No compatibility score movement. |
| R1 Playable Sandbox Stability | Private local match remains reliable while port work changes internals. | Native/generated fighters, Rooftop Dojo, HUD/debug/Studio smoke path. | `pnpm qa:smoke` green after visual/runtime changes; no broken default match route. | Can move playable sandbox only with visual/runtime evidence. |
| R2 MUGEN-lite Imported MVP | KFM/Common1-style package can run common authored routes with reports. | DEF/AIR/CMD/CNS/SFF/SND parsers, trace gates, optional KFM fixture routes. | Idle/walk/crouch/jump/attack/guard/get-hit/fall/recovery routes from imported data; unsupported features visible. | Can move practical compatibility and MUGEN MVP scores. |
| R3 Practical Character Corpus | Several local characters/stages load partially without hardcoded patches. | Compatibility profiles, fixture matrix, SFF/stage parser paths. | Multi-fixture trace/report matrix; no fatal crashes; unsupported features categorized. | Can move broad MUGEN subset band. |
| R4 Creator Studio MVP | Studio becomes trust workflow for projects, assets, evidence, and builds. | Workbench, Assets, Evidence, Build, Debug, Character, Stage surfaces. | Shared status contract, persistent evidence/build state, blocked next actions, export proof, visual QA. | Can move Studio score. |
| R5 IKEMEN Scanner Plus | IKEMEN-only content is identified and reported before execution. | Scanner/reporting for ZSS/Lua/config/screenpack/model-stage signals. | More source-backed scanner findings plus tests; runtime remains blocked unless separately gated. | Scanner score only, not IKEMEN runtime. |
| R6 Shared Engine Contract | First reusable engine contracts prove no MUGEN leakage. | Module boundary docs and early shared contracts. | Contract tests/docs prove no CNS/CMD/HitDef/Common1/round/helper/target coupling. | Can move modular-engine score only. |

## Next Usable Milestone

The next milestone is **MUGEN-lite playable MVP**:

```txt
local project opens
  -> native roster stays playable
  -> imported KFM-style fixture can execute common routes
  -> Inspector/Studio show unsupported gaps
  -> trace/report evidence can be exported
```

Required public-facing wording:

- Claim allowed: "partial MUGEN-compatible runtime with fixture-backed routes."
- Claim blocked: "full MUGEN/IKEMEN parity, broad public character compatibility, ZSS/Lua execution, screenpack/lifebar parity, rollback/netplay."

## Milestone Gate Stack

1. **Runtime trace spine**
   - Keep `pnpm qa:trace` green.
   - Prefer typed controller operations and named runtime worlds over loose raw-controller mutation.
   - Update support docs when a controller/trigger changes support level.

2. **KFM/Common1 oracle**
   - Promote one more guard/fall/recovery behavior from synthetic-only to optional official KFM evidence when the private fixture exists.
   - Keep optional fixture gates optional in CI but explicit in claims.

3. **Effect ownership**
   - Continue moving helper/projectile/explod lifecycle, contact, pause, and presentation semantics behind named systems.
   - Do not call visual helper actors "helper VM" until helper-local state execution is proven.

4. **Stage/palette/audio presentation**
   - Add bounded BGCtrl, palette/ACT, FightFX, and SND timing slices only with visible or trace evidence.
   - Keep renderer parity and MUGEN presentation parity separate.

5. **Studio trust chain**
   - Evidence and Build should read one status contract for stale, blocked, unsupported, partial, exportable, and next-action state.
   - Visible Studio changes require `pnpm qa:smoke` plus screenshot/diagnostic inspection.

6. **Corpus growth**
   - Add local/private fixtures under `.scratch/fixtures/` or `.scratch/external/`.
   - Do not commit third-party assets.
   - Record source, license note if known, checksum, parse status, runtime status, and blocked features.

## Work Selection Rules

- If a runtime behavior change can be trace-gated, do that before UI polish.
- If a UI change does not expose real runtime/project/evidence/build data, defer it.
- If a docs change clarifies which code gate comes next, it is valid, but it does not raise scores.
- If two docs disagree, prefer `AGENTS.md` for rules, `docs/PORT_COMPLETION_SCORECARD.md` for scores, `docs/ROADMAP_PACKAGE_MILESTONES.md` for package selection, `docs/ROADMAP_EXECUTION_BOARD.md` for next queue, and this file for release target sequencing.

## Closeout Rules By Train

| Train | Minimum closeout |
| --- | --- |
| R0 docs/control | `pnpm test`, `pnpm typecheck`, `pnpm build`, `git diff --check`; no score movement. |
| R1 visual/playable | Normal gates plus `pnpm qa:smoke` and visual inspection. |
| R2/R3 runtime compatibility | Normal gates plus `pnpm qa:trace`; support docs and issue updated. |
| R4 Studio | Normal gates plus `pnpm qa:smoke`; Evidence/Build state verified. |
| R5 scanner | Focused tests plus normal gates; runtime anti-claims explicit. |
| R6 modular contracts | Boundary tests or docs-only note; no fighting-specific leakage. |

## Historical Next Slice Menu

Use `docs/ROADMAP_PACKAGE_MILESTONES.md` for package selection and `docs/ROADMAP_EXECUTION_BOARD.md` for exact queue status. The safe next slices are:

- R1: exact controller/VM tick-order inside Common1 recovery loop, broader guard/Common1 confirmation, or another bounded controller route that produces a required trace.
- R1 presentation: deeper FightFX/common spark presentation beyond the current first-pass `fight.def`/FightFX AIR/SFF loading, provider handoff, AIR frame timing, axis binding, and fallback geometry.
- R2: one more mutable effect/helper/projectile/explod ownership boundary with focused tests and stable trace behavior.
- S1: shared Build/Evidence status contract with visual QA.
- A1: generated asset provenance plus motion/scale/baseline QA record.
- I1: scanner-only IKEMEN reference expansion with tests.
- M1: one shared contract candidate proven free of fighting-specific terms.
