# Issue 370 — finite `EnvShake` duration without the local ceiling

## Estado

- **T795 — closed-bounded (2026-08-15)**
- **Área:** active EnvShake / finite lifetime / camera evidence
- **Dependencia:** T794 / issue 369

## Objetivo

Comparar M.U.G.E.N 1.1 y el pin Ikemen GO `149402f` para decidir si el
`EnvShake time` activo debe conservar duraciones positivas mayores que el
techo local actual de 240 ticks. La documentación define el número de ticks
sin máximo; el pin mantiene un contador positivo hasta que expira.

## Claim previsto

Un `EnvShake` activo root o Helper con duración positiva mayor que 240 conserva
su duración finita hasta expirar. Debe seguir siendo distinto de cero/omisión,
y no debe convertir rutas de FallEnvShake o Projectile en un claim implícito.

## Criterios de cierre

- Confirmar los seams activos de compilador, resolución runtime y proyección de
  cámara; separar los consumidores FallEnvShake/Projectile si su contrato no
  es idéntico.
- Probar valor mayor a 240 en mundo root/Helper y una traza requerida con
  duración observable y expiración.
- Mantener frecuencia, amplitud, fase, `mul`, `dir`, `diradd` y `decay` fuera
  de este corte salvo regresión directa.

## Fuera de alcance

Waveform exacta, stacking/reemplazo global, FallEnvShake, Projectile,
pausa/hitpause, renderer/cámara exacta, overflow/int32, nested/team ownership,
rollback y paridad completa no pertenecen a T795.

## Cierre

- **Producto:** `1819526b` (`feat(runtime): lift active EnvShake duration cap`)
- **Contrato cerrado:** `EnvShake` activo root/Helper conserva duración positiva
  finita por encima de 240; `time = 241` permanece hasta expirar.
- **Separación explícita:** FallEnvShake, Projectile y EnvShake de contacto
  directo conservan su límite previo de 240 y no forman parte del claim.
- **Evidencia:** focused `261/261`, `pnpm test` `328/4074`, typecheck, build,
  y `pnpm qa:trace` `874/874` (`840` required). Artefacto requerido
  `synthetic-imported-envshake-long-finite`: trace `a9f98d37`, final
  `5ab967f7`, 254 frames.
