# Daily roadmap and architecture audit after DA27-09

Date: 2026-07-26
Mode: research, architecture, and roadmap only
Repository HEAD observed: `aa85cb84553dfa854737ab955121e65f3bc0bea4`
Branch state observed: `master...origin/master [ahead 22]` with a clean worktree before this audit

## Executive summary

DA27 is drained through DA27-09. The current HEAD is 23 commits after the prior daily-audit HEAD `c01d5e70`, four commits after the last formal/global gate `b7d23801`, one commit after the full QA smoke `f0234a`, 21 commits after the focal T406 source gate `07ad9227`, and 167 commits after the bounded visual/product cursor T342 `1085badb`.

The new work improves the playable shell: live `teamMode` reaches the app, Turns HUD data comes from the running match, the full QA smoke passed at `f0234a`, and DA27-09 added Common.Fx/FightScreen package and browser reachability proof. These facts do not raise the frozen scorecard. The current score remains MUGEN-lite 65%, MUGEN 36%, IKEMEN 20%, Studio 10-12%, asset pipeline 6-8%, scanner 25%.

The main risk has changed. Many DA26 and DA27 tasks produced good models, unit proof, or thin bridges, but several have no live runtime or product consumer. The next series must turn those parts into one tested product path. It must also correct one claim: DA27-09 proves sound dispatch with a fake `AudioContext` plus browser package, shell, and gesture reachability. It does not prove audible browser output.

No task in this audit changes a score, promotes a source pin, or advances the formal/global cursor. `docs/AUTHORITY_SELECTOR.md` still has an empty `nextQueue`. DA28 below is an execution-ready proposal. A later code-enabled control task must adopt it through the selector generator and machine artifact.

## Evidence cursors

| Cursor | Current evidence | Allowed claim | Blocked claim |
| --- | --- | --- | --- |
| Current repository | `aa85cb84` | DA27-09 is the latest committed ledger entry | HEAD passed the full formal/global gate |
| Latest numbered ledger | Entry 602, docs-only audit | This audit is the latest roadmap record | Entry 602 closes runtime or product work |
| Latest implementation ledger | Entry 601, DA27-09 | DA27 is drained | Entry 598 is the latest implementation entry |
| Formal/global | `b7d23801`, Entry 598 | Typecheck, 268 files / 2,845 tests, 663 traces, build, and boundaries passed there | The four later commits share that proof |
| QA smoke | `f0234a` | The complete QA smoke passed one commit before HEAD | DA27-09 audio output passed that smoke |
| Focal source | `07ad9227`, T406 | The bounded source-family gate passed at that SHA | Current HEAD or every source family is globally re-gated |
| Visual/product | `1085badb`, T342 | T342 remains the last broad bounded visual/product checkpoint | DA27-07/08/09 inherit the T342 browser matrix |
| Source authority | Ikemen `4aa0ba38`, Elecbyte `05b11a67` | Pinned references support named controller and fight-screen research | Runtime parity with full MUGEN or IKEMEN |

## Changes since the prior daily audit

Verified facts:

- 23 commits landed after `c01d5e70`; DA26 completed and DA27-01 through DA27-09 landed.
- DA27-07 wires `teamMode` and Turns HUD data into the app's live match path.
- DA27-08 records a green full QA smoke at `f0234a`.
- DA27-09 reaches the package, fight definition, fight sound, shell, browser gesture, console, and screenshot paths.
- The selector now reports `closedThrough = DA27-09` and an empty `nextQueue`.
- The formal/global cursor remains `b7d23801`; the bounded visual/product cursor remains T342.
- Root `CONTEXT.md` still names a 2026-07-12 frontier. It is outside this run's allowed write paths and remains a stale bootstrap pointer.

Static findings:

- `CompatibilityCorpusV12`, `ScoreAdjudication`, `ScannerCapabilityVector`, `BoundaryManifest`, `AssetReleasePolicyV1`, and `ProjectAssetClosure` have no non-test product consumer.
- `GlobalProjectileSchedule` only feeds `PluralCombatOracle`; the oracle has no live runtime consumer.
- `RuntimeTurnsTransaction` runs through a synthetic journey, while the app uses a separate live Turns path.
- `PackageAnalysisRevisionBridge`, `EvidenceEnvelopeFactsBridge`, and `CommonFxFightScreenProof` do not have a product caller. The DA27-09 browser script does not run `CommonFxFightScreenProof`.
- `ProjectSnapshotBridge` runs during save, but the snapshot uses local storage, contains placeholder authority values, and fails open.
- `SourceWriteJournalBridge` runs after a write receipt exists. It journals path, fingerprint, and digest strings as byte inputs, so it does not persist real pre-write intent or preimage bytes.
- `GamepadInputAdapter.getState()` returns an empty set and has no consumer.
- The dual-character journey checks static route hints. It does not execute walk, jump, hit, guard, fall, recovery, or KO in the live runtime. Its package digests are placeholders.
- Nova and Mira are repo-owned generated fixtures. They can prove loader, compiler, transport, and live execution behavior, but cannot raise imported-package compatibility coverage.
- Several new evidence records use 32-bit FNV-1a for fields named checksum or integrity, while formal materializers use SHA-256. The project needs separate behavior fingerprints and provenance digests.
- The source epoch reports `hitdef-core` and `projectile` as unreviewed. Its missing-file list also shows that the current manifest materializer does not cover every normative source file outside the juggle family.

Inference:

- The project has enough local parts for a stronger MUGEN-lite path, but parallel models now risk drift. Wiring and deletion of shadow paths reduce more risk than adding more standalone records.
- A score increase needs materialized current artifacts and executed package evidence. More documentation or unit-only proof must keep the current score.

Open questions:

- Should the next imported corpus fixture stay private and local, or should the project create a third repo-owned CC0 fixture with syntax that Nova and Mira do not cover?
- Which IKEMEN team path comes first after the MUGEN-lite transaction work: Simul, Tag, or wider Turns semantics?
- Which file-system write API is the supported Studio target, and what recovery promise can the product make when the browser denies or revokes access?
- What device and browser set defines a credible gamepad and audible-output gate?

## Gap map by horizon and system

| Horizon | Runtime and compatibility | Product and evidence | Main gate still missing |
| --- | --- | --- | --- |
| Playable sandbox | Live Turns HUD exists; gamepad is a stub; projectile ordering and Turns transaction remain separate models | DA27 browser checks are narrow; visual/product cursor is old | Current-HEAD global re-gate plus live keyboard/gamepad/Turns/projectile fault matrix |
| MUGEN-lite MVP | Two native packages load; route execution, palettes, Common1, throws, and controller breadth remain thin | Corpus v1.2 and score adjudication are modules, not current artifacts | Executed two-character matrix, materialized corpus, exact score denominators |
| MUGEN | HitDef, projectile, helper, target/custom-state, stage, lifebar, and screenpack breadth remain open | Imported-package evidence is too small; native fixtures cannot raise import coverage | A legal, diverse corpus with trace and browser proof |
| IKEMEN | Turns is partial; Simul, Tag, wider team interaction, redirects, and advanced controller paths remain | Source epochs are family-specific and incomplete | Source-mapped team slice on one live transaction model |
| Studio/product | Snapshot and write journal bridges exist, but persistence and recovery semantics are weak | Asset closure, analysis revision, and common evidence facts are not live decisions | IndexedDB snapshot, pre-write intent, product error/recovery proof |
| Assets/provenance | Native assets exist; binary transform chain and release decision are not in the live path | Policy and closure records are unit-only | Real transform receipts, SHA-256 chain, release block/allow matrix |
| Scanner | Capability and analysis revision models exist | Product import/reanalysis UI does not consume them | Material scan artifact plus downgrade and negative-execution browser proof |
| Modularization | Boundary tests pass at a formal cursor | Manifest is orphaned and legacy checks skip absent roots | Required-root failure, two real consumers, forbidden-import deletion test |

## Proposed architecture decisions

### D1. Use a cursor tuple

Record current HEAD, latest numbered ledger, latest implementation ledger, formal/global, focal, visual/product, and source authority as separate fields. Alternative: one `latest` field. The single field is short but causes false inheritance. The tuple costs more text and keeps each claim tied to its gate.

### D2. Track integration state on every capability

Use `model`, `bridge`, `live`, `browser`, and `global` states. Alternative: close a task when its unit gate passes. Early closure is simple but hides missing product use. A task may close its named unit slice while the parent product gap stays open.

### D3. Split behavior fingerprints from evidence integrity

Keep small FNV hashes only for quick behavior fingerprints. Use stable canonical JSON plus SHA-256 for provenance and evidence integrity. Alternative: use FNV everywhere. FNV is cheap, but it cannot support a strong tamper or identity claim.

### D4. Use one live combat transaction path

Turns handoff, projectile order, helper order, pause, fault restore, and round state should share a gather, validate, commit, and restore flow in `PlayableMatchRuntime` and `MatchWorld`. Alternative: keep synthetic oracles beside the live path. Separate paths ease unit tests but can disagree with the game.

### D5. Make browser input a tick-bound adapter

Poll `navigator.getGamepads()` during the match tick, process connect/disconnect, map axes and buttons into `MatchInputPolicySnapshot`, and record the normalized input used by replay. Alternative: event-only input. Polling matches the Gamepad API data model and supports deterministic capture, at the cost of per-tick normalization.

### D6. Put durable Studio state in IndexedDB

Store snapshots, source-write intent, preimage, result, and recovery records in IndexedDB. Keep local storage for small preferences and indexes. Alternative: local storage for every record. Local storage is easy but blocks, has small value types, and is weak for binary recovery.

### D7. Materialize corpus and score outputs

Generate versioned corpus and score artifacts from current evidence with source SHA, evidence age, denominator, exclusions, and digest. Alternative: expose pure in-memory records. Material artifacts support review, drift checks, and stable claims.

### D8. Require execution for character behavior claims

Static route hints can claim parse and compile readiness. Walk, jump, hit, guard, fall, recovery, and KO require live traces. Native fixtures count for pipeline proof; only legal imported fixtures count toward import breadth.

### D9. Use an audio evidence ladder

Separate dispatch, graph/rendered signal, live `AudioContext` state, and heard hardware output. DA27-09 covers dispatch and browser reachability. Alternative: call a successful `play()` audible. That claim exceeds the evidence because a fake context or muted output can still pass.

### D10. Promote source authority per family

Keep juggle, HitDef, projectile, Turns, input, and fight-screen epochs independent. Alternative: promote one source pin for the whole runtime. Family pins prevent a reviewed cut from masking an unreviewed one.

### D11. Treat scanner results as product decisions

The scanner must drive import, downgrade, reanalysis, and execution blocks. Alternative: publish a capability vector only. A vector with no consumer cannot prove safe product behavior.

### D12. Make the boundary manifest executable

The real boundary command and CI must load the manifest, fail when required roots are absent, and prove at least two consumers. Alternative: leave a standalone manifest model. An unused model cannot guard package layout.

## Remaining roadmap by phase

1. **P0 — Control and evidence:** DA28-01 through DA28-05. Adopt the queue, re-gate current HEAD, bound new browser claims, and materialize corpus and score truth.
2. **P1 — Live determinism and input:** DA28-06 through DA28-10. Merge projectile and Turns models into the live match and replace the gamepad stub.
3. **P2 — MUGEN-lite execution:** DA28-11 through DA28-17. Execute two characters, Common1, fight screen, palettes, projectiles, helpers, throws, and custom states.
4. **P3 — MUGEN breadth:** DA28-18 through DA28-20. Build exact controller denominators and expand legal presentation fixtures.
5. **P4 — Studio and product:** DA28-21 through DA28-25. Add durable snapshot/write recovery and wire asset, scanner, analysis, and evidence decisions into the product.
6. **P5 — Assets, scanner, source, modularization, and IKEMEN setup:** DA28-26 through DA28-30. Close provenance, source epochs, scanner proof, the next team-mode cut, and executable boundaries.

DA28-06 depends on DA28-02. DA28-07 and DA28-09 depend on DA28-06 and DA28-08. DA28-11 through DA28-20 depend on the current corpus and score artifacts from DA28-04/05. DA28-21/22 must land before Studio can make a recovery claim. DA28-29 starts only after the shared transaction path and source family audit. DA28-30 should precede broad package extraction.

## DA28 execution-ready tasks

| ID | Scope, likely systems, and dependencies | Acceptance and required evidence | Risk and claim ceiling |
| --- | --- | --- | --- |
| DA28-01 | Adopt this 30-task series in the selector generator, authority selector, machine artifact, and linked issues. No dependency. | Generator test, selector round trip, one next task, stable cursor tuple. | Control-only. It cannot raise a score or gate HEAD. |
| DA28-02 | Run the formal/global gate at current clean HEAD: typecheck, full tests, traces, build, boundaries, and ledger materialization. Depends on 01. | Exact SHA, commands, counts, logs, and failure ledger. | A green gate covers that SHA only. |
| DA28-03 | Add bounded DA27-07/08/09 visual and product subcursors; inspect desktop/mobile, console, focus, reduced motion, Turns, and fight-screen flow. Depends on 02. | Screenshots, geometry, console, keyboard/focus, motion, route and SHA records. | A bounded route cannot replace the broad T342 matrix until its declared scope passes. |
| DA28-04 | Materialize compatibility corpus v1.2 from real evidence under `docs/evidence`; include fixture digests, age, exclusions, native/import class, and source SHA. Depends on 02. | Reproducible artifact, SHA-256 digest, missing/stale evidence failures. | Native Nova/Mira rows cannot raise imported coverage. |
| DA28-05 | Materialize score adjudication from DA28-04 and current evidence; record exact numerators, denominators, exclusions, and holds. Depends on 04. | Reproducible score artifact plus mismatch and stale-input tests. | Expected result is a held score unless new executed evidence qualifies. |
| DA28-06 | Wire `GlobalProjectileSchedule` into `PlayableMatchRuntime`/`MatchWorld`; gather all actor generations and commit stable order. Depends on 02. | Live traces for both sides, helpers, replacements, equal-time ties, pause, and restore. | Stable payload sorting alone cannot claim live determinism. |
| DA28-07 | Run `PluralCombatOracle` against live runtime roots, helpers, and projectiles; remove or narrow shadow payload oracles. Depends on 06. | Oracle consumes live snapshots; mutation tests fail on reordered or missing subjects. | No full plural parity claim without live roots. |
| DA28-08 | Merge `RuntimeTurnsTransaction` into the live handoff, round, camera, target, helper, and projectile path. Depends on 02. | Gather/validate/commit/rollback traces with forced faults before and after commit. | Unit journey closure remains local until the app uses it. |
| DA28-09 | Extend the live Turns browser matrix: both sides, multiple replacements, pause, KO, fault restore, HUD, focus, and replay. Depends on 08 and 03. | Browser traces, screenshots, console, replay digest, no stale actor/target/HUD state. | One demo path cannot claim full Turns support. |
| DA28-10 | Replace `GamepadInputAdapter` with Gamepad API polling and normalized policy/replay input. Depends on 02. | Connect/disconnect, dead zone, axes, buttons, remap, SOCD, two pads, replay, and no-pad browser tests. | Emulator proof does not cover every physical device. |
| DA28-11 | Execute Nova and Mira walk, jump, hit, guard, fall, recovery, and KO through the live runtime. Depends on 04, 06, and 08. | Per-package SHA-256, compiler report, live traces, state/animation assertions, screenshots. | Proves native fixture execution, not imported breadth. |
| DA28-12 | Remove placeholder package digests and prove character independence with real SFF/ACT/CNS/CMD paths and no per-character adapter. Depends on 11. | Binary digests, load records, forbidden adapter/import search, swapped roster test. | Two related native fixtures do not prove broad syntax support. |
| DA28-13 | Add executed Common1, guard, fall, recovery, and shared-state traces for both characters. Depends on 11. | Source attribution plus live transition and recovery traces under hit/pause. | Parse-only Common1 proof remains blocked. |
| DA28-14 | Close FightScreen/Common.Fx evidence in the real browser: live audio graph, nonzero post-mix signal, announcements, localcoord, shutter, and teardown. Depends on 03. | Real `AudioContext` state, analyser or offline-render signal, browser logs/screenshots, mute/blocked negative cases. | Automated signal proof cannot claim a human heard hardware output. |
| DA28-15 | Execute ACT palette selection and RemapPal on the browser fight path. Depends on 11 and 03. | Palette bytes, selected index, rendered pixel samples/screenshots, reset/replay proof. | File presence alone cannot claim palette compatibility. |
| DA28-16 | Execute Projectile, Helper, ModifyHitDef, and juggle accounting on the shared actor/generation ledger. Depends on 06 and 13. | Source-mapped traces for spawn, hit, pause, destroy, replacement, and deterministic replay. | Bounded controllers only; no general controller parity. |
| DA28-17 | Execute throws, target redirects, and custom states with owner/target restore and fault cases. Depends on 08 and 13. | Live traces for success, escape, owner loss, target loss, rollback, and replay. | No broad custom-state parity outside covered cases. |
| DA28-18 | Build a real corpus controller/trigger coverage matrix with exact denominators and unsupported reasons. Depends on 04 and 11-17. | Generated matrix tied to package and source digests; missing controller rows fail. | Coverage counts do not equal semantic parity. |
| DA28-19 | Add a legal third fixture with syntax that Nova/Mira lack; choose private-local evidence or a repo-owned CC0 fixture. Depends on 18 and provenance review. | License/provenance record, distinct syntax list, parse/compile/live evidence, no commercial asset. | Private fixture evidence may be reported but not shipped. |
| DA28-20 | Add a minimal repo-owned stage, lifebar, and screenpack matrix with alternate localcoord and timing. Depends on 14 and 19. | Package digests, parser/runtime/browser traces, visual bounds, fallback and malformed cases. | Minimal fixtures do not claim general motif compatibility. |
| DA28-21 | Move project snapshots to IndexedDB; persist real authority, analysis, asset, and evidence references; surface quota and corruption. Depends on 02. | Save/reload, version upgrade, quota, damage, missing DB, and fail-closed product tests. | Local browser durability is not cloud sync. |
| DA28-22 | Wrap real source writes with persisted intent, real preimage bytes, result, recovery, and idempotent replay. Depends on 21. | Forced crash at each phase, byte-for-byte restore, duplicate intent handling, denied-access UI. | Receipt-after-write cannot claim crash recovery. |
| DA28-23 | Wire `ProjectAssetClosure` and `AssetReleasePolicyV1` into the live release/export decision and UI. Depends on 21 and 26. | Allow/block matrix, reason display, stale/missing transform and license failures, browser proof. | Unit policy rows cannot claim release enforcement. |
| DA28-24 | Wire package analysis revision and scanner capability into import/reanalysis UI. Depends on 21 and 28. | Import, rescan, downgrade, stale result, unsupported phase, and blocked execution browser proof. | Scanner data alone cannot claim safe execution. |
| DA28-25 | Make `CommonEvidenceFacts` the shared contract for Build and Evidence views; remove duplicate facts or the orphan bridge. Depends on 05 and 21. | Two real consumers, equality checks, stale/missing state UI, deletion test for old path. | Shared types alone cannot claim product convergence. |
| DA28-26 | Materialize the real binary transform and QA provenance chain for Nova and Mira. Depends on 04. | Tool/version/input/output SHA-256, deterministic rerun, visual QA, license and source records. | Generated fixtures remain native evidence. |
| DA28-27 | Classify source authority epochs for HitDef, projectile, Turns, input, and fight-screen families across both pins. Depends on current pinned repos. | Per-family file/range/digest, same/changed/unreviewed status, missing-file failure. | No global source-pin promotion from one family. |
| DA28-28 | Materialize scanner capability and phase results; prove downgrade and negative execution in browser. Depends on 04 and 27. | Artifact digest, parse/compile/runtime phases, malformed input, stale scan, UI block evidence. | Scanner score stays held until the product consumes the result. |
| DA28-29 | Map Simul, Tag, and wider Turns consumers from pinned Ikemen source; choose one bounded runtime cut after the transaction work. Depends on 08, 09, and 27. | Source map, dependency graph, chosen cut, rejected alternatives, acceptance traces and claim ceiling. | Research cannot claim IKEMEN runtime support. |
| DA28-30 | Load `BoundaryManifest` in the real boundary command and CI; fail absent roots and forbidden imports; prove two consumers before package extraction. Depends on 02. | Command/CI logs, absent-root failure, forbidden-import failure, two consumer traces, deletion test. | A green standalone manifest test cannot claim enforced architecture. |

## Claims after this audit

Allowed:

- DA27 is drained and the selector queue is empty.
- The formal/global gate passed at `b7d23801`; the QA smoke passed at `f0234a`.
- Live Turns HUD wiring exists at current HEAD.
- DA27-09 proves unit sound dispatch plus browser package, shell, and gesture reachability.
- DA28 is a proposed, ordered, execution-ready series pending control-plane adoption.

Blocked:

- Current HEAD is globally gated.
- Browser audio was heard or produced nonzero output.
- Corpus v1.2 or the score adjudication is a current material artifact.
- Orphan models enforce live runtime, Studio, scanner, asset, or boundary behavior.
- Nova and Mira increase imported-package compatibility.
- The frozen scores can move because this audit added documents.

## Official sources consulted

- Elecbyte M.U.G.E.N documentation hub and motif file roles: <https://www.elecbyte.com/mugendocs-11b1/mugen.html>
- Elecbyte state controller reference for HitDef, HitOverride, Pause, targets, and projectiles: <https://www.elecbyte.com/mugendocs-11b1/sctrls.html>
- Elecbyte AIR reserved actions: <https://www.elecbyte.com/mugendocs-11b1/air.html>
- Ikemen GO official repository: <https://github.com/ikemen-engine/Ikemen-GO>
- W3C Gamepad API: <https://www.w3.org/TR/gamepad/>
- W3C Indexed Database API: <https://www.w3.org/TR/IndexedDB/>
- W3C Web Audio API: <https://www.w3.org/TR/webaudio-1.0/>
- Three.js `Object3D.renderOrder`: <https://threejs.org/docs/pages/Object3D.html>
- Three.js `WebGLRenderer` information and sorting behavior: <https://threejs.org/docs/pages/WebGLRenderer.html>

## NO CODE CHANGED

This audit changes roadmap, architecture, research, and local planning documents only. It does not modify source, runtime, UI, tests, assets, dependencies, commits, or remote state.
