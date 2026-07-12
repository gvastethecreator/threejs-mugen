# IKEMEN OverrideClsn research

Date: 2026-07-12

## Official contract

Source revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

- [`OverrideClsn` compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L7036-L7056) accepts `RedirectID`, required `group`, optional expression `index`, and optional four-value expression `rect`.
- [Group parser](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go#L6474-L6495) maps `None`, `Clsn1`, `Clsn2`, and `Size` to groups 0-3.
- [Runtime controller](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L15165-L15215) evaluates in caller context, scales rect values into a redirected target localcoord, normalizes both axes, clears all modifiers for group 0, and otherwise appends one modifier.
- [Collision projection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10015-L10078) applies modifiers over AIR Clsn1/Clsn2 or the current Width/Height size box. A zero rect deletes one/all boxes; index `-1` modifies all; an out-of-range index appends one box.
- [Per-tick reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11631-L11636) clears modifiers even during hitpause.

## Port decision

The TypeScript runtime stores ordered one-frame modifiers on each root. `RuntimeCollisionOverrideWorld` owns compile-fallback mutation and pure group projection. `RuntimeFrameWorld` projects groups 1/2 for snapshots and current collision reads; root PlayerPush composes group 3 after Width/Height over the current S/C/A/L size box. Frame-start reset covers normal, pause, and hitpause branches.

Static controllers lower to `collision:overrideclsn`; dynamic index/rect expressions resolve in caller context. Root RedirectID uses the existing exact-id root boundary and scales caller-authored rectangles by target width / caller width.

## Limits

- Clsn2 contact and size-box PlayerPush consume current overrides. Clsn1 updates before HitDef/ReversalDef creation are covered.
- A Clsn1 override authored after the current bounded HitDef or ReversalDef has captured its attack box does not yet reproduce IKEMEN end-of-controller-loop collision ordering.
- Helpers, Clsn proxies, transforms/angles, projectile namespaces, broad redirects, and full collision-trigger parity remain blocked.
