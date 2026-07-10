# Choose next gap after Common1 state source precedence

Type: research
Status: resolved
Blocked by: None

## Question

What is the smallest source-backed trace package that can prove automatic guard-start phase ordering relative to active state controllers, hitpause, pause, and contact resolution?

## Candidate Inputs

- Elecbyte Common1 state 120 behavior and trigger timing.
- IKEMEN GO guard-start/update order where source inspection is authoritative.
- Current `MatchTickSchedule/v0` phase catalog and documented divergences.
- Existing automatic guard-start, pause, hitpause, and contact trace fixtures.
- Checksum-preserving diagnostics versus behavior-changing schedule work.

## Answer

Instrument the current single active-branch checkpoint as owner-backed `fighter:auto-guard-check` schedule stamps, require it in active artifact diagnostics, and prove the existing P1/P2/controller/contact order without changing behavior. IKEMEN GO uses two checkpoints plus a guard-distance flag latched by hit detection, so behavior reordering remains a separate package.

Research and blocked claims: `docs/research/2026-07-10-auto-guard-start-phase-order.md`.
