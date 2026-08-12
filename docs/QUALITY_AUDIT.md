# Quality audit

Fecha: 2026-08-12

## Estado

La modernización de tooling está integrada, pero el proyecto no se marca como
release-ready. El runtime conserva WIP explícito y dos gates heredados no pasan.

| Área | Resultado | Evidencia |
| --- | --- | --- |
| Gestor de paquetes | PASS | `packageManager: pnpm@11.20.0`, lockfile pnpm, sin Bun operativo |
| Dependencias | PASS | `pnpm outdated` vacío; `pnpm audit --audit-level=high` limpio |
| Tipos | PASS | `pnpm typecheck` |
| Build | PASS | `pnpm build` con Vite 8.2.1; warning de chunk >500 kB |
| CSS | PASS | `pnpm qa:css:budget` dentro de todos los presupuestos |
| Tests | BLOCKED | 3.983/3.985 pasan; falla `EffectActorSystem` helper Projectile |
| Trazas | BLOCKED | falla `synthetic-imported-helper-bind-to-target-redirect` |
| Browser smoke | INCONCLUSIVE | `pnpm qa:smoke` generó capturas, pero agotó el timeout del runner |

## Hallazgos accionables

1. Reparar el enlace de destino del fixture `helper BindToTarget RedirectID` y
   actualizar su gate sólo cuando exista evidencia de destino estable.
2. Revisar el contrato de `guardPoints` y la forma de `action` del Projectile
   helper en `EffectActorSystem.test.ts`; el fallo actual compara un payload
   heredado con el runtime WIP.
3. Separar el bundle principal de 2.5 MB con `import()` y code splitting cuando
   el trabajo de runtime permita una ronda de performance dedicada.
4. Repetir `pnpm qa:smoke` con un timeout de CI suficiente y conservar sus
   artefactos bajo `.scratch/qa/qa-smoke/`; el timeout no se interpreta como
   PASS ni FAIL funcional.

## Limpieza y documentación

- `.gitignore` cubre caches de Vite, TypeScript, Playwright, coverage y
  `.scratch` generado; se preservan las fuentes rastreadas de roadmap y
  Wayfinder.
- `.vscode/tasks.json` expone instalación, desarrollo, build, test, QA,
  dependencias, auditoría y verificación con nombres cortos y emojis.
- No se borraron fixtures, trazas, imágenes ni documentos rastreados: son
  evidencia del producto o WIP de usuario. Los artefactos generados siguen
  ignorados y pueden limpiarse de forma segura en una tarea separada.
