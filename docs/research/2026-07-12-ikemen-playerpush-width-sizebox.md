# IKEMEN PlayerPush Width and size-box research

Date: 2026-07-12
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

Which X geometry must PlayerPush use, and how does the `Width` controller modify it?

## Official answer

IKEMEN stores current front/back size width, initializes it from character base width, and resets it to base outside hitpause when no Width controller remains active. `setWidth` adds authored front/back values to base width. Clsn group 3 is generated from that current size, and PlayerPush computes X overlap and X/Z normalization from the resulting box.

- [IKEMEN-GO size width initialization](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L3549-L3556)
- [IKEMEN-GO Width composition](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7676-L7684)
- [IKEMEN-GO one-frame size reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11811-L11822)
- [IKEMEN-GO Clsn3 size projection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10029-L10042)
- [IKEMEN-GO PlayerPush X overlap](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13692-L13715)

## Implemented contract

- Root PlayerPush derives front/back X widths from the selected S/C/A/L size box for every MUGEN and IKEMEN actor.
- Bounded active `Width player/value` output is retained as a one-frame delta and added to state size-box X.
- Reset removes the transient delta while preserving historical `bodyWidth` telemetry and expression behavior.
- X overlap uses exact facing-aware interval intersection, including contained/asymmetric boxes; normalized X/Z selection consumes those same spans.
- Legacy MUGEN five-world-unit clamping remains the final minimum over composed size geometry.

## Claim ceiling

Allowed: bounded positive Width delta composition over current root size-box X for PlayerPush.

Blocked: exact negative/zero Width semantics, imported size-box ownership for `P2BodyDist X`, hitpause persistence, Height composition, Edge width, OverrideClsn group 3, helpers, and full parity.
