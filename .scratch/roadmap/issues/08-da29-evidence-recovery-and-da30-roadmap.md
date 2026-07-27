# 08 - DA29 evidence recovery and DA30 roadmap

Status: ready-for-agent
Labels: roadmap, evidence, control, ready-for-agent

## Objective

Replace the rejected DA29 completion watermark with clause-level verdicts and
one coherent current-control source, then adopt the DA30 recovery queue without
discarding useful bounded artifacts.

## Current authority

- Audit HEAD: `fd7a9b9a16b2acd116df1e6dba69f0d451cc37ed`.
- Accepted historical ladder ends at DA28-30 at written ceilings.
- DA29-001…200 are unadjudicated candidate artifacts.
- Formal/global `a6e91520`, focal T406 `07ad9227`, visual/product T342
  `1085badb`, and source pins 05b/4aa remain separate.
- Current HEAD formal/global and visual health are unverified.
- Scores stay `65 / 36 / 20 / 10-12 / 6-8 / 25`.
- Proposed first batch: DA30-001…010.

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
