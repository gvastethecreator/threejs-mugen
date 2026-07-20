# Auditoría diaria de roadmap y arquitectura después de Wayfinder 339

Fecha: 2026-07-20

Tipo de trabajo: investigación, arquitectura y roadmap

Corte final auditado: `a91da04e0403853d33c66d1f1ab8bc5b82d5310b` (`feat(runtime): verify nested helper ancestry`)

## Resumen ejecutivo

El repo avanzó 55 commits desde el corte auditado el 2026-07-19 (`80eec106`) y
cerró Wayfinders T297-T339. El avance real se concentra en cinco grupos:

1. FNT v2 bitmap, texto, bancos de paleta y capas FightScreen;
2. ventanas, transformaciones, perspectiva y PalFX de `AnimLayout`;
3. anuncios de KO, DKO, tiempo, ganador, resultado y variantes `winType`;
4. derivación de causas de KO y controladores de recursos `Target*` hasta T338;
5. verificación acotada de genealogía Helper anidada en T339.

El checkpoint T338 declara 238 archivos / 2583 pruebas, build con 325 módulos y
633/633 trazas. Ese checkpoint cubre código hasta `ec2819f5`; `4ef55c16` agrega
el informe. T339 declara solo 1 archivo / 280 pruebas focales, TypeScript 7 y
`git diff --check`; carece de checkpoint global. La última prueba de navegador
con revisión visual sigue en T321, con 237 archivos / 2532 pruebas, 633/633
trazas y `qa:smoke` en 301.9 s. Por tanto, T338 conserva el cierre funcional
amplio y T321 la prueba visual; T339 solo admite su claim focal.

Los puntajes publicados siguen en **65 / 36 / 20 / 10-12 / 6-8 / 25** para
sandbox privado, compatibilidad MUGEN práctica, MUGEN MVP, MUGEN completo,
IKEMEN completo y Creator Studio/motor modular combinado. El sistema de progreso
también publica modularización como 10/100. Esa mezcla debe separarse antes de
otra adjudicación. Esta auditoría no cambia ningún puntaje.

El riesgo principal ya no está en la cantidad de cortes cerrados. Está en la
calidad y vigencia de la prueba:

- los documentos de control aún seleccionan T288 / Entry 562;
- el corpus v1.1 apunta a una revisión 234 commits anterior y cuatro de sus ocho
  artefactos ya tienen bytes distintos;
- el GateEvidence de Studio apunta a una revisión 230 commits anterior;
- el manifiesto de autoridad de fuente deja sin clasificar los archivos y
  funciones de Ikemen usados por gran parte de T297-T339;
- el smoke actual solo inventaría screenpacks para el scanner; no ejecuta un
  screenpack importado por la ruta FightScreen;
- Turns aplica cambios en serie tras el preflight y carece de rollback global;
- Studio guarda manifiesto, evidencia y handles en almacenes separados, sin un
  snapshot de proyecto completo ni recuperación durable de escrituras.

La siguiente prioridad debe cerrar verdad de control, fuente y evidencia; luego
debe probar FightScreen por una ruta importada directa. Después conviene cerrar
input, Turns y el orden global de proyectiles. Corpus, Studio, assets, scanner y
modularización deben avanzar con gates propios y sin subir puntajes por trabajo
documental.

## Cursores y límites de la auditoría

| Cursor | Valor verificado | Lectura permitida |
| --- | --- | --- |
| HEAD auditado | `a91da04e0403853d33c66d1f1ab8bc5b82d5310b` | Estado del repo al cierre de esta auditoría. |
| Rama | `master`, 219 commits delante de `origin/master` | Estado local; no implica publicación. |
| Wayfinder | T339 | Último corte implementado y documentado; cierre focal. |
| Ledger numérico | Entry 562 / T288 | Cursor histórico; no gobierna trabajo nuevo. |
| Checkpoint funcional | T338 sobre `ec2819f5` | Suite, build y trazas para T335-T338. |
| Checkpoint visual | T321 sobre `b2419663`, informe `1b62b9fe` | Última prueba de navegador revisada. |
| Árbol de trabajo | sucio en docs/issues de roadmap ajenos | Se preservó sin reescribir documentos compartidos. |

La ejecución observó cambios concurrentes hasta T339. El corte de genealogía
Helper apareció durante la verificación final y luego quedó comprometido como
`a91da04e`; se incluye solo a su claim focal y no hereda el checkpoint global
T338. Los documentos centrales siguen con cambios locales previos; por eso esta
corrida agrega un informe aislado y deja la reconciliación de esos archivos para
un corte con dueño claro.

## Cambios desde la ejecución anterior

### Cierres verificados

| Rango | Resultado acotado | Evidencia o límite |
| --- | --- | --- |
| T297-T300 | Carga FNT v2 bitmap, texto, paletas y capas top/bg. | Tests, build y humo visual acumulado. TrueType y otros perfiles FNT siguen abiertos. |
| T301-T311 | Window clipping, `layerno`, ángulos, shear, perspectiva, clip transformado, PalFX y transformaciones compartidas. | T301, que estaba parcial en la corrida previa, ahora tiene cierre focal, build, smoke y revisión visual. Quedan `perspective2`, tile/parallax y matemáticas exactas. |
| T312-T321 | KO/DKO/time-over/draw, tiempos, ganador/resultado, assets, selección, overlay, sonido y composición `winType`. | Checkpoint visual T321. Falta una ruta de screenpack importado y arbitraje completo de fuente/equipo. |
| T322-T334 | Derivación de `winType` desde vida/equipo y procedencia de causas por actor, root, proyectil, helper y redirecciones. | Checkpoints T329 y T334; claims limitados a los caminos probados. |
| T335-T338 | Flags y guards de `TargetLifeAdd`, `TargetRedLifeAdd`, `TargetGuardPointsAdd` y `TargetDizzyPointsAdd`. | Checkpoint T338; sin cambio de renderer/UI y sin smoke nuevo. |
| T339 | Cadena parent/root verificada para causa `TargetLifeAdd` de Helper anidado contra víctima root. | 1 archivo / 280 tests focales, typecheck y diff check. Quedan Helper-victim, redirects recursivos y checkpoint global. |

### Contradicciones nuevas o confirmadas

1. `BUILD_EXECUTION_BACKLOG.md` termina en Entry 562, aunque HEAD está en T339.
   `ROADMAP_EXECUTION_BOARD.md`, `PROGRESS_TRACKER.md`, `WORKPLAN.md`,
   `PORT_COMPLETION_SCORECARD.md` y otros selectores aún presentan T288 como
   frontera activa. `NEXT_BUILD_ROADMAP.md` conserva incluso T287.
2. `CONTEXT.md` mantiene Wayfinder 102 en su cabecera. Varios “próximos” gates
   de anuncios y displays ya cerraron entre T295 y T321.
3. `compatibility-corpus-snapshot-v1.json` se observó el 2026-07-16, tiene una
   política máxima de 24 horas y apunta a `a2c84f05`, 234 commits detrás de
   HEAD. Cuatro referencias mutables ya no coinciden con su SHA-256:
   `qa-smoke/diagnostics.json` y tres trazas de `mugen-lite-journey`.
4. El mismo corpus registra dos rutas legales requeridas aprobadas, mientras su
   claim permitido aún dice “one repository-owned legal journey”. La segunda
   ruta cubre sobre todo stage e importación; no prueba un segundo personaje.
5. `studio-gate-evidence-v0.json` usa `d69d12a4`, 230 commits detrás de HEAD.
   La frescura por tiempo permite tratar un artefacto viejo como vigente pese a
   cambios de código.
6. `source-authority-manifest-v0.json` fija Ikemen GO en
   `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, pero el review semántico sigue
   `unclassified`. El manifiesto cubre nueve archivos y omite `fightscreen.go`,
   `common.go`, `font.go`, `image.go` y `render.go`, citados en T297-T321.
   También marca `char.go` y `bytecode.go` como distintos frente al cache local,
   justo donde T322-T339 toma varias reglas.
7. `scripts/qa_smoke.cjs` prueba señales de screenpack en el scanner, pero no
   ejecuta FNT, capas, anuncios o `winType` desde un `fight.def` importado.
8. `RuntimeTurnsContinuationWorld.prepare()` produce un plan, pero
   `PlayableMatchRuntime.tryAutomaticTurnsContinuation()` aplica handoff, reset,
   recursos, estado 5900 y resultado en serie. Una falla después del handoff
   puede dejar mutación parcial.
9. El pin normativo `05b7d98...` no existe como objeto en el clon local. Además,
   los `TargetControllerOp` recientes exponen `requestedId`, sin `index`, y la
   selección filtra el array de candidatos. El orden efectivo y la autoridad de
   constantes caller/redirect/receptor requieren contraste contra la fuente
   normativa materializada.
10. El teclado convierte Left/Right a B/F antes de conocer facing y el adapter
    de gamepad devuelve siempre un conjunto vacío. SOCD tiene cobertura acotada,
    pero la cadena física→lógica y el gamepad siguen incompletos.
11. Los stores de proyectiles insertan al frente y algunos loops resuelven y
    mutan durante el recorrido. No existe un schedule global para tres o más
    proyectiles. T339 verifica una cadena Helper anidada para un root-victim
    `TargetLifeAdd`; Helper-to-Helper, redirect recursivo y una generación de
    vida separada del ID siguen abiertos.
12. `scripts/check_boundaries.cjs` omite raíces ausentes. `src/core`,
   `src/modules/platformer` y `src/platformer` no existen; `src/engine` solo
   contiene el archivo exceptuado `ModuleContracts.ts`. El gate de núcleo
   compartido puede pasar sin revisar una implementación real.
13. `EvidenceEnvelope.ts` sigue en `src/app` y depende de tipos de GateEvidence
    y PackageAnalysis. Es un candidato de extracción y todavía incumple el
    contrato de núcleo común.

## Hechos, inferencias y preguntas abiertas

### Hechos verificados

- T338 tiene suite, build y trazas verdes en su alcance declarado.
- T321 es el último checkpoint con smoke y revisión visual.
- Los puntajes no cambiaron después de Entry 530.
- El corpus venció su política temporal y cuatro hashes ya no coinciden.
- La autoridad fuente registra deltas de bytes, sin revisión semántica cerrada.
- Turns no captura ni restaura un snapshot global después del primer commit.
- El runtime target no modela `index` y toma el orden de selección del array de
  candidatos, no de la memoria de targets.
- El teclado entrega B/F antes de facing y el gamepad aún no entrega input.
- Studio persiste el manifiesto en localStorage, la evidencia aparte y los
  handles en IndexedDB; no existe `StudioProjectSnapshot/v1`.
- La escritura de fuente guarda preimagen y receipt en memoria durante la
  operación; no existe un journal recuperable al reiniciar.
- Solo Nova tiene un `asset-permission.json` listo para release.
- PackageAnalysis se calcula de forma productiva, pero no persiste revisiones o
  diffs y trata señales IKEMEN como unsupported de forma muy amplia.

### Inferencias que requieren un gate

- El código FightScreen reciente puede verse bien con fixtures unitarios y aun
  fallar con rutas reales de resolución, `localcoord`, FNT, SFF y SND de un
  screenpack importado.
- Una falla de Turns después de `applyTeamRoundHandoff()` puede dejar roles,
  runtime o recursos en un estado parcial.
- Una permutación de stores, dueños o orden de spawn puede cambiar un choque de
  tres o más proyectiles bajo los loops actuales.
- Un proyecto Studio puede conservar `projectDirty=false` tras un cambio de
  bytes por reimport o source-write y usar una revisión guardada anterior.
- Studio puede presentar GateEvidence viejo como ligado a la revisión actual al
  crear el envelope después del hecho.
- Dos proyectos con el mismo `sourcePackageId` pueden cruzar handles porque la
  clave durable carece de `projectId` y digest esperado.
- Una policy global de assets puede bloquear un proyecto mínimo por recursos
  diagnósticos o no alcanzables desde su entry.

### Preguntas de decisión

1. ¿La autoridad normativa seguirá fijada al commit Ikemen actual o se adoptará
   un proceso de actualización por versión con revisión de deltas?
2. ¿El release de Studio cubre el cierre alcanzable desde entry/modules o todo
   el catálogo del workspace?
3. ¿El primer fixture FightScreen directo debe ser un paquete sintético CC0 del
   repo, una variante de `mugen-lite-journey` o ambos?
4. ¿Multi-package P1/P2 forma parte de MUGEN-lite MVP o queda después del primer
   proyecto releaseable?
5. ¿Qué warnings de evidencia deben bloquear release? Hoy algunos estados
   `warn` aún permiten exportar.
6. ¿La segunda ruta legal de personaje debe usar otra ruta de herramienta y
   transformación, además de otro registro inmutable?
7. ¿Qué autoridad usa cada multiplicador Target: caller, destino del redirect,
   receptor o configuración global?
8. ¿El facing de input se toma al inicio del frame o después de actualizar actor?
9. ¿Qué clave global ordena proyectiles: PlayerNo, RunOrder, serial de spawn o
   una combinación por fase?

## Mapa de gaps por horizonte y sistema

| Horizonte | Demostrado | Gaps de mayor riesgo | Gate de salida |
| --- | --- | --- | --- |
| Sandbox jugable | Match local, renderer Three.js, HUD, debug, Studio y smoke T321. | Smoke visual atrasado frente a T339; Common.Fx sin ruta directa; input físico/lógico sin snapshot final; FightScreen importado sin journey. | Smoke de HEAD, ruta directa Common.Fx y matriz de input con prueba desktop/mobile. |
| MUGEN-lite MVP | Journey legal, 633 trazas, Common1 acotado, FightScreen T297-T321 y causas KO T322-T339. | Corpus vencido; segundo personaje ausente; FNT/perfil/transformaciones residuales; `winType`, `id/index` y target order incompletos; Turns no atómico. | Corpus v1.2 inmutable, segundo personaje CC0, screenpack journey y transacciones de equipo. |
| MUGEN amplio | Parser/runtime extensos y reporting fail-soft. | VM completa, orden global, throws, multi-target/multi-hit, helpers/proyectiles plurales, audio/paleta/screenpack exactos, corpus diverso. | Matriz multi-paquete con diferenciales por sistema y claims derivados del corpus. |
| IKEMEN | Perfil explícito, raíces P3-P8 acotadas, Tag/Turns parciales, scanner de señales. | Simul/Tag/Turns completos, scheduler global, fuente semántica clasificada, ZSS/Lua/Modules, model/video stages, rollback/netplay. | Gates separados para scanner y ejecución; fuente pinneada; journeys de equipo y orden global. |
| Studio/producto | Workbench, Evidence, Build, imports, handles y escritura de un archivo. | Snapshot completo, reanalysis/diff, subject binding, journal/recovery, closure de release, multi-package real y aislamiento de handles. | Reopen íntegro, changed-source browser gate, fault injection por fase y proyecto mínimo releaseable. |
| Assets/provenance | Provenance v2, policy y Nova con permiso. | Segundo asset, receipt durable de transformación, binding a output digest/revisión, closure required/optional/diagnostic. | Dos registros independientes pasan policy, reopen y playtest ligados a digest. |
| Scanner | PackageAnalysis v1 llega a UI/export. | Análisis efímero, señal IKEMEN demasiado amplia, CommonSourceRecord ausente, falta matriz recognized/parsed/compiled/executed/verified. | Reanalysis persistido, diff semántico y matriz por capacidad con refs exactos. |
| Modularización | ModuleContracts y una regla útil MUGEN→app/game/three. | Gate vacuo para raíces futuras; EvidenceEnvelope sigue en app; no hay consumidor ajeno a fighting. | Gate fail-closed, extracción por capas y dos consumidores antes de afirmar reutilización. |

## Decisiones arquitectónicas propuestas

### D1. `RoadmapCursor/v1`

Registrar seis valores: HEAD auditado, Entry numérica máxima, último Wayfinder
cerrado, último checkpoint funcional, último checkpoint visual y trabajo sucio
o en curso. Los documentos deben leer el mismo registro o repetir el tuple
completo. Alternativa: mantener selectores manuales por documento. Tiene menor
costo inicial y ya produce contradicciones. El cambio solo mejora control.

### D2. `SourceAuthorityManifest/v1` y `SourceSemanticDelta/v1`

Vincular cada claim a revisión normativa, archivo, función o rango lógico,
digest, estado del cache/adaptación, tests y efecto en el claim. La revisión por
archivo completo queda como resumen. Tiene menos detalle y no resuelve un archivo
con cambios ajenos a la función citada. Esta decisión habilita claims de fuente
acotados; no habilita paridad semántica global.

### D3. `FightScreenPresentationPlan/v1`

El runtime debe publicar hechos de ronda, tiempos, winner y causas. Un plan de
presentación debe derivar records de texto, animación, sonido, capa y ventana.
El renderer debe consumir el plan sin recalcular reglas de resultado. Alternativa:
seguir sumando campos directos al snapshot y ramas en renderer/audio. Tiene menor
costo por corte y aumenta el riesgo de orden distinto entre texto, sprite y SND.

### D4. Fixture de conformidad FightScreen

Crear un paquete CC0 del repo que incluya `fight.def`, AIR, SFF, SND y FNT con
casos mínimos y negativos. Debe entrar por folder y ZIP y publicar diagnósticos
por capacidad. Alternativa: ampliar el smoke nativo sin import. Tiene menor costo
y no prueba resolución de archivos ni semántica del paquete.

### D5. `WinTypeCauseEvent/v1`

Registrar eventos con tick, actor fuente, root, receptor, contacto/controlador,
atributos, transición de vida y prioridad. Reducirlos una vez al final de la fase
de combate. Los recursos que no cambian vida deben declarar de forma expresa si
emiten o no causa. Alternativa: escribir `roundWinType` durante cada mutación.
Tiene menos memoria y permite que una mutación posterior pise el origen real.

### D6. Orden estable de target y scheduler global de proyectiles

Usar identidad estable con generación para target refs y un plan global de
intents para proyectiles, contactos, cancelaciones y proxies. El commit ocurre
después de ordenar y validar el plan. Alternativa: resolver por actor/store en
orden local. Tiene menos infraestructura y falla cuando tres o más actores o
proyectiles interactúan en el mismo tick.

### D7. `RuntimeTurnsContinuationTransaction/v1`

Separar snapshot, plan inmutable, validación, commit y rollback. El commit debe
ser all-or-nothing para handoff, reset, recursos, estado 5900, active roots y
match outcome. Alternativa: añadir guards antes de cada mutación actual. Reduce
algunas fallas y deja abiertas excepciones o cambios posteriores al primer write.

### D8. `MatchInputPolicySnapshot/v0`

Fijar por match el perfil, SOCD, facing, remap, ButtonAssist y origen de input.
Todo comando debe consumir una secuencia física→lógica→facing→matcher registrada.
Alternativa: leer opciones vivas desde varios sistemas. Tiene menor costo y hace
que replay y trazas dependan de estado externo.

### D9. `StudioProjectSnapshot/v1` y `SourceWriteJournal/v0`

Guardar manifest, analyses, envelopes, receipts y digests en una transacción de
IndexedDB. Mantener localStorage como índice/migración. El journal debe registrar
prepared/applied/verified/compensated, preimagen y digest antes de escribir.
Alternativa: seguir con tres almacenes y compensación en memoria. Tiene menos
migración y no cubre cierres o reinicios del proceso.

### D10. Subject binding e inmutabilidad de evidencia

Usar `{projectId, projectRevision, manifestDigest, sourceDigest,
producerRevision, artifactDigest}`. Un mismatch queda `stale` o `blocked` según
uso. Los artefactos adjudicados deben guardarse por SHA-256; `.scratch` queda
como salida temporal. Alternativa: frescura por fecha y rutas mutables. Es simple
y ya permite que ejecuciones nuevas cambien bytes de un corpus cerrado.

### D11. Closure de release y modelos del scanner

Derivar assets required/optional/diagnostic desde entry, módulos y source refs.
Persistir `PackageAnalysisRevision/v2`, `CommonSourceRecord/v1` y una
`CapabilityEvidenceMatrix` separada. Alternativa: evaluar todo el catálogo y
convertir toda señal IKEMEN en unsupported. Tiene menos joins y bloquea proyectos
mínimos mientras oculta capacidades runtime ya demostradas.

### D12. Boundary gate fail-closed y extracción por capas

Clasificar raíces como required, optional o future. Una required ausente falla;
una future ausente queda unsupported. Extraer canonicalización/digest de
EvidenceEnvelope solo después del gate y del subject binding. Alternativa:
omitir raíces ausentes. Produce un `passed` sin superficie real inspeccionada.

## Roadmap restante por fases y dependencias

| Fase | Objetivo | Depende de | Claim permitido al cerrar | Claim aún bloqueado |
| --- | --- | --- | --- | --- |
| P0 Verdad de control | Unificar cursores, fuente y evidencia vigente. | Ninguna. | “El corte y sus artefactos están ligados a una revisión exacta.” | Aumento de compatibilidad. |
| P1 FightScreen directo | Probar el paquete importado y separar plan de presentación. | P0. | “El fixture CC0 importado cubre las capacidades listadas.” | Paridad de screenpack amplia. |
| P2 Input y Common.Fx | Fijar policy de match y browser journeys. | P0; P1 para UI compartida. | “Las rutas físicas/lógicas y Common.Fx pasan la matriz acotada.” | Input/device parity total. |
| P3 Equipos y orden global | Turns atómico y scheduler de proyectiles. | P0, D5 y D6. | “Los fixtures 1-2-3 y 3+ actores conservan atomicidad y orden.” | Simul/Tag/rollback/netplay completos. |
| P4 Corpus y adjudicación | Corpus v1.2 y segundo personaje legal. | P0-P3 según claims incluidos. | “Dos rutas de personaje/stage tienen evidencia inmutable y vigente.” | Compatibilidad pública amplia. |
| P5 Studio, scanner y assets | Snapshot, journal, reanalysis, closure y segundo asset. | P0 y P4 para release claims. | “Un proyecto local puede reabrir, reanalizar, recuperar y decidir release.” | Publicación, aprobación legal global y multi-workspace. |
| P6 Modularización | Gate no vacío y primer contrato común. | P0, P5 y dos consumidores reales. | “El contrato extraído sirve a los consumidores probados.” | SDK genérico o plataforma completa. |
| P7 MUGEN/IKEMEN amplio | VM, teams, screenpack, audio, corpus y red más amplios. | Todas las fases previas. | Claims derivados de cada corpus y sistema. | Paridad completa hasta diferencial suficiente. |

Tras P6, el orden recomendado para el horizonte largo es: extraer contratos de
proyecto/input/assets/tick/snapshot, sumar un segundo consumidor ajeno a fighting,
crear una slice mínima de platformer y volver a medir límites. Para MUGEN/IKEMEN,
la secuencia larga debe cubrir VM y triggers, throws/custom states, actores
plurales, screenpacks/motifs, audio, ZSS/Lua/Modules y luego rollback/netplay.

## Próximas 30 tareas listas para ejecución

Estos IDs pertenecen a este informe y no reservan números Wayfinder.

### P0 — Control, fuente y evidencia

1. **DA-01 — Materializar `RoadmapCursor/v1`.** Dependencias: ninguna. Alcance:
   docs de control y un validador que lea HEAD, Entry, Wayfinder y checkpoints.
   Aceptación: todos los selectores publican el mismo tuple y T288 queda como
   historial. Evidencia: casos current/stale/in-flight, búsqueda dirigida,
   `git diff --check`. Riesgo: colisión con docs sucios. Claim: control coherente;
   sin cambio de score.
2. **DA-02 — Formalizar ciclo Wayfinder y destino del ledger.** Dependencias:
   DA-01. Alcance: estados planned/in-progress/resolved-focused/checkpointed y
   ADR para retirar o reanudar Entry después de 562. Aceptación: ningún cierre
   carece de SHA y gates; un checkpoint no cubre commits posteriores. Evidencia:
   validador con casos negativos. Claim: trazabilidad, sin compatibilidad nueva.
3. **DA-03 — Ampliar `SourceAuthorityManifest/v1`.** Dependencias: DA-01.
   Alcance: `fightscreen.go`, `common.go`, `font.go`, `image.go`, `render.go` y
   funciones recientes de `char.go`/`bytecode.go`. Aceptación: revisión, digest,
   función, cache y claim family por referencia. Evidencia: regeneración
   determinista y tamper test. Claim: procedencia de fuente, sin paridad semántica.
4. **DA-04 — Clasificar deltas semánticos T297-T339.** Dependencias: DA-03.
   Alcance: FNT/layout/outcome/winType/Target* contra el pin normativo, incluida
   la autoridad caller/redirect/receptor de multiplicadores y `id/index`.
   Aceptación: cada función queda same/adapted/divergent/unknown con tests y
   efecto en claims. Evidencia: revisión por función y fixtures diferenciales.
   Riesgo: cache local dirty. Claim: equivalencia solo para funciones cerradas.
5. **DA-05 — Cerrar evidencia exacta de HEAD.** Dependencias: DA-01 y DA-04.
   Alcance: suite, build, trace y smoke visual en la misma revisión; copiar
   artefactos aceptados a rutas por digest. Aceptación: producerRevision y hashes
   coinciden; una ejecución posterior no altera el paquete aceptado. Evidencia:
   A→B con hashes. Claim: checkpoint exacto de HEAD, sin ampliar el corpus.

### P1 — FightScreen y causa de resultado

6. **DA-06 — ADR `FightScreenPresentationPlan/v1`.** Dependencias: DA-04.
   Alcance: ownership entre runtime, plan, audio y renderer; probable impacto en
   `RuntimeRound*`, `MugenFightScreen*` y `FightScreenAnnouncementRenderer`.
   Aceptación: facts, derivación y consumo tienen un solo dueño y orden estable.
   Evidencia: ADR con ejemplos KO/DKO/time/winType. Claim: decisión, sin código.
7. **DA-07 — Crear fixture CC0 FightScreen directo.** Dependencias: DA-03 y
   DA-06. Alcance: `fight.def`, AIR, SFF, SND, FNT, folder y ZIP. Aceptación:
   imports equivalentes, licencia y digests registrados, casos negativos
   explícitos. Evidencia: loader report y policy legal. Claim: fixture del repo.
8. **DA-08 — Ejecutar matriz browser FightScreen.** Dependencias: DA-07.
   Alcance: FNT, layerno, window, transform, PalFX, KO/DKO/time/result/winType y
   sonido. Aceptación: desktop/mobile, capturas, diagnósticos, cero error de
   consola y no-blank canvas. Evidencia: `qa:smoke` o journey dedicado con refs
   por digest. Claim: solo la matriz del fixture.
9. **DA-09 — Publicar `FightScreenResidualProfile/v0`.** Dependencias: DA-04 y
   DA-08. Alcance: TrueType/binary FNT, encoding, `perspective2`, tile/parallax,
   anchors/aspect/frustum, paleta/sin effects, SND y motif/dialogue. Aceptación:
   cada capacidad queda supported/partial/unsupported/unknown con prueba o fuente.
   Evidencia: reporte máquina + test del clasificador. Claim: perfil honesto.
10. **DA-10 — Diseñar `WinTypeCauseEvent/v1`.** Dependencias: DA-04 y DA-06.
    Alcance: causa, actor/root/receptor, contacto, atributo, transición y prioridad.
    Aceptación: direct hit, projectile, helper, suicide y teammate se reducen de
    forma estable. Evidencia: tabla fuente + unitarias/diferenciales. Claim:
    procedencia de los casos probados.
11. **DA-11 — Fijar política de recursos sin vida.** Dependencias: DA-10.
    Alcance: TargetRedLife/Guard/Dizzy y su relación con causas de KO. Aceptación:
    la fuente decide emisión directa, ausencia o efecto posterior; no quedan
    claims ambiguos. Evidencia: tests de cero vida y recursos auxiliares. Claim:
    regla de no-causa o causa según evidencia.
12. **DA-12 — Añadir causas por reversal/reflection.** Dependencias: DA-10.
    Alcance: ReversalDef, proyectil reflejado y ownership tras redirección.
    Aceptación: fuente/root/receptor sobreviven a la inversión y el winner queda
    estable. Evidencia: oráculos focales y trace. Claim: solo rutas cubiertas.
13. **DA-13 — Estabilizar target order, `index` e identidad.** Dependencias:
    DA-10 y DA-12. Alcance: `id/index`, múltiples targets, `ActorGeneration/v0`,
    genealogía parent/root, stale refs y actor removal. Aceptación: selección y
    mutación usan identidad exacta, generación monotónica y orden documentado;
    un actor recreado con el mismo ID invalida leases previos. Evidencia:
    permutaciones, árbol helper y test stale-generation. Claim: orden e identidad
    del corpus; Helper-victim y redirect recursivo quedan para cortes posteriores.

### P2 — Input y Common.Fx

14. **DA-14 — Implementar `MatchInputPolicySnapshot/v0`.** Dependencias: DA-05.
    Alcance: profile, SOCD, remap, facing, ButtonAssist y origen por jugador.
    Aceptación: snapshot inmutable en runtime/trace y restore determinista.
    Evidencia: serialización, replay A→B y source refs. Claim: policy fijada.
15. **DA-15 — Probar matriz física→lógica→facing→matcher.** Dependencias:
    DA-14. Alcance: P1/P2, facing invertido, teclado/touch, SOCD, ButtonAssist y
    un perfil de gamepad estándar con deadzone/conexión. Aceptación: L/R físico
    se convierte en B/F según facing, sin doble remap, y todos los adapters usan
    la misma policy. Evidencia: tests de cruce con teclas retenidas, adapter tests
    y browser journey. Claim: dispositivos y casos listados.
16. **DA-16 — Cerrar Common.Fx en navegador.** Dependencias: DA-05 y DA-15.
    Alcance: package selection, prefix, AIR/SFF/SND, hit/guard spark y audio.
    Aceptación: una importación activa resuelve assets comunes con capturas y
    diagnósticos. Evidencia: browser artifact por digest. Claim: fixture directo.

### P3 — Turns y orden global

17. **DA-17 — Crear plan inmutable de Turns.** Dependencias: DA-04 y DA-13.
    Alcance: inventario de roots, ronda, vars, recursos, efectos, audio pendiente,
    buffers, SOCD, logs y RNG; precondiciones, desired states y mutations sin
    writes. Aceptación: `prepare()` no cambia ningún root/world y detecta todos
    los bloqueos. Evidencia: deep snapshot antes/después y fault cases. Claim:
    preflight puro.
18. **DA-18 — Commit/rollback atómico de Turns.** Dependencias: DA-17. Alcance:
    handoff, reset, recursos, 5900, active roots y outcome. Aceptación: falla
    inyectada en cada fase restaura bytes lógicos y permite reintento idempotente.
    Evidencia: fault injection por fase. Claim: atomicidad del transaction set.
19. **DA-19 — Journey Turns 1-2-3.** Dependencias: DA-18. Alcance: roster de
    tres miembros, KO, replacement, draw y terminal. Aceptación: continuidad,
    recursos, vars, state 5900, winner y trazas estables. Evidencia: trace +
    browser cuando cambie presentación. Claim: roster probado.
20. **DA-20 — Diseñar `GlobalProjectileSchedule/v1`.** Dependencias: DA-13.
    Alcance: intents de spawn/move/contact/cancel/remove para todos los actores.
    Aceptación: orden total por fase e identidad, sin mutación durante gather.
    Evidencia: 3+ proyectiles con orden permutado. Claim: scheduler acotado.
21. **DA-21 — Commit de contactos, cancel y proxies.** Dependencias: DA-20.
    Alcance: arbitraje global y creación de proxy después del plan. Aceptación:
    una interacción no depende del orden de stores ni pierde contacto. Evidencia:
    diferenciales A→B/B→A, trace y stale actor tests. Claim: casos plurales del
    corpus; teams amplios siguen abiertos.

### P4 — Corpus y puntajes

22. **DA-22 — Materializar CompatibilityCorpus/v1.2.** Dependencias: DA-05,
    DA-08, DA-16 y DA-19 según rutas incluidas. Alcance: revisión actual, refs
    inmutables y claims derivados. Aceptación: cada hash existe y coincide; fecha
    y producerRevision vigentes; character y stage se distinguen. Evidencia:
    materializador/verificador. Claim: rutas exactas, sin amplitud pública.
23. **DA-23 — Añadir segundo personaje CC0 independiente.** Dependencias:
    DA-22. Alcance: idle/walk/crouch/jump/attack/guard/get-hit/fall/recovery y
    gaps visibles. Aceptación: package digest/licencia, folder/ZIP equivalentes,
    trace y browser. Evidencia: oráculos propios. Claim: dos personajes legales
    del repo; compatibilidad general sigue bloqueada.
24. **DA-24 — Adjudicar puntajes por sistema.** Dependencias: DA-22 y DA-23.
    Alcance: scorecard, tracker y release targets; separar Studio y modular.
    Aceptación: cada cambio cita denominador y evidencia; docs-only conserva el
    valor. Evidencia: diff de claims y verificador de refs. Riesgo: inflar por
    cantidad de tests. Claim: solo puntajes adjudicados.

### P5 — Studio, scanner y assets

25. **DA-25 — Atar evidencia al subject exacto.** Dependencias: DA-05.
    Alcance: tuple de proyecto/fuente/productor/artefacto y estados separados de
    diagnostic-export y release. Aceptación: revisión vieja, edad, tamper o fuente
    cambiada bloquean release y aún permiten exportar diagnóstico cuando sea
    seguro. Evidencia: unitarias + changed-source browser. Claim: frescura exacta.
26. **DA-26 — Persistir `StudioProjectSnapshot/v1`.** Dependencias: DA-25.
    Alcance: manifest, PackageAnalysis revisions/diffs, envelopes, receipts y
    policies en IndexedDB; migración desde localStorage. Aceptación: reopen
    conserva digest semántico y conflictos fallan cerrados. Evidencia: reload,
    migration, quota/error tests. Claim: persistencia del navegador probado.
27. **DA-27 — Crear `SourceWriteJournal/v0`.** Dependencias: DA-26. Alcance:
    phases, preimage, digest, recovery y namespace `{projectId, packageId,
    expectedDigest}` para journal/handle. Aceptación: reinicio en cada fase
    recupera o bloquea de forma idempotente; proyectos homónimos quedan aislados.
    Evidencia: fault injection + restart. Claim: un archivo; ZIP/multifile abierto.
28. **DA-28 — Versionar scanner y matriz de capacidad.** Dependencias: DA-26.
    Alcance: `CommonSourceRecord/v1`, `PackageAnalysisRevision/v2` y estados
    recognized/parsed/compiled/executed/verified. Aceptación: reanalysis/diff
    persiste y las capacidades runtime conocidas dejan de caer en unsupported
    global. Evidencia: fixtures multi-source y refs a registry/trace. Claim:
    capacidad por celda, sin ejecución por mera detección.
29. **DA-29 — Cerrar release closure y segundo asset.** Dependencias: DA-25,
    DA-26 y DA-28. Alcance: required/optional/diagnostic desde entry/modules y
    segundo asset repo-owned/generated con receipt y output digest. Aceptación:
    proyecto Nova-only puede cerrar si su closure está vigente; un asset no
    alcanzable no bloquea; el segundo registro pasa QA, reopen y playtest ligado
    al digest. Evidencia: policy, capturas/collision/playtest. Claim: esos dos
    registros; sin publicación ni aprobación legal externa.

### P6 — Modularización

30. **DA-30 — Hacer no vacuo el boundary gate.** Dependencias: DA-01 y DA-25.
    Alcance: roots required/optional/future, contadores de archivos y fixtures
    negativos. Aceptación: required ausente falla, future ausente queda
    unsupported, import prohibido falla y root real limpio pasa. Evidencia:
    pruebas del script. Próximo corte: extraer canonicalización/digest de
    EvidenceEnvelope con adaptadores Studio/MUGEN y sumar un segundo consumidor.
    Claim: límites de roots inspeccionados; motor reutilizable sigue bloqueado.

## Claims actuales

### Permitidos

- “Sandbox privado jugable con smoke visual probado hasta T321.”
- “Runtime parcial MUGEN/IKEMEN con 633 trazas y slices T297-T339 acotadas.”
- “T338 pasa suite completa, build y trazas en el alcance declarado.”
- “FightScreen FNT/layout/outcome/winType tiene tests y presentación acotada.”
- “Dos rutas legales del repo existen en el corpus histórico: una de personaje
  y una centrada en stage/import.”

### Bloqueados

- Corpus actual o reproducible desde todas sus referencias presentes.
- Prueba directa de screenpack/FightScreen importado en navegador.
- Paridad exacta de FNT, screenpack, paleta, audio o `winType`.
- Turns atómico, scheduler global de proyectiles y orden multi-target completo.
- Proyecto Studio releaseable con recuperación de crash y binding exacto.
- Amplitud independiente de personajes, publicación comercial o aprobación
  legal externa.
- ZSS/Lua/Modules, rollback/netplay y paridad MUGEN/IKEMEN completa.
- Motor modular reutilizable o plataforma ajena a fighting.

## Riesgos y deuda que deben quedar visibles

- El árbol compartido ya contiene cambios en 17 docs/issues y siete informes
  diarios sin seguimiento. Una reconciliación amplia puede pisar trabajo ajeno.
- La rama local está 219 commits delante de origin; ninguna prueba local implica
  release o publicación.
- Los artefactos de `.scratch` son mutables y pueden invalidar un corpus por una
  ejecución normal.
- Los tests focales recientes crecen rápido y pueden ocultar falta de journeys
  importados, variedad de paquetes y diferenciales con fuente.
- El build mantiene el aviso de chunk mayor a 500 kB y jsdom mantiene su aviso
  de `HTMLCanvasElement.getContext()`; ambos son advisories conocidos.
- El screenpack, Studio y assets tienen estado visible. Todo cambio en esos
  caminos exige browser proof y revisión visual.
- La extracción modular antes de cerrar subject binding y boundaries puede
  fijar dependencias de Studio/MUGEN en un supuesto núcleo común.

## Fuentes primarias consultadas

- [Ikemen GO `fightscreen.go` fijado en `05b7d98`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go): tipos y orden de FightScreen, `layerno`, finish y `WinType`.
- [Ikemen GO `common.go` fijado en `05b7d98`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go): layouts, fuentes y utilidades comunes citadas por los cortes recientes.
- [Ikemen GO `char.go` fijado en `05b7d98`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go) y [Ikemen GO `bytecode.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go): runtime y controladores usados para causas y recursos target.
- [Ikemen GO `input.go` fijado en `05b7d98`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/input.go): entrada física, SOCD y conversión que debe contrastarse con la policy local.
- [Three.js `Object3D.renderOrder`](https://threejs.org/docs/pages/Object3D.html#Object3D.renderOrder): orden explícito y separación de objetos opacos/translúcidos; sustenta la necesidad de probar capas en el renderer real.
- [Indexed Database API 3.0](https://www.w3.org/TR/IndexedDB-3/): transacciones, commit atómico y rollback dentro de IndexedDB.
- [File System Access](https://wicg.github.io/file-system-access/): handles, permisos y escrituras del flujo Studio.
- [W3C PROV-O](https://www.w3.org/TR/prov-o/): base para separar entidad, actividad, agente y derivación en procedencia.
- [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785): JSON canónico y orden determinista. El repo declara `stable-json/v0`; la conformidad RFC 8785 queda abierta.

## Documentos creados o actualizados

- Creado: `docs/research/2026-07-20-daily-roadmap-architecture-audit-post-wayfinder-339.md`.
- No se tocaron los documentos centrales ni los issues con cambios ajenos. El
  corte T339 se leyó después de su commit y quedó fuera del write-set de esta
  corrida. La tarea DA-01 debe reconciliar los docs cuando el dueño esté claro.

## NO CODE CHANGED

Esta ejecución no modificó código, runtime, UI, tests, assets ni configuración.
T339 llegó por trabajo concurrente, se auditó después del commit y se mantiene
en su claim focal. No se ejecutaron suites de código, no se creó commit y no se
hizo push. Esta corrida solo agregó el presente documento de investigación y
roadmap.
