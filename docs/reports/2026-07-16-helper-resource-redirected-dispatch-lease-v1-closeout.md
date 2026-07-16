# Helper Resource Redirected Dispatch Lease/v1 Closeout

Date: 2026-07-16
Wayfinder ticket: 204
ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md` (still Proposed;
incremental migration only)

## Task state

Completed for current helper CNS resource RedirectID routes.

## Delivered

- Added helper resource RedirectID resolution for live root and helper
  destinations through the shared `helper` lease phase.
- Preserved an empty candidate projection for single-destination resources.
- Resolved dynamic resource operation values from the helper caller runtime
  and context before dispatching to the destination actor.
- Kept non-redirected helper resources local.
- Commit/synchronized helper wrappers inside the lease operation and wired the
  callbacks through active effect, post-fighter, and pause context boundaries.
- Preserved invalid fail-closed logging and unsupported-controller reporting.

## Verification

- Focused batch:
  `pnpm exec vitest run src/tests/RuntimeRedirectedTargetDispatchSystem.test.ts src/tests/HelperSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/RuntimeControllerDispatchSystem.test.ts -t "Helper .*resource|Helper LifeAdd|Helper PowerSet|Helper resource|Helper Target|Helper BindToTarget|Helper TargetState|resource RedirectID|CtrlSet RedirectID|dynamic Life|dynamic CtrlSet|live destination|helper caller" --testTimeout=30000`
  -> `4` files, `23/23` selected tests passed (`263` skipped by filter).
- TypeScript 7: `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed for the feature changes.
- Browser/renderer smoke: N/A; no visible UI or Three.js surface changed.
- Full repository suite and full compatibility trace: deferred to the next
  multi-slice checkpoint, per the current batch strategy.

## Claim boundary

Allowed: current helper CNS resource RedirectID routes use one synchronous
identity/freshness/store lease for root/helper destinations without changing
resource semantics or local behavior.

Still open: helper State -1/global-state, projectile/team ownership,
recursive redirects, exact multi-target ordering, `TargetScoreAdd`,
persistence, rollback/netplay, presentation, and full parity.

## Quality audit

The dynamic-value test is intentional: it sets helper `Var(0)` before a
redirected `LifeAdd` and proves the destination receives that caller-owned
value. This guards against accidentally evaluating the resource against the
destination runtime. The stale generic lease gate and helper integration
routes together cover the no-mutation failure path and valid wrapper commit.

No score movement. No browser gate was required for this runtime-only slice.

## Commits

- `43bb9a1f docs(wayfinder): select helper resource lease`
- `5e0d5744 feat(runtime): lease helper resource redirects`

## Next frontier

Select and characterize projectile/team RedirectID ownership before extending
the lease beyond root/helper resource and target families.
