# DA32 next program roadmap

Last updated: 2026-07-27

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
4. **DA32-021…028** — authoring per-view browser capture, live snapshot/replay binding.
5. **DA32-029…032** — a11y SR/canvas alternative, local release blockers refresh.

## Phase 0 — Smoke ownership (current)

| ID | Scope | Acceptance | Ceiling |
| --- | --- | --- | --- |
| DA32-001 | Materialize structured `qa:smoke` ownership ledger | Lane map + failure inventory + runtime samples at a run; empty failures only if smoke green | ownership inventory; not score movement |
| DA32-002 | Harden native hit-spark drive (play + approach + multi-key) | `driveRuntimeHitSpark` requires playing; KeyZ/A/X retry | runtime-native spark lane only |
| DA32-003 | Classify open Studio lanes | workbench/build/modules/evidence/debug ownership rows | classification only |
| DA32-004 | Classify mugen-lite visual failures | desktop/mobile journey ownership | classification only |

## Phase 1 — Device lab

| ID | Scope | Acceptance | Ceiling |
| --- | --- | --- | --- |
| DA32-009 | Publish gamepad device-lab protocol | Connect/unplug/remap/two-seat checklist + simulated baseline | protocol + sim; hardware optional |
| DA32-010 | Virtual Gamepad API probe where supported | Browser probe records index change / disconnect path | named browser only |

## Phase 2 — Clause adjudication samples

| ID | Scope | Acceptance | Ceiling |
| --- | --- | --- | --- |
| DA32-013 | Re-adjudicate DA30-021…030 sample rows | Ledger rows with evidence refs and pass/partial/fail | sample only; no bulk 120 claim |
| DA32-014 | Advance `adjudicatedThrough` only on consecutive passes | If 021 fails, watermark stays 020 | consecutive watermark rule |

## Phase 3 — A11y

| ID | Scope | Acceptance | Ceiling |
| --- | --- | --- | --- |
| DA32-029 | Canvas alternative / SR baseline inventory | Required roles, live regions, focus, reduced motion, open SR paths listed | inventory; not WCAG certification |

## Commands

```bash
pnpm qa:smoke
pnpm materialize:da32-status
pnpm exec vitest run src/tests/Da32Program.test.ts
```

Evidence root: `docs/evidence/da32/`.

## Blocked claims

- Score movement
- `adjudicatedThrough = DA30-120` without consecutive clause review
- Public release
- Full Studio/authoring completion from classification alone
