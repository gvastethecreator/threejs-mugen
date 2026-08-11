# T737 research — live `ModifyHitDef guard.velocity` Y/Z

Date: 2026-08-11  
Issue: [311](../issues/311-modifyhitdef-guard-velocity-yz.md)  
Status: closed-bounded

## Pinned upstream contract

The pinned Ikemen-GO source is commit `149402f`. Its HitDef subcompiler accepts
one-to-three float components for `guard.velocity`; `ModifyHitDef` reuses the
same subcompiler and evaluates authored components in the original caller
context. Fresh HitDef defaults are separate from live mutation: missing
components are finalized only when a new HitDef is created, while an active
`ModifyHitDef` replaces supplied components and leaves omitted components alive.
Ground-guard contact publishes the effective X/Y/Z metadata through the
existing GetHitVar/guard-velocity path.

Relevant pinned seams:

- `compiler_functions.go` around 2126-2128 compiles `guard.velocity`; the
  `ModifyHitDef` sub-parameter path is reused around 2286-2293.
- `bytecode.go` around 7817-7823 evaluates authored float components and around
  8332-8355 runs `ModifyHitDef` against the active HitDef without a fresh reset.
- `char.go` around 737-741 and 890-891 establishes fresh defaults; around
  10977-10991 selects ground guard velocity at contact and around 11198-11200
  persists the authored/effective metadata.

M.U.G.E.N 1.1 documents the ground-guard X parameter (`sctrls.html` around
280-281 and 1609-1612). Y/Z are therefore an Ikemen extension and are not
claimed as M.U.G.E.N parity.

## Local implementation map

- `src/mugen/compiler/ControllerOps.ts` keeps static, mixed, and dynamic
  component presence in the ModifyHitDef IR and rejects malformed triples.
- `src/mugen/runtime/HitDefSystem.ts` resolves each authored component in caller
  context, mutates only supplied X/Y/Z values, and preserves omitted values.
- `src/mugen/runtime/PlayableMatchRuntime.ts` and the shared Helper resolver
  expose the `guard.velocity` scalar/pair callback used by the dispatch seam.
- `src/mugen/runtime/DirectCombatSystem.ts` and the existing CombatResolver /
  GetHitVar path consume the resulting ground-guard vector.

## Evidence and claim boundary

Focused compiler/runtime coverage is `240/240`; typecheck and diff checks pass.
The required trace
`synthetic-imported-modifyhitdef-dynamic-guard-velocity-yz.json` proves a root
caller with `var(0..2)=-3,-4,6`, RedirectID mutation of an active target HitDef,
real ground guard contact, target ownership, and typed x/y/z guard metadata.
Trace/final checksums are `a2eb52db` / `f0fb19a8`; aggregate QA is `824/824`
artifacts (`790` required, `34` optional).

The bounded claim is root/RedirectID live `ModifyHitDef` component replacement,
including single/pair/triple preservation and accepted ground-guard metadata.
Fresh default recalculation, air guard, Projectiles, exact physics/tick timing,
cornerpush, teams, rollback, and full M.U.G.E.N/Ikemen guard parity remain
explicitly deferred. The next boundary is Helper-owned live mutation (T738).
