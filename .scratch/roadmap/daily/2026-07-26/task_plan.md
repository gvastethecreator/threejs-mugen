# Plan diario 2026-07-26

## Objetivo

Reconstruir el estado real en HEAD `c01d5e70`, separar los cursores de evidencia,
revisar el corte sucio de `StateDef juggle`, contrastar fuentes oficiales y dejar
20-30 tareas ejecutables sin cambiar código.

## Reglas

- Sólo investigación, arquitectura y roadmap.
- Escrituras permitidas: `docs/` y `.scratch/roadmap/`.
- Sin runtime, UI, tests, fixtures, assets, suites, commit ni push.
- Preservar los seis archivos fuente modificados y documentos diarios previos.
- Un gate focal no hereda el estado del gate global, visual o de producto.
- La documentación no mueve puntajes.

## Cursores iniciales

| Cursor | Valor |
| --- | --- |
| HEAD | `c01d5e70cd153e554398f1024a96a2b716cfdcc2` |
| Rama | `master`, 81 commits delante de `origin/master` |
| Último cierre focal | T405 / `462591ad` |
| Último gate global | T383 / `38d62678` |
| Último gate visual | T342 / `1085badb` |
| Backlog formal | Entry 585 |
| Árbol reservado | Seis archivos de `StateDef juggle`, sin ticket ni cierre |
| Scores | 65 / 36 / 20 / 10-12 / 6-8 / 25 |

## Fases

### Fase 1 - Bootstrap y autoridades

**Status:** complete

Estado, CONTEXT, docs de control, score, workplan, Entry 585 e issues leídos.

### Fase 2 - Reconciliación de cursores

**Status:** complete

T389-T405 y cursores formal, focal, global, visual y producto separados.

### Fase 3 - Auditoría de evidencia

**Status:** complete

Código, pruebas, trazas guardadas, corpus, Studio, scanner, assets y límites
revisados sin ejecutar suites.

### Fase 4 - Fuente y arquitectura

**Status:** complete

Elecbyte, ambos pins de Ikemen y estándares web contrastados.

### Fase 5 - Roadmap ejecutable

**Status:** complete

Mapa de gaps, doce decisiones, siete fases y 30 tareas redactadas.

### Fase 6 - Validación y cierre

**Status:** complete

Links, conteo de tareas, whitespace, diff y memoria de automatización validados.

## Criterio de cierre

- Hechos, inferencias y preguntas quedan separados.
- Cursores HEAD/formal/focal/global/visual/producto quedan separados.
- El plan contiene 20-30 tareas con dependencia, aceptación, prueba, riesgo y
  límite de claim.
- `git diff --check` y el estado final confirman que esta ejecución no cambió
  código.
