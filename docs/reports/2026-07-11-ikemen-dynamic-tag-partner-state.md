# IKEMEN dynamic Tag partner-state checkpoint

## Outcome

TagIn/TagOut `partnerstateno` now resolves supported integer expressions from live caller CNS context while partner identity remains static and state ownership remains local to the selected partner.

## Evidence

- Compiler emits normalized deferred partner-state metadata, requires static partner selection, and rejects malformed structure.
- Runtime truncates integer values, rejects negative results, and validates the partner-owned state before every Tag mutation.
- Same-tick VarSet selects state 200 for TagIn and TagOut; TagIn partner control still applies after state entry.
- Negative, unavailable, and missing-partner paths preserve state, control, standby, and successful telemetry.
- [Pinned IKEMEN TagIn/TagOut source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5241-L5398) confirms caller-context `evalI`, partner standby before partner state, and TagIn partner control afterward.
- `pnpm test`: 169 files / 1665 tests passed.
- `pnpm typecheck` and `pnpm build`: TypeScript 7 and Vite passed; known large-chunk warning remains.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.
- Visual smoke: N/A; renderer and Studio surfaces are unchanged.

## Audit

Strongest risk was partial mutation after dynamic state failure. Resolution and partner-owned state validation both occur before caller/partner state, control, or standby mutation; adversarial rollback tests close negative, unavailable, and missing-target paths. Independent review was unavailable in this host; this is an internal adversarial audit.

## Blocked

Dynamic partner identity/member/leader, redirects, exact partial-mutation parity, gameplay ownership, and full IKEMEN parity.
