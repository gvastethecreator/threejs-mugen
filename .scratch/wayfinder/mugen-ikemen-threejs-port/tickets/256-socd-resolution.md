# Ticket 256: SOCD resolution

- Status: open
- Date: 2026-07-18
- Scope: deterministic opposing-direction resolution in the playable runtime
- Depends on: existing `MatchInput` tick boundary and imported game-config path
- Research: [`docs/research/2026-07-18-socd-resolution.md`](../../../docs/research/2026-07-18-socd-resolution.md)

## Question

How should the Three.js runtime resolve simultaneous opposing directions while
preserving the documented MUGEN/IKEMEN profile behavior?

## Bounded contract

- Support official modes `0`, `1`, `2`, `3`, and `4`.
- Normalize each player input once at the start of a tick, before root routing,
  command buffers, control, pause, and hitpause consumers.
- Preserve buttons and unrelated direction tokens.
- Use iterable insertion order for first/last priority until a timestamped input
  event contract exists.
- Default `ikemen-go` to mode `4`; default `mugen-1.1` and `unknown` to mode
  `0`; allow an explicit runtime option and imported `[Input]` config override.
- Keep invalid config values fail-closed at the profile default.

## Out of scope

Raw IKEMEN `InputBuffer` internals, hardware polling timestamps, AI command
generation, command remapping, netplay, rollback, ZSS/Lua, Common1/default
tables, and full parity.

## Acceptance evidence

- Focused `RuntimeInput` tests cover all five modes, insertion-order behavior,
  preservation, and invalid-value fallback.
- Runtime integration proves the resolved set reaches both player control and
  command-buffer history on the same tick.
- Imported config coverage proves `[Input] SOCDResolution` extraction and
  profile/explicit-option precedence.
- Batched TypeScript 7, relevant tests, build, boundaries, trace, and diff
  hygiene pass before closeout.
