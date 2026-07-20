# Global checkpoint after T351

Date: 2026-07-20
Head: `701792d8`
Feature commit: `813bf6d6`
Documentation commit: `71967da6`
Status: green for the bounded Ikemen HelperVar and direct-admission block

## Evidence

- Full Vitest passed: `239/239` files and `2601/2601` tests.
- Focused T351 compiler/runtime/spawn/combat/trace tests passed: `759/759`
  across `6` files.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `326` transformed modules.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; T351 HelperVar checksum `cf9710ef`.
- `pnpm check:boundaries` passed.
- `git diff --check` passed for the T351 feature and documentation
  write-sets.
- Browser smoke is deferred because T351 changes runtime state, expression
  evaluation, direct combat admission, and trace fixtures only.

## Block covered

T351 adds typed static and resolved scalar `clsnproxy` data to the current
normal-Helper dispatch path. `HelperVar(clsnproxy)` is executable only in the
explicit `ikemen-go` Helper context. Proxy Helpers are excluded from the
existing direct Helper HitDef admission loop. The required imported HelperVar
trace now checks `helpertype`, `id`, `keyctrl`, `ownpal`, `ownprojectile`,
`preserve`, `ownclsnscale`, and `clsnproxy`.

Feature commit: `813bf6d6` (`feat(runtime): model HelperVar clsnproxy`).
Documentation commit: `71967da6` (`docs: record HelperVar clsnproxy evidence`).

## Advisories

- Vitest retains the existing jsdom `HTMLCanvasElement.getContext()` warning.
- Vite retains the existing post-minification large-chunk warning.
- Browser smoke remains outside this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the T351
  feature and documentation commits.

## Claim ceiling

This checkpoint confirms the bounded Helper-local `HelperVar(clsnproxy)` read,
static/dynamic dispatch, direct combat admission skip, and required imported
trace. Parent collision-box extension, root-to-Helper defender breadth, exact
proxy box flattening, renderer output, nested or redirected Helpers,
compatibility-score movement, external-engine differential evidence, and
complete MUGEN/IKEMEN parity remain open.
