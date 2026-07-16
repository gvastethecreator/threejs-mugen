# Root Resource Redirected Dispatch Lease/v1 Closeout

Date: 2026-07-16
Wayfinder ticket: 203
ADR: `docs/adr/0006-runtime-redirected-target-dispatch.md` (still Proposed;
incremental migration only)

## Task state

Completed for characterized root active CNS and State -1 resource
`RedirectID` dispatch.

## Delivered

- Reused the root synchronous lease for `CtrlSet`, life, power, guard-point,
  dizzy-point, and red-life resource controller families.
- Kept the resource lease candidate projection empty because resource
  controllers mutate one resolved actor and do not select target memory.
- Kept dynamic resource operation evaluation inside lease execution, using the
  caller runtime/context as before.
- Preserved `RuntimeControllerDispatchWorld` semantics, telemetry mirroring,
  invalid fail-closed logs, and local no-RedirectID behavior.
- Covered both active CNS and State -1 setup paths.

## Verification

- Focused batch:
  `pnpm exec vitest run src/tests/RuntimeRedirectedTargetDispatchSystem.test.ts src/tests/PlayableMatchRuntime.test.ts -t "resource RedirectID|CtrlSet RedirectID|destination lease|helper caller|live destination" --testTimeout=30000`
  -> `2` files, `8/8` selected tests passed.
- TypeScript 7: `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed for the feature changes.
- Browser/renderer smoke: N/A; no visible UI or Three.js surface changed.
- Full repository suite and full compatibility trace: deferred to the next
  multi-slice checkpoint, per the current batch strategy.

## Claim boundary

Allowed: characterized root resource RedirectID routes use one synchronous
identity/freshness/store lease without changing concrete resource semantics.

Still open: helper resources, projectile/team destinations, recursive
redirects, exact multi-target ordering, `TargetScoreAdd`, persistence,
rollback/netplay, presentation, and full MUGEN/IKEMEN parity.

## Quality audit

The resource path now resolves the destination lease before selecting the
resource operation, then evaluates the caller-owned operation inside the lease
callback. A stale lease therefore skips both operation recording and runtime
mutation. The new valid active/State -1 test proves destination mutation while
the caller remains unchanged; existing invalid tests preserve fail-closed
behavior.

No score movement. No browser gate was required for this runtime-only slice.

## Commits

- `a321baf9 docs(wayfinder): select root resource lease`
- `20842502 feat(runtime): lease root resource redirects`

## Next frontier

Select one independent helper-resource or projectile/team RedirectID boundary
and characterize it before implementation.
