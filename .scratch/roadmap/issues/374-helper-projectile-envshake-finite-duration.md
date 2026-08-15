# Issue 374 — finite Helper-created Projectile EnvShake ownership

## Estado

- **T799 — queued (2026-08-15)**
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

## Criterios de cierre

- Confirmar `Helper -> Projectile -> RuntimeEnvShakeWorld.emitProjectile` y
  la titularidad root del Projectile contra M.U.G.E.N 1.1 e Ikemen GO fijado.
- Probar `time = 241`, hit no guardado, ausencia en guardia/rechazo y una
  traza requerida de Helper + Projectile con ciclo de vida, identidad y
  expiración.
- Mantener una sola generación Helper y una sola pareja root/defensor.

## Fuera de alcance

Projectile raíz T798, HitDef directo, FallEnvShake, EnvShake activo, Helpers
anidados, equipos, `ownProjectile`, modificación viva de Projectile, waveform,
stacking/reemplazo global, pausa/hitpause, cámara/render exactos, overflow,
rollback y paridad completa no pertenecen a T799.
