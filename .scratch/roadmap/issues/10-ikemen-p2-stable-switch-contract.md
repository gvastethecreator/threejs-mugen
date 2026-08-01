# 10 - T425 Ikemen Stable P2 Switch Contract

Status: closed-bounded
Labels: ikemen-runtime, source-review, runtime-trace, closed-bounded
Lane: I2 bounded runtime
Priority: P1
Depends on: T419-T423; source-epoch decision resolved

## Objective

Reconcile the official wiki's stable P2 target rule with the normative 05b
source pin, retain the chosen epoch's invalidation semantics, and make live
controller values consume the same explicit `ikemen-go` P2 selection.

## Official contract

The official [Ikemen P2 redirection page](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29#p2)
says P2 ignores state 5150, drives auto-facing, and changes only when another
enemy is at least 30 pixels closer. The 05b pin has separate P2 caches and
invalidation/rebuild paths, but no 30-pixel target-retention branch; current
master reviewed on 2026-07-30 has the same absence. Runtime semantics remain bound to
[`05b7d98...`](https://github.com/ikemen-engine/Ikemen-GO/tree/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703)
until the source-authority process adopts another epoch. T425 therefore adopts
source-visible cache invalidation, not wiki-only hysteresis.

## Current evidence

T419-T423 already provide the candidate domain, X/facing/Z distance policy,
separate P2 cache, P2-family/Partner reads, and active expression consumer.
T425 confirms the immediate source-visible refresh and closes a consumer gap:
controller values previously used a reduced expression context, so a live
`VarSet value = P2Name ...` could retain the base opponent after P2 switched.

## Scope

1. Record the wiki/05b discrepancy and the adopted source epoch.
2. Update the source-family manifest/ledger with exact file and line links.
3. Preserve immediate source-visible invalidation behind `ikemen-go` only and
   wire live P2-family bindings into controller values.
4. Preserve `EnemyNear`, `Enemy`, Partner, M.U.G.E.N profiles, and the existing
   candidate eligibility filter.
5. Make target invalidation explicit for KO/ineligible/removed candidates and
   deterministic ties.

## Acceptance

- Tests cover a one-pixel source-visible overtake plus KO/ineligible/removal
  without stale P2 reads.
- KO/ineligible/removed current P2 invalidates without a stale read.
- Facing/Z options and deterministic ties remain covered.
- A live active-controller value expression proves `P2Name` switches with the
  adopted source-visible boundary.
- The research ledger states the exact wiki/pin decision; no mixed-epoch or
  wiki-hysteresis claim remains.

## Verification

- Focused opponent-selection, controller-expression-context, MatchWorld, and
  live runtime tests: 5 files / 342 tests passed.
- Required `synthetic-imported-ikemen-p2-value` trace passed with checksum
  `fa72c6f2`; the trace matrix passed 668/668 artifacts (634 required,
  34 optional).
- Final gates passed: serial `pnpm test` (305 files / 3240 tests),
  `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
  `git diff --check`.

## Claim ceiling

Allowed: the adopted, source-recorded P2 cache invalidation/refresh contract
and live controller P2-family values for the explicit Ikemen profile.

Blocked: wiki-only 30-pixel hysteresis, Helper `type=player`, full team-mode
selection, all CharList cache flags/timing, rollback/netplay, score movement,
or full Ikemen parity.
