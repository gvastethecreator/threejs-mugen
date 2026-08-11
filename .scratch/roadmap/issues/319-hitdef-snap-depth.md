# Issue 319 — Fresh `HitDef snap` Z depth

Status: implementation-bounded (T745, 2026-08-11)

## Objective

Carry the third fresh direct `HitDef snap` component through the typed IR,
caller-context evaluation, `GetHitVar(zoff)` metadata, and accepted direct-hit
combat depth. Existing X/Y behavior remains unchanged; an omitted Z stays
omitted/zero rather than inheriting a previous move.

## Source authority

- M.U.G.E.N 1.1 documents `snap=x,y` only. Its upgrade notes explicitly
  removed the old third component, so Z is not claimed as M.U.G.E.N parity.
- Ikemen-GO pin `149402fa` accepts fresh `snap` X/Y/Z and stores the offsets in
  hit metadata before the accepted contact. The local depth projection follows
  the existing bind-to-target local-coordinate conversion rule.
- `snaptime`/bind maintenance is a separate Ikemen seam and is intentionally
  queued for T746; this issue does not claim deferred binding or exact tick
  timing.

## Implementation

- Direct `HitDef` accepts static, mixed, and caller-context dynamic snap
  vectors with one, two, or three components.
- The third dynamic component is retained as `snapZExpression`; malformed
  four-component vectors fail closed.
- Root and Helper dispatch resolve Z in caller context. `RuntimeGetHitVars`
  carries `zoff`, imported static HitDefs retain a third component, and direct
  contact applies the offset to `combatDepth.position` with local-coordinate
  scaling.
- Live `ModifyHitDef`, Projectiles, `snaptime`, deferred bind maintenance, and
  exact Ikemen positioning order remain outside this slice.

## Verification

Focused compiler/runtime/Helper/direct-combat coverage passes (`390/390`),
`pnpm run typecheck` passes, and `git diff --check` passes. Product commit:
`d96b8241`.

The durable imported trace gate is still pending; until it lands this issue is
implementation-bounded rather than a full compatibility closeout.

## Next work

T746 should add fresh `snaptime`/bind duration with a dedicated runtime owner,
tick-order evidence, and a required imported trace. Projectile and live
`ModifyHitDef` snap Z remain separate follow-up seams.
