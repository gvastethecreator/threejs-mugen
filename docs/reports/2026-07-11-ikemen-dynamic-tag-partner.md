# IKEMEN dynamic Tag partner checkpoint

## Outcome

TagIn/TagOut `partner` now resolves supported integer expressions from live caller CNS context before caller-relative cyclic same-side selection and aggregate validation.

## Evidence

- Compiler emits normalized deferred partner-ordinal metadata and keeps omitted `self` based on authored partner presence.
- Runtime truncates toward zero, rejects negative results, and records only the resolved concrete operation.
- Same-tick `var(0) + 0.9` selects P5, enters P5-owned state 201, and applies TagIn partner control afterward.
- TagOut targets P5 without defaulting omitted self; P3 remains untouched.
- Negative, missing-target, unavailable-state, malformed tuple, malformed parenthesis, and empty-value paths fail closed.
- [Pinned IKEMEN TagIn/TagOut source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5241-L5398) confirms caller-context `evalI` and caller-relative `partnerTag` use.
- `pnpm test`: 169 files / 1670 tests passed; final fractional-coercion test rerun passed.
- `pnpm typecheck` and `pnpm build`: TypeScript 7 and Vite passed; known large-chunk warning remains.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.
- Visual smoke: N/A; renderer and Studio surfaces are unchanged.

## Audit

Strongest risks were omitted `self` changing while partner remained unresolved and empty text coercing to ordinal zero. Authored parameter presence now owns the default, and empty/malformed values fail compilation. Dynamic negative, missing-target, and selected-state failure tests close mutation rollback. Independent review was unavailable in this host; this is an internal adversarial audit.

## Blocked

Dynamic member/leader, redirects, exact partial-mutation parity, gameplay ownership, and full IKEMEN parity.
