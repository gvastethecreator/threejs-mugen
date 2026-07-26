# Sandbox FightScreen fixture (DA26-12)

Date: 2026-07-26
Type: first-party system package
Status: closed

## Question

Can the repo ship a named CC0 FightScreen system package (fight.def, FightFX
AIR/SFF/SND, FNT) as folder + ZIP with license, stable hashes, and real loader
evidence for round/KO/draw/time-over/win/skip/fade/reset/fallback surfaces?

## Answer

Yes. `SandboxFightScreenFixture/v1` is repository-authored and deterministic.

## Package

| Item | Path |
| --- | --- |
| Root | `data/sandbox-fightscreen/` (under `public/` when materialized) |
| fight.def | `data/sandbox-fightscreen/fight.def` |
| FightFX | `fightfx.air` / `.sff` / `.snd` |
| Font | `font/standard.def` + `font/standard.sff` |
| License | `LICENSE.txt` (CC0-1.0) |
| ZIP | `public/system/sandbox-fightscreen.zip` |
| Hash ledger | `public/system/sandbox-fightscreen.hashes.json` |

## Implementation

- `src/mugen/runtime/FightScreenFixture.ts`
- `src/tests/FightScreenFixture.test.ts` (loads via `MugenCharacterLoader`)

## Claim allowed

Named first-party CC0 FightScreen package load + timing/display surface coverage
listed in the manifest.

## Claim blocked

Elecbyte screenpack visual parity, third-party motif assets, full audio
fidelity, browser gate (DA26-13), score movement.
