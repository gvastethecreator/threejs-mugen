# Issue 373 — finite root Projectile EnvShake duration without contact ceiling

## Estado

- **T798 — queued (2026-08-15)**
- **Área:** root Projectile accepted-contact / finite EnvShake lifetime
- **Dependencia:** T795, T796, T797

## Objetivo

Comparar la documentación M.U.G.E.N 1.1 y el pin Ikemen GO `149402f` para
decidir si el `envshake.time` preservado por un Projectile raíz debe conservar
una duración finita positiva mayor que el techo local de 240 ticks al contacto
aceptado.

## Claim previsto

Un Projectile raíz con `envshake.time = 241` que entra en contacto aceptado
emite una sacudida finita hasta expirar. La selección exacta hit/guard se fija
contra el pin antes de cerrar el corte. No amplía Helper Projectile, HitDef
directo, FallEnvShake ni EnvShake activo.

## Criterios de cierre

- Confirmar la ruta Projectile accepted-contact ->
  `RuntimeEnvShakeWorld.emitProjectile` y su selección hit/guard.
- Probar duración mayor que 240, no-contacto/rechazo, y una traza requerida
  con ciclo de vida del Projectile, contacto y expiración.
- Mantener waveform, stacking, pausa/hitpause, presentación exacta y ownership
  Helper/nested/team fuera del corte salvo regresión directa.

## Fuera de alcance

Helper Projectile, HitDef directo, FallEnvShake, EnvShake activo, modificación
viva de Projectile, waveform exacta, stacking/reemplazo global, pausa/hitpause,
renderer/cámara exacta, overflow/int32, rollback y paridad completa no
pertenecen a T798.
