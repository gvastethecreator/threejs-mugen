# Issue 113 — Ikemen `FightTime` / `GameVar` round-clock reads

- Status: `closed-bounded`
- Lane: `I1 round lifecycle`
- Priority: `P1`

## Objective

Compare the official Ikemen `FightTime` and `GameVar(introtime|outrotime)`
triggers with the existing round timer, announcement, KO, and pause clocks,
then close one deterministic read-only timing slice.

## Source gate

Use the official [Ikemen new triggers reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29)
and the current `RuntimeRoundSystem` snapshots. The source defines
`FightTime` as ticks since the actual fight starts, while `GameVar(introtime)`
and `GameVar(outrotime)` are internal pre/post-fight screen timers. `FightTime`
is therefore not derived from the round timer or visible FightScreen animation
elapsed time.

## Implemented boundary

- T536 owns `RoundState`; T538 owns the bounded `IntroState`,
  `FightScreenState`, and numeric `FightScreenVar` projection.
- `RuntimeRoundSystem` now owns a resettable `fightTimeFramesElapsed` clock;
  it starts only after phase `2`, does not advance in the intro or post-round
  branches, and resets on `startNextRound`/`reset`.
- `RuntimeFightScreenTriggerSystem` exposes `FightTime` plus the bounded
  `GameVar` timing reads `introtime`, `outrotime`, `pausetime`, `slowtime`, and
  `superpausetime`. The `PlayableMatchRuntime` projection supplies the round
  clock and active pause snapshot without moving clock ownership into the
  expression evaluator.
- `RuntimeExpressionContextSystem` and controller contexts expose the typed
  `GameVar(...)` function; unknown keys remain `0`/unsupported rather than
  inventing state.
- Required evidence: official trigger comparison, deterministic intro/Fight/
  KO/pause/next-round fixture, focused 4-file/71-test coverage, and runtime
  gates below.

## Verification

- `pnpm vitest run src/tests/RuntimeFightScreenTriggerSystem.test.ts
  src/tests/RuntimeExpressionContextSystem.test.ts
  src/tests/RuntimeRoundPhaseSystem.test.ts src/tests/RuntimeRoundSystem.test.ts`
  — 4 files / 71 tests passed.
- `pnpm typecheck` — passed.
- `pnpm build` — passed (359 Vite modules; existing chunk-size warning only).
- `pnpm check:boundaries` — passed.
- `pnpm qa:trace` — passed, 686/686 artifacts (652 required / 34 optional).
- `git diff --check` — passed; only existing CRLF warnings remain.
- `pnpm test` — inherited baseline remains red: 13 files / 58 tests failed,
  3341 passed, driven by retired Nova/Mira/Rook fixtures and roster
  expectations; no T539 failure was observed in the focused gates.

## Claim ceiling

Do not infer full game-clock, HUD, Tag, rollback/netplay, or complete
round-flow parity from this projection. `pausetime`/`superpausetime` are the
active local pause snapshot, and `slowtime` is the existing KO-slow remaining
clock; pause stacking, rollback serialization, and network clock authority
remain outside the claim.
