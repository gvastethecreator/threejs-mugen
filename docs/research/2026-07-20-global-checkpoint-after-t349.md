# Global checkpoint after T349

Date: 2026-07-20
Head: `3822664d`
Feature commit: `4d2cb9c9`
Documentation commit: `3822664d`
Status: green for the bounded Ikemen HelperVar block

## Evidence

- Full Vitest passed: `239/239` files and `2598/2598` tests.
- Focused T349 compiler/runtime/trace tests passed: `746/746`.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `326` transformed modules.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional.
- `pnpm check:boundaries` passed.
- `git diff --check` passed for the T349 feature and documentation
  write-sets.
- Browser smoke is deferred because T349 changes runtime state, expression
  evaluation, and trace fixtures only.

## Block covered

T349 adds typed static and resolved scalar `preserve` data to the current
normal-Helper dispatch path. `HelperVar(preserve)` is executable only in the
explicit `ikemen-go` Helper context, and the required imported HelperVar
trace now checks `helpertype`, `id`, `keyctrl`, `ownpal`, `ownprojectile`, and
`preserve`.

Feature commit: `4d2cb9c9` (`feat(runtime): expose HelperVar preserve`).
Documentation commit: `3822664d` (`docs: record HelperVar preserve evidence`).

## Advisories

- Vitest retains the existing jsdom `HTMLCanvasElement.getContext()` warning.
- Vite retains the existing post-minification large-chunk warning.
- Browser smoke remains outside this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the
  T349 feature and documentation commits.

## Claim ceiling

This checkpoint confirms the bounded Helper-local `HelperVar(preserve)` read
and its required imported trace. Round-start backup, F4/reload, destruction
policy, persistence across new rounds, `ownclsnscale`, `clsnproxy`, nested or
redirected Helpers, external-engine differential evidence,
compatibility-score movement, and complete MUGEN/IKEMEN parity remain open.
