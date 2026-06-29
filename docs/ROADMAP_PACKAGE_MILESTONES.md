# Roadmap Package Milestones

Last updated: 2026-06-29

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

Latest project-control checkpoint:

```txt
G1 setup-project refresh
  -> AGENTS.md and docs/agents/* confirm local markdown issues, canonical labels, single-context docs
  -> roadmap navigation/progress/checklist docs include G1 health checks and decision routing
  -> lane checkpoint taxonomy separates latest overall, runtime, Studio/UI, asset, scanner, modular, and G1 control truth
  -> .scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md remains the setup/project-control ledger
  -> docs-only control work; no runtime, Studio, IKEMEN, modular, or score claim
```

Latest Studio/UI checkpoint:

```txt
S1 Studio CSS module split and shadow prune
  -> legacy/editor/hardening/runtime command-room/desktop authority CSS is split into smaller import-ordered modules after app-shell and before current focused Studio modules
  -> pnpm fix:css now removes exact duplicate rules plus fully shadowed same-selector rules
  -> pnpm qa:css reports 2,608 rules, 0 duplicate selector keys / 0 instances, 0 exact duplicate rules, 173 repeated declaration groups, 143 cross-file overlaps, 0 selectors shared with src/style.css, and 0 fully shadowed legacy style.css rules
  -> requires qa:smoke and visual inspection; product-surface hygiene only, no new Studio workflow or score claim
S1 Studio command chrome label/grid follow-up
  -> compile-project action now reads Build in the compact command rail
  -> desktop utility buttons keep visible truncated labels inside fixed grid tracks instead of becoming icon-only
  -> Workbench Project Health now exposes a text Readiness band beside the numeric score
  -> app shell and remaining legacy Studio cascade moved out of src/style.css into app-shell, studio-legacy-surfaces, studio-editor-cascade, studio-ui-hardening, and studio-desktop-authority modules
  -> qa:css reports 2,622 rules, 83 duplicate selector keys / 184 instances, 0 exact duplicate rules, 198 repeated declaration groups, 79 cross-file overlaps, 0 selectors shared with src/style.css, and 0 fully shadowed legacy style.css rules
  -> visual QA required because this is visible chrome; no new Studio workflow or score claim
S1 Studio command-center CSS overlap prune
  -> command-center desktop overrides for chrome, compact tabs, stage, console, round HUD, and mission-node fragments pruned from legacy src/style.css
  -> src/styles/studio-command-center.css owns Studio chrome, mission strip, viewport framing, HUD, toolbar, and console
  -> mission rows and compact Studio tabs expose textual status instead of color-only dots
  -> dead tab-dot CSS was pruned after the compact navigator switched to tab-state badges
  -> pnpm qa:css reports 2,622 rules, 115 duplicate selector keys / 264 instances, 0 exact duplicate rules, 40 cross-file overlaps, 16 selectors shared with src/style.css, 3 command-center selectors still shared with legacy src/style.css, and 0 legacy style.css rules fully shadowed by later imports
  -> no new Studio workflow or score claim
S1 Studio CSS cascade prune
  -> obsolete legacy Evidence/Release Desk blocks removed from src/style.css
  -> Command Palette, Stage, and Inspector desktop density now live in src/styles/studio-command-palette.css, src/styles/studio-stage.css, and src/styles/studio-inspector.css
  -> fully overridden module-covered rules plus old global Module ledger repair block pruned from legacy style.css
  -> src/styles/studio-system-ledgers.css owns two-line Module rows and 40px system actions
  -> pnpm qa:css reads CSS in src/main.ts import order and reports 2,622 rules, 115 duplicate selector keys / 264 instances, 0 exact duplicate rules, 40 cross-file overlaps, 16 selectors shared with src/style.css, and 0 legacy style.css rules fully shadowed by later imports
  -> pnpm qa:smoke plus screenshot inspection covered Workbench, Modules, Modules contracts, and Runtime with no horizontal overflow or broken module rows
  -> no new Studio workflow or score claim
S1 Studio command inspector readability and smoke stability
  -> dense Studio command surfaces, Build/Evidence route copy, stage toolbar, and replacement rows were tightened
  -> pnpm qa:smoke plus screenshot inspection proved the visible surfaces after that pass
  -> product/UI evidence only; it does not replace the latest runtime checkpoint or change the next runtime slice
```

Latest implementation checkpoint:

```txt
R2 RuntimeSnapshotWorld effect snapshot aggregation
  -> final Explod/Helper/Projectile effect snapshot aggregation moved out of PlayableMatchRuntime
  -> focused RuntimeSnapshotSystem tests cover stable p1/p2 effect ordering and clone isolation
  -> no effect VM semantics, exact tick order, renderer parity, compatibility-session ownership, or score claim
R1 required Common1 fall get-hit entry trace strengthening
  -> synthetic-imported-default-fall-gethit.json checksum 6af73a91 now gates ordered 5000 -> 5030 -> 5050 controller/frame evidence
  -> optional kfm-official-default-fall-gethit.json checksum 813ff55d applies bounded official KFM 5000/5030/5050/5100/5101/5110 controller/typed-operation and actor-frame order when the private fixture exists
  -> no exact fall/bounce/liedown tick order, velocity math, recovery branching, guard-state parity, public bundled KFM, or full fall get-hit parity claim
R1 required Common1 lie-down/get-up recovery trace strengthening
  -> synthetic-imported-default-fall-recovery.json checksum d83797d9 gates ordered 5110 -> 5120 controller/frame evidence
  -> optional kfm-official-default-fall-recovery.json checksum 978b8343 applies bounded official KFM 5110/5120 controller/typed-operation and actor-frame order when the private fixture exists
  -> no exact controller-loop tick order, threshold table, velocity math, recovery-input branching, or full fall recovery parity claim
R1 required Common1 stand get-hit progression trace strengthening
  -> synthetic-imported-default-gethit-progression.json checksum ef2a67f8 gates ordered 5000 ChangeState before 5001 ChangeState
  -> actor-frame evidence now requires imported P2 5000 before 5001, with final idle/control evidence
  -> no exact HitShakeOver/HitOver timing, fall/bounce/liedown/recovery, helper/custom-state breadth, or full Common1 VM claim
R1 required common/FightFX HitSpark asset-frame trace strengthening
  -> synthetic-imported-hitdef-common-spark.json checksum 5ea054d7 gates unprefixed common/default source-frame plus multi-frame AIR metadata for sparkno 7001
  -> synthetic-imported-hitdef-fightfx-spark.json checksum 11537b56 gates F-prefixed FightFX source-frame plus multi-frame AIR metadata for sparkno F7002
  -> required traces now require at least 2 asset frames, frame indices [0, 1], and total authored duration 11 before renderer handoff
  -> required trace evidence only; no exact renderer lookup, visual frame timing, layering, scale, palette, motif/screenpack ownership, or full spark parity claim
R1 optional KFM x HitDef presentation trace strengthening
  -> kfm-official-x-hit-sound.json checksum 9668e88a gates bounded real KFM x hitsound S5,0 telemetry
  -> kfm-official-x-hit-spark.json checksum 9668e88a gates bounded real KFM x sparkno 0 telemetry
  -> optional private fixture evidence only; no public asset, exact SND playback, exact FightFX/common rendering, or score claim
R1 synthetic TargetLifeAdd NoKO trace strengthening
  -> synthetic-imported-target-noko.json checksum 28ac8636 gates ordered P2 AssertSpecial NoKO -> P1 HitDef -> P1 TargetLifeAdd evidence
  -> trace evidence includes target link id 77 and final P2 life 1 after lethal target-controller damage
  -> no exact NoKO lifetime, helpers/root/parent, teams, multi-target lifetime, round flow, exact target timing, or target parity claim
R1 synthetic Target* side-effect trace strengthening
  -> synthetic-imported-target.json checksum f5a16dc9 now gates TargetLifeAdd/TargetPowerAdd/TargetVel*/TargetFacing/TargetBind/BindToTarget/TargetDrop typed ops
  -> trace evidence includes target links, P2 facing/velocity actor-frame telemetry, final P1 targetCount 0, final P2 life 943 and power 40
  -> no full target redirects, helpers/root/parent, teams, multi-target lifetime, exact bind/drop tick-order, or target parity claim
R2 RuntimeSnapshotWorld player actor projection
  -> player actor snapshot projection moved out of PlayableMatchRuntime
  -> focused RuntimeSnapshotSystem tests cover actor metadata, runtime/event cloning, target refs/bindings, active/frame collision boxes, missing-frame fallback hurtbox, and state-owner sprite metadata
  -> pnpm qa:trace stays stable; no target semantics, effect snapshot, compatibility session, renderer, motif/screenpack, or full snapshot parity claim
R2 RuntimeCompatibilityTelemetryWorld ownership extraction
  -> imported compatibility telemetry/session projection moved out of PlayableMatchRuntime
  -> focused RuntimeCompatibilityTelemetrySystem tests cover imported/owner-backed filtering, session projection, controller-event caps, and operation key stability
  -> pnpm qa:trace stays stable; no new controller semantics, CNS VM timing, or parity claim
R2 RuntimeSnapshotWorld ownership extraction
  -> stage/camera snapshot projection moved out of PlayableMatchRuntime
  -> focused RuntimeSnapshotSystem tests cover ScreenBound camera exclusion/fallback and EnvShake/EnvColor handoff
  -> pnpm qa:trace stays stable at 156/156 artifacts; no renderer, screenpack, target semantics, effect snapshot, compatibility session, or camera parity claim
R2 RuntimeAssertSpecialWorld ownership extraction
  -> imported pre-facing AssertSpecial lookup/filter/trigger/application moved out of PlayableMatchRuntime
  -> focused RuntimeAssertSpecialSystem tests cover imported current-state, owner-backed custom-state, trigger filtering, and non-imported skip behavior
  -> trace behavior expected unchanged; no new parity or score claim
R2 RuntimeHitPauseWorld ownership extraction
  -> global hitpause command buffering, ignorehitpause controller dispatch, paused presentation, and countdown moved out of PlayableMatchRuntime
  -> focused RuntimeHitPauseSystem tests cover ordering and no-op behavior outside hitpause
  -> trace behavior expected unchanged; no new parity or score claim
R2 RuntimePausedMatchWorld ownership extraction
  -> regular Pause/SuperPause paused-match ordering moved out of PlayableMatchRuntime
  -> focused PauseSystem tests cover source movetime ordering, frozen actor presentation, pause replacement interruption, and pause countdown ticking
  -> trace behavior expected unchanged; no new parity or score claim
R2 RuntimeStunWorld presentation ownership extraction
  -> hitstun/guardstun advance plus presentation/recovery glue moved out of PlayableMatchRuntime
  -> focused RuntimeStunSystem tests cover guard+hit callback behavior, imported hit-state preservation, current-move guardrails, and state-owner presentation suppression
  -> trace behavior unchanged; no new parity or score claim
R2 RuntimeStateAvailabilityWorld ownership extraction
  -> state/action availability lookup moved out of PlayableMatchRuntime
  -> focused StateAvailabilitySystem tests cover compiled state precedence, parsed states, animation fallback, owner-backed lookup, and missing-state rejection
  -> trace behavior unchanged; no new parity or score claim
R2 RuntimeHitStateTransitionWorld ownership extraction
  -> direct-hit and ReversalDef p1/p2 state transition routing moved out of PlayableMatchRuntime
  -> focused HitStateTransitionSystem tests cover attacker-owned, target-owned, and unavailable-state behavior
  -> trace behavior unchanged; no new parity or score claim
R2 RuntimeGetHitStateWorld ownership extraction
  -> default stand/crouch/air get-hit state selection moved out of PlayableMatchRuntime
  -> focused GetHitStateSystem tests cover 5000, 5010 -> 5000, 5020 -> 5000, and missing-state no-op behavior
  -> trace behavior unchanged; no new parity or score claim
R2 HitSparkAssetSystem ownership extraction
  -> player/common/FightFX spark asset-frame lookup named after package-frame handoff
  -> focused HitSparkAssetSystem tests cover source routing and lookup behavior
  -> renderer behavior unchanged; no new parity or score claim
R2 RuntimeRecoverySystem ownership extraction
  -> fall.recovertime, Common1 liedown recovery, and imported ground-recovery landing moved out of PlayableMatchRuntime
  -> focused RuntimeRecoverySystem tests cover timer/default/transition behavior
  -> behavior unchanged; no new parity or score claim
R2 BindToTarget target-system ownership extraction
  -> target lookup, postype/offset binding, duration, position application, and op reporting moved into RuntimeTargetWorld
  -> focused TargetSystem tests cover raw Head anchors, typed ops, and miss/no-mutation behavior
  -> behavior unchanged; no new parity or score claim
R2 active target-binding position ownership extraction
  -> per-frame TargetBind target-position and BindToTarget owner-position mutation moved into RuntimeTargetWorld
  -> focused TargetSystem tests cover both binding directions and missing-target no-op behavior
  -> behavior unchanged; no new parity or score claim
R2 RuntimeHitEligibilityWorld ownership extraction
  -> HitBy/NotHitBy slot ticking and AssertSpecial/render-opacity frame reset moved out of PlayableMatchRuntime
  -> focused RuntimeHitEligibilitySystem tests cover finite/infinite slots and reset behavior
  -> behavior unchanged; no new parity or score claim
R2 RuntimeOrientationWorld ownership extraction
  -> auto-facing and Turn facing flips moved into OrientationSystem
  -> focused RuntimeOrientationSystem tests cover opponent-facing, NoAutoTurn preservation, and Turn
  -> behavior unchanged; no new parity or score claim
R2 RuntimeGuardWorld ownership extraction
  -> guard-hit state selection and auto guard-start eligibility/mutation moved into GuardSystem
  -> focused GuardSystem tests cover state selection, guard-state rejection, pause/stun/current-move rejection, and start mutation
  -> behavior unchanged; no new parity or score claim
```

Default next implementation slice after docs/setup work:

```txt
R1 Common1/FightFX precision
  -> move one guard/fall/recovery or FightFX/common route beyond current bounded source-frame plus multi-frame AIR evidence
  -> prefer deeper VM loop order, broader fixture-backed confirmation, or exact visible package presentation evidence
```

Alternate next slice: R2 `MatchWorld` ownership around helper lifecycle, target ownership, presentation effects, or combat/effect ordering if it can preserve trace behavior. See `docs/NEXT_BUILD_ROADMAP.md` for the next-10-slices queue.

## Slice Selection Guardrails

Before starting work, check the latest numbered entry in `docs/BUILD_EXECUTION_BACKLOG.md`, this section, and the linked `.scratch/roadmap/issues/` file. Do not rebuild a gate that is already listed as closed.

Current closed gates that must not be reselected as "next":

- `synthetic-imported-hitby-allow.json`
- `synthetic-imported-hitby-reject.json`
- `synthetic-imported-hitdef-hit-sound.json`
- `synthetic-imported-hitdef-common-spark.json`
- `synthetic-imported-hitdef-fightfx-spark.json`
- `synthetic-imported-default-gethit-progression.json` controller/frame order
- `synthetic-imported-target.json` final Target* side-effect evidence
- `synthetic-imported-target-noko.json` TargetLifeAdd defender-side NoKO evidence
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
- `HitSparkAssetSystem` player/common/FightFX spark asset-frame lookup extraction
- `RuntimeRecoverySystem` fall/down-recovery ownership extraction
- `BindToTarget` target-system ownership extraction
- active target-binding position ownership extraction
- `RuntimeHitEligibilityWorld` ownership extraction
- `RuntimeOrientationWorld` ownership extraction
- `RuntimeGuardWorld` ownership extraction
- `RuntimeGetHitStateWorld` ownership extraction
- `RuntimeHitStateTransitionWorld` ownership extraction
- `RuntimeStateAvailabilityWorld` ownership extraction
- `RuntimeStunWorld` ownership extraction
- `RuntimePausedMatchWorld` ownership extraction
- `RuntimeHitPauseWorld` ownership extraction
- `RuntimeAssertSpecialWorld` ownership extraction
- `RuntimeSnapshotWorld` ownership extraction
- `RuntimeSnapshotWorld` player actor projection
- `RuntimeCompatibilityTelemetryWorld` ownership extraction

After docs-only/setup work, return to one of these evidence-producing cuts:

1. R1 Common1 recovery/guard controller-loop precision.
2. R1 FightFX/common presentation proof beyond current package-frame handoff and source-frame plus multi-frame trace metadata.
3. R2 `MatchWorld` ownership around helper/effect/combat ordering with stable or documented trace behavior after AssertSpecial ownership.

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
