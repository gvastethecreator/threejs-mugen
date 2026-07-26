# Auditoria diaria de roadmap y arquitectura despues de T377

Fecha: 2026-07-22
Tipo: investigacion, arquitectura y roadmap
Estado: propuesta; no cambia gates ni puntajes
Corte auditado: `3e96edeaaa399c1bf35fb42f0b7f63069384a7b1` (`T377`)

## Pregunta

¿Que trabajo queda, en que orden debe ejecutarse y que evidencia falta para avanzar desde el estado real de T377 hacia un sandbox jugable, MUGEN-lite, MUGEN, IKEMEN y un Studio con scanner, activos y limites modulares confiables?

## Respuesta corta

T340–T377 agregan 38 cortes acotados sobre causalidad de Helper, `HelperVar`, colisiones, restricciones y `RedirectID`. El ultimo checkpoint global sigue en T369. T370–T377 solo tienen pruebas focales. El avance no mueve puntajes.

El riesgo principal de control es la division de autoridad de fuente. El manifiesto y ADR vigentes fijan Ikemen GO `05b7d98`, mientras T370–T377 citan `4aa0ba38`. La comparacion oficial contiene 51 commits y 34 archivos. El repo aun no clasifica ese cambio ni liga todos los claims a una epoca de fuente.

El siguiente orden reduce riesgo: checkpoint global exacto de T377; cursor unico de evidencia; reparacion de IDs y selectores; epoca y manifiesto de fuente; matriz de redirecciones; identidad de actor y colas diferidas; prueba visual legal de FightScreen; input; Turns; orden global de proyectiles; corpus y adjudicacion; Studio, scanner, activos y limites modulares.

## Limite de esta auditoria

- No se ejecuto ninguna suite de codigo.
- No se cambio runtime, UI, fuente ni pruebas.
- Los resultados de gates provienen de artefactos y tickets ya guardados.
- Los puntajes quedan en `65 / 36 / 20 / 10-12 / 6-8 / 25`.
- Esta nota no convierte una propuesta en comportamiento demostrado.
- El corte queda fijo en T377. Trabajo posterior queda fuera de esta auditoria.
- Durante la verificacion aparecio trabajo concurrente de T378 en runtime, pruebas y Wayfinder. Esta auditoria no lo toco ni lo incorpora a sus claims.

## Cambio desde la ultima ejecucion

La ejecucion del 2026-07-21 no produjo una auditoria sustantiva por un fallo de bootstrap. El ultimo informe util fue el del 2026-07-20 en `a91da04e`.

| Comparacion | Resultado |
| --- | --- |
| Desde la marca de la automatizacion del 2026-07-21 | 33 commits |
| Desde `a91da04e` | 100 commits |
| Frontera focal | T377 en `3e96edea` |
| Ultimo checkpoint global de runtime | T369 en `ac8283dc` |
| Ultimo checkpoint visual de Studio | T342 en `1085badb` |
| Ultima entrada formal del backlog | Entry 562, T288 |
| Estado de rama al fijar el corte | `master`, 33 commits delante de `origin/master` |

### Delta funcional demostrado

| Tramo | Evidencia acotada | Mejor gate guardado |
| --- | --- | --- |
| T340–T341 | Fuentes de hit en Helper anidado y admision del caller Helper para `RedirectID` | 238 archivos, 2587 pruebas, build y 633 trazas |
| T342 | Navegacion desde diagnosticos semanticos de fuente en Studio | 239 archivos, 2589 pruebas, TypeScript 7, build, 633 trazas, boundaries y browser smoke |
| T343–T352 | `ownprojectile`, campos `HelperVar`, `clsnproxy`, `preserve` y reset | Suite completa hasta T351; T352 queda focal con build y trazas |
| T353–T360 | Proxies de colision, escala, ataques, reversal, proyectiles y `TransformClsn` | Suite completa en T356; despues, gates focales y 636 trazas |
| T361–T367 | `OverrideClsn`, size, `PlayerPush` y Width/Height/Depth de Helper | Focales, TypeScript 7, build, trazas y boundaries; Vitest completo diferido |
| T368–T369 | Width edge y `ScreenBound`/`StageBound` de Helper | 241 archivos, 2661 pruebas, TypeScript 7, build de 329 modulos, 636/636 trazas y boundaries |
| T370–T377 | `RedirectID` para `PosFreeze`, `PlayerPush`, `ScreenBound`, `TransformClsn`, `OverrideClsn`, `HitBy` y `NotHitBy` | Gates focales; T377 declara 4 archivos y 994 pruebas |

T377 deja pendientes TypeScript, Vitest completo, `qa:trace`, build y boundaries. Ningun documento permite proyectar el gate T369 sobre T377.

### Relacion con las 30 tareas del 2026-07-20

Ninguna tarea anterior quedo cerrada de punta a punta. T340–T341 reducen una parte de identidad y causalidad de destinos. T342 mejora un flujo vecino a la identidad de evidencia de Studio. T343–T377 agregan capacidad acotada y abren la necesidad de agrupar redirecciones. Siguen abiertos el cursor, la autoridad de fuente, FightScreen legal, input, Turns, orden global de proyectiles, corpus, segundo personaje, adjudicacion, persistencia Studio, reanalisis, segundo activo y limites modulares.

## Verdad de evidencia

### Hechos verificados

1. `ROADMAP_PROGRESS_SYSTEM.md`, `ROADMAP_EXECUTION_BOARD.md`, `ROADMAP_PACKAGE_MILESTONES.md`, `NEXT_BUILD_ROADMAP.md`, `DELIVERY_ROADMAP.md`, `ROADMAP_CONTINUITY_GUIDE.md` y `PORT_COMPLETION_SCORECARD.md` conservan T287/T288 como selector principal.
2. `PROGRESS_TRACKER.md` y `WORKPLAN.md` llegan a T377, pero aun conservan una frontera activa vieja en secciones inferiores.
3. `BUILD_EXECUTION_BACKLOG.md` mezcla `Entry 562` con una lista cronologica que termina en `499. Done`. Varias cabeceras reutilizan numeros. La regla de maximo numerico ya no identifica el ultimo evento.
4. Los issues de control bajo `.scratch/roadmap/issues/` siguen ligados al override post-T268. El issue 07 aun trata un gate previo como abierto.
5. `SourceAuthorityManifest/v0` fija `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, una cache local vieja y `semanticReview: unclassified`.
6. T370–T377 citan `4aa0ba38f851c52549ba182310e9e53361cd472a` sin un nuevo manifiesto ni una adjudicacion del cambio.
7. El corpus v1.1 esta 335 commits detras de T377. Cuatro de sus ocho hashes no coinciden con los archivos actuales.
8. `StudioGateEvidence/v0` esta 331 commits detras de T377. Su marca `passed` no liga el resultado al sujeto actual.
9. El control de boundaries omite raices ausentes. Tres raices declaradas no existen y el contenido actual de `src/engine` queda permitido por lista.
10. `GamepadInputAdapter` devuelve un conjunto vacio.
11. Turns aplica handoff, reset, recursos y estado 5900 en pasos sucesivos sin un snapshot global ni rollback.
12. Los almacenes de efectos de proyectil usan inserciones locales. No existe `GlobalProjectileSchedule` ni una fase global equivalente.
13. Browser smoke solo aparece en T342 dentro del delta. Los cambios de geometria T343–T377 no tienen prueba visual nueva.
14. El delta completo `a91da04e..3e96edea` contiene fallas historicas de `git diff --check`, aunque el arbol documental de esta auditoria puede validarse por separado.

### Inferencias que requieren prueba

1. `deferredRootConstraintRedirects` guarda closures con destinos ya resueltos. El codigo visible no muestra una revalidacion uniforme de identidad y generacion al ejecutar la cola.
2. Un caller Helper pasa una comprobacion de ancestry. Un destino Helper no pasa siempre la misma comprobacion antes de aplicar una redireccion.
3. El crecimiento de `PlayableMatchRuntime`, `HelperSystem` y presets de trazas aumenta el costo de copiar reglas de escala, orden, materializacion y telemetria entre controladores.
4. Los 38 microcortes recientes pueden ocultar combinaciones sin cubrir: caller temprano/tardio, destino activo/reserva, varios writers, pausa, hitpause, reset, actor reciclado y Helper anidado.
5. IndexedDB puede agrupar cambios en sus object stores. La escritura a archivos usa otra API y permisos propios. Una garantia de atomicidad entre ambos medios requiere un journal y recuperacion; la norma no ofrece una transaccion comun.

### Preguntas abiertas

1. ¿`4aa0ba38` reemplaza a `05b7d98` como revision normativa o abre una epoca candidata?
2. ¿Los controladores de T370–T377 conservan el mismo sentido bajo ambas revisiones?
3. ¿Cuando vence una redireccion diferida si el destino muere, cambia de generacion o sale de la lista activa antes del commit?
4. ¿Que orden exacto usa Ikemen para `id`, `index`, varios destinos y redirecciones recursivas?
5. ¿Que pasos de reset ejecuta un root que recibe una escritura diferida antes de su turno normal?
6. ¿Que segunda pieza CC0 prueba el cierre de activos sin abrir una dependencia legal nueva?

## Mapa de gaps por horizonte

| Horizonte | Demostrado al corte | Gap principal | Proxima evidencia | Claim permitido ahora |
| --- | --- | --- | --- | --- |
| Sandbox jugable, 65 | Match local, escenario original, HUD, depuracion, Studio y smoke previos | HEAD sin gate global, geometria reciente sin browser, gamepad vacio | Checkpoint T377 y viaje visual legal | Sandbox local con rutas ya probadas |
| MUGEN-lite, 36 | Un viaje legal, rutas KFM/Common, FightScreen parcial y gran conjunto de trazas | Corpus viejo, cuatro hashes distintos, un solo personaje independiente, FightScreen importado sin cierre directo | Corpus v1.2, FightScreen CC0 y segundo personaje | MVP practico acotado al corpus previo |
| MUGEN 1.0/1.1 MVP, 20 | Loader, VM parcial, combate, Helper, proyectiles, Common1 y presentacion parcial | AST/IR exacto, throws, custom states amplios, screenpack, paletas, audio, orden de tick y equipos | Identidad/orden, Turns, scheduler y presentacion | Infraestructura parcial, sin paridad amplia |
| MUGEN completo, 10–12 | Base tecnica y disciplina de evidencia | Cobertura de personajes, escenarios, screenpacks, controladores, timing y medios | Varias familias reales y corpus diverso | Fundacion para un port largo |
| IKEMEN, 6–8 | Perfil explicito, Topology/Tag/Helper acotado, equipos y Turns parciales | Pin dividido, Simul/Tag/Turns exactos, ZSS, Lua, modulos, ocho actores, rollback y netplay | Epoca de fuente, orden global y equipos | Rutas IKEMEN acotadas por ticket |
| Studio/producto, 25 combinado | Workbench, diagnosticos, source write, evidencia, build y activos | Evidencia vieja, sujeto debil, snapshot de proyecto, journal, recuperacion y export completo | Subject binding, snapshot y recovery drill | Prototipo local de autorado |
| Activos y provenance | Nova y politicas SPDX/permiso parciales | Cierre de release y segunda pieza independiente | Paquete redistribuible con recibos y drill | Activos locales con alcance declarado |
| Scanner | Scanner y reportes de capacidad parciales | Mezcla reconocer, parsear, compilar, ejecutar y verificar; sin revision de analisis | Matriz de capacidad y reanalisis versionado | Reporte diagnostico, sin inferir runtime |
| Modularizacion, 10 interno | Contratos y un check de limites | Gate vacuo, raices ausentes y un solo consumidor real | Fallo por raiz ausente y dos consumidores | Intencion de separacion, sin extraccion probada |

## Mapa de gaps por sistema

| Sistema | Gap | Dependencia | Riesgo si se posterga |
| --- | --- | --- | --- |
| Control del roadmap | Selectores, IDs y nombres de reportes no distinguen focal de global | Checkpoint T377 | Agentes repiten gates cerrados o heredan claims amplios |
| Autoridad de fuente | Dos SHAs oficiales sin epoca ni delta semantico | Decision de pin | Fixtures exactos contra revisiones distintas |
| Helper y redirecciones | Matriz incompleta de caller, destino, fase y lifecycle | Fuente y ActorRef | Escrituras sobre actores viejos o rutas sin reset |
| Colision y restricciones | Estado creado, proxy, escala, push, width y bounds viven en rutas distintas | Oracle de geometria | Diferencias entre telemetria, hit admission y pantalla |
| Presentacion | FightScreen y Common.Fx carecen de un cierre visual legal actual | Fixture CC0 | Avance interno sin prueba de usuario |
| Input | Politica de match y gamepad incompletos | Snapshot de input | Repeticion, facing y control cambian segun adaptador |
| Teams/Turns | Mutacion secuencial sin rollback global | Plan inmutable | Estado parcial ante fallo intermedio |
| Proyectiles | No hay gather/schedule/commit global | Identidad y orden | Orden depende del propietario o de la insercion local |
| Corpus y score | Artefactos viejos y hashes distintos | Checkpoint y viajes legales | Puntajes sin denominador reproducible |
| Studio | Evidencia no liga proyecto, revision, fuente y gate | Subject binding | UI muestra `passed` para otro sujeto |
| Escritura | IndexedDB y archivos no comparten transaccion | Snapshot y journal | Recuperacion incompleta tras corte o permiso perdido |
| Scanner | Una deteccion puede parecer soporte real | Capability matrix | Falsos positivos de compatibilidad |
| Activos | Falta segundo paquete y cierre de release | Journal y scanner | Provenance sin prueba de export |
| Modulos | El gate acepta raices que faltan | Manifiesto de limites | Claim modular sin dependencias reales |

## Decisiones de arquitectura propuestas

### D1. `RoadmapCursor/v1`

Opciones:

- Mantener selectores manuales en cada documento: cambio barato, alta deriva.
- Usar solo el ultimo numero del backlog: falla por IDs repetidos y dos secuencias.
- Publicar un cursor con HEAD, ultimo evento focal, ultimo checkpoint global, ultimo visual, entrada formal, puntajes y estado del arbol.

Propuesta: tercera opcion. Cada documento de control consume el mismo cursor. El cursor debe ligar cada campo a SHA y artefacto.

Claim permitido: estado exacto del corte.
Claim bloqueado: equiparar el ultimo ticket con el ultimo gate global.

### D2. Identidad estable de eventos del roadmap

Opciones:

- Renumerar toda la historia: rompe enlaces y referencias.
- Conservar numeros visibles y sumar un ID estable, por ejemplo `WF-T377`, `BL-E562`, `AUD-2026-07-22-01`.
- Seguir usando el maximo numerico: mantiene la ambiguedad.

Propuesta: conservar historia y agregar IDs con espacio de nombres. Marcar alias duplicados. Ningun selector usa un numero sin tipo.

### D3. `SourceAuthorityEpoch/v1`

Opciones:

- Retener `05b7d98` y repetir T370–T377 contra esa revision.
- Promover `4aa0ba38` despues de revisar los 51 commits y 34 archivos.
- Permitir un pin distinto por ticket sin epoca comun.

Propuesta: declarar `05b7d98` como epoca previa y `4aa0ba38` como candidata. Promoverla solo despues de clasificar los archivos y funciones que afectan los claims actuales. Cada artefacto guarda `sourceEpochId` y SHA.

Tradeoff: la revision semantica cuesta trabajo ahora y evita comparar oracles de fuentes distintas mas tarde.

### D4. `GroupedEvidenceCheckpoint/v1`

Opciones:

- Suite completa por microcorte: costo alto.
- Solo pruebas focales hasta el final: riesgo acumulado alto.
- Lote por umbral: ejecutar gate global ante cambio de pin, cambio de limite, seis microcortes o antes de un claim de release.

Propuesta: lote por umbral. T370–T377 ya superan el umbral y requieren un checkpoint exacto de T377.

### D5. `RedirectCapabilityMatrix/v1`

La matriz debe usar estas dimensiones: controlador, caller root/Helper/anidado, destino root/Helper, activo/reserva, orden temprano/tardio, pausa/hitpause, reset, varios writers, identidad/generacion, revision de fuente y nivel de gate.

Alternativa: seguir con tickets aislados. Esa via hace dificil ver celdas vacias y repite reglas de materializacion.

Propuesta: ningun nuevo ticket generico de `RedirectID` sin una celda elegida y una celda vecina de contraste.

### D6. `ActorReference/v1` y operaciones diferidas tipadas

Campos minimos: `playerId`, `generation`, `kind`, `rootId`, `callerRef`, `targetRef`, `scheduledTick`, `controller`, `sourceEpochId` y payload inmutable.

Opciones:

- Guardar closures con objetos resueltos: simple, dificil de auditar y revalidar.
- Guardar una operacion tipada y resolver ambos extremos al commit: mas codigo, mejor fallo cerrado y telemetria.

Propuesta: operacion tipada. El commit revalida caller, target, ancestry, generacion y fase. Un rechazo no muta estado y deja una razon estable.

### D7. `CollisionConstraintPlan/v1`

Separar cinco capas: estado authored, estado efectivo del actor, transform de proxy, geometria mundial y admision de contacto/push. `TransformClsn`, `OverrideClsn`, `ownclsnscale`, size, Width/Height/Depth, `PlayerPush` y `ScreenBound` deben compartir un oracle de geometria.

Alternativa: cada controlador escribe directo sobre la estructura final. Esa via mantiene menos tipos y aumenta la divergencia de orden y reset.

### D8. `FightScreenPresentationPlan/v1`

Mantener la prioridad del informe previo: parseo, plan inmutable, aplicacion de runtime y renderer. El primer fixture directo debe ser CC0 o creado en el repo. La matriz visual incluye desktop, mobile, estado final, consola, errores, foco, reduced motion y cambios de geometria.

T342 prueba navegacion de Studio. No cubre este gate de presentacion.

### D9. `MatchInputPolicySnapshot/v1`

El snapshot debe fijar SOCD, repeticion, hold, input fisico/logico, facing, slot, gamepad y tick efectivo. Los adaptadores producen eventos; la politica de match decide su sentido.

Alternativa: resolver facing y SOCD dentro de cada adaptador. Esa via duplica reglas y hace distintos teclado, gamepad y replay.

### D10. Planes globales para Turns y proyectiles

Turns: `preflight -> plan inmutable -> commit -> rollback`.
Proyectiles: `gather -> orden estable -> resolve -> commit`.

Ambos planes deben usar ActorRef y producir trazas de la secuencia. Un fallo antes del commit no cambia roster, recursos, estado 5900, efectos ni contactos.

### D11. `EvidenceSubject/v1` para Studio, scanner y activos

Identidad minima: proyecto, revision del proyecto, digest de fuentes, epoca de fuente, revision de analisis, revision de scanner, gate, artefactos y politica de activos.

IndexedDB puede guardar snapshot, journal y recibos dentro de una transaccion de sus object stores. Las escrituras del sistema de archivos requieren un journal aparte, nombres temporales, commit idempotente y recovery drill.

### D12. Capability matrix y limites modulares con fallo cerrado

Scanner: estados separados `recognized`, `parsed`, `lowered`, `executed` y `verified`. Ningun estado hereda el siguiente.

Modulos: un manifiesto marca cada raiz como requerida, opcional o futura. Falta de una raiz requerida falla el gate. Un claim de extraccion exige dos consumidores reales y un contrato versionado.

## Hallazgos de producto, scanner, activos y modulos

- `StudioEvidenceEnvelope` distingue evidencia ausente y vieja. `ProjectReleaseDecision` puede bloquear un release.
- La fila `Runtime playtest` de Build Readiness usa un estado `ok` fijo aunque la accion siguiente aun pide ejecutar el smoke. Esa fila no debe contar como prueba actual.
- `PackageAnalysis` ya usa v1 y fija la revision upstream. `IKEMEN_GO_REFERENCE.md` aun habla de v0.
- El scanner informa ruta y linea con techo `recognized-unsupported`. No guarda una fase separada por señal.
- Provenance v2 guarda digests, transformaciones y enlaces QA. La decision de release no guarda aun la revision de politica ni el digest canonico completo del provenance.
- `qa_asset_path_hygiene.cjs` prueba permiso, licencia y digests para Nova. Mira y Rook no tienen el mismo registro de permiso. Nova sigue siendo el unico activo con decision positiva demostrada.
- `EvidenceEnvelope` vive bajo `src/app` e importa `PackageAnalysisV1Result`. No hay un contrato central con un segundo consumidor fuera del dominio de pelea.
- `App.ts` concentra persistencia, evidencia, release y UI. Los primeros cortes deben extraer servicios puros sin reescribir la interfaz.

## Roadmap restante por fases

### Fase 0 — Restablecer autoridad y evidencia

Dependencias: ninguna.
Tareas: DA22-01 a DA22-07.

Resultado: un SHA con gate global, un cursor unico, IDs sin ambiguedad, una epoca de fuente y una matriz que muestre celdas probadas y vacias. Esta fase no mueve puntajes.

### Fase 1 — Consolidar identidad, redirecciones y geometria

Dependencias: Fase 0.
Tareas: DA22-08 a DA22-12.

Resultado: referencias de actor con generacion, colas diferidas tipadas, orden de destino y un oracle comun de colision y restricciones. Los claims quedan limitados a las celdas ejecutadas.

### Fase 2 — Cerrar el camino visible del sandbox

Dependencias: DA22-01, DA22-06 y DA22-10.
Tareas: DA22-13 a DA22-15.

Resultado: FightScreen directo y Common.Fx en un viaje redistribuible, mas input reproducible en teclado y gamepad. Esta fase puede mejorar la prueba del sandbox. Requiere una adjudicacion aparte para cambiar puntajes.

### Fase 3 — Orden determinista de match

Dependencias: ActorRef, fuente y checkpoint global.
Tareas: DA22-16 a DA22-19.

Resultado: Turns atomico y un calendario global de proyectiles con gather, orden, resolve y commit.

### Fase 4 — Corpus y adjudicacion MUGEN-lite

Dependencias: Fases 2 y 3.
Tareas: DA22-20 a DA22-22.

Resultado: corpus v1.2 ligado al HEAD, segundo personaje legal independiente y decision escrita sobre puntajes.

### Fase 5 — Studio, scanner y activos

Dependencias: cursor, autoridad de fuente y corpus.
Tareas: DA22-23 a DA22-28.

Resultado: evidencia ligada al sujeto, historial de analisis, escritura recuperable, scanner por capacidad, politica de activos versionada y un proyecto minimo que pueda cerrar su gate local.

### Fase 6 — Limites y extraccion modular

Dependencias: dos consumidores reales de evidencia.
Tareas: DA22-29 y DA22-30.

Resultado: boundaries que fallen cuando falta una raiz requerida y un servicio central usado por pelea y activos. No habilita un claim de motor generico.

### Fase 7 — MUGEN amplio

Dependencias: Fases 0–6 y nueva adjudicacion.

Epicas posteriores:

1. Completar AST/IR, expresiones, redirects y controladores con corpus real por familia.
2. Cerrar Common1, throws, custom states, HitOverride, target lifecycle y orden de tick.
3. Completar screenpack, lifebar, paletas, fuentes, audio, FightFX y transforms por `localcoord`.
4. Agregar personajes, escenarios y screenpacks redistribuibles con denominador publico.
5. Probar rutas desktop/mobile, rendimiento, accesibilidad, recovery y export.

### Fase 8 — IKEMEN amplio

Dependencias: MUGEN amplio y epoca de fuente estable.

Epicas posteriores:

1. Simul, Tag y Turns con roster plural, input/AI de reserva y recursos por lado.
2. Helpers y proyectiles plurales, CharList, root/helper ancestry y ocho actores.
3. ZSS, Lua y modulos con scanner, parser, ejecucion y evidencia separados.
4. Motif, equipos, launchFight, hooks y extensiones de configuracion.
5. Rollback, replay, determinismo de red y netplay. Cada claim requiere pruebas de dos pares y recuperacion de desync.

## Proximas 30 tareas listas para ejecucion

### DA22-01 — Checkpoint global exacto de T377

- Alcance: ejecutar los gates amplios en `3e96edea`. Si el branch avanzo, conservar primero ese resultado y repetir en el nuevo SHA antes de heredar el claim.
- Sistemas probables: Vitest, TypeScript 7, build Vite, `qa:trace`, boundaries y control de diff.
- Dependencias: ninguna.
- Aceptacion: todos los gates terminan en cero; el manifiesto de trazas cuadra requeridos y opcionales; el reporte usa el SHA exacto.
- Evidencia: logs completos, conteos, hashes, `git status` y un reporte que distingue focal, global y browser.
- Claim permitido: regresion global verde para ese SHA. Claims bloqueados: paridad, browser, release y puntaje.
- Riesgo: las fallas del delta historico de whitespace no deben ocultar una falla nueva del write-set.

### DA22-02 — Publicar `RoadmapCursor/v1`

- Alcance: definir un registro con HEAD, rama, arbol, ultimo Wayfinder focal, ultimo checkpoint global, ultimo visual, Entry formal, puntajes y fuentes de cada campo.
- Archivos probables: `docs/evidence/`, documentos `ROADMAP_*` y un verificador de solo lectura.
- Dependencias: DA22-01.
- Aceptacion: un fixture desfasado falla; todos los selectores muestran el mismo cursor; cada campo liga SHA y artefacto.
- Evidencia: esquema, fixture valido, fixture invalido y salida del verificador.
- Claim permitido: estado operativo del corte. Claim bloqueado: progreso funcional por editar documentos.

### DA22-03 — Dar identidad estable al backlog

- Alcance: conservar `Entry`, Wayfinder y auditorias, agregar un espacio de nombres y marcar alias numericos repetidos.
- Archivos probables: `BUILD_EXECUTION_BACKLOG.md`, `ROADMAP_PROGRESS_SYSTEM.md`, navegacion y continuidad.
- Dependencias: DA22-02.
- Aceptacion: ningun selector usa un numero sin tipo; enlaces viejos siguen resolviendo; una regla determinista encuentra el ultimo evento.
- Evidencia: tabla de migracion, busqueda de duplicados y prueba del selector.
- Claim permitido: secuencia documental sin ambiguedad. Claim bloqueado: renumeracion de historia.

### DA22-04 — Reconciliar documentos e issues

- Alcance: actualizar las cabeceras activas y los overrides de `.scratch/roadmap/issues/`; conservar las secciones viejas como historia.
- Archivos probables: `ROADMAP_EXECUTION_BOARD.md`, `ROADMAP_PACKAGE_MILESTONES.md`, `NEXT_BUILD_ROADMAP.md`, `DELIVERY_ROADMAP.md`, scorecard, tracker, workplan e issues 01–07.
- Dependencias: DA22-02 y DA22-03.
- Aceptacion: T377 figura como focal, T369 como global, T342 como visual; T288 queda historico; estado y etiqueta de cada issue coinciden.
- Evidencia: verificador de cursor, busquedas negativas de selectores activos viejos y `git diff --check`.
- Claim permitido: cola coherente. Claim bloqueado: cierre de gates que no corrieron.

### DA22-05 — ADR de `SourceAuthorityEpoch/v1`

- Alcance: decidir el papel de `05b7d98` y `4aa0ba38`, el proceso de promocion y el techo de claims durante una migracion.
- Archivos probables: nuevo ADR, `ARCHITECTURE.md`, issue 07 y guia de fuente.
- Dependencias: DA22-02.
- Aceptacion: alternativas, costo, rollback, regla de pin por artefacto y responsable de adjudicacion quedan escritos.
- Evidencia: enlaces oficiales inmutables y revision por funciones usadas en T340–T377.
- Claim permitido: provenance de las dos epocas. Claim bloqueado: equivalencia semantica antes de DA22-06.

### DA22-06 — `SourceAuthorityManifest/v1` y delta semantico

- Alcance: registrar ambas revisiones, archivos, digests y funciones; clasificar el delta que afecta controller compile/runtime, char lifecycle, colision, equipos y scanner.
- Archivos probables: `docs/evidence/source-authority-manifest-v1.json`, informe de investigacion y `PackageAnalysis`.
- Dependencias: DA22-05.
- Aceptacion: los 51 commits y 34 archivos tienen clase de impacto; T370–T377 apuntan a una epoca; tamper de SHA o digest falla.
- Evidencia: manifiesto canonico, diff oficial, hashes de blobs y casos changed/same/unknown.
- Claim permitido: semantica revisada solo en funciones clasificadas. Claim bloqueado: paridad de la revision completa.

### DA22-07 — Materializar `RedirectCapabilityMatrix/v1`

- Alcance: cargar T340–T377 en una matriz por controlador, caller, destino, fase, orden, reset, pausa, generacion, source epoch y gate.
- Archivos probables: `docs/evidence/`, tickets Wayfinder y backlog.
- Dependencias: DA22-01 y DA22-06.
- Aceptacion: cada ticket ocupa celdas exactas; celdas inferidas quedan vacias; la proxima tarea se elige por riesgo y contraste.
- Evidencia: matriz validada contra tickets, trazas y conteos de cobertura.
- Claim permitido: cobertura por celda. Claim bloqueado: soporte general de `RedirectID`.

### DA22-08 — `ActorReference/v1` y cola diferida tipada

- Alcance: reemplazar closures nuevas de restricciones root por operaciones inmutables con caller y target ligados a identidad y generacion.
- Sistemas probables: `PlayableMatchRuntime`, `HelperSystem`, tipos de actor y telemetria.
- Dependencias: DA22-06 y DA22-07.
- Aceptacion: el commit revalida ambos extremos; actor muerto, reciclado, disabled o de otra ancestry se rechaza sin mutacion.
- Evidencia: pruebas para generacion vieja, caller viejo, target viejo, cross-root y cola vacia tras error.
- Claim permitido: fallo cerrado en los controladores migrados. Claim bloqueado: todos los destinos hasta migrar cada familia.

### DA22-09 — Orden exacto de destinos y redirecciones recursivas

- Alcance: fijar `id`, `index`, orden de multiples destinos, caller temprano/tardio y una redireccion recursiva acotada.
- Sistemas probables: resolucion de targets, leases, `RuntimeMatchHelperProjectileTargetSystem` y parser de redirects.
- Dependencias: DA22-08.
- Aceptacion: fixtures oficiales o sinteticos prueban orden en ambas direcciones, actor ausente y PlayerID reutilizado.
- Evidencia: trazas con lista candidata, seleccion final y razon de rechazo.
- Claim permitido: orden en la matriz cubierta. Claim bloqueado: seleccion global fuera de esas celdas.

### DA22-10 — `CollisionConstraintPlan/v1` y oracle de geometria

- Alcance: definir estado authored, efectivo, proxy, mundo y admision; unir `clsnproxy`, escala, transform, override, size, push y bounds.
- Sistemas probables: `HelperSystem`, colision, `ProjectileCombatSystem`, player push y renderer de depuracion.
- Dependencias: DA22-06 y DA22-08.
- Aceptacion: una fixture produce la misma geometria numerica en telemetria, admission y overlay; reset y redirect usan el mismo plan.
- Evidencia: snapshots de cajas, puntos, escala, angulo, owner y target; contraste sin proxy.
- Claim permitido: geometria de la fixture. Claim bloqueado: paridad visual o fisica amplia.

### DA22-11 — Lifecycle de restricciones root

- Alcance: probar target anterior/posterior, reserva, varios writers, `time 0/1`, pausa, hitpause, reset de ronda y excepcion durante flush.
- Sistemas probables: `deferredRootConstraintRedirects`, fases de tick y CharList.
- Dependencias: DA22-08 y DA22-10.
- Aceptacion: una tabla fija el orden; un fallo no deja mutacion parcial ni cola; cada writer registra resultado.
- Evidencia: pruebas por celda y trazas de schedule/validate/commit/reject.
- Claim permitido: orden local de esas restricciones. Claim bloqueado: orden completo del engine.

### DA22-12 — Destino Helper y Helper anidado

- Alcance: aplicar la misma prueba de ancestry a caller y destino; elegir una sola celda nested de alto riesgo para cerrar.
- Sistemas probables: `verifiedRootForHelper`, resolucion `RedirectID` y `HelperSystem`.
- Dependencias: DA22-08, DA22-09 y DA22-11.
- Aceptacion: destino valido, parent ausente, ciclo, cross-root, generacion vieja y nested valido tienen resultados fijos.
- Evidencia: pruebas focales, una traza requerida y checkpoint agrupado si se supera el umbral.
- Claim permitido: esa ruta nested. Claim bloqueado: expansion generica a todos los controladores.

### DA22-13 — Fixture CC0 directo de FightScreen

- Alcance: crear un paquete minimo legal que use `fight.def`, FightFX, fuentes, anuncios, tiempos, shutter, skip y reset sin copiar activos de terceros.
- Sistemas probables: `MugenSystemAssetsLoader`, `FightScreenAnimationSemantics`, runtime y renderers FightScreen.
- Dependencias: DA22-01 y DA22-06.
- Aceptacion: carga directa desde carpeta, ruta negativa clara, licencia y digests; el viaje llega a un estado final estable.
- Evidencia: manifiesto de provenance, traza requerida, captura de estado y prueba de ausencia de assets externos.
- Claim permitido: fixture directo redistribuible. Claim bloqueado: screenpack general.

### DA22-14 — Matriz visual de FightScreen y Common.Fx

- Alcance: ejecutar el fixture en desktop y mobile; incluir FightScreen, Common.Fx, geometria T343–T377, foco y reduced motion.
- Sistemas probables: smoke de navegador, `FightScreenAnnouncementRenderer`, `FightScreenFontRenderer` y debug overlay.
- Dependencias: DA22-10 y DA22-13.
- Aceptacion: layout cabe, estados final y de error son legibles, cero errores de pagina/consola, foco visible y reduced motion estable.
- Evidencia: capturas con geometria, DOM, consola, errores, viewport y revision del fixture.
- Claim permitido: viaje visual probado en esas vistas. Claim bloqueado: paridad de pixeles con MUGEN/Ikemen.

### DA22-15 — `MatchInputPolicySnapshot/v1` y matriz de dispositivos

- Alcance: fijar SOCD, hold/repeat, fisico/logico, facing, slot y tick; implementar el mismo contrato en teclado, gamepad y replay.
- Sistemas probables: `RuntimeMatchInputControlSystem`, `GamepadInputAdapter`, buffers y configuracion de match.
- Dependencias: DA22-01.
- Aceptacion: secuencias identicas producen decisiones identicas; cambio de facing no cambia el evento fisico guardado; desconexion tiene feedback.
- Evidencia: pruebas por dispositivo, navegador con gamepad simulado o real y replay determinista.
- Claim permitido: politica de input cubierta. Claim bloqueado: soporte de todo gamepad o plataforma.

### DA22-16 — Plan inmutable de Turns

- Alcance: calcular roster, entrante, posiciones, estado, recursos, efectos y state 5900 sin mutar el match.
- Sistemas probables: `RuntimeTurnsContinuationSystem`, `RuntimeTurnsRecoverySystem` y `PlayableMatchRuntime`.
- Dependencias: DA22-08 y DA22-15.
- Aceptacion: preflight puro; misma entrada produce mismo plan; falta de actor o recurso devuelve un error tipado.
- Evidencia: snapshots del plan y pruebas de pureza.
- Claim permitido: decision de continuacion acotada. Claim bloqueado: commit atomico hasta DA22-17.

### DA22-17 — Commit y rollback atomicos de Turns

- Alcance: aplicar el plan de DA22-16 en una transaccion de runtime con snapshot y rollback.
- Sistemas probables: roster, recursos, state 5900, efectos, targets y round state.
- Dependencias: DA22-16.
- Aceptacion: un fallo inyectado en cada paso restaura un snapshot identico; un exito deja un recibo completo.
- Evidencia: pruebas de fault injection, checksums antes/despues y traza de commit.
- Claim permitido: transicion atomica de la fixture. Claim bloqueado: lifecycle completo de equipos.

### DA22-18 — Viaje Turns 1–2–3

- Alcance: ejecutar tres miembros con KO, handoff, reset, recursos, HUD, input y final de match.
- Sistemas probables: teams, round, HUD, input y browser smoke.
- Dependencias: DA22-14, DA22-15 y DA22-17.
- Aceptacion: tres transiciones sin residuos; cada miembro recibe input correcto; el resultado final coincide con la traza.
- Evidencia: traza requerida, capturas, consola y checksums de roster/recursos.
- Claim permitido: viaje Turns concreto. Claim bloqueado: Simul, Tag y equipos generales.

### DA22-19 — Calendario global de proyectiles

- Alcance: reunir intents de roots y Helpers, ordenar por tick/actor/seq, resolver contactos y cancelar o comprometer en una fase global.
- Sistemas probables: `ProjectileSystem`, `ProjectileCombatSystem`, target systems y effect stores.
- Dependencias: DA22-08, DA22-09 y DA22-10.
- Aceptacion: dos owners y un Helper crean/contactan/cancelan en el mismo tick con orden estable; actor viejo no recibe commit.
- Evidencia: pruebas con insercion invertida, trazas de gather/order/resolve/commit y checksum final.
- Claim permitido: orden global de las fixtures. Claim bloqueado: todos los casos de proyectil.

### DA22-20 — `CompatibilityCorpus/v1.2`

- Alcance: regenerar el snapshot en un SHA con gate global; actualizar los ocho hashes, rutas, edad, claims y politica optional/unavailable.
- Sistemas probables: `docs/evidence/compatibility-corpus-snapshot-v1.json`, smoke y trazas.
- Dependencias: DA22-01, DA22-14, DA22-18 y DA22-19.
- Aceptacion: revision igual al HEAD, cero hash distinto, rutas legales visibles y diagnostico claro si falta un fixture privado.
- Evidencia: snapshot canonico, hashes y verificador de tamper/frescura.
- Claim permitido: denominador reproducible v1.2. Claim bloqueado: subir puntaje sin DA22-22.

### DA22-21 — Segundo personaje legal independiente

- Alcance: crear o adoptar un personaje CC0 con estructura y rutas distintas al primer fixture; registrar fuente y transformaciones.
- Sistemas probables: loader, Common1, VM, combate, presentacion y corpus.
- Dependencias: DA22-13, DA22-15 y DA22-20.
- Aceptacion: import, match, hit/guard, KO y una ruta propia pasan sin adaptador especifico por personaje.
- Evidencia: licencia, digests, trazas, capturas y contraste de capacidades.
- Claim permitido: dos personajes legales nombrados. Claim bloqueado: compatibilidad amplia de personajes.

### DA22-22 — Adjudicacion de puntajes

- Alcance: aplicar criterios escritos por banda a corpus v1.2, dos personajes y gates de usuario; separar Studio 25 y modular 10 en el detalle.
- Archivos probables: scorecard, informe de adjudicacion y cursor.
- Dependencias: DA22-20 y DA22-21.
- Aceptacion: cada punto cita evidencia y denominador; cada rechazo nombra el gate faltante; documentacion sola vale cero.
- Evidencia: tabla criterio/evidencia/decision y revision independiente.
- Claim permitido: solo los puntajes adjudicados. Claim bloqueado: extrapolar a MUGEN o IKEMEN completo.

### DA22-23 — `EvidenceSubject/v1`

- Alcance: unir proyecto, revision, digests de fuente, source epoch, analisis, scanner, gates y politica de activos.
- Sistemas probables: `StudioEvidenceEnvelope`, `StudioGateEvidence`, `PackageAnalysis` y release decision.
- Dependencias: DA22-02, DA22-06 y DA22-20.
- Aceptacion: cambiar cualquier identidad marca evidencia vieja; un estado `ok` fijo no puede satisfacer el gate.
- Evidencia: pruebas missing/stale/pass/tamper y export de diagnostico.
- Claim permitido: evidencia ligada a un sujeto. Claim bloqueado: release hasta cerrar escritura y activos.

### DA22-24 — `StudioProjectSnapshot/v1` y reanalisis

- Alcance: guardar revisiones inmutables de proyecto y `PackageAnalysis`; calcular diff de señales entre revisiones.
- Sistemas probables: IndexedDB, `StudioEvidenceStorage`, `StudioCompatibilitySnapshot` y scanner.
- Dependencias: DA22-23.
- Aceptacion: guardar, cerrar, reabrir, cambiar fuente y reanalizar conserva historia; diff lista altas, bajas y cambios.
- Evidencia: pruebas de almacenamiento, tamper y browser con reapertura.
- Claim permitido: historia local reproducible. Claim bloqueado: paridad semantica.

### DA22-25 — `SourceWriteJournal/v1` y recuperacion

- Alcance: coordinar cambios IndexedDB y sistema de archivos con intents, temporales, commit idempotente, recibos y recovery.
- Sistemas probables: `StudioSourceTransaction`, `StudioSourceWrite`, handles, autosave y storage.
- Dependencias: DA22-23 y DA22-24.
- Aceptacion: permiso denegado, cierre de pestaña, error de escritura y reload dejan estado recuperable; repetir recovery no duplica cambios.
- Evidencia: fault injection, drill de navegador y journal antes/despues.
- Claim permitido: recuperacion de casos probados. Claim bloqueado: atomicidad comun nativa entre IndexedDB y archivos.

### DA22-26 — Matriz de capacidad del scanner

- Alcance: versionar cada señal como `recognized`, `parsed`, `lowered`, `executed` o `verified`; ligar fuente y evidencia.
- Sistemas probables: `IkemenFeatureScanner`, `PackageAnalysis`, UI y export.
- Dependencias: DA22-06, DA22-23 y DA22-24.
- Aceptacion: toda señal inicia en `recognized`; ninguna fase se infiere; corpus dorado y UI/export coinciden.
- Evidencia: fixtures por fase, diff de revisiones y caso de downgrade.
- Claim permitido: capacidad por señal. Claim bloqueado: soporte IKEMEN global.

### DA22-27 — Verificador general y `AssetReleasePolicy/v1`

- Alcance: descubrir registros de activos, validar IDs, rutas, permisos, licencia, digests, transformaciones, QA, colision y playtest; ligar revision de politica y proyecto.
- Sistemas probables: provenance v2, release policy, script de hygiene y canonicalizacion JSON.
- Dependencias: DA22-23 y DA22-25.
- Aceptacion: Nova sigue pasando; ID repetido, traversal, digest roto, regla cambiada o proyecto distinto bloquean.
- Evidencia: fixtures positivos/negativos, reporte por activo y tamper.
- Claim permitido: mecanismo general de revision. Claim bloqueado: aprobacion legal automatica.

### DA22-28 — Segundo activo y proyecto minimo releaseable

- Alcance: crear un segundo activo propio o generado, guardar su provenance y cerrar un proyecto local con ambos activos.
- Sistemas probables: asset registry, release decision, Studio Build y export.
- Dependencias: DA22-24, DA22-25 y DA22-27.
- Aceptacion: guardar, cerrar, reabrir, analizar, obtener `canRelease: true`, exportar y bloquear un caso con revision vieja.
- Evidencia: recibos, digests, licencia/permiso, browser, bundle y caso negativo.
- Claim permitido: un fixture local releaseable y dos activos nombrados. Claim bloqueado: producto listo para publicacion.

### DA22-29 — Boundaries con fallo cerrado

- Alcance: declarar raices `required`, `optional` o `planned`; fallar si falta una requerida; excluir planned del claim.
- Sistemas probables: `check_boundaries.cjs`, `ArchitectureBoundaries.test.ts` y contratos de modulo.
- Dependencias: DA22-02.
- Aceptacion: raiz requerida ausente falla; raiz planned produce pendiente; imports y terminos prohibidos tienen fixtures negativos.
- Evidencia: matriz de raices y pruebas que fallan antes del arreglo.
- Claim permitido: limites de las raices revisadas. Claim bloqueado: aislamiento de platformer o core ausente.

### DA22-30 — Extraer evidencia central con dos consumidores

- Alcance: mover hechos genericos de `EvidenceEnvelope` a un servicio puro; mantener adaptadores de MUGEN y activos por dominio.
- Sistemas probables: nuevo `src/core/evidence`, app, `PackageAnalysis` y asset release.
- Dependencias: DA22-26, DA22-27 y DA22-29.
- Aceptacion: core no importa app ni MUGEN; pelea y activos consumen el contrato; borrar un adaptador no rompe el otro.
- Evidencia: grafo de imports, tests de contrato, build enfocado y boundary gate.
- Claim permitido: un contrato central con dos consumidores. Claims bloqueados: motor generico, SDK modular y platformer.

## Orden recomendado inmediato

1. DA22-01: checkpoint global T377.
2. DA22-02 a DA22-04: cursor, IDs y reconciliacion.
3. DA22-05 y DA22-06: epoca y manifiesto de fuente.
4. DA22-07: matriz de redirecciones.
5. DA22-08 a DA22-12: identidad, colas y geometria.
6. DA22-13 a DA22-15: FightScreen, Common.Fx e input.
7. DA22-16 a DA22-22: Turns, proyectiles, corpus, segundo personaje y adjudicacion.
8. DA22-23 a DA22-30: Studio, scanner, activos y limites.

## Riesgos y controles

| Riesgo | Probabilidad/impacto | Control |
| --- | --- | --- |
| Heredar T369 a T377 | Alta/alta | Cursor y checkpoint exacto |
| Mezclar dos revisiones Ikemen | Alta/alta | Source epoch y manifest v1 |
| Closure diferida conserva target viejo | Media/alta | ActorRef y revalidacion al commit |
| Destino Helper sin ancestry equivalente | Media/alta | DA22-12 |
| Microcortes ocultan celdas vacias | Alta/media | Matriz y umbral de checkpoint |
| Geometria interna diverge del overlay | Media/alta | CollisionConstraintPlan y browser |
| Turns deja estado parcial | Media/alta | Plan, fault injection y rollback |
| Orden de proyectil depende de insercion | Media/alta | Scheduler global |
| Corpus o Studio dicen `passed` para otro SHA | Alta/alta | EvidenceSubject y frescura por revision |
| Fila de playtest muestra verde fijo | Alta/media | Derivar estado de evidencia real |
| Asset gate solo prueba Nova | Alta/media | Verificador general y segundo activo |
| Scanner confunde reconocimiento con soporte | Alta/alta | Capability matrix |
| Boundary pasa con raices ausentes | Alta/alta | Manifiesto required/planned |
| Extraccion grande desde `App.ts` | Media/alta | Servicios puros pequeños y dos consumidores |

## Fuentes oficiales consultadas

### Ikemen GO

- [Repositorio oficial de Ikemen GO](https://github.com/ikemen-engine/Ikemen-GO). El proyecto declara soporte de recursos MUGEN y una meta de compatibilidad con MUGEN 1.1 Beta. Esa meta externa no prueba este port.
- [Revision normativa previa `05b7d98`](https://github.com/ikemen-engine/Ikemen-GO/commit/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703).
- [Revision usada por T370–T377 `4aa0ba38`](https://github.com/ikemen-engine/Ikemen-GO/commit/4aa0ba38f851c52549ba182310e9e53361cd472a).
- [Comparacion oficial `05b7d98...4aa0ba38`](https://github.com/ikemen-engine/Ikemen-GO/compare/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703...4aa0ba38f851c52549ba182310e9e53361cd472a). GitHub informa 51 commits y 34 archivos cambiados.
- [`HitBy`/`NotHitBy` en compiler_functions.go](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L112-L129) y [bytecode.go](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L4929-L5007). Estas lineas respaldan la investigacion de T377; no resuelven por si solas lifecycle local.
- [`PosFreeze` en compiler_functions.go](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3311-L3328), [bytecode.go](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10227-L10250) y [char.go](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L9690-L9712). Estas lineas respaldan la forma del controlador y su uso upstream.

### Estandares y Three.js

- [Indexed Database API 3.0](https://www.w3.org/TR/IndexedDB-3/). La norma define object stores, transacciones, commit y abort. Sustenta el snapshot y journal dentro de IndexedDB.
- [File System Access](https://wicg.github.io/file-system-access/). El borrador define permisos `read`/`readwrite`, handles y escrituras. No ofrece una transaccion comun con IndexedDB; el plan usa recovery explicito.
- [RFC 8785, JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785). Define JSON canonico con orden determinista para producir representaciones hashables.
- [Three.js `Object3D.renderOrder`](https://threejs.org/docs/pages/Object3D.html#Object3D.renderOrder). Three.js permite cambiar orden de dibujo, pero mantiene ordenes separados para objetos opacos y transparentes. El runtime no debe usar este campo como orden de simulacion.

## Incertidumbre y efecto en decisiones

- La comparacion de fuente prueba magnitud y archivos. Aun falta clasificar sentido por funcion. Por eso D3 bloquea la promocion automatica.
- La cola de closures y la validacion asimetrica son lecturas estaticas. DA22-08, DA22-11 y DA22-12 deben confirmar o refutar el riesgo con tests.
- IndexedDB y File System Access tienen limites distintos. El plan promete recuperacion en casos probados y evita prometer atomicidad comun.
- El estado visual de T343–T377 no se observo en navegador. DA22-14 mantiene bloqueados los claims visuales.

## Resultado

Esta auditoria agrega plan y evidencia documental. No cambia comportamiento, gates ni puntajes.

## NO CODE CHANGED

Esta auditoria no modifico codigo, runtime, UI ni pruebas. No se ejecuto ninguna suite de codigo. No se creo commit ni se hizo push. Los cambios concurrentes de T378 que figuran en el arbol quedan intactos y fuera del corte auditado.
