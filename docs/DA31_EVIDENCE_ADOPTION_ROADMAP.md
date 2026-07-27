# DA31 evidence adoption roadmap

Last updated: 2026-07-27

This is a proposed 40-cut program after the post-DA30-120 audit. DA30 artifacts
remain useful inputs at their observed scope. DA31 accepts a prior model only
after the original written clauses, exact subject revision, failure paths, and
live consumer all agree.

## Authority and use

- Machine record: `recordedThrough = DA30-120`.
- Safe consecutive written-clause ceiling: `adjudicatedThrough = DA30-020`
  pending full row review.
- Formal/global evidence: `ee23122f`, three commits behind audit HEAD
  `67481fbc`.
- Focal runtime: T406 `07ad9227`.
- Broad visual/product parent: T342 `1085badb`.
- Source family pins: normative `05b7d98a`, working `4aa0ba38`.
- Scores stay `65 / 36 / 20 / 10-12 / 6-8 / 25`.
- DA31 is proposed human authority. Generated selector/cursor adoption is a
  later code-enabled task.

## Dependency phases

1. DA31-001…008: repair task authority and evidence promotion.
2. DA31-009…016: restore current product, visual, input, performance, and
   renderer facts.
3. DA31-017…024: connect deterministic models to the real runtime and rebuild
   MUGEN-lite evidence.
4. DA31-025…032: close Studio, asset, scanner, and revision workflows through
   live consumers.
5. DA31-033…040: source-review IKEMEN slices, prove one shared consumer, and
   rehearse local release with real commands.

## Phase 0 — Control and evidence authority

| ID | Scope, dependencies, and likely systems | Acceptance and evidence | Risk and claim ceiling |
| --- | --- | --- | --- |
| DA31-001 | Publish a post-DA30-120 audit hold. Depends on this audit. Systems: human roadmap owners and issues 01-08. | Every human current view names audit HEAD, formal/focal/visual/source cursors, `recordedThrough`, `adjudicatedThrough`, held scores, and DA31-002. Generated files stay untouched. | Risk: split current authority. Allows the audit hold and queue proposal only. |
| DA31-002 | Freeze original task contracts. Depends on DA31-001. Systems: `docs/DA30_RECOVERY_ROADMAP.md`, manifest registry, contract digests. | Each DA30 ID stores the digest of its original scope, dependencies, clauses, failure paths, evidence, and ceiling. An amended manifest can add proof or supersede a task; it cannot erase a clause silently. Negative fixture: the narrowed DA30-025 manifest fails equivalence. | Risk: historical task text may need parsing by hand. Allows immutable acceptance identity only. |
| DA31-003 | Add separate control cursors. Depends on DA31-002. Systems: next control-source schema, selector/cursor projections. | Schema carries `recordedThrough`, `adjudicatedThrough`, `reviewedThrough`, and independent HEAD/formal/global/focal/visual/product/source/backlog cursors. A gap before DA30-120 leaves later records visible without advancing the adjudicated cursor. | Risk: current consumers expect `closedThrough`. Allows control-model design and migration only. |
| DA31-004 | Replace the fixed accepted map with clause evaluation. Depends on DA31-002/003. Systems: future status materializer and validator tests. | Status comes from immutable contract clauses, exact evidence subject, lineage, failures, and reviewer verdict. Negative fixtures cover fixed `true`, non-empty output, self-attestation, clause deletion, stale SHA, and model-only consumer claims. | Risk: many old rows become partial. Allows computed row status only. |
| DA31-005 | Stop tests from rewriting tracked evidence. Depends on DA31-003. Systems: Vitest evidence producers, temp output, explicit promotion command. | Normal tests write to a temp directory. An explicit promotion command records clean subject SHA, producer SHA, input digests, output digest, and reviewer. A full test rerun leaves `git status` unchanged. | Risk: scripts rely on current side effects. Allows hermetic test/evidence separation only. |
| DA31-006 | Enforce clean subject revisions. Depends on DA31-003/005. Systems: browser/formal gate envelope. | A gate rejects a dirty tree or labels it provisional; reports bind to the commit that contains the tested probe and code. Re-run DA30-024/025 on one clean SHA and prove report/manifests match that SHA. | Risk: post-run evidence promotion creates a second commit. Allows exact-revision route observations only. |
| DA31-007 | Build a 120-row DA30 clause verdict ledger. Depends on DA31-002/004/006. Systems: local audit report and reviewer records. | Each row names original clauses, current artifact, subject revision, live consumer, negative case, pass/fail/unknown, preserved fact, missing proof, and DA31 carryover. Manual samples cover every wave and every evidence class. | Risk: slow review. Allows row-level adjudication only. |
| DA31-008 | Re-gate current HEAD and current control. Depends on DA31-001…007. Systems: formal command manifest, authority audit, optional smoke status. | At one clean SHA, preserve raw logs, exact counts, warnings, versions, exits, and digests for typecheck, full tests, traces, build, both boundary checks, authority audit, and the selected visual gate. Failed optional routes remain explicit. | Risk: existing `qa:smoke` failures. Allows formal/global and named visual facts at that SHA only. |

## Phase 1 — Product, visual, input, performance, renderer

| ID | Scope, dependencies, and likely systems | Acceptance and evidence | Risk and claim ceiling |
| --- | --- | --- | --- |
| DA31-009 | Re-run the core Play journey. Depends on DA31-006/008. Systems: App `qaProbe`, real match runtime, browser runner. | Desktop and 390-pixel mobile routes each prove exact package/stage IDs, movement, authored attack state, contact, life delta, hit/guard telemetry, reset, focus recovery, HUD/canvas state, and zero unexpected errors. A forced miss and a missing package are separate failures. | Risk: mobile contact timing is flaky. Allows two named Play routes only. |
| DA31-010 | Complete the original Studio/Inspect process. Depends on DA31-006/008. Systems: project index, preview, Inspect loader, save/reopen. | Open a real project and package; inspect source/capability facts; edit; preview; reject one invalid save; complete one valid save; retain work; reload/reopen; return safely. Desktop and mobile capture state, focus, errors, and revision IDs. | Risk: current product route lacks these seams. Allows one named Studio/Inspect process only. |
| DA31-011 | Close mobile Studio reflow and focus. Depends on DA31-010. Systems: Studio layout and browser checks. | At 320 and 390 CSS pixels plus 200% and 400% zoom, no required control or label is clipped, no two-axis scroll blocks the process, focused controls remain visible, and all steps from DA31-010 stay usable. Evidence includes geometry, focus rectangles, screenshots, and reduced-motion state. | Risk: broad layout work. Allows measured viewport/accessibility facts only. |
| DA31-012 | Gate physical gamepad lifecycle. Depends on DA31-009. Systems: Gamepad adapter, seat map, focus/input status UI. | Real or explicitly identified device-lab evidence covers connect, held input, unplug, stale release, reconnect with changed index, standard/non-standard mapping, two seats, keyboard fallback, focus loss, and visible status. Simulated objects remain unit evidence. | Risk: hardware availability. Allows tested devices and mappings only. |
| DA31-013 | Gate touch and concurrent input. Depends on DA31-009/011/012. Systems: mobile controls and input merge. | Touch performs movement, attack, guard, reset, and focus recovery on the live match. Keyboard/gamepad/touch conflict order follows the input ADR; held controls clear on hide, blur, navigation, and disconnect. Event logs bind input to runtime ticks. | Risk: browser gesture policy. Allows tested mobile/concurrent paths only. |
| DA31-014 | Replace the short frame sample with a route budget. Depends on DA31-009. Systems: frame-gap harness and diagnostics. | Reproduce the owned worst route for warmup plus at least 60 seconds; record sample count, p50/p95/p99/max, FPS, long tasks, CPU/GPU/browser, draw calls, memory proxies, and input latency. A breach at current p95 around 50 ms has an owner and blocks the route claim. | Risk: machine variance. Allows measured environment facts only. |
| DA31-015 | Prove WebGL lifecycle and disposal. Depends on DA31-009/010/014. Systems: renderer registry, route teardown, Three.js diagnostics. | Five distinct routes repeat mount/swap/resize/DPR/hide/reopen/failure cycles. The gate calls owned dispose paths, samples after teardown, simulates context loss/restore where supported, and reports bounded programs/geometries/textures plus expected internal resources. | Risk: Three.js internal caches blur totals. Allows owned lifecycle facts only. |
| DA31-016 | Restore broad visual acceptance. Depends on DA31-009…015. Systems: `qa:smoke`, screenshot review, console/page error ledger. | Full smoke passes at one clean SHA. Human review covers final state, desktop/mobile geometry, hit spark/crop failures, Studio surfaces, focus, reduced motion, and renderer recovery. Raw failures stay attached if any path remains open. | Risk: current smoke is open. Allows the named visual matrix only. |

## Phase 2 — Determinism and MUGEN evidence

| ID | Scope, dependencies, and likely systems | Acceptance and evidence | Risk and claim ceiling |
| --- | --- | --- | --- |
| DA31-017 | Connect canonical input logs to the live match. Depends on DA31-012/013. Systems: MatchInputPolicy, `PlayableMatchRuntime`, trace envelope. | Two identical seeded routes emit byte-identical tick/seat/device/focus/edge logs; one input mutation reports the first differing tick. Pause, reset, disconnect, and replay sample at the named schedule point. | Risk: wall-clock fields leak. Allows live input-log determinism only. |
| DA31-018 | Complete live state ownership and restore. Depends on DA31-017. Systems: roots, helpers, projectiles, effects, targets, teams, round, clocks, RNG. | An owner census maps every deterministic field. Snapshot/restore of a real route yields identical canonical bytes and later checksums. Unknown/corrupt versions fail atomically and preserve the pre-restore state. | Risk: mutable closures and render-only state. Allows one named snapshot/restore route only. |
| DA31-019 | Record and replay a real round. Depends on DA31-017/018. Systems: trace, controller ops, round result. | Input log plus initial snapshot reproduces periodic/final checksums, contact order, resources, controller telemetry, winner, and frame count. Mutation names first divergent owner/tick. Raw artifacts are required in the formal corpus. | Risk: current DA30 replay is a model loop. Allows one deterministic replay route only. |
| DA31-020 | Revalidate causality across Helper, Projectile, and throw paths. Depends on DA31-018/019. Systems: live ancestry, RedirectID, effect ownership, targets, WinType. | Real fixtures cover root, nested Helper, Helper Projectile, plural Projectiles, redirected controller, and atomic throw. Negative cases cover stale caller, missing/cyclic parent, cross-root ancestry, wrong slot owner, invalid target, interruption, reset, and replay. | Risk: broad ownership matrix. Allows listed source/carrier/receiver paths only. |
| DA31-021 | Derive support registry rows from real proof. Depends on DA31-020. Systems: support registry, trace/browser/scanner consumers. | Each row separates parse, compile, execute, branch, trace, browser, profile, source review, and failure state. A model name, source-text hit, or fixed boolean cannot promote a row. Docs and scanner consume the same revisioned registry. | Risk: current row count drops. Allows registry facts at cited evidence only. |
| DA31-022 | Rebuild the lawful imported corpus. Depends on DA31-021 and provenance policy. Systems: corpus index, loader, fixtures. | Inventory separates native/generated fixtures from imported MUGEN compatibility. Every eligible route has permission, distinct package bytes, profile, loader facts, unsupported density, runtime trace, browser path, and failure cases. Metadata-only KFM and private rows earn zero breadth. | Risk: a second distributable legal character may be absent. Allows corpus inventory and eligible route count only. |
| DA31-023 | Run syntax mutation through real parser/compiler/runtime seams. Depends on DA31-021/022. Systems: actual DEF/CNS/CMD/AIR parsers and diagnostics. | Owned fixtures cover casing, whitespace, duplicates, sections, coercion, redirects, includes, malformed bytes, size caps, and profile mismatch. Tests assert source locations, compile/runtime handoff where allowed, diagnostics, and no crash. | Risk: current DA30 corpus uses local functions. Allows tested syntax/diagnostic cases only. |
| DA31-024 | Re-adjudicate MUGEN-lite and practical MUGEN. Depends on DA31-009, 016, 019, 021…023. Systems: scorecard and independent review. | Reviewer uses exact denominators for eligible imported routes, core move/guard/get-hit/fall/recovery behavior, unsupported-heavy cases, product paths, freshness, and failures. Native fixtures, docs, and model-only tasks contribute zero. | Risk: no score movement. Allows a signed bounded score decision only. |

## Phase 3 — Studio, assets, scanner

| ID | Scope, dependencies, and likely systems | Acceptance and evidence | Risk and claim ceiling |
| --- | --- | --- | --- |
| DA31-025 | Choose and prove Studio storage authority. Depends on DA31-010 and official IndexedDB rules. Systems: IndexedDB project store, optional file adapter, revision journal. | ADR compares IndexedDB, file authority, and hybrid ports. A browser spike proves commit/abort, quota, permission, cancellation, crash/reopen, unknown version, and atomic retention. LocalStorage may cache UI state; it cannot serve as release authority without the same transaction proof. | Risk: browser support differs. Allows chosen local authority and tested failures only. |
| DA31-026 | Wire transactional save to the real project. Depends on DA31-025. Systems: project envelope, source graph, journal, reanalysis. | Prepare/validate/commit or abort changes one revision. Fault injection at each stage leaves old or new coherent bytes; no post-write intent can replace a preimage. Reload/reopen proves exact revision and retained work. | Risk: migration from current stores. Allows named save/fault paths only. |
| DA31-027 | Close conflict and recovery UX. Depends on DA31-026. Systems: two tabs, external file change, autosave, retry/discard/export-copy. | Real multi-tab stale-base, external change, partial asset update, quota, permission, worker failure, cancel, and retry show exact cause, retained revision, safe actions, and reopen result. | Risk: file APIs vary. Allows named conflict/recovery paths only. |
| DA31-028 | Build real authoring routes. Depends on DA31-026/027. Systems: character, state/controller, command, animation, palette, stage, asset, evidence, settings views. | Each selected view has a direct route, real project field, validation, source location, undo/redo where mutable, keyboard path, save/reopen, and a browser capture. A static list of view names fails. | Risk: large product scope; ship one view per cut. Allows each independently proven view only. |
| DA31-029 | Prove preview and export revision fidelity. Depends on DA31-028. Systems: preview runtime, export manifest, release decision. | Saved and unsaved preview modes use the explicit revision, leave persisted project bytes unchanged, show unsupported facts, reset cleanly, and match the locally exported config for one route. Stale/tampered/blocked facts stop export. | Risk: preview may share mutable runtime state. Allows one local preview/export chain only. |
| DA31-030 | Close a second asset provenance chain. Depends on DA31-026/029. Systems: provenance graph, transform runner, atlas/audio, collision, playtest, export. | One independent repository-owned or generated asset records source, permission/license, tool/prompt, ordered transform params, input/output SHA-256, QA, motion/scale, collision, audio targets, browser playtest, budget, and exported inclusion. A failure sample blocks release with a clear reason. | Risk: source art quality. Allows that asset chain only; imported MUGEN scores stay unchanged. |
| DA31-031 | Build a real scanner/headless parity path. Depends on DA31-021/023/025. Systems: browser worker, executable local CLI, archive/path limits. | Same package bytes, profile, registry, limits, and source pins yield identical canonical findings and failure codes in Studio worker and CLI. Cover traversal, bombs, case collisions, encoding, cancel, timeout, crash, malformed input, and environment-only fields. | Risk: current CLI is a function model. Allows named scanner/CLI fixtures only. |
| DA31-032 | Bind source writes to incremental reanalysis. Depends on DA31-026/031. Systems: dependency graph, worker revision, Studio trust rows. | A successful write invalidates exact dependents, publishes one current revision, keeps unchanged digests, rejects stale worker output, supports cancel/retry atomically, and matches a full rebuild. Failed writes publish no new authority. | Risk: graph gaps cause stale facts. Allows named reanalysis behavior only. |

## Phase 4 — IKEMEN, shared engine, release

| ID | Scope, dependencies, and likely systems | Acceptance and evidence | Risk and claim ceiling |
| --- | --- | --- | --- |
| DA31-033 | Complete family-scoped Ikemen source authority. Depends on DA31-007/021. Systems: immutable source epoch and semantic deltas. | Scheduler, teams, triggers, controllers, projectile, ZSS, Lua/modules, config, and screenpack rows name exact pins, files, symbols, blob digests, relation, semantic review, consumer, and open questions. `same/ahead/diverged` requires computed evidence. | Risk: local clone may miss objects. Allows source provenance per reviewed family only. |
| DA31-034 | Decide and execute one ZSS slice. Depends on DA31-019/021/033. Systems: real ZSS parser/compiler/runtime profile. | Either reclassify the current object interpreter as a prototype, or route a source-reviewed owned ZSS file through parser, compile, named operations, runtime trace, snapshot/reset, limits, and explicit rejection of every other operation. | Risk: source semantics are broad. Allows only the named operations at one pin/profile. |
| DA31-035 | Gate live team topology and consumers. Depends on DA31-019/020/033. Systems: P1-P4 registry, Tag/Turns schedule, input, effects, combat, KO, camera, HUD, audio, resources, reset. | Distinct actor/package paths prove active/standby identity, Partner/Enemy/P2 lookup, transition order, and each enabled consumer. Negative causality cases fail closed; unchanged 1v1 checksums remain required. | Risk: ten consumers in one task; close each as a child gate. Allows exercised team consumers only. |
| DA31-036 | Re-adjudicate bounded IKEMEN progress. Depends on DA31-031/033…035. Systems: scanner/source/runtime/product lane ledger. | Independent review reports separate denominators and evidence for scanner findings, source-reviewed families, ZSS operations, team runtime, module policy, replay feasibility, product paths, and performance. Unknown families stay open. | Risk: likely held score. Allows signed bounded IKEMEN scope only. |
| DA31-037 | Add one real non-fighting browser consumer. Depends on DA31-016/018 and a repository-owned asset set. Systems: new module route and its own model. | The route mounts, resizes, accepts input, advances its own state, saves/reopens, reports evidence, tears down, and passes desktop/mobile browser proof. Its source graph contains no MUGEN/CNS/CMD/HitDef/Common1 combat imports. | Risk: scope expansion. Allows two-consumer proof for used ports only. |
| DA31-038 | Extract one shared port with deletion proof. Depends on DA31-037. Systems: choose clock, input, renderer lifecycle, storage, or evidence. | Both fighting and non-fighting routes consume the same versioned port. Removing either adapter breaks the correct consumer test; forbidden imports, browser globals in headless code, private imports, cycles, missing roots, and unused ports fail the boundary command. | Risk: early extraction freezes a weak API. Allows that port only. |
| DA31-039 | Build real CLI/package/CI proof. Depends on DA31-031/038. Systems: executable command, package exports, temp consumer, actual workflow or reproducible local CI runner. | CLI processes real bytes with stable exits/JSON/cancel/limits. `pnpm pack` installs into clean temp browser/headless consumers; private imports fail; exports/types/assets/licenses/digests pass. CI config or runner executes the stated lanes and one forced failure. | Risk: repo has no current workflow or package scripts. Allows local package and named CI environment only. |
| DA31-040 | Run integrated local release review. Depends on DA31-008, 016, 024, 029…032, 036, 039. Systems: a11y, performance, security, licenses/SBOM, rollback, score review. | A clean checkout runs real build/package/browser/CLI/scanner/accessibility/performance/security gates with raw logs. Accessibility covers focus, reflow, roles, contrast, reduced motion, status, canvas alternative, and screen-reader paths. Release manifest names every blocker and rollback result. | Risk: many expected blockers. Allows local rehearsal facts and the signed next program; public release stays blocked. |

## Claims while DA31 is proposed

Allowed:

- The post-DA30-120 audit verdict at `67481fbc`.
- DA30 machine records and bounded observations at their exact artifacts.
- DA31 dependency and acceptance design.
- Held scores.

Blocked:

- `adjudicatedThrough = DA30-120`.
- Current-HEAD whole-repo or broad visual health.
- Studio, authoring, scanner, ZSS, team, SDK, CLI, CI, accessibility,
  performance, or release completion from model outputs.
- Score movement, full MUGEN/IKEMEN parity, public deployment, and public
  release authority.
