# Route root selection into expressions

Type: implementation
Status: open
Blocked by: None

## Question

How can explicit IKEMEN expression contexts consume `RuntimeRootSelection/v0` for Partner, Enemy, EnemyNear, P2, and identity reads while preserving existing 1v1 traces?

## Boundary

Read-only routing only. No redirected controller mutation, standby-root CNS scheduling, TagIn/TagOut compilation, input, combat, or presentation widening.
