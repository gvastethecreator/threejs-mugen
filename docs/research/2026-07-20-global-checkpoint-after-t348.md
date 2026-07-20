# Global checkpoint after T348

Date: 2026-07-20
Head: `34e1f77f`
Feature commit: `c8488e69`
Documentation commit: `5f0f23fd`
Status: green for the bounded Ikemen HelperVar block

## Evidence

- Full Vitest passed: `239/239` files and `2597/2597` tests.
- Focused T348 compiler/runtime/trace tests passed: `745/745`.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `326` transformed modules.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional.
- `pnpm check:boundaries` passed.
- `git diff --check` passed for the T348 feature and documentation
  write-sets.
- Browser smoke is deferred because T348 changes runtime state, expression
  evaluation, and trace fixtures only.

## Block covered

T348 adds typed static and resolved scalar `ownpal` data to the current
normal-Helper dispatch path. `HelperVar(ownpal)` is executable only in the
explicit `ikemen-go` Helper context, and the required imported HelperVar
trace now checks `helpertype`, `id`, `keyctrl`, `ownpal`, and
`ownprojectile`.

Feature commit: `c8488e69` (`feat(runtime): expose HelperVar ownpal`).
Documentation commit: `5f0f23fd` (`docs: record HelperVar ownpal evidence`).

## Advisories

- Vitest retains the existing jsdom `HTMLCanvasElement.getContext()` warning.
- Vite retains the existing post-minification large-chunk warning.
- Browser smoke remains outside this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the
  T348 feature and documentation commits.

## Claim ceiling

This checkpoint confirms the bounded Helper-local `HelperVar(ownpal)` read and
its required imported trace. Palette allocation/remapping, PalFX, renderer
output, Explod and Projectile `ownpal`, `preserve`, `ownclsnscale`, nested or
redirected Helpers, external-engine differential evidence,
compatibility-score movement, and complete MUGEN/IKEMEN parity remain open.
