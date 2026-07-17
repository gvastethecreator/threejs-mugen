# Implement bounded helper State -1 keyctrl

Type: task
Status: claimed
Blocked by: 240-helper-targetstate-redirect-ownership

Research: `docs/research/2026-07-16-helper-state-minus-one-keyctrl.md`

## Question

Can imported helpers execute the owning program's CMD State -1 controllers
only when the Helper controller explicitly enables `keyctrl`, while keeping
helper-local state ownership and command evaluation bounded?

## Acceptance

- Helper parses and stores static `keyctrl`.
- State -1 `stateEntries` reach helper runtime actors without changing existing
  direct helper fixtures.
- A keyctrl-enabled helper runs State -1 before its current state.
- A keyctrl-disabled helper skips State -1.
- `command =` and `selfcommand =` use the owning root command buffer.
- State -2/-3/-4/+1 and helper-specific input remain explicit non-goals.
- Focused helper/compiler/runtime tests, TypeScript 7, build, boundaries, and
  diff hygiene pass.

## Claim ceiling

This ticket does not claim full MUGEN/IKEMEN global-state parity, common-file
merge precedence, exact negative-state tick ordering outside the bounded pass,
helper input buffers, or score/parity movement.
