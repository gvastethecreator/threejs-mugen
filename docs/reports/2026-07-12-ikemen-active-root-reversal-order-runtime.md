# Active-root ReversalDef Ordering Runtime Report

Date: 2026-07-12

## Delivered

- Active-motion roots admit typed `reversaldef` alongside `hitdef`.
- Plural direct admission traverses ReversalDef/HitDef/PlayerNo-sorted getters first.
- Priority arbitration retains its independent attacker ordering.
- Required `synthetic-imported-ikemen-active-root-reversal-order` trace proves a P4 counter wins before a competing P2 hit can interrupt P5.

## Quality Evidence

- Focused admission/CNS tests: green.
- Focused required runtime trace: green.
- Full suite, trace catalog, TypeScript 7 typecheck/build, boundaries, independent review, and final artifact checksum: green.

## Global Port State

Active-root Tag direct combat now covers authored HitDef, typed Hit/Miss/Dodge priority outcomes, equal Hit trades, exact getter contact memory, and bounded ReversalDef-first mutation. Remaining combat debt includes ReversalDef-versus-ReversalDef exact behavior, broader HitOverride/guard combinations, throws, projectile/helper plural combat, attack depth/Z, AffectTeam, round/team ownership, HUD/audio ownership, rollback, and netplay.

## Closure

- Tests: 179 files, 1843 tests passed.
- Trace QA: 551/551 artifacts passed, 520 required; new trace checksum `457a4d76`.
- TypeScript 7: `tsc --noEmit` passed.
- Production build: 261 modules, JS 1,624.24 kB / gzip 407.98 kB.
- Architecture boundaries and `git diff --check`: passed.
- Independent review: no P1/P2 findings; residual matrix debt remains listed above.
