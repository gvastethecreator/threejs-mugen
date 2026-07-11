# Execute root-only Tag RedirectID

Type: implementation
Status: claimed
Blocked by: None

## Question

How should TagIn/TagOut resolve optional RedirectID against the live numeric registry and mutate a root while every authored parameter still evaluates in the original caller context?

## Acceptance

- Compile optional TagIn/TagOut `redirectid` as a deferred integer expression without accepting empty or malformed structure.
- Evaluate RedirectID once in the original caller context before resolving any other Tag parameter.
- Resolve through the global numeric registry, allowing active or standby roots and rejecting negative, missing, destroyed, or disabled targets before every mutation.
- Keep all remaining static/dynamic Tag expressions in the original caller context while applying state, control, partner, member, leader, and standby effects relative to the redirected root.
- Preserve the sandbox's documented aggregate prevalidation policy and concrete telemetry; do not claim IKEMEN's incremental partial-mutation parity.
- Prove caller-versus-target expression ownership, root-relative partner/order behavior, invalid-target rollback, legacy-profile rejection, and unchanged non-redirected Tag behavior.
- Keep Helper identity/RedirectID, gameplay participation, score movement, and broad RedirectID parity unsupported.
