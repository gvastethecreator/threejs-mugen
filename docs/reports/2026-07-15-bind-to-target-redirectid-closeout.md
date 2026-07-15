# BindToTarget RedirectID closeout

Date: 2026-07-15

## Status

Implemented and verified as a bounded root-only IKEMEN compatibility slice.
Runtime commit: `95279aff`.

## Delivered behavior

Active CNS and imported State -1 `BindToTarget` controllers now accept the
explicit `ikemen-go` `RedirectID` route. A live root PlayerID destination
owns the binding in its target memory while the source controller preserves
the authored target ID, offset, logical Z, position anchor, and duration.
Omitted RedirectID remains local. Invalid, negative, unavailable, disabled,
destroyed, malformed, and legacy routes fail closed before mutation.

## Evidence

- Required active artifact: `synthetic-imported-bind-to-target-redirect`,
  checksum `5c0adf83`.
- Required State -1 artifact:
  `synthetic-imported-bind-to-target-state-entry-redirect`, checksum
  `e2ce5ab3`.
- Full trace QA: `pnpm qa:trace` passed `625/625` artifacts.
- Required/optional split: `591` required, `34` optional, `0` skipped.
- Coverage summary: `89` controller families, `84` operation families,
  `451` target-link routes, and `624` effect-store routes.
- Affected runtime suites: `897/897` tests passed.
- TypeScript 7 check: `pnpm typecheck` passed.
- Production build: `pnpm build` passed.
- Boundary audit: `pnpm check:boundaries` passed.
- Trace runner syntax: `node --check scripts/qa_traces.cjs` passed.
- Diff hygiene: `git diff --check` passed before the documentation commit.

The paired traces and focal runtime tests prove reciprocal target links,
destination-owned binding memory, target-ID filtering, authored position and
duration values, State -1 routing, typed telemetry, and invalid RedirectID
handling. No browser, score, helper/projectile/team, exact multi-target,
persistence, rollback/netplay, presentation, or full-parity claim is made.

## Audit

The closeout covered compiler lowering, active dispatch, State -1 setup
classification, root PlayerID resolution, destination target-memory
selection, binding lifetime, logical-Z propagation, telemetry, required trace
registration, and fail-closed behavior. The State -1 trace seeds reciprocal
target memories so it proves redirect resolution uses the destination memory
instead of silently reusing the caller memory.

## Official basis

- [IKEMEN RedirectID state-controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines optional PlayerID redirection and the processing-order caveat.
- [Elecbyte BindToTarget documentation](https://elecbyte.com/mugendocs/sctrls.html)
  defines binding relative to the target and the optional time, ID, and
  position parameters.
- [Elecbyte CNS documentation](https://elecbyte.com/mugendocs/cns.html)
  defines controller order and the State -1 execution context.

## Scope ceiling

No claim is made for helpers, projectiles, teams, cross-localcoord scaling,
exact multi-target ordering, persistence, rollback/netplay, presentation,
score, or full MUGEN/IKEMEN parity. Those remain separate frontiers.

## Next frontier

Select the next independent Target* ownership boundary. Keep helper,
projectile, team, and exact multi-target behavior separate until each has its
own source-backed trace gate.
