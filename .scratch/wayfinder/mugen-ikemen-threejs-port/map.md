# Wayfinder: MUGEN/IKEMEN Three.js Port

## Destination

Complete the evidence-first route from the private playable sandbox to a fuller MUGEN/IKEMEN-compatible Three.js runtime, Studio editor, and modular browser fighting-game engine.

## Notes

- Repo truth starts in `AGENTS.md`, `CONTEXT.md`, `docs/WORKPLAN.md`, `docs/PROGRESS_TRACKER.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, and `.scratch/roadmap/issues/`.
- Implementation remains feature-sliced, evidence-gated, and committed per completed feature.
- Use primary-source research for external/toolchain/compatibility claims.
- Use trace gates for runtime compatibility claims; use smoke/browser evidence for visible Studio/runtime UI claims.
- Current verified toolchain: TypeScript 7.0.2 with explicit `rootDir: "src"` and no TS6 compatibility alias.

## Decisions So Far

- [Map active-root diagnostic collision projection](tickets/102-map-active-root-diagnostic-collision-projection.md) - presentation v1 adds independent collision ids; push/combat remain blocked. Next: Wayfinder 103.

- [Execute active-root stage constraint phase](tickets/101-execute-active-root-stage-constraint-phase.md) - active-motion roots now apply actor-local stage-X constraints after animation with explicit v2 capability and required isolation trace. Next: Wayfinder 102.

- [Map active-root constraint and collision promotion](tickets/100-map-active-root-constraint-collision-promotion.md) - actor-local stage-X clamp first; plural push, diagnostic collision, and combat remain separate. Next: Wayfinder 101.

- [TypeScript 7 upgrade posture](tickets/001-typescript-7-upgrade-posture.md) - upgrade directly to `typescript@~7.0.2`; keep `rootDir: "src"` explicit; no TS6 compatibility alias unless a future API-importing tool fails.
- [Choose next runtime compatibility gap](tickets/002-next-runtime-compatibility-gap.md) - dynamic `EnvShake` and dynamic `EnvColor value/time/under` now record typed telemetry after expression resolution; no camera/presentation-parity score movement.
- [Choose next runtime gap after EnvColor](tickets/005-next-runtime-gap-after-envcolor.md) - selected dynamic `AttackMulSet` / `DefenceMulSet` typed telemetry; required `synthetic-imported-damage-scale-dynamic.json` is green.
- [Choose next runtime gap after dynamic damage-scale](tickets/006-next-runtime-gap-after-damage-scale.md) - selected dynamic active-state audio typed telemetry; required dynamic sound pan/value traces now record `audio:*` operations.
- [Choose next runtime gap after dynamic audio](tickets/007-next-runtime-gap-after-dynamic-audio.md) - selected and resolved bounded dynamic `SuperPause sound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after SuperPause sound typed audio](tickets/008-next-runtime-gap-after-superpause-sound.md) - selected and resolved bounded direct `HitDef hitsound` / `guardsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after HitDef contact sound typed audio](tickets/009-next-runtime-gap-after-hitdef-contact-sound-audio.md) - selected and resolved bounded player-owned `Projectile hitsound` / `guardsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after Projectile contact sound typed audio](tickets/010-next-runtime-gap-after-projectile-contact-sound-audio.md) - selected and resolved bounded helper-parented/root-owned Projectile guard-contact `guardsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after helper Projectile guard sound typed audio](tickets/011-next-runtime-gap-after-helper-projectile-guard-sound-audio.md) - selected and resolved bounded helper-parented/root-owned Projectile normal-hit GetHitVar `hitsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after helper Projectile normal-hit sound typed audio](tickets/012-next-runtime-gap-after-helper-projectile-normal-hit-sound-audio.md) - selected and resolved bounded helper-parented/root-owned Projectile attacker-side HitCount `hitsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after helper Projectile HitCount sound typed audio](tickets/013-next-runtime-gap-after-helper-projectile-hitcount-sound-audio.md) - selected and resolved bounded player-owned Projectile attacker-side HitCount `hitsound` typed `audio:playsnd` telemetry.
- [Choose next runtime gap after player Projectile HitCount sound typed audio](tickets/014-next-runtime-gap-after-player-projectile-hitcount-sound-audio.md) - selected and resolved the three player-owned Projectile normal-hit GetHitVar sound typed-audio routes.
- [Choose next runtime gap after player Projectile GetHitVar sound typed audio](tickets/015-next-runtime-gap-after-player-projectile-gethitvar-sound-audio.md) - selected and resolved five first-generation helper direct-HitDef/persistence typed contact-audio routes.
- [Choose next runtime gap after helper HitDef persistence sound typed audio](tickets/016-next-runtime-gap-after-helper-hitdef-persistence-sound-audio.md) - selected and resolved actor-scoped numbered Web Audio playback channels.
- [Choose next runtime gap after actor-scoped audio channels](tickets/017-next-runtime-gap-after-actor-scoped-audio-channels.md) - selected and resolved one-shot actor-local channel `0` voice cancellation on accepted hit.
- [Choose next runtime gap after voice channel hit cancellation](tickets/018-next-runtime-gap-after-voice-channel-hit-cancellation.md) - selected and resolved contextual player/common SND ownership with fail-closed common lookup.
- [Choose next runtime gap after contextual SND banks](tickets/019-next-runtime-gap-after-contextual-snd-banks.md) - selected and resolved automatic KO sound plus tick-active global `NoKOSnd` suppression.
- [Choose next gap after KO sound handoff](tickets/020-next-gap-after-ko-sound-handoff.md) - selected and resolved persistent Studio project-name authoring with browser save/reopen proof.
- [Choose next cross-area gap after Studio project naming](tickets/021-next-gap-after-studio-project-naming.md) - selected and resolved persisted scene/matchup authoring with explicit dirty-state lifecycle.
- [Choose next gap after persistent Studio scene authoring](tickets/022-next-gap-after-persistent-studio-scene.md) - selected and resolved the renderer L0-L5 proof ladder plus a desktop/mobile L2 player-axis oracle.
- [Choose next gap after renderer axis oracle](tickets/023-next-gap-after-renderer-axis-oracle.md) - selected and resolved official player SprPriority clamping plus effective desktop/mobile depth-order oracle.
- [Choose next gap after SprPriority draw order](tickets/024-next-gap-after-sprpriority-draw-order.md) - selected static direct HitDef P1/P2 priority policy, contact mutation, and trace evidence as the next R1 presentation-semantic package.
- HitDef contact-priority implementation now passes required player/helper provenance traces inside 526/526 gates; renderer adaptation and score movement remain blocked.
- [Choose next gap after HitDef contact priority](tickets/025-next-gap-after-hitdef-contact-priority.md) - selected and resolved runtime-owned `MugenPresentationOrder/v0`, a separate Three.js r184 adapter, and desktop/mobile stage-back < actor < effect < stage-front evidence.
- [Choose next gap after PresentationOrder v0](tickets/026-next-gap-after-presentation-order-v0.md) - selected and resolved owner-backed `MatchTickSchedule/v0` diagnostics, trace/artifact sidecars, checksum exclusion proof, and explicit current architecture-order divergences.
- [Choose next gap after MatchTickSchedule v0](tickets/027-next-gap-after-match-tick-schedule-v0.md) - selected and resolved explicit character-over-Common1 state precedence with path/fingerprint diagnostics and two required state 120 provenance artifacts.
- [Choose next gap after Common1 state source precedence](tickets/028-next-gap-after-common1-state-source-precedence.md) - selected and resolved owner-backed automatic guard-check schedule stamps with current P1/P2/controller/contact ordering and source-backed parity limits.
- [Choose next gap after automatic guard-start phase order](tickets/029-next-gap-after-auto-guard-phase-order.md) - selected and resolved direct/projectile `InGuardDist` latch lifecycle across active, Pause, and hitpause branches with required trace evidence.
- [Choose next gap after InGuardDist latch lifecycle](tickets/030-next-gap-after-inguarddist-latch.md) - selected and resolved unbiased root-player pre-controller guard checks plus per-player post-controller checks while preserving the then-established P1-started Pause cutoff; ticket 031 supersedes that cutoff.
- [Choose next gap after two-checkpoint automatic guard order](tickets/031-next-gap-after-two-checkpoint-auto-guard.md) - selected and resolved prepared same-tick P1/P2 execution so P1-started Pause no longer cancels P2 before the next paused branch.
- [Choose next gap after same-tick Pause symmetry](tickets/032-next-gap-after-same-tick-pause-symmetry.md) - selected and resolved profile-gated IKEMEN root RunOrder by previous-tick MoveType and lower id while preserving non-IKEMEN order.
- [Choose next gap after profile-gated root RunOrder](tickets/033-next-gap-after-root-run-order.md) - selected and resolved previous-tick root `AssertSpecial` `RunFirst` / `RunLast`, mutual neutralization, and required schedule-phase trace evidence.
- [Choose next gap after IKEMEN root run flags](tickets/034-next-gap-after-ikemen-root-run-flags.md) - selected and resolved one-based two-root `RunOrder` trigger stamping before frame triggers with required CNS branch evidence.
- [Choose next gap after IKEMEN root RunOrder trigger](tickets/035-next-gap-after-ikemen-root-runorder-trigger.md) - selected and resolved shared root/helper priorities, one-based actor RunOrder, and same-tick appended-helper execution without a duplicate helper tick.
- [Choose next gap after IKEMEN helper RunOrder](tickets/036-next-gap-after-ikemen-helper-runorder.md) - selected and resolved separate Pause/SuperPause buffers, same-frame duration/owner arbitration, and SuperPause-first progression; actor-local movetime remains ticket 037.
- [Choose next gap after IKEMEN Pause buffers](tickets/037-next-gap-after-ikemen-pause-buffer.md) - selected and resolved actor-local root/helper pause movement plus bounded same-frame positive `p2defmul` stacking; deferred activation remains ticket 038.
- [Choose next gap after IKEMEN actor-local pause movement](tickets/038-next-gap-after-ikemen-actor-pausemove.md) - selected and resolved deferred paused-pass replacement activation; helper-created pause ownership remains ticket 039.
- [Choose next gap after IKEMEN deferred pause activation](tickets/039-next-gap-after-ikemen-deferred-pause.md) - selected and resolved helper-created Pause/SuperPause identity, root resources, helper audio/movetime, and current-target defense scaling; team breadth remains ticket 040.
- [Choose next gap after IKEMEN helper-owned Pause](tickets/040-next-gap-after-ikemen-helper-pause.md) - selected and resolved profile/config fallback plus opposing root/helper SuperPause defense projection without target memory.
- [Choose next gap after IKEMEN SuperPause team defense](tickets/041-next-gap-after-ikemen-team-defense.md) - selected and resolved interleaved P1-P8 team identity plus complete-character topology shared by TeamSide and SuperPause.
- Runtime claims need required trace artifacts, checksums, and explicit allowed/blocked wording.
- Historical docs can keep superseded evidence, but latest/current docs must not describe closed gaps as still open.

## Decisions So Far, Continued

- [Choose next gap after IKEMEN team topology](tickets/042-next-gap-after-ikemen-team-topology.md) - complete-team enumeration is now distinct from active EnemyNear/P2 eligibility; `RuntimeTeamRoster/v0` exposes the first P1-P4 diagnostic.
- [Choose next gap after team eligibility](tickets/043-next-gap-after-team-eligibility.md) - public `MatchWorld.teamRoster` now consumes a parallel unique-id character registry while the scheduler remains pair-only.
- [Choose next gap after multi-root registry](tickets/044-next-gap-after-multi-root-registry.md) - runtime/snapshot `teamState` now drives public eligibility diagnostics for roots and helpers.
- [Choose next gap after live team state](tickets/045-next-gap-after-live-team-state.md) - explicit IKEMEN matches can now own/reset P3-P8 standby roots and publish them separately from playable/presented actors.
- [Choose next gap after inert roots](tickets/046-next-gap-after-inert-roots.md) - `RuntimeRootParticipation/v0` proves P1/P2 executable ownership versus inert P3-P8 across separate consumer axes.
- [Choose next gap after root activation](tickets/047-next-gap-after-root-activation.md) - choose identity/Partner versus Enemy/P2 eligibility over plural active roots before scheduling.
- [Route root selection into expressions](tickets/048-route-root-selection-into-expressions.md) - consume the public selection matrix in read-only IKEMEN expression contexts while preserving 1v1 gates.
- [Schedule standby roots in explicit IKEMEN CNS](tickets/049-standby-root-cns-scheduling.md) - define bounded P3-P8 CNS execution and same-tick standby invalidation before gameplay consumers.
- [Extract root CNS execution boundary](tickets/050-extract-root-cns-execution-boundary.md) - split monolithic fighter advance before scheduling P3-P8.
- [Schedule standby roots through CNS boundary](tickets/051-schedule-standby-roots-through-cns-boundary.md) - admit P3-P8 to controller-only IKEMEN run order with blocked side effects.
- [Compile bounded TagIn and TagOut](tickets/052-compile-bounded-tagin-tagout.md) - parameterless self-only mutations isolate standby changes; all optional axes fail closed.
- [Execute self TagIn and TagOut](tickets/053-execute-self-tagin-tagout.md) - compile typed caller-only standby changes and prove same-tick live selection.
- [Map Tag partner and PlayerNo identity](tickets/054-map-tag-partner-playerno.md) - define stable partner addressing before optional Tag parameters execute.
- [Execute static Tag partner selection](tickets/055-execute-static-tag-partner.md) - add cyclic same-side partner-only mutation with fail-closed bounds.
- [Execute static Tag self flag](tickets/056-execute-static-tag-self.md) - combine caller and partner standby changes atomically with official defaults.
- [Map Tag state transition order](tickets/057-map-tag-state-transition-order.md) - pin state ownership, defaults, and mutation order before compiling Tag state parameters.
- [Execute static Tag caller state](tickets/058-execute-static-tag-caller-state.md) - add prevalidated caller-owned static state entry without partner breadth.
- [Execute static Tag partner state](tickets/059-execute-static-tag-partner-state.md) - prevalidate selected partner and partner-owned state before one bounded transition.
- [Map Tag control order](tickets/060-map-tag-control-order.md) - pin caller/partner control timing against state entry before implementation.
- [Execute static TagIn control](tickets/061-execute-static-tagin-control.md) - apply exact caller/partner control after prevalidated state transitions.
- [Map Tag member and leader order](tickets/062-map-tag-member-leader-order.md) - separate mutable order/leader identity from stable root slots before execution.
- [Create Tag team order model](tickets/063-create-tag-team-order-model.md) - own explicit Tag mode, mutable member order, and leader identity without slot mutation.
- [Execute static Tag member order](tickets/064-execute-static-tag-member-order.md) - route positive one-based member swaps through explicit Tag order ownership.
- [Execute static TagIn leader](tickets/065-execute-static-tagin-leader.md) - rotate stable same-side PlayerNo to leader with live KO ordering.
- [Map dynamic Tag parameters](tickets/066-map-dynamic-tag-parameters.md) - pin expression timing, coercion, and failure semantics before dynamic execution.
- [Execute dynamic Tag self](tickets/067-execute-dynamic-tag-self.md) - resolve boolean self at runtime while preserving aggregate validation.
- [Execute dynamic TagIn control](tickets/068-execute-dynamic-tagin-control.md) - resolve caller control boolean without widening partner targeting.
- [Execute dynamic TagIn partner control](tickets/069-execute-dynamic-tagin-partner-control.md) - resolve partner control with static partner selection and atomic validation.
- [Execute dynamic Tag caller state](tickets/070-execute-dynamic-tag-caller-state.md) - resolve caller state number before state availability and aggregate mutation.
- [Execute dynamic Tag partner state](tickets/071-execute-dynamic-tag-partner-state.md) - resolve partner state with static partner identity and owned-state validation.
- [Execute dynamic Tag partner selection](tickets/072-execute-dynamic-tag-partner.md) - resolve caller-relative partner ordinal before aggregate target validation.
- [Execute dynamic Tag member order](tickets/073-execute-dynamic-tag-member-order.md) - resolve one-based mutable member position before Tag-order validation.
- [Execute dynamic TagIn leader](tickets/074-execute-dynamic-tagin-leader.md) - resolve stable PlayerNo before same-side leader rotation validation.
- [Map Tag RedirectID mutation ownership](tickets/075-map-tag-redirect-mutation.md) - global numeric root/Helper PlayerID lookup, caller-context expressions, redirect-first failure, and target-owned mutation are pinned.
- [Create IKEMEN character identity boundary](tickets/076-create-ikemen-character-identity.md) - numeric allocation, active lookup, lifecycle, and immutable diagnostics are isolated from actor ids and PlayerNo.
- [Integrate IKEMEN root character identity](tickets/077-integrate-ikemen-root-character-identity.md) - wire P1-P8 plus `ID`/`PlayerNo` reads before mutation redirects.
- [Execute root-only Tag RedirectID](tickets/078-execute-root-tag-redirectid.md) - RedirectID resolves first through live numeric root identity while every later Tag expression stays original-caller-owned.
- [Integrate IKEMEN Helper character identity](tickets/079-integrate-ikemen-helper-character-identity.md) - root-created Helpers receive monotonic PlayerID, inherited PlayerNo, lifecycle lookup, and explicit self/parent/root identity.
- [Map Helper Tag redirect semantics](tickets/080-map-helper-tag-redirect-semantics.md) - state/control/standby are Helper-local while partner/member/leader cross into root team ownership.
- [Execute Helper-local Tag state/control](tickets/081-execute-helper-local-tag-redirect-state-control.md) - explicit `self = 0` admits prevalidated Helper-local state and TagIn control without standby or aggregate effects.
- [Map Helper standby participation](tickets/082-map-helper-standby-participation.md) - standby suppresses direct character interaction and effective control but preserves CNS, projectiles, targets, identity, animation, and drawing.
- [Execute Helper standby participation](tickets/083-execute-helper-standby-participation.md) - true/default Helper self toggles standby after local mutation; direct HitDef and effective control filter while CNS, identity, snapshots, and projectiles remain active.
- [Map initial Helper standby creation](tickets/084-map-helper-initial-standby.md) - optional caller-owned boolean standby applies after identity allocation and before StateDef-over-fallback control, initial state, and same-frame CNS.
- [Execute initial Helper standby creation](tickets/085-execute-helper-initial-standby.md) - explicit IKEMEN root-created Helpers resolve caller-owned static/dynamic standby before final identity visibility and same-tick CNS, with StateDef-over-true control and fail-closed invalid values.
- [Map Helper aggregate Tag ownership](tickets/086-map-helper-aggregate-tag-ownership.md) - partner selects a same-side root through inherited PlayerNo; member/leader mutate root order, with a distinct zero-valued Helper member-position quirk.
- [Execute Helper-relative partner Tag ownership](tickets/087-execute-helper-partner-tag-ownership.md) - live Helper redirects now compose local state/control/self with exact-root-relative partner standby/state/control under atomic validation.
- [Execute Helper-relative TagIn leader ownership](tickets/088-execute-helper-tagin-leader-ownership.md) - stable same-side PlayerNo rotation now composes between Helper-local control and self/partner standby under exact-root atomic validation.
- [Execute Helper-relative Tag member position-one ownership](tickets/089-execute-helper-tag-member-position-one.md) - static/deferred TagIn/TagOut member swaps now originate from mutable position one without assigning Helpers a root-order slot.
- [Audit bounded Helper aggregate Tag closure](tickets/090-audit-helper-aggregate-tag-closure.md) - root-to-Helper aggregate ownership is closed under local atomicity; unredirected Helper-originated self Tag is the next isolated route.
- [Execute Helper-originated self Tag standby](tickets/091-execute-helper-originated-self-tag.md) - Helper CNS now executes concrete self-only TagIn/TagOut with live Helper expressions, owner/state telemetry, standby participation, and reset-safe hook rebinding.
- [Promote Helper-originated Tag trace](tickets/092-promote-helper-originated-tag-trace.md) - required checksum `08014285` gates Helper standby/control order, continued CNS, concrete Tag telemetry, and a preserved parented Projectile.
- [Map active-root gameplay ownership](tickets/093-map-active-root-gameplay-ownership.md) - upstream Tag maps one side stream to every same-side root, while local gameplay remains split across pair-only input, effects, combat, round, presentation, and resource owners.
- [Model Tag side command routing](tickets/094-model-tag-side-command-routing.md) - explicit Tag normal ticks now clone each side stream into independent same-side root command state, with required P2-isolation/P1-to-P3 evidence and all later gameplay owners unchanged.
- [Model active-root phase capabilities](tickets/095-model-active-root-phase-capabilities.md) - explicit IKEMEN registries now reconcile command/CNS/direct-input/AI/kinematics/animation/effect/combat/round/presentation/resource owners without changing execution.
- [Map active-root playable phase promotion](tickets/096-map-active-root-playable-phase-promotion.md) - full fighter advance is rejected for P3-P8; the first executable cut is a precomputed normal-tick `active-motion` phase with restricted motion CNS, kinematics, and animation only.
- [Execute active-root motion phase](tickets/097-execute-active-root-motion-phase.md) - explicit Tag normal ticks now promote already-live P3-P8 roots through restricted motion CNS, local kinematics, and animation under an immutable phase snapshot and required trace evidence.
- [Map active-root presentation promotion](tickets/098-map-active-root-presentation-promotion.md) - draw, shadow, camera, HUD/audio, collision, and reset owners are now separated; the selected first cut is a runtime-owned immediate draw/camera handoff with pair gameplay preserved.
- [Execute active-root presentation handoff](tickets/099-execute-active-root-presentation-handoff.md) - `RuntimeRootPresentation/v0` now drives P3 body/shadow/camera handoff through trace and desktop/mobile browser proof while pair gameplay/HUD ownership stays stable.

## Frontier

- [Define Studio editor authoring spine](tickets/003-studio-editor-authoring-spine.md)
- [Promote root target maintenance](tickets/111-promote-root-target-maintenance.md)

## Not Yet Specified

- Minimum Studio editing surface that graduates the current workbench from evidence shell to practical editor.
- Active-root gameplay follows the ordered phase route fixed by Wayfinder 093 and exposed by 095/097/099; Wayfinder 100 separates stage constraints, body push, hurt/attack collision, and combat admission before any collidable-root implementation.

## Out Of Scope

- Replacing the existing roadmap docs; this map only points at decisions and fog.
- Claiming full MUGEN/IKEMEN parity without current required artifacts.
- Creating broad design docs when the next action is already implementation-ready.
