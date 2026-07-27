# DA28-10 Gamepad input adapter

Date: 2026-07-26  
Status: closed-bounded  
Depends on: DA28-02

## What landed

- `GamepadInputAdapter` polls `navigator.getGamepads` (or injected double) into
  `MatchInputPolicySnapshot` seats with deadzone, axes, buttons, d-pad fold,
  remap, and disconnect handling.
- `getState(seat)` maps policy actions to Mugen virtual intents (incl. diagonals).
- App `collectMatchInput` merges keyboard seat-1 with gamepad seats 1–2 each tick.

## Evidence

| Gate | Result |
| --- | --- |
| Unit `GamepadInputAdapter.test.ts` | two pads, deadzone, d-pad, replay equality, disconnect, remap |
| Typecheck | passed |

## Claim ceiling

Allowed: Gamepad API polling + policy/replay-shaped seats in the live input path.  
Blocked: every physical device; SOCD product matrix beyond policy field; score movement.
