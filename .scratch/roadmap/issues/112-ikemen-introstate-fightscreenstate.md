# Issue 112 — Ikemen `IntroState` / `FightScreenState` read boundary

- Status: `closed-bounded`
- Lane: `I1 round lifecycle`
- Priority: `P1`

## Objective

Compare the official Ikemen `IntroState`, `FightScreenState`, and
`FightScreenVar` triggers with the existing FightScreen announcement and round
timing worlds, then expose the bounded read-only projection on the runtime
expression context.

## Source gate

Use the official [Ikemen new triggers reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29)
and the imported `FightScreen` timing definitions. Do not infer the trigger
values from the visible Round/Fight assets alone.

## Implemented boundary

- T536 owns the numeric `RoundState` projection through the typed phase
  machine; this issue does not duplicate that contract.
- `RuntimeFightScreenTriggerSystem` projects `IntroState` values `1/2/3/4/0`
  from the current phase and announcement clock, and exposes the four
  `FightScreenState` booleans (`rounddisplay`, `fightdisplay`, `kodisplay`,
  `windisplay`).
- `FightScreenVar` reads the imported numeric timing fields and FightScreen
  localcoord through the active expression context. The runtime refreshes the
  read-only context whenever round phase is applied.
- A real `RuntimeRoundSystem` fixture covers `start.waittime`, `ctrl.time`,
  `callfight.time`, FightScreen display, and return to `IntroState = 0` under
  the `ikemen-go` profile.

## Evidence

- Focused Vitest: 4 files / 69 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, `git diff --check`,
  and `pnpm qa:trace` passed; trace corpus remains `686/686`.

## Claim ceiling

Do not claim full FightScreen asset sequencing, string `info.name`/`info.author`
readback, AIR/FNT parity, helper redirection, pause/skip behavior, HUD, Tag,
rollback/netplay, or complete round-flow parity from this bounded projection.
