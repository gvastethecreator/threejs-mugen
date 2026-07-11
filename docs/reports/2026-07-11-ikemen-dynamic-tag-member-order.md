# IKEMEN dynamic Tag member-order checkpoint

## Outcome

TagIn/TagOut `memberno` now resolves supported integer expressions from live caller CNS context before one-based mutable Tag-order validation and aggregate mutation.

## Evidence

- Compiler emits normalized deferred member-position metadata and rejects empty or malformed structure.
- Runtime truncates toward zero, rejects positions below one, and records only the resolved concrete operation.
- Same-tick `var(0) + 0.9` resolves to position 2 and swaps mutable P1/P3 order while stable roots and leader remain fixed.
- Zero, negative, out-of-range, and non-Tag-mode paths preserve order, state, control, standby, and successful telemetry.
- [Pinned IKEMEN TagIn/TagOut source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5241-L5398) confirms caller-context `evalI`, one-based subtraction, and `changeTagOrder` routing.
- `pnpm test`: 169 files / 1675 tests passed.
- `pnpm typecheck` and `pnpm build`: TypeScript 7 and Vite passed; known large-chunk warning remains.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.
- Visual smoke: N/A; renderer and Studio surfaces are unchanged.

## Audit

Strongest risk was resolving a valid number but mutating order outside explicit Tag ownership or after another Tag effect. Resolution rejects non-positive values first; existing `canSwapMember` validates mode, caller, and range before all state/control/standby mutation. Independent review was unavailable in this host; this is an internal adversarial audit.

## Blocked

Dynamic leader, redirects, exact partial-mutation parity, gameplay ownership, and full IKEMEN parity.
