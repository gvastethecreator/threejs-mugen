# Execute dynamic Tag member order

Type: implementation
Status: open
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
