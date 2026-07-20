# Delivery Roadmap

Last updated: 2026-07-18

## Latest bounded runtime checkpoint - T288 / Entry 562

T288 is implemented in `a12a2672`. The imported FightScreen shutter signal
now resets roots before the active fighter pass: stage position/state `0`,
idle/control state, transient target/hit/guard/command memory, and
owner-scoped effects clear while resources, variables, team state, and
compatibility history persist. Focused evidence is 5 files / 392 tests plus
TypeScript 7; the broad checkpoint is pending. Scores remain unchanged.
Exact global asset clearing, announcements/display suppression, dialogue,
Common1/ZSS, teams/Turns, rollback/netplay, and full parity remain separate
delivery gates.

## Previous bounded runtime checkpoint - T287 / Entry 561

T287 is implemented in `4d615c8f`. Imported `[Round] shutter.time` and
`shutter.col` now feed edge-triggered intro skip, the bounded raw
`roundnotskip` guard, reset-owned `RuntimeRoundShutter/v0`, and a symmetric
Three.js top/bottom shutter. The source-shaped duration is `2T`; held input
does not restart the shutter. Verification passes focused 4 files / 300
tests, TypeScript 7.0.2, full 233 / 2484 tests, Vite 317 modules, 633/633
traces, boundaries, CSS budget, and 64 browser capture paths with 0
console/page errors. The build chunk warning is non-blocking; scores remain
unchanged. Character reset, announcements, exact display skipping,
dialogue, Common1/ZSS, teams/Turns, rollback/netplay, and full parity remain
separate delivery gates.

## Latest bounded runtime checkpoint - T286 / Entry 560

T286 is implemented in `e978fa3c`. Imported `start.waittime` and `ctrl.time`
now feed a reset-owned `RuntimeRoundIntro/v0` countdown and expose the
`pre-intro` -> `intro` -> `fight` phase boundary. The live timer and finish
decision wait for `fight`, while the no-source route remains immediate.
Verification is focused 3 files / 289 tests plus TypeScript 7.0.2, full 233 /
2480 tests, Vite 316 modules, 633/633 traces, boundaries, CSS budget, and
64 browser capture paths with 0 console/page errors. The existing build chunk
warning is non-blocking; scores remain unchanged. Announcement, shutter/skip, character
control/reset, motif, Common1/ZSS, teams/Turns, rollback/netplay, and full
parity remain separate delivery gates.

## Latest bounded runtime checkpoint - T285 / Entry 559

The FightScreen round-start continuation is closed in `c688f04d`. Imported
`fadein.time`, `fadein.col`, `fadein.anim`, and `fadein.snd` now have a typed
loader-to-runtime path, reset-owned `RuntimePreRound/v0` state, bounded
FightFX AIR/SFF presentation, reverse color fallback, and one-shot global
audio. The checkpoint passes 233 test files / 2479 tests, TypeScript 7, build,
633/633 traces, boundary checks, CSS budget, and a 64-path browser smoke with
zero console or page errors. Scores remain unchanged. Exact intro/shutter
ordering, timer/input gating, motif/localcoord ownership, dialogue/skip,
Common1/ZSS, teams/Turns, rollback/netplay, and full parity remain separate
delivery gates.

This document turns the broad MUGEN / IKEMEN-GO / Studio / modular-engine horizon into delivery checkpoints. It is an execution companion to `docs/PORT_COMPLETION_SCORECARD.md`, `docs/ROADMAP_EXECUTION_BOARD.md`, and `.scratch/roadmap/issues/`.

Latest runtime checkpoint: HEAD `b241cc65`, with T266-T268 closed at bounded
scope. The latest grouped checkpoint is 231/231 files, 2435/2435 tests and
633/633 traces. Scores remain unchanged. The next delivery gates are normative
source reconciliation/semantic review, match-level input/config ownership,
Common.Fx browser evidence, atomic round/Turns and global projectile order,
then independent character breadth and current product evidence. Full plan:
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.

Historical checkpoint: audited HEAD `83f85bae`, Entry 555, and Wayfinder 229.
Wayfinders 210-229 close bounded runtime, corpus, Studio evidence, scanner, and
asset-hygiene gates without moving a score. The latest full suite declared is
Wayfinder 221 at 2294/2294; later focused/QA results are not projected to HEAD.
Delivery now prioritizes revision-bound evidence and claim reconciliation,
reserved asset release policy, atomic runtime ownership, character-centered
breadth, reanalysis, and non-vacuous modular proof. See
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md`.

Historical checkpoint: Entry 555 is the maximum numbered backlog entry and
Wayfinder 209 is a later unnumbered closeout at audited HEAD `90ab79b7`.
`qa:trace` remains 633/633; the latest full-suite report is 2262/2263. Scores
do not move. Delivery now prioritizes baseline/source authority, a fresh
snapshot plus second repository-authored CC0 route, atomic Turns/round phases,
and evidence-backed Studio/scanner/asset consumers. See
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.
Earlier current/next selectors are historical where they conflict.

Historical Entry-549 checkpoint: Entry 549 is the committed implementation closeout and its
report declares 610/610 traces. Since Entry 525, the practical score was
adjudicated once to 36, a legal stage journey and bounded BGCtrl behavior were
closed, StudioSemanticDraft/v0, PackageAnalysis/v0, AssetProvenance/v2, root
identity reads, and root-only RedirectID through active TargetPowerAdd landed.
The root State -1 ordering follow-up is resolved at bounded scope by
`730f1a14`; its closeout records the focal gate and claim ceiling. Delivery now
prioritizes a materialized corpus snapshot, target-family dispatch ownership,
atomic Turns/round phases, evidence-backed Studio readiness, one complete asset
release record, a real scanner consumer, and only then a shared Evidence
contract. See `docs/research/2026-07-15-daily-roadmap-architecture-audit-entry-549.md`.

Docs-only edits in this file do not move scores. Scores move only through tests, trace gates, browser visual QA, fixture evidence, or export/build evidence.

## 2026-07-16 T28 asset evidence checkpoint

Generated-asset path and permission hygiene is closed at bounded scope:
Nova Boxer has repository-owned CC0 metadata with stable source/output digests,
Studio and ZIP export consume the record, and 62 public text files are scanned
without path violations. This is diagnostic provenance, not release approval.
Next asset checkpoint is a separate AssetReleasePolicy/v0 contract.

## 2026-07-16 T29 asset release checkpoint

`AssetReleasePolicy/v0` is now implemented as a separate fail-closed decision
over fresh permission, license, digest, ordered transform, QA, collision, and
playtest evidence. Final browser/package proof identifies Nova Boxer as the
only ready record (`1` ready, `9` diagnostic-only), keeps its motion warning
visible, and exports blocked records for diagnosis. Final smoke passes in
398.9s with zero page or console errors. No legal approval, imported-MUGEN
credit, IKEMEN execution, parity, or score movement is claimed.

Next asset checkpoint: revision-bind policy inputs before selecting a shared
EvidenceContract/v0 consumer.

## 2026-07-16 T28 license-expression checkpoint

The asset path now declares `mugen-web-sandbox/spdx-expression-subset/v0`.
Permission metadata and AssetProvenance/v2 share one fail-closed validator;
only single identifiers and `AND`/`OR` chains are accepted. Normative SPDX
forms outside the profile remain blocked. Focused 16/16, TypeScript 7,
asset-hygiene, and final browser/package smoke pass. This is syntax evidence,
not License List matching or legal approval.

## Horizon Targets

| Horizon | Definition of usable | Current score source |
| --- | --- | --- |
| Playable private sandbox | Local match runs with native/generated fighters, original stage, HUD, controls, debug, and stable browser QA. | `docs/PORT_COMPLETION_SCORECARD.md` |
| MUGEN-lite playable MVP | KFM/Common1-style package can load and execute common idle, walk, crouch, jump, attack, guard, hitstun, fall, and recovery routes with unsupported features reported. | `docs/PORT_COMPLETION_SCORECARD.md` |
| Practical MUGEN compatibility | Many character/stage packages load without per-character patches and expose useful compatibility reports. | `docs/PORT_COMPLETION_SCORECARD.md` |
| MUGEN 1.0/1.1 port | Runtime, parser, render, audio, palettes, FightFX, screenpacks, common states, helpers, projectiles, and combat approach broad parity. | `docs/PORT_COMPLETION_SCORECARD.md` |
| IKEMEN-GO-class port | IKEMEN-specific ZSS/Lua/config/screenpack/team/rollback/netplay semantics move from scanner-only into executable systems. | `docs/PORT_COMPLETION_SCORECARD.md` |
| Creator Studio / modular engine | Project workbench edits assets, runtime modules, evidence, builds, exports, and later non-fighting modules through shared contracts. | `docs/PORT_COMPLETION_SCORECARD.md` |

## Delivery Phases

### Phase 0 - Control Plane

Goal: keep agents aligned and prevent false compatibility claims.

Required evidence:

- `AGENTS.md` has repo rules, setup-project profile, skill routing, and verification rules.
- `docs/agents/*` defines local issue tracker, triage labels, and domain-doc routing.
- `.scratch/roadmap/` contains local PRD/issues for work slicing.
- Roadmap docs name claim allowed / claim blocked for every compatibility step.

Exit gate:

- Any new agent can answer "what next?" from `AGENTS.md`, `docs/ROADMAP_NAVIGATION.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.

### Phase 1 - Playable Native Sandbox

Goal: keep a stable playable match while imported compatibility grows.

Required evidence:

- Browser smoke screenshots for desktop/mobile runtime.
- Native/generated fighters remain controllable.
- Stage, HUD, debug, hitboxes, hurtboxes, hit pause, hit stun, life, power, KO/time-over, and reset keep working.
- Generated asset provenance and motion/scale QA remain visible.

Exit gate:

- `pnpm qa:smoke` passes after visual/runtime changes.
- Screenshots show no broken canvas, layout overlap, or missing controls.

### Phase 2 - Imported Character Core

Goal: turn KFM/Common1-style imported content into an evidence-backed playable subset.

Required evidence:

- DEF, AIR, CMD, CNS/ST, SFF, SND paths parse and report errors without crashing.
- SFF sprites render where supported, with fallback compatibility errors where unsupported.
- AIR frames and Clsn1/Clsn2 boxes remain inspectable.
- CMD buffer can activate common directions/buttons and named commands.
- CNS controllers execute through typed operations, not ad hoc side effects.

Exit gate:

- Required trace artifacts prove each route.
- Optional official KFM/local fixtures can strengthen claims without bundling assets.

### Phase 3 - Runtime VM And Common1 Parity

Goal: deepen the fighting runtime toward exact-enough MUGEN semantics.

Required evidence:

- State -1 command routing and common state transitions preserve tick order.
- Guard, hitstun, fall, recovery, get-hit vars, contact counters, and resource changes have trace gates.
- Helper, Explod, Projectile, Target, Pause/SuperPause, ReversalDef, HitOverride, AssertSpecial, and Var controllers move behind named runtime worlds.
- Unsupported triggers/controllers are reported in compatibility output instead of crashing.

Exit gate:

- `pnpm qa:trace` passes with required artifacts and documented checksums.
- Any checksum drift is intentional, documented, and tied to a new claim.

### Phase 4 - Presentation, Audio, Palettes, And Stages

Goal: make imported content look and sound closer to MUGEN while preserving runtime truth.

Required evidence:

- FightFX/common AIR/SFF discovery, provider registration, sprite-axis binding, frame duration, layering, scale, palette, and fallback policy are covered.
- SND playback timing and stop semantics are bounded through audio events.
- Stage DEF/SFF/BGCtrl support grows through matrix entries and visual QA.
- ACT palette and PalFX/RemapPal interactions get parser/runtime/render gates.

Exit gate:

- Browser visual QA proves visible changes.
- `docs/STAGE_COMPATIBILITY_MATRIX.md`, `docs/SUPPORTED_FEATURES.md`, and `docs/QA_AND_ACCEPTANCE_GATES.md` stay synchronized.

### Phase 5 - Studio Trust Chain

Goal: make Studio useful from day one as a workbench, not a decorative shell.

Required evidence:

- Workbench, Assets, Inspector, Debug, Evidence, Modules, and Build read real project/runtime/evidence data.
- Evidence and Build share one status/next-action contract.
- Imported source relink, trace comparison, package export, runtime manifest, and blocked actions are visible.
- Product UI changes pass visual QA.

Exit gate:

- `pnpm qa:smoke` proves Studio surfaces.
- Screenshot inspection confirms no fake green states or unsupported-action ambiguity.

### Phase 6 - IKEMEN Scanner And Bounded Runtime Bridge

Goal: expand IKEMEN knowledge and explicit-profile runtime slices without pretending either proves broad IKEMEN gameplay.

Required evidence:

- Scanner recognizes ZSS, Lua hooks, IKEMEN configs, screenpack/select signals, model-stage signals, and IKEMEN-only controllers/triggers.
- Each finding is classified as recognized, unsupported, or unknown.
- I1 scanner remains separate from I2 runtime.
- Current I2 evidence extends through the post-Entry-554 report frontier at 633/633 compatibility cases on HEAD 05d85137, including the bounded root/helper RedirectID chain described by the linked closeouts.
- The next architecture gates are the versioned redirected-target dispatch contract, helper-destination TargetState, transactional Turns handoff, and broader corpus/package truth. Direct native input/AI, incoming Helper/Projectile ownership, global AssertSpecial/team round behavior, lifebar, resources, and exact Tag overlap remain separate gates.

Exit gate:

- Scanner tests prove recognition.
- Each I2 slice names the pinned source revision, explicit profile, focused tests, required trace when behavior changes, and blocked consumers.
- ZSS/Lua, tag/simul gameplay, rollback, netplay, model/video presentation, and broad parity remain blocked until dedicated evidence exists.

### Phase 7 - Modular Engine Extraction

Goal: extract reusable project/asset/input/tick/render/audio/debug/build contracts after fighting runtime evidence stabilizes.

Required evidence:

- Shared modules do not import CNS, CMD, HitDef, rounds, helpers, targets, or MUGEN command routing.
- Fighting-specific modules depend on shared contracts, not the reverse.
- First non-fighting experiment starts from proven shared seams.

Exit gate:

- Boundary tests or docs prove no fighting leakage.
- Fighting smoke and trace gates remain green.

## Historical Next Evidence Ladder

| Step | Work package | Evidence that moves project |
| --- | --- | --- |
| 1 | I2 current cut | Close Wayfinder 127's fixture-owned landing without generic physics claims. |
| 2 | R1 acceptance envelope | `CompatibilityJourney/v1` links the closed legal package, trace, report, browser, and native-regression artifacts. |
| 3 | G1 milestone adjudication | Decide whether current evidence closes M2 or record the exact independent gate still missing; no implicit score drift. |
| 4 | R1 independent breadth | Second repository-owned legal package or ACT/palette route with different source assumptions and no package patch. |
| 5 | S1 source workflow | Identity/fingerprint/permission/conflict read model, then write-reimport/invalidation/rollback separately. |
| 6 | A1 and I1 parallel | Permission-aware provenance and shared character/stage/system/screenpack VFS analysis, with no imported/runtime claim leakage. |
| 7 | I2 global policy | Decide global AssertSpecial sampling before team KO/Helper/Projectile widening. |
| 8 | I2 team decision | Read-only team defeat/replacement candidates before mutation, lifebar, or resources. |
| 9 | M1 real shared contract | Promote one production Evidence/Build record only after two adapters/consumers prove the seam. |

## Closeout Template

Use this for every meaningful round:

```txt
Changed:
Evidence:
Claim allowed:
Claim blocked:
Docs updated:
Checks:
Next:
```

If the round is docs-only, say "no score movement" explicitly.
