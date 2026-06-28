# IKEMEN-GO Reference Notes

Reviewed against local shallow clone:

- Repository: https://github.com/ikemen-engine/Ikemen-GO
- Website: https://ikemen-engine.github.io/
- Local snapshot: `044da72 Merge pull request #3732 from rakieldev/fixes`
- Review date: 2026-06-24
- Web refresh: 2026-06-25 against the official GitHub repository and website. The official project describes Ikemen GO as an open-source fighting game engine that supports M.U.G.E.N resources, targets MUGEN 1.1 Beta-level backwards compatibility, and expands beyond MUGEN with features such as Lua scripting and ZSS. Those extensions remain scanner/reporting scope here until the browser runtime has stronger MUGEN evidence.
- Source-map refresh: 2026-06-26 against the official repository compiler/stage/Lua sources for report-only controller, trigger, screenpack, and model-stage detection. This refresh still does not authorize IKEMEN execution.

IKEMEN-GO is a compatibility reference, not a dependency target. This sandbox stays TypeScript-native and browser-local. The useful part is its architecture: parse legacy MUGEN formats into stable data, preload only required assets where possible, compile/evaluate CNS behavior in a controlled runtime, and keep unsupported or extended features explicit.

## Relevant Code Areas

- `src/anim.go`: AIR action parsing, `Loopstart`, `Clsn1`/`Clsn2`, defaults, and action copy behavior.
- `src/image.go`: SFF v1/v2 loading, linked sprite records, palette handling, and active SFF reuse.
- `src/stage.go` and `src/bgdef.go`: stage `.def`, camera/player/stage sections, BGDef, BG sections, BGCtrl, shadow/reflection, model stages, and zoom handling.
- `src/compiler.go`: CMD parsing, defaults/remap, shared input buffer per character command list, statedef scanning, duplicate statedef tolerance, and CNS compile flow.
- `src/compiler_functions.go`: state-controller parameter parsing, including `HitDef`, `Projectile`, `Width`, `AssertCommand`, and other controllers.
- `src/bytecode.go`: controller execution and trigger/evaluator machinery.
- `src/input.go`: command-step parsing/execution, `+`/`|` handling, `~`, `/`, `$`, `>` modifiers, charge timing, duplicate-direction expansion, and legacy compatibility quirks.
- `src/system.go`: targeted preload of character/stage animation sprites before full match load.
- `src/sound.go`: SND and audio loading behavior.

## Decisions To Copy Conceptually

- Keep one command-buffer source per runtime actor, and let multiple command definitions query that history.
- Respect `[Defaults]` and remap sections before command matching.
- Keep command parsing and command matching separate. IKEMEN-GO compiles commands into ordered steps, then updates command state each tick from a shared input buffer; the browser sandbox should keep the same conceptual split even while its matcher remains smaller.
- Treat duplicate/odd legacy CNS patterns as warnings where MUGEN compatibility expects tolerance.
- Treat imported CMD/CNS errors differently from authored sandbox data: legacy MUGEN characters should keep loading with diagnostics where possible.
- Use AIR first to discover the sprite keys that matter for a character or stage.
- Decode/preload SFF sprites incrementally instead of assuming every asset must render before inspection starts.
- Make stage `.def` a first-class model: camera, player starts, zoffset/localcoord, BGDef, BG sections, music, shadows/reflections, and later BGCtrl.
- Split immutable parsed data from mutable runtime instances.
- Track unsupported triggers/controllers as compatibility facts rather than runtime crashes.

## What Not To Copy Yet

- Full bytecode VM parity.
- Lua/ZSS as MVP scope.
- Rollback/netplay.
- IKEMEN-specific 3D model stages, except as a future Three.js-compatible stage layer.
- Full BGCtrl, custom states, and advanced hit systems until the imported KFM path is stable. `Helper` is implemented only as a bounded visual effect actor, and `Projectile` is implemented only as a bounded colliding effect actor; neither path is full IKEMEN/MUGEN parity.

## Current Sandbox Application

The current implementation uses IKEMEN-GO as a guide in these places:

- Stage `.def` now maps into `MugenStageDefinition` for Runtime Mode setup.
- Stage SFF archives can now provide static/tiled normal BG sprites for parsed `[BG ...] spriteno` refs and action-backed BG sprites for embedded `[Begin Action]` refs, with basic horizontal parallax.
- Compatibility reports now include a report-only `ikemen-go-scan` profile. `IkemenFeatureScanner` recognizes ZSS files/references and ZSS controller syntax, Lua files/hooks including the `hook.*` API, IKEMEN config JSON, `IkemenVersion`, selected IKEMEN-only controllers and `AssertSpecial` flags, source-mapped extended trigger identifiers that are not in the bounded supported subset, select/system screenpack signals such as `unlock` and `commandlist`, model-stage assets, and named 3D/Z stage params such as `topz`, `botz`, `ztopscale`, `depthtoscreen`, `zoffsetlink`, `startz`, `model`, and `fov`; these findings are exported as `Recognized + Unsupported` and are not executed. `PrevMoveType`, `PrevAnim`, and `PrevStateType` are currently excluded from unsupported scanner findings because the runtime now has bounded evidence for them.
- Command buffers keep a frame history, support duplicate command definitions plus same-step `|` alternatives, apply `[Remap]` button aliases before command matching, partially honor `buffer.hitpause`, apply a bounded `steptime` gap check between matched steps, distinguish plain press/change inputs from `/` hold and `~` release matching, and enforce partial numeric charge windows such as `~30$D`.
- Imported `HitDef` runtime data now includes a narrow IKEMEN/MUGEN-inspired guard path: held-back/down-back defender input, `guardflag` filtered by statetype, guard damage from the second `damage` value, plus `guard.pausetime`, `guard.hittime`, `guard.velocity`, and bounded entry into known defender-owned Common1-style stand/crouch guard-hit states such as `150 -> 151` and `152 -> 153`. This is not full guard-state parity.
- Common controller triage now recognizes partial `ChangeAnim2`, `HitVelSet`, `HitFallVel`, `HitFallDamage`, `HitFallSet`, `FallEnvShake`, `PlayerPush`, `Turn`, `PosFreeze`, `ScreenBound`, `HitBy`, `NotHitBy`, `HitOverride`, `ReversalDef`, `DefenceMulSet`, `AttackMulSet`, `RemapPal`, `ForceFeedback`, `VarRangeSet`, `AssertSpecial`, `TargetLifeAdd`, `TargetPowerAdd`, `TargetVelSet`, `TargetVelAdd`, `TargetFacing`, `TargetBind`, `BindToTarget`, `TargetDrop`, `TargetState`, `Pause`, `SuperPause`, `LifeAdd`, `LifeSet`, and `PowerSet`: `ChangeState` honors controller `anim` overrides and preserves animation when the destination `Statedef` has no `anim`, `ChangeAnim`/`ChangeAnim2` support partial `elem`/`elemtime` positioning, `AnimElemTime` now uses current AIR frame timing inside the playable runtime, `HitShakeOver`/`HitOver` now drive the bounded Common1 stand get-hit progression from hit-pause and hit-stun/guard-stun completion, `[Movement]`, `[Data]`, `[Velocity]`, and `[Size]` constants are indexed for `Const(...)` lookups, imported `Time = 0` controllers get a first-tick evaluation point, `GetHitVar(yaccel)` provides bounded airborne get-hit gravity, imported no-control/get-hit states are preserved from input/AI idle overrides, `ChangeAnim2` marks state-owner animation source, defaults owner-backed states to the state owner's action table, and exposes sprite-owner metadata for Three.js/debug routing, `HitVelSet` consumes the simple get-hit velocity stored by partial `HitDef`/`Projectile`, `HitFall*` consumes simple `fall.*` metadata from partial `HitDef`, `FallEnvShake` can emit a deterministic camera shake from stored fall envshake data, `PlayerPush` maps to one-tick body-separation disabling, `Turn` flips facing until the next automatic facing pass, `PosFreeze` can cancel selected current-tick axis movement, `ScreenBound` can bypass the sandbox X bounds/camera-X follow for the current tick, `HitBy`/`NotHitBy` apply simplified two-slot attr gating, `HitOverride` redirects matching incoming hit/projectile attrs to known states without normal damage, `ReversalDef` counters matching incoming `HitDef` attrs when Clsn1 boxes overlap and can route the defender through a known `p1stateno`, `DefenceMulSet` scales incoming runtime damage, `AttackMulSet` scales outgoing runtime damage, both static multiplier controllers now record typed `damage-scale:*` evidence, negative `LifeAdd` respects bounded `kill = 0` and defender-side `NoKO`, `RemapPal` records palette-remap telemetry without pixel remapping yet, `ForceFeedback` is a browser no-op, `VarRangeSet` writes contiguous variable ranges, `AssertSpecial` captures common flags and applies only the subset currently meaningful to the sandbox (`NoWalk`, `NoAutoTurn`, `Invisible`, bounded `NoStandGuard`/`NoCrouchGuard`/`NoAirGuard`, one-frame trigger-expiry evidence, attacker-side `Unguardable`, and bounded defender-side `NoKO`), target controllers operate on recent hit/projectile targets in the bounded two-actor runtime, `TargetState` uses known state data from the controller owner, `BindToTarget` supports bounded `Foot`/`Mid`/`Head` owner-to-target binds using parsed target `[Size]` anchors when available, and `Pause`/`SuperPause` cover only two-actor freeze, source `movetime`, simple `darken`, and `poweradd`. Exact `ChangeAnim`/`ChangeAnim2` missing-action fallback/redirect and exact `AnimElemTime` loop/bottom/tick-order parity, exact fall/get-hit state flow beyond the current stand `5000 -> 5001 -> 0`, bounded synthetic `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0`, and optional KFM `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110` gates, exact first-tick/tick-order parity, exact `RemapPal`/ACT palette application, exact `AttackMulSet`/`DefenceMulSet` scaling order and interactions, broader `AssertSpecial` lifetime/round-flow/no-KO semantics beyond bounded expiry/clamps, `Pause`/`SuperPause` layering, exact `PosFreeze`/`ScreenBound`, exact `HitBy`/`NotHitBy`/`HitOverride` attr and slot parity, exact `ReversalDef` priority/guard/custom-state parity, exact `BindToTarget` tick-order/redirect semantics, and exact target/custom-state ownership remain explicit future work because they need deeper tick-order, palette, camera, hit-attribute, guard, and round-flow semantics.
- Compatibility reporting separates parsed states, executable controller names, trigger-clean state entries, runtime-routable state targets, and session-executed states.
- Inspector State Browser now mirrors that compatibility layering by showing animation resolution, supported/unsupported controller counts, trigger-clean counts, HitDef markers, and short controller strips per `StateDef`.
- Imported character runtime remains bounded: AIR/SFF/CMD/CNS subsets execute only where the browser runtime can prove enough data.

Next character-runtime work should follow `src/compiler.go`/`src/input.go`/`src/bytecode.go` concepts in this order:

1. Add `buffer.pauseend`, `buffer.shared`, `autogreater`, exact charge conflict handling, and stricter step timing diagnostics.
2. Broaden `State -1` routing edge cases beyond the current `triggerall` AND plus numbered-trigger OR grouping.
3. Convert supported active-state controllers into a small TypeScript IR before execution, rather than evaluating raw controller params everywhere.
4. Expand `HitDef` from partial damage/guard/pause/stun/push/default stand get-hit progression/guard-hit routing/fall ground-impact/bounce/lie-down entry plus bounded synthetic recovery/recovery-input/threshold and optional official air/ground recovery-input evidence into attr/spark/sound/priority-aware runtime data, exact recovery velocities/selection, broader recovery parity, and exact guard states.
5. Broaden visual/system hooks after the first `Pause`/`SuperPause`/`EnvShake`/`PalFX`/`AfterImage`/`Explod`/`Helper`/`Projectile` paths: richer sound hooks, pause layering, projectile edge cases, and helper state/lifecycle basics.
6. Keep every skipped controller/trigger visible in UI and exported compatibility JSON.

Next stage-related work should follow `src/stage.go`/`src/bgdef.go` concepts in this order:

1. Improve `start`, `delta`, `tile`, `velocity`, `trans`, `mask`, `window`, and `layerno` accuracy beyond the current bounded/static/action-backed approximation.
2. Add BGCtrl.
3. Add shadows/reflections and exact zoom/camera rules.
4. Consider IKEMEN 3D model stages as a separate Three.js layer.
