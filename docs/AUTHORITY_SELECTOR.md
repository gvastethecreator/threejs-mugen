# Authority Selector (current)

Last updated: 2026-07-26  
Machine artifact: [`docs/evidence/authority-selector-v1.json`](evidence/authority-selector-v1.json)  
Schema: `mugen-web-sandbox/authority-selector/v1`  
`closedThrough`: **DA28-01** · next head **DA28-02** (global re-gate)

This page is the **single current** control selector for roadmap, issues 01–07,
and agent bootstrap. Historical sections in other docs may keep old cursors only
when labeled historical / previous / closed.

## Live cursors

| Cursor | SHA / pin | Claim ceiling |
| --- | --- | --- |
| formal | `b7d23801…` Entry 598 | DA27-06 formal/global closeout only |
| focal | `07ad9227` T406 | active StateDef/HitDef juggle under `ikemen-go` |
| global | `b7d23801…` | TypeScript / Vitest **268·2845** / traces **663** / build / boundaries |
| visual | `1085badb` T342 | historical; DA27 captures are separate bounded routes |
| product | `1085badb` T342 | local Studio product flows only |
| source normative | `05b7d98a` | pin identity; family provenance in epoch |
| source working | `4aa0ba38` | reviewed families only (juggle=`same`) |

Related:

- DA28 audit: [`docs/research/2026-07-26-daily-roadmap-architecture-audit-post-da27-09.md`](research/2026-07-26-daily-roadmap-architecture-audit-post-da27-09.md)
- Global gate: `docs/research/2026-07-26-global-checkpoint-da27-06.md`

## Scores

Unchanged: **65 / 36 / 20 / 10–12 / 6–8 / 25**

## Closed ladder

DA26-01…30 · DA27-01…09 · **DA28-01** (control adoption only)

## Next queue (DA28 — 29 remaining)

**P0 control/evidence:** DA28-02…05  
**P1 live determinism/input:** DA28-06…10  
**P2 MUGEN-lite execution:** DA28-11…17  
**P3 MUGEN breadth:** DA28-18…20  
**P4 Studio/product:** DA28-21…25  
**P5 assets/scanner/source/IKEMEN/boundaries:** DA28-26…30  

Machine next head: **DA28-02** (full queue listed in `authority-selector-v1.json`).

## Anti-patterns

- Claiming DA28 product/runtime closes from DA28-01 alone
- Score movement without executed denominators
- Projecting T342/T383 as current global/product without label
- formal/global tip rewrite without measured gate

## Audit

```bash
pnpm materialize:authority-selector
pnpm audit:authority-references
```
