# T734 research — live `ModifyHitDef hitsound` expressions

## Decision

Implement the smallest symmetric live sound-reference slice: a direct
`ModifyHitDef` may replace the active `hitsound` group/index and optional `F` or
`S` prefix in root/RedirectID and Helper caller contexts. Static refs are kept
as authored; dynamic/mixed refs resolve once against the caller. Omission or a
non-finite/unavailable caller value is a no-op that preserves the active ref.

## Official ledger

- Pinned Ikemen-GO `149402f`, commit `149402fa`: `compiler_functions.go`
  `1828-1835` compiles prefixed hitsound group/index expressions;
  `bytecode.go` `7621-7626` evaluates the active HitDef subrun in the caller;
  `char.go` `11431-11441` consumes the resolved hit sound on accepted hit.
- M.U.G.E.N 1.1 documents fresh `HitDef hitsound` as a common/player SND
  group/index ref, but has no live `ModifyHitDef` controller. The live claim is
  consequently Ikemen-only.

## Local data flow

`ControllerOps` now retains static `hitSound` or dynamic
`hitSoundExpression`; `HitDefSystem.modify` mutates the active
`hitSoundValue` only after a finite resolver result. Existing root and Helper
sound resolvers already evaluate the same `Fvar`/`var` expressions in caller
context. Contact presentation emits the resolved ref through the existing
typed `audio:playsnd` event without claiming browser playback parity.

## Evidence and limits

Focused compiler/runtime/Helper coverage is `301/301`. Required artifact
`synthetic-imported-modifyhitdef-dynamic-hitsound.json` has trace checksum
`8d56e467` and final checksum `d2d70840`; it proves a real unguarded hit,
RedirectID target `77`, raw `Fvar(0),var(1)`, resolved `F6,4`, and typed contact
audio. Aggregate QA is `821/821` (`787` required, `34` optional).

This does not cover fresh defaults, channels, exact SND/FightFX lookup,
playback/mixing/priority, Projectiles, ModifyProjectile, renderer timing,
teams, rollback or full M.U.G.E.N/Ikemen audio parity.
