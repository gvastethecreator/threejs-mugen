# Issue 116 — Ikemen `AnimPlayerNo` animation-owner read

- Status: `closed-bounded`
- Lane: `R2 animation/runtime reads`
- Priority: `P1`

## Objective

Implement the official Ikemen `AnimPlayerNo` read at the shared animation and
expression boundaries. Keep the owner number outside `CharacterRuntimeState`.

## Source gate

Use the official [Ikemen new triggers reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29)
and the current `FighterMatchState` / `RuntimeAnimationChangeActor` seams.
`AnimPlayerNo` returns the player number of the owner of the current
animation; a `ChangeAnim2` path can therefore differ from the player currently
executing the state. Do not infer ownership from an animation source label or
from the local cursor alone.

## Delivered slice

- `RuntimeAnimationWorld.changeAction` records the action owner's `playerNo`.
- `runtimeAnimationPlayerNo` falls back to the actor's `playerNo`.
- `AnimPlayerNo` reads through `ExpressionContext`, active contexts, and
  controller contexts.
- `ChangeAnim2` keeps the state-owner actor as the source of the owner number.
- Redirected `EnemyNear`, `Partner`, `Enemy`, `Target`, and `PlayerID` reads
  carry the redirected animation owner when that target supplies it.

Focused coverage is 5 files / 81 tests. Typecheck passes.

## Verification

- Focused Vitest: 5 files / 81 tests passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed with the existing large-chunk warning.
- `pnpm qa:trace`: 686/686 artifacts passed, with 652 required and 34 optional.
- `pnpm qa:browser:fighter-lab`: passed with 17 Testbench action cards, 6
  component cards, WebGL frames, and zero console or page errors.
- `pnpm test`: 3351 passed, 58 failed, 3409 total, across 13 failed files.
  Failures remain the inherited retired Nova/Mira/Rook fixtures, old Studio
  expectations, and legacy imported-runtime log labels.
- `git diff --check`: passed with CRLF normalization warnings only.

## Claim ceiling

Do not claim full `ChangeAnim2` choreography, Helper/Projectile animation
ownership, team or player redirection parity, rollback/netplay serialization,
or complete M.U.G.E.N/Ikemen animation parity from this bounded slice.
