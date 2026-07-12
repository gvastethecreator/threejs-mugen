# IKEMEN Equal-priority Hit Trade Research

Date: 2026-07-12
Wayfinder: 117

## Sources

- Elecbyte HitDef reference: https://www.elecbyte.com/mugendocs/sctrls.html#hitdef
- Ikemen-GO `hittableByChar`, pinned SHA `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`: https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10532-L10617
- Ikemen-GO player hit-detection order at the same SHA: https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13886-L13931

## Finding

Elecbyte defines equal `Hit` versus `Hit` as both players being hit. The prior runtime emitted a trade message but marked both directions consumed before mutation, producing no contacts. Ikemen-GO also evaluates trade type inside counter-hit eligibility and orders ReversalDef before HitDef globally.

## Decision

Collect exact actor ids and move identities for equal default Hit/Hit candidates, then consume and clear them as one frame-local batch. Prepare both directions of every valid graph edge before mutation, apply all targets/damage/contact/presentation/state transitions, and interrupt each original move afterward. Emit trade telemetry only for pairs that pass bilateral preflight. If either direction requires ReversalDef, HitOverride, immunity, or another nonordinary route, abandon that edge and preserve existing sequential resolution.

## Boundary

This is not the complete priority-class matrix. `Miss` and `Dodge` are not represented in `DemoMove`; guard/override/reversal equality still needs separate ownership. Damage results and edge eligibility are precomputed globally, but secondary mutation such as state transitions and sprite-priority writes still applies in stable sequence rather than through an immutable state reducer.

## Next

Wayfinder 118: carry typed `Hit | Miss | Dodge` from CNS parsing into runtime moves and implement Elecbyte's six-case equal-priority matrix before widening cyclic arbitration.
