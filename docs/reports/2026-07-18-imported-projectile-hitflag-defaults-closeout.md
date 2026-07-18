# Imported Projectile HitFlag Defaults Closeout

Date: 2026-07-18
Planning: `0fabf9cc`
Implementation: `9b0122fa`
Regression fixture correction: `2f65c1c6`
Ticket: [T265](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/265-imported-projectile-hitflag-defaults.md)
ADR: [0032](../adr/0032-imported-projectile-hitflag-defaults.md)

## Delivered

- Imported root/state-owner Projectile spawns inherit omitted `MAF`.
- Helper Projectile spawns forward the existing imported default.
- Explicit typed/static values win; dynamic raw strings remain unresolved.
- Omitted ModifyProjectile mutation preserves the live Projectile HitFlag.
- Synthetic down-hit traces author `D` explicitly where their target is
  lie-down, preserving fixture intent under the new documented default.

## Evidence

- Focused runtime tests: `3` files / `104` tests passed.
- Full suite: `230/230` files / `2424/2424` tests passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; JavaScript output is `1,974.27 kB` and Vite retains its
  existing large-chunk advisory.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed, with existing CRLF normalization warnings on
  unrelated dirty roadmap files.
- `pnpm qa:trace`: passed `633/633` artifacts, `599` required and `34`
  optional, with zero failed and zero skipped optional fixtures. The known
  WebSocket warning reports port `24678` already occupied by an unrelated
  process; the final QA status is passed.
- Browser smoke: N/A; no renderer, Studio, or visible surface changed.

## Claim ceiling

The project now has bounded imported Projectile HitFlag default provenance at
spawn, not complete Projectile or MUGEN/IKEMEN parity. Dynamic strings,
ModifyProjectile defaulting, timing, reversals, clashes, exact
`acttmp`/`hittmp`, rollback, and full parity remain open.
