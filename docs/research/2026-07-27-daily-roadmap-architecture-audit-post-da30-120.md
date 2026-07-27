# Daily roadmap and architecture audit — post-DA30-120

Date: 2026-07-27

Audit HEAD: `67481fbc904c19e239bf750740a0bd391245bafa`

Mode: research, architecture, and roadmap only

## Executive decision

DA30-001…120 exist in the machine series record. The safe control split is:

- `recordedThrough = DA30-120`.
- `reviewedThrough = DA30-120` for this audit's sampling and control review.
- `adjudicatedThrough = DA30-020` as the last safe consecutive written-clause
  ceiling pending a row-by-row review.

The generated series status cannot establish task acceptance. Its builder
assigns `accepted` from a fixed task map and file presence. It does not compare
each artifact with the task's original clauses, exact tested revision, failure
paths, or live consumer. Only seven task acceptance manifests exist. Several
post-DA30-025 models return fixed success data and run only from DA30 tests.

DA30 artifacts remain useful at their exact observed scope. DA31 converts them
into live product, runtime, scanner, asset, package, and release evidence. The
scores remain `65 / 36 / 20 / 10-12 / 6-8 / 25`.

## Change since the prior audit

The prior daily audit used HEAD `c2245fe8` and machine watermark DA30-025.
Current HEAD adds eight commits:

1. input-matrix and wave 3/4 modules;
2. the post-DA30-025 audit;
3. DA30-039…048 models;
4. DA30-052…120 models and generated evidence;
5. DA30-021/024/025 formal and browser repair;
6. the formal pin at `ee23122f`;
7. authority audit, Studio save recovery, and smoke changes;
8. roadmap files plus regenerated DA30 evidence outputs.

The formal matrix gained real raw logs, versions, counts, and six required
green commands. Play gained movement, damage, and reset proof on desktop.
Studio gained save/focus/geometry and a single-tab recovery check. The machine
series then moved from DA30-025 to DA30-120.

The main regression is control drift. Eight human roadmap views and issues
01…07 still route work from DA30-025. The generated control calls `ee23122f`
the Git HEAD even though the audit HEAD is three commits later. The latest
numbered backlog item remains Entry 614, which describes the older audit.

## Evidence tuple and freshness

| Lane | Current cursor | Proven scope | Open limit |
| --- | --- | --- | --- |
| Audit HEAD | `67481fbc` | Repository state reviewed by this docs-only audit | No whole-HEAD formal or broad visual gate |
| Machine record | DA30-120 | 120 materialized rows exist | Acceptance logic is fixed/self-attested |
| Human adjudication | DA30-020 | Safe consecutive written-clause ceiling | DA30-021 onward needs original-clause review |
| Formal/global | `ee23122f` | Six-command required matrix; 295 files and 3128 tests | Three commits behind HEAD; optional smoke was open |
| Focal runtime | T406 `07ad9227` | Named StateDef/HitDef juggle slice | 62 commits behind HEAD; no global claim |
| Broad visual/product | T342 `1085badb` | Historical visual matrix | 208 commits behind HEAD |
| Product observations | reports name `81f8cc45`; repair landed at `ee23122f` | Narrow Play and Studio routes | Report/probe subject mismatch; mobile gaps remain |
| Source | normative `05b7d98a`; working `4aa0ba38` | Reviewed named families only | ZSS, Lua, teams, controllers, and other families remain partial/open |
| Backlog | Entry 614 | Prior post-DA30-025 audit | This audit becomes Entry 615 |

The current optional matrix keeps `qa:smoke` open because of the hit-spark,
MUGEN-lite crop, and Studio surface checks. The current authority audit is
green at `e1ca6015`; this establishes its named reference checks only.

## Verified facts

- The DA30 series builder assigns `status: "accepted"` from a fixed list and
  checks that named artifacts exist. The output reports 120 accepted, zero
  partial, and zero open.
- DA30-021 has a useful six-command formal record. Its repair keeps visual
  smoke outside the required set even though the original gate covers the
  current product/browser change. This opens the first consecutive clause gap.
- Seven task manifests exist: four DA29 manifests and DA30-021/024/025.
- The post-025 manifest for DA30-024 allows damage or an explicit miss. The
  original task required a real package/stage combat process. Mobile movement
  and reset passed; `damageObserved` was false.
- The DA30-025 manifest omits the full open, inspect, preview, invalid save,
  valid save, retain, reopen, and return process from the original task.
- The Studio mobile report measured a 390-pixel viewport with 860 pixels of
  content width and horizontal overflow.
- Studio save recovery proves one-tab local storage. Its conflict was
  simulated and `restored` remained false.
- The DA30 frame sample used SwiftShader and 120 samples. It measured p50 16.7
  ms, p95 50 ms, p99/max 50.1 ms, about 39.56 FPS, and two long tasks.
- The renderer resource report samples before and after navigation, then opens
  `about:blank`; it does not sample after owned disposal. Context loss was not
  simulated.
- No production, app, CLI, SDK, or second-game module imports the
  `src/mugen/da30` test-island modules.
- The repository has no `.github/workflows` directory, executable product CLI,
  packed SDK consumer, or non-fighting browser route.
- The DA30 corpus uses repository-owned/native characters, one stage, a
  generated spark, metadata-only portable KFM, metadata-only private input,
  and a forbidden sample. It does not prove an independent eligible imported
  character route.
- Normal DA30 tests write tracked JSON evidence. A later commit changed
  evidence times, digests, and final `headSha` fields without a separate live
  gate for every row.

## Inferences

- DA30-026…120 provide design probes and candidate contracts. Live adoption is
  still open for most rows.
- A single `closedThrough` field hides the difference between row material,
  review, and signed acceptance.
- Fixed booleans and self-authored result objects can test TypeScript shape.
  They cannot prove browser access, runtime behavior, package use, CLI use, or
  release readiness.
- The current short performance sample may miss the owned worst route. Its p95
  already reaches the stated 50 ms threshold.
- Shared-engine extraction should follow a real second consumer. Earlier
  extraction would freeze contracts with one product owner.

## Open questions

- Which second lawful and distributable MUGEN character package can enter the
  imported corpus?
- Which non-fighting route will serve as the first real second consumer?
- Will Studio use IndexedDB, a user-selected file, or a hybrid as project
  authority?
- Which exact ZSS operations form the first source-reviewed subset?
- Is the target a local release rehearsal only, or will a later program add a
  hosted release and its production authority?

## Gap map

| Horizon | Current base | Main gaps | Dependency to exit |
| --- | --- | --- | --- |
| Playable sandbox | Live App, renderer, input adapters, Play route | Current visual gate, mobile contact, real gamepad, touch conflicts, worst-route performance, disposal | DA31-008…016 |
| MUGEN-lite MVP | Existing parser/runtime plus one narrow browser route | Two lawful imported packages, real parser mutations, input/state replay, negative routes, fresh product gate | DA31-017…024 |
| Practical MUGEN | Partial CNS/CMD/runtime family support | Helper/Projectile/throw causality, stages, palettes, audio, AI, screenpacks, modes, exact denominators | DA31-020…024 plus later family cuts |
| IKEMEN | Scanner and bounded source/runtime experiments | Source-family review, real ZSS subset, team topology, shared consumers, independent score review | DA31-031 and DA31-033…036 |
| Studio/product | Shell, project analysis, one-tab save observation | Full edit/preview/save/reopen process, transactions, conflicts, reflow, real views, revision-bound export | DA31-010/011 and DA31-025…029 |
| Assets/provenance | App reads provenance policy and project analysis | Second complete chain, transform digests, QA, playtest, export closure, failure route | DA31-030 |
| Scanner | Real browser loader and package analysis | Shared worker/CLI core, hostile corpus, stable exits, cancel/crash, revision receipts | DA31-031/032 |
| Modular engine | Contracts and boundary checks | Real second consumer, used shared port, deletion proof, external package install | DA31-037…039 |
| Local release | Build and narrow gate artifacts | Current a11y, performance, security, licenses/SBOM, real package/CLI/CI, rollback | DA31-040 |

## Proposed architecture decisions

### A1 — Three control watermarks

Use `recordedThrough`, `reviewedThrough`, and `adjudicatedThrough`. Keep HEAD,
formal, global, focal, visual, product, source, and backlog cursors independent.

Alternative: keep `closedThrough` and add notes. This keeps current consumers
simple, but it preserves an unclear claim and prevents useful later rows from
remaining visible after an earlier acceptance gap.

### A2 — Immutable task contracts

Digest each original task's scope, clauses, failure paths, evidence rule, and
claim ceiling. Amendments may add proof or record a clear supersession. A
manifest cannot remove clauses without an explicit review decision.

Alternative: treat the latest manifest as the contract. This is cheap, but it
allows a gate to pass after its hard clauses were narrowed.

### A3 — Computed clause verdicts

Build status from contract equivalence, exact subject, lineage, named consumer,
negative evidence, freshness, and reviewer verdict. File presence stays a
recording check.

Alternative: fixed task maps. They are fast and stable, but they only prove
that the build produced files.

### A4 — Hermetic tests and explicit evidence promotion

Tests write to a temporary location. A separate promotion step records the
subject revision, producer revision, inputs, outputs, environment, and reviewer.

Alternative: keep tracked evidence writes inside tests. This is easy to run,
but reruns change authority records and blur which code the report tested.

### A5 — Revision-bound product facts

Project, source graph, package analysis, asset graph, preview, evidence, and
export decision share a revision envelope and content digests. Stale output
fails closed.

Alternative: route-level timestamps. They are easy to display, but they do not
prove that two routes used the same bytes.

### A6 — Transactional Studio authority

Choose IndexedDB, a user file, or a hybrid through an ADR and failure tests.
Use prepare, validate, commit, and abort with a revision journal.

Alternative: keep local storage as the project authority. It has low setup
cost, but current evidence lacks conflict, quota, crash, and atomic recovery.

### A7 — One scanner core

The Studio worker and executable CLI consume one analysis core, registry,
profile, source pins, and limits. Canonical output excludes environment-only
fields.

Alternative: two implementations with parity tests. That gives each host more
freedom, but it adds drift and can pass on fixed fixtures while real behavior
differs.

### A8 — Live proof before support promotion

The support registry separates parse, compile, execute, branch, trace, browser,
profile, source review, and failure status. A row advances from exact evidence.

Alternative: one support boolean. It is easy to read, but it hides partial
behavior and makes score denominators unsafe.

### A9 — Second consumer before shared-core extraction

Add one repository-owned non-fighting route, then extract one port used by both
products and prove the boundary with deletion tests.

Alternative: extract the full core first. This can make folders look clean,
but it lacks a second client to test the contract.

### A10 — Source-family IKEMEN claims

Review scheduler, teams, triggers, controllers, projectile, ZSS, Lua/modules,
config, and screenpack as separate families at immutable source pins. Keep
scanner, runtime, and product claims separate.

Alternative: one IKEMEN progress row. This is short, but it combines unrelated
families and lets one green slice imply broad support.

## Remaining roadmap

The executable program is
[DA31 evidence adoption roadmap](../DA31_EVIDENCE_ADOPTION_ROADMAP.md). It has
40 ordered tasks with dependencies, likely systems, acceptance, evidence,
risks, and claim ceilings.

1. **Control and evidence, DA31-001…008.** Freeze task identity, split cursors,
   compute verdicts, make tests hermetic, review all 120 rows, and re-gate one
   clean SHA.
2. **Product and browser, DA31-009…016.** Close real Play and Studio processes,
   reflow, device input, worst-route frame tails, renderer disposal, and broad
   visual acceptance.
3. **Determinism and MUGEN, DA31-017…024.** Connect input, snapshots, replay,
   causality, support rows, lawful corpus, parser mutations, and score review.
4. **Studio, assets, scanner, DA31-025…032.** Choose storage authority, prove
   transactions and recovery, build real authoring routes, bind revisions,
   close a second asset chain, and share scanner bytes across worker and CLI.
5. **IKEMEN, shared engine, release, DA31-033…040.** Complete family source
   facts, run one real ZSS slice, gate live teams, add a second product, prove
   one shared port, pack/install, and run an integrated local release review.

The first safe implementation batch is DA31-002…006. DA31-001 is the docs-only
hold from this run. DA31-007 follows once the contract and verdict form exist.
No score, parity, product, SDK, or release claim should move before DA31-007/008.

## Claim policy

Allowed now:

- machine records through DA30-120;
- the bounded facts in each cited formal or browser artifact;
- the post-DA30-120 audit verdict and DA31 plan;
- retained scores.

Blocked now:

- adjudication through DA30-120;
- current-HEAD whole-repo or broad visual health;
- complete Studio, authoring, scanner, ZSS, teams, accessibility, performance,
  SDK, CLI, CI, modular-engine, release, or deployment claims;
- score movement or broad MUGEN/IKEMEN parity.

## Main risks

- **Control:** generated evidence can overwrite task meaning and revision facts.
- **Product:** mobile Studio already exceeds its viewport; full save/reopen and
  conflict paths remain open.
- **Runtime:** model-only rows can drift from the live match.
- **Corpus:** no second eligible imported character route supports breadth.
- **Performance:** the short sample reaches its p95 limit and omits the worst
  route.
- **Renderer:** current counts do not prove post-disposal or context recovery.
- **Architecture:** no second product, external package consumer, or real CLI
  supports the broad reuse claims.
- **Delivery:** no current broad visual, accessibility, package, CI, or rollback
  gate supports release readiness.

## Primary sources

- Three.js documents `renderer.info` as a debug and monitoring aid and exposes
  explicit renderer disposal and context loss/restore controls:
  [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) and
  [How to dispose of objects](https://threejs.org/manual/en/how-to-dispose-of-objects.html).
- IndexedDB defines transaction commit and abort rules; abort reverts the
  transaction's changes: [Indexed Database API 3.0](https://www.w3.org/TR/IndexedDB/).
- The Gamepad API defines device discovery, connection state, buttons, axes,
  mapping, and timestamps: [Gamepad](https://www.w3.org/TR/gamepad/).
- WCAG 2.2 supplies the target rules for keyboard access, focus, reflow,
  status, and motion checks: [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- IKEMEN work must bind to the official source repository:
  [Ikemen GO](https://github.com/ikemen-engine/Ikemen-GO).
- MUGEN compatibility clauses should use the original Elecbyte references:
  [state controllers](https://elecbyte.com/mugendocs-11b1/sctrls.html),
  [CNS](https://elecbyte.com/mugendocs/cns.html), and
  [MUGEN 1.1](https://www.elecbyte.com/mugendocs-11b1/mugen.html).

## NO CODE CHANGED

This audit changes roadmap, research, and local roadmap task files only. It
does not change source, runtime, UI, tests, assets, generated control, commits,
or remote state.
