# Issue 376 — EnvShake dinámico de Projectile creado por Helper

## Estado

- **T801 — closed-bounded (2026-08-15)**
- **Área:** Projectile de primera generación creado por Helper, propiedad root
  y evaluación caller-context de `envshake.*`
- **Dependencia:** T799 y T800

## Objetivo

Resolver una vez el paquete finito `envshake.time`, `freq`, `ampl`, `phase`,
`mul` y `dir` de un Projectile creado por Helper usando las variables del
Helper que ejecuta el controller. El Projectile sigue almacenado y presentado
por el root.

## Matriz de identidad

| Rol | Identidad acotada |
| --- | --- |
| Caller de expresiones | `p1-helper-0` |
| Projectile owner/root | `p1` |
| Parent del Projectile | `p1-helper-0` |
| Receptor del contacto | `p2` |
| Evento de cámara | `p1` |

## Resultado

Un Projectile de primera generación creado por Helper resuelve el paquete
dinámico finito en el contexto del Helper; tras un hit aceptado no guardado
emite una EnvShake al root. Un componente authored no finito descarta el
paquete entero. Guardia y rechazo permanecen silenciosos.

La implementación conserva `owner/root = p1` y `parent = p1-helper-0`, aunque
las seis expresiones se evalúan como `p1-helper-0`. El resolver root de T800
no cambia.

## Criterios de cierre

- Resolver typed conectado en la ruta `Helper -> Projectile` sin modificar el
  resolver root cerrado en T800.
- Prueba focal: variables Helper, `owner/root = p1`, `parent = p1-helper-0`,
  y rechazo del paquete cuando una componente no es finita.
- Traza requerida
  `synthetic-imported-helper-projectile-dynamic-envshake`: `b8dd3455` /
  `0381f5c4`; prueba `Helper`, `VarSet`, `Projectile`, contacto, evento root,
  ciclo de vida y enlaces de objetivo root/Helper.
- Gates finales: `pnpm test` `328/4084`, typecheck, build y `pnpm qa:trace`
  `880/880` (`846` requeridos) pasan.

## Commits

- `a50e3031` — implementación y evidencia focal de T801.
- `41bae056` — actualización de la evidencia adjudicada por trazas.

## Fuera de alcance

Helpers anidados, equipos, `ownProjectile`, `ModifyProjectile`, FallEnvShake,
EnvShake activo, waveform, stacking, pausa/hitpause, cámara/render exactos,
overflow, rollback y paridad completa.
