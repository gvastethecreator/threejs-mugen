# IKEMEN active expression root selection — 2026-07-30 (T423)

## Fuente y boundary

El pin normativo de Ikemen-GO separa el roster de enemigos candidato para P2
de la lista usada por `EnemyNear`; las lecturas `P2Name`/`P4Name`/`P6Name`/
`P8Name` consumen ese dominio indexado. La topología local ya estaba
representada por `RuntimeRootSelection/v0`, pero el factory que crea contextos
para controllers activos no la transportaba. Fuentes primarias:
[`bytecode.go` — reads P2-family](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L2714-L2735)
y [`char.go` — listas y selección de enemigos](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13262-L13353).

## Cambio local

`RuntimeActiveExpressionContextWorld` acepta un `rootSelection` explícito,
un `p2Selection` opcional y un resolver inyectado que recibe el actor y el
roster disponible. `PlayableMatchRuntime` resuelve `RuntimeRootSelection/v0`
desde los roots live sólo bajo `runtimeProfile = "ikemen-go"`. El default P2
queda como `{}` (X/facing, sin inventar autoridad Z); perfiles legacy no
reciben selección explícita y conservan su fallback caller/opponent.

El mismo context factory alimenta los evaluadores de triggers y parámetros de
controllers activos. Por eso `P2Name`/P2-family y `P3Name`/P5/P7 se observan en
el camino live, mientras `EnemyNear` permanece en su roster separado.

## Evidencia

```text
pnpm exec vitest run src/tests/RuntimeActiveExpressionContextSystem.test.ts src/tests/RuntimeExpressionContextSystem.test.ts src/tests/RuntimeCompiler.test.ts src/tests/PlayableMatchRuntime.test.ts -t "propagates an explicit IKEMEN root selection|uses the IKEMEN P2 distance policy|uses the same source-shaped P2 roster|P2/P4/P6/P8|partner"
4 files / 33 selected tests passed

pnpm exec vitest run src/tests/RuntimeActiveExpressionContextSystem.test.ts src/tests/RuntimeExpressionContextSystem.test.ts src/tests/RuntimeCompiler.test.ts src/tests/RuntimeCnsSubset.test.ts src/tests/RuntimeOpponentSelectionSystem.test.ts src/tests/PlayableMatchRuntime.test.ts --no-file-parallelism
6 files / 450 tests passed

pnpm typecheck
passed
```

La prueba de `PlayableMatchRuntime` pone P2 y P4 en posiciones que siguen
seleccionando P4 después de la orientación automática del actor y comprueba
que un `VarSet` activo ve `P2Name = "Live P4"`. La prueba del factory valida
en paralelo la selección explícita y el fallback legacy.

## Gates y límites

Permitido: transporte de selección root al factory activo del perfil IKEMEN,
policy P2 X/facing source-shaped ya cerrada en T419 y nombres P2-family/
Partner en ese contexto.

Gates del corte: suite serial `pnpm exec vitest run --no-file-parallelism`
verde en 305 archivos / 3231 tests; `pnpm typecheck`, `pnpm build`,
`pnpm check:boundaries` y `git diff --check` verdes. `pnpm qa:trace` volvió a
quedar sin salida durante 124 s por el timeout SSR recurrente de Vite en
`StateSourceResolver.ts`; el runner fue verificado y detenido sin churn de
evidencia. El baseline T419 queda en 667/667.

Bloqueado fuera del corte: state/life completos para P2-family/Partner,
helpers `type=player`, consumo live de todos los callers no-controller,
cache frame-start exacto, Tag/Simul/Turns completos, rollback/netplay, score
movement y paridad completa MUGEN/IKEMEN.

No hay movimiento de score ni nueva autoridad de Z.
