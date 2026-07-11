# IKEMEN SuperPause opposing-team defense

## Question

How does pinned IKEMEN GO resolve omitted or non-positive `SuperPause p2defmul`, and which actors receive the resulting defense buffer?

## Answer

At revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, SuperPause starts from the game constant `Super.TargetDefenceMul` (`1.5` by default). An authored value replaces it only when positive. The resulting value multiplies `superDefenseMulBuffer` for every character whose team side differs from the source character.

## Primary sources

- [IKEMEN GO SuperPause parameter resolution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L10415-L10500)
- [IKEMEN GO opposing-team buffer loop](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9070-L9090)
- [IKEMEN GO buffered defense application](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12205-L12218)
- [Elecbyte SuperPause controller reference](https://www.elecbyte.com/mugendocs/sctrls.html#superpause)

## Implementation decision

- Gate fallback and opposing-team projection behind explicit `ikemen-go`.
- Keep the game-level default separate from character CNS constants and expose a `MatchWorld` override; use `1.5` when no valid override is supplied.
- Store temporary SuperPause defense separately from base `defenseMultiplier`, then multiply both before one final damage rounding.
- Apply to the currently represented opposing root and live helpers, independent of target memory.
- Preserve current target-memory behavior for `mugen-1.1` and `unknown`.

## Uncertainty

Current match topology is still 1v1. Simul/tag team rosters, runtime loading of IKEMEN global config, helper-as-defender contact damage, nested helper ancestry, and exact hitpause interaction remain unproven.
