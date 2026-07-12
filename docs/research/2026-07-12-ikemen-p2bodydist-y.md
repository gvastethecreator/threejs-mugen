# IKEMEN P2BodyDist Y research

Date: 2026-07-12
Source revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Official behavior

- [Vertical coordinate distance](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8830-L8847) converts both positions through each character's localcoord scale and returns in the output context localcoord.
- [Body Y distance](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8884-L8904) reads current Size boxes, returns a positive gap when P2 lies below, a negative gap when P2 lies above, and zero while intervals overlap. A missing Size box returns `NaN`.
- [`P2BodyDist Y` policy](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8967-L8975) uses ordinary `P2Dist Y` for MUGEN output contexts and body-edge distance for IKEMEN output contexts.

The policy belongs to the output character context (`oc`), so a redirect changes self/P2 geometry but retains the original expression output localcoord and MUGEN/IKEMEN policy.

## Port decision

`RuntimeExpressionContextWorld` projects current S/C/A/L size-box Y for self and selected P2. IKEMEN contexts compose one-frame Height, then ordered OverrideClsn Size modifiers. Both positions and boxes scale through their own localcoord width and return through the output context scale. Deleted Size geometry becomes `undefined` at the public numeric context boundary after the evaluator produces `NaN`.

The same Size override projection now closes the previously missing `P2BodyDist X` OverrideClsn path.

## Limits

Helpers and complete simul/team P2 selection, MUGEN bind-position quirks, pre-1.0 decimal truncation, exact missing-value VM propagation, late controller ordering, and full spacing parity remain blocked.
