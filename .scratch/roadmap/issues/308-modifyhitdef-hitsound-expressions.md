# Issue 308 — `ModifyHitDef` `hitsound` expressions

Status: **queued** (T734, 2026-08-11)

## Objective

Close the symmetric Ikemen-only live `ModifyHitDef hitsound` replacement
through root/RedirectID and Helper caller paths, preserving the active sound
reference when the controller omits the field or its caller expression cannot
be resolved.

## Official basis

The pinned Ikemen-GO `149402f` compiler accepts `hitsound` as a prefixed sound
reference plus one or two integer expressions (`compiler_functions.go:
1828-1835`). The shared HitDef sub-run evaluates the prefix and numeric
components in the caller context (`bytecode.go:7621-7626`), and an accepted hit
contact consumes the active sound reference through the hit sound path
(`char.go:11431-11441`). M.U.G.E.N 1.1 documents fresh HitDef `hitsound`, but
does not define live `ModifyHitDef`, so this live claim is Ikemen-only.

## Bounded scope

- static and caller-context dynamic `hitsound` on direct `ModifyHitDef`;
- root/RedirectID and Helper caller evaluation;
- omission/unresolved preservation of the active group/number/prefix;
- accepted hit-contact sound-event and typed `audio:playsnd` evidence.

## Excluded

Fresh sound defaults, `guardsound` mutation, `hitsound.channel`, spark
identity/angle/offset/scale/palette, Projectiles/ModifyProjectile, exact SND
lookup/playback/mixing/channel priority, FightFX/common lookup, renderer
timing, localcoord, teams, rollback and full M.U.G.E.N/Ikemen parity remain
out of scope.

## Evidence plan

Extend the existing sound compiler/runtime/Helper tests and add one required
trace with `VarSet` + `HitDef` + `ModifyHitDef`, a real unguarded hit contact,
preserved channel metadata, and a typed `audio:playsnd` event proving the
caller-resolved hit sound without entering a guard route.
