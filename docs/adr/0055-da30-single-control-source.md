# ADR 0055 — One control source for queue, scores, and cursors

- **Status:** Accepted
- **Date:** 2026-07-27
- **ID:** DA30-003
- **Depends on:** DA30-001 (audit hold published)

## Context

DA29-001 required the authority selector and roadmap cursor to agree. After the
generated DA29 drain, `docs/evidence/authority-selector-v1.json` claimed
`closedThrough: DA29-200` while `docs/evidence/roadmap-cursor-v1.json` still
pinned DA27 formal/global. Two materializers with optional cross-tests allowed
publication of disagreeing current views. The 2026-07-27 completion audit
rejected the DA29-200 watermark for that reason among others.

## Decision drivers

- One current truth for queue head, held scores, and independent pins
- Edit flow that cannot silently drift between projections
- Clear failure rule when outputs disagree or inputs are dirty
- History: keep append-only audit trail without rewriting past gates
- Migration from split DA29/DA27 artifacts without deleting candidate evidence

## Alternatives

### A — One checked input document (chosen)

A single versioned control document (e.g. `docs/evidence/control-source-v1.json`)
owns:

- `closedThrough` / `nextQueue` (or DA30 recovery queue while DA29 is held)
- `scores` (held unless adjudication authorizes movement)
- independent cursors: formal, global, focal, visual, product, source*

Generators project `AUTHORITY_SELECTOR.md`, `authority-selector-v1.json`, and
`roadmap-cursor-v1.json` from that input only. Publication fails if any
projection differs on shared fields or if a required generator was skipped.

**Pros:** single edit surface; byte-equality of shared fields is testable;
matches audit D2.  
**Cons:** must design schema carefully; migrations need tooling.

### B — Event ledger plus projection

Append-only events (adopt cut, close cut, re-gate formal, hold scores) project
current views. Rebuilding projections is deterministic from the log.

**Pros:** strong history and rollback.  
**Cons:** more moving parts before DA30-010; higher cost for wave 0 recovery.

### C — Paired generators with mandatory cross-tests

Keep separate selector and cursor materializers; CI fails if they disagree.

**Pros:** least schema change.  
**Cons:** already failed in practice when tests were skipped or validated
fixtures instead of live files; does not remove dual ownership.

## Decision

**Choose A — one checked input document**, with generators as pure projections.

### Ownership

| Concern | Owner |
| --- | --- |
| Queue, scores, pin SHAs, claim ceilings | `control-source-v1` (checked in) |
| Human-readable selector | generated `docs/AUTHORITY_SELECTOR.md` |
| Machine selector | generated `docs/evidence/authority-selector-v1.json` |
| Roadmap cursor | generated `docs/evidence/roadmap-cursor-v1.json` |
| Historical reports | append-only under `docs/research/` and backlog entries |

### Edit flow

1. Edit `control-source-v1` (or a future CLI that mutates it with validation).
2. Run one materialize command that writes all projections.
3. Run reference audit (DA30-005) before treating outputs as current.

### Failure rule

- If projections disagree on shared fields → **reject publication** (exit non-zero).
- If control-source is dirty relative to claimed formal pin without a new formal
  gate → mark formal/global **unverified**, never inherit old green.
- Stale DA27 constants in generators fail tests (DA30-004).

### History and rollback

- Do not rewrite historical DA28/DA27 research pins.
- Quarantine DA29 machine watermark as evidence of a failed state (audit hold).
- Rollback = restore previous `control-source-v1` revision and re-materialize.

### Migration

1. DA30-004 implements generators + tests against a fixture control-source.
2. Seed control-source with: accepted ladder through DA28-30, DA29 unadjudicated,
   proposed queue DA30-001…010, scores held, pins from audit (formal historical
   `a6e91520`, HEAD unverified).
3. Leave `authority-selector-v1.json` DA29-200 content labeled failed evidence
   until the first successful materialize from control-source replaces it
   under DA30-004/010.

## Consequences

- Agents must not treat generated DA29 empty queue as current work.
- DA30-004 becomes the implementation cut for synchronized controls.
- Event-ledger (B) remains a future upgrade path after recovery, not wave 0.

## Rollback

Revert this ADR status to Proposed and keep dual materializers only if DA30-004
cannot land; do not re-accept DA29-200 without semantic revalidation.
