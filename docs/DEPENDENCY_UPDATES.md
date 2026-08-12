# Dependency baseline review

Fecha de revisión: 2026-08-12

## Resultado

Este proyecto no ejecuta Bun en su runtime ni en sus scripts. El gestor
canónico es pnpm y queda fijado en `package.json` como `pnpm@11.20.0`.

`pnpm update --latest` y `pnpm install --frozen-lockfile` dejan el lockfile
reproducible y actualizan el baseline fijado por el proyecto.

| Paquete | Antes | Ahora | Changelog / migración |
| --- | --- | --- | --- |
| `vite` | 8.0.16 | 8.2.1 | [releases](https://github.com/vitejs/vite/releases) |
| `vitest` | 4.1.9 | 4.1.10 | [releases](https://github.com/vitest-dev/vitest/releases) |
| `three` | 0.184.0 | 0.185.1 | [releases](https://github.com/mrdoob/three.js/releases), [migration guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide) |
| `@types/three` | 0.184.1 | 0.185.4 | [DefinitelyTyped history](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/master/types/three) |
| `@tabler/icons` | 3.44.0 | 3.46.0 | [releases](https://github.com/tabler/tabler-icons/releases) |
| `jsdom` | 29.1.1 | 30.0.1 | [releases](https://github.com/jsdom/jsdom/releases) |
| `playwright` | 1.61.0 | 1.62.1 | [releases](https://github.com/microsoft/playwright/releases) |
| `@types/node` | 26.0.0 | 26.2.0 | [DefinitelyTyped history](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/master/types/node) |

`jszip@3.10.1` y `typescript@7.0.2` ya estaban en la versión disponible
aceptada por las políticas del lockfile y no cambiaron.

## Impacto revisado

- Three.js y sus tipos avanzan juntos para evitar divergencias de API en el
  renderer y los adaptadores de sprites.
- Vite y Vitest reciben correcciones de toolchain sin cambiar la entrada de
  la aplicación. El build sigue produciendo el bundle esperado.
- Playwright y jsdom se actualizan para mantener la smoke browser y las
  pruebas DOM en el mismo baseline de Node.
- Tabler Icons sólo cambia el catálogo tipado; no se alteran contratos de UI.
- No hubo migración de Bun: el repositorio ya era pnpm-native y no tiene
  `bun.lock`, imports `bun:*`, ni scripts que requieran Bun.

## Verificación

```bash
pnpm install --frozen-lockfile
pnpm outdated
pnpm audit --audit-level=high
pnpm typecheck
pnpm build
pnpm qa:css:budget
```

La batería completa `pnpm test` y el gate `pnpm qa:trace` mantienen un caso
heredado fallando en el WIP de runtime (`helper Projectile` y
`helper BindToTarget RedirectID`); no son errores de resolución de paquetes.
