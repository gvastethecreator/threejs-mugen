# 08 - DA29 evidence recovery and DA30 roadmap

Status: closed-bounded
Labels: roadmap, evidence, control, closed-bounded

## Objective

### Current authority

Machine watermark **DA30-120** with empty `nextQueue`. Authority:
`docs/AUTHORITY_SELECTOR.md` and `docs/evidence/authority-selector-v1.json`.
Formal/global pin `ee23122f` (DA30-021 required matrix). DA30-021/024/025
clause repairs and manifests are on disk. Scores held. DA29-001…200 remain
unadjudicated candidates.

### Historical post-DA30-025 audit override

Generated control once recorded DA30-025 and next DA30-026. The 2026-07-27
acceptance audit disputed written completion for DA30-021/024/025. Those
clauses were later repaired. See
`docs/research/2026-07-27-daily-roadmap-architecture-audit-post-da30-025.md`
and `docs/evidence/da30/da30-021-024-025-clause-repair-v1.json`.

Replace the rejected DA29 completion watermark with clause-level verdicts and
one coherent current-control source, then adopt the DA30 recovery queue without
discarding useful bounded artifacts.

## Current authority (detail)

- Closed through: DA30-120.
- Formal/global: `ee23122f` DA30-021 required matrix.
- Focal T406 `07ad9227`, visual T342 `1085badb`, source pins 05b/4aa remain
  separate.
- Scores stay `65 / 36 / 20 / 10-12 / 6-8 / 25`.
- Next: smoke/authority optional green, Studio save reopen recovery, independent
  score adjudication only.

## First executable sequence

1. DA30-001 publish the audit hold across current views.
2. DA30-002 build the 200-row DA29 verdict ledger.
3. DA30-003 choose one current-control source.
4. DA30-004 generate selector and cursor from it.
5. DA30-005 audit all current references with negative fixtures.
6. DA30-006 define closeout state transitions.
7. DA30-007 enforce revision and freshness.
8. DA30-008 adjudicate historical DA29 control gates.
9. DA30-009 compact current roadmap ownership.
10. DA30-010 gate and adopt the recovered control state.

Then execute DA30-011…020 semantic acceptance before a new broad runtime,
product, visual, score, SDK, or release claim.

## Acceptance

- Selector and cursor agree from one checked input.
- All DA29 IDs have explicit pass/fail/unknown clause verdicts.
- Candidate artifacts keep narrow facts and failed claims stay blocked.
- Historical rows remain labeled and current views contain no stale DA29
  completion or empty-queue claim.
- Scores do not move.

## Evidence

- `docs/research/2026-07-27-da29-completion-audit-and-da30-recovery.md`
- `docs/DA30_RECOVERY_ROADMAP.md`
- `docs/AUTHORITY_SELECTOR.md`
- `docs/evidence/authority-selector-v1.json`
- `docs/evidence/roadmap-cursor-v1.json`
- `docs/evidence/da29/`

## Claim ceiling

Allowed: control recovery, clause verdicts, bounded candidate reuse, and DA30
queue adoption.

Blocked: DA29 completion, current gate inheritance, score movement, parity,
product/SDK readiness, CI, deployment, and release authority.
