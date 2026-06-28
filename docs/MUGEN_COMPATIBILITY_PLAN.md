# MUGEN / IKEMEN Compatibility Plan

Compatibility will grow by measurable layers instead of a single all-or-nothing engine.

The project horizon is now a progressive Three.js port foundation. MUGEN 1.0/1.1 compatibility is the first target; IKEMEN-GO is the architectural reference and later extension target. See `docs/PORTING_ROADMAP.md` and `docs/ENGINE_PORT_ARCHITECTURE.md` for the broader port plan.

## Compatibility Profiles

Compatibility should eventually be reported against explicit profiles:

- `mugen-1.0`
- `mugen-1.1`
- `ikemen-go-scan`
- future IKEMEN extensions such as ZSS/Lua/model stages

Until the profile layer exists in code, reports should avoid claiming generic "full MUGEN support" and should describe exact parsed/decoded/executed subsets.

## Layer 1: Inspection

- Load ZIP/folder packages.
- Parse `.def`.
- Resolve referenced files relative to the `.def`.
- Parse `.air` actions and collision boxes.
- Render actions with mock sprites or decoded sprites when available.
- Report missing files and unsupported features.

## Layer 2: Playable Prototype

- Keep `Runtime Mode` playable without external assets.
- Model a small stage definition: floor, camera, player starts, side bounds, and debug layers.
- Maintain three active local demo fighters using MUGEN-like action numbers: `0`, `10`, `20`, `40`, `200`, `210`, `500`. Keep any additional generated fighters out of the active roster until their atlas, manifest, and locomotion QA match the current contract.
- Keep the demo roster atlas-backed so the renderer is not only proving procedural placeholders.
- Exercise the combat loop with P1 keyboard input, CPU P2, Clsn1/Clsn2 overlap, hit pause, hit stun, knockback, life, power, and round reset.
- Keep player-facing runtime affordances complete enough to test: stage HUD, timer, KO/time-over result, pause, speed, reset, and touch controls on narrow/mobile layouts.
- Export runtime and imported-character compatibility reports as JSON so each test character leaves a reusable evidence artifact.
- Include imported stage coverage in exported compatibility reports so stage progress is measurable separately from character progress.
- Keep this as a compatibility harness for imported characters instead of a throwaway demo.
- Allow one loaded AIR/SFF character into Runtime Mode with CMD `[State -1]` state-entry routing and a fallback standard-action bridge so imported art can be playtested while CNS execution grows.
- Allow imported `stages/*.def` files into Runtime Mode as partial stage definitions, with static/action-backed normal BG sprites and basic tiling/parallax when the stage SFF can be decoded.

## Layer 3: Sprite Fidelity

- Use atlas PNG + `manifest.json.frame_layout` as the first stable runtime art path.
- Generate private/original fighters with `sprite-atlas-builder`-compatible atlases. Nova Boxer, Mira Volt, and Rook Apprentice prove imagegen sheets normalized into runtime atlases plus MUGEN-lite templates. Future production passes should expand toward the full `fighting-game-character` preset.
- Treat locomotion warnings as requiring regeneration or explicit visual review. A loaded atlas is usable only when `walk-forward` QA is visible in the runtime; deliberate slow-walk warnings must stay surfaced as `walk QA warn` instead of being silently promoted to clean.
- Decode SFF v1 metadata and 8-bit PCX images. Browser rendering now covers normal palette blocks, linked records, and previous-palette subfiles without embedded PCX palettes.
- Expand SFF v1 palette behavior into ACT-driven remapping.
- Parse SFF v2 metadata, palettes, sprite tables, and format counts. RAW8/24/32, RLE8, RLE5, and LZ5 are browser-decodable now.
- Official KFM from MUGEN 1.1 uses mostly LZ5 5-bit sprites and now renders in Inspector Mode plus the imported Runtime AIR/SFF/CMD bridge. CodeFuMan and SF3 Ryu now provide local SFF v1 PCX stress fixtures. The next fidelity gate is broader tick-by-tick imported CNS controller execution.
- Keep extractor/atlas pipeline as a fallback if browser decoding becomes too costly.

## Layer 4: Command And State Indexing

- Expand CMD token semantics.
- Done in partial form: parse `[Remap]` before command matching so imported character button aliases can activate through the shared command buffer.
- Done in partial form: parse and execute `command.buffer.hitpause`/`buffer.hitpause` so imported command inputs can survive hit pause when enabled.
- Done in partial form: parse and execute `|` command alternatives inside one input step, including direction/button alternatives inside `+` combos.
- Done in partial form: parse and execute `command.steptime`/`steptime` as a per-step gap limit during command matching.
- Done in partial form: execute plain inputs as fresh presses/changes, `/` as hold matching, and `~` as release matching for buttons/directions.
- Done in partial form: parse and execute numeric `/N`/`~N` charge windows for buttons and direction-family commands such as `~30$D`.
- Done in partial form: evaluate `AnimElemTime(n)` from the active AIR action's current frame timing; exact loop/bottom/tick-order parity remains future work.
- Done in partial form: evaluate `command = "name"` / `command != "name"` inside simple composite expressions, including Common1-style arithmetic such as `151 + 2*(command = "holddown")`.
- Done in partial form: evaluate `HitShakeOver` from bounded hit-pause completion, `HitOver` from bounded hit-stun/guard-stun completion, `Time = 0` first-tick controllers for imported states, `GetHitVar(yaccel)` from bounded Common1 gravity defaults, bounded zero values for `GetHitVar(slidetime)` / `GetHitVar(ctrltime)`, `[Velocity]` constants for bounded KFM ground recovery, and `CanRecover` after `fall.recovertime`, enough to prove Common1 stand get-hit `5000 -> 5001 -> 0`, auto guard-start/end `120 -> 130 -> 140 -> 0`, guard-hit `150 -> 151` and `152 -> 153`, required synthetic fall `5000 -> 5030 -> 5050`, required synthetic bounded fall recovery `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0`, required synthetic recovery-input branch `5050 -> 5210 -> 0`, required synthetic recovery-threshold actor-frame handoff, required synthetic actor-frame tick-order evidence, required synthetic too-early recovery-input rejection in `5050`, optional official KFM auto guard-start/end controller-order evidence, optional official KFM ground-impact/bounce/lie-down entry `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110`, optional official KFM lie-down/get-up completion `5110 -> 5120 -> 0`, optional official KFM air recovery-input completion `5050 -> 5210 -> 52 -> 0`, optional official KFM early recovery-input rejection in `5050`, optional official KFM ground recovery-input completion `5050 -> 5200 -> 5201 -> 52 -> 0`, and optional official KFM ordered threshold evidence from positive `5050` recover time into `5200` with `recoverTime = 0` traces.
- Parse CNS/ST controllers and triggers more completely.
- Link commands to states and states to animations/sounds/helpers.

## Layer 5: Partial CNS Runtime

- Execute a safe subset: `ChangeState` with partial `anim` override/preserve behavior, `ChangeAnim` with partial `elem`/`elemtime`, partial `ChangeAnim2`, `VelSet`, `VelAdd`, `VelMul`, partial `HitVelSet`, partial `HitFallVel`, partial `HitFallDamage`, partial `HitFallSet`, partial `FallEnvShake`, `PosSet`, `PosAdd`, `Gravity`, `CtrlSet`, `StateTypeSet`, partial `AssertSpecial` with bounded `NoKO`, partial `HitDef`, partial `HitBy`/`NotHitBy`, partial `HitOverride`, partial `ReversalDef`, partial `DefenceMulSet`, partial `AttackMulSet`, partial target controllers (`TargetLifeAdd`, `TargetPowerAdd`, `TargetVelSet`, `TargetVelAdd`, `TargetFacing`, `TargetBind`, `TargetDrop`, `TargetState`), partial `Pause`/`SuperPause`, partial `Width`, partial `PlayerPush`, `Turn`, partial `PosFreeze`, partial `ScreenBound`, partial `SprPriority`, partial `PalFX`, partial `RemapPal` telemetry, partial `AfterImage`/`AfterImageTime`, partial `Explod`/`RemoveExplod`, partial `Helper`, partial `Projectile` with bounded terminal playback, partial `PlaySnd`/`StopSnd`, partial `EnvShake`, `SelfState`, `LifeAdd` with bounded `kill = 0`, `LifeSet`, `PowerAdd`, `PowerSet`, `VarSet`, `VarAdd`, `VarRangeSet`, safe no-op `ForceFeedback`, and safe no-op `Null`.
- Add hit pause, hit stun, basic hit resolution, a narrow held-back/down-back guard path with bounded defender-owned guard-hit states, partial fall/get-hit metadata for simple `HitDef` data, bounded defender-owned Common1 stand get-hit progression, a synthetic bounded bounce/lie-down/get-up chain, synthetic recovery-threshold handoff evidence, synthetic actor-frame tick-order evidence, synthetic air-recovery velocity evidence, synthetic ground-recovery selection/velocity evidence, official KFM defender-owned fall/ground-impact/bounce/lie-down trace gates, official KFM lie-down/get-up completion, bounded official KFM air/ground recovery-input traces, bounded optional official KFM ordered threshold evidence, bounded optional official KFM auto guard-start/end controller-order evidence, bounded optional official KFM stand/crouch/air guard-hit controller-order evidence, and a bounded optional official KFM too-early recovery-input reject trace. Exact threshold tables/velocity math, exact controller/VM tick-order parity, and exact guard start/end/proximity/physics/effects/timing parity remain future work.
- Keep unsupported controllers visible in the compatibility report.

## Layer 6: Stage Compatibility

- Done in partial form: parse stage `.def` into `MugenStageDefinition`.
- Done in partial form: support camera bounds, player start positions/facing, zoffset/localcoord, music/sprite path resolution, placeholder BG fallback layers, static normal BG sprites from decoded stage SFF `spriteno` refs, action-backed BG animations from embedded `[Begin Action]` blocks, bounded tiling, and simple horizontal parallax.
- Done in partial form: report stage DEF/SFF/music presence, decoded sprites, BG sprite coverage, animated BG coverage, tiled layer count, placeholder fallbacks, and unsupported stage features.
- Next: exact parallax/tiling rules, velocity/transparency, windows/masking, and broader stage-specific animation behavior.
- Later: BGCtrl, animated stage scripting, shadows/reflections, IKEMEN 3D model stages, and exact zoom/camera rules.

## Layer 7: Advanced Compatibility

- Helper edge cases, projectile edge cases, custom states, throws, exact pause/super-pause layering, advanced explods/bindings, and AI.
- ZSS should be treated as an Ikemen-inspired later layer, not as MVP scope.

Every unsupported feature should include format, feature, severity, location, raw text where available, fallback, and count.

## External Research Notes

- MUGEN's official docs identify characters, stages, sprites, sounds, AIR, CMD, CNS, and common states as separate resources.
- AIR actions are action-numbered frame lists; `Clsn1` is the attacking box and `Clsn2` is the plain collision box.
- CNS state controllers are trigger/action blocks evaluated each tick; `ChangeState` changes the current `StateDef`.
- Ikemen GO is the active successor/reference engine to study for architecture because it targets MUGEN 1.1 Beta compatibility while adding ZSS/Lua and open-source implementation details.
- The local IKEMEN-GO review snapshot is documented in `docs/IKEMEN_GO_REFERENCE.md`. Use it as an implementation map for parser/runtime behavior, but keep this web sandbox dependency-free and TypeScript-native.
