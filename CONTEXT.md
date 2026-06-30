# Project Context

`mugen-web-sandbox` is a private/local TypeScript + Three.js project for a progressive MUGEN/IKEMEN-GO browser port. It is also the first module of a future creator studio and modular browser game engine.

This file is the short domain map for agents. Detailed state lives in the docs listed below; do not replace those docs with this summary.

## Current Product Shape

- **Runtime Mode**: playable fight sandbox with local generated/native fighters, stages, input, HUD, hitboxes, hit pause, hit stun, life/power, trace evidence, and partial imported fighter routes.
- **Inspector Mode**: local ZIP/folder loader for MUGEN character/stage resources, parsers, animation preview, collision boxes, compatibility reports, and unsupported-feature diagnostics.
- **Studio Mode**: project workbench for assets, evidence, build/export status, debug state, module status, source provenance, and future authoring tools.

## North Star

Build a Three.js runtime and creator workflow that can expand from:

```txt
private playable MUGEN-like sandbox
  -> fixture-backed MUGEN compatibility layers
  -> IKEMEN-GO scan/report bridge
  -> evidence-first Creator Studio
  -> reusable modular browser game engine
```

Near-term language must stay honest: this is **partial MUGEN compatibility with trace and fixture gates**, plus **IKEMEN scanner/reporting first**. It is not a full MUGEN or IKEMEN-GO port yet.

Current implementation cursor:

- Latest R2 ownership checkpoint: required `synthetic-imported-helper-target.json` checksum `68f95b67` proves helper-local direct `HitDef id = 8877` can remember P2 as helper target, expose `p1-helper-0 -> p2 / 8877` target-link evidence, and branch through `NumTarget(8877)` plus `Target(8877), Life` into `1223/953`. Current trace aggregate is 189/189 artifacts, 169 required and 20 optional. This is explicit-id helper target memory only; default/undefined target ids, helper `Target*` mutation controllers, helper custom-state targets, helper throws, teams/simul, multi-target/helper-owned opponent selection, exact helper hitpause/tick order, exact helper `HitDef` lifetime/multi-hit parity, helper-owned Projectile target ownership, and full helper target/combat parity remain blocked.
- Latest R1 Common1 checkpoint: required `synthetic-imported-default-fall-official-air-recovery.json` checksum `b0363be9` now proves an official-style synthetic `5050 -> 5210 -> 52 -> 0` air-recovery route with positive-to-zero `fall.recovertime` actor-frame sequence, `5210` air-recovery velocity telemetry, landing-state `52` y = 0 evidence, ordered `VelAdd` / `ChangeState` / `VelSet` / `HitFallSet` / `CtrlSet` / typed `kinematic:*` / `hitfall:hitfallset` / `resource:ctrlset` operation evidence, and final idle/control. Current trace aggregate is 187/187 artifacts, 167 required and 20 optional. This is Common1 recovery precision only; exact threshold tables, velocity math, controller-loop timing, public bundled KFM support, and full recovery parity remain blocked.
- Previous R1 Common1 checkpoint: required `synthetic-imported-default-fall-official-ground-recovery.json` checksum `74b72495` proves an official-style synthetic `5050 -> 5200 -> 5201 -> 52 -> 0` ground-recovery route with positive-to-zero `fall.recovertime` actor-frame sequence, recovery/land kinematic operation order, `NotHitBy` safety telemetry, and final idle/control.
- Previous helper/effect checkpoint: required `synthetic-imported-helper-projcontact.json` checksum `07653cee` proves bounded helper-local `ProjContact(8855)` / `ProjContactTime(8855) >= 1` routing after a helper-parented owner-side Projectile is guarded by P2. Previous `synthetic-imported-helper-projguard.json` checksum `3353eda7` remains the helper-local Projectile guard proof, `synthetic-imported-helper-projhit.json` checksum `3892716e` remains the helper-local Projectile hit/contact proof, `synthetic-imported-helper-modifyprojectile.json` checksum `77df008b` remains the helper-local Projectile mutation proof, and previous `synthetic-imported-helper-numproj.json` checksum `4f8612b0` remains the helper-local projectile-count proof against helper-parented Projectiles only.
- Latest asset compatibility checkpoint: `CompatibilityReport.sounds` now summarizes parsed SND archives with declared total, decoded WAV count, unsupported count, format counts, sample-rate counts, and channel counts. Loader reports use the already parsed `soundArchive`; this is inspection/compatibility evidence only, not exact audio playback parity.
- Previous R1 evidence checkpoint: required `synthetic-imported-default-fall-official-recovery-threshold.json` checksum `86804271` and `synthetic-imported-default-fall-official-recovery-too-early.json` checksum `ef945ff5` now promote official-style synthetic Common1 recovery threshold / too-early rejection routes into `pnpm qa:trace`.
- Previous R2 ownership checkpoint: `RuntimeCombatResolutionWorld` owns bounded active direct/projectile contact orchestration from `PlayableMatchRuntime`.
- Useful next runtime work remains another R1 Common1/FightFX precision cut or a deeper R2 helper/effect/combat ownership seam; do not reselect the just-closed helper explicit-id target memory gate, helper-owned HitDef direct-combat gate, official-style air-recovery gate, official-style ground-recovery gate, SND compatibility report summary, official-style recovery threshold/too-early promotion, combat-resolution, target-candidate, expression-context, state-transition, animation-controller, or kinematic-controller cuts.

## Authoritative Docs

Read in this order for broad work:

1. `AGENTS.md` - local working rules, verification rules, and skill setup.
2. `docs/ROADMAP_PROGRESS_SYSTEM.md` - source-of-truth stack, package lifecycle, horizon ladder, update matrix.
3. `docs/ROADMAP_RELEASE_TARGETS.md` - release trains, usable milestone gates, and score-movement rules.
4. `docs/ROADMAP_EXECUTION_BOARD.md` - current queue, package acceptance, and handoff map.
5. `docs/PROGRESS_TRACKER.md` - compact score, evidence snapshot, next cuts.
6. `docs/WORKPLAN.md` - current execution authority.
7. `docs/BUILD_EXECUTION_BACKLOG.md` - append-only implementation history and backlog.
8. `docs/ENGINE_PORT_ARCHITECTURE.md` - parser/compiler/runtime/render/audio/debug boundaries.
9. `docs/CONTROLLER_SUPPORT_REGISTRY.md` - controller support levels and evidence requirements.
10. `docs/SUPPORTED_FEATURES.md` - supported/partial/unsupported feature matrix.
11. `docs/QA_AND_ACCEPTANCE_GATES.md` - closeout gates, trace rules, fixture rules, visual QA rules.

Durable decisions:

- `docs/adr/0001-roadmap-control-and-local-issues.md`

Use roadmap/vision docs when scope decisions are needed:

- `docs/APPROVED_HORIZON_PLAN.md`
- `docs/HORIZON_IMPLEMENTATION_BLUEPRINT.md`
- `docs/MASTER_CONSTRUCTION_PLAN.md`
- `docs/CONSTRUCTION_WAVES.md`
- `docs/PORTING_ROADMAP.md`
- `docs/ENGINE_STUDIO_ROADMAP.md`
- `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`
- `docs/MODULE_BOUNDARY_CONTRACT.md`

Use local tracker docs for current work slicing:

- `.scratch/roadmap/PRD.md`
- `.scratch/roadmap/issues/`

## Domain Vocabulary

- **Compatibility gate**: deterministic trace/test/fixture proof for one bounded behavior.
- **Claim allowed**: exact behavior the current evidence proves.
- **Claim blocked**: parity or edge cases that remain unsupported or unproven.
- **Imported fighter**: fighter loaded from MUGEN-like package files.
- **Native/generated fighter**: project-owned atlas-backed fighter created for this sandbox.
- **MatchWorld**: renderer-independent ownership/evidence boundary for actors, effects, lifecycle, targets, and snapshots.
- **ControllerOp**: typed runtime operation lowered from CNS/controller data.
- **RuntimeTrace**: deterministic evidence artifact for runtime behavior gates.
- **Fixture gate**: optional or required character/stage package evidence, usually local-only and not redistributed.

## Hard Rules

- No commercial or third-party character assets in repo.
- Do not hardcode one character, stage, or fixture path into runtime behavior.
- Do not count generated/native fighters as imported MUGEN compatibility.
- Do not claim full parity from parser counts or partial runtime gates.
- Every unsupported parser/runtime/render/audio feature must be visible in reports or docs.
- Frontend/render changes require visual QA before closeout.
- Runtime compatibility changes require trace evidence or focused tests plus docs.

## Current Build Priority

```txt
RuntimeTrace and ControllerOp coverage
  -> MatchWorld ownership
  -> KFM/Common1 fixture precision
  -> Studio Evidence/Build trust workflow
  -> generated asset authoring and QA
  -> IKEMEN profile scanner
  -> shared engine contracts
  -> first non-fighting module slice
```

When choosing next work, prefer the smallest cut that improves evidence, runtime correctness, or Studio trust without inflating compatibility claims.
