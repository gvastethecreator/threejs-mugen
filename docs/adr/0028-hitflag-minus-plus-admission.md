# ADR 0028: explicit HitFlag minus/plus admission

- Status: Accepted bounded runtime contract
- Date: 2026-07-18
- Scope: explicit direct HitDef `-` and `+` admission
- Planning: [`T261`](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/261-hitflag-minus-plus-admission.md)
- Implementation: `c88fd483`
- Research: [`2026-07-18-hitflag-minus-plus-admission`](../research/2026-07-18-hitflag-minus-plus-admission.md)
- Closeout: [`2026-07-18-hitflag-minus-plus-closeout`](../reports/2026-07-18-hitflag-minus-plus-closeout.md)

## Context

The pinned IKEMEN character loop uses `hittmp` to distinguish idle, get-hit,
and falling targets. The sandbox already carries explicit HitDef hitflags, but
its root, regular, equal-priority, and helper direct routes need one shared
admission result.

## Decision

1. Keep omitted hitflags unchanged.
2. Parse compact and separated explicit hitflag strings.
3. Project `hittmp` as `0` for non-`H`, `1` for `H` without fall metadata, and
   `2` for `H` with `hitFall.falling = true`.
4. Preserve the existing `F` / `NoFallHitFlag` rule at projected `hittmp = 2`.
5. Reject `-` for projected `hittmp > 0`.
6. Require `+` to target projected `hittmp > 0`, while rejecting the source
   Common1 guard-state range and the runtime guard latch.
7. Use the same pure result at root admission, regular direct resolution,
   equal-priority preparation, and helper direct resolution.

## Consequences

Explicit throw and chain-style admission no longer disagrees across direct
runtime paths. The implementation remains a compatibility projection rather
than an exact per-tick `hittmp` or reversal `-1` model.

## Evidence

- Focused T261 coverage: `4` files / `79` tests passed.
- Grouped full suite: `230` files / `2416` tests passed.
- TypeScript 7 typecheck, production build, repository boundaries, redirected
  target boundary, and `git diff --check` passed.
- `pnpm qa:trace`: `633/633` artifacts passed (`599` required, `34` optional),
  with `0` failed and `0` skipped optional fixtures.
- Build output remains subject to the existing Vite large-chunk advisory;
  browser smoke is N/A because no visible surface changed.
- The trace runner still reports WebSocket port `24678` occupied by the known
  unrelated process from `D:\DEV\moklos.club`; final status is passed.

## Claim ceiling

Allowed: explicit direct `HitFlag -/+` admission over the bounded runtime
`hittmp` projection. Blocked: default inference, state-type completeness,
projectiles, reversals, exact `acttmp`, rollback/netplay, and full parity.
