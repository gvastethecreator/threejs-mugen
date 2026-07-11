# IKEMEN Tag state transition order

## Question

How do TagIn/TagOut `stateno` and `partnerstateno` interact with standby mutation, ownership, defaults, and failure order?

## Answer

Caller `stateno` changes the redirected caller in its own state space before standby adjustment. Partner standby changes before `partnerstateno`, which changes the selected partner in that partner's own state space. The first safe sandbox slice is static non-negative caller-only `stateno`; partner state/control needs a later transition design.

## Sources

- Pinned IKEMEN GO `tagIn.Run` and `tagOut.Run`: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5227-L5397>
- Pinned controller compiler parameter order: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L487-L553>
- Pinned bytecode parameter iteration: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4785-L4806>

## Findings

- TagIn compiler order is redirect, self, partner, caller state, member order, partner state, caller control, partner control, leader. TagOut uses redirect, self, partner, caller state, member order, partner state.
- Non-negative caller `stateno` invokes `changeState` immediately. If self was omitted, it also selects caller standby mutation.
- TagIn then clears caller standby; TagOut sets it.
- A resolved partner changes standby first, then enters non-negative `partnerstateno`; TagIn may then apply partner control.
- `partnerstateno` has no target effect without `partner`. In TagOut it still suppresses the parameterless caller-default path.
- IKEMEN does not expose one aggregate rollback around caller state, standby, partner state, and control. The sandbox should prevalidate its bounded transition plan and document this stricter failure policy.

## Local implication

Implement static caller-only `stateno` first. Validate the caller's own runtime state before mutation, clear foreign `stateOwner` on entry, then apply state plus standby as one bounded operation. Keep partner, `partnerstateno`, control, redirects, member/leader order, and dynamic values unsupported until their multi-target transition policy is explicit.

## Uncertainty

Exact missing-state behavior inside IKEMEN `changeState` and partial mutation after runtime expression failure needs dedicated proof before claiming parity. This note deliberately does not authorize partner-state execution.
