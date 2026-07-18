# SOCD resolution research

## Question

What input-conflict contract must the Three.js runtime implement to cover the
documented IKEMEN SOCD modes without claiming raw device, netplay, or rollback
parity?

## Primary source evidence

- The official [IKEMEN GO miscellaneous reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#socd-resolution)
  defines `SOCDResolution`: `0` keeps both directions (MUGEN), `1` gives the
  last input priority, `2` gives absolute priority to `F` over `B` and `U`
  over `D`, `3` gives the first direction priority, and `4` denies either
  opposing direction. The same page identifies `4` as the current IKEMEN
  default and the enforced netplay mode.
- The pinned local IKEMEN source is `.scratch/external/Ikemen-GO` at commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3`. Its
  `src/resources/defaultConfig.ini:371-381` exposes `[Input]` and the default
  `SOCDResolution = 4`.
- The local loader already preserves arbitrary config sections in
  `MugenGameConfig.rawSections` (`src/mugen/model/MugenConfig.ts`) and attaches
  the parsed game config to imported system assets. The missing boundary is
  runtime input normalization, not config parsing.

## Decision for T256

Implement one pure `resolveRuntimeSocdInput` boundary and apply it once per
match tick before root routing, command buffering, input control, pause, and
hitpause paths consume the input. Support modes `0` through `4`; for modes `1`
and `3`, iterable insertion order is the available deterministic direction
order because the current public input contract is a `Set`, not a timestamped
device event stream. Preserve buttons and non-opposing tokens. Default profile
policy is `4` for `ikemen-go` and `0` for `mugen-1.1`/`unknown`; an explicit
runtime option or imported `[Input] SOCDResolution` value wins.

## Uncertainty and non-claims

- Exact hardware event timestamps, controller polling order, input buffering,
  AI-generated inputs, netplay enforcement, and rollback serialization remain
  outside this slice.
- The importer can read the config value when an imported character carries
  system assets, but a future match/config authority must decide precedence for
  mixed packages with conflicting values.
- This does not complete Common1/default tables, ZSS/Lua, or full
  MUGEN/IKEMEN parity.

## Next action

Implement T256 in `RuntimeInput`, thread profile/config selection through
`PlayableMatchRuntime`, cover all five modes and the tick path with focused
tests, then close with the batched runtime/type/build/trace gates.
