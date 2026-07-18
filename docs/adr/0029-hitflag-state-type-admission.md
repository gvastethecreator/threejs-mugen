# ADR 0029: explicit HitFlag state-type admission

- Status: Accepted bounded runtime contract
- Date: 2026-07-18
- Scope: explicit direct HitDef `H/L/A/D/M` target state admission
- Planning: [`T262`](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/262-hitflag-state-type-admission.md)
- Previous implementation: `c88fd483`
- Implementation: `6c10303f`
- Research: [`2026-07-18-hitflag-state-type-admission`](../research/2026-07-18-hitflag-state-type-admission.md)
- Closeout: [`2026-07-18-hitflag-state-type-closeout`](../reports/2026-07-18-hitflag-state-type-closeout.md)

## Context

The source checks the target's state type before its fall, get-hit, and guard
hitflag rules. The sandbox had explicit hitflag transport and a shared T261
predicate, but had not yet enforced this state-type branch.

## Decision

1. Keep omitted hitflags unchanged so no default is synthesized here.
2. For explicit hitflags, require `H` or `M` for standing, `L` or `M` for
   crouching, `A` for air, and `D` for lie-down.
3. Run this check before the existing `F`, `-`, and `+` checks.
4. Reuse the shared predicate at root admission, regular direct resolution,
   equal-priority preparation, and helper direct resolution.

## Consequences

Explicit direct HitDefs now reject incompatible target state types with a typed
reason while preserving omitted/default behavior. `M` is represented as the
source standing/crouching shorthand. Projectile and reversal ownership remain
separate because those models do not currently carry the same authored direct
HitDef contract.

## Evidence

- Focused T262 coverage: `4` files / `80` tests passed.
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

Allowed: explicit direct `H/L/A/D/M` state-type admission. Blocked: default
`MAF` inference, projectiles, reversals, exact `hittmp`/`acttmp`, custom-state
breadth, rollback/netplay, and full MUGEN/IKEMEN parity.
