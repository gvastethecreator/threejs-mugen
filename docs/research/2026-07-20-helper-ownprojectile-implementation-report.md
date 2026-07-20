# Reporte de implementación: Helper ownprojectile

Fecha: 2026-07-20  
Área: runtime MUGEN/IKEMEN, ownership de Projectiles  
Alcance: T343, slice explícita y acotada

## Resultado

El port ya conserva la propiedad lógica de un Projectile creado por un
Helper cuando `ownprojectile` se declara en el perfil `ikemen-go`. El
Projectile sigue dentro del almacén del root para mantener el paso de combate,
la presentación y el vínculo `rootId`; sus consultas de propiedad pasan a usar
el serial del Helper.

La ruta cubre valores numéricos estáticos y expresiones escalares soportadas.
La expresión dinámica se evalúa con el contexto vivo del actor. Un valor que
no puede resolverse bloquea el dispatch. Los perfiles restantes mantienen su
contrato anterior y descartan este parámetro.

## Investigación source-backed

La revisión local del commit Ikemen-GO
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` fijó estas reglas:

| Regla | Fuente | Adaptación local |
| --- | --- | --- |
| Un root puede poseer; un Helper necesita `ownProjectile`. | `char.go`, `canOwnProjectiles` | `RuntimeHelper.ownProjectile` opcional, con resolución en dispatch. |
| La creación escribe el owner efectivo. | `char.go`, `initFromChar` | `RuntimeProjectile.ownerId` recibe el serial del Helper cuando el flag es true. |
| `NumProj` y `Proj*Time` devuelven vacío o `-1` para un Helper sin ownership. | `char.go`, `numProj`, `projTimeTrigger` | Count, contacto, contact-time y cancel-time usan el predicado de ownership. |
| `ModifyProjectile` filtra por owner e ID. | `char.go`, `getMultipleProjs` | La mutación del Helper y la del root filtran por `ownerId`. |
| El controlador puede actualizar el flag con una expresión. | `bytecode.go`, `helper_ownprojectile` | Compilación typed + resolver dinámico `ikemen-go`. |

## Decisión de adaptación

El almacén actual agrupa los efectos por root. Cambiarlo en esta ronda habría
movido también el contrato de snapshots, lifecycle traces y combat traversal.
La adaptación conserva el almacén y separa la identidad lógica en
`ownerId`, `rootId` y `parentId`:

- `ownerId`: actor que puede consultar y modificar el Projectile;
- `rootId`: root de la partida y fallback de equipo;
- `parentId`: Helper que ejecutó el controlador.

El campo ausente conserva el filtro histórico por `parentId`. Esa decisión
protege los fixtures existentes y deja visible la deuda de migrar la ruta
predeterminada hacia la semántica source-backed completa.

## Prueba y estado global

- Focal T343: 3 archivos / 133 tests.
- Full Vitest: 239 archivos / 2593 tests.
- TypeScript 7: `pnpm typecheck` verde.
- Build: 326 módulos transformados.
- Trace: 633/633 artefactos, 599 required y 34 optional.
- Boundaries: verde.
- Browser smoke: diferido por tratarse de una modificación runtime sin cambio
  de renderer, Studio o ruta de navegador.

No se mueve ningún puntaje de compatibilidad. El cierre acredita una frontera
typed y probada para ownership explícito; no acredita paridad general de
Projectiles ni el port completo.

## Riesgos que siguen abiertos

- La ausencia del campo conserva una ruta temporal distinta de Ikemen-GO.
- El orden e índice de Projectiles aún requieren una autoridad global para
  varios actores y varios Projectiles.
- Ownership anidado, reflejos, rollback/netplay y persistencia de snapshots
  todavía no tienen una prueba diferencial.
- El reporte no cubre una ruta visual nueva, por lo que no cambia la evidencia
  de Studio ni el smoke browser.

## Fuentes primarias

- [Ikemen-GO `char.go` fijado](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go)
- [Ikemen-GO `bytecode.go` fijado](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go)
- `.scratch/external/Ikemen-GO/src/char.go`
- `.scratch/external/Ikemen-GO/src/bytecode.go`
