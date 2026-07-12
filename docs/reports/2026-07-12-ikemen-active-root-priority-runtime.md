# IKEMEN Active-root Priority Runtime

Date: 2026-07-12
Wayfinder: 116
Verdict: implemented and verified

## Delivered

- Stable unordered arbitration across admitted active-root pairs.
- Exact loser-to-winner contact suppression for unequal priority.
- Existing bounded equal-priority trade and Pair/Single fallback preserved.
- Required P3/P4 simultaneous priority trace registered in `qa:trace`.

## Evidence

- Focused priority suite: 19 tests passed.
- Required trace: P3 priority 6 beats P4 priority 3; P4 life 1000 -> 959 once.
- Frame zero admits `p3->p4` and `p4->p3`; one priority event and one accepted hit result.
- P3 target/contact memory records P4; repeat P3->P4 reports `already-hit`.
- Trace gate: 545/545 artifacts passed (514 required, 31 optional).
- Full suite: 179 files / 1822 tests passed.
- TypeScript 7 typecheck passed.
- Production build: 261 modules; JS 1,618.80 kB, gzip 406.76 kB.
- Architecture boundaries and `git diff --check` passed.

## Blocked

Exact Hit/Miss/Dodge semantics, ReversalDef ordering, cyclic three-plus-actor arbitration, throws, projectiles, helpers, team KO/replacement, shared resources, rollback, and full parity.

## Next

Wayfinder 117: equal-priority/ReversalDef oracle and three-plus-actor ordering audit.
