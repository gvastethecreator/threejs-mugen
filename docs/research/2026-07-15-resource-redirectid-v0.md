# Root Resource RedirectID v0

## Question

Can the imported IKEMEN runtime route a bounded set of root-owned resource
controllers through `RedirectID` while preserving caller-owned expression
evaluation and the existing fail-closed identity boundary?

## Primary sources

- [IKEMEN-GO state controllers: RedirectID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines `RedirectID` as an optional controller parameter that sends
  controller execution to the player selected by `PlayerID`, while noting that
  controller ordering can limit individual routes.
- [Pinned IKEMEN-GO runtime source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510)
  remains the version-pinned runtime lookup anchor for the PlayerID-backed
  redirect implementation.
- [Elecbyte state-controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
  defines `LifeAdd`, `LifeSet`, `PowerAdd`, and `PowerSet` as writes to the
  executing player's life or power resources. It also allows arithmetic
  expressions for numeric controller parameters.

## Findings

1. The existing identity registry is the correct root destination source. The
   new route does not create a second roster or allow an arbitrary actor ID.
2. A redirected resource controller has two different ownership concerns:
   `RedirectID` selects the target resource state, but `value` and `kill`
   expressions belong to the caller's evaluation context. Dynamic operations
   must therefore resolve before dispatch and be attached as a static operation
   to the target controller invocation.
3. The same ownership rule applies to active CNS execution and state-entry
   setup execution. Both paths now use the same resolver and operation
   preparation helper.
4. Compatibility telemetry records the imported caller's controller and
   resolved operation when the target is a non-imported actor, so evidence does
   not disappear merely because the destination is outside the imported
   session.

## Decision

Implement and trace only:

- IKEMEN `RedirectID` for root `LifeAdd`, `LifeSet`, `PowerAdd`, and
  `PowerSet`.
- Active-state and state-entry setup execution paths.
- Static and dynamic non-negative PlayerID expressions, using the existing
  match-owned identity registry.
- Caller-owned dynamic values, fail-closed invalid/missing destinations, and
  imported-source telemetry.

Keep outside this cut:

- Helpers, projectiles, neutral actors, and team/shared resource banks.
- `RedLife*`, guard points, dizzy points, and target-owned resource families.
- Exact `LifeAdd absolute` semantics, KO ordering, persistence, rollback,
  netplay, and complete MUGEN/IKEMEN parity.

## Evidence

- Focused batch: 3 files, 843 tests passed.
- TypeScript 7: `pnpm typecheck` passed.
- Trace script syntax: `node --check scripts/qa_traces.cjs` passed.
- `git diff --check` passed; existing unrelated dirty roadmap files only emit
  the repository's known CRLF normalization warnings.
- Full `pnpm qa:trace`: 605/605 artifacts, 571 required, 34 optional, 0
  failed, 0 skipped.
- Required active trace `synthetic-imported-resource-redirect`: checksum
  `a10bfbff`.
- Required state-entry trace
  `synthetic-imported-resource-state-entry-redirect`: checksum `6adde9e8`.

No browser smoke was needed: this slice changes no renderer, frontend, or
Studio surface. No score movement.

## Next research cut

Audit one independent invalid/missing `RedirectID` resource corpus boundary,
then decide whether auxiliary resource owners or team-bank mutation should be
promoted. Do not widen this route to Helpers or shared resources without a
separate ownership and scheduling trace.
