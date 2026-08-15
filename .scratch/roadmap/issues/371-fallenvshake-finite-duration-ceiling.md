# Issue 371 — finite `FallEnvShake` duration without inherited local ceiling

## Estado

- **T796 — queued (2026-08-15)**
- **Área:** stored fall EnvShake / finite lifetime / get-hit presentation
- **Dependencia:** T795 / issue 370

## Objetivo

Comparar la documentación M.U.G.E.N 1.1 y el pin Ikemen GO `149402f` para
decidir si `FallEnvShake` debe conservar un `fall.envshake.time` positivo mayor
que el techo local de 240 ticks. M.U.G.E.N define que el controlador consume
los parámetros de caída y limpia su tiempo; el pin transfiere el contador
positivo al EnvShake global antes de consumirlo.

## Claim previsto

Un `FallEnvShake` root o Helper que consume `fall.envshake.time = 241` emite
una sacudida finita hasta expirar y limpia el valor fuente para impedir un
segundo disparo. La ruta no amplía Projectile ni EnvShake de contacto directo.

## Criterios de cierre

- Confirmar la ruta metadata HitDef/get-hit -> FallEnvShake -> proyección de
  cámara y separar el límite de los productores Projectile y contacto directo.
- Probar valor mayor que 240 y consumo único en mundo root/Helper, con una
  traza requerida que pruebe duración observable y expiración.
- Mantener frecuencia, amplitud, fase, `mul`, `dir`, `diradd` y `decay` fuera
  del corte salvo regresión directa.

## Fuera de alcance

Waveform exacta, stacking/reemplazo global, EnvShake activo, Projectile,
EnvShake de contacto directo, pausa/hitpause, renderer/cámara exacta,
overflow/int32, ownership nested/team, rollback y paridad completa no
pertenecen a T796.
