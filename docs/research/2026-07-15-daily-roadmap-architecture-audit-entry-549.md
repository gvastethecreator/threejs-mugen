# Daily Roadmap And Architecture Audit - Entry 549

Date: 2026-07-15
Scope: research, architecture, and roadmap only
Evidence cutoff: committed backlog Entry 549 at `88b1ad96`
Score effect: none

## Question And Executive Answer

What should the project build after Entry 549 so that the next cuts reduce
compatibility and product risk instead of accumulating isolated controller,
scanner, or documentation claims?

Entry 549 is the committed frontier. Since the previous daily audit, Entries
517-549 closed bounded round/Turns progression, the first corpus and score-band
adjudication, one legal stage journey, BGCtrl/stage behavior, Studio semantic
preflight, scanner-only `PackageAnalysis/v0`, `AssetProvenance/v2`, root identity
reads, and root-only RedirectID through active-CNS `TargetPowerAdd`. Practical
MUGEN moved once, from 35 to 36; every other score remains unchanged.

First close the already-reserved State -1 `TargetPowerAdd` cut independently.
Then materialize the compatibility corpus from real journey artifacts, extract
one target-family dispatch seam, and add `TargetLifeAdd RedirectID` through that
seam. In parallel, replace hardcoded Studio Trust Chain greens with evidence
records, surface package analysis in a real consumer, and prove one complete
first-party asset release record.

The current uncommitted runtime/test diff is in-flight work, not evidence. This
audit did not modify or verify it and did not allocate a backlog entry for it.

## Delta Since The Previous Run

| Entries | Demonstrated boundary | Credit boundary |
| --- | --- | --- |
| 517-524 | match outcome, state 5900, rounds 1 -> 2 -> 3, automatic bounded Turns continuation, recovery, terminal outcome, DKO/effective loss, runtime win/draw commands | synthetic two-side lifecycle; not exact motif, Simul/Tag choreography, or rollback |
| 525-530 | `CompatibilityCorpus/v0`, legal stage journey, browser evidence, corpus promotion, written score adjudication | score 36 is the first practical-MUGEN point; not public breadth or parity |
| 531-538 | bounded stage BGCtrl timing, animation, motion, scaling, `positionlink`, and legacy vertical scaling | no zoom, model stage, screenpack, or broad stage corpus claim |
| 539-542 | `StudioSemanticDraft/v0`, bounded folder write/reimport, `PackageAnalysis/v0`, and `AssetProvenance/v2` | focused contracts/workflows; not product export, legal approval, or runtime compatibility |
| 543-549 | root identity/roster reads and root-only RedirectID through active `TargetPowerAdd` | no helper/projectile/neutral/aggregate target semantics or target-family parity |

Committed trace evidence at Entry 549 is 610/610 (576 required, 34 optional).
The previous broad Studio smoke closeout is recorded, but this planning pass ran
no code suite and creates no new runtime evidence.

## Evidence Boundary

### Verified facts

- `WORKPLAN.md`, `PROGRESS_TRACKER.md`, and the numbered backlog agree on Entry
  549; several roadmap selectors still point to Entries 525 or 530.
- `CompatibilityCorpus/v0` is test-covered, but no committed materialized
  snapshot assembles the actual journey outputs used for operational review.
- `PackageAnalysis/v0` has tests but no production Studio, Build, Evidence, or
  command-line consumer.
- Studio Build and Evidence share Trust Chain rows, but the architecture green
  is synthesized in `App.ts`, not backed by a persisted, digested, fresh gate.
- `AssetProvenance/v2` is diagnostic. Current sample records are blocked by
  unknown license, while missing/failing QA does not consistently block release.
- Target RedirectID resolution and telemetry are repeated across active and
  state-entry dispatch. Entry 549 admits only active `targetpoweradd`.
- `RoundState` is constant `2`. Turns mutates roster state before every later
  transition invariant has been preflighted.
- Normal and Turns state-5900 handling do not enforce the same missing-state
  policy.

### Inferences

- A materialized corpus snapshot is a stronger R1 discriminator than another
  schema-only cut because it makes the denominator reproducible.
- A target-family seam has leverage now: two dispatch contexts exist and
  `TargetLifeAdd` can be the next real consumer.
- Evidence/Build is the strongest first modular candidate because it has
  multiple production consumers; generic input/tick/render remains speculative.
- Turns needs an explicit preflight/commit boundary before roster breadth grows.

### Open questions

1. Should missing state 5900 block every normal next round, or only a Turns
   incoming-root transition?
2. Is `TargetLifeAdd` the accepted second target-family consumer, including
   `absolute`, `kill`, and scaling, or should an ADR first freeze the controller
   domain matrix?
3. Which journey artifacts are authoritative inputs to the materialized corpus,
   and where should their digests be retained without copying package payloads?
4. Which QA checks are mandatory release policy versus informational provenance
   facts for first-party/generated assets?

## Gap Map By Horizon And System

| Horizon | Gap | Risk | Next proof |
| --- | --- | --- | --- |
| Playable sandbox | phase-aware `RoundState`; atomic failed Turns transition; one state-5900 policy | partial mutation can survive failure | adversarial preflight/commit and KO -> 5900 -> active traces |
| MUGEN-lite MVP | corpus is a contract, not a materialized operational artifact | manual evidence assembly | content-addressed `CompatibilityCorpusSnapshot/v1` |
| Practical MUGEN | only first point of 36-55; narrow package/stage breadth | micro-controller count mistaken for breadth | independent legal journeys plus separate adjudication |
| MUGEN 1.0/1.1 | helpers, projectiles, target families, screenpacks, FightFX/audio, common states, palettes, stage breadth | shallow duplicated dispatch | target-family seam plus one controller, then package-driven cuts |
| IKEMEN | root-only RedirectID; no ZSS/Lua, exact teams, model stage, rollback/netplay | scanner/runtime claims blur | pinned-source matrix and separate bounded traces |
| Studio/product | no ZIP write, create/delete, watch/merge, compensation, broad editors, DB, export | hardcoded green overstates readiness | `GateEvidenceResult/v0` and `SourceWriteReceipt/v0` |
| Assets/provenance | no exportable first-party record; incomplete policy/lineage | facts, legal judgment, policy conflated | `AssetReleasePolicy/v0` plus one complete record |
| Scanner | no real consumer; digest includes observation time; no ruleset identity | diagnostic mistaken for compatibility | `PackageAnalysis/v1` and Studio adapter |
| Modularization | metadata and boundaries, no executable shared core | vacuous checks look like reuse | `EvidenceContract/v0` with two consumers and MUGEN adapter |

Report Studio and modularization as separate lanes even while the scorecard
keeps the current combined Studio score. No score changes in this audit.

## Architecture Decisions And Alternatives

### Redirected target dispatch

1. Widen every Target controller through a generic executor now. Broadest blast
   radius; candidate domains, ownership, scaling, target memory, and failures
   differ by controller.
2. Extract a target-family-only seam after the reserved cut, then add one
   controller at a time. **Recommended.** The seam owns destination resolution,
   candidate domain, fail-closed result, and telemetry; controller adapters own
   value evaluation and mutation.
3. Keep active and State -1 inline. Cheapest now, but duplication already exists.

### Turns lifecycle mutation

1. Roll back individual mutations after late failure.
2. Preflight every invariant into `RuntimeTurnsTransitionPlan/v1`, then commit
   once. **Recommended.** Smaller failure surface and clearer telemetry.
3. Clone and replace the entire runtime. Strong isolation, excessive identity
   and migration risk for the bounded topology.

### First shared module

1. Extract only Trust Chain record types; too shallow.
2. Extract a deep `EvidenceContract/v0` for state, blockers, freshness, target,
   action, and artifact identity, with Build/Evidence/MUGEN adapters.
   **Recommended after gate inputs become real.**
3. Create a generic engine-event or platformer core now; no second executable
   genre consumer exists.

### Provenance and release

Separate immutable provenance facts from versioned release policy. Do not claim
RFC 8785, full SPDX expression compliance, or PROV-O conformance until official
vectors, grammar, and relations are implemented. Until then use “deterministic
JSON”, “SPDX-like”, and “provenance-inspired”.

## Remaining Roadmap By Phase

1. **Preserve/reconcile:** let the concurrent owner close State -1
   `TargetPowerAdd`; reconcile selectors to Entry 549; record stale `CONTEXT.md`
   outside this automation's write surface.
2. **Operational evidence:** materialize the corpus; replace hardcoded Trust
   Chain greens; create and surface `PackageAnalysis/v1`; prove one complete
   first-party/generated asset release evaluation.
3. **Runtime risk:** extract redirected-target dispatch; add active
   `TargetLifeAdd`; add Turns preflight/commit; decide state-5900 policy and
   model `RuntimeRoundPhase/v0`/`RoundState`.
4. **Product trust/shared contract:** add `SourceWriteReceipt/v0` with explicit
   compensating restore, then promote the proven evidence model to shared core.
5. **Breadth:** add independent legal journeys before re-adjudicating scores;
   expand target/helper/projectile/common-state/audio/FightFX/screenpack support
   through package evidence; keep ZSS/Lua, exact teams, model stages,
   rollback/netplay as distinct later horizons.

## Next Ten Execution Tasks

1. **Close reserved State -1 TargetPowerAdd RedirectID.** Scope: current dirty
   cut only. Acceptance: caller/destination/remembered target distinct; exact,
   omitted, invalid, missing, and legacy cases; active path unchanged. Evidence:
   focused tests, TypeScript, trace syntax, required trace, diff check. Claim:
   root PlayerID plus State -1 only.
2. **Materialize CompatibilityCorpusSnapshot/v1.** Acceptance: artifact IDs and
   digests; missing/stale/duplicate required journeys fail closed; reproducible
   output copies no payload. Evidence: tamper/freshness tests, retained path and
   checksum, adjudication replay. No new score claim.
3. **Extract RuntimeRedirectedTargetDispatch/v0.** Dependency: task 1.
   Acceptance: active/State -1 share resolution, candidates, rejection, and
   telemetry with no unexplained checksum drift. Architecture claim only.
4. **Add active TargetLifeAdd RedirectID.** Dependency: task 3. Acceptance:
   `absolute`, `kill`, and scaling affect the destination's remembered target;
   expressions stay caller-owned. Evidence: caller/destination/subject-distinct
   trace plus fail-closed cases. No State -1/helper/team parity claim.
5. **Introduce RuntimeTurnsTransitionPlan/v1.** Acceptance: roots, state 5900,
   resources, active pair, and phase validate before mutation; injected failure
   leaves roster/resources/vars/round unchanged. Claim: bounded atomic handoff.
6. **Decide state 5900 policy and model RuntimeRoundPhase/v0.** Acceptance:
   intro/active/over/transition observable; `RoundState` is not constant;
   KO -> 5900 -> active trace; policy matches a short ADR. No motif claim.
7. **Replace hardcoded greens with GateEvidenceResult/v0.** Acceptance: command,
   tool/ruleset version, timestamp, digest, and freshness back every green;
   missing/stale is pending or blocked. Evidence: tests and browser screenshot.
8. **Produce PackageAnalysis/v1 and a production consumer.** Acceptance: source
   SHA-256, analyzer/ruleset/upstream identity, time-independent semantic digest,
   nested fail-closed validation, source drilldown in Studio. Static-analysis
   claim only.
9. **Prove AssetReleasePolicy/v0 on one complete record.** Acceptance:
   permission/license, hashes, linked transforms, required QA, collision,
   playtest, and path redaction pass for one owned/generated asset; unknown,
   missing, or fail blocks. No legal-approval or imported-MUGEN claim.
10. **Add SourceWriteReceipt/v0, then EvidenceContract/v0.** Acceptance:
    before/after digests, source revision, permission, outcome, retained preimage,
    compensating restore; shared contract has Build/Evidence consumers and no
    fighting terms. No ACID, ZIP, multi-file, or multi-genre claim.

## Risks

- Concurrent work can move the cursor; future agents must rerun bootstrap.
- Micro-controller progress can grow traces without package breadth.
- A generic redirect abstraction can erase controller-specific semantics.
- Hardcoded/stale evidence can falsely mark Studio exportable.
- “Canonical”, “SPDX”, and “PROV” labels can overstate compliance.
- `CONTEXT.md` remains stale outside this automation's permitted write surface.

## Primary Sources

- Elecbyte, [State Controller Reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html) and [Trigger Reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html).
- IKEMEN GO, [new state controllers and RedirectID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid).
- Pinned IKEMEN GO revision: [`compiler_functions.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go), [`char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go), and [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go).
- WHATWG, [File System Standard](https://fs.spec.whatwg.org/).
- IETF, [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785.html).
- SPDX, [License Expressions 3.0.1](https://spdx.github.io/spdx-spec/v3.0.1/annexes/spdx-license-expressions/).
- W3C, [PROV-O](https://www.w3.org/TR/prov-o/).

No Three.js research was needed for this cut: the newly exposed risks are
lifecycle, compiler/runtime ownership, evidence, filesystem, and provenance
contracts rather than renderer API behavior.

## NO CODE CHANGED

This audit changed roadmap, architecture, research, and local roadmap-task
documents only. It did not change source, runtime, UI, tests, scripts, assets,
or configuration and did not create a commit or push.
