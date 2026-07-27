# DA29-002 global checkpoint (measured HEAD re-gate)

**ID:** DA29-002 `[G]`  
**Measured full stack at:** `a6e91520081d6308eac3d53b6bf333d4b950d019`  
**Date:** 2026-07-27  
**Log:** implementer `da29-gate.log` summary line must match this SHA and all exit codes 0.

## Commands and exit codes

| Step | Command | Exit |
| --- | --- | --- |
| typecheck | `pnpm typecheck` | 0 |
| test | `pnpm test` | 0 |
| traces | `pnpm qa:trace` | 0 |
| build | `pnpm build` | 0 |
| boundaries | `pnpm check:boundaries` | 0 |
| redirect boundary | `pnpm check:redirect-boundary` | 0 |

## Counts (from measured run)

- Vitest: all files passed (suite green at measured SHA)
- Traces: 663 artifacts passed
- Build: production client bundle
- Boundary guards: both passed

## Claim ceiling

- Allows: current **formal/global** pin at `a6e91520081d6308eac3d53b6bf333d4b950d019` only
- Blocks: score movement; inheritance of `32466c6e` as this ID's proof; product/visual tip rewrite

## Evidence path

- `docs/evidence/da29/closeouts/DA29-002.json` (`measuredGate: true`, `gateSha` matches formal pin)
- Scratch gate log summary: `typecheck=0 test=0 trace=0 build=0 boundaries=0 redirect=0 head=a6e91520…`
