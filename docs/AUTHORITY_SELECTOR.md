# Authority Selector (current)

Last updated: 2026-07-26  
Machine artifact: [`docs/evidence/authority-selector-v1.json`](evidence/authority-selector-v1.json)  
Schema: `mugen-web-sandbox/authority-selector/v1`  
`closedThrough`: **DA27-05** · next head **DA27-06** (global re-gate)

This page is the **single current** control selector for roadmap, issues 01–07,
and agent bootstrap. Historical sections in other docs may keep old cursors only
when labeled historical / previous / closed.

## Live cursors

| Cursor | SHA / pin | Claim ceiling |
| --- | --- | --- |
| formal | `7d9b15f8…` Entry 587 | DA26-08 formal closeout only |
| focal | `07ad9227` T406 | active StateDef/HitDef juggle under `ikemen-go` |
| global | `7d9b15f8…` | TypeScript / Vitest / traces / build / boundaries at gate SHA only |
| visual | `1085badb` T342 | historical visual pin; DA26-13 bounded capture is separate |
| product | `1085badb` T342 | local Studio product flows only |
| source normative | `05b7d98a` | pin identity; family provenance in epoch |
| source working | `4aa0ba38` | reviewed families only (juggle=`same`) |

Related artifacts:

- RoadmapCursor/v1: `docs/evidence/roadmap-cursor-v1.json`
- SourceAuthorityEpoch/v1: `docs/evidence/source-authority-epoch-v1.json`
- Global report: `docs/research/2026-07-26-global-checkpoint-after-t406.md`
- Browser gate: `docs/evidence/da26-13-browser/browser-gate-report-v1.json`
- DA26 drain: `docs/research/2026-07-26-da26-ladder-drain.md`
- DA27 wiring: `docs/research/2026-07-26-da27-product-wiring-batch.md`

## Scores

Unchanged (adjudicated hold): sandbox **65**, MUGEN-lite **36**, MUGEN MVP **20**,
full **10–12**, IKEMEN **6–8**, Studio **25**. Docs and control work do not move
scores.

## Closed ladder

- DA26-01…30 closed under claim ceilings
- DA27-01…05 product wiring batch closed (see research report)

## Next queue

1. **DA27-06** — global re-gate on current HEAD  
2. DA27-07 — Turns browser HUD journey  
3. DA27-08 — full `qa:smoke` attack/canvas matrix  
4. DA27-09 — Common.Fx audible + FightScreen browser depth  

## Anti-patterns (fail the reference auditor)

In **current** sections (not historical):

- Claiming a pre-T406 audit HEAD or pre-DA26-08 global gate as still live
- Next queue restarting already-closed DA26/DA27 IDs
- Rewriting formal/global cursors to a feature tip without a new global gate
- Score inflation without independent evidence

## Audit

```bash
pnpm materialize:authority-selector
pnpm audit:authority-references
```
