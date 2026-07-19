# Research: Runtime win-pose readiness delay

Date: 2026-07-18
Ticket: [T275](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/275-runtime-win-pose-readiness.md)

## Question

When should the bounded runtime request reserved win/lose states after phase
`4` opens, and which existing ownership boundaries must remain unchanged?

## Primary sources

- [Pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683): phase `4` begins after `over.waittime` and is distinct from pre-over phase `3`.
- [Pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3268): `winposetime` decrements only after the phase-4 boundary and reserved `180`/`170`/`175` entry occurs at the zero boundary.
- [Pinned IKEMEN-GO default round values](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174): default `over.waittime` is `45`, `over.wintime` is `45`, and `over.time` is `210`.

## Local findings

- T274 opens phase `4` at bounded post-KO frame `45`, while the local terminal
  post-KO clock remains `255` frames (`45 + 210`).
- T273 `RuntimeRoundWinPose/v0` owns state availability and one-shot entry, so
  readiness belongs at its caller rather than in `RuntimeStateEntryWorld` or
  CNS parsing.
- `RuntimeMatchOutcomeProjection/v0` intentionally remains independent from
  state-entry availability; this slice must not make score projection depend on
  a missing state `180` asset.

## Decision

Use a bounded `45`-frame win-pose delay after the phase-4 opening. The active
normal/tag runtime requests reserved states only when post-KO frame `90` is
observed (`45` wait frames plus `45` win-pose frames). The existing
availability, idempotence, `RoundNotOver` hold, score projection, and Turns
boundaries remain unchanged.

## Claim ceiling

This is a local timing adaptation backed by pinned default values. It does not
claim exact frame-start ordering, skip-input behavior, `over.forcewintime`,
Common1/ZSS readiness, motif/fade ownership, time-over choreography, or full
MUGEN/IKEMEN parity.

## Verification

- Implementation commit: `dbb13813`.
- Focused proof: reserved-state handoff and phase-4 hold assertions passed;
  `pnpm typecheck` passed.
- Broad proof: `pnpm test` passed `233` files / `2456` tests, the production
  build passed with the existing large-chunk warning, both boundary checks
  passed, and `pnpm qa:trace` passed `633/633` artifacts.
- Compatibility journey goldens were refreshed in `61c10442`: aggregate
  `1f3d95f3`, legal no-KO-slow artifact `3013c0b8`.

## Next action

Replace the bounded default with parsed per-round configuration and audit the
release boundary separately. Keep Common1/ZSS execution, `over.forcewintime`,
time-over state `175`, motif/fade ownership, Turns, and full parity outside this
ticket until they have independent evidence.
