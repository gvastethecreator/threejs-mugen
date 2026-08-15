# Issue 375 — expresiones dinámicas de EnvShake en Projectile raíz

## Estado

- **T800 — queued (2026-08-15)**
- **Área:** `Projectile` raíz / `envshake.time`, `freq`, `ampl`, `phase`,
  `mul`, `dir` en contexto del caller
- **Dependencia:** T798 y T799

## Objetivo

Cerrar un único Projectile raíz que resuelva valores finitos de
`envshake.*` desde expresiones CNS en el contexto del atacante. Debe conservar
el comportamiento existente: sólo el hit aceptado no guardado emite el evento
y los valores llegan a la cámara hasta el vencimiento finito.

## Claim previsto

Un Projectile raíz puede resolver el paquete `envshake.*` dinámico al
crearse, conservarlo para el contacto y emitir una sola EnvShake atribuida al
root tras un hit aceptado no guardado.

## Criterios de cierre

- Tipar y compilar los seis parámetros de EnvShake de Projectile sin usar
  `firstNumber()` para expresiones.
- Resolver el paquete una vez en el caller raíz, descartando componentes no
  finitos sin convertirlas en valores inventados.
- Cubrir valores estáticos, dinámicos, guardia/rechazo sin evento y una traza
  requerida con `VarSet`, `Projectile`, hit, evento y vencimiento.

## Fuera de alcance

Projectile creado por Helper, `ModifyProjectile`, `FallEnvShake`, EnvShake
activo, Helpers anidados/equipos/`ownProjectile`, waveform, stacking,
pausa/hitpause, cámara/render exactos, overflow, rollback y paridad completa.
