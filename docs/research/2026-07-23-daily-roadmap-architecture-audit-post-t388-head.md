# Auditoría diaria de roadmap y arquitectura después de T388

Fecha: 2026-07-23
Tipo: investigación, arquitectura y roadmap
Estado: propuesta; no cambia gates ni puntajes
Corte auditado: 188c4462caac9c7602513214a31afb22340d224f
Último cierre focal: T388 en b245afb08027095650fd9b892edd3dc7dff2a0b4

## Pregunta

¿Qué trabajo queda, qué riesgo debe bajar primero y qué prueba exige cada fase para avanzar desde el árbol actual hacia el sandbox, MUGEN-lite, MUGEN, IKEMEN, Studio, assets, scanner y un motor modular?

## Respuesta corta

El frente focal avanzó 23 commits desde la auditoría del 22 de julio. T384–T388 amplían ModifyReversalDef con estado de P2, dueño de estado, filtros de guardia y prioridad de sprites. El último gate global está en T383. El último gate visual sigue en T342. Los puntajes quedan en 65 / 36 / 20 / 10–12 / 6–8 / 25.

HEAD agrega ReversalDef missonoverride después de T388, pero no tiene ticket, reporte ni cierre. La revisión estática halló una contradicción de topología con ambos pins de Ikemen GO: el código local busca HitOverride en el actor que ejecuta ReversalDef; Ikemen recorre los slots del atacante contrarrestado. Los tests nuevos colocan HitOverride y ReversalDef en el mismo actor, por lo que no distinguen los dos papeles. Ese punto pasa a P0 y bloquea un cierre global del HEAD.

La división de fuente sigue abierta. El manifiesto fija 05b7d98 y los cortes recientes citan 4aa0ba38. La comparación oficial tiene 51 commits y 34 archivos. Las líneas ligadas a missonoverride, ModifyReversalDef, guardflag y prioridades de sprite son iguales en compiler_functions.go, bytecode.go y char.go entre ambos pins. Esto permite clasificar la familia ReversalDef de forma acotada. Otros cambios sí afectan push, rondas, Turns, estado y rollback, por lo que una promoción global del pin sigue bloqueada.

## Límite de esta auditoría

- No se ejecutó ninguna suite de código.
- No se cambió runtime, UI, tests ni assets.
- Los gates citados provienen de reportes y artefactos guardados.
- La revisión de HEAD es estática y usa fuente oficial fijada.
- El documento propone trabajo. No convierte una propuesta en conducta probada.
- No se hizo commit ni push.

## Cambio desde la ejecución anterior

| Cursor | 2026-07-22 | 2026-07-23 | Lectura |
| --- | --- | --- | --- |
| HEAD auditado | 3e96edea / T377 | 188c4462 / post-T388 sin cierre | 23 commits |
| Último cierre focal | T377 | T388 en b245afb0 | Avance focal |
| Último gate global | T369 | T383 en 38d62678 | 11 commits detrás de HEAD |
| Último gate visual | T342 en 1085badb | T342 en 1085badb | 119 commits detrás |
| Backlog formal | Entry 562 | Entry 573 | Selectores viejos aún siguen en varios docs |
| Rama | master, 33 delante de origin | master, 56 delante de origin | Estado local; no se publicó |
| Puntajes | 65 / 36 / 20 / 10–12 / 6–8 / 25 | Sin cambio | Los docs no suman |

### Delta focal demostrado

| Tramo | Capacidad acotada | Mejor evidencia guardada |
| --- | --- | --- |
| T378–T383 | Redirecciones root para colisión, ReversalDef, HitOverride, HitDef, ModifyHitDef y núcleo de ModifyReversalDef | Checkpoint T383: TypeScript 7, 241 archivos / 2706 tests, 650 trazas, build de 329 módulos y límites |
| T384 | ModifyReversalDef p2stateno por RedirectID | 7 archivos / 1057 tests focales |
| T385 | ModifyReversalDef p2getp1state por RedirectID | 7 archivos / 1057 tests focales |
| T386–T387 | reversal.guardflag y reversal.guardflag.not | 5 archivos / 1049 tests focales |
| T388 | p1sprpriority y p2sprpriority | 5 archivos / 1052 tests focales y typecheck |
| HEAD post-T388 | missonoverride en ReversalDef | Commit con 11 archivos y 344 líneas; sin cierre, con contradicción estática P0 |

### Disposición del plan DA22

- DA22-01 queda superada en parte por el checkpoint global T383. Hace falta un nuevo gate global después de resolver el P0 de HEAD.
- DA22-02 a DA22-04 siguen abiertas: cursor, IDs y sincronización de control.
- DA22-05 y DA22-06 se refinan. La familia ReversalDef puede recibir una revisión semántica acotada; la época completa sigue abierta.
- DA22-07 a DA22-12 siguen abiertas. El lease genérico ya existe; la cola diferida de restricciones aún usa cierres crudos.
- DA22-13 a DA22-30 siguen abiertas. No hubo avance en FightScreen visual, gamepad, Turns atómico, orden global de proyectiles, corpus, Studio, scanner, segundo asset ni límites no vacíos.
- EvidenceEnvelope, SourceWriteReceipt con compensación, ProjectReleaseDecision, export semántico, navegación Trust Chain, Package Analysis en Studio/ZIP y recuperación básica ya existen. Las tareas nuevas deben extenderlos.

## Verdad de evidencia

### Hechos verificados

1. HEAD es 188c4462 y está 23 commits después del corte del 22 de julio.
2. T388 en b245afb0 es el último cierre focal. Entry 573 es la última entrada formal.
3. El checkpoint global T383 en 38d62678 está 11 commits detrás de HEAD.
4. El checkpoint visual T342 en 1085badb está 119 commits detrás de HEAD.
5. ROADMAP_PROGRESS_SYSTEM, ROADMAP_NAVIGATION, ROADMAP_PACKAGE_MILESTONES, NEXT_BUILD_ROADMAP, DELIVERY_ROADMAP, ROADMAP_CONTINUITY_GUIDE y PORT_COMPLETION_SCORECARD aún muestran T287/T288 en su selector principal.
6. Los issues 01–07 bajo .scratch/roadmap/issues aún usan el override post-T268 del 18 de julio.
7. En RuntimeCombatResolutionSystem, la rama ReversalDef consulta findRuntimeHitOverride sobre defender.runtime.
8. En esa rama local, defender ejecuta ReversalDef y attacker posee el HitDef entrante.
9. En Ikemen GO, hitResultCheck usa el HitDef de c y recorre getter.hover. En el contacto ReversalDef, c es el reversor y getter es el atacante contrarrestado.
10. Los tests nuevos colocan ReversalDef y HitOverride en el mismo actor. Esa figura no detecta un intercambio de papeles.
11. La regla upstream descrita en el punto 9 es igual en 05b7d98 y 4aa0ba38.
12. Las 18 líneas de tokens de compiler_functions.go, 24 de bytecode.go y 13 de char.go ligadas a missonoverride, ModifyReversalDef, guardflag y prioridades son iguales entre ambos pins.
13. La comparación oficial 05b7d98...4aa0ba38 informa 51 commits y 34 archivos.
14. Esa comparación sí cambia char.go, fightscreen.go, state.go y system.go en reglas de ancho cero, nombres de ronda/match, estado de escenario, estadísticas y rollback.
15. SourceAuthorityManifest/v0 está 233 commits detrás de HEAD, omite compiler_functions.go y fightscreen.go y mantiene semanticReview: unclassified.
16. CompatibilityCorpus/v1.1 está 358 commits detrás por sourceRevision. Cuatro de ocho hashes guardados no coinciden con los archivos actuales.
17. La validación de edad del corpus compara observedAt con referenceAt guardados. No evalúa la edad contra el reloj actual al leer el snapshot.
18. StudioGateEvidence/v0 apunta a d69d12a, 354 commits detrás de HEAD, y contiene un solo gate de límites.
19. La fila Runtime playtest en Studio fija status ok, state runnable y canExport true, aunque su acción pide ejecutar smoke.
20. T342 sigue siendo el último smoke visual. No hay viaje directo de navegador para fight.def, FightFX, FNT y AIR importados.
21. GamepadInputAdapter devuelve un conjunto vacío. La app inyecta teclado en el flujo actual.
22. RuntimeTurnsContinuationSystem prepara un plan, pero PlayableMatchRuntime confirma handoff, root activo, recursos y estado 5900 en pasos sin snapshot integral ni rollback.
23. Los proyectiles se resuelven por dueño y lado. No existe un plan global gather, sort, resolve y commit.
24. Package Analysis sólo usa recognized, unsupported y unknown. No separa recognized, parsed, lowered, executed y verified.
25. Una ruta común data/select.def se registra como señal de screenpack IKEMEN, con riesgo de falso positivo para paquetes MUGEN.
26. Nova Boxer sigue como único asset listo. El último gate visual guardado cuenta 1 ready y 9 diagnostic-only.
27. check_boundaries omite raíces ausentes. src/core, src/modules/platformer y src/platformer no existen.
28. src/engine contiene un solo archivo y ese archivo está en allowFiles. El gate puede pasar sin revisar contenido real de core o platformer.
29. EvidenceEnvelope tiene dos adaptadores productores, pero ambos alimentan el mismo flujo de Studio. Aún no hay dos consumidores de dominio independientes.
30. Los puntajes no tienen evidencia nueva que permita subirlos.

### Inferencias que requieren ejecución

1. HEAD puede invertir la topología de HitOverride en ReversalDef. La prueba mínima debe separar los roles y comparar ambos pins.
2. El match de HitOverride en esa rama también puede usar el payload equivocado: Ikemen compara contra campos heredados de ReversalDef; el código local usa el HitDef entrante.
3. El alcance de missonoverride queda incompleto para proyectiles y ReversalDef contra ReversalDef.
4. La cola deferredRootConstraintRedirects puede confirmar una operación sobre un actor viejo porque guarda cierres y no usa la revalidación del lease genérico.
5. El corpus puede aparecer válido después de vencer maxAgeHours porque la edad se fija en el documento.
6. Una falla después del handoff de Turns puede dejar roster, recursos, estado 5900 o efectos en un estado parcial.
7. El orden de proyectiles puede cambiar al invertir dueño o inserción local.
8. La fila fija de playtest puede dar una señal verde sin artefacto actual.

### Preguntas abiertas

1. ¿Qué campos heredados de HitDef debe conservar el modelo local de ReversalDef para resolver HitOverride?
2. ¿Qué regla usa Ikemen para ReversalDef contra Projectile y ReversalDef contra ReversalDef en cada valor de missonoverride?
3. ¿4aa0ba38 debe ser la nueva época normativa o una época candidata por familia?
4. ¿Qué raíces del motor se declaran required hoy y cuáles quedan planned?
5. ¿Qué segundo personaje y segundo asset propios aportan diversidad real sin copiar material externo?
6. ¿Qué parte de los datos de Studio queda en IndexedDB y qué parte queda en handles del sistema de archivos?

## Mapa de gaps por horizonte

| Horizonte | Demostrado | Gap actual | Próxima prueba | Claim permitido |
| --- | --- | --- | --- | --- |
| Sandbox jugable, 65 | Match local, HUD, stages propios, teclado, debug y Studio | HEAD sin cierre, P0 ReversalDef, gamepad vacío y prueba visual vieja | Matriz ReversalDef, gate global, gamepad y smoke actual | Sandbox local para rutas ya probadas |
| MUGEN-lite, 36 | Un viaje de personaje y un viaje de stage, ambos CC0 | Corpus vencido, 4 hashes distintos, FightScreen sin viaje directo y un solo personaje independiente | Corpus v1.2, FightScreen CC0 y segundo personaje | MVP acotado al corpus guardado |
| MUGEN 1.0/1.1 MVP, 20 | Loader, VM parcial, combate, Helper, Projectile, Common1 y presentación parcial | Topología ReversalDef, orden global, throws, custom states, input, equipos, screenpack y audio | Oracles de interacción, Turns y scheduler | Infra parcial sin paridad amplia |
| MUGEN completo, 10–12 | Base técnica y trazas | Cobertura de controladores, medios, timing, paquetes y familias reales | Corpus amplio por familias | Fundación local |
| IKEMEN, 6–8 | Perfil, scanner, Tag/Turns/Helper y RedirectID acotados | Época dividida, Simul/Tag/Turns exactos, ZSS, Lua, módulos, rollback y netplay | Fuente por familia, scanner por fases y orden global | Cortes nombrados por ticket |
| Studio/producto, 25 combinado | Workbench, source write, evidencia, build y export diagnóstico | Sujeto viejo, playtest fijo, historial, reanálisis, journal y prueba visual directa | EvidenceSubject, snapshots y recovery drill | Prototipo local |
| Assets/provenance | Nova con política local | 9 registros diagnósticos, política sin revisión y falta segundo asset | Policy v1 y segundo asset propio | Un asset nombrado |
| Scanner | I1 v1 en Studio y ZIP | Fases mezcladas, ID inestable y falso positivo de screenpack | Vector por señal y diff de reanálisis | Scanner diagnóstico |
| Modularización, 10 interno | Contratos y script de límites | Gate vacío, raíces ausentes y un flujo consumidor | Manifest de raíces y dos consumidores | Intención de separación |

## Mapa de gaps por sistema

| Sistema | Gap | Dependencia | Riesgo |
| --- | --- | --- | --- |
| Control | Cinco cursores viven en varios documentos | Gate global post-P0 | Claims heredados |
| Fuente | Dos pins sin época común | Revisión por familia | Oracles mezclados |
| ReversalDef | Actor y payload de HitOverride dudosos | Fuente fijada | Paridad falsa en HEAD |
| RedirectID | Cola diferida fuera del lease | Actor ref y fase | Escritura sobre actor viejo |
| Colisión | Varias rutas de geometría y reset | Plan común | Debug y admisión distintos |
| FightScreen | Falta fixture directo y smoke | Assets CC0 | Sin prueba de usuario |
| Input | Gamepad vacío y política dispersa | Snapshot por tick | Teclado, replay y pad divergen |
| Turns | Commit por pasos | Snapshot global | Estado parcial |
| Projectile | Orden por dueño | Scheduler | Resultado ligado a inserción |
| Corpus | Edad fija y hashes viejos | HEAD con gate global | Puntaje sin base actual |
| Studio | Sujeto débil y playtest fijo | EvidenceSubject | Verde para otra revisión |
| Persistencia | Última copia, sin historia | Snapshot y journal | Reanálisis no trazable |
| Scanner | Reconocer puede parecer ejecutar | Vector por fase | Falso claim IKEMEN |
| Assets | Una sola decisión lista | Policy v1 | Release de proyecto bloqueado |
| Módulos | Raíces faltantes se omiten | BoundaryManifest | Aislamiento sin contenido |

## Decisiones de arquitectura propuestas

### D1. RoadmapCursor/v1 y eventos con ID estable

Opciones:

- Mantener selectores manuales: bajo costo y alta deriva.
- Usar el número máximo del backlog: la secuencia actual contiene tipos y bloques distintos.
- Guardar HEAD, cierre focal, gate global, gate visual, entrada formal, puntajes y estado del árbol en un cursor con SHA.

Propuesta: tercera opción. Los números visibles siguen como alias. Cada evento recibe un ID con espacio de nombres.

Tradeoff: suma una fuente generada de control y reduce la edición repetida.

### D2. SourceAuthorityEpoch/v1 con estado por familia

Opciones:

- Promover 4aa0ba38 para todo el proyecto.
- Retener 05b7d98 para todo.
- Mantener una época y clasificar familias como same, changed-reviewed, changed-blocked o unreviewed.

Propuesta: tercera opción. La familia ReversalDef puede cerrar una equivalencia textual acotada. Push, round, Turns y rollback requieren revisión propia.

Tradeoff: más filas de fuente y claims más precisos.

### D3. ReversalInteractionPlan/v1

El plan debe nombrar reversor, atacante entrante, HitDef heredado, HitDef entrante, slots HitOverride del atacante, tipo de fuente y resultado. La decisión debe ocurrir antes de target memory y mutación.

Alternativa: mantener condicionales dentro de resolveDirect. Esa ruta dificulta probar los papeles por separado.

### D4. DeferredRedirectOperation sobre el lease existente

RuntimeRedirectedTargetDispatchSystem ya tiene identidad, generación y revalidación. La cola de restricciones debe guardar una operación tipada y usar ese contrato al commit.

Alternativa: crear otro ActorRef. Esa opción duplica reglas ya presentes.

### D5. CollisionConstraintPlan/v1

Separar dato authored, dato efectivo, proxy, caja mundial, admisión y presentación. Width, PlayerPush, ScreenBound, TransformClsn y OverrideClsn deben usar el mismo oracle.

Tradeoff: más tipos intermedios y menos reglas copiadas.

### D6. MatchInputPolicySnapshot/v1

El snapshot fija dispositivo, asiento, botones físicos, acciones lógicas, facing, SOCD, hold/repeat, deadzone, conexión y tick. Teclado, gamepad y replay alimentan el mismo contrato.

### D7. Transacciones de runtime para Turns y Projectile

Turns: preflight, plan, snapshot, commit, rollback.

Projectile: gather, orden estable, resolve, commit.

Ambos planes registran revisión esperada de actores y una secuencia de eventos.

### D8. EvidenceSubject/v1 y edad evaluada al leer

Campos mínimos: proyecto, revisión de proyecto, digest de fuentes, runtime SHA, source epoch, analizador, ruleset, gate y hashes de artefactos. maxAge se evalúa contra now al consumir la evidencia.

Alternativa: edad guardada al materializar. Esa opción no detecta el paso del tiempo.

### D9. StudioProjectSnapshot/v1, SourceWriteJournal/v1 y dos intenciones de export

IndexedDB guarda snapshots, análisis y journal. File System Access conserva permisos y handles. El journal coordina intent, temporal, commit y recovery. Studio separa ZIP de diagnóstico de release.

Tradeoff: migración y recovery explícitos. No se promete una transacción común entre medios.

### D10. ScannerCapabilityVector/v1

Cada señal conserva un ID estable y cinco hechos: recognized, parsed, lowered, executed y verified. Cada hecho liga su evidencia. Un cambio de estado o texto no cambia el localizador de la señal.

### D11. AssetReleasePolicy/v1

La decisión liga revisión de política, proyecto, provenance completo, digests, QA, colisión y playtest. Un asset propio adicional debe cruzar el flujo.

### D12. BoundaryManifest/v1 y dos consumidores

Cada raíz se declara required, optional o planned. Una required ausente falla. Planned queda fuera del claim. El contrato común se acepta cuando dos consumidores de dominio pueden operar de forma independiente.

## Roadmap restante por fases

### Fase 0 — Detener promoción del HEAD

DA23-01 y DA23-02. Resolver actor, payload y alcance de missonoverride. Luego cerrar el HEAD y ejecutar un gate global.

### Fase 1 — Control y fuente

DA23-03 a DA23-08. Publicar cursor, reparar IDs, sincronizar control y clasificar las dos revisiones por familia.

### Fase 2 — Causalidad y geometría

DA23-09 a DA23-12. Completar matriz RedirectID, migrar la cola diferida al lease y fijar un oracle común.

### Fase 3 — Sandbox y MUGEN-lite visibles

DA23-13 a DA23-15. Crear FightScreen CC0, ejecutar smoke de escritorio/móvil y cerrar gamepad con la política de input.

### Fase 4 — Equipos y orden global

DA23-16 a DA23-19. Hacer Turns atómico y establecer orden global de proyectiles.

### Fase 5 — Corpus y puntajes

DA23-20 a DA23-22. Rematerializar corpus, añadir un personaje independiente y adjudicar puntajes con denominador escrito.

### Fase 6 — Studio

DA23-23 a DA23-26. Ligar evidencia al sujeto, reemplazar estados fijos, guardar historia y probar recovery.

### Fase 7 — IKEMEN scanner, assets y módulos

DA23-27 a DA23-30. Separar fases del scanner, cerrar un segundo asset, hacer fallar límites vacíos y probar dos consumidores.

### Después de estas 30 tareas

- MUGEN MVP: throws, custom states, guard KO/no-KO, screenpack, paletas, audio y orden de tick por familia.
- MUGEN completo: corpus legal más amplio, stages, screenpacks, controladores, medios y timing con denominadores separados.
- IKEMEN: Simul/Tag/Turns completos, ocho actores, ZSS, Lua, módulos, replay, rollback y netplay. Cada bloque exige época de fuente, pruebas locales y gate de usuario.
- Studio/producto: migraciones, cuota, import/export de proyectos, revisión accesible de evidencia, rendimiento y política de publicación.
- Motor modular: segundo género real después del contrato común y dos consumidores. Un módulo planned no suma score.

## Próximas 30 tareas listas para ejecución

### DA23-01 — Oracle P0 de ReversalDef y HitOverride

- Alcance: separar reversor, atacante y sus slots; cubrir default, 0, 1, slot no compatible y señuelo.
- Dependencias: ninguna.
- Sistemas probables: RuntimeCombatResolutionSystem, ReversalSystem y fixtures importados.
- Aceptación: seis casos distinguen los papeles; sólo los slots del atacante contrarrestado entran en la decisión.
- Evidencia: tests unitarios y diferencial contra 05b7d98 y 4aa0ba38.
- Riesgo: el modelo de ReversalDef puede no guardar todo el HitDef heredado.
- Claim permitido: topología de esas figuras. Bloqueado: cierre de HEAD hasta DA23-02.

### DA23-02 — Cierre post-T388 y checkpoint global

- Alcance: resolver DA23-01, cubrir Projectile y mapear ReversalDef contra ReversalDef antes de nombrar el corte.
- Dependencias: DA23-01.
- Sistemas probables: compiler, runtime, traces, backlog y reportes.
- Aceptación: ticket, mapa, reporte y entrada formal ligan el mismo SHA; ningún caso P0 queda abierto.
- Evidencia: typecheck, Vitest completo, qa:trace, build, boundaries, redirect-boundary y diff.
- Riesgo: la corrección invalida la traza nueva.
- Claim permitido: gate global del SHA exacto. Bloqueado: score y paridad amplia.

### DA23-03 — RoadmapCursor/v1

- Alcance: registrar HEAD, focal, global, visual, backlog, score y dirty state.
- Dependencias: DA23-02.
- Sistemas probables: docs/roadmap y materializador de control.
- Aceptación: cada campo tiene SHA, fecha, artefacto y claim; un focal no sustituye al global.
- Evidencia: schema, fixture stale y verificador.
- Riesgo: dos writers concurrentes.
- Claim permitido: estado del corte. Bloqueado: conducta de runtime.

### DA23-04 — IDs estables del ledger

- Alcance: conservar números visibles y sumar IDs WF, BL, AUD y GATE.
- Dependencias: DA23-03.
- Sistemas probables: backlog, progress tracker y links.
- Aceptación: alias repetido se detecta; el selector usa tipo más ID.
- Evidencia: auditor de referencias y fixture duplicado.
- Riesgo: links históricos.
- Claim permitido: identidad de eventos. Bloqueado: renumerar historia.

### DA23-05 — Sincronizar autoridades de control

- Alcance: hacer que docs principales e issues 01–07 consuman el cursor.
- Dependencias: DA23-03 y DA23-04.
- Sistemas probables: los nueve docs de control y .scratch/roadmap/issues.
- Aceptación: todos muestran el mismo corte; contenido histórico queda marcado.
- Evidencia: búsqueda de selectores viejos y revisión manual.
- Riesgo: borrar claims acotados.
- Claim permitido: control consistente. Bloqueado: alza de score.

### DA23-06 — SourceAuthorityEpoch y Manifest v1

- Alcance: registrar ambos pins, archivos faltantes, digests, familias y estado semántico.
- Dependencias: DA23-02.
- Sistemas probables: ADR 0005, source manifest y Package Analysis.
- Aceptación: compiler_functions.go, fightscreen.go, common.go, state.go y system.go quedan incluidos; tamper falla.
- Evidencia: hashes SHA-256 y comparación oficial.
- Riesgo: promover una familia sin revisar.
- Claim permitido: procedencia y estado por familia. Bloqueado: equivalencia global.

### DA23-07 — Clasificar la familia ReversalDef

- Alcance: missonoverride, ModifyReversalDef, guardflag y prioridades en ambos pins.
- Dependencias: DA23-01 y DA23-06.
- Sistemas probables: compiler_functions.go, bytecode.go, char.go y tickets T378–post-T388.
- Aceptación: cada campo tiene líneas, papel de actor, default, fase y resultado.
- Evidencia: diff de tokens, lectura semántica y casos diferenciales.
- Riesgo: igualdad textual sin igualdad de contexto.
- Claim permitido: campos revisados. Bloqueado: resto de combate.

### DA23-08 — Clasificar push, round, Turns y rollback

- Alcance: revisar deltas reales en char.go, fightscreen.go, state.go y system.go.
- Dependencias: DA23-06.
- Sistemas probables: constraint, round, Turns, Studio journey y replay.
- Aceptación: cada cambio queda same, changed-reviewed o changed-blocked con impacto local.
- Evidencia: patch oficial y tickets de decisión.
- Riesgo: cambio upstream sin equivalente local.
- Claim permitido: mapa de impacto. Bloqueado: promoción de época hasta cerrar celdas críticas.

### DA23-09 — RedirectCapabilityMatrix/v1

- Alcance: listar T370–post-T388 por caller, destino, fase, pause, reset, generación y fuente.
- Dependencias: DA23-03 y DA23-06.
- Sistemas probables: RedirectID dispatch, Helper y constraints.
- Aceptación: no hay ticket genérico sin celda y contraste vecino.
- Evidencia: matriz versionada y links a tests/traces.
- Riesgo: matriz grande sin gate.
- Claim permitido: cobertura visible. Bloqueado: soporte general RedirectID.

### DA23-10 — DeferredRedirectOperation sobre el lease

- Alcance: sustituir cierres crudos de restricciones por operación tipada y lease.
- Dependencias: DA23-09.
- Sistemas probables: PlayableMatchRuntime y RuntimeRedirectedTargetDispatchSystem.
- Aceptación: caller, target, generación, fase, payload y source epoch quedan en la operación.
- Evidencia: tests de schedule, commit y reject.
- Riesgo: cambiar orden actual.
- Claim permitido: cola tipada. Bloqueado: todos los controladores.

### DA23-11 — Matriz de lifecycle para commit diferido

- Alcance: muerte, reemplazo, reserva, reset, pause, hitpause, varios writers y Helper anidado.
- Dependencias: DA23-10.
- Sistemas probables: actor registry, Helper ancestry y root phases.
- Aceptación: actor viejo falla sin mutar; cada writer deja resultado estable.
- Evidencia: fault injection y trazas schedule/validate/commit/reject.
- Riesgo: rutas sin generación.
- Claim permitido: celdas probadas. Bloqueado: orden total del engine.

### DA23-12 — CollisionConstraintPlan y oracle

- Alcance: unificar authored, efectivo, proxy, mundo, admisión y overlay.
- Dependencias: DA23-10 y DA23-11.
- Sistemas probables: Width, PlayerPush, ScreenBound, TransformClsn, OverrideClsn y debug.
- Aceptación: misma geometría numérica en runtime, trace y overlay; reset usa el mismo plan.
- Evidencia: snapshots de cajas y prueba de ancho cero de ambos pins.
- Riesgo: cambiar fixtures previos.
- Claim permitido: geometría de fixtures. Bloqueado: física o visual amplia.

### DA23-13 — Fixture CC0 directo de FightScreen

- Alcance: paquete propio con fight.def, FightFX, FNT, AIR, round, KO, draw, time-over, win type, skip y reset.
- Dependencias: DA23-02 y DA23-06.
- Sistemas probables: MugenSystemAssetsLoader y renderers FightScreen.
- Aceptación: carpeta y ZIP cargan; licencia y digests están presentes; fallback se ve.
- Evidencia: provenance, traza y manifiesto de assets.
- Riesgo: fixture simple.
- Claim permitido: paquete nombrado. Bloqueado: screenpack general.

### DA23-14 — Checkpoint visual actual

- Alcance: ejecutar DA23-13 y geometría T343–HEAD en escritorio y móvil.
- Dependencias: DA23-12 y DA23-13.
- Sistemas probables: browser smoke, Studio, renderer y overlays.
- Aceptación: estado final, errores, consola, foco, clipping, reduced motion y datos críticos visibles.
- Evidencia: capturas, DOM, viewport, consola y runtime SHA.
- Riesgo: baseline sensible.
- Claim permitido: vistas y viaje probados. Bloqueado: paridad de píxeles.

### DA23-15 — MatchInputPolicySnapshot y gamepad

- Alcance: teclado, gamepad, replay, dos asientos, deadzone y conexión.
- Dependencias: DA23-02.
- Sistemas probables: GamepadInputAdapter, input control y App.
- Aceptación: mismo evento lógico produce misma decisión; desconexión tiene estado visible; facing no reescribe el dato físico.
- Evidencia: tests por dispositivo, replay y navegador.
- Riesgo: APIs distintas por navegador.
- Claim permitido: dispositivos probados. Bloqueado: todo gamepad.

### DA23-16 — RuntimeTurnsTransaction/v1

- Alcance: sumar revisiones esperadas, snapshot integral, commit y rollback al plan existente.
- Dependencias: DA23-08 y DA23-15.
- Sistemas probables: Turns continuation, handoff, recursos, state 5900, targets y effects.
- Aceptación: fallo inyectado en cada paso restaura checksum completo; éxito deja recibo.
- Evidencia: tests de fault injection y traza de fases.
- Riesgo: estado no incluido en snapshot.
- Claim permitido: transición atómica de fixtures. Bloqueado: teams completos.

### DA23-17 — Viaje Turns 1–2–3

- Alcance: tres miembros, KO, handoff, recuperación, recursos, input, HUD y fin.
- Dependencias: DA23-14, DA23-15 y DA23-16.
- Sistemas probables: teams, round, HUD y browser.
- Aceptación: dos reemplazos sin residuos; roster y resultado coinciden con la traza.
- Evidencia: traza requerida, capturas y checksums.
- Riesgo: fixture oculta fallos de pausa.
- Claim permitido: viaje nombrado. Bloqueado: Simul y Tag amplios.

### DA23-18 — GlobalProjectileSchedule/v1

- Alcance: reunir intents de roots y Helpers, ordenar y confirmar en una fase global.
- Dependencias: DA23-09 y DA23-11.
- Sistemas probables: MatchInteractionSystem, effect stores y projectile combat.
- Aceptación: el orden no depende del lado ni inserción; actor viejo no recibe commit.
- Evidencia: tests con orden invertido y trazas de plan.
- Riesgo: cambia timing previo.
- Claim permitido: scheduler de fixtures. Bloqueado: paridad total.

### DA23-19 — Oracle de orden de proyectiles

- Alcance: tres o más owners, Helper, empate, cancel, hitpause, target y reset.
- Dependencias: DA23-18.
- Sistemas probables: projectile clash, contact memory y targets.
- Aceptación: cada empate tiene clave estable; ejecución repetida produce el mismo checksum.
- Evidencia: matriz, seed repetido y traza.
- Riesgo: combinaciones grandes.
- Claim permitido: celdas del oracle. Bloqueado: todos los casos.

### DA23-20 — CompatibilityCorpus/v1.2 y frescura real

- Alcance: evaluar edad contra now, ligar HEAD y rehacer los ocho hashes.
- Dependencias: DA23-02, DA23-14, DA23-17 y DA23-19.
- Sistemas probables: corpus snapshot, materializador y Studio.
- Aceptación: cero hash distinto; vencimiento real marca stale; artefacto ausente bloquea.
- Evidencia: snapshot canónico y tests de reloj/tamper.
- Riesgo: artefactos locales ignorados.
- Claim permitido: corpus v1.2. Bloqueado: score hasta DA23-22.

### DA23-21 — Segundo personaje CC0 independiente

- Alcance: personaje propio con estructura y rutas distintas al primero.
- Dependencias: DA23-13, DA23-15 y DA23-20.
- Sistemas probables: loader, VM, combate, Common1 y presentation.
- Aceptación: import, hit, guard, KO y ruta propia sin adaptador por personaje.
- Evidencia: licencia, digests, trazas y capturas.
- Riesgo: poca diversidad.
- Claim permitido: dos personajes nombrados. Bloqueado: compatibilidad amplia.

### DA23-22 — Adjudicación de puntajes

- Alcance: aplicar criterios por banda a corpus, viajes y gates de usuario.
- Dependencias: DA23-20 y DA23-21.
- Sistemas probables: scorecard y cursor.
- Aceptación: cada punto cita denominador, SHA y evidencia; docs solos valen cero.
- Evidencia: tabla criterio/evidencia/decisión y revisión aparte.
- Riesgo: sumar capacidad repetida.
- Claim permitido: puntaje adjudicado. Bloqueado: extrapolar a MUGEN/IKEMEN.

### DA23-23 — EvidenceSubject/v1 para gates y trazas

- Alcance: ligar proyecto, fuente, runtime, época, tool, gate y artefactos.
- Dependencias: DA23-03, DA23-06 y DA23-20.
- Sistemas probables: StudioEvidenceEnvelope, GateEvidence, traces y corpus.
- Aceptación: cambiar cualquier identidad marca stale; review del usuario no cambia verdad técnica.
- Evidencia: missing, stale, failed, passed y tamper.
- Riesgo: evidencia vieja queda obsoleta.
- Claim permitido: vigencia del sujeto. Bloqueado: release general.

### DA23-24 — Playtest real y acciones de export

- Alcance: reemplazar la fila fija; exponer ausente, current, stale y failed; separar diagnóstico de release y abrir detalle.
- Dependencias: DA23-14 y DA23-23.
- Sistemas probables: App build readiness, evidence detail y release decision.
- Aceptación: ningún estado ok sin artefacto actual; labels y manifiesto dicen la intención; teclado y foco funcionan.
- Evidencia: browser en 1440 y ancho estrecho, artefactos por estado.
- Riesgo: más densidad visual.
- Claim permitido: smoke o export nombrado. Bloqueado: producto listo.

### DA23-25 — StudioProjectSnapshot y diff de reanálisis

- Alcance: guardar revisiones inmutables de proyecto y Package Analysis; comparar señales.
- Dependencias: DA23-23.
- Sistemas probables: IndexedDB, ProjectStorage, PackageAnalysis y Studio.
- Aceptación: guardar, cerrar, abrir, cambiar fuente y reanalizar conserva altas, bajas y cambios.
- Evidencia: tests de migración, cuota, tamper y browser.
- Riesgo: migración desde última copia.
- Claim permitido: historia local. Bloqueado: paridad semántica.

### DA23-26 — SourceWriteJournal y recovery drill

- Alcance: intent, temporal, commit idempotente, recibo y recovery entre storage y archivos.
- Dependencias: DA23-25.
- Sistemas probables: StudioSourceWrite, SourceWriteReceipt, handles e IndexedDB.
- Aceptación: cierre de pestaña, permiso revocado, fallo parcial y retry no duplican revisiones.
- Evidencia: fault injection y drill de navegador.
- Riesgo: límites por navegador.
- Claim permitido: casos recuperados. Bloqueado: atomicidad común nativa.

### DA23-27 — ScannerCapabilityVector/v1

- Alcance: ID estable y fases recognized, parsed, lowered, executed y verified por señal.
- Dependencias: DA23-06, DA23-23 y DA23-25.
- Sistemas probables: IkemenFeatureScanner, PackageAnalysis, Studio y ZIP.
- Aceptación: ninguna fase se infiere; select.def común no crea falso claim IKEMEN; downgrade se ve.
- Evidencia: fixtures por fase y diff de revisión.
- Riesgo: migrar IDs FNV actuales.
- Claim permitido: fase probada. Bloqueado: soporte IKEMEN global.

### DA23-28 — AssetReleasePolicy/v1 y segundo asset

- Alcance: ligar política, proyecto y provenance con SHA-256; cruzar un segundo asset propio.
- Dependencias: DA23-23, DA23-25 y DA23-26.
- Sistemas probables: provenance, release policy, asset registry y export.
- Aceptación: Nova y el segundo asset pasan; regla vieja, digest roto o revisión distinta bloquea; reopen conserva decisión.
- Evidencia: permiso, licencia, transforms, QA, collision, playtest y bundle.
- Riesgo: confundir política con revisión legal.
- Claim permitido: dos assets nombrados. Bloqueado: publicación.

### DA23-29 — BoundaryManifest con fallo cerrado

- Alcance: declarar raíces required, optional y planned.
- Dependencias: DA23-03.
- Sistemas probables: check_boundaries, ArchitectureBoundaries tests y ModuleContracts.
- Aceptación: required ausente falla; planned queda fuera del claim; import y término prohibidos fallan.
- Evidencia: fixtures negativas y reporte de raíces.
- Riesgo: activar una raíz vacía.
- Claim permitido: límites de raíces activas. Bloqueado: motor genérico.

### DA23-30 — Contrato central con dos consumidores

- Alcance: extraer hechos puros; mantener reglas MUGEN y assets en adaptadores; crear dos flujos independientes.
- Dependencias: DA23-27, DA23-28 y DA23-29.
- Sistemas probables: EvidenceEnvelope, core, release y reanálisis.
- Aceptación: quitar un adaptador no rompe el otro; core no importa app ni MUGEN.
- Evidencia: grafo de imports, tests de contrato y boundary gate.
- Riesgo: extracción grande desde App.
- Claim permitido: contrato usado por dos consumidores. Bloqueado: SDK, platformer y motor modular completo.

## Orden inmediato

1. DA23-01.
2. DA23-02.
3. DA23-03 a DA23-08.
4. DA23-09 a DA23-12.
5. DA23-13 a DA23-15.
6. DA23-16 a DA23-19.
7. DA23-20 a DA23-22.
8. DA23-23 a DA23-30.

## Riesgos y controles

| Riesgo | Probabilidad / impacto | Control |
| --- | --- | --- |
| Topología ReversalDef invertida | Alta / alta | DA23-01 antes de cierre |
| Payload de match equivocado | Media / alta | ReversalInteractionPlan |
| Proyectar T383 a HEAD | Alta / alta | Cursor y DA23-02 |
| Mezclar pins | Alta / alta | Epoch por familia |
| Cola confirma actor viejo | Media / alta | Lease y generación |
| Geometría interna diverge | Media / alta | Oracle común y browser |
| Turns queda parcial | Media / alta | Snapshot y rollback |
| Projectile depende del lado | Media / alta | Scheduler global |
| Corpus nunca envejece | Alta / alta | Edad contra now |
| Studio muestra verde fijo | Alta / alta | EvidenceSubject y estado real |
| Scanner marca MUGEN como IKEMEN | Media / alta | Señales exclusivas y vector |
| Release depende de un asset | Alta / media | Segundo asset |
| Boundary pasa vacío | Alta / alta | Required roots |
| Extracción central sin segundo uso | Alta / media | Dos consumidores |

## Fuentes oficiales consultadas

### Ikemen GO

- [Comparación oficial 05b7d98...4aa0ba38](https://github.com/ikemen-engine/Ikemen-GO/compare/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703...4aa0ba38f851c52549ba182310e9e53361cd472a). GitHub informa 51 commits y 34 archivos.
- [ReversalDef e HitOverride en 05b7d98](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10730-L10770).
- [ReversalDef e HitOverride en 4aa0ba38](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10739-L10778).
- [compiler_functions.go en 05b7d98](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go) y [en 4aa0ba38](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go).

### Estándares y Three.js

- [Indexed Database API 3.0](https://www.w3.org/TR/IndexedDB/). Define transacciones y abort dentro de IndexedDB.
- [File System Access](https://wicg.github.io/file-system-access/). Define handles, permisos y escritura local; sigue como borrador de grupo comunitario.
- [RFC 8785](https://www.rfc-editor.org/info/rfc8785). Define una forma canónica de JSON útil para hashes estables.
- [Three.js Object3D.renderOrder](https://threejs.org/docs/pages/Object3D.html#renderOrder). Permite ordenar dibujo; opaque y transparent mantienen grupos de orden distintos.

## Incertidumbre y efecto

- El P0 de HEAD surge de lectura estática. DA23-01 debe confirmarlo con una figura donde los roles estén separados.
- La igualdad de tokens en la familia ReversalDef reduce riesgo de pin para esos campos. No prueba que los 51 commits sean equivalentes.
- Los cambios upstream de push y rollback son reales. Su impacto local queda abierto hasta DA23-08.
- T342 sirve como evidencia visual histórica. No prueba el runtime actual.
- La captura histórica de Studio muestra truncado parte del Trust Chain a 1440 por 900. DA23-24 debe verificar el estado actual y la inspección de datos críticos.

## Resultado

Esta auditoría agrega un P0, refina la autoridad de fuente y deja 30 tareas ordenadas. No cambia comportamiento, gates ni puntajes.

## NO CODE CHANGED

Esta auditoría no modificó código, runtime, UI, tests ni assets. No ejecutó suites de código. No creó commits ni hizo push.
