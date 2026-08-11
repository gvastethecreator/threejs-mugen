# Issue 309 — `ModifyHitDef` `hitsound.channel`

Status: **closed-bounded** (T735, 2026-08-11)

## Objective

Close the next bounded Ikemen-only live `ModifyHitDef hitsound.channel`
replacement through root/RedirectID and Helper caller paths, preserving the
active channel when the parameter is omitted or the caller expression cannot
be resolved. The scope is the channel integer only; sound group/index
replacement is already closed by T734.

## Official basis

The pinned Ikemen-GO `149402f` HitDef subcompiler accepts
`hitsound.channel` as one integer parameter alongside `hitsound`, and the
shared `ModifyHitDef` `runSub` evaluates the parameter in the original caller
context before mutating the redirected active HitDef. M.U.G.E.N 1.1 documents
`hitsound.channel` for fresh HitDef, but not live `ModifyHitDef`; this slice is
therefore Ikemen-only for the live mutation.

## Bounded scope

- static and caller-context dynamic `hitsound.channel` on live `ModifyHitDef`;
- root/RedirectID and Helper caller evaluation;
- omission/unresolved preservation of the active channel;
- typed contact audio metadata and one required accepted-hit trace.

## Excluded

Fresh HitDef channel defaults, `guardsound.channel`, sound group/index changes,
exact SND lookup/playback/mixing/priority, FightFX/common lookup, Projectiles,
ModifyProjectile, renderer timing, localcoord, teams, rollback and full
M.U.G.E.N/Ikemen audio parity remain out of scope.

## Evidence plan

Extend the compiler/runtime/Helper tests with static, dynamic, malformed,
omitted and unresolved channel cases. Add one required trace with VarSet,
HitDef, RedirectID ModifyHitDef and accepted hit contact; require the typed
audio event to retain the channel and forbid guard/override/reversal routes.

## Resultado T735

- `ModifyHitDef hitsound.channel` now compiles as a typed integer expression,
  including caller-context dynamic values; malformed input fails closed.
- Root/RedirectID and Helper dispatch mutate the active HitDef only when the
  value resolves to a finite integer. Omitted or unresolved values preserve the
  live channel.
- Accepted normal-hit presentation carries the channel into the typed
  `PlaySnd` operation and `RuntimeSoundEvent`; guard contacts do not consume it.
- Required trace: `synthetic-imported-modifyhitdef-dynamic-hit-sound-channel`
  proves `VarSet -> HitDef -> ModifyHitDef -> accepted hit`, channel `7`, and
  excludes guard, override, and reversal routes.

Fresh HitDef defaults, `guardsound.channel`, sound lookup/mixing/priority,
Projectiles, ModifyProjectile, exact playback timing, teams, rollback, and full
audio parity remain explicitly out of scope.
