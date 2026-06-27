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
| `/?mode=studio&studio=workbench&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo` | Workbench command center screenshot; project readiness lanes; operator priority; surface jump buttons for Assets/Evidence/Build/Debug; primary actions for Playtest, MUGEN ZIP intake, trace export, and runtime compile; no horizontal overflow on desktop or 1024px tablet layout; visible stage status; command palette opens with search focus, traps keyboard focus, closes on Escape, and restores focus to the launcher. |
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
  studio-workbench-tablet.png
  studio-command-palette.png
  studio-build.png
  studio-assets.png
  studio-evidence.png
  studio-debug.png
  studio-debug-pause.png
  studio-debug-evidence-mobile.png
  trace-artifact.json
```

The command starts a local Vite server automatically. Set `QA_BASE_URL=http://host:port` to verify an already-running app instead.

Feature-specific milestone closeout can still use focused Playwright scripts when a deeper fixture or interaction is required, but `pnpm qa:smoke` is now the first reusable gate for the default Runtime and Studio Build/Evidence paths. Runtime Debug Studio smoke also validates URL-backed debug lenses, including the effects drilldown contract and the Pause / HitPause panel contract even when no live effect or active hitpause frame is captured.

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
- Typed controller-operation evidence where the gate depends on compiled IR side effects such as `HitDef`, `HitVelSet`, `AttackMulSet`/`DefenceMulSet`, `Target*`, `Pause`/`SuperPause`, `Projectile`, `Helper`, or `Explod`.
- New runtime log events categorized as hit, guard, reject, override, reversal, pause, round, or runtime.
- Combat reason evidence for hit, guard, whiff, reject, override, and reversal when the trace gate depends on combat behavior.
- Match-pause snapshot evidence for `Pause`/`SuperPause` gates, including source actor/state, darken, remaining frames, source `movetime`, frozen actor/effect evidence when the gate depends on opponent or effect freeze, and actor/effect advance evidence when the gate depends on source `movetime`; hitpause actor/effect freeze/advance evidence when the gate depends on `ignorehitpause`.
- Target-link evidence for `Target*` gates, including active binding metadata when the gate depends on a bound target surviving a pause or source-movetime path.
- `MatchWorld` lifecycle event evidence for actor/effect spawn, active, and remove when the gate depends on world ownership.
- `RuntimeEffectActorWorld` store evidence for owner/family counts and serial progression when a gate depends on helper/projectile/explod ownership.
- Effect-payload evidence for typed helper/projectile/explod fields when a gate depends on concrete runtime payload data such as helper id/name/state, projectile hit/removal/terminal metadata, or Explod bind/scale/pause flags.
- Actor-frame evidence for effect motion, scaling, or custom-state ownership gates, including observed min/max position, velocity, scale, and `customOwnerId` where relevant.
- A note when evidence covers only native generated fighters instead of imported MUGEN fixtures.

`RuntimeTrace` is the current in-process harness for this. `evaluateRuntimeTraceGate` turns a trace into explicit pass/fail evidence for actor sources/kinds, effect kinds, routed states, executed states, executed controllers, executed typed operations, active commands, event categories, combat reasons, match-pause snapshots, match-pause actor/effect advance and freeze evidence, world lifecycle events, effect actor stores, effect payloads, target links, actor-frame/final-actor `customOwnerId`, and final actor state/control/life requirements. `RuntimeTraceArtifact` packages the trace checksum, per-frame summaries, typed `Explod`/`Helper`/`Projectile` effect payload summaries, effect-payload field deltas, final actors/effects, events, combat reasons, script, gate requirements, gate evidence, and gate results into `runtime-trace-artifact/v0` JSON while leaving those payload summaries out of behavior checksums. `pnpm qa:trace` also writes `diagnostics.json` with a `coverage` matrix for controller families, typed operations, effect kinds, combat reasons, match-pause advance/freeze routes, world lifecycle routes, target-link routes, effect-store routes, effect-payload kinds, and effect-payload delta routes; that coverage matrix is itself gated for the current critical runtime spine (`hitdef`, `kinematic:hitvelset`, `target:targetbind`, `pause:superpause`, `projectile`, `helper`, `explod`, `reversaldef`, `damage-scale:attackmulset`, `damage-scale:defencemulset`, the bounded direct `HitDef` priority and nonlethal kill/NoKO artifacts, bounded `projectile:hits` / `projectile:removal` / `projectile:terminal` / `explod:bindRemaining` payload deltas, required `requiredEffectPayloads` for Projectile/Helper/Explod golden routes, and the bounded SuperPause actor/effect routes). Studio Build can export a smoke trace artifact for the selected playtest setup, and Studio Evidence can filter recent in-session trace artifacts with related gate/asset/compile/compatibility/diagnostic records. Studio Evidence also keeps a bounded browser-local trace history, compares persisted artifacts against the current trace by checksum plus frame/event/gate/pass deltas, shows a first Trace Comparison Review for metrics and gate rows, and exposes a basic Trace Frame Scrubber; rollback, netplay, and full replay remain future work.

`pnpm qa:trace` is the repeatable trace gate command. It writes artifacts to `.scratch/qa/trace-gates/`:

- `native-hit.json`: required native generated-roster hit route with hit combat reason evidence.
- `native-whiff.json`: required native generated-roster active-Clsn1 whiff route with inferred whiff combat reason evidence.
- `synthetic-imported-x.json`: required imported CMD/CNS State -1 `x -> 200` route with `HitDef`, typed `hitdef` operation, hit event, hit combat reason evidence, and a bounded `MoveHit` owner-state branch into state `261`.
- `synthetic-imported-movecontact.json`: required imported CMD/CNS State -1 `x -> 200` route with direct HitDef contact and a bounded `MoveContact` owner-state branch into state `262`. This proves direct contact-trigger plumbing only, not exact first-tick timing or lifetime parity.
- `synthetic-imported-reject.json`: required imported CMD/CNS State -1 `x -> 200` route where contact is rejected by `HitBy`/`NotHitBy`, while still proving typed `hitdef` operation execution.
- `synthetic-imported-reversal.json`: required imported CMD/CNS State -1 `x -> 200` route where a defender-side `ReversalDef` with active `Clsn1` counters a matching incoming `HitDef`, records typed `reversaldef` operation evidence, emits reversal event/combat reason evidence, and routes the defender into state `777`. This proves bounded counter plumbing only, not exact reversal priority, guard/projectile/helper/custom-state interactions, or full MUGEN/IKEMEN parity.
- `synthetic-imported-damage-scale.json`: required imported CMD/CNS State -1 `x -> 200` route where static `AttackMulSet` and `DefenceMulSet` compile into typed `damage-scale:*` operations, execute before a `HitDef`, and produce final target life evidence for the bounded scaled-damage result. This proves current outgoing/incoming multiplier plumbing only, not exact MUGEN/IKEMEN scaling order across helpers, projectiles, guards, custom states, or round edge cases.
- `synthetic-imported-hitdef-priority.json`: required imported CMD/CNS route where both imported players activate direct `HitDef` attacks on the same tick, the higher numeric `priority` wins the bounded clash, the lower-priority direct attack is consumed before it can deal damage, and final life/event evidence proves only the winner hits. This proves only the current direct-attack priority subset, not exact MUGEN/IKEMEN priority classes, reversal/projectile/helper/custom-state priority, or multi-hit priority.
- `synthetic-imported-hitdef-kill.json`: required imported CMD/CNS route where a lethal direct `HitDef` with `kill = 0` leaves the defender at life `1`. This proves only the bounded nonlethal direct-hit clamp, not exact KO, round, no-KO, helper, projectile, or custom-state semantics.
- `synthetic-imported-hitdef-guard-kill.json`: required imported CMD/CNS route where a lethal guarded `HitDef` with `guard.kill = 0` leaves the defender at life `1` while still producing guard evidence. This proves only the bounded nonlethal chip clamp, not exact guard KO/round, guard effects, helper/projectile guard, or full MUGEN/IKEMEN parity.
- `synthetic-imported-assertspecial-noko.json`: required imported CMD/CNS route where defender-side `AssertSpecial NoKO` clamps lethal direct `HitDef` damage to life `1`. This proves only the bounded defender-side NoKO clamp, not exact round flow, KO flags, helpers, projectiles, custom states, shadows, or full MUGEN/IKEMEN no-KO parity.
- `synthetic-imported-guard.json`: required imported CMD/CNS State -1 `x -> 200` route where held-back defender input turns real `HitDef` contact into guard event/combat reason evidence and evaluates a bounded `MoveGuarded` branch back in the owner state. This proves guard contact-trigger plumbing only, not exact guard timing, pause timing, or full MUGEN/IKEMEN contact-trigger parity.
- `synthetic-imported-inguarddist.json`: required imported CMD/CNS route where a near-but-not-contacting attack satisfies `InGuardDist`, parses/respects bounded `guard.dist`, and routes an imported defender through guard-start state `130` via an explicit CNS controller while the trace remains a whiff rather than a hit/guard contact. This proves trigger plumbing only, not automatic MUGEN/IKEMEN guard-start, exact proximity guard, or guard-end parity.
- `synthetic-imported-auto-guard-start.json`: required imported CMD/CNS route where a near-but-not-contacting attack plus held-back defender input triggers the runtime's bounded automatic guard-start rule and enters defender-owned Common1-style states `120 -> 130` before contact. This proves the first automatic guard-start bridge only, not exact proximity guard, guard end, guard effects, air guard, or full MUGEN/IKEMEN guard parity.
- `synthetic-imported-auto-guard-end.json`: required imported CMD/CNS route where the same bounded auto guard-start path later exits through defender-owned Common1-style state `140` and returns to `0`/control after `InGuardDist` is no longer true. This proves the first automatic guard-end bridge only, not exact guard-end timing, proximity guard, guard effects, air guard, or full MUGEN/IKEMEN guard parity.
- `synthetic-imported-default-guard-state.json`: required imported CMD/CNS State -1 `x -> 200` route where a held-back imported defender blocks a HitDef and enters its own Common1-style stand guard-hit states `150 -> 151`, including typed `kinematic:hitvelset` operation evidence. This proves bounded stand guard-hit state routing only, not proximity guard, guard-start/end, crouch/air guard transitions, sparks, sounds, or exact MUGEN/IKEMEN guard parity.
- `synthetic-imported-crouch-guard-state.json`: required imported CMD/CNS State -1 `x -> 200` route where a held-down-back imported defender blocks a HitDef, evaluates a Common1-style composite command expression such as `151 + 2*(command = "holddown")`, and enters crouch guard-hit state `153` through `152 -> 153`. This proves bounded crouch branch plumbing only, not exact proximity guard, guard-start/end, guard effects, air guard, or full crouch guard parity.
- `synthetic-imported-diagonal-crouch-guard-state.json`: required imported CMD/CNS State -1 `x -> 200` route where atomic `DB` input, without separate `B`/`D` samples, still counts as held-back plus held-down for bounded guard detection and Common1-style `holdback`/`holddown` command checks. This proves diagonal-input normalization for the current runtime only, not exact MUGEN/IKEMEN input conflict or guard parity.
- `synthetic-imported-air-guard-state.json`: required imported CMD/CNS State -1 `x -> 200` route where an airborne held-back imported defender blocks an `A`-guardable HitDef, enters Common1-style air guard-hit states `154 -> 155`, executes `HitVelSet`, `VelAdd`, and `CtrlSet`, and returns to a grounded idle/control snapshot. This proves bounded air guard-hit landing/control routing only, not exact air guard physics, sparks, sounds, proximity guard, or full MUGEN/IKEMEN guard parity.
- `synthetic-imported-hitstun.json`: required imported CMD/CNS State -1 `x -> 200` route where the target final actor evidence reaches the sandbox's current partial get-hit snapshot (`animNo=500`, `moveType=H`).
- `synthetic-imported-fall.json`: required imported CMD/CNS State -1 `x -> 200` route where simple `fall.*` HitDef params survive into final target `hitFall` evidence. This proves metadata capture only, not common-state, bounce, liedown, or recovery parity.
- `synthetic-imported-common-gethit.json`: required imported CMD/CNS State -1 `x -> 200` route where `p2stateno` sends the defender into an attacker-owned custom get-hit state and partial `HitFallVel`, `HitFallDamage`, `HitFallSet`, and `FallEnvShake` controllers execute with `hitfall:*` and `fallenvshake` typed operation evidence. This proves controller-flow plumbing only, not KFM/Common1 fall, bounce, liedown, or recovery parity.
- `synthetic-imported-default-gethit.json`: required imported CMD/CNS State -1 `x -> 200` route where a `HitDef` without `p2stateno` routes an imported defender into its own Common1-style state `5000`. This proves defender-owned default get-hit entry only, not exact `HitShakeOver`, `HitOver`, bounce, liedown, or recovery parity.
- `synthetic-imported-default-gethit-progression.json`: required imported CMD/CNS State -1 `x -> 200` route where `HitShakeOver` advances defender-owned state `5000` into `5001` and `HitOver` returns the defender to state `0` with control. This proves the bounded stand get-hit progression only, not fall, bounce, liedown, air recovery, or guard-state parity.
- `synthetic-imported-default-fall-gethit.json`: required imported CMD/CNS State -1 `x -> 200` route where a fall HitDef without `p2stateno` branches a defender-owned Common1-style state from `5000` into `5030` and `5050`. This proves the bounded airborne fall branch only, not ground-impact `5100`, bounce, liedown, recovery input, or guard-state parity.
- `synthetic-imported-default-fall-recovery.json`: required imported CMD/CNS State -1 `x -> 200` route where a bounded defender-owned Common1-style fall chain executes `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0`. This proves runtime preservation of imported get-hit states through bounce, lie-down, and get-up plumbing, not official KFM parity, exact tick-order parity, recovery-input command branching, or engine-perfect bounce physics.
- `synthetic-imported-default-fall-recovery-input.json`: required imported CMD/CNS State -1 `x -> 200` route where `fall.recover = 1`, `fall.recovertime` counts down, `CanRecover` becomes true, and defender input `x+y` activates `command = "recovery"` to route a bounded Common1-style fall state from `5050` into `5210` before returning to idle/control. This proves the current synthetic recovery-input branch only, not official KFM ground-recovery `5200/5201`, exact ground/air thresholds, exact velocities, or tick-order parity.
- `synthetic-imported-state-exit.json`: required imported CMD/CNS State -1 `x -> 200` route where the attack hits, finishes recovery, and final P1 evidence returns to idle/control (`stateNo=0`, `animNo=0`, `ctrl=true`).
- `synthetic-imported-custom-state.json`: required imported CMD/CNS route where both fighters are synthetic imported definitions, `HitDef p2stateno = 888` with `p2getp1state = 1` routes P2 into a P1-owned custom state, P1-owned `ChangeState` chains P2 to state/action `889`, and `SelfState` returns P2 to state `0` with control. Current checksum: `bf632df3`. This proves only the bounded two-actor owner-backed custom-state entry/chain/return path through actor-frame `customOwnerId = p1` evidence, not throws, redirects, helpers/root/parent ownership, teams, or exact tick order.
- `synthetic-imported-targetstate-custom.json`: required imported CMD/CNS route where direct `HitDef` target memory feeds typed `TargetState value = 888`, routes P2 into P1-owned state data, P1-owned `ChangeState` chains P2 to state/action `889`, and `SelfState` returns P2 to state `0` with control. Current checksum: `fedaf0a4`. This proves only the bounded two-actor TargetState owner-backed custom-state route through target-link plus actor-frame `customOwnerId = p1` evidence, not throws, redirects, helpers/root/parent ownership, teams, or exact tick order.
- `synthetic-imported-target.json`: required imported CMD/CNS target-memory route with typed `hitdef`, `bindtotarget`, and `target:*` operation evidence for `TargetLifeAdd`, `TargetPowerAdd`, `TargetVelSet`, `TargetVelAdd`, `TargetFacing`, `TargetBind`, `BindToTarget`, and `TargetDrop`; it now also requires final P1 `targetCount = 0` so TargetDrop cleanup is visible in gate evidence.
- `synthetic-imported-bindtotarget-head.json`: required imported CMD/CNS route where both fighters are synthetic imported definitions, the target parses `[Size] head.pos = 6,-72`, `BindToTarget pos = 20,-8,Head` executes after real `HitDef` target memory, and `MatchWorld.targetLinks` exposes the resolved owner-to-target binding offset `26,-80`. Current checksum: `474deaa2`. This proves only the bounded two-actor Head anchor path, not redirects, helper/root/parent target ownership, teams, exact bind tick order, or full throw/custom-state parity.
- `synthetic-imported-bindtotarget-mid.json`: required imported CMD/CNS route where both fighters are synthetic imported definitions, the target parses `[Size] mid.pos = 4,-42`, `BindToTarget pos = 20,-8,Mid` executes after real `HitDef` target memory, and `MatchWorld.targetLinks` exposes the resolved owner-to-target binding offset `24,-50`. Current checksum: `c65ebf56`. This proves only the bounded two-actor Mid anchor path, not redirects, helper/root/parent target ownership, teams, exact bind tick order, or full throw/custom-state parity.
- `synthetic-imported-numtarget.json`: required imported CMD/CNS State -1 `x -> 200` route where direct `HitDef` target memory makes `NumTarget(77) > 0` true and branches back in the owner state to `263`. This proves bounded target-memory trigger plumbing only, not redirect stacks, helper ownership, multi-target teams, exact target lifetime, or full MUGEN/IKEMEN target parity.
- `synthetic-imported-numhelper.json`: required imported CMD/CNS State -1 `x -> 200` route where a visual `Helper` spawn makes `NumHelper(42) > 0` true and branches back in the owner state to `264`. This proves bounded helper-count trigger plumbing only, not helper VM execution, redirects, keyctrl, parent/root semantics, helper combat, or full Helper parity.
- `synthetic-imported-numproj.json`: required imported CMD/CNS State -1 `x -> 200` route where a colliding `Projectile` spawn makes `NumProjID(77) > 0` true and branches back in the owner state to `273`. This proves bounded projectile-count trigger plumbing only, not exact projectile lifetime/count parity, helper-owned projectiles, redirects, multi-projectile teams, or full Projectile parity.
- `synthetic-imported-numexplod.json`: required imported CMD/CNS State -1 `x -> 200` route where a visual `Explod` spawn makes `NumExplod(9000) > 0` true and branches back in the owner state to `274`. This proves bounded explod-count trigger plumbing only, not Explod binding, remove triggers, FightFX/common animation routing, exact scaling parity, ownpal/remappal, or exact lifetime parity.
- `synthetic-imported-removeexplod.json`: required imported CMD/CNS State -1 `x -> 200` route where a visual `Explod` spawns, `RemoveExplod id = 9000` executes, MatchWorld emits an explod `remove` lifecycle event, and the final frame has no P1 Explod actors. This proves bounded id removal only, not advanced remove triggers, binding, FightFX/common animation routing, or exact lifetime parity.
- `synthetic-imported-explod-velocity.json`: required imported CMD/CNS State -1 `x -> 200` route where a visual `Explod` consumes bounded `vel`/`accel` params and actor-frame evidence records observed position/velocity movement. This proves bounded visual movement only, not exact bind/tick-order parity, exact lifetime/physics parity, exact scaling parity, ownpal/remappal, or FightFX/common animation routing.
- `synthetic-imported-explod-bind.json`: required imported CMD/CNS State -1 `x -> 200` route where a visual `Explod` consumes bounded `bindtime`, the source state executes `PosAdd`, and actor-frame evidence records the Explod following owner movement. This proves bounded owner-side `p1`/`front`/`back` bind plumbing only, not `p2` binding, exact tick order, exact lifetime/physics parity, exact scaling parity, ownpal/remappal, or FightFX/common animation routing.
- `synthetic-imported-explod-scale.json`: required imported CMD/CNS State -1 `x -> 200` route where a visual `Explod` consumes bounded `scale = 2,0.5`, renderer snapshots expose `renderScale`, projection scales the sprite/collision-space boxes around the sprite axis, and actor-frame evidence records observed scale. This proves bounded static scale only, not exact MUGEN/IKEMEN scaling parity, palette ownership, FightFX/common animation routing, shadow/blend edge cases, or tick-order interactions.
- `synthetic-imported-targetbind-pause.json`: required imported CMD/CNS route where a real `HitDef` creates target memory, `TargetBind` executes from that target during source `SuperPause` movetime, `PosAdd` moves the source actor, and the bound target remains offset through `MatchWorld.targetLinks` plus `matchPauseAdvances` evidence. This proves only the bounded two-actor TargetBind + SuperPause movetime path, not throws, helper-owned targets, redirect stacks, or exact MUGEN/IKEMEN target persistence.
- `synthetic-imported-superpause.json`: required imported CMD/CNS State -1 `x -> 200` route where `SuperPause` compiles into typed `pause:superpause` operation evidence, emits a pause runtime event, preserves a `matchPause` snapshot for actor/state/darken/remaining/movetime evidence, and proves the opponent actor remains frozen across the pause window.
- `synthetic-imported-superpause-projectile-freeze.json`: required imported CMD/CNS State -1 `x -> 200` route where `Projectile` and `SuperPause` execute together, the projectile effect actor spawns through `MatchWorld` lifecycle/store evidence, `requiredMatchPauseAdvances` proves the `p1` projectile effect advances while the source `movetime` is active, and `requiredMatchPauseFreezes` proves it remains frozen afterward during the bounded pause window.
- `synthetic-imported-superpause-effect-freeze.json`: required imported CMD/CNS State -1 `x -> 200` route where `Helper`, `Explod`, and `SuperPause` execute together, helper/explod actors spawn through `MatchWorld` lifecycle/store evidence, `requiredMatchPauseAdvances` proves source-owned helper/explod actors advance while source `movetime` is active, and `requiredMatchPauseFreezes` proves both freeze afterward during the bounded pause window. This proves visual effect actor pause evidence only, not Helper VM, Explod binding/removal parity, exact pause layering, or IKEMEN/MUGEN effect parity.
- `synthetic-imported-explod-ignorehitpause.json`: required imported CMD/CNS State -1 `x -> 200` route where two visual Explods spawn before a direct hit, one Explod freezes during hitpause, the second Explod with `ignorehitpause = 1` advances through hitpause, and MatchWorld store/lifecycle evidence proves both actors were produced by the P1 effect store. Current checksum: `f26fd540`. This proves bounded Explod `ignorehitpause` only, not exact MUGEN/IKEMEN hitpause layering, helper-owned Explods, FightFX/common animation routing, or full pause parity.
- `synthetic-imported-explod-supermovetime.json`: required imported CMD/CNS State -1 `x -> 200` route where two visual Explods and `SuperPause` execute together, one Explod freezes after source `movetime`, the second Explod with `supermovetime = 4` advances after source `movetime`, and MatchWorld store/lifecycle evidence proves both actors were produced by the P1 effect store. Current checksum: `8215716a`. This proves bounded Explod `supermovetime` only, not regular `Pause` behavior, helper-owned Explods, FightFX/common animation routing, or full MUGEN/IKEMEN pause layering.
- `synthetic-imported-explod-pausemovetime.json`: required imported CMD/CNS State -1 `x -> 200` route where two visual Explods and regular `Pause` execute together, one Explod freezes after source `movetime`, the second Explod with `pausemovetime = 4` advances after source `movetime`, and MatchWorld store/lifecycle evidence proves both actors were produced by the P1 effect store. Current checksum: `f943653e`. This proves bounded Explod `pausemovetime` only, not `SuperPause` layering, helper-owned Explods, FightFX/common animation routing, or full MUGEN/IKEMEN pause layering.
- `synthetic-imported-projectile.json`: required imported CMD/CNS State -1 `x -> 200` route where `Projectile` compiles into typed `projectile` operation evidence, spawns and removes a colliding projectile effect actor through required `MatchWorld` lifecycle events, proves the `p1` effect store produced a projectile, produces hit event/combat reason evidence, leaves world-visible projectile target-memory evidence through `targetLinks`, and evaluates a bounded `ProjHit(77)` branch back in the owner state. This proves the bounded projectile actor lifecycle plus target-memory/contact-trigger path only, not exact priority classes, exact trigger timing, visible remove/cancel animation playback, or full projectile parity.
- `synthetic-imported-projectile-motion.json`: required imported CMD/CNS State -1 `x -> 200` route where `Projectile` consumes bounded `accel` plus `projscale`, spawns through `MatchWorld` lifecycle/store evidence, actor-frame evidence proves velocity changes from acceleration, and renderer-independent `renderScale` evidence proves static projectile scale reaches snapshots. Current checksum: `28fb47b4`. This proves bounded visual projectile motion/scale only, not exact `velmul`, hitbox scaling parity, contact timing, or full MUGEN/IKEMEN projectile parity.
- `synthetic-imported-projectile-velmul.json`: required imported CMD/CNS State -1 `x -> 200` route where `Projectile` consumes bounded `velmul = 0.5,1`, spawns through `MatchWorld` lifecycle/store evidence, and actor-frame evidence proves observed X velocity decay. Current checksum: `50ca5561`. This proves bounded visual velocity multiplier support only, not exact tick-order parity, hitbox scaling parity, contact timing, or full MUGEN/IKEMEN projectile parity.
- `synthetic-imported-projectile-contact.json`: required imported CMD/CNS State -1 `x -> 200` route where `Projectile` contact evaluates a bounded `ProjContact(77)` branch back in the owner state while still proving projectile lifecycle, hit evidence, target-link evidence, and producer-store evidence. This proves projectile contact-trigger plumbing only, not exact trigger timing, multi-target lifetime, helper ownership, or full projectile parity.
- `synthetic-imported-projectile-guard.json`: required imported CMD/CNS State -1 `x -> 200` route where the same bounded `Projectile` actor carries typed guard params, a held-back defender blocks it through the shared partial hit/guard combat resolver, guard event/combat reason evidence plus projectile target-link evidence are produced, and a bounded `ProjGuarded(77)` branch evaluates back in the owner state. This proves bounded projectile guard/contact-trigger resolution only, not exact priority classes, exact trigger timing, exact guard-state timing, sparks, sounds, visible remove/cancel animation playback, or full projectile parity.
- `synthetic-imported-projectile-multihit.json`: required imported CMD/CNS State -1 `x -> 200` route where one bounded `Projectile` actor uses `projhits = 2` and `projmisstime = 3`, hits the same defender twice with a cooldown between contacts, remains active after the first hit, and removes after the second hit. This proves only the current single-target multi-hit/cooldown path, not exact MUGEN/IKEMEN multi-target projectile parity, hitpause layering, terminal playback for this no-terminal-action route, helper-owned projectiles, or full projectile lifecycle parity.
- `synthetic-imported-projectile-clash.json`: required imported CMD/CNS State -1 route where both imported players fire equal-`projpriority` projectiles with `projcancelanim`, both projectiles spawn through `MatchWorld` lifecycle/store evidence, required runtime event substrings prove bounded projectile clash trade/removal plus preserved cancel-animation metadata, and required actor-frame evidence proves bounded visible cancel terminal playback for both removed projectiles. This proves only the current equal-priority projectile-vs-projectile subset, not exact MUGEN/IKEMEN priority classes, exact cancel timing, helper-owned projectiles, or full projectile parity.
- `synthetic-imported-projectile-priority-cancel.json`: required imported CMD/CNS State -1 route where both imported players fire projectiles with different `projpriority` values, both projectiles spawn through `MatchWorld` lifecycle/store evidence, the lower-priority projectile is removed with preserved `projcancelanim` metadata plus bounded visible loser cancel playback, and the higher-priority projectile remains in its producer effect store after decrementing remaining priority by 1. This proves only the current higher-priority cancel/decrement subset, not exact MUGEN/IKEMEN priority classes, exact cancel timing, helper-owned projectiles, or full projectile parity.
- `synthetic-imported-helper.json`: required imported CMD/CNS State -1 `x -> 200` route where `Helper` compiles into typed `helper` operation evidence and produces required `MatchWorld` spawn/active lifecycle plus `p1` helper-store evidence for a bounded visual helper effect actor. This proves visual helper actor plumbing only, not helper VM, redirects, key control, helper combat, parent/root binding beyond current metadata, `DestroySelf`, removal, or pause parity.
- `synthetic-imported-explod.json`: required imported CMD/CNS State -1 `x -> 200` route where `Explod` compiles into typed `explod` operation evidence and produces required `MatchWorld` spawn/active lifecycle plus `p1` explod-store evidence for a bounded visual explod effect actor. This proves visual explod actor plumbing only, not exact binding, exact scaling parity, ownpal/remappal, FightFX/common animation routing, or remove-trigger parity; separate gates cover bounded owner-side `bindtime`, static `scale`, and `vel`/`accel`.
- `kfm-official-x.json`: optional official KFM `x -> 200` route when `.scratch/fixtures/kfm-official.zip` exists.
- `kfm-official-qcf-x.json`: optional official KFM `QCF_x -> 1000` route when `.scratch/fixtures/kfm-official.zip` exists.
- `kfm-official-x-guard.json`: optional official KFM `x -> 200` route with held-back guard event/combat reason evidence when `.scratch/fixtures/kfm-official.zip` exists.
- `kfm-official-default-guard-state.json`: optional trace where a synthetic imported HitDef without `p2stateno` is guarded by official KFM as defender and proves real Common1 stand guard-hit states `150 -> 151` execute. This proves the current guarded stand state route only, not exact guard distance, guard-start/end, crouch/air guard transitions, or guard effect parity.
- `kfm-official-default-crouch-guard-state.json`: optional trace where official KFM blocks while holding down-back and proves the real Common1 crouch guard-hit route reaches `153` through the same composite `command = "holddown"` expression shape. This proves bounded KFM crouch branch evidence only, not exact guard distance, guard-start/end, sparks, sounds, air guard, or complete guard parity.
- `kfm-official-default-air-guard-state.json`: optional trace where official KFM jumps, blocks while holding back, proves real Common1 air guard-hit states `154 -> 155` execute after an `A`-guardable HitDef, executes Common1 `VarSet` system-variable logic, then lands through real Common1 state `52` and returns to grounded control. The current local fixture artifact checksum is `6fdf744d`. This proves bounded KFM air guard-hit landing evidence only, not exact air guard physics, guard-start/end, sparks, sounds, proximity guard, or IKEMEN parity.
- `kfm-official-auto-guard-start.json`: optional trace where official KFM as defender enters its real Common1 guard-start route from held-back input plus bounded `InGuardDist` before contact. This proves only the current automatic guard-start bridge against the local official fixture, not exact proximity guard, guard end, sparks, sounds, air guard, or IKEMEN parity.
- `kfm-official-auto-guard-end.json`: optional trace where official KFM as defender leaves its real Common1 guard route through state `140` and returns to idle/control after bounded `InGuardDist` is no longer true. This proves only the current automatic guard-end bridge against the local official fixture, not exact guard-end timing, proximity guard, sparks, sounds, air guard, or IKEMEN parity.
- `kfm-official-x-hitstun.json`: optional official KFM `x -> 200` hit route that proves the target reaches the current partial hitstun/get-hit snapshot when `.scratch/fixtures/kfm-official.zip` exists.
- `kfm-official-default-gethit.json`: optional trace where a synthetic imported HitDef without `p2stateno` hits official KFM as defender and proves KFM's real Common1 state `5000` executes. The separate `kfm-official-x.json` gate covers KFM's own state `200` HitDef route.
- `kfm-official-default-gethit-progression.json`: optional trace where official KFM as defender executes real Common1 `5000 -> 5001 -> 0` through `HitShakeOver` and `HitOver` after a HitDef without `p2stateno`.
- `kfm-official-default-fall-gethit.json`: optional trace where official KFM as defender executes real Common1 `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110` after a fall HitDef without `p2stateno`. This proves the current ground-impact, first bounce-state entry, and lie-down entry only, not get-up/recovery input, state `5120` completion, or guard-state parity.
- `kfm-official-default-fall-recovery.json`: optional trace where official KFM as defender continues from real Common1 lie-down `5110` into get-up state `5120` and returns to `0` with control after a fall HitDef without `p2stateno`. The current local fixture artifact executes `0, 200, 5000, 5030, 5035, 5050, 5100, 5101, 5110, 5120` plus `HitFallSet` and ends with KFM idle/control. This proves the bounded get-up completion route only, not exact tick-order parity, recovery-input branching, or guard-state parity.
- `kfm-official-default-fall-recovery-input.json`: optional trace where official KFM as defender receives a recoverable fall HitDef, `CanRecover` becomes true, defender input `x+y` activates `command = "recovery"`, and real Common1 states execute `5050 -> 5210 -> 52 -> 0` before final idle/control. The current local fixture artifact executes `52, 200, 5000, 5030, 5050, 5210` with active commands `x`, `y`, and `recovery`, checksum `da3897df`. This proves the bounded official air recovery-input route only, not exact recovery thresholds/velocities, tick-order parity, or guard-state parity.
- `kfm-official-default-fall-ground-recovery.json`: optional trace where official KFM as defender receives a recoverable fall HitDef, `CanRecover` becomes true near the ground, defender input `x+y` activates `command = "recovery"`, and real Common1 states execute `5050 -> 5200 -> 5201 -> 52 -> 0` before final idle/control. The current local fixture artifact executes `0, 52, 200, 5000, 5030, 5050, 5200, 5201` with `SelfState`, `VelSet`, and `PosSet` controller evidence plus active commands `x`, `y`, and `recovery`, checksum `7548fd1d`. This proves the bounded official ground recovery-input route only, not exact recovery thresholds/velocities, tick-order parity, or guard-state parity.
- `kfm-official-x-state-exit.json`: optional official KFM `x -> 200` hit route that runs enough recovery frames to prove final P1 returns to idle/control when `.scratch/fixtures/kfm-official.zip` exists.
- `diagnostics.json`: summary of passed artifacts and skipped optional fixtures.

## Current Explod RemoveOnGetHit Gate

`pnpm qa:trace` includes required `synthetic-imported-explod-removeongethit.json`, `synthetic-imported-explod-removeonprojectilehit.json`, and `synthetic-imported-explod-removeonprojectileguard.json`.

These gates prove:

- imported P2 creates a passive visual `Explod` with `removeongethit = 1`;
- generated P1 hits P2 through the current direct-hit route;
- imported P1 hits imported P2 through the current Projectile route;
- imported P1 projectile is blocked by imported P2 through the current Projectile guard route;
- MatchWorld emits P2 Explod spawn/remove lifecycle evidence;
- the P1 projectile store and P2 Explod store record produced serials.

This proves bounded owner-side direct/projectile hit-or-guard pruning only. It does not prove exact MUGEN/IKEMEN tick order, helper-owned Explods, or custom-state edge cases.

## Current Explod Pause-Budget Gate

`pnpm qa:trace` includes required `synthetic-imported-explod-ignorehitpause.json`, `synthetic-imported-explod-pausemovetime.json`, and `synthetic-imported-explod-supermovetime.json`.

These gates prove:

- imported P1 creates two source-owned visual `Explod` actors during regular `Pause` and `SuperPause` routes;
- imported P1 creates two source-owned visual `Explod` actors before a direct-hit hitpause route;
- one Explod without `ignorehitpause` freezes during hitpause;
- one Explod with `ignorehitpause = 1` advances during hitpause;
- one Explod without `pausemovetime`/`supermovetime` freezes after source `movetime`;
- one Explod with `pausemovetime = 4` advances after regular `Pause` source `movetime`;
- one Explod with `supermovetime = 4` advances after `SuperPause` source `movetime`;
- MatchWorld emits Explod spawn/store evidence with P1 serial progression;
- trace evidence records both match-pause freeze and advance rows by exact Explod actor id.

This proves bounded Explod `ignorehitpause`/`pausemovetime`/`supermovetime` actor advance only. Exact MUGEN/IKEMEN pause layering remains unsupported.

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
