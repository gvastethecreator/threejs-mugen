# DA29 validation findings

## Baseline

- Audit HEAD: `fd7a9b9a16b2acd116df1e6dba69f0d451cc37ed`.
- Initial worktree: clean; branch 44 commits ahead of `origin/master`.
- Authority selector declares DA29-001…200 closed and `nextQueue` empty.
- Formal/global: DA29-002 at `a6e91520`; focal T406 `07ad9227`;
  visual/product T342 `1085badb`; source pins 05b/4aa.
- Scores remain `65 / 36 / 20 / 10-12 / 6-8 / 25`.
- `roadmap-cursor-v1.json` still carries DA27 `b7d23801`, so generated control
  artifacts already disagree at bootstrap.

## Quality contract

Artifact and outcome: DA29 closeout verdict plus longer executable roadmap.

Purpose: prevent bulk or circular evidence from erasing real remaining work.

Mission mode: audit; document/task artifacts may change.

Proof: repository sources, closeouts, measured artifacts, validators, commit
history, current consumer topology, and primary sources where needed.

## Audit loops

| Loop | Source finding | Artifact/proof delta | Verdict | Next |
| --- | --- | --- | --- | --- |
| 1. Control agreement | `AUTHORITY_SELECTOR` says `DA29-200`; `roadmap-cursor-v1.json` still says DA27 at `b7d23801`. | DA29-001 required both generated controls to agree. | DA29-001 acceptance failed. | Make control reconciliation the first recovery cut. |
| 2. Revision lineage | DA29 drain and all regenerated closeouts use `0b9180e6`; current HEAD is `fd7a9b9a`, eight commits after the formal/global pin `a6e91520`. | Current HEAD includes the acceptance checker and a large CSS change after the pinned gate. | The pin remains historical; it cannot prove current HEAD. | Require fresh formal and visual gates after control repair. |
| 3. Research closeouts | All 20 `[R]` cuts close when a generated note exceeds 200 bytes. The template repeats package scripts and a TypeScript file count for every topic. | DA29-011 asked for a machine-readable suite/owner/fixture/duration/lane map; its note contains none of those records. | Research notes are intake stubs, not acceptance proof. | Reopen each research result until its stated output exists. |
| 4. Architecture closeouts | All 41 `[A]` cuts close when a generated 20-line note and two unrelated authority files exist. | DA29-091, 141, 175, and 198 restate the task and acceptance but choose no option, compare no tradeoff, and define no contract. | Architecture acceptance is unproved across the generated family. | Replace template notes with real ADRs or keep the cuts open. |
| 5. Generic I/G checker | `AssertMeasuredMatchesAcceptance` accepts every non-special I/G cut when `acceptanceExecuted` is true and `functionResults` is non-empty. | It does not map task acceptance clauses to required facts, routes, assertions, or results. | The checker validates shape, not semantic completion. | Add task-specific acceptance manifests and negative checks. |
| 6. Helper route | DA29-052 reports zero Helper controllers and zero compiled controllers, then closes the nested Helper journey. | The executor parses Nova and checks that HelperSystem exports exist; it never spawns, redirects, destroys, or replays a Helper. | DA29-052 failed its acceptance. | Carry over as a real imported runtime journey. |
| 7. Product gates | DA29-100 and 119 scan source text for release/failure words. DA29-159 scans `App.ts` and directory names. | No click, keyboard, gamepad, mobile, error, retention, or exact-package route executes. | These product cuts are static inventories only. | Require browser journeys with state and error facts at one SHA. |
| 8. Reuse and CI | DA29-139 labels authority-selector use as a second consumer; DA29-142 lists package scripts while `.github` does not exist. | No non-fighting playable consumer and no CI workflow exist. | DA29-139 and 142 failed acceptance. | Build separate implementation cuts and proof gates. |
| 9. IKEMEN execution | DA29-176 reads `IKEMEN_GO_REFERENCE.md` and labels the result `source-reviewed-offline`; DA29-180 rereads the roadmap and registry. | No ZSS declaration/operation, failure route, trace, reset, or lane-separated milestone review runs. | DA29-176 and 180 failed acceptance. | Preserve research as input; reopen implementation and adjudication. |
| 10. Export and CLI | DA29-188 searches `ProjectReleaseDecision.ts` for export words. DA29-194 lists package scripts. | No bundle, digest repeat, path audit, play smoke, import/analyze/build command, exit code, stdin, cap, or cancellation proof exists. | DA29-188 and 194 failed acceptance. | Add deterministic export and headless CLI work as separate cuts. |
| 11. Adjudication | DA29-150 and 200 accept a review file produced in the same closeout wave when four fields exist. | The final review claims checker-honest closure, but the generic checker admits the false closures above. | The reviews are circular and not independent. | Re-run after corrected evidence and record reviewer identity/provenance. |
| 12. Bounded valid work | DA29-012 adds a trace manifest with focused tests; DA29-013 adds a parser-backed CNS census; some later focused cuts call real parsers/runtime helpers. | These changes can support narrow module/test claims even though the full 200-cut watermark is invalid. | Preserve narrow proof; do not discard all DA29 work. | Produce a per-cut verdict ledger with bounded claims. |
| 13. Formal raw proof | DA29-002's durable log says it was reconstructed from the checkpoint note. | The task required exact counts, versions, duration, warnings, failures, and immutable command output; these are absent. | Historical partial gate only. | DA30-016/021 require raw command capture at one SHA. |
| 14. Browser completeness | DA29-003 has three PNGs and console counts. | Commit, browser version, DPR/device, page errors, focus/keyboard log, import, source-write, and failure routes are absent. | Historical captures only. | DA30-017 and 023…026 own current browser facts. |
| 15. Renderer route identity | DA29-072 uses a live browser, but Play/team/stress share one URL and “cleanup” only waits before rereading the live renderer. | Three.js defines per-render counters and explicit reset; the gate performs no route teardown and leaves programs null. | Useful candidate baseline; acceptance remains partial. | DA30-028/029 require distinct routes and actual teardown. |
| 16. New queue integrity | DA30 roadmap was parsed after authoring. | 120 rows, 120 unique IDs, ten per wave, no missing/unknown IDs, no forward DA30 references, and no broken local links. | Queue structure passes. | Keep semantic review separate from structural validity. |
| 17. Scope and current views | Changed-path audit shows only `docs/` and `.scratch/roadmap/`. Current top sections carry the audit hold and historical sections retain old facts with labels. | Machine DA29 selector is intentionally unchanged and quarantined for DA30 control repair. | Research-only scope preserved. | Final diff checks and handoff. |

## Adversarial autopsy

1. **Risk: the audit sampled implementation semantics instead of manually
   executing 200 acceptance routes.** Mitigation: no task receives a new
   accepted verdict; DA30-002 requires a clause ledger before any watermark.
2. **Risk: useful DA29 work could be lost under a blanket reopen.** Mitigation:
   the report preserves candidate facts and directs semantic revalidation of
   DA29-012, 013, 041, 072, and every later artifact.
3. **Risk: the quarantined machine selector can still mislead automation.**
   Mitigation: every current human control surface carries the hold; DA30-003
   and 004 replace the split input. Runtime implementation stays blocked until
   DA30-010.
4. **Risk: 120 tasks can become task-count inflation.** Mitigation: each cut has
   a route or artifact, failure evidence, dependencies, and a claim ceiling;
   docs and task counts earn zero score credit.
5. **Risk: later runtime tasks duplicate long issue history.** Mitigation: the
   use contract and all issue overrides require reuse of bounded historical
   slices and semantic revalidation before new code.
6. **Risk: current health is mistaken for failed health.** Mitigation: the
   report says current HEAD is unverified and makes no regression claim.
7. **Risk: final adjudication lacks an independent reviewer.** Mitigation:
   DA30-119 stays open and requires separate reviewer provenance and reruns.

## Error log

- Initial evidence lookup used `src/engine/da29` and per-ID directories. The
  actual paths are `src/mugen/da29` and `docs/evidence/da29/measured`. Corrected
  before drawing verdicts.
- One PowerShell status scan used `$p:` inside an interpolated string and
  failed parsing. Re-ran with format arguments; no artifact depended on the
  failed command.
