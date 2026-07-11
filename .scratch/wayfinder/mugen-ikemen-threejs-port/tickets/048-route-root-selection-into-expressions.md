# Route root selection into expressions

Type: implementation
Status: resolved
Blocked by: None

## Question

How can explicit IKEMEN expression contexts consume `RuntimeRootSelection/v0` for Partner, Enemy, EnemyNear, P2, and identity reads while preserving existing 1v1 traces?

## Boundary

Read-only routing only. No redirected controller mutation, standby-root CNS scheduling, TagIn/TagOut compilation, input, combat, or presentation widening.

## Answer

`RuntimeExpressionContextInput` accepts an optional complete-character registry plus one `RuntimeRootSelection/v0` row. Enemy ids build the nearest-ordered `EnemyNear` roster; P2 candidate ids select the P2 identity/state independently; an explicit empty P2 list fails closed instead of falling back to the legacy opponent. Omitting selection preserves the existing 1v1 route exactly. Partner redirects remain blocked until their expression grammar/runtime contract exists.
