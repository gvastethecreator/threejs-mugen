# Daily roadmap and architecture audit - post-Wayfinder 209

Date: 2026-07-16

Audited repository: `D:\DEV\threejs-mugen\mugen-web-sandbox`

Audited HEAD: `90ab79b755146572f142498e67cd8dcd69bcec81`

Branch state: `master...origin/master [ahead 38]`

Latest numbered backlog entry: **555**

Latest runtime checkpoint: **Wayfinder 209 closed after Entry 555**

Declared trace gate: **633/633** (`599` required, `34` optional)

Latest reported full suite: **2262/2263**, with one residual
`RuntimeMatchPostFighterSystem.test.ts` scheduling-contract failure

Score position: **65 / 36 / 20 / 10-12 / 6-8 / 25**, unchanged

This is a research, architecture, and roadmap reconciliation. It does not
implement runtime, UI, test, or asset changes and it grants no compatibility
credit by itself.

## Executive delta since the previous audit

The previous daily audit used `05d85137` as its implementation frontier. The
current branch is 38 commits later. Those commits close:

- `CompatibilityCorpusSnapshot/v1` schema, tests, and tracked snapshot;
- redirected-target characterization plus bounded root/helper Target,
  binding, and resource dispatch leases;
- projectile teamside ownership;
- `ModifyProjectile RedirectID` and `Projectile RedirectID`;
- Entry 555 `ProjTypeCollision`;
- Wayfinder 209 projectile trade-box and remaining `p2clsn*` selectors.

No Studio, productive scanner, generated-asset, or modular-engine source
changed in that range. Those lanes therefore retain their previous claim
ceilings. The control plane did not fully follow the implementation: several
current selectors still call Wayfinder 209 the next cut, and several 2026-07-15
overrides still call Entry 554 the numbered maximum.

The new snapshot is real evidence infrastructure, but it is not yet a trusted
freshness source or independent breadth. Its materializer hardcodes the old
source revision and gate totals, does not prove the referenced browser/native
artifacts, and currently contains one required package route and no portable
route. No score threshold was crossed.

## Demonstrated behavior versus desired architecture

| Area | Demonstrated now | Desired but not yet demonstrated |
| --- | --- | --- |
| Control cursor | Entry 555 exists; Wayfinder 209 is closed; 633/633 traces are reported | One contradiction-free active queue and one reproducible evidence manifest |
| Corpus | `CompatibilityCorpusSnapshot/v1` has a tracked artifact and a semantic digest distinct from observation time | Current-revision and max-age validation, verified referenced artifacts, second first-party legal route, productive consumer |
| Redirect dispatch | A bounded lease resolves destination, target store, candidates, and state owner for covered routes | Typed failure result, actor generation/freshness, selected/mutated actor IDs, complete telemetry attribution, operation-specific commit |
| Turns | Bounded handoff/resource/state-5900 continuation exists | All-or-nothing transition; upstream-aligned counters and phase semantics; failure leaves byte-equivalent state |
| Round semantics | Round context and bounded state-5900 availability exist | Profile-owned phases `0..4`, dynamic `RoundState`, exact `MatchOver`, state-5900 provenance and precedence |
| Projectile policy | Teamside ownership, redirected creation/modification, typed collision, and bounded trade boxes exist | `affectteam`, depth/Z, deterministic global order, exact cancel/hitpause, proxy and multi-root behavior |
| Studio | Build/Evidence rows and bounded source write/reimport exist | Evidence-backed greens, explicit diagnostic/release intent, fresh gate artifacts, compensating source restore |
| Scanner | `PackageAnalysis/v0` and tests exist | Semantic/versioned v1 plus productive character/stage/system/screenpack consumer |
| Assets | `AssetProvenance/v2` can be exported diagnostically | Path-clean first-party record and a separate release policy requiring license, QA, collision, playtest, and freshness |
| Modular engine | Contract metadata and a MUGEN import boundary exist | Two real consumers, a shared evidence API, non-vacuous boundary roots, and no fighting vocabulary leakage |

## Gap map by horizon and system

| Horizon | Current boundary | Highest-value gaps | Claim ceiling |
| --- | --- | --- | --- |
| Playable sandbox | Private sandbox remains 65; one repository-authored required journey is represented | Restore full-suite baseline; prove a second first-party route; keep browser/native artifacts fresh | Playable bounded sandbox, not general MUGEN compatibility |
| MUGEN-lite MVP | Practical MUGEN remains 36 | Independent legal stage/package breadth, snapshot freshness, written score adjudication, Common1/source precedence | First point of the 36-55 band only |
| MUGEN 1.0/1.1 MVP | Remains 20 | Dynamic round phases; broader parser/VM/state ownership; palettes, audio, stage and screenpack behavior; exact tick order | Bounded imported flows only |
| Full MUGEN | Remains 10-12 | Dynamic CNS breadth, exact scheduler/contact/pause semantics, complete presentation and corpus diversity | No parity claim |
| IKEMEN | Remains 6-8 | Reproducible pin, Turns counters/atomicity, RoundState timing, state-5900 provenance, projectile policy, helper TargetState, Simul/Tag and rollback/netplay | Profile-gated bounded slices only |
| Studio/product | Remains 25 | Real gate artifacts, freshness, diagnostic/release split, source receipt/restore, productive scanner and asset decisions | Demoable Studio, not release-ready |
| Assets/provenance | Provenance facts exist | Remove absolute paths, machine-readable first-party permission/license, release policy, one complete record | Diagnostic export only |
| Scanner | Static analysis v0 exists in tests | Source and semantic digests, analyzer/ruleset/upstream identity, nested fail-closed validation, Studio consumer | Scanner-only, no runtime execution credit |
| Modularization | Metadata and one import guard exist | Evidence contract after two consumers; real roots and import edges; deletion test | No SDK, platformer, or multi-genre engine claim |

## Source-backed architecture findings

### Normative source pin

Keep `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` as the normative IKEMEN
research pin. The local shallow checkout at `044da720...` is a convenience
cache, not authority. The pinned commit is 46 commits ahead in the
[official comparison](https://github.com/ikemen-engine/Ikemen-GO/compare/044da72008b8ba13caf7b0f820526ce16e955fb3...05b7d98af690c73c7bffe5cb4f4eeb6933fa2703).
Future normative claims must use immutable URLs at `05b7d98...`; refreshing a
local cache is a separate controlled task.

### Redirected TargetState ownership

At the normative pin, `RedirectID` evaluates its identifier from the original
caller and changes the execution destination
([bytecode.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4825-L4840)).
`TargetState` evaluates `ID`, `Index`, and `Value` from the caller but selects
from the redirected destination's target store
([bytecode.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L9807-L9840)).
The state-program owner is another independent identity axis
([char.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8394-L8407)).
Therefore `caller`, `redirectDestination`, `selectedTargets`,
`stateProgramOwner`, and `mutatedActors` must not be collapsed. Helper-
destination TargetState remains blocked pending a separate ADR.

IKEMEN enters an undefined state path when a requested state is absent
([char.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6468-L6579)).
A local fail-closed no-op can be a deliberate safety policy, but it must be
reported as a divergence rather than parity.

### Turns, RoundState, and state 5900

The IKEMEN Turns replacement path increments round and side counters
([system.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L4055-L4110)).
The current local path restarts the current round number. Preserve its bounded
evidence, but reclassify it as a local policy until a profile-specific decision
and trace exist. Per-member first participation still needs an independent
`RoundsExisted = 0` history
([Elecbyte RoundsExisted](https://www.elecbyte.com/mugendocs-11b1/trigger.html#roundsexisted)).

`RoundState` is a phase model, not a permanent integer. Elecbyte defines
states `0..4`, while IKEMEN documents a deliberate timing difference at the
fight transition
([Elecbyte RoundState](https://www.elecbyte.com/mugendocs-11b1/trigger.html#roundstate),
[IKEMEN system.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683)).
The local evaluator returning constant `2` is therefore a compatibility gap.

State 5900 needs provenance, not just availability. The pinned compiler gives
character-owned state precedence, then `stcommon`/`Common.States`
([compiler.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go#L8319-L8354));
round reset applies state 5900 to loaded roots
([system.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2382-L2397)).

## Proposed decisions and tradeoffs

| Decision | Recommendation | Alternative and tradeoff | Status |
| --- | --- | --- | --- |
| D1 source authority | Keep immutable `05b7d98...` normative; label local shallow checkout as non-normative cache | Downgrading to local `044da...` is convenient but silently changes semantics and invalidates prior research | Proposed for immediate documentation adoption |
| D2 redirected dispatch | Retain ADR 0006 Alternative B as target architecture | Callback bundle is smaller but keeps ownership spread; full immutable patches are stronger but too broad now | **Remain Proposed** until lease v1.1 and all acceptance bullets pass |
| D3 Turns transaction | Introduce `RuntimeTurnsTransitionPlan/v1`; validate all identities, counters, resources, phase, 5900 provenance, roots, and presentation before one commit | Incremental mutation is simpler but leaves partial state after late failures | Proposed; highest runtime risk-reduction after baseline |
| D4 round model | Add profile-owned `RuntimeRoundPhase/v0` and derive `RoundState`/`MatchOver`; track per-side and per-member history separately | A single integer is easy but cannot encode timing/profile differences | Proposed, source-backed |
| D5 snapshot trust | Evolve to v1.1 producer with live revision, reference time, artifact digests, and fail-closed freshness | Current hardcoded materializer is reproducible but can certify stale evidence | Proposed before any score adjudication |
| D6 legal breadth | Add a second **repository-authored CC0** MUGEN-format route with materially different stage/package assumptions | Third-party examples may be broader but are forbidden for this task and create provenance risk | Proposed; no commercial or third-party assets |
| D7 Studio evidence | Keep `GateEvidenceResult/v0` app-owned first; promote only after Build and Evidence plus another real consumer | Premature core extraction creates metadata without leverage | Proposed |
| D8 export intent | Separate `diagnostic-export` from `release` | One `canExport` boolean is convenient but conflates useful diagnostics with distribution readiness | Proposed |
| D9 asset trust | Keep immutable provenance facts separate from versioned `AssetReleasePolicy/v0` | Embedding mutable policy into provenance corrupts historical meaning | Proposed |
| D10 scanner identity | `PackageAnalysis/v1` owns source digest, semantic digest, analyzer/ruleset version, pinned upstream identity, and targetable diagnostics | Transport-only checksum is easier but changes with observation time and cannot support freshness | Proposed |
| D11 modular gate | Extract shared evidence only after two productive consumers; make boundary checks fail on missing roots | Current metadata is cheap but can pass vacuously and proves no reusable engine | Proposed |

## Remaining roadmap by phase and dependency

1. **Phase A - authority and baseline:** reconcile Entry 555/Wayfinder 209,
   classify the one residual full-suite failure, and record the normative source
   pin. All later decisions depend on trustworthy control state.
2. **Phase B - evidence denominator:** harden snapshot freshness, build one
   second repository-authored CC0 route, materialize its loader/runtime/browser
   evidence, then perform a separate written score adjudication.
3. **Phase C - runtime ownership:** characterize and complete the redirected
   lease, keep ADR 0006 Proposed until acceptance, decide helper TargetState
   separately, and replace Turns incremental mutation with plan/commit.
4. **Phase D - round and projectile semantics:** add state-5900 provenance and
   profile-owned phases; then close `affectteam`, depth, exact global
   trade/cancel/hitpause order, and only afterward proxy/multi-root breadth.
5. **Phase E - Studio trust:** produce real gate records, ingest them into
   Build/Evidence, distinguish diagnostic from release, and add source-write
   receipts with compensating restore.
6. **Phase F - scanner and assets:** implement PackageAnalysis v1 plus a
   productive multi-kind consumer; remove path leakage and prove one complete
   first-party asset release decision.
7. **Phase G - modular extraction:** promote the evidence contract only after
   productive consumers exist; require non-vacuous roots/import edges and keep
   MUGEN vocabulary behind an adapter.
8. **Long horizons:** expand parser/VM/Common1/presentation and legal corpus
   breadth for MUGEN; then Simul/Tag/motif/ZSS/Lua and deterministic rollback/
   netplay for IKEMEN. These remain independently gated and cannot inherit
   credit from architecture work.

## Next 30 executable tasks

Every task is a future execution contract. This audit does not implement them.

| ID | Scope, dependencies, and likely systems | Acceptance criteria | Required proof and claim boundary |
| --- | --- | --- | --- |
| T01 | **Control cursor reconciliation.** No dependency. Update current selectors in roadmap docs and issues to Entry 555 + closed Wayfinder 209. | No active/current paragraph calls 209 next or Entry 554 maximum; historical text stays labeled; scores unchanged. | `rg` cross-check + `git diff --check`. Permits only “roadmap current.” |
| T02 | **Residual scheduling baseline.** Depends T01. Characterize `RuntimeMatchPostFighterSystem` cross-owner/same-owner schedule contract. | One explicit expectation covers all active projectile-combat routes without duplicate invocation; no unrelated behavior change. | Focused test, full `2263/2263`, and 633/633 trace baseline. Does not prove exact IKEMEN ordering. |
| T03 | **Pinned-source manifest.** Depends T01. Issue 07, IKEMEN reference docs, `.scratch/roadmap` manifest. | `05b7d98...` is normative; source files/immutable URLs/digests recorded; local shallow cache visibly non-normative and drift-detectable. | `git rev-parse`, official compare, manifest validation. Research authority only. |
| T04 | **CompatibilityCorpusSnapshot v1.1.** Depends T01/T02. Snapshot producer/schema/tests. | Live source revision and reference time are injected; max age and expected revision enforced; referenced artifacts exist and match digests; `observedAt` does not alter semantic digest. | Clean rebuild plus missing/tamper/stale/revision negative tests. Fresh indexed denominator only. |
| T05 | **Second first-party CC0 fixture.** Depends T03. Repository-authored MUGEN-format stage/package with different assumptions and no third-party material. | Machine-readable CC0/provenance, stable inputs/digests, no absolute paths, and an independently named compatibility route. | License/provenance scan and deterministic fixture digest. No arbitrary-package credit. |
| T06 | **Second journey execution.** Depends T04/T05. Loader, runtime trace, native browser route, diagnostics. | Folder and ZIP paths agree; stage/package loads, reaches its bounded play state, and produces trace plus visible browser evidence. | Focused loader/runtime tests, required trace, browser smoke/screenshot, artifact digests. Bounded route only. |
| T07 | **Corpus aggregation and adjudication.** Depends T06. Snapshot artifact, score report, scorecard. | Snapshot contains at least two materially distinct first-party package IDs/routes; unsupported density remains visible; adjudication is a separate written gate. | Rebuilt snapshot + report + clean-diff verification. Score moves only if existing written threshold is actually met. |
| T08 | **Lease gap characterization.** Depends T02/T03. `RuntimeRedirectedTargetDispatchSystem` and route tests, behavior-preserving. | Current root/helper destination, candidates, state owner, mutation/writeback, and telemetry identities are recorded for every migrated family. | Focused characterization and existing route traces. No architecture acceptance or score claim. |
| T09 | **Redirect lease v1.1.** Depends T08. Typed result union, generation/freshness, operation class, selected/mutated IDs, attribution. | Stale same-ID replacement and unsupported destination fail with typed diagnostics; unselected candidates are byte-identical. | Failure matrix, boundary tests, root/helper route traces. No recursive redirect/rollback claim. |
| T10 | **Lease migration and ADR decision.** Depends T09. Root active, State -1, helper-to-root/helper paths plus ADR 0006. | Duplicate resolution/writeback/telemetry adapters are deleted; all ADR acceptance bullets are evidenced before status changes from Proposed. | Focused families, 633+ traces, boundary/deletion test. Centralized bounded dispatch only. |
| T11 | **Helper-destination TargetState ADR.** Depends T03/T09. Research caller, destination, target, state owner, negative states, SelfState, Common1 precedence, lifetime. | One accepted ownership model and explicit missing-state divergence; no implementation until decision and fixtures exist. | Pinned-line research note + ADR + planned trace oracle. No helper TargetState support claim. |
| T12 | **Turns behavior characterization.** Depends T02/T03. Local Entry 519 behavior versus pinned IKEMEN counters/history. | Current round/side/member counter and failure mutation matrix is explicit; existing gate relabeled bounded/non-parity. | Focused characterization plus pinned source citations. No IKEMEN Turns parity. |
| T13 | **RuntimeTurnsTransitionPlan/v1.** Depends T12/T15 design input. Prepare owns roster identity/revisions, counters, phase, resources, 5900 source, active roots, presentation, diagnostics. | Every invariant is validated before a write; plan has deterministic intended poststate and a freshness token. | Pure plan tests and stale-plan negatives. Planning contract only. |
| T14 | **Atomic Turns commit.** Depends T13. One commit boundary or explicit compensation. | Injected failure at every stage leaves authoritative state byte-equivalent; success commits exactly once and publishes one result. | Failure-injection matrix, focused runtime trace, full suite. Bounded transaction, not rollback/netplay. |
| T15 | **State-5900 provenance.** Depends T03/T12. Compiler/runtime availability snapshot. | Animation 5900 alone does not count; source owner and precedence `character -> stcommon -> Common.States` are explicit; missing source fails by chosen profile policy. | Compiler/runtime tests and provenance-bearing trace. No full Common1 parity. |
| T16 | **RuntimeRoundPhase/v0.** Depends T12/T15. Profile-owned state machine `0..4` plus timing policy. | Legal transitions and timing are explicit per profile; phase is derived from runtime events, not a free integer. | Transition table tests and trace across intro/fight/over. No motif/continue parity. |
| T17 | **Round expressions and histories.** Depends T14/T16. `RoundState`, `MatchOver`, round number, side counter, and per-member `RoundsExisted`. | MUGEN/IKEMEN timing differences are profile-labeled; entrant first participation remains zero; Turns trace no longer conflates counters. | Evaluator tests plus multi-round/Turns trace. Bounded profiles only. |
| T18 | **Projectile affectteam.** Depends T02/T03. Compiler/controller/projectile admission matrix. | Defaults and `F/B/E` behavior are source-backed across self, ally, enemy, and cross-owner cases. | Compiler/runtime focused tests and required traces. No multi-root/depth claim. |
| T19 | **Projectile depth/Z.** Depends T18. Runtime projectile data plus shared combat-depth oracle. | XY overlap with Z separation rejects; Z overlap admits; localcoord normalization is explicit. | Depth oracle tests and paired traces. No perspective or global order claim. |
| T20 | **Deterministic trade/cancel/hitpause.** Depends T19. Global projectile projection and schedule contract. | Three-plus-projectile oracle processes each pair once with source-backed priority, cancellation, survivor, pause, and timer results. | Focused schedule sidecar, required traces, full suite. No proxy/rollback parity. |
| T21 | **Projectile proxy and multi-root research gate.** Depends T20. Pinned source plus local ownership map; research before code. | Proxy flattening, depth/order, root/team identity, and unsupported cases are separated into microcuts. | Cited research + ADR/task decomposition. No implementation claim. |
| T22 | **GateEvidenceResult/v0.** Depends T01/T04. App-owned schema/validator. | Command, producer/ruleset version, source/project revision, time, target, semantic/artifact digest, freshness, blockers, and next action are mandatory; missing/stale/tampered never becomes `ok`. | Unit and failure-matrix tests. Evidence record only. |
| T23 | **Gate materializers.** Depends T22. CLI producers for trace, smoke, typecheck/build, and boundaries. | CLI reads real command outputs/artifacts; browser only ingests records; absent artifact yields unavailable/blocked. | Command integration and tamper/stale tests. Only exact commands are evidenced. |
| T24 | **Studio trust adoption and export intent.** Depends T23. Build/Evidence model and bundle decision. | Symbolic greens are removed; both views consume identical records; diagnostic export and release are distinct, with stale/missing evidence blocking release. | Model tests, Studio smoke, bundle inspection. Evidence-backed rows, not general publish readiness. |
| T25 | **SourceWriteReceipt/v0.** Depends T22/T24. Existing-file folder write flow. | Preimage, before/after digest, revision, permission, close/reimport/final verification are recorded; post-close failure restores or reports `restore-failed`. | Fault injection and reimport tests. Bounded existing-file compensation, not ACID/ZIP/multi-file. |
| T26 | **PackageAnalysis/v1.** Depends T03/T22. Analyzer/schema/validator. | Source/package SHA-256, semantic digest excluding observation time, envelope checksum, analyzer/ruleset/upstream identity, nested fail-closed validation, and targetable locations. | Determinism, tamper, nested-invalid, and version-drift tests. Static analysis only. |
| T27 | **Productive package-analysis consumer.** Depends T24/T26. VFS loader/service plus Studio Build/Evidence drilldown. | Character, stage, system, and screenpack analysis can be persisted/exported; at least one non-character route is proven. | Service tests, Studio smoke, exported JSON inspection. Scanner-only; no ZSS/Lua execution credit. |
| T28 | **Asset path and permission hygiene.** Depends T01/T23. Public QA reports, bundle copier, first-party asset metadata. | Absolute/file/traversal paths are rejected or redacted; one owned/generated asset has machine-readable permission/license and stable digests. | Repo scan, ZIP inspection, digest verification. No legal approval or imported-MUGEN credit. |
| T29 | **AssetReleasePolicy/v0 and one record.** Depends T24/T28. Separate decision layer over provenance. | Policy requires permission/license, ordered transforms, tool/config, QA pass, collision, playtest, and freshness; unknown/fail/stale blocks release while diagnostic export remains possible. | Policy tests, asset artifact hashes, browser smoke, bundle inspection. Only the named first-party record is releasable. |
| T30 | **EvidenceContract/v0 and non-vacuous boundaries.** Depends T24/T27/T29. Shared contract plus MUGEN adapter and boundary script. | At least two productive consumers use the contract; missing module roots fail; real import edges are checked; fighting vocabulary cannot leak into core. | Contract tests, `check:boundaries`, deletion test, stable MUGEN gates. One shared contract only; no SDK/platformer/multi-genre claim. |

## Risks and open questions

1. Should missing TargetState remain fail-closed as an explicit local safety
   divergence, or should an IKEMEN profile reproduce undefined-state entry?
2. Does state 5900 execute for every loaded root or only active participants in
   each supported profile?
3. Which exact `RoundState = 2` timing belongs to MUGEN 1.0, MUGEN 1.1, and
   the pinned IKEMEN profile?
4. How should per-side round history and per-member first-entry history survive
   Turns handoff without sharing one counter?
5. Can the full-suite scheduling residual be closed as an expectation drift, or
   does it expose a real double-dispatch introduced by the projectile chain?
6. Which first-party CC0 fixture gives the smallest independent route while
   varying stage/parser/runtime assumptions materially?
7. What freshness window is strict enough for release evidence without making
   local iteration unusable?
8. What exact actor generation token prevents stale same-ID leases without
   broadening the runtime into rollback architecture?

## Official and primary sources consulted

- [IKEMEN official comparison: local cache to normative pin](https://github.com/ikemen-engine/Ikemen-GO/compare/044da72008b8ba13caf7b0f820526ce16e955fb3...05b7d98af690c73c7bffe5cb4f4eeb6933fa2703)
- [IKEMEN RedirectID dispatch at the normative pin](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4825-L4840)
- [IKEMEN TargetState compilation/dispatch at the normative pin](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L9807-L9840)
- [IKEMEN target store semantics](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8221-L8248)
- [IKEMEN state-program ownership](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8394-L8407)
- [IKEMEN Turns replacement path](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L4055-L4110)
- [IKEMEN RoundState timing](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683)
- [IKEMEN state-5900 compiler precedence](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go#L8319-L8354)
- [Elecbyte trigger reference: RoundState, RoundsExisted, MatchOver](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
- [Elecbyte TargetState controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html#targetstate)

## Claim boundary for this audit

Allowed:

- the current planning cursor is Entry 555 plus a closed, unnumbered Wayfinder
  209 checkpoint;
- the named bounded runtime gates and 633/633 trace report exist;
- the full-suite baseline remains 2262/2263 at the latest report;
- the roadmap and architecture decisions above are research-backed proposals.

Blocked:

- score movement from this audit;
- freshness, breadth, release readiness, or compatibility parity beyond the
  exact materialized evidence;
- helper-destination TargetState;
- exact IKEMEN Turns/RoundState/state-5900 parity;
- projectile proxy, multi-root, rollback, or netplay parity;
- Studio release readiness, general asset release, productive multi-kind
  scanner support, or a reusable multi-genre engine.

## NO CODE CHANGED

This audit changed roadmap/architecture documentation only. It did not modify
runtime, UI, source, tests, assets, commits, or remote state.
