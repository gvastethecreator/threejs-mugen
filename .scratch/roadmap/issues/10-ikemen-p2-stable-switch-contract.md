# 10 - T425 Ikemen Stable P2 Switch Contract

Status: ready-for-agent
Labels: ikemen-runtime, source-review, runtime-trace, ready-for-agent
Lane: I2 bounded runtime
Priority: P1
Depends on: T419-T423; source-epoch decision before code

## Objective

Reconcile the official wiki's stable P2 target rule with the normative 05b
source pin, then make the explicit `ikemen-go` P2 selector retain or switch its
target according to the chosen source epoch.

## Official contract

The official [Ikemen P2 redirection page](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29#p2)
says P2 ignores state 5150, drives auto-facing, and changes only when another
enemy is at least 30 pixels closer. Runtime semantics remain bound to
[`05b7d98...`](https://github.com/ikemen-engine/Ikemen-GO/tree/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703)
until the source-authority process adopts another epoch.

## Current evidence

T419-T423 already provide the candidate domain, X/facing/Z distance policy,
separate P2 cache, P2-family/Partner reads, and active expression consumer.
The cache signature includes all positions and reorders immediately when they
change. That is not proof of the current wiki's target-retention threshold.

## Scope

1. Record whether 05b contains the documented retention rule or whether the
   wiki describes a later source epoch.
2. Update the source-family manifest/ledger with exact file and line links.
3. Implement the adopted behavior behind `ikemen-go` only, or record a blocked
   implementation decision if advancing the source epoch is required.
4. Preserve `EnemyNear`, `Enemy`, Partner, M.U.G.E.N profiles, and the existing
   candidate eligibility filter.
5. Make target invalidation explicit for KO/ineligible/removed candidates and
   deterministic ties.

## Acceptance

- Tests cover a challenger 29 pixels closer, exactly 30, and more than 30.
- KO/ineligible/removed current P2 invalidates without a stale read.
- Facing/Z options and deterministic ties remain covered.
- A live active-controller expression proves `P2Name` remains stable and then
  switches at the adopted boundary.
- The research ledger states the exact wiki/pin decision; no mixed-epoch claim
  remains.

## Verification

- Focused opponent-selection, expression-context, MatchWorld, and live runtime
  tests.
- Required trace if runtime behavior changes.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and diff hygiene.

## Claim ceiling

Allowed: the adopted, source-recorded P2 retention/invalidation contract for
the explicit Ikemen profile.

Blocked: Helper `type=player`, full team-mode selection, all CharList cache
flags/timing, rollback/netplay, score movement, or full Ikemen parity.
