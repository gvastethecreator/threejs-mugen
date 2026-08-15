# Issue 377 — Projectile root `fall.envshake` dinámico

## Estado

- **T802 — closed-bounded (2026-08-15)**
- **Área:** Projectile root, datos HitDef de caída y evento `FallEnvShake`
- **Dependencia:** T800 y T801 para el patrón de paquete EnvShake fresco

## Resultado

- Producto: `cabdef8` resuelve el paquete typed `fall.envshake` al crear un
  Projectile root y conserva el comportamiento estático existente.
- La traza requerida
  `synthetic-imported-projectile-dynamic-fall-envshake` pasa con checksums
  `2fcd5259` / `d0a2e474`.
- `pnpm test` pasa `328/4087`; typecheck, build y `pnpm qa:trace` pasan
  `881/881` (`847` requeridas). La adjudicación regenerada queda en
  `af9952f8`.

## Objetivo

Resolver `fall.envshake.time`, `freq`, `ampl`, `phase`, `mul` y `dir` al crear
un Projectile root. Las expresiones se evalúan una vez en el caller del
controller y se almacenan como metadatos de caída para el contacto aceptado.

## Fuente y alcance

- M.U.G.E.N 1.1 documenta `fall.envshake.time/freq/ampl/phase` como parámetros
  de HitDef/Projectile que se consumen al caer.
- Ikemen-GO pin `149402f` compila Projectile mediante `projectileSub`, evalúa
  los parámetros HitDef en el caller y conserva también `mul` y `dir`.
- Este corte cubre sólo Projectile creado por root. Helper, ModifyProjectile,
  `diradd`, `decay`, waveform, pausa, cámara/render exactos, equipos, rollback
  y paridad total quedan fuera.

## Criterios de cierre

- IR typed conserva el paquete dinámico/mixed y rechaza componentes inválidos.
- Spawn root resuelve el paquete completo en caller context; una componente
  authored no finita descarta el paquete dinámico entero.
- Contacto de caída aceptado conserva los valores y el `FallEnvShake` existente
  los consume.
- Prueba focal de compilador/spawn/contacto más una traza requerida real.
- Typecheck, build, `pnpm test`, `pnpm qa:trace`, documentación y commits
  separados están cerrados.

## Claim previsto

**Cerrado:** Projectile root fresco con seis campos dinámicos `fall.envshake`
en caller context, metadatos de caída y evento posterior existente.

**Bloqueado:** Helper, ModifyProjectile, componentes `diradd/decay`, múltiples
impactos, timing de caída/cámara exacto, pausa, equipos, rollback y paridad
M.U.G.E.N/Ikemen completa.
