# TargetLifeAdd RedirectID v1 research

Date: 2026-07-15
Scope: bounded active-CNS root redirect for imported `TargetLifeAdd`.

## Official sources

- IKEMEN-GO state-controller wiki: https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid
- Elecbyte M.U.G.E.N 1.1 State Controller Reference: https://www.elecbyte.com/mugendocs-11b1/sctrls.html#TargetLifeAdd
- Pinned IKEMEN runtime source used by the RedirectID identity audit:
  https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510

## Contract selected

- Profile: `ikemen-go` only. Legacy MUGEN profiles reject the route.
- Schedule: imported active CNS controller execution only.
- Destination: live root `PlayerID`, resolved from the original caller context.
- Ownership: the redirected root owns target-memory selection and life mutation;
  the caller owns authored controller context. `ID`, `value`, `absolute`, and
  `kill` remain part of the compiled target operation.
- Target semantics: the redirected root applies the operation to its remembered
  target matching `ID`. Missing `RedirectID` remains local.
- Failure policy: empty, malformed, negative, unavailable, disabled, destroyed,
  and legacy routes fail closed before mutation.
- Bounded evidence: one live root redirect, one remembered target per root,
  positive target link age, `-20` life mutation, `p1` final life `980`, `p2`
  final life `1000`.

## Evidence

- Code commit: `057572d0` (`feat(runtime): route TargetLifeAdd through RedirectID`).
- Required trace: `synthetic-imported-target-life-redirect`, checksum
  `74f63e7d`.
- Full affected suites: 3 files / 860 tests passed.
- TypeScript 7 `pnpm typecheck`: passed.
- `node --check scripts/qa_traces.cjs`: passed.
- `git diff --check`: passed.
- Full `pnpm qa:trace`: 612/612 passed, 578 required, 34 optional, 0 skipped.

## Limits

State-entry `TargetLifeAdd`, helper/projectile ownership, team/simul
aggregation, exact multi-target ordering, neutral identity, persistence,
rollback/netplay, presentation, score movement, and full MUGEN/IKEMEN parity
remain open. This evidence does not promote generic Target* RedirectID support.
