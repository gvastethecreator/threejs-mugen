# T702 — Fresh Projectile `projpriority` dinámico

Estado: `closed-bounded` (2026-08-09)

## Objetivo

Cerrar el seam de `projpriority` en un Projectile fresco creado por un actor
root o por un Helper de primera generación. La expresión se evalúa una vez en
el contexto del caller, se normaliza al dominio local de prioridad (`0..10`),
y el valor llega al arbitraje de choque Projectile-vs-Projectile.

## Fuente fijada

- M.U.G.E.N. 1.1: `.scratch/external/mugen-1.1b1/docs/sctrls.html:2497`.
  `projpriority` es entero, default `1`; igual prioridad cancela ambos,
  mayor prioridad cancela al menor y decrementa la prioridad del ganador.
- Ikemen-GO `149402fa8b50a64e9af8316772e0cd266025133a`:
  `src/compiler_functions.go:2399-2400` compila la expresión como `VT_Int`,
  `src/bytecode.go:8114` la evalúa al crear el Projectile en el caller y
  `src/bytecode.go:8488` la vuelve a usar sólo para `ModifyProjectile`.

## Ledger de port

| Contrato | Estado local |
| --- | --- |
| `projpriority` estático | Ya existe en `ProjectileControllerOp.priority` y en el store de Projectile. |
| Expresión fresca | Falta typed IR y callback root/Helper; el compiler actual usa `firstNumber` y pierde `var(...)`. |
| Arbitraje | Ya consume `projectile.priority`, cancela/decrementa en el corte acotado existente. |
| Contexto | Reutilizar callbacks caller-context de `projremovetime`/`projmisstime`; no crear evaluador paralelo. |
| Adaptación | Resolver finito, truncar y pasar por `clampProjectilePriority` (`0..10` local). Esto es adaptación local, no afirmación de paridad int32 completa. |

## Alcance permitido

- Projectile fresco root-owned y Helper-parented/root-owned.
- Expresión estática o dinámica con resolución caller-context una vez.
- Evidencia de prioridad efectiva, choque, cancelación/decremento, lifecycle,
  owner/root/parent y target/lifecycle cuando la fixture los exponga.

## Fuera de alcance

- `ModifyProjectile` (su ruta dinámica ya existe; no se reabre aquí).
- Overflow/`IErr`, negativos y clases exactas del VM upstream.
- Orden fino de ticks/hitpause, múltiples equipos, helpers anidados, rollback,
  netplay y paridad completa de Projectile.

## Verificación requerida

1. Compiler: literal, expresión dinámica y malformed fail-closed.
2. Runtime: root y Helper resuelven una vez; fallback estático se conserva;
   prioridad normalizada llega al store.
3. Combat: mayor prioridad cancela al menor y decrementa el ganador; igualdad
   conserva el trade existente.
4. Trace gates: un artefacto root y uno Helper con `VarSet`, Projectile
   dinámico, clash, lifecycle y ownership; ambos deben ser `required`.
5. `pnpm typecheck`, `pnpm test`, `pnpm run build`, `pnpm qa:trace` y
   `git diff --check` en el cierre.

## Evidencia de cierre

- Compiler/runtime: `ProjectileControllerOp.priorityExpression` conserva
  literales, expresiones y redirects; root y Helper evalúan una vez en el
  caller y normalizan al dominio local `0..10`.
- Focal: RuntimeCompiler, ProjectileSystem y EffectActorSystem pasan `298/298`
  tests; `pnpm typecheck` y `pnpm check:boundaries` pasan.
- Traces requeridas: `synthetic-imported-projectile-dynamic-priority.json`
  checksum `cabff6a8` / final `070ee2a6`; Helper
  `synthetic-imported-helper-projectile-dynamic-priority.json` checksum
  `6ac655e1` / final `2667efd6`. Ambas prueban `VarSet`, Projectile,
  caller-context, clash `3 > 1`, cancelación, decremento `3 -> 2`, lifecycle
  y ownership root/Helper-parent.
- Gates finales: `pnpm qa:trace` pasa `785/785` artefactos (`751` required,
  `34` optional), `pnpm test` pasa `3823/3823` en `328` archivos, build de
  `363` módulos, typecheck, boundaries y `git diff --check` pasan.

El cierre es bounded: no eleva el score de paridad. Exact priority classes,
`IErr`/overflow, `ModifyProjectile`, timing fino, equipos anidados, rollback y
paridad completa de Projectile siguen fuera del claim.

## Próximo corte

T703 queda sin seleccionar hasta revisar el siguiente parámetro fresco de
Projectile contra el pin upstream. Mantener `ModifyProjectile`, timing exacto
y clases de prioridad fuera de la siguiente evidencia.
