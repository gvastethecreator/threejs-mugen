# Issue 376 — EnvShake dinámico de Projectile creado por Helper

## Estado

- **T801 — active (2026-08-15)**
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

## Claim previsto

Un Projectile de primera generación creado por Helper resuelve el paquete
dinámico finito en el contexto del Helper; tras un hit aceptado no guardado
emite una EnvShake al root. Un componente authored no finito descarta el
paquete entero. Guardia y rechazo permanecen silenciosos.

## Criterios de cierre

- Conectar un resolver typed de `envshake.*` en la ruta
  `Helper -> Projectile` sin cambiar el resolver root ya cerrado en T800.
- Probar contexto de vars del Helper, propiedad `owner/root = p1`,
  `parent = p1-helper-0`, y rechazo del paquete no finito.
- Añadir una traza requerida con `Helper`, `VarSet`, `Projectile`, contacto,
  evento root, ciclo de vida y enlaces de objetivo root/Helper.

## Fuera de alcance

Helpers anidados, equipos, `ownProjectile`, `ModifyProjectile`, FallEnvShake,
EnvShake activo, waveform, stacking, pausa/hitpause, cámara/render exactos,
overflow, rollback y paridad completa.
