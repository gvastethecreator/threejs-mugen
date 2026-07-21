# Global checkpoint after T360

Date: 2026-07-21
Head: `ee49d04b`
Feature commit: `ee49d04b`
Status: green for the bounded Helper clsnproxy transform block

## Evidence

- Focused runtime run passed: `3/3` files and `312/312` tests.
- `pnpm typecheck` passed with TypeScript `7.0.2`.
- `pnpm qa:trace` passed: `636/636` artifacts, `602` required and `34`
  optional, with `0` failed and `0` skipped fixtures.
- `pnpm build` passed with `328` transformed modules; JS output was
  `2,093.73 kB` before gzip.
- `pnpm check:boundaries` passed.
- `git diff --check` passed for the feature write-set.
- The latest full-suite baseline remains T356: `240/240` files and
  `2612/2612` tests. Full Vitest remains deferred until a larger runtime
  batch.
- Browser smoke remains deferred because this block changes collision runtime
  data only.

## Block covered

T360 closes the proxy-local angle gap from T359. Current active `clsnproxy`
Helpers contribute world-space Clsn1/Clsn2 boxes through the IKEMEN playable
bridge. Their own position, facing, current scale path, angle, and pivot stay
independent from root `TransformClsn` state. Root frame boxes retain the
existing root-local collision transform, and size boxes remain root-only.

## Advisories

- Vite retains the existing post-minification large-chunk warning.
- The global trace gate stays green, but its schema does not serialize a
  dedicated proxy-world-box artifact. Focused resolver and playable-bridge
  tests provide the geometry proof for this cut.
- Helper-local `OverrideClsn`, complete coordinate/animation scale order,
  helper offset/postype behavior, renderer proof, and upstream/local
  differential traces remain outside this block.

## Claim ceiling

This checkpoint confirms bounded root proxy geometry isolation under
`TransformClsn angle`. It does not confirm full helper collision semantics,
all projectile/reversal variants, size-box proxy behavior, visual parity,
compatibility-score movement, or complete MUGEN/IKEMEN parity.
