# SOCD resolution closeout report

- Date: 2026-07-18
- Ticket: [T256](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/256-socd-resolution.md)
- Feature commit: `8b8a587d`
- Planning commit: `3ef5dbdf`
- ADR: [`0023-socd-resolution`](../adr/0023-socd-resolution.md)
- Source note: [`2026-07-18-socd-resolution`](../research/2026-07-18-socd-resolution.md)

## Result

The playable runtime now resolves opposing directions through one pure input
boundary before consumers run. Modes `0` through `4` cover the documented
MUGEN/IKEMEN policy; modes `1` and `3` use the current iterable insertion order
as their deterministic first/last signal. `ikemen-go` defaults to `4`; legacy
and unknown profiles default to `0`. Explicit runtime configuration wins over
imported P1/P2 `[Input] SOCDResolution`, and invalid values fail back to the
profile policy.

The imported fighter definition carries a valid config value through the
existing `MugenSystemAssets.gameConfig` boundary. Root routing, command
history, direct control, pause, and hitpause now consume the same resolved copy.

## Verification

- Focused: `3` files, `278/278` tests passed.
- Full: `230/230` files, `2388/2388` tests passed.
- TypeScript 7 typecheck: passed.
- Production build: passed; existing Vite large-chunk advisory remains.
- Repository boundaries: passed.
- Redirected-target boundary: passed.
- Trace gate: passed, `633/633` artifacts (`599` required, `34` optional).
- `git diff --check`: passed for the implementation and closeout patch.
- Browser smoke: N/A; no visual/runtime presentation surface changed.

The trace runner reports WebSocket port `24678` already occupied by an
unrelated Node process from `D:\DEV\moklos.club`; it did not change the final
trace status.

## Quality audit

- Artifact verdict: better. Profile behavior is explicit and all input
  consumers share one resolved set.
- Verification state: verified for the bounded code contract; browser gate is
  N/A, not silently green.
- Strongest remaining objection: first/last priority is based on Set insertion
  order, not hardware event timestamps. This is documented as a bounded API
  limitation and blocks claims of exact raw IKEMEN InputBuffer parity.
- Secondary residual: mixed P1/P2 package config authority is deterministic but
  not yet a match-level system-config owner.

## Claim boundary

Allowed: bounded deterministic SOCD resolution, profile defaults, imported
config extraction, and shared tick propagation.

Blocked: raw device timing, IKEMEN InputBuffer internals, AI input, command
remapping, netplay, rollback, ZSS/Lua, Common1/default tables, visual/audio
parity, score movement, and full MUGEN/IKEMEN parity. Compatibility scores stay
unchanged.

## Next frontier

Continue source-pinned Common1/default-table ownership only after selecting one
isolated table or state family with a credible fixture; keep ZSS/Lua and raw
input internals separate.

