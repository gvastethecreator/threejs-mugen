# IKEMEN P2 source-shaped distance policy — 2026-07-30 (T419)

## Alcance

Este corte continúa T418 sobre el consumidor P2 de la matriz 046b. Mantiene
el dominio de candidatos ya filtrado por `RuntimeRootSelectionWorld` y no
cambia `RuntimeRootSelection/v0`, `Enemy`, `Partner`, Helpers `type=player` ni
los modos Tag/Simul/Turns.

La autoridad normativa es Ikemen-GO en
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`. El checkout local
`044da72008b8ba13caf7b0f820526ce16e955fb3` sigue siendo una cache de
investigación, no una fuente normativa.

## Evidencia upstream

La implementación de `CharList.enemyNear` separa las listas
`enemyNearList`/`p2EnemyList`, devuelve el cache independiente si el índice ya
existe y reconstruye la lista a partir de pares `{id, dist}`. Para cada
candidato P2 válido calcula distancia X relativa al facing, resta `30` cuando
queda detrás, aplica `distZ * 4` y vuelve a multiplicar Z por `4` para P2; con Z
habilitado ordena por `hypot(distX, distZ)` y finalmente por `Abs(dist)` e id.
La secuencia exacta está en
[`enemyNear` del pin`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13262-L13353).

La distancia X/Z de la fuente es distancia de ejes, no la distancia corporal
local del sandbox: [`distX`/`distZ`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8411-L8450).
El engine limpia las listas cuando cambia posición X o Z mediante
[`setPosX`/`setPosZ`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6994-L7032).

## Cambio local

`RuntimeOpponentSelectionWorld` ahora expone la frontera nombrada
`orderP2ByNearest`/`selectP2Nearest` y `runtimeOpponentP2Distance`:

- usa `(opponent.x - actor.x) * actor.facing` y la penalización behind de `30`;
- cuando `zEnabled` está explícito usa `hypot(distX, (deltaZ * 4) * 4)`,
  conservando la secuencia observable del fuente (la penalización queda
  reemplazada por el `hypot`, tal como en el pin);
- trata profundidad ausente o no finita como el plano `z = 0`, y posiciones X
  no finitas como distancia infinita al final del orden;
- desempata por `playerNo`, luego `playerId`, luego `id` y finalmente orden de
  entrada para mantener determinismo en actores sin identidad numérica;
- mantiene `orderByNearest`/`selectNearest` sin cambios para `EnemyNear` y
  otros consumidores legacy;
- guarda sólo la lista P2 en un `WeakMap` con firma de identidad, X, facing y Z.
  Cambiar una posición o la composición/orden del roster cambia la firma y
  evita devolver una selección obsoleta.

El oponente primario de `PlayableMatchRuntime` usa la policy P2 sólo en el
perfil explícito `ikemen-go`; habilita Z únicamente cuando el stage local
declara `depthBounds`. Los perfiles legacy conservan el selector corporal
horizontal anterior. El contexto de expresiones usa la policy P2 para una
entrada `rootSelection` explícita, con `p2Selection.zEnabled` disponible para
los tests y futuros callers que tengan la autoridad de Z.

## Ledger de port

| Superficie | Tratamiento | Claim permitido | Límite actual |
| --- | --- | --- | --- |
| Candidatos P2 | source-backed adapted | Reutiliza el roster filtrado existente | No incluye todavía Helpers `type=player` ni refresh de flags upstream |
| Distancia X/facing | source-shaped | Penalización behind y orden determinista probados | No hay escala local/`bindToId` completa |
| Distancia Z | source-shaped bounded | Peso `4 * 4`, gate de stage y fallback Z=0 probados | `sys.zEnabled` no es una autoridad global equivalente |
| Cache P2 | local extension | Cache separada y firma que invalida cambios observables | No se afirma timing frame-start ni invalidación por todas las mutaciones de CharList |
| Expression P2 | wired | `P2`, `P2Name`, `P2Life` y derivadas consumen la frontera | Sólo con `rootSelection`/characters explícitos |
| Live primary | wired, profile-gated | IKEMEN usa P2; legacy conserva body order | Fallback 1v1, Tag/Simul/Turns y loop completo siguen fuera |

## Evidencia local

Prueba roja de T419: el selector horizontal devolvía el candidato detrás
`p4` antes de que existiera la frontera P2, y el contexto devolvía su vida
`222` en vez del candidato frontal `111`.

Pruebas focales verdes:

```text
pnpm exec vitest run src/tests/RuntimeOpponentSelectionSystem.test.ts src/tests/RuntimeExpressionContextSystem.test.ts
2 files / 35 tests passed

pnpm exec vitest run src/tests/PlayableMatchRuntime.test.ts -t "uses the IKEMEN P2 distance policy"
1 test passed
```

Las puertas globales de T419 deben registrarse en el board después de ejecutar
`pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm qa:trace`,
`pnpm check:boundaries` y `git diff --check` sobre el corte final.

## Permitido / bloqueado

Permitido: policy P2 source-shaped, cache local separada con invalidación por
firma, integración del contexto explícito y selección primaria acotada al
perfil IKEMEN.

Bloqueado: paridad exacta del cache y refresh al inicio de frame, invalidación
por cada flag interna de `CharList`, `bindToId`/escala completa, Helpers
`type=player`, Tag/Simul/Turns completos, ZSS/Lua/config, rollback, netplay,
score movement y port completo MUGEN/IKEMEN.

No hay movimiento de score ni nueva autoridad. Fuente primaria:
[`Ikemen-GO/src/char.go` en el pin normativo](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go).
