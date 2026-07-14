# Daily Roadmap And Architecture Audit - 2026-07-14

Status: planning evidence only

Repository cursor: backlog entry 505, commit `492d75a6`

Declared aggregate at that closeout: 587/587 trace artifacts
Score movement: none

## Executive Reconciliation

The implementation advanced far beyond the 2026-07-13 planning cursor. Entries
477-505 closed every previously selected near-term gate: air-guard landing,
`CompatibilityJourney/v1`, bounded MUGEN-lite milestone adjudication, palette
and ACT routing, an independent MIT character package with two authored routes,
Studio history/dirty-navigation/autosave/versioned index/conflict/source
transactions/provenance/source-handle recovery/folder editing, global
AssertSpecial ownership, bounded team-round decisions and Turns handoff,
team-lifebar data and HUD projection, root life/power bank ownership and
mutation, required routed resource evidence, and Helper-local life/power.

The roadmap control documents still pointed at entry 476 and Wayfinder 127.
That selector is obsolete. The current evidence ceiling is entry 505. The
scores remain 65/35/20/10-12/6-8/25 because documentation and accumulated
micro-gates do not themselves establish a representative compatibility corpus,
full Common1 behavior, automatic team continuation, broad Studio authoring, or
release-grade modularity.

## Evidence Boundary

### Verified in the repository

- Entry 479 accepts the written M2 Imported MUGEN-lite MVP exit only at bounded
  fixture scope and explicitly leaves scores unchanged.
- Entries 480-483 add deterministic palette evidence and a second independently
  sourced legal character package with normal, QCF, and upper routes.
- Entries 495-503 establish typed global-round, team-decision, explicit Turns
  handoff, lifebar, and life/power bank seams. They do not establish automatic
  team round continuation or exact IKEMEN team behavior.
- Entry 504 proves Helper-local life/power without widening roots or team banks.
- Entry 505 proves existing-file folder editing followed by explicit reimport;
  it does not prove semantic state/controller/collision authoring, file
  creation/deletion, ZIP rewrite, watch/merge, or post-close rollback.
- The entry-505 report declares the last full verification as 200 files / 2045
  tests, production build, boundaries, CSS QA, browser smoke, and 587/587 trace
  artifacts. This audit does not rerun those implementation gates.

### Architecture demonstrated, not desired

- `RuntimeResourceWorld` owns current actor mutation for life, power, control,
  and variables.
- `RuntimeTeamResourceBank/v1` is an explicit life/power ownership and sharing
  boundary. Its public resource kind is exactly `"life" | "power"`.
- `RuntimeTeamRoundLifebar/v0` is a renderer-independent team slot/life
  projection; it is not a generic resource view.
- `CharacterRuntimeState` has life/power and transient guard timing, but no
  red-life, guard-point, or dizzy-point state.
- The compatibility scanner recognizes several red-life/guard/dizzy names, but
  scanner recognition is not runtime execution.

## Pinned Research Question

What is the smallest safe IKEMEN resource cut after life/power and Helper-local
ownership: how should red life, guard points, dizzy points, and persistence be
separated from team banks?

### Verified upstream facts

Facts below are verified against pinned Ikemen GO revision
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, not claimed as an exhaustive
statement about every later revision.

- A character owns distinct `life`, `power`, `dizzyPoints`, `guardPoints`, and
  `redLife` fields. Guard and dizzy have independent maxima.
- Helper initialization copies local guard/dizzy maxima and initializes local
  guard, dizzy, and red-life values.
- `powerOwner()` is a specific power-sharing rule, not a generic resource map.
- `lifeSet` applies team `LifeShare`; `redLifeSet` also mirrors root red life
  under `LifeShare` and clamps it between current life and maximum life.
- `dizzyPointsSet` and `guardPointsSet` clamp actor-local values to their own
  maxima and do not use the team share rule.
- HitDef and target operations carry independent red-life, dizzy, and guard
  mutations. Actor-local AssertSpecial flags can suppress those damage routes.
- Lifebar configuration exposes red-life, Guardbar, and Stunbar/Dizzy surfaces,
  including team-mode layouts. Presentation layout does not imply shared
  resource ownership.
- The inspected round-preparation block is not sufficient to prove all reset or
  persistence behavior. That remains an open source-and-trace question.

### Inference and proposed seam

The smallest safe next gate is a read-only
`RuntimeAuxiliaryResourceProjection/v0` over actor state with red-life,
guard-point, dizzy-point, maxima, enablement/suppression, and owner identity.
It should be consumed as diagnostic/evidence data and must not widen
`RuntimeTeamResourceBank/v1` or `RuntimeTeamRoundLifebar/v0`.

Mutation should then land in three independent adapters:

1. red-life mutation through the current actor resource/combat seam, with a
   narrow `LifeShare` mirror adapter for roots only;
2. actor-local guard-point mutation and later guard-break policy;
3. actor-local dizzy-point mutation and later dizzy-state policy.

HUD projection and round reset/persistence come after mutation semantics are
proven. Helpers keep local auxiliary resources. Projectiles remain resource-less
unless later primary-source evidence requires a different model.

Rejected alternatives:

- add red/guard/dizzy to `RuntimeTeamResourceBank/v1`: shallow convenience that
  conflates different ownership rules and weakens the current interface;
- add a free-form `Record<string, number>` resource bag: hides invariants,
  maxima, sharing, and permitted mutations;
- implement break/dizzy states, team mirroring, HUD, and persistence together:
  too many failure modes for one trace to diagnose;
- add only bars: presentation would imply behavior that the runtime cannot yet
  demonstrate.

## Gap Map By Horizon And System

| Horizon / system | Demonstrated boundary | Remaining gap | Next evidence discriminator |
| --- | --- | --- | --- |
| Playable sandbox | Stable native/generated match, Studio, smoke and trace QA | Broader release loop, settings/save/recovery polish, representative long-session evidence | Repeatable release candidate checklist with browser and persistence evidence |
| MUGEN-lite MVP | M2 accepted at bounded fixture scope; legal CC0 journey plus independent MIT package routes | The accepted fixture exit is not a representative corpus or exact Common1 | Versioned compatibility-corpus summary and explicit score-band adjudication |
| Practical MUGEN | DEF/AIR/CMD/CNS/SFF/SND/stage paths and many bounded routes | Diverse characters/stages, unsupported density, parser/runtime pass rate, fewer per-fixture assumptions | Independent legal stage/package route plus corpus-level failure taxonomy |
| Full MUGEN | Strong typed micro-gates and trace discipline | Broad VM/controllers, exact combat/round/audio/palette/screenpack/Common1 semantics | Package-driven vertical slices chosen by corpus failures, not name count |
| IKEMEN I1 scanner | Source-mapped scanner vocabulary | Shared package graph, dependency lines, profile status and executable links | `PackageAnalysis/v0` over a common VFS for character/stage/system/screenpack |
| IKEMEN I2 runtime | Active roots, helpers, direct combat, global flags, explicit Turns handoff, lifebar and life/power banks | Auxiliary resources, automatic Turns continuation, exact Simul/Tag/Turns timing, motif bars, ZSS/Lua, rollback/netplay | Auxiliary-resource projection, then one resource route; later automatic Turns trace |
| Studio/product | Durable local project index, source transaction/provenance, folder existing-file editing | Semantic draft validation, structured edits, create/delete/watch/merge, export/publish workflow | Parse/compile-in-memory draft that cannot write invalid bytes |
| Assets/provenance | v1 input/output per-file digests | Permission/license certainty and reproducible transform chain | `AssetProvenance/v2` ordered transform records with tool/config/output evidence |
| Modular engine | Many named runtime worlds and boundary checks | No production Project/Evidence/Build contract with two real adapters | Extract only after Studio/provenance schemas supply two consumers and a deletion test |

## Architectural Decisions Proposed

### D1 - Keep the team bank narrow

Decision: `RuntimeTeamResourceBank/v1` remains life/power only. Red life may use
a small LifeShare adapter; guard and dizzy remain actor-local.

Tradeoff: a little more explicit wiring, but ownership stays auditable and a
future resource does not silently inherit team behavior.

### D2 - Read model before mutation

Decision: publish auxiliary resource identity, values, maxima, and diagnostics
before any controller or HitDef changes.

Tradeoff: one gate does not change gameplay, but it makes later traces able to
prove which actor and which policy mutated.

### D3 - Corpus evidence before score promotion

Decision: introduce `CompatibilityCorpus/v0` with package provenance, required
route coverage, unsupported/failure taxonomy, and portable/optional status.
Adjudicate the 35/20 score bands only against that versioned envelope.

Tradeoff: delays a tempting score increase, but avoids treating two successful
packages as broad practical compatibility.

### D4 - Semantic Studio writes use preflight, not post-write rollback claims

Decision: draft bytes are parsed/compiled in memory against the active source
revision before the existing exclusive write/reimport transaction is allowed.

Tradeoff: first structured edit is narrow and existing-file only, but invalid
semantic drafts never need filesystem rollback after stream close.

### D5 - Modular extraction waits for two production adapters

Decision: do not extract a generic engine core from vocabulary alone. First
stabilize one shared Project/Evidence/Build interface used by imported packages
and one native/generated or Studio build adapter; require a deletion/keep
rationale and boundary proof.

## Prioritized Remaining Roadmap

### Phase A - Control and evidence envelope

1. Reconcile all current selectors to entry 505/587 without changing scores.
2. Build `CompatibilityCorpus/v0` from existing legal portable and optional
   packages/traces.
3. Run a dedicated score-band adjudication against that corpus.

### Phase B - MUGEN-lite to practical MUGEN

1. Add one legally distributable, materially independent stage/package route.
2. Rank the corpus failures by user-visible route impact.
3. Close vertical parser/runtime/presentation/audio slices from those failures.
4. Promote MUGEN scores only after the documented band exit is met.

### Phase C - Studio and provenance

1. Add one in-memory semantic source-draft preflight over the entry-505 folder
   transaction.
2. Add one structured state/controller edit with diagnostics and explicit
   reimport.
3. Advance provenance to reproducible transforms and connect it to export
   readiness.
4. Defer ZIP rewrite, watch/merge, and broad editors until conflict and recovery
   semantics have dedicated evidence.

### Phase D - IKEMEN team/runtime depth

1. Publish auxiliary resource ownership/read data.
2. Implement red life, then guard points, then dizzy points as separate gates.
3. Decide round reset/persistence from pinned source plus traces.
4. Define and implement automatic Turns continuation only after resource and
   actor-reference reset semantics are explicit.
5. Add motif/AIR team bars after runtime resource and transition evidence.
6. Keep ZSS/Lua, rollback, and netplay behind deterministic local semantics.

### Phase E - Scanner and modularization

1. Build shared VFS `PackageAnalysis/v0` for character, stage, system, and
   screenpack dependencies with source lines and profile status.
2. Link scanner signals to executable gates or explicit scanner-only claims.
3. Extract a Project/Evidence/Build contract only when two production adapters
   prove the seam; keep MUGEN-specific schedule and combat inside the adapter.

## Next Eight Execution-Ready Tasks

### 1. CompatibilityCorpus/v0

- Scope: version existing CC0, optional local KFM, and independent MIT package
  evidence into one legal/provenance-aware read model. Distinguish required,
  optional, unavailable, unsupported, failed, and passed routes.
- Likely systems: compatibility session/catalog, trace manifest, Studio Evidence,
  scorecard evidence ledger.
- Acceptance: deterministic package ids/digests, no unavailable fixture counted
  as pass, exact route matrix, failure taxonomy, no absolute path leak.
- Evidence: unit schema tests, one required aggregate artifact, Studio/browser
  row proof, full trace gate.
- Claims: corpus envelope only; practical-MUGEN score movement blocked.

### 2. Score-band adjudication from corpus

- Depends on: task 1.
- Scope: map corpus results to the written 0-20/21-35/36-55 bands and explicitly
  accept a score change or state the missing discriminator.
- Acceptance: numerator, denominator, package diversity, optional-fixture policy,
  unsupported density, and exact allowed/blocked wording are reproducible.
- Evidence: committed decision/report plus linked immutable trace digests; no
  implementation means no automatic promotion.

### 3. Independent legal stage route

- Depends on: task 1 taxonomy.
- Scope: repository-owned CC0 or otherwise redistributable stage using a
  materially different parser/render/BGCtrl path; no commercial assets.
- Acceptance: production loader, camera/bounds/layer/BGCtrl route, unsupported
  report, deterministic trace, desktop/mobile nonblank visual evidence.
- Evidence: required artifact, source digest/license record, screenshots and
  browser diagnostics.
- Claims: one independent stage route; broad stage compatibility blocked.

### 4. StudioSemanticDraft/v0

- Depends on: entry 505 existing-file folder write boundary.
- Scope: in-memory parse/compile preview for one focused source document before
  any writable stream opens.
- Likely systems: Studio source transaction/write plan, compiler diagnostics,
  Build source editor.
- Acceptance: revision/fingerprint/path checks, invalid draft cannot write,
  valid draft produces deterministic diagnostics and reimport plan, ZIP remains
  read-only.
- Evidence: hostile unit tests plus browser edit/invalid/fix/save/reimport flow.
- Claims: semantic preflight only; general structured editor blocked.

### 5. RuntimeAuxiliaryResourceProjection/v0

- Scope: actor identity, red life, guard points/max, dizzy points/max,
  enablement/suppression and owner diagnostics for roots and Helpers; no
  mutation or HUD.
- Likely systems: runtime state/snapshot, helper projection, trace schemas; team
  bank is a consumer boundary, not the owner.
- Acceptance: deterministic root/helper ordering, invalid/max clamps diagnosed,
  no projectiles, no behavior checksum change, pair/Single preservation.
- Evidence: focused units plus one optional imported IKEMEN trace.
- Claims: read-only ownership; execution and parity blocked.

### 6. Red-life mutation and LifeShare adapter

- Depends on: task 5.
- Scope: one red-life controller/HitDef route, clamp `life <= redLife <= lifeMax`,
  root LifeShare mirroring, Helper-local preservation, zero-life behavior.
- Acceptance: non-shared roots stay local; shared roots mirror; guard/dizzy and
  HUD unchanged; suppression and Set/Add ordering are explicit.
- Evidence: focused unit/integration tests and required shared/non-shared/helper
  trace variants.
- Claims: bounded red-life route; guard/dizzy/bar/persistence parity blocked.

### 7. Automatic Turns continuation contract

- Depends on: auxiliary-resource/reset decision and existing entries 496-503.
- Scope: map actor ids/slots/references, life/resource reset, controller/input,
  effects/targets/helpers, lifebar and round clock across KO-to-replacement.
- Acceptance: fail-closed preflight, atomic commit, deterministic same-tick/next-
  tick order, no pair fallback, two-side and side-defeat cases.
- Evidence: first a read-only transaction plan, then one required imported Turns
  trace preserving the lethal sample and automatic continuation.
- Claims: one automatic Turns route; exact mode timing and full teams blocked.

### 8. AssetProvenance/v2 transform chain

- Scope: permission/license assertion, input digest, tool/version, config digest,
  ordered transform records, output hashes, QA/collision/playtest links.
- Acceptance: missing license or digest blocks export readiness; records are
  deterministic/redacted; v1 imports migrate without inventing certainty.
- Evidence: schema/migration tests, export manifest proof, Studio Build/Assets
  browser evidence.
- Claims: reproducible recorded pipeline; asset quality and ownership certainty
  remain limited to supplied evidence.

## Risks And Open Questions

- Score inflation: M2 bounded fixture acceptance is real, but it is not yet a
  representative compatibility claim.
- Corpus bias: two successful characters may share assumptions; an independent
  stage and failure inventory are higher-value than another micro-route.
- Reset semantics: pinned source inspection has not yet established the complete
  round persistence policy for red/guard/dizzy across Single/Simul/Tag/Turns.
- Resource ordering: multi-write HitDef/Target/controller ordering and global
  suppression precedence require separate traces.
- Studio filesystem truth: the File System Access API cannot support a broad
  rollback claim after a stream closes; preflight and explicit reimport are the
  safer first semantic gate.
- Schema churn: extracting a generic modular core before corpus, source draft,
  and provenance contracts settle would export unstable MUGEN-specific policy.
- Root control drift: `CONTEXT.md` and the root milestone rule remain stale but
  are outside this automation's permitted edit surface.

## Primary Sources

- Ikemen GO pinned character fields, Helper initialization, resource mutation,
  sharing, and target routes:
  [char.go fields](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L3282-L3289),
  [Helper initialization](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6797-L6802),
  [target resource mutations](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8307-L8379),
  [life/red-life and guard/dizzy setters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8616-L8763).
- Ikemen GO pinned compiler handling for AssertSpecial resource-damage flags:
  [compiler_functions.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L211-L260).
- Ikemen GO official wiki:
  [Lifebar features](https://github.com/ikemen-engine/Ikemen-GO/wiki/Lifebar-features).
- Ikemen GO official release history, used only as a change inventory and not as
  proof of the pinned implementation details:
  [releases](https://github.com/ikemen-engine/Ikemen-GO/releases).
- Elecbyte controller reference for the MUGEN baseline:
  [State Controller Reference](https://www.elecbyte.com/mugendocs/sctrls.html).

## Claim Ceiling

This document changes planning truth only. It does not implement a controller,
runtime resource, editor, scanner, asset pipeline, team transition, or modular
engine contract. It does not move any compatibility score.

## NO CODE CHANGED

Only roadmap/research/issue documentation is updated by this audit.
