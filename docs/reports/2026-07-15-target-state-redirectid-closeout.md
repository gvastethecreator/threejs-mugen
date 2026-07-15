# TargetState RedirectID closeout

Date: 2026-07-15

## Status

Implemented and verified as a bounded root-only IKEMEN compatibility slice.
Runtime commit: `7c31722a`.

## Delivered behavior

Active CNS and imported State -1 `TargetState` controllers now accept the
explicit IKEMEN `RedirectID` route. Redirect resolution selects a live root
PlayerID destination and uses that destination's target memory. The authored
target ID and state number remain intact; the selected target receives custom
state data owned by the redirected destination. Omitted RedirectID remains
local. Invalid, negative, unavailable, disabled, destroyed, malformed, and
legacy routes fail closed before mutation.

The active and State -1 paths share the same owner-backed target-state entry
callback, so `ChangeState` and `SelfState` continue to execute against the
custom-state owner selected by the RedirectID route.

## Evidence

- Required active artifact: `synthetic-imported-target-state-redirect`,
  checksum `43dcb915`.
- Required State -1 artifact:
  `synthetic-imported-target-state-state-entry-redirect`, checksum `99fff243`.
- Full trace QA: `pnpm qa:trace` passed `623/623` artifacts.
- Required/optional split: `589` required, `34` optional, `0` skipped.
- Coverage summary: `89` controller families, `84` operation families,
  `449` target-link routes, `622` effect-store routes.
- Affected runtime suites: `892/892` tests passed with the deliberate
  15-second timeout for the unchanged slow team handoff case.
- TypeScript 7 check: `pnpm typecheck` passed.
- Production build: `pnpm build` passed.
- Boundary audit: `pnpm check:boundaries` passed.
- Trace runner syntax: `node --check scripts/qa_traces.cjs` passed.
- Diff hygiene: `git diff --check` passed.

## Audit

The closeout covered compiler lowering, active dispatch, State -1 setup
classification, root PlayerID resolution, destination-owned target-memory
selection, custom-state ownership, state availability, `ChangeState` /
`SelfState` return, typed telemetry, required trace registration, and
fail-closed behavior. The State -1 trace intentionally seeds reciprocal target
memories so it proves that redirect resolution uses the destination's memory
instead of silently reusing the caller's memory.

## Official basis

- [IKEMEN RedirectID state-controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines optional PlayerID redirection and notes that redirected execution is
  distinct from custom-state transfer.
- [Elecbyte TargetState documentation](https://elecbyte.com/mugendocs/sctrls.html)
  defines the state number and target ID parameters.
- [Elecbyte CNS documentation](https://elecbyte.com/mugendocs/cns.html)
  defines controller order and the State -1 execution context.

## Scope ceiling

No claim is made for helpers, projectiles, teams, cross-localcoord scaling,
exact multi-target ordering, persistence, rollback/netplay, presentation,
score, or full MUGEN/IKEMEN parity. Those remain separate frontiers.

## Next frontier

Select the next independent Target* ownership boundary after this root-only
custom-state route. Keep helper/projectile/team ownership and exact
multi-target behavior separate until each has its own source-backed trace gate.
