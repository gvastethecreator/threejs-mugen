# IKEMEN ModifyHitDef Sprite Priority Research

Date: 2026-07-23

Status: closed in `f846e862`.

## Question

Which bounded static root ModifyHitDef sprite-priority path can the runtime
support with source-backed direct-contact evidence?

## Source basis

The pinned IKEMEN-GO `modifyHitDef.Run` resolves one redirected character,
rejects a missing or reversal HitDef, and passes every non-RedirectID field to
the active receiver's shared HitDef.

- [ModifyHitDef receiver delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8345)

The shared HitDef path evaluates both sprite-priority fields with `evalI`.

- [Sprite-priority field assignments](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7634-L7637)

At accepted contact, IKEMEN writes p1 priority to the attacker when the move
is not a projectile and the p1 field is set, then writes p2 priority to the
receiver. Its field defaults exist in source, but T400 does not claim local
omitted-value parity.

- [HitDef defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L751-L752)
- [Accepted-contact priority writes](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10846-L10849)

## Local mapping

`ModifyHitDefControllerOp` now accepts finite static fields and truncates them
toward zero. `RuntimeHitDefControllerDispatchWorld.modify` writes only supplied
values to the existing `DemoMove`, retaining move identity and contact memory.
`HitDefSpritePrioritySystem` already reads the move at accepted direct contact
and records profile, role, prior value, source, and support telemetry.

The required imported trace creates an active normal receiver, redirects
`p1sprpriority = 5` and `p2sprpriority = -4` into it before contact, then
proves the receiver reaches `5` as p1 and its target reaches `-4` as p2 with
authored telemetry.

## Audit and verification

- Compiler coverage proves static truncation and rejects dynamic p1/p2 input.
- Active-move coverage proves field-only mutation preserves later state and
  contact metadata.
- Imported-match coverage proves root RedirectID retains both values on its
  active normal receiver.
- The required trace proves accepted direct contact consumes the mutated fields
  rather than only storing them.
- The grouped `RuntimeCompiler`, `HitDefSystem`, `DirectCombatSystem`,
  `CombatResolver`, `PlayableMatchRuntime`, `ReversalSystem`, and
  `RuntimeTraceGatePresets` batch passes 7 files / 1109 tests. `pnpm typecheck`
  passes on TypeScript 7; trace-script syntax and diff hygiene pass.

## Deferred

Dynamic expressions, aliases, source-exact omitted/default policy, collision
priority semantics, Projectile and Helper receivers, renderer ordering,
contact scheduling, teams, rollback/netplay, full Vitest, aggregate traces,
production build, boundaries, and full parity remain deferred. This focal
runtime cut leaves the global checkpoint queued.
