# Common.Const loading research

## Question

What order and file contract should the Three.js loader use for IKEMEN's
configured common constants before compiling imported character states?

## Primary source evidence

- The official [IKEMEN GO global states and common files reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#global-states)
  identifies `CommonConst` as a common constant source and notes that
  character-owned constants can override it.
- The pinned IKEMEN source at `.scratch/external/Ikemen-GO` commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3` loads sorted
  `sys.cfg.Common.Const` entries in `src/char.go:3867-3888`, before reading the
  character CNS constants at `src/char.go:3889` onward. Common values therefore
  seed the map and character values overwrite duplicate keys.
- The pinned default configuration at
  `.scratch/external/Ikemen-GO/src/resources/defaultConfig.ini:6-18` declares
  `Const = data/common.const` and documents numeric suffixes for array-like
  common categories.

## Repository gap

`MugenCharacterLoader` currently initializes its constants map from the
character CNS and then state sources. `MugenGameConfig` preserves `[Common]`
raw entries and the loader already resolves root/config-relative
`Common.States`, but no CommonConst path is read before character constants.

## Decision for this slice

Resolve `Const`/`Const<number>` in natural numeric order, parse each existing
text source with `parseCns`, seed the constants map from those sources, and
then parse the character CNS. Common sources are recorded separately from
character files. Only explicit ZSS paths are blocked here; the bounded parser
accepts extension-neutral INI constant files such as `common.const`.

## Risks and non-claims

- This preserves the source ordering and character-over-common key rule, but
  does not recreate every upstream default-initialization table.
- State-file constant merging remains governed by the existing state-source
  loader and is not redefined by this ticket.
- Common animations/effects, ZSS/Lua, AI input, SOCD, rollback, and full parity
  remain unimplemented.
