# Stateful SOCD Temporal State Closeout

Date: 2026-07-18
Ticket: [T267](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/267-stateful-socd-temporal-state.md)
ADR: [0033](../adr/0033-stateful-socd-temporal-state.md)
Implementation: `69aacf86`

## Delivered

- Added persistent four-slot SOCD state per P1/P2 seat.
- Modes `1` and `3` now preserve first-direction state across reconstructed
  input sets and clear it at match/round reset.
- Existing routing, control, command history, pause, and hitpause consume the
  same resolved set.

## Verification

- Focused: `2` files / `268` tests passed.
- Full suite: `231/231` files / `2435/2435` tests passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; Vite retains existing large-chunk advisory.
- Repository boundaries and redirect boundary: passed.
- `pnpm qa:trace`: passed `633/633` artifacts (`599` required, `34` optional).
- Browser smoke: N/A; runtime-only change.

## Claim ceiling

Bounded temporal behavior at the Set boundary is closed. Raw device event
timestamps, full IKEMEN InputBuffer, AI/remapping, rollback/netplay, and full
MUGEN/IKEMEN input parity remain open.
