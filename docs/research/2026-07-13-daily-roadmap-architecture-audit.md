# Daily Roadmap And Architecture Audit

Date: 2026-07-13
Repository checkpoint: numbered backlog maximum `476`; `576/576` traces, `545` required, as declared by entry 476
Working-tree checkpoint: Wayfinder 127 is open and has uncommitted runtime/test work; it is not a closed gate
Pinned IKEMEN GO revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

After the post-KO, legal MUGEN-lite package, active-root contact, priority, reversal, depth, HitOverride, and guard gates landed, what sequence reduces overfitting risk, keeps the product aimed at a usable MUGEN-lite port, and prepares team/runtime ownership without turning documentation into compatibility evidence?

## Bottom Line

The last successful daily planning checkpoint stopped at entry 411. Current numbered truth is entry 476. The repository has since closed both tasks that were primary on 2026-07-12: entry 456 proves the bounded post-KO / `NoKOSlow` timeline, and entries 457-468 prove a repository-owned CC0 MUGEN-lite package through deterministic ZIP, bounded ingestion, production loading, trace, desktop/mobile rendering, input-driven movement/combat/recovery, multi-frame AIR, and a visible `NoKOSlow` KO.

Entries 412-476 also turn the earlier I2 read-model proposal into bounded direct active-root execution: admission, getter/contact memory, direct hit, priority classes/trades, ReversalDef, logical Z, stage depth, body push, HitOverride, automatic guard scheduling, and the exercised standing/crouching/air guard routes are closed. The uncommitted Wayfinder 127 cut is extending the air-guard contact through a fixture-owned `154 -> 155 -> 52 -> 20` landing route. Preserve it and do not claim it until its own closeout lands.

The next product risk is no longer missing a first legal journey. It is **single-package overfitting plus stale acceptance ownership**. Before more I2 micro-gates, aggregate the existing legal-package proof into one versioned acceptance envelope, adjudicate the MUGEN-lite exit/score criteria without moving scores from this docs pass, and add one independent repository-owned package or presentation route that cannot pass through fixture-specific runtime behavior.

No score moves in this research/docs pass.

## Changes Since The Previous Executions

- The 2026-07-13 automation attempt could not start a local process, so it established no repository checkpoint and modified no files.
- The last successful planning cutoff was 2026-07-12 08:34:43 -03:00. There are 69 commits after that cutoff; HEAD is `95dd9132` (`docs(research): map active root air guard landing`).
- No commits landed after the failed automation timestamp; today's value is recovering repository truth that the failed run could not inspect.
- The maximum numbered entry moved from 411 to 476. Current declared aggregate moved from 543/543 to 576/576, with 545 required.
- The roadmap authorities and issues still route from entry 411, post-KO, the first legal journey, or even older I2 participation/activation work. Those gates are closed and must not be reselected.
- The working tree was already dirty before this docs pass. Runtime/test changes belong to Wayfinder 127; roadmap changes from the 2026-07-12 automation are also still uncommitted. This audit preserves both.

## Demonstrated Versus Desired

| Area | Demonstrated in the repo | Desired next architecture | Claim still blocked |
| --- | --- | --- | --- |
| Private sandbox | Native/generated match plus desktop/mobile smoke remain the stable baseline; the production browser also renders and drives one legal imported package. | One acceptance view that keeps native and imported baselines independently green. | Public/release readiness, touch breadth, production art, broad imported support. |
| MUGEN-lite | One CC0 package crosses DEF/CMD/CNS/AIR/SFF, deterministic ZIP, bounded ingestion, runtime trace, browser input, guard, hit/fall/recovery, multi-frame attack, and `NoKOSlow`. | `CompatibilityJourney/v1` plus one independent legal package or palette/stage route. | Exact Common1 timing, broad package compatibility, score promotion without an explicit adjudication. |
| Broad MUGEN | Many parser/controller/Helper/Projectile gates exist. | Corpus matrix, palette/ACT, stage BGCtrl, screenpack/lifebar, audio and VM breadth, with no per-character patches. | Full MUGEN parity or practical breadth from one package. |
| I1 scanner | Recognized/unsupported/unknown reporting exists and stays separate from runtime. | Versioned package/VFS analysis shared by character, stage, system, and screenpack inputs. | ZSS/Lua/config execution or IKEMEN runtime credit. |
| I2 runtime | Source-pinned scheduling, topology, Tag/Helper ownership, motion, presentation, constraints, body push, direct contact/priority/reversal/depth/HitOverride, and bounded guard routes. | Finish the current fixture-owned landing, then pause micro-matrix expansion; define global assertion and team-round ownership before KO/replacement breadth. | Projectiles/Helpers in plural combat, team defeat/replacement, resources/lifebar, ZSS/Lua, rollback/netplay, full Tag/Simul/Turns. |
| Studio | Persistent project name/scene state and Build/Evidence Trust Chain exist. | Adapter-neutral source identity/fingerprint/permission/conflict/write/reimport/rollback transaction. | Durable editor, undo/migration, file-system parity, fake-green-free export without real persistence. |
| Assets/provenance | Contract intent and generated/imported separation exist. | Permission-aware, content-addressed provenance connected to source transaction and export readiness. | Unknown-license assets, third-party permission, imported-compatibility credit. |
| Modularization | Boundary checker and shared contract registry exist. | Promote one evidence/build record only after two real adapters/consumers prove the seam. | Generic engine, SDK, or platformer from metadata-only contracts. |

## Architecture Decisions Proposed

### A. Aggregate the legal journey behind a deep evidence interface

Constraints: the existing proof spans package bytes, source/license, loader report, runtime trace, compatibility findings, browser steps, visual artifacts, and native-regression evidence. Callers should not need to understand every underlying report shape.

Alternatives:

1. Keep adding unrelated trace and smoke fields. Migration is cheap, but the interface remains as wide as the implementation and cannot answer whether a whole journey is accepted.
2. Recommended: `CompatibilityJourney/v1` references existing immutable artifacts and returns one result with package identity, provenance, loader/runtime/browser gates, unsupported findings, and allowed/blocked claims. The implementation may remain distributed; the interface is the acceptance surface.
3. Move all evidence into a generic shared-core bus now. This offers theoretical reuse but would promote an unproven seam and risks leaking fighting terminology into shared core.

Tradeoff: option 2 adds one aggregation contract and schema test, but gives high leverage and locality without rewriting the existing trace/browser implementations. It becomes a real seam only after at least two journeys or adapters consume it.

### B. Resolve global AssertSpecial ownership before team KO

Verified current shape: the bounded `NoKOSlow` route is closed, but local round ownership captures a P1/P2-derived value when `fight -> ko` begins. Helpers can execute `AssertSpecial`; active-motion roots still exclude it. Elecbyte says flags reset each tick and `nokoslow` applies while asserted. Pinned and current IKEMEN source use a global slot and consult it during slowdown updates.

Alternatives:

1. Keep the current KO-entry latch. This preserves current proof, but freezes P1/P2 ownership and cannot express helper/root deassertion, reassertion, or per-profile policy.
2. Pass every actor snapshot directly into round logic. This is a small migration, but makes the round module own roster/lifecycle filtering and hides tick/order provenance.
3. Recommended ADR candidate: `RuntimeGlobalAssertSpecialWorld/v0`, a MatchWorld reducer of `{tick, actorId, rootId, profile, flag, phase}`. Round logic consumes a snapshot through a profile policy; Projectile remains only a damage source, never the flag owner.

Tradeoff: option 3 adds schema/order/reset work, but concentrates global assertion semantics, supports `NoKOSnd`, `TimerFreeze`, and `RoundNotOver`, and prevents team-KO or Helper/Projectile work from hard-coding an incompatible owner.

Open oracle: IKEMEN comments and its per-tick implementation do not by themselves prove exact MUGEN post-KO sampling. Do not replace the current bounded MUGEN claim until a profile-specific oracle exists.

### C. Make Studio source mutation adapter-neutral

Alternatives:

1. Bind writes directly to the browser File System Access API. Fast for one environment, but permission, missing-source, and archive reimport behavior leak into every caller.
2. Recommended: `SourceTransaction/v0` owns handle id, fingerprint, permission state, expected revision, write/reimport result, invalidation, and rollback. Local archive and file-system adapters satisfy the same interface.
3. Let individual editors write parser-specific files directly. Smallest first edit, highest conflict and corruption risk, and no coherent Build/Evidence invalidation.

Tradeoff: option 2 delays the first source editor slightly, but creates the locality required for conflict handling and makes provenance/export readiness consume one stable result.

### D. Delay shared-core promotion until two adapters exist

The current contract registry is useful metadata, but one adapter is still a hypothetical seam. Promote a Project/Evidence/Build or provenance record only after a MUGEN journey and a second production consumer use it without fighting imports. Do not rename `MugenSnapshot`, renderer, or runtime types into core.

## Prioritized Remaining Roadmap

### Phase 0 - Current cut and control recovery

1. Preserve and close Wayfinder 127 independently; do not let this docs pass modify or validate its code.
2. Reconcile active roadmap authorities to entry 476 and record Wayfinder 127 as open working-tree state.
3. Keep scores unchanged; schedule an explicit milestone/score adjudication instead of inferring movement from documentation.

### Phase 1 - MUGEN-lite evidence generalization

1. Add `CompatibilityJourney/v1` over the existing legal ZIP/trace/browser evidence.
2. Decide whether the demonstrated single-package journey closes the current M2 exit gate or which exact independent evidence is missing.
3. Add a second repository-owned legal package or an ACT/palette vertical slice with different source assumptions and no fixture-specific runtime branches.
4. Keep the native/generated smoke baseline independently green.

### Phase 2 - Product trust and ingestion breadth

1. Build `SourceTransaction/v0` read/conflict/rollback ownership before a source editor.
2. Layer content-addressed `AssetProvenance/v0` over source identity and export readiness.
3. Add I1 `PackageAnalysis/v0` for character, stage, system, and screenpack VFS inputs; scanner remains report-only.

### Phase 3 - Broad MUGEN subset

1. Grow a repository-owned multi-package corpus and coverage matrix.
2. Close palette/ACT and one stage BGCtrl vertical route with browser oracles.
3. Deepen exact VM/tick, custom-state/throw, Helper/Projectile, screenpack/lifebar, and audio breadth as separate evidence packages.
4. Promote practical compatibility only when package breadth and no-per-package-patch evidence cross an explicit threshold.

### Phase 4 - IKEMEN team runtime

1. Accept or replace the global AssertSpecial ADR candidate.
2. Add a read-only `TeamRoundDecision/v0` over explicit root/team state; keep defeat, replacement, presentation, and resources separate.
3. Gate one member-KO/non-defeat case and one side-defeat case before automatic replacement.
4. Add root-key effects, team replacement, lifebar, and resource banks through independent gates.
5. Keep ZSS/Lua, rollback/netplay, broad Tag/Simul/Turns, and exact presentation last.

### Phase 5 - Modular product extraction

1. Promote one Project/Evidence/Build or provenance record with two real adapters/consumers.
2. Strengthen boundary checks and preserve fighting trace/smoke.
3. Start no non-fighting runtime until the existing module contract's platformer gate is actually satisfied.

## Next Ten Tasks Ready For Future Agents

### 1. Close Wayfinder 127 without scope widening

- Scope: current uncommitted fixture-owned active-root `154 -> 155 -> 52 -> 20` air-guard landing.
- Acceptance: exactly one P4-to-P3 zero-chip guard, authored controller order, final controlled standing state, stable Pair/Single and prior guard gates.
- Evidence: focused tests, required trace, full runtime closeout declared by the implementation owner.
- Blocked: generic aerial physics/landing, exact Common1 timing, Projectiles/Helpers, team KO, score movement.

### 2. `CompatibilityJourney/v1` acceptance envelope

- Scope: aggregate entries 457-468 artifact references without duplicating trace, loader, or smoke implementation.
- Acceptance: package/license/digest, loader result, unsupported findings, runtime trace, browser proof, native regression, and claim pair are addressable through one immutable result.
- Evidence: schema/aggregation tests and one serialized legal-journey report; no score movement from the contract alone.
- Blocked: broad compatibility, generic shared core, new runtime behavior.

### 3. MUGEN-lite milestone and score adjudication

- Dependency: task 2.
- Scope: compare current evidence against the written M2 and 36-55 band exits.
- Acceptance: either move the milestone/score with named pre-existing evidence under a dedicated evidence review, or record the exact missing gate; never leave an implicit contradiction.
- Evidence: scorecard decision note plus linked artifact ids; no implementation claim.
- Blocked: score inflation from document count or one synthetic trace.

### 4. Independent legal compatibility journey

- Dependency: task 2.
- Scope: a second repository-authored/CC0 package with materially different localcoord, palette/SFF, controller, or stage assumptions.
- Acceptance: production loader and runtime contain no package-id/path branch; unsupported features remain visible; core route or selected vertical route is deterministic.
- Evidence: deterministic ZIP, compatibility report, required trace, and smoke when visible.
- Blocked: third-party/commercial assets, broad corpus parity from two packages.

### 5. ACT/palette vertical slice

- Scope: one authored palette selection crosses package parsing, sprite decode, runtime selection, and Three.js projection.
- Acceptance: exact indexed-color expectation and desktop/mobile pixel oracle; unchanged default palette path.
- Evidence: focused parser/adapter tests, trace only if semantics change, browser smoke and inspected screenshots.
- Blocked: full SFF v2 palette behavior, RemapPal/PalFX interaction breadth, visual parity.

### 6. `SourceTransaction/v0` conflict read model

- Scope: source id, fingerprint, permission, unchanged/changed/missing state, expected revision, safe next action; no editor writes yet.
- Acceptance: stale or missing source fails closed and leaves project/build evidence coherent.
- Evidence: model/service tests plus Studio smoke if surfaced.
- Blocked: full write/reimport, undo, migration, file-system parity.

### 7. `AssetProvenance/v0`

- Dependency: task 6 identity/permission vocabulary.
- Scope: origin/license, input/tool/config/transform/output digests, atlas/collision/QA/playtest links, local-path redaction.
- Acceptance: missing permission or digest blocks export readiness; repository-owned example passes.
- Evidence: validator fixtures and manifest snapshot; Studio smoke only if visible.
- Blocked: legal certification, third-party permission, imported compatibility credit.

### 8. I1 `PackageAnalysis/v0`

- Scope: VFS entry shared by character, stage, system, and screenpack scanners.
- Acceptance: one stage-only and one system/screenpack-only source-mapped family; every finding is recognized, unsupported, or unknown.
- Evidence: focused scanner tests and report snapshots.
- Blocked: runtime execution, ZSS/Lua, rollback/netplay claims.

### 9. Global AssertSpecial ADR and reducer prefactor

- Dependency: current Wayfinder 127 closed; execute before I2 team round/KO widening, not before the MUGEN-lite evidence tasks.
- Scope: decide tick reset, actor eligibility, profile policy, pause/hitpause phase, and provenance for global flags.
- Acceptance: accepted ADR or explicit rejection; if implemented later, direct current `NoKOSlow` stays green and a Helper-originated lethal-Projectile scenario has positive/negative evidence.
- Evidence: pinned/current source note, profile table, focused reducer tests, required trace only when behavior changes.
- Blocked: automatic team replacement, broad Projectile/Helper combat, exact MUGEN parity without oracle.

### 10. `TeamRoundDecision/v0`

- Dependency: task 9 decision and current direct active-root combat stable.
- Scope: read-only side defeat and replacement candidates from explicit team mode, root life/over-KO/standby/disabled state, and member order.
- Acceptance: one member KO does not imply side defeat when a valid continuation exists; Single remains unchanged; no mutation or presentation ownership.
- Evidence: table-driven decision tests and serialized diagnostics; stable existing traces.
- Blocked: Tag choreography, lifebar/resources, automatic replacement, rollback/netplay.

## Verified Primary-Source Facts

1. Elecbyte defines HitDef `guardflag` as a combination of high, low, and air flags; `M` is high plus low, omission makes the attack unguardable, and `affectteam` defaults to enemy: [MUGEN 1.1 State Controller Reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html#hitdef).
2. Elecbyte says special assertions are reset every tick and `nokoslow` prevents end-of-round slow motion while asserted: [AssertSpecial](https://www.elecbyte.com/mugendocs-11b1/sctrls.html#assertspecial).
3. Pinned IKEMEN player hit detection rejects standby/disabled getters, runs player hit detection in sorted getter order, and runs Projectile detection separately afterward: [getter filter](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13207-L13216), [collision loops](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13922-L13931).
4. Pinned IKEMEN resets `inguarddist` before hit detection, enters state 120 from held-back control when the flag is set, and recomputes the flag during detection: [reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12010-L12016), [guard entry](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11563-L11568), [guard-distance latch](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13257-L13261).
5. Pinned IKEMEN's generic aerial-physics landing changes to state 52 only after position update when physics is `A`, vertical velocity is descending, and ground has been reached: [aerial landing](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11842-L11849). The current Wayfinder 127 fixture uses authored `physics = N` controllers instead; therefore its future claim must remain fixture-owned, not generic physics parity.
6. Current IKEMEN GO compiles `NoKOSlow` as a global assertion and checks it during slowdown updates: [compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/8dbd8636752b9acb545165d0f8bc7a02a936200c/src/compiler_functions.go#L165-L185), [runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/8dbd8636752b9acb545165d0f8bc7a02a936200c/src/bytecode.go#L5002-L5026), [speed loop](https://github.com/ikemen-engine/Ikemen-GO/blob/8dbd8636752b9acb545165d0f8bc7a02a936200c/src/system.go#L2725-L2740).

## Inferences And Open Questions

- Inference: the project has crossed the written single-package M2 evidence shape, but a docs-only run should not silently award score movement. A dedicated adjudication must either accept that evidence or name the missing independence criterion.
- Inference: more adjacent I2 guard-matrix traces now have lower product leverage than a second legal-package/palette route, although the already-started Wayfinder 127 should finish cleanly.
- Inference: global assertion provenance is a prerequisite for honest Helper/Projectile/team KO semantics, but not a reason to reopen the already-proven direct `NoKOSlow` route.
- Open: whether a second full journey or one materially independent palette/stage route is the minimum evidence needed for practical-MVP promotion.
- Open: exact MUGEN post-KO sampling for `NoKOSlow`; IKEMEN's current implementation is not a MUGEN oracle.
- Open: which root/helper states contribute global assertions during Pause, SuperPause, HitPause, standby, disabled, and over-KO phases.
- Open: whether Studio source transaction or provenance should provide the first second adapter for a future shared evidence/build contract.

## No-Code Statement

This audit changes roadmap/research/issue documentation only. It does not modify source, runtime, UI, tests, fixtures, assets, commits, or remote state. Code suites were not run because current runtime/test changes belong to an independent in-progress cut.
