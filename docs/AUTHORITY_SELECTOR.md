# Authority Selector (current)

Last updated: 2026-07-26  
Machine artifact: [`docs/evidence/authority-selector-v1.json`](evidence/authority-selector-v1.json)  
Schema: `mugen-web-sandbox/authority-selector/v1`  
`closedThrough`: **DA26-11**

This page is the **single current** control selector for roadmap, issues 01–07,
and agent bootstrap. Historical sections in other docs may keep old cursors only
when labeled historical / previous / closed.

## Live cursors

| Cursor | SHA / pin | Claim ceiling |
| --- | --- | --- |
| formal | `7d9b15f8…` Entry 587 | DA26-08 formal closeout only |
| focal | `07ad9227` T406 | active StateDef/HitDef juggle under `ikemen-go` |
| global | `7d9b15f8…` | TypeScript / Vitest 242·2768 / traces 663 / build / boundaries |
| visual | `1085badb` T342 | browser visual gate only |
| product | `1085badb` T342 | local Studio product flows only |
| source normative | `05b7d98a` | pin identity; family provenance in epoch |
| source working | `4aa0ba38` | reviewed families only (juggle=`same`) |

Related artifacts:

- RoadmapCursor/v1: `docs/evidence/roadmap-cursor-v1.json` (formal/global pin the same gate)
- SourceAuthorityEpoch/v1: `docs/evidence/source-authority-epoch-v1.json`
- Global report: `docs/research/2026-07-26-global-checkpoint-after-t406.md`

## Scores

Unchanged: sandbox **65**, MUGEN-lite **36**, MUGEN MVP **20**, full **10–12**,
IKEMEN **6–8**, Studio **25**. Docs and control work do not move scores.

## Closed ladder

**DA26-01 … DA26-11** are closed. Do not put them back in the live next queue.

## Next queue

1. **DA26-12** — fixture FightScreen propio/CC0  
2. DA26-13 browser gate actual  
3. DA26-14 gamepad / MatchInputPolicySnapshot  
4. Then DA26-15+ per [post-T405 audit](research/2026-07-26-daily-roadmap-architecture-audit-post-t405.md)

## Anti-patterns (fail the reference auditor)

In **current** sections (not historical):

- Claiming a pre-T406 audit HEAD or pre-DA26-08 global gate as still live
- Treating reserved incomplete juggle write-sets as open current P0
- Next queue starting inside the closed DA26-01…11 band
- Rewriting formal/global cursors to a feature tip (RoadmapCursor materializer forbids this)

## Audit

```bash
pnpm materialize:authority-selector
pnpm audit:authority-references
```
