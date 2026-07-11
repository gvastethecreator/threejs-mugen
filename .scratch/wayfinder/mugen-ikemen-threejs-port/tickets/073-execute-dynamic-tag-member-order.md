# Execute dynamic Tag member order

Type: implementation
Status: resolved
Blocked by: None

## Question

How should TagIn/TagOut resolve dynamic `memberno` while preserving one-based mutable order, explicit Tag mode, and aggregate rollback?

## Acceptance

- Compile supported integer expressions into deferred member-position data.
- Resolve in caller context with integer truncation before mutation.
- Require a positive one-based position and explicit Tag team-order ownership.
- Reuse existing caller-membership and swap validation before every Tag effect.
- Prove same-tick variable order selection plus zero/negative/out-of-range/non-Tag rollback.
- Leave dynamic leader, redirects, and gameplay ownership unsupported.

## Answer

TagIn/TagOut now compile supported non-static `memberno` into `memberPositionExpression`. Dispatch resolves in live caller context, truncates toward zero, rejects positions below one, strips deferred metadata, and only then enters existing Tag-mode caller/position validation before any effect. Same-tick `var(0) + 0.9` resolves to one-based position 2, swaps mutable P1/P3 order, and preserves stable root/leader identity. Zero, negative, out-of-range, and non-Tag-mode results preserve order, state, control, standby, and successful telemetry.
