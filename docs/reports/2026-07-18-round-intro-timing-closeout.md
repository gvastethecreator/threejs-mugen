# Closeout Report: FightScreen round intro timing

Date: 2026-07-18
Ticket: Wayfinder 286
Implementation: `e978fa3c`

## Delivered

The imported `fight.def` `[Round]` `start.waittime` and `ctrl.time` values now
flow through the system-assets model and loader into `RuntimeRoundTiming`.
`RuntimeRoundSystem` owns a reset/next-round countdown with source-shaped
`+1` semantics, publishes `RuntimeRoundIntro/v0`, and transitions the existing
phase world through `pre-intro`, `intro`, and `fight`. The live round timer and
finish decision are held until the fight phase. The no-source route preserves
the prior immediate phase-2 behavior.

## Verification

- `pnpm test -- src/tests/MugenSystemAssetsLoader.test.ts src/tests/RuntimeRoundSystem.test.ts src/tests/PlayableMatchRuntime.test.ts`
- Result: 3 files, 289 tests passed.
- `pnpm typecheck`: TypeScript 7.0.2 passed.
- `pnpm test`: 233 files / 2480 tests passed.
- `pnpm build`: Vite 8.0.16, 316 modules passed; the existing >500 kB chunk
  warning remains.
- `pnpm qa:trace`: 633/633 artifacts passed, 599 required and 34 optional.
- `pnpm check:boundaries`, `pnpm check:redirect-boundary`, and
  `pnpm qa:css:budget`: passed.
- `pnpm qa:smoke`: passed on Vite `http://127.0.0.1:5300`, 64 capture paths,
  0 console issues, 0 page errors; diagnostics are in
  `.scratch/qa/qa-smoke-t286-full/diagnostics.json`.
- Code commit: `e978fa3c feat(runtime): port FightScreen intro timing boundary`.

The full checkpoint is green. The existing build chunk-size warning is
non-blocking and unrelated to this slice.

## Claim ceiling

This is not a full FightScreen port. Fight/Round announcement rendering,
shutter animation and color, skip and `RoundNoSkip`, character intro reset and
control semantics, dialogue, exact input/tick ordering, Common1/ZSS,
screenpack transforms, teams/Turns, rollback/netplay, score movement, and full
MUGEN/IKEMEN parity remain open.
