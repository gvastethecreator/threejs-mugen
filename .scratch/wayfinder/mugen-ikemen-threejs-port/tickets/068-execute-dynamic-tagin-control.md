# Execute dynamic TagIn caller control

Type: implementation
Status: resolved
Blocked by: None

## Question

How should TagIn resolve dynamic caller `ctrl` while preserving state/control ordering and aggregate validation?

## Acceptance

- Compile supported boolean expressions into deferred caller-control data only for TagIn.
- Resolve against current caller context before any Tag mutation.
- Preserve explicit control precedence after caller state entry.
- Prove changing variable true/false and malformed fail-closed behavior.
- Leave dynamic partner control, partner/state/member/leader, redirects, and gameplay ownership unsupported.

## Answer

TagIn now compiles supported non-static caller `ctrl` into `callerControlExpression`. Dispatch resolves it with dynamic `self` before any Tag mutation, strips deferred metadata, and passes one concrete operation into aggregate validation. Caller state entry still executes before explicit control, so resolved control overrides StateDef metadata. Live `var(0)` false-to-true coverage proves per-tick reevaluation; malformed structure remains fail closed.
