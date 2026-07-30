# IKEMEN P2 nearest-candidate read — 2026-07-30

## Alcance

Este corte continúa la matriz 046b de
`.scratch/roadmap/issues/07-ikemen-runtime-topology.md`. No cambia el
esquema `RuntimeRootSelection/v0`, no activa nuevos roots y no modifica
`Partner`/`Enemy`.

La autoridad normativa sigue siendo Ikemen-GO `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`;
`4aa0ba38` sólo cubre familias revisadas. El checkout local
`044da72008b8ba13caf7b0f820526ce16e955fb3` es una cache de investigación y
no es una fuente normativa.

## Hallazgo

El roster P2 ya se filtraba por `playerType`, `disabled`, `standby` y
`overKo`. El atajo pendiente estaba después del filtro: los consumidores
tomaban `p2CandidateIds[0]`. Así, un candidato lejano podía ganar sobre uno
más cercano aunque `EnemyNear` ya tuviera orden por distancia corporal.

## Cambio implementado

- `RuntimeOpponentSelectionWorld.selectNearest` reutiliza la distancia
  corporal horizontal existente y el desempate por orden de entrada.
- `RuntimeExpressionContextWorld` usa esa frontera para `P2`, `P2Name`,
  `P2Life` y lecturas derivadas; `Enemy` mantiene su enumeración estable.
- `PlayableMatchRuntime.opponentForRoot` aplica la misma selección al
  oponente primario live. El fallback 1v1 cuando no hay candidato se conserva
  deliberadamente y no se interpreta como paridad de ausencia de P2.

## Ledger de port

| Superficie | Tratamiento | Límite |
| --- | --- | --- |
| Candidate domain (`RuntimeRootSelectionWorld`) | adapted | No se afirma cache/Z/behind-facing exacto. |
| Nearest ordering (`RuntimeOpponentSelectionWorld`) | adapted | Distancia corporal X y empate estable; no distancia Z. |
| Expression P2 reads | adapted | Sólo después del roster filtrado y con `characters` disponibles. |
| Live primary opponent | local extension | Reusa la misma policy; conserva fallback histórico. |
| Helper `type = player`, Tag/Simul, cache invalidation, full actor loop | omitted/blocked | Requieren consumers y gates propios. |

## Evidencia

Prueba roja inicial: `RuntimeExpressionContextWorld` devolvía la vida del
primer ID (`333`) aunque el candidato más cercano tenía vida `875`.

Prueba focal verde:

```text
pnpm exec vitest run src/tests/RuntimeOpponentSelectionSystem.test.ts src/tests/RuntimeExpressionContextSystem.test.ts src/tests/MatchWorld.test.ts
3 files / 46 tests passed
```

Gates de cierre:

- `pnpm test`: 305 archivos / 3223 tests passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; permanece el warning existente de bundle Vite >500 kB.
- `pnpm qa:trace`: 667/667 artefactos, 633 required, 34 optional, 0 failed.
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed; sólo warnings CRLF preexistentes en docs.
- `pnpm qa:smoke`: N/A; no cambió una superficie visible.

No hay movimiento de score ni promoción de autoridad. El conjunto de traces
existente conserva sus checksums; este corte queda probado por las pruebas
focales y el gate agregado, no por una nueva fila de trace sintético.

## Permitido / bloqueado

Permitido: selección P2 nearest-body acotada en el
contexto de expresiones y en el oponente primario, después del filtro de
eligibilidad ya existente.

Bloqueado: paridad exacta de cache/refresco, distancia Z, penalización por
orientación, Helpers `type=player`, Tag/Simul/Turns completos, rollback,
netplay y paridad completa MUGEN/IKEMEN.

Fuente primaria: [Ikemen-GO `src/char.go` en el pin normativo](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go).
