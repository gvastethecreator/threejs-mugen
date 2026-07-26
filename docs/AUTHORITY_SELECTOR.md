# Authority Selector (current)

Last updated: 2026-07-26  
Machine artifact: [`docs/evidence/authority-selector-v1.json`](evidence/authority-selector-v1.json)  
Schema: `mugen-web-sandbox/authority-selector/v1`  
`closedThrough`: **DA26-30** (studio/oracle/core batch; browser DA26-13 still open)

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

Closed (do not re-queue): DA26-01…12, **14**, **15**, **17**, **18**, **22**,
**23**, **24**, **25**, **26**, **27**, **28**, **29**, **30** (plus earlier
control). See [studio-oracle-core batch](research/2026-07-26-studio-oracle-core-batch.md)
and [runtime-control batch](research/2026-07-26-runtime-control-batch.md).

## Next queue

1. **DA26-13** — browser gate actual (desktop/tablet/mobile + console)
2. DA26-16 Turns journey browser
3. DA26-19 corpus v1.2
4. DA26-20 second character
5. DA26-21 score adjudication

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
```
