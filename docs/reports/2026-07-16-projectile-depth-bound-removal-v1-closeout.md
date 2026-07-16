# Projectile ProjDepthBound v1 Closeout

Date: 2026-07-16
Slice: Wayfinder 212
Commit: `fa225104`

## Result

The port now accepts IKEMEN's optional `projdepthbound` parameter, carries the
finite non-negative value through compiler and runtime state, converts stage
depth limits into projectile-local units, and removes out-of-range projectiles
with the existing `bounds` lifecycle reason. Omitted bounds remain unbounded,
preserving legacy 2D stages. Root and helper-owned projectiles share the same
advance path. Snapshot output includes authored depth-bound state for diagnosis.

Collision admission, render ordering, terminal playback, and cancel timing stay
outside this slice.

## Evidence

| Area | Result |
| --- | --- |
| Focused tests | `140/140` passed across compiler, projectile, and effect-actor suites |
| TypeScript 7 | `pnpm typecheck` passed |
| Full tests | `216/216` files, `2281/2281` tests passed |
| Production build | Passed; known large-chunk warning remains |
| Module boundaries | `pnpm check:boundaries` passed |
| Trace QA | `633/633` artifacts passed, `0` skipped |

Trace artifacts: `.scratch/qa/trace-gates`.

## Source basis

- [IKEMEN `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)
- [IKEMEN changed state-controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#projectile-parameters)
- `docs/research/2026-07-16-projectile-depth-bound-removal.md`

## Claim ceiling

This closes the authored projectile depth-bound runtime/compiler contract and
its shared root/helper lifecycle path. It does not establish complete
MUGEN/IKEMEN parity, perspective rendering behavior, proxy/helper collision
depth, rollback/netplay, or complete Studio coverage.
