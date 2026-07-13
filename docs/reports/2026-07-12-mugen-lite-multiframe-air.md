# MUGEN-lite Multi-frame AIR Report

Date: 2026-07-12
Roadmap entry: 467

## Delivered

- CC0 legal fixture action `200` now has AIR elements `200,0` and `200,1`, each held for four ticks.
- SFF v1 ships distinct indexed `200,0` and `200,1` PCX sprites.
- Trace actor-frame evidence exposes observed AIR element indices and per-index counts while preserving existing state/action aggregation.
- Browser smoke captures both imported elements after real `a -> x` input, checks palette pixels and distinct masks, and returns to idle on desktop and mobile.
- Fall snapshots use bounded visible `1F` controls to capture exact transient states without renderer-rate races.

## Evidence

- Primary format basis: [Elecbyte AIR format](https://www.elecbyte.com/mugendocs-11b1/air.html).
- Focused fixture and trace tests: `21/21` passed.
- Full suite: `183` files / `1936` tests passed.
- `pnpm typecheck`, `pnpm build`, and `pnpm check:boundaries`: passed.
- `pnpm qa:smoke`: passed twice consecutively in Playwright/SwiftShader.
- `pnpm qa:trace`: `565/565` passed, `534` required; `mugen-lite-journey` checksum `a372a02c`, final `24709fb2`.
- Independent re-review: no P0/P1/P2 findings.
- Screenshots: `.scratch/qa/qa-smoke/mugen-lite-runtime-{desktop,mobile}-attack[-follow-through][-canvas].png`.

## Claim Boundary

Proven: the legal package renders a real two-element imported attack through the production browser route.

Blocked: AIR loop/loopstart/interpolation/offset/flip/trans parity, arbitrary timing, other multi-frame actions, production art, and visual parity.
