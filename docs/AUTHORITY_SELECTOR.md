# Authority Selector (current)

Last updated: 2026-07-27  
Checked control source: [`docs/evidence/control-source-v1.json`](evidence/control-source-v1.json)  
Projections: [`authority-selector-v1.json`](evidence/authority-selector-v1.json), [`roadmap-cursor-v1.json`](evidence/roadmap-cursor-v1.json)  
Schema: `mugen-web-sandbox/control-source/v1` → authority-selector + roadmap-cursor  
`closedThrough`: **DA28-30** · next head **DA30-001** (recovery queue DA30-001…010)

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
| current HEAD | `fd7a9b9a…` | audit target; formal/global and visual state unverified |
| formal | `a6e91520…` historical DA29-002 recorded stack | six recorded zero exits at that SHA; not current HEAD inheritance |
| focal | `07ad9227` T406 | active StateDef/HitDef juggle under `ikemen-go` |
| global | `a6e91520…` historical | no inheritance across later commits without re-gate |
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

DA26-01…30 · DA27-01…09 · **DA28-01…30** accepted at written ceilings.  
**DA29-001…DA29-200 unadjudicated** (candidate only).

## Next queue

Head: **DA30-001**. Remainder: DA30-002…010 control recovery, then DA30-011…020
semantic evidence. Only `accepted` closeout state advances a watermark
(DA30-006).
