# Expanded master audit findings

## Baseline

- HEAD `119e6274`, branch `master`, 34 commits ahead of `origin/master`.
- Worktree clean at bootstrap.
- DA28-01…30 is declared drained; `nextQueue` is empty.
- Formal/global remains `32466c6e`, 270 files / 2,850 tests / 663 traces plus
  build and boundaries.
- Current HEAD is after the global gate and after the DA28 drain due to the
  Frame Ledger UI redesign and capture refresh.
- Scores remain `65 / 36 / 20 / 10-12 / 6-8 / 25`.

## Early contradictions

- `authority-selector-v1.json` closes DA28-30 at `32466c6e` formal/global.
- `roadmap-cursor-v1.json` remains materialized at DA27 `b7d23801` and is stale.
- `ROADMAP_PROGRESS_SYSTEM.md` still says `closedThrough` DA28-05 and next
  DA28-06, while the authority selector and execution board say DA28 drained.
- `CONTEXT.md` still presents the 2026-07-12 Wayfinder 102 frontier.
- Current HEAD includes two later UI commits that do not inherit the formal,
  global, visual, or broad product gate.

## Scale inventory

Question: which source, test, script, and documentation surfaces create
planning and ownership risk? Exclusions: dependencies, build output, caches,
and bulk public assets.

- `src/`: 626 TypeScript files / 272,287 lines; 31 CSS files / 12,295 lines.
- Largest source surfaces include `RuntimeTraceGatePresets.ts` (2.45 MB),
  `App.ts` (669 KB), `PlayableMatchRuntime.ts` (317 KB), and
  `RuntimeTrace.ts` (185 KB).
- `scripts/`: 34 files / about 16,937 lines; `qa_smoke.cjs` and
  `qa_traces.cjs` dominate.
- `docs/`: 888 Markdown files / 91,186 lines. The append-only backlog is
  1.93 MB; several current-control documents exceed 400 KB.
- LOC establishes scale and ownership pressure only. It does not prove bad
  quality or runtime defects.

## Error log

- Attempt 1: whole-repo inspection script exceeded one minute because public
  binary/fixture traversal dominated the scan. It was terminated safely.
- Changed method: inspect `src/`, `scripts/`, and `docs/` separately; exclude
  dependencies, outputs, caches, and bulk public assets from interpretation.

## Audit loops

| Loop | Source finding | Artifact or proof delta | Verdict | Next |
| --- | --- | --- | --- | --- |
| 1 | Control artifacts disagree after DA28 drain | Stale cursor and selectors recorded | better | Inspect DA28 reports and live consumers |
| 2 | Source, QA, and docs have several very large ownership surfaces | Scale and largest-file inventory recorded without quality claims | better | Add modular and evidence-generation cuts |
| 3 | DA28-11…30 groups unit, artifact, and partial-product closes | Consumer census separates landed modules from live adoption | better | Inspect behavior depth and product seams |
| 4 | Native dual routes can inject sprites and accept state/animation presence when the event was not seen | Live-execution claims split into loader, state-entry, contact, and output gates | better | Require contact-led legal journeys |
| 5 | Extension probes use synthetic audio/projectiles and constant throw outcomes | Synthetic harnesses retained as unit evidence only | better | Plan real consumers and failure routes |
| 6 | Controller coverage regex counts StateDef `type = S/A` and uses a hard-coded support list | Coverage artifact marked unfit for score or parity use | better | Build parser-backed registry and denominators |
| 7 | Nova and Mira differ in package/sprites but share CMD, CNS, and AIR bytes | Two visual packages do not supply two syntax families | better | Add a third independent authored fixture and mutation corpus |
| 8 | Studio IDB, journal, closure, policy, scanner, and evidence bridges lack live product ownership or fail open | Product adoption and failure-state ladder added | better | Make storage and release decisions transactional |
| 9 | Boundary command duplicates the manifest and skips absent roots | Current boundary green cannot prove a reusable core | better | Require non-vacuous roots and a second consumer |
| 10 | Corpus/browser evidence predates the DA28 drain or latest Frame Ledger UI | Current product and visual truth remains unproved | better | Re-gate current HEAD before cursor promotion |
| 11 | No CI, frame-gap budget, long soak, or worker path is present | Release, performance, and resilience lanes made explicit | better | Add measured budgets before release claims |
| 12 | Official controller, trigger, storage, input, and accessibility rules exceed current proof | Primary-source deltas converted into small review cuts | better | Preserve source pins and claim ceilings per cut |
| 13 | First master draft ended at a local release path and left commands/AI, wider MUGEN product formats, advanced IKEMEN, Studio authoring, and SDK as partial decisions | Added DA29-151…200 in five guarded long-tail waves | better | Recheck all horizons and dependencies |

## DA28 consumer census

Live or direct consumers:

- `LiveGlobalProjectileSchedule` feeds `EffectActorSystem` combat/clash order.
- `LiveRuntimeTurnsBridge` feeds `PlayableMatchRuntime` handoff receipts.
- `GamepadInputAdapter` feeds app match input.
- `SourceWriteJournalBridge` has an app call site.
- `BoundaryManifest` has a script consumer.

Self-, test-, or materializer-only surfaces:

- `NativeDualLiveExecution` and `NativeExecutionExtensions` have no product or
  runtime caller outside their own modules.
- `StudioIndexedDbSnapshot` has no app caller.
- `ProjectAssetClosure`, `AssetReleasePolicyV1`, `ScannerCapabilityVector`,
  `PackageAnalysisRevisionBridge`, and `EvidenceEnvelopeFactsBridge` have no
  product caller.
- `ControllerCoverageMatrix` is consumed by a materializer, not a live import
  or execution decision.
- `TurnsBrowserMatrix` feeds tests and a browser QA script; the browser route
  still needs direct correlation with live combat state for broad claims.

Interpretation: DA28 closeouts remain valid at their written unit/artifact or
bounded scope. The parent product/runtime gaps stay open until live consumers
and failure paths exist.

## Behavior-depth findings

- `NativeDualLiveExecution` can add synthetic sprites when an SFF is absent.
  Several route outcomes fall back to the presence of a state or animation.
  The current swapped-hit route proves attack-state entry, not contact.
- `NativeExecutionExtensions` can hash a sprite sheet when no ACT palette is
  present, injects synthetic audio samples, creates synthetic projectiles, and
  returns a fixed five-row throw matrix. Those are useful probes, but they do
  not prove imported palette selection, audible browser output, live plural
  combat, or throw ownership.
- Nova and Mira have distinct package and sprite digests, but their CMD, CNS,
  and AIR digests match. They supply visual/package variety, not independent
  controller or expression breadth.
- The compiler contains about 95 controller entries, all with partial or no-op
  ceilings. The curated controller support document lists 24 compiled rows.
  A regex-based matrix cannot reconcile that gap because it also captures
  StateDef state types.

## Product and data findings

- `StudioIndexedDbSnapshot` writes memory before IndexedDB and swallows IDB
  errors. Its `preimageSha256` field uses a 32-bit FNV value. Committed replay
  can still return the preimage. The app does not consume this backend.
- The current project store remains localStorage-based. The source-write
  journal records after the file receipt and receives fingerprints or digests
  as byte fields; journal failure is caught. This cannot recover a crash that
  occurs before the post-write record.
- `ProjectAssetClosure`, `AssetReleasePolicyV1`, scanner revisions, and common
  evidence facts remain model/materializer surfaces. They do not yet drive a
  user-visible allow/block decision.
- Several fields called digest or integrity use FNV. The plan must separate a
  stable behavior fingerprint from a cryptographic content digest.

## Boundary, evidence, and product-view findings

- `scripts/check_boundaries.cjs` duplicates required roots instead of loading
  `BoundaryManifest.ts`. It treats future roots as absent/optional while the
  manifest marks `src/core` required. A skipped root cannot prove isolation.
- Corpus v1.2 is tied to the DA28-02 formal/global pin and a later Studio tip,
  but predates most of the DA28 drain and the Frame Ledger redesign. It cannot
  promote current HEAD by inheritance.
- The authority-reference audit checks a narrow list of stale strings. It did
  not catch the stale roadmap cursor or current text in
  `ROADMAP_PROGRESS_SYSTEM.md`.
- Current desktop Turns evidence shows a narrow stage under three dense panels.
  Current mobile evidence shows clipped HUD/control labels and overlays that
  cover much of the fight area. The images prove a route renders; they do not
  prove usability, keyboard access, target size, reflow, or unobscured focus.
- `WebGLRenderer.info` is exposed and many resources call `dispose`, but no
  current worst-route p95/p99/max frame-gap budget, memory soak, or context-loss
  gate exists. No Worker or OffscreenCanvas route was found for large scans.
- The repository has no `.github` workflow. Local commands exist, but there is
  no automated required-check or release-candidate contract.

## Primary-source deltas

- Elecbyte defines ordered state controllers and grouped trigger evaluation;
  controller presence alone cannot prove compatible execution.
- Elecbyte AIR defines reserved actions and element timing that need imported
  animation proof, rather than animation-number presence.
- Ikemen GO targets MUGEN compatibility while adding its own controllers,
  triggers, formats, and team behavior. MUGEN and IKEMEN claims need separate
  source families and pins.
- IndexedDB transactions supply atomicity and explicit abort/error outcomes.
  A memory-first fail-open adapter cannot stand in for durable product proof.
- File handles can require renewed `read` or `readwrite` permission. Reopen and
  source-write flows need prompt, denied, and revoked states.
- The Gamepad API uses polling plus connect/disconnect events. One happy-path
  merge leaves mapping, deadzone, reconnect, and focus ownership open.
- WCAG 2.2 calls for keyboard operation, visible and unobscured focus, reflow,
  target size, and safe flashing. Screenshots alone do not establish these.
- Three.js exposes draw and memory facts through `renderer.info`; those facts
  can anchor measured budgets, but they do not replace frame-gap and soak data.

## Source links

- Elecbyte MUGEN docs: <https://www.elecbyte.com/mugendocs-11b1/mugen.html>
- Elecbyte CNS: <https://elecbyte.com/mugendocs/cns.html>
- Elecbyte AIR: <https://www.elecbyte.com/mugendocs-11b1/air.html>
- Elecbyte triggers: <https://www.elecbyte.com/mugendocs-11b1/trigger.html>
- Elecbyte state controllers: <https://www.elecbyte.com/mugendocs-11b1/sctrls.html>
- Ikemen GO: <https://github.com/ikemen-engine/Ikemen-GO>
- Three.js `WebGLRenderer`: <https://threejs.org/docs/pages/WebGLRenderer.html>
- IndexedDB: <https://www.w3.org/TR/IndexedDB/>
- Gamepad: <https://www.w3.org/TR/gamepad/>
- File System Access: <https://wicg.github.io/file-system-access/>
- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>

## Open questions

- Which controller and trigger families occur in a lawful independent corpus,
  and which only exist in the compiler registry?
- Which current visual routes matter most for a release candidate after the
  Frame Ledger redesign?
- Should Studio make IndexedDB authoritative, or use it as a journaled cache
  behind a file/project port?
- Which first non-fighting consumer is small enough to make a shared-core gate
  real without freezing unstable fighting rules?
- What device and browser set defines input, audio, and performance support?

## Adversarial autopsy

Hostile question: where could this plan create confidence without proof?

- The first draft stopped at 150 cuts and left command/AI/modes, wider MUGEN
  formats, advanced IKEMEN, Studio authoring, and SDK/deployment as partial
  decisions. Five new waves now carry those owners through DA29-200.
- The first dependency pass found three cycles: AIR execution/parser,
  PackageAnalysis consumer/freshness, and IKEMEN module/plugin planning. The
  dependencies were reassigned and the expanded graph now has zero cycles.
- The plan has ten forward dependency links because waves group systems. The
  use contract says explicit dependencies override numeric/wave order.
- All 200 IDs are unique and sequential. Every wave has ten tasks. Every task
  states dependencies, acceptance/proof, risk, and an allowed claim ceiling.
- Local links in both new durable documents resolve. Generated selector/cursor
  files stay untouched, so DA29 remains proposed until DA29-001.
- Weaknesses remain: no independent agent review was allowed for this run; no
  current-HEAD code or browser gate ran; device/browser support, storage
  authority, third fixture, and hosted target remain open choices.
- The large plan can still invite oversized batches. Future agents should split
  a task when one closeout would span unrelated owners, while retaining the
  original claim ceiling and dependency edges.
