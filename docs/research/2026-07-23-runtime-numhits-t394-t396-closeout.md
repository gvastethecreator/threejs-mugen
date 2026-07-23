# Runtime NumHits T394-T396 Closeout

Date: 2026-07-23

Implementation commit: `c8676b20`.

## Scope closed

- T394: static ReversalDef and root ModifyReversalDef `numhits` reach direct
  reversal contact and the countered actor's state-scoped `ReceivedHits`.
- T395: direct normal HitDef contact records its authored hit count in the
  defender's state-scoped `ReceivedHits`.
- T396: static root ModifyHitDef `numhits` mutates one active normal receiver
  in place through RedirectID.

## Source basis

The pinned IKEMEN-GO source defines `numhits` in the shared HitDef compiler
path, uses that count for direct and reversal contact, and delegates
ModifyHitDef fields to the active receiver's HitDef implementation.

- [Shared numhits compiler field](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1814-L1817)
- [Reversal contact count route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11283-L11300)
- [ModifyHitDef shared delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8340)

## Audit

- Typed ReversalDef, ModifyReversalDef, and ModifyHitDef operations carry
  static integer `hitCount`; omitted mutation input preserves an active move.
- The contact-memory helper changes received hits without changing received
  damage. Direct reversal does not create received damage.
- A newly armed ReversalDef uses one received hit when `numhits` is absent.
- Root ModifyHitDef and ModifyReversalDef retain receiver move identity,
  contact state, and telemetry while changing the authored count.
- Dynamic and malformed ModifyHitDef or ModifyReversalDef count input does not
  lower to a typed operation. Dynamic ReversalDef evaluation remains outside
  this static slice.

## Verification

- Focused Vitest: 6 files / 459 tests passed.
- `pnpm typecheck` passed on TypeScript 7.
- `node --check scripts/qa_traces.cjs` passed.
- `git diff --check` passed; existing CRLF notices only affected tracked docs.

## Deferred

FightScreen combo display, score, dynamic ReversalDef expressions, Projectile
and Helper routes, team behavior, exact source timing, rollback/netplay,
full Vitest, aggregate traces, production build, boundary checks, and full
MUGEN/IKEMEN parity remain outside this closeout. This is a focal runtime
checkpoint, not a global checkpoint.
