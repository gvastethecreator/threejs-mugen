# Global Common.States CNS research

## Question

The current loader consumes a character's `st*` and `stcommon` files but does
not yet consume global common state files declared by the game configuration.
The next bounded cut is CNS-only `[Common] States` loading.

## Primary source evidence

- The official [IKEMEN GO Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
  describes Common files and says `CommonStates` are common states loaded even
  when the character DEF does not declare them. It also documents negative
  state declarations across files and the global execution order.
- The local pinned IKEMEN source at
  `.scratch/external/Ikemen-GO` commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3` compiles character `st*`, then
  CMD state code, then `stcommon`, then sorted `sys.cfg.Common.States` files.
- The pinned `src/resources/defaultConfig.ini` defines `[Common] States` as a
  comma-separated list of CNS or ZSS paths, including `States0`, `States1`, and
  later numeric suffixes as supported array entries.
- The official [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html)
  establishes the character/common state fallback model that remains ahead of
  global common sources.

## Bounded interpretation

This slice maps the repository's existing INI config model to CNS state
sources. Character `st*` remains first, DEF `stcommon` remains the first common
tier, and configured global CNS files fill missing state identities after it.
Normal duplicates remain first-listed. Explicit IKEMEN negative-state merging
continues to apply across the new global tier.

ZSS is deliberately reported as unsupported because the repository has no ZSS
parser/compiler boundary. The loader must not parse ZSS as empty CNS and call
that success.

## Risks and non-claims

- The wiki's JSON `CommonStates` example is not silently treated as an input
  format because this loader currently reads INI-style game configs only.
- Common commands, constants, AIR, FX, Lua hooks, runtime ownership, and exact
  global-state timing remain separate cuts.
- Path lookup is bounded to root-style `data/...` and config-relative names;
  it does not claim every upstream search-path override.

## Implementation target

Resolve natural `[Common] States*` entries from the loaded config, add existing
CNS files as common state sources after `stcommon`, preserve diagnostics and
source fingerprints, and surface unsupported ZSS/missing paths in the existing
compatibility report.
