# Execute dynamic TagIn leader

Type: implementation
Status: resolved
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

## Answer

TagIn now compiles supported non-static `leader` into `leaderPlayerNoExpression`; TagOut still rejects the parameter. Dispatch resolves in live caller context, truncates toward zero, rejects PlayerNo below one, strips deferred metadata, and only then enters existing explicit-Tag, same-side, stable-root validation before any effect. Same-tick `var(0) + 0.9` selects stable PlayerNo P3 and reuses live-life leader rotation. Zero, negative, opposing P2, missing P5, and non-Tag-mode results preserve leader/order, state, control, standby, and successful telemetry.
