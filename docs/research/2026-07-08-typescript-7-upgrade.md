# TypeScript 7 Upgrade Research

Date: 2026-07-08

## Question

Should `mugen-web-sandbox` upgrade its `typescript` dev dependency from TypeScript 6 to TypeScript 7 directly, or keep a TypeScript 6 compatibility alias for tooling?

## Answer

Upgrade the repo's direct `typescript` dev dependency to `~7.0.2` and do not add `@typescript/typescript6` unless a gate proves a tool needs the TypeScript compiler API. This repo currently uses TypeScript through the `tsc` CLI in `build` and `typecheck`, and a focused source/script search found no direct `typescript` API imports.

## Sources

- Microsoft TypeScript blog, "Announcing TypeScript 7.0", 2026-07-08: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- Microsoft `typescript-go` CHANGES.md, current `main`: https://github.com/microsoft/typescript-go/blob/main/CHANGES.md
- npm registry checks run locally on 2026-07-08:
  - `npm view typescript version` -> `7.0.2`
  - `npm view @typescript/typescript6 version` -> `6.0.2`

## Findings

- TypeScript 7 is available through the standard `typescript` package and provides the new native `tsc` executable.
- TypeScript 7.0 does not ship a compiler API. Microsoft recommends side-by-side TypeScript 6 via `@typescript/typescript6` or npm aliases for tools that still need programmatic compiler access.
- TypeScript 7.0 aims for TypeScript 6 command-line/type-checking compatibility, but adopts the TypeScript 6 defaults and hard errors for deprecated options.
- This repo's `tsconfig.json` already sets the sensitive defaults explicitly: `target`, `module`, `moduleResolution`, `types`, `strict`, `include`, and `noEmit`.
- The CHANGES file focuses heavily on intentional JavaScript/JSDoc and CommonJS behavior differences in the Go port. The repo's typecheck includes `src` TypeScript only; Node `.cjs` scripts are executed by Node and are not part of the TypeScript program.
- Local audit before the upgrade:
  - `pnpm why typescript` -> only `mugen-web-sandbox` devDependency, resolved `typescript@6.0.3`.
  - `rg` found no `from "typescript"`, `require("typescript")`, `createProgram`, `transpileModule`, `ts-morph`, `typescript-eslint`, or `tsserver` use under `src` or `scripts`.

## Decision Impact

- Use `pnpm add -D typescript@~7.0.2`.
- Run the normal project gates after install: `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm qa:trace`, `pnpm check:boundaries`, and `git diff --check`.
- If a gate fails because a dependency imports the TypeScript API, add the TypeScript 6 compatibility package only with failing-output evidence.

## Implementation Verification (2026-07-09)

- Workspace-level TS toolchain in `package.json` remains `typescript: "~7.0.2"` and lockfile entries are pinned at `7.0.2` across npm platform packages.
- Post-upgrade audit on 2026-07-09 found no TS7 blockers. The only initial warning was an implicit `rootDir`; `tsconfig.json` now sets `rootDir: "src"` so TS7's new `./` default cannot change future emit layout if `noEmit` is relaxed later, and the follow-up audit passed with 0 errors and 0 warnings.
- `types` remains explicit as `["vite/client"]`; no TypeScript compiler API imports were found in the repo search, and `pnpm why typescript` still resolves only `typescript@7.0.2`.
- End-to-end project checks after `rootDir` hardening: `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm qa:trace`, `pnpm check:boundaries`, and `git diff --check` passed; `pnpm test` reported 153 files / 1495 tests and `pnpm qa:trace` reported 523/523 artifacts, 492 required and 31 optional.
- No runtime-facing JS/JSDoc behavior changes were required by this repo slice; no `@typescript/typescript6` compatibility alias was added because CLI-only `tsc` usage remains.
