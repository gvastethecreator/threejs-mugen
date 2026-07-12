# IKEMEN ground friction and PosFreeze ownership

## Question

How should imported root X/Z velocity decay, and which axes does `PosFreeze` own?

## Answer

IKEMEN integrates X/Y/Z position before physics. Standing physics multiplies X and Z by one stand-friction value and zeros each below `1 / originLs`; crouching multiplies X and Z by one crouch-friction value without that threshold. `PosFreeze` skips ordinary X/Y/Z velocity integration while preserving MUGEN corner push on X.

For the current player-local model, `originLs = 320 / localcoord.width`, so the standing threshold is `localcoord.width / 320`. Apply this only to imported fighters until demo motion is deliberately migrated. Root `PosFreeze` must next preserve logical Z alongside X/Y; binds and corner-push ordering remain separate work.

## Primary sources

- Ikemen-GO commit `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `src/char.go` lines 9687-9725: PosFreeze integration branch and S/C X/Z physics: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9687-L9725>
- Same commit, `src/char.go`, `CharMovement.init`: defaults `stand.friction = 0.85`, `crouch.friction = 0.82`: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go>
- Same commit, `src/char.go`, `getStandFriction` / `getCrouchFriction`: get-hit states may override constants through HitDef values: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go>
- Same commit, `src/compiler.go` lines 3305-3323: `PosFreeze` owns one boolean `value`, default true: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go#L3305-L3323>

## Remaining uncertainty

The sandbox currently exposes nonstandard axis-specific `PosFreeze x/y` compatibility. Preserve it, but freeze logical Z only for the official full-value/default route so that existing axis-specific fixtures do not gain undocumented behavior.
