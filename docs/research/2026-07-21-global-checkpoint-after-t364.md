# Global checkpoint after T364

Date: 2026-07-21
Head: `22071b7b`
Feature chain: `22071b7b`
Status: green for the bounded IKEMEN Helper PlayerPush participation block

## Global status

- Runtime collision: T360-T363 established bounded Helper collision, redirect,
  and size state. T364 projects eligible current Helpers into the explicit Tag
  body-push path.
- Source profile: static normal/player Helper types are explicit to
  `ikemen-go`; MUGEN 1.1 strips player-type Helpers to normal.
- Studio editor: unchanged in this checkpoint.
- Three.js presentation: unchanged in this checkpoint. Browser smoke remains
  deferred because no visible UI or renderer path changed.
- Compatibility scores: unchanged. This is bounded runtime evidence, not a
  full-port or release claim.

## Evidence

- Focused runtime run passed: `5/5` files and `425/425` tests.
- `pnpm typecheck` passed with TypeScript `7.0.2`.
- `pnpm qa:trace` passed: `636/636` artifacts, `602` required and `34`
  optional, with `0` failed and `0` skipped fixtures.
- `pnpm build` passed with `329` transformed modules; JavaScript output was
  `2,099.10 kB` before gzip. Vite retains its existing large-chunk advisory.
- `pnpm check:boundaries`, `pnpm check:redirect-boundary`, and
  `git diff --check` passed.
- The latest full-suite baseline remains T356: `240/240` files and
  `2612/2612` tests. Full Vitest remains deferred until a larger runtime
  batch.

## Block covered

Static normal/player Helper types now have a typed compiler route. Unsupported
Helper type values fail closed at spawn. Player-type Helpers reset their
PlayerPush defaults before State -4, while normal Helpers require current
PlayerPush opt-in. Active root-owned Helpers with current PlayerPush state
join the Tag body-push participant list using current size, collision,
priority, weight, factor, and team-policy data. The MUGEN profile strips the
IKEMEN-only player Helper type back to normal.

## Advisories

- The trace corpus has no dedicated Helper PlayerPush artifact. Focused tests
  carry literal lifecycle, policy, diagnostic, and position assertions.
- Vite retains the existing post-minification large-chunk warning.
- Full Vitest and browser smoke remain deferred by the current runtime batch
  policy.

## Claim ceiling

This checkpoint confirms bounded current IKEMEN Helper PlayerPush projection.
It does not confirm exact CharList run order, duplicate ordered pairs,
nested/projectile Helpers, Helper Width/Height or size proxies, depth/corner
behavior, visual output, upstream/local differentials, compatibility-score
movement, or complete MUGEN/IKEMEN parity.
