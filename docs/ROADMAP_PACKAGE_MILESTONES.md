# Roadmap Package Milestones

Last updated: 2026-07-05

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

Latest runtime checkpoint:

```txt
R1 required dynamic EnvShake trace gate
  -> synthetic-imported-envshake-dynamic.json checksum 90955e75 / final checksum 1af5fbf6 is required in qa:trace
  -> imported active state seeds var(0)=18, var(1)=45, var(2)=-9, and fvar(0)=0.25
  -> active state executes EnvShake time = var(0), freq = var(1), ampl = var(2), and phase = fvar(0)
  -> dynamic EnvShake resolves through active controller expression fallback instead of typed envshake evidence
  -> final imported actor evidence requires env-shake telemetry time 18, freq 45, ampl -9, phase 0.25
  -> pnpm qa:trace passes 450/450 artifacts, 420 required and 30 optional
  -> official Elecbyte docs define EnvShake time as required duration, freq as shake speed, ampl as amplitude, and phase as phase offset
  -> no score movement; dynamic typed-operation lowering for EnvShake, mul, exact camera waveform, pause/stage/layer interaction, helper ownership, screenpack ownership, and full presentation parity remain blocked

Previous R1 required dynamic AngleMul trace gate
  -> synthetic-imported-anglemul-dynamic.json checksum 418ed880 / final checksum 4a6a3045 is required in qa:trace
  -> imported active state seeds var(0)=30 and fvar(0)=1.5
  -> active state executes AngleSet value = var(0), AngleMul value = fvar(0), and static AngleDraw
  -> dynamic AngleMul resolves through sprite-effect fallback instead of typed sprite-effect:anglemul evidence
  -> final imported actor-frame evidence requires renderAngle 45 while static sprite-effect:angledraw evidence remains present
  -> pnpm qa:trace passes 449/449 artifacts, 419 required and 30 optional
  -> official Elecbyte docs define AngleMul value as an angle_multiplier float that multiplies the drawing angle used by AngleDraw
  -> no score movement; dynamic typed-operation lowering for AngleMul, exact axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, and full presentation parity remain blocked

Previous R1 required static AngleMul trace gate
  -> synthetic-imported-anglemul.json checksum e0dae072 / final checksum 5048aa5c is required in qa:trace
  -> imported active state executes AngleSet value = 30, AngleMul value = 1.5, and AngleDraw
  -> static AngleMul lowers into typed sprite-effect:anglemul operation evidence
  -> final imported actor-frame evidence requires renderAngle 45
  -> pnpm qa:trace passed 448/448 artifacts, 418 required and 30 optional
  -> no score movement; exact axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, and full presentation parity remain blocked

Previous R1 required dynamic Angle trace gate
  -> synthetic-imported-angle-dynamic.json checksum 8f788bf8 is required in qa:trace
  -> imported active state seeds var(0)=40, var(1)=-10, var(2)=35, var(3)=2, and fvar(0)=0.5
  -> active state executes AngleSet value = var(0), AngleAdd value = var(1), and AngleDraw value = var(2), scale = var(3),fvar(0)
  -> RuntimeSpriteEffectControllerWorld forwards a dynamic Angle resolver into RuntimeSpriteEffectWorld.applyAngle
  -> PlayableMatchRuntime resolves Angle value/scale through the active controller expression context and preserves fractional scale params
  -> final imported actor evidence requires renderAngle 35, renderScale 2,0.5, and no typed sprite-effect:angle* operation evidence
  -> pnpm qa:trace passed 447/447 artifacts, 417 required and 30 optional
  -> official Elecbyte docs define AngleSet value, AngleDraw value, and AngleDraw scale as floats; rotation/scaling does not affect collision boxes
  -> no score movement; typed-operation lowering for dynamic angle params, exact axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, and full presentation parity remain blocked

Previous R1 required dynamic AfterImageTime trace gate
  -> synthetic-imported-afterimagetime-dynamic.json checksum 16edc106 is required in qa:trace
  -> imported active state seeds var(0)=14, then executes static AfterImage plus AfterImageTime value = var(0)
  -> RuntimeSpriteEffectControllerWorld forwards a dynamic AfterImageTime resolver into RuntimeSpriteEffectWorld.applyAfterImageTime
  -> PlayableMatchRuntime resolves AfterImageTime time/value params through the active controller expression context
  -> final imported actor evidence requires afterImageTime 14, length 4, timeGap 1, frameGap 1, at least one sample, opacity 0.34, and no typed sprite-effect:afterimagetime operation evidence
  -> pnpm qa:trace passed 446/446 artifacts, 416 required and 30 optional
  -> official Elecbyte docs allow numeric controller params as expressions and define AfterImageTime time plus alternate value
  -> no score movement; typed-operation lowering for dynamic AfterImageTime params, exact no-active-afterimage behavior, trail blending, palette math, sampling cadence, renderer parity, helper/redirect ownership, and full presentation parity remain blocked

Previous R1 required dynamic AfterImage trace gate
  -> synthetic-imported-afterimage-dynamic.json checksum 2342c3f1 is required in qa:trace
  -> imported active state seeds var(0..7), then executes AfterImage time/length/timegap/framegap/paladd/palmul from expressions with trans = add
  -> RuntimeSpriteEffectControllerWorld forwards a dynamic AfterImage scalar/triplet resolver into RuntimeSpriteEffectWorld.applyAfterImage
  -> PlayableMatchRuntime resolves AfterImage params through the active controller expression context
  -> final imported actor evidence requires afterImageTime 18, length 5, timeGap 2, frameGap 3, at least one sample, opacity 0.34, and no typed sprite-effect:afterimage operation evidence
  -> pnpm qa:trace passed 445/445 artifacts, 415 required and 30 optional
  -> official Elecbyte docs allow numeric controller params as expressions and define AfterImage time/length/timegap/framegap/paladd/palmul/trans
  -> no score movement; typed-operation lowering for dynamic AfterImage params, exact trail blending, palette math, sampling cadence, renderer parity, helper/redirect ownership, and full presentation parity remain blocked

Previous R1 required dynamic Trans trace gate
  -> synthetic-imported-trans-dynamic.json checksum 91a7baf9 is required in qa:trace
  -> imported active state seeds var(0)=96 and var(1)=160, then executes Trans trans = addalpha with alpha = var(0),var(1)
  -> RuntimeSpriteEffectControllerWorld forwards a dynamic alpha resolver into RuntimeSpriteEffectWorld.applyTrans
  -> PlayableMatchRuntime resolves alpha pair params through the active controller expression context
  -> final imported actor evidence requires renderOpacity 0.375 and no typed sprite-effect:trans operation evidence
  -> pnpm qa:trace passed 444/444 artifacts, 414 required and 30 optional
  -> official Elecbyte docs allow numeric controller params as expressions and define Trans alpha = source_alpha,dest_alpha for additive transparency
  -> no score movement; typed-operation lowering for dynamic alpha, exact add/sub alpha math, palette/remap interaction, draw-order parity, renderer parity, helper/redirect ownership, and full presentation parity remain blocked

Previous R1 required dynamic PalFX trace gate
  -> synthetic-imported-palfx-dynamic.json checksum c56e955a is required in qa:trace
  -> imported active state seeds var(0..7), then executes PalFX time/add/mul/color/invertall from expressions
  -> RuntimeSpriteEffectControllerWorld forwards a dynamic palette resolver into RuntimeSpriteEffectWorld.applyPaletteFx
  -> PlayableMatchRuntime resolves scalar and triplet params through the active controller expression context
  -> final imported actor evidence requires paletteFx time 12, add [64,-16,255], mul [224,144,256], color 200, invert true and no typed sprite-effect:palfx operation evidence
  -> pnpm qa:trace passes 443/443 artifacts, 413 required and 30 optional
  -> official Elecbyte docs allow numeric controller params as expressions and define PalFX time/add/mul/invertall/color
  -> no score movement; typed-operation lowering for dynamic params, sinadd, exact palette math/blend/remap order, renderer parity, helper/redirect ownership, and full presentation parity remain blocked

Previous R1 required dynamic SprPriority trace gate
  -> synthetic-imported-sprpriority-dynamic.json checksum b57c1bfa is required in qa:trace
  -> imported active state seeds var(0)=4, then executes SprPriority value = var(0)
  -> RuntimeSpriteEffectControllerWorld forwards a dynamic priority resolver into RuntimeSpriteEffectWorld.applySpritePriority
  -> PlayableMatchRuntime resolves value expressions through the active controller expression context
  -> final imported actor evidence requires spritePriority = 4 and no typed sprite-effect:sprpriority operation evidence
  -> pnpm qa:trace passed 442/442 artifacts, 412 required and 30 optional
  -> official Elecbyte docs allow numeric controller params as expressions and define SprPriority value as an int priority level
  -> no score movement; typed-operation lowering for dynamic params, exact layer/shadow/helper/Explod draw-order parity, renderer parity, helper/redirect ownership, and full presentation parity remain blocked

R1 required dynamic RemapPal trace gate
  -> synthetic-imported-remappal-dynamic.json checksum a44ec542 is required in qa:trace
  -> imported active state seeds var(0)=5 and var(1)=7, then executes RemapPal source = 1,var(0) and dest = 2,var(1)
  -> RuntimeSpriteEffectControllerWorld forwards a dynamic pair resolver into RuntimeSpriteEffectWorld.applyRemapPal
  -> PlayableMatchRuntime resolves source/dest pair expressions through the active controller expression context
  -> final imported actor evidence requires paletteRemap source [1,5] -> dest [2,7]
  -> pnpm qa:trace passes 441/441 artifacts, 411 required and 30 optional
  -> official Elecbyte docs allow numeric controller params as expressions and define RemapPal source/dest
  -> no score movement; typed-operation lowering for dynamic params, exact source-bank/default/removal semantics, ACT/SFF pixel parity, truecolor/PNG remap, helper/redirect ownership, exact PalFX order/math, renderer parity, and full palette parity remain blocked

R1 required AssertSpecial NoJuggleCheck telemetry trace gate
  -> synthetic-imported-assertspecial-juggle-telemetry.json checksum 9436dfa0 is required in qa:trace
  -> static NoJuggleCheck lowers into typed assertspecial operation evidence
  -> runtime AssertSpecial execution stores noJuggleCheck
  -> final imported actor evidence requires normalized assertSpecialFlags ["nojugglecheck"]
  -> pnpm qa:trace passes 440/440 artifacts, 410 required and 30 optional
  -> official Elecbyte AssertSpecial docs list nojugglecheck
  -> no score movement; juggle-point accounting, actual juggle bypass behavior, helper/team/global ownership, pause layering, and full MUGEN/IKEMEN juggle parity remain blocked

R2 RuntimeSpriteEffectControllerWorld RemapPal ownership cut
  -> RuntimeSpriteEffectControllerWorld owns active-state RemapPal dispatch as a sprite-effect side effect
  -> StateProgramExecutor now classifies RemapPal as side-effect "remappal", not a generic runtime-controller route
  -> RuntimeActiveSideEffectDispatchWorld routes RemapPal through spriteEffect hooks
  -> RuntimeSpriteEffectWorld applies bounded paletteRemap mutation through typed sprite-effect:remappal operations or raw fallback params
  -> StateControllerExecutor keeps dynamic raw fallback through a resolver
  -> focused SpriteEffectSystem, RuntimeActiveSideEffectDispatchSystem, StateProgramExecutor, and RuntimeCnsSubset coverage proves classification, route, telemetry, mutation, and fallback preservation
  -> official Elecbyte 1.1 State Controller Reference was checked for RemapPal source/dest semantics
  -> no score movement; exact source-bank/default/removal semantics, truecolor/PNG remap, helper/redirect ownership, exact PalFX order, and full palette parity remain blocked

R2 RuntimeSpriteEffectControllerWorld Trans ownership cut
  -> RuntimeSpriteEffectControllerWorld owns active-state Trans dispatch as a sprite-effect side effect
  -> StateProgramExecutor classifies Trans as side-effect "trans", not a generic runtime-controller route
  -> RuntimeActiveSideEffectDispatchWorld routes Trans through spriteEffect hooks
  -> RuntimeSpriteEffectWorld applies bounded renderOpacity mutation through typed sprite-effect:trans operations or raw fallback params
  -> previous pnpm qa:trace stayed stable at 439/439 artifacts, 409 required and 30 optional; pnpm qa:smoke passed because presentation-state routing was touched
  -> no score movement; exact visual tick-order, blend/material parity, helper/redirect ownership, renderer parity, and full presentation parity remain blocked

R1 required helper Projectile ProjTime same-id guard-then-hit trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-projtime-same-id-last-contact.json for two helper-parented owner-side Projectiles id 8918
  -> first helper-parented Projectile contact is guarded, later same-id contact hits, and helper routes 1200 -> 1306 -> 1307 through ProjHitTime(8918) >= 1 / ProjHitTime(0) >= 1 / ProjContactTime(8918) >= 1 / ProjContactTime(0) >= 1 while ProjGuardedTime(8918) < 0 / ProjGuardedTime(0) < 0
  -> forbidden helper state 1308 proves stale same-id guarded time does not survive after the later hit
  -> guard package S6,34 / F7038 / sparkxy 35,-77 and hit package S5,35 / F7038 / sparkxy 36,-78 are required
  -> synthetic-imported-helper-projtime-same-id-last-contact.json checksum 4e74aec3 is required in qa:trace
  -> pnpm qa:trace passes 439/439 artifacts, 409 required and 30 optional
  -> together with synthetic-imported-helper-projtime-same-id-hit-then-guard.json checksum f4c1da3b, both helper-local same-ID two-contact Proj*Time orders are required
  -> no score movement; exact Proj*Time tick order/lifetime, helper custom-state breadth beyond these owner-side helper-local routes, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, visual/audio parity beyond bounded packages, and full Projectile parity remain blocked

R1 required helper Projectile ProjTime same-id hit-then-guard trace gate
  -> EffectActorSystem now resolves helper-local Proj*Time from the latest helper-parented Projectile contact for the requested fixed id or ID 0 any-id
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-projtime-same-id-hit-then-guard.json for two helper-parented owner-side Projectiles id 8917
  -> first helper-parented Projectile contact hits, later same-id contact is guarded, and helper routes 1200 -> 1303 -> 1304 through ProjGuardedTime(8917) >= 1 / ProjGuardedTime(0) >= 1 / ProjContactTime(8917) >= 1 / ProjContactTime(0) >= 1 while ProjHitTime(8917) < 0 / ProjHitTime(0) < 0
  -> forbidden helper state 1305 proves stale same-id hit time does not survive after the later guard
  -> hit package S5,32 / F7037 / sparkxy 33,-75 and guard package S6,33 / F7037 / sparkxy 34,-76 are required
  -> synthetic-imported-helper-projtime-same-id-hit-then-guard.json checksum f4c1da3b is required in qa:trace
  -> pnpm qa:trace passes 438/438 artifacts, 408 required and 30 optional
  -> no score movement; exact Proj*Time tick order/lifetime, helper custom-state breadth beyond this owner-side helper-local route, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, visual/audio parity beyond bounded packages, and full Projectile parity remain blocked

R1 required player Projectile ProjTime same-id hit-then-guard trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-projectile-projtime-same-id-hit-then-guard.json for two same-id Projectiles id 8916
  -> first contact hits, later contact is guarded, and owner routes 200 -> 383 -> 384 through ProjGuardedTime(8916) >= 1 / ProjGuardedTime(0) >= 1 / ProjContactTime(8916) >= 1 / ProjContactTime(0) >= 1 while ProjHitTime(8916) < 0 / ProjHitTime(0) < 0
  -> forbidden state 385 proves stale same-id hit time does not survive after the later guard
  -> hit package S5,30 / F7036 / sparkxy 31,-73 and guard package S6,31 / F7036 / sparkxy 32,-74 are required
  -> synthetic-imported-projectile-projtime-same-id-hit-then-guard.json checksum d49ee334 is required in qa:trace
  -> pnpm qa:trace passes 437/437 artifacts, 407 required and 30 optional
  -> no score movement; exact Proj*Time tick order/lifetime, helper Projectile/custom-state persistence breadth, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, visual/audio parity beyond bounded packages, and full Projectile parity remain blocked

R1 required player Projectile ProjTime same-id last-contact trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-projectile-projtime-same-id-last-contact.json for two same-id Projectiles id 8915
  -> first contact is guarded, later contact hits, and owner routes 200 -> 380 -> 381 through ProjHitTime(8915) >= 1 / ProjHitTime(0) >= 1 / ProjContactTime(8915) >= 1 / ProjContactTime(0) >= 1 while ProjGuardedTime(8915) < 0 / ProjGuardedTime(0) < 0
  -> forbidden state 382 proves stale same-id guarded time does not survive after the later hit
  -> guard package S6,28 / F7035 / sparkxy 29,-71 and hit package S5,29 / F7035 / sparkxy 30,-72 are required
  -> synthetic-imported-projectile-projtime-same-id-last-contact.json checksum fb4c2450 is required in qa:trace
  -> pnpm qa:trace passes 436/436 artifacts, 406 required and 30 optional
  -> no score movement; hit-then-guard counterpart now covered by checksum d49ee334; exact Proj*Time tick order/lifetime, helper Projectile/custom-state persistence breadth, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, visual/audio parity beyond bounded packages, and full Projectile parity remain blocked

R1 required player Projectile ProjHitTime/ProjContactTime/ProjGuardedTime multi-id arbitration trace gates
  -> RuntimeTraceGatePresets now builds synthetic-imported-projectile-projhittime-multi-id.json, synthetic-imported-projectile-projcontacttime-multi-id.json, and synthetic-imported-projectile-projguardedtime-multi-id.json with two Projectile controller/op executions and wrong-id trap branches
  -> player-owned wrong-id/non-contact Projectile ids 8909/8911/8913 stay isolated while valid hit/contact/guard Projectile ids 8910/8912/8914 route owner states 200 -> 371 -> 372, 200 -> 374 -> 375, and 200 -> 377 -> 378 through fixed-id ProjHitTime(8910) >= 1 / ProjContactTime(8912) >= 1 / ProjGuardedTime(8914) >= 1 plus ID 0 any-projectile reads
  -> forbidden states 373/376/379 prove wrong-id time reads do not route from wrong Projectile ids
  -> synthetic-imported-projectile-projhittime-multi-id.json checksum 5d897825, synthetic-imported-projectile-projcontacttime-multi-id.json checksum d9b3cecf, and synthetic-imported-projectile-projguardedtime-multi-id.json checksum e52d0d01 are required in qa:trace
  -> pnpm qa:trace passes 435/435 artifacts, 405 required and 30 optional
  -> no score movement; exact Proj*Time tick order/lifetime, same-ID selection priority, helper Projectile/custom-state persistence breadth, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, visual/audio parity beyond the bounded packages, and full Projectile parity remain blocked

Previous R1 required player Projectile ProjHit/ProjGuarded multi-id arbitration trace gates
  -> synthetic-imported-projectile-projhit-multi-id.json checksum ab0f3fb3 and synthetic-imported-projectile-projguarded-multi-id.json checksum 023921e3 remain required in qa:trace
  -> pnpm qa:trace previously passed 432/432 artifacts, 402 required and 30 optional
  -> remains required

Previous R1 required player Projectile ProjContact multi-id arbitration trace gate
  -> synthetic-imported-projectile-projcontact-multi-id.json checksum e790ec3e remains required in qa:trace
  -> player-owned wrong-id/non-contact Projectile id 8903 stays isolated while valid guarded Projectile id 8904 routes owner state 200 -> 362 -> 363 through fixed-id ProjContact8904 = 1, >= 1 plus any-id ProjContact = 1, >= 1 and ID 0 first-form ProjContact0 = 1
  -> pnpm qa:trace previously passed 430/430 artifacts, 400 required and 30 optional
  -> remains required

Previous R1 required player Projectile ProjContact any-id suffix trace gate
  -> synthetic-imported-projectile-projcontact-suffix-any.json checksum 2fb80418 remains required in qa:trace
  -> player-owned Projectile id 8902 is guarded, owner state 200 routes on omitted-ID ProjContact = 1, >= 1, then branches 360 -> 361 through ID 0 first-form ProjContact0 = 1 with active projectile payload, owner target-link, guard sound, and FightFX spark package evidence
  -> pnpm qa:trace previously passed 429/429 artifacts, 399 required and 30 optional
  -> remains required

Previous R1 required player Projectile ProjHit/ProjGuarded any-id suffix trace gates
  -> ExpressionCompiler/ExpressionEvaluator normalize Elecbyte legacy ProjContact/ProjHit/ProjGuarded suffix forms, including omitted-ID, ID 0, and second-form timing relations
  -> RuntimeTraceGatePresets now builds synthetic-imported-projectile-projhit-suffix-any.json and synthetic-imported-projectile-projguarded-suffix-any.json
  -> player-owned Projectile id 8900 hits, owner state 200 routes on omitted-ID ProjHit = 1, >= 1, then branches 356 -> 357 through ID 0 first-form ProjHit0 = 1 with active projectile payload, owner target-link, hit sound, and FightFX spark package evidence
  -> player-owned Projectile id 8901 is guarded, owner state 200 routes on omitted-ID ProjGuarded = 1, >= 1, then branches 358 -> 359 through ID 0 first-form ProjGuarded0 = 1 with active projectile payload, owner target-link, guard sound, and FightFX spark package evidence
  -> synthetic-imported-projectile-projhit-suffix-any.json checksum 35ffd57d and synthetic-imported-projectile-projguarded-suffix-any.json checksum 4000bc4f are required in qa:trace
  -> pnpm qa:trace passes 428/428 artifacts, 398 required and 30 optional
  -> no score movement; exact ProjHit/ProjGuarded tick order/lifetime, multi-projectile selection beyond one matching any-id route, helper Projectile/custom-state persistence breadth, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, visual/audio parity beyond the bounded hit/guard contact packages, and full Projectile parity remain blocked

Previous R1 required player Projectile ProjHit/ProjGuarded fixed-id suffix trace gates
  -> synthetic-imported-projectile-projhit-suffix.json checksum dd3db5ee and synthetic-imported-projectile-projguarded-suffix.json checksum 80bbe439 remain required in qa:trace
  -> player-owned Projectile ids 8898/8899 route owner states 200 -> 352 -> 353 and 200 -> 354 -> 355 through fixed-id second-form suffix syntax
  -> pnpm qa:trace previously passed 426/426 artifacts, 396 required and 30 optional
  -> remains required

Previous R1 required player Projectile ProjContact suffix second-form trace gate
  -> synthetic-imported-projectile-projcontact-suffix.json checksum c904ded7 remains required in qa:trace
  -> player-owned Projectile id 8897 is guarded, owner state 200 routes on ProjContact8897 = 1, >= 1, transitions into 350, then branches to 351 from that later owner StateDef through fixed-id first-form suffix syntax with active projectile payload, owner target-link, guard sound, and FightFX spark package evidence
  -> pnpm qa:trace previously passed 424/424 artifacts, 394 required and 30 optional
  -> remains required

Previous R1 required player Projectile ProjContact state-transition trace gate
  -> synthetic-imported-projectile-projcontactpersist.json checksum 8e678b1b remains required in qa:trace
  -> player-owned Projectile id 8896 is guarded, owner state 200 observes ProjContact/ProjContactTime, transitions into 348, then branches to 349 from that later owner StateDef with active projectile payload, owner target-link, guard sound, and FightFX spark package evidence
  -> pnpm qa:trace previously passed 423/423 artifacts, 393 required and 30 optional
  -> remains required

Previous R1 required helper Projectile ProjContact state-transition trace gate
  -> synthetic-imported-helper-projcontactpersist.json checksum 65639428 is required in qa:trace
  -> helper-parented owner-side Projectile id 8895 is guarded, helper state 1300 observes ProjContact/ProjContactTime, transitions into 1302, then branches to 1301 from that later helper StateDef with helper/projectile lifecycle and owner target-link evidence
  -> pnpm qa:trace passed 422/422 artifacts, 392 required and 30 optional
  -> remains required; exact helper Projectile contact lifetime/order, multi-projectile selection, helper-owned custom-state targets, visual/audio parity beyond the bounded guard contact package, and full helper Projectile parity remain blocked

Previous R1 required helper reversed StateDef movehitpersist trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-movereversedpersist.json
  -> helper direct combat can be countered by defender-side ReversalDef before normal hit/guard resolution
  -> helper-local direct HitDef is reversed in 1200, persists MoveReversed into 1232 while MoveContact, MoveHit, MoveGuarded, HitCount, and UniqHitCount reset, and routes helper 1200 -> 1232 -> 1233 with P2 reversal state 779 evidence
  -> synthetic-imported-helper-movereversedpersist.json checksum ef8ffdf5 is required in qa:trace
  -> pnpm qa:trace passed 421/421 artifacts, 391 required and 30 optional
  -> no score movement; helper Projectile/custom-state movehitpersist breadth, exact reversal priority/target-state semantics, exact combo UI accumulation, multi-hit/multi-target/team counting, chain-hit eligibility arbitration, exact helper hitpause/target lifetime, visual/audio parity beyond the bounded reversal route, and full helper Move* lifetime parity remain blocked

Previous R1 required helper guarded StateDef movehitpersist trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-helper-moveguardedpersist.json
  -> helper-local guarded HitDef contact activates in 1200, persists MoveContact / MoveGuarded into 1230 while MoveHit, HitCount, and UniqHitCount reset, and routes helper 1200 -> 1230 -> 1231 with helper-owned guard sound/FightFX evidence
  -> synthetic-imported-helper-moveguardedpersist.json checksum d5ce7897 is required in qa:trace
  -> pnpm qa:trace passed 420/420 artifacts, 390 required and 30 optional
  -> remains required

Previous R1 required helper StateDef movehitpersist trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-helper-movehitpersist.json
  -> helper expression context exposes helper-local MoveContact / MoveHit / MoveGuarded / MoveReversed
  -> helper-local HitDef contact activates in 1200, persists MoveContact / MoveHit into 1228 while HitCount and UniqHitCount reset, and routes helper 1200 -> 1228 -> 1229 with helper-owned sound/FightFX evidence
  -> synthetic-imported-helper-movehitpersist.json checksum 2354ef95 is required in qa:trace
  -> pnpm qa:trace passed 419/419 artifacts, 389 required and 30 optional
  -> remains required; helper MoveReversed breadth beyond the bounded direct ReversalDef route, helper Projectile/custom-state movehitpersist breadth, exact combo UI accumulation, multi-hit/multi-target/team counting, chain-hit eligibility arbitration, exact helper hitpause/target lifetime, visual/audio parity beyond the bounded contact package, and full helper Move* lifetime parity remain blocked

Previous R1 required helper StateDef hitcountpersist trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-helper-hitcountpersist.json
  -> helper ChangeState preserves helper-local HitCount / UniqHitCount when the destination helper StateDef declares hitcountpersist = 1
  -> helper-local HitDef contact activates in 1200, persists hit counts into 1226 while MoveHit resets, and routes helper 1200 -> 1226 -> 1227 with helper-owned sound/FightFX evidence
  -> synthetic-imported-helper-hitcountpersist.json checksum fc9588d8 is required in qa:trace
  -> pnpm qa:trace passed 418/418 artifacts, 388 required and 30 optional
  -> remains required; Projectile/custom-state hitcountpersist breadth, exact combo UI accumulation, multi-hit/multi-target/team counting, chain-hit eligibility arbitration, exact helper hitpause/target lifetime, visual/audio parity beyond the bounded contact package, and full helper HitCount lifetime parity remain blocked

Previous R1 required helper StateDef hitdefpersist trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-hitdefpersist.json
  -> helper ChangeState preserves non-reversal active helper HitDefs when the destination helper StateDef declares hitdefpersist = 1
  -> helper-local HitDef activates in 1200, persists into 1224, hits there with helper-owned sound/FightFX evidence, and routes helper 1200 -> 1224 -> 1225
  -> synthetic-imported-helper-hitdefpersist.json checksum 9d5c64c4 is required in qa:trace
  -> pnpm qa:trace passed 417/417 artifacts, 387 required and 30 optional
  -> remains required; multi-HitDef stacking, player/helper Projectile hitdefpersist breadth, custom-state hitdefpersist breadth, ReversalDef interactions, exact helper hitpause/tick order, exact combo UI accumulation, multi-hit/multi-target/team counting, chain-hit eligibility arbitration, exact hitpause/target lifetime, visual/audio parity beyond the bounded contact package, and full HitDef lifetime parity remain blocked

Previous R1 required StateDef hitdefpersist trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-hitdefpersist.json
  -> parser/runtime StateDef metadata recognizes hitdefpersist = 1
  -> RuntimeStateEntryWorld can preserve a non-reversal active direct HitDef into a destination state
  -> direct HitDef activates in 200, persists into 346, hits there, and routes P1 200 -> 346 -> 347
  -> synthetic-imported-hitdefpersist.json checksum 4bb3e86c is required in qa:trace
  -> pnpm qa:trace passed 416/416 artifacts, 386 required and 30 optional
  -> remains required; multi-HitDef stacking, Projectile/custom-state hitdefpersist breadth, ReversalDef interactions, exact combo UI accumulation, multi-hit/multi-target/team counting, chain-hit eligibility arbitration, exact hitpause/target lifetime, visual/audio parity, and full HitDef lifetime parity remain blocked

Previous R1 required StateDef movehitpersist trace gate
  -> synthetic-imported-movehitpersist.json checksum 5c1ef583 remains required in qa:trace
  -> direct HitDef contact routes P1 200 -> 344 -> 345, proving MoveContact >= 1 && MoveHit >= 1 persists into state 344 while HitCount = 0 && UniqHitCount = 0
  -> pnpm qa:trace passed 415/415 artifacts, 385 required and 30 optional
  -> remains required; guarded/reversed breadth, exact combo UI accumulation, multi-hit/multi-target/team counting, helper/projectile/custom-state movehitpersist breadth, chain-hit eligibility arbitration, exact hitpause/target lifetime, visual/audio parity, and full Move* lifetime parity remain blocked

Previous R1 required StateDef hitcountpersist trace gate
  -> synthetic-imported-hitcountpersist.json checksum 6f032088 remains required in qa:trace
  -> direct HitDef contact routes P1 200 -> 342 -> 343, proving HitCount >= 1 && UniqHitCount >= 1 persists into state 342 while MoveHit = 0
  -> pnpm qa:trace passed 414/414 artifacts, 384 required and 30 optional
  -> remains required; exact combo UI accumulation, multi-hit/multi-target/team counting, helper/projectile/custom-state hitcountpersist breadth, chain-hit eligibility arbitration, exact hitpause/target lifetime, visual/audio parity, and full hit-count lifetime parity remain blocked

Previous R1 required Projectile/helper normal-hit HitCount trace gates
  -> RuntimeTraceGatePresets builds synthetic-imported-projectile-hitcount.json and synthetic-imported-helper-projectile-hitcount.json
  -> player-owned Projectile contact feeds owner MoveContact / MoveHit / HitCount, routes P1 to state 341 through HitCount >= 1 && UniqHitCount >= 1, and keeps projectile lifecycle plus target link p1 -> p2 / 77
  -> helper-parented/root-owned Projectile contact mirrors hit-count memory into the visual helper, exposes helper-local HitCount / UniqHitCount, routes helper 1257 -> 1258, and keeps target links p1 -> p2 / 8893 and p1-helper-0 -> p2 / 8893 plus helper/projectile lifecycle payload evidence
  -> synthetic-imported-projectile-hitcount.json checksum 97a1b671 remains required in qa:trace
  -> synthetic-imported-helper-projectile-hitcount.json checksum 19d1c22c remains required in qa:trace
  -> pnpm qa:trace passed 413/413 artifacts, 383 required and 30 optional
  -> remains required; exact combo accumulation, Projectile/helper hitcountpersist breadth, chain-hit eligibility arbitration, multi-hit/multi-target/team counting, exact hitpause lifetime, exact target lifetime/tick order, helper-owned custom states, custom-state inheritance, throws, teams/simul, visual/audio parity, and full Projectile/HitCount parity remain blocked

Previous R1 required Projectile/helper normal-hit GetHitVar hitcount trace gates
  -> RuntimeTraceGatePresets builds synthetic-imported-projectile-gethitvar-hitcount.json and synthetic-imported-helper-projectile-gethitvar-hitcount.json
  -> player/helper routes preserve HitDef numhits separately from Projectile projhits and prove GetHitVar(hitcount) from defender-owned Common1-style states 339/340
  -> synthetic-imported-projectile-gethitvar-hitcount.json trace checksum fa445b05 / final checksum 0c2197f7 remains required in qa:trace
  -> synthetic-imported-helper-projectile-gethitvar-hitcount.json trace checksum ded0c9b3 / final checksum bba71972 remains required in qa:trace
  -> pnpm qa:trace passed 411/411 artifacts, 381 required and 30 optional
  -> remains required; exact combo accumulation, chain-hit eligibility arbitration, multi-hit timing, exact hitpause lifetime, exact target lifetime/tick order, helper-owned custom states, custom-state inheritance, throws, teams/simul, visual/audio parity, and full Projectile/GetHitVar parity remain blocked

Previous R1 required Projectile/helper normal-hit GetHitVar hitid/chainid trace gates
  -> RuntimeTraceGatePresets now builds synthetic-imported-projectile-gethitvar-hitid-chainid.json and synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json
  -> player-owned Projectile effect id 77 preserves separate HitDef id 78 and chainID 44, routes P2 through defender-owned Common1-style 5000 -> 337, and proves GetHitVar(hitid) = 78, GetHitVar(chainid) = 44, and !GetHitVar(guarded)
  -> helper-parented/root-owned Projectile effect id 8891 preserves the same HitDef id 78 and chainID 44, routes P2 through 5000 -> 338, and proves GetHitVar(hitid) = 78, GetHitVar(chainid) = 44, and !GetHitVar(guarded)
  -> player route keeps projectile lifecycle plus target link p1 -> p2 / 78 while effect id stays 77
  -> helper route records owner/helper target links p1 -> p2 / 78 and p1-helper-0 -> p2 / 78 plus helper/projectile lifecycle payload evidence while effect id stays 8891
  -> synthetic-imported-projectile-gethitvar-hitid-chainid.json trace checksum 80392a85 / final checksum 514a6803 is required in qa:trace
  -> synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json trace checksum 24df4416 / final checksum f84c36ad is required in qa:trace
  -> pnpm qa:trace passes 409/409 artifacts, 379 required and 30 optional
  -> no score movement; exact chain-hit eligibility arbitration, combo accumulation, multi-hit timing, exact hitpause lifetime, exact target lifetime/tick order, helper-owned custom states, custom-state inheritance, throws, teams/simul, visual/audio parity, and full Projectile/GetHitVar parity remain blocked

Previous R1 required Projectile/helper normal-hit GetHitVar damage/hittime/xvel/yvel metadata trace gates
  -> RuntimeTraceGatePresets now builds synthetic-imported-projectile-gethitvar-hit-metadata.json and synthetic-imported-helper-projectile-gethitvar-hit-metadata.json
  -> player-owned Projectile id 77 routes P2 through defender-owned Common1-style 5000 -> 335 and proves GetHitVar(damage) = 31, GetHitVar(hittime) = 13, GetHitVar(xvel) = 4, GetHitVar(yvel) = -2, and !GetHitVar(guarded)
  -> helper-parented/root-owned Projectile id 8890 routes P2 through 5000 -> 336 and proves GetHitVar(damage) = 37, GetHitVar(hittime) = 14, GetHitVar(xvel) = 4, GetHitVar(yvel) = -2, and !GetHitVar(guarded)
  -> player route keeps projectile lifecycle plus target link p1 -> p2 / 77
  -> helper route records owner/helper target links p1 -> p2 / 8890 and p1-helper-0 -> p2 / 8890 plus helper/projectile lifecycle payload evidence
  -> synthetic-imported-projectile-gethitvar-hit-metadata.json trace checksum 6b7ad6e5 / final checksum 36365083 is required in qa:trace
  -> synthetic-imported-helper-projectile-gethitvar-hit-metadata.json trace checksum 4a65158a / final checksum dfbc9fe9 is required in qa:trace
  -> pnpm qa:trace passed 407/407 artifacts, 377 required and 30 optional
  -> remains required; exact hitpause lifetime, exact target lifetime/tick order, helper-owned custom states, multi-hit arbitration, broader combo/chain/id breadth, custom-state inheritance, throws, teams/simul, visual/audio parity, and full Projectile/GetHitVar parity remain blocked

Previous R1 required Projectile/helper guard slide-stop trace gates
  -> synthetic-imported-projectile-guard-slide-stop.json trace checksum 965c2d12 / final checksum 0973a73c is required in qa:trace
  -> synthetic-imported-helper-projectile-guard-slide-stop.json trace checksum 6c42a378 / final checksum df8b7a42 is required in qa:trace
  -> those gates extend the existing direct synthetic-imported-default-guard-slide-stop.json stand-guard proof to player-owned Projectile and helper-parented Projectile routes
  -> pnpm qa:trace passed 405/405 artifacts, 375 required and 30 optional
  -> remains required; exact guard control tick order, HitOver vs CtrlSet parity, guard velocity decay/friction, guard effects, helper-owned custom states, and full guard/projectile parity remain blocked

Previous R1 required default guard timing derivation trace gates
  -> RuntimeTraceGatePresets now builds synthetic-imported-guard-timing-default.json, synthetic-imported-projectile-guard-timing-default.json, and synthetic-imported-helper-projectile-guard-timing-default.json
  -> HitDefSystem, ProjectileSystem, and imported fighter move construction derive omitted guard.hittime, guard.slidetime, and guard.ctrltime through ground.hittime -> guard.hittime -> guard.slidetime -> guard.ctrltime
  -> direct HitDef, player-owned Projectile, and helper-parented Projectile omit guard timing params and keep P2 in stand guard states 150 -> 151
  -> all three routes require GetHitVar(hittime/slidetime/ctrltime) evidence proving the default chain reached Common1-style guard-hit CNS
  -> helper Projectile route also records owner/helper target links plus helper/projectile lifecycle payload evidence
  -> synthetic-imported-guard-timing-default.json trace checksum 859cb873 / final checksum bae55cbc is required in qa:trace
  -> synthetic-imported-projectile-guard-timing-default.json trace checksum 21dc44c4 / final checksum 1c3d9c20 is required in qa:trace
  -> synthetic-imported-helper-projectile-guard-timing-default.json trace checksum d421498c / final checksum 1733494a is required in qa:trace
  -> pnpm qa:trace passes 403/403 artifacts, 373 required and 30 optional
  -> no score movement; exact guard control tick order, HitOver vs CtrlSet parity, guard effects, guard velocity decay/friction, guard pushbox details, throws, teams/simul, and full guard/projectile parity remain blocked

Previous R1 required default guard.velocity derivation trace gates
  -> synthetic-imported-guard-velocity-default.json checksum e6bd9b40 is required in qa:trace
  -> synthetic-imported-projectile-guard-velocity-default.json checksum b72451a4 is required in qa:trace
  -> synthetic-imported-helper-projectile-guard-velocity-default.json checksum 2067ba99 is required in qa:trace
  -> pnpm qa:trace passed 400/400 artifacts, 370 required and 30 optional
  -> remains required; exact guard velocity decay/friction, wall friction, and full guard/projectile parity remain blocked

Previous R1 required default guard.cornerpush.veloff derivation trace gates
  -> synthetic-imported-guard-cornerpush-default.json checksum 95293bc4 is required in qa:trace
  -> synthetic-imported-projectile-guard-cornerpush-default.json checksum 58798e7a is required in qa:trace
  -> synthetic-imported-helper-projectile-guard-cornerpush-default.json checksum 292b2015 is required in qa:trace
  -> pnpm qa:trace passed 397/397 artifacts, 367 required and 30 optional
  -> remains required; exact guard timing/effects, corner-push timing/decay, wall friction, and full guard/projectile parity remain blocked

Previous R1 required default down.cornerpush.veloff derivation trace gates
  -> synthetic-imported-down-hit-cornerpush-default.json checksum 04557813 is required in qa:trace
  -> synthetic-imported-projectile-down-hit-cornerpush-default.json checksum b302e3b9 is required in qa:trace
  -> synthetic-imported-helper-projectile-down-hit-cornerpush-default.json checksum fe0c3ff1 is required in qa:trace
  -> pnpm qa:trace passed 394/394 artifacts, 364 required and 30 optional
  -> remains required; exact lie-down tables, recovery timing, corner-push timing/decay, wall friction, exact down-hit physics, and full Common1/projectile parity remain blocked

Previous R1 required explicit down.cornerpush.veloff runtime-selection trace gates
  -> synthetic-imported-down-hit-cornerpush.json checksum b372c07b is required in qa:trace
  -> synthetic-imported-projectile-down-hit-cornerpush.json checksum 5f2a653f is required in qa:trace
  -> synthetic-imported-helper-projectile-down-hit-cornerpush.json checksum 5231ad5c is required in qa:trace
  -> pnpm qa:trace passed 391/391 artifacts, 361 required and 30 optional
  -> remains required; exact lie-down tables, recovery timing, corner-push timing/decay, wall friction, and full Common1/projectile parity remain blocked

Previous R1 required default air.cornerpush.veloff derivation trace gates
  -> synthetic-imported-air-hit-cornerpush-default.json checksum 73129a04 is required in qa:trace
  -> synthetic-imported-projectile-air-hit-cornerpush-default.json checksum 9bfae4d6 is required in qa:trace
  -> synthetic-imported-helper-projectile-air-hit-cornerpush-default.json checksum 9c81047d is required in qa:trace
  -> pnpm qa:trace passed 388/388 artifacts, 358 required and 30 optional
  -> remains required; exact air get-hit physics/timing, hit effects, and full Common1/projectile parity remain blocked

Previous detailed R1 required default air.cornerpush.veloff derivation trace gates
  -> RuntimeTraceGatePresets now builds synthetic-imported-air-hit-cornerpush-default.json, synthetic-imported-projectile-air-hit-cornerpush-default.json, and synthetic-imported-helper-projectile-air-hit-cornerpush-default.json
  -> direct HitDef, player-owned Projectile, and helper-parented Projectile omit corner-push params and derive air-hit cornerpush through air.cornerpush.veloff -> ground.cornerpush.veloff plus the guard/ground velocity fallback path
  -> all three routes hit an airborne defender at the stage edge, keep the defender in Common1-style airborne hit state 5020, and require attacker/owner X velocity evidence from derived corner pushback
  -> helper Projectile route also records owner/helper target links plus helper/projectile lifecycle payload evidence
  -> synthetic-imported-air-hit-cornerpush-default.json checksum 73129a04 is required in qa:trace
  -> synthetic-imported-projectile-air-hit-cornerpush-default.json checksum 9bfae4d6 is required in qa:trace
  -> synthetic-imported-helper-projectile-air-hit-cornerpush-default.json checksum 9c81047d is required in qa:trace
  -> pnpm qa:trace passed 388/388 artifacts, 358 required and 30 optional
  -> no score movement; exact corner-push timing/decay, wall friction, exact air get-hit physics/timing, hit effects, throws, teams/simul, and full Common1/projectile parity remain blocked

Previous R1 required default airguard.cornerpush.veloff trace gates
  -> synthetic-imported-air-guard-cornerpush-default.json checksum c32781ad is required in qa:trace
  -> synthetic-imported-projectile-air-guard-cornerpush-default.json checksum 90f5e385 is required in qa:trace
  -> synthetic-imported-helper-projectile-air-guard-cornerpush-default.json checksum 0271a2b9 is required in qa:trace
  -> pnpm qa:trace passed 385/385 artifacts, 355 required and 30 optional
  -> no score movement; exact corner-push timing/decay, wall friction, exact air guard physics/landing/timing, guard effects, throws, teams/simul, and full guard parity remain blocked

Previous R1 required explicit airguard.cornerpush.veloff trace gates
  -> synthetic-imported-air-guard-cornerpush.json checksum 9fdb8a81 is required in qa:trace
  -> synthetic-imported-projectile-air-guard-cornerpush.json checksum 15f26082 is required in qa:trace
  -> synthetic-imported-helper-projectile-air-guard-cornerpush.json checksum 35d7148b is required in qa:trace
  -> pnpm qa:trace passed 382/382 artifacts, 352 required and 30 optional
  -> no score movement; exact corner-push timing/decay, wall friction, exact air guard physics/landing/timing, guard effects, throws, teams/simul, and full guard parity remain blocked

Previous R1 required default airguard.velocity derivation trace gates
  -> synthetic-imported-air-guard-velocity-default.json checksum b1710269 is required in qa:trace
  -> synthetic-imported-projectile-air-guard-velocity-default.json checksum bd1a774e is required in qa:trace
  -> synthetic-imported-helper-projectile-air-guard-velocity-default.json checksum 3351e770 is required in qa:trace
  -> pnpm qa:trace passed 379/379 artifacts, 349 required and 30 optional
  -> no score movement; exact air guard physics/landing/timing, visual/audio guard effects, throws, teams/simul, and full guard parity remain blocked

Previous R1 required explicit airguard.velocity trace gates
  -> synthetic-imported-air-guard-velocity.json checksum 5ebc1e7b remains required in qa:trace
  -> synthetic-imported-projectile-air-guard-velocity.json checksum 0094c369 remains required in qa:trace
  -> synthetic-imported-helper-projectile-air-guard-velocity.json checksum b547dfb3 remains required in qa:trace
  -> direct HitDef, player-owned Projectile, and helper-parented Projectile all author airguard.velocity = 8,-4
  -> pnpm qa:trace passed 376/376 artifacts, 346 required and 30 optional
  -> no score movement; exact air guard physics/landing/timing, exact corner-push timing/decay, visual/audio guard effects, throws, teams/simul, and full guard parity remain blocked

Previous R1 required HitOverride guardflag plus forceair/forceguard/keepstate trace gates
  -> RuntimeTraceGatePresets now builds synthetic-imported-hitoverride-guardflag-forceair-forceguard-keepstate.json, synthetic-imported-projectile-hitoverride-guardflag-forceair-forceguard-keepstate.json, and synthetic-imported-helper-projectile-hitoverride-guardflag-forceair-forceguard-keepstate.json
  -> direct HitDef, player-owned Projectile id 77, and helper-parented Projectile id 8884 all use incoming guardflag = H
  -> P2 installs attr-matching slots 1 -> 776 with guardflag.not = HA, 2 -> 778 with guardflag = A, and 5 -> 779 with guardflag = H plus forceair/forceguard/keepstate
  -> all three routes skip slots 1/2, select slot 5, avoid state 779 because keepstate is set, keep P2 in state/action 0, and require actor-frame evidence with stateType = A, physics = A, and guardingFrames >= 1
  -> direct/player routes retain target link p1 -> p2 / 77; helper route records target links p1 -> p2 / 8884 and p1-helper-0 -> p2 / 8884, helper targetCount = 1, projectile hasHit = true / hitsRemaining = 0, and suppresses helper branch 1297
  -> synthetic-imported-hitoverride-guardflag-forceair-forceguard-keepstate.json checksum 35fa8224 is required in qa:trace
  -> synthetic-imported-projectile-hitoverride-guardflag-forceair-forceguard-keepstate.json checksum 1fd6c321 is required in qa:trace
  -> synthetic-imported-helper-projectile-hitoverride-guardflag-forceair-forceguard-keepstate.json checksum 7efa40bb is required in qa:trace
  -> pnpm qa:trace passes 373/373 artifacts, 343 required and 30 optional
  -> no score movement; exact guard timing/guarded get-hit variables, forceguard chip/damage semantics, final-frame forced aerial persistence, exact target lifetime, helper-owned custom-state tables, guard KO/no-KO flow, and full HitOverride parity remain blocked

R1 required default custom-state HitOverride missonoverride guardflag-filter trace gates
  -> RuntimeTraceGatePresets now builds synthetic-imported-hitoverride-missonoverride-default-guardflag-filter.json, synthetic-imported-projectile-hitoverride-missonoverride-default-guardflag-filter.json, and synthetic-imported-helper-projectile-hitoverride-missonoverride-default-guardflag-filter.json
  -> direct HitDef p2stateno 888 omits missonoverride, uses guardflag = H, rejects before target memory, override state entry, owner-backed custom-state 888, default get-hit, or guard states, and leaves P2 idle/control with life 1000
  -> player-owned Projectile id 77 and helper-parented Projectile id 8882 omit missonoverride, use p2stateno = 889 / p2getp1state = 1 / guardflag = H, skip slots 1 -> 776 with guardflag.not = HA and 2 -> 778 with guardflag = A, select slot 5 -> 779, suppress projectile custom-state 889, and end P2 in state/action 779
  -> helper route also records target links p1 -> p2 / 8882 and p1-helper-0 -> p2 / 8882, helper targetCount = 1, projectile hasHit = true / hitsRemaining = 0, and suppresses helper branch 1293
  -> synthetic-imported-hitoverride-missonoverride-default-guardflag-filter.json checksum 05725ecb is required in qa:trace
  -> synthetic-imported-projectile-hitoverride-missonoverride-default-guardflag-filter.json checksum c1402d31 is required in qa:trace
  -> synthetic-imported-helper-projectile-hitoverride-missonoverride-default-guardflag-filter.json checksum 889d77c1 is required in qa:trace
  -> pnpm qa:trace passes 370/370 artifacts, 340 required and 30 optional
  -> no score movement; exact guard timing/guarded contact semantics, forceair/forceguard priority combinations, exact target lifetime, helper-owned custom-state tables, guard KO/no-KO flow, and full HitOverride/custom-state parity remain blocked

R1 required custom-state HitOverride missonoverride zero guardflag-filter trace gates
  -> RuntimeTraceGatePresets now builds synthetic-imported-hitoverride-missonoverride-zero-guardflag-filter.json, synthetic-imported-projectile-hitoverride-missonoverride-zero-guardflag-filter.json, and synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-guardflag-filter.json
  -> direct HitDef p2stateno 888, player-owned Projectile id 77 p2stateno 889, and helper-parented Projectile id 8881 p2stateno 889 all declare missonoverride = 0 and guardflag = H
  -> P2 installs attr-matching HitOverride slots 1 -> 776 with guardflag.not = HA, 2 -> 778 with guardflag = A, and 5 -> 779 with guardflag = H
  -> all three routes skip slots 1/2, select slot 5, suppress the custom state, forbid default get-hit/guard states, and end P2 in state/action 779, life 1000, moveType I
  -> helper route also records target links p1 -> p2 / 8881 and p1-helper-0 -> p2 / 8881, helper targetCount = 1, projectile hasHit = true / hitsRemaining = 0, and suppresses helper branch 1291
  -> synthetic-imported-hitoverride-missonoverride-zero-guardflag-filter.json checksum 058b335f is required in qa:trace
  -> synthetic-imported-projectile-hitoverride-missonoverride-zero-guardflag-filter.json checksum af29f125 is required in qa:trace
  -> synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-guardflag-filter.json checksum 9edbf3d0 is required in qa:trace
  -> pnpm qa:trace passes 367/367 artifacts, 337 required and 30 optional
  -> no score movement; exact guard timing/guarded contact semantics, default missonoverride guardflag breadth, forceair/forceguard priority combinations, exact target lifetime, helper-owned custom-state tables, guard KO/no-KO flow, and full HitOverride/custom-state parity remain blocked

Previous R1 required Projectile custom-state HitOverride missonoverride zero slot-priority trace gates
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-slot-priority.json and synthetic-imported-projectile-hitoverride-missonoverride-zero-slot-priority.json
  -> player-owned Projectile id 77 and helper-parented Projectile id 8878 both declare p2stateno = 889, p2getp1state = 1, and missonoverride = 0
  -> P2 installs matching HitOverride slots 5 -> 779 and 2 -> 778
  -> both routes select slot 2, consume/remove the projectile, emit override telemetry, suppress projectile custom state 889, and end P2 in state/action 778, life 1000, moveType I
  -> helper route also records target links p1 -> p2 / 8878 and p1-helper-0 -> p2 / 8878, helper targetCount = 1, projectile hasHit = true / hitsRemaining = 0, and suppresses helper ProjHit branch 1288
  -> synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-slot-priority.json checksum 9a5a149f is required in qa:trace
  -> synthetic-imported-projectile-hitoverride-missonoverride-zero-slot-priority.json checksum 96b6b7de is required in qa:trace
  -> that pnpm qa:trace pass was 364/364 artifacts, 334 required and 30 optional
  -> no score movement; custom-state guardflag inheritance/timing, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, and full Projectile HitOverride/custom-state parity remain blocked

Previous R1 required helper-parented Projectile default custom-state HitOverride missonoverride forceair forceguard keepstate trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json
  -> visual Helper spawns owner-side Projectile id 8877 with parentId = p1-helper-0, p2stateno = 889, p2getp1state = 1, and omitted missonoverride so imported default is -1
  -> P2 installs HitOverride slot 3 -> 780 with time = 30, forceair = 1, forceguard = 1, and keepstate = 1
  -> combat selects slot 3, records owner target link p1 -> p2 / 8877 plus helper target link p1-helper-0 -> p2 / 8877, consumes/removes projectile, emits override telemetry, and keeps P2 in state/action 0 instead of entering state 780, projectile custom state 889, or helper ProjHit branch 1286
  -> helper payload proves targetCount = 1; projectile payload proves hasHit = true and hitsRemaining = 0
  -> actor-frame evidence observes P2 stateType = A, physics = A, and guardingFrames >= 1 while still in state/action 0
  -> states 780, 889, 1286, 5000, 150, and 151 are forbidden; final P2 returns to state/action 0, life 1000, moveType I
  -> synthetic-imported-helper-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json checksum fb964bfb is required in qa:trace
  -> pnpm qa:trace passes 362/362 artifacts, 332 required and 30 optional
  -> no score movement; custom-state guardflag inheritance/timing, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, and full helper Projectile HitOverride/custom-state parity remain blocked

Previous R1 required player-owned Projectile default custom-state HitOverride missonoverride forceair forceguard keepstate trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json
  -> P1 Projectile id 77 declares p2stateno = 889 and p2getp1state = 1 while omitting missonoverride so the imported default is -1
  -> P2 installs HitOverride slot 3 -> 780 with time = 30, forceair = 1, forceguard = 1, and keepstate = 1
  -> combat selects slot 3, records target link p1 -> p2 / 77, consumes/removes the projectile, emits override telemetry, and keeps P2 in state/action 0 instead of entering state 780 or projectile custom state 889
  -> actor-frame evidence observes P2 stateType = A, physics = A, and guardingFrames >= 1 while still in state/action 0
  -> states 780, 889, 5000, 150, and 151 are forbidden; final P2 returns to state/action 0, life 1000, moveType I
  -> synthetic-imported-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json checksum 4ce42cf3 is required in qa:trace
  -> pnpm qa:trace passes 361/361 artifacts, 331 required and 30 optional
  -> no score movement; custom-state guardflag inheritance/timing, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, and full Projectile HitOverride/custom-state parity remain blocked

Previous R1 required direct default custom-state HitOverride missonoverride forceair forceguard keepstate miss trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json
  -> P1 direct HitDef declares p2stateno = 888, p2getp1state = 1, and omits missonoverride so the imported default is -1
  -> P2 installs HitOverride slot 3 -> 780 with time = 30, forceair = 1, forceguard = 1, and keepstate = 1
  -> combat rejects before target memory, damage, guard, forceair/forceguard actor frames, keepstate redirect handling, override state 780, owner-backed custom state 888, default get-hit state 5000, or guard states 150/151
  -> no target links are recorded; event/combat telemetry is reject-only for the custom-state HitDef path
  -> final P2 stays state/action 0, life 1000, ctrl true, moveType I
  -> synthetic-imported-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json checksum 20e40425 is required in qa:trace
  -> that pnpm qa:trace pass was 360/360 artifacts, 330 required and 30 optional
  -> no score movement; custom-state guardflag inheritance/timing, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, and full HitOverride/custom-state parity remain blocked

Previous R1 required helper-parented Projectile custom-state HitOverride missonoverride zero forceair forceguard keepstate trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json
  -> visual Helper spawns owner-side Projectile id 8876 with parentId = p1-helper-0, p2stateno = 889, p2getp1state = 1, and missonoverride = 0
  -> P2 installs HitOverride slot 3 -> 780 with time = 30, forceair = 1, forceguard = 1, and keepstate = 1
  -> combat selects slot 3, records owner target link p1 -> p2 / 8876 plus helper target link p1-helper-0 -> p2 / 8876, consumes/removes the projectile, emits override telemetry, and keeps P2 in state/action 0 instead of entering state 780, projectile custom state 889, or helper ProjHit branch 1284
  -> helper payload proves targetCount = 1; projectile payload proves hasHit = true and hitsRemaining = 0
  -> actor-frame evidence observes P2 stateType = A, physics = A, and guardingFrames >= 1 while still in state/action 0
  -> states 780, 889, 1284, 5000, 150, and 151 are forbidden; final P2 returns to state/action 0, life 1000, moveType I
  -> synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json checksum e23a33af is required in qa:trace
  -> pnpm qa:trace passes 359/359 artifacts, 329 required and 30 optional
  -> no score movement; custom-state guardflag inheritance/timing, exact guarded get-hit variable/chip semantics, and full helper Projectile HitOverride/custom-state parity remain blocked

Previous R1 required player-owned Projectile custom-state HitOverride missonoverride zero forceair forceguard keepstate trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json
  -> P1 Projectile id 77 declares p2stateno = 889, p2getp1state = 1, and missonoverride = 0
  -> P2 installs HitOverride slot 3 -> 780 with time = 30, forceair = 1, forceguard = 1, and keepstate = 1
  -> combat selects slot 3, records target link p1 -> p2 / 77, consumes/removes the projectile, emits override telemetry, and keeps P2 in state/action 0 instead of entering state 780 or projectile custom state 889
  -> actor-frame evidence observes P2 stateType = A, physics = A, and guardingFrames >= 1 while still in state/action 0
  -> states 780, 889, 5000, 150, and 151 are forbidden; final P2 returns to state/action 0, life 1000, moveType I
  -> synthetic-imported-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json checksum 15bc955b remains required in qa:trace
  -> that pnpm qa:trace pass was 358/358 artifacts, 328 required and 30 optional
  -> no score movement; custom-state guardflag inheritance/timing, exact guarded get-hit variable/chip semantics, and full Projectile HitOverride/custom-state parity remain blocked

R1 required direct custom-state HitOverride missonoverride zero forceair forceguard keepstate trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json
  -> P1 direct HitDef declares p2stateno = 888, p2getp1state = 1, and missonoverride = 0
  -> P2 installs HitOverride slot 3 -> 780 with time = 30, forceair = 1, forceguard = 1, and keepstate = 1
  -> combat selects slot 3, records target link p1 -> p2 / 77, emits override telemetry, and keeps P2 in state/action 0 instead of entering state 780 or owner-backed custom state 888
  -> actor-frame evidence observes P2 stateType = A, physics = A, and guardingFrames >= 1 while still in state/action 0
  -> states 780, 888, 5000, 150, and 151 are forbidden; final P2 returns to state/action 0, life 1000, moveType I
  -> synthetic-imported-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json checksum 4d9043a5 is required in qa:trace
  -> pnpm qa:trace passes 357/357 artifacts, 327 required and 30 optional
  -> no score movement; helper/projectile custom-state force flags, custom-state guardflag inheritance/timing, exact guarded get-hit variable/chip semantics, and full HitOverride/custom-state parity remain blocked

Previous R1 required helper-parented Projectile HitOverride forceair forceguard keepstate trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-projectile-hitoverride-forceair-forceguard-keepstate.json
  -> visual Helper spawns Projectile id 8875 with parentId p1-helper-0, p2stateno = 889, and p2getp1state = 0
  -> P2 installs HitOverride slot 3 -> 780 with time = 30, forceair = 1, forceguard = 1, and keepstate = 1
  -> combat selects slot 3, records target links p1 -> p2 / 8875 and p1-helper-0 -> p2 / 8875, emits override telemetry, records projectile payload hasHit = true / hitsRemaining = 0, and keeps P2 in state/action 0 instead of entering state 780
  -> actor-frame evidence observes P2 stateType = A, physics = A, and guardingFrames >= 1 while still in state/action 0
  -> states 780, 889, helper ProjHit branch 1282, 5000, 150, and 151 are forbidden; final P2 returns to state/action 0, life 1000, moveType I
  -> synthetic-imported-helper-projectile-hitoverride-forceair-forceguard-keepstate.json checksum 84dc3969 is required in qa:trace
  -> that pnpm qa:trace pass was 356/356 artifacts, 326 required and 30 optional
  -> no score movement; final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, visual/audio parity, and full helper Projectile HitOverride parity remain blocked

Previous R1 required player-owned Projectile HitOverride forceair forceguard keepstate trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-projectile-hitoverride-forceair-forceguard-keepstate.json
  -> synthetic-imported-projectile-hitoverride-forceair-forceguard-keepstate.json checksum 3806a769 remains required in qa:trace
  -> that pnpm qa:trace pass was 355/355 artifacts, 325 required and 30 optional

Previous R1 required direct-HitDef HitOverride forceair forceguard keepstate trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-hitoverride-forceair-forceguard-keepstate.json
  -> synthetic-imported-hitoverride-forceair-forceguard-keepstate.json checksum 19787fb2 remains required in qa:trace
  -> that pnpm qa:trace pass was 354/354 artifacts, 324 required and 30 optional

Previous R1 required helper-parented Projectile HitOverride guardflag filter trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-projectile-hitoverride-guardflag-filter.json
  -> visual Helper spawns Projectile id 8874 with parentId p1-helper-0, guardflag = H, p2stateno = 889, and p2getp1state = 0
  -> P2 installs attr-matching HitOverride slot 1 -> 776 with guardflag.not = HA, slot 2 -> 778 with guardflag = A, and slot 5 -> 779 with guardflag = H
  -> combat skips slots 1 and 2, selects slot 5, records owner target link p1 -> p2 / 8874 plus helper target link p1-helper-0 -> p2 / 8874, marks projectile payload hitsRemaining = 0 / hasHit = true, and redirects P2 through state 779
  -> states 776, 778, 889, helper ProjHit branch 1280, 5000, 150, and 151 are forbidden; final P2 remains state 779, life 1000
  -> synthetic-imported-helper-projectile-hitoverride-guardflag-filter.json checksum 41a87267 is required in qa:trace
  -> that pnpm qa:trace pass was 353/353 artifacts, 323 required and 30 optional
  -> no score movement; custom-state guardflag inheritance/timing, custom-state forceair/forceguard/keepstate breadth, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, visual/audio parity, and full helper Projectile/HitOverride parity remain blocked

Previous R1 required player-owned Projectile HitOverride guardflag filter trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-projectile-hitoverride-guardflag-filter.json
  -> P1 fires Projectile id 77 with guardflag = H and p2stateno = 889
  -> P2 installs attr-matching HitOverride slot 1 -> 776 with guardflag.not = HA, slot 2 -> 778 with guardflag = A, and slot 5 -> 779 with guardflag = H
  -> combat skips slots 1 and 2, selects slot 5, records target link p1 -> p2 / 77, consumes/removes the projectile as a hit, and redirects P2 through state 779
  -> states 776, 778, 889, 5000, 150, and 151 are forbidden; final P2 remains state 779, life 1000
  -> synthetic-imported-projectile-hitoverride-guardflag-filter.json checksum a51e82ec is required in qa:trace
  -> that pnpm qa:trace pass was 352/352 artifacts, 322 required and 30 optional
  -> no score movement; custom-state guardflag inheritance/timing, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, visual/audio parity, and full Projectile/HitOverride parity remain blocked

Previous R1 required direct-HitDef HitOverride guardflag filter trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-hitoverride-guardflag-filter.json
  -> P1 hits with attr = S,NA and guardflag = H
  -> P2 installs attr-matching HitOverride slot 1 -> 776 with guardflag.not = HA, slot 2 -> 778 with guardflag = A, and slot 5 -> 779 with guardflag = H
  -> combat skips slots 1 and 2, selects slot 5, records target link p1 -> p2 / 77, and redirects P2 through state 779
  -> states 776, 778, 5000, 150, and 151 are forbidden; final P2 remains state 779, life 1000
  -> synthetic-imported-hitoverride-guardflag-filter.json checksum b88a2da3 is required in qa:trace
  -> that pnpm qa:trace pass was 351/351 artifacts, 321 required and 30 optional
  -> no score movement; custom-state guardflag inheritance/timing, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, visual/audio parity, and full HitOverride parity remain blocked

R1 required direct-HitDef missonoverride zero slot priority trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-hitoverride-missonoverride-zero-slot-priority.json
  -> P1 declares p2stateno = 888, p2getp1state = 1, and missonoverride = 0
  -> P2 installs matching HitOverride slot 5 -> 779 and slot 2 -> 778 in high-to-low controller order
  -> contact records target link p1 -> p2 / 77
  -> combat selects slot 2 and redirects P2 through HitOverride state 778, not state 779 or owner-backed custom state 888
  -> states 779, 888, 5000, 150, and 151 are forbidden; final P2 remains state 778, life 1000
  -> synthetic-imported-hitoverride-missonoverride-zero-slot-priority.json checksum 92fefd6a is required in qa:trace
  -> pnpm qa:trace passes 350/350 artifacts, 320 required and 30 optional
  -> no score movement; helper/projectile custom-state slot-priority breadth, guardflag edge timing, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, visual/audio parity, and full HitOverride parity remain blocked

R1 required helper-parented Projectile HitOverride slot priority trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-projectile-hitoverride-slot-priority.json
  -> visual Helper spawns Projectile id 8873 with parentId p1-helper-0, p2stateno = 889, and p2getp1state = 0
  -> P2 installs matching HitOverride slot 5 -> 779 and slot 2 -> 778 in high-to-low controller order
  -> contact records owner target link p1 -> p2 / 8873 plus helper target link p1-helper-0 -> p2 / 8873 and marks projectile payload hitsRemaining = 0 / hasHit = true
  -> combat selects slot 2 and redirects P2 through HitOverride state 778, not state 779, projectile custom state 889, or helper ProjHit branch 1278
  -> states 779, 889, 1278, 5000, 150, and 151 are forbidden; final P2 remains state 778, life 1000
  -> synthetic-imported-helper-projectile-hitoverride-slot-priority.json checksum 1d058518 is required in qa:trace
  -> pnpm qa:trace passes 349/349 artifacts, 319 required and 30 optional
  -> no score movement; custom-state slot-priority breadth, guardflag edge timing, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, visual/audio parity, and full Projectile/HitOverride parity remain blocked

Previous R1 required player-owned Projectile HitOverride slot priority trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-projectile-hitoverride-slot-priority.json
  -> P2 installs matching HitOverride slot 5 -> 779 and slot 2 -> 778 in high-to-low controller order
  -> P1 fires Projectile id 77 with p2stateno = 889; contact records target link p1 -> p2 / 77 and consumes/removes the projectile as a hit
  -> combat selects slot 2 and redirects P2 through HitOverride state 778, not state 779 or projectile custom state 889
  -> states 779, 889, 5000, 150, and 151 are forbidden; final P2 remains state 778, life 1000
  -> synthetic-imported-projectile-hitoverride-slot-priority.json checksum 378d9ce8 is required in qa:trace
  -> that pnpm qa:trace pass was 348/348 artifacts, 318 required and 30 optional
  -> no score movement; custom-state slot-priority breadth, guardflag edge timing, forceair/forceguard/keepstate combinations, visual/audio parity, and full Projectile/HitOverride parity remain blocked

Previous R1 required direct-HitDef HitOverride slot priority trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-hitoverride-slot-priority.json
  -> P2 installs matching HitOverride slot 5 -> 779 and slot 2 -> 778 in high-to-low controller order
  -> P1 hits with attr = S,NA; combat selects slot 2 and redirects P2 through HitOverride state 778, not state 779
  -> states 779, 5000, 150, and 151 are forbidden; final P2 remains state 778, life 1000
  -> synthetic-imported-hitoverride-slot-priority.json checksum 8de62354 is required in qa:trace
  -> that pnpm qa:trace pass was 347/347 artifacts, 317 required and 30 optional
  -> no score movement; helper-parented Projectile/custom-state slot-priority breadth, guardflag edge timing, forceair/forceguard/keepstate combinations, visual/audio parity, and full HitOverride parity remain blocked

Previous R1 required helper Projectile missonoverride zero HitOverride trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-projectile-hitoverride-missonoverride-zero.json
  -> visual Helper spawns Projectile id 8872 with parentId p1-helper-0, p2stateno = 889, p2getp1state = 1, and missonoverride = 0 while P2 has active matching HitOverride slot 777
  -> contact records owner target link p1 -> p2 / 8872 plus helper target link p1-helper-0 -> p2 / 8872, marks the projectile hit/consumed with hitsRemaining = 0 / hasHit = true, and redirects P2 through HitOverride state 777 instead of missing or entering projectile custom state 889
  -> states 889, 1276, 5000, 150, and 151 are forbidden; final P2 remains state 777, life 1000
  -> synthetic-imported-helper-projectile-hitoverride-missonoverride-zero.json checksum 62d7d6b8 is required in qa:trace
  -> that pnpm qa:trace pass was 346/346 artifacts, 316 required and 30 optional
  -> no score movement; broader missonoverride custom-state breadth, helper/projectile/custom-state slot-priority breadth, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, visual/audio parity, and full Projectile/HitOverride parity remain blocked

Previous R1 required player-owned Projectile missonoverride zero HitOverride trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-projectile-hitoverride-missonoverride-zero.json
  -> Projectile declares p2stateno = 889 / p2getp1state = 1 / missonoverride = 0 while P2 has active matching HitOverride slot 777
  -> contact records target id 77, consumes/removes the projectile as hit, and redirects P2 through HitOverride state 777 instead of missing or entering projectile custom state 889
  -> states 889, 5000, 150, and 151 are forbidden; final P2 remains state 777, life 1000
  -> synthetic-imported-projectile-hitoverride-missonoverride-zero.json checksum 5c12f3cc remains required in qa:trace
  -> that pnpm qa:trace pass was 345/345 artifacts, 315 required and 30 optional
  -> no score movement; helper-parented Projectile missonoverride = 0 is covered by a later checkpoint, while broader missonoverride custom-state breadth, helper/projectile/custom-state slot-priority breadth, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, visual/audio parity, and full Projectile/HitOverride parity remain blocked

Previous R1 required helper Projectile missonoverride one HitOverride trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-projectile-hitoverride-missonoverride-one.json
  -> visual Helper spawns Projectile id 8871 with parentId p1-helper-0 and missonoverride = 1 while P2 has active matching HitOverride slot 777
  -> contact rejects before owner/helper target memory, projectile contact consumption, damage, guard, normal HitOverride redirect, helper ProjHit branch 1275, or projectile custom-state entry
  -> states 777, 889, 1275, 5000, 150, and 151 are forbidden; final P2 remains state 0, life 1000, ctrl true; projectile remains active with hitsRemaining = 1 / hasHit = false
  -> synthetic-imported-helper-projectile-hitoverride-missonoverride-one.json checksum a99979bb is required in qa:trace
  -> that pnpm qa:trace pass was 344/344 artifacts, 314 required and 30 optional
  -> no score movement; player-owned and helper-parented Projectile missonoverride = 0 are covered by later checkpoints, while broader missonoverride custom-state breadth, exact slot priority, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, visual/audio parity, and full Projectile/HitOverride parity remain blocked

Previous R1 required player-owned Projectile missonoverride one HitOverride trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-projectile-hitoverride-missonoverride-one.json
  -> Projectile declares missonoverride = 1 while P2 has active matching HitOverride slot 777
  -> contact rejects before target memory, projectile contact consumption, damage, guard, normal HitOverride redirect, or projectile custom-state entry
  -> states 777, 889, 5000, 150, and 151 are forbidden; final P2 remains state 0, life 1000, ctrl true; projectile remains active with hitsRemaining = 1
  -> synthetic-imported-projectile-hitoverride-missonoverride-one.json checksum 2dc86467 remains required in qa:trace
  -> that pnpm qa:trace pass was 343/343 artifacts, 313 required and 30 optional
  -> no score movement; helper-parented Projectile missonoverride = 1 and player-owned/helper-parented Projectile missonoverride = 0 are covered by later checkpoints, while broader missonoverride custom-state breadth, exact slot priority, exact projectile target lifetime/tick order, helper-owned custom-state tables, visual/audio parity, and full Projectile/HitOverride parity remain blocked

Previous R1 required helper-parented Projectile p2stateno HitOverride trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-helper-projectile-hitoverride-p2stateno.json
  -> visual Helper spawns Projectile id 8870 with parentId p1-helper-0, p2stateno = 889, and p2getp1state = 0 while P2 has active matching HitOverride slot 777
  -> contact records owner target link p1 -> p2 / 8870 and helper target link p1-helper-0 -> p2 / 8870
  -> P2 redirects through HitOverride state 777 instead of projectile custom state 889, helper ProjHit branch 1273, or default get-hit/guard states 5000/150/151
  -> synthetic-imported-helper-projectile-hitoverride-p2stateno.json checksum ce4c1d9a is required in qa:trace
  -> that pnpm qa:trace pass was 342/342 artifacts, 312 required and 30 optional
  -> no score movement; player-owned and helper-parented Projectile missonoverride = 1 plus player-owned/helper-parented Projectile missonoverride = 0 are covered by later checkpoints, while broader missonoverride custom-state breadth, exact slot priority, exact helper-projectile target lifetime/tick order, helper-owned custom-state tables, visual/audio parity, and full Projectile/HitOverride parity remain blocked

Previous R1 required IKEMEN player-owned Projectile p2stateno HitOverride trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-projectile-hitoverride-p2stateno.json
  -> Projectile declares p2stateno = 889 / p2getp1state = 0 while P2 has active matching HitOverride slot 777
  -> contact records target id 77 and redirects P2 through HitOverride state 777 instead of direct-HitDef miss logic or projectile custom state 889
  -> synthetic-imported-projectile-hitoverride-p2stateno.json checksum 2ec0725a remains required in qa:trace
  -> that pnpm qa:trace pass was 341/341 artifacts, 311 required and 30 optional
  -> no score movement; projectile missonoverride breadth, exact slot priority, exact guard KO/no-KO round flow, visual/audio parity, and full Projectile/HitOverride parity remain blocked

Previous R1 required IKEMEN direct HitDef p2getp1state zero HitOverride miss trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-hitoverride-p2getp1state-zero-miss.json
  -> direct HitDef declares p2stateno = 889 / p2getp1state = 0 while P2 has active matching HitOverride slot 777 and P2-owned state 889 data exists
  -> contact rejects before target memory, damage, guard, normal HitOverride redirect, or target-owned custom-state entry
  -> synthetic-imported-hitoverride-p2getp1state-zero-miss.json checksum 656730c8 is required in qa:trace
  -> that pnpm qa:trace pass was 340/340 artifacts, 310 required and 30 optional
  -> no score movement; helper-parented Projectile p2stateno is covered by a later checkpoint, while helper/projectile/custom-state slot-priority breadth, helper/projectile missonoverride breadth, exact guard KO/no-KO round flow, visual/audio parity, and full HitOverride/custom-state parity remain blocked

Previous R1 required IKEMEN HitDef missonoverride one HitOverride trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-hitoverride-missonoverride-one.json
  -> direct HitDef declares missonoverride = 1 without p1stateno / p2stateno while P2 has active matching HitOverride slot 777
  -> contact rejects before target memory, damage, guard, normal HitOverride redirect, or custom-state entry
  -> synthetic-imported-hitoverride-missonoverride-one.json checksum 78cfedf4 remains required in qa:trace
  -> that pnpm qa:trace pass was 339/339 artifacts, 309 required and 30 optional
  -> no score movement; helper/projectile p2stateno breadth beyond current covered gates, exact slot priority, helper/projectile missonoverride breadth, exact guard KO/no-KO round flow, visual/audio parity, and full HitOverride/custom-state parity remain blocked

Previous R1 required IKEMEN HitDef missonoverride zero HitOverride trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-hitoverride-missonoverride-zero.json
  -> direct HitDef declares p2stateno = 888 / p2getp1state = 1 / missonoverride = 0 while P2 has active matching HitOverride slot 777
  -> contact records target id 77 and redirects P2 through HitOverride state 777 instead of default custom-state miss
  -> synthetic-imported-hitoverride-missonoverride-zero.json checksum 8ffd5678 remains required in qa:trace
  -> that pnpm qa:trace pass was 338/338 artifacts, 308 required and 30 optional
  -> no score movement; helper/projectile p2stateno breadth beyond current covered gates, exact slot priority, exact guard KO/no-KO round flow, visual/audio parity, and full HitOverride/custom-state parity remain blocked

Previous R1 required direct HitDef HitOverride plus p2stateno miss trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-hitoverride-p2stateno-miss.json
  -> direct HitDef declares p2stateno = 888 / p2getp1state = 1 while P2 has active matching HitOverride slot 777
  -> contact rejects before target memory, damage, guard, normal HitOverride redirect, or custom-state entry
  -> synthetic-imported-hitoverride-p2stateno-miss.json checksum 6f41eeb1 remains required in qa:trace
  -> that pnpm qa:trace pass was 337/337 artifacts, 307 required and 30 optional
  -> no score movement; helper/projectile p2stateno breadth beyond current covered gates, exact slot priority, helper/projectile missonoverride breadth, exact guard KO/no-KO round flow, visual/audio parity, and full HitOverride/custom-state parity remain blocked

Previous R1 required direct HitDef p2stateno ignored on successful guard trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-p2stateno-guard-ignored.json
  -> direct HitDef declares p2stateno = 888 / p2getp1state = 1 while P2 successfully guards
  -> P2 remains in defender-owned Common1 guard flow 150 -> 151 -> 130 -> 20, target id 77 is recorded, state 888 is forbidden
  -> synthetic-imported-p2stateno-guard-ignored.json checksum 76d1becd remains required in qa:trace
  -> that pnpm qa:trace pass was 336/336 artifacts, 306 required and 30 optional
  -> no score movement; exact guard KO/no-KO round flow, helper/projectile p2stateno breadth beyond current covered gates, exact guard timing/proximity/effects, visual/audio parity, and full guard parity remain blocked

Previous R1 required owner-backed custom-state GetHitVar guard.kill trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-custom-state-gethitvar-guard-kill.json
  -> direct HitDef guard.kill = 0 stores guard kill metadata while P2 executes attacker-owned state data after owner-local TargetState
  -> attacker-owned state 888 branches to state/action 904 through GetHitVar(kill) = 0 && GetHitVar(guarded) = 1 && GetHitVar(hitshaketime) > 0
  -> synthetic-imported-custom-state-gethitvar-guard-kill.json checksum c889a534 remains required in qa:trace
  -> that pnpm qa:trace pass was 335/335 artifacts, 305 required and 30 optional
  -> no score movement; exact guard KO/no-KO round flow, exact guard timing/proximity/effects, helper/projectile custom-state guard kill inheritance, visual/audio parity, and full custom-state/guard parity remain blocked

Previous R1 required helper-parented Projectile GetHitVar guard.kill trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-helper-projectile-gethitvar-guard-kill.json
  -> helper-parented Projectile guard.kill = 0 stores guard kill metadata while P2 executes defender-owned guard-hit CNS
  -> defender-owned Common1-style states 150 -> 151 branch to state/action 334 through GetHitVar(kill) = 0 && GetHitVar(guarded)
  -> synthetic-imported-helper-projectile-gethitvar-guard-kill.json checksum 7f9aa699 remains required in qa:trace
  -> that pnpm qa:trace pass was 334/334 artifacts, 304 required and 30 optional
  -> no score movement; exact helper Projectile guard KO/no-KO round flow, exact helper/projectile target lifetime/tick order, exact guard timing/proximity/effects, visual/audio parity, and full guard/projectile parity remain blocked

Previous R1 required player-owned Projectile GetHitVar guard.kill trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-projectile-gethitvar-guard-kill.json
  -> player-owned Projectile guard.kill = 0 stores guard kill metadata while P2 executes defender-owned guard-hit CNS
  -> defender-owned Common1-style states 150 -> 151 branch to state/action 333 through GetHitVar(kill) = 0 && GetHitVar(guarded)
  -> synthetic-imported-projectile-gethitvar-guard-kill.json checksum 3feae5a7 remains required in qa:trace
  -> that pnpm qa:trace pass was 333/333 artifacts, 303 required and 30 optional
  -> no score movement; helper/projectile custom-state guard kill inheritance, exact guard KO/no-KO round flow, exact projectile target lifetime/tick order, exact guard timing/proximity/effects, visual/audio parity, and full guard/projectile parity remain blocked

Previous R1 required defender-owned GetHitVar air guard.kill trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-gethitvar-air-guard-kill.json
  -> direct air guard against HitDef guard.kill = 0 stores guard kill metadata while P2 executes defender-owned air guard-hit CNS
  -> defender-owned Common1-style states 154 -> 155 branch to state/action 332 through GetHitVar(kill) = 0 && GetHitVar(guarded)
  -> synthetic-imported-gethitvar-air-guard-kill.json checksum 4382207e remains required in qa:trace
  -> that pnpm qa:trace pass was 332/332 artifacts, 302 required and 30 optional
  -> no score movement; exact guard KO/no-KO round flow, helper/projectile/custom-state inheritance, exact air guard timing/landing/proximity/effects, visual/audio parity, and full guard parity remain blocked

Previous R1 required defender-owned GetHitVar crouch guard.kill trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-gethitvar-crouch-guard-kill.json
  -> direct crouch guard against HitDef guard.kill = 0 stores guard kill metadata while P2 executes defender-owned crouch guard-hit CNS
  -> defender-owned Common1-style states 152 -> 153 branch to state/action 331 through GetHitVar(kill) = 0 && GetHitVar(guarded)
  -> synthetic-imported-gethitvar-crouch-guard-kill.json checksum 2976fb8c remains required in qa:trace
  -> that pnpm qa:trace pass was 331/331 artifacts, 301 required and 30 optional
  -> no score movement; exact guard KO/no-KO round flow, helper/projectile/custom-state inheritance, exact guard timing/proximity/effects, visual/audio parity, and full guard parity remain blocked

Previous R1 required defender-owned GetHitVar stand guard.kill trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-gethitvar-guard-kill.json
  -> direct stand guard against HitDef guard.kill = 0 stores guard kill metadata while P2 executes defender-owned guard-hit CNS
  -> defender-owned Common1-style states 150 -> 151 branch to state/action 330 through GetHitVar(kill) = 0 && GetHitVar(guarded)
  -> synthetic-imported-gethitvar-guard-kill.json checksum abb4e468 remains required in qa:trace
  -> that pnpm qa:trace pass was 330/330 artifacts, 300 required and 30 optional
  -> no score movement; exact guard KO/no-KO round flow, helper/projectile/custom-state inheritance, exact guard timing/proximity/effects, visual/audio parity, and full guard parity remain blocked

Previous R1 required defender-owned GetHitVar kill trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-gethitvar-kill.json
  -> direct normal HitDef kill = 0 stores kill metadata while P2 executes defender-owned get-hit CNS
  -> defender-owned Common1-style state 5000 branches to state/action 329 through GetHitVar(kill) = 0 && !GetHitVar(guarded)
  -> synthetic-imported-gethitvar-kill.json checksum ef5ffabf is required in qa:trace
  -> that pnpm qa:trace pass was 329/329 artifacts, 299 required and 30 optional
  -> no score movement; KO/round-flow behavior, helper/projectile/custom-state inheritance, exact target lifetime/tick order, visual/audio parity, and full get-hit parity remain blocked

Previous R1 required owner-backed custom-state GetHitVar fall metadata trace gate
  -> RuntimeTraceGatePresets now builds synthetic-imported-custom-state-gethitvar-fall-metadata.json
  -> direct fall HitDef p2stateno = 888 / p2getp1state = 1 stores fall.damage/fall.kill/fall.xvel/fall.yvel while P2 executes P1-owned state data
  -> owner-backed custom state 888 branches to state/action 903 through GetHitVar(fall) && GetHitVar(fall.damage) = 70 && GetHitVar(fall.kill) = 0 && GetHitVar(fall.xvel) = 3 && GetHitVar(fall.yvel) = -6
  -> actor-frame evidence preserves customOwnerId = p1, target-link evidence preserves target id 77, and SelfState returns P2 to state 0/control
  -> synthetic-imported-custom-state-gethitvar-fall-metadata.json checksum 4a3a1c6b is required in qa:trace
  -> that pnpm qa:trace pass was 328/328 artifacts, 298 required and 30 optional
  -> no score movement; exact metadata lifetime/stacking, helper/projectile inheritance, throws, teams/simul, visual/audio parity, and full custom-state fall parity remain blocked

Previous R1 required owner-backed custom-state GetHitVar fall envshake trace gate
  -> RuntimeTraceGatePresets builds synthetic-imported-custom-state-gethitvar-fall-envshake.json
  -> direct fall HitDef p2stateno = 888 / p2getp1state = 1 stores fall.envshake.time/freq/ampl/phase while P2 executes P1-owned state data
  -> owner-backed custom state 888 branches to state/action 902 through GetHitVar(fall) && GetHitVar(fall.envshake.time) = 15 && GetHitVar(fall.envshake.freq) = 178 && GetHitVar(fall.envshake.ampl) = 6 && GetHitVar(fall.envshake.phase) = 0
  -> synthetic-imported-custom-state-gethitvar-fall-envshake.json checksum 5c9d1653 remains required in qa:trace
  -> that pnpm qa:trace pass was 327/327 artifacts, 297 required and 30 optional
  -> no score movement; exact camera waveform, pause/stage/layer interaction, metadata lifetime/stacking, helper/projectile inheritance, throws, teams/simul, visual/audio parity, and full custom-state fall presentation parity remain blocked

Previous R1 required owner-backed custom-state GetHitVar guard timing trace gate
  -> synthetic-imported-custom-state-gethitvar-guard-timing.json checksum ba77beec is required in qa:trace
  -> guarded direct HitDef target memory feeds owner-local TargetState into P1-owned state data
  -> owner-backed custom state 888 branches to state/action 901 through GetHitVar(guarded) = 1 && GetHitVar(slidetime) = 5 && GetHitVar(ctrltime) = 7 && GetHitVar(hitshaketime) > 0
  -> that pnpm qa:trace pass was 326/326 artifacts, 296 required and 30 optional
  -> no score movement; direct-HitDef successful-guard p2stateno is covered by synthetic-imported-p2stateno-guard-ignored.json, while HitOverride/helper/projectile p2stateno breadth beyond current covered gates, exact guard timing, throws, helper/root/parent redirects, teams/simul, visual/audio parity, and full custom-state/get-hit parity remain blocked

Previous R1 required owner-backed custom-state GetHitVar hitcount/id trace gate
  -> synthetic-imported-custom-state-gethitvar-hitcount-hitid-chainid.json checksum 250f77c2 is required in qa:trace
  -> direct HitDef id = 77, chainID = 43, numhits = 3 routes P2 through p2stateno = 888 / p2getp1state = 1 into P1-owned state data
  -> owner-backed custom state 888 branches to state/action 900 through GetHitVar(hitcount) = 3 && GetHitVar(hitid) = 77 && GetHitVar(chainid) = 43 && GetHitVar(hittime) > 0 && !GetHitVar(guarded)
  -> that pnpm qa:trace pass was 325/325 artifacts, 295 required and 30 optional
  -> no score movement; exact combo accumulation, chain-hit eligibility arbitration, helper/projectile inheritance, exact target lifetime, teams/simul, visual/audio parity, and full custom-state/get-hit parity remain blocked

Previous R1 required GetHitVar fallcount trace gate
  -> RuntimeHitVarSystem reads hitFall.fallCount through GetHitVar(fallcount), defaulting to 0
  -> HitFallDamage in owner-backed state 5100 records one bounded Common1-style ground-impact count and consumes stored fall.damage
  -> synthetic-imported-gethitvar-fallcount.json checksum c391d938 is required in qa:trace
  -> owner-backed get-hit state 5100 branches to state/action 328 through GetHitVar(fallcount) = 1 && GetHitVar(fall.damage) = 0
  -> that pnpm qa:trace pass was 324/324 artifacts, 294 required and 30 optional
  -> no score movement; exact multi-ground-hit accumulation, lifetime/reset parity, non-Common1 impact detection, helper/projectile/custom-state inheritance, and full fall/get-hit parity remain blocked

R2 RuntimeMatch EnvShake bridge ownership cut
  -> RuntimeMatchEnvShakeBridgeWorld owns bounded match-level EnvShake and FallEnvShake controller emission outside PlayableMatchRuntime
  -> active controller routes forward controller source, typed operation data, runtime tick, telemetry hooks, and RuntimeEnvShakeWorld through one named boundary
  -> focused RuntimeMatchEnvShakeBridgeSystem coverage proves typed EnvShake forwarding, FallEnvShake hit-fall metadata emission/clearing, telemetry forwarding, and no-pending-fall no-event behavior
  -> no score movement or new trace checksum; exact camera waveform, pause/stage/layer timing, helper/redirect ownership breadth, renderer parity, and full presentation parity remain blocked

Previous R1 owner-backed custom-state GetHitVar snap offset trace gate
  -> synthetic-imported-custom-state-gethitvar-snap.json checksum ce4680b9 is required in qa:trace
  -> direct HitDef snap = 16,-24 plus p2stateno = 888 stores bounded xoff/yoff/zoff metadata while P2 executes P1-owned state data
  -> owner-backed custom state 888 branches to state/action 899 through GetHitVar(xoff/yoff/zoff), then SelfState returns P2 to state 0/control
  -> that pnpm qa:trace pass was 323/323 artifacts, 293 required and 30 optional
  -> no score movement; exact throw positioning, z-axis support, guard snap behavior, helper/projectile inheritance, broader custom-state inheritance breadth, teams/simul, visual/audio parity, and full throw/custom-state parity remain blocked
```

Latest project-control checkpoint:

```txt
G1 setup-project refresh
  -> AGENTS.md and docs/agents/* confirm local markdown issues, canonical labels, single-context docs
  -> roadmap navigation/progress/checklist docs include G1 health checks and decision routing
  -> lane checkpoint taxonomy separates latest overall, runtime, Studio/UI, asset, scanner, modular, and G1 control truth
  -> .scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md remains the setup/project-control ledger
  -> docs-only control work; no runtime, Studio, IKEMEN, modular, or score claim
```

Latest I1 scanner checkpoint:

```txt
I1 IKEMEN stage/BGDef presentation scan
  -> `IkemenFeatureScanner` recognizes source-mapped `scenenumber`, `modeloffset`, `modelrotate`, `modelscale`, and `type = video` background layers
  -> focused scanner test proves recognized/unsupported feature counts beside existing Windows-style package/stage coverage
  -> scanner/reporting only; no model-stage rendering, video decoding, screenpack parity, or IKEMEN runtime claim
```

Latest Studio/UI checkpoint:

```txt
S1 Studio CSS module split and shadow prune
  -> src/styles/studio.css is the single Studio CSS entrypoint, delegating to base/legacy/editor/runtime/desktop/shell/command/workflows category modules
  -> pnpm fix:css now removes exact duplicate rules plus fully shadowed same-selector and cross-file rules
  -> active command shell ownership lives in src/styles/command/studio-command-shell.css, studio-command-pipeline.css, studio-command-playfield.css, and studio-command-console.css
  -> pnpm qa:css reports 535,843 bytes, 2,353 rules, 0 duplicate selector keys / 0 instances, 0 exact duplicate rules, 117 repeated declaration groups, 107 cross-file overlaps, 0 selectors shared with src/style.css, 0 fully shadowed legacy style.css rules, and 0 fully shadowed cross-file rules
  -> pnpm qa:css:budget now freezes current debt ceilings for CSS cleanup/review rounds: 536,051 bytes, 2,364 rules, 119 repeated declaration groups, 108 cross-file overlaps, and zero exact/shadowed/src-style overlap regressions
  -> latest narrow cleanup splits base tokens/elements/accessibility out of src/style.css, removes unused root custom properties, centralizes reduced-motion handling in base accessibility, keeps src/styles/studio.css from reimporting base, groups Build/Evidence right-rail headers into shared Studio primitive selectors, removes local duplicate Assets action icon/primary rules, groups legacy Studio truncation/text-wrap/grid/align/text rows, groups desktop workbench/list/engine-contract/drawer/build-runway/shell/chrome/stage/status truncation and left-pane kicker/eyebrow styling, routes desktop foundation badge/status/stage-status plus Runtime/Inspect command-room backgrounds through existing tokens, merges duplicate Workbench/Debug empty-state chrome and runtime command-deck line-height declarations, absorbs redundant shell/header/status/summary overrides into base/surface owners, removes redundant responsive shell rules, prunes one redundant base Studio workspace-header override, and removes unused structural Build/Evidence list, old asset focus/flow, trace scrubber, stat-card, and build-export-console hooks; the broader repeated declaration groups stay queued for shared primitive extraction
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
  -> active ownership now lives in split studio-command-shell/pipeline/playfield/console modules
  -> mission rows and compact Studio tabs expose textual status instead of color-only dots
  -> dead tab-dot CSS was pruned after the compact navigator switched to tab-state badges
  -> pnpm qa:css reports 2,622 rules, 115 duplicate selector keys / 264 instances, 0 exact duplicate rules, 40 cross-file overlaps, 16 selectors shared with src/style.css, 3 command-center selectors still shared with legacy src/style.css, and 0 legacy style.css rules fully shadowed by later imports
  -> no new Studio workflow or score claim
S1 Studio CSS cascade prune
  -> obsolete legacy Evidence/Release Desk blocks removed from src/style.css
  -> Command Palette, Stage, and Inspector desktop density now live in src/styles/command/studio-command-palette.css, src/styles/workflows/studio-stage.css, and src/styles/workflows/studio-inspector.css
  -> fully overridden module-covered rules plus old global Module ledger repair block pruned from legacy style.css
  -> src/styles/workflows/studio-system-ledgers.css owns two-line Module rows and 40px system actions
  -> pnpm qa:css reads CSS in src/main.ts import order and reports 2,622 rules, 115 duplicate selector keys / 264 instances, 0 exact duplicate rules, 40 cross-file overlaps, 16 selectors shared with src/style.css, and 0 legacy style.css rules fully shadowed by later imports
  -> pnpm qa:smoke plus screenshot inspection covered Workbench, Modules, Modules contracts, and Runtime with no horizontal overflow or broken module rows
  -> no new Studio workflow or score claim
S1 Studio command inspector readability and smoke stability
  -> dense Studio command surfaces, Build/Evidence route copy, stage toolbar, and replacement rows were tightened
  -> pnpm qa:smoke plus screenshot inspection proved the visible surfaces after that pass
  -> product/UI evidence only; it does not replace the latest runtime checkpoint or change the next runtime slice
```

Previous runtime compatibility checkpoint:

```txt
R1 required custom-state GetHitVar yaccel trace gate
  -> synthetic-imported-custom-state-gethitvar-yaccel.json checksum 549fe48d is required in qa:trace
  -> direct HitDef p2stateno = 888 stores yaccel = 0.62 before P2 enters P1-owned state data
  -> GetHitVar(yaccel) branches 888 -> 898 before SelfState returns P2 to state 0/control
  -> pnpm qa:trace passed 319/319 artifacts, 289 required and 30 optional
  -> bounded direct-hit yaccel metadata inheritance only; no exact physics integration, no fall acceleration arbitration, no guard metadata inheritance, no throws, no helper/root/parent redirects, no teams/simul, no exact bind tick-order, no score movement, no full custom-state parity claim
Previous R1 required custom-state GetHitVar type trace gate
  -> synthetic-imported-custom-state-gethitvar-type.json checksum 38542874 remains required in qa:trace
  -> direct HitDef p2stateno = 888 stores ground.type = Low and air.type = Trip before P2 enters P1-owned state data
  -> GetHitVar(type/groundtype/airtype) branches 888 -> 897 before SelfState returns P2 to state 0/control
  -> bounded direct-hit type metadata inheritance only; no exact get-hit animation selection, no air-hit arbitration, no guard metadata inheritance, no throws, no helper/root/parent redirects, no teams/simul, no exact bind tick-order, no score movement, no full custom-state parity claim
Previous R1 required custom-state GetHitVar isbound trace gate
  -> synthetic-imported-custom-state-gethitvar-isbound.json checksum d25307e9 remains required in qa:trace
  -> direct HitDef target memory feeds TargetBind before typed owner-local TargetState, then P2 enters P1-owned state data
  -> GetHitVar(isbound) branches 888 -> 896 before SelfState returns P2 to state 0/control
  -> bounded TargetBind subject metadata inheritance only; no throws, no exact bind tick-order/lifetime, no visual bind parity, no helper/root/parent redirects, no teams/simul, no HitOverride/helper/projectile p2stateno breadth beyond current covered gates, no score movement, no full custom-state parity claim
Previous R1 required custom-state GetHitVar guarded trace gate
  -> synthetic-imported-custom-state-gethitvar-guarded.json checksum 54f62821 remains required in qa:trace
  -> guarded direct HitDef target memory feeds typed owner-local TargetState, then P2 enters P1-owned state data
  -> GetHitVar(guarded/hitshaketime/hittime) branches 888 -> 895 before SelfState returns P2 to state 0/control
Previous R1 required custom-state GetHitVar velocity trace gate
  -> synthetic-imported-custom-state-gethitvar-velocity.json checksum e9d8da9e remains required in qa:trace
  -> direct HitDef p2stateno = 888 with p2getp1state = 1 and ground.velocity = 4,-2 routes P2 into P1-owned state data
  -> GetHitVar(xvel/yvel) branches 888 -> 894 before SelfState returns P2 to state 0/control
  -> bounded direct-hit velocity metadata inheritance only; no exact velocity lifetime after later physics/controllers, no throws, no helper/root/parent redirects, no teams/simul, no exact bind/tick order, no score movement, no full custom-state parity claim
Previous R1 required custom-state GetHitVar down-recover trace gate
  -> synthetic-imported-custom-state-gethitvar-down-recover.json checksum 5bd94568 remains required in qa:trace
  -> direct fall HitDef p2stateno = 888 with p2getp1state = 1 routes P2 into P1-owned state data
  -> GetHitVar(down.recover/down.recovertime/recovertime) branches 888 -> 893 before SelfState returns P2 to state 0/control
  -> bounded direct-hit down-recovery metadata inheritance only; no exact lie-down tables, no guard metadata inheritance, no throws, no helper/root/parent redirects, no teams/simul, no exact bind/tick order, no exact recovery threshold behavior, no score movement, no full custom-state parity claim
Previous R1 required custom-state GetHitVar animtype trace gate
  -> synthetic-imported-custom-state-gethitvar-animtype.json checksum bbe8777c is required in qa:trace
  -> direct HitDef p2stateno = 888 with p2getp1state = 1 routes P2 into P1-owned state data
  -> GetHitVar(animtype/groundtype/airtype/isbound) branches 888 -> 892 before SelfState returns P2 to state 0/control
  -> pnpm qa:trace passed 313/313 artifacts, 283 required and 30 optional
  -> bounded direct-hit type metadata inheritance only; no exact get-hit animation selection, no guard metadata inheritance, no throws, no helper/root/parent redirects, no teams/simul, no exact bind/tick order, no score movement, no full custom-state parity claim
Previous R1 required AssertSpecial round-flow telemetry trace gate
  -> synthetic-imported-assertspecial-round-flow-telemetry.json checksum 10f95bdb is required in qa:trace
  -> official AssertSpecial Intro and NoKOSlow lower into typed assertspecial operation evidence
  -> final imported actor assertSpecialGlobalFlags require intro and nokoslow, with runtime intro/noKoSlow telemetry
  -> pnpm qa:trace passes 310/310 artifacts, 280 required and 30 optional
  -> bounded official flag telemetry only; no exact intro state ownership, no KO slow-motion suppression, no winpose/round transitions, no helper/team/global ownership, no pause/layer behavior, no score movement, no full round-flow parity claim
Previous R1 required helper controller-param Parent/Root trace gate
  -> synthetic-imported-helper-controller-param-parentroot.json checksum 9ad71f4e is required in qa:trace
  -> first-generation visual Helper executes dynamic VelSet x = Parent,Life - 995 and y = Root,StateNo - 203
  -> actor-frame evidence proves helper velocity 5,-3 before routing to state 1401 / anim 941
  -> pnpm qa:trace passes 309/309 artifacts, 279 required and 30 optional
  -> bounded helper-local VelSet controller-param Parent/Root evidence only; no nested helper ancestry where root differs from parent, no helper-spawned helpers, no player Parent controller-param redirect support, no dynamic-parameter typed lowering, no recursive redirection, no debug warning text, no teams/simul, no score movement, no full helper/controller expression parity claim
Previous R1 required AssertSpecial shadow presentation trace gate
  -> synthetic-imported-assertspecial-helper-explod-shadow.json trace checksum 83f61b48 is required in qa:trace
  -> synthetic-imported-assertspecial-shadow-telemetry.json trace checksum 2b9c8fac is required in qa:trace
  -> bounded synthetic imported AssertSpecial controllers normalize noshadow into final-actor assertSpecialFlags and globalnoshadow into final-actor assertSpecialGlobalFlags
  -> required evidence includes AssertSpecial controller, typed assertspecial operation, final actor local/global shadow flag telemetry, P1/P2 actor-frame shadowVisible=false evidence, and helper/explod shadowVisible=false evidence for a helper-parented Explod route
  -> at that checkpoint pnpm qa:trace passed 308/308 artifacts, 278 required and 30 optional
  -> closeout passed pnpm test, pnpm typecheck, pnpm build, pnpm qa:smoke, pnpm check:boundaries, and git diff --check
  -> RuntimeSnapshotWorld projects player/helper/explod suppression and CharacterRenderer draws/removes bounded ellipse shadows
  -> still no exact shadow skew/stage parameters, no projectile shadow semantics, no exact global/team/helper ownership beyond this spawned helper/explod route, no pause/layer parity, no score movement, no full shadow/global renderer parity claim
Previous R1 required AssertSpecial global telemetry trace gate
  -> synthetic-imported-assertspecial-global-telemetry.json checksum fc793d29 remains required in qa:trace
  -> bounded synthetic imported AssertSpecial controllers normalize nobardisplay, nobg, nofg, nokosnd, and nomusic into final-actor assertSpecialGlobalFlags evidence
  -> telemetry/gate evidence only; no lifebar hiding, no stage BG/FG rendering suppression, no KO sound suppression, no music pause, no exact global/team/helper ownership, no pause/layer parity, no score movement, no full global flag parity claim
Previous R1 required default lie-down fast recovery trace gate
  -> synthetic-imported-default-liedown-fast-recovery.json checksum 74bdac97 is required in qa:trace
  -> bounded synthetic Common1-style state 5110 can fast-recover through runtime shortcut while down.recovertime is still positive
  -> fixture omits authored 5110 Get Up ChangeState controller, keeps fresh recovery input active, and still routes 5110 -> 5120 -> 0
  -> bounded synthetic recovery evidence only; no exact mashing thresholds, no public KFM proof, no global/team/helper ownership, no pause-layer parity, no score movement, no full recovery parity claim
Previous R1 required controller-param Root redirect trace gate
  -> synthetic-imported-controller-param-root-redirect.json checksum 1d4a73f7 is required in qa:trace
  -> static seed VelSet sets P1 velocity to 4,-2
  -> dynamic VelSet evaluates Root, Life - 995 / Root, StateNo - 203 and sets P1 velocity to 5,-3 through current player root context
  -> named controller order, static typed kinematic:velset evidence, and actor-frame telemetry guard the route
  -> bounded current player VelSet controller-param Root redirect evidence only; no player Parent controller-param redirect support, no nested helper ancestry where root differs from parent, helper-spawned helpers, no dynamic-parameter typed lowering, no recursive redirect evaluation, no debug warning text, no broad bottom/redirect parity, no score movement, no full controller/expression parity claim
Previous R1 required controller-param Target redirect trace gate
  -> synthetic-imported-controller-param-target-redirect.json checksum 55bb7b1f is required in qa:trace
  -> static seed VelSet sets P1 velocity to 4,-2
  -> direct HitDef records target id 77, then dynamic VelSet params evaluate Target(77), Life - 960 / Target(77), Life - 966 and set P1 velocity to 3,-3
  -> named controller order, target-link evidence, HitDef evidence, static typed kinematic:velset evidence, and actor-frame telemetry guard the route
  -> pnpm qa:trace passes 302/302 artifacts, 272 required and 30 optional
  -> bounded current VelSet controller-param Target redirect evidence only; no player Parent controller-param redirect support, no nested helper ancestry where root differs from parent, helper-spawned helpers, no dynamic-parameter typed lowering, no recursive redirect evaluation, no debug warning text, no broad bottom/redirect parity, no score movement, no full controller/expression parity claim
Previous R1 required controller-param bottom trace gate
  -> synthetic-imported-controller-param-bottom.json checksum 28ef21ad is required in qa:trace
  -> static seed VelSet sets P1 velocity to 4,-2
  -> dynamic VelSet evaluates Parent,Vel X / Parent,Vel Y with no parent, treats the bottom parameter result as 0, and resets velocity to 0,0
  -> named controller order plus static typed kinematic:velset evidence guards the route; actor-frame telemetry owns the dynamic fallback proof
  -> pnpm qa:trace passes 301/301 artifacts, 271 required and 30 optional
  -> bounded controller-param bottom fallback only; no player Parent controller-param redirect support, no nested helper ancestry where root differs from parent, helper-spawned helpers, no dynamic-parameter typed lowering, no recursive redirect evaluation, no debug warning text, no broad bottom parity, no score movement, no full controller/expression parity claim
R1 required Target IfElse bottom trace gate
  -> synthetic-imported-target-ifelse-bottom.json checksum be7554d4 is required in qa:trace
  -> IfElse(0, MoveHit >= 1, (Target(999), Life = 0)) selects missing Target(999), forbids state 400, and fails closed
  -> IfElse(1, MoveHit >= 1, (Target(999), Life = 0)) selects MoveHit, isolates the unused missing Target(999) branch from the return value, and routes to state/action 401 after direct HitDef contact
  -> focused CNS coverage proves IfElse still eagerly evaluates unused branches and reports warning-style unsupported diagnostics, unlike Cond
  -> previous promotion passed 300/300 artifacts, 270 required and 30 optional
  -> bounded IfElse/bottom result-isolation evidence only; no Cond-style lazy evaluation, no recursive redirection, no debug warning text, no broad bottom parity, no score movement, no full redirect parity claim
R1 required Target Cond bottom trace gate
  -> synthetic-imported-target-cond-bottom.json checksum e882a2bb is required in qa:trace
  -> Cond(1, (Target(999), Life = 0), MoveHit >= 1) selects missing Target(999), forbids state 398, and fails closed
  -> Cond(0, (Target(999), Life = 0), MoveHit >= 1) skips missing Target(999), selects MoveHit, and routes to state/action 399 after direct HitDef contact
  -> focused CNS coverage proves skipped Cond branches do not call the unsupported-redirect reporter while selected missing redirects still fail closed
  -> previous qa:trace passed 299/299 artifacts, 269 required and 30 optional at promotion time
  -> bounded Cond/bottom evidence only; no recursive redirection, no debug warning text, no broad bottom parity, no score movement, no full redirect parity claim
R1 required Target invalid redirect bottom trace gate
  -> synthetic-imported-target-redirect-bottom.json checksum 5e50a90a is required in qa:trace
  -> missing Target(999) destination propagates bottom through parenthesized composite expression `(Target(999), Life = 0) || 1`
  -> forbidden state 396 does not execute; fallback state/action 397 executes after direct HitDef target memory is established
  -> focused Parent/Root unit coverage proves the same failed-redirect marker propagates through composite expressions while unused IfElse branches stay isolated
  -> bounded parser-expression bottom evidence only; no recursive redirection, no debug warning text, no broad bottom parity, no score movement, no full redirect parity claim
R1 required Helper Parent/Root redirect trace gate
  -> synthetic-imported-helper-parentroot.json checksum 5154220c is required in qa:trace
  -> bounded helper-local Parent/Root redirects read cloned owner/root runtime state through Parent,StateNo, Parent,Vel X, Root,Anim, and route 1200 -> 1400 / anim 940
  -> read-only first-generation visual-helper evidence only; no score movement, no nested helper ancestry where root differs from parent, no team/helper-owned redirects, no redirect mutation, no keyctrl, no full helper redirect parity claim
Earlier R1 required default lie-down fast recovery trace gate
  -> synthetic-imported-default-liedown-fast-recovery.json checksum 74bdac97 is required in qa:trace
  -> bounded synthetic Common1-style 5110 fast recovery executes through the runtime shortcut while down.recovertime is still positive
  -> fixture omits authored 5110 Get Up ChangeState controller, keeps fresh recovery input active, and still routes 5110 -> 5120 -> 0
  -> bounded synthetic recovery evidence only; no score movement, no exact mashing thresholds, no public KFM proof, no global/team/helper ownership, no pause-layer parity, no full recovery parity claim
Previous R1 required AssertSpecial NoFastRecoverFromLieDown trace gate
  -> synthetic-imported-assertspecial-nofastrecoverfromliedown.json checksum 74bf5d85 is required in qa:trace
  -> bounded synthetic IKEMEN AssertSpecial NoFastRecoverFromLieDown executes as typed assertspecial evidence in Common1-style state 5110
  -> fresh recovery input stays active during lie-down, the fast lie-down shortcut stays suppressed while down.recovertime counts from positive to 0, then 5110 -> 5120 -> 0 executes
  -> bounded synthetic recovery evidence only; no score movement, no exact mashing thresholds, no public KFM proof, no global/team/helper ownership, no pause-layer parity, no full recovery parity claim
R1 required AssertSpecial NoGetUpFromLieDown trace gate
  -> synthetic-imported-assertspecial-nogetupfromliedown.json checksum 4c3b6281 is required in qa:trace
  -> bounded synthetic IKEMEN AssertSpecial NoGetUpFromLieDown executes as typed assertspecial evidence in Common1-style state 5110
  -> state 5110 counts down.recovertime to 0, the hardcoded 5110 -> 5120 get-up transition stays forbidden, and final P2 remains in 5110
  -> pnpm qa:trace passes 296/296 artifacts, 266 required and 30 optional
  -> bounded synthetic get-up suppression evidence only; no score movement, no public KFM proof, no global/team/helper ownership, no pause-layer parity, no full recovery parity claim
R1 official air-recovery coverage contract hardening
  -> scripts/qa_traces.cjs now requires synthetic-imported-default-fall-official-air-recovery in coverage summaries
  -> artifact checksum b0363be9 was already generated as required
  -> evidence-pipeline hardening only; no behavior, checksum, score, public KFM, exact threshold, velocity, or full recovery-parity claim changed
R2 RuntimeControllerExpressionContextSystem ownership
  -> RuntimeControllerExpressionContextSystem owns shared raw numeric controller expression contexts for passive/runtime controller worlds
  -> dynamic fallback params reuse one redirect-aware helper for Target(...), Parent, Root, Const, HitPauseTime, StageTime, and GetHitVar reads
  -> focused RuntimeControllerExpressionContextSystem coverage proves redirect-aware numeric evaluation plus helper/team metadata forwarding
  -> ownership cleanup only; no score movement, no new expression language support, no ID/player unique-id semantics, no recursive redirection, no helper/team scope expansion, no full controller VM claim
R2 RuntimeFighterAdvanceHookSetWorld ownership
  -> RuntimeFighterAdvanceHookSetWorld owns bounded per-fighter advance hook-set construction outside PlayableMatchRuntime
  -> sprite effects, hit eligibility, HitOverride ticking, contact timers, state clock, frame constraints, recovery windows, stun, move lifecycle, kinematics, animation, active controllers, recovery landing, lie-down recovery, and frozen-position preservation are forwarded through one named seam before RuntimeFighterAdvanceWorld executes
  -> focused RuntimeFighterAdvanceHookSetSystem, RuntimeFighterAdvanceSystem, and RuntimeMatchFighterAdvanceSystem coverage proves the handoff
  -> ownership cleanup only; no score movement, no new player-advance semantics, no exact MUGEN/IKEMEN tick order, no persistent-controller timing, no helper/team/redirect actor advance, no recovery/stun/physics arbitration, no full player VM claim
R2 RuntimeActiveExpressionContextWorld ownership
  -> active CNS dynamic controller-param fallback and trigger evaluation share one named expression-context factory outside PlayableMatchRuntime
  -> stage bounds/time, owner const routing, runtime RNG, animation timing callbacks, and InGuardDist are forwarded through RuntimeActiveExpressionContextWorld
  -> focused RuntimeActiveExpressionContextSystem, RuntimeDispatchEvaluationSystem, and RuntimeTriggerEvaluationSystem coverage proves the handoff
  -> ownership cleanup only; no score movement, no new expression semantics, no exact CNS VM timing, no helper/team/redirect expansion, no exact InGuardDist/RNG stream parity, no full expression/trigger VM claim
R1 required synthetic air guard landing walk-control trace gate
  -> synthetic-imported-air-guard-landing.json checksum d6986d7f is required in qa:trace
  -> bounded synthetic Common1-style air guard-hit route executes 154 -> 155 -> 52 -> 20 after A-guardable contact while airborne and holding back
  -> active-command evidence requires holdback and x
  -> required order preserves 154/155 controller/typed-operation landing order, state-52 y = 0 evidence, and final imported walk state/action 20 with control
  -> pnpm qa:trace passes 295/295 artifacts, 265 required and 30 optional
  -> portable synthetic evidence only; no score movement, no exact MUGEN/IKEMEN air physics/landing/state-52/proximity/effects/visual/full parity claim
R1 optional official KFM air guard landing walk-control trace tightening
  -> kfm-official-default-air-guard-state.json checksum f4378971 passes when .scratch/fixtures/kfm-official.zip exists
  -> real KFM/Common1 air guard-hit route executes 154 -> 155 -> 52 -> 20 after A-guardable contact while airborne and holding back
  -> active-command evidence requires holdback and x
  -> required order preserves 154/155/52 controller/typed-operation landing order and actor-frame sequence
  -> final KFM held-back walk state/action 20 with control is required
  -> pnpm qa:trace passes 295/295 artifacts, 265 required and 30 optional
  -> stricter private-fixture evidence only; no artifact-count/checksum change, no score movement, no public KFM support, no exact air physics/landing/state-52/sparks/sounds/full parity claim
Previous R1 optional official KFM crouch guard-hold crouch-control trace gate
  -> kfm-official-default-crouch-guard-hold-crouch-return.json checksum d11153d0 passes when .scratch/fixtures/kfm-official.zip exists
  -> real KFM/Common1 crouch guard-hit route executes 152 -> 153 -> 131 -> 11 after direct guarded contact while holding down-back
  -> active-command evidence requires holdback, holddown, and x
  -> required order preserves 152 ChangeAnim -> 152 ChangeState -> 153 HitVelSet -> kinematic:hitvelset -> 153 VelSet -> kinematic:velset -> 153 CtrlSet -> resource:ctrlset -> 153 ChangeState
  -> actor-frame sequence proves 152 -> 153 -> 131 -> 11 and final KFM crouch state/action 11 with control
  -> pnpm qa:trace passes 295/295 artifacts, 265 required and 30 optional
  -> private-fixture confidence only; no public KFM support, required portable KFM-specific fixture coverage without private fixture, exact guard-hold duration, guard timing/proximity/effects, visual/audio parity, score movement, or full guard parity claim
R1 synthetic crouch guard-hold crouch-control trace gate
  -> synthetic-imported-crouch-guard-hold-crouch-return.json checksum 83ecb699 is required in qa:trace
  -> defender-owned crouch guard-hit route executes 152 -> 153 -> 130 -> 10 after direct guarded contact while holding down-back
  -> active-command evidence requires holdback, holddown, and x
  -> required order preserves 152 ChangeAnim -> 152 ChangeState -> 153 HitVelSet -> kinematic:hitvelset -> 153 VelSet -> kinematic:velset -> 153 CtrlSet -> resource:ctrlset -> 153 ChangeState
  -> actor-frame sequence proves 152 -> 153 -> 130 -> 10 and final imported crouch state/action 10 with control
  -> previous aggregate was 294/294 artifacts, 265 required and 29 optional before the optional KFM mirror
  -> bounded synthetic crouch guard-hold crouch-control only; no public KFM support, exact guard-hold duration, guard timing/proximity/effects, visual/audio parity, score movement, or full guard parity claim
Previous R1 stand guard-hold walk-control trace gate
  -> synthetic-imported-default-guard-hold-walk-return.json checksum 75d4db9c remains required in qa:trace
  -> defender-owned stand guard-hit route executes 150 -> 151 -> 130 -> 20 after direct guarded contact while holding back
```

Previous runtime compatibility checkpoints:

```txt
R1 optional official KFM stand guard-hold walk-control trace gate
  -> kfm-official-default-guard-hold-walk-return.json checksum 885bb1da passes when .scratch/fixtures/kfm-official.zip exists
  -> synthetic-imported-default-guard-hold-walk-return.json checksum 75d4db9c is required in qa:trace for portable stand guard-hold walk-control
  -> real KFM/Common1 stand guard-hit route 150 -> 151 returns through observable guard-hold state 130 and then resumes held-back walking state/action 20 with control
  -> preserves the stricter stand slide-stop controller/typed-operation order from kfm-official-default-guard-slide-stop.json
  -> private-fixture confidence only; no public KFM support, exact guard-hold duration, guard timing/proximity/effects, crouch/air guard-hold parity, visual/audio parity, or score movement
R1 optional official KFM ground-recovery priority trace gate
  -> kfm-official-default-fall-ground-recovery-priority.json checksum 6d361534 passes when .scratch/fixtures/kfm-official.zip exists
  -> real KFM mirrors the required near-ground recovery route 5000 -> 5030 -> 5050 -> 5200 -> 5201 -> 52 -> 0
  -> generic air-recovery state 5210 and lie-down chain states stay forbidden
  -> private-fixture confidence only; no public KFM support, exact thresholds, velocity math, tick-order parity, or score movement
R1 Common1 ground-recovery priority trace gate
  -> synthetic-imported-default-fall-ground-recovery-priority.json checksum e83b2db7 is required in qa:trace
  -> defender routes 5000 -> 5030 -> 5050 -> 5200 -> 5201 -> 52 -> 0 through active command = "recovery" near ground
  -> required order includes 5050 recovery countdown, Ground Recovery Input ChangeState, 5200 SelfState, 5201 recovery velocity/position/safety, and 52 landing control restore
  -> generic air-recovery state 5210 and lie-down chain states remain forbidden
  -> pnpm qa:trace passes 295/295 artifacts, 265 required and 30 optional after optional KFM air guard walk-control tightening
  -> bounded ground-over-air recovery selection evidence only; no score movement or full recovery parity claim
Previous R1 Common1 HitFall recovery-input priority trace gate
  -> synthetic-imported-hitfall-recovery-input-priority.json checksum bae07bde remains required in qa:trace
  -> defender routes 5000 -> 5030 -> 5050 -> 5210 -> 0 through active command = "recovery" while a competing HitFall && CanRecover probe exists
Previous R1 Common1 HitFall CanRecover-ready trace gate
  -> synthetic-imported-hitfall-canrecover-ready.json checksum c0097d7f remains required in qa:trace
  -> defender routes 5000 -> 5030 -> 5050 -> 5250 -> 0 through HitFall && CanRecover after fall.recovertime drops positive-to-zero without active recovery command
R2 RuntimeActiveControllerHookSetWorld ownership
  -> RuntimeActiveControllerHookSetWorld owns bounded active-controller hook-set construction outside PlayableMatchRuntime
  -> state mutation hooks, side-effect controller hooks, and fallback runtime-controller hooks group behind one named boundary before RuntimeActiveControllerRunWorld executes
  -> focused RuntimeActiveControllerHookSetSystem coverage proves every current hook route is preserved plus optional unsupported-hook omission
  -> ownership cleanup only; no score movement, no new controller semantics, exact hook ordering parity, helper/team/redirect scopes, unsupported-controller breadth, visual/audio parity, or full CNS VM parity claim
R2 RuntimeMatchPausedBridgeWorld ownership
  -> RuntimeMatchPausedBridgeWorld owns bounded match-level bridge construction into RuntimePausedMatchWorld.advanceRuntime outside PlayableMatchRuntime
  -> pause snapshot lookup, source-movetime eligibility, pause tick mutation, hitpause-style command buffering, stage/time metadata, actor-constraint/effect-lifecycle forwarding, and paused player/AI/fighter callbacks pass through one named boundary
  -> focused RuntimeMatchPausedBridgeSystem coverage proves bridge payload and callback hooks
  -> ownership cleanup only; no score movement, no new Pause/SuperPause semantics, exact pause layering, helper/team/redirect pause ownership, pause/hitpause command parity, visual/audio parity, or full paused-match VM parity claim
R2 RuntimeMatchPreFacingAssertSpecialWorld ownership
  -> RuntimeMatchPreFacingAssertSpecialWorld owns bounded pre-facing imported AssertSpecial trigger/dispatch context bridge outside PlayableMatchRuntime
  -> trigger gating receives stage bounds and controller execution context forwards owner constants, actor hitpause, actor random, stage bounds, and stage time before auto-facing
  -> focused RuntimeMatchPreFacingAssertSpecialSystem coverage proves bridge payload and dispatch context
  -> ownership cleanup only; no score movement, no new AssertSpecial flags, no exact lifetime/global/team/helper ownership, no full match-frame VM parity claim
R1 optional official KFM basic movement trace gate
  -> kfm-official-basic-movement.json checksum ef30066c is optional in qa:trace when .scratch/fixtures/kfm-official.zip exists
  -> scripted p1 direction input drives real KFM through bounded walk 20, crouch prep 11, jump 41, and final idle/control 0
  -> required evidence includes ordered imported actor-frame telemetry 20 -> 11 -> 41 plus final state/action 0 with control
  -> pnpm qa:trace passes 286/286 artifacts, 260 required and 26 optional with the private fixture present
  -> private fixture confidence only; no public KFM support, no exact Common1 movement/CMD priority/raw-buffer/landing/collision/AI/full movement parity claim
R1 imported basic movement trace gate
  -> synthetic-imported-basic-movement.json checksum 917ff3e5 is required in qa:trace
  -> scripted p1 direction input drives the imported actor through bounded walk 20, crouch 10, jump 40, and final idle/control 0
  -> required evidence includes imported actor-frame state/physics/velocity/airborne telemetry and state order 20 -> 10 -> 40
  -> pnpm qa:trace passes 286/286 artifacts, 260 required and 26 optional
  -> bounded sandbox input-control route only; no exact Common1 movement/CMD priority/landing/collision/AI/full movement parity claim
R1 AssertSpecial TimerFreeze trace gate
  -> synthetic-imported-assertspecial-timerfreeze.json checksum 408528f1 is required in qa:trace
  -> passive imported TimerFreeze asserts before active round tick and keeps a 61-frame fight timer at displayed timer 2 for 70 active frames
  -> RuntimeMatchRoundWorld skips timer ticks when current P1/P2 roster has timerFreeze/global timerfreeze evidence
  -> required evidence includes AssertSpecial controller, typed assertspecial operation, state = fight, message = Fight, and no timeover frame
  -> pnpm qa:trace passes 283/283 artifacts, 258 required and 25 optional
  -> bounded active-match timer freeze only; no score movement, exact global/team/helper ownership, pause-layer interaction, lifebar behavior, intro/round transition semantics, timer speed/display parity, or full timer parity claim
R2 RuntimeMatchActorRosterWorld ownership
  -> RuntimeMatchActorRosterWorld owns current P1/P2 actor roster projection for PlayableMatchRuntime
  -> helper-owned TargetState actor lookup, compatibility session projection, and effect-store owner summaries consume one roster boundary
  -> focused RuntimeMatchActorRosterSystem coverage proves stable order, live refs, id lookup, mirrored one-on-one opponent projection, and fail-closed unknown actors
  -> ownership cleanup only; no score movement, real teams/simul roster ownership, helper-owned actor discovery, dynamic roster mutation, richer identity metadata, exact VM scheduling, or full actor registry parity claim
R1 stage BG window/maskwindow clipping handoff
  -> Stage DEF [BG ...] window and maskwindow parse into bounded rectangular clip metadata
  -> StageCompatibilityReport reports clipped layer coverage and unsupported mask color-key gaps
  -> Studio Stage diagnostics display clip metadata
  -> Three.js stage renderer clips fallback, asset, and decoded SFF sprite placements while preserving texture UV crop semantics
  -> focused StageDefParser, StageCompatibilityReport, and stageProjection tests prove the handoff
  -> bounded rectangular stage presentation only; no score movement, exact windowdelta/zoom/endpoint/render-mode behavior, color-zero mask semantics, or full stage parity claim
R1 ACT + indexed SFF RemapPal texture handoff
  -> DEF pal1..pal12 ACT refs load into character palettes through the character loader
  -> SFF v1/v2 indexed sprite decoders preserve palette-index pixels plus palette bytes
  -> SffSpriteProvider can rebuild decoded indexed sprite canvases with a loaded ACT destination palette when runtime RemapPal is active
  -> CharacterRenderer forwards actor paletteRemap into sprite lookup context
  -> CompatibilityReport.palettes summarizes total/parsed/color/transparency coverage
  -> focused ActParser, SffParser, SffSpriteProvider, CharacterRenderer, MugenCharacterLoader, and CompatibilityReport tests prove the handoff
  -> bounded indexed palette handoff only; no score movement, exact source-bank semantics, truecolor/PNG remap, exact PalFX/RemapPal math/blend order, renderer visual parity, helper/team/redirect ownership, or full palette parity claim
R1 PalFX + RemapPal combined trace gate
  -> synthetic-imported-palfx-remappal.json checksum ba5fc1e6 is required in qa:trace
  -> one imported actor executes static PalFX and RemapPal together in state 200
  -> required evidence includes typed sprite-effect:palfx and sprite-effect:remappal operations plus combined actor-frame palette telemetry
  -> current pnpm qa:trace passes 283/283 artifacts, 258 required and 25 optional after the TimerFreeze oracle
  -> bounded palette telemetry only; no score movement, exact palette math, blend order, renderer parity, or full presentation parity claim
R2 RuntimeMatchPresentationSnapshotWorld ownership
  -> RuntimeMatchPresentationSnapshotWorld owns bounded match presentation snapshot input construction outside PlayableMatchRuntime
  -> camera shake, stage flash, and P1/P2 effect snapshot groups route through one seam before RuntimeSnapshotWorld.match builds the renderer-independent snapshot
  -> focused RuntimeMatchPresentationSnapshotSystem coverage proves shake/flash/effect-group forwarding and P1/P2 ordering
  -> ownership cleanup only; no score movement, exact stage/motif camera logic, effect lifecycle semantics, renderer/audio parity, visual/debug UI parity, or full match snapshot parity claim
R2 RuntimeActiveControllerTelemetryWorld ownership
  -> RuntimeActiveControllerTelemetryWorld owns bounded active-controller telemetry hook construction outside PlayableMatchRuntime
  -> active state hooks, side-effect dispatchers, and fallback runtime-controller dispatch share one controller/operation hook set before RuntimeCompatibilityTelemetryWorld
  -> focused RuntimeActiveControllerTelemetrySystem coverage proves controller and operation forwarding through the seam
  -> ownership cleanup only; no score movement, exact telemetry event semantics, imported-only filtering, event retention limits, helper/team/redirect telemetry breadth, visual/debug UI parity, or full CNS VM claim
R2 RuntimeMatchCombatStateHooksWorld ownership
  -> RuntimeMatchCombatStateHooksWorld owns bounded combat state-hook adapter construction outside PlayableMatchRuntime
  -> direct/projectile combat hooks preserve state-owner availability and entry options; helper combat hooks keep self-owned availability checks while forwarding entry options
  -> focused RuntimeMatchCombatStateHooksSystem coverage proves both contracts; PlayableMatchRuntime now creates both hook sets through the seam before RuntimeMatchCombatBridgeWorld routes them into combat
  -> ownership cleanup only; no score movement, helper-owned custom-state table breadth, throws, teams/simul actor registry, multi-target helper ownership, exact combat/helper tick order, visual/audio parity, or full combat/helper VM claim
R2 RuntimeMatchOpponentContextWorld ownership
  -> RuntimeMatchOpponentContextWorld owns current 1v1 match-opponent context construction for lifecycle bridges outside RuntimeMatchInteractionWorld, RuntimePausedMatchWorld, and RuntimeHitPauseWorld
  -> mirrored P1/P2 opponent selection, singleton lifecycle opponents list projection, and unknown-actor fail-closed behavior route through one seam
  -> focused RuntimeMatchOpponentContextSystem coverage proves mirrored contexts and fail-closed behavior; existing MatchInteraction/Pause/RuntimeHitPause coverage proves active, pause, and hitpause callers still forward direct opponent plus explicit one-opponent lifecycle list
  -> ownership cleanup only; no score movement, real teams/simul roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond actor refs, exact helper lifecycle/pause/combat ordering, visual/audio parity, or full match/helper VM claim
R2 RuntimeEffectHelperContextWorld ownership
  -> RuntimeEffectHelperContextWorld owns visual Helper lifecycle context construction outside RuntimeEffectLifecycleWorld
  -> complete-owner validation, parent/root projection, current opponent fallback, explicit lifecycle opponents-to-nearest-roster projection, explicit roster override, target candidates, and helper TargetState/telemetry hooks route through one seam
  -> focused RuntimeEffectHelperContextSystem coverage proves nearest roster ordering, explicit roster preservation, target/hook forwarding, and incomplete-owner fail-closed behavior
  -> ownership cleanup only; no score movement, real teams/simul lifecycle roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond ids/runtime state, exact helper lifecycle/pause/combat ordering, visual/audio parity, or full Helper VM claim
Previous R2 RuntimeMatchHelperProjectileTargetWorld ownership
  -> RuntimeMatchHelperProjectileTargetWorld owns the match-level helper-parented Projectile target-memory bridge outside PlayableMatchRuntime
  -> normal post-fighter combat now forwards owner, defender, projectile, and RuntimeTargetWorld through one named seam before lower RuntimeHelperProjectileTargetWorld logic runs
  -> focused RuntimeMatchHelperProjectileTargetSystem coverage proves forwarding and owner-projectile fail-closed behavior
  -> ownership cleanup only; no score movement, helper-owned Projectile contact timing, helper-owned custom-state tables, teams/simul actor registry, multi-target helper ownership, exact target lifetime, visual/audio parity, or full Helper/Projectile VM claim
Previous R2 RuntimeMatchHelperBindingWorld ownership
  -> RuntimeMatchHelperBindingWorld owns match-level helper callback wiring outside PlayableMatchRuntime
  -> helper-owned TargetState owner handlers and helper-local Projectile telemetry handlers attach through one named seam
  -> RuntimeMatchHelperTargetStateWorld still owns actor-resolution entry; RuntimeHelperTelemetryWorld still owns Projectile-only filtering and helper/owner state attribution
  -> focused RuntimeMatchHelperBindingSystem coverage proves owner-specific target-state route forwarding, stale handler replacement, helper-state/owner-state telemetry attribution, and non-Projectile telemetry ignore behavior
  -> ownership cleanup only; no score movement, helper custom-state table breadth, throws, teams/simul actor registry, multi-target helper ownership, exact helper TargetState/projectile timing, broad helper telemetry semantics, visual/audio parity, or full Helper VM claim
R1 EnvColor under-layer trace gate
  -> synthetic-imported-envcolor-under.json checksum 0a7b5c96 is required in qa:trace
  -> static imported EnvColor value = 16,96,255, time = 12, under = 1 lowers into typed envcolor operation evidence
  -> stage-frame evidence requires envColorUnder = true plus opacity evidence
  -> synthetic-imported-envcolor.json checksum 956b0f4b remains the matching under = 0 route
  -> that checkpoint passed 281/281 artifacts, 256 required and 25 optional
  -> bounded stage-flash layer-flag handoff only; no score movement, exact blend math, layer/window ordering, pause timing, renderer parity, visual parity, or full presentation parity claim
R1 Common1 HitFall CanRecover-ready trace gate
  -> synthetic-imported-hitfall-canrecover-ready.json checksum c0097d7f is required in qa:trace
  -> defender takes a fall HitDef with fall.recover = 1 and no p2stateno, then routes 5000 -> 5030 -> 5050 -> 5250 -> 0 through HitFall && CanRecover after fall.recovertime drops positive-to-zero
  -> required order includes HitVelSet -> kinematic:hitvelset -> VelAdd -> named HitFall CanRecover Ready Probe ChangeState
  -> active-command evidence excludes recovery while recovery states 5210 and 5200 are forbidden
  -> pnpm qa:trace passes 287/287 artifacts, 261 required and 26 optional
  -> bounded CanRecover-ready trigger/order evidence only; no score movement, exact recovery threshold tables, controller-loop timing, recovery-input arbitration, velocity math, visual/audio parity, or full fall/recovery parity claim
R1 Common1 ground-recovery priority trace gate
  -> synthetic-imported-default-fall-ground-recovery-priority.json checksum e83b2db7 is required in qa:trace
  -> defender takes a fall HitDef with fall.recover = 1 and no p2stateno, then routes 5000 -> 5030 -> 5050 -> 5200 -> 5201 -> 52 -> 0 through near-ground command = "recovery" while generic air recovery state 5210 is forbidden
  -> required evidence includes positive-to-zero fall.recovertime, named ground-recovery controller/typed-operation order, final idle/control, and forbidden lie-down chain states
  -> current pnpm qa:trace passes 296/296 artifacts, 266 required and 30 optional after optional kfm-official-default-air-guard-state.json checksum f4378971
  -> bounded ground-over-air recovery selection evidence only; no score movement, exact recovery threshold tables, ground/air arbitration constants, velocity math, visual/audio parity, or full recovery parity claim
R1 Common1 HitFall recovery-input priority trace gate
  -> synthetic-imported-hitfall-recovery-input-priority.json checksum bae07bde is required in qa:trace
  -> defender takes a fall HitDef with fall.recover = 1 and no p2stateno, then routes 5000 -> 5030 -> 5050 -> 5210 -> 0 through command = "recovery" while HitFall && CanRecover probe state 5250 is forbidden
  -> required order includes HitVelSet -> kinematic:hitvelset -> VelAdd -> Recovery Input ChangeState -> VelSet -> kinematic:velset -> HitFallSet -> hitfall:hitfallset
  -> active-command evidence includes x and recovery while ground-recovery state 5200 is forbidden
  -> pnpm qa:trace passes 288/288 artifacts, 262 required and 26 optional
  -> bounded recovery-input priority evidence only; no score movement, exact recovery threshold tables, ground/air arbitration, velocity math, visual/audio parity, or full fall/recovery parity claim
Previous R1 Common1 HitFall recover-true trace gate
  -> synthetic-imported-hitfall-recover-true.json checksum f1e3424a is required in qa:trace
  -> defender takes a fall HitDef with fall.recover = 1 and no p2stateno, then routes 5000 -> 5030 -> 5050 -> 5240 -> 0 through HitFall && GetHitVar(fall.recover) && !CanRecover
  -> required order includes HitVelSet -> kinematic:hitvelset -> VelAdd -> named HitFall Recover Enabled Probe ChangeState
  -> actor-frame evidence requires 5000 -> 5030 -> 5050 -> 5240 plus positive fall.recovertime metadata in 5050 and 5240
  -> recovery states 5210 and 5200 are forbidden
  -> that checkpoint passed 280/280 artifacts, 255 required and 25 optional
  -> bounded recover-enabled trigger/order evidence only; no score movement, exact recovery threshold tables, controller-loop timing, recovery arbitration, fall/CanRecover precedence, visual/audio parity, or full fall/recovery parity claim
Previous R1 Common1 HitFall recover-disabled trace gate
  -> synthetic-imported-hitfall-recover-false.json checksum 236df0a8 remains required
  -> defender takes a fall HitDef with fall.recover = 0 and no p2stateno, then routes 5000 -> 5030 -> 5050 -> 5230 -> 0 through HitFall && !GetHitVar(fall.recover) && !CanRecover
  -> bounded recover-disabled trigger/order evidence only; no score movement, exact recovery threshold tables, controller-loop timing, recovery arbitration, fall/CanRecover precedence, visual/audio parity, or full fall/recovery parity claim
Previous R1 Common1 HitFall false trace gate
  -> synthetic-imported-hitfall-false.json checksum 1d538e43 remains required
  -> defender takes a direct HitDef without fall metadata or p2stateno, enters 5000, and routes into state/action 325 through !HitFall && !GetHitVar(fall) && !GetHitVar(guarded)
  -> bounded HitFall false trigger evidence only; no score movement, exact normal get-hit timing, fall arbitration, custom-state/helper/team inheritance, visual/audio parity, or full Common1 get-hit parity claim
Previous R1 Common1 HitFall / CanRecover trace gate
  -> synthetic-imported-hitfall-canrecover.json checksum 7cf7ab46 is required in qa:trace
  -> defender takes a fall HitDef without p2stateno and routes 5000 -> 5030 -> 5050 -> 5220 -> 0
  -> required order includes HitVelSet -> kinematic:hitvelset -> VelAdd -> named HitFall CanRecover Probe ChangeState
  -> actor-frame evidence requires positive fall.recovertime in 5050 and 5220
  -> recovery states 5210 and 5200 are forbidden
  -> that checkpoint passed 277/277 artifacts, 252 required and 25 optional
  -> bounded HitFall true / CanRecover false trigger evidence only; no score movement, exact threshold tables, controller-loop timing, recovery arbitration, visual/audio parity, or full fall/recovery parity claim
R1 Common1 air guard landing trace gate
  -> synthetic-imported-air-guard-landing.json checksum d6986d7f remains required in qa:trace
  -> held-back airborne defender blocks an A-guardable direct HitDef and routes 154 -> 155 -> 52 -> 20 with final held-back walk/control; optional private KFM air guard mirrors the same real KFM/Common1 shape when the fixture exists
  -> active-command evidence requires holdback and x
  -> bounded air guard landing walk-control evidence only; no score movement, exact air guard physics/timing, state-52 internals, proximity guard, guard effects, visual/audio parity, or full guard parity claim
R1 Common1 crouch guard slide-stop trace gate
  -> synthetic-imported-crouch-guard-slide-stop.json checksum 2bea7311 is required in qa:trace
  -> defender-owned crouch guard-hit route executes 152 -> 153 -> 130 after direct guarded contact
  -> active-command evidence requires holddown and x
  -> required order is 152 ChangeAnim -> 152 ChangeState -> 153 HitVelSet -> kinematic:hitvelset -> 153 VelSet -> kinematic:velset -> 153 CtrlSet -> resource:ctrlset -> 153 ChangeState
  -> actor-frame evidence proves crouch guard-slide velocity before stop/control
  -> newer required synthetic-imported-crouch-guard-hold-crouch-return.json checksum 83ecb699 extends this route through final crouch state/action 10 with control
  -> current pnpm qa:trace passes 296/296 artifacts, 266 required and 30 optional
  -> crouch guard slide-stop/control plus synthetic return-to-crouch-control and optional private KFM 152 -> 153 -> 131 -> 11 crouch-control evidence only; no score movement, public KFM support, required portable KFM-specific fixture coverage while the private fixture is absent, exact guard timing, proximity guard, guard effects, air slide-stop parity, controller-loop tick parity, visual/audio parity, or full guard parity claim
R1 PlaySnd/SndPan/StopSnd panning handoff
  -> static PlaySnd lowpriority, legacy volume, volumescale, freqmul, loop, pan, and abspan lower into typed audio:playsnd metadata and RuntimeSoundEvent.lowPriority / legacyVolume / volumeScale / freqMul / loop / pan / absPan
  -> static SndPan channel plus pan/abspan lower into typed audio:sndpan metadata and RuntimeSoundEvent pan / absPan telemetry
  -> RuntimeTrace requiredSoundEvents can require lowPriority, volumeScale, legacyVolume, freqMul, loop, pan, absPan, and SndPan event telemetry
  -> synthetic-imported-sound.json is now checksum cc9c8c49 and gates PlaySnd channel 2 plus lowpriority = 1, volumescale = 50, volume = -8, freqmul = 0.5, loop = 1, pan = 32, PlaySnd channel 3 abspan = -64, SndPan channel 2 / pan = -48, and StopSnd channel 2
  -> MugenAudioSystem routes explicit-channel actions through resolveRuntimeAudioEventAction: normal PlaySnd replaces, low-priority PlaySnd skips active channels, StopSnd channel -1 / omitted channel stops all tracked channels
  -> MugenAudioSystem routes volumeScale through resolveRuntimeSoundGain as bounded Web Audio gain scaling and deliberately ignores legacy volume during modern playback while preserving diagnostics
  -> MugenAudioSystem routes freqMul through resolveRuntimeSoundPlaybackRate as bounded Web Audio playback-rate scaling and maps loop to source looping; unchannelled sources are now tracked for stop-all cleanup
  -> MugenAudioSystem routes pan/abspan through resolveRuntimeSoundStereoPan as bounded Web Audio stereo panning; SndPan updates active explicit channel panners; required trace and focused tests prove static abspan lowering/event projection
  -> bounded Web Audio channel arbitration, volumescale, legacy volume diagnostics, freqmul, loop, pan, abspan, and SndPan only; no exact priority classes, pre-RC8 volume gain semantics, dynamic pan params, global channel fallback, timing/mixing, pause/superpause audio, score movement, or full audio parity claim
R1 FightFX prefix package selection
  -> character [Files] fx = ... entries load IKEMEN-style FightFX DEF [Info] prefix packages with AIR/SFF/SND assets
  -> imported DEF [Info] fightfx.prefix selects the matching prefixed package for runtime F spark frames and F sound refs before global data/fightfx.* fallback
  -> decoded prefixed SFF archives register through the existing global hit-spark provider route
  -> decoded prefixed SND archives register through the existing Web Audio route by soundPrefix
  -> required synthetic-imported-hitdef-fightfx-spark.json remains checksum 11537b56 and still gates fightFxPrefix = kfm metadata
  -> required synthetic-imported-hitdef-hit-effect-package.json remains checksum 46aa5ce1 and now gates hitsound F5,0 plus soundPrefix = kfm beside FightFX spark metadata
  -> bounded package-selection and prefixed-SND lookup support only; no exact sys.ffx lifetime/refcount/cache semantics, global channel fallback, motif/screenpack ownership, renderer/audio timing/layer/scale/palette/mixing parity, score movement, or full hit-effect parity claim
R2 RuntimeMatchHelperTargetStateWorld actor-resolution ownership
  -> RuntimeMatchHelperTargetStateWorld owns match-roster target resolution for helper-owned TargetState entry outside PlayableMatchRuntime
  -> RuntimeHelperTargetStateWorld still owns helper owner validation and no-op result semantics
  -> focused RuntimeMatchHelperTargetStateSystem coverage proves roster-backed target resolution, stale target payload isolation, missing-target no-op, and owner-mismatch fail-closed behavior
  -> ownership cleanup only; no score movement, helper custom-state table breadth, throws, teams/simul actor registry, multi-target helper ownership, exact helper TargetState timing, visual/audio parity, or full Helper VM claim
Previous R2 RuntimeSnapshotWorld match envelope ownership
  -> RuntimeSnapshotWorld.match() owns the full match snapshot envelope outside PlayableMatchRuntime
  -> selected P1 action, playback/speed/toggles, match pause handoff, stage/camera, round, player actors, effects, compatibility-session handoff, and log cap route through one boundary
  -> focused RuntimeSnapshotSystem coverage proves envelope fields, actor/effect clone isolation, and 80-line log trimming
  -> ownership cleanup only; no score movement, snapshot schema change, compatibility telemetry semantics, exact camera/effect/renderer parity, visual/audio parity, or full match VM claim
R2 RuntimeMatchTickBranchWorld ownership
  -> RuntimeMatchTickBranchWorld owns per-tick hitpause / pause / active branch arbitration outside PlayableMatchRuntime
  -> hitpause consumes the tick before pause or active
  -> match pause consumes the tick before active when hitpause is clear
  -> active match runs only when neither pause layer owns the tick
  -> focused RuntimeMatchTickBranchSystem coverage proves branch order
  -> ownership cleanup only; no score movement, exact pause layering/arbitration, hitpause/pause tick semantics, helper/team scheduling, visual/audio parity, or full match VM claim
R2 RuntimeMatchStepWorld ownership
  -> RuntimeMatchStepWorld owns public match-step cadence outside PlayableMatchRuntime
  -> stopped playback snapshots without ticking frame clock; force advances exactly one tick
  -> sub-1x speed samples on frame-clock divisors; multi-step speed loops stop when round-over is observed
  -> focused RuntimeMatchStepSystem coverage proves cadence edges
  -> ownership cleanup only; no score movement, exact pause/round arbitration, frame pacing, replay/rollback timing, helper/team scheduling, visual/audio parity, or full match VM claim
R1 EnvShake required trace restoration
  -> synthetic-imported-envshake.json checksum 061f17d5 is required in qa:trace again
  -> imported state 200 gates ChangeState, EnvShake, HitDef, typed envshake operation evidence, and RuntimeEnvShakeEvent telemetry
  -> event evidence pins actor p1 with time 16, freq 30, ampl -7, phase 0.5, and stateNo 200
  -> current pnpm qa:trace passes 283/283 artifacts, 258 required and 25 optional after later presentation/Common1/AssertSpecial gates
  -> evidence-pipeline restoration only; no new camera waveform, pause/stage/layer, helper/redirect, visual/audio, score, or full presentation parity claim
Previous R1 Common1 stand guard slide-stop trace gate
  -> synthetic-imported-default-guard-slide-stop.json checksum a9663641 is required in qa:trace
  -> defender-owned stand guard-hit route executes 150 -> 151 -> 130 after direct guarded contact
  -> required order is 150 ChangeAnim -> 150 ChangeState -> 151 HitVelSet -> kinematic:hitvelset -> 151 VelSet -> kinematic:velset -> 151 CtrlSet -> resource:ctrlset -> 151 ChangeState
  -> actor-frame evidence proves guard-slide velocity before stop/control
  -> that required checkpoint passed pnpm qa:trace at 271/271 artifacts, 248 required and 23 optional
  -> stand guard slide-stop/control evidence only; no score movement, exact guard timing, proximity guard, guard effects, crouch/air parity, controller-loop tick parity, visual/audio parity, or full guard parity claim
Optional R1 KFM/Common1 guard hold-walk fixture gate
  -> kfm-official-default-guard-hold-walk-return.json checksum 885bb1da passes when .scratch/fixtures/kfm-official.zip exists
  -> synthetic-imported-default-guard-hold-walk-return.json checksum 75d4db9c is required in qa:trace for portable stand guard-hold walk-control
  -> real KFM/Common1 stand guard-hit state 150 -> 151 returns through observable guard-hold state 130, then resumes held-back walk state/action 20 with control while preserving stand slide-stop order
  -> kfm-official-default-guard-hold-return.json checksum 885bb1da remains the hold-only subset
  -> this is private fixture evidence, not bundled public KFM support or exact guard-hold duration/timing/effects parity
Optional R1 KFM/Common1 guard slide-stop fixture gate
  -> kfm-official-default-crouch-guard-slide-stop.json checksum d11153d0 passes when .scratch/fixtures/kfm-official.zip exists
  -> real KFM/Common1 crouch guard-hit state 153 executes HitVelSet -> kinematic:hitvelset -> VelSet -> kinematic:velset -> CtrlSet -> resource:ctrlset -> ChangeState after direct guarded contact while holding down-back
  -> the observed KFM crouch route returns toward crouch/control; this does not claim crouch guard-hold timing parity
  -> kfm-official-default-guard-slide-stop.json checksum 885bb1da passes when .scratch/fixtures/kfm-official.zip exists
  -> real KFM/Common1 stand guard-hit state 151 executes HitVelSet -> kinematic:hitvelset -> VelSet -> kinematic:velset -> CtrlSet -> resource:ctrlset -> ChangeState after direct guarded contact
  -> current pnpm qa:trace passes 296/296 artifacts, 266 required and 30 optional after optional KFM air guard walk-control tightening
  -> private-fixture confidence only; no public KFM support, no score movement, no exact guard timing/proximity/effects/crouch-air/visual/audio/full parity claim
R2 MatchWorld active ownership
  -> RuntimeMatchActiveWorld owns normal active-match orchestration outside PlayableMatchRuntime after hitpause/pause gates
  -> focused RuntimeMatchActiveSystem coverage proves timer/input/fighter/post-fighter/finish order and sub-world result preservation
  -> ownership cleanup only; no score movement, exact active tick order, pause-start arbitration, helper/team/redirect actor ownership, combat priority parity, visual/audio parity, or full match VM claim
Previous R2 MatchWorld hitpause ownership
  -> RuntimeMatchHitPauseWorld owns normal active-match hitpause handoff outside PlayableMatchRuntime
  -> focused RuntimeMatchHitPauseSystem coverage proves delegate payload forwarding and paused/not-paused result preservation
  -> ownership cleanup only; no score movement, exact hitpause tick order, pause arbitration/layering, helper/team/redirect hitpause ownership, visual/audio parity, or full match VM claim
Previous R2 MatchWorld frame-start ownership
  -> RuntimeMatchFrameStartWorld owns normal active-match frame-start reset/assert/facing order outside PlayableMatchRuntime
  -> focused RuntimeMatchFrameStartSystem coverage proves reset-before-assert and assert-before-facing order for both players
  -> ownership cleanup only; no score movement, exact frame-start tick order, pause/hitpause arbitration, helper/team/redirect frame-start ownership, visual/audio parity, or full match VM claim
Previous R1 GetHitVar velocity trace gate
  -> synthetic-imported-gethitvar-velocity.json checksum 878a03f7 is required in qa:trace
  -> defender-owned normal get-hit CNS branches from 5000 into state/action 324 through GetHitVar(xvel) = 4 && GetHitVar(yvel) = -2 && !GetHitVar(fall) && !GetHitVar(guarded) after direct HitDef contact
  -> that checkpoint passed 270/270 artifacts, 247 required and 23 optional
  -> velocity metadata trigger evidence only; no score movement, exact velocity lifetime after later physics/controllers, helper/projectile/custom-state inheritance breadth, teams/simul, visual/audio parity, or full get-hit parity claim
Previous R1 GetHitVar damage trace gate
  -> synthetic-imported-gethitvar-damage.json checksum 2c726114 is required in qa:trace
  -> defender-owned normal get-hit CNS branches from 5000 into state/action 323 through GetHitVar(damage) = 37 && !GetHitVar(guarded) after direct HitDef contact
  -> direct and projectile contact paths store bounded applied damage in shared runtime hit vars, but this required trace only claims the direct normal-hit branch
  -> damage metadata trigger evidence only; no score movement, exact damage lifetime/rounding, guard-chip semantics, helper/projectile/custom-state inheritance breadth, teams/simul, visual/audio parity, or full get-hit parity claim
Previous R1 Common1 default crouch get-hit progression trace gate
  -> synthetic-imported-default-crouch-gethit-progression.json checksum fd986a9e is required in qa:trace
  -> held-crouch imported defender routes through defender-owned Common1-style states 5010 -> 5011 -> 0 after direct HitDef without p2stateno
  -> evidence includes ordered 5010:ChangeState -> 5011:ChangeState controller events, ordered 5010 -> 5011 actor frames, crouch state/physics telemetry, collision telemetry, final checksum d6b64044, and final idle/control
  -> that required checkpoint passed 267/267 artifacts, 245 required and 22 optional before later addenda
  -> crouch HitShakeOver/HitOver progression evidence only; no score movement, exact tick timing, exact crouch get-hit animation/slide tables, fall routing, custom-state/helper/team breadth, visual/audio parity, or full Common1 get-hit parity claim
Optional R1 KFM/Common1 crouch get-hit progression fixture gate
  -> kfm-official-default-crouch-gethit-progression.json checksum 3d197fae passes when .scratch/fixtures/kfm-official.zip exists
  -> real KFM held-crouch route executes prep state 11, then Common1 5010 -> 5011 -> 0 through HitShakeOver / HitOver
  -> KFM-specific evidence pins 5010 anim 5010, 5011 anim 5020, Clsn2 = 2/3, body width 39/39, crouch slide HitVelSet / VelMul / VelSet / DefenceMulSet typed-operation order, final checksum f469a942, and final idle/control
  -> private-fixture confidence only; no public KFM support, no score movement, no exact tick/table/fall/custom-state/team/visual/audio/full parity claim
Optional R1 KFM/Common1 air-entry recovery fixture gates
  -> kfm-official-default-air-fall-recovery-input.json checksum 3bce8aba and kfm-official-default-air-fall-recovery-too-early.json checksum b199382a pass when .scratch/fixtures/kfm-official.zip exists
  -> real KFM air-entry recovery route includes 5020 -> 5030 -> 5035 -> 5050; valid recovery enters 5210, lands through 52, and returns to 0/control, while the early route stays in 5050 and forbids recovery/landing/ground-impact branches
  -> pnpm qa:trace passes 266/266 artifacts, 244 required and 22 optional
  -> private-fixture confidence only; no public KFM support, no score movement, no exact threshold/velocity/tick-order/full parity claim
R1 Common1 default air recovery too-early trace gate
  -> synthetic-imported-default-air-fall-recovery-too-early.json checksum 48a2e708 is required in qa:trace
  -> airborne imported defender routes through defender-owned Common1-style states 5020 -> 5030 -> 5050, keeps command = "recovery" active too early, and stays in 5050 after fall HitDef without p2stateno
  -> 5050 exposes positive fall.recovertime evidence from 11 to 6; recovery/landing states 5210, 5200, 5201, 52, 5100, 5101, 5110, and 5120 are forbidden; final checksum cdd20fed; gate label imported-default-fall-recovery-too-early-golden
  -> pnpm qa:trace passes 264/264 artifacts, 244 required and 20 optional
  -> air-entry early recovery-input rejection evidence only; no score movement, exact recovery threshold tables, exact air get-hit animation, exact velocity math, exact controller-loop timing, recovery arbitration between air/ground branches, visual/audio parity, or full Common1 recovery parity claim
Previous R1 Common1 default air recovery-input trace gate
  -> synthetic-imported-default-air-fall-recovery-input.json checksum 334a419e is required in qa:trace
  -> airborne imported defender routes through defender-owned Common1-style states 5020 -> 5030 -> 5050, accepts command = "recovery", enters 5210, lands through 52, and returns to idle/control after fall HitDef without p2stateno
  -> 5050 exposes positive-to-zero fall.recovertime evidence; 5210 has air-recovery velocity; 52 has y = 0 landing; final checksum c5038a9d; gate label imported-default-fall-recovery-input-golden
  -> that checkpoint passed 263/263 artifacts, 243 required and 20 optional
  -> air-entry recovery-input evidence only; no score movement, exact recovery threshold tables, exact air get-hit animation, exact velocity math, exact controller-loop timing, recovery arbitration between air/ground branches, visual/audio parity, or full Common1 recovery parity claim
Previous R1 Common1 default air lie-down recovery trace gate
  -> synthetic-imported-default-air-liedown-recovery.json checksum 56a8f236 is required in qa:trace
  -> airborne imported defender routes through defender-owned Common1-style states 5020 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0 after fall HitDef without p2stateno
  -> 5101 has HitFallVel / hitfall:hitfallvel evidence; 5110 has HitFallDamage / hitfall:hitfalldamage plus bounded downRecoverTime countdown evidence; final checksum 20c045a3; gate label imported-default-fall-gethit-golden
  -> that checkpoint passed 262/262 artifacts, 242 required and 20 optional
  -> state/order, bounce, lie-down countdown, get-up, and idle-return evidence only; no score movement, exact air get-hit animation, exact HitShakeOver/HitOver timing, exact ground-impact timing/position, exact bounce physics, exact lie-down duration tables, recovery input, landing nuance, controller-loop timing, visual/audio parity, or full Common1 fall/get-hit parity claim
Previous R1 Common1 default air ground-impact trace gate
  -> synthetic-imported-default-air-ground-impact.json checksum 0ba3c80f is required in qa:trace
  -> airborne imported defender routes through defender-owned Common1-style states 5020 -> 5030 -> 5050 -> 5100 after fall HitDef without p2stateno
  -> 5100 has HitFallDamage / hitfall:hitfalldamage evidence; final checksum cb7f1043; gate label imported-default-fall-gethit-golden
  -> that checkpoint passed 261/261 artifacts, 241 required and 20 optional
  -> state/order plus ground-impact controller evidence only; no score movement, exact air get-hit animation, exact HitShakeOver/HitOver timing, exact ground-impact timing/position, bounce physics, lie-down timing, landing, recovery input, controller-loop timing, visual/audio parity, or full Common1 fall/get-hit parity claim
Previous R1 Common1 default air fall get-hit trace gate
  -> synthetic-imported-default-air-fall-gethit.json checksum 1230a2f3 is required in qa:trace
  -> airborne imported defender routes through defender-owned Common1-style states 5020 -> 5030 -> 5050 after fall HitDef without p2stateno
  -> final checksum 2ad2abf9; gate label imported-default-fall-gethit-golden
  -> that checkpoint passed 260/260 artifacts, 240 required and 20 optional
  -> state/order evidence only; no score movement, exact air get-hit animation, exact HitShakeOver/HitOver timing, ground impact, bounce, lie-down, landing, recovery input, controller-loop timing, visual/audio parity, or full Common1 fall/get-hit parity claim
Previous R1 Common1 default air get-hit trace gate
  -> synthetic-imported-default-air-gethit.json checksum dc4fb7c9 is required in qa:trace
  -> airborne imported defender routes into defender-owned Common1-style state 5020 after direct HitDef without p2stateno
  -> final checksum 2fd842bb; gate label imported-default-air-gethit-golden
  -> that checkpoint passed 259/259 artifacts, 239 required and 20 optional
  -> state-selection evidence only; no score movement, exact air get-hit animation, fall route, landing route, air recovery, HitShakeOver/HitOver progression, controller-loop timing, visual/audio parity, or full Common1 get-hit parity claim
Previous R1 Common1 default crouch get-hit trace gate
  -> synthetic-imported-default-crouch-gethit.json checksum 7ec18c61 is required in qa:trace
  -> held-crouch imported defender routes into defender-owned Common1-style state 5010 after direct HitDef without p2stateno
  -> final checksum 1c47d038; gate label imported-default-crouch-gethit-golden
  -> that checkpoint passed 258/258 artifacts, 238 required and 20 optional
  -> state-selection evidence only; no score movement, exact crouch get-hit animation, slide timing, fall routing, HitShakeOver/HitOver progression, controller-loop timing, or full Common1 get-hit parity claim
Previous R1 Projectile fixed-id contact/guard-time trace gates
  -> synthetic-imported-projectile-contacttime-id.json checksum e9ebf36a and synthetic-imported-projectile-guardedtime-id.json checksum dfd08f28 are required in qa:trace
  -> bounded owner-state ProjContactTime(77) and ProjGuardedTime(77) branch after player-owned Projectile contact/guard markers
  -> P1 routes from state/action 200 into 321 and 322 with hit/guard event/reason, Projectile lifecycle, effect-store, and target-link evidence
  -> that checkpoint passed 257/257 artifacts, 237 required and 20 optional
  -> trace evidence only; no score movement, exact contact/guard tick order, multi-projectile same-id selection, helper-owned projectile routing, teams/simul, or full Projectile timing parity claim
Previous R1 Projectile cancel-time owner any-id trace gate
  -> synthetic-imported-projectile-canceltime-any.json checksum 5bff1961 is required in qa:trace
  -> bounded owner-state ProjCancelTime(0) branches after that owner's player-owned Projectile id 77 is canceled by an opposing Projectile clash
  -> P2 routes from state/action 200 into 320 with clash/cancel runtime-event evidence, loser projcancelanim terminal playback anim 918, projectile lifecycle, effect-store, and payload evidence
  -> trace evidence only; no score movement, exact cancel tick order, multi-projectile any-id arbitration beyond this route, helper-owned projectile routing, teams/simul, or full Projectile parity claim
Previous R1 Projectile cancel-time owner var-id trace gate
  -> synthetic-imported-projectile-canceltime-var.json checksum e057e102 is required in qa:trace
  -> bounded owner-state ProjCancelTime(var(0)) branches after owner-local VarSet seeds canceled player-owned Projectile id 77
  -> P2 routes from state/action 200 into 319 with clash/cancel runtime-event evidence, loser projcancelanim terminal playback anim 917, projectile lifecycle, effect-store, and payload evidence
  -> trace evidence only; no score movement, broad dynamic expression parity, exact cancel tick order, multi-projectile any-id arbitration, helper-owned projectile routing, teams/simul, or full Projectile parity claim
Previous R1 Projectile cancel-time owner dynamic-id trace gate
  -> synthetic-imported-projectile-canceltime-dynamic.json checksum 0da26c87 is required in qa:trace
  -> bounded owner-state expression-derived ProjCancelTime(77 + var(0)) branches after that owner's player-owned Projectile is canceled by an opposing Projectile clash
  -> P2 routes from state/action 200 into 318 with clash/cancel runtime-event evidence, loser projcancelanim terminal playback anim 916, projectile lifecycle, effect-store, and payload evidence
  -> trace evidence only; no score movement, broad dynamic expression parity, exact cancel tick order, multi-projectile any-id arbitration, helper-owned projectile routing, teams/simul, or full Projectile parity claim
Previous R1 Helper Projectile cancel-time dynamic-id trace gate
  -> synthetic-imported-helper-projcanceltime-dynamic.json checksum cc78dde2 is required in qa:trace
  -> bounded helper-local expression-derived ProjCancelTime(8869 + var(0)) branches after a matching helper-parented owner-side Projectile is canceled by an opposing Projectile clash
  -> focused helper-local runtime coverage separately proves nonzero ProjCancelTime(var(n)) id selection
  -> trace evidence only; no score movement, broad dynamic expression parity, exact cancel tick order, helper-owned custom states, teams/simul, or full Helper/Projectile parity claim
```

Latest implementation checkpoint:

```txt
R2 match post-fighter ownership
  -> RuntimeMatchPostFighterWorld now owns bounded normal active-match post-fighter bridge wiring from PlayableMatchRuntime
  -> combat resolver construction and RuntimeMatchInteractionWorld.advanceRuntime handoff route through one named boundary
  -> focused RuntimeMatchPostFighterSystem coverage proves target/effect/projectile-clash/constraint/binding/direct/projectile/helper-combat/clamp/presentation forwarding after resolver construction
  -> ownership cleanup only; no exact post-fighter tick order, combat priority parity, projectile/helper contact timing, helper/team/redirect ownership, target lifetime parity, visual/audio parity, score movement, or full match VM claim
R2 match input-control ownership
  -> RuntimeMatchInputControlWorld now owns bounded normal active-match P1/P2-controlled/simple-AI input dispatch from PlayableMatchRuntime
  -> P1 player input, controlled P2 player input, and uncontrolled P2 simple-AI fallback route through one named boundary after normal command-buffer writes
  -> focused RuntimeMatchInputControlSystem coverage proves P1-before-controlled-P2 ordering, mirrored opponent arguments, and P1-before-AI fallback ordering
  -> ownership cleanup only; no exact input priority, command timing, input-conflict resolution, pause/hitpause command parity, helper/team/redirect command ownership, AI parity, visual/audio parity, score movement, or full input VM claim
R2 match round ownership
  -> RuntimeMatchRoundWorld now owns bounded active-match round timer delegation and finish side effects from PlayableMatchRuntime
  -> timer tick, KO/time-over stop, and round-finish log emission route through one named boundary
  -> focused RuntimeMatchRoundSystem coverage proves timer delegation, finish stop/log mutation, and no-finish no-op behavior
  -> ownership cleanup only; no exact round-flow timing, intros/winposes, KO slowdown, continue flow, teams/simul/turns, lifebar/screenpack behavior, visual/audio parity, score movement, or full round VM claim
R2 match fighter-advance ownership
  -> RuntimeMatchFighterAdvanceWorld now owns bounded active 1v1 fighter-advance orchestration from PlayableMatchRuntime
  -> P1 advance, P2 auto-guard start, pause-gated P2 advance, and P1 auto-guard start route through one named boundary
  -> focused RuntimeMatchFighterAdvanceSystem coverage proves normal P1/P2 ordering and pause-after-P1 skip behavior
  -> ownership cleanup only; no exact player tick order, pause-start arbitration, teams/simul roster advance, helper/team/redirect actor advance semantics, guard-start parity, visual/audio parity, score movement, or full match VM claim
R2 pause-controller result ownership
  -> RuntimeMatchPauseControllerWorld now owns bounded Pause/SuperPause controller result side effects from PlayableMatchRuntime
  -> RuntimePauseWorld still owns pause-state mutation/snapshot/tick, while the new boundary applies SuperPause power deltas through an injected resource hook and emits the existing pause log line
  -> focused PauseSystem coverage proves tick/controller/op forwarding, power-delta handoff, log emission, and zero-length no-side-effect behavior
  -> ownership cleanup only; no exact pause layering, SuperPause background/effects/sound timing, helper/team/redirect pause ownership, pause/hitpause command parity, visual/audio parity, score movement, or full pause VM claim
R2 combat bridge ownership
  -> RuntimeMatchCombatBridgeWorld now owns bounded priority/direct/projectile/helper combat resolver construction from PlayableMatchRuntime
  -> RuntimeMatchInteractionWorld receives callback routes from one named bridge instead of inline match-loop closures
  -> focused RuntimeMatchCombatBridgeSystem coverage proves priority/direct/projectile/helper wiring, hurtbox forwarding, projectile target-memory forwarding, and log forwarding
  -> ownership cleanup only; no exact combat priority, helper-owned contact timing, projectile hit/cancel timing, teams/simul/multi-target combat breadth, visual/audio parity, score movement, or full combat VM claim
R2 move start ownership
  -> RuntimeMoveStartWorld now owns bounded native/imported state-move startup from PlayableMatchRuntime
  -> selected currentMove/currentMoveLabel, moveTick reset, hasHit reset, reversal cleanup, attack moveType, control handoff, and authored state-entry handoff route through one boundary
  -> focused RuntimeMoveStartSystem coverage proves selected move metadata/reset behavior and control-before-state-entry hook order
  -> ownership cleanup only; no exact command timing, cancel windows, combo/input priority, helper/team/redirect move startup, persistent-controller timing, visual parity, score movement, or full move VM claim
R2 match tick input ownership
  -> RuntimeMatchTickInputWorld now owns bounded normal-match input/tick stamping from PlayableMatchRuntime
  -> actor compatibilityTick, cloned currentInput, and normal non-hitpause command-buffer writes route through one boundary
  -> focused RuntimeMatchTickInputSystem coverage proves clone isolation, tick stamping, normal buffer writes without hitPause, and separation from pause/hitpause buffering
  -> ownership cleanup only; no exact command timing, input conflict priority, pause/hitpause command parity, helper/team/redirect command ownership, visual parity, score movement, or full input VM claim
R2 helper telemetry ownership
  -> RuntimeHelperTelemetryWorld owns bounded helper-local Projectile controller/op telemetry binding from PlayableMatchRuntime
  -> focused RuntimeHelperTelemetrySystem coverage proves projectile controller/op recording, helper-state attribution, owner-state fallback, non-projectile ignore behavior, and stale handler replacement
  -> ownership cleanup only; no exact helper Projectile tick timing, helper-owned Projectile combat/contact presentation, teams/simul helper telemetry, visual/audio parity, or full Helper VM claim
R2 fighter advance ownership
  -> RuntimeFighterAdvanceWorld now owns bounded per-fighter advance order from PlayableMatchRuntime
  -> sprite-effect tick, hit eligibility slots, HitOverride slots, contact timers, render-angle reset, state clock, frame constraints, recovery-window tick, preserve-moveType read, stun, move lifecycle, kinematics, animation, active controllers, ground-recovery landing, lie-down recovery, and frozen-position preservation route through one boundary
  -> focused RuntimeFighterAdvanceSystem coverage proves order, render-angle cleanup, preserve flag forwarding, and tick-start position capture after recovery-window tick but before kinematics
  -> ownership cleanup only; no exact MUGEN/IKEMEN player tick order, persistent-controller timing, helper/team/redirect actor advance semantics, recovery/stun/physics arbitration, visual parity, score movement, or full VM parity claim
R2 active controller dispatch ownership
  -> RuntimeActiveControllerDispatchWorld now owns active-controller route orchestration after scan/trigger pass
  -> state/animation mutation routes first, shared runtime controllers route second, active side effects route third, unsupported dispatches stay fail-soft/reportable
  -> focused RuntimeActiveControllerDispatchSystem coverage proves state-first stop, runtime-controller handoff, side-effect handoff, and unsupported pass-through
  -> ownership cleanup only; no exact CNS VM timing, persistent-controller semantics, helper/team/redirect scopes, side-effect ordering parity, missing-action fallback parity, visual parity, score movement, or full active-controller parity claim
R2 concrete lifecycle opponent source bridge
  -> RuntimeMatchInteractionWorld, RuntimePausedMatchWorld, and RuntimeHitPauseWorld now pass explicit one-opponent lifecycle opponents lists into RuntimeEffectLifecycleWorld from the real 1v1 match/pause/hitpause routes
  -> legacy direct opponent arguments remain present for current opponentId/opponentState fallback paths
  -> focused MatchInteractionSystem, PauseSystem, and RuntimeHitPauseSystem coverage proves active and paused lifecycle options carry [current opponent] plus stage/runtime ticks
  -> ownership cleanup only; no real teams/simul roster registry, automatic multi-opponent match roster discovery, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, target/redirect mutation, visual parity, score movement, or full helper/team VM claim
R2 effect-lifecycle explicit opponent list
  -> RuntimeEffectLifecycleWorld accepts an explicit opponents list and builds nearest-order opponentRoster through RuntimeOpponentSelectionWorld
  -> legacy current opponentId/opponentState remains separate for one-opponent fallback routes
  -> focused EffectLifecycleSystem coverage proves an unsorted [far, near, tied] list becomes nearest-order helper roster and does not leak the opponents control field into helper options
  -> ownership cleanup only; no real teams/simul roster registry, automatic match-level multi-opponent lifecycle wiring, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, target/redirect mutation, visual parity, score movement, or full helper/team VM claim
R2 opponent-selection roster builder
  -> RuntimeOpponentSelectionWorld now builds id-bearing opponentRoster entries in nearest order without cloning runtime states
  -> RuntimeEffectLifecycleWorld delegates current-opponent lifecycle roster construction through that named boundary
  -> focused RuntimeOpponentSelectionSystem coverage proves ids and state refs survive nearest ordering; EffectLifecycleSystem coverage keeps active/paused forwarding green
  -> ownership cleanup only; no real teams/simul roster registry, multi-opponent lifecycle roster sources, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, target/redirect mutation, visual parity, score movement, or full helper/team VM claim
R2 effect-lifecycle opponent roster bridge
  -> RuntimeEffectLifecycleWorld now forwards the current opponent as an id-bearing opponentRoster into active and paused Helper lifecycle contexts
  -> legacy opponentId/opponentState stays present, but first-generation visual Helper lifecycle now uses the same metadata path HelperSystem can sort/read
  -> focused EffectLifecycleSystem coverage proves active and paused options carry the current opponent id plus runtime state
  -> ownership cleanup only; no real teams/simul roster registry, multi-opponent lifecycle roster construction, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, target/redirect mutation, visual parity, score movement, or full helper/team VM claim
R2 helper-local opponent roster metadata
  -> HelperSystem now accepts caller-supplied helper-local opponentRoster entries with id plus runtime state
  -> RuntimeOpponentSelectionWorld keeps that metadata attached while sorting, so EnemyNear(index), TeamSide can resolve non-current entries after nearest ordering
  -> focused EffectActorSystem coverage proves an unsorted roster with ids resolves EnemyNear(1), TeamSide = 2 after sorting
  -> ownership cleanup only; no real teams/simul roster registry, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, target/redirect mutation, visual parity, score movement, or full helper/team VM claim
R2 helper-local opponent selection boundary reuse
  -> HelperSystem now routes caller-supplied helper-local opponentStates through RuntimeOpponentSelectionWorld
  -> helper-local EnemyNear(index), EnemyNear(var(n)), NumEnemy, and direct helper opponent context now share nearest-roster ordering with active runtime expression contexts
  -> focused RuntimeOpponentSelectionSystem coverage proves raw runtime-state list ordering; EffectActorSystem coverage proves helper-local unsorted [far, near, tie] lists resolve by nearest/stable-tie order
  -> ownership cleanup only; no real teams/simul roster registry, helper-owned opponent roster discovery, opponent ids for non-current roster entries, y-axis/priority selection parity, target/redirect mutation, visual parity, score movement, or full helper/team VM claim
R2 RuntimeOpponentSelectionWorld ownership extraction
  -> RuntimeOpponentSelectionWorld now owns bounded horizontal body-distance scoring and stable nearest-roster ordering for runtime opponent lists
  -> RuntimeExpressionContextWorld delegates explicit EnemyNear(index) roster ordering through that boundary instead of keeping opponent sorting inline
  -> focused RuntimeOpponentSelectionSystem coverage proves nearest ordering, stable ties, finite-before-nonfinite sorting, and distance values; RuntimeExpressionContextSystem EnemyNear coverage stays green
  -> ownership cleanup only; no real teams/simul roster registry, helper-owned opponent roster, y-axis/priority selection parity, target/redirect mutation, visual parity, score movement, or full helper/team VM claim
Previous R2 EnemyNear nearest-roster ordering
  -> RuntimeExpressionContextWorld now sorts explicit opponent rosters by bounded nearest body-distance before resolving EnemyNear(index)
  -> stable ties preserve caller order, NumEnemy still reports supplied roster length, and one-opponent fallback stays intact
  -> focused RuntimeExpressionContextSystem coverage proves EnemyNear(0..3) resolves nearest/stable-tie/far order from an unsorted roster
  -> read-context cleanup only; no real teams/simul roster ownership, helper-owned opponent roster, y-axis/priority selection parity, target/redirect mutation, visual parity, score movement, or full helper/team VM claim
Previous R2 trigger/dispatch opponent roster passthrough
  -> RuntimeDispatchEvaluationWorld and RuntimeTriggerEvaluationWorld now forward optional explicit opponent rosters into createContext
  -> PlayableMatchRuntime routes its current one-opponent list through the same seam, so future team/simul rosters have a typed path into RuntimeExpressionContextWorld
  -> focused RuntimeDispatchEvaluationSystem and RuntimeTriggerEvaluationSystem coverage proves roster forwarding plus NumEnemy evaluation through dynamic param and trigger paths
  -> adapter ownership cleanup only; no real teams/simul roster ownership, helper-owned opponent roster, broader indexed redirects beyond caller-provided opponent-state lists, visual parity, score movement, or full helper/team VM claim
Previous R2 runtime expression opponent roster context
  -> RuntimeExpressionContextWorld now accepts an optional explicit opponent roster and wires EnemyNear(index) plus NumEnemy through that list
  -> focused RuntimeExpressionContextSystem coverage proves roster-backed EnemyNear(1), EnemyNear(var(n)), NumEnemy = 2, default one-opponent fallback, and missing-index fail-closed behavior
  -> context ownership cleanup only; no real teams/simul roster ownership, helper-owned opponent roster, broader indexed redirects beyond caller-provided opponent-state lists, visual parity, score movement, or full helper/team VM claim
Previous R2 helper-local EnemyNear / NumEnemy explicit opponent context
  -> ExpressionEvaluator can resolve EnemyNear(index) through an explicit enemy-near redirect callback before falling back to the current single-opponent context
  -> ExpressionEvaluator can read NumEnemy from an explicit provider, clamping invalid provider values to 0
  -> HelperSystem can pass an explicit opponentStates list into helper-local trigger/value evaluation, so bounded visual Helpers can evaluate EnemyNear(0), EnemyNear(var(n)), and NumEnemy against supplied runtime states
  -> focused RuntimeCnsSubset and EffectActorSystem tests prove direct evaluator support, dynamic index expressions, helper-local indexed routing, explicit opponent-count reads, and missing-index fail-closed behavior
  -> context/redirect/count cleanup only; no teams/simul opponent ordering, helper-owned opponent roster, broader indexed redirects beyond caller-provided opponent-state lists, visual parity, score movement, or full helper VM claim
Previous R2 RuntimeEffectLifecycleWorld helper advance-context ownership
  -> RuntimeEffectLifecycleWorld now forwards stageBounds, stageTime, and runtimeTick into helper-local active and paused lifecycle passes
  -> RuntimeMatchInteractionWorld, RuntimePausedMatchWorld, RuntimeHitPauseWorld, and PlayableMatchRuntime pass current tick context through that boundary
  -> focused EffectLifecycleSystem tests prove helper-local GameTime rejection/pass behavior, FrontEdgeDist param evaluation from stage bounds, PlaySnd runtimeTick telemetry, and ChangeState handoff
  -> ownership/context cleanup only; no exact helper clock parity, pause/combat ordering parity, broader indexed/team redirects, teams/simul, visual parity, score movement, or full helper VM claim
Previous R2 RuntimeAnimationWorld active action-retarget ownership
  -> RuntimeAnimationWorld now owns bounded active action lookup/reset plus elem/elemtime seeding for known AIR actions
  -> PlayableMatchRuntime delegates its local changeAction helper through that boundary while still owning active controller dispatch, state-owner selection, state entry, and controller ordering
  -> focused RuntimeAnimationSystem tests prove authored-action retargeting, same-action element retargeting, and missing-action no-mutation behavior
  -> pnpm qa:trace remains stable at 251/251 artifacts, 231 required and 20 optional
  -> ownership cleanup only; no exact AIR negative-duration semantics, missing-action fallback parity, full elem/elemtime parity, helper/team redirect namespaces, controller tick-order parity, visual parity, score movement, or full animation VM claim
Previous R1 Helper Projectile cancel-time fixed-id required trace gate
  -> synthetic-imported-helper-projcanceltime-id.json checksum fc412176 remains required in qa:trace
  -> bounded helper-local ProjCancelTime(8868) can branch after a matching helper-parented owner-side Projectile is canceled by an opposing Projectile clash
  -> Helper routes from state/action 1268 into 1269 with clash/cancel runtime-event evidence, loser projcancelanim terminal playback anim 1008, helper/projectile lifecycle, effect-store, and payload evidence
  -> pnpm qa:trace passes 251/251 artifacts, 231 required and 20 optional
  -> helper-local fixed-id cancel-time trigger evidence only; no exact cancel tick-order/lifetime, multi-projectile same-id selection, exact priority classes, helper-owned custom states, redirects, teams/simul, visual/audio parity, score movement, or full Helper/Projectile cancel parity claim
Previous R1 Helper Projectile cancel-time any required trace gate
  -> synthetic-imported-helper-projcanceltime-any.json checksum f7e7fa01 remains required in qa:trace
  -> bounded helper-local ProjCancelTime(0) can branch after a helper-parented Projectile is canceled by an opposing Projectile clash
  -> Helper routes from state/action 1266 into 1267 with clash/cancel runtime-event evidence, loser projcancelanim terminal playback anim 998, helper/projectile lifecycle, effect-store, and payload evidence
  -> pnpm qa:trace passed 250/250 artifacts, 230 required and 20 optional at that checkpoint
  -> helper-local cancel-time trigger evidence only; no exact cancel tick-order/lifetime, exact priority classes, multi-projectile any-id selection beyond this route, helper-owned custom states, redirects, teams/simul, visual/audio parity, score movement, or full Helper/Projectile cancel parity claim
Previous R1 Projectile cancel-time owner-state required trace gate
  -> synthetic-imported-projectile-canceltime.json checksum 64e8dec4 remains required in qa:trace
  -> bounded owner-state ProjCancelTime(77) can branch after that owner's player-owned Projectile is canceled by an opposing Projectile clash
  -> P2 routes into state/action 283 with clash/cancel runtime-event evidence, loser projcancelanim terminal playback, projectile lifecycle, effect-store, and payload evidence
  -> owner-state cancel-time trigger evidence only; no exact cancel tick-order/lifetime, exact priority classes, multi-projectile any-id arbitration beyond the gated any-id route, redirects, teams/simul, visual/audio parity, score movement, or full Projectile cancel parity claim
Previous R1 Helper Projectile guard/contact-time any required trace gates
  -> synthetic-imported-helper-projguardedtime-any.json checksum 1f1a38e4 and synthetic-imported-helper-projcontacttime-any.json checksum 0d9f7829 are now required in qa:trace
  -> bounded helper-local ProjGuardedTime(0) and ProjContactTime(0) can branch after helper-parented Projectile guard/contact markers
  -> Helper routes into state/actions 1263 and 1265 with guard event/reason, helper/projectile lifecycle, effect-store, target-link, and sound/FightFX package evidence
  -> helper-local guard/contact-time trigger evidence only; no exact contact/guard tick-order/lifetime, multi-projectile any-id selection, helper-owned custom-state targets, redirects, teams/simul, visual/audio parity, score movement, or full Helper/Projectile parity claim
Previous R1 Helper Projectile hit-time any required trace gate
  -> synthetic-imported-helper-projhittime-any.json checksum bca9f47b remains required in qa:trace
  -> bounded helper-local ProjHitTime(0) can branch after a helper-parented Projectile hits P2
  -> Helper routes into state/action 1261 with hit event/reason, helper/projectile lifecycle, effect-store, target-link, and sound/FightFX package evidence
  -> helper-local hit-time trigger evidence only; no exact hit tick-order/lifetime, multi-projectile any-id selection, helper-owned custom-state targets, redirects, teams/simul, visual/audio parity, score movement, or full Helper/Projectile parity claim
Previous R1 Projectile hit-time any required trace gate
  -> synthetic-imported-projectile-hittime-any.json checksum 47c1cf7f remains required in qa:trace
  -> bounded owner-state ProjHitTime(0) can branch after a player-owned Projectile hits P2
  -> P1 routes into state/action 282 with hit event/reason, Projectile lifecycle, effect-store, and target-link evidence
  -> pnpm qa:trace passed 245/245 artifacts, 225 required and 20 optional at that checkpoint
  -> hit-time trigger evidence only; no exact hit tick-order/lifetime, multi-projectile id=0 selection, exact helper-local timing beyond bounded helper gates, redirects, teams/simul, visual/audio parity, score movement, or full Projectile hit parity claim
Previous R1 Projectile contact-time any required trace gate
  -> synthetic-imported-projectile-contacttime-any.json checksum f1751155 is now required in qa:trace
  -> bounded owner-state ProjContactTime(0) can branch after a player-owned Projectile hits P2
  -> P1 routes into state/action 281 with hit event/reason, Projectile lifecycle, effect-store, and target-link evidence
  -> pnpm qa:trace passed 244/244 artifacts, 224 required and 20 optional at that checkpoint
  -> contact-time trigger evidence only; no exact contact tick-order/lifetime, multi-projectile id=0 selection, exact helper-local timing beyond bounded helper gates, redirects, teams/simul, visual/audio parity, score movement, or full Projectile contact parity claim
Previous R1 Projectile guarded-time any required trace gate
  -> synthetic-imported-projectile-guardedtime-any.json checksum c8473340 is now required in qa:trace
  -> bounded owner-state ProjGuardedTime(0) can branch after P2 guards a player-owned Projectile
  -> P1 routes into state/action 279 with guard event/reason, Projectile lifecycle, effect-store, and target-link evidence
  -> pnpm qa:trace passed 243/243 artifacts, 223 required and 20 optional at that checkpoint
  -> guarded contact-time trigger evidence only; no exact guard tick-order/lifetime, multi-projectile id=0 selection, exact helper-local timing beyond bounded helper gates, redirects, teams/simul, visual/audio parity, score movement, or full Projectile guard parity claim
Previous R1 HitDef plus Projectile target-memory mix required trace gate
  -> synthetic-imported-hitdef-projectile-target-mix.json checksum e98d4857 is now required in qa:trace
  -> bounded owner-local target memory can retain direct HitDef id 77 and player-owned Projectile id 78 in one active state
  -> P1 branches through NumTarget(77), Target(77), Life, NumTarget(78), and Target(78), Life into state/action 278
  -> requires direct hit evidence, Projectile lifecycle/payload evidence, and both owner target links
  -> pnpm qa:trace passed 242/242 artifacts, 222 required and 20 optional at that checkpoint
  -> target-memory trigger evidence only; no Target* mutation mixing, helper-owned projectile targets, teams/simul, multi-target selection, exact target lifetime/tick order, visual parity, score movement, or full target/combat parity claim
Previous R1 Helper Projectile Air Guard GetHitVar hitshaketime required trace gate
  -> synthetic-imported-helper-projectile-gethitvar-air-guard-hitshaketime.json checksum 3c3f2e25 is now required in qa:trace
  -> bounded defender-owned air guard-hit CNS can branch from state 155 through GetHitVar(hitshaketime) > 0 && GetHitVar(guarded) = 1 into state/action 317 after a helper-parented Projectile air guard
  -> requires helper-local Projectile spawn telemetry plus helper/projectile lifecycle and owner/helper target-link evidence
  -> pnpm qa:trace passed 241/241 artifacts, 221 required and 20 optional before the target-mix gate was added
  -> helper-parented Projectile air guard hitshake timing metadata trigger evidence only; no helper-owned custom states, exact helper Projectile air guard timing/landing/effects, projectile presentation, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN guard parity claim
Previous R1 Projectile Air Guard GetHitVar hitshaketime required trace gate
  -> synthetic-imported-projectile-gethitvar-air-guard-hitshaketime.json checksum 3fcf1421 is now required in qa:trace
  -> bounded defender-owned air guard-hit CNS can branch from state 155 through GetHitVar(hitshaketime) > 0 && GetHitVar(guarded) = 1 into state/action 316 after a player-owned Projectile air guard
  -> pnpm qa:trace passed 240/240 artifacts, 220 required and 20 optional before the helper Projectile air guard hitshaketime gate was added
  -> player-owned Projectile air guard hitshake timing metadata trigger evidence only; no exact air guard timing/landing/proximity, projectile presentation, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN guard parity claim
Previous R1 Air Guard GetHitVar hitshaketime required trace gate
  -> synthetic-imported-gethitvar-air-guard-hitshaketime.json checksum 703e9328 is now required in qa:trace
  -> bounded defender-owned air guard-hit CNS can branch from state 155 through GetHitVar(hitshaketime) > 0 && GetHitVar(guarded) = 1 into state/action 315 after a direct HitDef air guard
  -> pnpm qa:trace passed 239/239 artifacts, 219 required and 20 optional before the Projectile air guard hitshaketime gate was added
  -> air guard hitshake timing metadata trigger evidence only; no exact air guard timing/landing/proximity, guard end/effects, helper/projectile air-guard variants, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN guard parity claim
Previous R1 Crouch Guard GetHitVar hitshaketime required trace gate
  -> synthetic-imported-gethitvar-crouch-guard-hitshaketime.json checksum b31d1dac is now required in qa:trace
  -> bounded defender-owned crouch guard-hit CNS can branch from state 153 through GetHitVar(hitshaketime) > 0 && GetHitVar(guarded) = 1 into state/action 314 after a direct HitDef crouch guard
  -> pnpm qa:trace passed 238/238 artifacts, 218 required and 20 optional before the air guard hitshaketime gate was added
  -> crouch guard hitshake timing metadata trigger evidence only; no exact crouch guard timing/proximity, guard end/effects, helper/projectile crouch-guard variants, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN guard parity claim
Previous R1 Helper Projectile GetHitVar guard hitshaketime required trace gate
  -> synthetic-imported-helper-projectile-gethitvar-guard-hitshaketime.json checksum 64a1a8bd is now required in qa:trace
  -> bounded defender-owned guard-hit CNS can branch from state 151 through GetHitVar(hitshaketime) > 0 && GetHitVar(guarded) = 1 into state/action 313 after a helper-parented Projectile guard
  -> pnpm qa:trace passed 237/237 artifacts, 217 required and 20 optional before the crouch guard hitshaketime gate was added
  -> helper-parented Projectile guard hitshake timing metadata trigger evidence only; no helper-owned custom states, exact helper Projectile guard timing/effects, projectile visual/audio parity, custom-state inheritance breadth, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN guard parity claim
Previous R1 Projectile GetHitVar guard hitshaketime required trace gate
  -> synthetic-imported-projectile-gethitvar-guard-hitshaketime.json checksum 724f66d6 is now required in qa:trace
  -> bounded defender-owned guard-hit CNS can branch from state 151 through GetHitVar(hitshaketime) > 0 && GetHitVar(guarded) = 1 into state/action 312 after a player-owned Projectile guard
  -> pnpm qa:trace passed 236/236 artifacts, 216 required and 20 optional before the Helper Projectile guard hitshaketime gate was added
  -> player-owned Projectile guard hitshake timing metadata trigger evidence only; no exact hitpause lifetime, guard timing/effects, projectile visual/audio parity, custom-state inheritance breadth, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN guard parity claim
Previous R1 GetHitVar guard hitshaketime required trace gate
  -> synthetic-imported-gethitvar-guard-hitshaketime.json checksum 31d76de9 is now required in qa:trace
  -> bounded defender-owned guard-hit CNS can branch from state 151 through GetHitVar(hitshaketime) > 0 && GetHitVar(guarded) = 1 into state/action 311 after a direct HitDef guard
  -> pnpm qa:trace passed 235/235 artifacts, 215 required and 20 optional before the Projectile guard hitshaketime gate was added
  -> direct-HitDef guard hitshake timing metadata trigger evidence only; no exact hitpause lifetime, guard timing/proximity, guard end/effects, custom-state/helper/projectile inheritance breadth, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN guard parity claim
Previous R1 GetHitVar hitshaketime required trace gate
  -> synthetic-imported-gethitvar-hitshaketime.json checksum 655107b9 is now required in qa:trace
  -> bounded defender-owned normal get-hit CNS can branch from state 5000 through GetHitVar(hitshaketime) > 0 && !GetHitVar(guarded) into state/action 310 after a direct HitDef hit
  -> pnpm qa:trace passed 234/234 artifacts, 214 required and 20 optional before the guard hitshaketime gate was added
  -> direct-contact normal hitshake timing metadata trigger evidence only; no exact hitpause tick lifetime, hitshake lifetime, custom-state/helper/projectile inheritance breadth, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN get-hit parity claim
Previous R1 GetHitVar hittime required trace gate
  -> synthetic-imported-gethitvar-hittime.json checksum a11beef0 is now required in qa:trace
  -> bounded defender-owned normal get-hit CNS can branch from state 5000 through GetHitVar(hittime) > 0 && !GetHitVar(guarded) into state/action 309 after a direct HitDef hit
  -> pnpm qa:trace passed 233/233 artifacts, 213 required and 20 optional before the hitshaketime gate was added
  -> direct-contact normal hit timing metadata trigger evidence only; no exact hitstun tick order, custom-state/helper/projectile inheritance breadth, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN get-hit parity claim
R1 GetHitVar guard timing required trace gate
  -> synthetic-imported-gethitvar-guard-timing.json checksum cf92c669 is now required in qa:trace
  -> bounded defender-owned guard-hit CNS can branch from state 151 through GetHitVar(hittime) > 0, GetHitVar(slidetime) = 5, and GetHitVar(ctrltime) = 7 into state/action 308 after a direct HitDef guard
  -> pnpm qa:trace passed 232/232 artifacts, 212 required and 20 optional before the hittime gate was added
  -> direct-HitDef guard timing metadata trigger evidence only; no exact guard timing/proximity, guard end, guard effects, projectile/helper/custom-state inheritance, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN guard parity claim
R1 GetHitVar down-recover required trace gate
  -> synthetic-imported-gethitvar-down-recover.json checksum b8a7aef0 is now required in qa:trace
  -> bounded owner-backed get-hit CNS can branch from state 5100 through GetHitVar(down.recover) = 1, GetHitVar(down.recovertime) = 45, and alias GetHitVar(recovertime) = 45 into state/action 307 before lie-down recovery consumes the timer
  -> pnpm qa:trace passed 231/231 artifacts, 211 required and 20 optional before the guard timing gate was added
  -> stored direct-HitDef down-recovery metadata trigger evidence only; no exact liedown tables, 5110/5120 tick order, metadata lifetime/stacking, redirects, helper/projectile/custom-state inheritance, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN Common1 recovery parity claim
R1 GetHitVar fall env-shake required trace gate
  -> synthetic-imported-gethitvar-fall-envshake.json checksum 6364632a is now required in qa:trace
  -> bounded owner-backed get-hit CNS can branch from state 5100 through GetHitVar(fall.envshake.time) = 15, GetHitVar(fall.envshake.freq) = 178, GetHitVar(fall.envshake.ampl) = 6, and GetHitVar(fall.envshake.phase) = 0 into state/action 306 before FallEnvShake presentation executes
  -> pnpm qa:trace passed 230/230 artifacts, 210 required and 20 optional before the down-recover gate was added
  -> stored direct-HitDef fall env-shake metadata trigger evidence only; no exact camera waveform, pause/stage/layer interaction, metadata lifetime/stacking, redirects, helper/projectile/custom-state inheritance, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN fall presentation parity claim
R1 GetHitVar fall metadata required trace gate
  -> synthetic-imported-gethitvar-fall-metadata.json checksum 474fa734 is now required in qa:trace
  -> bounded owner-backed get-hit CNS can branch from state 5100 through GetHitVar(fall.damage) = 70, GetHitVar(fall.kill) = 0, GetHitVar(fall.xvel) = 3, and GetHitVar(fall.yvel) = -6 into state/action 305 before HitFallDamage resolves
  -> pnpm qa:trace passed 229/229 artifacts, 209 required and 20 optional before the fall env-shake gate was added
  -> stored direct-HitDef fall metadata trigger evidence only; no exact fall metadata lifetime/stacking, redirects, helper/projectile/custom-state inheritance, exact VM tick order, visual parity, score movement, or full MUGEN/IKEMEN fall/get-hit parity claim
R1 TeamSide required trace gate
  -> synthetic-imported-teamside.json checksum f55695b7 is now required in qa:trace
  -> bounded imported State -1 CNS can branch on one-on-one side context: TeamSide = 1 plus EnemyNear, TeamSide = 2 route P1 into state/action 299 without HitDef / combat side effects
  -> pnpm qa:trace passed 228/228 artifacts, 208 required and 20 optional before later GetHitVar timing gates were added
  -> one-on-one side-context trigger evidence only; no teams/simul/turns, indexed opponent selection, helper-owned opponent lists, dynamic side ownership, visual parity, score movement, or full TeamSide parity claim
R1 Helper Projectile GetHitVar guarded required trace gate
  -> synthetic-imported-helper-projectile-gethitvar-guarded.json checksum 2b413bd7 is now required in qa:trace
  -> bounded defender-owned guard-hit CNS can branch on GetHitVar(guarded) = 1 after helper-parented Projectile guard, 150 -> 151 guard-hit routing, HitVelSet, and CtrlSet, then route P2 into state/action 304
  -> pnpm qa:trace passed 226/226 artifacts, 206 required and 20 optional before TeamSide and later GetHitVar timing gates were added
  -> helper-parented Projectile guard metadata trigger evidence with helper-local Projectile controller/op telemetry only; no custom-state guarded metadata, exact guard timing/effects, visual parity, score movement, or full Common1/guard parity claim
  -> previous direct HitDef guarded evidence remains synthetic-imported-gethitvar-guarded.json checksum 7c36defb
R1 GetHitVar fall-recover required trace gate
  -> synthetic-imported-gethitvar-fall-recover.json checksum 259b300f remains required in qa:trace
  -> bounded owner-backed get-hit CNS can branch on GetHitVar(fall.recover) = 1 while GetHitVar(fall.recovertime) > 0 and !CanRecover, then route P2 from state 5100 into state/action 301
  -> get-hit metadata trigger evidence only; no exact recovery threshold tables, custom-state lifetime, helper/projectile inheritance, controller-loop timing, visual parity, score movement, or full Common1/get-hit parity claim
R1 AnimElem offset required trace gate
  -> synthetic-imported-animelem-offset.json checksum 4484031d is now required in qa:trace
  -> bounded imported active-state CNS can advance action 200 through authored AIR frame durations [2,6,4], then exit through AnimElem = 2, = 4 into state 300 without HitDef / combat side effects
  -> synthetic-imported-animelem.json checksum 683d9a10 remains required for AnimElem = 2, = 0 into state 299
  -> pnpm qa:trace passes 222/222 artifacts, 202 required and 20 optional
  -> current-actor animation-element trigger evidence only; no AIR loop semantics, negative-duration semantics, state-owner/helper namespaces, persistent-controller timing, visual parity, score movement, or full animation VM parity claim
R1 OwnerMetrics required trace gate
  -> synthetic-imported-owner-metrics.json checksum 1a61aaeb is now required in qa:trace
  -> bounded imported State -1 CNS can branch on current-owner StateNo, Anim, Time, Life, Power, Pos X/Y, and Vel X/Y triggers, then route P1 into state/action 298 without HitDef / combat side effects
  -> RuntimeExpressionContextWorld normalizes the post-transition stateElapsed = -1 sentinel to observable Time/StateTime zero for CNS reads
  -> pnpm qa:trace passes 220/220 artifacts, 200 required and 20 optional
  -> owner metric trigger evidence only; no exact VM tick ordering, helper/team/redirect state namespaces, localcoord scaling, visual parity, score movement, or full trigger parity claim
R1 P2Distance required trace gate
  -> synthetic-imported-p2-distance.json checksum 2c584be0 is now required in qa:trace
  -> bounded imported State -1 CNS can branch on current-opponent spacing triggers P2Dist X/Y and P2BodyDist X/Y, then route P1 into state/action 297 without HitDef / combat side effects
  -> pnpm qa:trace passes 219/219 artifacts, 199 required and 20 optional
  -> two-actor spacing evidence only; no teams/simul, helpers, exact opponent selection, localcoord scaling, push/corner adjustment, visual parity, score movement, or full spacing parity claim
R1 P2StateContext required trace gate
  -> synthetic-imported-p2-state-context.json checksum caf32557 is now required in qa:trace
  -> bounded imported State -1 CNS can branch on current-opponent metadata triggers P2StateType = S and P2MoveType = I, then route P1 into state/action 296 without HitDef / combat side effects
  -> pnpm qa:trace passes 218/218 artifacts, 198 required and 20 optional
  -> two-actor opponent-context evidence only; no teams/simul, helpers, custom-state opponent ownership, exact opponent selection, visual parity, score movement, or full trigger parity claim
R1 StateContext required trace gate
  -> synthetic-imported-state-context.json checksum cb9c3d1e is now required in qa:trace
  -> bounded imported State -1 CNS can branch on owner context triggers ctrl, StateType = S, MoveType = I, and Physics = S, then route P1 into state/action 295 without HitDef / combat side effects
  -> pnpm qa:trace passes 217/217 artifacts, 197 required and 20 optional
  -> trigger-context evidence only; no helper/team/redirect metadata ownership, exact controller-loop ordering, visual parity, score movement, or full trigger parity claim
R1 GameTime required trace gate
  -> synthetic-imported-gametime.json checksum bab573f3 is now required in qa:trace
  -> bounded imported State -1 CNS can delay x until GameTime >= 4, then route P1 into state/action 294 without HitDef / combat side effects
  -> pnpm qa:trace passes 216/216 artifacts, 196 required and 20 optional
  -> this is trigger evidence only; no exact pause accounting, replay/rollback timing, multi-round timer ownership, IKEMEN round-system behavior, visual parity, score movement, or full global timing parity claim
R1 EdgeDistance required trace gate
  -> synthetic-imported-edge-distance.json checksum 785de452 is now required in qa:trace
  -> bounded imported State -1 CNS can evaluate FrontEdgeDist = 340, BackEdgeDist = 300, FrontEdgeBodyDist = 301, and BackEdgeBodyDist = 261 against supplied stage bounds, then route P1 into state/action 293 without HitDef / combat side effects
  -> that checkpoint passed pnpm qa:trace at 215/215 artifacts, 195 required and 20 optional
  -> this is trigger evidence only; no exact camera/screen edge parity, localcoord scaling, push/corner behavior, teams/simul/helper namespace breadth, visual parity, score movement, or full edge-distance parity claim
R1 AnimElemTime required trace gate
  -> synthetic-imported-animelemtime.json checksum 2036557d is now required in qa:trace
  -> bounded imported active-state CNS can advance action 200 through authored AIR frame durations [2,4,4], then exit through AnimElemTime(2) = 2 into state 292 without HitDef / combat side effects
  -> that checkpoint passed pnpm qa:trace at 214/214 artifacts, 194 required and 20 optional
  -> this is trigger evidence only; no exact AIR loop semantics, invalid-element bottom values, negative-duration semantics, state-owner/helper namespaces, persistent-controller timing, visual parity, score movement, or full animation VM parity claim
R1 AnimTime required trace gate
  -> synthetic-imported-animtime.json checksum 9e42b546 is now required in qa:trace
  -> bounded imported active-state CNS can keep P1 in state 200 for the authored AIR duration, then exit through AnimTime = 0 into state 291 without HitDef / combat side effects
  -> pnpm qa:trace passes 213/213 artifacts, 193 required and 20 optional
  -> this is trigger evidence only; no exact AIR negative-duration semantics, looped-action semantics, state-owner/helper namespaces, persistent-controller timing, visual parity, score movement, or full animation VM parity claim
R1 SelfAnimExist required trace gate
  -> synthetic-imported-selfanimexist.json checksum 99930032 is now required in qa:trace
  -> bounded imported State -1 routing can branch on own AIR action existence: SelfAnimExist(200) routes, missing action 9999 fails closed, and P1 enters state 290
  -> pnpm qa:trace passes 212/212 artifacts, 192 required and 20 optional
  -> this is trigger evidence only; no redirected animation-owner lookup, helper/parent/root lookup, common/FightFX namespace parity, visual parity, score movement, or full trigger parity claim
R2 RuntimeMatchEnvShakeBridgeWorld ownership extraction
  -> RuntimeMatchEnvShakeBridgeWorld now owns bounded match-level EnvShake and FallEnvShake controller handoff for active controller routes
  -> PlayableMatchRuntime delegates controller source, typed operation data when available, runtime tick, telemetry hooks, and RuntimeEnvShakeWorld event emission through the named bridge
  -> focused RuntimeMatchEnvShakeBridgeSystem coverage proves typed EnvShake forwarding, FallEnvShake hit-fall metadata emission/clearing, telemetry forwarding, and no-pending-fall no-event behavior
  -> no exact camera waveform, pause/stage/layer timing, helper/redirect ownership breadth, renderer parity, visual parity, score movement, or full presentation parity claim
R2 RuntimeMatchEnvColorBridgeWorld ownership extraction
  -> RuntimeMatchEnvColorBridgeWorld now owns bounded match-level EnvColor controller handoff for active, pause, and hitpause ignored-controller routes
  -> PlayableMatchRuntime delegates controller source, typed envcolor operation data when available, runtime tick, and RuntimeEnvColorWorld event emission through the named bridge
  -> focused RuntimeMatchEnvColorBridgeSystem coverage proves typed-operation forwarding, tick preservation, stage-flash projection, and zero-time no-event behavior
  -> no exact EnvColor blend math, layer/window ordering, pause layering/timing, renderer parity, visual parity, score movement, or full presentation parity claim
R2 RuntimeFighterStateWorld ownership extraction
  -> RuntimeFighterStateWorld now owns bounded fighter runtime-state construction for resource maxima, damage multipliers, initial action/control/resource state, command buffers, contact memory, telemetry buckets, injected world references, deterministic RNG seed, and lazy runtime-program compilation
  -> PlayableMatchRuntime delegates P1/P2 construction while still supplying stage starts, actor ids, definitions, and injected match worlds
  -> focused RuntimeFighterStateSystem coverage proves injected-world preservation, bounded constants, initial runtime state, p2 priority, native no-program behavior, and command/contact setup
  -> this is R2 ownership cleanup only; no exact player lifecycle parity, helper/custom-state clone breadth, team/simul roster ownership, intro/round lifecycle, visual parity, score movement, or full actor registry parity claim
R2 RuntimeMatchResetWorld ownership extraction
  -> RuntimeMatchResetWorld now owns bounded match reset orchestration for round/pause/env/effect resets, in-place fighter recreation, helper TargetState handler reattachment, and reset logging
  -> PlayableMatchRuntime delegates reset lifecycle while still supplying fighter construction, stage starts, injected worlds, and concrete field assignment
  -> focused RuntimeMatchResetSystem coverage proves reset order, actor identity preservation, helper handler reattachment, and log handoff; PlayableMatchRuntime coverage preserves external effect-store reset behavior
  -> this is R2 ownership cleanup only; no exact round-flow parity, continue/round intro semantics, helper/custom-state reset breadth, screenpack/lifebar reset behavior, visual parity, score movement, or full match lifecycle parity claim
R2 RuntimeHelperTargetStateWorld handler binding extraction
  -> RuntimeHelperTargetStateWorld now owns bounded helper TargetState handler attach/re-attach wiring for match actors
  -> PlayableMatchRuntime delegates constructor/reset callback binding through the same world that already handles helper owner validation, target lookup, unavailable-state no-op, and owner-backed target state entry
  -> focused RuntimeHelperTargetStateSystem coverage proves owner-specific handlers replace stale handlers and forward owner/helper/target/state id context
  -> this is R2 ownership cleanup only; no helper-owned custom-state table parity, throws, teams/simul, multi-target/helper-owned opponent selection, exact helper TargetState timing, visual parity, score movement, or full Helper VM parity claim
R2 RuntimeFrameWorld ownership extraction
  -> RuntimeFrameWorld now owns bounded current AIR frame lookup plus cloned Clsn1/Clsn2 projection for runtime and snapshot consumers
  -> PlayableMatchRuntime delegates current-frame reads, guard-distance hurtbox fallback, and AfterImage sample frame reads through the named boundary while preserving frame-Clsn1 ReversalDef handoff
  -> RuntimeSnapshotWorld delegates active move hitbox, frame hitbox, and missing-frame default hurtbox projection through the same boundary
  -> this is R2 ownership cleanup only; no exact collision priority, frame timing, guard-distance threshold, rotated/scaled box semantics, helper/team/redirect collision ownership, renderer parity, score movement, or full collision VM parity claim
R2 RuntimeAfterImageSampleWorld ownership extraction
  -> RuntimeAfterImageSampleWorld now owns bounded AfterImage sample projection from actor runtime state plus current AIR frame
  -> PlayableMatchRuntime delegates cloned position, facing, self/state-owner sprite owner metadata, and sprite group/index/offset sample creation before RuntimeSpriteEffectWorld captures the sample
  -> focused RuntimeAfterImageSampleSystem coverage proves no-frame fail-closed behavior, clone isolation, self owner metadata, and custom-state state-owner metadata
  -> this is R2 ownership cleanup only; no exact ghost-trail sampling cadence, material/blend parity, helper/team/redirect presentation ownership, renderer parity, score movement, or full presentation VM parity claim
R2 RuntimeControllerEvaluationContextWorld ownership extraction
  -> RuntimeControllerEvaluationContextWorld now owns bounded StateControllerExecutor context creation from PlayableMatchRuntime
  -> owner const reads, actor hitpause reads, actor random callbacks, and stage-time forwarding route through a named context factory before active runtime-controller dispatch
  -> focused RuntimeControllerEvaluationContextSystem coverage proves owner/actor/tick callback forwarding
  -> this is R2 ownership cleanup only; no full passive-controller parity, exact CNS controller-loop timing, helper/team/redirect context scopes, exact random stream parity, visual parity, score movement, or full controller VM parity claim
R2 RuntimeDispatchEvaluationWorld ownership extraction
  -> RuntimeDispatchEvaluationWorld now owns bounded dynamic active-controller dispatch-param fallback from PlayableMatchRuntime
  -> compiled numeric/Boolean values short-circuit, dynamic fallback expressions request a context from RuntimeExpressionContextWorld, numeric results are finite/truncated, and Boolean params use numeric truthiness
  -> focused RuntimeDispatchEvaluationSystem coverage proves compiled-value precedence, actor/opponent/owner/tick forwarding, numeric fallback evaluation, Boolean truthiness, and fail-closed missing/non-numeric expressions
  -> this is R2 ownership cleanup only; no full dynamic-param parity, persistent-controller timing, exact CNS controller tick order, helper/team/redirect parameter scopes, visual parity, score movement, or full controller VM parity claim
R2 RuntimeTriggerEvaluationWorld ownership extraction
  -> RuntimeTriggerEvaluationWorld now owns bounded normalized TriggerIr expression evaluation from PlayableMatchRuntime
  -> actor/opponent/owner/tick forwarding, context-factory handoff, raw expression result capture, and Boolean pass/fail projection route through the named world
  -> focused RuntimeTriggerEvaluationSystem coverage proves context forwarding, normalized expression use, and false zero-result behavior
  -> this is R2 ownership cleanup only; no full expression language parity, persistent-controller timing, exact CNS trigger tick order, helper/team/redirect trigger scopes, visual parity, score movement, or full trigger VM parity claim
R2 RuntimeTriggerGateWorld ownership extraction
  -> RuntimeTriggerGateWorld now owns bounded CNS trigger grouping/order from PlayableMatchRuntime
  -> triggerall AND preconditions, numbered triggerN OR groups, no-numbered-trigger pass-through, and short-circuit ordering route through the named world
  -> focused RuntimeTriggerGateSystem coverage proves triggerall failure skips numbered groups, first passing numbered group wins, no-numbered groups pass after triggerall, all-failing numbered groups fail, and actor/opponent/owner/tick callback context is forwarded
  -> this is R2 ownership cleanup only; no full expression language parity, persistent-controller timing, exact CNS trigger tick order, helper/team/redirect trigger scopes, visual parity, score movement, or full trigger VM parity claim
R2 RuntimeAutoGuardStartWorld ownership extraction
  -> RuntimeAutoGuardStartWorld now owns bounded imported auto guard-start orchestration from PlayableMatchRuntime
  -> imported-defender filtering, current input/current move/hitpause/hitstun eligibility handoff, InGuardDist gating, guard-start state selection/availability, clear-state-owner entry, and guard-start runtime mutation route through the named world
  -> focused RuntimeAutoGuardStartSystem coverage proves successful imported guard start plus non-imported, ineligible, out-of-distance, and unavailable-state fail-closed paths
  -> this is R2 ownership cleanup only; no exact proximity-guard timing, guard-end/effects/audio, helper/team/redirect guard ownership, visual parity, score movement, or full guard VM parity claim
R2 RuntimeActiveControllerScanWorld ownership extraction
  -> RuntimeActiveControllerScanWorld now owns bounded active-state controller scanning from PlayableMatchRuntime
  -> owner/state-owner selection, imported/owner-backed guard, active state lookup, ignorehitpause filtering, trigger gating, controller iteration, and stop/continue flow after state-changing controllers route through the named world
  -> focused RuntimeActiveControllerScanSystem coverage proves owner-backed scanning, hitpause-only filtering, stop-after-ChangeState flow, missing-state skip, non-imported skip, and failed-trigger no-op
  -> this is R2 ownership cleanup only; no exact CNS VM tick order, persistent controller semantics, helper/team/redirect controller scopes, full controller-loop parity, visual parity, score movement, or full active-controller parity claim
R2 RuntimeActiveControllerDispatchWorld ownership extraction
  -> RuntimeActiveControllerDispatchWorld now owns bounded active-controller route orchestration from PlayableMatchRuntime after scan/trigger pass
  -> route order is state/animation mutation first, shared runtime-controller execution second, active side-effect dispatch third, and unsupported fail-soft dispatch last
  -> focused RuntimeActiveControllerDispatchSystem coverage proves state-first stop, runtime-controller handoff, side-effect handoff, and unsupported pass-through
  -> this is R2 ownership cleanup only; no exact CNS VM tick order, persistent-controller semantics, helper/team/redirect controller scopes, side-effect ordering parity, missing-action fallback parity, visual parity, score movement, or full active-controller parity claim
R2 RuntimeActiveStateDispatchWorld ownership extraction
  -> RuntimeActiveStateDispatchWorld now owns bounded active-state ChangeState/SelfState and ChangeAnim/ChangeAnim2 dispatch mutation from PlayableMatchRuntime
  -> dynamic numeric/boolean param resolution, controller telemetry, state-entry handoff, optional ctrl mutation, state-owner animation source selection, and elem/elemtime handoff route through the named world while the match runtime still owns scan order, trigger filtering, side-effect dispatch, and concrete callbacks
  -> focused RuntimeActiveStateDispatchSystem coverage proves dynamic SelfState with anim/ctrl, ChangeAnim2 owner/elem routing, unresolved state/animation fail-closed behavior, and non-state dispatch pass-through
  -> this is R2 ownership cleanup only; no exact CNS VM tick order, persistent controller semantics, helper/team/redirect controller scopes, missing-action fallback parity, full ChangeState/ChangeAnim VM parity, visual parity, score movement, or full active-controller parity claim
R2 RuntimeActiveSideEffectDispatchWorld ownership extraction
  -> RuntimeActiveSideEffectDispatchWorld now owns bounded active-state side-effect dispatch routing from PlayableMatchRuntime
  -> HitDef/ReversalDef/Width/FallEnvShake/Pause/Sound/EnvColor/EnvShake/contact singleton routes plus sprite-effect, effect-spawn, and Target*/BindToTarget grouped routes are classified through one named router before existing controller worlds execute them
  -> focused RuntimeActiveSideEffectDispatchSystem coverage proves every current side-effect route maps to the expected handler, missing hooks fail soft, and non-side-effect dispatches pass through
  -> this is R2 ownership cleanup only; no exact CNS VM tick order, persistent controller semantics, helper/team/redirect controller scopes, side-effect ordering parity, target/combat/presentation semantic parity, visual parity, score movement, or full active-controller parity claim
R2 RuntimeTargetStateEntryWorld ownership extraction
  -> RuntimeTargetStateEntryWorld now owns bounded active-state TargetState state-entry routing from PlayableMatchRuntime
  -> existing owner-backed custom-state ownership is preserved, the controller actor becomes the owner otherwise, unavailable target states fail closed, and successful entries route the target into owner-backed state data through explicit hooks
  -> focused RuntimeTargetStateEntrySystem coverage proves controller-owned entry, owner-backed custom-state preservation, and unavailable-state no-op
  -> this is R2 ownership cleanup only; no exact TargetState tick order, throws, helper/team/multi-target target state selection, full custom-state parity, visual parity, score movement, or full TargetState parity claim
R2 RuntimeHelperTargetStateWorld ownership extraction
  -> RuntimeHelperTargetStateWorld now owns bounded helper-owned TargetState state-entry routing from PlayableMatchRuntime
  -> helper/owner identity is checked before target lookup, missing targets fail closed, unavailable target states fail closed, and successful entries route the target into owner-backed state data through explicit state-entry hooks
  -> focused RuntimeHelperTargetStateSystem coverage proves owner-backed entry, owner-mismatch skip, missing-target no-op, and unavailable-state no-op
  -> this is R2 ownership cleanup only; no helper-owned custom state table parity, throws, teams/simul, multi-target/helper-owned opponent selection, exact helper TargetState timing, visual parity, score movement, or full helper TargetState parity claim
R2 RuntimeHelperProjectileTargetWorld ownership extraction
  -> RuntimeHelperProjectileTargetWorld now owns bounded helper-parented Projectile target-memory mirroring from PlayableMatchRuntime
  -> owner-parented Projectile contacts skip, helper-parented Projectile contacts resolve the parent Helper by runtime serial, missing helpers fail closed, and successful contacts write the Projectile target id into helper-local target memory through TargetSystem
  -> focused RuntimeHelperProjectileTargetSystem coverage proves mirror, owner-projectile skip, and missing-helper no-op behavior
  -> this is R2 ownership cleanup only; no exact helper Projectile target lifetime, helper-owned custom-state tables, teams/simul, multi-target/helper-owned opponent selection, exact combat/effect tick order, visual parity, score movement, or full helper Projectile parity claim
R2 RuntimeStateEntryRouteWorld ownership extraction
  -> RuntimeStateEntryRouteWorld now owns bounded State -1 ChangeState route selection from PlayableMatchRuntime
  -> state-entry iteration, non-ChangeState filtering, trigger gating, dynamic state-id resolver handoff, route telemetry, authored state-move selection, and raw state-entry fallback route through that world
  -> focused RuntimeStateEntryRouteSystem coverage proves route-to-move, route-to-state, failed trigger / unresolved state-id no-op scans, dynamic expression handoff, and empty-list skip behavior
  -> this is R2 ownership cleanup only; no exact State -1 VM order, persistent controller semantics, helper/team/redirect command ownership, full CNS VM parity, score movement, or full command-routing parity claim
R2 RuntimeHelperCombatWorld ownership extraction
  -> RuntimeHelperCombatWorld now owns bounded helper-owned direct HitDef contact resolution from PlayableMatchRuntime
  -> helper iteration, direct-combat actor projection, active/contact checks, HitBy/NotHitBy reject logging, direct hit/guard handoff, imported default get-hit/guard-state hooks, helper target memory, contact presentation, and helper state sync route through that world
  -> focused RuntimeHelperCombatSystem coverage proves hit, guard, target-memory, presentation telemetry, state hooks, and reject no-op behavior
  -> this is R2 ownership cleanup only; no exact helper hitpause/tick order, helper-owned custom-state tables, multi-target/team helper combat, helper-owned Projectile combat/contact presentation, visual parity, score movement, or full Helper VM parity claim
R2 player Projectile default Target-controller gate
  -> synthetic-imported-projectile-default-target-controllers.json checksum 1c1a3e77 is now required
  -> player state 200 spawns Projectile with omitted projid/id, so runtime target memory defaults to id 0 without direct HitDef controller evidence in this isolated fixture
  -> Projectile hits P2, records owner target link p1 -> p2 / 0, then delayed owner-local TargetLifeAdd/TargetPowerAdd/TargetVelSet/TargetVelAdd/TargetFacing/TargetBind/TargetDrop execute from target memory
  -> target-link/effect evidence includes projectile anim 915, lifecycle spawn/remove, effectId 0, hasHit true, removalReason hit, terminalReason hit, TargetBind offset 36,-12, final P1 targetCount 0, and final P2 life 949 / power 40
  -> pnpm qa:trace passes 208/208 artifacts, 188 required and 20 optional
  -> no Target* mutation mixing, helper-owned custom state tables, teams/simul, multi-target selection, exact target lifetime/tick order, visual parity, score movement, or full Projectile target parity claim
R2 player Projectile default TargetState gate
  -> synthetic-imported-projectile-default-targetstate.json checksum 8f35f1fa is now required
  -> player state 200 spawns Projectile with omitted projid/id, so runtime target memory defaults to id 0 without direct HitDef controller evidence in this isolated fixture
  -> Projectile hits P2, records owner target link p1 -> p2 / 0, then delayed owner-local TargetState value 888 routes P2 through attacker-owned state data 888 -> 889 before SelfState returns P2 to state 0/control
  -> target-link/effect evidence includes projectile anim 914, lifecycle spawn/remove, effectId 0, hasHit true, removalReason hit, terminalReason hit, required ChangeState/TargetState/SelfState execution, custom-owner P2 frames, and final P2 life 969
  -> that checkpoint passed pnpm qa:trace at 207/207 artifacts, 187 required and 20 optional
  -> no Target* mutation mixing, helper-owned custom state tables, throws, teams/simul, multi-target selection, exact target lifetime/tick order, exact final-animation parity, visual parity, score movement, or full Projectile default TargetState parity claim
R2 player Projectile TargetState gate
  -> synthetic-imported-projectile-targetstate.json checksum dd1c7962 is now required
  -> player state 200 spawns Projectile id 77 without direct HitDef controller evidence in this isolated fixture
  -> Projectile hits P2, records owner target link p1 -> p2 / 77, then delayed owner-local TargetState value 888 routes P2 through attacker-owned state data 888 -> 889 before SelfState returns P2 to state 0/control
  -> target-link/effect evidence includes projectile anim 913, lifecycle spawn/remove, effectId 77, hasHit true, removalReason hit, terminalReason hit, required ChangeState/TargetState/SelfState execution, custom-owner P2 frames, and final P2 life 969
  -> pnpm qa:trace passes 206/206 artifacts, 186 required and 20 optional
  -> no Target* mutation mixing, helper-owned custom state tables, throws, teams/simul, multi-target selection, exact target lifetime/tick order, exact final-animation parity, visual parity, score movement, or full Projectile TargetState parity claim
R2 player Projectile Target-controller gate
  -> synthetic-imported-projectile-target-controllers.json checksum 8c7bd6c2 is now required
  -> player state 200 spawns Projectile id 77 without direct HitDef controller evidence in this isolated fixture
  -> Projectile hits P2, records owner target link p1 -> p2 / 77, then later TargetLifeAdd/TargetPowerAdd/TargetVelSet/TargetVelAdd/TargetFacing/TargetBind/TargetDrop execute from owner-local target memory
  -> target-link/effect evidence includes projectile anim 912, lifecycle spawn/remove, effectId 77, hasHit true, removalReason hit, terminalReason hit, TargetBind offset 36,-12, final P1 targetCount 0, and final P2 life 949 / power 40
  -> pnpm qa:trace passes 205/205 artifacts, 185 required and 20 optional
  -> no Target* mutation mixing, helper-owned projectile target controllers beyond existing helper gates, teams/simul, multi-target selection, exact target lifetime/tick order, visual parity, score movement, or full Projectile target parity claim
R2 player Projectile target redirect gate
  -> synthetic-imported-projectile-target-redirect.json checksum cd099094 is now required
  -> player state 200 spawns Projectile id 77 without direct HitDef controller evidence in this isolated fixture
  -> Projectile hits P2, records owner target link p1 -> p2 / 77, branches P1 through NumTarget(77) plus Target(77), Life <= 969, and reaches state/action 277
  -> target-link/effect evidence includes projectile anim 911, lifecycle spawn/remove, effectId 77, hasHit true, removalReason hit, terminalReason hit, and final P2 life 969
  -> pnpm qa:trace passes 204/204 artifacts, 184 required and 20 optional
  -> no Target* mutation mixing, helper-owned projectile targets, teams/simul, multi-target selection, exact target lifetime/tick order, visual parity, score movement, or full Projectile target parity claim
R2 helper Projectile bare Target gate
  -> synthetic-imported-helper-projectile-bare-target.json checksum 8c9129c1 is now required
  -> helper state 1200 spawns owner-side Projectile id 8863, mirrors target memory into the Helper, branches through NumTarget(8863) plus bare Target, Life, and reaches helper state 1242 / anim 978
  -> target-link evidence includes p1 -> p2 / 8863, p1-helper-0 -> p2 / 8863, projectile parentId p1-helper-0, projectile effectId 8863, helper targetCount 1, final P2 life 982, S5,11, and FightFX F7017
  -> that checkpoint passed pnpm qa:trace at 203/203 artifacts, 183 required and 20 optional
  -> previous helper Projectile default TargetState proof remains required: synthetic-imported-helper-projectile-default-targetstate.json checksum 918c42a1
  -> previous helper Projectile explicit TargetState proof remains required: synthetic-imported-helper-projectile-targetstate.json checksum b12e1cb3
  -> previous helper Projectile default Target-controller proof remains required: synthetic-imported-helper-projectile-default-target-controllers.json checksum 0c4c69ae
  -> previous helper Projectile explicit Target-controller proof remains required: synthetic-imported-helper-projectile-target-controllers.json checksum 58688be8
  -> previous helper TargetState proof remains required: synthetic-imported-helper-targetstate.json checksum 011633b8
  -> previous helper direct-HitDef Target-controller proof remains required: synthetic-imported-helper-target-controllers.json checksum 61f4c61e
  -> previous helper bare Target, Life proof remains required: synthetic-imported-helper-bare-target.json checksum 15f3c1db
  -> previous player bare Target, Life proof remains required: synthetic-imported-bare-target-redirect.json checksum f9c90aa8
  -> previous default Target(0), Life proof remains required: synthetic-imported-default-target-redirect.json checksum d43caabf
  -> previous default NumTarget(0) proof remains required: synthetic-imported-default-numtarget.json checksum 5869ebbd
  -> previous helper direct default-target proof remains required: synthetic-imported-helper-default-target.json checksum e1bcced0
  -> previous helper Projectile default-target proof remains required: synthetic-imported-helper-projectile-default-target.json checksum b0daddf6
  -> previous helper Projectile explicit-id proof remains required: synthetic-imported-helper-projectile-target.json checksum 49261b53
  -> previous helper direct-target proof remains required: synthetic-imported-helper-target.json checksum 68f95b67
  -> previous helper direct-combat proof remains required: synthetic-imported-helper-hitdef.json checksum 89f9e876
  -> no helper-owned custom state tables, throws, teams/simul, multi-target/helper-owned opponent selection, exact target lifetime/tick order, exact helper hitpause/tick order, exact helper HitDef/Projectile lifetime parity, visual parity, score movement, or full target/combat/projectile parity claim
R1 official-style air recovery sequence gate
  -> synthetic-imported-default-fall-official-air-recovery.json checksum b0363be9 is now required
  -> official-style synthetic Common1 air recovery routes 5050 -> 5210 -> 52 -> 0 after command = "recovery" while airborne
  -> actor-frame sequence proves fall.recovertime drops from positive to 0 before air recovery, 5210 exposes bounded recovery velocity telemetry, 52 observes y = 0 landing, and final P2 returns to idle/control
  -> controller/order evidence requires VelAdd, ChangeState, VelSet, HitFallSet, CtrlSet plus typed kinematic/hitfall/resource operations
  -> that checkpoint passed qa:trace at 187/187 artifacts, 167 required and 20 optional
  -> no exact fall.recovertime tables, velocity math, controller-loop timing, public KFM support, score movement, visual parity, or full Common1 recovery parity claim
R1 official-style ground recovery sequence gate
  -> synthetic-imported-default-fall-official-ground-recovery.json checksum 74b72495 remains required
  -> official-style synthetic Common1 ground recovery routes 5050 -> 5200 -> 5201 -> 52 -> 0 after command = "recovery" near ground
R2 helper-local ProjContactTime trace gate
  -> synthetic-imported-helper-projcontact.json checksum 4dcbdd25 is now required
  -> helper-local ProjContact(8855) and ProjContactTime(8855) >= 1 branch after helper-parented owner-side Projectile generic contact
  -> visual Helper route 1200 -> 1220 -> 1221 / anims 949 and 950 follows owner-side Projectile anim 951 with parentId p1-helper-0
  -> focused EffectActorSystem coverage proves same-id player-owned Projectile contact stays ignored while helper-parented Projectile contact triggers the helper branch after contact age advances
  -> that checkpoint passed qa:trace at 185/185 artifacts, 165 required and 20 optional
  -> previous helper-local ProjGuarded checksum d2e2f20d, ProjHit checksum 2d9a281e, ModifyProjectile checksum 09d3f7e4, and NumProj checksum 3312a554 remain required helper-projectile proofs
  -> no helper-owned Projectile combat/contact presentation, helper TargetState breadth/multi-target parity beyond the owner-backed direct-HitDef gate, exact ProjContact/ProjHit/ProjGuarded tick order or lifetime, exact projectile namespaces/scopes, dynamic ids/params, teams, visual parity, score movement, or full Helper/Projectile parity claim
R1 official-style recovery trace promotion
  -> synthetic-imported-default-fall-official-recovery-threshold.json checksum 86804271 is now required
  -> synthetic-imported-default-fall-official-recovery-too-early.json checksum ef945ff5 is now required
  -> no exact fall.recovertime tables, velocity math, controller-loop tick order, public KFM support, score movement, or full Common1 recovery parity claim
R2 RuntimeCombatResolutionWorld ownership extraction
  -> RuntimeCombatResolutionWorld now owns bounded active direct/projectile contact orchestration from PlayableMatchRuntime
  -> direct eligibility, reversal checks, HitBy/NotHitBy rejection, HitOverride hooks, target-memory remembering, hit/guard result handoff, projectile callbacks, received-damage/contact memory, and contact-presentation emission route through that world
  -> PlayableMatchRuntime still supplies runtime tick, frame hurtboxes, state-entry hooks, trigger/controller order, active effect stores, and the concrete actor roster
  -> focused RuntimeCombatResolutionSystem coverage proves direct target/contact/presentation ordering and projectile callback routing through target/contact/presentation/damage hooks
  -> no helper-owned combat, projectile target ownership, exact direct/projectile tick order, multi-target/team behavior, exact ReversalDef/HitOverride priority, visual parity, or score claim
R2 RuntimeTargetWorld candidate-resolution ownership
  -> RuntimeTargetWorld.resolveCandidates now owns bounded target-candidate filtering from live target memory
  -> Target* / BindToTarget controller application and active TargetBind / BindToTarget position application pass through that filter before mutation
  -> PlayableMatchRuntime still owns trigger ordering, state validation, the concrete actor roster, helper/projectile actor materialization, and combat context
  -> focused TargetSystem coverage proves actor-id and target-id filtering plus mutation only against remembered targets
  -> no helper/projectile target ownership, exact team/multi-target selection, exact target lifetime, throw binding, exact bind tick order, visual parity, or score claim
R2 RuntimeExpressionContextWorld ownership extraction
  -> RuntimeExpressionContextWorld now owns bounded active runtime ExpressionContext creation for imported triggers and dynamic controller-param fallback
  -> PlayableMatchRuntime delegates target redirects, contact/projectile/effect count reads, command/const/state/anim/hitvar reads, HitDefAttr, HitPauseTime/HitOver/HitShakeOver, InGuardDist, random/stage/time wiring to that world
  -> PlayableMatchRuntime still owns active-state dispatch, next-random source, animation timing callbacks, and exact VM timing
  -> focused RuntimeExpressionContextSystem coverage proves numeric reads, Target redirect, compiled trigger evaluation, const/state/HitVar helpers, and shared context creation
  -> no full expression language parity, composite HitDefAttr parity, helper/team/redirect mutation, exact VM timing, visual parity, or score claim
R2 RuntimeStateTransitionControllerWorld ownership extraction
  -> RuntimeStateTransitionControllerWorld now owns bounded passive ChangeState/SelfState setup in the basic StateControllerExecutor path
  -> StateControllerExecutor delegates raw-param value/stateno expression fallback, previous-state metadata writes, frame/time reset, optional ctrl, and missing-value reporting to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> RuntimeStateEntryWorld and PlayableMatchRuntime still own active-state entry, concrete state/action lookup, custom-state owner selection, and controller tick order
  -> focused StateTransitionControllerSystem coverage proves expression fallback, metadata writes, reset, ctrl, missing-value no-op/reporting, unchanged-state timing reset, and executor routing
  -> no exact ChangeState/SelfState tick-order parity, persistent controller semantics, redirects/helper/team ownership, full custom-state breadth, state-entry VM parity, or score claim
R2 RuntimeAnimationControllerWorld ownership extraction
  -> RuntimeAnimationControllerWorld now owns bounded passive ChangeAnim/ChangeAnim2 setup in the basic StateControllerExecutor path
  -> StateControllerExecutor delegates raw-param animation retargeting, self/state-owner source marking, reset, and bounded elem/elemtime seeding to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> PlayableMatchRuntime still owns active-state action lookup, state-owner action selection, and controller tick order
  -> focused AnimationControllerSystem coverage proves expression fallback, known-AIR elem/elemtime seeding, clamped/fallback element behavior, missing-value no-op, and executor routing
  -> no missing-action fallback, full active-state elem/elemtime parity, redirects/helper/team ownership, full state-owner namespace behavior, exact animation-source parity, or score claim
R2 RuntimeKinematicControllerWorld ownership extraction
  -> RuntimeKinematicControllerWorld now owns bounded passive VelSet/VelAdd/VelMul/HitVelSet/PosSet/PosAdd/Gravity setup
  -> StateControllerExecutor delegates typed kinematic:* operations and raw-param fallback mutations to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> RuntimeKinematicsWorld still owns per-frame actor integration, sandbox gravity, ground snap, and landing hooks
  -> focused KinematicControllerSystem coverage proves typed setup, raw expression fallback, default-axis behavior, hit-velocity flags, gravity defaults, and executor routing
  -> no exact MUGEN/IKEMEN physics, velocity tick order, yaccel constants, helper/team/redirect ownership, full kinematic VM parity, or score claim
R2 RuntimeBoundsControllerWorld ownership extraction
  -> RuntimeBoundsControllerWorld now owns bounded passive PlayerPush/PosFreeze/ScreenBound setup
  -> StateControllerExecutor delegates typed collision:playerpush/bounds:* operations and raw-param fallback mutations to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> RuntimeActorConstraintWorld still owns one-frame reset/projection, stage clamp, and body-push separation
  -> focused BoundsControllerSystem coverage proves typed setup, raw defaults, raw expression fallback, and executor routing
  -> no exact player/edge collision, team/helper push behavior, screen-edge/camera parity, PosFreeze tick order, full constraint VM parity, or score claim
R2 RuntimeHitFallControllerWorld ownership extraction
  -> RuntimeHitFallControllerWorld now owns bounded passive HitFallVel/HitFallDamage/HitFallSet mutation
  -> StateControllerExecutor delegates typed hitfall operations and raw-param fallback mutations to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> focused HitFallControllerSystem coverage proves typed setup, raw expression fallback, stored fall velocity, fall.defence_up scaling, and nonlethal fall damage
  -> no exact Common1 controller-loop order, helper/team/redirect ownership, exact recovery thresholds/velocity math, full fall/get-hit parity, or score claim
R2 RuntimeStateTypeWorld ownership extraction
  -> RuntimeStateTypeWorld now owns bounded passive StateTypeSet stateType/moveType/physics setup
  -> StateControllerExecutor delegates typed metadata operations and raw-param fallback mutations to the world
  -> executor still owns controller routing and broad runtime-controller execution
  -> focused StateTypeSystem coverage proves typed setup, raw case-normalized fallback, and invalid raw no-op behavior
  -> no dynamic metadata expressions, helper/team/redirect ownership, exact physics/tick-order interactions, full StateTypeSet parity, or score claim
R2 RuntimeDamageScaleWorld ownership extraction
  -> RuntimeDamageScaleWorld now owns bounded passive AttackMulSet/DefenceMulSet multiplier setup
  -> StateControllerExecutor delegates typed damage-scale operations and raw-param fallback mutations to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> focused DamageScaleSystem coverage proves typed setup, raw expression fallback, clamp behavior, and no-value no-op behavior
  -> no exact scaling stack/order, helper/projectile/custom-state/guard edge cases, redirect ownership, full damage-scale parity, or score claim
R2 RuntimeHitDefenseWorld ownership extraction
  -> RuntimeHitDefenseWorld now owns bounded passive HitBy/NotHitBy/HitOverride slot setup/removal
  -> StateControllerExecutor delegates typed eligibility/hitoverride operations and raw-param fallback mutations to the world
  -> executor still owns controller routing, expression context creation, and broad runtime-controller execution
  -> focused HitDefenseSystem coverage proves typed and raw setup/removal semantics
  -> no exact attr grammar, slot priority, helper/custom-state redirect breadth, forceair/forceguard edge order, full defensive-slot parity, or score claim
R2 RuntimeHitDefControllerDispatchWorld ownership extraction
  -> RuntimeHitDefControllerDispatchWorld now owns bounded active-state HitDef activation dispatch into the current attack payload
  -> PlayableMatchRuntime delegates controller telemetry, typed hitdef operation selection, raw fallback attack params, fired-HitDef dedupe, current-frame Clsn1 hitbox handoff, currentMove mutation, attack movetype/control writes, and operation telemetry
  -> match runtime still owns trigger filtering, active-state order, current-frame lookup, direct/projectile contact resolution, Common1/custom-state routing, and target/reversal consequences
  -> focused HitDefSystem coverage proves activation payloads and duplicate suppression through the dispatch boundary
  -> no exact HitDef trigger lifetime, contact ordering, multi-hit windows, helper/projectile/custom-state ownership, broad attr grammar, full HitDef VM parity, or score claim
R2 RuntimeReversalControllerDispatchWorld ownership extraction
  -> RuntimeReversalControllerDispatchWorld now owns bounded active-state ReversalDef dispatch into RuntimeReversalWorld
  -> PlayableMatchRuntime delegates controller telemetry, typed reversaldef operation selection, raw fallback activation payload, activation handoff, and operation telemetry
  -> match runtime still owns trigger filtering, active-state order, current-frame hitbox lookup, and later counter-result state routing
  -> focused ReversalSystem coverage proves controller/op telemetry plus activation through the dispatch boundary
  -> no exact ReversalDef priority, guard/projectile/helper/custom-state counter breadth, attr grammar, trigger lifetime, hitpause/tick order, full ReversalDef VM parity, or score claim
R2 RuntimeEffectSpawnControllerDispatchWorld ownership extraction
  -> RuntimeEffectSpawnControllerDispatchWorld now owns bounded active-state Explod/RemoveExplod/ModifyExplod/Helper/Projectile/ModifyProjectile dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed effect operation selection, spawn/count mutation handoff, and success-gated operation telemetry through RuntimeEffectSpawnWorld
  -> match runtime still owns trigger filtering, active-state order, actor/opponent context, effect actor world ownership, and exact spawn/combat ordering
  -> focused EffectSpawnSystem coverage proves successful Explod telemetry/mutation and failed ModifyExplod no-operation gating through the dispatch boundary
  -> no exact effect spawn tick order, helper-owned effect namespaces, dynamic effect params, helper-owned projectile combat/contact/target memory, full effect/helper/projectile VM parity, or score claim
R2 RuntimeFallEnvShakeControllerDispatchWorld ownership extraction
  -> RuntimeFallEnvShakeControllerDispatchWorld now owns bounded active-state FallEnvShake side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed fallenvshake operation selection, fall-shake event handoff, hitFall.envShake cleanup, and operation telemetry through RuntimeEnvShakeWorld
  -> match runtime still owns trigger filtering, active-state order, actor/world ownership, and upstream HitDef fall metadata
  -> focused EnvShakeSystem coverage proves FallEnvShake telemetry/mutation through the dispatch boundary
  -> no exact waveform, pause/stage/layer interaction, helper/redirect ownership, full presentation parity, or score claim
R2 RuntimeActorConstraintControllerDispatchWorld ownership extraction
  -> RuntimeActorConstraintControllerDispatchWorld now owns bounded active-state Width side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed collision:width operation selection, operation telemetry, and body-width mutation handoff through RuntimeActorConstraintWorld
  -> match runtime still owns trigger filtering, active-state order, per-frame constraint reset, stage clamp, and body-push ordering
  -> focused ActorConstraintSystem coverage proves Width telemetry/mutation through the dispatch boundary
  -> no exact player/edge collision, team/helper push behavior, screen-edge/camera parity, Width edge semantics, full constraint VM parity, or score claim
R2 RuntimePauseControllerDispatchWorld ownership extraction
  -> RuntimePauseControllerDispatchWorld now owns bounded active-state Pause/SuperPause side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed pause operation selection, apply-controller callback handoff, and operation telemetry through the dispatch boundary
  -> RuntimeMatchPauseControllerWorld now owns result side effects after the dispatch boundary; match runtime still owns trigger filtering, active-state order, paused-match progression, and hitpause ignored routing
  -> focused PauseSystem coverage proves SuperPause telemetry/application through the dispatch boundary
  -> no exact pause layering, super background/sound/spark timing, helper/redirect ownership, full pause VM parity, or score claim
R2 RuntimeEnvShakeControllerDispatchWorld ownership extraction
  -> RuntimeEnvShakeControllerDispatchWorld now owns bounded active-state EnvShake side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed envshake operation selection, operation telemetry, and EnvShake event handoff through RuntimeEnvShakeWorld
  -> match runtime still owns trigger filtering, active-state order, actor/world ownership, and FallEnvShake routing
  -> focused EnvShakeSystem coverage proves EnvShake telemetry/mutation through the dispatch boundary
  -> no exact waveform, pause/stage/layer interaction, helper/redirect ownership, full presentation parity, or score claim
R2 RuntimeEnvColorControllerDispatchWorld ownership extraction
  -> RuntimeEnvColorControllerDispatchWorld now owns bounded active-state EnvColor side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed envcolor operation selection, operation telemetry, and EnvColor event handoff through RuntimeEnvColorWorld
  -> match runtime still owns trigger filtering, active-state order, stage-world ownership, and pause/hitpause callback routing
  -> focused EnvColorSystem coverage proves EnvColor telemetry/mutation through the dispatch boundary
  -> no exact blend math, layer/window ordering, pause timing, renderer parity, full presentation parity, or score claim
R2 RuntimeAudioControllerDispatchWorld ownership extraction
  -> RuntimeAudioControllerDispatchWorld now owns bounded active-state audio side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed audio operation selection, operation telemetry, and PlaySnd/StopSnd event handoff through RuntimeAudioWorld
  -> match runtime still owns trigger filtering, active-state order, hit/contact timing, and actor context
  -> focused AudioEventSystem coverage proves PlaySnd telemetry/mutation through the dispatch boundary
  -> no exact SND playback, channel priority, mixing, FightFX/common fallback, full audio parity, or score claim
R2 RuntimeContactControllerDispatchWorld ownership extraction
  -> RuntimeContactControllerDispatchWorld now owns bounded active-state contact-memory side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed contact operation selection, operation telemetry, HitAdd mutation, and MoveHitReset reset handoff through RuntimeContactMemoryWorld
  -> match runtime still owns trigger filtering, active-state order, and direct/projectile contact creation
  -> focused ContactMemorySystem coverage proves HitAdd telemetry/mutation and MoveHitReset reset telemetry through the dispatch boundary
  -> no exact combo lifetime, helper/projectile contact ownership, guard-count parity, full CNS VM parity, or score claim
R2 RuntimeTargetControllerDispatchWorld ownership extraction
  -> RuntimeTargetControllerDispatchWorld now owns bounded active-state Target / BindToTarget side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed target/bindtotarget operation selection, operation telemetry, and RuntimeTargetWorld mutation handoff
  -> match runtime still supplies damage scaling, TargetState entry validation, target constants, candidate selection, trigger filtering, and active-state order
  -> focused TargetSystem coverage proves TargetLifeAdd telemetry/mutation and BindToTarget anchor/position telemetry through the dispatch boundary
  -> no helper/projectile target ownership, exact multi-target semantics, throw binding, full CNS VM parity, or score claim
R2 RuntimeSpriteEffectControllerWorld ownership extraction
  -> RuntimeSpriteEffectControllerWorld now owns bounded active-state sprite-effect side-effect dispatch
  -> PlayableMatchRuntime delegates controller telemetry, typed sprite-effect operation selection, operation telemetry, and mutation handoff for SprPriority, PalFX, AfterImage, AfterImageTime, Trans, and Angle*
  -> RuntimeSpriteEffectWorld remains the mutation/ticking owner for actor presentation state
  -> focused SpriteEffectSystem coverage proves PalFX telemetry/mutation, AfterImage sampling, and Trans render-opacity mutation through the dispatch boundary
  -> no exact visual tick order, helper/redirect ownership, renderer parity, full CNS VM parity, or score claim
R2 RuntimeStateEntrySetupWorld ownership extraction
  -> RuntimeStateEntrySetupWorld now owns bounded imported State -1 setup-controller selection before command routing
  -> PlayableMatchRuntime delegates imported-only guard, ChangeState bypass, trigger gating, setup-controller classification, and execution handoff through the named world
  -> concrete mutation still routes through RuntimeControllerDispatchWorld so context, telemetry, and unsupported reporting stay centralized
  -> focused RuntimeStateEntrySetupSystem coverage proves imported setup execution, non-imported skip, trigger failure, and non-setup filtering
  -> no exact State -1 ordering, persistent semantics, redirect/helper/team scopes, full CNS VM parity, or score claim
R2 RuntimeControllerDispatchWorld ownership extraction
  -> RuntimeControllerDispatchWorld now owns bounded runtime-controller execution dispatch for active imported state controllers, State -1 setup controllers, and pre-facing AssertSpecial application
  -> PlayableMatchRuntime delegates runtime replacement, evaluation context handoff, controller telemetry, typed-operation telemetry, and unsupported reporting through the named world
  -> focused RuntimeControllerDispatchSystem coverage proves runtime mutation, telemetry hook behavior, dynamic HitPauseTime context, and unsupported reporting
  -> no exact CNS controller-loop order, persistent controller semantics, side-effect VM parity, helper/team/redirect execution, or score claim
R2 RuntimeResourceWorld ownership extraction
  -> RuntimeResourceWorld now owns bounded life/power/control/variable mutation inside RuntimeResourceSystem
  -> exported helper functions delegate to the world, preserving existing call sites and behavior
  -> focused RuntimeResourceSystem coverage proves direct world mutation for life, power, ctrl, and vars
  -> no exact CNS resource timing, helper/team/redirect ownership, round/KO flow, full resource parity, or score claim
R1 resource actor-frame evidence gate
  -> RuntimeTraceGate.requiredActorFrames can require observed life/power ranges
  -> required synthetic-imported-resource.json checksum 7bbcb2e4 now proves imported P1 state/action 289 exposes life 750 and power 900 in actor-frame evidence after typed resource:lifeadd/resource:lifeset/resource:poweradd/resource:powerset route through Life/Power triggers
  -> focused RuntimeTraceArtifact and RuntimeTraceGatePresets coverage proves the fields and preset
  -> no exact resource scaling, helper/team/redirect resource ownership, round/KO flow, dynamic lowering, full controller VM parity, or score claim
R1 Common1 too-early recovery-input positive-window gate
  -> RuntimeTraceGate.requiredActorFrames can require observed hitFall.recoverTime minimum-positive windows
  -> required synthetic-imported-default-fall-recovery-too-early.json checksum 050e7e3c and optional kfm-official-default-fall-recovery-too-early.json checksum d2edbde4 now require P2 5050 actor-frame evidence with min recoverTime >= 1, first-to-last drop >= 1, and at least 2 summarized frames while recovery command is active and recovery states stay forbidden
  -> focused RuntimeTraceArtifact and RuntimeTraceGatePresets coverage proves the field and presets
  -> no exact fall.recovertime tables, exact controller-loop tick order, velocity math, public bundled KFM support, full Common1 recovery parity, or score claim
R1 optional KFM recovery-threshold drop gate
  -> optional kfm-official-default-fall-recovery-threshold.json checksum bf7b058a now requires real KFM P2 state 5050 actor-frame evidence with positive hitFall.recoverTime, first-to-last recoverTime drop >= 1, and at least 2 summarized frames before 5200 with recoverTime 0
  -> focused RuntimeTraceGatePresets coverage proves the official-style preset requirement
  -> no exact fall.recovertime tables, exact controller-loop tick order, velocity math, public bundled KFM support, full Common1 recovery parity, or score claim
R2 RuntimeStateEntryWorld ownership
  -> RuntimeStateEntryWorld owns bounded state-entry mutation for availability lookup, state-number metadata, changed-state elapsed reset, owner-backed custom-state assignment/clearing, stale move/contact reset, StateDef metadata/control/velocity application, and self/state-owner animation handoff
  -> PlayableMatchRuntime delegates concrete state entry while still supplying compatibility telemetry, contact reset, and action-change callbacks
  -> focused RuntimeStateEntrySystem tests prove normal state entry, owner-backed custom states, owner-derived previous-state metadata, and metadata normalization
  -> no exact CNS ChangeState/SelfState tick order, persistent-controller timing, helper/team/root redirects, full state-entry parity, or score claim
R1 bounded Common1 recovery timer actor-frame gates
  -> RuntimeTraceGate.requiredActorFrames can require observed hitFall.downRecoverTime ranges plus first-to-last drop
  -> required synthetic-imported-default-fall-recovery.json checksum d83797d9 now proves imported P2 full-chain order 5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120, with bounded hitFall.downRecoverTime countdown-range and first-to-last-drop evidence in 5110 before get-up
  -> RuntimeTraceGate.requiredActorFrames can now also require observed hitFall.recoverTime first-to-last drop
  -> required synthetic-imported-default-fall-recovery-threshold.json checksum 7bb15a5f and synthetic-imported-default-fall-recovery-tick-order.json checksum e2691aab now prove imported P2 5050 drops from first recoverTime 1 to last recoverTime 0 before 5210 recovery
  -> focused RuntimeTraceArtifact and RuntimeTraceGatePresets coverage proves the field and preset
  -> no exact down.recovertime/fall.recovertime tables, exact Common1 controller-loop timing, animation timing, velocity math, recovery-input branching, public bundled KFM support, full fall-recovery parity, or score claim
R2 bounded helper-local Projectile gate
  -> HelperSystem can dispatch bounded helper-local Projectile through RuntimeEffectActorWorld for current visual Helpers
  -> required synthetic-imported-helper-projectile.json checksum b6269136 proves a visual Helper routes from 1200 to 1212 / anim 932 while spawning owner-side projectile anim 943 with parentId p1-helper-0
  -> pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no helper-owned projectile combat/contact presentation, helper TargetState breadth/multi-target parity beyond the owner-backed direct-HitDef gate, helper-owned custom state tables, exact helper projectile namespace scopes, broader indexed/team/helper-owned redirects beyond caller-provided EnemyNear(index) lists, exact helper HitDef/Projectile lifetime parity, full helper combat/contact parity, helper-owned effect namespaces, helper-bound Explod timing beyond the static spawn/remove/modify/count-id route, dynamic effect params, position rebinding, FightFX/common routing, nested helper ancestry, exact helper tick order, full helper/effect parity, or score claim
R2 bounded helper-local NumHelper gate
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> HelperSystem can evaluate bounded helper-local NumHelper(id) through RuntimeEffectActorWorld for current visual Helpers against owner-side visual Helper actors in the same effect store
  -> required synthetic-imported-helper-numhelper.json checksum 4e32e951 proves a visual Helper routes from 1200 to 1211 / anim 931 through NumHelper(42) > 0
  -> no exact helper effect-count/ownership parity, broader indexed/team/helper-owned redirects beyond caller-provided EnemyNear(index) lists, exact helper HitDef lifetime/multi-hit parity, helper-owned Projectile combat/contact presentation, full helper combat/contact parity, helper-owned effect namespaces, helper-bound Explod timing beyond the static spawn/remove/modify/count-id route, dynamic effect params, position rebinding, FightFX/common routing, nested helper ancestry, exact helper tick order, full helper/effect parity, or score claim
R2 bounded helper-local NumExplod gate
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> HelperSystem can evaluate bounded helper-local NumExplod(id) through RuntimeEffectActorWorld for current visual Helpers after helper-local static Explod spawn
  -> required synthetic-imported-helper-numexplod.json checksum 4328278a proves a visual Helper routes from 1200 to 1210 / anim 930 after spawning owner-side Explod anim 942 and counting that helper-parented Explod by static id
  -> no exact helper effect-count parity, exact helper HitDef lifetime/multi-hit parity, helper-owned Projectile combat/contact presentation, full helper combat/contact parity, helper-owned effect namespaces, helper-bound Explod timing beyond the static spawn/remove/modify/count-id route, dynamic effect params, position rebinding, FightFX/common routing, nested helper ancestry, exact helper tick order, full helper/effect parity, or score claim
R2 bounded helper-local ModifyExplod gate
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> HelperSystem can dispatch bounded helper-local static ModifyExplod mutation through RuntimeEffectActorWorld for current visual Helpers after helper-local static Explod spawn
  -> required synthetic-imported-helper-modifyexplod.json checksum 0749041c proves a visual Helper routes through 1200 -> 1208 -> 1209 / anims 928 and 929, spawns owner-side Explod anim 941, and mutates that helper-parented Explod by static id with velocity/scale/priority/pause/remove payload evidence
  -> no exact helper HitDef lifetime/multi-hit parity, helper-owned Projectile combat/contact presentation, full helper combat/contact parity, helper-owned effect namespaces, helper-bound Explod timing beyond the static spawn/remove/modify-id route, dynamic effect params, position rebinding, FightFX/common routing, nested helper ancestry, exact helper tick order, full helper/effect parity, or score claim
R2 bounded helper-local RemoveExplod gate
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> required synthetic-imported-helper-removeexplod.json checksum ff8658a2 proves a visual Helper routes through 1200 -> 1206 -> 1207 / anims 926 and 927, spawns owner-side Explod anim 940, and removes it with parentId p1-helper-0 lifecycle/payload evidence
R2 bounded helper-local BindToRoot gate
  -> required synthetic-imported-helper-bindtoroot.json checksum bf72306c proves a visual Helper can bind to supplied root runtime state and route from state 1200 to 1204 / anim 924 with actor-frame position plus root ownerBind target/offset payload evidence
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no player-state BindToParent / BindToRoot, nested ancestry where root differs from parent, dynamic bind params, team/keyctrl ownership, helper-owned combat/effects/projectiles, exact binding tick order, full helper binding parity, or score claim
R2 bounded helper-local BindToParent gate
  -> HelperSystem compiles and executes bounded helper-local static BindToParent / BindToRoot owner binding for current visual Helper actors when RuntimeEffectLifecycleWorld supplies owner/root runtime state
  -> required synthetic-imported-helper-bindtoparent.json checksum f9922c0e proves a visual Helper can bind to its owner and route from state 1200 to 1203 / anim 923 with actor-frame position plus parent ownerBind target/offset payload evidence
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no player-state BindToParent / BindToRoot, dynamic bind params, nested helper ancestry, team/keyctrl ownership, helper-owned combat/effects/projectiles, exact binding tick order, full helper binding parity, or score claim
R2 bounded helper-local EnemyNear gate
  -> HelperSystem expression contexts now receive current two-player opponent runtime state through RuntimeEffectLifecycleWorld during normal, pause, and hitpause presentation paths
  -> required synthetic-imported-helper-enemynear.json checksum 35498955 proves a visual Helper can route from state 1200 to 1202 / anim 922 through helper-local EnemyNear, StateNo and EnemyNear, Life reads
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> superseded by the caller-provided EnemyNear(index) context cut for explicit opponent-state lists; still no caller-independent indexed enemy selection, teams/simul/turns, helper-owned opponents, keyctrl, nested helper ancestry, helper-owned combat/effects/projectiles, exact opponent selection, exact helper tick order, full helper redirect parity, or score claim
R1 bounded dynamic Target redirect trigger gate
  -> ExpressionCompiler and ExpressionEvaluator classify bounded Target, ... and static Target(id), ... trigger redirects as executable in the current two-player target-memory context
  -> PlayableMatchRuntime resolves Target(id) from RuntimeTargetWorld target memory for active-state and State -1 trigger evaluation
  -> required synthetic-imported-bare-target-redirect.json checksum f9c90aa8 proves direct HitDef target id 77 can feed bare Target, Life and branch P1 state 200 -> 270; required synthetic-imported-default-target-redirect.json checksum d43caabf proves direct HitDef default target id 0 can feed Target(0), Life and branch P1 state 200 -> 269; required synthetic-imported-target-dynamic-redirect.json checksum 9985b62a proves direct HitDef target id 77 plus owner-local var(0) = 77 can feed Target(var(0)), Life and branch P1 state 200 -> 287; previous synthetic-imported-target-redirect.json checksum 89580963 keeps the static Target(77), Life route gated
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no helper/projectile targets, unsupported or negative target-id expressions, mutation through redirects, teams, multi-target selection, exact target lifetime/tick order, full target redirect parity, or score movement claim
R1 bounded identity-trigger gate
  -> ExpressionCompiler and ExpressionEvaluator classify Name/P1Name/P2Name/AuthorName as executable in the current two-actor runtime context
  -> PlayableMatchRuntime passes fighter display name plus author metadata into active-state, State -1, setup, and dynamic dispatch trigger evaluation
  -> EnemyNear redirect contexts now swap identity metadata as well as actor state, including composite expressions
  -> required synthetic-imported-identity.json checksum c9be5cf1 proves the route into state 276
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no team/simul/helper/player-indexed identity selection, parent/root/target identity redirects, exact string edge parity, or score claim
R2 bounded helper-local IsHelper gate
  -> ExpressionCompiler and ExpressionEvaluator classify IsHelper and IsHelper(id) as executable in helper-local contexts
  -> HelperSystem passes helper identity into visual Helper actor trigger evaluation
  -> required synthetic-imported-helper-ishelper.json checksum 37877602 proves helper state 1200 branches to 1201 / anim 921
  -> superseded by helper-local Projectile gate; pnpm qa:trace now passes 178/178 artifacts, 158 required and 20 optional
  -> no full helper VM, helper-owned combat, parent/root mutation, nested helper ancestry, team ownership, exact tick order, or score claim
R2 RuntimeStateClockWorld ownership
  -> RuntimeStateClockWorld owns bounded Time/stateElapsed mutation for active-frame advance and changed-state elapsed reset
  -> PlayableMatchRuntime delegates the inline stateElapsed += 1 and stateElapsed = -1 paths through that boundary
  -> focused RuntimeStateClockSystem tests prove advance, reset, and no-op transition behavior while preserving the -1 -> 0 first-frame convention
  -> no exact CNS Time tick-order parity, persistent-controller timing parity, pause/hitpause timing changes, helper/team/redirect state clocks, or score claim
R2 RuntimeStateMetadataWorld ownership
  -> RuntimeStateMetadataWorld owns bounded previous-state transition metadata writes for prevStateNo, prevAnimNo, prevStateType, and prevMoveType
  -> PlayableMatchRuntime delegates state-number changes through that boundary, preserving current StateDef-derived type/move-type capture
  -> StateControllerExecutor ChangeState / SelfState output uses the same helper for the basic runtime-only executor path
  -> focused RuntimeStateMetadataSystem, RuntimeCnsSubset, and PlayableMatchRuntime Prev-trigger tests prove changed-state capture and unchanged-state no-op behavior
  -> no exact state-entry tick order, redirects/helper/team previous-state ownership, persistent controller semantics, full ChangeState/SelfState parity, or score claim
R2 TargetSystem stale binding pruning
  -> TargetSystem drops TargetBind binding records during target-memory advance when the bound actor id / target id no longer survives expiry
  -> the same live-target binding check is shared by target-memory advance, TargetDrop, active TargetBind, and active BindToTarget application
  -> focused TargetSystem tests prove infinite-duration bindings survive only while matching target memory is live
  -> no exact bind/drop tick order, helper/team/multi-target ownership, throws/custom-state binding, full target parity, or score movement claim
R2 TargetSystem active binding lifetime guard
  -> TargetSystem requires matching live target memory before active TargetBind or BindToTarget position application moves actors
  -> stale binding records now fail closed after target memory is dropped or expired
  -> focused TargetSystem tests prove active binding success plus stale-binding no-mutation behavior
  -> no helper/team/multi-target ownership, exact bind/drop tick order, throws/custom-state binding parity, target parity, or score movement claim
R2 TargetSystem BindToTarget anchor ownership
  -> TargetSystem owns bounded BindToTarget postype anchor resolution previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime supplies only character constants; resolveRuntimeTargetAnchor owns Foot/Mid/Head size-constant lookup
  -> focused TargetSystem tests prove constant-backed anchor math and existing BindToTarget placement
  -> no exact bind tick order, helper/team/multi-target ownership, throws/custom-state binding, target parity, or score movement claim
R2 RuntimeContactPresentationWorld ownership
  -> RuntimeContactPresentationWorld owns bounded direct HitDef and Projectile contact presentation package emission previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates shared contactId/contactTick/contactKind metadata creation plus attacker-side HitDef/Projectile sound and HitSpark telemetry through that boundary
  -> focused RuntimeContactPresentationSystem tests prove direct hit package metadata and projectile guard package metadata are shared across PlaySnd and HitSpark events while preserving hit-spark asset-frame handoff
  -> no exact intra-tick audio/spark ordering, SND playback/mixing/channel priority, exact FightFX/common lookup/binding/layering/timing/scale/palette, helper-owned contact presentation, multi-target presentation, or score claim
R2 RuntimeGuardDistanceWorld ownership
  -> RuntimeGuardDistanceWorld owns bounded InGuardDist/auto-guard proximity checks previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current move presence, spent-hit rejection, pre-active guard-distance window, guardflag/AssertSpecial/unguardable checks, hurtbox fallback handoff, and authored/default guard.dist checks through that boundary
  -> focused RuntimeGuardDistanceSystem tests prove the pre-active window, missing/spent/out-of-window rejects, guardflag and AssertSpecial rejects, unguardable attacks, and authored guard.dist thresholds
  -> no exact proximity guard parity, guard-end timing, guard effects, air-guard landing, broad Common1 controller-loop parity, or score claim
R2 RuntimeAnimationWorld ownership
  -> RuntimeAnimationWorld owns bounded actor animation advancement and timing helpers previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current animTime/frameIndex/frameElapsed advancement, final-frame hold, loopStart completion, invalid-duration clamping, AnimTime/AnimElemTime helper math, and current HitDef active-window duration math through that boundary
  -> focused RuntimeAnimationSystem tests prove empty actions, authored durations, frame changes, loop completion, final-frame hold, invalid-duration clamping, and timing helpers
  -> no exact AIR negative-duration semantics, elem/elemtime parity, state-owner namespace behavior, controller tick-order parity, or score claim
R2 RuntimeKinematicsWorld ownership
  -> RuntimeKinematicsWorld owns bounded actor position integration, sandbox gravity, ground snap, and landing idle-action request previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current pos/vel advance, airborne gravity, imported hit-state ground-snap preservation, and no-current-move landing idle callback through that boundary
  -> focused RuntimeKinematicsSystem tests prove grounded movement, airborne gravity, landing snap/idle, active-move landing, and imported preserve behavior
  -> no exact MUGEN physics, yaccel constants, landing timing, air recovery parity, helper physics ownership, or score claim
R2 RuntimeInputControlWorld ownership
  -> RuntimeInputControlWorld owns bounded local player and simple AI control intent previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates crouch, jump, walk, idle, air drift, NoWalk suppression, AI chase, AI attack cooldown, and local punch/kick intent through that boundary
  -> focused RuntimeInputControlSystem tests prove blocked input, state-entry precedence, movement branches, NoWalk/air drift, and simple AI chase/attack routes
  -> no new input semantics, exact command timing, exact AI behavior parity, full MUGEN/IKEMEN control routing, or score claim
R2 RuntimeMoveLifecycleWorld ownership
  -> RuntimeMoveLifecycleWorld owns bounded active move lifecycle mutation previously inline in PlayableMatchRuntime
  -> PlayableMatchRuntime delegates current move tick, non-reversal attack moveType/velocity lock, completed move cleanup, reversal cleanup, and idle/control restoration callbacks through that boundary
  -> focused RuntimeMoveLifecycleSystem tests prove no-op, active non-reversal move, completed non-reversal move, and completed reversal routes
  -> no new move semantics, exact input/cancel timing, exact MUGEN/IKEMEN active-move lifecycle parity, or score claim
R2 helper-local micro-VM ownership
  -> HelperSystem runs a bounded helper-local micro-VM for current visual Helper actors spawned with owner runtime-program data
  -> RuntimeEffectSpawnWorld passes owner runtimeProgram and animation maps into HelperSystem
  -> focused EffectActorSystem tests prove Time-triggered VelSet, ChangeAnim, ChangeState, DestroySelf removal, helper-local CtrlSet/StateTypeSet, helper-local VarSet/VarAdd/VarRandom/VarRangeSet trigger branches, and helper-local PlaySnd/StopSnd sound-event telemetry on helper actors
  -> focused EffectSpawnSystem tests prove the handoff
  -> helper-local resources now include bounded LifeAdd/LifeSet/PowerAdd/PowerSet state and trigger evidence in focused tests
  -> helper-local redirects now include bounded Parent/Root read-only trigger/value evaluation against owner runtime state plus bounded EnemyNear read-only trigger/value evaluation against current opponent state, with focused EffectActorSystem and trace coverage
  -> helper-local static owner binding now includes bounded BindToParent / BindToRoot unit coverage and required BindToParent plus BindToRoot trace coverage with ownerBind target/offset payload requirements
  -> superseded by the caller-provided EnemyNear(index) context cut for explicit opponent-state lists; still no broader indexed/team/helper-owned redirects, player-state BindToParent/BindToRoot, dynamic bind params, team/keyctrl ownership, exact helper resource scopes, helper-owned opponents, helper TargetState breadth/multi-target parity beyond the owner-backed direct-HitDef gate, helper-owned custom state tables, helper fvar/sysvar VarRandom, exact random stream parity, exact helper-local sound timing/channel/redirect ownership, helper-owned Projectile combat/contact beyond bounded target memory, helper-owned effect namespaces, exact helper HitDef lifetime/multi-hit parity, full helper combat parity, nested helper ancestry, exact tick-order/pause parity, full custom-state helper lifecycle, or score claim
R2 visual-helper removal ownership
  -> HelperSystem removes current visual helper actors by helper id, runtime serial, or owner-wide clear
  -> RuntimeEffectActorWorld owns p1/p2-isolated store mutation and removed-count reporting
  -> RuntimeEffectSpawnWorld exposes the same handoff for future controller dispatch
  -> focused EffectActorSystem and EffectSpawnSystem tests prove the boundary
  -> no redirects, parent/root/team ownership, helper TargetState breadth/multi-target parity beyond the owner-backed direct-HitDef gate, helper-owned custom state tables, helper-owned Projectile combat/contact beyond bounded target memory, exact helper HitDef lifetime/multi-hit parity, exact lifecycle tick-order parity, or score claim
R1 required combined hit/guard-effect contact-package trace strengthening
  -> synthetic-imported-hitdef-common-guard-spark.json checksum 7650a09c gates unprefixed common/default source-frame plus selected-frame/multi-frame AIR metadata for guard.sparkno 7003
  -> synthetic-imported-hitdef-fightfx-guard-spark.json checksum 32f3e92d gates F-prefixed FightFX source-frame plus selected-frame/multi-frame AIR metadata for guard.sparkno F7004
  -> synthetic-imported-hitdef-hit-effect-package.json checksum 46aa5ce1 gates one direct HitDef hit contact with hitsound F5,0 telemetry, soundPrefix = kfm, and FightFX sparkno F7002 source-frame plus selected-frame/multi-frame AIR metadata sharing one contact package
  -> synthetic-imported-hitdef-guard-effect-package.json checksum 1c3167b7 gates one guarded direct HitDef contact with guardsound S6,0 telemetry plus FightFX guard.sparkno F7004 source-frame and selected-frame/multi-frame AIR metadata sharing one contact package
  -> required package traces require direct/guarded HitDef contact, attacker-side PlaySnd/HitSpark telemetry, shared non-empty contactId/contactTick/contactKind metadata, selected first-frame offset 3,-4, selected first-frame duration 5, at least 2 asset frames, frame indices [0, 1], and total authored duration 11 before renderer/audio handoff
  -> current aggregate after the player Projectile default Target-controller gate is 208/208 artifacts, 188 required and 20 optional
  -> required trace evidence only; no exact intra-tick sound/spark ordering, SND playback, renderer lookup, visual frame timing, layering, scale, palette, motif/screenpack ownership, hit/guard-effect parity, or full spark parity claim
R2 RuntimeHitPauseWorld runtime-system bridge
  -> advanceRuntime(...) now owns the concrete hitpause bridge for command buffering and paused presentation
  -> PlayableMatchRuntime delegates those hitpause side effects through RuntimeHitPauseWorld instead of local callback glue
  -> focused RuntimeHitPauseSystem tests prove current tick/input buffering with hitPause: true and RuntimeEffectLifecycleWorld paused presentation using pause kind hitpause
  -> no new hitpause semantics, helper-owned hitpause execution, broad side-effect ordering during hitpause, exact first-frame decrement order, exact hitpause parity, or score claim
R2 RuntimePausedMatchWorld runtime-system bridge
  -> advanceRuntime(...) now owns the concrete paused-match bridge for source-movetime target-memory aging, active-effect advance, presentation-effect advance, active target binding, stage clamp, and frozen-actor paused presentation
  -> PlayableMatchRuntime delegates those paused interaction side effects through RuntimePausedMatchWorld instead of local callback glue
  -> focused PauseSystem tests prove actor-local targetWorld, effectLifecycleWorld, and RuntimeActorConstraintWorld wiring
  -> pnpm qa:trace stays stable at 163/163; no new pause semantics, helper VM during pause, exact pause layering, exact paused effect tick order, parent/root/team redirects, or score claim
R2 RuntimeMatchInteractionWorld runtime-system bridge
  -> advanceRuntime(...) now owns the concrete normal-loop bridge for target-memory aging, active-effect advance, projectile clash, body separation, active target binding, stage clamp, and presentation-effect advance
  -> PlayableMatchRuntime delegates those interaction side effects through RuntimeMatchInteractionWorld instead of local callback glue
  -> focused MatchInteractionSystem tests prove actor-local targetWorld, effectLifecycleWorld, effectActorWorld.resolveProjectileClashes(...), and RuntimeActorConstraintWorld wiring
  -> pnpm qa:trace stays stable at 163/163; no helper VM execution, new target/projectile/effect semantics, exact post-fighter tick-order, pause-specific bridge ownership, parent/root/team redirects, or score claim
R2 RuntimeResourceSystem resource-edge ownership
  -> authored life/power max resolution, runtime power-delta clamping, bounded life deltas, and control writes now live in RuntimeResourceSystem
  -> PlayableMatchRuntime, RuntimeDirectCombatWorld, RuntimeProjectileCombatWorld, RuntimeReversalWorld, and RuntimeTargetWorld use the shared boundary instead of local max helpers or inline writes
  -> focused RuntimeResourceSystem, DirectCombatSystem, ProjectileCombatSystem, TargetSystem, ReversalSystem, and PlayableMatchRuntime tests preserve current bounded semantics
  -> no new controller semantics, exact CNS timing, helper/team/redirect ownership, target/projectile parity, or score claim
R2 RuntimeSnapshotWorld effect snapshot aggregation
  -> final Explod/Helper/Projectile effect snapshot aggregation moved out of PlayableMatchRuntime
  -> focused RuntimeSnapshotSystem tests cover stable p1/p2 effect ordering and clone isolation
  -> no effect VM semantics, exact tick order, renderer parity, compatibility-session ownership, or score claim
R1 required Common1 fall get-hit entry trace strengthening
  -> synthetic-imported-default-fall-gethit.json checksum 6af73a91 now gates ordered 5000 -> 5030 -> 5050 controller/frame evidence
  -> optional kfm-official-default-fall-gethit.json checksum a19f43db applies bounded official KFM 5000/5030/5050/5100/5101/5110 controller/typed-operation and actor-frame order when the private fixture exists
  -> no exact fall/bounce/liedown tick order, velocity math, recovery branching, guard-state parity, public bundled KFM, or full fall get-hit parity claim
R1 required Common1 full-chain recovery trace strengthening
  -> synthetic-imported-default-fall-recovery.json checksum d83797d9 gates ordered 5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 controller/frame evidence plus bounded hitFall.downRecoverTime countdown-range / first-to-last-drop evidence in 5110
  -> optional kfm-official-default-fall-recovery.json checksum 26a2aae9 applies bounded official KFM 5110/5120 controller/typed-operation and actor-frame order when the private fixture exists
  -> no exact controller-loop tick order, threshold/down-recovery table, velocity/bounce math, recovery-input breadth, or full fall recovery parity claim
R1 required Common1 stand get-hit progression trace strengthening
  -> synthetic-imported-default-gethit-progression.json checksum ef2a67f8 gates ordered 5000 ChangeState before 5001 ChangeState
  -> actor-frame evidence now requires imported P2 5000 before 5001, with final idle/control evidence
  -> no exact HitShakeOver/HitOver timing, fall/bounce/liedown/recovery, helper/custom-state breadth, or full Common1 VM claim
R1 required common/FightFX HitSpark asset-frame trace strengthening
  -> synthetic-imported-hitdef-common-spark.json checksum 5ea054d7 gates unprefixed common/default source-frame plus selected-frame/multi-frame AIR metadata for sparkno 7001
  -> synthetic-imported-hitdef-fightfx-spark.json checksum 11537b56 gates F-prefixed FightFX source-frame plus selected-frame/multi-frame AIR metadata for sparkno F7002
  -> required traces now require selected first-frame offset 3,-4, selected first-frame duration 5, at least 2 asset frames, frame indices [0, 1], and total authored duration 11 before renderer handoff
  -> required trace evidence only; no exact renderer lookup, visual frame timing, layering, scale, palette, motif/screenpack ownership, or full spark parity claim
R1 optional KFM x HitDef presentation trace strengthening
  -> kfm-official-x-hit-sound.json checksum bd153db9 gates bounded real KFM x hitsound S5,0 telemetry
  -> kfm-official-x-hit-spark.json checksum bd153db9 gates bounded real KFM x sparkno 0 telemetry
  -> optional private fixture evidence only; no public asset, exact SND playback, exact FightFX/common rendering, or score claim
R1 synthetic TargetLifeAdd NoKO trace strengthening
  -> synthetic-imported-target-noko.json checksum 321a1eba gates ordered P2 AssertSpecial NoKO -> P1 HitDef -> P1 TargetLifeAdd evidence
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
R2 RuntimeStateEntryWorld ownership extraction
  -> state-entry availability, state-number metadata, elapsed reset, owner-backed custom-state assignment/clearing, stale move/contact reset, StateDef metadata/control/velocity application, and self/state-owner animation handoff moved out of PlayableMatchRuntime
  -> focused RuntimeStateEntrySystem tests cover normal state entry, owner-backed custom states, owner-derived previous-state metadata, and metadata normalization
  -> trace behavior expected unchanged; no new parity or score claim
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
  -> move one guard/fall/recovery or FightFX/common route beyond current bounded source-frame plus selected-frame/multi-frame AIR evidence
  -> prefer deeper VM loop order, broader fixture-backed confirmation, or exact visible package presentation evidence
```

Alternate next slice: R2 `MatchWorld` ownership around deeper helper VM boundaries, helper-owned combat/effect ordering, target ownership, or presentation effects if it can preserve trace behavior. See `docs/NEXT_BUILD_ROADMAP.md` for the next-10-slices queue.

## Slice Selection Guardrails

Before starting work, check the latest numbered entry in `docs/BUILD_EXECUTION_BACKLOG.md`, this section, and the linked `.scratch/roadmap/issues/` file. Do not rebuild a gate that is already listed as closed.

Current closed gates that must not be reselected as "next":

- `synthetic-imported-hitoverride-slot-priority.json`
- `synthetic-imported-hitby-allow.json`
- `synthetic-imported-hitby-reject.json`
- `synthetic-imported-hitdef-hit-sound.json`
- `synthetic-imported-projectile-contacttime-id.json`
- `synthetic-imported-projectile-guardedtime-id.json`
- `synthetic-imported-projectile-canceltime-any.json`
- `synthetic-imported-hitdef-common-spark.json`
- `synthetic-imported-hitdef-fightfx-spark.json`
- `synthetic-imported-hitdef-common-guard-spark.json`
- `synthetic-imported-hitdef-fightfx-guard-spark.json`
- `synthetic-imported-default-gethit-progression.json` controller/frame order
- `synthetic-imported-default-crouch-gethit-progression.json` controller/frame order
- `synthetic-imported-target.json` final Target* side-effect evidence
- `synthetic-imported-target-noko.json` TargetLifeAdd defender-side NoKO evidence
- `synthetic-imported-target-owned-custom-state.json`
- `synthetic-imported-default-guard-state.json` actor-frame telemetry
- `synthetic-imported-crouch-guard-state.json` actor-frame telemetry
- `synthetic-imported-diagonal-crouch-guard-state.json` actor-frame telemetry
- `synthetic-imported-air-guard-state.json` actor-frame telemetry
- `synthetic-imported-crouch-guard-slide-stop.json` crouch slide-stop/control order
- `synthetic-imported-crouch-guard-hold-crouch-return.json` crouch guard-hold return-to-crouch-control order
- `kfm-official-default-crouch-guard-hold-crouch-return.json` optional private-fixture KFM crouch guard-hit `152 -> 153 -> 131 -> 11` route
- `kfm-official-default-air-guard-state.json` optional private-fixture KFM air guard `154 -> 155 -> 52 -> 20` walk-control route
- `synthetic-imported-air-guard-landing.json` air landing handoff order
- `synthetic-imported-auto-guard-start.json` controller-order evidence
- `synthetic-imported-auto-guard-end.json` controller-order evidence
- `RuntimeControllerEvaluationContextWorld` ownership extraction
- `RuntimeDispatchEvaluationWorld` ownership extraction
- `RuntimeTriggerEvaluationWorld` ownership extraction
- `RuntimeTriggerGateWorld` ownership extraction
- `RuntimeAutoGuardStartWorld` ownership extraction
- `kfm-official-default-fall-recovery-threshold.json` optional drop/order evidence
- `synthetic-imported-default-fall-recovery-too-early.json` and `kfm-official-default-fall-recovery-too-early.json` positive-window reject evidence
- `synthetic-imported-default-fall-official-ground-recovery.json`
- `synthetic-imported-resource.json` actor-frame life/power evidence
- `synthetic-imported-noop.json` debug clipboard plus `MakeDust` / `DestroySelf` no-op coverage
- `synthetic-imported-variable.json` `VarRandom` variable compatibility
- `synthetic-imported-selfanimexist.json` own-action lookup evidence
- `synthetic-imported-animtime.json` active-state animation-end evidence
- `synthetic-imported-animelemtime.json` active-state animation-element timing evidence
- `synthetic-imported-animelem.json` current AIR element start trigger evidence
- `synthetic-imported-animelem-offset.json` current AIR element elapsed-time trigger evidence
- `synthetic-imported-projectile-gethitvar-air-guard-hitshaketime.json` bounded player-owned Projectile air guard hitshake timing metadata trigger evidence
- `synthetic-imported-gethitvar-air-guard-hitshaketime.json` bounded direct-HitDef air guard hitshake timing metadata trigger evidence
- `synthetic-imported-projectile-gethitvar-guard-hitshaketime.json` bounded player-owned Projectile guard hitshake timing metadata trigger evidence
- `synthetic-imported-helper-projectile-gethitvar-guard-hitshaketime.json` bounded helper-parented Projectile guard hitshake timing metadata trigger evidence
- `synthetic-imported-gethitvar-crouch-guard-hitshaketime.json` bounded direct-HitDef crouch guard hitshake timing metadata trigger evidence
- `synthetic-imported-gethitvar-guard-hitshaketime.json` bounded direct-HitDef guard hitshake timing metadata trigger evidence
- `synthetic-imported-gethitvar-hitshaketime.json` bounded direct-contact normal hitshake timing metadata trigger evidence
- `synthetic-imported-gethitvar-hittime.json` bounded direct-contact normal hit timing metadata trigger evidence
- `synthetic-imported-gethitvar-guard-timing.json` bounded direct-HitDef guard timing metadata trigger evidence
- `synthetic-imported-gethitvar-down-recover.json` bounded stored down-recovery metadata trigger evidence
- `synthetic-imported-custom-state-gethitvar-type.json` bounded owner-backed custom-state `GetHitVar(type)` metadata inheritance through direct-HitDef type metadata
- `synthetic-imported-custom-state-gethitvar-isbound.json` bounded owner-backed custom-state TargetBind `GetHitVar(isbound)` metadata inheritance through target memory and owner-local TargetState
- `synthetic-imported-custom-state-gethitvar-guarded.json` bounded owner-backed custom-state guarded metadata inheritance through target memory and owner-local TargetState
- `synthetic-imported-custom-state-gethitvar-velocity.json` bounded owner-backed custom-state velocity metadata inheritance
- `synthetic-imported-custom-state-gethitvar-down-recover.json` bounded owner-backed custom-state down-recovery metadata inheritance
- `synthetic-imported-custom-state-gethitvar-guard-timing.json` bounded owner-backed custom-state guarded slide/control timing metadata inheritance through target memory and owner-local TargetState
- `synthetic-imported-custom-state-gethitvar-hitcount-hitid-chainid.json` bounded owner-backed custom-state direct-HitDef numhits/id/chainID metadata inheritance
- `synthetic-imported-gethitvar-fall-envshake.json` bounded stored fall env-shake metadata trigger evidence
- `synthetic-imported-gethitvar-fallcount.json` bounded stored post-impact fallcount trigger evidence
- `synthetic-imported-gethitvar-fall-metadata.json` bounded stored fall metadata trigger evidence
- `synthetic-imported-teamside.json` bounded one-on-one TeamSide trigger evidence
- `synthetic-imported-helper-projectile-gethitvar-guarded.json` current helper-parented Projectile guard metadata trigger evidence
- `synthetic-imported-helper-projguardedtime-any.json`, `synthetic-imported-helper-projcontacttime-any.json`, and `synthetic-imported-helper-projhittime-any.json` bounded helper-local Projectile any-id timing trigger evidence
- `synthetic-imported-projectile-gethitvar-guarded.json` previous player-owned Projectile guard metadata trigger evidence
- `synthetic-imported-gethitvar-guarded.json` direct guard metadata trigger evidence
- `synthetic-imported-gethitvar-fall-recover.json` current get-hit recovery-flag vs CanRecover trigger evidence
- `synthetic-imported-owner-metrics.json` owner state/anim/time/resource/position/velocity evidence
- `RuntimeContactMemoryWorld` direct/projectile contact-memory ownership extraction
- `RuntimeRandomSystem` deterministic random ownership extraction
- `HitSparkAssetSystem` player/common/FightFX spark asset-frame lookup extraction
- `RuntimeRecoverySystem` fall/down-recovery ownership extraction
- `BindToTarget` target-system ownership extraction
- active target-binding position ownership extraction
- `RuntimeTargetWorld.resolveCandidates` target-candidate ownership extraction
- `RuntimeHitEligibilityWorld` ownership extraction
- `RuntimeExpressionContextWorld` ownership extraction
- `RuntimeStateTransitionControllerWorld` ownership extraction
- `RuntimeAnimationControllerWorld` ownership extraction
- `RuntimeKinematicControllerWorld` ownership extraction
- `RuntimeBoundsControllerWorld` ownership extraction
- `RuntimeHitFallControllerWorld` ownership extraction
- `RuntimeStateTypeWorld` ownership extraction
- `RuntimeDamageScaleWorld` ownership extraction
- `RuntimeHitDefenseWorld` ownership extraction
- `RuntimeOrientationWorld` ownership extraction
- `RuntimeGuardWorld` ownership extraction
- `RuntimeGetHitStateWorld` ownership extraction
- `RuntimeHitStateTransitionWorld` ownership extraction
- `RuntimeStateAvailabilityWorld` ownership extraction
- `RuntimeStateEntryWorld` ownership extraction
- `RuntimeResourceWorld` ownership extraction
- `RuntimeControllerDispatchWorld` ownership extraction
- `RuntimeStunWorld` ownership extraction
- `RuntimePausedMatchWorld` ownership extraction
- `RuntimeHitPauseWorld` ownership extraction
- `RuntimeMoveLifecycleWorld` ownership extraction
- `RuntimeInputControlWorld` ownership extraction
- `RuntimeHelperProjectileTargetWorld` ownership extraction
- `RuntimeHelperTargetStateWorld` ownership extraction
- `RuntimeTargetStateEntryWorld` ownership extraction
- `RuntimeActiveControllerScanWorld` ownership extraction
- `RuntimeFighterAdvanceHookSetWorld` ownership extraction
- `RuntimeActiveControllerHookSetWorld` ownership extraction
- `RuntimeActiveControllerDispatchWorld` ownership extraction
- `RuntimeActiveStateDispatchWorld` ownership extraction
- `RuntimeActiveSideEffectDispatchWorld` ownership extraction
- `RuntimeStateEntryRouteWorld` ownership extraction
- `RuntimeAnimationWorld` ownership extraction and active action-retarget ownership deepening
- `RuntimeContactPresentationWorld` ownership extraction
- `RuntimeGuardDistanceWorld` ownership extraction
- `RuntimeKinematicsWorld` ownership extraction
- visual-helper removal ownership
- helper-local micro-VM ownership, including helper-local sound-event telemetry and bounded parent/root/opponent read-only redirects
- `RuntimeAssertSpecialWorld` ownership extraction
- `RuntimeSnapshotWorld` ownership extraction
- `RuntimeSnapshotWorld` player actor projection
- `RuntimeCompatibilityTelemetryWorld` ownership extraction
- `RuntimeFighterAdvanceWorld` ownership extraction
- `RuntimeHelperTelemetryWorld` ownership extraction
- `RuntimeMatchTickInputWorld` ownership extraction
- `RuntimeMoveStartWorld` ownership extraction
- `RuntimeMatchCombatBridgeWorld` ownership extraction
- `RuntimeMatchPauseControllerWorld` ownership extraction
- `RuntimeMatchFighterAdvanceWorld` ownership extraction
- `RuntimeMatchRoundWorld` ownership extraction
- `RuntimeMatchInputControlWorld` ownership extraction
- `RuntimeMatchActorRosterWorld` ownership extraction
- `RuntimeMatchPostFighterWorld` ownership extraction
- `RuntimeMatchEnvShakeBridgeWorld` ownership extraction
- `RuntimeMatchEnvColorBridgeWorld` ownership extraction

After docs-only/setup work, return to one of these evidence-producing cuts:

1. R1 Common1 recovery/guard controller-loop precision.
2. R1 FightFX/common presentation proof beyond current package-frame handoff and source-frame plus selected-frame/multi-frame trace metadata.
3. R2 `MatchWorld` ownership around deeper helper parent/root/redirect boundaries, helper-owned combat/contact, helper-bound effect mutation/timing, effect/combat ordering, deeper target ownership, or the next non-`RuntimeContactPresentationWorld` mutable boundary with stable or documented trace behavior.

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
