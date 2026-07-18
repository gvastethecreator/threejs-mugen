# Research: SOCD resolution authority

Date: 2026-07-18
Ticket: [T268](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/268-socd-resolution-authority.md)

## Question

How can the runtime show which source selected `SOCDResolution` when explicit
runtime options, P1/P2 imported packages, and profile defaults coexist?

## Sources

- [IKEMEN-GO input implementation](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/input.go#L494-L629)
  is the behavior reference for the selected mode values and stateful modes.
- Local source contract: `src/mugen/runtime/RuntimeInput.ts`.
- Match ownership boundary: `src/mugen/runtime/PlayableMatchRuntime.ts`.
- Imported package fields: the existing `RuntimeCharacterDefinition` input
  metadata consumed by the match constructor.

## Findings

- The mode value has multiple legitimate inputs, but the runtime previously
  exposed only the selected number, hiding source and conflict information.
- A conflict between P1 and P2 is an unresolved policy question. Changing the
  existing P1-compatible result in this slice would add behavior drift while
  the match/system ownership decision is still open.
- Invalid explicit options must be diagnosed without blocking valid package or
  profile fallback.

## Decision

Introduce `RuntimeSocdResolutionAuthority/v0` with selected resolution, source,
package values, and diagnostics. Precedence is valid runtime option, then
package conflict with explicit P1 fallback, then P1, P2, and profile default.
Conflict and invalid-option diagnostics stay observable. The authority is
returned defensively from `PlayableMatchRuntime`.

## Outcome and uncertainty

Implemented in `b241cc65`; focused coverage is `2` files / `270` tests. This is
an observability and precedence contract, not a final match/system config
decision. Replay/netplay serialization and package conflict adjudication remain
open.

## Next decision

Use the authority record when choosing the future match-level configuration
owner; do not broaden input parity claims until raw event/buffer ownership is
characterized.
