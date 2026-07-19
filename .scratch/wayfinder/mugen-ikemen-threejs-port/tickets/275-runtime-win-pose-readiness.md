# Ticket 275: Runtime win-pose readiness delay

- Status: resolved bounded
- Date: 2026-07-18
- Scope: delay bounded reserved win/lose state entry until the local phase-4
  win-pose timer reaches its source-backed default boundary
- Depends on: [T274](274-runtime-roundnotover-phase4.md)
- Research: [`docs/research/2026-07-18-runtime-win-pose-readiness.md`](../../../../docs/research/2026-07-18-runtime-win-pose-readiness.md)

## Question

How can the active normal/tag runtime preserve a live phase-4 window before
entering states `180`/`170`/`175`, while leaving state availability, score
projection, and Turns ownership independent?

## Bounded contract

1. Add an explicit bounded `45`-frame win-pose delay after phase `4` opens.
2. Request reserved states only at post-KO frame `90` under the current
   `45`-frame phase-4 opening.
3. Keep existing idempotence, unavailable diagnostics, `RoundNotOver` hold,
   match projection, and Turns boundaries unchanged.
4. Expose no exact MUGEN/IKEMEN timing claim beyond the pinned default-value
   adaptation.

## Acceptance evidence

- Implementation: `src/mugen/runtime/RuntimeRoundWinPoseSystem.ts` exposes the
  source-backed bounded `45`-frame default; `PlayableMatchRuntime` requests the
  reserved state only at post-KO frame `90` (`45` phase-4 opening frames plus
  `45` win-pose frames).
- Commit: `dbb13813`.
- Focused verification: the reserved-state handoff and phase-4 hold test
  passed (`2` targeted tests); `pnpm typecheck` and `git diff --check` passed.
- Broad checkpoint: `pnpm test` passed `233` files / `2456` tests; `pnpm build`,
  `pnpm typecheck`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, and `pnpm qa:trace` passed. The trace gate
  passed `633/633` artifacts (`599` required, `34` optional); the legal journey
  aggregate is `1f3d95f3` with `mugen-lite-journey-nokoslow` at `3013c0b8`.
- Closeout: [`docs/reports/2026-07-18-runtime-win-pose-readiness-closeout.md`](../../../../docs/reports/2026-07-18-runtime-win-pose-readiness-closeout.md).

## Claim ceiling

Blocked: exact frame-start order, skip-input/force-win behavior,
`over.forcewintime`, Common1/ZSS, motif/fade, time-over choreography, Simul,
rollback/netplay, and full MUGEN/IKEMEN parity.
