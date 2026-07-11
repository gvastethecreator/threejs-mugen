# Execute root-only Tag RedirectID

Type: implementation
Status: resolved
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

## Answer

TagIn/TagOut now compile `redirectid` as a deferred expression and resolve it first in the original caller context. Explicit `ikemen-go` matches truncate that value, look it up through the global numeric character-identity registry, and reject invalid, disabled, or missing targets before evaluating any later Tag parameter or applying any mutation.

Every remaining dynamic Tag expression still reads the original caller context, while state, control, partner, member-order, leader, and standby effects are validated and applied relative to the redirected root. Telemetry remains attached to the original caller and stores the concrete resolved operation. Focused coverage proves same-side and cross-team root lookup, target-relative partner/order behavior, invalid-target rollback before RNG consumption, negative rejection, and legacy-profile rejection. Helper targets and exact IKEMEN incremental partial-mutation parity remain separate work.
