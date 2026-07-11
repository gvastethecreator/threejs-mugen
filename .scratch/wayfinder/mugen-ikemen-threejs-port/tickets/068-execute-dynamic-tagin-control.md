# Execute dynamic TagIn caller control

Type: implementation
Status: open
Blocked by: None

## Question

How should TagIn resolve dynamic caller `ctrl` while preserving state/control ordering and aggregate validation?

## Acceptance

- Compile supported boolean expressions into deferred caller-control data only for TagIn.
- Resolve against current caller context before any Tag mutation.
- Preserve explicit control precedence after caller state entry.
- Prove changing variable true/false and malformed fail-closed behavior.
- Leave dynamic partner control, partner/state/member/leader, redirects, and gameplay ownership unsupported.
