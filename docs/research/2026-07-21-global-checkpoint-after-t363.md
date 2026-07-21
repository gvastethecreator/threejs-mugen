# Global checkpoint after T363

Date: 2026-07-21
Head: `fd9c7969`
Feature chain: `fd9c7969`
Status: green for the bounded Helper group-3 Size P2BodyDist block

## Global status

- Runtime collision: T360 isolates Helper proxy transforms. T361 and T362
  establish current Helper override state and verified RedirectID writes. T363
  projects current group-3 Size geometry into Helper `P2BodyDist`.
- Redirect ownership: T363 reads the already verified destination override
  state and does not add a new redirect mutation path.
- Studio editor: unchanged in this checkpoint.
- Three.js presentation: unchanged in this checkpoint. Browser smoke remains
  deferred because no visible UI or renderer path changed.
- Compatibility scores: unchanged. This is bounded runtime evidence, not a
  full-port or release claim.

## Evidence

- Focused runtime run passed: `6/6` files and `376/376` tests.
- `pnpm typecheck` passed with TypeScript `7.0.2`.
- `pnpm qa:trace` passed: `636/636` artifacts, `602` required and `34`
  optional, with `0` failed and `0` skipped fixtures.
- `pnpm build` passed with `329` transformed modules; JavaScript output was
  `2,096.73 kB` before gzip. Vite retains its existing large-chunk advisory.
- `pnpm check:boundaries`, `pnpm check:redirect-boundary`, and
  `git diff --check` passed.
- The latest full-suite baseline remains T356: `240/240` files and
  `2612/2612` tests. Full Vitest remains deferred until a larger runtime
  batch.

## Block covered

Current Helper group-3 `OverrideClsn` values now determine the caller and
primary opponent size boxes used by `P2BodyDist`. Width/Height deltas compose
before the group-3 override through one shared helper. Both normal and paused
Helper execution receive the opponent constants and local-coordinate system;
generic controller evaluation retains that context. Local writes and verified
RedirectID writes use the same current override state.

## Advisories

- The trace corpus has no dedicated P2BodyDist-size artifact. The new behavior
  has literal focused and imported-runtime assertions instead.
- Vite retains the existing post-minification large-chunk warning.
- Full Vitest and browser smoke remain deferred by the current runtime batch
  policy.

## Claim ceiling

This checkpoint confirms bounded current Helper group-3 Size input for
`P2BodyDist`. It does not confirm Helper PlayerPush, helper-wide collision
scheduling, size proxies, exact actor ordering, visual output, upstream/local
differentials, compatibility-score movement, or complete MUGEN/IKEMEN parity.
