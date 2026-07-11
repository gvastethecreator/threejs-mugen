# Execute dynamic TagIn leader

Type: implementation
Status: open
Blocked by: None

## Question

How should TagIn resolve dynamic `leader` PlayerNo while preserving stable root identity, explicit Tag mode, and aggregate rollback?

## Acceptance

- Compile supported integer expressions into deferred leader-PlayerNo data only for TagIn.
- Resolve in caller context with integer truncation before mutation.
- Require positive stable PlayerNo, same-side root identity, and explicit Tag order ownership.
- Reuse existing live-life leader rotation and dead-member sinking after validation.
- Prove same-tick variable leader selection plus zero/negative/opposing/missing/non-Tag rollback.
- Leave TagOut leader, redirects, and gameplay ownership unsupported.
