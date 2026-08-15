# Issue 378 — Helper Projectile dynamic `fall.envshake`

## Estado

- **T803 — closed-bounded (2026-08-15)**
- **Área:** Helper de primera generación, Projectile root-owned y evento `FallEnvShake`
- **Dependencia:** T802 cierra el resolver equivalente para Projectile creado por root

## Objetivo

Resolver `fall.envshake.time`, `freq`, `ampl`, `phase`, `mul` y `dir` cuando
un Helper crea un Projectile. Las expresiones se evalúan una vez en el contexto
del Helper; el Projectile conserva `owner/root = p1` y `parent = p1-helper-0`.
Un impacto de caída aceptado debe llegar al `FallEnvShake` existente.

## Fuente y alcance

- M.U.G.E.N 1.1 documenta los cuatro campos base de `fall.envshake` para
  HitDef/Projectile y el consumo posterior por `FallEnvShake`.
- Ikemen-GO pin `149402f` compila Projectile mediante `projectileSub`, evalúa
  sus parámetros HitDef en el caller y también acepta `mul` y `dir`.
- Este corte cubre sólo un Projectile fresco creado por Helper. Helper anidado,
  `ownProjectile`, ModifyProjectile, `diradd`, `decay`, waveform, pausa,
  timing exacto de caída/cámara, equipos, rollback y paridad total quedan fuera.

## Criterios de cierre

- El spawn de Projectile creado por Helper recibe el resolver typed del paquete
  `fall.envshake` y conserva el comportamiento estático actual.
- Las seis componentes se resuelven en caller context del Helper; una
  componente authored no finita descarta el paquete dinámico entero.
- Un contacto de caída aceptado conserva los valores, emite el `FallEnvShake`
  existente y conserva identidad owner/root/parent.
- Hay prueba focal Helper/spawn y traza requerida importada Helper → Projectile.
- Cierre con typecheck, build, `pnpm test`, `pnpm qa:trace`, documentación y
  commits separados.

## Claim previsto

**Permitido:** un Helper de primera generación resuelve el paquete dinámico
`fall.envshake` de su Projectile fresco en caller context y lo entrega al
evento de caída existente.

**Bloqueado:** Helper anidado, `ownProjectile`, ModifyProjectile,
`diradd`/`decay`, múltiples impactos, timing de caída/cámara exacto, pausa,
equipos, rollback y paridad M.U.G.E.N/Ikemen completa.

## Resultado

- Producto: `0fe256ac` conecta el resolver del paquete `fall.envshake` al
  spawn de Projectile creado por Helper.
- Evidencia: `6cfc0426` añade la traza requerida
  `synthetic-imported-helper-projectile-dynamic-fall-envshake`, aprobada con
  checksum de traza/final `3fc3c9ac` / `8700dfad`.
- Verificación: prueba focal Helper/spawn, `pnpm test` `328/4089`, typecheck,
  build y `pnpm qa:trace` `882/882` (`848` requeridas) aprobados.
