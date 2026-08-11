# Issue 318 — Live `ModifyHitDef snap` X/Y expressions

Status: closed-bounded (T744, 2026-08-11)

## Objective

Close the live Ikemen-compatible `ModifyHitDef snap` X/Y seam for root and
RedirectID callers, plus Helper-owned dispatch. A single authored component
replaces X and preserves the active Y/Z offsets; a pair replaces X/Y and keeps
the active Z offset; omission remains a no-op.

## Source authority

- M.U.G.E.N 1.1 documents `snap=x,y` as a direct HitDef positioning offset.
- Ikemen GO pin `149402f` evaluates `snap` in the caller and reuses the active
  HitDef subroutine for live mutation; only authored components are written.
- The bounded local consumer applies the resulting `hitOffset` on accepted
  direct contact and exposes `GetHitVar(xoff/yoff/zoff)` metadata.

## Result

`ModifyHitDef` now retains static, mixed, and caller-context dynamic X/Y pairs.
Root/RedirectID and Helper dispatch mutate only authored components while
preserving active siblings and Z. Focused compiler/runtime/Helper coverage and
the Playable RedirectID integration pass; the product commit is
`f9ae0eca`.

## Explicit exclusions

Fresh snap defaults and direct dynamic X/Y remain covered by T742. Snap Z and
`snaptime`, Projectiles, guard snap, exact bind/tick/localcoord/facing and full
M.U.G.E.N/Ikemen positioning parity remain outside T744.
