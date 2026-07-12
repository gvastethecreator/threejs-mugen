# IKEMEN P2BodyDist X size-box semantics

Date: 2026-07-12

## Primary source

- Ikemen-GO commit `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `src/char.go`, `bodyDist`, lines 8898-8927:
  https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8898-L8927

## Observed contract

- X body distance reads each actor's current size box.
- The caller contributes its facing-relative front edge.
- The opponent contributes front or back according to relative position and facing.
- Positions and box edges convert through each actor's `localcoord`; the result returns in caller-local coordinates.
- The result remains signed. It is not clamped to zero.
- Ikemen-GO includes active `Width` changes. Its source comment records that MUGEN does not.

## Port decision

`RuntimeExpressionContextWorld` projects current S/C/A/L X size boxes into `ExpressionContext`. Imported definitions with nonzero `ikemenversion` compose the one-frame `bodyWidthDelta`; legacy MUGEN definitions omit it. Redirect targets carry their own box and opponent box.

## Blocked scope

Helpers, complete teams/simul opponent selection, Height/OverrideClsn geometry, exact push/corner interaction, persistent-controller timing, and full MUGEN/IKEMEN spacing parity remain blocked.
