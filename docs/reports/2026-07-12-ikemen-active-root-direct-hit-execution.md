# IKEMEN Active-root Direct-hit Execution

Date: 2026-07-12
Wayfinder: 114
Verdict: implemented and verified

## Delivered

- Explicit Tag consumes ordered admitted root pairs through the existing direct-combat mutation resolver.
- Pair/Single preserve the legacy P1/P2 direct-call path.
- Admission ids resolve against authoritative roots and unknown ids fail closed.
- Exact committed/pending getter memory replaces scalar `hasHit` for actors that own the new contact lists.
- Successful root contacts retain existing actor-local life, power, state, target, contact, spark, and sound writes.

## Focused Evidence

- `RuntimeCombatResolutionSystem`: prior P4 contact does not block a new P2 getter.
- `MatchInteractionSystem`: plural callback owns deterministic direct-combat call order and replaces pair calls.
- Focused runtime suite: 3 files / 204 tests passed.
- TypeScript typecheck passed.
- Full tests: 179 files / 1819 tests passed.
- Trace gate: 543/543 artifacts passed (512 required, 31 optional).
- TypeScript 7 + Vite build: 261 modules; JS 1,618.06 kB, gzip 406.59 kB.
- Architecture boundaries and `git diff --check` passed.

## Pressure

- The route does not widen projectile/helper combat or effect advancement.
- Team round finish still reads P1/P2 only; reserve KO cannot claim Tag round parity.
- Active-motion roots still cannot author HitDef controllers through their CNS capability profile.
- Pair priority clash remains the only priority mutation pass; complete plural trade/ReversalDef arbitration remains blocked.

## Next

Wayfinder 115 must choose between active-root HitDef authoring and plural priority/team-KO prerequisites, with source-backed ordering and a required executable P3/P4 contact trace.
