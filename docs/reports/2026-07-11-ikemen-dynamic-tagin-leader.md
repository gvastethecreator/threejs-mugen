# IKEMEN dynamic TagIn leader checkpoint

## Outcome

TagIn `leader` now resolves supported integer expressions from live caller CNS context before stable same-side PlayerNo and explicit Tag-order validation.

## Evidence

- Compiler emits normalized deferred leader-PlayerNo metadata only for TagIn and rejects empty or malformed structure.
- Runtime truncates toward zero, rejects PlayerNo below one, and records only the resolved concrete operation.
- Same-tick `var(0) + 0.9` resolves to stable P3, rotates mutable order to `[p3,p1]`, and preserves stable root ids.
- Zero, negative, opposing P2, missing P5, and non-Tag-mode paths preserve leader/order, state, control, standby, and successful telemetry.
- [Pinned IKEMEN TagIn source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5241-L5321) confirms caller-context `evalI`, one-based subtraction, and leader rotation routing.
- `pnpm test`: 169 files / 1681 tests passed.
- `pnpm typecheck` and `pnpm build`: TypeScript 7 and Vite passed; known large-chunk warning remains.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.
- Visual smoke: N/A; renderer and Studio surfaces are unchanged.

## Audit

Strongest risk was confusing mutable member position with stable PlayerNo or letting an opposing/missing id mutate earlier Tag effects. The resolved value maps directly to stable `pN`; same-side root and Tag-order membership validate before state/control/order/standby mutation. Independent review was unavailable in this host; this is an internal adversarial audit.

## Blocked

TagOut leader, RedirectID mutation, exact partial-mutation parity, gameplay ownership, and full IKEMEN parity.
