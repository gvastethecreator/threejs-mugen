# Auditoría diaria de roadmap y arquitectura — post-DA32-026

Fecha: 2026-07-28  
Alcance: investigación, arquitectura y roadmap  
Corte inicial: `5bc4cb90deb88024f545c16a946b6c1baaf46075`  
HEAD al cierre documental: `1b1ba28f9730c0e04f39e49349d92b79bfb1b288`  
Base previa: ejecución 2026-07-27T17:22:28Z y auditoría post-DA30-120

## Resumen ejecutivo

El repo avanzó de forma material desde la ejecución anterior. DA31 cerró sus
40 cortes con techos explícitos; T407…T417 ampliaron juggle, projectile,
`hittmp`, `acttmp` y `stchtmp`; DA32 cerró smoke, layout, hit-spark, una base de
accesibilidad/gamepad y la autoridad IndexedDB de Studio hasta la recuperación
de recibos de escritura.

El avance sigue siendo focal. El gate formal/global permanece en `f5f2315e`.
El artefacto global de smoke está verde, pero no guarda `subjectSha`. Los
modelos DA31-017…040 no prueban consumidores reales. Las familias de fuente
usadas por T410…T417 aún no tienen revisión formal entre el pin normativo 05b y
el pin de trabajo 4aa. El corpus sigue sin una segunda ruta legal completa. Por
estas causas no se mueven watermarks humanos ni scores.

La prioridad cambia: cerrar el contrato de evidencia del HEAD, diseñar la
recuperación de escrituras externas de Studio, probar fallos reales de
renderer/input/persistencia y construir una segunda ruta legal importada. La
ampliación IKEMEN debe esperar el manifiesto de fuente por familia.

## Cambios desde la última ejecución

| Área | Hecho verificado | Techo del claim |
|---|---|---|
| DA31 | 001…040 figuran cerradas en el estado de fase | 017…040 siguen como `accepted-model` |
| Runtime | T407…T417 cerraron cortes focales con trace | No forman un gate formal del HEAD ni prueban compatibilidad amplia |
| UI/smoke | Layout, hit-spark y smoke global tienen nuevos checkpoints; el último commit es `c632ceba` | El registro smoke no queda ligado a un SHA en el JSON |
| Input/a11y | Hay lifecycle virtual de gamepad y estado accesible del canvas | Falta hardware físico, lector de pantalla y matriz de entrada concurrente |
| Studio | IndexedDB, snapshot, intención, fases y recibo recuperable llegaron a DA32-026 | Faltan caídas físicas, cuota, eviction, multi-tab y multi-file |
| Control | Formal/global pasó a `f5f2315e`; Entry numerada llega a 628 | HEAD `5bc4cb90` no tiene gate formal completo |
| Fuente | El trabajo cita Ikemen 4aa | Sólo juggle figura revisado contra el pin normativo 05b |
| Scores | Sin cambio | `65 / 36 / 20 / 10-12 / 6-8 / 25` |

## Tupla de autoridad

| Cursor | Valor | Lectura permitida |
|---|---|---|
| HEAD inicial / cierre | `5bc4cb90` / `1b1ba28f` | El repo avanzó durante la auditoría; ninguno equivale a gate formal |
| Backlog numerado | Entry 629 | DA32-026, cerrado por el dueño concurrente en `1b1ba28f` |
| Formal/global | `f5f2315e` | Typecheck, suite, trace, build y límites en ese sujeto |
| Focal runtime | T416 `b07c4e88`; T417 `19f1693e` | Sólo cláusulas y negativos de esos cortes |
| Visual/producto reciente | smoke documentado en `c632ceba`; Studio `f18adb2d` con pin `5bc4cb90` | Evidencia focal; no reemplaza formal/global |
| Fuente | normativo 05b; trabajo 4aa | La familia debe declarar su revisión antes del claim |
| Registro | DA30-120 | Existencia de filas de máquina |
| Adjudicación | DA30-020 | Última secuencia humana segura |
| Propuesta | DA30-021 | Requiere firma humana; no se aplica por esta auditoría |

## Hechos, inferencias y preguntas

### Hechos verificados

- El gate formal `f5f2315e` pasó typecheck, 3.136 tests, trace, build y auditorías
  de límites. `qa:smoke` no formó parte de ese gate.
- El trace posterior a T417 registra 667 artefactos: 633 requeridos y 34
  opcionales, con cero fallos. Es un checkpoint focal posterior.
- DA32-026 prueba recibos persistidos y rehidratados en escritorio y móvil con
  sujeto limpio `f18adb2d`.
- `da32-program-status-v1.json` enumera 001, 002, 003, 004, 005, 009, 010,
  013, 014, 021…026 y 029. El roadmap no define contratos de tarea completos
  para 006…008, 011…012, 015…020, 027…028 y 030…032.
- La autoridad de fuente sólo declara revisada la familia juggle entre 05b y
  4aa. Las demás familias citadas por los últimos cortes quedan abiertas.

### Inferencias

- Un smoke sin SHA puede servir como observación, pero no puede promover el
  HEAD a formal/global.
- IndexedDB y File System Access necesitan un diario y una saga: sus commits no
  forman una transacción común.
- El próximo corte de replay necesita snapshot completo antes de prometer
  determinismo de partida.
- El score de compatibilidad necesita una segunda ruta legal importada, casos
  negativos y revisión independiente.

### Preguntas abiertas

- ¿Qué persona o rol firma DA30-021 y dónde queda la firma durable?
- ¿Qué recursos, timers, RNG, audio, input y owners entran en un snapshot de
  partida completo?
- ¿Qué política de retención y privacidad se usa para preimages de Studio?
- ¿Qué segunda obra repo-owned o CC0 puede cubrir char, stage, audio y motif?
- ¿Qué familia IKEMEN sigue después de revisar 05b/4aa?

## Mapa de gaps por horizonte y sistema

| Horizonte | Sistema | Gap | Dependencia | Riesgo si se omite |
|---|---|---|---|---|
| Sandbox jugable | Control | No hay gate formal del HEAD ni smoke ligado a SHA | P0 | Falsos cierres por mezcla de sujetos |
| Sandbox jugable | Renderer | Sin pérdida/restauración de contexto ni censo de `dispose()` | P2 | Fugas, pantalla negra y datos WebGL viejos |
| Sandbox jugable | Rendimiento | Sin peor ruta de 60 s con p95/p99/max de frame gaps | P2 | El FPS medio oculta pausas visibles |
| Sandbox jugable | Input | Gamepad físico, blur, unplug y mezcla de dispositivos incompletos | P2 | Acciones pegadas y seats erróneos |
| MUGEN-lite | Replay | Falta snapshot completo, restore y prueba de divergencia | P3 | Claims de determinismo sin estado total |
| MUGEN-lite | Corpus | Una sola ruta legal no sostiene amplitud | P3 | Score inflado por fixtures nativos |
| MUGEN | Runtime | Common1, paletas, audio, motif, camera/localcoord y orden de controllers abiertos | P4 | Paridad parcial en rutas reales |
| MUGEN | Evidencia | Faltan rutas importadas con negativos y revisión independiente | P3/P4 | Tests internos sustituyen compatibilidad |
| IKEMEN | Fuente | `hittmp`/`acttmp`/`stchtmp`/projectile sin manifiesto 05b/4aa | P5 | Semántica basada en un pin sin adjudicar |
| IKEMEN | Runtime | Team/plural, helper action y ZSS siguen como modelos | P5 | Diseño confundido con ejecución |
| Studio | Persistencia | Caídas, cuota, eviction, multi-tab y multi-file abiertos | P1 | Pérdida o sobreescritura oculta |
| Studio | Producto | Faltan journeys completos por vista, errores y recovery | P1/P2 | Superficie útil sólo en happy path |
| Assets | Provenance | Falta segunda cadena independiente y presupuesto de export | P6 | Un solo asset no prueba la tubería |
| Scanner | Producto | Falta un núcleo real compartido por worker y CLI | P6 | Dos analizadores divergen |
| Modularización | Consumo | Falta segundo juego, paquete instalable, CLI y CI | P7 | Límite de módulos sólo nominal |
| Release | Autoridad | Sin revisión legal, bundle reproducible ni autoridad pública | P7 | Claim de entrega fuera del alcance local |

## Decisiones arquitectónicas propuestas

### D1. Tupla de checkpoints obligatoria

Guardar por separado HEAD, formal/global, focal, visual/producto, fuente,
registro y adjudicación. Alternativa: un solo “último verde”. Esa opción pierde
el sujeto exacto. Coste: más campos; beneficio: claims auditables.

### D2. Todo gate de navegador debe fijar sujeto

El JSON debe incluir `subjectSha`, estado del árbol, navegador, viewport,
comando, pasos, artefactos, errores y claim ceiling. Alternativa: ligar el SHA
en un commit de docs. Esa unión se rompe al copiar el artefacto.

### D3. Diario de recuperación de escrituras de fuente

Adoptar [ADR 0073](../adr/0073-studio-source-write-recovery-journal.md):
intención, preimage, fase, observación, digest, recibo y acciones explícitas.
La alternativa de reintento automático puede sobrescribir cambios externos.

### D4. Snapshot completo antes de replay

Definir owners, formato y versión de estado; luego probar restore, replay y
divergencia. Alternativa: registrar sólo input y hash final. Esa opción no
explica una desincronización ni permite reanudar.

### D5. Manifiesto de fuente por familia

Cada familia IKEMEN debe comparar 05b y 4aa, elegir pin, registrar líneas,
negativos y perfil. Alternativa: usar siempre el pin de trabajo. Esa opción
mezcla cambios upstream sin revisión.

### D6. Perfiles de compatibilidad explícitos

Separar `mugen-1.0`, `mugen-1.1` e `ikemen-go`; compartir infraestructura y
mantener semántica con profile gate. Alternativa: un superset único. Ese diseño
oculta diferencias de fuente y favorece falsos positivos.

### D7. Un núcleo de scanner con dos adaptadores

El worker de Studio y la CLI deben llamar al mismo analizador puro, con la
misma revisión y corpus hostil. Alternativa: dos implementaciones. Duplicaría
reglas y haría que los reportes diverjan.

### D8. Extraer módulos tras dos consumidores reales

La extracción requiere un segundo juego ejecutable, prueba de borrado/imports
prohibidos y paquete instalable. Alternativa: extraer desde el primer juego.
Eso fija APIs antes de conocer el segundo uso.

### D9. Provenance como grafo de entrega

Cada asset debe enlazar origen legal, prompt o receta, transformaciones,
digests, atlas, colisión/audio, QA visual y export. Alternativa: una lista de
archivos. La lista no prueba cómo se produjo ni qué build lo consume.

## Roadmap restante por fases

1. **P0 — control actual**: fijar DA32-026, ligar smoke a SHA, gatear un HEAD y
   sincronizar los cursores. Bloquea cualquier claim global.
2. **P1 — recuperación Studio**: decidir ADR 0073 y probar ventanas de caída,
   cuota, eviction, multi-tab y multi-file.
3. **P2 — shell real**: hardware físico, entrada concurrente, lector de
   pantalla, WCAG, pérdida de contexto, disposal y frame gaps.
4. **P3 — MUGEN-lite demostrable**: snapshot, replay y segunda ruta legal
   importada; recién después revisar scores.
5. **P4 — MUGEN**: Common1, palette, audio, motif, camera/localcoord y una ruta
   adicional completa.
6. **P5 — IKEMEN**: revisar familias de fuente y convertir modelos en
   consumidores live de forma gradual.
7. **P6 — producto y contenido**: segunda cadena de assets, scanner worker/CLI
   y journeys Studio ligados a revisión.
8. **P7 — módulos y entrega local**: segundo consumidor, extracción probada,
   paquete, CLI, CI y revisión legal. Publicación requiere autoridad del usuario.

## Próximas 48 tareas listas para ejecución

La columna “claim” indica el techo permitido tras pasar la evidencia indicada.

| ID | Alcance y sistemas probables | Depende | Aceptación | Evidencia | Riesgo / claim |
|---|---|---|---|---|---|
| AUD28-01 | Definir manifest de preflight para el sujeto post-DA32-026 | — | Un JSON fija HEAD esperado, política de árbol, comandos, cursores y claims antes del gate | Validador con caso de SHA errado y árbol sucio | Medio; contrato de gate, sin promoción |
| AUD28-02 | Crear gate formal/current-head en scripts de QA y ledger | 01 | Un SHA limpio pasa typecheck, suite, trace, build, límites y smoke | JSON con logs, SHA y códigos | Alto; sólo ese SHA |
| AUD28-03 | Añadir envelope de sujeto al artefacto smoke | 01 | JSON guarda SHA, árbol, navegador, rutas y lanes | Caso verde y caso de SHA errado | Medio; smoke ligado al sujeto |
| AUD28-04 | Sincronizar `control-source-v1` y cursores | 02/03 | Focal T417, producto DA32-026 y formal nuevo quedan separados | Auditor de autoridad verde | Alto; no mueve adjudicación |
| AUD28-05 | Revisar DA30-021 con firma humana | 02 | Cláusula, sujeto, negativos y firmante quedan guardados | Ledger y firma durable | Alto; puede proponer DA30-021 |
| AUD28-06 | Completar contratos DA32 faltantes 006…008, 011…012, 015…020, 027…028, 030…032 | 01 | Cada id tiene dueño, dependencias, aceptación, prueba y claim | Validador de roadmap | Medio; plan listo |
| AUD28-07 | Modelar `needs-observation` tras `write-closed` | ADR 0073 | Estado y transiciones cubren match, divergencia y falta de permiso | Tests de modelo y tabla de transición | Alto; sólo modelo, sin recovery live |
| AUD28-08 | Diseñar acciones aceptar/restaurar/reintentar/abandonar | 07 | Cada acción declara precondición, bytes, revisión y efecto | Tests positivos/negativos | Alto; claim focal de acción |
| AUD28-09 | Inyectar caídas en cinco fases de escritura externa | 07/08 | Reinicio conserva intención, preimage, fase y bytes esperados | Matriz desktop/móvil por fase | Alto; sólo ventanas probadas |
| AUD28-10 | Inyectar cuota agotada en snapshots y diario | 07 | Proyecto anterior queda legible y la UI ofrece salida clara | Browser gate con DOM y bytes | Alto; cuota del navegador probado |
| AUD28-11 | Probar eviction o base ausente | 10 | La app detecta pérdida y evita presentar estado viejo como actual | Gate de borrado/reapertura | Alto; recovery local acotado |
| AUD28-12 | Probar conflicto multi-tab por revisión base | 07 | La segunda pestaña detecta stale base y no pisa la primera | Gate real con dos tabs | Alto; concurrencia de ese navegador |
| AUD28-13 | Definir saga para multi-file/ZIP | 09/12 | Manifiesto, orden, compensación y recovery están escritos | ADR y casos de corte por archivo | Alto; sin claim atómico |
| AUD28-14 | Ejecutar matriz de gamepad físico | 03 | Dos mandos, reconnect, index drift, duplicate id y mapping quedan medidos | Video/log y checklist por dispositivo | Alto; hardware probado |
| AUD28-15 | Cerrar release de acciones en blur/unplug | 14 | Ninguna acción queda sostenida tras blur, disconnect o seat move | Gate físico y trace tick a tick | Alto; input focal |
| AUD28-16 | Probar teclado+gamepad+touch concurrentes | 15 | Regla de arbitraje estable por seat y tick | Trace y negativos de conflicto | Alto; mezcla probada |
| AUD28-17 | Ejecutar journey con NVDA/Chrome | 03 | Canvas, estado, controles, errores y cambios se anuncian en orden | Captura, árbol a11y y checklist | Medio; entorno probado |
| AUD28-18 | Auditar WCAG 2.2 de shell y Studio | 17 | Foco visible/no oculto, reflow, target 24 px, contraste y mensajes pasan | Matriz desktop/móvil + axe/manual | Medio; claims por criterios medidos |
| AUD28-19 | Probar pérdida/restauración de contexto y disposal | 03 | Play→Studio→Play y pérdida forzada restauran escena sin crecer recursos | Censo renderer.info, contexto y screenshots | Alto; ciclo probado |
| AUD28-20 | Medir peor ruta 60 s | 19 | Reporta FPS, p95/p99/max frame gap, GC y memoria en ruta importada | Perfil reproducible y raw trace | Alto; sólo equipo/navegador medido |
| AUD28-21 | Definir input log por tick | 15/16 | Formato versionado cubre seat, device, acciones y orden | Schema + roundtrip + casos hostiles | Alto; formato, sin replay completo |
| AUD28-22 | Hacer censo de owners de snapshot de partida | 21 | Fighter/helper/projectile/stage/camera/audio/RNG/input/timers figuran con dueño | Documento y test de campos faltantes | Alto; inventario completo |
| AUD28-23 | Serializar y restaurar snapshot completo | 22 | Restore conserva hash y estado observable en un tick de corte | Roundtrip y negativos de versión | Alto; snapshot del perfil probado |
| AUD28-24 | Reproducir input log desde snapshot | 23 | Dos ejecuciones producen hashes y eventos iguales | Gate repetido con artefactos | Alto; determinismo del caso |
| AUD28-25 | Probar divergencia por input mutado | 24 | El primer tick distinto se detecta y explica | Negative gate con diff de owners | Alto; detector probado |
| AUD28-26 | Elegir segunda obra legal repo-owned/CC0 | — | Licencia, origen, digests y alcance char/stage/audio/motif quedan aprobados | Registro de provenance | Alto; selección legal, sin compatibilidad |
| AUD28-27 | Importar la segunda ruta y reconstruir corpus por revisión | 26/03 | Parse→build→Play usa bytes importados y guarda revision/hash | Browser gate y corpus v1.3 | Alto; ruta y revisión probadas |
| AUD28-28 | Adjudicar scores con revisión independiente | 24/25/27 | Cada punto enlaza criterio, positivo, negativo, ruta y revisor | Score diff y acta | Alto; sólo score aprobado |
| AUD28-29 | Cubrir Common1 guard/fall/recovery y orden de controllers | 27 | Fixture legal pasa positivos y negativos del orden exacto | Trace diferencial y fuente Elecbyte | Alto; cláusulas listadas |
| AUD28-30 | Separar owner de redirects de helper/projectile por perfil | 29/35 | MUGEN e IKEMEN eligen semántica por profile gate | Trace por perfil y negativos cruzados | Alto; familias revisadas |
| AUD28-31 | Cerrar ruta palette/ACT con paridad de píxel | 27 | Paletas seleccionadas y efectos de transparencia coinciden en capturas | Pixel diff y checksum ACT | Medio; assets probados |
| AUD28-32 | Cerrar SND: canal, stop, voice y timing | 27 | Orden y corte de audio coinciden en eventos y captura | Event log + grabación normalizada | Medio; audio del caso |
| AUD28-33 | Implementar FightScreen/motif de la ruta legal | 27/31/32 | Round, timer, life, win y anuncios usan datos importados | Browser journey y DOM/canvas proof | Alto; motif del caso |
| AUD28-34 | Añadir segunda stage/screenpack con camera/localcoord/BG/FightFX | 33 | Dos resoluciones y camera bounds pasan sin overflow ni drift | Capturas, trace y comparación de fuente | Alto; dos rutas legales |
| AUD28-35 | Revisar 05b/4aa para `hittmp`/`acttmp`/`stchtmp` | — | Manifiesto elige pin, líneas, diferencias y negativos | Revisión firmada de fuente | Alto; fuente, sin runtime nuevo |
| AUD28-36 | Revisar 05b/4aa para projectile/ReversalDef/statePN | 35 | Segunda familia queda adjudicada y enlazada a T407…T417 | Manifiesto y mapa de tickets | Alto; fuente, sin amplitud |
| AUD28-37 | Convertir helper action/stateChange de modelo a ruta live | 35 | Consumer real usa estado por tick con helper destroy/hitpause negativos | Trace y browser route | Alto; subset IKEMEN |
| AUD28-38 | Elegir y ejecutar un subset ZSS real | 35 | Parser, schema y runtime comparten perfil y fuente exacta | Fixture legal + trace + errores | Alto; subset listado |
| AUD28-39 | Convertir team/plural de modelo a consumer live | 36/37 | Dos players/helpers prueban ownership, redirects y lifecycle | Browser route y trace multi-actor | Alto; caso plural |
| AUD28-40 | Adjudicar IKEMEN de forma independiente | 37/38/39 | Revisor separa scanner, modelo y runtime; score sólo con rutas live | Acta y score diff | Alto; sin claim full IKEMEN |
| AUD28-41 | Definir política de blobs y handles por tamaño | ADR 0073 | IDB/OPFS/handle externo tienen umbrales, permisos y recovery | ADR, matriz y estimación de cuota | Medio; arquitectura |
| AUD28-42 | Probar journey Studio por vista con revisión real | 10/11/12 | Project/assets/inspect/evidence/build/export conservan revisión y errores | Browser capture desktop/móvil | Alto; vistas probadas |
| AUD28-43 | Crear segunda cadena de asset independiente | 26 | Origen legal, receta, transforms, digest, atlas, colisión, audio y export quedan ligados | Provenance graph + visual alpha QA | Alto; asset/caso, sin compatibilidad |
| AUD28-44 | Unificar scanner de worker y CLI real | 06 | Mismo núcleo, revisión y corpus producen JSON idéntico | Parity gate con corpus hostil | Alto; scanner/CLI, sin runtime |
| AUD28-45 | Reanalizar por revisión y mostrar diff | 44/42 | Un cambio de bytes invalida reporte viejo y muestra diff trazable | Browser + CLI gate por dos revisiones | Alto; reanálisis probado |
| AUD28-46 | Crear segundo juego no fighting sobre puertos candidatos | 19/21 | Ruta jugable usa loop/input/render/assets sin imports MUGEN | Browser smoke y mapa de imports | Alto; segundo consumidor local |
| AUD28-47 | Extraer un puerto compartido con prueba de borrado | 46 | Ambos consumidores compilan; borrar adaptador fighting no rompe el segundo | Build, boundary y deletion proof | Alto; módulo probado |
| AUD28-48 | Probar package/install/CLI/CI y revisión local de release | 44/47/43 | Tarball limpio instala en fixture, CLI corre, CI reproduce, licencias cierran | Pack smoke, CI local y BOM | Alto; listo para revisión local; publicación bloqueada |

## Claims permitidos y bloqueados

### Permitidos hoy

- Gate formal/global en `f5f2315e`.
- Foco runtime T416/T417 en sus cláusulas y negativos.
- Recuperación de recibo DA32-026 en el sujeto y navegadores registrados.
- Registro de máquina hasta DA30-120 y adjudicación segura hasta DA30-020.

### Bloqueados hoy

- Gate formal del HEAD final `1b1ba28f`.
- Adjudicación DA30-021 y cualquier aumento de score.
- Determinismo completo, replay, red o rollback.
- Compatibilidad MUGEN o IKEMEN amplia.
- Recuperación total de archivos, atomicidad multi-file o tolerancia a eviction.
- SDK, paquete, CLI/CI y segundo consumidor de producción.
- Release o publicación pública.

## Fuentes primarias consultadas

- [MUGEN 1.1 documentation](https://www.elecbyte.com/mugendocs-11b1/mugen.html)
- [MUGEN trigger reference](https://elecbyte.com/mugendocs-11b1/trigger.html)
- [MUGEN state controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
- [Ikemen GO](https://github.com/ikemen-engine/Ikemen-GO)
- [Ikemen GO 4aa — temporary hit/state fields](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L3183-L3191)
- [Ikemen GO 4aa — state change fields](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L6286-L6306)
- [Indexed Database API 3.0](https://www.w3.org/TR/IndexedDB/)
- [File System Access](https://wicg.github.io/file-system-access/)
- [Gamepad](https://www.w3.org/TR/gamepad/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [Three.js resource disposal guide](https://threejs.org/manual/en/how-to-dispose-of-objects.html)

## Documentos de esta ejecución

- Este informe.
- [ADR 0073](../adr/0073-studio-source-write-recovery-journal.md).
- Plan, hallazgos y progreso bajo
  `.scratch/roadmap/daily/2026-07-28-post-da32-026/`.
- Overrides propios en navegación, milestones, next build, delivery,
  continuidad, checklist, scorecard e issues activos 01/03…07.
- El dueño concurrente actualizó backlog, DA32, execution board, tracker,
  workplan, status e issue Studio y cerró ese bloque en `1b1ba28f`.

## NO CODE CHANGED

Esta ejecución no modifica código, runtime, UI, tests ni assets. No ejecuta
suites de código y no crea commits ni push. Sólo crea o actualiza documentos
permitidos bajo `docs/` y `.scratch/roadmap/`.
