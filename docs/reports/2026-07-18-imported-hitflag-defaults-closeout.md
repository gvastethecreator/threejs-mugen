# Imported HitFlag Defaults Closeout

Date: 2026-07-18
Planning: `08c157d2`
Implementation: `66c21cac`
Ticket: [T264](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/264-imported-hitflag-defaults.md)
ADR: [0031](../adr/0031-imported-hitflag-defaults.md)

## Delivered

- Omitted imported HitDef state-move flags resolve to `MAF`.
- Direct and Helper runtime dispatch receive the source-scoped default.
- Authored/static/raw values retain precedence.
- Demo and synthetic omitted fields remain unchanged.

## Evidence

- Focused runtime tests: `3` files / `60` tests passed.
- `pnpm typecheck`: passed.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed, with only the repository's existing CRLF
  normalization warnings on unrelated dirty roadmap files.
- The grouped T265 checkpoint passes `230/230` files / `2424/2424` tests,
  production build, and `pnpm qa:trace` `633/633` artifacts.
- Browser smoke: N/A; no renderer, Studio, or visible surface changed.

## Claim ceiling

This report closes only the bounded direct/Helper HitDef provenance slice. The
following T265 closeout separately covers imported root/state-owner and Helper
Projectile spawn defaults. Complete MUGEN/IKEMEN HitFlag parity remains open:
dynamic strings, live mutation defaults, reversals, exact timing, custom-state
breadth, rollback, and full parity are not claimed.
