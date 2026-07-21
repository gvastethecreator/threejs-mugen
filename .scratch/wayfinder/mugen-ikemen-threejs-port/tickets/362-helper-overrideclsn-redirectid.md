# T362 Helper OverrideClsn RedirectID

Status: resolved at bounded redirected Helper collision override scope

Feature commits: `a970816e`, `ba75b203`, `db19a5b9`

Research report: [Helper OverrideClsn local and redirect report](../../../../docs/research/2026-07-21-helper-overrideclsn-local-and-redirect-report.md)

## Source evidence

The normative source is Ikemen-GO revision
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`. The controller resolves its
redirected character first, evaluates every controller parameter in the
source character, rescales each rectangle by source and destination local
scale, normalizes the rectangle, then appends or clears the destination list.

Official sources:

- [Ikemen-GO OverrideClsn controller](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L15338-L15392)
- [Ikemen-GO getClsn override application](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10054-L10134)
- [Ikemen-GO per-tick collision reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11678-L11682)

## Delivered

- Routes Helper `OverrideClsn RedirectID` through the existing verified
  resource-redirect resolver and its revalidating lease.
- Evaluates dynamic group, index, rectangle, and RedirectID expressions in
  the source Helper context.
- Scales rectangle values by destination width over source width, matching the
  runtime's root RedirectID adapter and the upstream `localscl` relation.
- Exposes Helper `localCoord` on redirect target actors so Helper-to-Helper
  routes use the same scale boundary as Helper-to-root routes.
- Keeps missing or invalid destination routes fail-closed, reports the
  resource redirect block, and records no local collision write.
- Sends controller and operation telemetry to the redirected target.
- Centralizes resource, target, and collision redirect writeback in one Helper
  executor. The redirect-boundary guard now verifies that shared ownership.
- Adds live match coverage for both Helper-to-root and Helper-to-Helper lease
  routes, plus dynamic local-coordinate scaling and local fail-closed cases.

## Verification

- Focused Vitest passed: `3/3` files and `328/328` tests.
- `pnpm typecheck` passed with TypeScript `7.0.2`.
- `pnpm qa:trace` passed: `636/636` artifacts, `602` required and `34`
  optional; no failed or skipped fixture.
- `pnpm build` passed with `328` transformed modules and `2,095.45 kB` JS
  before gzip.
- `pnpm check:boundaries`, `pnpm check:redirect-boundary`, and
  `git diff --check` passed.
- Full Vitest remains deferred. The latest full baseline is T356 with
  `240/240` files and `2612/2612` tests.
- Browser smoke remains deferred because this cut changes runtime collision
  state and redirect dispatch only.

## Claim ceiling

This ticket proves bounded current-frame Helper `OverrideClsn RedirectID`
writeback for verified root and Helper destinations, including source-context
dynamic parameters, destination local-coordinate scaling, lease execution,
and target telemetry. It does not prove exact actor-order persistence beyond
the existing scheduler, group-3 size behavior, complete coordinate and
animation-scale composition, all redirect controller families, visual parity,
upstream differential parity, rollback/netplay, or full MUGEN/IKEMEN parity.
