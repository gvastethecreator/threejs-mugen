# Redirected Target Dispatch Characterization Closeout

Date: 2026-07-16
Wayfinder ticket: 200

## Task state

Completed for the four existing successful RedirectID caller/destination
routes. This is a characterization slice, not the lease or mutation migration
proposed by ADR 0006.

## Delivered

- Added a dispatcher-level selection projection with destination identity,
  operation class, requested target id, selected targets, matched count,
  execution result, and concrete mutation actor ids.
- Derived selected targets from the target memory captured before dispatch;
  derived binding and target-drop mutations from the post-dispatch state.
- Propagated observations through root active CNS, root State -1 setup,
  hit-pause, interaction, post-fighter, and helper lifecycle adapters.
- Stored bounded observations on the imported caller root compatibility
  session, preserving helper caller identity and destination state ownership.
- Added the helper-to-helper route fixture using two live helpers with
  distinct PlayerID values.

## Route evidence

| Route | Caller | Destination | State owner | Mutation boundary |
| --- | --- | --- | --- | --- |
| root active | `p1` | `p2` | `p2` | selected root target `p1` |
| root State -1 | `p2` | `p1` | `p1` | selected root target `p2` |
| helper -> root | `p1-helper-0` | `p2` | `p2` | selected root target `p1` |
| helper -> helper | `p1-helper-0` | `p2-helper-0` | `p2-helper-0` | selected root target `p1`; caller helper not mutated |

## Verification

- `pnpm exec vitest run src/tests/TargetSystem.test.ts src/tests/RuntimeCompatibilityTelemetrySystem.test.ts src/tests/PlayableMatchRuntime.test.ts --testTimeout=30000`
  -> `3` files, `265/265` tests passed.
- `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed for the feature changes.
- Browser/renderer smoke: N/A; no visible UI or Three.js surface changed.
- Full repository suite and full compatibility trace: intentionally deferred
  to the next multi-slice checkpoint.

## Claim boundary

Allowed: inspectable identity and mutation evidence for the four successful
RedirectID routes above.

Still open: the ADR 0006 dispatch lease, centralized mutation ownership,
recursive redirects, exact multi-target ordering, `TargetScoreAdd`, helper
destination `TargetState`, projectile/team destinations, persistence,
rollback/netplay, presentation, and full MUGEN/IKEMEN parity.

## Quality audit

The focused adversarial case ensures an unselected candidate is absent from
both selected and mutated actor sets. The helper-to-helper case ensures the
destination helper's target memory controls the operation while the caller
helper is not incorrectly reported as mutated. No independent review was
run; the source/diff audit and focused failure-path coverage are recorded
explicitly.

## Commits

- `58ec4370 feat(runtime): characterize redirected target dispatch`
- `d32c9720 test(runtime): prove redirected target dispatch routes`

## Next frontier

Review `docs/adr/0006-runtime-redirected-target-dispatch.md` and implement the
first narrow lease adapter with operation-specific mutation ownership. Keep
the lease boundary separate from `TargetScoreAdd` until its semantics have
independent source-backed evidence.
