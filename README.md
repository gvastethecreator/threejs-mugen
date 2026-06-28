# MUGEN Web Sandbox

Private/local Three.js prototype for progressively porting M.U.G.E.N / IKEMEN-GO-style characters, stages, and match runtime behavior to the browser.

This is now a port foundation, not only an inspector. The project should grow toward MUGEN/IKEMEN compatibility by measured layers instead of pretending that partial parsing equals full runtime parity. It currently has three modes:

- `Runtime Mode`: a playable Three.js fight prototype with three active local atlas-backed demo fighters, an original native stage, an optional imported AIR/SFF runtime route, partial imported stage `.def` support, keyboard/touch controls, hitboxes/hurtboxes, damage, hit pause, hit stun, life, power, round timer, KO/time-over flow, and debug panels.
- `Inspector Mode`: local ZIP/folder loading for MUGEN characters, partial `.def`, `.air`, `.cmd`, `.cns/.st`, `.sff` parsing, AIR playback, and compatibility reporting.
- `Studio Mode`: a first creator-workbench shell with `Workbench`, `Assets`, `Inspector`, `Debug`, `Evidence`, `Modules`, and `Build` surfaces for project manifests, asset provenance, module gates, runtime actor evidence, QA evidence, local recent projects, and a compiled `runtime-manifest/v0` contract.

## Run

```bash
pnpm install
pnpm dev
```

Then open the Vite URL. The app starts in Runtime Mode. You can switch to Inspector Mode or load a character ZIP/folder. No commercial character assets are included.

## QA Smoke

```bash
pnpm qa:smoke
pnpm qa:trace
```

The smoke command starts a local Vite server unless `QA_BASE_URL` is set, opens Playwright, captures Runtime desktop/mobile screenshots, compiles Studio Build output, exports a smoke trace artifact, checks Studio Assets/Evidence/Debug, and writes artifacts under `.scratch/qa/qa-smoke/`.

The trace command exports deterministic runtime trace artifacts under `.scratch/qa/trace-gates/`: required native hit/whiff gates, synthetic imported CMD/CNS hit, HitBy/NotHitBy reject, ReversalDef counter, AttackMulSet/DefenceMulSet damage-scale, bounded direct `HitDef` priority clash, bounded `kill = 0`, `guard.kill = 0`, and AssertSpecial `NoKO` nonlethal clamps, guard, AssertSpecial attacker-side `Unguardable` hit-through-guard evidence, bounded `Alive`, CNS `[Data]`-backed `LifeMax`/`PowerMax`, `RoundNo`/`RoundState`, `RoundsExisted`/`MatchOver`, `StageTime`, `SelfCommand`, and `InGuardDist` trigger routes, bounded automatic Common1-style guard-start and guard-end routes through `120 -> 130 -> 140 -> 0`, stand/crouch Common1-style guard-hit routes through `150 -> 151` and `152 -> 153`, partial hitstun, fall metadata, attacker-owned custom get-hit controller-flow with `HitFall*` typed-operation evidence, defender-owned default Common1-style get-hit entry, defender-owned Common1 `HitShakeOver`/`HitOver` stand progression, defender-owned Common1 fall branch through `5000 -> 5030 -> 5050`, bounded synthetic Common1 fall recovery through `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0`, bounded synthetic Common1 recovery input through `5050 -> 5210 -> 0` via `CanRecover` plus `command = "recovery"`, state-exit, Target* typed-operation, Pause/SuperPause typed-operation, Projectile typed-operation, Projectile guard, Projectile bounded multi-hit via `projhits`/`projmisstime`, Projectile equal-priority clash, Projectile higher-priority cancel with winner-priority decrement evidence, Helper typed-operation, Explod typed-operation, Explod bind/velocity/scale, Explod `ignorehitpause`/`pausemovetime`/`supermovetime`, and RemoveExplod gates, plus optional official KFM `x`, `QCF_x`, guard, auto guard-start/end, stand/crouch guard-hit routes through real Common1 `150 -> 151` and `152 -> 153`, hitstun, defender-owned default Common1 state `5000`, defender-owned `5000 -> 5001 -> 0` stand progression, defender-owned fall/ground-impact/bounce/lie-down entry `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110`, defender-owned lie-down/get-up recovery through `5110 -> 5120 -> 0`, defender-owned air recovery input through `5050 -> 5210 -> 52 -> 0`, defender-owned ground recovery input through `5050 -> 5200 -> 5201 -> 52 -> 0`, and state-exit gates when `.scratch/fixtures/kfm-official.zip` is present.

HitPause/Pause/SuperPause trace coverage now includes separate bounded TargetBind, Projectile, visual Helper/Explod source-movetime advance/freeze, Explod `ignorehitpause`, Explod `pausemovetime`, and Explod `supermovetime` budget artifacts. These gates are partial runtime evidence, not a claim of full MUGEN/IKEMEN pause layering, Helper VM, or Explod binding parity.

## Current Milestone

- Port horizon:
  - `docs/ENGINE_STUDIO_ROADMAP.md`: concise construction roadmap across MUGEN/IKEMEN compatibility, Three.js runtime/rendering, Creator Studio, package/evidence QA, and future modular-engine modules.
  - `docs/HORIZON_IMPLEMENTATION_BLUEPRINT.md`: orchestration blueprint for building all approved ideas together: runtime, Studio, generated assets, IKEMEN scanner, modular engine, and platformer horizon.
  - `docs/MASTER_CONSTRUCTION_PLAN.md`: single construction map for the MUGEN/IKEMEN port, playable runtime, Creator Studio, generated assets, QA evidence, IKEMEN profile work, and future modular-engine slice.
  - `docs/CONSTRUCTION_WAVES.md`: practical build waves that connect each approved product direction to dependencies, gates, evidence, anti-claims, and the next implementation rounds.
  - `docs/WORKPLAN.md`: current operating ledger with status, next cuts, gates, fixture matrix, and done definitions.
  - `docs/ARCHITECTURE_DECISIONS.md`: ADR-style constraints for MatchWorld, snapshots, ControllerOps, custom-state ownership, SFF pixel data, Studio IA, generated assets, IKEMEN scanning, and future modules.
  - `docs/APPROVED_HORIZON_PLAN.md`: approved construction contract for building the expanded runtime, Studio, generated-asset, IKEMEN, and modular-engine approach without splitting into disconnected prototypes.
  - `docs/FULL_BUILD_PROGRAM.md`: operating plan for building the full MUGEN/IKEMEN Three.js port, Creator Studio, generated-asset pipeline, QA evidence system, and later modular engine horizons.
  - `docs/BUILD_EXECUTION_BACKLOG.md`: actionable backlog with the construction campaign board, usable-MVP gate, and sequenced runtime kernel, compatibility compiler, Studio, generated-asset, IKEMEN, QA, and modular-engine work.
  - `docs/BUILD_PLAN.md`: construction master plan across the compatibility engine, creator studio, generated-asset pipeline, QA, and future modular engine.
  - `docs/CONSTRUCTION_PROGRAM.md`: execution program for building every horizon in dependency order.
  - `docs/PORTING_ROADMAP.md`: long-term MUGEN/IKEMEN-GO port roadmap.
  - `docs/ENGINE_PORT_ARCHITECTURE.md`: engine architecture for parser, compiler, runtime, Three.js, audio, and debug boundaries.
  - `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`: broader creation-studio and modular-engine direction beyond MUGEN.
  - `docs/MVP_DEFINITION.md`: what "usable MVP" means for this project.
  - `docs/QA_AND_ACCEPTANCE_GATES.md`: tests, visual QA, and compatibility acceptance labels.
  - `docs/COMPATIBILITY_PROFILES.md`: normative profile split for native runtime, MUGEN 1.0/1.1, IKEMEN scan-only, and future modules.
  - `docs/CONTROLLER_SUPPORT_REGISTRY.md`: controller-family support registry, typed-operation expectations, evidence requirements, and partial-support wording.
  - `docs/TICK_ORDER_CONTRACT.md`: runtime frame/tick order contract for input, State -1, controllers, pause, physics, combat, get-hit, animation, and snapshots.
  - `docs/FIXTURE_GOLDENS.md`: required/optional fixture artifact strategy, golden update rules, and claim map.
  - `docs/STAGE_COMPATIBILITY_MATRIX.md`: imported stage parsing/model/render/fallback matrix and Stage Studio gates.
  - `docs/GENERATED_ASSET_QA_CONTRACT.md`: imagegen/sprite-atlas-builder provenance, motion, scale, baseline, collision, and regeneration rules.
  - `docs/MODULE_BOUNDARY_CONTRACT.md`: core/fighting/future-module boundary rules and platformer-slice gate.
  - `docs/INTERFACE_SYSTEM.md`: product-register UI contract for Runtime, Inspector, Studio, visual QA, and future creation-studio interface cuts.
- Current construction lock: build every approved horizon, but keep the near-term claim to partial MUGEN compatibility proven by official fixture gates, IKEMEN scanner/reporting first, evidence-first Studio surfaces, generated/native asset provenance, and modular-engine extraction only after fighting contracts are proven. The latest review synthesis lives in `docs/APPROVED_HORIZON_PLAN.md`; the practical wave-by-wave build order lives in `docs/CONSTRUCTION_WAVES.md`.
- See `docs/PLAYABLE_V0_STATUS.md` for the current truth table: playable local prototype vs. real MUGEN compatibility gaps.
- See `docs/EXTERNAL_FIXTURES.md` for local-only external character fixtures and current browser upload evidence.
- Vite + strict TypeScript + Three.js.
- First-screen playable Runtime Mode with Nova Boxer, Mira Volt, Rook Apprentice, and a loaded-character AIR/SFF bridge when the imported character has decoded sprites.
- All three active local runtime fighters use newly generated imagegen sprite sheets normalized into `sprite-atlas-builder`-compatible atlases. Aurora Striker is preserved only under `.scratch/experimental/` as a parked experiment until it receives the same full-sheet regeneration pass.
- Original Rooftop Dojo stage generated with imagegen, saved under `public/stages/rooftop-dojo/`, plus Training Grid fallback with camera, floor, bounds, simple background layers, grid, and axis.
- Partial imported stage `.def` support for packages with `stages/*.def`: display name, bounds, camera, player starts/facing, zoffset/localcoord, static normal BG sprites from stage SFF when decoded, action-backed BG animations from embedded `[Begin Action]` blocks, basic BG tiling/parallax, and placeholder fallback layers.
- P1 keyboard control plus CPU P2.
- Idle, walk, crouch, jump, punch, kick, hitstun, hit pause, hit stun, knockback, damage, life, and power.
- MUGEN-like round HUD with life/power bars, timer, KO/time-over result, pause, forced frame-step while paused, speed, and reset controls.
- Mobile-sized touch controls for movement, crouch, jump, punch, and kick.
- Browser ZIP loader via `jszip`.
- Folder loader via browser folder input.
- DEF parser with `[Info]`, `[Files]`, palettes, raw sections, and diagnostics.
- AIR parser with `[Begin Action N]`, frames, `Loopstart`, `Clsn1`, `Clsn2`, `Clsn1Default`, and `Clsn2Default`.
- CMD parser with command tokens, default command/step/buffer timing, partial `command.buffer.hitpause`, duplicate-name alternatives, `|` step alternatives, derived diagonals, 8-way exact direction matching, `$` direction families, partial `/` hold, `~` release, numeric charge windows such as `~30$D`, fresh activation for plain inputs, same-frame `+` combos, and input buffer.
- CMD `[Remap]` support resolves character button aliases before command matching and surfaces remapped/disabled command paths in the UI.
- CNS parser that indexes statedefs, controllers, triggers, and params. The partial trigger evaluator handles common axis forms (`vel x`, `pos y`, `p2bodydist x`), simple range comparisons, `Const`, `GetHitVar`, `SelfAnimExist`, `IfElse`, `Abs`, and runtime-backed `AnimElemTime` for KFM/Common1-style state flow. The runtime executes a small active-state controller subset including `ChangeState` with partial `anim` override/preserve behavior, `ChangeAnim` `elem`/`elemtime`, partial `ChangeAnim2` with state-owner AIR/sprite ownership tracking, `VelMul`, `HitVelSet`, partial `HitFallVel`/`HitFallDamage`/`HitFallSet`/`FallEnvShake`, `StateTypeSet`, `LifeSet`, `PowerSet`, `PlayerPush`, `Turn`, partial `PosFreeze`, partial `ScreenBound`, partial `HitBy`/`NotHitBy`, partial `HitOverride`, typed partial `ReversalDef`, typed partial `DefenceMulSet`, typed partial `AttackMulSet`, `VarRangeSet`, partial `AssertSpecial`, partial target-memory controllers (`TargetLifeAdd`, `TargetPowerAdd`, `TargetVelSet`, `TargetVelAdd`, `TargetFacing`, `TargetBind`, `BindToTarget`, `TargetDrop`, controller-owner `TargetState`), partial `Pause`/`SuperPause`, partial `HitDef` with basic attr/guardflag/guard-damage/hit-velocity/fall metadata, bounded direct `priority` clash, bounded direct `kill = 0`, `guard.kill = 0`, stored `fall.kill = 0`, defender-side `NoKO`, and negative `LifeAdd kill = 0` nonlethal clamps, and simple `p1stateno`/`p2stateno` handling, `p2getp1state=1` attacker-owned target states, `p2getp1state=0` target-owned state routing, owner-preserving `ChangeState` chaining, and `SelfState` return, partial `Width`, partial `SprPriority`, partial `PalFX`, partial `RemapPal` telemetry, partial `AfterImage`/`AfterImageTime`, partial `Explod`/`RemoveExplod` with bounded `ignorehitpause`, `pausemovetime`, and `supermovetime` actor advance hooks, partial `Helper`, partial `Projectile` with bounded `projhits`/`projmisstime` re-hit cooldown, bounded equal-priority `projpriority` trade, higher-priority cancel plus winner-priority decrement evidence, and bounded terminal playback for resolved `projhitanim`/`projremanim`/`projcancelanim` AIR actions, partial `PlaySnd`/`StopSnd`, partial `EnvShake`, true no-op `ForceFeedback`, and true no-op `Null`, while broader visual/system controller parity remains reported as unsupported.
- SFF version detection behind `ISffReader`, SFF v1 / 8-bit PCX decoding, and browser-side SFF v2 RAW/RLE8/RLE5/LZ5 decoding for Inspector rendering.
- SND parser for `ElecbyteSnd` archives with embedded RIFF/WAVE extraction, plus partial Web Audio playback for imported `PlaySnd` events after user-gesture unlock.
- Imported-character Runtime route that maps decoded SFF sprites, standard AIR actions, CMD `[State -1]` entries, and a small CNS statedef/HitDef subset into idle/walk/crouch/jump/basic attacks without claiming full CNS execution.
- Compatibility reports separate parsed CNS, recognized controller states, trigger-clean state entries, runtime-routable targets, session-executed imported states, and imported stage coverage so partial support is visible instead of inflated.
- Compatibility reports now include a first `ikemen-go-scan` profile section. The scanner recognizes ZSS files/references and ZSS controller syntax, Lua files/hooks including `hook.*`, IKEMEN config JSON, screenpack/select signals, `IkemenVersion`, selected IKEMEN-only controllers/triggers/`AssertSpecial` flags, model-stage assets, and named 3D/Z stage parameters as `Recognized + Unsupported` evidence. This is report-only and does not execute ZSS, Lua, IKEMEN runtime behavior, rollback, or netplay.
- State Browser surfaces the same layering in the UI with animation lookup, controller support counts, trigger counts, HitDef markers, and unsupported controller summaries.
- Atlas PNG runtime path via `AtlasSpriteProvider` for future `sprite-atlas-builder` generated characters.
- Runtime roster and HUD surface atlas locomotion QA from `qa/motion-variation-report.json` with `walk QA ok/warn/fail` badges.
- Three.js renderer for sprite planes, floor/grid/axis, and collision overlays.
- DOM UI with file loader, match setup, Studio mode, animation/state/command browsers, runtime debugger, combat debugger, compatibility report, and console.
- Studio mode now has URL-addressable internal surfaces: `?mode=studio&studio=workbench`, `assets`, `inspector`, `debug`, `evidence`, `modules`, and `build`. Workbench/Assets/Debug/Evidence/Modules/Build keep the match playtest in the center viewport, while Studio Inspector switches that viewport to the AIR inspector runtime for animation/frame/collision preview. Studio Assets provides a dedicated asset library with provenance/status filters, project-entry assets, selected asset detail, playtest-entry replacement flow, source/runtime mapping, visual dependency graph, dependency drilldown, missing/partial reference summary, related evidence, and an attention queue exposed as `.studioAssets`. Studio asset and gate records now carry first actionable status fields: severity, impact, linked evidence ids, blockers, exportability, and a next action; selected asset panels, asset tables, Build readiness, Evidence summary, `project.json`, `.studioAssets`, and `.studioEvidence` expose those fields. Studio Build now includes readiness rows for runnable, partial, blocked, exportable, package, and source-package states plus a first `export-bundle/v0` ZIP package. Studio Debug shows the live `MatchWorld` actor registry, ownership index, and snapshot facts. Studio derives an exportable/importable/browser-saved `project.json` manifest from the current runtime/import state: asset provenance, active modules, acceptance gates, source-package relink metadata, playtest entry, and `window.__MUGEN_WEB_SANDBOX__.studio` / `.project` diagnostics. It can compile that editor/project manifest into a minimal `runtime-manifest/v0` contract exposed as `.compiledProject`, export a package with project/runtime contracts, source-runtime maps, evidence, reports, latest trace when available, browser-fetchable local assets, and current-session imported ZIP/folder source files with bytes/checksums as `.projectBundle`, export and preview smoke trace evidence, keep a bounded session history of recent trace artifacts in `.traceArtifacts`, persist a bounded local trace evidence history in browser storage exposed as `.storedTraceEvidence` / `.studioEvidence.stats.persistedTraceArtifacts`, compare persisted trace checksums and frame/event/gate deltas against the current trace through `.studioEvidence.persistedTraceComparisons`, render a first Trace Comparison Review with metric and gate-diff rows, render a Trace Frame Scrubber backed by exported frame summaries with per-frame actor/effect/input/event deltas plus World Delta rows, and aggregate gates/assets/compile/trace/compatibility/diagnostic records in `.studioEvidence`. Reopening a manifest or local recent project applies P1/P2/stage when those IDs are available locally, marks imported source packages as `missing` without a live source, and exposes ZIP/Folder relink actions that mark the package `linked` again when the loaded source contains the required paths for the current browser session. Persistent browser handles/automatic reacquire are still future work.
- Compatibility reports can be exported as JSON from the UI, including a `runtimeRoster` QA summary for local atlas fighters and a `stages` summary when stage DEF/SFF files are imported.

Current Explod cut: bounded `removeongethit = 1` support prunes owner-side visual Explods when the owner enters current direct hit/guard and projectile hit/guard routes. The required `synthetic-imported-explod-removeongethit.json` trace proves direct hit spawn/remove lifecycle evidence with checksum `c713782f`; `synthetic-imported-explod-removeonprojectilehit.json` proves the projectile hit route with checksum `3dd34719`; `synthetic-imported-explod-removeonprojectileguard.json` proves the projectile guard route with checksum `89b66f37`. The required `synthetic-imported-explod-ignorehitpause.json` trace proves one source-owned Explod freezes during hitpause while another advances through `ignorehitpause = 1`, checksum `f26fd540`; `synthetic-imported-explod-supermovetime.json` proves one source-owned Explod freezes during SuperPause while another advances through `supermovetime = 4`, checksum `8215716a`; `synthetic-imported-explod-pausemovetime.json` proves the same bounded actor-budget behavior for regular `Pause` with `pausemovetime = 4`, checksum `f943653e`. Exact tick order, helper-owned Explods, custom-state edge cases, and full remove-trigger/pause-layer semantics remain future work.

Current direct-contact cut: bounded `MoveContact`, `MoveHit`, and `MoveGuarded` now return direct-contact age counters for the current owner state, and partial `MoveHitReset` clears that direct-contact memory. The required `synthetic-imported-movehit-counter.json` trace proves a `MoveHit >= 1` branch after direct imported `HitDef` contact. Exact first-tick timing, hitpause accounting, helpers, redirects, teams, multi-target lifetime, and full MUGEN/IKEMEN parity remain future work.

Current hit-count cut: bounded `HitCount` and `UniqHitCount` now work for direct `HitDef` hits in the current two-actor owner state. The required `synthetic-imported-hitcount.json` trace proves a `HitCount >= 1 && UniqHitCount >= 1` branch after direct imported contact. Guard/projectile counts, helpers, multi-target uniqueness, combo lifetime, and exact parity remain future work.

Current reversal-trigger cut: bounded `MoveReversed` now works for the attacker state after a defender-side partial `ReversalDef` counters a matching direct `HitDef`. The required `synthetic-imported-reversal.json` trace proves the defender route into `777` and the attacker's delayed `MoveReversed >= 1` branch into `778` after hitpause. Exact reversal priority, projectile/helper/custom-state reversal behavior, trigger lifetime, and full MUGEN/IKEMEN parity remain future work.

Current previous-state trigger cut: bounded `PrevMoveType`, `PrevAnim`, and `PrevStateType` now join `PrevStateNo` for imported state routing. The required `synthetic-imported-prevmovetype.json`, `synthetic-imported-prevanim.json`, and `synthetic-imported-prevstatetype.json` traces prove routes from attack state `200` into intermediate states, then branch through previous move/anim/state metadata. Exact tick-order parity, redirects, helper/team state ownership, and every custom-state edge remain future work.

## Controls

```txt
Arrow Left / Right = walk back / forward
Arrow Up = jump
Arrow Down = crouch
A / S / D = punch buttons
Z / X / C = kick buttons
Enter = start token
```

On narrow/mobile viewports the stage also exposes touch controls:

```txt
L / R = walk
D = crouch
U = jump
P = punch
K = kick
```

## Test Character

Kung Fu Man is a good first inspection character. Keep it outside the repository, then load either:

```txt
chars/
  kfm/
    kfm.def
    kfm.sff
    kfm.air
    kfm.cns
    kfm.cmd
```

or a ZIP containing that structure. The app resolves files from the `.def`; it does not hardcode KFM paths.

For local-only testing, the official Elecbyte MUGEN 1.1 beta package is available at:

```bash
mkdir .scratch/external
curl -L https://www.elecbyte.com/mugenfiles/1.1/mugen-1.1b1.zip -o .scratch/external/mugen-1.1b1.zip
```

`.scratch/` is ignored so those assets stay out of the repository.

Local fixture packages can be rebuilt from downloaded external assets with:

```bash
python scripts/package_external_mugen_fixtures.py
```

The script writes ZIPs and `external-fixtures.json` to `.scratch/fixtures/`. Current locally verified fixture packages are:

| Fixture | Source | Inspector result |
| --- | --- | --- |
| `kfm-official.zip` | Elecbyte MUGEN 1.1b1 `chars/kfm` + `data/common1.cns` + `stages/kfm.*` | DEF/SFF/AIR/CMD/CNS/SND true, 117 actions, 281/281 SFF v2 sprites, 167 states, one imported stage |
| `kfm720-official.zip` | Elecbyte MUGEN 1.1b1 `chars/kfm720` + `data/common1.cns` + `stages/stage0-720.*` | DEF/SFF/AIR/CMD/CNS/SND true, 117 actions, 281/281 SFF v2 sprites, 169 states, one imported stage |
| `codefuman.zip` | `Jesuszilla/CodeFuMan`, packaged under `chars/cfm` + `data/common1.cns` | DEF/SFF/AIR/CMD/CNS/SND true, 111 actions, 274/274 SFF v1 PCX sprites, 165 states |
| `sf3-ryu-demo-mugenjs.zip` | `Tatayecorp/demo_mugenJS` `chars/SF3_Ryu` | DEF/SFF/AIR/CMD/CNS true, SND false, 712 actions, 1285/1285 SFF v1 PCX sprites, 1686 states |

The same Playwright pass also verified folder upload with `.scratch/external/mugen-1.1b1/chars/kfm`; that path loads KFM but correctly reports missing `common1.cns` because selecting only the character folder omits MUGEN's global `data/common1.cns`.

Current KFM expectation: DEF/AIR/CMD/CNS/SND parse and inspect; the official MUGEN 1.1 KFM uses SFF v2 with one RLE8 portrait and mostly LZ5 5-bit body sprites. The inspector now decodes those sprites directly in the browser and can render real KFM animation frames. After loading, KFM also appears as an optional Runtime Mode fighter through an AIR/SFF/CMD/CNS/SND bridge that can route simple `[State -1]` `ChangeState` entries such as stand light punch (`x`, state `200`) and Light Kung Fu Palm (`~D, DF, F, x`, state `1000`) into parsed CNS statedefs. Runtime snapshots and exported reports record which imported states and controllers actually executed during the current session. This is not full MUGEN behavior yet because only a narrow tick-by-tick CNS subset runs, with `HitDef` limited to simple damage, pause, hit stun, pushback, bounded `priority`, bounded nonlethal `kill`/`guard.kill`/`fall.kill`/defender-side `NoKO` clamps, negative `LifeAdd kill = 0` clamps, simple `p1stateno`/`p2stateno` transitions, defender-owned default get-hit entry into known Common1-style states such as KFM `5000`, partial stand get-hit progression from `5000` to `5001` through `HitShakeOver` and back to `0` through `HitOver`, partial stand/crouch guard-hit routing through known Common1-style states such as `150 -> 151` and `152 -> 153`, partial fall/ground-impact/bounce/lie-down/get-up evidence through real KFM `5000 -> 5030 -> 5035 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0`, a bounded synthetic recovery-input route, an optional official KFM air recovery-input route from `5050` into `5210` through `CanRecover` plus `command = "recovery"`, and an optional official KFM ground recovery route through `5050 -> 5200 -> 5201 -> 52 -> 0`, `p2getp1state=1` attacker-owned `p2stateno` entry with owner-preserving `ChangeState` chaining and `SelfState` return, `p2getp1state=0` target-owned state routing, stored hit velocity for partial `HitVelSet`, partial `HitBy`/`NotHitBy` attr gating, partial `HitOverride` redirection, typed partial `ReversalDef` counters, partial `DefenceMulSet`, partial target memory including controller-owner `TargetState`, partial guardflag/guard-damage behavior, and active `Clsn1` hitboxes; exact ground/air recovery thresholds and velocities, exact recovery tick-order parity, exact guard-distance/start/end/air parity, exact KO/round/no-KO semantics beyond bounded clamps, broader crouch transition parity, helpers/projectiles, broad custom states, full sound/effect parity, and many visual/system controllers remain partial or unsupported.

Latest browser QA verifies this imported route with official KFM and CodeFuMan: physical `A` maps to MUGEN `x` and enters state `200` with `HitDef`; frame-stepped `D, DF, F, x` enters state `1000` for Light Kung Fu Palm. The compatibility session exposes `activeCommands`, `routedStates`, `lastRoutedState`, and executed controller counts so these claims can be checked in `window.__MUGEN_WEB_SANDBOX__` and exported reports.

Runtime trace evidence now has a first renderer-independent `RuntimeTrace` harness for scripted input frames, compact actor/effect/round/compatibility summaries, runtime log events, frame summaries, per-frame actor/effect/input/event deltas, and deterministic checksums. Studio Evidence is the first browser surface for filtering those records alongside gates, assets, compile status, compatibility, and diagnostics; it keeps in-session and persisted trace histories, compares persisted trace artifacts against the current session artifact, shows a basic metric/gate diff review, and includes a frame checksum/event/delta scrubber. It is not a full replay, rollback, or netplay system yet.

This workspace can also clone a local-only KFM template/reference under `.scratch/external/mugen-1.1b1`; `.scratch/` is ignored and must not be treated as shippable project content.

## Generated Character Pipeline

The private character path used by the current roster is:

```txt
imagegen concept/base
  -> sprite-atlas-builder custom-atlas contract for the Runtime v0 rows
  -> imagegen sheet normalizer / curation
  -> sprite-atlas-builder preview + motion QA
  -> sprite-sheet-alpha.png + manifest.json
  -> AtlasSpriteProvider
  -> Runtime Mode fighter definition
```

`manifest.json.frame_layout` is the runtime source of truth for frame rectangles. Nova Boxer, Mira Volt, and Rook Apprentice include imagegen-sheet sources and MUGEN-lite templates in `public/characters/<fighter>/mugen/`; their runtime art is atlas-backed, not SFF-backed. The `walk-forward` row is gated with `sprite-atlas-builder/scripts/check_motion_variation.py`; the current rows are newly generated slow-walk art and are usable after visual browser review, while the runtime still surfaces a conservative `walk QA warn 1` for low body-center bob instead of silently marking the atlases clean.

The current atlas normalizer uses a character-level reference scale instead of fitting every frame independently. This matters because imagegen can draw crouch/jump poses at different apparent sizes; per-frame fitting made those poses inflate in the runtime. Walk rows are now replaced from fresh one-row imagegen outputs through `scripts/replace_atlas_state_from_imagegen_row.py`, then recomposed into the atlas and checked with contact sheets, GIFs, browser screenshots, and `qa/motion-variation-report.json`.

## Checks

```bash
pnpm test
pnpm typecheck
pnpm build
```

Frontend changes should be visually verified in the browser before calling a task done.

## Research References

- Elecbyte MUGEN docs: https://www.elecbyte.com/mugendocs-11b1/mugen.html
- Elecbyte AIR docs: https://www.elecbyte.com/mugendocs-11b1/air.html
- Elecbyte CNS docs: https://www.elecbyte.com/mugendocs/cns.html
- Elecbyte state controllers: https://www.elecbyte.com/mugendocs/sctrls.html
- Ikemen GO: https://ikemen-engine.github.io/
- Ikemen GO source: https://github.com/ikemen-engine/Ikemen-GO
