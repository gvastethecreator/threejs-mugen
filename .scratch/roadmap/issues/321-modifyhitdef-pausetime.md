# Issue 321 — Live `ModifyHitDef` pause pairs

Status: closed-bounded (T747, 2026-08-11)

## Scope

Carry live Ikemen `ModifyHitDef` `pausetime` and `guard.pausetime` through the
typed controller IR and runtime. Root/RedirectID and Helper callers must
evaluate static, mixed and caller-context dynamic pairs against the active
HitDef. A single component replaces only the authored first component and
preserves the live sibling; omission is a no-op for ModifyHitDef.

Fresh direct HitDef defaults and the existing Projectile pause model are not
reimplemented by this issue.

## Evidence

- Product: `1100d384` (`feat(mugen): support live ModifyHitDef pause pairs`).
- Focused coverage: compiler/runtime/Helper/Playable tests pass, including
  RedirectID caller context and component-preserving mutation.
- Durable trace: `synthetic-imported-modifyhitdef-dynamic-pausetime-golden`
  proves `VarSet -> HitDef -> ModifyHitDef -> hit`, caller `var(0)=3` and
  `var(1)=7`, target memory `77`, and imported `GetHitVar(hitshaketime)=7`.
  Trace/initial/final checksums are `3ac961c7` / `d663c168` / `d0351820`.
- Evidence: `c6c88173` (`test(evidence): gate live ModifyHitDef pause pairs`).
- Aggregate status: `pnpm qa:trace` was attempted after this slice and is
  currently blocked by the existing `synthetic-imported-helper-bind-to-target-redirect`
  missing-target-link gate; this is separate from the passing T747 artifact.

## Source contract

The pinned Ikemen source evaluates `pausetime` and `guard.pausetime` in the
caller and writes only supplied components when `ModifyHitDef` runs against a
live HitDef. M.U.G.E.N 1.1 documents fresh HitDef pause parameters; it does not
provide an official `ModifyHitDef` controller, so the live mutation claim is
Ikemen-only.

## Explicit limits

Exact hitpause/ignorehitpause tick scheduling, negative/overflow behavior,
stacking, Projectile/ModifyProjectile, ReversalDef, team power/topology,
rollback and full M.U.G.E.N/Ikemen pause parity remain open.
