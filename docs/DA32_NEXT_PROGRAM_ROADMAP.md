# DA32 next program roadmap

Last updated: 2026-07-30

DA31 closed the 40-cut evidence-adoption program at named claim ceilings.
DA32 turns remaining open product and adjudication work into owned lanes.

## Authority hold (unchanged unless independent review signs)

| Cursor | Value |
| --- | --- |
| `recordedThrough` | DA30-120 |
| `adjudicatedThrough` | DA30-020 (advance only via signed clause samples) |
| formal/global | `f5f2315e` DA31-008 |
| Scores | held 65 / 36 / 20 / 10-12 / 6-8 / 25 |
| Public release | blocked |

## Dependency phases

1. **DA32-001…008** — smoke ownership, hit-spark/runtime repair, mugen-lite visual, Studio surface lanes.
2. **DA32-009…012** — physical gamepad device-lab protocol + optional hardware evidence.
3. **DA32-013…020** — consecutive clause adjudication samples past DA30-020.
4. **DA32-021…031** — project authority, authoring per-view browser capture, live snapshot/replay binding.
5. **DA32-029…032** — a11y SR/canvas alternative and mobile Studio stabilization.

## Phase 0 — Smoke ownership (current)

| ID | Scope | Acceptance | Ceiling |
| --- | --- | --- | --- |
| DA32-001 | Materialize structured `qa:smoke` ownership ledger | Lane map + failure inventory + runtime samples at a run; empty failures only if smoke green | ownership inventory; not score movement |
| DA32-002 | Harden native hit-spark drive (play + approach + multi-key) | `driveRuntimeHitSpark` requires playing; live contact approach; KeyZ/A/X retry; desktop/mobile focal gate | runtime-native spark lane only |
| DA32-003 | Classify open Studio lanes | workbench/build/modules/evidence/debug ownership rows | classification only |
| DA32-004 | Classify mugen-lite visual failures | desktop/mobile journey ownership | classification only |
| DA32-005 | Restore imported MUGEN Lite playfield visibility | ZIP import + native actors + desktop/mobile layout gate | named fixture and viewports |

### DA32-002 focal result - 2026-07-27

- `pnpm qa:browser:da32-002-hit-spark` passed on desktop `1440x960` and
  mobile `390x844` with zero unexpected console errors.
- Each viewport exercised `KeyZ`, `KeyA`, and `KeyX`; each produced a native
  player hit spark, resolved sprite data, axis data, and a life delta.
- The full `pnpm qa:smoke` run remains open at 41 failures. Its desktop
  runtime sample still misses the spark, so the global smoke lane stays open
  beside this focal pass.
- Evidence: `docs/evidence/da32/da32-002-hit-spark-browser-gate.json`.

Claim allowed: named runtime route, viewports, input keys, and native
hit-spark diagnostics in the focal gate. Claim blocked: all characters, stages,
input devices, and full MUGEN/IKEMEN visual parity.

### DA32-005 focal result - 2026-07-27

- The mobile Match stage now reserves up to `600px` of playfield height and
  hides the centered runtime summary that covered imported fighters at narrow
  widths. Desktop keeps the status summary visible.
- `pnpm qa:browser:da32-005-mugen-lite` passed at `1440x960` and `390x844`.
  The gate imports the repository-authored ZIP through `#zip-input`, confirms
  two renderer actors with native sprite dimensions, checks canvas/stage fit,
  touch-control fit, no horizontal overflow, and zero unexpected console/page
  errors.
- Screenshots: `docs/evidence/da32/browser/da32-005-mugen-lite-desktop.png`
  and `docs/evidence/da32/browser/da32-005-mugen-lite-mobile.png`.
- The full `pnpm qa:smoke` ledger is green at the current subject checkpoint.
  The focal gate still covers the named initial imported-fighter view only;
  broader state, roster, stage, device, and MUGEN/IKEMEN parity claims stay
  blocked.

Evidence: `docs/evidence/da32/da32-005-mugen-lite-visual-browser-gate.json`.

### Green smoke subject checkpoint - 8c6d6c80 (2026-07-28)

- `pnpm qa:smoke` passed with zero failures at the current subject HEAD.
- The MUGEN Lite visual lane now captures the renderer canvas with stage
  controls hidden for the crop, so lower fallen-sprite pixels remain measurable
  on mobile. The evidence also records the applied frame and mesh position.
- Studio Debug drives imported KFM through a paused contact route at an
  80-unit gap, observes a live target link, and then verifies executed state
  200 before rendering the target lens.
- Focused renderer coverage passes 5/5; the new frame diagnostic is used by the
  browser oracle to reject stale mesh presentations.

Evidence: `docs/evidence/da32/da32-smoke-ownership-v1.json`,
`docs/evidence/da32/da32-program-status-v1.json`, and `.scratch/qa/qa-smoke/`.

Claim ceiling: this is a green local subject checkpoint for the named browser
routes. Hardware gamepad evidence, score movement, public release, and full
MUGEN/IKEMEN parity remain blocked.

### Full smoke recheck - 9d0830b9 (2026-07-28)

- `pnpm qa:smoke` passed with zero failures after the Studio project authority
  slice. The run covered runtime desktop/mobile, imported MUGEN Lite states,
  Studio authoring, source relink, evidence, debug, and stage routes.
- `pnpm build` passed. Vite kept the existing large JavaScript chunk warning;
  it did not fail the build.
- Live ownership evidence was refreshed in
  `docs/evidence/da32/da32-smoke-ownership-v1.json` with `failureCount: 0`.

Claim ceiling: green local smoke subject at `9d0830b9`; this does not advance
the human adjudication cursor or close hardware, quota recovery, public
release, or full MUGEN/IKEMEN parity.

### Full smoke recheck - 14df21ef (2026-07-28)

- `pnpm qa:smoke` passed with zero failures in 333.5 seconds after the durable
  snapshot binding. Runtime desktop/mobile, imported MUGEN Lite, Studio
  authoring, source relink, evidence, debug, and stage routes passed.
- `pnpm build` passed with the existing Vite large JavaScript chunk warning.
- `docs/evidence/da32/da32-smoke-ownership-v1.json` records `failureCount: 0`
  for the current run.

Claim ceiling: green local smoke subject at `14df21ef`; this does not advance
the human adjudication cursor or close hardware, source-intent replay, quota
recovery, public release, or full MUGEN/IKEMEN parity.

## Runtime input and canvas a11y checkpoint - 47858f49 (2026-07-28)

- `GamepadInputAdapter` now keeps a deterministic diagnostic snapshot for both
  seats: connected state, browser index, device id, mapping class, and active
  logical actions. Disconnect polling clears the seat and its actions.
- Match status exposes `P1/P2` gamepad state and marks an unknown mapping as a
  warning. The input path remains keyboard-first for P1 and gamepad-enabled for
  both seats.
- `GamepadInputAdapter.start/stop` wires `gamepadconnected` and
  `gamepaddisconnected`; the adapter records the last eight event samples and
  re-polls immediately. Unit proof covers listener removal after `stop`.
- The Three.js canvas is focusable, has an image role and label, and points to
  a polite atomic `status` region with a text summary of stage, round, fighter
  life, runtime state, pause, and controller status.
- `pnpm qa:browser:da32-029-a11y` passed at `1440x900` and `390x844` with
  zero unexpected console errors. The gate confirms the canvas focus path,
  live-region attributes, pad metric, clipped summary, and no horizontal
  overflow. Screenshots are in `docs/evidence/da32/browser/`.
- Focused proof: `GamepadInputAdapter` plus `RuntimeA11ySummary` and DA32
  program tests pass 19/19; `pnpm typecheck` passes.

Claim ceiling: simulated/device diagnostics and a code-level canvas alternative
are recorded. Physical controller coverage, a screen-reader journey, contrast
audit, WCAG certification, and full MUGEN/IKEMEN parity remain open.

## Phase 1 — Device lab

| ID | Scope | Acceptance | Ceiling |
| --- | --- | --- | --- |
| DA32-009 | Publish gamepad device-lab protocol | Connect/unplug/remap/two-seat checklist + simulated baseline + visible runtime status | protocol + sim + diagnostics; hardware optional |
| DA32-010 | Virtual Gamepad API probe where supported | Browser probe records connect, held action, two seats, disconnect, keyboard fallback, mapping warning, and index-change reconnect | named browser only; no hardware claim |

### DA32-010 browser gate - b826de72 (2026-07-28)

- `pnpm qa:browser:da32-010-gamepad` passed on a clean subject at desktop
  `1440x900` and mobile `390x844`; unexpected console/page errors: zero.
- The gate injects browser `Gamepad` objects, dispatches connection events, and
  reads the live App bridge. It covers standard and non-standard mappings,
  button hold to logical action, two-seat binding, unplug action clearing,
  keyboard fallback while P1 is disconnected, and reconnect with device index 4
  through the same stable device id in a sparse Gamepad array.
- Duplicate device ids stay on configured index fallback and are marked
  ambiguous, so two identical controllers do not steal one logical seat.
- The match surface and the live status summary expose the resulting seat state.
  The report records the event window, per-seat diagnostics, status text, and
  viewport overflow check.
- Evidence: `docs/evidence/da32/da32-010-gamepad-browser-gate.json` and
  `docs/evidence/da32/browser/da32-010-gamepad-desktop.png`,
  `docs/evidence/da32/browser/da32-010-gamepad-mobile.png`.

Claim ceiling: named virtual browser route and viewports. Physical hardware,
all browser implementations, screen-reader flow, contrast, and full
MUGEN/IKEMEN parity remain open.

## Phase 2 — Clause adjudication samples

| ID | Scope | Acceptance | Ceiling |
| --- | --- | --- | --- |
| DA32-013 | Re-adjudicate DA30-021…030 sample rows | Ledger rows with evidence refs and pass/partial/fail | sample only; no bulk 120 claim |
| DA32-014 | Advance `adjudicatedThrough` only on consecutive passes | If 021 fails, watermark stays 020 | consecutive watermark rule |

## Phase 3 — A11y and mobile usability

| ID | Scope | Acceptance | Ceiling |
| --- | --- | --- | --- |
| DA32-029 | Canvas alternative / SR baseline inventory | Canvas summary and focus contract recorded; SR journey, contrast, and landmark gaps listed | partial implementation; not WCAG certification |
| DA32-032 | Stabilize Studio geometry at mobile and the desktop seam | bounded SVG/actions, one active mobile pane, document scroll ownership, breakpoint framing gate at 390, 619-621, 899-901, and 1160-1161 | named browser geometry only; broader mobile IA, touch-stage safe zones, and physical-device journeys remain open |

## Phase 4 — Studio project authority

| ID | Scope | Acceptance | Ceiling |
| --- | --- | --- | --- |
| DA32-021 | Move the Studio project index to an IndexedDB authority | Versioned project object store, local cache mirror, reload/reopen, optimistic revision conflict, desktop/mobile browser gate | named browser route and viewports; quota, eviction, source blobs, and full authoring remain open |
| DA32-022 | Bind saved Studio projects to durable snapshots | `StudioIndexedDbSnapshot/v1` record, revision/payload readback, reload persistence, backend diagnostics, desktop/mobile/fallback browser gate | named browser snapshot route; source-intent replay, quota, binary blobs, and full authoring remain open |
| DA32-023 | Recover pending Studio source writes through a live editor | durable `StudioSourceWriteIntent/v1`, exact preimage replay, pending-state retention, desktop/mobile browser gate | named pending-intent recovery route; handle write, permission repair, quota, binary blobs, and full authoring remain open |
| DA32-024 | Relink a pending source intent and complete explicit folder write/reimport | native folder relink, dirty preimage replay, separate read/write permission state, exact bytes, settled intent, desktop/mobile browser gate | named browser harness and folder route; physical prompts, durable handle restart, crash, quota, multi-file, ZIP rewrite, and full authoring remain open |
| DA32-025 | Persist incomplete source-write phases for post-reload recovery | durable `write-closed` phase, write byte length, exact preimage replay, pending retention, no-handle-write browser gate | named route and mock browser handles; physical crash, receipt synthesis, quota, eviction, multi-file, ZIP rewrite, and full authoring remain open |
| DA32-026 | Rehydrate the settled source-write receipt after reload | validated `SourceWriteReceipt/v1` payload beside the intent, digest rejection, bridge and visible recovery readback, desktop/mobile browser gate | named route and browser harness; physical crash, automatic retry, quota, eviction, multi-file, ZIP rewrite, and full authoring remain open |
| DA32-027 | Observe a write-closed source intent after reload | durable `needs-observation`, explicit source read classification, unavailable outcome without receipt settlement, exact preimage replay, desktop/mobile browser gate | named route and no-handle fallback; granted physical handle, crash injection, receipt finalization, retry, quota, eviction, multi-file, ZIP rewrite, and full authoring remain open |
| DA32-028 | Verify positive source observation through a granted folder handle | real KFM source read, `matches-preimage`, digest/length persistence, pending retention, zero writable-stream calls, desktop/mobile browser gate | simulated picker and fixture handle; `matches-draft`, changed bytes, physical permissions, crash, receipt finalization, quota, eviction, multi-file, ZIP rewrite, and full authoring remain open |
| DA32-030 | Accept a verified draft observation and finalize the source-write intent | `matches-draft` re-read, explicit folder reimport, `observed-write-and-reimport` receipt, settled intent with `recovery: observed`, desktop/mobile browser gate | simulated picker and KFM fixture; physical crash cuts, retry/abandon, quota, eviction, multi-file, ZIP rewrite, and full authoring remain open |
| DA32-031 | Record explicit retry and abandon decisions for a write-closed source intent | durable retry decision and attempt count, exact preimage replay, rejected abandon receipt, settled `aborted` intent, desktop/mobile browser gate | simulated browser intent without external write; physical crash, real retry write, quota, eviction, multi-file, ZIP rewrite, and full authoring remain open |

### DA32-021 browser gate - c95c871a (2026-07-28)

- `pnpm qa:browser:da32-021-storage` passed against clean subject `c95c871a`
  at desktop `1440x900` and mobile `390x844`; unexpected console/page errors:
  zero.
- The gate clears the prior project state, saves a real Studio manifest into
  the `mugen-web-sandbox-projects` IndexedDB database, reads the stored record
  directly, and checks the v1 localStorage mirror.
- A reload restores the recent project row. Opening that row restores the
  saved name and revision. A second same-origin page writes revision 2 while
  the first page keeps its local edit dirty and exposes the conflict.
- A no-IndexedDB browser probe renders the fallback status, saves through the
  local cache, keeps the stored project, and exposes a retry action without
  horizontal overflow.
- Implementation commits: `d2136e66` for the store/App path,
  `644b85c0` for fallback recovery, and `71a9abff`, `a398bd94`,
  `8967db00`, `ae98a84f` for the browser gate. The clean evidence subject is
  `c95c871a`. Evidence:
  `docs/evidence/da32/da32-021-studio-storage-browser-gate.json` and the
  matching desktop, mobile, and fallback screenshots.

Claim ceiling: browser IndexedDB authority, cache mirroring, reopen, desktop
conflict, and the named no-IndexedDB fallback route. Storage quota and eviction
recovery, file-system source blobs, physical device coverage, all browser
implementations, and full MUGEN/IKEMEN authoring parity remain open.

### DA32-022 browser gate - c63aabbe (2026-07-28)

- `pnpm qa:browser:da32-022-snapshot` passed against clean subject `c63aabbe`
  at desktop `1440x900`, mobile `390x844`, and a no-IndexedDB fallback case;
  unexpected console/page errors: zero.
- Saving a project now creates a `StudioProjectSnapshot/v1` identity record
  and a durable `StudioIndexedDbSnapshot/v1` record in the
  `mugen-web-sandbox-studio` database. The record carries project revision,
  authority digest, analysis digest, saved time, and a JSON payload with the
  snapshot integrity value.
- The gate reads the `snapshots` object store directly before and after reload.
  Both viewports prove the same project id, revision, name, payload, and
  integrity survive the page lifecycle. The App bridge exposes snapshot
  backend diagnostics and the existing retry action now retries both stores.
- The no-IndexedDB case keeps the project cache path usable and reports memory
  snapshot storage without claiming durable persistence.
- Focused verification: 12/12 tests, `pnpm typecheck`, `node --check
  scripts/qa_browser_gate_da32_022_studio_snapshot.cjs`, and
  `git diff --check` pass. Evidence:
  `docs/evidence/da32/da32-022-studio-snapshot-browser-gate.json` plus the
  desktop, mobile, and fallback screenshots.

Claim ceiling: named browser snapshot persistence, revision/payload readback,
reload survival, backend diagnostics, and no-IndexedDB fallback behavior.
Source-write intent replay in a live editor, quota and eviction recovery,
large binary source blobs, physical browser coverage, release authority, and
full MUGEN/IKEMEN authoring parity remain open.

### DA32-023 browser gate - ef2bf99c (2026-07-28)

- `pnpm qa:browser:da32-023-source-intent` passed against clean subject
  `ef2bf99c` at desktop `1440x900` and mobile `390x844`; unexpected console
  errors: zero.
- The gate seeds a pending `StudioSourceWriteIntent/v1` record in the real
  `mugen-web-sandbox-studio` IndexedDB database, loads the Studio project, and
  checks the bridge plus the visible source-write recovery surface.
- The recovery action loads the exact preimage text into the source editor,
  keeps the intent pending, preserves the source package as unlinked, and does
  not create a persistent file-system handle. Both viewports pass overflow and
  console checks.
- `pnpm qa:smoke` also passed with zero failures during the implementation
  cut. Its source-folder write/reimport assertions now check the bridge intent
  and the durable intent record after a committed write.
- Implementation: `96a918b0`; smoke checkpoint: `72a19141`. Evidence:
  `docs/evidence/da32/da32-023-source-write-intent-browser-gate.json` plus the
  desktop and mobile captures.

Claim ceiling: named IndexedDB pending-intent recovery, exact source preimage
loading, pending-state retention, and no-handle-write behavior at the recorded
route and viewports. Automatic permission repair, handle-backed write after
recovery, quota and eviction recovery, multi-file transactions, binary source
blobs, physical browser coverage, release authority, and full MUGEN/IKEMEN
authoring parity remain open.

### DA32-024 browser gate - 0c39d9e9 (2026-07-28)

- `pnpm qa:browser:da32-024-source-intent-write` passed against clean subject
  `0c39d9e9` at desktop `1440x900` and mobile `390x844`; unexpected console
  errors: zero.
- The recovery panel now offers an explicit native folder relink action. The
  selected folder is read into the active VFS, the exact pending preimage is
  loaded as a dirty Studio draft when the source differs, and Save & Reimport
  is the only path that requests write permission and writes the file.
- The bridge keeps read permission and `readwrite` permission as separate
  fields. Both are `granted` after the recovered write, the folder transaction
  reports `canWrite: true`, the imported text matches the draft, and the
  original pending intent settles as committed with restored recovery.
- The global `pnpm qa:smoke` run passed with zero failures at checkpoint
  `bd9680fb`; its folder-handle assertion now checks the separate granted write
  state.
- Implementation: `42bf475c`; clean evidence pin: `ae16132a`. Evidence:
  `docs/evidence/da32/da32-024-source-intent-write-recovery-browser-gate.json`
  plus the desktop and mobile captures.

Claim ceiling: named Studio folder recovery route, simulated native picker,
exact preimage replay, dirty-state admission, separate permission reporting,
explicit write/reimport, intent settlement, exact recovered bytes, and the
recorded desktop/mobile checks. Physical permission prompts, browser variance,
durable handle restart, crash, quota/eviction, multi-file atomic recovery, ZIP
rewrite, binary blobs, release authority, and full MUGEN/IKEMEN authoring parity
remain open.

### DA32-025 browser gate - a258bea7 (2026-07-28)

- `pnpm qa:browser:da32-025-source-write-phase` passed against clean subject
  `4e0d399c` at desktop `1440x900` and mobile `390x844`; unexpected console
  errors: zero.
- The gate seeds a real `StudioSourceWriteIntent/v1` record at phase
  `write-closed`, reloads the Studio route, reads the phase and write byte
  length from IndexedDB, and checks the bridge plus the visible recovery
  surface.
- `Load preimage` restores the exact persisted bytes while the intent remains
  pending. The gate records no source-handle write and no horizontal overflow
  in either viewport.
- Focused verification passed 40 tests, `pnpm typecheck`, `pnpm build`, and
  `git diff --check`. The global `pnpm qa:smoke` run passed with zero failures
  at checkpoint `5c0d0c68`; its folder route also checks the settled phase,
  write byte length, observed fingerprint, and receipt id.
- Implementation: `4e0d399c`; clean evidence pin: `a258bea7`. Evidence:
  `docs/evidence/da32/da32-025-source-write-phase-recovery-browser-gate.json`
  plus the desktop and mobile captures.

Claim ceiling: named durable phase recovery route, exact preimage replay,
pending retention, no-handle-write replay behavior, and recorded desktop/mobile
checks. Physical crash injection, automatic receipt synthesis or retry, quota,
eviction, multi-file atomic recovery, ZIP rewrite, binary blobs, physical
permission prompts, release authority, and full MUGEN/IKEMEN authoring parity
remain open.

### DA32-026 browser gate - 5bc4cb90 (2026-07-28)

- `pnpm qa:browser:da32-026-source-write-receipt` passed against clean subject
  `f18adb2d` at desktop `1440x900` and mobile `390x844`; unexpected console
  errors: zero.
- The gate seeds a settled `StudioSourceWriteIntent/v1` with a validated
  `SourceWriteReceipt/v1` payload, reloads Studio, reads the payload directly
  from IndexedDB, and checks the bridge plus the visible recovery surface.
- Receipt id, committed status, and digest remain intact after reload. The
  route does not write a source handle and has no horizontal overflow in either
  viewport.
- Focused verification passed 20 tests, then the receipt integrity test passed
  5/5 in `StudioIndexedDbSnapshot.test.ts`; `pnpm typecheck`, gate syntax, and
  `git diff --check` passed. The global `pnpm qa:smoke` run passed with zero
  failures at checkpoint `c632ceba` and checks receipt fields in both the
  bridge and durable intent record.
- Implementation: `f18adb2d`; clean evidence pin: `5bc4cb90`. Evidence:
  `docs/evidence/da32/da32-026-source-write-receipt-recovery-browser-gate.json`
  plus the desktop and mobile captures.

Claim ceiling: named validated receipt persistence and rehydration, intact
digest/status, visible recovery evidence, no-handle-write readback, and the
recorded desktop/mobile checks. Physical crash injection, automatic receipt
synthesis or retry, quota, eviction, multi-file atomic recovery, ZIP rewrite,
binary blobs, physical permission prompts, release authority, and full
MUGEN/IKEMEN authoring parity remain open.

### DA32-027 browser gate - provisional subject `3027b948` (2026-07-28)

- `pnpm qa:browser:da32-027-source-write-observation` passed at desktop
  `1440x900` and mobile `390x844`; the current tree keeps the gate provisional
  because unrelated roadmap documentation remains dirty. Unexpected console
  errors: zero.
- The gate seeds a raw `write-closed` intent without an observation or receipt,
  reloads Studio, reads the durable record from IndexedDB, and checks the
  bridge plus the recovery DOM. Studio persists `needs-observation`.
- The explicit `Observe source` action runs without a linked handle in the
  negative path. It records `unavailable`, keeps the intent `write-closed`,
  creates no receipt, and leaves `Load preimage` available. The preimage bytes
  reload exactly, with no source-handle write and no horizontal overflow.
- Focused verification passed 11 tests, `pnpm typecheck`, `pnpm build`, gate
  syntax, and `git diff --check`. `pnpm qa:smoke` passed with zero failures in
  472.5 seconds. The smoke artifact has no `subjectSha`, so it remains a
  global observation rather than a formal HEAD pin.
- Implementation: `3027b948`. Research:
  `docs/research/2026-07-28-da32-027-source-write-observation.md`. Evidence:
  `docs/evidence/da32/da32-027-source-write-observation-browser-gate.json`.

Claim ceiling: durable observation state, explicit unavailable recovery,
pending retention, exact preimage replay, no-handle-write behavior, and the
recorded desktop/mobile checks. Granted-handle byte classification, physical
crash injection, receipt finalization, automatic retry, quota, eviction,
multi-file recovery, ZIP rewrite, binary blobs, physical permission prompts,
release authority, and full MUGEN/IKEMEN authoring parity remain open.

### DA32-028 browser gate - provisional subject `57600085` (2026-07-28)

- `pnpm qa:browser:da32-028-source-write-observation-positive` passed at
  desktop `1440x900` and mobile `390x844`; the current tree keeps the gate
  provisional because unrelated roadmap documentation remains dirty.
- The gate relinks the KFM fixture through a simulated folder picker, grants
  read permission, reads the actual `chars/kfm/kfm.cns` bytes, and records
  `matches-preimage` with SHA-256 digest and byte length in the bridge and
  IndexedDB record.
- The intent remains `write-closed` with no result and no receipt. The mock
  handle counts zero `createWritable` calls. All eleven steps pass in both
  viewports, with zero unexpected console errors and no horizontal overflow.
  The fixture keeps one visible `sound/kfm.mid` warning, outside the error
  claim.
- Gate evidence:
  `docs/evidence/da32/da32-028-source-write-observation-positive-browser-gate.json`.
  Implementation and gate: `57600085`; compact evidence follow-up:
  `ced7d734`. Research:
  `docs/research/2026-07-28-da32-028-source-write-observation-positive.md`.

Claim ceiling: positive readback of real fixture bytes, exact preimage match,
durable digest/length, pending retention, no writable stream, and the named
desktop/mobile checks. `matches-draft`, changed bytes, physical permissions,
crash injection, explicit receipt finalization, automatic retry, quota,
eviction, multi-file recovery, ZIP rewrite, binary blobs, release authority,
and full MUGEN/IKEMEN authoring parity remain open.

### DA32-030 browser gate - provisional subject `9a0a7d41` (2026-07-28)

- `pnpm qa:browser:da32-030-source-write-observation-finalize` passed at
  desktop `1440x900` and mobile `390x844`; the gate remains provisional because
  the shared tree still contains unrelated roadmap work.
- The gate starts with a real KFM source intent whose external file contains a
  modified draft. Studio records `matches-draft`, exposes `Accept observed
  source`, reads the file again, reimports the folder, and settles the original
  intent with a committed `observed-write-and-reimport` receipt.
- Both viewports pass all fourteen steps: committed source fingerprint, exact
  draft bytes, `recovery: observed`, zero writable-stream calls, zero
  `readwrite` permission requests, zero unexpected console errors, and no
  horizontal overflow. The fixture keeps one visible `sound/kfm.mid` warning,
  outside the error claim.
- Implementation: `bf719ef5`; browser gate and evidence: `9a0a7d41`.
  Evidence:
  `docs/evidence/da32/da32-030-source-write-observation-finalize-browser-gate.json`.

Claim ceiling: named KFM folder recovery route, positive draft observation,
explicit reimport, receipt settlement, observed recovery evidence, and the
recorded desktop/mobile checks. Physical crash injection at each external
write/IndexedDB boundary, automatic retry, abandon, quota, eviction,
multi-file recovery, ZIP rewrite, binary blobs, physical permission prompts,
release authority, and full MUGEN/IKEMEN authoring parity remain open.

### DA32-031 browser gate - provisional subject `3826f0ea` (2026-07-28)

- `pnpm qa:browser:da32-031-source-write-recovery-decisions` passed at desktop
  `1440x900` and mobile `390x844`; the gate remains provisional because the
  shared tree still contains unrelated roadmap work.
- The gate seeds a durable `write-closed` intent, confirms `Prepare retry`
  persists `recoveryDecision = retry`, `recoveryAttempt = 1`, and the exact
  preimage, then confirms `Abandon recovery` creates a rejected
  `recovery-abandoned` receipt and settles the intent as `aborted`.
- All eleven steps pass in both viewports: durable retry and abandon fields,
  receipt readback, not-linked handle state with no permissions, zero
  unexpected console errors, and no horizontal overflow.
- Implementation and browser gate/evidence subject: `3826f0ea`. Evidence:
  `docs/evidence/da32/da32-031-source-write-recovery-decisions-browser-gate.json`.

Claim ceiling: named browser retry preparation and abandon settlement for a
single write-closed intent. Physical stream/IndexedDB crash cuts, retry with a
real external write, physical prompts, quota, eviction, multi-file recovery,
ZIP rewrite, binary blobs, release authority, and full MUGEN/IKEMEN authoring
parity remain open.

### DA32-032 browser gate - provisional subject `c5d23a67` (2026-07-30)

- Tabler SVGs retain their 24px intrinsic size when a component has no
  icon-specific rule; desktop component rules still reduce them where needed.
- At widths up to 1160px, `Workflow / Details` exposes exactly one Studio pane
  at a time and both panes plus the console delegate vertical scrolling to the
  document. The inactive pane is removed from layout and keyboard focus.
- The gate passes at `390`, `619/620/621`, `899/900/901`, and `1160/1161` CSS
  pixels with bounded actions, framed visible regions, four keyboard focus
  samples per viewport, zero horizontal overflow, and zero unexpected errors.
- The result is provisional while unrelated roadmap work keeps the shared tree
  dirty. Implementation subject: `c5d23a67`. Evidence:
  `docs/evidence/da32/da32-032-studio-mobile-geometry-browser-gate.json`.

Claim ceiling: named Studio Build route, viewports, pane switch, control bounds,
scroll ownership, and framing only. Detail density, desktop Build hierarchy,
runtime touch-control safe zones, physical devices, screen readers, release
authority, and full Studio/MUGEN/IKEMEN parity remain open.

## Commands

```bash
pnpm qa:smoke
pnpm qa:browser:da32-021-storage
pnpm qa:browser:da32-022-snapshot
pnpm qa:browser:da32-023-source-intent
pnpm qa:browser:da32-024-source-intent-write
pnpm qa:browser:da32-025-source-write-phase
pnpm qa:browser:da32-026-source-write-receipt
pnpm qa:browser:da32-027-source-write-observation
pnpm qa:browser:da32-028-source-write-observation-positive
pnpm qa:browser:da32-030-source-write-observation-finalize
pnpm qa:browser:da32-031-source-write-recovery-decisions
pnpm qa:browser:da32-032-studio-mobile-geometry
pnpm materialize:da32-status
pnpm exec vitest run src/tests/Da32Program.test.ts
```

Evidence root: `docs/evidence/da32/`.

## Blocked claims

- Score movement
- `adjudicatedThrough = DA30-120` without consecutive clause review
- Public release
- Full Studio/authoring completion from classification alone
