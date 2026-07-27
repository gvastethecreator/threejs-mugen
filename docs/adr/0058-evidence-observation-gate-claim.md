# ADR 0058 — Observation, gate, adjudication, claim (DA30-013)

- **Status:** Accepted

## Decision

| Artifact | May declare | Must cite |
| --- | --- | --- |
| observation | facts only | nothing (no self-acceptance) |
| gate | pass/fail vs thresholds | observations |
| adjudication | accepted/rejected clauses | gates |
| claim | allowed product/control claims | adjudication |

Invalid edges: observation→claim, gate→claim without adjudication, cycles.
Implemented in `src/mugen/da30/EvidenceLineage.ts`.
