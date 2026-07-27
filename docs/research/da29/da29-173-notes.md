# DA29-173 research notes

Wave 17 · revision 119e627410a4

## Cut

Create the Lua threat model and capability decision. Depends on DA29-089, DA29-126, and DA29-171.

## Acceptance ceiling

Review covers file/network/time/randomness, host APIs, memory/CPU, infinite loops, modules, persistence, user trust, CSP, browser worker limits, and default deny policy.

## Risk

Arbitrary script execution is high risk. Allows threat model only.

## Inventory method

Machine-generated closeout from `docs/MASTER_REVIEW_ROADMAP.md` + series registry.
This note records the research claim only; it does not authorize runtime, score,
or formal/global movement.

## Open questions

- Source pin freshness for any normative claim in this cut
- Fixture ownership if later implementation IDs consume this research
