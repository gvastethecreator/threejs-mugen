# Changelog

## 2026-08-12 — mantenimiento de proyecto

- Actualizadas las dependencias directas a las versiones disponibles y
  regenerado `pnpm-lock.yaml`.
- Confirmado pnpm como gestor canónico; no se migró Bun porque este proyecto no
  lo utiliza de forma operativa.
- Añadidos scripts `check`, `deps:check`, `audit` y `verify`.
- Añadido `.vscode/tasks.json` con tareas comunes y emojis.
- Revisado `.gitignore` para caches y reportes locales sin ocultar tareas de
  VS Code.
- Documentados los changelogs y el impacto esperado en
  `docs/DEPENDENCY_UPDATES.md`.
- Registrado el estado real de gates en `docs/QUALITY_AUDIT.md`.

## Nota de compatibilidad

El WIP de runtime permanece intacto. Los fallos conocidos de helper Projectile
y helper BindToTarget RedirectID se mantienen como bloqueos explícitos y no se
ocultan mediante cambios de expectativas.
