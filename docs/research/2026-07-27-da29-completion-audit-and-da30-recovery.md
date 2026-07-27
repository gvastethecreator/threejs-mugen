# DA29 completion audit and DA30 recovery roadmap

Date: 2026-07-27  
Audit HEAD: `fd7a9b9a16b2acd116df1e6dba69f0d451cc37ed`  
Mode: repository audit, architecture, and roadmap only  
Score decision: hold `65 / 36 / 20 / 10-12 / 6-8 / 25`

## Executive verdict

The DA29 series cannot keep its `DA29-200` completion claim. The repository
contains useful new evidence utilities, focused modules, tests, browser
captures, and a renderer counter probe. Its closeout system does not prove the
acceptance text of the 200 tasks.

The audit found five blocking facts:

1. DA29-001 required the selector and roadmap cursor to agree. The selector
   says DA29-200 while `roadmap-cursor-v1.json` remains at DA27.
2. All 20 research cuts close when a generated note exceeds 200 bytes. All 41
   architecture cuts close when a generated note exceeds 200 bytes and two
   shared authority files exist. Those templates restate the task but do not
   produce the required inventories, decisions, comparisons, or contracts.
3. One hundred twenty-three I/G cuts pass the generic checker when
   `acceptanceExecuted` is true and `functionResults` has any key. The checker
   does not bind acceptance clauses to measured assertions.
4. Representative closed tasks directly contradict their results: DA29-052
   reports zero Helper controllers; DA29-139 has no second playable consumer;
   DA29-142 has no CI workflow; DA29-176 executes no ZSS; DA29-188 exports no
   bundle; DA29-194 has no import/analyze/build CLI.
5. The formal pin predates eight commits and the browser pin predates the
   current CSS change. Neither proves current HEAD.

Operational result: quarantine the generated DA29 watermark, retain each
artifact only at its narrow demonstrated scope, accept no score movement, and
start DA30 with control and semantic-evidence repair. Do not delete DA29 work;
use it as candidate input for task-by-task revalidation.

## What changed since the prior audit

The prior audit stopped at `119e6274` with DA29 proposed. Current HEAD adds:

| Area | Files | Added / removed lines | Audit reading |
| --- | ---: | ---: | --- |
| DA29 evidence | 581 | `+26,537 / -0` | closeouts, measured JSON, probes, gate wrappers, screenshots |
| DA29 research notes | 61 | `+1,254 / -0` | generated 20/21-line task restatements |
| Other docs | 16 | `+789 / -79` | selector and roadmap status changes |
| Scripts | 8 | `+1,541 / -28` | registry, checker, materializers, browser and renderer probes |
| Source and tests | 18 | `+5,673 / -11` | DA29 evidence modules, two bounded analyzers, renderer baseline, tests, CSS |

The non-doc delta does not contain the broad runtime, Studio, export, CLI,
second-consumer, CI, ZSS, or deployment work that many closeouts claim. Most
new source lives under `src/mugen/da29`, its tests, and one new
`RendererInfoBaseline`. The large product-facing change after the formal pin
is `src/styles/redesign.css`.

## Audit method and verdict classes

The audit compared each task class and high-risk task family against:

- its `cut`, `acceptance`, risk, and claim ceiling in the DA29 registry;
- the closeout and measured JSON;
- the producer and acceptance-checker source;
- the named live consumer or absent consumer;
- revision and digest lineage;
- current control docs and linked issue history.

Verdict terms:

- **accepted-bounded**: the artifact proves the written clauses at one named
  revision and only its stated claim.
- **candidate-bounded**: useful implementation or evidence exists, but the
  closeout does not prove every clause.
- **partial**: some requested surface exists while key route or failure facts
  are absent.
- **reopen**: evidence contradicts acceptance or the requested deliverable is
  absent.
- **control-invalid**: a dependency or current-state assertion disagrees with
  another canonical control artifact.

No DA29 task receives a new `accepted-bounded` verdict from this audit. Every
module may still contain valid work. The current closeouts do not establish
their own task-level claims. DA29-012, 013, 041, and 072 are
examples of useful candidate evidence that deserve focused revalidation.

## Quantitative closeout audit

| Close method | Count | Result |
| --- | ---: | --- |
| Generated research note over 200 bytes | 20 | reopen; topic-specific acceptance was not checked |
| Generated architecture note plus shared control paths | 41 | reopen; no decision or tradeoff was required |
| Generic non-empty `functionResults` | 123 | unproved; shape is not semantic acceptance |
| Combat key-presence checker | 8 | candidate only; values and route ownership need per-cut assertions |
| Self-produced adjudication file | 2 | reopen; reviewer independence and premise validity are absent |
| Special G paths without semantic checker | 5 | partial or reopen after direct audit |
| Live renderer special path | 1 | partial; route identity and cleanup are not real for all rows |
| **Total** | **200** | **series watermark rejected** |

The 134 measured JSON files remain useful observations. They cannot serve as
134 completed tasks until a semantic acceptance manifest checks each clause.

## Control and gate findings

### DA29-001 — control-invalid

`docs/evidence/authority-selector-v1.json` declares `closedThrough` DA29-200
and an empty queue. `docs/evidence/roadmap-cursor-v1.json` declares HEAD and
formal/global at DA27 `b7d23801`. DA29-001 required agreement, so its own first
acceptance clause failed.

### DA29-002 — partial historical gate

The pinned report at `a6e91520` lists six commands and zero exits. The durable
log was reconstructed from the note, so raw command output is absent. The
report omits exact Vitest counts, tool versions, duration,
warnings, and failure details required by the task. It also predates eight
commits. Preserve only: “six commands were recorded green at `a6e91520`.”

### DA29-003 — partial browser capture

Three PNGs and zero console-error counts exist. The matrix omits commit,
browser version, device/DPR facts, page errors, keyboard/focus log, import and
source-write routes, and failure cases. The screenshots also predate the
current CSS. Preserve only the three named captures at their artifact digests.

### DA29-004, 005, and 007 — reopen

Their generated gate wrappers rely on the same invalid series state. A corpus,
score hold, or authority-reference audit cannot close from self-consistent
generated fields while the selector and cursor disagree.

## Research and architecture findings

The materializer creates every research note from the same package-script
sample and `src/mugen` TypeScript count. DA29-011, for example, asked for suite
owners, fixtures, duration, required status, release lane, overlaps, and
omissions. None appears as machine-readable rows.

The architecture template copies the cut, acceptance, risk, and three shared
authority anchors. DA29-091 does not choose a Studio storage model. DA29-141
does not define a check matrix. DA29-175 does not define module permissions.
DA29-198 does not define hosted preview or rollback. File size cannot close an
ADR.

All 61 notes should become intake records. Future agents may expand them into
the requested artifact; they must not start from a “closed” premise.

## Representative implementation and product findings

| ID | Written acceptance | Measured fact | Verdict |
| --- | --- | --- | --- |
| DA29-012 | full trace manifest fields and duplicate/missing failure | manifest has 643 IDs and no duplicate IDs; closeout does not show all required fields/failures | candidate-bounded |
| DA29-013 | parser-backed census plus malformed/nested diagnostics and rematerialized corpus | two native packages counted; evidence does not show diagnostic matrix or corpus rematerialization | candidate-bounded |
| DA29-041 | imported end-to-end contact route | command/contact/damage fields exist; route provenance and negative/final-state assertions need direct audit | candidate-bounded |
| DA29-052 | nested Helper spawn, command, redirects, destroy, replay | zero Helper controllers and zero compiled controllers | reopen |
| DA29-073 | camera/zoom/bounds/corner/shake/reset/resize route | two file paths and `hasBounds: true` | reopen |
| DA29-100 | live release decision used by product actions and failure routes | source-text byte count and export names | reopen |
| DA29-119 | actionable Studio trust failure matrix | three file paths and a word search | reopen |
| DA29-139 | non-fighting playable second consumer | authority selector and evidence facts named as consumer | reopen |
| DA29-142 | pinned reproducible CI workflow | package scripts; `.github` directory absent | reopen |
| DA29-159 | accessible exact character/stage selection journey | `App.ts` text and three directory names | reopen |
| DA29-170 | adversarial practical-MUGEN review | three native directories exist | reopen |
| DA29-176 | executable ZSS subset with failures, trace, reset, denies | source-review doc contains “ZSS” | reopen |
| DA29-180 | lane-separated IKEMEN adjudication | roadmap and registry exist | reopen |
| DA29-188 | repeatable deterministic playable bundle | source contains export-related words | reopen |
| DA29-194 | headless import/analyze/build CLI | twenty existing QA/materializer scripts listed | reopen |
| DA29-200 | independent product/SDK adjudication | same-wave review trusts the invalid checker | reopen |

## Renderer finding

DA29-072 launches a browser and reads live renderer diagnostics, which is
better evidence than a static scan. Its five labels do not represent five
distinct product routes: `play`, `team`, and `stress` use the same URL. Its
“cleanup” waits 300 ms and rereads the same live renderer; it does not dispose
the route or verify resource release. `programs` remains null.

Three.js documents `renderer.info` as debugging and monitoring data, reset at
each render by default, with explicit reset needed for multi-pass frame totals.
The planned re-gate must pin the installed Three.js revision, sample a defined
frame boundary, execute distinct routes, and perform real teardown. See the
[official WebGLRenderer documentation](https://threejs.org/docs/pages/WebGLRenderer.html#WebGLRenderer.info).

## Gap map by horizon and system

| Horizon | Demonstrated today | Main gaps after audit |
| --- | --- | --- |
| Playable sandbox | local shell, native fixtures, many bounded runtime systems | current-HEAD gate, exact route matrix, frame gaps, focus/input lifecycle, real renderer teardown |
| MUGEN-lite MVP | bounded native combat/round/stage/audio paths | honest end-to-end imported journeys, package breadth, selection, common assets, failure UX, denominator-based release gate |
| MUGEN | large parser/compiler/runtime surface | controller/trigger truth, complex helpers/projectiles/throws, screenpack/AI/modes, unsupported-heavy lawful corpus |
| IKEMEN | scanner/reference work plus bounded runtime slices | lane-separated source review, ZSS execution, Lua/module policy, full team consumers, replay/network design |
| Studio/product | broad shell and many data/evidence modules | live storage authority, trust failures, transactional save/recovery, asset flow, accessible authoring, deterministic export |
| Assets/provenance | policy and repository-owned fixtures | complete graph, transform provenance, license/permission UX, quota/budget enforcement, reproducible bundle inclusion |
| Scanner | package analysis and capability concepts | mutation corpus, archive/path limits, profile-aware reasons, reanalysis ownership, browser/CLI parity |
| Modular engine | shared facts and boundary docs | real non-fighting consumer, ports extracted from two consumers, CI enforcement, package API/CLI lifecycle |

## Proposed architecture decisions

### D1 — Acceptance is data, not prose searched at close time

Choose a versioned acceptance manifest per task. Each clause gets an ID,
evidence type, producer, assertion, expected failure, revision rule, and claim
ceiling. The closeout tool may aggregate passed clauses but cannot invent them.

Alternative: keep task-specific handwritten tests only. This is flexible but
hard to audit across 200 tasks. A manifest adds upkeep, yet it makes missing
clauses and reused evidence visible.

### D2 — One control input produces selector and cursor

Choose a single checked input for queue, scores, and independent pins. Generate
both current views from it. Reject publication when outputs disagree or when a
new current HEAD lacks its own lane status.

Alternative: keep two materializers with cross-tests. The present drift shows
that cross-tests can be skipped or can validate fixtures instead of current
files.

### D3 — Separate observation, gate, and claim

An observation records facts. A gate compares facts to thresholds or exact
expectations. A claim names what that gate permits. A JSON field called
`acceptanceExecuted` is never a gate by itself.

### D4 — Reuse needs two real consumers before extraction credit

Keep MUGEN modules in their current owner until a non-fighting testbed uses the
same port in a playable route. Extract only the common contract proven by both
consumers. Authority/evidence utilities do not count as a game consumer.

### D5 — Release decisions consume immutable, revision-matched evidence

Studio buttons, CLI, and local export should consume one decision document
bound to project revision, tool chain, asset graph, scanner result, and gate
digests. Missing, stale, or tampered inputs fail closed and explain the safe
next action.

## Prioritized recovery phases

1. **P0 control hold:** publish this audit, quarantine DA29 closure, reconcile
   selector/cursor, and build the per-task verdict ledger.
2. **P1 proof repair:** add semantic acceptance manifests, evidence lineage,
   negative fixtures, and an independent review contract.
3. **P2 current baseline:** re-run raw formal/global, browser, accessibility,
   frame-gap, renderer-resource, and security gates at one current commit.
4. **P3 playable evidence:** revalidate one complete native/imported sandbox
   route, then MUGEN-lite selection, combat, round, stage, audio, and failure
   paths.
5. **P4 product pipelines:** close Studio storage, trust, assets, scanner,
   deterministic export, and CLI using the same revision/evidence model.
6. **P5 breadth:** add lawful independent package and mutation breadth before
   changing MUGEN or IKEMEN scores.
7. **P6 reuse and release:** prove a non-fighting consumer, enforce boundaries
   in CI, define the local SDK, and run independent adjudication.

The executable DA30 plan contains 120 cuts in
`docs/DA30_RECOVERY_ROADMAP.md`.

## Risks and open questions

1. Some DA29 modules may meet more of their task than the closeout exposes.
   Revalidation must inspect their focused tests before scheduling new code.
2. Reopening the watermark may surprise agents that treat generated JSON as
   final. The audit hold must appear in every current navigation surface.
3. Current HEAD has no fresh full or visual gate. Do not infer a regression;
   record the state as unverified.
4. The repo has many historical issue contracts. DA30 recovery tasks must reuse
   closed bounded behavior and test it; they must not rebuild it.
5. No independent agent review ran in this audit because delegation was not
   available. DA30-119 keeps final adjudication open until a reviewer with
   separate provenance checks the evidence.
6. Third-party and commercial game assets remain out of scope. Breadth needs
   repository-authored, generated, or clearly permitted fixtures.

## Primary sources checked

- Three.js `WebGLRenderer.info`, reset, memory, and render counter contract:
  https://threejs.org/docs/pages/WebGLRenderer.html#WebGLRenderer.info
- Three.js renderer source:
  https://github.com/mrdoob/three.js/tree/master/src/renderers
- Ikemen GO official repository and stated MUGEN 1.1 compatibility aim:
  https://github.com/ikemen-engine/Ikemen-GO
- Repo-pinned Ikemen source authority remains 05b normative and 4aa working;
  most families in the local epoch are still explicitly unreviewed.

## Claim ceiling

Allowed: a docs-only DA29 completion audit at `fd7a9b9a`, a rejected series
watermark, preserved narrow candidate artifacts, held scores, and a proposed
DA30 recovery queue.

Blocked: declaring all DA29 implementation absent, current-HEAD regression,
current formal/global or visual health, score movement, MUGEN/IKEMEN parity,
Studio release readiness, reusable-engine readiness, CI readiness, deployment,
or publication authority.
