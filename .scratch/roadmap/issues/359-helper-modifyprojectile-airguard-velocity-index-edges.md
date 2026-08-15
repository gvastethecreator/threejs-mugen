# Issue 359 — Helper `ModifyProjectile airguard.velocity` edge semantics

## Estado

- **T785 — closed-bounded (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / selection / edge cases
- **Dependencia:** T784 / issue 358

## Objetivo

Verificar la semántica edge oficial de selección para el mismo vector
`airguard.velocity`, después de la ruta válida de T784: `id` omitido o
negativo selecciona todos los Projectiles activos; `id=0` es un id literal;
`index` negativo mantiene el broadcast; un índice fuera de rango o un id sin
coincidencias no muta ningún Projectile.

## Alcance permitido

- Reutilizar el Helper de primera generación y la tienda root-owned de
  Projectiles de T784.
- Casos estáticos y `var()` finitos evaluados una vez en caller context.
- Pruebas focused de broadcast oficial, selección literal de id cero,
  preservación de hermanos/trampa y no-mutación para rango vacío o id ausente.

## Fuera de alcance

Fresh/default derivation, dynamic `n`, nested Helpers, shared/team topology,
multi-target contact, new vector families, exact timing/rounding, rollback y
full M.U.G.E.N/Ikemen parity.

## Autoridad

La implementación sigue el pin Ikemen GO `149402f`: `getMultipleProjs` usa
`id < 0` e `index < 0` como selección múltiple, filtra `id=0` literalmente y
devuelve vacío cuando el índice o el id no encuentran un Projectile activo.
M.U.G.E.N 1.1 no documenta `ModifyProjectile`; el controlador es Ikemen-only.

## Evidencia requerida

- Unit/integration tests para cada clase de índice inválido u omitido.
- Una required trace no es necesaria: la selección edge es una operación
  pre-contacto y el seam público determinista es `modifyRuntimeProjectiles`/
  Helper micro-VM.
- Typecheck, `git diff --check` y aggregate QA con blockers heredados
  registrados sin ocultarlos.

## Cierre T785

- Commit: `42788837` (focused root/Helper edge-selection coverage).
- Focused gate: 2 archivos, 12 tests relacionados pasan; `pnpm run typecheck`
  y `git diff --check` pasan.
- La cobertura confirma el contrato oficial: id omitido/negativo y `index`
  negativo hacen broadcast; `id=0` selecciona el id literal; índice fuera de
  rango e id sin coincidencias devuelven cero mutaciones y preservan todos los
  vectores. La variante Helper evalúa un `Var()` negativo en caller context.
- El aggregate QA sigue en `867` artefactos: `866` pasan, `833` required y
  `34` optional; el único fallo heredado continúa siendo
  `synthetic-imported-helper-bind-to-target-redirect`.

## Next bounded slice

T786 / issue 360 cubrirá `RedirectID` de `ModifyProjectile` emitido por un
Helper sobre el store de un root destino, con `airguard.velocity` como campo
observable y caller-context separado. La semántica de selección edge y la
topología de equipos/nested Helpers quedan fuera.
