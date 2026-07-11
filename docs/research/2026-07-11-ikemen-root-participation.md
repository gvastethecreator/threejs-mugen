# IKEMEN root participation research

## Question

How can the port expose inert-root ownership without implying one universal active state?

## Finding

Pinned IKEMEN keeps standby roots in the character action list while eligibility and presentation consumers filter them independently. A single `active` boolean would conflate structural eligibility with scheduling, input, combat, round, presentation, and resource ownership.

Primary anchors:

- [Complete character action loop](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13096-L13175)
- [Partner, Enemy, and P2 eligibility](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4968-L5109)
- [TagIn and TagOut standby mutation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5227-L5397)

## Decision

Publish `RuntimeRootParticipation/v0` as a read-only, plural, per-consumer diagnostic. Keep P3-P8 storage stable and every executable owner list unchanged. Activation becomes a later atomic transition contract.
