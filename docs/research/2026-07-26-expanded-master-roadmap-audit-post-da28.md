# Expanded Master Roadmap Audit — Post-DA28

Date: 2026-07-26

Audit HEAD: `119e627410a4a72eee28650ae20422d475dac834`

Formal/global cursor: `32466c6e` / Entry 604

Focal cursor: T406 `07ad9227`

Visual/product cursor: T342 `1085badb`, with bounded DA28 children

Source epoch: Elecbyte/Ikemen pins 05b / 4aa, juggle family `same`

Scores: `65 / 36 / 20 / 10-12 / 6-8 / 25`

Mode: research, architecture, roadmap, and local task documents only

## Executive result

DA28-01…30 can remain closed at their written ceilings. The series added useful
models, bridges, materializers, two native packages, live projectile/Turns
cuts, gamepad input, and bounded browser proof. Several landed modules still
lack a live product owner. Current broad proof for HEAD and large
MUGEN/IKEMEN, Studio, asset, scanner, and engine claims remain open.

The new [Master Review Roadmap](../MASTER_REVIEW_ROADMAP.md) contains **200
cuts in 20 waves**. Its first two waves repair authority and proof. Later waves
add real contact journeys, compiler/controller denominators, deterministic replay,
plural combat, team modes, formats, Studio recovery, release policy,
accessibility, performance, a second engine consumer, CI, and final
adjudication. Five long-tail waves then cover command/AI/modes, wider MUGEN
product formats, advanced IKEMEN, Studio authoring, SDK, and deployment design.

No score moves in this audit. No current runtime, visual, accessibility,
performance, release, or modular-engine claim moves. Future agents must adopt
the DA29 queue through the control task before implementation.

## Change since the prior audit

Verified repository changes since audit HEAD `aa85cb84`:

- 12 commits landed; current HEAD is `119e6274` and the branch is 34 commits
  ahead of `origin/master`.
- DA28-01 adopted the series; DA28-02 set the formal/global pin at `32466c6e`;
  DA28-03…30 then drained under bounded claim ceilings.
- Live code now consumes the projectile schedule, plural oracle inputs, Turns
  bridge, gamepad input, and one source-write journal call.
- Native Nova/Mira packages, execution probes, controller/source/scanner
  evidence, Studio IDB and policy models, and a boundary manifest exist.
- The Frame Ledger UI changed after the formal/global gate. Only the Turns
  desktop/mobile captures were refreshed at current HEAD.

Verified control drift at audit time:

- `authority-selector-v1.json` says DA28-30 closed with an empty queue.
- `roadmap-cursor-v1.json` and its materializer still carry the DA27
  `b7d23801` pin and old counts.
- `ROADMAP_PROGRESS_SYSTEM.md`, `DELIVERY_ROADMAP.md`,
  `ROADMAP_CONTINUITY_GUIDE.md`, and package text still name DA28-05/06 as the
  current edge.
- `CONTEXT.md` remains older and outside this audit's allowed write surface.
- Current HEAD has no formal/global rerun after the Frame Ledger change.

## What the audit actually verified

### Current and live

- `LiveGlobalProjectileSchedule` feeds `EffectActorSystem` ordering.
- `LiveRuntimeTurnsBridge` feeds `PlayableMatchRuntime` handoff receipts.
- `GamepadInputAdapter` feeds the app's merged match input.
- The source-write journal has an app call site.
- The boundary command consumes some manifest data, but still duplicates its
  required-root contract.

### Present modules without live product authority

- Native dual execution and extension probes.
- IndexedDB snapshot backend.
- Project asset closure and asset release policy.
- Scanner capability and package-analysis revision bridges.
- Common evidence facts bridge.
- Controller coverage materializer.

### Proof limits found

- Native execution can inject synthetic sprites and can call a route successful
  from state or animation presence. The swapped attack route does not prove
  contact.
- Audio/projectile/throw extensions include synthetic inputs or constant
  outcomes. They remain unit probes.
- Nova and Mira differ in package and sprite bytes, but share CMD, CNS, and AIR
  bytes. They are not two independent syntax families.
- The controller matrix regex captures StateDef `type` values and uses a
  separate hard-coded support list. Its current percentages cannot support a
  compatibility or score decision.
- Studio IDB writes memory first and hides IDB failure. Its field named
  `preimageSha256` contains FNV-1a output. The app still uses localStorage as
  project authority.
- Source-write intent is recorded after the write receipt and does not retain
  actual preimage/write bytes. It cannot close pre-write crash recovery.
- The evidence corpus and broad visual cursor predate most DA28 work and the
  latest UI. Old green evidence cannot move to current HEAD by inheritance.
- Boundary checks skip absent future roots. A missing second consumer cannot
  prove modular reuse.

## Gap map by horizon and system

| Horizon | What is demonstrated | Main gaps | First roadmap cuts |
| --- | --- | --- | --- |
| Playable sandbox | A broad imported fighting runtime, Three.js display, bounded input/team/browser routes | Current-HEAD global/product proof; real contact routes; input lifecycle; replay; accessibility; frame and memory budgets | DA29-001…030, 041…050, 071…080, 111…130 |
| MUGEN-lite MVP | Many parsed/compiled/runtime slices and a large trace suite | Trustworthy controller/trigger denominators; third independent character; actual guard/fall/throw/plural journeys; format failure breadth | DA29-031…060, 081…086 |
| MUGEN | Wide local controller/runtime work at named ceilings | Source-ranked semantic breadth, FightScreen/stage/audio depth, commands/AI/modes, lawful corpus breadth, differential proof, exact unsupported map | DA29-031…090, 151…170 |
| IKEMEN | Pinned source epoch, bounded juggle/redirect/team models, scanner recognition | Separate family review; live Simul/Turns/Tag ownership; team UI; deterministic topology; bounded ZSS/Lua/module/network research | DA29-061…070, 087…090, 171…180 |
| Studio/product | Import, preview, evidence/build concepts and bounded browser routes | Durable authority, migrations, quota and permission errors, pre-write journal, crash/multi-tab recovery, live release decision, authoring, export, offline/update | DA29-091…100, 111…120, 181…190 |
| Assets/provenance | Native fixtures and policy/provenance model surfaces | SHA-256 content identity, full tool/input/transform record, second independent release record, live closure/policy, safe bundle | DA29-101…110 |
| Scanner | PackageAnalysis and capability models, static artifacts | Executed phases, parser-backed facts, cancellations/limits, live revision consumer, deterministic reanalysis/diff | DA29-013…016, 081…090, 124…126 |
| Modular engine/SDK | Two small `src/engine` contracts and a boundary script | Single manifest authority, required real roots, generic ports proven by two consumers, deletion proof, package/API/plugin/CLI contracts | DA29-131…140, 191…197 |
| Release/operations | Strong local commands and detailed ledgers | No CI, required-check matrix, artifact retention, budgets, security/license bundle, release adjudication, hosted-preview and privacy governance | DA29-141…150, 198…200 |

## Architecture decisions proposed

These are proposals. Each needs its named DA29 cut before it becomes project
authority.

| Decision | Preferred direction | Main alternative | Tradeoff |
| --- | --- | --- | --- |
| Control state | One versioned input materializes selector and cursor | Keep two materializers in manual sync | One input reduces drift; migration must retain historical pins. |
| Evidence taxonomy | Typed gates with explicit inheritance rules | Free-form report prose | Typed facts are auditable; they add schema and migration work. |
| Hash vocabulary | SHA-256 for content/integrity; versioned stable hash for behavior keys | Keep FNV in fields called SHA/digest | Clear security meaning costs a data migration. |
| Controller truth | One capability registry drives compiler/docs/materializers | Separate compiler table and hand docs | One registry stops count drift; runtime depth must stay multi-axis. |
| Coverage | Separate name, occurrence, compile, live, branch, and failure denominators | One support percentage | More honest metrics are harder to summarize. |
| Execution proof | Require observed contact/output/transaction facts for behavior claims | Accept state/asset presence as execution | Stronger proof costs richer fixtures and traces. |
| Determinism | Version clock, RNG, input log, and canonical state snapshot | Add replay after features stabilize | Early ownership exposes hidden state; it slows some feature cuts. |
| Team mutation | Use atomic transactions for Turns/throw/team handoffs | Mutate actors in scheduler order | Transactions aid recovery/replay; they need clear preimages and commit rules. |
| Plural world | One global ordered identity/schedule for helpers, projectiles, effects | Per-actor arrays with merge rules | Global order is easier to prove; it can increase central coupling. |
| Studio authority | Choose one authoritative store behind a storage port | Keep localStorage, memory, IDB, and files as peers | One authority avoids false saves; file permissions and offline use need adapters. |
| Source writes | Persist byte-true intent before opening the writable | Journal the receipt after success | Pre-write intent enables recovery; it adds storage and privacy cost. |
| Release gate | Diagnostic analysis and release policy stay separate; product consumes one decision | Let each screen infer readiness | One decision prevents split greens; it becomes a critical owner. |
| Scanner | Pure, executed, cancellable phases with revisioned facts | Text materializer with assumed phase status | Real execution is slower but makes green meaningful. |
| Heavy work | Move only measured long tasks to workers | Move every parser/render task now | Measurement avoids needless thread complexity; some UI stalls remain until cut. |
| Shared engine | Extract ports only after two live consumers and deletion proof | Create `src/core` from planned abstractions | Proven seams reduce wrong APIs; reuse arrives later. |
| UI state | Runtime emits stable observer facts consumed by UI | Panels read many live owners directly | Stable facts aid tests/accessibility; adapter upkeep is required. |
| Performance | Gate p95/p99/max frame gaps plus resource/memory trends | Use average FPS and build size | Tail data catches stalls; device baselines need care. |
| Release automation | Fast PR, broad nightly, fresh release workflow | One full workflow for every change | Tiered gates balance time and proof; stale nightly facts must never promote a release. |

## Prioritized phase roadmap

### Phase A — Restore a trustworthy current tuple

DA29-001…010. Adopt the queue, re-gate current HEAD, run current browser routes,
rebuild the corpus, hold or move scores from eligible facts, and unify control
generation. This phase blocks every broad claim.

### Phase B — Make proof measurable

DA29-011…020. Replace regex and prose greens with parsed registries, exact
denominators, source locations, browser facts, performance facts, and a
versioned environment envelope.

### Phase C — Stabilize deterministic foundations

DA29-021…040. Assign input, clock, RNG, replay, state serialization, compiler,
controller, trigger, and expression ownership. This lowers the cost of finding
the first divergent frame in later combat work.

### Phase D — Produce real gameplay evidence

DA29-041…080. Use imported, repository-owned fixtures to prove contact, guard,
fall, juggle, throw, helpers, projectiles, effects, teams, stage, palette,
animation, and real browser audio. Unit probes remain prerequisites and close
only their named cuts.

### Phase E — Make import and product state trustworthy

DA29-081…110. Harden formats and archive limits, execute scanner phases, adopt
durable Studio storage/recovery, and make asset/source freshness drive one
release decision.

### Phase F — Close user and operational risk

DA29-111…130. Fix Frame Ledger and Studio task flows across mobile, keyboard,
focus, labels, contrast, reduced motion, trust failures, visual regression,
frame tails, memory, resource lifecycle, fuzzing, caps, and soak.

### Phase G — Prove reuse and release discipline

DA29-131…150. Make boundaries non-vacuous, add generic ports only where two
live consumers exist, add a minimal non-fighting consumer, then establish CI,
budgets, immutable artifacts, release bundle, generated current docs, and final
adjudication.

### Phase H — Cover the long product and compatibility tail

DA29-151…200. Prove command/AI/mode ownership, widen screenpack and MUGEN
product formats, treat IKEMEN scripts/modules/network work as separate guarded
lanes, finish Studio authoring/export/offline design, and define the public
SDK, CLI, version, deployment, privacy, and final product governance contracts.

## Immediate 25-task queue

The first adoption should consider DA29-001…025 in this order. The selector may
load a smaller batch, but it must preserve these dependencies.

1. DA29-001 adopt DA29 control.
2. DA29-002 current-HEAD formal/global gate.
3. DA29-003 current product/browser matrix.
4. DA29-004 corpus v1.3.
5. DA29-005 score adjudication.
6. DA29-006 single selector/cursor input.
7. DA29-007 expanded stale-authority audit.
8. DA29-008 digest vocabulary and migration ADR.
9. DA29-009 gate taxonomy.
10. DA29-010 control-doc compaction design.
11. DA29-011 test ownership inventory.
12. DA29-012 generated trace manifest.
13. DA29-013 parser-backed controller census.
14. DA29-014 canonical controller registry.
15. DA29-015 exact coverage denominators.
16. DA29-016 source locations and digests.
17. DA29-017 generated browser facts.
18. DA29-018 bundle/load budget baseline.
19. DA29-019 frame-gap harness.
20. DA29-020 execution environment envelope.
21. DA29-021 input authority ADR.
22. DA29-022 gamepad lifecycle.
23. DA29-023 mapping/deadzone diagnostics.
24. DA29-024 persisted per-seat input/SOCD profile.
25. DA29-025 canonical input-frame log.

The detailed scope, dependencies, probable systems, acceptance proof, risk,
and claim ceiling for all 200 tasks live in the master roadmap.

## Main risks

- **Control drift:** three current surfaces already disagree after one series
  drain. DA29-001/006/007 precede more work.
- **False behavior breadth:** state presence, synthetic inputs, repeated syntax,
  and registry names can all look like execution. Contact and failure routes
  must replace those shortcuts.
- **Data loss:** memory-first IDB, post-write journaling, hidden transaction
  failures, file permission changes, and multi-tab writers can report success
  without durable state.
- **Wrong compatibility denominator:** controller counts currently include
  parser noise and do not distinguish parse/compile/live/failure depth.
- **Main-thread stalls:** large parsers, scans, App, trace presets, and docs have
  large ownership surfaces; no measured worker decision exists.
- **Visual regression at current HEAD:** the latest layout has limited route
  proof and visible mobile clipping/occlusion in the available Turns capture.
- **Premature core extraction:** absent roots and one domain consumer can make a
  boundary gate green without proving reuse.
- **Release drift:** no CI or immutable artifact contract ties all required
  gates to one commit.

## Open questions

- Which lawful third fixture gives the most independent controller, trigger,
  Common1, animation, and palette breadth with the least asset cost?
- Which browser, OS, GPU, and controller set forms the first support matrix?
- Should Studio treat files as authority with IDB as journal/cache, or make IDB
  authority and export files as projections?
- Which exact controller families lead after the parser-backed occurrence and
  branch census?
- Which current Frame Ledger panels are essential during play, and which can
  collapse without hiding needed control?
- Which small non-fighting route can exercise shared ports without becoming a
  second product?
- What release target is desired first: local playable demo, downloadable
  static build, or a hosted preview? Publication remains outside this audit.

## Official and primary sources consulted

- [Elecbyte MUGEN documentation](https://www.elecbyte.com/mugendocs-11b1/mugen.html)
- [Elecbyte CNS format](https://elecbyte.com/mugendocs/cns.html)
- [Elecbyte AIR format](https://www.elecbyte.com/mugendocs-11b1/air.html)
- [Elecbyte trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
- [Elecbyte state controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
- [Ikemen GO official repository](https://github.com/ikemen-engine/Ikemen-GO)
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [W3C Indexed Database API](https://www.w3.org/TR/IndexedDB/)
- [W3C Gamepad API](https://www.w3.org/TR/gamepad/)
- [WICG File System Access](https://wicg.github.io/file-system-access/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

Verified source facts inform the task boundaries above. Architecture choices
remain proposals until their DA29 ADR/task closes. Browser/device support,
controller ranking, storage authority, and release target remain open.

## Audit claim

This audit establishes only a current repository gap map and a
dependency-linked 200-task plan. Runtime behavior, product readiness,
accessibility, performance, security, MUGEN/IKEMEN parity, reusable-engine
readiness, score movement, and release authority remain unchanged.

## NO CODE CHANGED

This audit changes roadmap, research, control, and local task documents only.
Source, runtime, UI, tests, assets, dependencies, commits, and remote state are
unchanged.
