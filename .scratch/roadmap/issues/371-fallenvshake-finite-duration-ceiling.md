# Issue 371 — finite `FallEnvShake` duration without inherited local ceiling

## Estado

- **T796 — closed-bounded (2026-08-15)**
- **Área:** stored fall EnvShake / finite lifetime / get-hit presentation
- **Dependencia:** T795 / issue 370

## Objetivo

Comparar la documentación M.U.G.E.N 1.1 y el pin Ikemen GO `149402f` para
decidir si `FallEnvShake` debe conservar un `fall.envshake.time` positivo mayor
que el techo local de 240 ticks. M.U.G.E.N define que el controlador consume
los parámetros de caída y limpia su tiempo; el pin transfiere el contador
positivo al EnvShake global antes de consumirlo.

## Claim previsto

El `FallEnvShake` root que consume `fall.envshake.time = 241` emite una
sacudida finita hasta expirar y limpia el valor fuente para impedir un segundo
disparo. La ruta no amplía Projectile ni EnvShake de contacto directo.

## Criterios de cierre

- Confirmar la ruta metadata HitDef/get-hit -> FallEnvShake -> proyección de
  cámara y separar el límite de los productores Projectile y contacto directo.
- Probar valor mayor que 240 y consumo único en la ruta root, con una traza
  requerida que pruebe duración observable y expiración.
- Mantener frecuencia, amplitud, fase, `mul`, `dir`, `diradd` y `decay` fuera
  del corte salvo regresión directa.

## Fuera de alcance

Waveform exacta, stacking/reemplazo global, EnvShake activo, Projectile,
EnvShake de contacto directo, pausa/hitpause, renderer/cámara exacta,
overflow/int32, ownership nested/team, rollback y paridad completa no
pertenecen a T796.

## Cierre

- **Producto:** `c0f89a8c` (`feat(runtime): lift FallEnvShake duration cap`).
- **Contrato cerrado:** el evento derivado de `fall.envshake.time` normaliza
  cualquier duración finita positiva sin el techo local de 240; Projectile y
  EnvShake de contacto directo conservan su propio límite de 240.
- **Límite de ownership:** `RuntimeMatchEnvShakeBridgeWorld.applyFallController`
  sólo se despacha desde la ruta root; no se reclama un controlador FallEnvShake
  activo de Helper.
- **Evidencia:** focused `4/4`, `pnpm test` `328/4075`, typecheck, build,
  evidencia DA29/DA30 `186/186`, y `pnpm qa:trace` `875/875` (`841`
  required) pasan. El artefacto requerido
  `synthetic-imported-fallenvshake-long-finite` pasa con checksum de trace
  `9f007c16`, final `7d456f38`, 254 frames y un único evento.
