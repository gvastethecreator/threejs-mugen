# IKEMEN PlayerPush geometry research

Date: 2026-07-12
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Official source

IKEMEN derives Clsn group 3 from character size rather than AIR. Push admission first requires size-box Y/X/Z overlap, then requires Clsn2-to-Clsn2 contact unless `SizePushOnly` is asserted.

- [Size box construction](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10028-L10051)
- [Push Y/X/Z and Clsn2 admission](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13648-L13736)

## Implemented contract

- Match roots carry current-frame Clsn2 and imported `size.height` into `RuntimeRootBodyPushWorld`.
- Size-height ranges must overlap in Y after localcoord scaling.
- Current Clsn2 boxes must overlap in world space with facing applied.
- Missing Clsn2 fails closed instead of creating body push from width alone.
- Existing body-width X, logical-Z, team, priority, weight, and push-factor resolution runs only after geometric admission.

## Claim ceiling

Allowed: bounded root Y-size and current-frame Clsn2 admission before PlayerPush separation.

Blocked: full stand/crouch/air/down size-box constants, Clsn overrides/proxies, `SizePushOnly`, MUGEN minimum-width clamp, helpers, exact frame timing, and full parity.
