# Authority Selector (current)

## 2026-07-27 post-DA30-120 audit hold (DA31-001)

Human authority: [post-DA30-120 audit](research/2026-07-27-daily-roadmap-architecture-audit-post-da30-120.md)
and [DA31 roadmap](DA31_EVIDENCE_ADOPTION_ROADMAP.md).

| Cursor | Value | Claim ceiling |
| --- | --- | --- |
| Audit HEAD | `67481fbc` | docs-only audit; no whole-HEAD formal at tip |
| `recordedThrough` | **DA30-120** | machine series rows exist |
| `adjudicatedThrough` | **DA30-020** | last safe consecutive written-clause ceiling pending DA31-007 |
| `reviewedThrough` | **DA30-120** | audit sampling only |
| formal/global | `f5f2315e` DA31-008 | required matrix + authority audit; smoke opt-in |
| focal | T406 `07ad9227` | named juggle slice |
| visual/product parent | T342 `1085badb` | historical broad matrix |
| source | 05b / 4aa | family-scoped |
| Scores | held 65/36/20/10-12/6-8/25 | no movement |

**Next:** **DA31-002** freeze original DA30 task contracts.  
Machine `closedThrough=DA30-120` remains the generated record. Do not treat it
as full written-clause adjudication.

## Historical 2026-07-27 clause repair — DA30-021 / 024 / 025

Prior post-025 audit disputed written clauses for formal, Play, and
Studio/Inspect gates. Repair evidence is on formal head `ee23122f`:

- **DA30-021**: required six-command matrix green; raw stdout/stderr files +
  digests; tool versions; exact test counts (3128 passed); optional smoke and
  authority audit recorded without formal pin
- **DA30-024**: `qaProbe` movement, damage, tick advance, and reset hook on
  nova/mira/rooftop desktop+mobile
- **DA30-025**: Studio `save-project-local`, Tab focus path, Inspect package
  signals, mobile geometry measurement

Manifests: `docs/evidence/da30/manifests/da30-021|024|025.manifest.json`  
Repair report: [`da30-021-024-025-clause-repair-v1.json`](evidence/da30/da30-021-024-025-clause-repair-v1.json)  
Scores remain **held**. Focal T406, visual T342, source 05b/4aa stay separate.

Last updated: 2026-07-27  
Checked control source: [`docs/evidence/control-source-v1.json`](evidence/control-source-v1.json)  
Projections: [`authority-selector-v1.json`](evidence/authority-selector-v1.json), [`roadmap-cursor-v1.json`](evidence/roadmap-cursor-v1.json)  
Schema: `mugen-web-sandbox/control-source/v1` → authority-selector + roadmap-cursor  
`closedThrough` / machine record: **DA30-120** · human adjudicated ceiling: **DA30-020**

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
| current HEAD | `ee23122f…` | tip at DA30-021 formal clause repair |
| formal | `ee23122f…` DA30-021 required matrix | raw logs + digests + exact counts; optional smoke not required |
| focal | `07ad9227` T406 | active StateDef/HitDef juggle under `ikemen-go` |
| global | `ee23122f…` DA30-021 measured | same SHA as formal required matrix |
| visual | `1085badb` T342 | broad matrix parent; DA28 browser routes are bounded |
| product | `ee23122f…` Play/Studio repair | semantic Play + Studio save/focus/geometry only |
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

DA26…DA28-30 historical · **DA30-001…120** consecutive accepted (machine watermark).
Recovery modules, browser gates 024–029/052, and pure adjudication cuts close the
series. Scores remain **held**. DA30-120 releases **local-only** authority — not
public release.  
**DA29-001…DA29-200 unadjudicated** (candidate only; pilot revalidation on 012/013/041/072).

## Next queue

Empty under consecutive watermark **DA30-120**. Next program is post-DA30 depth:
authority audit is green for DA30; Studio single-tab save recovery gate green;
`pnpm qa:smoke` remains open (headless hit-spark / mugen-lite crop / multi-tab
conflict). Independent score adjudication only — not automatic score change.
Only `accepted` advances consecutive watermark (DA30-006).
See `docs/evidence/da30/da30-optional-matrix-status-v1.json`.
