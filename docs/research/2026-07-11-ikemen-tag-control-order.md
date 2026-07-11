# IKEMEN TagIn control order

## Question

How do TagIn `ctrl` and `partnerctrl` combine with state entry, standby mutation, and omitted self defaults?

## Answer

Caller `ctrl` runs after caller `stateno` and before final caller standby adjustment. Partner `partnerctrl` runs after partner standby and `partnerstateno`. Explicit control therefore wins over StateDef control metadata. The safe sandbox subset is exact static `0|1`, with partner control requiring static partner selection and all targets/states validated before mutation.

## Sources

- Pinned IKEMEN GO `tagIn.Run`: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5241-L5321>
- Pinned TagIn compiler parameter order: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L487-L523>
- Pinned bytecode parameter iteration: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4785-L4806>

## Findings

- Compiler order is redirect, self, partner, caller state, member order, partner state, caller control, partner control, leader.
- Caller state entry occurs before explicit caller control; explicit control also makes omitted self resolve true.
- Caller standby adjustment occurs after explicit caller control.
- Partner standby and partner state entry occur before explicit partner control.
- Partner control has no effect without a resolved partner. With partner selected, omitted self stays false unless caller state/control requests caller mutation.
- TagOut has no caller/partner control parameters.

## Local implication

Extend the typed Tag operation with optional caller and partner control booleans. Parse exact scalar `0|1`. Require TagIn and static partner for partner control. Prevalidate caller state, partner target, and partner state before any mutation; then preserve official state-before-control precedence.

## Uncertainty

Dynamic boolean expression timing and redirected-controller ownership remain outside this subset. The sandbox retains its stricter prevalidated failure policy rather than reproducing IKEMEN partial mutation.
