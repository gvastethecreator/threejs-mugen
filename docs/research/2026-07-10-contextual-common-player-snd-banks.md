# Contextual Common and Player SND Banks

Date: 2026-07-10

## Question

Which archive owns an unprefixed sound reference in `PlaySnd`, `HitDef`, and `SuperPause`?

## Primary source

Elecbyte's official State Controller Reference defines context-dependent defaults:

- `PlaySnd value = group, index` uses player SND; `F` selects `common.snd`.
- Unprefixed `HitDef hitsound` / `guardsound` use common/fight SND; `S` selects player SND.
- Unprefixed `SuperPause sound` uses `common.snd`; `S` selects player SND.

Source: https://www.elecbyte.com/mugendocs/sctrls.html

## Decision

| Context | Unprefixed | `S` | `F` |
| --- | --- | --- | --- |
| `PlaySnd` | player | player | FightFX/common |
| `HitDef` hit/guard | common (`f`) | player | FightFX/common |
| `SuperPause` | common (`f`) | player | FightFX/common |

The browser resolver already uses prefix-scoped archives and fails closed. Integration coverage proves a missing `f` archive does not fall back to a matching player sound.

## Evidence

- Focused event tests cover the three unprefixed contexts.
- Controlled audio integration covers common playback and missing-bank failure.
- Full trace gate remains 524/524, with 493 required and 31 optional artifacts.

## Blocked claims

This does not establish motif/system/BGM ownership, multi-roster topology, default sound constants, perceptual/device parity, or full audio parity. No score movement is warranted.
