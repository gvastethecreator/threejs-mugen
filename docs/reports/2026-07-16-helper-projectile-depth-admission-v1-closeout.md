# Helper-parented Projectile depth admission v1 closeout

Date: 2026-07-16
Slice: Wayfinder 215
Commit: `f612ea4e`

## Result

The existing projectile depth oracle is now explicitly proven for
helper-parented Projectiles that remain in the owner's root effect store. A
separated Z range is rejected before XY admission; a touching Z edge resolves
the normal contact and removal path. This was a test/evidence slice and did
not add a second ownership or collision implementation.

## Evidence

| Area | Result |
| --- | --- |
| Focused tests | `31/31` passed in `ProjectileCombatSystem.test.ts` |
| TypeScript 7 | `pnpm typecheck` passed |
| Full tests | `216/216` files, `2285/2285` tests passed with `--testTimeout=30000` |
| Production build | Passed in the preceding Wayfinder 214 runtime checkpoint |
| Module boundaries | Passed in the preceding Wayfinder 214 runtime checkpoint |
| Trace QA | `633/633` artifacts passed, `0` skipped in the preceding runtime checkpoint |

Trace artifacts: `.scratch/qa/trace-gates`.

## Source basis

- [IKEMEN `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)
- `docs/research/2026-07-16-helper-projectile-depth-admission.md`

## Claim ceiling

This closes only helper-parented Projectile attack admission against root
actors under the current store and depth-oracle contracts. Helper defenders,
proxy/team ownership, dynamic depth mutation, depth-bound timing,
presentation, rollback/netplay, and complete MUGEN/IKEMEN parity remain open.
No browser smoke was required because the slice changed tests and runtime
compatibility evidence, not a visible UI or renderer surface.
