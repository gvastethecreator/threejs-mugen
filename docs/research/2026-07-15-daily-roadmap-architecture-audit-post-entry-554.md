# Daily roadmap and architecture audit: post-Entry-554 frontier

Date: 2026-07-15

Scope: research, architecture, roadmap, ADRs, and local task contracts only.
No runtime, UI, source, test, asset, commit, or push work is part of this audit.

## Executive answer

The numbered execution ledger still ends at Entry 554 and 617/617 traces, but
the real branch continued for 30 commits after that closeout. At audited HEAD
05d851373f273cb5ec86dff9b840d82a45c49e21, the latest committed report proves
633/633 traces: 599 required, 34 optional, zero skipped. It closes bounded root
and helper RedirectID routes through the auxiliary Target resource family. It
does not create Entries 555 onward, move a score, or prove broad compatibility.

The honest cursor is therefore:

> Post-Entry-554 report frontier at HEAD 05d85137, with latest declared
> aggregate 633/633. Entry 554 remains the maximum numbered backlog entry.

The next useful cut is not another isolated Target controller. First restore
control-plane consistency and materialize a stable corpus snapshot. Then accept
or replace proposed ADR 0006 and use a deep redirected-target dispatch lease to
make destination identity, target selection, state ownership, mutation
writeback, and telemetry explicit. In parallel, turn Turns continuation into a
true preflight/commit transaction and resolve State 5900 plus RoundState phase
policy before widening round claims.

Scores remain:

- Private playable sandbox: 65/100.
- Practical MUGEN compatibility: 36/100.
- MUGEN 1.0/1.1 MVP: 20/100.
- Full MUGEN port: 10-12/100.
- IKEMEN-GO-class port: 6-8/100.
- Creator Studio: 25/100.

The scorecard also carries a separate modular-engine estimate of 10/100 in its
detailed section. Its summary row combines Studio and modular work, which is a
control ambiguity to resolve; it is not evidence for a score change.

## Baseline and changes since the previous automation run

Previous automation cutoff: 2026-07-15T11:17:12.950Z.

Facts verified from the current repo:

- 43 commits are reachable after the cutoff.
- Entry 554 is still the highest numeric heading in
  docs/BUILD_EXECUTION_BACKLOG.md.
- 30 commits follow the Entry 554 closeout commit 94eabd8c.
- The post-554 chain closes TargetDrop, TargetBind, TargetState,
  BindToTarget, helper-to-root Target routes, helper-to-helper Target routes,
  helper auxiliary Target resources, and root auxiliary Target resources at
  bounded trace ceilings.
- The latest report,
  docs/reports/2026-07-15-target-auxiliary-resource-redirectid-closeout.md,
  declares 633/633 traces, 718/718 affected tests, TypeScript, build,
  boundaries, and syntax checks green.
- Wayfinder tickets 195-198 are resolved, but the numbered backlog and several
  roadmap owners still point to Entry 549 or Entry 554.
- No score moved after Entry 530's written Practical MUGEN 35 to 36
  adjudication.

Changes relative to the prior Entry-549 audit:

1. The reserved State -1 TargetPowerAdd work is no longer open.
2. Root active and State -1 TargetLifeAdd, TargetDrop, TargetBind,
   TargetState, BindToTarget, velocity, facing, power, and auxiliary-resource
   families have bounded RedirectID evidence.
3. Helper-originated RedirectID now reaches root and helper destinations for a
   substantial Target and binding subset.
4. Helper-destination TargetState is still explicitly blocked.
5. The duplicated dispatch seam is now larger than active versus State -1:
   it spans root/helper callers, root/helper destinations, state ownership,
   wrapper writeback, and telemetry attribution.
6. Turns atomicity, RoundState, corpus materialization, evidence-backed Studio
   greens, one releasable asset record, a scanner consumer, and a real shared
   Evidence contract did not move.

## Evidence classification

### Verified facts

- Elecbyte defines TargetState as changing all selected targets to the
  requested state, with optional target ID filtering.
- Elecbyte defines RoundState values 0 pre-intro, 1 intro, 2 fight, 3
  pre-over, and 4 over.
- Elecbyte describes RoundsExisted plus an override of Initialize state 5900
  as the Turns-mode entry hook.
- The repo's ExpressionEvaluator currently returns 2 unconditionally for
  RoundState.
- The pinned local Ikemen source function getRedirectedChar evaluates
  RedirectID on the caller and resolves the result through the global player ID
  registry.
- The same source runs TargetState against the redirected actor's target store,
  and targetState derives state ownership from that redirected actor's current
  state block.
- The local runtime blocks helper-destination TargetState, converts redirected
  helper telemetry to its root, and commits wrapper state for the destination
  plus every candidate helper after redirected helper dispatch.
- RuntimeTurnsContinuationWorld prepares decision, handoff, recovery,
  resources, and State 5900, but PlayableMatchRuntime applies the handoff before
  it validates the resulting active roots.
- CompatibilityCorpus/v0 and PackageAnalysis/v0 include generatedAt inside the
  payload they hash, so observation time changes their checksum even when the
  semantic evidence is unchanged.
- StudioModel marks Playable Match and Architecture Boundaries as ok with
  symbolic evidence IDs, not verified artifact freshness.

### Inferences

- A helper-destination TargetState route is likely valid IKEMEN behavior, but
  implementing it safely requires state-program ownership, lifetime, SelfState
  return, and destroyed-helper policy. Resolving a PlayerID alone is
  insufficient.
- The current helper wrapper writeback is broader than necessary. It can hide
  accidental mutations and makes locality difficult to prove, although it does
  not by itself demonstrate a user-visible bug.
- A small callback extraction would not be a deep Module. The useful Seam must
  hide identity, candidate projection, state owner, mutation set, commit, and
  telemetry behind one Interface.
- Missing character-local State 5900 should not automatically mean the
  transition is impossible because Elecbyte documents Common1 state 5900 and
  character overrides. Exact repo loader precedence still needs a source-backed
  gate.
- 633 traces increase breadth inside a RedirectID family but do not supply a
  second independent legal package or a materialized compatibility denominator.

### Open questions

1. The issue 07 header declares Ikemen revision
   05b7d98af690c73c7bffe5cb4f4eeb6933fa2703, while the current shallow local
   reference is 044da72008b8ba13caf7b0f820526ce16e955fb3. Which revision owns
   future normative claims?
2. Does root-originated RedirectID to a helper need to be supported for this
   profile, and in which controller phases?
3. For redirected TargetState, is the state owner the destination actor's
   current state-program owner, its root character, or another namespace after
   a prior custom-state transfer?
4. Which actors actually need State 5900 during a Turns continuation: incoming
   roots only, all roots, or all live character actors?
5. Does the merged state table already include Common1 state 5900, and is an
   animation numbered 5900 ever valid evidence for state availability?
6. What ordering, selection, and random policy applies when one destination
   owns several targets with the same ID?
7. Should recursive RedirectID be evaluated once from the original caller or
   recursively from each redirected destination?
8. Which first-party or independently legal package route is materially
   independent enough to support the next score adjudication?

## Gap map by horizon and system

| Horizon | Demonstrated boundary | Dominant gaps | Claim ceiling |
| --- | --- | --- | --- |
| Playable sandbox | Private local match, authored/generated roster and stage, HUD/debug/Studio surfaces, score 65. | Preserve browser smoke for visible changes; replace symbolic readiness with fresh evidence; prove one releasable asset record. | Private sandbox only; no public-product stability or render parity. |
| MUGEN-lite MVP | KFM/Common1-style routes, first corpus index, legal stage journey, Practical MUGEN 36. | Materialized corpus snapshot, independent legal breadth, rebuild/freshness proof, written readjudication. | Bounded routes, not broad package compatibility. |
| MUGEN 1.0/1.1 | Parser/runtime/render/audio/palette and combat subsets, MVP 20. | Exact VM/tick order, complete common-state resolution, helper/projectile/target breadth, screenpacks, FightFX/audio/palette depth. | No 1.0/1.1 parity claim. |
| Full MUGEN | Many narrow controller and trace gates, score 10-12. | Corpus diversity, failure taxonomy, package independence, renderer/audio/system breadth, long-session stability. | No full port or per-character-patch-free breadth. |
| IKEMEN runtime | Explicit profile, multi-root topology, bounded Turns and root/helper RedirectID, score 6-8. | Helper State -1, helper TargetState ownership, root-to-helper policy, recursive redirects, exact target order, Projectile/team/neutral ownership, round phases, rollback/netplay. | No IKEMEN support claim, ZSS/Lua runtime, rollback, or netplay. |
| Creator Studio | Semantic preflight and bounded folder write/reimport, score 25. | GateEvidenceResult, freshness, SourceWriteReceipt, compensating restore, real export trust. | UI/workflow prototype; no evidence-backed product readiness. |
| Assets/provenance | AssetProvenance/v2 diagnostic record. | Separate release policy, complete first-party/generated record, digest/license/transform/QA/playtest closure, public-path redaction. | No legal approval, commercial assets, or imported-MUGEN credit. |
| Scanner | PackageAnalysis/v0 static scan. | Stable source digest, analyzer/ruleset/upstream identity, semantic checksum, nested validation, Studio consumer, additional source-backed signals. | Scanner-only; recognition does not imply execution. |
| Modular engine | Boundary guard plus metadata registry; detailed estimate 10. | Two real consumers, stable evidence contract, explicit MUGEN Adapter, keep/delete rationale. | No reusable multi-genre engine or platformer runtime. |
| Three.js renderer | No new renderer change or regression was found in this audit. | Existing render/presentation parity remains a separate evidence lane. | No score or renderer-parity movement from RedirectID work. |

## Architecture decisions

### Decision A: name the unnumbered frontier explicitly

Recommended:

- Preserve Entry 554 as the maximum numeric backlog entry.
- Record current truth as a post-Entry-554 report frontier with HEAD and latest
  aggregate.
- Do not synthesize Entries 555 onward from commit history.
- Add a control rule: every implementation closeout either appends one numbered
  backlog entry in the same change or labels itself an unnumbered checkpoint
  whose claims cannot silently replace the numeric ledger.

Tradeoff: this exposes a split cursor instead of pretending the ledger is
complete, but it preserves auditability and prevents number collisions.

### Decision B: use a redirected-target dispatch lease

Candidate Module: RuntimeRedirectedTargetDispatch.

Candidate Interface:

1. resolve(request) returns either a fail-closed diagnostic or a lease.
2. The lease exposes destination identity, state-program owner, selected target
   identities, phase, and telemetry attribution.
3. execute(command) returns an explicit mutation set plus events.
4. commit(result) writes only actors named by the mutation set and rejects stale
   actor revisions.

The root and helper paths are real Adapters. The Interface is intentionally
small; the Module is deep because it hides player-ID resolution, target-store
selection, target-ID/index filtering, custom-state ownership, mutation
writeback, and telemetry.

Design alternatives:

| Alternative | Depth | Locality | Leverage | Test surface | Migration cost | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| A. Shared callback bundle for candidate selection | Low | Improves one duplicate block; writeback and telemetry stay scattered. | Low | Small characterization suite. | Low | Reject as final design; acceptable only as a temporary step. |
| B. Dispatch lease with explicit mutation set | High | Root/helper and active/State -1 policies become local. | High across Target, binding, telemetry, and future phases. | Characterization plus adapter, mutation, stale-lease, and trace tests. | Medium | Recommended in proposed ADR 0006. |
| C. Immutable command to patch/event transaction | Highest | Excellent; no direct mutation escapes. | Highest for replay, rollback, and netplay. | Broad patch application and ordering tests. | High | Preserve as later evolution, especially for Turns and rollback. |

Deletion test: deleting the proposed Module would force player-ID resolution,
candidate projection, state-owner choice, writeback scope, and telemetry back
into at least PlayableMatchRuntime, HelperSystem, and state-program dispatch.
That is evidence of a real Seam rather than an abstraction with one
implementation.

### Decision C: make mutation scope explicit

Do not commit every helper wrapper and do not assume only the destination
mutates. Each operation must report its dirty actors:

- TargetLife/Power/Vel/Facing/resource operations: selected targets.
- TargetBind: destination target store plus selected target binding state.
- BindToTarget: redirected destination actor, and any target state the concrete
  operation changes.
- TargetDrop: destination target store and only affected binding records.
- TargetState: selected targets plus explicit state-owner metadata.

This decision is a prerequisite for reliable trace attribution and future
rollback; it does not itself expand compatibility.

### Decision D: keep helper-destination TargetState as a separate ADR gate

Before implementation, define:

- the destination actor's current state-program owner;
- the selected target's new custom-state owner;
- lookup precedence for helper/root/Common1 state tables;
- SelfState return;
- helper destruction and stale PlayerID behavior;
- telemetry identity and mutation scope.

The current fail-closed path is preferable to guessing.

### Decision E: make Turns a revisioned transaction

Recommended Interface:

- prepare(snapshot) produces a plan with expected actor/team/round/resource
  revisions, next active roots, State 5900 source, resource reset, round
  context, and all diagnostics.
- commit(plan) first rechecks every revision and then applies one ordered
  transaction.
- Any preflight or revision failure returns a byte-for-byte equivalent
  observable snapshot and no handoff mutation.

Alternative 1, rollback after the existing mutation sequence, is less safe
because new mutable surfaces can be omitted. Alternative 2, immutable patch
application, is the strongest long-term design but carries a larger migration.
The revisioned plan is the best immediate balance.

### Decision F: model round phase before exposing RoundState claims

RuntimeRoundPhase/v0 should represent Elecbyte's 0-4 observable phases and
derive RoundState from the active phase. State 5900 source policy must be
resolved first because entry into an incoming Turns actor happens around the
pre-intro/intro boundary. Round outcome, MatchOver, win poses, and State 5900
remain distinct concepts.

### Decision G: separate semantic identity from observation metadata

CompatibilityCorpusSnapshot/v1 and PackageAnalysis/v1 should expose:

- semanticDigest: hash of canonical semantic content;
- generatedAt/observedAt: non-identity metadata;
- source digest(s), tool/ruleset version, and pinned upstream identity;
- nested schema validation and fail-closed parsing;
- artifact paths or stable artifact IDs;
- freshness policy.

RFC 8785 is a candidate canonicalization reference, not a current conformance
claim. A project-specific stable serializer may remain valid if it is
versioned, deterministic, tested across rebuilds, and not described as JCS.

### Decision H: promote shared Evidence only after two real consumers

GateEvidenceResult/v0 should first be produced and consumed by Studio Build and
Evidence, with PackageAnalysis and asset release as additional producers.
Only then consider EvidenceContract/v0 in shared engine space. The shared
contract may include status, blockers, freshness, target, action, artifact
identity, and digest; it must exclude CNS, CMD, HitDef, Common1, round, helper,
and target vocabulary.

## Prioritized remaining roadmap

### Phase 0: repair control truth

1. Publish the post-Entry-554 frontier consistently.
2. Define numbered versus unnumbered checkpoint policy.
3. Reconcile the declared and local Ikemen source revisions before new
   normative implementation claims.

### Phase 1: stabilize the compatibility denominator

4. Materialize CompatibilityCorpusSnapshot/v1.
5. Prove deterministic rebuild and freshness.
6. Add one materially independent, repository-owned or independently legal
   package/stage route.
7. Readjudicate scores only against the written band.

### Phase 2: reduce RedirectID architectural risk

8. Accept or replace ADR 0006.
9. Characterize all four proven caller/destination paths.
10. Introduce identity/candidate/state-owner lease semantics.
11. Add operation-specific mutation sets and full telemetry identity.
12. Migrate root active, root State -1, helper-to-root, then
    helper-to-helper adapters without claim widening.
13. Decide helper TargetState, remaining Set/Score variants, recursive
    redirects, and exact target ordering as separate gates.

### Phase 3: close Turns and round observability

14. Build RuntimeTurnsTransitionPlan/v1 with full preflight.
15. Decide State 5900 source/fallback policy.
16. Add RuntimeRoundPhase/v0 and dynamic RoundState.
17. Prove failure no-op and exact 1 to 2 to 3 continuation evidence.

### Phase 4: turn product metadata into trust evidence

18. GateEvidenceResult/v0.
19. SourceWriteReceipt/v0 plus compensating restore.
20. PackageAnalysis/v1 plus one Studio consumer.
21. AssetReleasePolicy/v0 plus one complete first-party/generated record.
22. EvidenceContract/v0 only after two production consumers.

### Later horizons

- Expand MUGEN through independent package breadth, exact Common1 and VM
  behavior, screenpacks, FightFX/audio/palette, helpers, projectiles, throws,
  and failure taxonomy.
- Expand IKEMEN only through explicit source-pinned runtime gates; keep
  ZSS/Lua, model stages, rollback, and netplay blocked until their dependencies
  exist.
- Expand scanner signals before execution.
- Revisit Three.js/render parity only when a visible renderer gate or regression
  provides evidence; do not couple it to RedirectID refactors.
- Treat platformer and multi-genre work as future consumers of proven shared
  contracts, not as reasons to generalize fighting internals now.

## Next 30 execution-ready tasks

| ID | Depends on | Scope and probable systems/files | Acceptance and required evidence | Risk and allowed/blocked claim |
| --- | --- | --- | --- | --- |
| T01 Control frontier | none | Reconcile Progress System, Execution Board, Package Milestones, Next Build, Delivery, Continuity, Scorecard, Release Targets, Tracker, Workplan, and issues 01/06/07. | Every active override says maximum numbered Entry 554, post-554 HEAD/report frontier 633/633, and unchanged scores; rg audit plus diff check. | Low. Allows only an accurate roadmap cursor. |
| T02 Checkpoint protocol | T01 | ROADMAP_PROGRESS_SYSTEM, ADR/control issue, closeout template. | Written rule distinguishes numbered backlog entries from unnumbered checkpoints and forbids silent score/cursor replacement; reproduce the 554 to 633 case. | Low. No compatibility claim. |
| T03 Ikemen pin reconciliation | T01 | Issue 07, IKEMEN reference docs, local ref metadata. | Select one normative revision or document a controlled upgrade; record commit, source paths, provenance, and drift policy. | High semantic drift. Allows source-pinned research only. |
| T04 Corpus snapshot schema | T02 | CompatibilityCorpus, journey schemas, docs/evidence artifact contract. | v1 separates semanticDigest from observedAt and names exact package, route, license, unsupported, and artifact identities; schema review plus tamper cases. | Medium. No score movement. |
| T05 Corpus materialization | T04 | Artifact writer/rebuilder and evidence storage path. | A checked or exported JSON artifact rebuilds byte-for-byte semantically from the same inputs; freshness and missing-artifact failures are visible. | Medium. Allows a stable denominator, not breadth. |
| T06 Independent legal route | T05 | One repository-owned or independently legal character/stage package journey. | Loader, runtime trace, browser proof, unsupported density, license/availability record, and snapshot update; no third-party commercial asset. | High licensing/independence risk. Allows only that route. |
| T07 Score readjudication | T06 | Scorecard and written band criteria. | A separate adjudication maps the new snapshot to the existing rubric and lists allowed/blocked claims; score changes only if a threshold is actually met. | High overclaim risk. |
| T08 Redirect characterization | T03 | PlayableMatchRuntime, HelperSystem, TargetSystem, trace presets/tests. | Baseline tests record caller, destination, selected targets, state owner, mutations, and telemetry for root active, root State -1, helper-to-root, and helper-to-helper. | Medium. Characterization only. |
| T09 ADR 0006 decision | T08 | Proposed ADR 0006 and architecture docs. | Accept, amend, or reject lease design against callback and immutable-patch alternatives; include depth, locality, leverage, migration, deletion test. | Low implementation risk. No behavior claim. |
| T10 Actor/target lease | T09 | New runtime dispatch Module plus root/helper Adapters. | Resolution returns a typed destination and target-store lease or fail-closed diagnostic; stale/destroyed/invalid IDs covered. | High identity risk. No new controller breadth. |
| T11 Candidate projection | T10 | Target ID/index selection and explicit selected actor IDs. | Exact selection is deterministic and independent of wrapper array order; duplicate-ID cases characterized. | High parity risk. Allows bounded selection only. |
| T12 Mutation set | T11 | TargetSystem results and helper/root commit paths. | Each operation reports mutated actor IDs; an unselected helper wrapper remains byte-identical; TargetBind, BindToTarget, and TargetDrop special cases covered. | Critical hidden-write risk. |
| T13 Telemetry attribution | T10,T12 | Runtime helper/root telemetry and trace schema. | Evidence retains original caller, RedirectID destination, state owner, selected targets, and mutated actors without collapsing helper identity to root. | Medium schema churn. |
| T14 Root active migration | T10-T13 | Active CNS root target dispatch. | Characterization and required traces stay semantically identical; no new supported controllers or score movement. | Medium regression risk. |
| T15 Root State -1 migration | T14 | Imported State -1/setup target dispatch. | Same lease and mutation contract as active CNS; paired trace parity and invalid route proof. | Medium phase-order risk. |
| T16 Helper-to-root migration | T15 | HelperSystem redirect Adapter and writeback. | Existing helper-to-root routes preserve outcomes while committing only mutation-set actors. | High wrapper/ownership risk. |
| T17 Helper-to-helper migration | T16 | Helper destination Adapter and lifecycle checks. | Existing helper-to-helper routes preserve checksums or documented semantic deltas; destroyed/stale helper fails closed. | High lifecycle risk. |
| T18 Helper TargetState research ADR | T03,T13 | RuntimeHelperTargetState systems, state owner model, upstream source matrix. | Decide owner namespace, state lookup, SelfState return, destruction, recursion, and telemetry without implementation. | Critical custom-state risk. Claim remains blocked. |
| T19 Helper TargetState gate | T17,T18 | Bounded compiler/runtime/trace route. | One source-backed entry and SelfState return trace plus negative missing-owner/destroyed-helper cases. | Critical. Allows only the exact matrix proven. |
| T20 Remaining Target inventory | T03,T17 | Target Set/Score variants and profile capability docs. | Source-located inventory classifies implementable/unsupported/unknown with parameter and ownership dependencies before choosing one slice. | Medium profile drift. Scanner/research claim only. |
| T21 Ordering and recursion oracle | T03,T11 | Multi-target duplicate IDs, index/random, invalid/recursive redirects. | Pinned-source or differential oracle plus deterministic negative traces; explicit one-hop/recursive policy. | High exact-parity risk. |
| T22 Turns transition plan v1 | none | RuntimeTurnsContinuation, TeamRoundHandoff, round/resource/context systems. | prepare includes next active roots, revisions, State 5900 source, resources, round context, and every diagnostic before mutation. | Critical state corruption risk. |
| T23 State 5900 ADR | T03,T22 | Common1/character state resolution, RoundState5900, normal and Turns flows. | Define character/Common1 precedence, incoming versus all-root scope, missing-state behavior, and distinguish animation 5900 from state 5900. | High compatibility risk. |
| T24 RuntimeRoundPhase v0 | T23 | Round/context evaluator and MatchOver integration. | Model phases 0-4 and derive RoundState; keep round outcome, MatchOver, win poses, and 5900 separate. | High timing risk. |
| T25 Turns no-op failures | T22-T24 | Failure injection around handoff/reset/resources/context/state entry. | Every injected failure leaves roster, team state, resources, round, active roots, and observable snapshot unchanged. | Critical atomicity gate. |
| T26 Turns 1-2-3 journey | T25 | Required trace and browser evidence for sequential incoming roots. | Exact phase, RoundsExisted, State 5900 source, resources, active roots, and MatchOver timeline across 1 to 2 to 3. | High choreography risk. Allows bounded Turns only. |
| T27 GateEvidenceResult v0 | T02 | StudioModel, Build/Evidence trust chain, evidence storage. | Every green has command, tool/ruleset version, timestamp, digest, artifact target, and freshness; missing/stale blocks export; model tests plus browser smoke. | High product-trust risk. Studio score only with evidence. |
| T28 SourceWriteReceipt v0 | T27 | SourceWrite, SourceTransaction, SemanticDraft, browser handle flow. | Receipt records before/after identity and digest, permission, close, reimport, and final verification; post-close failure proves compensating restore. | Critical user-data risk. ZIP/create/delete remain blocked. |
| T29 Scanner and asset consumers | T03,T27 | PackageAnalysis/v1 with Studio adapter; AssetReleasePolicy/v0 with one first-party/generated record. | Semantic/source/ruleset/upstream digests, nested validation, source targets, freshness and redaction; asset record closes permission, transforms, outputs, QA, collision, playtest. | High claim/legal risk. Scanner and release claims stay separate from runtime compatibility. |
| T30 Shared Evidence contract | T27,T29 | Engine shared contract, Build/Evidence consumers, MUGEN Adapter, boundary checks. | Two real consumers, explicit Adapter, keep/delete rationale, forbidden vocabulary/import gate, contract tests and boundary check. | High premature-generalization risk. Allows one shared contract, not a multi-genre engine. |

## Claims allowed after this planning pass

- The current repo has a post-Entry-554 report frontier whose latest declared
  aggregate is 633/633 at audited HEAD 05d85137.
- Root and helper RedirectID support exists only at the exact boundaries named
  by the committed reports.
- The next architecture risks and task dependencies are documented.
- Proposed ADR 0006 is ready for review.

## Claims still blocked

- Entries 555 onward exist.
- Any score moved because of the 633 traces or this documentation.
- Broad MUGEN package compatibility, MUGEN parity, or IKEMEN support.
- Helper-destination TargetState, root-to-helper RedirectID, recursive
  redirects, exact multi-target ordering, or full team/projectile/neutral
  ownership.
- Exact Turns/Simul/Tag choreography, rollback, netplay, ZSS/Lua execution, or
  model-stage support.
- Studio export readiness, legal approval, asset release readiness beyond a
  future complete record, or a production multi-genre engine.
- RFC 8785, SPDX, PROV-O, or JSON Schema conformance.

## Risks

1. Control drift: reports can supersede the numeric ledger without a canonical
   cursor.
2. Source drift: the declared Ikemen pin and local shallow snapshot disagree.
3. Hidden writeback: wrapper commits can mask mutation locality.
4. Custom-state ownership: helper TargetState can corrupt state-source identity.
5. Turns partial commit: a late failure can leave team state mutated.
6. Phase overclaim: RoundState is hardcoded to fight while round transitions
   already exist.
7. False determinism: generatedAt participates in semantic checksums.
8. Product false green: Studio readiness can be symbolic or stale.
9. Score inflation: 633 traces are concentrated, not independent corpus
   breadth.
10. Premature generalization: metadata registries are not a reusable engine.

## Primary and official sources consulted

- Elecbyte State Controller Reference:
  https://www.elecbyte.com/mugendocs-11b1/sctrls.html
- Elecbyte Trigger Reference, including RoundsExisted and RoundState:
  https://www.elecbyte.com/mugendocs-11b1/trigger.html
- Elecbyte MUGEN 1.0 upgrade notes, including Common1 state 5900 override
  guidance:
  https://www.elecbyte.com/mugendocs-11b1/upgrading.html
- Ikemen GO pinned-source RedirectID resolution:
  https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/bytecode.go#L4825-L4840
- Ikemen GO pinned-source TargetState dispatch:
  https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/bytecode.go#L9654-L9686
- Ikemen GO pinned-source target state ownership:
  https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L8369-L8381
- Ikemen GO pinned-source round reset into state 5900:
  https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/system.go#L2389-L2404
- RFC 8785 JSON Canonicalization Scheme:
  https://www.rfc-editor.org/info/rfc8785/
- W3C PROV-O:
  https://www.w3.org/TR/prov-o/
- SPDX Specification 3.0.1:
  https://spdx.github.io/spdx-spec/v3.0.1/
- JSON Schema 2020-12 Core:
  https://json-schema.org/draft/2020-12/json-schema-core

These standards inform candidate contracts only. The repo does not currently
claim conformance to them.

## Verification boundary

This audit used git history/status, current source inspection, committed
reports, roadmap/issues, the local pinned reference, and primary web sources.
It did not run code suites because no runtime assertion required fresh
execution and the user explicitly limited the task to research, architecture,
and roadmap.

NO CODE CHANGED
