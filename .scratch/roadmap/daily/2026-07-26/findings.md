# Hallazgos 2026-07-26

## Hechos iniciales

- HEAD: `c01d5e70`; no hubo commits después de `2026-07-25T10:01:24Z`.
- T405 / Entry 585 es el último cierre focal: HitDef directo `air.juggle`.
- T383 sigue siendo el último gate global declarado: TypeScript 7, 241 archivos,
  2706 tests, 650 trazas, build y límites.
- T342 sigue siendo el último gate visual declarado.
- Los puntajes siguen en 65 / 36 / 20 / 10-12 / 6-8 / 25.
- El árbol trae seis archivos fuente modificados que agregan `StateDef juggle` y
  estado runtime asociado. No existe ticket T406, prueba, traza, informe ni
  entrada formal; no cuenta como evidencia.
- Los selectores de navegación, paquetes, siguiente build, entrega, continuidad,
  scorecard e issues 01-07 siguen anclados entre T288 y post-T268. El board,
  tracker y workplan sí registran T405.
- T390 corrigió el P0 de T389: HitOverride se consulta en el actor contrarrestado
  y se compara con el payload heredado de ReversalDef.

## Pendiente de validar

- Semántica exacta de `StateDef juggle`, omisión, reset por estado de ataque y
  relación con HitDef `air.juggle`.
- Diferencia entre el gate focal T405 y el último agregado global T383.
- Frescura real del corpus, Studio GateEvidence, PackageAnalysis, assets y
  límites modulares en HEAD.
- Orden de la cola después del corte reservado y del checkpoint global.

## Fuente oficial y semántica

- Elecbyte conserva el costo de juggle del ataque anterior cuando un StateDef
  atacante omite `juggle`; HitDef `air.juggle` es un costo adicional para
  Projectile y vale cero si se omite.
- En `05b7d98` y `4aa0ba38`, un HitDef directo explícito bajo perfil Ikemen
  actualiza `c.juggle`; uno omitido no lo actualiza. El contacto en caída gasta
  ese costo y luego lo lleva a cero, incluso con `NoJuggleCheck`.
- Las líneas con juggle en `char.go`, `compiler.go`,
  `compiler_functions.go` y `bytecode.go` coinciden entre ambos pins.
- La wiki actual dice que el reset no-A no requiere `ikemenversion`; ambos pins
  revisados sí lo condicionan. La época de fuente debe registrar el conflicto.
- El WIP local colapsa la omisión de HitDef a cero y
  `applyRuntimeHitDefJuggle` no tiene callers. Es un bloqueo estático, sin claim.

## Evidencia y producto

- CompatibilityCorpus/v1.1 está 383 commits detrás; 4 de 8 hashes guardados
  difieren de los archivos actuales.
- Studio GateEvidence está 379 commits detrás y no exige revisión HEAD.
- Runtime playtest sigue como fila fija `runnable` / `canExport`.
- El proyecto copia la biblioteca completa de Studio a su manifest. Un asset
  sin uso puede bloquear el release; hace falta ProjectAssetClosure/v1.
- El write preimage vive en memoria. No hay journal duradero para reabrir tras
  crash.
- PackageAnalysis v1 sólo expresa recognized/unsupported/unknown y carece de
  diff persistido.
- Boundary checks omiten roots ausentes; no prueban un core activo.

## Decisión de cola

1. Dueño y matriz oficial del WIP juggle.
2. Presencia explícita, reset, regresión T405, traza y cierre focal.
3. Gate global sobre SHA limpio.
4. Cursor y fuente por familia.
5. Browser, input, Turns, Projectile, corpus y scores.
6. EvidenceSubject, ProjectAssetClosure, snapshots, diff y journal.
7. Scanner por fases, segundo asset y límites fail-closed.

## Errores de herramientas

- `CODEX_HOME` no está definido. Se usó `C:\Users\cristian\.codex`.
- Una lectura combinada de documentos grandes se truncó. Se cambió a rangos y
  archivos concretos.
- Un intento de `apply_patch` multiarchivo falló por el encabezado con BOM de
  ROADMAP_EXECUTION_BOARD. Se dividió el patch y se usó un ancla interna.
