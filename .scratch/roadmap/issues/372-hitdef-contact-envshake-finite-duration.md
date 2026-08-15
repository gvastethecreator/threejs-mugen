# Issue 372 — finite direct HitDef EnvShake duration without contact ceiling

## Estado

- **T797 — queued (2026-08-15)**
- **Área:** accepted direct HitDef contact / finite EnvShake lifetime
- **Dependencia:** T795, T796

## Objetivo

Comparar la documentación M.U.G.E.N 1.1 y el pin Ikemen GO `149402f` para
decidir si `envshake.time` de un HitDef directo aceptado debe conservar una
duración finita positiva mayor que el techo local de 240 ticks. M.U.G.E.N
documenta que los parámetros `envshake.*` se aplican si el golpe tiene éxito.

## Claim previsto

Un HitDef directo root o Helper que logra hit o guard con
`envshake.time = 241` emite una sacudida finita hasta expirar. El corte no
amplía Projectile, FallEnvShake ni EnvShake activo.

## Criterios de cierre

- Confirmar la ruta accepted-contact -> `RuntimeEnvShakeWorld.emitHitDef` y
  separarla de Projectile/FallEnvShake.
- Probar hit y guard con duración mayor que 240, más una traza requerida que
  pruebe duración observable y expiración.
- Mantener waveform, stacking, pausa/hitpause, presentación exacta y ownership
  nested/team fuera del corte salvo regresión directa.

## Fuera de alcance

Projectile, FallEnvShake, EnvShake activo, frecuencia/amplitud/fase nuevas,
waveform exacta, stacking/reemplazo global, pausa/hitpause, renderer/cámara
exacta, overflow/int32, rollback y paridad completa no pertenecen a T797.
