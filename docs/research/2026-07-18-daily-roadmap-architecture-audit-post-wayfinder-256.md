# Daily roadmap and architecture audit: post-Wayfinder 256

Date: 2026-07-18  
Mode: research, architecture, and roadmap only  
Audited repository: `D:\DEV\threejs-mugen\mugen-web-sandbox`

## Executive state

Audited evidence tuple: HEAD `50801d842ba49d6ee5d672e87bfcb634e5c8ed27`,
maximum numbered backlog Entry 555, latest closed lane ticket Wayfinder 256.
The latest declared runtime evidence is 633/633 trace artifacts and the latest
declared full suite is Wayfinder 256 at 230/230 files and 2388/2388 tests.
Those results belong to the named closeout, not to future HEADs.

After that tuple was frozen, the shared branch advanced to observed HEAD
`064e2db0` with Wayfinder 257 Common1 fall-defense implementation in progress.
Ticket 257 is still open, has no batched closeout, and cites local `044da720`
as its source pin. It is preserved as concurrent work but excluded from every
completed/evidence/score claim in this audit. This reinforces, rather than
resolves, the source-authority blocker.

The last daily roadmap document audited `83f85bae` / Entry 555 / Wayfinder 229.
The closed evidence tuple is 69 commits later and observed working HEAD is 71
commits later. The automation timestamp also has a later git cutoff,
`9555f117`; 40 commits exist after that cutoff, of which the final two belong
to open Wayfinder 257. Both comparisons are retained so a delayed automation
timestamp is not confused with the last documented architecture tuple.

Since the documented tuple, the repository closed:

- `AssetReleasePolicy/v0`, the bounded SPDX subset, `EvidenceEnvelope/v0`, its
  Studio producer, source-write compensation, project release decision, and
  deterministic semantic export;
- redirected-dispatch characterization, lease freshness, centralized commit
  and attribution, ADR 0006, and helper-destination `TargetState` ownership;
- helper State `-1`, helper/root global states `-4/-3/-2/-1/+1`, multi-source
  negative-state merge, character/Common state precedence, and global CNS
  `Common.States`;
- helper-local command-buffer ownership across active, Pause, and hitpause;
- `[Common] Cmd`, `Const`, `Air`, and `Fx` bounded loader routes; and
- SOCD modes `0`-`4` at the current `Set`-ordered tick boundary.

No score-band adjudication accompanied those closeouts. Keep the practical
scores at sandbox 65, MUGEN-lite 36, MUGEN 20, modular engine 10-12, IKEMEN
6-8, and Studio 25. Documentation and controller count do not move scores.

Two new blockers dominate the next queue:

1. **Source authority drift.** Issue 07 and `PackageAnalysis/v1` name
   `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` as normative. The shallow local
   checkout is `044da72008b8ba13caf7b0f820526ce16e955fb3`, does not contain the
   normative object, and has untracked files. Recent research repeatedly calls
   this mutable cache "pinned". The implementations are not automatically
   invalid, but new IKEMEN parity claims require a file-level pin-delta audit.
2. **SOCD temporal fidelity.** Wayfinder 256 deliberately implements modes 1
   and 3 from the insertion order of one iterable. The normative IKEMEN
   `InputReader` keeps `SocdFirst` state across ticks. Modes 0, 2, and 4 have a
   strong bounded truth-table claim; modes 1 and 3 remain a deterministic local
   approximation until a per-seat edge-history contract is proved.

The Common.Fx loader also retains one explicit evidence residual: its isolated
browser smoke timed out after 424.1 seconds before diagnostics were written.
No visual/audio browser-pass claim exists for that slice.

## Verified facts, inferences, and open questions

### Verified facts

- `50801d84` closes Wayfinder 256 with focused 278/278, full 230/2388,
  TypeScript, build, boundaries, redirect boundary, and 633/633 trace results.
  Browser smoke was marked not applicable because no visible surface changed.
- `RuntimeInput.resolveRuntimeSocdInput` is pure and receives only the current
  iterable. `PlayableMatchRuntime` calls it once per player at tick ingress.
- Runtime option wins over P1 imported configuration, which wins over P2
  imported configuration, which wins over the profile default. Conflicting P1
  and P2 package values produce no match-authority diagnostic.
- The normative IKEMEN source stores `SocdFirst` and `SocdAllow` on
  `InputReader`, updates them across calls, and resets them through reader
  reset. The official wiki defines modes 0-4 and says mode 4 is the default.
- The normative default config exposes `[Common] Air`, `Cmd`, `Const`,
  `States`, `Fx`, `Modules`, and `Lua`. The local bounded loader executes CNS
  States and Cmd/Const/Air/Fx, while ZSS, Modules, and Lua remain unsupported.
- `CompatibilityCorpusSnapshot/v1.1` records source revision
  `a2c84f055c2983ddece82f9f2ef8d4c354c8b631`, while current HEAD is different.
  Its summary has two passed required-legal routes, but its allowed claim still
  says "one repository-owned legal journey". It therefore needs rebuilding and
  claim reconciliation before it can be called current.
- `RuntimeRoundState5900/v0` records availability by actor ID but not the
  selected state source path, digest, or precedence layer.
- The live Turns commit route calls `applyTeamRoundHandoff` before later
  blocking branches and broad reset/resource/state mutations. No rollback or
  all-state commit object is present at that boundary.
- `scripts/check_boundaries.cjs` skips missing configured roots. `src/core`,
  `src/platformer`, and `src/modules/platformer` do not exist; `src/engine`
  contains one allowlisted metadata file. A green boundary check is therefore
  not proof of a reusable shared core.
- `EvidenceEnvelope/v0` has two domain adapters and a productive Studio
  consumer, but lives in `src/app` and imports MUGEN domain result types. It is
  a proven extraction candidate, not an extracted generic core contract.

### Inferences that need gates

- Reconstructing a `Set` in a different order on a later frame can change
  modes 1/3 without changing which directions are held. Physical keyboard
  insertion order may often mask this, but virtual/physical merges and direct
  `MatchInput` callers do not guarantee IKEMEN's cross-frame semantics.
- Selecting an imported input policy from P1 before P2 treats character
  packages as game-config authorities. Mixed packages need an explicit
  match/system owner or a visible conflict decision.
- The existing Turns preflight reduces failure risk, but post-handoff branches
  make atomicity a claim that still needs adversarial failure proof.
- Reusing current pairwise projectile helpers for three or more projectiles can
  make pair enumeration and mutation order observable. A global schedule must
  exist before proxies or broader multi-root projectile participation.
- Moving `EvidenceEnvelope` immediately would move domain imports into a folder
  called shared core. Extraction should split generic facts from GateEvidence
  and PackageAnalysis adapters and make missing boundary roots fail.

### Open questions

1. Did any relevant input, compiler, common-loader, round, or projectile
   semantics change between local `044da720` and normative `05b7d98`?
2. Does the public runtime input boundary represent physical left/right or
   player-relative back/forward, especially across facing changes?
3. Which object owns `[Input]` when two imported packages carry different game
   configs: system package, saved project, match options, or selected P1?
4. What exact cache, duplicate-prefix, and promotion rules must Common.Fx use,
   and which visual/audio fixture proves them in the browser?
5. Which selected state source supplies state 5900 after character, `stcommon`,
   and global Common.States precedence?
6. What are the profile-owned transitions and timing for RoundState 0-4?
7. What is the source-backed total order for three-plus projectile pairs,
   cancel mutation, hitpause, contact timers, and survivors?
8. What minimum second character-centered legal route is independent enough to
   justify another score-band review?

## Gap map by horizon and system

| Horizon | Demonstrated boundary | Remaining discriminator | Claim blocked now |
| --- | --- | --- | --- |
| Playable sandbox | Local two-player browser runtime, generated roster/stage, debug and Studio surfaces; score 65 | Common.Fx browser proof, current evidence rebuild, stateful SOCD 1/3, releasable-project fixture | public-product stability, exact presentation/audio parity |
| MUGEN-lite MVP | One repository-authored CC0 character journey plus one legal character/stage package; score 36 | second independent character-centered journey, current corpus snapshot, explicit score adjudication | representative package breadth, broad Common1 parity |
| Practical MUGEN | Bounded DEF/CMD/CNS/AIR/SFF/SND, common CNS/config sources, direct/helper/projectile routes; score 20 | Common defaults/provenance, global projectile order, wider legal corpus, exact round/get-hit ownership | full MUGEN character/system compatibility |
| IKEMEN | Explicit profile, plural roots/Tag slices, negative/global states, common sources, helper buffers, bounded SOCD; score 6-8 | immutable source authority, stateful input, atomic Turns, round phases, ZSS/Lua/Modules policy, proxies/rollback/netplay | IKEMEN parity, raw InputBuffer/AI, rollback/netplay |
| Studio/product | Revisioned evidence, compensating source write, release decision, semantic export; score 25 | changed-source browser case, persisted reanalysis/diff, one releaseable full project, crash/multi-file durability | public publish, crash-safe authoring, legal approval |
| Assets/provenance | One fail-closed release policy and one ready Nova record | second independent first-party/generated record, fresh visual/collision/playtest proof | commercial/third-party authorization, portfolio-wide release |
| Scanner/reference | PackageAnalysis/v1 with productive multi-kind Studio/export use | source-authority manifest, pin-delta classification, saved reanalysis and semantic diff | runtime or renderer support from recognition alone |
| Modular engine | Metadata registry, candidate evidence facts, nominal boundary script; score 10-12 | generic contract extraction, real import graph, missing-root failure, deletion proof | reusable engine, platformer, multi-genre SDK |

## Proposed architecture decisions

| Decision | Selected direction | Rejected shortcut and tradeoff | State |
| --- | --- | --- | --- |
| A1 source authority | Add `SourceAuthorityManifest/v0`: normative upstream SHA, repository URL, relevant file digests, local-cache SHA/state, and semantic-delta status | Calling whichever shallow checkout is present "pinned" is fast but irreproducible | proposed, blocking new normative claims |
| A2 SOCD ownership | Add one persistent `RuntimeSocdState/v0` per input seat; consume press/release edges, resolve once at tick ingress, reset on match/reset/blur/config change | Current iterable order is deterministic but not temporal state | proposed; keep T256 as bounded approximation |
| A3 input config authority | Saved project/system match config owns SOCD; explicit runtime option overrides; character packages contribute observations, not silent precedence | P1-first fallback is simple but makes package order gameplay policy | proposed |
| A4 common-source evidence | Publish ordered Common source records with category, resolved path, format, digest, precedence and supported/unsupported status | Diagnostics without identity cannot explain state or asset selection | proposed |
| A5 round composition | Keep match outcome, `RuntimeRoundPhase`, state-5900 source selection, per-member history, and motif presentation as separate owners | One round integer or state availability list hides timing and provenance | proposed |
| A6 Turns transaction | Prepare one immutable before/after continuation commit containing roster, team state, resources, vars, round/context, state source and diagnostics; mutate only after full validation | Sequential mutation is easier but cannot prove no-op failure | proposed |
| A7 projectile schedule | Centralize a read-only global pair schedule, then consume it through one resolution commit | Nested live mutation makes three-plus ordering implicit | proposed |
| A8 evidence extraction | Split a domain-neutral envelope core from GateEvidence/PackageAnalysis adapters only when real roots are mandatory and import/deletion tests fail closed; release policy stays outside | Moving `src/app/EvidenceEnvelope.ts` wholesale would preserve domain coupling under a generic name | proposed |

## Prioritized remaining roadmap

### Phase A - authority and evidence residuals

Reconcile the triple cursor, establish immutable source authority, classify the
`044da720 -> 05b7d98` semantic delta, rebuild current evidence, and close the
Common.Fx browser residual. This phase blocks stronger IKEMEN and release
claims.

### Phase B - input and common-system fidelity

Characterize SOCD temporal failures, add per-seat state and match-level config
authority, settle facing/device symbols, then close Common source provenance,
visual FX, AIR/Const defaults, and scanner-only ZSS/Lua/Modules handling.

### Phase C - match and projectile determinism

Add state-5900 provenance and a profile-owned round phase model before an
all-or-nothing Turns transaction. Then prove a 1 -> 2 -> 3 journey. Separately
centralize and gate three-plus projectile order before proxy/multi-root breadth.

### Phase D - compatibility breadth and product trust

Build a second character-centered legal journey, adjudicate scores only from
fresh evidence, prove changed-source staleness in Studio, persist reanalysis
and semantic diffs, then produce one releaseable full-project decision and
crash/multi-file source recovery.

### Phase E - assets and modular extraction

Prove a second first-party/generated release record. Only then extract the
generic evidence facts with a non-vacuous boundary gate. Platformer or broad
engine work remains after that proof, not inside this 30-task tranche.

## Next 30 execution-ready tasks

Priority is `P0` before `P1` before `P2`. A task may start only after its named
dependencies are closed. Probable files are routing hints, not authorization to
widen scope.

| ID | Pri | Dependencies and probable scope | Acceptance and required evidence | Risk and allowed/blocked claim |
| --- | --- | --- | --- | --- |
| T01 Control tuple reconciliation | P0 | none; roadmap owner docs and `.scratch/roadmap/issues/01..07` | Every current selector names HEAD/Entry/Wayfinder separately; history is labeled; `rg` contradiction scan plus `git diff --check` | Low. Allows only current roadmap truth; no score/runtime claim. |
| T02 SourceAuthorityManifest/v0 | P0 | T01; `docs/adr`, `.scratch/roadmap/research`, scanner metadata | Record normative `05b7d98`, remote URL, relevant file SHA-256s, local `044da720` cache and dirty state; parser/validation design rejects absent or mismatched identities | High authority risk. Allows reproducible research identity only. |
| T03 Pin-delta semantic audit | P0 | T02; IKEMEN `input.go`, `compiler.go`, default config, round/projectile/redirect sources | File-level diff table classifies unchanged/changed/unknown contracts used by Wayfinders 230-256; immutable links and digests attached | High. Existing slices stay bounded; no parity until relevant deltas are cleared. |
| T04 Current corpus/evidence rebuild | P0 | T01; corpus materializer and tracked snapshot | Rebuild at current source revision/reference time; every required artifact exists and matches; allowed claim agrees with two required routes; stale/tamper/revision negatives pass | High evidence risk. Allows a current denominator, not new compatibility. |
| T05 Common.Fx browser residual | P0 | T01; system-assets fixture, focused browser harness | Isolated diagnostics complete without timeout; 0 page/console errors; common prefix animation/sound selection and missing/duplicate diagnostics are captured | Medium flake/visual risk. Allows only the named Common.Fx route. |
| T06 Cross-frame SOCD characterization | P0 | T03; `RuntimeInput`, keyboard/virtual adapters, runtime tests | Failing-first sequences cover B then F, release/repress, reconstructed Set order, both seats, Pause/hitpause and reset for modes 1/3 | High semantic risk. Characterization only; no fix or parity claim. |
| T07 RuntimeSocdState/v0 | P0 | T06; `RuntimeInput`, `PlayableMatchRuntime`, reset/input adapters | Per-seat first-held state survives ticks, updates on edges, resets deterministically, and feeds every consumer once; focused tests plus required trace and full checkpoint | High input regression risk. Allows bounded offline 0-4 semantics; blocks raw InputBuffer/netplay/rollback. |
| T08 Match InputConfig authority | P0 | T02,T07; system import, project/match options, runtime creation | Explicit option > saved match/system config > profile default; conflicting package observations are visible and never silently P1-first; mixed-package tests | High gameplay-policy risk. Allows deterministic local config selection only. |
| T09 Physical/logical direction boundary | P1 | T07,T08; keyboard adapter, root routing, facing system | Document and test L/R to B/F mapping across P1/P2 and facing flips without corrupting held-edge history | High. Allows one device-to-logical contract; no remap/controller parity. |
| T10 ButtonAssist characterization | P1 | T07,T09; input adapter/buffer research and tests | Source-pinned one-frame assist, simultaneous buttons, Pause/menu reset, disabled path and SOCD order are implementation-ready | Medium. Research/characterization only; no raw IKEMEN input claim. |
| T11 CommonSourceRecord/v0 | P1 | T02,T03,T08; config loader/report/scanner | Every Air/Cmd/Const/States/Fx/Modules/Lua input records key order, path, digest, format, precedence, status and source config identity | High provenance risk. Allows deterministic source selection, not execution breadth. |
| T12 Common.Fx lifecycle and cache | P1 | T05,T11; system asset loader, effect stores, renderer/audio bridge | Duplicate prefixes, first-valid selection, reset/reimport/cache invalidation and visual/audio fixture behavior are deterministic; browser and trace proof | High presentation risk. No exact upstream cache or portfolio-wide parity beyond gates. |
| T13 Common.Air/Const ownership defaults | P1 | T11; AIR merge, constants/importer, source resolver | Character-over-common AIR, character sprite ownership, Copy/duplicate behavior, common-before-character constants and engine-default separation have source-pinned tests | Medium-high. Allows named merge/default rules; blocks full Common1/default tables. |
| T14 ZSS/Lua/Modules scanner policy | P1 | T03,T11; PackageAnalysis and unsupported diagnostics | Common entries are recognized with exact locations/dependencies and remain visibly unsupported; malformed/missing/unknown cases fail closed | Medium. Scanner-only claim; zero runtime credit. |
| T15 State5900 provenance v1 | P1 | T11,T13; state source resolver, round state owner, snapshots | Each actor records selected source path/digest/layer and precedence; character/stcommon/global/missing fixtures pass | High compatibility risk. Allows selected-source evidence only. |
| T16 RuntimeRoundPhase/v0 | P1 | T15; round/context evaluator and expression path | Legal phase values 0-4 and profile transitions are derived from events; intro/fight/pre-over/over traces cover `RoundState` timing | High timing risk. Blocks motif/continue/full round parity. |
| T17 TurnsContinuationPlan/v1 | P1 | T15,T16; Turns/roster/resource/context systems | Pure plan contains before/after roots, team state, resources, vars, counters, phase, state source and diagnostics; prepare mutates nothing | Critical. Allows implementation-ready transaction only. |
| T18 Turns atomic failure matrix | P1 | T17; `PlayableMatchRuntime` commit seam | Failure injected after every planned phase leaves roster, team state, resources, vars, round, active roots and snapshot digest unchanged | Critical state-corruption risk. Allows bounded atomic failure claim. |
| T19 Turns 1 -> 2 -> 3 journey | P1 | T18; legal synthetic fixture, trace/browser harness | Sequential incoming roots prove phase, RoundsExisted/history, 5900 source, resources, active roots and MatchOver; required trace plus browser diagnostics | High choreography risk. Allows only bounded Turns continuation. |
| T20 GlobalProjectileSchedule/v0 | P1 | T02,T03; projectile stores/combat bridge | Three-plus eligible projectiles enumerate each pair exactly once in source-backed stable order before mutation; schedule sidecar/tests | Critical ordering risk. Read-only schedule claim only. |
| T21 Projectile resolution commit oracle | P1 | T20; trade/contact/hitpause/timer worlds | Priority, cancellation, survivor priority decrement, contact kind, hitpause and timer order pass permutations across owners and same-owner/helper routes | Critical. Allows gated global order; blocks proxies/rollback/full parity. |
| T22 Proxy and multi-root projectile map | P2 | T19,T21; source research and ownership registry | Define proxy flattening, owner/root/parent identity, standby/team eligibility and namespace without implementation; produce deletion-gated next slice | High topology risk. Architecture only. |
| T23 Second character-centered legal journey | P1 | T04,T13; repository-authored CC0 fixture, loader/trace/browser/native harness | Materially different character source/controller assumptions cross ZIP/folder, loader, runtime, browser/mobile and native evidence with no fixture-specific branch | High corpus/legal risk. Allows only that route; no third-party assets. |
| T24 Score-band adjudication | P2 | T19,T21,T23; scorecard and evidence snapshot | Apply written discriminators to fresh artifacts; each moved/unchanged score cites denominator and blocking gaps | High claim risk. Scores move only if gates actually meet band text. |
| T25 Changed-source EvidenceEnvelope browser gate | P1 | T04; Studio linked package and export | Mutating source makes PackageAnalysis envelope stale and visible; diagnostic export stays possible, release blocks, ZIP preserves the same reason | High trust risk. Allows stale detection, not reanalysis. |
| T26 Persisted reanalysis and semantic diff | P2 | T02,T03,T25; PackageAnalysis storage/Studio/export | Save v1 report; reanalyze on source/ruleset/upstream change; diff stable finding IDs/locations/status; reload and ZIP preserve identities | High migration risk. Scanner/product claim only. |
| T27 Releaseable full-project decision fixture | P2 | T23,T25,T26; ProjectReleaseDecision and semantic export | One named saved repository project has matched revisions and current required evidence, produces `canRelease=true`; every included asset has a ready policy and every negative blocker remains fail-closed | High policy risk. Local decision only, not legal/public approval. |
| T28 Crash and multi-file source durability | P2 | T25,T26; source receipts, IndexedDB/project storage, folder/ZIP adapters | Recovery journal covers crash/reopen and multi-file create/update/delete; compensation is idempotent; conflict and restore-failed states remain inspectable | Critical data-loss risk. Allows named local durability route only. |
| T29 Second asset release record | P2 | T11,T12,T23; provenance, asset policy, QA/collision/playtest evidence | Independent repository-owned/generated record has permission/license, source/output digests, ordered transforms, fresh QA, collision and playtest; public paths are clean | High legal/asset risk. Allows that record only; no third-party/commercial use. |
| T30 Non-vacuous evidence-core extraction | P2 | T25,T26,T29; `src/app/EvidenceEnvelope`, future `src/core`, domain adapters, boundary script | Generic core has no fighting vocabulary/imports; MUGEN adapters remain outside; configured roots must exist; import/deletion negatives fail; productive Studio routes remain green | High architecture risk. Allows one shared facts contract, not a reusable engine/platformer. |

## Risks and claim ceiling

- The worktree already contains unrelated roadmap edits and untracked prior
  daily notes. Future agents must add narrow current overrides and never reset
  or overwrite those changes.
- `CONTEXT.md` and the root milestone selector remain stale but are outside this
  automation's allowed write surface. Current agents must bootstrap from the
  authoritative roadmap tuple instead of trusting those cursors.
- A full-suite result is not transitive. `2388/2388` belongs to Wayfinder 256;
  T05 and every later code slice need their own named evidence.
- SOCD modes 1/3 may be called supported only under the documented iterable
  order approximation until T06/T07 close. They may not be called source-exact.
- Common config loading does not imply ZSS/Lua/Modules, complete Common1,
  visual/audio parity, or arbitrary package search-path parity.
- Scanner recognition, EvidenceEnvelope, Studio export, asset policy, and
  documentation do not move runtime compatibility scores.
- No commercial or third-party asset is authorized by this roadmap.
- No current artifact proves rollback, netplay, external-engine conformance,
  full MUGEN/IKEMEN parity, legal approval, public publishing, platformer, or a
  reusable multi-genre engine.

## Primary sources consulted

- [IKEMEN GO SOCD and global-state reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#socd-resolution)
- [Normative IKEMEN input reader at `05b7d98`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/input.go#L494-L629)
- [Normative IKEMEN default Common/Input configuration](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/resources/defaultConfig.ini)
- [Normative IKEMEN character compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go)
- [Normative IKEMEN commit identity](https://github.com/ikemen-engine/Ikemen-GO/commit/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703)
- [Elecbyte CNS and Common1 reference](https://elecbyte.com/mugendocs/cns.html)
- [Elecbyte state-controller and Projectile reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
- [Three.js `Object3D.renderOrder` contract](https://threejs.org/docs/pages/Object3D.html#renderOrder)

## NO CODE CHANGED

This audit changes roadmap/research/issue documentation only. It does not edit
source, runtime, UI, tests, configuration, assets, commits, or remote state.
