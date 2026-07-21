# Global checkpoint after T367

Date: 2026-07-21

Head: `35f9fb0f`

Feature chain: `5351a0ac` (T365), `52e2cfa8` (T366), and `35f9fb0f`
(T367).

## Global status

- Current Helpers carry one-frame Width, Height, and IKEMEN Depth state through
  the shared actor-constraint boundary.
- Current root and Helper Width/Height/Depth RedirectID routes evaluate values
  in the caller, scale once for the destination local coordinate system, and
  use verified destination mutation.
- Root cross-root constraint redirects defer until the target root has reset
  its one-frame state. Helper redirects use current resource leases and
  writeback.
- Studio and Three.js renderer code did not change in this runtime-only batch.
  Compatibility scores remain unchanged.

## Evidence

- Focused T365-T367 batch: `6/6` files / `448/448` tests.
- TypeScript 7 typecheck passes.
- `pnpm qa:trace` passes `636/636` artifacts: `602` required and
  `34` optional.
- Production build passes with `329` transformed modules, `2,107.72 kB`
  JavaScript before gzip, and `527.99 kB` gzip output.
- Repository boundary, redirect-boundary, and diff-hygiene checks pass.

## Claim ceiling

Allowed: current local Helper Width player-size and Height, their verified
RedirectID routes, and current IKEMEN root/current-Helper Depth state with
current stage-depth clamping.

Blocked: Width edge and the edge component of Width value, Helper Z movement,
ScreenBound/StageBound controllers, nested ownership, exact source scheduler
order, size proxies, renderer/camera proof, upstream differentials,
rollback/netplay, score movement, and full MUGEN/IKEMEN parity.

## Deferred gates

The latest full Vitest baseline remains T356 at `240/240` files and
`2612/2612` tests. It was not rerun for this runtime-only batch. Browser
smoke is also deferred because no renderer or Studio path changed. The build
keeps its existing large-chunk advisory.
