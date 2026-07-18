# ADR 0023: Runtime SOCD resolution

- Status: Accepted bounded runtime contract
- Date: 2026-07-18
- Scope: opposing-direction resolution for the playable input boundary
- Implementation: `8b8a587d`
- Research: [`docs/research/2026-07-18-socd-resolution.md`](../research/2026-07-18-socd-resolution.md)
- Closeout: [`docs/reports/2026-07-18-socd-closeout.md`](../reports/2026-07-18-socd-closeout.md)

## Context

The official IKEMEN configuration exposes five `SOCDResolution` modes, while
the current runtime receives one `Set<string>` per player and previously let
each consumer interpret simultaneous opposing directions independently. That
made profile behavior implicit and could make control and command history
disagree.

## Decision

1. Normalize a copied player input once at the start of each match tick.
2. Apply modes `0` through `4` to both horizontal (`B`/`F`) and vertical
   (`D`/`U`) opposing pairs while preserving buttons and diagonal tokens.
3. Use insertion order as the deterministic first/last priority source for
   modes `3`/`1` until a timestamped device-event contract exists.
4. Default `ikemen-go` to mode `4` and `mugen-1.1`/`unknown` to mode `0`.
5. Let an explicit runtime option override imported `[Input] SOCDResolution`,
   then use P1/P2 imported config in deterministic order; invalid values are
   ignored and fall back to the profile default.

## Consequences

Root routing, normal command buffers, input control, pause, and hitpause share
one resolved set. The importer can carry a valid config value into the runtime
without adding a second input asset contract. Modes `1` and `3` are
deterministic for the present Set-based API, but they do not claim hardware
polling timestamp parity. Raw IKEMEN `InputBuffer`, AI input generation,
command remapping, netplay, rollback, ZSS/Lua, Common1/default tables, and full
parity remain separate work.

## Evidence

- Focused RuntimeInput/importer/PlayableMatchRuntime coverage: `278/278`.
- Full suite: `230/230` files and `2388/2388` tests.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; Vite reports the existing `1969.15 kB` JavaScript
  chunk advisory.
- `pnpm check:boundaries` and `pnpm check:redirect-boundary`: passed.
- `pnpm qa:trace`: `633/633` artifacts passed (`599` required, `34` optional).
  The runner still logs the known occupied WebSocket port `24678`; final JSON
  status is `passed`.
- Browser smoke: N/A because no renderer, Studio, or visible surface changed.

