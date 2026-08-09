# Issue 117 — Ikemen `ClsnVar` collision-box read

- Status: `closed-bounded`
- Lane: `R2 animation/runtime reads`
- Priority: `P1`

## Objective

Implement the official Ikemen `ClsnVar` trigger over the imported AIR collision
boxes and expose the same read in the Animation Testbench.

## Source gate

Use the official [Ikemen new triggers reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29).
`ClsnVar(value_type,index,elem)` reads the current frame. `value_type` is
`clsn1`, `clsn2`, or `size`; `index` is an expression; and `elem` is `back`,
`front`, `top`, or `bottom`. Missing boxes return `NaN`. Coordinates stay in
AIR space, with redirected reads converted to the caller's `localcoord`.

## Candidate fixture

- Read all four coordinates for current-frame `clsn1`, `clsn2`, and `size`.
- Apply current `OverrideClsn` data without applying `TransformClsn` scale.
- Return `NaN` for negative, missing, or out-of-range box indexes.
- Carry the read through CNS/controller contexts, redirects, `localcoord`, and
  the read-only Testbench.

## Evidence

- Focused Vitest: 5 files / 80 tests pass.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
  `pnpm qa:trace` pass; trace corpus is 686/686.
- `pnpm qa:browser:fighter-lab` passes and exposes `ClsnVar` with zero
  page/console errors.
- Full suite retains 12 inherited failed files / 39 failed tests. Broad smoke
  timed out at 180 seconds.

## Claim ceiling

Do not claim transformed/angled collision reads, Helper/Projectile ownership,
rollback/netplay serialization, or complete M.U.G.E.N/Ikemen collision parity.
