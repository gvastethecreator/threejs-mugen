# Daily Roadmap And Architecture Audit - 2026-07-11

Status: planning only

Scope: repository research, architecture, and roadmap reconciliation. No runtime, UI, test, fixture, asset, commit, or push work is part of this audit.

## Question

After backlog entry 348 introduced inert IKEMEN P3-P8 roots, which next slice reduces the most architectural risk without accidentally claiming tag gameplay, and which roadmap entries are now obsolete?

## Answer

Create a distinct **I2 IKEMEN bounded-runtime** lane. Its first prefactor is a read-only, plural participation projection over the roots already owned by entry 348; only the following cut may add an explicit batch transition over `teamState.standby`. Keep roots in stable owned storage and keep the existing P1/P2 playable tuple unchanged. Do not admit reserves into input, scheduling, compatibility execution, effects, combat, round, camera, renderer, lifebar, or shared resources in either cut.

This is narrower than “implement TagIn/TagOut.” Pinned IKEMEN GO source shows that `TagIn` and `TagOut` directly clear/set standby, can separately change state, control, partner, leader, and member order, and do not enforce one active root per side. The read model must therefore be plural (`activeRootIdsBySide` or equivalent), and active root, team leader, member order, identity lookup, resource owner, enemy eligibility, and scheduler participation must remain separate concepts.

The previous daily queue is obsolete. Since the 2026-07-10 audit, the repository closed HitDef priority policy/contact, semantic presentation order, `MatchTickSchedule/v0`, Common1 source precedence, automatic guard ordering, and a long IKEMEN RunOrder/Pause/team-topology chain. The highest numbered backlog entry is now 348 and the declared trace aggregate is 538/538, while the package ladder, tactical queue, continuity guide, workplan, scorecard ledger, and local control issue still repeat earlier work as “next.”

After the read-only I2 participation prefactor, return the primary delivery lane to a falsifiable MUGEN-lite gate such as the bounded post-KO / `NoKOSlow` timeline. Activation can then resume behind the named I2 lane. Continued IKEMEN expansion without a named lane, acceptance boundary, or score effect would blur the project’s stated MUGEN-lite priority.

## Verified Repository Facts

| Fact | Evidence | Consequence |
| --- | --- | --- |
| Twenty-three commits landed after the previous automation timestamp. | `git log --since=2026-07-10T09:41:20Z`; commits `5913f9db` through `907ce122`. | The 2026-07-10 next-ten queue is historical, not executable authority. |
| Highest numbered backlog item is 348. | `docs/BUILD_EXECUTION_BACKLOG.md`, entry 348. | Do not use the SprPriority header at the top of the append-style file as the latest numbered truth. |
| Current working tree owns inert reserve roots separately from playable actors. | `PlayableMatchRuntime.reserveRoots`, `MugenSnapshot.reserveActors`, `MatchWorld` registry integration. | Ownership is demonstrated; active gameplay is not. |
| Initial focused tests exercised P3/P4 rather than the full P3-P8/cap matrix. | `PlayableMatchRuntime.test.ts`, `MatchWorld.test.ts`, `RuntimeMatchResetSystem.test.ts`. | Resolved during closeout: focused coverage now proves P3-P8, six-reserve cap, side-local starts, reset, snapshot isolation, and negative schedule/effect-store boundaries; broader participation/lifecycle identity remains next. |
| `reserveActors` currently describes storage location, while a future root may become structurally active without moving into `actors`. | Current snapshot contract plus Wayfinder 046 question. | Add a participation/read-model contract; do not make storage array names double as gameplay state. |
| Registry lists already expose reserve ids to Debug/Studio-adjacent consumers, but selected-actor detail paths still assume playable actors/effects. | `MatchWorld` registry and `App.ts` selection paths. | Do not claim Studio support for reserves without a bound detail route and browser smoke. |

## Primary-Source Findings

### F1 - Standby is a state flag, not a unique active-slot selector

Pinned IKEMEN GO `TagIn` clears `SCF_standby`; `TagOut` sets it. Both can also change state and partner/member data. Neither automatically performs the opposite transition on another root.

Sources:

- [Pinned TagIn/TagOut runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5241-L5398)
- [Pinned standby flag mutation and enemy-cache invalidation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4725-L4738)
- [Official IKEMEN GO TagIn/TagOut documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#tagin)

Roadmap consequence: model plural active roots and an atomic batch transition, but allow a pure TagIn-shaped transition that leaves multiple roots active. A future tag-mode policy may impose cardinality only after `teamMode` exists.

### F2 - Identity, topology, enemy eligibility, and scheduling are different projections

Pinned source keeps direct player/partner lookup separate from enemy eligibility. Standby roots remain addressable by identity/topology routes, while `Enemy` rejects standby/disabled actors and P2 additionally rejects over-KO candidates.

Sources:

- [Pinned Partner/Enemy rules](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4968-L5109)
- [Pinned EnemyNear/P2 selection and distance/id ordering](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13965-L14057)
- [Elecbyte MUGEN 1.1 trigger redirection](https://www.elecbyte.com/mugendocs-11b1/cns.html#trigger-redirection)

Roadmap consequence: keep `findById` / player-number lookup, partner/member topology, enemy/P2 eligibility, active-root projection, and scheduler admission as separate APIs and separate gates.

### F3 - IKEMEN standby does not mean “do not execute CNS”

Pinned IKEMEN GO keeps roots in `CharList.runOrder`; its action preparation/run/finish paths skip disabled actors, not standby actors. Standby removes hit/push/camera/enemy participation, but it is not a general CNS freeze.

Sources:

- [Pinned character run-order/action loop](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13096-L13204)
- [Pinned character action phases](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11544-L12004)
- [Pinned global action/update/collision/camera/draw order](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2587-L2716)

Roadmap consequence: entry 348 intentionally owns inert roots, not IKEMEN standby execution parity. After the structural projection and redirect-policy gates, a separate schedule gate must admit standby roots to CNS execution and prove same-tick standby changes before collision/presentation.

### F4 - Active root, leader, member order, and resources are independent axes

IKEMEN exposes separate leader/member behavior, while power/life sharing depends on team configuration rather than whichever root is visually active.

Sources:

- [Official IKEMEN GO TeamLeader and MemberNo triggers](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29#teamleader)
- [Pinned member/leader state](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6113-L6249)
- [Pinned team-mode/resource setup](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3935-L3997)

Roadmap consequence: defer `teamMode`, member order, leader, lifebar, `powerShare`, and `lifeShare` until configuration/round ownership exists. Never infer them from `activeRoots`.

### F5 - Downstream product contracts have standards-backed constraints

- File-system handles have explicit read/readwrite permission states and user-activation requirements; source identity cannot be represented by a path string alone. [File System Access draft](https://wicg.github.io/file-system-access/)
- IndexedDB transactions are atomic and roll back on abort, which is suitable for the Studio metadata side of a write/reimport boundary; external file writes still need their own recovery protocol. [IndexedDB 3.0](https://www.w3.org/TR/IndexedDB/)
- SPDX 3.0.1 distinguishes immutable content identifiers from external identifiers, supporting the planned content-addressed provenance record. [SPDX contentIdentifier](https://spdx.github.io/spdx-spec/v3.0.1/model/Software/Properties/contentIdentifier/)
- Elecbyte documents `NoKOSlow` as a per-tick assertion preventing end-of-round slow motion, supporting a bounded post-KO timeline gate rather than a broad round rewrite. [Elecbyte State Controller Reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html#assertspecial)

## Architecture Decisions

### D1 - Add I2 without weakening I1

`I1` remains package scanner/reporting. `I2` owns explicit-profile IKEMEN runtime semantics with focused tests/traces and blocked scope. Scanner evidence never becomes I2 evidence, and I2 slices never imply ZSS/Lua, rollback, netplay, or full team-mode support.

### D2 - Use a participation read model before widening the playable tuple

Target a `RuntimeRootParticipation/v0`-style projection with, at minimum, stable id/side, owned, player type, disabled, standby, over-KO, structurally active, and explicit consumer flags or exclusions. The exact type name is open, but `reserveActors` must remain storage/ownership and `activeRoots` must remain a derived semantic projection.

### D3 - Make activation a batch transition, not a singleton setter

The transition input may change one or more root standby values atomically and must return before/after active ids by side. It must validate profile, root identity, side, duplicate ids, and impossible writes. It must not silently tag out a partner or assume one active root per side.

### D4 - Adopt ADR 0002 as implemented

The HitDef policy/contact and renderer-independent presentation-order halves of ADR 0002 landed with focused runtime/trace and browser evidence. Change the ADR from `proposed` to `accepted`, while keeping equal ties, Projectile inheritance, dynamic priority, `Explod ontop`, and full renderer parity explicitly open.

## Remaining Roadmap By Phase

| Phase | Dependency | Outcome | Exit evidence |
| --- | --- | --- | --- |
| 0. G1 reconciliation | Entry 348 | Current owner docs stop selecting gates 334-339 as future work; I1/I2 are distinct. | Docs diff, no score movement. |
| 1. I2 participation prefactor | Entry 348 | Read-only plural participation projection; stable storage and unchanged P1/P2 tuple. | Focused future unit tests; P5-P8/cap/reset/lifecycle matrix; no behavior or trace drift. |
| 2. MUGEN-lite round gate | Existing KO sound/round evidence | Bounded post-KO freeze/finish plus `NoKOSlow`. | Required timeline trace and focused round tests. |
| 3. I2 activation, redirects, and scheduling | Phase 1 | Atomic standby transition; Identity/Partner versus Enemy/P2 matrix; then standby-root CNS schedule and same-tick TagIn/TagOut visibility. | Focused transition/policy tests, schedule diagnostics, required IKEMEN trace. |
| 4. Studio source transaction | Existing local project persistence | Handle/fingerprint/permission, conflict, invalidation, write/reimport recovery. | Service/model tests and browser conflict/rollback smoke. |
| 5. Presentation/MUGEN breadth | Stable MUGEN-lite baseline | One palette or BGCtrl vertical slice, then Projectile/dynamic priority and broader corpus. | Fixture trace plus visual oracle. |
| 6. Assets/provenance | Stable project schema | Permission-aware, content-addressed provenance and QA failure routing. | Validator fixtures and Studio evidence only if surfaced. |
| 7. I1 package scanner | Versioned VFS contract | Character/stage/system/screenpack source graph. | Stage-only and system-only fixtures; no runtime claim. |
| 8. Modular product contract | Studio/provenance contracts stable | One real Project/Evidence/Build contract with MUGEN adapter. | Non-vacuous boundary test and existing fighting gates. |
| 9. IKEMEN team gameplay | I2 schedule/redirect/config gates | Input, effects, combat, round, presentation, lifebar/resources as separate slices. | Dedicated trace/browser gates; no leap to full parity. |

## Immediate Task Order

1. Reconcile canonical docs and create the I2 issue; no code or score movement.
2. Future I2 046p: read-only plural participation/evidence projection, stable storage, and broader lifecycle/reset identity evidence over the proven P3-P8/cap/start base; no mutation, scheduler, or gameplay.
3. Return to R1: one post-KO / `NoKOSlow` timeline gate.
4. Future I2 046a: atomic batch standby transition with no implicit partner transition.
5. Future I2 046b: identity/Partner/Enemy/P2 policy matrix across standby transition.
6. Future I2 046c: include standby roots in IKEMEN schedule/CNS, then gate same-tick TagIn/TagOut visibility before collision/draw.
7. Studio source identity/write-reimport/conflict/rollback.
8. `AssetProvenance/v0` validator.
9. I1 VFS/package scanner entry.
10. One palette or BGCtrl fixture/browser slice, followed by the first concrete Project/Evidence/Build shared contract after its dependencies.

## Uncertainty And Risks

- Whether the first structural transition should be host/test API only or compile `TagIn`/`TagOut`: choose host/test API for 046a and block CNS-controller claims; 046p remains read-only.
- Whether a structurally active reserve remains in `reserveActors`: keep stable storage for 046a; expose active ids separately to prevent accidental rendering.
- No loaded `teamMode` means no source-backed one-active-root invariant.
- Upstream `develop` currently resolves to the repo-pinned SHA `05b7d98`, while the last stable release remains `v0.99.0`; cite the SHA for nightly semantics and re-audit on any pin change. [Pinned commit](https://github.com/ikemen-engine/Ikemen-GO/commit/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703), [stable release](https://github.com/ikemen-engine/Ikemen-GO/releases/tag/v0.99.0)
- `reserveActors` already reaches registry consumers, but no complete Studio detail route or smoke gate exists for reserves.
- P3-P8 construction breadth, cap, starts, reset, and snapshot isolation were closed during audit remediation; participation diagnostics and broader lifecycle/identity cleanup remain next.
- Repeated docs/ledger duplication remains a project-control risk. Prefer concise current overrides and retain old blocks explicitly as history.

## Claim Boundary

Allowed after this audit: the previous queue is stale; entry 348 owns inert additional roots only; a plural read-only participation model is the next safe I2 prefactor; activation remains a separate later cut; scanner and runtime require separate lanes; ADR 0002 can be accepted from landed evidence; scores remain unchanged.

Blocked after this audit: any new runtime behavior, TagIn/TagOut execution, active multi-root gameplay, IKEMEN standby scheduling parity, input/combat/round/presentation/lifebar/resource support, score movement, Studio reserve workflow, or full MUGEN/IKEMEN parity.

## NO CODE CHANGED

This audit is documentation-only. It changes no source, runtime, UI, tests, fixtures, assets, generated output, commits, or remote state.
