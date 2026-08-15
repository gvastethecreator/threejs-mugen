# Issue 375 — expresiones dinámicas de EnvShake en Projectile raíz

## Estado

- **T800 — closed-bounded (2026-08-15)**
- **Área:** `Projectile` raíz / `envshake.time`, `freq`, `ampl`, `phase`,
  `mul`, `dir` en contexto del caller
- **Dependencia:** T798 y T799

## Objetivo

Cerrar un único Projectile raíz que resuelva valores finitos de
`envshake.*` desde expresiones CNS en el contexto del atacante. Debe conservar
el comportamiento existente: sólo el hit aceptado no guardado emite el evento
y los valores llegan a la cámara hasta el vencimiento finito.

## Claim cerrado

Un Projectile raíz resuelve una vez el paquete dinámico finito `envshake.*` en
el contexto del caller, lo conserva hasta el contacto y emite una sola EnvShake
atribuida al root tras un hit aceptado no guardado. Un componente authored no
finito descarta el paquete completo.

## Criterios de cierre

- Tipar y compilar los seis parámetros de EnvShake de Projectile sin usar
  `firstNumber()` para expresiones. **Cumplido.**
- Resolver el paquete una vez en el caller raíz, descartando componentes no
  finitos sin convertirlas en valores inventados. **Cumplido.**
- Cubrir valores estáticos, dinámicos, guardia/rechazo sin evento y una traza
  requerida con `VarSet`, `Projectile`, hit, evento y vencimiento.
  **Cumplido:** `synthetic-imported-projectile-dynamic-envshake` exige
  `17/45.5/-9/0.25/1.5/30`, target `77`, evento root `p1` y expiración finita
  (`6c29ab35` / `bbaf3e8c`).

## Evidencia

- Producto: `3271867c`.
- Focal: 5 casos en `RuntimeCompiler`, `ProjectileSystem` y
  `RuntimeTraceGatePresets`.
- Global: `pnpm test` `328/4082`; `pnpm typecheck`; `pnpm build`; `pnpm
  qa:trace` `879/879` (`845` requeridas).

## Fuera de alcance

Projectile creado por Helper, `ModifyProjectile`, `FallEnvShake`, EnvShake
activo, Helpers anidados/equipos/`ownProjectile`, waveform, stacking,
pausa/hitpause, cámara/render exactos, overflow, rollback y paridad completa.
