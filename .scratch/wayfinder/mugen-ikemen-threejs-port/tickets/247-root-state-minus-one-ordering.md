# Ticket 247: Root State -1 Ordering

- Status: resolved
- Area: runtime / CNS scheduling
- Feature commit: `730f1a14`
- Decision: ADR 0014
- Research: `docs/research/2026-07-18-root-state-minus-one-ordering.md`

## Problem

Imported root CMD State -1 currently entered through input control before the
root State -3 and State -2 passes. The fallback local/AI action also happened
in the same early callback, so moving only one half would change command-route
behavior.

## Acceptance

- [x] imported root execution observes `-3 -> -2 -> -1 -> current` for MUGEN
  1.1 and IKEMEN profiles when the imported root declares numeric `-3/-2`;
- [x] player input and simple AI share a sampled/deferred control boundary;
- [x] an AI root can route State -1 before the heuristic fallback;
- [x] a movable IKEMEN Pause tick keeps the State -1 boundary;
- [x] focused runtime tests, TypeScript 7 build, boundaries, redirect guard,
  and diff hygiene pass;
- [x] closeout names unsupported parity and merge assumptions.

## Out of scope

Helper input buffers, Common1/multi-file append precedence, exact controller
interleaving after State -1 ChangeState, persistence, rollback/netplay, and
full MUGEN/IKEMEN parity.
