# ADR 0032: imported Projectile HitFlag default provenance

- Status: accepted bounded
- Date: 2026-07-18
- Planning: `0fabf9cc`
- Implementation: `9b0122fa`
- Regression fixture correction: `2f65c1c6`

## Context

Elecbyte defines Projectile as inheriting HitDef parameters, and omitted
HitDef `hitflag` defaults to `MAF`. T264 restored that provenance for imported
direct and Helper HitDef dispatch, but Projectile spawn input still left an
omitted field unresolved. The runtime must not turn a dynamic raw CNS string
into a static default, and a live ModifyProjectile mutation is not a new spawn.

## Decision

Carry an optional `defaultHitFlag` on `RuntimeProjectileSpawnInput`. Resolve a
typed operation value first, then a static raw controller value, then the
source-scoped default only when the raw parameter is absent. Pass the default
from the root/state-owner effect spawn boundary and forward the existing T264
Helper default into Helper Projectile creation. Preserve demo/synthetic
omission and dynamic raw string behavior. Keep ModifyProjectile omission
unchanged.

Synthetic traces that deliberately attack a lie-down `StateType L` target now
author `hitflag = D` explicitly. This keeps their down-cornerpush intent
stable while allowing the runtime `MAF` default to reject lie-down targets as
the documented rule requires.

## Evidence

- [Elecbyte HitDef reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
  documents omitted `hitflag = MAF`.
- [Elecbyte Projectile reference](https://elecbyte.com/mugendocs-11b1/sctrls.html#Projectile)
  documents HitDef parameter inheritance for Projectile.
- [Pinned IKEMEN HitDef reset](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L3486-L3522)
  anchors the upstream default initialization.
- Focused coverage passes `3` files / `104` tests. The grouped suite passes
  `230/230` files / `2424/2424` tests, TypeScript 7, build, boundaries,
  redirect boundary, diff hygiene, and trace QA `633/633` artifacts.

## Claim ceiling

This ADR covers imported Projectile HitFlag default provenance at spawn only.
It does not claim dynamic expression evaluation, ModifyProjectile defaulting,
projectile pause/contact timing, reversals, clashes, exact `acttmp`/`hittmp`,
rollback, or full MUGEN/IKEMEN parity.
