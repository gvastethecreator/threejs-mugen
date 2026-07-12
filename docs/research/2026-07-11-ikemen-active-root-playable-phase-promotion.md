# IKEMEN Active-root Playable Phase Promotion Research

Date: 2026-07-11
Wayfinder: 096
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

What is the smallest source-backed phase promotion that can move one live non-standby reserve beyond bounded CNS without granting effects, combat, round, presentation, or resources prematurely?

## Answer

Promote one normal-tick phase, not the complete playable fighter path. A root that is available, scheduled, player-typed, non-disabled, non-KO, and non-standby at the start of the actor pass may enter a new `active-motion` phase. That phase runs a restricted CNS profile, then local kinematics and animation. It does not run native direct input or AI, sprite/effect ticks, hit eligibility, contact timers, stun/recovery/move lifecycle, target/effect lifecycle, combat, round, presentation, camera, audio, or resources.

The actor-pass participation snapshot is intentional. A root made non-standby by Tag CNS during the current actor pass continues through bounded CNS only and can enter `active-motion` on the next normal tick. This is a conservative browser-runtime rule, not a claim of exact same-frame IKEMEN Tag timing. It prevents a controller from widening its own remaining phase capabilities midway through a pass.

The existing full `advanceFighter` path cannot be reused. It mixes sprite effects, hit slots, contact timers, stun, recovery, move lifecycle, kinematics, animation, unrestricted CNS, and frozen-position handling. Its local order also advances kinematics and animation before current-state controllers, whereas the pinned IKEMEN action path runs state logic before `posUpdate` and current-frame animation commit. A dedicated motion executor is therefore the smallest honest boundary.

## Upstream Order

1. `CharList.commandUpdate` walks every loaded root and Helper before actor execution, with separate Pause/SuperPause and hitpause buffering rules: [char.go lines 13014-13094](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13014-L13094).
2. Run order is prepared, then every actor receives `actionPrepare`, every non-destroyed actor receives `actionRun`, and every actor receives `actionFinish`: [char.go lines 13096-13176](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13096-L13176).
3. `actionPrepare` filters destroyed/disabled characters, computes pause participation, and performs hard-coded control actions. It does not reject standby by itself: [char.go lines 11544-11605](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11544-L11605).
4. `actionRun` executes negative/current/+1 states, then position physics and animation-frame commit. Its entry guard filters destroyed/disabled, not standby: [char.go lines 11737-11868](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11737-L11868).
5. `actionFinish` also owns PalFX progression, guard-distance reset, KO sound/state, and over flags. Reusing it as a motion phase would therefore grant effects, audio, and round-adjacent behavior: [char.go lines 11998-12055](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11998-L12055).
6. The later character update runs for every non-disabled character and advances sprite/bind state. It is another mixed owner, not a safe motion-only unit: [char.go lines 12115-12150](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12115-L12150).
7. Stored control is masked while standby, and hit detection independently excludes standby roots: [effective control](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5255-L5337), [hit detection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13207-L13228).

## Local Phase Map

| Local owner | Current behavior | Promotion decision |
| --- | --- | --- |
| `RuntimeRootInputRouting/v0` | Tag normal ticks map one side stream into independent same-side command buffers. | Keep. This is the only input available to P3-P8 in the first motion cut. |
| `RuntimeMatchInputControlWorld` | Native direct input/AI is a P1/P2 transaction before actor advance. | Keep pair-only. Do not present this as full human control of P3-P8. |
| `RuntimeMatchActorAdvanceWorld` | Root participation is recomputed from permanent `reserveRoots` storage. | Snapshot a three-way normal-tick phase before actor execution: `playable`, `active-motion`, or `bounded-standby`. |
| `advanceStandbyRootCns` | Advances state time and CNS with state/Tag/variable/control operations; all side effects and kinematic controllers are blocked. | Preserve for standby roots and for roots activated during the current actor pass. |
| `RuntimeRootCnsExecutionWorld` | `playable` is unrestricted; `standby` allows state plus a small runtime-controller list. | Add an explicit motion profile containing the existing bounded list plus `gravity`, `velset`, `veladd`, `velmul`, `hitvelset`, `posset`, and `posadd`; keep side effects empty. |
| `RuntimeKinematicsWorld` | Mutates only local position/velocity/state physics and can select the local idle animation on landing. | Admit after restricted CNS for `active-motion`. No stage clamp or interaction ownership is implied. |
| `RuntimeAnimationWorld` | Advances only the root's current action/frame counters. | Admit after kinematics for `active-motion`. No draw admission is implied. |
| `advanceFighter` | Ticks sprite/hit/contact/recovery/stun/move owners, kinematics, animation, unrestricted CNS, and constraints. | Do not call for P3-P8. It is too broad and has a different controller/physics order. |
| `advanceIkemenPausedMatch` | P1/P2 can use the full path under movetime; storage reserves use bounded CNS. | Leave unchanged. The first promotion is normal-tick only. |
| Effects/targets/post-fighter | Pair stores and pair-only target/combat/presentation owners; non-P2 effects alias P1. | Keep blocked. Do not tick sprite effects or call effect lifecycle for motion roots. |
| Round/presentation/resources | P1/P2 life, actor list, camera/HUD/audio, and resource owners. | Keep blocked and false in phase diagnostics. |

## Hidden-side-effect Audit

- Full CNS would admit `HitDef`, `ReversalDef`, Helper/Projectile/Explod creation, targets, Pause/SuperPause, sound, environment effects, and contact mutation. The motion profile must keep side effects empty and use an allowlist for runtime controllers.
- `advanceFighter` ticks PalFX/AfterImage sampling and hit/contact/recovery state before movement. Calling it would create behavior even if rendering stayed pair-only.
- `RuntimeKinematicsWorld` can change state type/physics and select the idle action on landing. Tests must include airborne and grounded roots and treat these as allowed local motion effects.
- `PosSet`/`PosAdd` mutate position immediately during CNS; `Vel*` and `Gravity` affect later kinematics. The required trace must distinguish controller-time position changes from phase-time integration.
- Active-root motion remains unclamped by pair-owned post-fighter separation/stage-clamp logic. This is allowed only while presentation/combat remain blocked and must be deleted before visible handoff.
- A root can change standby during its own or another root's CNS. A precomputed phase snapshot prevents same-pass escalation; reset must discard the snapshot and restore authored standby.
- P1/P2 direct-input/AI callbacks still execute before actor phases. Effective-control masking protects standby imported roots, but the motion cut must not claim native demo-control handoff.
- The current effect owner conversion maps every non-P2 owner to P1. Any call into effect lifecycle from P3-P8 is a release blocker until root-key stores land.
- Pair-only opponent, guard, target, combat, round, camera, HUD, and audio owners remain unsafe for plural active roots and are not prerequisites for local motion only.

## Selected Implementation Cut

Wayfinder 097: **Execute active-root motion phase**.

Required behavior:

- explicit `ikemen-go` Tag normal ticks only;
- take one immutable root-phase snapshot before actor execution;
- classify current P1/P2 non-standby roots as `playable`, current non-standby P3-P8 as `active-motion`, and standby roots from any storage slot as `bounded-standby`;
- execute `active-motion` as state clock, motion-CNS, kinematics, then animation;
- publish a deliberately versioned capability value for the motion-CNS profile and set only kinematics/animation true beyond the already-mapped command axis;
- retain direct input, AI, effects, combat, round, presentation, and resources as false for P3-P8;
- retain the current paused/hitpause behavior;
- fail closed for disabled, non-player, invalid-side, over-KO, legacy, Single, and inconsistent diagnostic roots;
- reset to authored standby, local position/velocity, state, and animation without stale phase state.

Required evidence:

- focused phase-policy, CNS-capability, match integration, reset, and snapshot-isolation tests;
- one required synthetic imported trace proving a P3 command enters Tag motion state, no motion phase occurs in the activation pass, and the next normal tick applies allowed kinematic/animation progression;
- negative trace/test evidence that opposite-side input, standby roots, Pause/hitpause, and blocked effect/combat routes do not move;
- unchanged historical no-reserve behavior checksums and complete `pnpm test`, TypeScript 7 typecheck/build, trace, boundary, and diff gates;
- browser smoke is N/A because `presentation` remains false and P3-P8 remain absent from `snapshot.actors` and the renderer.

## Deletion Criteria

Delete the dedicated motion executor and temporary phase classification when a unified IKEMEN character action owner can run controller, physics, animation, effects, collision, and finish phases under explicit per-root capability masks without pair aliases. Replace the conservative next-tick phase snapshot only after an official-style fixture proves exact same-frame Tag promotion order. Remove the unclamped-motion allowance before any reserve root becomes visible or collidable. Keep the required trace as a regression oracle after those replacements.

## Claim Ceiling

Allowed after this research: the upstream action order, local mixed-owner hazards, and one implementation-ready normal-tick `active-motion` cut are pinned.

Blocked: executable P3-P8 movement until Wayfinder 097 lands; direct native input/AI handoff; Pause/hitpause motion; visible Tag; root-key effects; multi-root combat, round, camera, HUD, audio, resources; exact same-frame Tag order; score movement; or full MUGEN/IKEMEN parity.
