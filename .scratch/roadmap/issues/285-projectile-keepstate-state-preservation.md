# Issue 285 — Projectile `keepstate`: preservación acotada del estado de contacto

Status: closed-bounded  
Lane: R2  
Priority: P1  
Dependency: T710 / issue 284  
Date: 2026-08-11

## Contrato fijado

El pin Ikemen-GO `149402fa` conserva el contacto y el `GetHitVar` del
defensor cuando `keepstate` está activo, pero no debe forzar la entrada al
estado común de get-hit. Este corte porta esa parte observable para el camino
directo y para Projectiles frescos de root y Helper:

- el hit o guardia aceptado conserva daño, payload y `GetHitVar(keepstate)`;
- `keepstate = 1` evita la entrada automática a `p2stateno`, estados Common1
  de get-hit/guardia y el cambio de `moveType` a `H`;
- el estado, acción y `moveType` activos del defensor se conservan mientras
  el contacto/stun acotado sigue vigente;
- valores estáticos y expresiones finitas resueltas por el caller mantienen la
  semántica ya cerrada en issue 284.

Fuentes pinned: `.scratch/upstream-ikemen-go` en `149402fa`; M.U.G.E.N 1.1b1
en `.scratch/external/mugen-1.1b1`. La referencia de `Projectile` hereda los
parámetros de `HitDef`; la supresión completa de recursos y el orden temporal
global siguen fuera del claim.

## Ledger de port

| Comportamiento | Estado | Evidencia |
| --- | --- | --- |
| Projectile root `keepstate=1` en hit | adaptado | `ProjectileCombatSystem` + traza `79f6c56d` |
| Projectile root `keepstate=1` en guardia | adaptado | guard path unit + shared resolution |
| Projectile Helper `keepstate=1` | adaptado | traza `ffa9c089` con owner/helper links |
| directo `HitDef` con keepstate | adaptado | `DirectCombatSystem` + transition unit |
| preservación de estado/moveType y no entrada Common1 | adaptado acotado | trazas required T711 |
| `GetHitVar(keepstate)` y daño/contacto | adaptado | gates T710/T711 |
| limpieza de recursos, `hitonce`, facing, custom-state ownership | bloqueado | no incluido en este corte |

## Implementación y evidencia

`HitStateTransitionSystem` recibe el flag en el movimiento y retorna sin
transiciones cuando está activo. `DirectCombatSystem` y
`ProjectileCombatSystem` mantienen contacto, daño y metadatos, pero omiten
los hooks que convertirían al receptor en `H` o lo enviarían a Common1.
`RuntimeCombatResolutionSystem`, `RuntimeStunSystem` y
`PlayableMatchRuntime` mantienen el mismo límite durante la resolución y la
presentación del stun.

Verificación cerrada:

- `pnpm vitest run src/tests/RuntimeStunSystem.test.ts src/tests/HitStateTransitionSystem.test.ts src/tests/ProjectileCombatSystem.test.ts src/tests/DirectCombatSystem.test.ts`: 190/190.
- `pnpm vitest run src/tests/RuntimeTraceGatePresets.test.ts -t "keepstate|state preservation"`: 16/16 seleccionados.
- `pnpm run typecheck`: verde.
- `pnpm test`: 328 archivos / 3861 tests, todos verdes.
- `pnpm build`: verde (Vite sólo informa el warning existente de chunk grande).
- `pnpm qa:trace`: 801/801 artefactos, 767 required, 34 optional, 0 fallos.
- root required T711: `synthetic-imported-projectile-keepstate-state-preservation`, trace `79f6c56d`, final `4d3ba455`.
- Helper required T711: `synthetic-imported-helper-projectile-keepstate-state-preservation`, trace `ffa9c089`, final `89be6138`.

## Límites explícitos

No se reclama todavía limpieza de recursos ni reset exacto de `ghv`,
`hitonce`, `p1facing/p1getp2facing`, HitOverride/ReversalDef, custom-state
ownership, hitpause/tick order exactos, teams, rollback, ni paridad completa
M.U.G.E.N/Ikemen. `ModifyProjectile keepstate` y la topología de Projectiles
ya existentes requieren otro corte.
