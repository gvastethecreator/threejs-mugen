# Common.Fx package research

## Question

How does IKEMEN load `[Common] Fx*` DEF packages, and which local library
boundary can consume them without duplicating FightFX runtime state?

## Primary source evidence

- The official [IKEMEN GO global states and common files reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#global-states)
  identifies common FX as configuration-driven packages available to the
  match.
- The pinned IKEMEN source at `.scratch/external/Ikemen-GO` commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3` iterates sorted
  `sys.cfg.Common.Fx` entries in `src/fightscreen.go:85-101`, resolves each
  package, and loads it as non-character FightFX. The same source's
  `src/char.go:4493-4508` handles character FX packages and keeps non-character
  packages cached separately.
- The repository already parses FightFX DEF `[Info] prefix` and `[Files]`
  AIR/SFF/SND packages in `MugenSystemAssetsLoader`, and imported fighters
  resolve `fightfx.prefix` through `systemAssets.fightFxLibraries`.

## Repository gap

`MugenSystemAssetsLoader` loads fight.def defaults and character FX packages,
but never reads the game config's `[Common] Fx*` entries. The existing prefix
map is the correct consumer boundary; only ordered config resolution and
common-first population are missing.

## Decision for this slice

Resolve `Fx`/`Fx<number>` in natural numeric order, accept existing `.def`
packages, load common entries before character-declared FX, and retain the
first valid normalized prefix. This intentionally uses deterministic local
first-wins ownership instead of claiming every upstream cache/promotion rule.

## Risks and non-claims

- Common FX packages may reference their own relative AIR/SFF/SND files; the
  existing DEF-relative resolver handles that path contract.
- Prefix collisions are surfaced and deterministic, but exact upstream cache
  lifetime and promotion behavior are not reproduced.
- ZSS/Lua, screenpack modules, visual/audio parity, rollback, and full parity
  remain open.
