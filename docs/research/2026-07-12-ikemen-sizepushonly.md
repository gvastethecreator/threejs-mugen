# IKEMEN AssertSpecial SizePushOnly research

Date: 2026-07-12
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Official contract

IKEMEN performs size-box Y/X/Z admission first. It then permits push when `SizePushOnly` is active or when Clsn2 boxes contact.

- [PlayerPush SizePushOnly branch](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13648-L13736)

## Implemented contract

- `AssertSpecial SizePushOnly` lowers into actor-local normalized flag `sizepushonly`.
- Match root projection exposes that flag to `RuntimeRootBodyPushWorld` each frame.
- Either root asserting the flag bypasses only Clsn2 contact.
- Team policy and size-box Y/X/Z admission remain mandatory.
- Flag lifetime follows existing per-frame AssertSpecial reset/application order.

## Claim ceiling

Allowed: bounded root SizePushOnly bypass of Clsn2 for PlayerPush.

Blocked: helpers, Clsn overrides/proxies, exact duplicate pair visitation, pause timing, combined required trace, and full parity.
