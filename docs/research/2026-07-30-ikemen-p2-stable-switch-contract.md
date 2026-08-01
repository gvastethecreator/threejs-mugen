# Contrato P2 estable de IKEMEN — 2026-07-30 (T425)

## Decisión de autoridad

El runtime mantiene como autoridad normativa el pin Ikemen-GO
[`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`](https://github.com/ikemen-engine/Ikemen-GO/tree/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703).
La [wiki oficial P2](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29#p2),
revisada el 2026-07-30, afirma que P2 sólo cambia cuando otro enemigo está al
menos 30 px más cerca. Ese umbral no existe en el pin ni en el
[`master` actual de `src/char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/char.go)
revisado el mismo día.

Por tanto, T425 no porta una histéresis de 29/30 px. Para este epoch,
“estable” significa que la lista P2 cacheada permanece mientras no cambien sus
entradas fuente-visibles; un cambio de posición o de dominio reconstruye y
puede cambiar P2 inmediatamente. Adoptar la regla de wiki exige primero una
decisión explícita de actualización de fuente.

## Evidencia upstream

- El pin declara `enemyNearList`, `p2EnemyList` y `p2EnemyBackup` en
  [`Char`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L3168-L3170).
- `enemyNearP2Clear` limpia las listas P2 y explica que el P2 de MUGEN no es
  instantáneo ([líneas 3382–3388](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L3382-L3388)).
- `p2()` solicita `enemyNear(c, 0, true)` y guarda el backup
  ([líneas 4810–4820](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4810-L4820)).
- El cambio de posición marca el refresh de listas
  ([`setPosX`, líneas 6994–7004](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6994-L7004)).
- `CharList.enemyNear` reutiliza la lista P2 cacheada, filtra elegibilidad,
  aplica la distancia/facing/Z y la vuelve a ordenar
  ([líneas 13262–13353](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13262-L13353)).

## Ledger de port

| Superficie | Tratamiento local | Claim permitido | Límite |
| --- | --- | --- | --- |
| Dominio P2 elegible | adaptado | `RuntimeRootSelectionWorld` excluye standby, KO e inactivos antes del selector | No cubre todos los flags internos de `CharList` |
| Orden P2 X/facing/Z | source-shaped | `RuntimeOpponentSelectionWorld` conserva la policy existente y desempates deterministas | Escalas/actores completos de Ikemen no se reclaman |
| Cache P2 | adaptación local | La firma invalida identidad, roster, X, facing y Z inmediatamente | No se afirma el timing frame-start exacto de Ikemen |
| `P2Name` de valor de controller | adaptado y cableado | El mismo contexto activo P2 se proyecta a `StateControllerExecutor` | Sólo la ruta root explícita con roster disponible |
| Umbral wiki de 30 px | omitido por discrepancia de epoch | Ninguno | Requiere nuevo pin/decisión de autoridad |

## Cambio T425

La selección ya cambiaba correctamente tras una variación visible de 1 px, pero
un `VarSet value = P2Name = "Live P4"` seguía evaluando con el rival base.
`RuntimeControllerEvaluationContextSystem` ahora acepta bindings dinámicos del
contexto de expresión; `runtimeControllerContext` los deriva del factory activo
con el roster completo. Así los triggers y los valores de controllers consultan
la misma selección P2 live.

Prueba focal actual:

```text
pnpm exec vitest run src/tests/PlayableMatchRuntime.test.ts src/tests/RuntimeControllerEvaluationContextSystem.test.ts src/tests/RuntimeControllerExpressionContextSystem.test.ts src/tests/RuntimeOpponentSelectionSystem.test.ts src/tests/RuntimeRootSelectionSystem.test.ts --pool=threads --maxWorkers=1
5 files / 342 tests passed
```

## Cierre y verificación

La traza requerida `synthetic-imported-ikemen-p2-value` materializa un root
IKEMEN con P4 activo, P4 adelantando a P2 por 1 px, y un `VarSet` que consume
`P2Name`; pasó con checksum `fa72c6f2`. `pnpm qa:trace` cerró en 668/668
artefactos (634 requeridos, 34 opcionales).

También pasaron la suite serial (305 archivos / 3240 tests), `pnpm typecheck`,
`pnpm build`, `pnpm check:boundaries` y `git diff --check`. La advertencia
de tamaño de chunk de Vite no bloquea el build; no se reclama una mejora de
code-splitting en este corte.

## Claim / límite

Permitido: el perfil explícito `ikemen-go` invalida la selección P2 local cuando
cambia una entrada fuente-visible y `P2Name` dinámico de controller observa el
resultado actualizado.

Bloqueado: umbral de 30 px de wiki, timing exacto de cache de `CharList`,
Helpers `type=player`, Tag/Simul/Turns completos, rollback/netplay, score
movement y paridad general Ikemen.
