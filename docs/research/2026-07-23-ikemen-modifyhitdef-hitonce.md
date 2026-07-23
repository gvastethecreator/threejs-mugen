# IKEMEN ModifyHitDef HitOnce Research

Date: 2026-07-23

Status: closed in `c12f54e3`.

## Question

Which bounded static root ModifyHitDef `hitonce` route can the runtime support
with source-backed multi-target direct-contact evidence?

## Source basis

Pinned IKEMEN-GO assigns the `hitonce` field through the shared active HitDef
route, while the compiler registers it as a boolean expression.

- [HitDef hitonce assignment](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7539-L7586)
- [ModifyHitDef receiver delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8329-L8345)
- [HitDef hitonce compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1778-L1800)

The source initializes `hitonce` with a sentinel, defaults it for throws, and
uses it with target membership during direct admission. After a direct contact,
the source consumes a positive value. Those details set the boundaries for the
local slice.

- [HitDef defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L849-L1006)
- [Direct contact admission and consumption](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11395-L11520)

## Local mapping

`HitDefControllerOp` and `ModifyHitDefControllerOp` now carry `hitOnce`. The
bounded ModifyHitDef compiler accepts numeric scalar literals: zero lowers to
false and every nonzero value lowers to true. Omitted input stays distinct from
explicit false.

`RuntimeHitDefControllerDispatchWorld` places the local boolean on each normal
HitDef move and mutates the active move in place. `RuntimeCombatResolutionWorld`
then rejects a later direct target after true `hitOnce` observes a prior local
contact. Its equal-priority queue holds a provisional consumed set, which keeps
one attacker from preparing two trades in the same frame. Priority-clash lookup
also ignores a consumed true move.

The required imported Tag trace arms P4 away from two opposing roots, redirects
`hitonce = 1` from P2 to P4 at `Time = 1`, then moves P4 into both targets. P4
damages P1 for 37, records target id 106, and leaves active P3 at full life.
This proves the field changes later direct target admission rather than only an
active-move snapshot.

## Audit and verification

- Compiler coverage proves false and true static ModifyHitDef lowering and
  rejects dynamic or malformed input.
- HitDef dispatch coverage proves static active-move data and in-place mutation.
- Direct combat coverage proves a consumed true move does not enter priority
  clashes.
- Combat-resolution coverage proves direct plural targets and queued
  equal-priority trades keep the later target untouched.
- Required imported RedirectID trace proves P4 hits P1 once while P3 remains at
  full life.
- Focused `RuntimeCompiler`, `HitDefSystem`, `RuntimeCombatResolutionSystem`,
  `DirectCombatSystem`, and `RuntimeTraceGatePresets` coverage passes 5 files /
  794 tests. Trace-script syntax and diff hygiene pass.

## Deferred

Dynamic expressions, source throw defaults, `targetDrop`, exact target
membership and contact timing, Projectile and Helper receivers, broader team
behavior, `air.juggle`, rollback/netplay, the accumulated TypeScript 7 gate,
full Vitest, aggregate traces, production build, boundaries, and full parity
remain deferred.
