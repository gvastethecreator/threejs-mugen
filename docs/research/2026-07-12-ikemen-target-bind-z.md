# IKEMEN TargetBind and BindToTarget Z

## Question

How do IKEMEN TargetBind and BindToTarget author and scale logical Z?

## Answer

`TargetBind` accepts three `pos` floats. Its X/Y/Z offsets originate in the owner coordinate space and are converted to the bound target local scale. `BindToTarget` keeps `pos = x,y,postype` and exposes Z separately as `posz`; target Z is converted into actor-local units before actor-local `posz` is added.

The runtime therefore stores optional Z on binding memory and applies direction-specific formulas:

- TargetBind: `(ownerZ + offsetZ) * ownerScale / targetScale`.
- BindToTarget: `targetZ * targetScale / actorScale + posZ`.
- `scale = 320 / localcoord.width`.

Omitted Z remains absent and preserves existing two-dimensional behavior.

## Primary sources

- Ikemen-GO commit `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `src/compiler_functions.go`, `targetBind`: `pos` compiles as three floats: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go>
- Same file, `bindToTarget`: `pos` owns X/Y/postype and `posz` compiles separately: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go>
- Same commit, `src/char.go`, `targetBind` / `bindToTarget`: X/Y/Z scaling and immediate position ownership: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go>

## Remaining boundary

Root imported traces prove both directions. Helper/projectile ownership, pause/hitpause ordering, bind-facing edge cases, and renderer projection remain separate capabilities.
