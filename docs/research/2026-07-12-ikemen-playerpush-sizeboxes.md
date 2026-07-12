# IKEMEN PlayerPush state size boxes research

Date: 2026-07-12
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Official source

IKEMEN initializes stand/crouch/down size boxes to `-16,-60,16,0` and air to `-12,-60,12,0`. Legacy `ground.front`, `ground.back`, `air.front`, `air.back`, and `height` seed those bases; `stand.sizebox`, `crouch.sizebox`, `air.sizebox`, and `down.sizebox` can replace each four-edge box.

- [Size defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L350-L357)
- [Legacy and state-size parsing](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L3986-L4006)
- [State-dependent base edges](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7617-L7664)

## Implemented contract

- CNS `[Size]` parsing preserves semantic left/top/right/bottom values for four-value `*.sizebox` fields.
- `resolveRuntimePushSizeBox` selects stand/crouch/air/down from runtime `stateType` S/C/A/L.
- Legacy ground/air/height constants seed compatible bases when no state override exists.
- Reversed authored coordinates normalize before Y admission.
- Match roots use the selected box each frame before Clsn2 and X/Z separation.

## Claim ceiling

Allowed: root PlayerPush size-box selection from imported legacy and IKEMEN state-specific constants.

Blocked: runtime Clsn group-3 overrides, Width/Height controller deltas against state boxes, MUGEN minimum-width clamp, SizePushOnly, helpers, and full parity.
