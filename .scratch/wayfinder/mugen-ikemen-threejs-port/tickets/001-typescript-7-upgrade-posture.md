# TypeScript 7 upgrade posture

Type: research
Status: resolved
Blocked by: None

## Question

Should the project upgrade directly to TypeScript 7 or keep TypeScript 6 as a compatibility alias?

## Answer

Upgrade directly to `typescript@~7.0.2`. The repo currently uses `tsc` through CLI scripts and has no direct TypeScript compiler API imports under `src` or `scripts`. If a future tool needs API access, revisit the official `@typescript/typescript6` side-by-side package with failing-output evidence.

2026-07-09 re-audit: keep the direct route, and keep `tsconfig.json` explicit about `rootDir: "src"` so TS7's new `./` default cannot alter future emit layout if `noEmit` is relaxed.

Source note: `docs/research/2026-07-08-typescript-7-upgrade.md`.
