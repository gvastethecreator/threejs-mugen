# Roadmap Execution Board

Last updated: 2026-06-29

This is the short operating board for choosing the next slice without re-reading every roadmap file. It does not replace `docs/ROADMAP_PROGRESS_SYSTEM.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/ROADMAP_RELEASE_TARGETS.md`, `docs/WORKPLAN.md`, `docs/PORT_COMPLETION_SCORECARD.md`, or `docs/BUILD_EXECUTION_BACKLOG.md`; it points at the exact next packages and the docs that must change when progress moves.

Use `docs/ROADMAP_CONTINUITY_GUIDE.md` when turning this board into a next implementation cut or when resuming after a long pause. Use `docs/NEXT_BUILD_ROADMAP.md` for the tactical next-10-slices order.

## Read Order

Use this order before starting broad work:

1. `CONTEXT.md`
2. `AGENTS.md`
3. `docs/ROADMAP_PROGRESS_SYSTEM.md`
4. `docs/ROADMAP_PACKAGE_MILESTONES.md`
5. `docs/NEXT_BUILD_ROADMAP.md`
6. `docs/ROADMAP_RELEASE_TARGETS.md`
7. `docs/ROADMAP_EXECUTION_BOARD.md`
8. `docs/ROADMAP_CONTINUITY_GUIDE.md`
9. `docs/PROGRESS_TRACKER.md`
10. `docs/WORKPLAN.md`
11. Relevant `.scratch/roadmap/issues/<NN>-*.md`

Use `docs/PORT_COMPLETION_SCORECARD.md` when answering "how far are we?" or changing scores.

## Release Target Now

Current release target: **MUGEN-lite playable MVP**.

This means the default native/generated match stays playable while an imported KFM/Common1-style package gains more fixture-backed routes. The next score-moving work must produce runtime trace, focused test, visual QA, fixture, or build/export evidence. This docs/setup pass improves R0 project control only and does not move scores.

Latest project-control checkpoint: setup-project/G1 refresh confirms `AGENTS.md`, `docs/agents/*`, local markdown issues, canonical triage labels, single-context domain docs, roadmap decision routing, and docs-only no-score rules are aligned. This is control evidence only; next implementation work should return to R1 Common1/FightFX precision or R2 MatchWorld ownership.

Latest implementation checkpoint: required `synthetic-imported-default-fall-gethit.json` checksum `6af73a91` now gates bounded Common1-style fall get-hit entry order with ordered P2 actor-frame evidence (`5000 -> 5030 -> 5050`, all `moveType = H`) and controller/typed-operation evidence through `5000` `ChangeState`, `5030` `VelAdd` / `HitVelSet` / `kinematic:hitvelset` / `ChangeState`, and `5050` `VelAdd` / `ChangeState`. Optional private-fixture `kfm-official-default-fall-gethit.json` checksum `813ff55d` now requires matching bounded official KFM order through `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110`, including `HitVelSet`, `kinematic:hitvelset`, ground-impact `VelSet` / `kinematic:velset`, bounce `HitFallVel` / `hitfall:hitfallvel`, and lie-down `HitFallDamage` / `hitfall:hitfalldamage` evidence when `.scratch/fixtures/kfm-official.zip` exists. Previous required `synthetic-imported-default-fall-recovery.json` checksum `d83797d9` still gates bounded Common1-style lie-down/get-up recovery order with ordered P2 actor-frame evidence (`5110` with `moveType = H` before `5120` with `moveType = I`) and controller/typed-operation evidence through `5110` `ChangeState` before `5120` `VelSet` / `kinematic:velset` / `HitFallSet` / `hitfall:hitfallset` / `ChangeState`. Required presentation gates `synthetic-imported-hitdef-common-spark.json` checksum `5ea054d7`, `synthetic-imported-hitdef-fightfx-spark.json` checksum `11537b56`, `synthetic-imported-hitdef-common-guard-spark.json` checksum `7650a09c`, `synthetic-imported-hitdef-fightfx-guard-spark.json` checksum `32f3e92d`, and `synthetic-imported-hitdef-guard-effect-package.json` checksum `1c3167b7` gate bounded common/default and FightFX hit/guard `HitSpark` source-frame plus multi-frame AIR metadata, including one combined `guardsound = S6,0` plus FightFX `guard.sparkno = F7004` route on the same guarded contact, before renderer/audio handoff. `RuntimeHitPauseWorld` is the latest R2 ownership checkpoint for the concrete hitpause runtime bridge: `advanceRuntime(...)` now routes command buffering and paused presentation through one named hitpause boundary while focused tests prove current tick/input buffering with `hitPause: true` and `RuntimeEffectLifecycleWorld` paused presentation. `RuntimePausedMatchWorld` remains the latest regular Pause/SuperPause source-movetime bridge checkpoint, and `RuntimeMatchInteractionWorld` remains the latest normal-loop interaction bridge checkpoint; current `pnpm qa:trace` passes 164/164 artifacts, 144 required and 20 optional. `RuntimeSnapshotWorld` remains the latest R2 snapshot checkpoint for bounded stage/camera, player actor, and final effect snapshot projection previously inline in `PlayableMatchRuntime`: camera/stage data, actor identity/source/sprite-owner metadata, cloned runtime state, target refs/bindings, collision boxes, event histories, and cloned p1/p2 Explod/Helper/Projectile snapshots in stable order. `RuntimeResourceSystem`, `RuntimeCompatibilityTelemetryWorld`, `RuntimeAssertSpecialWorld`, `RuntimeStunWorld`, `RuntimeStateAvailabilityWorld`, `RuntimeHitStateTransitionWorld`, `RuntimeGetHitStateWorld`, `RuntimeGuardWorld`, `RuntimeOrientationWorld`, `RuntimeHitEligibilityWorld`, `RuntimeTargetWorld`, `RuntimeRecoverySystem`, `HitSparkAssetSystem`, and `RuntimeRandomSystem` remain previous ownership checkpoints. This is R1/R2 evidence for bounded Common1/FightFX routes and current ownership cleanup; it is not public bundled KFM support, exact Common1 tick-order parity, exact effect VM semantics, exact same-tick audio/spark ordering, exact renderer parity, motif/screenpack camera rules, compatibility session ownership, target/team/helper parity, exact presentation parity, exact MUGEN random stream, or VM parity.

Latest R2 ownership addendum: `RuntimeHitPauseWorld.advanceRuntime(...)` now owns the concrete runtime-system bridge for current global hitpause command buffering and paused presentation. Focused `RuntimeHitPauseSystem` coverage proves runtime command buffers receive current tick/input with `hitPause: true`, and paused presentation routes through `RuntimeEffectLifecycleWorld` with pause kind `hitpause`. This is architecture debt reduction only; it does not add new hitpause semantics, helper-owned hitpause execution, broad side-effect ordering during hitpause, exact first-frame decrement order, exact MUGEN/IKEMEN hitpause parity, or score movement.

Previous R2 ownership addendum: `RuntimePausedMatchWorld.advanceRuntime(...)` now owns the concrete runtime-system bridge for current source-movetime pause side effects: target-memory aging, active-effect advance, presentation-effect advance, active target binding, stage clamp, and frozen-actor paused presentation. Focused `PauseSystem` coverage proves actor-local `targetWorld`, `effectLifecycleWorld`, and `RuntimeActorConstraintWorld` wiring while preserving the existing bounded source-movetime order, and `pnpm qa:trace` stays stable at the current 163/163 artifacts. This is architecture debt reduction only; it does not add new pause semantics, helper VM execution during pause, exact MUGEN/IKEMEN pause layering, exact paused effect tick order, parent/root/team redirects, or score movement.

Previous R2 ownership addendum: `RuntimeMatchInteractionWorld.advanceRuntime(...)` now owns the concrete runtime-system bridge for current normal-loop post-fighter interaction side effects: target-memory aging, active-effect advance, projectile clash, body separation, active target binding, stage clamp, and presentation-effect advance. Focused `MatchInteractionSystem` coverage proves actor-local `targetWorld`, `effectLifecycleWorld`, `effectActorWorld.resolveProjectileClashes(...)`, and `RuntimeActorConstraintWorld` wiring while preserving the existing bounded order. This is architecture debt reduction only; it does not add helper VM execution, new target/projectile/effect semantics, exact post-fighter tick-order parity, parent/root/team redirects, or score movement.

Previous R2 ownership addendum: `RuntimeResourceSystem` now owns shared authored life/power max resolution, runtime power-delta clamping, bounded life deltas, and control-flag writes used by `PlayableMatchRuntime`, `RuntimeDirectCombatWorld`, `RuntimeProjectileCombatWorld`, `RuntimeReversalWorld`, and `RuntimeTargetWorld`, replacing duplicate local resource-max helpers and inline power/control/life mutation paths for the current bounded routes. Focused resource, direct-combat, projectile-combat, target-system, reversal, and playable-runtime tests prove existing bounded semantics stay intact. This is architecture debt reduction only; it does not add new controller semantics, exact CNS resource timing, helper/team/redirect resource ownership, target parity, projectile parity, or score movement.

Previous R2 ownership addendum: `RuntimeEffectActorWorld.countActors(...)` owns the unified bounded effect-count query consumed by `PlayableMatchRuntime` for `NumExplod`, `NumHelper`, and `NumProj`/`NumProjID` trigger callbacks. Focused `EffectActorSystem` coverage proves Explod/Helper/Projectile counts, id filters, and removed-projectile exclusion through one world query. This is architecture debt reduction only; it does not add helper VM execution, exact projectile lifetime parity, parent/root/team scopes, or broader effect semantics.

Latest Studio/UI checkpoint: the Studio CSS cascade now uses a single Studio CSS entrypoint: `src/main.ts` imports `src/style.css` for base/reset and `src/styles/studio.css` for the ordered Studio/app module graph. `src/styles/studio.css` preserves the existing order through category entrypoints and subfolders for base, legacy, editor, runtime, desktop, shell, command, and workflow modules; the legacy split files now balance independently instead of relying on braces crossing file boundaries. Active command shell ownership is split across `src/styles/command/studio-command-shell.css`, `src/styles/command/studio-command-pipeline.css`, `src/styles/command/studio-command-playfield.css`, and `src/styles/command/studio-command-console.css`; reusable Studio drawer shell ownership lives in `src/styles/surfaces/studio-ledger-drawers.css`, and Assets ledger row ownership lives in `src/styles/workflows/studio-assets-ledger.css`. Current `pnpm qa:css` reports 2,661 scanned rules, 0 duplicate selector keys / 0 instances, 0 exact duplicate rules, 173 repeated declaration groups, 125 cross-file duplicate selectors, 0 selectors shared with `src/style.css`, 0 legacy `style.css` rules fully shadowed by later imports, and 0 cross-file rules fully shadowed by later imports; `pnpm qa:css:detail` prints overlap and repeated-declaration targets, and `pnpm qa:css:budget` freezes these current debt ceilings for CSS cleanup/review rounds. Workbench/command ledgers and Assets tablet/compact desktop rows have fresh density passes with smoke/manual visual evidence. Broader token consolidation, dense typography cleanup, shared chrome/status primitives, and remaining Studio cross-file selector reduction remain open. This is Studio/product-surface hygiene only; it does not replace the runtime next slice, prove new Studio workflows, or move port scores.

Latest Studio/UI addendum: Studio Build and Evidence now share one Trust Chain contract sourced from Build Readiness data for runtime manifest, QA evidence, project package, asset validation, source packages, compatibility gates, and architecture boundaries. The rows expose lane, state, proof, evidence, impact, blockers, and one primary next action, and `pnpm qa:smoke` now asserts the shared row ids and next-action binding on both surfaces. This is S1 product workflow evidence only; it does not change runtime compatibility or port scores.

Latest Studio/UI readability addendum: the desktop command palette and bottom console now use larger readable rows, aligned meta/source columns, severity cells, hard neutral surfaces, visible scrollbars, and focus-visible treatment in `src/styles/command/studio-command-palette.css`, `src/styles/command/studio-command-console.css`, and `src/styles/desktop/studio-desktop-command-polish.css`. `pnpm qa:smoke` confirms command-palette keyboard/focus behavior and captured Workbench/Build/Evidence/command screenshots were visually inspected. This is product-surface polish only; it does not add editing/export/runtime compatibility behavior or score movement.

Latest CSS cleanup addendum: `pnpm qa:css:budget` now guards the current CSS debt ceilings: 2,661 rules, 173 repeated declaration groups, 125 cross-file overlaps, 0 exact duplicate rules, 0 same-file duplicate selector keys, 0 `src/style.css` overlaps, and 0 fully shadowed cross-file rules. Repeated Assets right-pane collapsible panels already route through one `renderStudioLedgerDrawer(...)` helper and shared `studio-ledger-drawer` / `studio-ledger-drawer-body` classes while preserving existing `asset-side-panel` and `asset-inspector-drawer` hooks; legacy Studio truncation labels now share one grouped CSS atom, and a redundant `.pane-right` shadow override has been removed. This answers structural CSS/markup duplication plus budget control only; reducing the broader repeated declaration groups and overlaps still needs shared primitive extraction.

## Operating Snapshot

| Priority | Workstream | Next shippable proof | Evidence gate | Score effect |
| --- | --- | --- | --- | --- |
| P0 | Project control | Keep setup-project, local issues, AGENTS, and roadmap routing synchronized. | `pnpm test`, `pnpm typecheck`, `pnpm build` for docs-only closeout. | No score movement. |
| P1 | R1 runtime compatibility | One bounded Common1/controller/trigger behavior with trace or focused test. | `pnpm qa:trace` plus normal gates when runtime semantics change. | Possible MUGEN-lite movement only if scorecard evidence threshold is met. |
| P1 | R2 MatchWorld ownership | One mutable runtime behavior moved behind named world/system boundary. | Focused system tests; trace stable or intentionally documented. | Usually architecture debt reduction, not score movement by itself. |
| P2 | S1 Studio trust chain | Evidence and Build consume one shared status/next-action contract. | `pnpm qa:smoke` plus visual inspection. | Possible Studio movement only with real bound evidence data. |
| P2 | A1 generated assets | One provenance record links prompt/source/atlas/QA/collision/playtest. | Asset QA proof; visual QA if visible. | Generated/native confidence only, never imported MUGEN compatibility. |
| P3 | I1 IKEMEN scanner | One new recognized/unsupported/unknown IKEMEN signal. | Focused scanner tests and blocked runtime wording. | Scanner-only movement, no IKEMEN execution claim. |
| P3 | M1 modular boundary | One shared contract proven free of fighting-specific leakage. | `pnpm check:boundaries` or equivalent contract test. | Modular readiness only. |

## Current Position

| Track | Current status | Next package | Blocked claim |
| --- | --- | --- | --- |
| Playable sandbox | Playable native/generated match with Three.js, HUD, stage, debug, smoke evidence. | Keep stable while compatibility and Studio move. | Does not prove imported MUGEN parity. |
| MUGEN runtime | Partial imported runtime with many typed controller/trigger trace gates. | KFM/Common1 recovery, guard, tick-order, and MatchWorld ownership cuts. | Full CNS VM, helpers, custom states, teams, screenpacks. |
| IKEMEN | Scanner/reporting only for ZSS/Lua/config/screenpack/model-stage signals. | Expand scanner references and unsupported reporting. | No ZSS/Lua execution, rollback, netplay, IKEMEN runtime semantics. |
| Studio | Workbench, Assets, Evidence, Build, Debug, Character/Stage surfaces exist. | Make Build/Evidence the single trust chain for next actions and stale/blocking state. | Full editor, asset DB, production export. |
| Generated assets | Native/generated fighters and stages are playable evidence for authoring pipeline. | Provenance plus motion/scale/baseline QA ingestion. | Imported compatibility credit. |
| Modular engine | Boundary docs exist, platformer slice intentionally delayed. | Extract only contracts proven by fighting runtime and Studio evidence. | Production multi-genre engine. |

See `docs/ROADMAP_RELEASE_TARGETS.md` for the release-train ladder and score-movement rules.

## Next Concrete Gates

These are ordered candidates, not new score claims:

1. R1: move one Common1 recovery/guard tick-order slice from summarized evidence toward exact controller-loop ordering.
2. R1: promote one more optional official KFM guard/fall/recovery route into a stricter local oracle when the private fixture exists.
3. R1 presentation: deepen FightFX/common spark presentation beyond first-pass package `fight.def`/AIR/SFF loading, decoded system-SFF provider registration, bounded AIR-duration frame advance, bounded AIR/SFF axis binding, and required source-frame plus multi-frame trace metadata: exact render lookup, layering, scale, palette, timing, and motif/screenpack ownership remain open.
4. R2: deepen one `MatchWorld` ownership boundary around target links, effect ordering, helper lifecycle, or presentation effects without behavior drift.
5. R2: add trace evidence for effect/combat ordering if ownership changes can affect checksums.
6. S1: make Studio Evidence and Build read one shared status/next-action contract.
7. S1: add visual QA for any Studio workflow reshaping, using real evidence rows and blocked actions.
8. A1: store generated asset prompt/source/atlas/contact-sheet/QA/collision/playtest provenance as one record.
9. A1: surface motion/scale/baseline QA failures so bad sprites trigger regeneration, not cropping.
10. I1: expand scanner-only Ikemen-GO references from source/docs into recognized/unsupported/unknown findings with tests.
11. M1: prove one shared project/asset/input/snapshot/debug/build contract has no fighting-specific leakage.
12. R3 later: add another private fixture corpus package only as local evidence; no bundled third-party assets.

## Active Implementation Queue

### R1 - KFM/Common1 Recovery Precision

Issue: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

Build next:

- Current proof: required `synthetic-imported-default-fall-recovery-threshold.json` checksum `7bb15a5f` observes imported defender actor-frame `5050` with positive `hitFall.recoverTime`, then `5210` with `recoverTime = 0` after `CanRecover` plus `command = "recovery"` routes.
- Current proof: required `synthetic-imported-common-gethit.json` checksum `713e49b7` now gates bounded P2 FallEnvShake runtime event telemetry for state `5100` plus ordered custom get-hit controller/typed-operation evidence through `HitFallVel -> HitFallDamage -> HitFallSet -> FallEnvShake`.
- Current proof: required `synthetic-imported-default-fall-recovery-tick-order.json` checksum `e2691aab` gates summarized actor-frame order where `5050` with positive recover time appears before `5210` recovery evidence, and now also gates a bounded named controller/operation sequence from `5050` `VelAdd` `Gravity` before recovery `ChangeState` into `5210` `VelSet` / `kinematic:velset` / `HitFallSet` / `hitfall:hitfallset` / `ChangeState`.
- Current proof: required `synthetic-imported-default-fall-air-recovery-velocity.json` checksum `560f6308` gates bounded air-recovery velocity telemetry in `5210` after `CanRecover` plus `command = "recovery"`.
- Current proof: required `synthetic-imported-default-fall-ground-recovery.json` checksum `7945fd93` gates bounded near-ground selection through `5050 -> 5200 -> 5201 -> 52 -> 0`, with `SelfState`, `VelSet`, `PosSet`, actor-frame velocity telemetry for synthetic ground-recovery constants, and ordered named controller/typed-operation evidence from `5050` gravity/recovery input through `5200` self-land, `5201` safety/land, and `52` control restore.
- Current proof: required `synthetic-imported-default-gethit-progression.json` checksum `ef2a67f8` gates bounded stand get-hit progression with ordered `5000` `ChangeState` before `5001` `ChangeState`, actor-frame `5000 -> 5001`, and final idle/control evidence.
- Current visual-effect proof: required `synthetic-imported-modifyexplod.json` checksum `bca75991` gates bounded typed `ModifyExplod` operation evidence and live owner-side visual Explod mutation for static velocity, acceleration, scale, remove time, sprite priority, remove-on-get-hit, and pause-budget telemetry through `RuntimeEffectSpawnWorld` / `RuntimeEffectActorWorld`. Dynamic params, position rebinding, helper-owned Explods, FightFX/common routing, remove-trigger parity, exact tick order, and full Explod lifecycle parity remain blocked.
- Current trigger proof: focused compiler/evaluator/runtime-controller tests cover bounded `HitPauseTime` expression support against the current actor hitpause counter, and required `synthetic-imported-hitpausetime-ignorehitpause.json` checksum `a3a78bb8` proves an imported active-state `ChangeState` with `ignorehitpause = 1` can branch on `HitPauseTime > 0` into state `220` during global hitpause while P1 records `HitPause:player` advance and P2 records player freeze. Persistent controller semantics, helper-owned controller execution, broad side-effect ordering, and exact hitpause tick-order parity remain blocked.
- Current hit-eligibility proof: required `synthetic-imported-hitby-allow.json` checksum `c75d5c7d` gates bounded `HitBy value = S,NA` allow-list acceptance through typed `eligibility:hitby`, accepted direct-hit contact, and final P2 life `963`; required `synthetic-imported-hitby-reject.json` checksum `65185fd1` gates bounded `HitBy value = S,NT` mismatch rejection against `HitDef attr = S,NA` through typed `eligibility:hitby`, reject telemetry, and final P2 life `1000`; required `synthetic-imported-reject.json` checksum `5aca7dc0` gates the matching `NotHitBy` deny-list reject route through typed `eligibility:nothitby`. Exact attr grammar, slot priority, edge timing, helper/custom-state ownership, and full hit-eligibility parity remain blocked.
- Current custom-state ownership proof: required `synthetic-imported-target-owned-custom-state.json` checksum `410fb8c0` gates bounded `HitDef p2stateno = 888` with `p2getp1state = 0`, P2-owned state/action `888` frame evidence without attacker `customOwnerId`, P2 `SelfState`, and final state `0`/control. This complements owner-backed `synthetic-imported-custom-state.json` checksum `bf632df3` without claiming throws, helpers/root/parent redirects, teams, exact bind/tick order, or full MUGEN/IKEMEN custom-state parity.
- Current guard proof: required `synthetic-imported-default-guard-state.json` checksum `016938a1`, `synthetic-imported-crouch-guard-state.json` checksum `6c4321af`, `synthetic-imported-diagonal-crouch-guard-state.json` checksum `1dd33fb5`, and `synthetic-imported-air-guard-state.json` checksum `ce9cc9ba` gate bounded stand/crouch/atomic-`DB`/air guard-hit controller/operation routes through `ChangeAnim`, `ChangeState`, `HitVelSet`, `kinematic:hitvelset`, `CtrlSet`, `resource:ctrlset`, and final `ChangeState`, plus actor-frame state/physics/body/push telemetry; stand and air also gate bounded velocity evidence, and air gates `VelAdd` gravity evidence.
- Current auto guard proof: required `synthetic-imported-auto-guard-start.json` checksum `0c734290` now gates P2 state `120` `ChangeState` `Guard Start Done` plus ordered actor-frame evidence for `120` before `130`, and required `synthetic-imported-auto-guard-end.json` checksum `d1dc0aa3` gates P2 `120` `Guard Start Done` before state `130` `ChangeState` `Stop Guarding`, actor-frame `120 -> 130 -> 140`, plus final idle/control evidence. This is minimum bounded guard-start/end controller/state-order evidence, not exact proximity guard, guard-end timing, full Common1 controller-loop parity, or full guard VM parity.
- Current AssertSpecial/Target proof: required `synthetic-imported-target-noko.json` checksum `28ac8636` gates bounded P2 state `0` `Passive AssertSpecial` before P1 state `200` `HitDef` and lethal `TargetLifeAdd`, with target-link evidence and final P2 life `1`; previous `synthetic-imported-assertspecial-noko.json` checksum `9dd76f9b` still gates direct lethal `HitDef` no-KO. This is minimum NoKO flag-before-hit/target-damage evidence only, not exact round/no-KO or target parity.
- Current AssertSpecial guard-deny proof: required `synthetic-imported-assertspecial-guarddeny.json` checksum `f636748d`, `synthetic-imported-assertspecial-crouch-guarddeny.json` checksum `e47a0cb1`, and `synthetic-imported-assertspecial-air-guarddeny.json` checksum `62179385` now gate defender-side `AssertSpecial` before attacker-side guardable `HitDef` for stand/crouch/air denial routes; this is minimum flag-before-hit evidence only, not exact guard-rule parity.
- Current HitDef-effect proof: required `synthetic-imported-hitdef-hit-sound.json` checksum `6fc00d8a` gates bounded `HitDef hitsound = S5,0` into attacker-side `PlaySnd` telemetry, required `synthetic-imported-hitdef-guard-sound.json` checksum `fdf1f7f6` gates bounded `HitDef guardsound = S6,0` into attacker-side `PlaySnd` telemetry, required `synthetic-imported-hitdef-hit-spark.json` checksum `b6554124` gates bounded `sparkno = S7001` plus `sparkxy = 10,-72` into attacker-side hit `HitSpark` telemetry, required `synthetic-imported-hitdef-guard-spark.json` checksum `72c8fa3a` gates bounded `guard.sparkno = S7000` plus `sparkxy = 12,-64` into attacker-side guard `HitSpark` telemetry after imported direct-hit routes, required `synthetic-imported-hitdef-common-spark.json` checksum `5ea054d7` gates unprefixed common/default hit source-frame plus multi-frame AIR metadata, required `synthetic-imported-hitdef-fightfx-spark.json` checksum `11537b56` gates `F`-prefixed FightFX hit source-frame plus multi-frame AIR metadata, required `synthetic-imported-hitdef-common-guard-spark.json` checksum `7650a09c` gates unprefixed common/default guard source-frame plus multi-frame AIR metadata, required `synthetic-imported-hitdef-fightfx-guard-spark.json` checksum `32f3e92d` gates `F`-prefixed FightFX guard source-frame plus multi-frame AIR metadata, and required `synthetic-imported-hitdef-guard-effect-package.json` checksum `1c3167b7` gates one guarded direct contact that emits both bounded `guardsound = S6,0` telemetry and FightFX `guard.sparkno = F7004` multi-frame metadata. `HitSparkRenderer` now treats `S` refs as player AIR action ids, resolves local player AIR frames into sprite textures when available, classifies unprefixed refs as common/default and `F` refs as FightFX, preserves runtime-provided package frames from `hitSparkLibraries`, synthesizes bounded common/FightFX system lookup frames through the global sprite namespace when no package frame exists, draws bounded fallback geometry when AIR/sprite lookup fails, and `pnpm qa:smoke` warms the renderer, resets the round, drives native contact, and checks active desktop/mobile sparks plus player-source resolved-sprite diagnostics. `MugenCharacterLoader` now discovers optional `data/fight.def`, resolves `fightfx.air` / `fightfx.sff`, parses those AIR actions as both `common` and `fightfx` hit-spark libraries, decodes the system SFF when possible, `createImportedFighterDefinition` carries those package-backed libraries into the runtime fighter definition, `App` registers decoded system SFF sprites through a global hit-spark provider route, focused renderer coverage proves package-backed `common`/`fightfx` frames resolve through that global provider route without player-owner context, package-backed frame lists advance by AIR frame duration, resolved spark sprite meshes bind around the `sparkxy` anchor using AIR frame offsets plus SFF axes with facing applied, and QA diagnostics expose selected frame/sprite-axis/local-position metadata for inspection. This is first-pass package asset discovery/handoff/provider/lookup/timed-frame/axis-binding/source-frame plus multi-frame trace evidence, not exact same-tick sound/spark ordering, SND playback, channel/timing/mixing, render lookup, layering, scale, palette, motif ownership, guard-effect parity, or full system-effect parity.
- Current optional fixture guard proof: `kfm-official-default-guard-state.json` checksum `885bb1da`, `kfm-official-default-crouch-guard-state.json` checksum `d11153d0`, and `kfm-official-default-air-guard-state.json` checksum `f4378971` now require ordered controller/typed-operation evidence plus actor-frame state/physics/body telemetry for real KFM/Common1 stand `150 -> 151`, crouch `152 -> 153`, and air `154 -> 155 -> 52` guard-hit routes when the private fixture exists; air also requires bounded velocity/landing frame telemetry. `kfm-official-auto-guard-start.json` checksum `ad493cde` and `kfm-official-auto-guard-end.json` checksum `ee962d04` now also require ordered real KFM auto guard-start/end evidence through `120 -> 130 -> 140 -> 0`, including `StateTypeSet`/`metadata:statetypeset` and return-to-idle `VelSet` evidence.
- Current optional fixture proof: `kfm-official-default-fall-recovery-threshold.json` checksum `891d0f6d` confirms real KFM/Common1 reaches state `5050` while `hitFall.recoverTime` is still positive, then accepts recovery into the ground branch `5200 -> 5201 -> 52 -> 0` when the private fixture is present; the gate now also requires ordered actor-frame evidence where the positive `5050` observation precedes `5200` with `recoverTime = 0`. `kfm-official-default-fall-ground-recovery.json` checksum `dd48f0b8` now also requires bounded official KFM controller/typed-operation order through `5050` `VelAdd`/`ChangeState`, `5200` `VelAdd`/`SelfState`, and `52` landing `VelSet`/`PosSet`/`kinematic:*`/`ChangeState` evidence.
- Build next recovery/guard proof not already covered by default stand get-hit progression controller/frame order, threshold/actor-frame tick-order/named controller-operation order/synthetic auto guard-start-end controller order/synthetic guard-hit actor-frame telemetry/early-reject/positive/air-velocity/ground-selection/official ordered-threshold/official auto guard-start-end/official guard-hit frame-physics/required hit/guard sound plus hit/guard spark telemetry/player-AIR, bounded common/FightFX system render/source-metadata routes, required common/FightFX source-frame plus multi-frame trace gates, package-frame handoff tests, first-pass real fight.def/FightFX/common AIR/SFF loading/provider registration tests, renderer global-provider lookup tests, AIR-duration frame advance tests, bounded AIR/SFF axis binding, and frame/axis QA diagnostics: broader recovery parity, deeper VM tick-order coverage, exact FightFX/common render lookup/layering/scale/palette, or broader guard-effect parity.

Acceptance:

- Focused tests or `pnpm qa:trace` required artifact.
- Claim allowed names artifact and route.
- Claim blocked keeps exact tick-order, full recovery parity, and broad character claims out of scope.

### R2 - MatchWorld Ownership Deepening

Issue: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

Build next:

- Current proof: `RuntimeRoundSystem` owns bounded round timer, KO/time-over finish state, winner/message projection, and reset semantics, with focused unit coverage and unchanged `pnpm qa:trace` aggregate behavior.
- Current proof: required `synthetic-imported-round-ko.json` checksum `bfd5f073` and `synthetic-imported-round-timeover.json` checksum `7d9f7907` use `RuntimeTraceGate.requiredRoundFrames` to gate bounded `RoundSnapshot` KO and time-over/draw evidence.
- Current proof: required `synthetic-imported-variable.json` checksum `3b33f7a8` gates bounded `VarRandom` as typed `variable:varrandom`; required `synthetic-imported-target-owned-custom-state.json` checksum `410fb8c0` gates bounded target-owned `p2getp1state = 0` custom-state routing; required `synthetic-imported-hitby-reject.json` checksum `65185fd1` gates bounded `HitBy` allow-list mismatch rejection through typed `eligibility:hitby` evidence and final P2 life `1000`; required `synthetic-imported-hitdef-hit-sound.json` checksum `6fc00d8a` gates bounded direct-hit `hitsound = S5,0` attacker-side `PlaySnd` telemetry; required `synthetic-imported-hitdef-common-spark.json` checksum `5ea054d7`, `synthetic-imported-hitdef-fightfx-spark.json` checksum `11537b56`, `synthetic-imported-hitdef-common-guard-spark.json` checksum `7650a09c`, `synthetic-imported-hitdef-fightfx-guard-spark.json` checksum `32f3e92d`, and `synthetic-imported-hitdef-guard-effect-package.json` checksum `1c3167b7` gate common/FightFX hit/guard source-frame plus multi-frame AIR metadata and one combined guard sound + FightFX guard-spark package route; required `synthetic-imported-hitby-allow.json` checksum `c75d5c7d` remains the matching allow-list acceptance route, and required `synthetic-imported-noop.json` checksum `dbe1ee9e` gates imported `Null`, browser no-op `ForceFeedback`, debug clipboard no-ops `DisplayToClipboard` / `AppendToClipboard` / `ClearClipboard`, deprecated dust presentation no-op `MakeDust`, and helper-lifecycle no-op `DestroySelf` controller execution visibility before a simple `HitDef` route. Current trace aggregate: 164/164 artifacts passed, 144 required and 20 optional; controller-family coverage is 78.
- Current proof: required `synthetic-imported-target-noko.json` checksum `28ac8636` gates bounded defender-side NoKO clamping for lethal `TargetLifeAdd` through ordered AssertSpecial/HitDef/TargetLifeAdd controller evidence, target-link evidence, and final P2 life `1`; previous `synthetic-imported-target.json` checksum `f5a16dc9` gates bounded TargetLifeAdd/TargetPowerAdd/TargetVel*/TargetFacing/TargetBind/BindToTarget/TargetDrop side effects through typed operations, target-link/binding evidence, P2 facing/velocity actor-frame evidence, final P1 `targetCount = 0`, and final P2 `life = 943` / `power = 40`.
- Current proof: `RuntimeTargetWorld.snapshotRuntimeState` owns cloned target-memory snapshots consumed by `MatchWorld` actor records, with focused tests proving target refs, TargetBind bindings, and `BindToTarget` registry evidence remain stable.
- Current proof: `RuntimePauseWorld` owns current match pause state, snapshot projection, source-movetime checks, countdown ticks, controller application, and reset while preserving existing `Pause`/`SuperPause` trace behavior.
- Current proof: `RuntimePausedMatchWorld` owns bounded regular `Pause` / `SuperPause` paused-match ordering consumed by `PlayableMatchRuntime`, with focused `PauseSystem` coverage for source `movetime`, frozen actor presentation, pause replacement interruption, pause countdown ticking, and the concrete `advanceRuntime(...)` bridge for source-movetime target/effect/constraint side effects while trace behavior is expected to remain stable.
- Current proof: `RuntimeHitPauseWorld` owns bounded global hitpause ordering consumed by `PlayableMatchRuntime`, with focused `RuntimeHitPauseSystem` coverage for command buffering, `ignorehitpause` dispatch, paused presentation, actor countdown, no-op behavior outside hitpause, and the concrete `advanceRuntime(...)` bridge for command-buffer plus paused-presentation side effects while trace behavior is expected to remain stable.
- Current proof: `RuntimeAssertSpecialWorld` owns bounded imported pre-facing `AssertSpecial` lookup/filter/trigger/application consumed by `PlayableMatchRuntime`, with focused system coverage for imported current-state, owner-backed state-owner, trigger filtering, and non-imported skip behavior while trace behavior is expected to remain stable.
- Current proof: `RuntimeSnapshotWorld` owns bounded stage/camera, player actor, and final effect snapshot projection consumed by `PlayableMatchRuntime`, with focused system coverage for `ScreenBound` camera exclusion/fallback, EnvShake/EnvColor handoff, actor identity/source/sprite-owner metadata, cloned runtime/event histories, target refs/bindings, active/frame collision boxes, missing-frame fallback hurtbox, and cloned p1/p2 Explod/Helper/Projectile snapshot ordering while `pnpm qa:trace` stays stable.
- Current proof: `RuntimeCompatibilityTelemetryWorld` owns imported compatibility telemetry/session projection consumed by `PlayableMatchRuntime`, with focused system coverage for imported/owner-backed filtering, state-entry/session projection, controller-event caps, operation key stability, active-command projection, and command-history handoff while trace behavior stays stable.
- Current proof: `RuntimeEnvShakeWorld` owns bounded EnvShake/FallEnvShake event insertion plus deterministic multi-actor camera-shake projection consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeAudioWorld` owns bounded `PlaySnd`/`StopSnd` event insertion consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEnvColorWorld` owns bounded `EnvColor` event history, stage-flash projection, and reset consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeSpriteEffectWorld` owns current match-runtime `SprPriority`, `PalFX`, `AfterImage`, `AfterImageTime`, and `Angle*` mutation/ticking consumed by `PlayableMatchRuntime`, with focused `SpriteEffectSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeActorConstraintWorld` owns bounded `Width`, per-frame `PlayerPush`/`PosFreeze`/`ScreenBound` constraint reset/projection, stage clamping, and body-push separation consumed by `PlayableMatchRuntime`, with focused `ActorConstraintSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeDirectCombatWorld` owns bounded direct hit/guard result mutation consumed by `PlayableMatchRuntime`, including same-tick direct `HitDef` priority win/trade mutation, life, pause, stun, velocity, hit vars, hit fall metadata, power gain, contact memory, received-damage memory, and get-hit cleanup, with focused `DirectCombatSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeHitOverrideWorld` owns bounded HitOverride slot ticking and redirect mutation consumed by direct and projectile combat paths, with focused `HitOverrideSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeReversalWorld` owns bounded ReversalDef activation, active counter detection, and counter-result mutation consumed by direct HitDef contact paths, with focused `ReversalSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeProjectileCombatWorld` owns bounded projectile contact/reject/HitOverride/hit-or-guard/cleanup mutation plus projectile clash trade/cancel/decrement mutation consumed by `RuntimeEffectActorWorld`, with focused `ProjectileCombatSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEffectSpawnWorld` owns bounded Explod/Helper/Projectile spawn resolution, RemoveExplod dispatch, and ModifyProjectile dispatch consumed by `PlayableMatchRuntime`, with focused `EffectSpawnSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEffectLifecycleWorld` owns bounded active-effect tick, presentation tick, paused presentation tick, effect snapshot grouping, and shared get-hit cleanup orchestration consumed by `PlayableMatchRuntime`, `RuntimeDirectCombatWorld`, `RuntimeHitOverrideWorld`, and `RuntimeReversalWorld`, with focused `EffectLifecycleSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeMatchInteractionWorld` owns bounded post-fighter interaction ordering for target-memory aging, active-effect advance, projectile clash, body separation, target bindings, direct priority/direct combat, projectile combat, stage clamp, and presentation-effect advance. It now also exposes `advanceRuntime(...)` as the concrete normal-loop runtime bridge for the target/effect/constraint/projectile-clash parts of that order, with focused `MatchInteractionSystem` coverage and stable `pnpm qa:trace` behavior at 163/163 artifacts.
- Current proof: `RuntimeContactMemoryWorld` now owns bounded direct/projectile contact-memory creation, reset, mutation, and readback consumed by `PlayableMatchRuntime`, `RuntimeDirectCombatWorld`, and `RuntimeReversalWorld`, with focused `ContactMemorySystem`, `DirectCombatSystem`, and `ReversalSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeRandomSystem` now owns deterministic sandbox-side random seed creation, LCG advance, controller-safe unit clamping, and fallback `VarRandom` unit derivation consumed by `PlayableMatchRuntime` and `StateControllerExecutor`, with focused system coverage and stable `synthetic-imported-variable.json` checksum `3b33f7a8`.
- Current proof: `HitSparkAssetSystem` now owns bounded player/common/FightFX HitDef spark asset-frame resolution consumed by `PlayableMatchRuntime` before `RuntimeHitEffectWorld` event insertion, with focused system coverage and unchanged renderer behavior expected.
- Current proof: `RuntimeRecoverySystem` now owns bounded `fall.recovertime` countdown, Common1 liedown recovery countdown/defaulting, and imported `5201 -> 52` ground-recovery landing hooks consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeTargetWorld.applyBindToTargetController` now owns bounded `BindToTarget` lookup, raw/typed postype parsing, duration binding, facing-aware position application, and operation reporting; `PlayableMatchRuntime` only supplies target size anchors and evidence callbacks.
- Current proof: `RuntimeTargetWorld.applyTargetBindings` / `applyBindToTarget` now own bounded active `TargetBind` target-position application and active `BindToTarget` owner-position application; `PlayableMatchRuntime` delegates the same interaction-order callbacks without changing behavior.
- Current proof: `RuntimeHitEligibilityWorld` now owns bounded `HitBy`/`NotHitBy` slot ticking plus per-frame `AssertSpecial`/render-opacity reset consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeOrientationWorld` now owns bounded auto-facing and `Turn` facing flips consumed by `PlayableMatchRuntime` and `StateControllerExecutor`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeGuardWorld` now owns bounded guard-hit state selection plus auto guard-start eligibility/mutation consumed by direct combat, projectile combat, and the match loop, with focused system coverage and stable trace behavior.
- Current proof: `RuntimeGetHitStateWorld` now owns bounded default get-hit state selection consumed by imported direct and projectile hit routes, with focused system coverage and stable trace behavior.
- Current proof: `RuntimeHitStateTransitionWorld` now owns bounded direct-hit and ReversalDef state-transition routing for `p1stateno`, `p2stateno`, and `p2getp1state`, with focused system coverage and stable trace behavior.
- Current proof: `RuntimeStateAvailabilityWorld` now owns bounded state/action availability lookup consumed by current state-entry validation routes, with focused system coverage and stable trace behavior.
- Current proof: `RuntimeStunWorld` now owns bounded hitstun/guardstun timer advance plus the former match-loop glue for hitstun presentation requests, imported hit-state moveType preservation, current-move guardrails, and non-imported idle moveType restoration, with focused system coverage and stable trace behavior.
- Move one mutable runtime area behind a named world/system boundary without changing behavior: deeper helper/projectile/explod VM lifecycle, combat/effect ordering, target links, deeper audio semantics, or deeper presentation ownership.
- Gate ownership through existing trace fields where possible rather than adding new UI.

Acceptance:

- Existing checksums either stay stable or drift is intentional and documented.
- Focused unit tests cover boundary contract.
- No new compatibility claim unless trace proves behavior.

### S1 - Studio Evidence/Build Trust Chain

Issue: `.scratch/roadmap/issues/02-studio-evidence-workflow.md`

Build next:

- Add visible selected-row focus after Trust Chain jumps so users see the exact trace, asset, source, package, or gate record they landed on.
- Add package-file and source-file drilldowns to the same Trust Chain contract without duplicating per-surface status logic.
- Keep every Trust Chain row tied to trace/report/runtime/project data already produced by the app.

Acceptance:

- Browser visual QA with `pnpm qa:smoke`.
- Screenshot/diagnostic inspection confirms no decorative green status.
- Docs update `docs/INTERFACE_SYSTEM.md` and this board if workflow meaning changes.

### A1 - Generated Asset Provenance And QA

Issue: `.scratch/roadmap/issues/03-generated-assets-pipeline.md`

Build next:

- Store source prompt, source image/sheet path, atlas manifest, contact sheet/GIF, collision/action data, and QA report links in one record.
- Add motion/scale/baseline QA status that can fail generated walk/crouch/jump frames.

Acceptance:

- Bad locomotion requires source regeneration, not atlas cropping.
- Studio shows QA state and next action.
- Generated/native assets remain separate from imported MUGEN compatibility scores.

### I1 - IKEMEN Reference Expansion

Issue: `.scratch/roadmap/issues/04-ikemen-scan-and-reference.md`

Build next:

- Current proof: `IkemenFeatureScanner` recognizes IKEMEN-GO data ZSS presentation/system controllers `LifeBarAction`, `GameMakeAnim`, `Text`, `RemoveText`, and `RedLifeSet`, plus the text-count trigger `NumText`, as scanner-only unsupported findings, with focused scanner coverage.
- Map more Ikemen-GO source/docs signals into scanner-only findings.
- Keep every finding classified as recognized, unsupported, or unknown unless runtime execution is gated.

Acceptance:

- Scanner tests prove the new signals.
- Docs keep MUGEN 1.0, MUGEN 1.1, IKEMEN scan-only, and IKEMEN runtime future work separate.

### M1 - Shared Contract Readiness

Issue: `.scratch/roadmap/issues/05-modular-engine-boundaries.md`

Build next:

- Current proof: `pnpm check:boundaries` runs `scripts/check_boundaries.cjs` and guards future `src/core/**`, future platformer module paths, and `src/engine/**` shared contracts against fighting/MUGEN leakage outside explicit boundary registries; `runtime-manifest/v0` also exports this proof command as `contracts.verificationCommands.boundary`.
- Identify one shared contract candidate from project, asset, input, tick, snapshot, render, audio, debug, build, or QA.
- Prove it is not importing CNS, CMD, HitDef, rounds, helpers, targets, or MUGEN command routing.

Acceptance:

- Docs or boundary tests show what is shared vs fighting-specific.
- `pnpm check:boundaries` passes for any shared/module boundary move.
- No platformer runtime begins until fighting smoke/trace gates remain stable.

## Progress Update Rules

Update these files when a package moves:

| Change type | Required docs |
| --- | --- |
| Support level or compatibility behavior | `docs/SUPPORTED_FEATURES.md`, `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/QA_AND_ACCEPTANCE_GATES.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, relevant issue. |
| Score or answer to "0 to 100" changes | `docs/PORT_COMPLETION_SCORECARD.md`, `docs/PROGRESS_TRACKER.md`, this board. |
| Release target or usable-milestone wording changes | `docs/ROADMAP_RELEASE_TARGETS.md`, `docs/PROGRESS_TRACKER.md`, this board. |
| Studio workflow meaning changes | `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, `docs/PROGRESS_TRACKER.md`, relevant issue. |
| Generated asset pipeline changes | `docs/GENERATED_ASSET_QA_CONTRACT.md`, `docs/ENGINE_STUDIO_ROADMAP.md`, relevant issue. |
| Modular boundary moves | `docs/MODULE_BOUNDARY_CONTRACT.md`, `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`, relevant issue. |

## Agent Handoff Contract

Before closing a round:

- State exact files changed.
- State checks run.
- State why `pnpm qa:trace` or `pnpm qa:smoke` was or was not required.
- State whether the round was docs-only/setup and therefore had no score movement.
- Do not mark an issue done unless evidence exists and docs name the blocked scope.
- Do not raise scores from docs-only changes.

Use `docs/ROADMAP_PROGRESS_SYSTEM.md` for package lifecycle, update matrix, and the closeout template when a slice touches more than one doc family.

## Current Anti-Claims

- No full MUGEN/IKEMEN parity.
- No ZSS/Lua execution.
- No rollback/netplay.
- No full helper/custom-state/throw VM.
- No full screenpack/lifebar engine.
- No public bundled commercial/third-party characters.
- No platformer/module runtime until fighting contracts stabilize.
