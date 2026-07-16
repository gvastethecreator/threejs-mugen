# Helper-owned Projectile Z spawn v1 closeout

Date: 2026-07-16
Slice: Wayfinder 214
Commits: `bf12d7eb`, `5297bb65`

## Result

The helper-owned Projectile production path now preserves spawn-time depth.
Typed Helper positions accept a third component, helper initialization carries
the authored origin into runtime state, and helper-local Projectile `offset` or
`pos` depth is resolved against the helper/P2 origin. Root-store ownership,
helper `parentId`, XY `postype`, and existing local-coordinate metadata remain
unchanged.

## Evidence

| Area | Result |
| --- | --- |
| Focused tests | `124/124` passed |
| TypeScript 7 | `pnpm typecheck` passed |
| Full tests | `216/216` files, `2284/2284` tests passed with `--testTimeout=30000` |
| Production build | Passed; known large-chunk warning remains |
| Module boundaries | `pnpm check:boundaries` passed |
| Trace QA | `633/633` artifacts passed, `0` skipped |

Trace artifacts: `.scratch/qa/trace-gates`.

The default full-suite attempt under parallel build load had one 5-second
timeout in an existing slow Turns test and no assertion failure. The isolated
30-second retry passed all files and tests; that retry is the authoritative
full-suite evidence for this closeout.

## Source basis

- [IKEMEN `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)
- [IKEMEN changed controller reference: Projectile parameters](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#projectile-parameters)
- `docs/research/2026-07-16-helper-projectile-depth-spawn.md`

## Claim ceiling

This closes bounded spawn-time helper/P1/P2 Z projection under the existing
owner/store model. It does not establish helper Z kinematics or binding,
cross-localcoord conversion, proxy/team ownership, complete collision or
presentation parity, rollback/netplay, or full MUGEN/IKEMEN parity. No browser
smoke was required because no visible UI or renderer surface changed.
