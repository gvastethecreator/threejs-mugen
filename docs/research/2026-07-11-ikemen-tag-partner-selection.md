# IKEMEN Tag partner selection research

## Question

Does the TagIn/TagOut `partner` parameter address absolute PlayerNo, mutable member order, or a caller-relative teammate ordinal?

## Answer

Pinned IKEMEN uses a caller-relative cyclic teammate offset. `partner = 0` selects the next root on the caller's side; larger non-negative values advance through same-side roots and wrap. It is not absolute PlayerNo and does not use mutable `memberNo` order. Missing and negative/out-of-range targets produce no partner mutation.

## Primary sources

- [Pinned TagIn/TagOut execution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5227-L5397)
- [Pinned `partner` and `partnerTag` selection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4968-L5009)
- [Pinned team/member order ownership](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6089-L6152)

## Findings

- Internal PlayerNo slots are zero-based and side-interleaved; public PlayerNo-style values add one.
- `partnerTag(n)` starts after the caller, advances by same-side root slots, and wraps by team size.
- The selected entry is the root at helper index zero; helpers are not candidates.
- `memberNo` sorting is a separate mutable team-order system and is not consulted by `partnerTag`.
- Tag partner mutation can occur without self mutation when `partner` is specified.

## Implementation consequence

Introduce one pure tag-partner selector over stable side-interleaved root order. Compile static non-negative `partner` as an optional typed ordinal while continuing to reject every other optional parameter. Runtime validates same-side player roots and applies self only when the operation requests it; partner-only TagIn/TagOut mutates the selected teammate without changing caller standby.

## Blocked scope

Dynamic partner expressions, redirected callers, state/control/leader/member-order parameters, helper effects, authored team-mode cardinality, gameplay ownership, and full IKEMEN parity remain blocked.
