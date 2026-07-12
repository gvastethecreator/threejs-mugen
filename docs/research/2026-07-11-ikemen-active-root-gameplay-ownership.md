# IKEMEN Active-root Gameplay Ownership Research

Date: 2026-07-11
Wayfinder: 093
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

Which upstream and local owners must change before a structurally active P3-P8 root can participate in one bounded Tag handoff without silently gaining combat, round, presentation, effect, or resource ownership?

## Answer

IKEMEN Tag does not transfer one command buffer from the outgoing root to the incoming root. For a human Tag side, the selection script remaps every same-side logical player slot to the side controller and leaves each root with its own command list. The character loop updates commands for every loaded root and Helper before actor execution. Stored control is then masked by standby, while the default Tag program accepts switch commands only on the team leader.

The browser port currently conflates several different contracts behind the P1/P2 pair. A live `standby = false` on P3 does not make P3 playable: scheduling still classifies roots by storage in `reserveRoots`; command stamping and direct input are pair-only; effects alias every non-P2 owner into P1; combat, round, presentation, camera, HUD, audio discovery, and behavior traces consume the pair.

No single `active` filter can safely close this. The next executable slice is source-shaped Tag command routing plus reserve-root trace observability. It must not call the full playable fighter path for P3-P8 or claim a visible handoff. A later phase-capability cut can promote input/kinematics, then presentation, effects, combat, round, and resources independently.

## Primary Sources

1. Human Tag teams remap every odd root to the P1 controller and every even root to the P2 controller, then disable AI for those roots: [start.lua lines 250-307](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/external/script/start.lua#L250-L307).
2. `remapInput` maps one logical player slot to another input slot; it does not replace character identity or team order: [script.go lines 5850-5862](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/script.go#L5850-L5862).
3. Each root starts with its own controller slot and enabled key control; Helpers inherit different defaults: [char.go lines 3426-3478](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L3426-L3478).
4. Command reads use the character command list, and effective `Ctrl` is false while standby: [char.go lines 5255-5337](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5255-L5337).
5. Command update walks all loaded roots and Helpers before action preparation/execution; Pause/SuperPause and hitpause have separate buffering rules: [char.go lines 13014-13175](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13014-L13175).
6. The default Tag program treats `teamLeader` as the active player, requires effective control plus a buffered command, then performs TagOut and redirected TagIn; standby partners continue their own state logic: [tag.zss lines 239-327](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/data/tag.zss#L239-L327).
7. Standby roots are excluded from player hit and push candidates: [hit detection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13207-L13228), [push detection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13622-L13643).
8. Standby is not a global draw filter, while camera screen-bound participation excludes standby. This is an inference from [character draw admission](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12649-L12658) and [camera bounds](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9871-L9889).
9. Tag KO/time-over policy evaluates team roots and an explicit `LoseOnKO` option: [system.go lines 3299-3340](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3299-L3340).
10. Power owner and life/power sharing are explicit policies, not consequences of active identity: [power owner](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5396-L5407), [round resource setup](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3935-L3999).

## Local Ownership Inventory

| Axis | Current owner | Blocking fact | Required direction |
| --- | --- | --- | --- |
| Structural roots | `PlayableMatchRuntime.characterRoots`, `RuntimeRootParticipationWorld`, `RuntimeRootSelectionWorld`, `RuntimeTagTeamOrderWorld` | Complete roots, standby, active ids, selection, member order, and leader already exist as separate data. | Preserve stable ids and explicit projections. Do not replace them with one active pointer. |
| Actor scheduling | `PlayableMatchRuntime.actorRunOrderCandidates`, `RuntimeMatchActorAdvanceWorld` | All roots enter RunOrder, but `participationOf` uses `reserveRoots.includes(...)`, not live standby. P1 stays playable after TagOut and P3 stays standby-only after TagIn. | Introduce a versioned per-phase participation policy before full active-root advancement. |
| Command input | `MatchInput`, `RuntimeMatchTickInputWorld`, pause/hitpause branches | Only P1/P2 receive tick stamping and command-buffer writes. Upstream Tag maps one side stream to every same-side root. | Add explicit side-to-root command routing with independent cloned root buffers. |
| Direct input and AI | `RuntimeMatchInputControlWorld`, `advanceIkemenPausedMatch` | Native input/AI handling is a two-actor transaction and runs before Tag controllers. | Keep direct control distinct from command mapping. Define next-tick handoff for the bounded browser route before widening it. |
| Opponent/facing/guard | `opponentForRoot`, `RuntimeMatchFrameStartWorld`, `RuntimeMatchOpponentContextWorld` | CNS opponent selection can see active roots, but frame-start facing, guard-distance, target binding, and interaction contexts remain pair-only. | Select opponents per active root and phase; do not reuse one pair context for plural combat. |
| Effects and targets | `RuntimeEffectActorWorld`, `RuntimeMatchActorRosterWorld`, Helper binding | Stores are fixed `{p1,p2}`. `toEffectActorOwnerKey` maps every owner other than `p2` to `p1`, so P3 effects would alias P1. Helper enumeration and effect summaries are pair-only. | Root-key stores must land before P3 effects, Helpers, Projectiles, Explods, or target lifecycles are enabled. |
| Combat and collision | `RuntimeMatchPostFighterWorld`, `RuntimeMatchInteractionWorld`, `RuntimeMatchCombatBridgeWorld` | One pair owns separation, bindings, guard distance, priority, direct/projectile/helper combat, hitpause, and clamp. | Build deterministic active candidate sets only after root-key effects; retain standby exclusion and explicit `affectteam`. |
| Round and KO | `RuntimeMatchRoundWorld`, `RuntimeRoundSystem` | Timer flags, KO, sound, and winner use P1/P2 life. No Tag `LoseOnKO`, all-member KO, or time-over team aggregation exists. | Add an explicit team defeat policy after combat ownership. |
| Presentation, camera, HUD, audio | `RuntimeMatchPresentationSnapshotWorld`, `RuntimeSnapshotWorld`, `ThreeMugenRenderer`, `DebugPanel`, app HUD, `MugenAudioSystem` | Stage camera/effects and `snapshot.actors` are pair-only; reserves are diagnostic-only; renderer/audio consume actors plus effects; HUD indexes actors 0/1. | Define draw roots, camera roots, and HUD slots separately. Browser proof starts only when this axis changes. |
| Resources | fighter runtime state plus controller ops | Life/power are root-local, but no explicit Tag bank/share owner or team HUD source exists. | Preserve root-local banks first; add PowerShare/LifeShare as independent later policies. |
| Snapshot, reset, trace | `RuntimeMatchResetWorld`, `RuntimeSnapshotWorld`, `RuntimeTrace` | Reset keeps reserve object identity, but snapshots split pair vs reserves and behavior traces ignore `reserveActors`. Current actor-frame gates cannot prove P3 command or state behavior. | Add reserve-root trace frames without changing historical pair semantics, then require reset and invalid-route evidence. |

## Decision

Create Wayfinder 094 as the next implementation ticket: **Model Tag side command routing**.

The slice should:

- publish `RuntimeRootInputRouting/v0` or an equivalently versioned diagnostic that distinguishes side command mapping, direct input control, AI control, standby, and effective control;
- map the P1 stream to present odd roots and the P2 stream to present even roots only for explicit `ikemen-go` Tag mode;
- stamp independent `currentInput` copies and command buffers for mapped roots before actor execution;
- leave direct native input/AI, full `advanceFighter`, effects, combat, round, presentation, HUD, audio discovery, and resources P1/P2-only;
- expose reserve-root actor frames to trace evidence as a separate projection, with no checksum drift for traces that have no reserves;
- require one trace where a standby P3 consumes the mapped side command through bounded CNS while the opposite-side stream cannot trigger it;
- prove reset, mapping isolation, invalid/missing roots, legacy/single-mode stability, and no ownership movement in `RuntimeRootParticipation/v0`.

This slice is an input foundation, not a playable or visible Tag claim. The first honest playable handoff needs a later capability cut for live active-root input/kinematics plus a separate browser-gated presentation cut.

## Ordered Follow-up

1. 094 - side command routing and reserve-root trace observability.
2. Per-phase active-root capability model; remove storage-class participation without enabling blocked controller routes.
3. Bounded next-tick direct input plus kinematics/animation for one Tag leader handoff.
4. Draw/camera presentation of the incoming/outgoing roots with browser screenshots and canvas checks.
5. Root-key effect stores and target lifecycle.
6. Multi-root collision/combat candidates.
7. Team round/KO/time-over policy.
8. Resource banks, sharing, lifebar slots, and broader Tag/Simul/Turns behavior.

## Uncertainty

- Exact Pause/SuperPause/hitpause command buffering remains source-visible but is outside 094 normal-branch scope.
- Coop, challenger, netplay, arbitrary input remaps, and AI command cheating need separate fixtures.
- The default upstream Tag program depends on ZSS and constants not yet executed by the browser; 094 gates only the lower input-routing contract.
- A future visual route must decide how offscreen Tag states are authored without claiming default `tag.zss` parity.

## Claim Ceiling

Allowed after this research: the pinned upstream input policy and local ownership blockers are mapped, and 094 is implementation-ready.

Blocked: P3-P8 direct gameplay, visible Tag handoff, root-key effects, multi-root combat/round/HUD/resources, default `tag.zss`, rollback/netplay, score movement, or full IKEMEN parity.
