# IKEMEN dynamic Tag parameters

## Question

How does pinned IKEMEN evaluate, coerce, order, and fail dynamic TagIn/TagOut optional parameter expressions, and what is the smallest safe sandbox slice?

## Answer

Every optional Tag value is compiled bytecode and evaluated when the controller runs. Integer-like parameters use `evalI`; booleans use `evalB`. Redirect resolves before parameter evaluation. Parameters then execute in serialized order, and several effects happen immediately rather than after a complete validation pass. Dynamic `self` is the smallest sandbox slice because it adds boolean expression resolution without new root identity, state ownership, or mutable-order targets.

## Sources

- Pinned expression coercion and controller parameter loop: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4398-L4407>, <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4785-L4805>
- Pinned TagIn execution: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5241-L5321>
- Pinned TagOut execution: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5335-L5398>
- Pinned order/leader mutators: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6089-L6250>

## Findings

- `self`, `ctrl`, and `partnerctrl` use boolean coercion through `evalB`; state numbers, partner ordinal, member position, and leader PlayerNo use integer coercion through `evalI`.
- TagIn resolves redirect first, then evaluates caller state, partner state, member order, self, partner, caller control, partner control, and leader according to serialized controller data.
- TagOut resolves redirect first and evaluates self, caller state, member order, partner, and partner state according to serialized data.
- Negative caller/partner state or partner ordinal returns false from the parameter callback and stops later evaluation. Earlier immediate state/control/order changes are not rolled back by this loop.
- Omitted self remains partner-sensitive: TagIn activates caller when neither self nor partner decides otherwise; TagOut also accounts for omitted partner state.
- Member and leader subtract one after integer coercion. Their mutators enforce mode, side, and bounds; the expression layer itself does not reject zero before subtraction.
- Sandbox aggregate validation intentionally provides stronger atomic failure than pinned IKEMEN for its bounded subset. Dynamic widening must preserve that documented contract until a compatibility fixture requires exact partial-mutation behavior.

## Next decision

Implement dynamic `self` first using the existing runtime expression resolver. Keep dynamic partner/state/control/member/leader and redirect blocked until each target and failure contract is separately proven.

## Uncertainty

Exact user-visible diagnostics for conversion failures and partial mutation require executable IKEMEN fixtures. This note pins source behavior but does not claim byte-for-byte VM parity.
