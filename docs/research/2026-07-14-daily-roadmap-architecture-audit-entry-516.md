# Daily Roadmap And Architecture Audit - Entry 516

Date: 2026-07-14
Automation cutoff: 2026-07-14T03:59:41.203Z
Committed checkpoint: entry `516`, HEAD `0f228a0c`, 598/598 declared traces (564 required, 34 optional)
Pinned IKEMEN GO revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

After the guard, dizzy, red-life, LifeShare, HUD, lifecycle, and first
next-round reset gates landed, which remaining cuts create independent product
evidence and which runtime ownership decisions must be fixed before broader
MUGEN/IKEMEN claims?

## Executive Summary

Eighteen commits landed after the automation cutoff and advanced numbered truth
from entry 505 to entry 516. Entries 506-516 close bounded red-life actor
ownership, guard points, auxiliary projection, dizzy state/defaults/scaling/
break, red-life LifeShare, lifecycle rebind, HUD, and the first post-KO resource
reset into round 2. Entry 516 declares 598/598 traces and full gates. This audit
read those reports but did not re-run them. Scores therefore remain 65 / 35 /
20 / 10-12 / 6-8 / 25.

The product bottleneck is still breadth evidence, not another isolated runtime
controller. Build `CompatibilityCorpus/v0`, adjudicate its written score band,
then add one materially independent legal stage/package route. Documentation
must not inflate the denominator or the score.

The runtime risk moved to match lifecycle ownership. During this audit,
uncommitted match-outcome and state-5900 source/tests appeared from another
task. They are preserved, reserved, and not counted as evidence. The committed
round reset currently proves only 1 -> 2. Before broader round/team claims, the
next closed sequence must distinguish match result, round phase, per-actor
`RoundsExisted`, state-5900 source resolution, and the transition transaction,
then prove 1 -> 2 -> 3 and automatic Turns continuation.

No score moves in this research/docs pass.

## Changes Since The Previous Execution

- 18 commits landed after the cutoff; HEAD remained `0f228a0c` while this audit
  ran.
- The numbered maximum advanced from 505 to 516.
- Declared trace coverage advanced from 587/587 at entry 505 to 598/598 at
  entry 516.
- Entries 511-516 made the prior omitted-dizzy-default, dizzy scaling/break,
  red-life LifeShare, lifecycle, HUD, and reset selector obsolete.
- No new committed Studio authoring, provenance v2, package analysis, or shared
  modular contract landed.
- The tree started clean and became dirty from concurrent runtime/test work in
  match outcome and state 5900. This audit neither modified nor validated it.
- Several control docs still pointed at entries 476, 505, or 510 and selected
  gates already closed. This pass updates only roadmap, research, and local
  issue documents; it intentionally does not allocate a numbered entry while
  the concurrent implementation owner may need the next number.
- `CONTEXT.md` remains a known stale root-level cursor. It is outside this
  automation's allowed edit surface.

## Verified Facts, Inferences, And Open Questions

### Verified facts

- Elecbyte defines `RoundNo` as the current round number, `RoundState` as a
  phase value, `RoundsExisted` as player-specific history useful for Turns
  entrants, and `MatchOver` as observable only once the players enter win-pose
  state 180. See the [MUGEN 1.1 trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html).
- MUGEN common state 5900 is the round initialization hook and may be overridden
  by a character; the Common1 layer therefore matters. See the
  [MUGEN 1.1 CNS documentation](https://www.elecbyte.com/mugendocs-11b1/cns.html).
- Pinned IKEMEN separates wins-to-match policy in
  [`matchOver()`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1475-L1479),
  phase/outro logic in
  [`roundState()`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1739),
  reset and state 5900 in
  [`resetRound()`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2300-L2395),
  wins/win poses in
  [`stepRoundState()`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3255),
  and normal/Turns/match-end continuation in
  [`runNextRound()`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L4051-L4110).
- Pinned IKEMEN computes `RoundsExisted` from actor/team context rather than
  globally from the round number. See
  [`char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6007-L6018).
- MUGEN 1.1 stages combine local/camera settings, ordered normal/animated BG,
  layers, BGCtrl timing, and round-reset behavior. See the
  [Elecbyte background/stage reference](https://www.elecbyte.com/mugendocs-11b1/bgs.html).
- Three.js `renderOrder` affects explicit ordering but opaque and transparent
  objects still use separate sort lists. See
  [`Object3D.renderOrder`](https://threejs.org/docs/pages/Object3D.html#renderOrder)
  and [`WebGLRenderer.sortObjects`](https://threejs.org/docs/pages/WebGLRenderer.html#sortObjects).
- `createWritable()` stages writes until close but does not provide an
  application-level rollback after a successful close. See the
  [File System Standard](https://fs.spec.whatwg.org/#dom-filesystemfilehandle-createwritable)
  and [File System Access draft](https://wicg.github.io/file-system-access/).
- Canonical JSON can provide repeatable config digests through
  [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785.html). Provenance vocabulary
  can distinguish Entity, Activity, and Agent through
  [PROV-O](https://www.w3.org/TR/prov-o/); license assertions should use
  [SPDX 3.0.1 license expressions](https://spdx.github.io/spdx-spec/v3.0.1/annexes/spdx-license-expressions/).
- CC0 does not remove rights held by third parties; a legal fixture still needs
  known authorship/scope and repository-owned inputs. See the
  [CC0 1.0 legal code](https://creativecommons.org/publicdomain/zero/1.0/legalcode.en).

### Inferences

- `wins >= matchWins` is a useful pure internal result, but it does not by
  itself prove exact MUGEN `MatchOver` trigger timing.
- `RoundsExisted = roundNo - 1` is unsafe as a global rule because a Turns
  replacement can first exist in a later global round.
- State 5900 availability cannot be decided from character-local states alone;
  character/Common1 precedence must be explicit.
- MUGEN BG order should become a semantic ordinal mapped to explicit renderer
  passes/order. Z alone is insufficient where transparent sorting differs.
- Studio must validate and compile in memory before opening a writable stream.
  A post-close recovery is a new compensating transaction, not atomic rollback.
- Provenance hashes prove identity, not ownership. License/permission evidence
  is a separate fail-closed field.

### Open questions

- Does the in-flight outcome implementation model MUGEN-observable win-pose
  timing or only an internal decisive result? Its claim must match the answer.
- Does state 5900 resolve Common1 before reporting unavailable?
- Which variable/map/remap classes persist across the next-round transaction?
- Does the first legal stage include zoom? Recommendation: defer zoom until
  localcoord, BG order/layers, BGCtrl timing, and `resetBG` are independently
  green.
- Which second real consumer justifies the first shared Build/Evidence contract?
  Two UI views over the same `App.ts` policy are not independent consumers.

## Gap Map By Horizon And System

| Horizon/system | Demonstrated boundary | Highest-value gap | Blocked claim |
| --- | --- | --- | --- |
| Playable sandbox (65) | Native/imported browser paths, HUD, controls and smoke; entry 516 exposes round 2. | Stable multi-round 1 -> 2 -> 3, no state/resource drift, bounded-worker ZIP reproducibility. | Release readiness, production assets, long-session stability. |
| MUGEN-lite MVP (35 / 20) | One CC0 journey plus independent legal character/palette routes. | Versioned corpus denominator, score adjudication, independent legal stage route. | Broad practical compatibility from a few fixtures. |
| Practical/full MUGEN (10-12) | Broad bounded parser/controller/Common1/Helper/Projectile evidence. | VM/redirect breadth, common-state exactness, stage/audio/palette/FightFX/screenpack/lifebar packages. | Full 1.0/1.1 parity or patch-free breadth. |
| IKEMEN runtime (6-8) | P1-P8 topology, selected Tag/Turns/team/resource seams. | Exact outcome/phase/5900/Turns lifecycle; Simul/Tag consumers; later ZSS/Lua/rollback. | IKEMEN-class port, netplay, exact team choreography. |
| Renderer/Three.js | Bounded stage/player/effect ordering and red-life HUD. | Independent stage BG/layer/BGCtrl/reset route and explicit transparent-pass policy. | Full stage, motif or screenpack fidelity. |
| Studio/product (25) | Source identity, transactions, folder editing, Build/Evidence UI. | Side-effect-free semantic draft, conflict/reimport verification, later structured editors/export. | Durable general editor or production publish pipeline. |
| Assets/provenance | Per-file v1 input/output digests. | v2 license assertion, canonical config, ordered transform chain, tool version, QA links. | Ownership from hashes, asset DB or production readiness. |
| Scanner | Character-oriented recognized/unsupported findings. | Versioned VFS dependency graph shared by character/stage/system/screenpack. | Runtime execution from scanner recognition. |
| Modularization (10) | Metadata registry and boundary guard. | One stable Project/Evidence/Build contract with MUGEN adapter and two real consumers. | Generic engine, SDK or platformer from empty contracts. |

## Proposed Architecture Decisions

### 1. Separate five match-lifecycle axes

Recommended contracts:

1. `RoundOutcome/v0`: KO/DKO/draw/time-over and winner/loser sides.
2. `MatchOutcome/v0`: wins before/after, match-wins policy, decisive result.
3. `RoundPhase/v0`: intro, fight, over, win poses, observable `MatchOver`.
4. `RoundEntry/v0`: per-actor `RoundsExisted` and state-5900 source/entry.
5. `RoundTransition/v0`: atomic roster/resource/reference/reset transaction.

Alternative A is one `nextRound()` mutation. It is smaller but conflates policy,
phase, reset, team replacement, and presentation; it also hides the current
round-number collapse risk. Alternative B is one large MatchLifecycle world.
It centralizes state but creates a high-coupling owner. Small versioned contracts
composed by `PlayableMatchRuntime` keep policy testable and make claim ceilings
explicit.

### 2. Make corpus evidence the only compatibility score input

`CompatibilityCorpus/v0` should enumerate package identity, provenance,
availability class (`required-legal`, `portable-legal`, `optional-private`),
route requirements, unsupported/failure taxonomy, evidence references, and
deterministic digest. A score adjudicator consumes the versioned report; docs,
test count, or a new controller alone cannot move the band.

Alternative: count passing packages. Rejected because optional/private absence,
route duplication, and fixture-specific patches would inflate breadth.

### 3. Preserve semantic stage order before adapting to Three.js

Stage parsing should retain source ordinal, layer, localcoord/camera context,
BGCtrl timeline, and reset behavior. The Three.js adapter then maps semantic
passes/order deliberately. Do not encode MUGEN order only as world Z or rely on
automatic transparent sorting.

### 4. Preflight Studio writes and record compensating recovery

`StudioSemanticDraft/v0` binds source id, path, base fingerprint/digest,
compiler profile/version, draft digest, and diagnostic digest. The save flow
revalidates fingerprint and permission before `createWritable()`, writes/closes,
then reimports and checks the final digest. An invalid draft never opens the
stream. Failure after close becomes an explicit compensating transaction.

### 5. Model provenance as identity plus assertions plus transforms

`AssetProvenance/v2` uses a canonical ordered transform array, input/output
SHA-256 digests, tool/version, canonical config digest, Entity/Activity/Agent
links, SPDX expression, declared permission scope, and QA/collision/playtest
references. Migration from v1 marks missing data `unknown`; it never infers a
license or tool version.

### 6. Analyze packages before promoting a shared core

`PackageAnalysis/v0` is a MUGEN-specific, source-mapped VFS graph with package
kind, source file/section/key, raw reference, resolved path/search roots,
dependency role, profile/version, and `recognized | unsupported | unknown |
error`. Character, stage, system, and screenpack use one entry. Only after this
and provenance/build work produce two real consumers should a minimal shared
Project/Evidence/Build seam be promoted.

## Remaining Roadmap By Phase And Dependency

1. **Evidence breadth:** CompatibilityCorpus v0 -> deterministic report ->
   explicit band adjudication -> independent legal stage/package route.
2. **Round correctness:** close the reserved outcome/5900 work -> audit timing
   and Common1 -> atomic 1 -> 2 -> 3 -> CNS trigger context -> automatic Turns.
3. **MUGEN-lite expansion:** stage BG/layer/BGCtrl/reset, then package/audio/
   palette/Common1 routes selected from measured corpus failures.
4. **Studio trust:** SemanticDraft -> preflight/save/reimport -> conflict and
   compensating recovery -> structured editing and production export later.
5. **Asset trust:** Provenance v2 -> fail-closed Build Readiness/export manifest
   -> persistent asset index only when real workflows require it.
6. **Scanner breadth:** PackageAnalysis VFS graph -> character/stage/system/
   screenpack reports -> explicit runtime issues only for selected features.
7. **Modular seam:** promote one Project/Evidence/Build contract after two real
   adapters/consumers -> enforce non-fighting leakage boundary -> evaluate a
   non-fighting consumer later.
8. **Full MUGEN/IKEMEN:** expand by corpus-ranked failure density; screenpacks,
   motif, exact team modes, ZSS/Lua and rollback/netplay remain later phases.

## Next Ten Execution Tasks

### T1 - CompatibilityCorpus/v0

- Scope: aggregate the existing CC0, independent legal, palette, and optional
  private routes without copying package assets.
- Dependencies: existing Journey v1 and entries 480-483.
- Probable systems: compatibility reports, trace manifest, package identity,
  `docs/PORT_COMPLETION_SCORECARD.md`.
- Acceptance: deterministic schema/digest; legal/portable/optional classes;
  exact route matrix; unsupported/failure density; tamper and absent-optional
  cases fail distinctly.
- Evidence: focused schema/report tests plus one generated corpus report.
- Allowed: measured bounded corpus envelope. Blocked: broad/public parity.

### T2 - Compatibility score adjudicator

- Scope: consume exactly one versioned corpus report and apply written band
  criteria.
- Dependencies: T1.
- Acceptance: every score decision links denominator, failures, exceptions, and
  evidence; unchanged is a valid result; docs-only input cannot promote.
- Evidence: adjudication snapshot and scorecard diff with rationale.
- Allowed: score for that corpus version. Blocked: extrapolation beyond it.

### T3 - Independent legal stage/package route

- Scope: repository-authored CC0 stage inputs covering localcoord/camera,
  normal/animated BG, layer 0/1, bounded BGCtrl timing, and `resetBG`.
- Dependencies: T1 identity/provenance shape; T2 may run before or after.
- Acceptance: exact semantic ordinal survives parse/runtime/render; BGCtrl resets
  between rounds; no third-party/commercial asset; zoom deferred.
- Evidence: loader/runtime trace plus desktop/mobile screenshots and legal digest.
- Allowed: this stage envelope. Blocked: broad stage/screenpack parity.

### T4 - Close and audit reserved MatchOutcome/state-5900 work

- Scope: current implementation owner only; no duplicate edits.
- Dependencies: the present dirty-tree task.
- Acceptance: numbered backlog entry; focused and aggregate gates; explicit
  internal-result versus MUGEN-trigger timing claim; character/Common1 5900
  precedence; unavailable is fail-closed.
- Evidence: outcome/draw/match-wins and 5900 source/entry tests plus trace.
- Risk: a pure wins threshold may be mislabeled as exact `MatchOver`.

### T5 - Atomic multi-round transition 1 -> 2 -> 3

- Scope: separate next-round transition from full match reset and keep round,
  plan, snapshot, tick, identities, Tag order, resource owners and persistence
  policy coherent.
- Dependencies: T4.
- Acceptance: 1 -> 2 -> 3 never collapses; failures are atomic; red-life reset
  and carry policies remain stable; no new UI-only authority.
- Evidence: focused transition tests and required imported multi-round trace.
- Allowed: bounded multi-round transition. Blocked: full match choreography.

### T6 - Round trigger context and per-actor RoundsExisted

- Scope: route `RoundNo`, `RoundState`, `RoundsExisted`, and `MatchOver` through
  explicit expression context; remove constant fallbacks for executed routes.
- Dependencies: T4-T5.
- Acceptance: Single actor and late Turns entrant differ correctly; state 5900
  can branch on zero; observable MatchOver follows the declared phase policy.
- Evidence: evaluator/context tests plus Single and Turns traces.
- Risk: deriving all actors from global round number is prohibited.

### T7 - Automatic Turns continuation

- Scope: compose team decision -> handoff -> resource transition -> state 5900
  -> next fight, with side defeat separate from replacement.
- Dependencies: T4-T6.
- Acceptance: deterministic actor/reference ownership; no P1/P2 pair shortcut;
  replacement and final defeat traces are distinct.
- Evidence: required Turns traces and lifecycle/read-model tests.
- Blocked: exact Tag/Simul, motif, ZSS/Lua, rollback/netplay.

### T8 - StudioSemanticDraft/v0

- Scope: preflight one CNS/ST document in memory against source revision and
  fingerprint before the existing write/reimport transaction.
- Dependencies: existing SourceTransaction/folder editing.
- Acceptance: deterministic diagnostics; invalid draft never calls writable;
  valid draft revalidates permission/fingerprint and verifies final digest.
- Evidence: hostile unit tests and browser smoke invalid -> fix -> save ->
  reimport.
- Blocked: general structured editor, ZIP rewrite, post-close atomic rollback.

### T9 - AssetProvenance/v2 and fail-closed readiness

- Scope: canonical schema/migration, SPDX assertion, digests, tool/version,
  ordered transforms, output hashes, QA links; connect one real readiness gate.
- Dependencies: provenance v1; T8 only for source-write linkage.
- Acceptance: canonical serialization; v1 missing facts become unknown; missing
  license/digest blocks export; one primary remediation action.
- Evidence: schema/migration/readiness/export tests and blocked/repaired smoke.
- Allowed: recorded reproducible chain. Blocked: ownership beyond assertion.

### T10 - PackageAnalysis/v0, then one real modular contract

- Scope: first build the scanner-only VFS graph for character/stage/system/
  screenpack. After T8-T9 and two real consumers exist, extract the minimum
  Project/Evidence/Build record with a MUGEN adapter.
- Dependencies: scanner fixtures; T8-T9 for modular promotion.
- Acceptance: source-mapped graph and classified findings; later contract has
  keep/delete rationale, two real consumers, and a non-vacuous import boundary
  with no CNS/CMD/HitDef/round/helper leakage.
- Evidence: report snapshots, contract/import tests, unchanged fighting gates.
- Blocked: scanner runtime execution, generic engine, SDK, platformer claim.

## Risks And Claim Boundaries

- The in-flight dirty tree may close or change while this document is edited.
  Re-read HEAD, maximum backlog entry, and its closeout before starting T4-T7.
- Entry 516 proves only the reported bounded route; this audit did not reproduce
  its test or browser evidence.
- Default unconstrained Vitest retains reported ZIP byte nondeterminism; use the
  bounded worker command until the cause is isolated.
- Auxiliary-resource diagnostics may still describe red-life LifeShare as
  deferred even though entry 513 closed it; fix that stale projection only when
  its owning runtime task is active.
- Legal-stage work must use repository-owned inputs and record authorship/scope;
  license labels alone do not clear third-party rights.
- Scanner recognition is not parser or runtime execution. Provenance hashes are
  not ownership. Documentation is not compatibility evidence.
- Screenpack/motif, exact Common1/VM timing, variables/maps/remaps persistence,
  full Simul/Tag/Turns, ZSS/Lua, rollback/netplay, public package breadth, and
  broad MUGEN/IKEMEN parity remain blocked.

## NO CODE CHANGED

This audit changed only roadmap, research, and local issue documents. It did
not modify runtime, UI, source, tests, assets, or dependencies; it did not run
code suites, commit, or push.
