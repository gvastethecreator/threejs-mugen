# T703 — Fresh Projectile `projhits` dinámico

Estado: `selected` (2026-08-09)

## Objetivo

Cerrar el seam de `projhits` en un Projectile fresco creado por un actor root o
por un Helper de primera generación. La expresión se evalúa una vez en el
contexto del caller y llega a `hitsRemaining`/`hitsMax`, que ya alimentan el
circuito local de contacto múltiple y `ProjVar(projhits/projhitsmax)`.

## Fuente fijada

- M.U.G.E.N. 1.1: `.scratch/external/mugen-1.1b1/docs/sctrls.html:2491-2493`.
  `projhits` es entero, default `1`, y define cuántos impactos puede impartir
  el Projectile antes de ser eliminado.
- Ikemen-GO `149402fa8b50a64e9af8316772e0cd266025133a`:
  `src/compiler_functions.go:2395-2396` compila `projhits` como `VT_Int`,
  `src/bytecode.go:8112-8113` evalúa la expresión al crear el Projectile en
  el caller. `ModifyProjectile` (`src/bytecode.go:8483-8486`) queda fuera de
  este corte.

## Ledger de port

| Contrato | Estado local |
| --- | --- |
| `projhits` estático | Ya existe en `ProjectileControllerOp.hitCount` y en el store de Projectile. |
| Expresión fresca | Falta typed IR y callback root/Helper; el compiler actual usa `firstNumber` y pierde `var(...)`. |
| Consumo | `hitsRemaining`/`hitsMax`, `ProjVar(projhits)` y `ProjVar(projhitsmax)` ya existen; no crear otra cuenta. |
| Contexto | Reutilizar callbacks caller-context de `projmisstime`/`projpriority`; resolver una vez al spawn. |
| Adaptación | Resolver finito, truncar y pasar por `clampProjectileHits`; no afirmar paridad `IErr`/overflow. |

## Alcance permitido

- Projectile fresco root-owned y Helper-parented/root-owned.
- Valor estático o expresión dinámica con resolución caller-context una vez.
- Evidencia de capacidad efectiva, `ProjVar`, contacto múltiple/lifecycle,
  owner/root/parent y target cuando la fixture los exponga.

## Fuera de alcance

- `ModifyProjectile` y mutación live de Projectiles existentes.
- Overflow/`IErr`, negativos y clases exactas del VM upstream.
- Orden fino de ticks/hitpause, equipos anidados, rollback, netplay y paridad
  completa de Projectile.

## Verificación requerida

1. Compiler: literal, expresión dinámica y malformed fail-closed.
2. Runtime: root y Helper resuelven una vez; fallback estático/default `1` se
   conserva; `hitsRemaining` y `hitsMax` nacen con el mismo valor.
3. Contact: capacidad >1 permite dos contactos válidos y sólo remueve después
   del último; `ProjVar(projhits/projhitsmax)` refleja el estado.
4. Trace gates: un artefacto root y uno Helper con `VarSet`, Projectile
   dinámico, dos contactos, lifecycle y ownership; ambos required.
5. `pnpm typecheck`, `pnpm test`, `pnpm run build`, `pnpm qa:trace` y
   `git diff --check` en cierre.

## Claim previsto

Fresh root/Helper `projhits` caller-context, capacidad inicial y consumo local
multi-hit quedan cubiertos. No elevar score de paridad; mantener explícitos los
límites de `ModifyProjectile`, VM exacta y timing completo.

## Próximo corte

T704 queda sin seleccionar hasta revisar el siguiente parámetro fresco de
Projectile contra el ledger upstream.
