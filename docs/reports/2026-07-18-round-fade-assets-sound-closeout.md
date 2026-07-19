# FightScreen Fade Asset and Sound Closeout

Date: 2026-07-18
Ticket: Wayfinder 284
Implementation commit: `84fc1510`

## Result

Imported `[Round] fadeout.anim` and `fadeout.snd` now travel from the resolved
fight-screen source through `MugenSystemAssets`, the normalized runtime timing,
the additive `RuntimeRoundFade/v0` snapshot, the Three.js renderer, and the
global FightFX audio route. AIR action duration extends the source-derived
terminal window when the referenced action exists. The renderer presents the
resolved FightFX AIR/SFF frame with bounded frame timing, offsets, flips, loop
start, and blend policy; an unresolved action or sprite keeps a color fallback
and exposes a diagnostic. Fade sound playback is deduplicated per round fade.

## Evidence

- Focused: `MugenSystemAssetsLoader`, `RuntimeRoundSystem`,
  `MugenAudioSystem`, and `ThreeMugenRenderer`; 4 files / 38 tests passed.
- `pnpm typecheck`: passed with TypeScript 7.0.2.
- `pnpm test`: 233 files / 2476 tests passed.
- `pnpm build`: passed with Vite 8.0.16 and 316 modules. The existing large
  JavaScript chunk advisory remains.
- `pnpm qa:trace`: 633/633 artifacts passed, 599 required and 34 optional.
- `pnpm check:boundaries`, `pnpm check:redirect-boundary`, and
  `pnpm qa:css:budget`: passed.
- `pnpm qa:smoke`: passed against the real Vite server in 279.3 seconds,
  producing 64 capture paths with 0 console issues and 0 page errors.
  Diagnostics: `.scratch/qa/qa-smoke-t284-full/diagnostics.json`.
- `git diff --check`: passed for the implementation and documentation
  checkpoint; pre-existing CRLF warnings are confined to older roadmap files.

## Claim ceiling

Allowed: source-backed `fadeout.anim`/`fadeout.snd` parsing and mapping,
animation-duration terminal extension, renderer-independent metadata,
bounded FightFX AIR/SFF presentation, global one-shot sound routing, and
fail-closed asset diagnostics.

Blocked: exact motif/localcoord transforms, complete fade-in/fade-out
choreography, exact `intro` and `roundOver` frame ordering, motif/dialogue/
skip ownership, `RoundNoSkip`, Common1/ZSS release, teams/Turns, rollback,
netplay, score movement, and full MUGEN/IKEMEN parity.

## Audit outcome

This is a bounded runtime and presentation closeout, not a full-port claim.
The score remains unchanged. The next research gate should compare the local
round-start/fade-in ownership with the same pinned FightScreen source before
any broader release choreography is implemented.
