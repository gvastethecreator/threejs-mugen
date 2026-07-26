# Authority Selector (current)

Last updated: 2026-07-26  
Machine artifact: [`docs/evidence/authority-selector-v1.json`](evidence/authority-selector-v1.json)  
Schema: `mugen-web-sandbox/authority-selector/v1`  
`closedThrough`: **DA27-06** · next head **DA27-07** (Turns browser HUD)

This page is the **single current** control selector for roadmap, issues 01–07,
and agent bootstrap. Historical sections in other docs may keep old cursors only
when labeled historical / previous / closed.

## Live cursors

| Cursor | SHA / pin | Claim ceiling |
| --- | --- | --- |
| formal | `b7d23801…` Entry 598 | DA27-06 formal/global closeout only |
| focal | `07ad9227` T406 | active StateDef/HitDef juggle under `ikemen-go` |
| global | `b7d23801…` | TypeScript / Vitest **268·2845** / traces **663** / build / boundaries |
| visual | `1085badb` T342 | historical visual pin; DA26-13 bounded capture is separate |
| product | `1085badb` T342 | local Studio product flows only |
| source normative | `05b7d98a` | pin identity; family provenance in epoch |
| source working | `4aa0ba38` | reviewed families only (juggle=`same`) |

Related artifacts:

- RoadmapCursor/v1: `docs/evidence/roadmap-cursor-v1.json`
- SourceAuthorityEpoch/v1: `docs/evidence/source-authority-epoch-v1.json`
- Global report: `docs/research/2026-07-26-global-checkpoint-da27-06.md`
- Browser gate: `docs/evidence/da26-13-browser/browser-gate-report-v1.json`
- DA27 wiring: `docs/research/2026-07-26-da27-product-wiring-batch.md`

## Scores

Unchanged (adjudicated hold): sandbox **65**, MUGEN-lite **36**, MUGEN MVP **20**,
full **10–12**, IKEMEN **6–8**, Studio **25**. Docs and control work do not move
scores.

## Closed ladder

- DA26-01…30 claim-bounded
- DA27-01…06 (product wiring + global re-gate)

## Next queue

1. **DA27-07** — Turns browser HUD journey  
2. DA27-08 — full `qa:smoke` attack/canvas matrix  
3. DA27-09 — Common.Fx audible + FightScreen browser depth  

## Anti-patterns (fail the reference auditor)

In **current** sections (not historical):

- Claiming pre-DA27-06 global numbers (242/2768 or `7d9b15f8`) as still live
- Next queue restarting already-closed DA26/DA27 IDs
- Rewriting formal/global to a feature tip without a measured global gate
- Score inflation without independent evidence

## Audit

```bash
pnpm materialize:authority-selector
pnpm materialize:roadmap-cursor
pnpm audit:authority-references
```
