# Issue 372 — finite direct HitDef EnvShake duration without contact ceiling

## Estado

- **T797 — closed-bounded (2026-08-15)**
- **Área:** accepted direct HitDef contact / finite EnvShake lifetime
- **Dependencia:** T795, T796

## Objetivo

Comparar la documentación M.U.G.E.N 1.1 y el pin Ikemen GO `149402f` para
decidir si `envshake.time` de un HitDef directo aceptado debe conservar una
duración finita positiva mayor que el techo local de 240 ticks. M.U.G.E.N
documenta que los parámetros `envshake.*` se aplican si el golpe tiene éxito.

## Claim previsto

Un HitDef directo root o Helper que logra un hit con `envshake.time = 241`
emite una sacudida finita hasta expirar. Guard no dispara esta ruta. El corte
no amplía Projectile, FallEnvShake ni EnvShake activo.

## Criterios de cierre

- Confirmar la ruta accepted-contact -> `RuntimeEnvShakeWorld.emitHitDef` y
  separarla de Projectile/FallEnvShake.
- Probar hit con duración mayor que 240, ausencia de evento en guard, y una
  traza requerida que pruebe duración observable y expiración.
- Mantener waveform, stacking, pausa/hitpause, presentación exacta y ownership
  nested/team fuera del corte salvo regresión directa.

## Fuera de alcance

Projectile, FallEnvShake, EnvShake activo, frecuencia/amplitud/fase nuevas,
waveform exacta, stacking/reemplazo global, pausa/hitpause, renderer/cámara
exacta, overflow/int32, rollback y paridad completa no pertenecen a T797.

## Cierre

- **Producto:** `74061162` (`feat(runtime): lift direct HitDef EnvShake duration cap`).
- **Contrato cerrado:** HitDef directo root/Helper conserva cualquier duración
  finita positiva en el evento de un hit aceptado; guard no emite la ruta.
  Projectile y FallEnvShake conservan límites separados.
- **Evidencia:** focused `6/6`, `pnpm test` `328/4076`, typecheck, build,
  evidencia DA29/DA30 `186/186`, y `pnpm qa:trace` `876/876` (`842`
  required) pasan. El artefacto requerido
  `synthetic-imported-hitdef-envshake-long-finite` pasa con checksum de trace
  `9de955c7`, final `b8383ef8`, 254 frames y un único evento.
