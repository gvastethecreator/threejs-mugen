# Authority Selector (current)

Last updated: 2026-07-26  
Machine artifact: [`docs/evidence/authority-selector-v1.json`](evidence/authority-selector-v1.json)  
Schema: `mugen-web-sandbox/authority-selector/v1`  
`closedThrough`: **DA28-06** · next head **DA28-07** (plural combat oracle live)

This page is the **single current** control selector for roadmap, issues 01–07,
and agent bootstrap. Historical sections in other docs may keep old cursors only
when labeled historical / previous / closed.

## Live cursors

| Cursor | SHA / pin | Claim ceiling |
| --- | --- | --- |
| formal | `32466c6e…` Entry 604 | DA28-02 formal/global closeout only |
| focal | `07ad9227` T406 | active StateDef/HitDef juggle under `ikemen-go` |
| global | `32466c6e…` | TypeScript / Vitest **270·2850** / traces **663** / build / boundaries |
| visual | `1085badb` T342 | broad matrix parent; DA28-03 subcursors are bounded |
| product | `1085badb` T342 | local Studio product flows only |
| source normative | `05b7d98a` | pin identity; family provenance in epoch |
| source working | `4aa0ba38` | reviewed families only (juggle=`same`) |

Related:

- Global gate: [`docs/research/2026-07-26-global-checkpoint-da28-02.md`](research/2026-07-26-global-checkpoint-da28-02.md)
- P0 evidence: [`docs/research/2026-07-26-da28-p0-browser-corpus-scores.md`](research/2026-07-26-da28-p0-browser-corpus-scores.md)
- Live projectiles: [`docs/research/2026-07-26-da28-06-live-projectile-schedule.md`](research/2026-07-26-da28-06-live-projectile-schedule.md)
- Browser subcursors: [`docs/evidence/browser-subcursors-da28-03-v1.json`](evidence/browser-subcursors-da28-03-v1.json)
- Corpus v1.2: [`docs/evidence/compatibility-corpus-v1.2.json`](evidence/compatibility-corpus-v1.2.json)
- Score adjudication: [`docs/evidence/score-adjudication-v1.json`](evidence/score-adjudication-v1.json)

## Scores

Held: **65 / 36 / 20 / 10–12 / 6–8 / 25** (DA28-05 adjudication `movement=none`)

## Closed ladder

DA26-01…30 · DA27-01…09 · DA28-01…**06**

## Next queue (DA28 — 24 remaining)

**P1 live determinism/input:** DA28-07…10  
**P2 MUGEN-lite execution:** DA28-11…17  
**P3 MUGEN breadth:** DA28-18…20  
**P4 Studio/product:** DA28-21…25  
**P5 assets/scanner/source/IKEMEN/boundaries:** DA28-26…30  

Machine next head: **DA28-07** (full queue listed in `authority-selector-v1.json`).

## Anti-patterns

- Claiming DA28 product closes from projectile schedule alone
- Score movement without executed denominators
- Native Nova/Mira rows raising imported-package coverage
- Replacing T342 visual/product matrix from DA28-03 subcursors alone
- formal/global tip rewrite without measured gate

## Audit

```bash
pnpm materialize:authority-selector
pnpm audit:authority-references
```
