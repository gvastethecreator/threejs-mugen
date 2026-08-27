# Contributing

This repository is pnpm-native (`pnpm@11.21.0`). Use that package manager.

## Run locally

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the Vite URL. The app starts in Runtime Mode.

## Checks

```bash
pnpm test
pnpm typecheck
pnpm build
```

Runtime compatibility work also needs `pnpm qa:trace`. Visual Runtime, Studio, renderer, or HUD work also needs `pnpm qa:smoke`.

## Rules

- Do not add commercial or third-party character packages. Local fixtures live under ignored `.scratch/fixtures/`. Generated and original assets live under `public/`.
- Do not claim full MUGEN or IKEMEN-GO parity from a partial gate. Name the fixture, the evidence, and the blocked scope.
- Keep MUGEN data and match runtime independent of Three.js. The renderer is an adapter.
- Prefer a small evidence-producing slice over a broad rewrite.

## Docs

Start with the [README](README.md) and [architecture overview](docs/ARCHITECTURE.md). Durable decisions live in [docs/adr/](docs/adr/). Compatibility claims use [docs/COMPATIBILITY_PROFILES.md](docs/COMPATIBILITY_PROFILES.md) and [docs/SUPPORTED_FEATURES.md](docs/SUPPORTED_FEATURES.md).
