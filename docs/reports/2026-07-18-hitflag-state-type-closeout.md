# HitFlag state-type closeout report

- Date: 2026-07-18
- Ticket: [T262](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/262-hitflag-state-type-admission.md)
- Planning commit: `09ecb1dd`
- Feature commit: `6c10303f`
- ADR: [`0029-hitflag-state-type-admission`](../adr/0029-hitflag-state-type-admission.md)
- Research: [`2026-07-18-hitflag-state-type-admission`](../research/2026-07-18-hitflag-state-type-admission.md)

## Result

The shared direct HitFlag predicate now enforces explicit state-type admission:
standing targets require `H` or `M`, crouching targets require `L` or `M`, air
targets require `A`, and lie-down targets require `D`. The rule runs before
the existing `F`, `-`, and `+` branches. Root, regular direct,
equal-priority, and helper routes share the result; omitted hitflags are
unchanged.

## Verification

- Focused: `4` files / `80/80` tests passed.
- Grouped full suite: `230` files / `2416/2416` tests passed.
- TypeScript 7 typecheck: passed.
- Production build: passed; existing Vite large-chunk advisory remains.
- Repository boundaries: passed.
- Redirected-target boundary: passed.
- Trace gate: `633/633` artifacts passed (`599` required, `34` optional), with
  no failed artifacts and no skipped optional fixtures.
- `git diff --check`: passed.
- Browser smoke: N/A; no renderer, Studio, or visible surface changed.

The trace runner logged WebSocket port `24678` already occupied by the known
unrelated process from `D:\DEV\moklos.club`; this did not change the passed
trace result.

## Quality audit

- Source alignment: pinned IKEMEN main hitflag checks and Elecbyte HitDef
  documentation were compared before implementation.
- Adversarial cases: each target state type, `M` shorthand, compact and
  separated strings, mismatch ordering, omitted behavior, root/direct/helper
  routes, and rejection immutability were covered.
- Compatibility audit: the complete test and trace corpus remained green; no
  compatibility score moved.

## Claim boundary

Allowed: explicit direct HitFlag `H/L/A/D/M` state-type admission. Blocked:
default `MAF` inference, projectile/reversal ownership, exact
`hittmp`/`acttmp`, custom-state breadth, ZSS/Lua, rollback/netplay, and full
MUGEN/IKEMEN parity.
