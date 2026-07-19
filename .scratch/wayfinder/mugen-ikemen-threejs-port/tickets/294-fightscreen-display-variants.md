# T294: Index FightScreen display variants

- Type: task
- Status: resolved at definition and sound-selection scope
- Date: 2026-07-18
- Entry: 568
- Depends on: T293

## Question

Which `fight.def` Round definitions must cross the loader/runtime boundary
before the Three.js FightScreen renderer can select the correct source asset?

## Answer

Index the source `AnimTextSnd` references for `round1` through `round9`,
`round.default`, `round.single`, `round.final`, and `fight`. Preserve bounded
animation ids, sound ids, text/font metadata, display time, offsets, scale, and
facing values in `MugenFightScreenAssets.display`. Runtime announcement timing
now selects per-round sound first, then the single/final variant when the match
score marks that mode, and finally the default round sound.

The imported fighter carries the display bundle so the next renderer slice can
use the same decoded screen SFF and inline AIR action table without re-reading
`fight.def`.

## Evidence

- Focused loader/runtime/imported-fighter gate: 314 tests passed.
- TypeScript 7 typecheck passed.
- Pinned source inspection: `readFightScreenRound` loads the numbered/default/
  single/final/fight `AnimTextSnd` values; `handleRoundIntro` selects sound by
  single, final, numbered, then default precedence.

## Claim ceiling

This proves bounded variant indexing and runtime sound precedence. It does not
prove `AnimTextSnd` completion, AIR/FNT/SFF rendering, layout projection,
screenpack motif/localcoord behavior, dialogue, pause persistence, teams/Turns,
rollback/netplay, or full MUGEN/IKEMEN parity.
