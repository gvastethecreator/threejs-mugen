# T735 research — live `ModifyHitDef hitsound.channel`

## Pinned upstream contract

The local Ikemen-GO pin `149402f` is authoritative for this bounded cut:

- `src/compiler_functions.go:1827-1829` accepts `hitsound.channel` as one
  integer HitDef parameter.
- `src/bytecode.go` evaluates the integer in `hitDef.runSub` using the caller
  context; `ModifyHitDef` reuses that path against the active HitDef, including
  a redirected target.
- `src/char.go` stores the channel on the HitDef and includes it in the normal
  hit sound parameters. The guard channel is a separate parameter and is not
  part of T735.
- Fresh HitDef defaults come from engine data (`char.go` new HitDef path) and
  are intentionally excluded here; this issue is only live mutation.

## Local seams

- `src/mugen/compiler/ControllerOps.ts` preserves the parameter as
  `ModifyHitDefControllerOp.hitSoundChannel?: number|string`.
- `src/mugen/runtime/HitDefSystem.ts` resolves it once in the root/Helper caller
  context and writes `DemoMove.hitSoundChannel` only on a finite result.
- `src/mugen/runtime/RuntimeContactPresentationSystem.ts` selects the field
  only for normal hits and includes it in the recorded `playsnd` operation.
- `src/mugen/runtime/AudioEventSystem.ts` emits the same integer in the typed
  `RuntimeSoundEvent`; existing trace schemas already support `channel`.

## Verification contract

The focused compiler, runtime, Helper, audio, and contact-presentation suites
cover static, dynamic, malformed, omitted, unresolved, and guard-exclusion
branches. The required imported trace proves caller `var(2)=7` survives the
RedirectID mutation and reaches an accepted hit's `PlaySnd` event.
