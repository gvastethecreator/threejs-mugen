# Issue 114 — Ikemen `AnimElemVar` animation-frame metadata

- Status: `closed-bounded`
- Lane: `R2 animation/runtime reads`
- Priority: `P1`

## Objective

Compare the official Ikemen `AnimElemVar(param)` trigger with the imported AIR
frame cursor and expose one deterministic read-only metadata slice for the
Animation Testbench and CNS/controller expression paths.

## Source gate

Use the official [Ikemen new triggers reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29)
and the current animation runtime. The source lists frame metadata such as
`Group`, `Image`, `Time`, `XOffset`, `YOffset`, `HFlip`, `VFlip`, and collision
counts. Do not infer a complete AIR evaluator from a single frame snapshot.

## Candidate fixture

- Imported AIR action with two frames, distinct sprite groups, offsets, flips,
  frame durations, and Clsn1/Clsn2 counts.
- Expression reads before and after the frame cursor advances, plus a missing
  parameter/index fallback.
- Animation Testbench evidence must stay read-only and preserve the existing
  browser gate.

## Delivered slice

- `runtimeAnimationElementVarForFrame` and `runtimeAnimationElementVar` read
  `Group`, `Image`, effective `Time`, `XOffset`, `YOffset`, `HFlip`, `VFlip`,
  `NumClsn1`, and `NumClsn2` from the active imported AIR frame.
- `AnimElemVar(param)` is available through the shared expression context, so
  CNS and controller value expressions use the same actor-owned frame cursor.
- Animation Testbench now shows the same values beside the selected frame,
  including sprite identity, duration, Clsn counts, and flip flags.
- Focused coverage: 4 files / 72 tests; browser gate passes with
  `.scratch/qa/fighter-lab-gate/character-testbench.png` and zero page/console
  errors; typecheck passes.
- Full `pnpm test` remains the inherited dirty-roster baseline: 13 failed files,
  58 failed tests, 3344 passed; failures target retired Nova/Mira/Rook assets,
  old studio expectations, and legacy imported-runtime log labels.

`Time` follows the existing runtime's effective duration rule (`max(1,
duration)`). Missing frames/parameters return the existing numeric fallback in
expressions (`0`) or `undefined` in the typed helper.

## Claim ceiling

Do not claim full AIR loop/alternate-action semantics, raw negative-duration
fidelity, `AlphaDest`/`AlphaSource`/`Angle`/`XScale`/`YScale`, sprite decode
parity, collision geometry parity, Helper animation ownership, rollback/netplay
serialization, or complete M.U.G.E.N/Ikemen animation parity from this slice.

## Next cut

Queue T542 / [issue 116](116-ikemen-animplayerno.md) to compare the official
`AnimPlayerNo` owner read with the current action source/ownership model.
