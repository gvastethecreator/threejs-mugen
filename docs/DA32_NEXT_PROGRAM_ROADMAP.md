# DA32 next program roadmap

Last updated: 2026-07-28

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
4. **DA32-021…028** — project authority, authoring per-view browser capture, live snapshot/replay binding.
5. **DA32-029…032** — a11y SR/canvas alternative, local release blockers refresh.

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

## Phase 3 — A11y

| ID | Scope | Acceptance | Ceiling |
| --- | --- | --- | --- |
| DA32-029 | Canvas alternative / SR baseline inventory | Canvas summary and focus contract recorded; SR journey, contrast, and landmark gaps listed | partial implementation; not WCAG certification |

## Phase 4 — Studio project authority

| ID | Scope | Acceptance | Ceiling |
| --- | --- | --- | --- |
| DA32-021 | Move the Studio project index to an IndexedDB authority | Versioned project object store, local cache mirror, reload/reopen, optimistic revision conflict, desktop/mobile browser gate | named browser route and viewports; quota, eviction, source blobs, and full authoring remain open |

### DA32-021 browser gate - 4e31e4e9 (2026-07-28)

- `pnpm qa:browser:da32-021-storage` passed against clean subject `4e31e4e9`
  at desktop `1440x900` and mobile `390x844`; unexpected console/page errors:
  zero.
- The gate clears the prior project state, saves a real Studio manifest into
  the `mugen-web-sandbox-projects` IndexedDB database, reads the stored record
  directly, and checks the v1 localStorage mirror.
- A reload restores the recent project row. Opening that row restores the
  saved name and revision. A second same-origin page writes revision 2 while
  the first page keeps its local edit dirty and exposes the conflict.
- Implementation commits: `d2136e66` for the store/App path,
  `71a9abff` and `a398bd94` for the browser gate. Evidence:
  `docs/evidence/da32/da32-021-studio-storage-browser-gate.json` and the
  matching desktop/mobile screenshots.

Claim ceiling: browser IndexedDB authority, cache mirroring, reopen, and the
named desktop conflict route. Storage quota and eviction recovery, file-system
source blobs, physical device coverage, all browser implementations, and full
MUGEN/IKEMEN authoring parity remain open.

## Commands

```bash
pnpm qa:smoke
pnpm qa:browser:da32-021-storage
pnpm materialize:da32-status
pnpm exec vitest run src/tests/Da32Program.test.ts
```

Evidence root: `docs/evidence/da32/`.

## Blocked claims

- Score movement
- `adjudicatedThrough = DA30-120` without consecutive clause review
- Public release
- Full Studio/authoring completion from classification alone
