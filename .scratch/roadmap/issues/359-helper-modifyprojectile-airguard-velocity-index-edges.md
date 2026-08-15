# Issue 359 — Helper `ModifyProjectile airguard.velocity` index edges

## Estado

- **T785 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / selection / edge cases
- **Dependencia:** T784 / issue 358

## Objetivo

Cerrar la semántica fail-closed de selección por `index` para el mismo vector
`airguard.velocity`, después de la ruta válida de T784: id cero u omitido,
índice negativo, índice fuera de rango y selector sin coincidencias no deben
mutar ningún Projectile vivo.

## Alcance permitido

- Reutilizar el Helper de primera generación y la tienda root-owned de
  Projectiles de T784.
- Casos estáticos y `var()` finitos evaluados una vez en caller context.
- Pruebas focused de no-mutación, preservación de hermanos/trampa y ausencia
  de payload/contacto espurio.

## Fuera de alcance

Fresh/default derivation, dynamic `n`, nested Helpers, shared/team topology,
multi-target contact, new vector families, exact timing/rounding, rollback y
full M.U.G.E.N/Ikemen parity.

## Evidencia requerida

- Unit/integration tests para cada clase de índice inválido u omitido.
- Required trace sólo si existe una ruta pública estable para observar la
  no-mutación; de lo contrario, mantenerlo como focused runtime proof.
- Typecheck, `git diff --check` y aggregate QA con blockers heredados
  registrados sin ocultarlos.
