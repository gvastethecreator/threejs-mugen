# Issue 307 — `ModifyHitDef` `guardsound` expressions

Status: **queued** (T733, 2026-08-11)

## Objective

Close the next Ikemen-only live `ModifyHitDef guardsound` replacement through
root/RedirectID and Helper caller paths, preserving the active sound reference
when the controller omits the field or its caller expression is unresolved.

## Official basis

The pinned Ikemen-GO `149402f` compiler accepts `guardsound` as a prefixed
sound reference plus one or two integer expressions
(`compiler_functions.go:1831-1835`). The shared HitDef sub-run evaluates the
prefix and numeric components in the caller context
(`bytecode.go:7621-7626`), and an accepted guard contact consumes the active
group/number/prefix/channel through the guard sound path
(`char.go:11448-11458`). M.U.G.E.N 1.1 documents fresh HitDef `guardsound`,
but does not define live `ModifyHitDef`, so this live claim is Ikemen-only.

## Bounded scope

- static and caller-context dynamic `guardsound` on direct `ModifyHitDef`;
- root/RedirectID and Helper caller evaluation;
- omission/unresolved preservation of the active group/number/prefix;
- accepted guard-contact sound-event evidence, reusing the current bounded
  audio telemetry and channel metadata.

## Excluded

Fresh sound defaults, `hitsound`, `guardsound.channel`, spark identity/angle/
offset/scale/palette, Projectiles/ModifyProjectile, exact SND playback or
mixing/channel priority, FightFX/common lookup, renderer timing, localcoord,
teams, rollback and full M.U.G.E.N/Ikemen parity remain out of scope.

## Evidence plan

Extend compiler/runtime/Helper sound tests and add one required trace with
`VarSet` + `HitDef` + `ModifyHitDef`, a real guard contact, preserved channel,
and a typed `audio:playsnd` event proving the caller-resolved sound reference
without entering the hit route.
