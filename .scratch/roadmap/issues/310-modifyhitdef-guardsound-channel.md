# Issue 310 — `ModifyHitDef` `guardsound.channel`

Status: **queued** (T736, 2026-08-11)

## Objective

Close the next bounded Ikemen-only live `ModifyHitDef guardsound.channel`
replacement through root/RedirectID and Helper caller paths, preserving the
active guard channel when the parameter is omitted or unresolved.

## Official basis

The pinned Ikemen-GO `149402f` HitDef subcompiler accepts `guardsound.channel`
as a separate integer parameter and the shared `ModifyHitDef` `runSub` evaluates
it in the original caller context before mutating the redirected active HitDef.
This is the guard-side counterpart to T735. Fresh defaults, playback/mixing and
full audio parity must remain separate claims.

## Bounded scope

- static and caller-context dynamic `guardsound.channel` on live `ModifyHitDef`;
- root/RedirectID and Helper caller evaluation;
- omission/unresolved preservation of the active guard channel;
- typed guard-contact audio metadata and one required accepted-guard trace.

## Excluded

Fresh defaults, `hitsound.channel`, sound group/index replacement, exact SND
lookup/playback/mixing/priority, Projectiles, ModifyProjectile, renderer timing,
teams, rollback and full M.U.G.E.N/Ikemen audio parity remain out of scope.
