# QA And Acceptance Gates

This project has two kinds of quality gates: code gates and playable evidence gates. Both matter. Parser tests can prove data behavior; browser screenshots prove that the Three.js/runtime/UI path still works.

## Standard End-Of-Round Checks

Run these at the end of a focused implementation round:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Do not run the full suite after every tiny edit unless debugging a specific failure. Keep the full checks for the close of the round.

## Visual QA Requirement

Any frontend, renderer, runtime snapshot, debug panel, stage, or sprite-pipeline change needs browser verification before it is called done.

Minimum evidence:

- Screenshot of default Runtime Mode.
- Screenshot or diagnostics for the affected panel/feature.
- If imported content is affected, upload a local fixture and capture the relevant Inspector/Runtime state.
- Save machine-readable diagnostics when possible through `window.__MUGEN_WEB_SANDBOX__`.

Preferred evidence path:

```txt
.scratch/qa/<feature-name>/
  diagnostics.json
  runtime.png
  inspector.png
  notes.md
```

## Repeatable Browser Smoke

`pnpm qa:smoke` is the baseline visual/runtime smoke gate. It makes routine browser verification repeatable instead of relying only on ad-hoc Playwright scripts.

Minimum smoke route set:

| Route | Required Evidence |
| --- | --- |
| `/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo` | Desktop and narrow screenshots; nonblank canvas; stage, HUD, two fighters, and debug bridge diagnostics. |
| `/?mode=studio&studio=workbench&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo` | Workbench command center screenshot; project readiness lanes; operator priority; surface jump buttons for Assets/Evidence/Build/Debug; primary actions for Playtest, MUGEN ZIP intake, trace export, and runtime compile; no horizontal overflow. |
| `/?mode=studio&studio=build&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo` | Build Center screenshot; `compiledProject`; smoke trace artifact after export; `export-bundle/v0` ZIP with project/runtime/source-map/evidence/report files plus browser-fetchable local assets/checksums and `sourcePackages` linked/missing metadata. |
| Reopened `project.json` with missing `sourcePackages` | Source-package relink screenshot; Build Center shows ZIP/Folder relink actions before load; loading the KFM fixture ZIP through the relink button changes the package from `missing` to `linked`, removes stale missing-source warnings, and keeps required path metadata visible. |
| `/?mode=studio&studio=assets&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo` | Asset Library screenshot; `studioAssets` exposed through the QA bridge; provenance/status filters render generated assets; selected asset detail includes impact, exportability, evidence ids, and next action; playtest-entry replacement flow, source/runtime mapping, visual dependency graph, dependency drilldown, missing/partial references, and related evidence are visible. |
| `/?mode=studio&studio=stage&p1=nova-boxer&p2=mira-volt&stage=bgctrl-lab` | Native BGCtrl Lab screenshot and canvas pixel stats; `snapshot.stage.bgControllers` exposes controller groups; Stage Studio shows bounded BGCtrl rows and a nonblank canvas for visible renderer execution. |
| `/?mode=studio&studio=debug&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo` | Runtime Debug Studio screenshot; `actorRegistry` exposed through the QA bridge; actor ownership visible; URL-backed targets/effects/pause/audio lenses render; target/effect/pause lenses expose trace-world evidence when a trace artifact exists; effect world evidence can jump to the Evidence frame scrubber. |
| `/?mode=studio&studio=evidence&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo` | Evidence Browser screenshot; `studioEvidence` records for asset, compile, trace/gate, compatibility, or diagnostics plus a top actionable next step from the QA bridge. After trace export, persisted local trace evidence history must be visible and exposed through `studioEvidence.stats.persistedTraceArtifacts` / `storedTraceEvidence`; `studioEvidence.persistedTraceComparisons` must compare that stored trace to the current artifact, the UI must show Trace Comparison Review metric/gate diff rows, and `traceFrameScrubber` must expose/select frame timeline data plus a World Delta block when the selected frame has `world` evidence. |

Minimum diagnostics fields:

- `mode`
- selected P1/P2/stage ids
- renderer status
- runtime snapshot summary
- runtime roster
- atlas motion QA summary
- compiled project when Studio Build is open
- trace artifact and Studio Evidence records when exported/open
- Studio actionable status fields for selected asset/evidence: impact, next action, exportability, and blockers when present
- persisted Studio evidence counts and stored trace evidence entries after exporting a trace artifact

Default output path:

```txt
.scratch/qa/qa-smoke/
  diagnostics.json
  runtime-desktop.png
  runtime-mobile.png
  runtime-canvas.png
  studio-workbench.png
  studio-build.png
  studio-assets.png
  studio-evidence.png
  trace-artifact.json
```

The command starts a local Vite server automatically. Set `QA_BASE_URL=http://host:port` to verify an already-running app instead.

Feature-specific milestone closeout can still use focused Playwright scripts when a deeper fixture or interaction is required, but `pnpm qa:smoke` is now the first reusable gate for the default Runtime and Studio Build/Evidence paths.

## Compatibility Acceptance Levels

Use these labels consistently:

| Level | Meaning |
| --- | --- |
| Parsed | The file or syntax is read into a model. |
| Decoded | Binary/image/audio payload is usable by the browser. |
| Recognized | The engine knows the feature name and can report it. |
| Compiled | The feature has a typed runtime representation. |
| Executed Partial | The runtime performs a documented subset. |
| Executed Parity | Behavior is expected to match MUGEN/IKEMEN for the tested cases. |
| Unsupported | The feature is known but not implemented. |
| Unknown | The feature was encountered but not classified yet. |

Avoid saying "supported" without naming the level.

## Fixture Matrix

Every major compatibility pass should consider:

| Fixture | Required Evidence |
| --- | --- |
| Native generated roster | Runtime screenshot and controls/combat smoke. |
| Official KFM | Upload, decoded sprite rendering, compatibility JSON, one routed attack. |
| KFM720 | Upload and localcoord/scale sanity check. |
| CodeFuMan | SFF v1 PCX path and at least one routed attack. |
| SF3 Ryu demo | Parser/report stress test; runtime playability is not required yet. |
| Imported stage | Stage report, rendered background/floor if decoded, fallback if not. |

## Report Honesty Rules

- A parser count is not runtime compatibility.
- A recognized controller is not an executable controller.
- An executable controller with ignored params is partial.
- Runtime session execution is separate from static compatibility.
- A feature that works only for native generated fighters must not be described as imported MUGEN compatibility.

## Deterministic Trace Evidence

Runtime compatibility gates should include replay-style evidence when they change tick order, command routing, controller execution, combat, actor ownership, or pause behavior.

Minimum trace evidence:

- Scripted input frames.
- Final actor state/control constraints and frame checksum.
- State/controller routing summary where compatibility data exists.
- Typed controller-operation evidence where the gate depends on compiled IR side effects such as `HitDef`, `Target*`, `Pause`/`SuperPause`, `Projectile`, `Helper`, or `Explod`.
- New runtime log events categorized as hit, guard, reject, override, reversal, pause, round, or runtime.
- Combat reason evidence for hit, guard, whiff, reject, override, and reversal when the trace gate depends on combat behavior.
- Match-pause snapshot evidence for `Pause`/`SuperPause` gates, including source actor/state, darken, remaining frames, source `movetime`, frozen actor/effect evidence when the gate depends on opponent or effect freeze, and actor/effect advance evidence when the gate depends on source `movetime`.
- `MatchWorld` lifecycle event evidence for actor/effect spawn, active, and remove when the gate depends on world ownership.
- `RuntimeEffectActorWorld` store evidence for owner/family counts and serial progression when a gate depends on helper/projectile/explod ownership.
- A note when evidence covers only native generated fighters instead of imported MUGEN fixtures.

`RuntimeTrace` is the current in-process harness for this. `evaluateRuntimeTraceGate` turns a trace into explicit pass/fail evidence for actor sources/kinds, effect kinds, routed states, executed states, executed controllers, executed typed operations, active commands, event categories, combat reasons, match-pause snapshots, match-pause actor/effect advance and freeze evidence, world lifecycle events, effect actor stores, target links, and final actor state/control requirements. `RuntimeTraceArtifact` packages the trace checksum, per-frame summaries, final actors/effects, events, combat reasons, script, gate requirements, gate evidence, and gate results into `runtime-trace-artifact/v0` JSON. Studio Build can export a smoke trace artifact for the selected playtest setup, and Studio Evidence can filter recent in-session trace artifacts with related gate/asset/compile/compatibility/diagnostic records. Studio Evidence also keeps a bounded browser-local trace history, compares persisted artifacts against the current trace by checksum plus frame/event/gate/pass deltas, shows a first Trace Comparison Review for metrics and gate rows, and exposes a basic Trace Frame Scrubber; rollback, netplay, and full replay remain future work.

`pnpm qa:trace` is the repeatable trace gate command. It writes artifacts to `.scratch/qa/trace-gates/`:

- `native-hit.json`: required native generated-roster hit route with hit combat reason evidence.
- `native-whiff.json`: required native generated-roster active-Clsn1 whiff route with inferred whiff combat reason evidence.
- `synthetic-imported-x.json`: required imported CMD/CNS State -1 `x -> 200` route with `HitDef`, typed `hitdef` operation, hit event, and hit combat reason evidence.
- `synthetic-imported-reject.json`: required imported CMD/CNS State -1 `x -> 200` route where contact is rejected by `HitBy`/`NotHitBy`, while still proving typed `hitdef` operation execution.
- `synthetic-imported-guard.json`: required imported CMD/CNS State -1 `x -> 200` route where held-back defender input turns real `HitDef` contact into guard event and guard combat reason evidence.
- `synthetic-imported-inguarddist.json`: required imported CMD/CNS route where a near-but-not-contacting attack satisfies `InGuardDist`, parses/respects bounded `guard.dist`, and routes an imported defender through guard-start state `130` via an explicit CNS controller while the trace remains a whiff rather than a hit/guard contact. This proves trigger plumbing only, not automatic MUGEN/IKEMEN guard-start, exact proximity guard, or guard-end parity.
- `synthetic-imported-auto-guard-start.json`: required imported CMD/CNS route where a near-but-not-contacting attack plus held-back defender input triggers the runtime's bounded automatic guard-start rule and enters defender-owned Common1-style states `120 -> 130` before contact. This proves the first automatic guard-start bridge only, not exact proximity guard, guard end, guard effects, air guard, or full MUGEN/IKEMEN guard parity.
- `synthetic-imported-auto-guard-end.json`: required imported CMD/CNS route where the same bounded auto guard-start path later exits through defender-owned Common1-style state `140` and returns to `0`/control after `InGuardDist` is no longer true. This proves the first automatic guard-end bridge only, not exact guard-end timing, proximity guard, guard effects, air guard, or full MUGEN/IKEMEN guard parity.
- `synthetic-imported-default-guard-state.json`: required imported CMD/CNS State -1 `x -> 200` route where a held-back imported defender blocks a HitDef and enters its own Common1-style stand guard-hit states `150 -> 151`, including `HitVelSet` controller evidence. This proves bounded stand guard-hit state routing only, not proximity guard, guard-start/end, crouch/air guard transitions, sparks, sounds, or exact MUGEN/IKEMEN guard parity.
- `synthetic-imported-crouch-guard-state.json`: required imported CMD/CNS State -1 `x -> 200` route where a held-down-back imported defender blocks a HitDef, evaluates a Common1-style composite command expression such as `151 + 2*(command = "holddown")`, and enters crouch guard-hit state `153` through `152 -> 153`. This proves bounded crouch branch plumbing only, not exact proximity guard, guard-start/end, guard effects, air guard, or full crouch guard parity.
- `synthetic-imported-hitstun.json`: required imported CMD/CNS State -1 `x -> 200` route where the target final actor evidence reaches the sandbox's current partial get-hit snapshot (`animNo=500`, `moveType=H`).
- `synthetic-imported-fall.json`: required imported CMD/CNS State -1 `x -> 200` route where simple `fall.*` HitDef params survive into final target `hitFall` evidence. This proves metadata capture only, not common-state, bounce, liedown, or recovery parity.
- `synthetic-imported-common-gethit.json`: required imported CMD/CNS State -1 `x -> 200` route where `p2stateno` sends the defender into an attacker-owned custom get-hit state and partial `HitFallVel`, `HitFallDamage`, `HitFallSet`, and `FallEnvShake` controllers execute with `hitfall:*` and `fallenvshake` typed operation evidence. This proves controller-flow plumbing only, not KFM/Common1 fall, bounce, liedown, or recovery parity.
- `synthetic-imported-default-gethit.json`: required imported CMD/CNS State -1 `x -> 200` route where a `HitDef` without `p2stateno` routes an imported defender into its own Common1-style state `5000`. This proves defender-owned default get-hit entry only, not exact `HitShakeOver`, `HitOver`, bounce, liedown, or recovery parity.
- `synthetic-imported-default-gethit-progression.json`: required imported CMD/CNS State -1 `x -> 200` route where `HitShakeOver` advances defender-owned state `5000` into `5001` and `HitOver` returns the defender to state `0` with control. This proves the bounded stand get-hit progression only, not fall, bounce, liedown, air recovery, or guard-state parity.
- `synthetic-imported-default-fall-gethit.json`: required imported CMD/CNS State -1 `x -> 200` route where a fall HitDef without `p2stateno` branches a defender-owned Common1-style state from `5000` into `5030` and `5050`. This proves the bounded airborne fall branch only, not ground-impact `5100`, bounce, liedown, recovery input, or guard-state parity.
- `synthetic-imported-default-fall-recovery.json`: required imported CMD/CNS State -1 `x -> 200` route where a bounded defender-owned Common1-style fall chain executes `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0`. This proves runtime preservation of imported get-hit states through bounce, lie-down, and get-up plumbing, not official KFM parity, exact tick-order parity, recovery-input command branching, or engine-perfect bounce physics.
- `synthetic-imported-default-fall-recovery-input.json`: required imported CMD/CNS State -1 `x -> 200` route where `fall.recover = 1`, `fall.recovertime` counts down, `CanRecover` becomes true, and defender input `x+y` activates `command = "recovery"` to route a bounded Common1-style fall state from `5050` into `5210` before returning to idle/control. This proves the current synthetic recovery-input branch only, not official KFM ground-recovery `5200/5201`, exact ground/air thresholds, exact velocities, or tick-order parity.
- `synthetic-imported-state-exit.json`: required imported CMD/CNS State -1 `x -> 200` route where the attack hits, finishes recovery, and final P1 evidence returns to idle/control (`stateNo=0`, `animNo=0`, `ctrl=true`).
- `synthetic-imported-target.json`: required imported CMD/CNS target-memory route with typed `hitdef` plus `target:*` operation evidence for `TargetLifeAdd`, `TargetPowerAdd`, `TargetVelSet`, `TargetVelAdd`, `TargetFacing`, `TargetBind`, and `TargetDrop`.
- `synthetic-imported-superpause.json`: required imported CMD/CNS State -1 `x -> 200` route where `SuperPause` compiles into typed `pause:superpause` operation evidence, emits a pause runtime event, preserves a `matchPause` snapshot for actor/state/darken/remaining/movetime evidence, and proves the opponent actor remains frozen across the pause window.
- `synthetic-imported-superpause-projectile-freeze.json`: required imported CMD/CNS State -1 `x -> 200` route where `Projectile` and `SuperPause` execute together, the projectile effect actor spawns through `MatchWorld` lifecycle/store evidence, `requiredMatchPauseAdvances` proves the `p1` projectile effect advances while the source `movetime` is active, and `requiredMatchPauseFreezes` proves it remains frozen afterward during the bounded pause window.
- `synthetic-imported-projectile.json`: required imported CMD/CNS State -1 `x -> 200` route where `Projectile` compiles into typed `projectile` operation evidence, spawns and removes a colliding projectile effect actor through required `MatchWorld` lifecycle events, proves the `p1` effect store produced a projectile, produces hit event/combat reason evidence, and leaves world-visible projectile target-memory evidence through `targetLinks`. This proves the bounded projectile actor lifecycle plus target-memory path only, not exact priority classes, remove/cancel animations, or full projectile parity.
- `synthetic-imported-projectile-guard.json`: required imported CMD/CNS State -1 `x -> 200` route where the same bounded `Projectile` actor carries typed guard params and a held-back defender blocks it through the shared partial hit/guard combat resolver, producing guard event/combat reason evidence plus projectile target-link evidence. This proves bounded projectile guard resolution only, not exact priority classes, exact guard-state timing, sparks, sounds, remove/cancel animations, or full projectile parity.
- `synthetic-imported-projectile-clash.json`: required imported CMD/CNS State -1 route where both imported players fire equal-`projpriority` projectiles, both projectiles spawn through `MatchWorld` lifecycle/store evidence, and a runtime event substring proves the bounded projectile clash trade/removal path. This proves only the current equal-priority projectile-vs-projectile subset, not exact MUGEN/IKEMEN priority classes, cancel/remove animations, helper-owned projectiles, or full projectile parity.
- `synthetic-imported-helper.json`: required imported CMD/CNS State -1 `x -> 200` route where `Helper` compiles into typed `helper` operation evidence and produces required `MatchWorld` spawn/active lifecycle plus `p1` helper-store evidence for a bounded visual helper effect actor. This proves visual helper actor plumbing only, not helper VM, redirects, key control, helper combat, parent/root binding beyond current metadata, `DestroySelf`, removal, or pause parity.
- `synthetic-imported-explod.json`: required imported CMD/CNS State -1 `x -> 200` route where `Explod` compiles into typed `explod` operation evidence and produces required `MatchWorld` spawn/active lifecycle plus `p1` explod-store evidence for a bounded visual explod effect actor. This proves visual explod actor plumbing only, not binding, velocity, scaling, ownpal/remappal, FightFX/common animation routing, or remove-trigger parity.
- `kfm-official-x.json`: optional official KFM `x -> 200` route when `.scratch/fixtures/kfm-official.zip` exists.
- `kfm-official-qcf-x.json`: optional official KFM `QCF_x -> 1000` route when `.scratch/fixtures/kfm-official.zip` exists.
- `kfm-official-x-guard.json`: optional official KFM `x -> 200` route with held-back guard event/combat reason evidence when `.scratch/fixtures/kfm-official.zip` exists.
- `kfm-official-default-guard-state.json`: optional trace where a synthetic imported HitDef without `p2stateno` is guarded by official KFM as defender and proves real Common1 stand guard-hit states `150 -> 151` execute. This proves the current guarded stand state route only, not exact guard distance, guard-start/end, crouch/air guard transitions, or guard effect parity.
- `kfm-official-default-crouch-guard-state.json`: optional trace where official KFM blocks while holding down-back and proves the real Common1 crouch guard-hit route reaches `153` through the same composite `command = "holddown"` expression shape. This proves bounded KFM crouch branch evidence only, not exact guard distance, guard-start/end, sparks, sounds, air guard, or complete guard parity.
- `kfm-official-auto-guard-start.json`: optional trace where official KFM as defender enters its real Common1 guard-start route from held-back input plus bounded `InGuardDist` before contact. This proves only the current automatic guard-start bridge against the local official fixture, not exact proximity guard, guard end, sparks, sounds, air guard, or IKEMEN parity.
- `kfm-official-auto-guard-end.json`: optional trace where official KFM as defender leaves its real Common1 guard route through state `140` and returns to idle/control after bounded `InGuardDist` is no longer true. This proves only the current automatic guard-end bridge against the local official fixture, not exact guard-end timing, proximity guard, sparks, sounds, air guard, or IKEMEN parity.
- `kfm-official-x-hitstun.json`: optional official KFM `x -> 200` hit route that proves the target reaches the current partial hitstun/get-hit snapshot when `.scratch/fixtures/kfm-official.zip` exists.
- `kfm-official-default-gethit.json`: optional trace where a synthetic imported HitDef without `p2stateno` hits official KFM as defender and proves KFM's real Common1 state `5000` executes. The separate `kfm-official-x.json` gate covers KFM's own state `200` HitDef route.
- `kfm-official-default-gethit-progression.json`: optional trace where official KFM as defender executes real Common1 `5000 -> 5001 -> 0` through `HitShakeOver` and `HitOver` after a HitDef without `p2stateno`.
- `kfm-official-default-fall-gethit.json`: optional trace where official KFM as defender executes real Common1 `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110` after a fall HitDef without `p2stateno`. This proves the current ground-impact, first bounce-state entry, and lie-down entry only, not get-up/recovery input, state `5120` completion, or guard-state parity.
- `kfm-official-default-fall-recovery.json`: optional trace where official KFM as defender continues from real Common1 lie-down `5110` into get-up state `5120` and returns to `0` with control after a fall HitDef without `p2stateno`. The current local fixture artifact executes `0, 200, 5000, 5030, 5035, 5050, 5100, 5101, 5110, 5120` plus `HitFallSet` and ends with KFM idle/control. This proves the bounded get-up completion route only, not exact tick-order parity, recovery-input branching, or guard-state parity.
- `kfm-official-default-fall-recovery-input.json`: optional trace where official KFM as defender receives a recoverable fall HitDef, `CanRecover` becomes true, defender input `x+y` activates `command = "recovery"`, and real Common1 states execute `5050 -> 5210 -> 52 -> 0` before final idle/control. The current local fixture artifact executes `52, 200, 5000, 5030, 5050, 5210` with active commands `x`, `y`, and `recovery`, checksum `e9a28c13`. This proves the bounded official air recovery-input route only, not exact recovery thresholds/velocities, tick-order parity, or guard-state parity.
- `kfm-official-default-fall-ground-recovery.json`: optional trace where official KFM as defender receives a recoverable fall HitDef, `CanRecover` becomes true near the ground, defender input `x+y` activates `command = "recovery"`, and real Common1 states execute `5050 -> 5200 -> 5201 -> 52 -> 0` before final idle/control. The current local fixture artifact executes `0, 52, 200, 5000, 5030, 5050, 5200, 5201` with `SelfState`, `VelSet`, and `PosSet` controller evidence plus active commands `x`, `y`, and `recovery`, checksum `7894f132`. This proves the bounded official ground recovery-input route only, not exact recovery thresholds/velocities, tick-order parity, or guard-state parity.
- `kfm-official-x-state-exit.json`: optional official KFM `x -> 200` hit route that runs enough recovery frames to prove final P1 returns to idle/control when `.scratch/fixtures/kfm-official.zip` exists.
- `diagnostics.json`: summary of passed artifacts and skipped optional fixtures.

## Playable MVP Acceptance

The Playable MVP requires:

- Default Runtime Mode playable without imported assets.
- At least three selectable local fighters with visible atlas QA.
- At least one native stage and one imported stage path.
- At least one official KFM imported runtime route.
- Inspector Mode with animation playback and collision overlays.
- Compatibility export covering character, stage, runtime roster, and runtime session.
- No crash on unsupported features from the fixture matrix.

## Creator Studio Acceptance

The later studio MVP requires:

- A project manifest can be created, loaded, and saved locally.
- Asset Library shows imported and generated assets with validation state.
- Character Studio can preview actions/collision boxes for at least one imported and one generated character.
- Stage Studio can preview one native and one imported stage.
- Playtest launcher starts Runtime Mode from project selections.
- Studio state is editor/project data, not hidden renderer state.
- Existing MUGEN compatibility reports remain available from the studio surfaces.

## Regression Checklist

Before closing a broad compatibility task, confirm:

- File loading still accepts ZIP and folder input.
- Runtime URL params still select mode, fighters, and stage.
- Collision overlays still align with rendered sprites.
- Debug panels do not overflow or hide critical values.
- Compatibility JSON still includes unsupported feature counts.
- External fixture assets remain under `.scratch/` or another ignored path.
