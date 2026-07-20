# Daily roadmap and architecture audit - post-Wayfinder 229

Date: 2026-07-16

Audited repository: `D:\DEV\threejs-mugen\mugen-web-sandbox`

Audited HEAD: `83f85bae0c77341fd7c0a0f6e9885a26ac5810be`

Numbered backlog cursor: Entry 555

Latest lane closeout: Wayfinder 229

Planning mode: research, architecture, and roadmap only

## Executive delta since the previous audit

The prior daily audit stopped at `90ab79b7` / Wayfinder 209. The real branch is
now 57 commits later at `83f85bae`. Entry 555 remains the maximum numbered
backlog entry, while Wayfinders 210-229 form later lane-specific closeouts.
The three values are deliberately separate: repository revision, numbered
ledger cursor, and latest closeout are not interchangeable.

The new chain closes bounded `AffectTeam`/`TeamSide`, projectile Z/depth
admission and removal, helper projectile depth, CompatibilityCorpusSnapshot
v1.1 freshness, a second repository-authored CC0 stage route, folder/ZIP and
browser journey proof, Studio snapshot consumption and project reopen QA,
`GateEvidence/v0`, `SourceWriteReceipt/v0`, `PackageAnalysis/v0` and v1,
productive multi-kind analysis export, and first-party asset path/permission
hygiene. These gates must not be planned again.

Scores do not move: **65 / 36 / 20 / 10-12 / 6-8 / 25**. The latest declared
trace aggregate remains **633/633**. The latest declared full suite is
Wayfinder 221 at **220/220 files and 2294/2294 tests**; Wayfinders 222-229 only
declare focused, browser, or QA evidence, so that full-suite result is not a
whole-HEAD claim. Wayfinder 229 declares 10/10 focused tests, 62 public text
files scanned, 13/13 digests verified, and browser smoke with zero console or
page errors.

Concurrent dirty `StudioAssetReleasePolicy` source/test/App/QA work is reserved
to its existing owner. It is not evidence, it is not a closed gate, and this
audit does not duplicate or modify it.

## Demonstrated behavior versus desired architecture

| Surface | Demonstrated now | Desired next | Claim ceiling |
| --- | --- | --- | --- |
| Control | HEAD, Entry, and lane closeouts can be reconstructed from git, backlog, and reports. | Make the triple cursor explicit in all current selectors. | Current roadmap truth only; no runtime claim. |
| Runtime projectiles | Bounded affect-team and depth gates, including helper spawn/admission, are closed. | One deterministic global pair/order/cancel/hitpause policy, then proxy and multi-root research. | No proxy, rollback, netplay, or exact global parity. |
| Redirected targets | Broad bounded root/helper routes exist behind a lease-like seam. | Typed lease failures, generation/freshness, complete identity, one commit owner, and accepted ADR 0006. | No helper-destination TargetState or recursive redirect parity. |
| Turns/rounds | Bounded sequential handoff and counters exist. | Pure transition plan, atomic commit, state-5900 provenance, and profile-owned round phases. | No IKEMEN Turns, RoundState, Common1, or rollback parity. |
| Corpus | Snapshot v1.1 contains two required repository-authored legal routes and both pass. | Reconcile stale claims, then add independent character-centered breadth. | Two bounded routes, not arbitrary package compatibility. |
| Studio evidence | GateEvidence/v0, write receipt v0, promoted snapshot, reopen QA, and productive PackageAnalysis export exist. | Revision-bound gate facts, release aggregation, compensating writes, and deterministic semantic export. | Diagnostic evidence, not general release readiness. |
| Assets | Nova Boxer permission/path/digest hygiene is evidenced. | Complete the reserved release-policy decision and define the supported SPDX boundary. | Named first-party provenance only; no legal approval. |
| Scanner | Productive static character/stage/system/screenpack analysis exists. | Rule authority, upstream drift, and deterministic reanalysis/diff. | Static scanner only; no ZSS/Lua/IKEMEN execution. |
| Modular core | Contract vocabulary exists, but current boundary QA can skip absent roots and allowlist the only active engine contract. | A non-vacuous active-root graph plus shared fact envelope with two adapters. | No reusable SDK, platformer, or multi-genre engine. |
| Three.js presentation | Semantic runtime/presentation separation remains the intended direction. | Source-backed tie, `ontop`, stage layer, clipping, and adapter-order oracle. | No broad visual parity or screenpack/lifebar parity. |

## Contradictions and insufficient gates

1. Current selectors still stop at Wayfinder 209 and send future agents toward
   already closed gates. They must point to `83f85bae` / Entry 555 / Wayfinder
   229 and retain older selectors as historical evidence only.
2. `docs/PROGRESS_TRACKER.md` still contains a `35` Practical MUGEN score in a
   lower current table. The accepted scorecard value is 36.
3. The v1.1 snapshot summary records two required and two passed routes, while
   its embedded allowed/blocked claims still say one legal journey and no
   independent legal package breadth. The snapshot is internally
   conservative but semantically stale; a versioned rematerialization and
   separate adjudication are required.
4. Snapshot source revision and current GateEvidence records predate HEAD. Age
   alone cannot establish currentness: subject revision, producer revision,
   target/artifact digest, and producer identity must be bound.
5. The current boundary script silently skips absent roots and allowlists the
   active engine contract. A green result is diagnostic, not non-vacuous
   modularity proof.
6. `SourceWriteReceipt/v0` describes the outcome, but a failure after `close()`
   does not yet prove compensating restore. ACID, multi-file, and ZIP write
   claims remain blocked.
7. The local asset license recognizer is intentionally adequate for the
   current `CC0-1.0` record, but it is not the SPDX expression grammar. General
   SPDX-validation wording is blocked.
8. Redirected dispatch does not yet own typed failure results, actor
   generation, complete selected/mutated identities, or a single revalidating
   commit. ADR 0006 remains Proposed.
9. Turns applies handoff before all later validation/reset work. A late failure
   can expose partial authoritative mutation.
10. The expression evaluator returns a constant `2` for `RoundState`; state
    5900 availability is checked by ID, not source/provenance/precedence.
11. The second legal route is stage-centered. It improves corpus legality and
    loader breadth but does not replace a second character-centered Common1
    compatibility journey.
12. Root `CONTEXT.md` and the repository milestone focus are older than the
    real lane frontier. They are reported as drift here because this automation
    is restricted to roadmap/architecture material under `docs/` and
    `.scratch/roadmap/`.

## Gap map by horizon and system

| Horizon | Highest-risk remaining systems | Dependency that unlocks useful evidence |
| --- | --- | --- |
| Playable sandbox | Current-HEAD regression confidence, presentation ties/layers, Studio asset policy completion. | Revision-bound gates plus browser/visual oracle on the default project. |
| MUGEN-lite MVP | Atomic Turns, round phases, state 5900/Common1 provenance, second character journey. | Transition plan -> commit -> phase/provenance -> journey. |
| Practical MUGEN | Character corpus breadth, deterministic projectile order, redirected-target ownership, unsupported density. | Character fixture/journey and global runtime oracles before score review. |
| MUGEN 1.0/1.1 | FightFX, palettes, motif/screenpack/lifebar, audio/render parity, wider controllers/triggers. | Stable runtime ownership and presentation-order contract. |
| IKEMEN | Team topology, helpers/proxies, ZSS/Lua/config execution, rollback/netplay. | Pinned-source microcuts after MUGEN ownership gates; scanner findings alone do not unlock runtime. |
| Studio/product | Current evidence, release decisions, compensating writes, semantic exports, persisted reanalysis. | GateEvidence v1 -> project decision -> write v1 -> export/reanalysis. |
| Assets/provenance | Reserved release policy, precise license-expression boundary, more than one releasable record. | Close current owner work, then a separate second-record proof. |
| Scanner | Rule/upstream identity, drift, deterministic reanalysis and actionable diff. | Authority manifest -> versioned reanalysis -> Studio diff. |
| Modularization | Non-vacuous boundaries, stable fact envelope, two real domain adapters. | Harden evidence facts first; extract only after deletion/boundary proof. |

## Proposed architecture decisions

### D1 - Adopt a triple planning cursor

Store and report: audited git revision, maximum numbered Entry, and latest
closeout per lane. Alternative: one global “latest” number. The single cursor
is simpler but already produced false queue ordering; the triple cursor costs
one compact table and preserves provenance.

### D2 - Make snapshot claims an adjudicated policy output

Counts and pass state are facts; allowed/blocked compatibility wording is a
versioned adjudication over those facts. Alternative: derive claims directly
from package count. Direct inference is cheap but conflates a stage route with
character breadth and invites score inflation.

### D3 - Bind evidence to subject, producer, and artifact

`GateEvidence/v1` should carry separate subject/source revision, producer
revision/version, ruleset/tool identity, target identity, semantic digest,
artifact digest, observation time, and freshness decision. Age-only freshness
remains useful but insufficient after code or project mutation.

### D4 - Separate evidence facts from release policy

A shared fact envelope may own entity identity, provenance, generation,
derivation, digests, and observations. Studio/project/asset adapters retain
their release decisions. This follows the same separation used by PROV-O
between entities, activities, and agents; it prevents a domain policy from
becoming accidental shared-core vocabulary.

For deterministic bytes, use a versioned canonical JSON profile and a
cryptographic digest. RFC 8785 is a candidate for canonicalization. Existing
FNV-style semantic markers remain versioned non-cryptographic identifiers;
they must not silently change meaning.

### D5 - Keep the redirected-target lease, but accept it only after one owner

ADR 0006 Alternative B remains the preferred bounded direction: one lease
selects candidates, captures freshness, commits once, and emits selected and
mutated identity. Per-controller duplication preserves short-term locality but
keeps stale-ID, helper writeback, and telemetry divergence alive.

### D6 - Make Turns and round state explicit profile-owned transactions

Prepare a pure poststate plan, validate all invariants, then commit once or
compensate. `RuntimeRoundPhase` owns values 0-4 and profile timing; state 5900
availability includes source and precedence. A mutable sequence of callbacks
is easier initially but cannot make failure atomic or explain MUGEN/IKEMEN
timing differences.

### D7 - Centralize projectile interaction order before adding proxies

Project all eligible projectiles into one deterministic schedule, enumerate
each pair once, and define priority/cancel/hitpause/timer order. Adding proxy
and multi-root cases first would multiply ambiguity across owners and depth.

### D8 - Treat scanner results as re-runnable observations

PackageAnalysis should bind analyzer/ruleset/upstream authority, support
deterministic reanalysis, and produce a semantic diff. Persisted v1 output is
useful static evidence, but it cannot remain current by timestamp alone.

### D9 - Activate modular boundaries only around proven seams

Boundary QA must fail when configured active roots are absent and must inspect
real import edges. Extract the evidence fact envelope only after at least two
productive adapters and a deletion test. Documentation-only roots do not earn
modular-engine credit.

### D10 - Keep Three.js downstream of semantic presentation order

Runtime/profile policy defines layer and tie semantics; the Three.js adapter
maps the stable order into render order, clipping, and materials. Direct scene
graph heuristics are easy to demo but make imported semantics renderer-owned.

## Remaining roadmap by phase and dependency

1. **Phase A - control and evidence currentness:** reconcile the triple cursor,
   snapshot claims, score wording, and revision-bound GateEvidence producers.
2. **Phase B - product trust closure:** aggregate project release state, add
   compensating writes and semantic export, then finish the reserved asset
   release decision without counting dirty work.
3. **Phase C - redirected ownership:** characterize all routes, complete lease
   v1.1, migrate adapters, delete duplicates, and decide ADR 0006.
4. **Phase D - atomic match progression:** characterize partial mutation,
   introduce the Turns plan/commit seam, then add state-5900 provenance,
   `RuntimeRoundPhase`, and dynamic expressions/histories.
5. **Phase E - projectile determinism:** implement one global order oracle,
   then research proxy/helper/multi-root microcuts. AffectTeam and depth remain
   closed prerequisites, not new work.
6. **Phase F - breadth and presentation:** add a second character-centered CC0
   route and adjudicate the corpus; close presentation ties, `ontop`, stage
   layers, and clipping against semantic/visual oracles.
7. **Phase G - scanner, assets, and shared core:** add upstream/ruleset drift and
   reanalysis, define the supported SPDX boundary, then extract the shared
   evidence facts and activate non-vacuous boundaries.
8. **Later horizons:** FightFX/palettes/screenpacks/audio breadth, IKEMEN teams,
   ZSS/Lua/config execution, rollback/netplay, and multi-genre SDK work remain
   after the above dependency chain and require their own evidence gates.

## Next 30 executable tasks

All tasks preserve scores unless their own separate adjudication says
otherwise. “Proof” names the minimum evidence a future implementation agent
must produce; this audit does not execute those checks.

| ID | Scope and dependencies | Acceptance criteria | Required proof and claim boundary |
| --- | --- | --- | --- |
| T01 | **Reserved AssetReleasePolicy closeout audit.** Wait for the current owner; do not edit its source. | A committed closeout names policy inputs, supported record, UI/export consumers, failures, and current-HEAD checks; otherwise it remains in flight. | Status/diff/report inspection. Allows only the named record’s stated decision. |
| T02 | **CompatibilityCorpusSnapshot v1.2 claim reconciliation.** No code until the producer/claim policy is understood. | Summary and allowed/blocked claims agree about two required passing legal routes; stage breadth and character breadth remain distinct. | Deterministic rematerialization plus schema/claim tests. No score move. |
| T03 | **Post-Wayfinder-221 score adjudication.** Depends T02. | A written comparison applies existing thresholds to material evidence and records explicit hold/move reasons per score. | Snapshot/report review and scorecard diff. Documentation never supplies missing runtime breadth. |
| T04 | **GateEvidence/v1 revision binding.** Gate schema/validator/migration. | Subject revision, producer revision/version, ruleset/tool identity, target ID, semantic/artifact digests, time, and freshness are mandatory and separately validated. | Missing/stale/tampered/revision-mismatch matrix. Evidence facts only. |
| T05 | **Trace GateEvidence producer.** Depends T04. | Producer reads the real trace artifact and binds exact command, counts, revisions, and digest; absent or mismatched artifacts fail closed. | Integration and tamper tests using a real trace run. Only that trace command is evidenced. |
| T06 | **Smoke/build/typecheck/boundary producers.** Depends T04. | Each gate has its own producer identity and target; browser views ingest records rather than symbolic booleans. | Command integrations, unavailable paths, and artifact inspection. No aggregate release claim. |
| T07 | **ProjectReleaseDecision/v0.** Depends T04-T06. | Diagnostic export and release are separate intents; missing, stale, failed, wrong-revision, or policy-blocked evidence yields explicit blockers/next action. | Decision matrix, Studio model tests, reopen/export inspection. No public publishing claim. |
| T08 | **SourceWriteReceipt/v1 compensation.** Depends T04/T07. | Preimage is retained until verification; any post-close failure restores byte-equivalent content or emits `restore-failed` with recoverable evidence. | Fault injection at every stage plus reopen/reimport. Single existing file only; no ACID/ZIP claim. |
| T09 | **Deterministic Studio semantic export.** Depends T07. | Export contains versioned decision, evidence identities, project revision, blockers, and next action; observation time does not perturb semantic digest. | Two-build determinism, tamper test, bundle inspection, reopen smoke. |
| T10 | **Redirect lease characterization.** Preserve behavior; depends only on current runtime. | Every route records caller, destination, candidates, state owner, selected IDs, mutation/writeback, and telemetry identity. | Focused characterization and existing required traces. No ADR acceptance. |
| T11 | **Redirect lease v1.1.** Depends T10. | Typed result union, actor generation/freshness, operation class, selected/mutated IDs, and attribution; stale same-ID and unsupported destination fail closed. | Failure matrix, unselected-byte-identity checks, route traces. No recursive redirect/rollback claim. |
| T12 | **Lease migration and ADR 0006 decision.** Depends T11. | Root, State -1, helper-to-root/helper adapters use one revalidating commit owner; duplicate resolution/writeback/telemetry paths are deleted; every ADR acceptance bullet has evidence. | Focused families, trace aggregate, boundary/deletion test. Bounded dispatch only. |
| T13 | **Helper-destination TargetState ADR.** Depends pinned source and T11. | Decide caller/destination/target/state owner, negative states, SelfState, Common1 precedence, lifetime, and missing-state behavior before code. | Primary-source note, ADR, fixture/trace oracle plan. No support claim. |
| T14 | **Turns partial-mutation characterization.** No behavior change. | Failure injection identifies every mutation before/after handoff, reset, state 5900, resources, active roots, presentation, and telemetry. | Byte-level pre/post matrix and focused tests. Current bounded behavior only. |
| T15 | **RuntimeTurnsTransitionPlan/v1.** Depends T14 and T17 design. | Pure plan owns roster identities/revisions, counters, phase, resources, state source, active roots, presentation, diagnostics, and freshness token; it writes nothing. | Deterministic plan tests and stale-plan negatives. Planning contract only. |
| T16 | **Atomic Turns commit.** Depends T15. | All invariants revalidate before one commit; injected failure leaves authoritative state byte-equivalent; success publishes once. | Fault injection, runtime trace, full focused/full-suite checkpoint. Bounded transaction, not rollback/netplay. |
| T17 | **State-5900 provenance and precedence.** Depends pinned source. | Animation/state ID alone is insufficient; selected source and precedence `character -> stcommon -> Common.States` are visible and profile-governed. | Compiler/runtime tests and provenance-bearing trace. No full Common1 parity. |
| T18 | **RuntimeRoundPhase/v0.** Depends T17. | Profile-owned legal values/transitions 0-4 and timing policy are derived from runtime events rather than a free integer. | Transition table and intro/fight/pre-over/over traces. No motif/continue parity. |
| T19 | **Dynamic round expressions and histories.** Depends T16/T18. | `RoundState`, `MatchOver`, round/side counters, and per-member `RoundsExisted` use the phase/roster model and label MUGEN/IKEMEN timing differences. | Evaluator tests and multi-round/Turns trace. Bounded profiles only. |
| T20 | **Deterministic global projectile order.** AffectTeam/depth are closed prerequisites. | Three-plus-projectile schedule enumerates every eligible pair once and defines source-backed priority, cancel, survivor, hitpause, and timer order across owners. | Schedule sidecar, focused tests, required traces, full checkpoint. No proxies/rollback parity. |
| T21 | **Projectile proxy/helper/multi-root research gate.** Depends T20. | Proxy flattening, depth/order, root/team identity, lifetime, and unsupported cases are decomposed into independent microcuts. | Pinned IKEMEN/local ownership note plus ADR/task contracts. Research only. |
| T22 | **Second character-centered CC0 package.** Keep distinct from the closed stage route. | Repository-authored MUGEN-format character exercises different Common1/controller assumptions and has machine-readable CC0 provenance and stable digests. | Permission scan, deterministic fixture digest, no third-party assets. No compatibility credit yet. |
| T23 | **Second character journey.** Depends T22. | Folder and ZIP routes load, execute a bounded idle/move/attack/guard/get-hit/fall/recovery path, expose unsupported findings, and agree semantically. | Loader/runtime tests, required trace, browser smoke/screenshots, artifact digests. Bounded route only. |
| T24 | **Corpus aggregation and adjudication.** Depends T23. | Snapshot keeps package/route distinctions and unsupported density visible; score review is a separate written decision. | Deterministic snapshot, claim tests, score report. No arbitrary-package or broad parity claim. |
| T25 | **PresentationOrder/v1 and Three.js oracle.** Depends stable runtime events. | Equal ties, `Explod ontop`, stage back/front layers, clipping/masks, and adapter mapping are deterministic and profile-labeled. | Semantic unit oracle plus browser screenshots/pixel or structural diff. No screenpack/lifebar parity. |
| T26 | **Scanner rule-authority manifest.** Current multi-kind v1 remains closed. | Analyzer, ruleset, pinned upstream revision/files/digests, and applicability are explicit; unknown or drifted authority is visible. | Manifest validation and pinned-source comparison. Scanner-only claim. |
| T27 | **PackageAnalysis reanalysis/diff workflow.** Depends T26/T09. | Persisted analysis can be rerun against new rules/source, semantic changes are categorized, observation-only changes disappear, and Studio offers next action. | Determinism/version-drift tests, project reopen, exported diff inspection. No runtime support claim. |
| T28 | **SPDX support-boundary decision.** After the reserved release closeout. | Either implement the normative expression grammar needed by policy or explicitly validate only an enumerated subset; UI/report wording matches the choice. | Official grammar corpus, positive/negative parser tests, named-license regression. Not legal advice. |
| T29 | **EvidenceEnvelope/v0 shared facts.** Depends productive T04/T07/T27 and asset adapter. | Versioned canonical bytes, cryptographic digest, entity/activity/agent provenance, revisions, derivation, and observations have at least two domain adapters; release policy stays outside core. | Contract/determinism/tamper/deletion tests. One shared fact contract only. |
| T30 | **Non-vacuous modular boundary activation.** Depends T29. | Configured active roots must exist, real import edges are checked, missing roots fail, and fighting vocabulary cannot leak into shared facts; allowlists are minimal and justified. | Boundary fixture matrix, real-tree run, deletion test, stable domain gates. No platformer/SDK/multi-genre claim. |

## Risks and open questions

1. Will the concurrent AssetReleasePolicy work commit and publish a closeout
   before the next run, or should T01 stay reserved?
2. Should snapshot v1.2 preserve the existing conservative claim strings for
   compatibility or migrate to a facts-plus-adjudication envelope?
3. What repository revision identifies a Studio project when the source tree,
   project contents, and evidence producer can all change independently?
4. Which actor generation token is authoritative enough for redirect leases
   without introducing rollback architecture prematurely?
5. Can Turns compensation be made byte-equivalent with current mutable owners,
   or must the plan first move ownership behind a dedicated world/system?
6. Which MUGEN/IKEMEN profile owns exact round-phase timing and state-5900
   missing-source behavior?
7. Does the current Three.js adapter have enough stable semantic events for a
   renderer-independent presentation oracle?
8. Should the project support the full SPDX grammar now, or explicitly retain
   a small approved-ID subset until multiple release records need expressions?
9. Which second domain adapter is strong enough to justify EvidenceEnvelope
   extraction without turning current Studio vocabulary into shared core?
10. The branch is ahead and dirty. Future agents must re-audit HEAD and reserve
    any in-flight source before executing this queue.

## Official and primary sources consulted

- [IKEMEN GO source at the repository normative pin](https://github.com/ikemen-engine/Ikemen-GO/tree/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703)
- [IKEMEN Turns replacement path](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L4055-L4110)
- [IKEMEN RoundState timing](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683)
- [IKEMEN state-5900 compiler precedence](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go#L8319-L8354)
- [Elecbyte trigger reference: RoundState, RoundsExisted, and MatchOver](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
- [RFC 8785: JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785.html)
- [W3C PROV-O](https://www.w3.org/TR/prov-o/)
- [SPDX 3.0.1 license expressions](https://spdx.github.io/spdx-spec/v3.0.1/annexes/spdx-license-expressions/)
- [Three.js Object3D renderOrder](https://threejs.org/docs/#api/en/core/Object3D.renderOrder)

Verified facts from those sources: Elecbyte documents RoundState values 0-4;
the pinned IKEMEN source provides concrete Turns, phase, and state-5900 paths;
RFC 8785 specifies deterministic JSON serialization; PROV-O separates
entities, activities, and agents; and SPDX expressions include composite
grammar such as parentheses, `AND`, `OR`, `WITH`, and custom references.

Architecture inferences, not source facts: JCS plus SHA-256 is the preferred
candidate for shared evidence bytes; a facts/policy split is appropriate for
this repository; and the current asset regex must not be described as general
SPDX validation.

## Claim boundary for this audit

Allowed:

- the planning cursor is audited HEAD `83f85bae`, Entry 555, and latest lane
  closeout Wayfinder 229;
- the named bounded closeouts and their report-declared evidence exist;
- scores remain 65 / 36 / 20 / 10-12 / 6-8 / 25;
- the decisions and task contracts above are research-backed proposals.

Blocked:

- projecting Wayfinder 221's 2294/2294 suite result onto current HEAD;
- counting dirty AssetReleasePolicy work;
- compatibility score movement, broad package compatibility, full MUGEN or
  IKEMEN parity;
- helper TargetState, exact Turns/RoundState/state-5900 parity, projectile
  proxy/multi-root/rollback/netplay parity;
- general Studio or asset release readiness, legal approval, ZSS/Lua runtime,
  or a reusable multi-genre engine.

## NO CODE CHANGED

This audit changes roadmap and architecture documentation only. It does not
modify runtime, UI, source, tests, assets, commits, or remote state.
