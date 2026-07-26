# Authority Selector (current)

Last updated: 2026-07-26  
Machine artifact: [`docs/evidence/authority-selector-v1.json`](evidence/authority-selector-v1.json)  
Schema: `mugen-web-sandbox/authority-selector/v1`  
`closedThrough`: **DA27-08** · next head **DA27-09** (Common.Fx / FightScreen browser)

This page is the **single current** control selector for roadmap, issues 01–07,
and agent bootstrap. Historical sections in other docs may keep old cursors only
when labeled historical / previous / closed.

## Live cursors

| Cursor | SHA / pin | Claim ceiling |
| --- | --- | --- |
| formal | `b7d23801…` Entry 598 | DA27-06 formal/global closeout only |
| focal | `07ad9227` T406 | active StateDef/HitDef juggle under `ikemen-go` |
| global | `b7d23801…` | TypeScript / Vitest **268·2845** / traces **663** / build / boundaries |
| visual | `1085badb` T342 | historical; DA26-13 / DA27-07 / DA27-08 captures are separate |
| product | `1085badb` T342 | local Studio product flows only |
| source normative | `05b7d98a` | pin identity; family provenance in epoch |
| source working | `4aa0ba38` | reviewed families only (juggle=`same`) |

Related:

- `docs/research/2026-07-26-global-checkpoint-da27-06.md`
- `docs/research/2026-07-26-turns-browser-hud-da27-07.md`
- `docs/research/2026-07-26-qa-smoke-da27-08.md`
- `docs/evidence/da27-08-qa-smoke/`

## Scores

Unchanged: **65 / 36 / 20 / 10–12 / 6–8 / 25**

## Closed ladder

DA26-01…30 · DA27-01…08

## Next queue

1. **DA27-09** — Common.Fx audible + FightScreen browser depth  

## Audit

```bash
pnpm materialize:authority-selector
pnpm audit:authority-references
pnpm materialize:studio:gate-evidence
pnpm qa:smoke
```
