# IKEMEN ModifyHitDef Kill Research

Date: 2026-07-23

Status: closed in `a0b3617a`.

## Question

Which bounded static root ModifyHitDef kill route can the runtime support with
source-backed direct and guarded contact evidence?

## Source basis

The pinned IKEMEN-GO `modifyHitDef.Run` resolves one redirected character,
rejects a missing or reversal HitDef, and passes every non-RedirectID field to
the active receiver's shared HitDef.

- [ModifyHitDef receiver delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8329-L8345)

The shared HitDef route evaluates `kill` and `guard.kill` as booleans. The
compiler registers each as a boolean HitDef parameter.

- [Kill field assignments](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7539-L7580)
- [Kill field compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1778-L1783)

## Local mapping

`ModifyHitDefControllerOp` now carries static `kill` and `guardKill`. The
bounded compiler accepts numeric scalar literals only: zero lowers to false
and any nonzero value lowers to true. It keeps omitted fields distinct from
explicit true so a later controller can restore a false active move to true.

`RuntimeHitDefControllerDispatchWorld.modify` writes supplied values to the
existing active `DemoMove` and retains its identity plus contact memory. The
existing direct and guard damage paths then consume the changed fields.

The required normal trace redirects `kill = 0` into a receiver with 2000
direct damage and leaves its target at one life. The guarded trace uses the
existing Tag fixture only to give held-back input to the defender while the
root caller stays in state 0. It redirects `guard.kill = 0` to an active
receiver with 2000 guard damage and leaves the guarded target at one life.
That fixture does not claim team behavior.

## Audit and verification

- Compiler coverage proves false and true static lowering and rejects dynamic
  or malformed values.
- Active-move coverage proves both values mutate in place while contact memory
  remains intact.
- Imported-match coverage proves root RedirectID can first clear and then
  restore both fields on one active receiver.
- Required traces prove direct and guarded lethal contact consume false values
  rather than only recording them.
- The grouped `RuntimeCompiler`, `HitDefSystem`, `DirectCombatSystem`,
  `RuntimeCombatResolutionSystem`, `CombatResolver`, `PlayableMatchRuntime`,
  `ReversalSystem`, and `RuntimeTraceGatePresets` batch passes 8 files / 1151
  tests. `pnpm typecheck` passes on TypeScript 7; trace-script syntax and diff
  hygiene pass.

## Deferred

Dynamic expressions, `fall.kill`, exact source boolean/default behavior,
Projectile and Helper receivers, broader team behavior, exact source timing,
rollback/netplay, full Vitest, aggregate traces, production build, boundaries,
and full parity remain deferred. This focal runtime cut leaves the global
checkpoint queued.
