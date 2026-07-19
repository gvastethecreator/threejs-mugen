# FightScreen Round-Start Fade-In Closeout

Date: 2026-07-18
Ticket: Wayfinder 285
Implementation commit: `c688f04d`

## Result

Imported `[Round]` fade-in timing now travels from system-asset loading into a
reset-owned `RuntimePreRound/v0` snapshot. The runtime carries color, resolved
FightFX AIR duration, animation reference, and global sound reference. The
Three.js layer prefers the resolved AIR/SFF asset and keeps reverse-opacity
color fallback when the asset cannot resolve. FightFX fade-in sound playback is
deduplicated per numbered round and fade direction.

## Evidence

- Focused: `MugenSystemAssetsLoader`, `RuntimeRoundSystem`,
  `MugenAudioSystem`, and `ThreeMugenRenderer`; 4 files / 41 tests passed.
- `pnpm typecheck`: passed with TypeScript 7.0.2.
- `pnpm test`: 233 files / 2479 tests passed.
- `pnpm build`: passed with Vite 8.0.16 and 316 modules. The existing large
  JavaScript chunk advisory remains.
- `pnpm qa:trace`: 633/633 artifacts passed, 599 required and 34 optional.
- `pnpm check:boundaries`, `pnpm check:redirect-boundary`, and
  `pnpm qa:css:budget`: passed.
- `pnpm qa:smoke`: passed against the real Vite server in 306.5 seconds,
  producing 64 capture paths with 0 console issues and 0 page errors.
  Diagnostics: `.scratch/qa/qa-smoke-t285-full/diagnostics.json`.

## Claim ceiling

Allowed: source-backed fade-in parsing and mapping, AIR duration resolution,
reset/next-round pre-round snapshot state, bounded AIR/SFF presentation,
reverse color fallback, and one-shot global audio routing.

Blocked: exact intro/shutter/frame-start semantics, timer and input gating,
screenpack localcoord/motif transforms, dialogue/skip ownership,
`RoundNoSkip`, Common1/ZSS release, teams/Turns, rollback/netplay, score
movement, and full MUGEN/IKEMEN parity.

## Audit outcome

This is a bounded round-start presentation and audio closeout, not a full
FightScreen or full-port claim. Compatibility scores remain unchanged. The
next gate should select an independent source-backed round/intro or broader
character-compatibility boundary rather than widening this fade adapter.
