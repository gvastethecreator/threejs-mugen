# Issue 360 — Helper `ModifyProjectile` RedirectID airguard velocity

## Estado

- **T786 — queued (2026-08-15)**
- **Área:** runtime / Helper / RedirectID / Projectile / ModifyProjectile / air guard
- **Dependencia:** T785 / issue 359

## Objetivo

Permitir que un `ModifyProjectile` emitido por un Helper resuelva `RedirectID`
en el caller correcto y muta un Projectile vivo del root destino. El corte
usa `airguard.velocity` para hacer observable la separación entre el contexto
del Helper y el store root redirigido.

## Alcance permitido

- Helper de primera generación, un root destino explícito y un Projectile
  root-owned del destino.
- `RedirectID` estático y `var()` finito resuelto una vez en el Helper caller.
- Reemplazo airguard X/Y/Z, contacto de guardia aérea, GetHitVar, lifecycle,
  ownership y target link.

## Fuera de alcance

Broadcast multi-root, id cero/omitido y edge indexes ya cubiertos por T785,
nested Helpers, teams/simul, RedirectID dinámico no finito, fresh/default
derivation, dynamic `n`, otros campos de ModifyProjectile, exact timing,
rollback y full M.U.G.E.N/Ikemen parity.

## Autoridad

Ikemen GO `149402f` ejecuta `getRedirectedChar` antes de seleccionar los
Projectiles de `ModifyProjectile`; el controlador se evalúa en el caller y la
mutación se aplica al `crun` destino. M.U.G.E.N 1.1 no documenta
`ModifyProjectile`; esta compatibilidad es Ikemen-only.

## Evidencia requerida

- Compiler/Helper/Projectile focused tests que separen caller, redirect target,
  selector y payload.
- Required trace con Helper → RedirectID → Projectile → guard aéreo y
  lifecycle/ownership/target evidence.
- Typecheck, `git diff --check` y aggregate QA con blockers heredados
  registrados sin ocultarlos.
