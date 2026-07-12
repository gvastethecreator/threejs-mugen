# IKEMEN Depth and ScreenBound RedirectID research

Date: 2026-07-12
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Official source

IKEMEN compiles optional integer `redirectid` for both controllers before their payload:

- [ScreenBound compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L3269-L3302)
- [Depth compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L6311-L6344)
- [RedirectID controller contract](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)

## Implemented contract

- Static and dynamic RedirectID expressions survive typed `Depth` and `ScreenBound` lowering.
- Runtime resolves the integer against the existing IKEMEN PlayerID registry.
- Live root targets can receive the controller while telemetry is attributed to that target.
- Missing, negative, malformed, helper-only, or non-IKEMEN destinations fail closed without applying the controller.
- Existing self-owned behavior remains unchanged when `redirectid` is omitted.
- The same handler is threaded through playable, active Tag, paused, and hitpause-ignored root controller paths.

## Claim ceiling

Allowed: root-to-root RedirectID for `Depth` and `ScreenBound`, including dynamic redirect expression lookup and fail-closed invalid IDs.

Blocked: helper destinations, exact redirected dynamic payload evaluation context, recursive redirects, warning parity, exact hitpause/reset order, broader controller RedirectID coverage, and full IKEMEN parity.
