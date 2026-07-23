# Runtime ModifyHitDef Fields T397-T398 Closeout

Date: 2026-07-23

Implementation commit: `3239e0f0`.

## Scope closed

- T397: static root ModifyHitDef updates active normal `attr`, `guardflag`,
  and `hitflag` values.
- T398: static root ModifyHitDef updates active normal `id` and `chainid`
  values.

## Source basis

The pinned IKEMEN-GO ModifyHitDef route delegates non-RedirectID values to the
active receiver's shared HitDef. That shared path assigns the five fields in
this cut.

- [ModifyHitDef receiver delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8340)
- [Filter assignments](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7540-L7547)
- [Identity assignments](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7569-L7572)

## Audit

- ModifyHitDef now accepts at least one supported static field; `damage` stays
  optional, so a filter or identity-only update does not rewrite damage.
- The runtime changes only supplied active move fields and keeps move identity,
  contact memory, control state, and omitted values.
- A supplied `id` updates both `targetId` and `hitVars.hitId`; a supplied
  `chainid` updates `hitVars.chainId`.
- Static ID input clamps to the local nonnegative integer boundary. Static
  chain IDs and hit counts truncate to integers.
- Empty, dynamic, malformed, and unsupported payloads do not lower to a typed
  ModifyHitDef operation.

## Verification

- Focused Vitest: 6 files / 467 tests passed.
- `pnpm typecheck` passed on TypeScript 7.
- `node --check scripts/qa_traces.cjs` passed.
- `git diff --check` passed; existing CRLF notices only affected tracked docs.

## Deferred

Other shared HitDef fields, full source grammar and range behavior, dynamic
expressions, nochainid, Projectile and Helper routes, exact contact timing,
teams, rollback/netplay, full Vitest, aggregate traces, production build,
boundary checks, and full MUGEN/IKEMEN parity remain outside this closeout.
This is a focal runtime checkpoint, not a global checkpoint.
