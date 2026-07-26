# MatchInputPolicySnapshot/v1 (DA26-14 bounded)

Date: 2026-07-26
Type: runtime input policy
Status: closed-bounded

## Question

Can keyboard, gamepad, and replay seats produce one logical input snapshot with
deadzone, remap, disconnect clearing, facing, SOCD mode, and deterministic
serialization for replay?

## Answer

Yes, for the pure policy layer. Browser Gamepad API attachment and visual proof
remain DA26-13 / later browser work.

## Contract

- Schema `MatchInputPolicySnapshot/v1`
- Two seats with device kind, connection, deadzone, physical buttons/axes,
  logical actions, facing, SOCD mode, tick
- `applyMatchInputDeadzone`, `resolveMatchInputActions`,
  `buildMatchInputSeatSnapshot`, `buildMatchInputPolicySnapshot`
- Canonical equality for deterministic replay of the same physical payload

## Evidence

- `src/mugen/runtime/MatchInputPolicySnapshot.ts`
- `src/tests/MatchInputPolicySnapshot.test.ts`

## Claim allowed

Logical seat snapshot policy under unit tests.

## Claim blocked

Live browser gamepad enumeration, OS-specific mapping tables, full SOCD
application inside this module, browser gate, score movement.
