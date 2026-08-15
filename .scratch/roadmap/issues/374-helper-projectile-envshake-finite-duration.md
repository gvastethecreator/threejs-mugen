# Issue 374 — finite Helper-created Projectile EnvShake ownership

## Estado

- **T799 — closed-bounded (2026-08-15)**
- **Área:** Projectile de Helper de primera generación / atribución root-parent
  / duración finita de EnvShake
- **Dependencia:** T798

## Objetivo

Cerrar un único recorrido en el que un Helper crea un Projectile que la
referencia M.U.G.E.N asigna inmediatamente al root. Confirmar que un hit
aceptado no guardado conserva `envshake.time = 241` hasta expirar y que la
evidencia mantiene identidad Helper, parent y root.

## Claim previsto

Un Projectile creado por un Helper de primera generación, almacenado en el
root, emite una EnvShake finita al acertar sin guardia. La traza conserva
propietario/root/parent, ciclo de vida, enlace de objetivo y expiración.

## Resultado

- `helperProjHitRoute` ahora puede conservar el paquete `envshake.*` del
  Projectile de Helper en la fixture importada; el camino real mantiene
  `ownerId/rootId = p1` y `parentId = p1-helper-0`.
- `RuntimeProjectileCombatWorld` prueba el hit no guardado con `time = 241`
  atribuido al root, y que guardia/rechazo no emiten.
- La traza requerida
  `synthetic-imported-helper-projectile-envshake-long-finite` pasa con
  checksum/final `cf27a089` / `8d8a853c`: 256 frames, una EnvShake de 241
  ticks, Projectile activo y removido, y enlaces de objetivo root/Helper.

## Criterios de cierre

- Confirmar `Helper -> Projectile -> RuntimeEnvShakeWorld.emitProjectile` y
  la titularidad root del Projectile contra M.U.G.E.N 1.1 e Ikemen GO fijado.
- Probar `time = 241`, hit no guardado, ausencia en guardia/rechazo y una
  traza requerida de Helper + Projectile con ciclo de vida, identidad y
  expiración.
- Mantener una sola generación Helper y una sola pareja root/defensor.

## Verificación

- Focal Projectile/trace: 3 pruebas pasan.
- `pnpm typecheck` pasa.
- `pnpm qa:trace` pasa: `878/878`, `844` required, cero fallos.

## Claim cerrado

Un Projectile de primera generación creado por Helper, almacenado en el root,
emite una EnvShake finita de 241 ticks sólo tras hit aceptado no guardado y
retiene identidad owner/root/parent, ciclo de vida y enlaces root/Helper.

## Fuera de alcance

Projectile raíz T798, HitDef directo, FallEnvShake, EnvShake activo, Helpers
anidados, equipos, `ownProjectile`, modificación viva de Projectile, waveform,
stacking/reemplazo global, pausa/hitpause, cámara/render exactos, overflow,
rollback y paridad completa no pertenecen a T799.
