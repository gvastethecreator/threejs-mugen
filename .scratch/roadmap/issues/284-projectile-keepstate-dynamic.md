# Issue 284 — Projectile `keepstate` dinámico en contexto caller

Status: closed-bounded  
Lane: R2  
Priority: P1  
Dependency: T709 / issue 283  
Date: 2026-08-11

## Contrato fijado

- M.U.G.E.N 1.1 documenta que `Projectile` hereda los parámetros de
  `HitDef`, incluido `keepstate`.
- El pin Ikemen-GO `149402fa` compila `keepstate` como booleano en
  `hitDefSub`, lo evalúa al crear el HitDef fresco y reutiliza ese bloque al
  crear un Projectile.
- En contacto, el pin copia `KeepState` al `GetHitVar` del defensor para hit
  y guard. La supresión completa de la transición de estado (`keepstate` como
  control de custom-state) pertenece a una fase posterior y no se reclama en
  este corte.

Fuentes pinned: `.scratch/upstream-ikemen-go` en `149402fa`; M.U.G.E.N 1.1b1
en `.scratch/external/mugen-1.1b1`.

## Ledger de port

| Comportamiento | Estado | Evidencia |
| --- | --- | --- |
| `Projectile keepstate` estático `0/1` | adaptado | compiler + runtime unit |
| expresión `keepstate=var(...)`, caller root | adaptado | resolver root + traza `a762a832` |
| expresión `keepstate=var(...)`, Helper caller | adaptado | resolver Helper + traza `859ca54f` |
| contacto hit y guard exponen `GetHitVar(keepstate)` | adaptado | `ProjectileCombatSystem` + unit |
| expresión malformada / valor no resoluble | fail-closed | compiler/runtime unit |
| supresión completa de state transition, `hitonce`, Projectile `p1facing` | bloqueado | fuera del corte |

## Implementación y evidencia

El IR conserva el flag estático o la expresión. Root y Helper la resuelven en
el contexto original del caller al crear el Projectile; el contacto copia el
booleano al payload de `RuntimeGetHitVars`, por lo que `GetHitVar(keepstate)`
queda observable en ambas ramas.

Verificación cerrada:

- `pnpm vitest run src/tests/RuntimeCompiler.test.ts src/tests/ProjectileSystem.test.ts src/tests/ProjectileCombatSystem.test.ts src/tests/EffectActorSystem.test.ts`: 419/419.
- `pnpm vitest run src/tests/RuntimeTraceGatePresets.test.ts -t "keepstate"`: 14/14 seleccionados.
- `pnpm run typecheck`: verde.
- `pnpm qa:trace`: 799/799 artefactos, 765 required, 34 optional, 0 fallos.
- root required: `synthetic-imported-projectile-dynamic-keepstate`, trace `a762a832`, final `c0faf9a6`.
- Helper required: `synthetic-imported-helper-projectile-dynamic-keepstate`, trace `859ca54f`, final `c5cb237b`.

## Límites explícitos

No se reclama todavía que `keepstate` suprima la transición de get-hit o el
custom state en el runtime local; tampoco se incluye `hitonce`,
`ModifyProjectile keepstate`, `Projectile p1facing/p1getp2facing` (el pin los
marca como no funcionales), HitOverride/ReversalDef, orden exacto de ticks,
teams, rollback, ni paridad completa MUGEN/Ikemen.
