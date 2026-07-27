# Authority Selector (current)

Last updated: 2026-07-27  
Checked control source: [`docs/evidence/control-source-v1.json`](evidence/control-source-v1.json)  
Projections: [`authority-selector-v1.json`](evidence/authority-selector-v1.json), [`roadmap-cursor-v1.json`](evidence/roadmap-cursor-v1.json)  
Schema: `mugen-web-sandbox/control-source/v1` → authority-selector + roadmap-cursor  
`closedThrough`: **DA30-025** · next head **DA30-026** (keyboard/gamepad/focus matrix)

## Audit hold (DA29)

The 2026-07-27 completion audit **rejects** the generated DA29-200 watermark.
DA29-001…200 artifacts remain **unadjudicated candidates**. A failed machine
snapshot is preserved at
[`docs/evidence/da30/authority-selector-da29-failed-watermark.json`](evidence/da30/authority-selector-da29-failed-watermark.json)
and must not be treated as current authority.

Current control source of truth is `control-source-v1.json`, projected by
`scripts/materialize_control_projections.cjs` (DA30-003/004). Scores stay held.

Audit: [`2026-07-27 DA29 completion audit`](research/2026-07-27-da29-completion-audit-and-da30-recovery.md)  
Plan: [`DA30 recovery roadmap`](DA30_RECOVERY_ROADMAP.md)

## Live cursors

| Cursor | SHA / pin | Claim ceiling |
| --- | --- | --- |
| current HEAD | `27b88f0a…` | tip at DA30-021 formal gate |
| formal | `27b88f0a…` DA30-021 measured full stack | typecheck/test/trace/build/boundaries/redirect all exit 0 |
| focal | `07ad9227` T406 | active StateDef/HitDef juggle under `ikemen-go` |
| global | `27b88f0a…` DA30-021 measured | full stack at same SHA only |
| visual | `1085badb` T342 | broad matrix parent; DA28 browser routes are bounded |
| product | `1085badb` T342 | local Studio product flows only |
| source normative | `05b7d98a` | pin identity; family provenance in epoch |
| source working | `4aa0ba38` | reviewed families only (juggle=`same`) |

Related:

- Control source: [`docs/evidence/control-source-v1.json`](evidence/control-source-v1.json)
- DA29 verdict ledger: [`docs/evidence/da30/da29-verdict-ledger-v1.json`](evidence/da30/da29-verdict-ledger-v1.json)
- Series registry (candidate): [`docs/evidence/da29/series-registry-v1.json`](evidence/da29/series-registry-v1.json)
- Master roadmap: [`docs/MASTER_REVIEW_ROADMAP.md`](MASTER_REVIEW_ROADMAP.md)

## Scores

Held: **65 / 36 / 20 / 10–12 / 6–8 / 25**

## Accepted ladder

DA26…DA28-30 historical · **DA30-001…025** consecutive accepted (control recovery,
semantic evidence, formal gate, Play + Studio/Inspect browser journeys). Additional
non-consecutive accepted IDs exist (combat modules, Studio pure gates, ADRs).  
**DA29-001…DA29-200 unadjudicated** (candidate only; pilot revalidation on 012/013/041/072).

## Next queue

Head: **DA30-026** (keyboard/gamepad/focus/mobile matrix). Remainder: DA30-027…120
open or partial. Only `accepted` advances consecutive watermark (DA30-006).
