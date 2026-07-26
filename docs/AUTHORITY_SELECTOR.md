# Authority Selector (current)

Last updated: 2026-07-26  
Machine artifact: [`docs/evidence/authority-selector-v1.json`](evidence/authority-selector-v1.json)  
Schema: `mugen-web-sandbox/authority-selector/v1`  
`closedThrough`: **DA26-30** (DA26-13 browser gate closed-bounded; next Turns browser)

This page is the **single current** control selector for roadmap, issues 01–07,
and agent bootstrap. Historical sections in other docs may keep old cursors only
when labeled historical / previous / closed.

## Live cursors

| Cursor | SHA / pin | Claim ceiling |
| --- | --- | --- |
| formal | `7d9b15f8…` Entry 587 | DA26-08 formal closeout only |
| focal | `07ad9227` T406 | active StateDef/HitDef juggle under `ikemen-go` |
| global | `7d9b15f8…` | TypeScript / Vitest 242·2768 / traces 663 / build / boundaries |
| visual | `1085badb` T342 | historical visual pin; DA26-13 bounded capture is separate |
| product | `1085badb` T342 | local Studio product flows only |
| source normative | `05b7d98a` | pin identity; family provenance in epoch |
| source working | `4aa0ba38` | reviewed families only (juggle=`same`) |

Related artifacts:

- RoadmapCursor/v1: `docs/evidence/roadmap-cursor-v1.json` (formal/global pin the same gate)
- SourceAuthorityEpoch/v1: `docs/evidence/source-authority-epoch-v1.json`
- Global report: `docs/research/2026-07-26-global-checkpoint-after-t406.md`
- Browser gate: `docs/evidence/da26-13-browser/browser-gate-report-v1.json`

## Scores

Unchanged: sandbox **65**, MUGEN-lite **36**, MUGEN MVP **20**, full **10–12**,
IKEMEN **6–8**, Studio **25**. Docs and control work do not move scores.

## Closed ladder

Closed (do not re-queue): DA26-01…15, **17**, **18**, **22**–**30** (plus earlier
control). Open product remainders: **16**, **19**, **20**, **21**.

## Next queue

1. **DA26-16** — Turns journey browser  
2. DA26-19 corpus v1.2  
3. DA26-20 second character  
4. DA26-21 score adjudication  

FightScreen fixture: `public/data/sandbox-fightscreen/` + ZIP (CC0).

## Anti-patterns (fail the reference auditor)

In **current** sections (not historical):

- Claiming a pre-T406 audit HEAD or pre-DA26-08 global gate as still live
- Treating reserved incomplete juggle write-sets as open current P0
- Next queue restarting already-closed DA26 IDs
- Rewriting formal/global cursors to a feature tip (RoadmapCursor materializer forbids this)

## Audit

```bash
pnpm materialize:authority-selector
pnpm audit:authority-references
node scripts/qa_browser_gate_da26_13.cjs
```
