# IKEMEN PlayerPush geometry report

## Outcome

`RuntimeRootBodyPushWorld` no longer pushes roots solely because body-width/depth spans overlap. It now requires size-height Y overlap and current-frame Clsn2 contact before separation.

## Evidence

- Focused tests prove Y-separated roots and disjoint Clsn2 roots produce no admitted pair or movement.
- Full tests: 180 files / 1885 tests passed.
- TypeScript 7 typecheck: passed.
- Build: passed; existing large-chunk advisory remains.
- Boundaries: passed.
- Trace QA: 563/563 artifacts, 532 required and 31 optional; no checksum drift.

## Global port state

- PlayerPush now covers root team policy, priority, weight, push factor, X/Z separation, Y-size admission, and Clsn2 contact.
- Remaining constraint debt: complete state-specific size boxes, Clsn overrides/proxies, SizePushOnly, minimum-width clamp, helpers, exact ties/interpolation, and pause/reset order.

## Boundary

This is not full Clsn3 emulation. Current runtime derives the bounded Y span from imported `size.height` with the engine default fallback and preserves existing body-width X geometry.
