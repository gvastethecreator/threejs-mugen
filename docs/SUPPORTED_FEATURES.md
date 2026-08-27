# Supported features

This page is the public support map. It is not a parity claim. Detailed ticket ledgers stay in local operator notes.

A feature can parse, decode, compile, or execute partially. Those are different claims. See [COMPATIBILITY_PROFILES.md](COMPATIBILITY_PROFILES.md).

## Loader

- ZIP packages and browser folder input.
- `.def` discovery in the package root or a nested character folder.
- Case-insensitive virtual paths.
- UTF-8/BOM text decoding with Windows-1252 fallback.
- Optional `data/fight.def` discovery for system presentation assets.

## Character formats

- **DEF**: `[Info]`, `[Files]`, palettes, raw sections, and diagnostics.
- **AIR**: `[Begin Action N]`, frames, `Loopstart`, collision boxes.
- **SFF**: v1 PCX and v2 RAW/RLE8/RLE5/LZ5 decoding for Inspector rendering. Unsupported encodings fall back to mock sprites.
- **ACT**: `pal1`–`pal12` Adobe ACT palettes and bounded `RemapPal` handoff to indexed SFF sprites.
- **SND**: `ElecbyteSnd` archives with embedded WAVE extraction and partial Web Audio playback after user gesture.
- **CMD**: command tokens, timing defaults, remaps, diagonals, holds, releases, and an input buffer.
- **CNS/ST**: statedefs, controllers, and a partial trigger evaluator. The runtime executes a small active-state subset. Broader VM parity is unsupported.

## Runtime

- Playable native fighters from atlas PNGs under `public/characters/`.
- Original stages under `public/stages/`, plus Training Grid fallback.
- Keyboard, touch, and partial gamepad input.
- Hitboxes, hurtboxes, damage, hit pause, hit stun, life, power, round timer, KO/time-over.
- Imported-character route that maps decoded SFF sprites, standard AIR actions, CMD `[State -1]`, and a small CNS/HitDef subset.

## Stages

Partial imported stage `.def` support: display name, bounds, camera, player starts, zoffset/localcoord, static BG sprites from stage SFF when decoded, action-backed BG animations, basic tiling/parallax, and placeholder fallback layers.

## IKEMEN

The `ikemen-go-scan` profile recognizes ZSS, Lua hooks, IKEMEN config, screenpack signals, and named IKEMEN-only controllers/triggers as `Recognized + Unsupported`. That scanner does not execute ZSS, Lua, rollback, or netplay. Named `ikemen-go` runtime slices execute only when a trace proves them.

## Not claimed

- Full CNS expression language or full state-controller execution.
- Exact Common1, FightFX, helper, projectile, Explod, pause, or screenpack parity.
- Replay files, rollback, or netplay.
- Commercial character packages in this repository.

Use [PLAYABLE_V0_STATUS.md](PLAYABLE_V0_STATUS.md) for the current playable prototype versus imported compatibility gap. Use [QUALITY_AUDIT.md](QUALITY_AUDIT.md) for the latest engineering-gate snapshot.
