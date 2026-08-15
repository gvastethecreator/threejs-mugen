# Dependency baseline review

Review date: 2026-08-15

## Result

This project does not use Bun in its runtime or scripts. pnpm is the canonical
package manager and is pinned in `package.json` as `pnpm@11.21.0`.

`pnpm install --frozen-lockfile` keeps the lockfile reproducible. The 2026-08-15
maintenance pass found no outdated direct dependencies and no high-severity
audit findings; only the package-manager pin advanced from 11.20.0 to 11.21.0.

| Package | Before | Current | Changelog / migration |
| --- | --- | --- | --- |
| `vite` | 8.0.16 | 8.2.1 | [releases](https://github.com/vitejs/vite/releases) |
| `vitest` | 4.1.9 | 4.1.10 | [releases](https://github.com/vitest-dev/vitest/releases) |
| `three` | 0.184.0 | 0.185.1 | [releases](https://github.com/mrdoob/three.js/releases), [migration guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide) |
| `@types/three` | 0.184.1 | 0.185.4 | [DefinitelyTyped history](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/master/types/three) |
| `@tabler/icons` | 3.44.0 | 3.46.0 | [releases](https://github.com/tabler/tabler-icons/releases) |
| `jsdom` | 29.1.1 | 30.0.1 | [releases](https://github.com/jsdom/jsdom/releases) |
| `playwright` | 1.61.0 | 1.62.1 | [releases](https://github.com/microsoft/playwright/releases) |
| `@types/node` | 26.0.0 | 26.2.0 | [DefinitelyTyped history](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/master/types/node) |

`jszip@3.10.1` and `typescript@7.0.2` were already at the versions accepted by
the lockfile policy and did not change.

## Reviewed impact

- Three.js and its types move together to avoid API drift in the renderer and
  sprite adapters.
- Vite and Vitest receive toolchain fixes without changing the app entrypoint.
- Playwright and jsdom keep browser smoke and DOM tests on the same Node baseline.
- Tabler Icons only changes the typed icon catalogue; UI contracts are unchanged.
- There is no Bun migration: the repository is pnpm-native and has no `bun.lock`,
  `bun:*` imports, or Bun-dependent scripts.

## Verification

```bash
pnpm install --frozen-lockfile
pnpm outdated
pnpm audit --audit-level=high
pnpm typecheck
pnpm build
pnpm qa:css:budget
```

The dependency checks are clean. Product gates and current WIP residuals are
tracked separately in [`QUALITY_AUDIT.md`](QUALITY_AUDIT.md); a passing package
audit does not imply runtime compatibility.
