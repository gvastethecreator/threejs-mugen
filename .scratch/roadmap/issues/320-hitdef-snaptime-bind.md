# Issue 320 — Fresh `HitDef snap` snaptime binding

Status: closed-bounded (T746, 2026-08-11)

## Objective

Carry the fourth fresh direct `HitDef snap` component (`snaptime`) through
typed IR and root/Helper caller-context dispatch. On an accepted unguarded
direct hit, expose the authored snap offsets and create the existing runtime
target binding for the defender. A zero duration clears the same-attacker
binding; a positive duration is consumed by the next target-world tick.

## Source authority

- M.U.G.E.N 1.1 documents `snap=x,y` but not the fourth `snaptime` component.
  The fourth component is therefore an Ikemen-GO compatibility claim, not a
  M.U.G.E.N parity claim.
- Ikemen-GO pin `149402fa` evaluates HitDef parameters in the caller context,
  stores snap offsets in hit metadata, and maintains target bindings through
  the target owner until the binding expires or is cleared.
- The local implementation reuses `RuntimeTargetSystem` target memory and the
  existing `bindToTarget`/tick path; it does not introduce a parallel binding
  store.

## Implementation

- Fresh direct `HitDef snap` accepts one through four components. The first
  three are X/Y/Z offsets; the fourth is `snapTime` and resolves as an integer
  in root and Helper caller context.
- `RuntimeGetHitVars` carries `snapTime`, and `GetHitVar(xoff/yoff/zoff)` keeps
  the authored offsets visible to the receiver.
- Accepted unguarded direct contact remembers the attacker in target memory,
  creates the existing `bindToTarget` relation with the authored offset, and
  lets the next target-world tick apply it. `snaptime=0` clears a binding from
  the same attacker; guards and rejected contacts do not create one.
- Projectiles, live `ModifyHitDef`, dynamic snap Z in those controllers, exact
  rollback/tick parity, and full positioning parity remain separate seams.

## Verification

Focused compiler/runtime/Helper/direct-combat coverage passes (`391/391`),
the required imported trace `synthetic-imported-hitdef-snaptime` passes, `pnpm
run typecheck` passes, and `git diff --check` passes. Product commit:
`d8363efa`; evidence commit: `11623ca3`.

The full `pnpm qa:trace` gate must remain green before promoting this slice
from implementation evidence to the aggregate roadmap closeout.

## Next work

Select the next bounded official/Ikemen seam from the upstream ledger after the
aggregate trace gate. Do not reopen superseded T743/issue 317 or claim that
this slice completes deferred positioning parity.
