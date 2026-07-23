# IKEMEN ModifyHitDef Priority Research

Date: 2026-07-23

Status: closed in `e21ae170`.

## Question

Which bounded static root ModifyHitDef priority route can the runtime support
with source-backed direct-contact evidence?

## Source basis

The pinned IKEMEN-GO `modifyHitDef.Run` resolves one redirected character,
rejects a missing or reversal HitDef, and passes non-RedirectID fields to the
active receiver's shared HitDef.

- [ModifyHitDef receiver delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8329-L8345)

The shared HitDef route evaluates priority with `evalI` and assigns the
priority type from a second integer. Its source comment says MUGEN priority
ranges from zero to MaxInt32 while IKEMEN does not restrict negative values.

- [Priority assignment and range note](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7620-L7624)

The compiler parses the first value as an integer, defaults the second value to
Hit, and selects Hit, Miss, or Dodge from the optional priority-type input.

- [Priority compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1840-L1860)

## Local mapping

`ModifyHitDefControllerOp` accepts finite static `priority` values plus an
optional H/M/D type and truncates toward zero. `RuntimeHitDefControllerDispatchWorld.modify`
writes supplied metadata to the existing active `DemoMove`, retaining move
identity and contact memory. `normalizeRuntimeHitDefPriority` replaces the
old divergent direct-activation and direct-clash clamps with one shared finite
integer normalization rule.

The required imported trace arms a receiver at priority `-4`, redirects
`priority = 12, Hit` through root RedirectID, then brings a priority-`8`
opponent into direct contact. The trace requires the priority-clash runtime
event and proves the receiver leaves the opponent at life `969` while keeping
its own life at `1000`.

## Audit and verification

- Compiler coverage proves static truncation, H/M/D lowering, and dynamic or
  malformed priority rejection.
- HitDef coverage proves direct activation and active-move mutation preserve
  high and negative values outside the historical local clamps.
- Direct-combat coverage proves integer `12` beats `8` and negative priorities
  retain order after truncation.
- Imported-match coverage proves root RedirectID retains `12, Dodge` on one
  active normal receiver.
- The required trace proves direct contact consumes redirected priority `12`
  rather than a clamped value.
- The grouped `RuntimeCompiler`, `HitDefSystem`, `DirectCombatSystem`,
  `RuntimeCombatResolutionSystem`, `CombatResolver`, `PlayableMatchRuntime`,
  `ReversalSystem`, and `RuntimeTraceGatePresets` batch passes 8 files / 1149
  tests. `pnpm typecheck` passes on TypeScript 7; trace-script syntax and diff
  hygiene pass.

## Deferred

Dynamic expressions, exact source integer overflow behavior, full priority-type
arbitration, aliases, source defaults, Projectiles, Helpers, collision
variation, teams, exact source scheduling, rollback/netplay, full Vitest,
aggregate traces, production build, boundaries, and full parity remain
deferred. This focal runtime cut leaves the global checkpoint queued.
