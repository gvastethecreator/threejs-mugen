# Daily Roadmap And Architecture Audit - 2026-07-10

Status: planning only

Scope: repository research, architecture, and roadmap reconciliation. No runtime, UI, test, fixture, asset, commit, or push work is part of this audit.

## Executive State

- Branch state at bootstrap: `master...origin/master [ahead 2]`, clean worktree.
- Latest global verified baseline in the repo is 524/524 trace artifacts after the 2026-07-10 runtime, Studio, and renderer closeouts. Entry 332 is only the latest *numbered* backlog item and records its own earlier 523/523 baseline.
- The newest cross-lane closeout is player `SprPriority` draw order. It reaches bounded renderer proof ladder L2; it does not prove equal-priority ties, contact-driven priority changes, stage/effect interleaving, transparent overlap, deterministic L4 baselines, or reference L5 parity.
- Published scores remain unchanged: private sandbox 65/100, practical MUGEN 35/100, MUGEN MVP 20/100, full MUGEN 10-12/100, IKEMEN 6-8/100, Studio/modular 25/100.
- The next evidence-producing sequence selected by this audit starts with a minimal profile/default-source policy that preserves omitted versus authored HitDef priority values, then applies direct, non-projectile `HitDef p1sprpriority` / `p2sprpriority` on accepted hit and guard. It must keep semantic MUGEN priority separate from the Three.js adapter.
- The next architecture-risk cut is `MatchTickSchedule/v0`: record the schedule that actually runs before attempting to reorder it toward the aspirational architecture.
- This audit changes no score and proves no new runtime behavior.

## Reconciled Repo Truth

| Fact | Verified state | Consequence |
| --- | --- | --- |
| Current cursor | Wayfinder 024 follows the player `SprPriority` oracle. | Do not return to Projectile bounds, generic FightFX loading, shared Trust Chain creation, or `RuntimeEffectActorAdvanceWorld`; those gates are closed. |
| HitDef visual priorities | No `p1sprpriority` or `p2sprpriority` field exists in the current typed HitDef compiler/runtime path. Actor `spritePriority` already reaches snapshots, traces, diagnostics, and `CharacterRenderer`. | A narrow compiler -> contact mutation -> trace -> renderer slice can reuse the existing actor channel. |
| Direct combat priority | `RuntimeDirectCombatWorld.resolvePriorityClash` already models attack collision priority/trade. | Do not conflate collision arbitration with `p1sprpriority` / `p2sprpriority`, which mutate draw priority after accepted contact. |
| Renderer | The project installs `three@0.184.0`. Character/effect materials are not one uniform depth policy; Three sorts opaque and transparent queues independently. | Compatibility truth must not be encoded only as z or `renderOrder`; visual evidence must assert the effective queue/material policy. |
| Runtime ownership | `MatchWorld` remains a facade over `PlayableMatchRuntime`; the latter owns the integration root and concrete stores. | More one-callback wrappers are not an architecture win by themselves. Prefer a schedule/ownership slice with a deletion test. |
| Tick order | The desired architecture documents controllers before movement and animation after combat, while the current fighter advance applies kinematics, animation, then active controllers. | Exact tick-order parity remains blocked. Version and trace the current schedule before semantic reordering. |
| Studio | Single-match name/P1/CPU/stage dirty-save-reopen and Trust Chain package/source drilldowns are closed. | The next authoring cut needs a source transaction boundary, not another selection-only field or duplicate status panel. |
| IKEMEN | Scanner/reporting is partial and character-loader-centric. There is no ZSS/Lua execution path. | Scanner expansion remains analyzer work; runtime claims require an explicit executable frontend/profile and gates. |
| Modular core | `ModuleContracts.ts` is metadata-level; there is no real `src/core`, module runtime, or platformer slice. | Extract stable project/asset/evidence/build contracts first; do not genericize the fighting VM. |

## Gaps By Horizon And System

| Horizon | Demonstrated today | Highest-risk remaining gap | Dependency and required proof | Claim still blocked |
| --- | --- | --- | --- | --- |
| Playable sandbox | Native/generated 1v1, imported partial runtime, stage/HUD/debug, browser smoke, deterministic traces. | Unversioned match schedule and renderer composition across players, effects, stage foreground, and transparency. | `MatchTickSchedule/v0`; semantic presentation-order key; desktop/mobile deterministic overlap baseline. | Stable tick-order parity, full presentation parity, release-grade sandbox. |
| MUGEN-lite MVP | Broad partial DEF/AIR/CMD/CNS/SFF/SND/HitDef/Common1 coverage with 524/524 gates. | Parameter-level truth, contact draw priority, hard guard/Common1 ordering, post-KO flow, broader real-package confirmation. | Direct HitDef priority gate; Common1 source/override oracle; guard phase markers; post-KO trace. | Broad KFM compatibility or score movement from this planning pass. |
| MUGEN | Useful subset only. | Exact VM order, helpers/custom states/throws, teams/simul/turns, screenpack/motif/lifebar, palette/audio/effect breadth. | MUGEN-lite exit gates first, then corpus-backed subsystem milestones. | Full MUGEN compatibility. |
| IKEMEN | Source-linked recognized/unsupported findings and bounded FightFX prefix handling. | Package-level stage/system/screenpack scan; ZSS/Lua bytecode; teams, 3D/model/video, rollback/netplay. | Versioned VFS scanner first; separate executable IKEMEN profile only after IR and semantic gates exist. | Any IKEMEN runtime execution or parity. |
| Studio/product | Workbench, Assets, Evidence, Build, Debug, local manifest persistence, exact Trust Chain focus. | `App.ts` coordination concentration; project schema v0; no source write/reimport/conflict/migration/undo contract. | First source identity/fingerprint, conflict, write/reimport, invalidation and rollback; later undo and migration. | Full editor, filesystem project workflow, production publish/export. |
| Assets/provenance | Native/generated assets and some reproducible reports/hashes. | No machine-verifiable license/ownership, input digest, tool/version, transform chain, or public-path hygiene. | `AssetProvenance/v0` plus validation and Studio surfacing. | End-to-end provenance or permission claim. |
| Scanner | Honest manual rules for multiple IKEMEN signals. | Character-loader-only entry, manual upstream mapping, no stage/system/screenpack package graph. | VFS/package scan API; versioned rules; stage-only and system-only fixtures. | Complete package scan or execution support. |
| Modularization | Boundary documents, registry metadata, `check:boundaries` safety net. | No executable shared contracts; many shallow runtime relay seams; fighting types leak into Studio. | Concrete Project/Asset/Evidence/Build contract and stronger import gate before any module runtime. | Generic engine SDK or platformer readiness. |

## Architecture Decisions Proposed

### D1 - Semantic presentation order precedes Three.js order

Status: proposed in `docs/adr/0002-mugen-presentation-order-and-profile-boundaries.md`.

Keep a renderer-independent order record with at least compatibility profile, presentation phase/layer, semantic sprite priority, source kind, blend policy, and an explicit tie policy. Three.js z, `renderOrder`, material queue, `depthTest`, and `depthWrite` are adapter outputs, not compatibility state.

For the immediate direct-HitDef sequence, preserve authored presence through compilation and resolve defaults only at contact through an explicit policy. The MUGEN 1.1 policy uses P1 = 1 and P2 = 0 on accepted hit or guard when omitted. The repo-pinned Ikemen GO snapshot is observed to keep P1 as a sentinel and apply it only when a value exists; upstream intent is not established. Isolate that observed divergence behind a profile seam pending an oracle or maintainer rationale. Do not invent a semantic clamp for these HitDef parameters without a reference oracle.

Tradeoff: this adds a small semantic layer before visual proof, but avoids baking current Three queue behavior into the compatibility model.

### D2 - Version the actual match schedule before changing it

Add `MatchTickSchedule/v0` markers around the phases that currently execute. In v0, phase diagnostics stay outside the legacy canonical behavior-checksum projection and receive a separate schedule assertion, so snapshots and behavior checksums can remain stable. A later ADR may change phase order only with intentional checksum drift and explicit before/after gates.

Tradeoff: the first slice documents an imperfect order, but prevents invisible semantic changes and makes ownership extraction falsifiable.

### D3 - Split Common1 resolution from hard guard behavior

Model three distinct contracts: `StateSourceResolver` selects character override versus common state data with provenance; a compiled state table executes authored logic; `GuardPhase` owns engine-hard behavior and automatic state 120 entry. A single "Common1 supported" claim is too coarse.

Tradeoff: more explicit boundaries, but correct separation of authored CNS/ZSS and engine-owned rules.

### D4 - Replace controller-level support labels with parameter capabilities

Pilot a capability schema on `HitDef` and `Projectile`: profile, parameter, aliases, default, static/dynamic expression support, owner scope, runtime consumer, evidence, and allowed/blocked claim. Compiler, compatibility report, scanner, and docs should derive from the same source.

Tradeoff: schema work before breadth, but it prevents recognized controllers with ignored parameters from appearing fully supported.

### D5 - Separate parsed package, compiled program, and assessment

Target immutable `ParsedCharacterPackage`, fingerprinted/profile-keyed `CompiledCharacterProgram`, and independent `CompatibilityAssessment`. Do not keep runtime IR and mutable assessment inside the parsed model indefinitely.

Tradeoff: migration cost, offset by deterministic cache invalidation and multi-profile compilation.

### D6 - Extract stable product contracts before generic gameplay

The first genuinely shared contracts should be Project, Asset/Provenance, Evidence, Build/QA, and a neutral snapshot envelope. The fighting schedule, CNS/CMD, HitDef, round, helper, target, and projectile semantics remain MUGEN-specific.

Tradeoff: delays the platformer, but produces a non-vacuous boundary gate and reduces `App.ts` coordination debt without premature VM abstraction.

### D7 - Keep IKEMEN scanner and runtime as separate products

Scanner output should include profile/version, source location, dependency graph, and recognized/unsupported/unknown classification. IKEMEN execution begins only with an executable CNS/ZSS frontend and runtime gates; adding regex never changes execution claims or scores.

### D8 - Make provenance permission-aware and content-addressed

`AssetProvenance/v0` should require origin, ownership/license assertion, input digest, tool and version, prompt/config digest where applicable, ordered transforms, output hashes, and a path-redaction/publication policy. Generated/native evidence stays separate from imported compatibility.

## Remaining Roadmap By Phase

| Phase | Dependency | Outcome | Exit evidence |
| --- | --- | --- | --- |
| 0. Control reconciliation | None | One current cursor per lane; global 524/524 distinguished from numbered-entry 523/523; closed gates removed from next lists. | Docs diff only; no score movement. |
| 1. Presentation semantics | Existing actor priority telemetry | Minimal priority profile/default policy, direct `HitDef` p1/p2 contact semantics, then semantic 2D order and deterministic player/effect/stage overlap. | Policy tests, focused compiler/combat tests, required trace, desktop/mobile diagnostics and screenshots, L4 baseline. |
| 2. Schedule and MUGEN-lite hard phases | Stable phase 1 baseline | Versioned tick phases, Common1 source precedence, hard guard ordering, one post-KO slice. | Phase-stamped trace, exact source provenance, ordered controller/state frames, KO timeline artifact. |
| 3. Studio source authoring | Stable manifest and Trust Chain | First source identity/fingerprint, conflict and write/reimport invalidation; later undo and schema migration; then the first state/collision editor. | Persistence/reopen/reimport smoke, source diff, failure recovery, visual proof. |
| 4. MUGEN breadth | MUGEN-lite exit criteria | Helpers/custom states/throws, teams, motif/screenpack/lifebar, broader audio/palette/effect corpus. | Subsystem-specific traces plus permitted local/public-safe corpus evidence. |
| 5. Assets and provenance | Stable project/source schema | Content-addressed provenance, license/ownership record, transform chain and QA failure routing. | Validator report, Studio evidence row, no absolute paths in public bundles. |
| 6. IKEMEN analyzer | Versioned scanner API | Package-level character/stage/system/screenpack dependency graph and source-mapped feature inventory. | Stage-only/system-only scanner fixtures; no runtime claim. |
| 7. IKEMEN runtime | MUGEN kernel and analyzer maturity | Profile-keyed CNS/ZSS executable IR, then teams/screenpack/model/video and later Lua/netplay work. | Dedicated compatibility profile and semantic gates; never inferred from scan coverage. |
| 8. Modular product | Stable project/evidence contracts | Real shared product contracts, stronger boundary gate, then one tiny non-fighting consumer. | Import-boundary proof and unchanged fighting smoke/trace before any platformer claim. |

## Next Ten Agent-Sized Tasks

### 1. Minimal HitDef priority policy seam

- Scope: preserve `p1sprpriority` / `p2sprpriority` as authored-or-omitted through compilation; add a contact-time policy input with profile and resolved-value source (`authored`, `mugen-1.1-default`, or unsupported/preserve-current).
- Likely systems: HitDef typed IR/current-move data, runtime compatibility profile handoff, direct-combat policy tests.
- Acceptance: compilation never materializes a global default; explicit values remain distinguishable from omitted values; unknown/IKEMEN policy cannot silently receive MUGEN defaults.
- Evidence: focused compiler/policy tests and a diagnostic policy fixture; adopt or revise proposed ADR 0002 before implementation.
- Blocked: full parameter capability registry, IKEMEN normative default claim, dynamic expressions, contact mutation.

### 2. Direct HitDef contact sprite priorities

- Dependency: task 1.
- Scope: static direct, non-projectile player and current first-generation helper HitDefs; accepted hit and guard only; resolve via the selected MUGEN 1.1 policy and mutate both contact actors after acceptance.
- Likely systems: `ControllerOps.ts`, `demoFighters.ts`, `HitDefSystem.ts`, `DirectCombatSystem.ts`, helper combat bridge, runtime trace presets and focused tests.
- Acceptance: authored/default source survives trace; hit and guard apply P1/P2 priorities for player and helper direct routes; whiff, eligibility reject, reversal miss, and non-contact do not mutate priority.
- Evidence: focused compiler/direct/helper-combat tests plus one player and one helper required trace showing both actor values before and after contact.
- Blocked: Projectile inheritance, dynamic values, IKEMEN runtime default behavior, equal-priority ties, renderer parity, score movement.

### 3. Semantic 2D presentation order and overlap oracle

- Dependency: task 2.
- Scope: introduce the smallest renderer-independent order key; adapt players first; verify effective material queue/depth policy; add stage layer 0/1 and one effect overlap only after player order is deterministic.
- Acceptance: higher semantic priority draws in front in the same compositing phase; equal priority reports the selected/unknown tie policy; no opaque/transparent queue split invalidates the oracle.
- Evidence: focused order-key tests, desktop/mobile diagnostics, screenshots, and deterministic L4 image baseline.
- Blocked: MUGEN equal-tie parity, `Explod ontop` quirks, afterimages, screenpack composition, L5 reference parity.

### 4. `MatchTickSchedule/v0` diagnostic contract

- Scope: inventory every executed phase, owner, mutable store, and side effect; emit phase diagnostics without reordering behavior and outside the legacy canonical behavior-checksum projection.
- Acceptance: no phase is ownerless; current snapshots and behavior checksums remain stable; a separate schedule assertion exposes desired-vs-actual order mismatch.
- Evidence: focused schedule test plus one diagnostic trace/sidecar showing phase order.
- Blocked: exact MUGEN/IKEMEN tick parity and any schedule correction.

### 5. Common1 `StateSourceResolver` oracle

- Scope: character override versus `stcommon` source selection for state 120 only, including selected file, fingerprint and provenance; do not change guard timing.
- Acceptance: override and fallback fixtures select the correct compiled source and expose it in diagnostics.
- Evidence: focused resolver tests and two source-mapped artifacts.
- Blocked: hard guard order, complete Common1, ZSS execution.

### 6. Engine-owned `GuardPhase` oracle

- Dependency: task 5.
- Scope: expose the order among current authored-state execution, guard flags, proximity decision, and automatic state 120 entry without broad guard rewrites.
- Acceptance: the trace distinguishes authored controller work from engine-owned transition and rejects an intentionally wrong order fixture.
- Evidence: focused guard-phase tests and one required ordered trace.
- Blocked: complete Common1, exact Ikemen/MUGEN identity, broad guard parity.

### 7. One post-KO timeline slice

- Scope: choose KO freeze/finish and `NoKOSlow` only; keep motif, teams, continue flow, and broad audio out.
- Acceptance: KO and time-over have explicit ordered frames; `NoKOSlow` changes only the documented window; no duplicate KO sound emission.
- Evidence: focused round tests and required KO timeline trace.
- Blocked: complete round flow, lifebar/screenpack and team semantics.

### 8. Studio source identity and reimport slice

- Scope: source handle/fingerprint, external-change conflict, one write/reimport transaction, dirty/output invalidation, and rollback on failure; no undo stack or schema migration yet.
- Acceptance: save/reopen/reimport preserves identity; external conflict fails visibly; stale outputs invalidate deterministically; failed write/reimport restores prior state.
- Evidence: model/service tests plus browser smoke around one controlled mutation, conflict, and rollback.
- Blocked: undo/redo, schema migrations, full state/collision editor, multi-project asset database.

### 9. `AssetProvenance/v0`

- Scope: origin, ownership/license, input digest, tool/version, prompt/config digest, transforms, output hashes, QA links and redacted/public paths.
- Acceptance: native and generated records validate without tags; missing permission/digest blocks export readiness; no absolute local path enters a public bundle.
- Evidence: schema/validator tests, one valid and one blocked record, Studio Evidence row if UI is touched.
- Blocked: blanket permission for third-party/commercial assets.

### 10. Package-level IKEMEN scanner entry

- Scope: VFS/package API shared by character, stage, system and screenpack inputs; pin rule provenance to an upstream version; add one stage-only and one system/screenpack-only signal family.
- Acceptance: findings include source location, dependency, profile/version and recognized/unsupported/unknown status.
- Evidence: focused scanner fixtures/tests and report snapshot.
- Blocked: ZSS/Lua execution, stage model/video playback, IKEMEN score movement.

After these ten dependencies, expand the minimal HitDef policy into the parameter-level HitDef/Projectile capability schema from D4, then prove the first concrete shared Project/Evidence/Build contract from D6. Neither is allowed to jump ahead merely to create a nominal registry or empty shared folder.

## Risks And Open Questions

- Root `AGENTS.md` still names the older Common1/FightFX or generic MatchWorld next focus. This automation was authorized to edit only `docs/` and `.scratch/roadmap/`, so the stale root-rule wording remains an explicit G1 follow-up; the current queue owners under the allowed scope are aligned.
- Exact MUGEN 1.1 tie order for equal priority across players, Explods, FightFX, afterimages and `ontop` remains unknown and needs a reference capture/oracle.
- The exact MUGEN guard hard-phase tick relative to authored state execution remains open; Ikemen source is evidence for Ikemen, not proof of MUGEN identity.
- Explicit `F` acceptance for MUGEN 1.1 `HitDef sparkno` is not established by the Elecbyte wording checked here.
- `common1.snd` versus `fight.snd` naming/ownership is inconsistent in Elecbyte docs; retain logical bank/context/provenance rather than hard-coding one filename identity.
- AIR offset, facing, H/V flip, rotation pivot and collision composition need a pixel-level oracle.
- The future 2D MUGEN plane versus 3D stage/content policy remains undecided: one ordered painter pass or a dedicated render target.
- `RuntimeTraceGatePresets.ts`, `qa_traces.cjs`, and the duplicated roadmap history are scaling risks; catalog modularization should preserve names/checksums before any split.

## Primary Sources Consulted

- [Elecbyte MUGEN 1.1 State Controller Reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html) - HitDef contact priority, sound/spark and controller semantics.
- [Elecbyte MUGEN history](https://www.elecbyte.com/mugendocs/history.html) - legacy `sprpriority` rename to `p1sprpriority` and addition of `p2sprpriority`.
- [Elecbyte CNS reference](https://www.elecbyte.com/mugendocs-11b1/cns.html) - `stcommon`, state overrides, Common1 and state sprite priority.
- [Elecbyte AIR reference](https://www.elecbyte.com/mugendocs-11b1/air.html) and [background reference](https://www.elecbyte.com/mugendocs-11b1/bgs.html) - offsets/transforms and stage layer ordering.
- [Repo-pinned Ikemen GO HitDef compilation](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/compiler_functions.go#L1872-L1887), [sentinel initialization](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L751-L752), and [runtime application](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L10790-L10793) - observed default divergence and explicit priority application.
- [Ikemen GO compiler/state runtime at upstream commit 05b7d98a](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go#L6704-L6752) and [guard phase](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11737-L11793) - compiled CNS/ZSS and engine-owned guard ordering.
- [Three.js Object3D](https://threejs.org/docs/pages/Object3D.html), [Material](https://threejs.org/docs/pages/Material.html), and [r184 WebGLRenderLists](https://github.com/mrdoob/three.js/blob/r184/src/renderers/webgl/WebGLRenderLists.js) - render order, depth, and separate opaque/transparent queues.
- [W3C Web Audio 1.1](https://www.w3.org/TR/webaudio-1.1/) - audio context/listener ownership constraints.

## Claim Boundary

Allowed after this audit: the repository has an evidence-backed next plan; the current direct HitDef typed path lacks p1/p2 contact sprite priority; MUGEN 1.1 and the pinned Ikemen snapshot require profile-aware treatment; the renderer needs a semantic order layer; the current schedule and ownership need explicit contracts.

Blocked after this audit: any new parser/runtime/renderer/Studio/scanner behavior, score movement, MUGEN or IKEMEN parity, deterministic equal-priority order, complete package scanning, executable shared-core readiness, or end-to-end asset permission/provenance.

## NO CODE CHANGED

This audit is documentation-only. It changes no source, runtime, UI, tests, fixtures, assets, generated output, commits, or remote state.
