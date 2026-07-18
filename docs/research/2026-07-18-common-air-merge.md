# Common.Air merge research

## Question

How does IKEMEN merge configured common AIR actions with the character's own
animation table, and what is the smallest source-backed loader cut?

## Primary source evidence

- The official [IKEMEN GO global states and common files reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#global-states)
  identifies `CommonAir` as a common animation source using character-local
  sprites.
- The pinned IKEMEN source at `.scratch/external/Ikemen-GO` commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3` reads sorted
  `sys.cfg.Common.Air` entries in `src/char.go:4211-4233`. Each source is
  parsed into a temporary animation table and inserted only when the character
  table does not already contain that action ID.
- The pinned default configuration at
  `.scratch/external/Ikemen-GO/src/resources/defaultConfig.ini:10-18` declares
  `Air = data/common.air` and documents numeric suffixes for common arrays.

## Repository gap

`MugenCharacterLoader` currently populates `MugenCharacter.animations` only from
the DEF AIR path. The existing `parseAir` output and character SFF reference
are already suitable for common action frames; only config resolution and
first-wins merge ownership are missing.

## Decision for this slice

Resolve `Air`/`Air<number>` in natural numeric order, parse supported `.air`
sources, preserve existing character IDs, and add only new IDs from common
sources. Common action frames retain their authored sprite group/index values;
this slice does not clone or replace the character sprite archive.

## Risks and non-claims

- The AIR parser's existing Copy-action behavior remains the runtime ceiling;
  this slice does not add a second resolver.
- Unsupported path formats are surfaced rather than silently parsed, but this
  does not implement ZSS animation syntax or exact animation-table metadata.
- Common commands/constants/effects, ZSS/Lua, AI input, SOCD, rollback, and
  full parity remain unimplemented.
