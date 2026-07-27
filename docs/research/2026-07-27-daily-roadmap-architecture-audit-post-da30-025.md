# Daily roadmap and architecture audit after DA30-025

Date: 2026-07-27
Audit HEAD: `c2245fe868d37144823bcb15eeef174372616a16`
Mode: research, architecture, and roadmap only
Score decision: hold `65 / 36 / 20 / 10-12 / 6-8 / 25`

## Executive summary

The repo advanced 24 commits from the prior expanded-audit HEAD `119e6274`.
DA29 produced a large set of generated closeouts, focused modules, tests, and
evidence files. Entry 613 then rejected the DA29-200 watermark and opened the
120-cut DA30 recovery plan. DA30 now records a machine watermark at DA30-025,
with 51 accepted records, one partial record, and 68 open records.

The control repair in DA30-001…020 has useful bounded proof. DA30-021,
DA30-024, and DA30-025 fail parts of their written acceptance contracts:

- DA30-021 records six green commands at `27b88f0a`. It omits `qa:smoke`, the
  current authority audit, exact Vitest/trace/build counts, full tool versions,
  warning classes, and raw stdout/stderr logs.
- DA30-024 proves one native Play route loads on desktop and mobile, exposes a
  canvas and HUD text, accepts sent keyboard events, and emits no recorded
  page or console errors. It records no semantic state delta for movement,
  contact, damage, or round reset.
- DA30-025 proves the Studio and Inspect shells load. It does not open a real
  project or package, run preview, exercise valid and invalid saves, retain
  work, or prove recovery. Its mobile capture shows clipped and overlapping
  controls. Focus stays on `body` in every recorded route.

The machine watermark therefore remains a recorded control fact, while its
task-level completion claim is disputed. Keep the three artifacts at their
narrow observed scope. Repair their written clauses before DA30-026 advances
the consecutive execution ladder. Documentation work grants no score credit.

## Evidence cursors

| Cursor | Pin | Audit reading |
| --- | --- | --- |
| Current HEAD | `c2245fe8` | Browser evidence commit; no whole-HEAD formal gate. |
| Numeric backlog | Entry 613 before this audit | DA29 watermark rejected; DA30 recovery opened. |
| Machine watermark | DA30-025 | Recorded by `control-source-v1` and generated projections; task acceptance disputed. |
| Formal/global observation | `27b88f0a` | Six commands exited 0; written DA30-021 evidence remains partial. |
| Play browser observation | `c47cfa4e` | One Nova/Mira/Rooftop route at desktop and mobile; semantic journey remains open. |
| Studio/Inspect browser observation | `c47cfa4e` | Shell and mode load only; project/package/save/recovery clauses remain open. |
| Focal compatibility | T406 `07ad9227` | Active StateDef/HitDef juggle under explicit `ikemen-go`. |
| Broad visual/product | T342 `1085badb` | Historical broad parent; DA30 observations are narrow children. |
| Source authority | normative `05b7d98a`; working `4aa0ba38` | Family-scoped review only. |

## Verified facts, inferences, and open questions

### Verified facts

- Initial worktree state was clean on `master...origin/master [ahead 55]`.
- `da30-series-status-v1.json` says `closedThrough: DA30-025`, accepted 51,
  partial 1, open 68. Many accepted records after DA30-025 are non-consecutive.
- `TaskAcceptanceManifest/v1` has four DA29 pilot manifests. DA30-021,
  DA30-024, and DA30-025 have no clause manifests under the manifest folder.
- DA30-024 passes on shell/canvas presence, screenshot size, and error absence.
  It sends keys but reads no actor, contact, life, timer, or round-reset delta.
- DA30-025 uses best-effort button text matching. It treats a route as green
  when the shell, mode, screenshot, and error checks pass. Save controls may be
  absent. The recorded click selected a `Build ERR` block.
- `audit_authority_references.cjs` accepts DA26/DA27/DA28/DA29 identifiers and
  rejects a DA30 `closedThrough`; DA30-021 did not run this audit.
- Current human roadmap docs still select the proposed DA30-001…010 queue,
  while generated control files select DA30-026.

### Inferences

- The series builder treats a narrower artifact claim as enough to accept the
  wider roadmap task. This can repeat the DA29 closeout defect at a smaller
  scale unless acceptance clauses become executable inputs to status.
- The Play mobile capture can support route-load evidence. Its dense overlays,
  cropped labels, and long page layout block a broad mobile usability claim.
- The Studio mobile capture needs geometry and interaction checks before it can
  support editing, build, or trust-chain claims.
- Accepted ADRs and pure models after DA30-025 reduce design risk. They do not
  satisfy live dependencies for input, replay, Studio, assets, scanner,
  IKEMEN runtime, reuse, or release.

### Open questions

1. Should DA30-021/024/025 keep their IDs with repaired evidence, or should the
   current observations receive narrower IDs while the original tasks reopen?
2. Which commands make up the required formal gate: `qa:smoke`, authority
   audit, Studio gate materialization, CSS budget, and package smoke need an
   explicit required/optional matrix.
3. Which repository-owned package should drive the first real Inspect import
   and failure matrix without adding third-party assets?
4. Which route owns the worst frame-gap case: Play combat, Studio workbench,
   Inspect import, Turns handoff, or repeated route switching?
5. Can current browser automation attach a physical or virtual gamepad? If it
   cannot, split simulated adapter proof from a manual-device record.

## Gap map by horizon and system

| Horizon | Current bounded facts | Main gaps | Next evidence cut |
| --- | --- | --- | --- |
| Playable sandbox | Formal six-command observation; one native Play route loads in two viewports. | Semantic input/contact/reset assertions, focus loss, gamepad lifecycle, touch controls, mobile fit, frame tails, renderer teardown. | Repair DA30-021/024, then execute DA30-026 with state and geometry facts. |
| MUGEN-lite MVP | Native Nova/Mira route and many historical runtime gates. | One lawful imported end-to-end journey, independent package breadth, package selection, Common assets, failure UX, denominator gate. | Revalidate DA30-041…050 against live imported routes after input/replay base. |
| MUGEN | Large parser/compiler/runtime surface and controller registry export. | Parser-backed controller/trigger truth, Helper/Projectile/throw breadth, stage/palette/audio/AI/modes, unsupported-heavy lawful corpus. | DA30-042…070 in dependency order; no registry-only credit. |
| IKEMEN | T406 focal runtime, scanner/reference artifacts, dual source pins. | Family semantic review, live plural/team consumers, ZSS execution boundary, modules/Lua policy, replay/network design proof. | DA30-091…100 after source and deterministic-state gates. |
| Studio/product | Studio shell, pure storage/envelope/export/release models. | Real project open/edit/save/reopen, atomic recovery, current trust evidence, quota/conflict failure, real export and CLI consumers. | Repair DA30-025; then DA30-071…080 with revision-bound project evidence. |
| Assets/provenance | Native fixtures and provenance helpers. | Independent generated record, transform graph, permission UX, collision/motion/audio QA, quota/budget, transitive project closure. | DA30-081…085 and DA30-090 with one full asset-to-export route. |
| Scanner | Archive/path baseline and registry designs. | Mutation corpus, profile-aware reasons, source revision consumption, incremental reanalysis, browser/CLI parity. | DA30-086…090 with real package inputs and failure cases. |
| Modular engine | Boundary tools, ADR, inventory. | Real dependency graph, second playable non-fighting consumer, shared ports, package API, CLI, CI enforcement, deletion proof. | DA30-101…110 after two-consumer evidence exists. |

## Proposed architecture decisions

### D1 — Status consumes written acceptance clauses

Use one `TaskAcceptanceManifest/v1` per task before status can become
`accepted`. Each clause names its producer, semantic assertion, negative case,
revision rule, and claim. The series builder reads clause results.

Alternative: accept a narrower artifact and amend the task later. This keeps
delivery fast and hides missing dependencies. If scope changes, create a
versioned task amendment before evidence runs.

### D2 — Split recorded watermark from adjudicated watermark

Expose `recordedThrough` and `adjudicatedThrough`. The first reflects generated
series state. The second advances only when all written clauses pass. Human
roadmap views display both when they differ.

Alternative: keep one `closedThrough` field plus audit prose. Tools tend to
drop the prose and treat the field as final.

### D3 — Formal gates keep raw output and parsed facts

Store raw stdout/stderr per command, SHA-256 digests, tool versions, exact
counts, warnings, duration, and exit. A required-command manifest names every
formal, visual, authority, package, and optional gate.

Alternative: keep digests and a guessed count. This proves command execution
and leaves result meaning open.

### D4 — Browser gates prove semantic state change

A route gate records start and end state, named user actions, expected deltas,
focus order, geometry, errors, and screenshots. Text presence stays an
observation. Play must prove movement/contact/reset. Studio must prove project
transactions. Inspect must prove package analysis and failure recovery.

### D5 — Input uses a device-session and seat model

Track device identity, current browser index, mapping, seat lease, focus,
held state, stale release, reconnect, and sample tick. Canonical input logs
consume this model. Touch uses Pointer Events with cancel and capture facts.

### D6 — Renderer evidence is a route-lifecycle transaction

Measure `renderer.info` at a defined frame boundary with explicit reset
policy. Record creation, active frame, teardown, and repeated-cycle deltas for
distinct routes. Require scene resource disposal and renderer/context cleanup
where ownership ends.

### D7 — Non-consecutive accepted records are an evidence inventory

Keep accepted ADRs, schemas, and pure modules available. A dependency becomes
closed only when every prior required task and its live consumer pass. This
prevents model-only work from pulling a later product claim forward.

### D8 — Score review waits for breadth and release facts

Keep current scores until a revision-bound denominator lists eligible clauses,
stale/rejected facts, package breadth, product evidence, and confidence.
Task counts and document volume carry zero score weight.

## Prioritized remaining roadmap

1. **P0 — Control adjudication:** record the DA30-021/024/025 clause gaps,
   separate recorded and adjudicated watermarks, and sync human authorities.
2. **P1 — Current formal proof:** rerun the complete gate manifest at one SHA
   with raw logs, exact facts, authority audit, and visual gate.
3. **P2 — Product and input proof:** repair Play, Studio, and Inspect semantic
   journeys; close keyboard/gamepad/focus/touch/reduced-motion evidence.
4. **P3 — Performance and lifecycle:** collect frame tails, renderer counters,
   disposal, route swaps, resize, hidden-tab, context-loss, and security facts.
5. **P4 — Deterministic runtime:** close device-seat authority, input logs,
   clocks, RNG, state serialization, replay, and rewind feasibility.
6. **P5 — Compatibility breadth:** prove native and lawful imported journeys,
   plural combat, teams, stages, palettes, animations, audio, AI, and modes.
7. **P6 — Product pipelines:** close Studio storage/recovery/export, asset
   provenance, scanner/reanalysis, source-family review, and IKEMEN lanes.
8. **P7 — Reuse and release:** prove a second playable consumer, shared ports,
   API/CLI/CI/package gates, budgets, migration, local rehearsal, score review,
   and independent adjudication.

## Next 28 execution-ready tasks

### AUD27-01 — Adjudicate DA30-021/024/025 status

Depends on: Entry 613 and current DA30 artifacts. Likely files: control source,
series status, authority selector, this audit, issue 08. Acceptance: one signed
table maps every written clause to pass, fail, or unknown and selects a repair
or versioned-scope path. Evidence: clause table plus artifact digests. Risk:
silent task narrowing. Claim allows status adjudication; blocks feature credit.
Blocked claim: runtime, product, score, or release movement.

### AUD27-02 — Materialize acceptance manifests for the three gates

Depends on: AUD27-01, DA30-011…020. Likely systems: manifest producer,
validator, series builder. Acceptance: DA30-021/024/025 each have clause IDs,
semantic assertions, expected failures, exact-SHA policy, environment, and
claim ceiling. Evidence: positive and negative manifest tests. Risk: clauses
that only check shape. Claim allows manifest coverage; blocks gate completion.
Blocked claim: any task or feature completion.

### AUD27-03 — Define the required formal command set

Depends on: AUD27-01. Likely files: package scripts, QA docs, operational
checklist, formal gate runner. Acceptance: a versioned matrix names required,
conditional, and optional commands for runtime, visual, authority, Studio,
package, and boundary lanes. Evidence: missing-command fixture fails. Risk:
slow duplicate gates. Claim allows gate policy only.
Blocked claim: formal, global, visual, or release health.

### AUD27-04 — Re-run DA30-021 at one clean SHA

Depends on: AUD27-02/03. Likely systems: formal runner and raw-log storage.
Acceptance: every required command runs once; raw stdout/stderr, exact counts,
tool versions, warnings, durations, exits, and digests remain on disk. Evidence:
fresh report plus raw logs. Risk: current failures expose unrelated drift.
Claim allows formal/global health at the measured SHA only.
Blocked claim: current-HEAD inheritance, visual health, or score movement.

### AUD27-05 — Repair current control projections

Depends on: AUD27-04 and status decision. Likely files: `control-source-v1`,
selector, cursor, human authority docs. Acceptance: actual HEAD, formal/global,
focal, visual, product, and source pins remain separate; both watermarks render;
all authority audits accept DA30. Evidence: generation diff and negative
fixtures. Risk: overwriting history. Claim allows current control truth only.
Blocked claim: new behavior, gate health, or score movement.

### AUD27-06 — Prove Play semantic state deltas

Depends on: AUD27-02/04. Likely systems: Play browser gate, runtime bridge,
trace facts. Acceptance: start combat, record actor position/state/anim, execute
input, prove movement, one hit or guard, life/contact delta, and one round
reset with exact packages. Evidence: trace IDs, before/after JSON, screenshots.
Risk: native route hides imported gaps. Claim allows one native Play journey.
Blocked claim: imported breadth, broad Play readiness, or score movement.

### AUD27-07 — Gate Play mobile geometry

Depends on: AUD27-06. Likely systems: browser geometry collector and match UI.
Acceptance: at 390x844 every primary control has a visible non-overlapping box,
labels fit, stage controls stay reachable, scroll is intentional, and focus is
visible. Evidence: bounding-box report and screenshots. Risk: a single viewport
hides device variance. Claim allows one measured mobile layout.
Blocked claim: broad mobile, touch, or accessibility readiness.

### AUD27-08 — Prove a Studio project transaction

Depends on: AUD27-02/04. Likely systems: Workbench, project storage, trust
facts. Acceptance: open repository-owned project, edit, preview, attempt invalid
save, recover, save valid state, reload, reopen, and match revision/content.
Evidence: project envelope, write receipts, browser facts, desktop/mobile
captures. Risk: fail-open storage. Claim allows one local project journey.
Blocked claim: multi-project, durable Studio, export, or release readiness.

### AUD27-09 — Prove Inspect import and recovery

Depends on: AUD27-02/04 and archive policy. Likely systems: ZIP/folder loader,
scanner, Inspect UI. Acceptance: open one owned valid package and malformed,
missing, traversal, and unsupported cases; retain prior safe state and show a
next action. Evidence: package digests, capability reports, errors, captures.
Risk: fixtures that bypass real loading. Claim allows tested package cases.
Blocked claim: scanner breadth, runtime support, or import readiness.

### AUD27-10 — Gate keyboard access and reduced motion

Depends on: AUD27-06…09. Likely systems: browser gate and UI shell. Acceptance:
tab order, visible focus, no obscured target, escape/recovery, concurrent input,
and reduced-motion mode pass on Play, Studio, and Inspect. Evidence: focus log,
computed style facts, screenshots, accessibility scan. Risk: automated focus
checks miss reading order. Claim allows named routes and criteria only.
Blocked claim: broad accessibility or device conformance.

### AUD27-11 — Model gamepad connection sessions

Depends on: DA30-031 and current Gamepad adapter. Likely systems: input policy,
device registry, app status. Acceptance: mid-hold disconnect emits a release,
reconnect may reuse an index without inheriting stale state, unsupported
mapping fails safely, and status stays visible. Evidence: adapter tests and a
browser/manual-device fact record. Risk: browser automation lacks hardware.
Claim allows tested session semantics.
Blocked claim: broad gamepad support, seat parity, or hardware coverage.

### AUD27-12 — Prove two seats and keyboard fallback

Depends on: AUD27-11. Likely systems: seat lease and input merge. Acceptance:
two pads, pad plus keyboard, seat swap, focus loss, disconnect, and reconnect
produce deterministic seat ownership and no cross-seat held input. Evidence:
per-tick input log and conflict fixtures. Risk: index treated as identity.
Claim allows tested seat combinations.
Blocked claim: arbitrary devices, netplay input, or broad input parity.

### AUD27-13 — Prove touch control lifecycle

Depends on: AUD27-07 and input authority. Likely systems: mobile controls and
Pointer Events. Acceptance: pointer down/move/up/cancel, implicit or explicit
capture, multi-touch, slide-off, lost capture, hidden tab, and recovery clear
held state. Evidence: event log and mobile browser captures. Risk: synthetic
events differ from hardware. Claim allows tested pointer routes.
Blocked claim: hardware touch breadth or full mobile control readiness.

### AUD27-14 — Complete the canonical input log

Depends on: AUD27-11…13 and DA30-034. Likely systems: input log and replay
metadata. Acceptance: device session, seat, mapping, focus, sampled state,
edges, policy revision, tick, and checksum serialize to stable bytes; one
mutation changes the expected digest. Evidence: repeat and mutation tests.
Risk: browser timestamps enter deterministic bytes. Claim allows input-log
determinism for named routes.
Blocked claim: full replay, rollback, netplay, or cross-device determinism.

### AUD27-15 — Measure worst-route frame gaps

Depends on: repaired browser gates and DA30-027. Likely systems: frame harness.
Acceptance: the chosen worst route records p50/p95/p99/max gaps, FPS, long
tasks, warmup, sample count, seed, browser, CPU/GPU, draw calls, and memory on
desktop and mobile. Evidence: raw samples and threshold report. Risk: headless
SwiftShader distorts hardware results. Claim allows environment facts only.
Blocked claim: hardware performance, release budget, or device breadth.

### AUD27-16 — Measure renderer counters at defined frames

Depends on: AUD27-15 and DA30-028. Likely systems: renderer bridge and route
inventory. Acceptance: five distinct routes define frame boundary and
`info.autoReset`; record calls, primitives, programs, geometries, and textures
before/active/after. Evidence: route-specific report with current Three.js
version. Risk: internal retained objects resemble leaks. Claim allows counter
facts only.
Blocked claim: leak-free lifecycle, performance readiness, or release health.

### AUD27-17 — Prove renderer teardown and recovery

Depends on: AUD27-16 and DA30-029. Likely systems: scene disposal, renderer
lifecycle, route swaps. Acceptance: repeated route switches, resize, DPR,
hidden tab, context loss/restore, failed asset, and project reopen return to
bounded deltas and visible recovery. Evidence: cycle table, context events,
heap/GPU proxies, screenshots. Risk: delayed GC. Claim allows tested cycles.
Blocked claim: all-device lifecycle or long-run leak freedom.

### AUD27-18 — Run the local security boundary matrix

Depends on: DA30-030 and real Inspect/Studio routes. Likely systems: archive,
URLs, blobs, file handles, storage, workers, export paths. Acceptance: each
trust boundary has an owner, limit, negative probe, safe error, and retained
state; dependency scripts and secret paths are inventoried. Evidence: threat
table and probe results. Risk: broad scan misses runtime construction. Claim
allows local findings only.
Blocked claim: security certification, hosted safety, or release approval.

### AUD27-19 — Complete deterministic state ownership census

Depends on: input log, clock review, RNG ADR, DA30-037/038. Likely systems:
roots, helpers, projectiles, effects, targets, teams, rounds, audio, UI.
Acceptance: every deterministic owner is serialized or denied with reason;
unknown/corrupt versions fail atomically; canonical bytes use SHA-256. Evidence:
census, round-trip, omission and corruption tests. Risk: hidden closure state.
Claim allows one schema revision.
Blocked claim: full runtime capture, rollback, netplay, or migration breadth.

### AUD27-20 — Replay one full round with first divergence

Depends on: AUD27-19. Likely systems: runtime tick, trace, replay runner.
Acceptance: same input/seed yields matching periodic/final checksums, contacts,
winner, resources, and frame count; mutation reports first frame and owner.
Evidence: required trace and two deterministic runs. Risk: visual/audio clocks
enter gameplay checksum. Claim allows one round replay route.
Blocked claim: rollback, netplay, cross-version replay, or full determinism.

### AUD27-21 — Prove one lawful imported MUGEN-lite journey

Depends on: repaired Play gate and replay base. Likely systems: package loader,
CMD/CNS/AIR/SFF/SND, Common assets, runtime, browser. Acceptance: select and
load an owned or clearly permitted package; idle, walk, crouch, jump, attack,
guard, hit, fall, recover, round reset, and unsupported report all run through
real consumers. Evidence: trace, package digest, browser journey, failure case.
Risk: fixture-specific patches. Claim allows one imported package route.
Blocked claim: MUGEN-lite completion, broad MUGEN support, or parity.

### AUD27-22 — Add independent package breadth

Depends on: AUD27-21. Likely systems: corpus and package selector. Acceptance:
second independently authored lawful character and stage combination passes
the same route without hardcoded paths; differences and unsupported findings
remain visible. Evidence: separate digests, traces, browser facts. Risk: shared
bytes create false breadth. Claim allows two named packages only.
Blocked claim: broad MUGEN support, release breadth, or parity.

### AUD27-23 — Bind Studio decisions to project revision

Depends on: AUD27-08/09/18 and DA30-071…080. Likely systems: project envelope,
storage journal, release decision, export. Acceptance: decision consumes exact
project, source, asset, scanner, trace, and gate digests; stale, missing,
tampered, quota, conflict, and crash states fail closed with recovery. Evidence:
transaction log, negative fixtures, browser/CLI parity. Risk: pure model lacks
product consumer. Claim allows one local project decision.
Blocked claim: Studio readiness, durable export, or release authority.

### AUD27-24 — Close one asset-to-export provenance graph

Depends on: AUD27-23 and DA30-081…090. Likely systems: asset graph, QA,
scanner, export. Acceptance: one repository-owned generated/native record links
prompt/source, tool revisions, transforms, atlas, motion, scale, collision,
audio, playtest, permission, digest, project reachability, and bundle output;
unused diagnostics stay excluded. Evidence: graph, QA media, export manifest.
Risk: current fixtures share source bytes. Claim allows one asset graph.
Blocked claim: asset-pipeline readiness, imported breadth, or release approval.

### AUD27-25 — Prove scanner browser and CLI parity

Depends on: AUD27-09/18 and DA30-086…090. Likely systems: scanner phases,
reanalysis, CLI. Acceptance: valid, malformed, nested, oversized, ambiguous,
and unsupported owned fixtures yield the same recognized/unsupported/unknown
reasons in browser and CLI at one scanner revision. Evidence: mutation corpus,
phase receipts, parity report. Risk: scanner output implies runtime support.
Claim allows scan results only.
Blocked claim: runtime execution, package readiness, or IKEMEN support.

### AUD27-26 — Adjudicate IKEMEN source families

Depends on: source epoch and deterministic runtime base. Likely systems:
source-family manifest, scanner, bounded runtime gates. Acceptance: each chosen
family records normative/working files, semantic delta, unchanged tokens,
tests, runtime consumer, and blocked scope; ZSS, modules, teams, and replay stay
separate. Evidence: immutable compare links and family report. Risk: one family
promotes the full epoch. Claim allows reviewed families only.
Blocked claim: full source epoch, IKEMEN parity, ZSS, modules, or teams.

### AUD27-27 — Prove a second playable engine consumer

Depends on: stable ports from AUD27-14/17/23 and DA30-101…110. Likely systems:
shared input, tick, snapshot, render, audio, evidence, package API. Acceptance:
a repository-owned non-fighting route uses the same ports, removes duplicate
glue, passes forbidden-import and deletion probes, and stays playable. Evidence:
dependency graph, browser smoke, package smoke, boundary failures. Risk: a test
harness counted as a consumer. Claim allows named shared ports only.
Blocked claim: reusable-engine, SDK, package, or platformer readiness.

### AUD27-28 — Run local release and score adjudication

Depends on: AUD27-21…27, DA30-111…119. Likely systems: release rehearsal,
budgets, migration, privacy, security, scorecard. Acceptance: clean checkout
builds, packages, imports, runs browser/CLI smoke, checks provenance/licenses,
tests rollback, records p95/p99/max and size budgets, and receives independent
review. Score rows list denominators and rejected/stale evidence. Evidence:
signed local rehearsal and score decision. Risk: local proof presented as
public release authority. Claim allows local readiness and recorded scores.
Blocked claim: public release, deployment, parity, or publication authority.

## Risks

1. DA30 can repeat DA29 if a hard-coded series map decides status without
   executable clause results.
2. Generated control JSON can outrank the richer human audit in automated
   readers. A two-watermark schema reduces this risk.
3. Headless browser evidence can hide real GPU, gamepad, audio, and touch
   behavior. Record environment limits and add manual-device facts where needed.
4. Current native fixtures can prove sandbox behavior and still add no imported
   MUGEN breadth.
5. Source-family review can drift if mutable branch names replace immutable
   commits.
6. Product and release models can pass unit tests without a live UI or CLI
   consumer.

## Official sources consulted

- W3C Gamepad Working Draft: connection state, index reuse, mapping, buttons,
  axes, and connection events: https://www.w3.org/TR/gamepad/
- W3C Pointer Events: pointer cancellation, implicit/explicit capture, capture
  loss, and concurrent pointer input: https://www.w3.org/TR/pointerevents/
- W3C WCAG 2.2: focus order, focus visibility, focus obstruction, target size,
  and concurrent input mechanisms: https://www.w3.org/TR/WCAG22/
- Three.js WebGLRenderer: `renderer.info`, reset policy, `dispose`, and context
  loss/restore: https://threejs.org/docs/pages/WebGLRenderer.html
- Three.js disposal guide: explicit geometry, material, texture, render-target,
  and renderer cleanup limits:
  https://threejs.org/manual/en/how-to-dispose-of-objects.html

## Claim ceiling

Allowed: research-only audit at `c2245fe8`; bounded six-command and browser
observations; disputed DA30-025 task watermark; held scores; prioritized repair
and remaining roadmap.

Blocked: current-HEAD formal/global health, completed Play semantics, completed
Studio/Inspect workflows, mobile usability, score movement, MUGEN or IKEMEN
parity, Studio release readiness, reusable-engine readiness, deployment, public
release, and publication authority.

## NO CODE CHANGED

This audit changes roadmap, research, and local task documents only. It changes
no source, runtime, UI, tests, scripts, assets, dependencies, commits, or remote
state.
