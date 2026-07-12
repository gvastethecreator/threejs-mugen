# MUGEN PlayerPush minimum-width research

Date: 2026-07-12
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

When must root PlayerPush preserve a minimum X width, and how does `localcoord` affect it?

## Official answer

IKEMEN clamps each push size box to at least five world units per side only when the character has no IKEMEN version (`ikemenver == 0.0`). The authored local width is `5 / localscl`, producing the same five-unit world result across character coordinates.

- [IKEMEN-GO PlayerPush width clamp](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13670-L13690)
- [IKEMEN-GO release history for the character `ikemenVersion` key](https://github.com/ikemen-engine/Ikemen-GO/releases)

## Implemented contract

- Character DEF parsing preserves `[Info] ikemenversion` through imported fighter definitions.
- Imported characters without `ikemenversion` or with numeric version `0.0` opt into the MUGEN clamp; native demo and nonzero IKEMEN definitions do not.
- `RuntimeActorConstraintWorld` consumes facing-aware front/back widths derived from the opted-in actor's state size box after the clamp.
- The local minimum is divided by character scale, preserving five world units for 320-wide and 640-wide coordinates.

## Claim ceiling

Allowed: bounded legacy-MUGEN minimum X width during current root PlayerPush separation.

Blocked: malformed-version diagnostic parity, runtime Clsn group-3 overrides, Width/Height interaction with state size boxes, duplicate upstream visitation, helpers, interpolation, and full parity.
