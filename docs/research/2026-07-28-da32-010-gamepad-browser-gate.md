# DA32-010 virtual gamepad browser gate

Date: 2026-07-28
Commits: `1c3aac8e`, `a8111e89`, `b826de72`

## Scope

Close the virtual browser probe lane for the playable runtime. The gate uses
injected `Gamepad` objects and dispatches `gamepadconnected` and
`gamepaddisconnected` events. It does not use a physical controller.

## Route

`/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo`

Viewports:

- Desktop: `1440x900`
- Mobile: `390x844`

## Clauses

- Standard P1 connects at browser index 0; button 0 maps to logical action `a`.
- Non-standard P2 connects at browser index 7; the visible Pads metric reports
  the mapping warning.
- P1 disconnect clears its diagnostic seat and active actions.
- Keyboard `z` maps to runtime input `a` while P1 gamepad is disconnected.
- P1 reconnects in the same logical seat with stable id `Virtual Standard Pad`,
  device index 4, and button 1; the diagnostic reports logical action `b`.
- The adapter resolves sparse browser arrays by remembered device id before
  configured index fallback, so an index change does not drop the logical seat.
  Duplicate ids become ambiguous and use configured index ownership, which
  keeps two identical controllers on separate seats.
- The bridge exposes copied keyboard state, copied seat diagnostics, and the
  last eight device events for browser evidence.

## Evidence

`pnpm qa:browser:da32-010-gamepad` passed on clean subject `b826de72`:

- desktop and mobile cases: pass
- semantic clauses per case: 12/12
- unexpected console/page errors: 0
- horizontal overflow: 0

Report: `docs/evidence/da32/da32-010-gamepad-browser-gate.json`.
Screenshots: `docs/evidence/da32/browser/da32-010-gamepad-desktop.png` and
`docs/evidence/da32/browser/da32-010-gamepad-mobile.png`.

## Source notes

- [MDN: Implementing controls using the Gamepad API](https://developer.mozilla.org/en-US/docs/Games/Techniques/Controls_Gamepad_API)
  documents polling through `navigator.getGamepads()` and connection events.
- [MDN: `Gamepad.mapping`](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/mapping)
  defines the known `standard` mapping value used by the diagnostic.

## Claim ceiling

The gate supports the named virtual browser route and viewports. Physical
hardware, browser-wide parity, screen-reader flow, contrast, and full
MUGEN/IKEMEN compatibility remain open.
