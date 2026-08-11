# T736 research — live `ModifyHitDef guardsound.channel`

## Pinned source

- Ikemen-GO pin `149402f` compiles `guardsound.channel` as a distinct integer
  HitDef parameter in `compiler_functions.go` near lines 1836-1838.
- `ModifyHitDef` reuses the active HitDef subroutine, so the expression is
  evaluated in the original caller context before a RedirectID target is
  mutated. This is distinct from fresh HitDef defaults and from the hit-side
  `hitsound.channel` slice closed in T735.
- Guard contact consumes the guard channel for the guard sound event. The
  bounded port therefore carries the finite channel through typed runtime
  audio metadata but does not claim exact SND lookup, mixing, priority, or
  renderer timing.

## Implemented seam

`ModifyHitDefControllerOp.guardSoundChannel` is a typed `number|string` value.
The root/RedirectID and Helper dispatchers resolve it once in caller context,
truncate finite values, and retain the active channel when the expression is
omitted or unresolved. `DemoMove.guardSoundChannel` is selected only for
guarded contact presentation; hit contacts continue to use
`hitSoundChannel`.

## Evidence and boundaries

The focused compiler/runtime/contact suites pass `338/338`. The required
imported guard trace
`synthetic-imported-modifyhitdef-dynamic-guardsound-channel.json` resolves
`var(2)=8`, emits a typed guard `PlaySnd` event on channel 8, and excludes hit,
override, and reversal routes. Its trace checksum is `a689adf2` and final
checksum is `d5bc517f`. Aggregate QA passes `823/823` artifacts (`789`
required, `34` optional).

Fresh defaults, sound references, exact playback/mixing/priority, Projectiles,
ModifyProjectile, teams, rollback, and full M.U.G.E.N/Ikemen audio parity are
not claimed.
