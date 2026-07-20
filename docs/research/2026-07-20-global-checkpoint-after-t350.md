# Global checkpoint after T350

Date: 2026-07-20
Head: `58bcc0b7`
Feature commit: `9f0ecd65`
Documentation commit: `d44a8f1e`
Status: green for the bounded Ikemen HelperVar block

## Evidence

- Full Vitest passed: `239/239` files and `2599/2599` tests.
- Focused T350 compiler/runtime/trace tests passed: `747/747`.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `326` transformed modules.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional.
- `pnpm check:boundaries` passed.
- `git diff --check` passed for the T350 feature and documentation
  write-sets.
- Browser smoke is deferred because T350 changes runtime state, expression
  evaluation, and trace fixtures only.

## Block covered

T350 adds typed static and resolved scalar `ownclsnscale` data to the current
normal-Helper dispatch path. `HelperVar(ownclsnscale)` is executable only in
the explicit `ikemen-go` Helper context, and the required imported HelperVar
trace now checks `helpertype`, `id`, `keyctrl`, `ownpal`, `ownprojectile`,
`preserve`, and `ownclsnscale`.

Feature commit: `9f0ecd65` (`feat(runtime): expose HelperVar ownclsnscale`).
Documentation commit: `d44a8f1e` (`docs: record HelperVar ownclsnscale evidence`).

## Advisories

- Vitest retains the existing jsdom `HTMLCanvasElement.getContext()` warning.
- Vite retains the existing post-minification large-chunk warning.
- Browser smoke remains outside this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the
  T350 feature and documentation commits.

## Claim ceiling

This checkpoint confirms the bounded Helper-local `HelperVar(ownclsnscale)`
read and its required imported trace. Collision-scale selection, hitbox and
body-push geometry, renderer output, `clsnproxy`, nested or redirected
Helpers, external-engine differential evidence, compatibility-score movement,
and complete MUGEN/IKEMEN parity remain open.
