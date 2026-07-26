# Auditoría diaria de roadmap y arquitectura después de T405

Fecha: 2026-07-26
Tipo: investigación, arquitectura y roadmap
Estado: propuesta; no cambia gates ni puntajes
Corte auditado: `c01d5e70cd153e554398f1024a96a2b716cfdcc2`
Último cierre focal: T405 en `462591ad7941f4deb8c74f97b08df613d39e1819`
Entrada formal: Entry 585

## Resumen ejecutivo

No hubo commits desde la ejecución del 25 de julio. Esa ejecución dejó la
definición de la tarea, sin una auditoría nueva. Frente al último análisis real
del 23 de julio, HEAD avanzó 25 commits: T389-T405 corrigieron la topología de
ReversalDef, ampliaron campos heredados y mutables de HitDef y cerraron un
corte focal de `air.juggle` directo.

T390 resolvió el bloqueo que tenía el análisis del 23: la rama directa consulta
los slots HitOverride del actor contrarrestado y usa el payload heredado de
ReversalDef. La ruta de Projectile sigue fuera de ese arbitraje. T405 prueba un
presupuesto directo acotado, con 5 archivos y 130 tests focales más una traza
filtrada. El último gate global continúa en T383, 36 commits detrás. El último
gate visual y de producto continúa en T342, 144 commits detrás.

El árbol actual contiene seis archivos fuente modificados, con 50 altas y 4
bajas, para sumar `StateDef juggle`. No hay T406, pruebas nuevas, traza, reporte
ni entrada formal. La revisión estática detectó tres bloqueos antes de cerrar
ese trabajo: el HitDef local pierde la diferencia entre campo omitido y valor
`0`; `applyRuntimeHitDefJuggle` no tiene llamadas; y el cambio de costo activo
puede romper la secuencia ya probada por T405 al dejar el costo en cero después
del primer contacto en caída. Ese corte queda excluido de todos los claims.

La prioridad inmediata queda así: fijar la semántica de juggle en ambos pins,
cerrar o descartar el corte reservado con su dueño, conservar la regresión T405
y ejecutar un gate global sobre un SHA limpio. Después conviene actualizar el
corpus y la prueba visual. Studio, scanner, assets y límites de módulos siguen
sin avance desde T342 o cortes anteriores.

Los puntajes permanecen en `65 / 36 / 20 / 10-12 / 6-8 / 25`.

## Límite de esta auditoría

- No se ejecutaron suites de código.
- No se cambió runtime, UI, tests, fixtures ni assets.
- Los gates citados provienen de reportes guardados.
- La revisión del corte sucio fue estática.
- La documentación no suma puntaje ni amplía soporte.
- No se hizo commit ni push.

## Cambio desde la última ejecución

| Periodo | Cambio verificado | Lectura |
| --- | --- | --- |
| Desde `2026-07-25T10:01:24Z` | Cero commits | No existe delta comprometido desde la última ejecución |
| Desde el análisis del 23, HEAD `188c4462` | 25 commits | T389-T405 y Entries 574-585 requieren conciliación |
| Rama local | `master`, 81 commits delante de `origin/master` | Estado local; no prueba publicación |
| Árbol actual | Seis fuentes modificadas y documentos sin seguimiento | Trabajo ajeno reservado; no forma parte de HEAD |

### Delta focal demostrado desde el 23 de julio

| Tramo | Capacidad acotada | Límite |
| --- | --- | --- |
| T389-T390 | `missonoverride` y corrección de la topología ReversalDef/HitOverride | Projectile y paridad amplia siguen bloqueados |
| T391-T393 | `ignorereversaldef`, estado/facing heredado y pruebas importadas | Sólo figuras directas nombradas |
| T394-T396 | `numhits` y memoria de golpes recibidos | Sin cobertura global posterior |
| T397-T404 | Campos activos de ModifyHitDef: filtros, estados, prioridades, kill, fall.kill e hitonce | Campos dinámicos y familias restantes quedan fuera |
| T405 | Presupuesto directo de `air.juggle`, rechazo y `NoJuggleCheck` | StateDef, omisión, reset completo, ModifyHitDef, Projectile y Helper quedan fuera |

### Disposición del plan DA23

- DA23-01 quedó resuelta por T390 para la rama directa.
- DA23-02 queda abierta como checkpoint global posterior a T405. Projectile no
  hereda la corrección directa.
- DA23-03 a DA23-12 siguen abiertas. La cola perdió el P0 viejo y gana el corte
  reservado de juggle.
- DA23-13 a DA23-30 siguen abiertas. No hubo avance visual, de input, equipos,
  corpus, Studio, scanner, assets ni módulos.
- EvidenceEnvelope, GateEvidence, SourceWriteReceipt con compensación,
  ProjectReleaseDecision, export semántico, PackageAnalysis v1 y su primer
  consumidor, AssetReleasePolicy v0, SourceAuthorityManifest v0, lease de
  RedirectID, round phase y handoff acotado de Turns ya existen. Las tareas
  nuevas los amplían; no vuelven a crear sus primeras versiones.

## Cursores de evidencia

| Cursor | Valor actual | Distancia a HEAD | Claim permitido |
| --- | --- | ---: | --- |
| HEAD | `c01d5e70` | 0 | Contenido comprometido, sin heredar gates viejos |
| Formal | Entry 585 | 0 | Último cierre escrito |
| Focal runtime | T405 / `462591ad` | 1 commit documental | Corte directo nombrado |
| Global | T383 / `38d62678` | 36 commits | Sólo el SHA de T383: 241 archivos, 2706 tests, 650 trazas, build y límites |
| Visual | T342 / `1085badb` | 144 commits | Vistas y viaje probados en T342 |
| Producto | T342; decisión T235; export T236 | 144 o más | Flujos locales nombrados |
| Gate estático de Studio | `d69d12a` | 379 commits | Gate guardado para ese sujeto y fecha |
| Corpus v1.1 | `a2c84f05` | 383 commits | Snapshot histórico; no base actual de score |
| Fuente normativa | `05b7d98a` | 51 commits detrás de `4aa0ba38` | Procedencia fijada; revisión semántica `unclassified` |
| Árbol reservado | seis fuentes de juggle | fuera de HEAD | Ninguno |

### Frescura guardada

- CompatibilityCorpus/v1.1 declara 24 horas máximas y apunta a `a2c84f05`.
  Cuatro de sus ocho artefactos existen con un hash distinto al guardado.
- Studio GateEvidence se observó el 16 de julio, permite 168 horas y apunta a
  `d69d12a`. El validador calcula edad, pero no exige que `sourceRevision`
  coincida con HEAD.
- Studio sigue mostrando `Runtime playtest` como `runnable` y `canExport: true`
  mediante datos fijos.
- SourceAuthorityManifest/v0 fija `05b7d98a`, compara un cache sucio de
  `044da720` y mantiene la revisión semántica sin clasificar. T389-T405 citan
  `4aa0ba38`.

## Verdad de evidencia

### Hechos verificados

1. HEAD es `c01d5e70`; no hubo commits después del inicio de la ejecución del 25.
2. T405 y Entry 585 son los últimos cierres focal y formal.
3. T383 está 36 commits detrás de HEAD y sigue como último gate global.
4. T342 está 144 commits detrás de HEAD y sigue como último gate visual y último cambio de Studio.
5. Los puntajes no tienen una adjudicación posterior.
6. T390 corrigió la topología directa de T389.
7. La ruta Projectile termina antes del arbitraje directo de ReversalDef/HitOverride.
8. El árbol reservado toca seis fuentes, suma 50 líneas y quita 4.
9. El árbol reservado no tiene ticket, test, traza, reporte ni entrada formal.
10. El HitDef comprometido convierte `air.juggle` omitido en `0` al crear el movimiento.
11. La función sucia `applyRuntimeHitDefJuggle` no tiene callers.
12. La función sucia de contacto usa el costo del estado cuando `juggle` existe y lo lleva a cero tras un contacto en caída.
13. Las pruebas T405 siguen construyendo movimientos con costo estático y no prueban el nuevo origen del costo.
14. En Elecbyte, `StateDef juggle` omitido en un ataque hereda el éxito de juggle del estado atacante anterior.
15. En Elecbyte, HitDef `air.juggle` es un costo adicional para proyectiles y vale `0` si se omite.
16. En ambos pins de Ikemen, un HitDef directo explícito actualiza `c.juggle`; uno omitido deja el costo activo y fija su propio campo en cero.
17. En ambos pins, el contacto directo en caída descuenta `c.juggle` y luego lo lleva a cero, incluso con `NoJuggleCheck`.
18. En ambos pins, StateDef puede asignar `c.juggle` al entrar al estado.
19. Las líneas que contienen `juggle` en `char.go`, `compiler.go`, `compiler_functions.go` y `bytecode.go` son iguales entre `05b7d98a` y `4aa0ba38`.
20. La wiki oficial actual dice que un StateDef con `movetype` distinto de `A` usa cero sin exigir `ikemenversion`; ambos pins revisados condicionan el reset periódico a `ikemenversion`. La diferencia queda abierta.
21. El corpus guardado está 383 commits detrás y 4 de 8 hashes no coinciden.
22. El gate estático de Studio está 379 commits detrás.
23. PackageAnalysis/v1 guarda analizador, ruleset, pin, fuente, digest semántico y checksum.
24. PackageAnalysis sólo clasifica hallazgos como `recognized`, `unsupported` o `unknown`.
25. Studio agrega toda la biblioteca de fighters, stages y assets auxiliares al manifiesto de proyecto.
26. ProjectReleaseDecision exige que toda esa biblioteca pase la política. Un asset sin uso puede bloquear un proyecto válido.
27. La compensación de escritura guarda el preimage en memoria; no hay intent duradero antes de tocar disco.
28. JSON dañado en el índice local de trazas se trata como un índice vacío.
29. `check_boundaries.cjs` omite roots ausentes; `src/core` y los roots platformer no existen.
30. EvidenceEnvelope vive bajo `src/app`, importa tipos MUGEN y sus dos adaptadores alimentan Studio.

### Inferencias que requieren ejecución

1. El corte reservado rompe la segunda admisión T405: el primer contacto deja el costo activo en cero y el siguiente HitDef no lo repone.
2. El cambio del `Pick` de runtime puede romper fixtures que no proveen `moveType`.
3. Un StateDef no atacante con `juggle` explícito puede tener orden distinto entre entrada y reset.
4. La ruta legacy MUGEN puede heredar o limpiar juggle de forma distinta a la ruta Ikemen local propuesta.
5. Projectile puede conservar la topología vieja de ReversalDef/HitOverride.
6. El gate visual de T342 puede ocultar regresiones de los 144 commits siguientes.
7. Un proyecto que usa sólo Nova puede quedar bloqueado por nueve assets diagnósticos sin uso.
8. Un cierre de pestaña entre escritura y reimportación puede perder la reparación pendiente.

### Preguntas abiertas

1. ¿El dueño del árbol reservado lo cerrará como T406 o lo descartará?
2. ¿La regla actual de la wiki de Ikemen pertenece a un commit posterior a `4aa0ba38`?
3. ¿Un StateDef no atacante con `juggle` explícito conserva el valor durante algún punto observable del tick?
4. ¿Qué actor y qué generación forman la clave de juggle para Helper y nested Helper?
5. ¿Qué reset limpia el ledger: target drop, cambio de ronda, muerte, reemplazo o destrucción del actor?
6. ¿`4aa0ba38` se promueve como época normativa o queda como época por familia?
7. ¿Qué referencias forman el cierre transitivo de assets de un proyecto?
8. ¿Qué segundo personaje y segundo asset propios aportan una ruta independiente?
9. ¿Qué consumidor aparte de Studio justifica extraer el contrato común?

## Mapa de gaps por horizonte

| Horizonte | Demostrado | Gap actual | Próxima evidencia | Claim permitido |
| --- | --- | --- | --- | --- |
| Sandbox jugable, 65 | Match local, HUD, stages propios, teclado, debug y Studio | HEAD sin gate global, juggle reservado, gamepad vacío y visual viejo | Cierre T406, gate global y smoke actual | Sandbox local para rutas probadas |
| MUGEN-lite, 36 | Un viaje de personaje y uno de stage, ambos propios/CC0 | Corpus viejo, 4 hashes distintos y una sola ruta legal de personaje | Corpus v1.2 y segundo personaje | MVP acotado al corpus actual |
| MUGEN 1.0/1.1 MVP, 20 | Loader, VM parcial, combate, Helper, Projectile, Common1 y presentación parcial | Juggle, Projectile/Reversal, throws, input, paletas, audio y screenpack | Oracles de interacción y viajes visibles | Infra y familias nombradas |
| MUGEN completo, 10-12 | Base técnica y trazas | Cobertura de controladores, medios, timing y paquetes reales | Corpus por familias y denominadores | Fundación local |
| IKEMEN, 6-8 | Perfil, scanner, Tag/Turns/Helper y RedirectID acotados | Dos pins, juggle parcial, equipos, orden plural, ZSS/Lua/modules, rollback y netplay | Época por familia, Turns y scheduler global | Cortes por ticket y pin |
| Studio/producto, 25 combinado | Workbench, write receipt, evidencia, build y export diagnóstico | Gate viejo, playtest fijo, cierre de assets, historia, reanálisis y recovery | EvidenceSubject, ProjectAssetClosure y journal | Prototipo local |
| Assets/provenance | Nova con política v0 | Una cadena lista, QA acotado y biblioteca completa en release | Policy v1 y segundo asset propio | Nova con límites escritos |
| Scanner | PackageAnalysis v1 en Studio y ZIP | Fases mezcladas, falso positivo y sin diff persistido | Vector por fase y reanálisis | Reconocimiento estático |
| Modularización, 10 interno | Contratos y script de límites | Roots vacíos, allowlist total y un flujo consumidor | Manifest fail-closed y dos consumidores | Intención y contratos locales |

## Mapa de gaps por sistema

| Sistema | Gap | Dependencia | Riesgo |
| --- | --- | --- | --- |
| Control | Cursores distintos y selectores T287/T288 | RoadmapCursor | Claims heredados |
| Fuente | `05b` normativo y `4aa` usado por T389-T405 | Epoch por familia | Oracles mezclados |
| Juggle | Omisión, origen, reset y orden de tick sin contrato | Matriz oficial | Regresión T405 |
| Direct combat | T405 focal, sin gate global | Cierre del árbol reservado | Promoción falsa |
| Projectile | Reversal y juggle fuera de la ruta directa | Scheduler global | Orden y actor incorrectos |
| Presentación | T342 como último browser gate | Fixture legal y HEAD limpio | Regresión invisible |
| Input | Gamepad sin datos y política dispersa | Snapshot lógico | Divergencia entre pad, teclado y replay |
| Turns | Handoff por pasos | Transacción integral | Estado parcial |
| Corpus | Revisión vieja, edad y hashes distintos | Gate global y browser | Score sin base actual |
| Studio evidencia | Gate viejo y playtest fijo | EvidenceSubject | Verde para otro sujeto |
| Release | Biblioteca completa en vez de cierre usado | ProjectAssetClosure | Bloqueo falso |
| Persistencia | Preimage en memoria | Journal duradero | Pérdida tras crash |
| Scanner | Reconocer puede parecer ejecutar | Vector por fase | Claim IKEMEN falso |
| Assets | Una sola cadena lista | Policy v1 | Cobertura pobre |
| Módulos | Roots ausentes se omiten | BoundaryManifest | Gate vacío |

## Decisiones de arquitectura propuestas

### D1. RoadmapCursor/v1 con exclusiones del árbol

Campos: HEAD, formal, focal, global, visual, producto, fuente, scores, branch y
dirty exclusions. Cada cursor lleva SHA, fecha, artefacto y límite de claim.

Alternativa: seguir con selectores manuales en cada documento. Tiene menos costo
inicial y mantiene la deriva actual.

### D2. SourceAuthorityEpoch/v1 por familia

Cada familia queda `same`, `changed-reviewed`, `changed-blocked` o `unreviewed`.
La familia juggle puede registrar igualdad textual en cuatro archivos entre los
dos pins. El conflicto entre wiki y pin queda como bloqueo semántico.

Alternativas: promover `4aa` para todo o retener `05b` para todo. Ambas mezclan
familias revisadas con familias sin revisar.

### D3. ActiveJuggleCost/v1 con presencia explícita

Campos mínimos: valor, origen (`statedef`, `hitdef`, `projectile`, `default`),
campo presente, perfil, owner, estado, tick y source epoch. El parser conserva
la presencia aunque el valor normalizado sea cero. Un HitDef omitido no cambia
el costo activo directo; uno explícito sí.

Alternativa: usar `DemoMove.airJuggle ?? 0`. Esa forma borra la diferencia que
la fuente usa para decidir si actualiza `c.juggle`.

### D4. JuggleLedger/v1 en el defensor

El defensor guarda puntos restantes por identidad estable del atacante y su
generación. El contrato nombra add, retain, spend, bypass, inherit y drop.
StateDef, HitDef, ModifyHitDef, Projectile y Helper alimentan el mismo dueño.

Alternativa: mapas separados por ruta. Duplica reset, target drop y telemetría.

### D5. Entrada, contacto y reset como fases visibles

Orden propuesto: enter state, aplicar StateDef, activar HitDef, admitir, resolver,
gastar, resetear costo, confirmar ledger. Cada fase emite origen y valor. La
matriz separa MUGEN e Ikemen.

### D6. Gate focal seguido por gate global

El cierre del corte reservado requiere pruebas y traza focales. El checkpoint
global corre después, sobre un SHA sin cambios fuente pendientes. Ningún paso
sube scores.

### D7. MatchInputPolicySnapshot/v1

Teclado, gamepad y replay producen el mismo dato lógico por asiento, con botón
físico, acción, facing, SOCD, deadzone, conexión y tick.

### D8. Transacciones para Turns y orden global para Projectile

Turns usa `prepare -> validate -> commit -> restore`. Projectile usa
`gather -> stable sort -> resolve -> commit`. Ambos registran revisiones de
actores y checksum.

### D9. EvidenceSubject/v1 y ProjectAssetClosure/v1

La evidencia liga proyecto, fuente, runtime, target, herramienta y artefacto.
El cierre de assets parte del entry y recorre sólo referencias transitivas. El
catálogo de Studio queda fuera de la decisión de release cuando un asset no se
usa.

### D10. StudioProjectSnapshot/v1 y SourceWriteJournal/v1

IndexedDB guarda snapshots, análisis y journal. Los handles conservan acceso al
sistema de archivos. El journal registra intent antes de escribir, preimage,
fases, commit, rollback y replay idempotente.

La especificación de File System Access exige permisos que pueden volver a
`prompt` al recuperar un handle de IndexedDB. El recovery debe mostrar ese
estado y pedir activación del usuario cuando corresponda.

### D11. ScannerCapabilityVector/v1

Cada señal guarda un ID estable y hechos separados: recognized, parsed,
lowered, executed y verified. Cada hecho cita su evidencia. Ninguna fase nace
por inferencia de otra.

### D12. BoundaryManifest/v1 con fallo cerrado

Cada root se declara required, optional o planned. Un required ausente falla.
Un planned queda fuera del claim. La extracción común empieza después de dos
consumidores reales.

## Roadmap restante por fases

### Fase 0 — Converger el corte reservado

DA26-01 a DA26-07. Acordar dueño, fijar fuente, conservar omisión, cerrar orden
de reset, ampliar trazas y cerrar el ticket focal.

### Fase 1 — Gate y control

DA26-08 a DA26-11. Ejecutar checkpoint global, publicar cursor, clasificar la
época de fuente y sincronizar autoridades.

### Fase 2 — Sandbox y evidencia visible

DA26-12 a DA26-14. Fixture FightScreen propio, browser gate actual y gamepad.

### Fase 3 — Equipos y orden plural

DA26-15 a DA26-18. Turns atómico y scheduler global de proyectiles.

### Fase 4 — MUGEN-lite y puntajes

DA26-19 a DA26-21. Corpus actual, segundo personaje legal y adjudicación.

### Fase 5 — Studio y release

DA26-22 a DA26-26. Sujetos reales, cierre de assets, snapshots, diff y recovery.

### Fase 6 — Scanner, assets y módulos

DA26-27 a DA26-30. Vector de fases, segunda cadena de asset, límites fail-closed
y dos consumidores.

### Después de estas 30 tareas

- MUGEN MVP: expresiones dinámicas por familia, throws, custom states,
  guard/no-guard KO, paletas, Common1, audio común, FightFX y screenpack mínimo.
- MUGEN completo: más personajes, stages y screenpacks propios, denominadores
  de controladores, medios, timing y paquetes, con gates por familia.
- IKEMEN: Simul/Tag/Turns completos, ocho actores, ZSS, Lua, modules, replay,
  rollback y netplay, cada bloque con pin, oracle y prueba de usuario.
- Studio/producto: migraciones, cuota, revisión de evidencia accesible,
  rendimiento, export/import de proyectos y política de publicación.
- Motor modular: un consumidor ajeno a fighting después de fijar dos flujos
  reales y límites activos.

## Próximas 30 tareas listas para ejecución

| ID | Alcance, dependencia y sistemas probables | Aceptación y evidencia | Riesgo y claim |
| --- | --- | --- | --- |
| DA26-01 | Acordar dueño y destino del diff de juggle. Dep.: ninguna. Git, ticket y seis fuentes reservadas. | Ticket o descarte explícito; base SHA y write-set; ningún archivo ajeno mezclado. Evidencia: status, diff numstat y decisión. | Riesgo: pisar trabajo concurrente. Claim: sólo propiedad del corte. |
| DA26-02 | Matriz oficial de juggle en `05b` y `4aa`. Dep.: DA26-01. `char.go`, `compiler.go`, `compiler_functions.go`, `bytecode.go`. | StateDef presente/omitido, HitDef presente/omitido, perfil, no-A, contacto, NoJuggleCheck y reset con líneas y orden. Evidencia: hashes y enlaces fijados. | Riesgo: wiki y pin difieren. Claim: reglas de esos pins. |
| DA26-03 | Diseñar e implementar ActiveJuggleCost/v1. Dep.: DA26-02. Parser, modelo, compiler y runtime types. | Presencia separada de valor; origen y epoch visibles; `0` explícito difiere de omitido. Evidencia: unitarios de parse/lowering. | Riesgo: migrar fixtures. Claim: representación y casos probados. |
| DA26-04 | Fijar entrada y reset por perfil. Dep.: DA26-03. State entry, move type y state change. | Matriz A->A, A->I, I->A, StateDef omitido/0/positivo, MUGEN e Ikemen. Evidencia: pruebas de tick y trace de fases. | Riesgo: orden no observable. Claim: transiciones nombradas. |
| DA26-05 | Conectar HitDef al costo activo y preservar T405. Dep.: DA26-03/04. HitDefSystem y RuntimeJuggleSystem. | HitDef explícito actualiza; omitido conserva; primer gasto resetea; segundo HitDef explícito repone; rechazo T405 sigue. Evidencia: unitarios focales. | Riesgo: costo cero permite hit extra. Claim: secuencia directa probada. |
| DA26-06 | JuggleTrace/v1. Dep.: DA26-05. Snapshots, QA trace y preset T405. | Cada decisión muestra actor/generación, origen, costo, restante, falling, bypass y reset. Evidencia: JSON requerido y negativos. | Riesgo: traza verde con estado oculto. Claim: causalidad de la figura. |
| DA26-07 | Cerrar o rechazar T406. Dep.: DA26-01 a 06. Ticket, map, reporte y backlog. | Mismo SHA en ticket/reporte/Entry; typecheck y suites focales; diff limpio del corte. | Riesgo: cierre parcial. Claim: StateDef/HitDef directos nombrados; Projectile/Helper bloqueados. |
| DA26-08 | Checkpoint global post-T405/T406. Dep.: DA26-07 y árbol fuente limpio. QA completo. | TypeScript 7, Vitest completo, trazas agregadas, build, boundaries, redirect-boundary y diff ligados al SHA. | Riesgo: proyectar T383. Claim: gate global del SHA exacto; sin score. |
| DA26-09 | RoadmapCursor/v1. Dep.: DA26-08. Docs y materializador de control. | Siete cursores, branch, scores y exclusiones sucias con SHA/fecha/artefacto. Evidencia: stale y mismatch. | Riesgo: dos writers. Claim: estado de control. |
| DA26-10 | SourceAuthorityEpoch/Manifest v1. Dep.: DA26-02/08. Manifest, ADR y PackageAnalysis. | Ambos pins, archivos faltantes, familias y estado semántico; tamper falla. Evidencia: SHA-256 y comparación oficial. | Riesgo: promoción global sin revisión. Claim: procedencia por familia. |
| DA26-11 | Sincronizar autoridades. Dep.: DA26-09/10. Docs principales e issues 01-07. | Un selector actual; históricos marcados; cola sin gates cerrados. Evidencia: auditor de referencias. | Riesgo: borrar historia. Claim: control consistente. |
| DA26-12 | Fixture FightScreen propio/CC0. Dep.: DA26-08/10. fight.def, FightFX, FNT, AIR y audio propio. | Folder y ZIP; round, KO, draw, time-over, win type, skip, reset y fallback. Evidencia: licencia, hashes y traza. | Riesgo: fixture poco diverso. Claim: paquete nombrado. |
| DA26-13 | Browser gate actual. Dep.: DA26-12. Studio, runtime y renderer. | Escritorio/tablet/móvil, consola, foco, clipping, reduced motion, contacto y Common.Fx visibles/audibles. Evidencia: capturas, DOM y SHA. | Riesgo: baseline viejo. Claim: viaje y vistas probados. |
| DA26-14 | MatchInputPolicySnapshot y gamepad. Dep.: DA26-08. Input, SOCD, App y replay. | Dos asientos, deadzone, remapeo, desconexión y replay determinista. Evidencia: unitarios y navegador. | Riesgo: APIs por navegador. Claim: dispositivos probados. |
| DA26-15 | RuntimeTurnsTransaction/v1. Dep.: DA26-08/14. Handoff, roster, state 5900, recursos y effects. | Fault injection en cada fase restaura checksum integral; éxito emite recibo. | Riesgo: estado fuera del snapshot. Claim: fixtures atómicos. |
| DA26-16 | Viaje Turns 1-2-3. Dep.: DA26-13/15. Teams, HUD y browser. | Dos reemplazos, recursos, input, efectos y resultado sin residuos. Evidencia: traza, capturas y checksums. | Riesgo: pausa no cubierta. Claim: viaje nombrado. |
| DA26-17 | GlobalProjectileSchedule/v1. Dep.: DA26-08. Roots, Helpers y projectile combat. | Gather, orden estable y commit global; inserción/lado no cambian resultado. Evidencia: órdenes invertidos. | Riesgo: timing previo. Claim: scheduler de fixtures. |
| DA26-18 | Oracle plural de Projectile/Reversal/juggle. Dep.: DA26-17 y DA26-05. | Tres owners, Helper, empate, cancel, hitpause, ReversalDef, costo y reset con checksum estable. | Riesgo: matriz grande. Claim: celdas probadas. |
| DA26-19 | CompatibilityCorpus/v1.2. Dep.: DA26-08/13/16/18. Snapshot y materializador. | HEAD/ruleset actuales, cero hash distinto, edad contra reloj y artefacto ausente bloquea. Evidencia: snapshot canónico. | Riesgo: artefactos ignorados. Claim: corpus v1.2. |
| DA26-20 | Segundo personaje legal independiente. Dep.: DA26-19. Loader, VM, Common1, combate y presentación. | Import, walk, jump, hit, guard, KO y ruta propia sin adaptador por personaje. Evidencia: licencia, hashes, trazas y capturas. | Riesgo: poca diversidad. Claim: dos personajes nombrados. |
| DA26-21 | Adjudicar puntajes. Dep.: DA26-19/20. Scorecard y cursor. | Cada punto cita denominador, SHA y evidencia independiente; docs valen cero. Evidencia: tabla criterio-decisión. | Riesgo: doble conteo. Claim: puntaje adjudicado. |
| DA26-22 | EvidenceSubject y RealPlaytestReadiness v1. Dep.: DA26-09/13. GateEvidence, StudioEvidenceEnvelope y release decision. | Repo/proyecto/runtime/target reales; missing/current/stale/failed; ningún gate viejo recibe revisión actual. Evidencia: unitarios y browser. | Riesgo: invalida v0. Claim: gate exacto para sujeto. |
| DA26-23 | ProjectAssetClosure/v1. Dep.: DA26-22. StudioModel y manifest de proyecto. | Cierre desde entry, referencias transitivas, ciclos y faltantes; asset sin uso no bloquea. Evidencia: fixtures positivas/negativas. | Riesgo: dependencia oculta. Claim: assets usados por el proyecto. |
| DA26-24 | StudioProjectSnapshot/v1. Dep.: DA26-22/23. IndexedDB, storage y Studio. | Guarda manifest, fuente, autoridad, análisis y versiones; reopen conserva identidad. Evidencia: migración, cuota y daño. | Riesgo: tamaño. Claim: historial local. |
| DA26-25 | PackageAnalysisRevision y diff. Dep.: DA26-24. PackageAnalysis, Studio y ZIP. | Add/remove/change/downgrade al variar fuente, ruleset o upstream. Evidencia: fixtures y checksums. | Riesgo: orden parece cambio. Claim: diff entre dos análisis fijos. |
| DA26-26 | SourceWriteJournal/v1. Dep.: DA26-24. SourceWriteReceipt, handles e IndexedDB. | Intent antes de escribir, preimage, fases, retry, rollback y replay tras reabrir. Evidencia: fault injection y permiso revocado. | Riesgo: sin transacción común. Claim: fallos probados recuperables. |
| DA26-27 | ScannerCapabilityVector/v1. Dep.: DA26-10/25. Scanner y reportes. | IDs estables y cinco fases; `select.def` MUGEN queda negativo; downgrade visible. Evidencia: matriz por fase. | Riesgo: scanner crece sin runtime. Claim: última fase probada. |
| DA26-28 | AssetReleasePolicy/v1 y segundo asset. Dep.: DA26-23/24/26. Provenance, policy y bundle. | Revisión de policy/proyecto/asset, transforms observadas, QA, colisión, playtest y reopen; dos cadenas independientes. | Riesgo: copiar supuestos de Nova. Claim: dos assets nombrados. |
| DA26-29 | BoundaryManifest/v1 fail-closed. Dep.: DA26-09. Script, ArchitectureBoundaries y ModuleContracts. | Required ausente falla; planned no suma; allowlist total falla; import y término prohibidos fallan. Evidencia: self-tests negativos. | Riesgo: root vacío. Claim: límites activos cubiertos. |
| DA26-30 | Hechos comunes y dos consumidores. Dep.: DA26-25/28/29. EvidenceEnvelope, adaptadores y core. | Core sin app/MUGEN; quitar un adaptador no rompe otro; dos flujos producen bytes canónicos iguales. Evidencia: grafo, deletion test y boundaries. | Riesgo: extracción temprana. Claim: contrato usado por dos consumidores. |

## Orden inmediato

1. DA26-01 y DA26-02.
2. DA26-03 a DA26-07.
3. DA26-08.
4. DA26-09 a DA26-11.
5. DA26-12 a DA26-18.
6. DA26-19 a DA26-21.
7. DA26-22 a DA26-30.

## Riesgos y controles

| Riesgo | Probabilidad / impacto | Control |
| --- | --- | --- |
| Perder la omisión de HitDef | Alta / alta | ActiveJuggleCost y casos omitido/0 |
| Regresión de la secuencia T405 | Alta / alta | DA26-05 antes del cierre |
| Mezclar pins o wiki actual | Alta / alta | Epoch por familia y matriz fijada |
| Proyectar T383 a HEAD | Alta / alta | Gate global del SHA exacto |
| Proyectar T342 a producto actual | Alta / alta | Browser gate post-HEAD |
| Projectile conserva topología vieja | Media / alta | Scheduler y oracle plural |
| Corpus parece vigente | Alta / alta | Edad al consumir y hashes actuales |
| Studio muestra playtest verde fijo | Alta / alta | EvidenceSubject y estado real |
| Asset sin uso bloquea release | Alta / alta | ProjectAssetClosure |
| Escritura pierde reparación tras crash | Media / alta | Journal duradero |
| Scanner eleva reconocimiento a soporte | Media / alta | Vector por fase |
| Boundary pass vacío | Alta / alta | Manifest fail-closed |

## Fuentes oficiales consultadas

### MUGEN / Elecbyte

- [CNS 1.0: StateDef, juggle y herencia por omisión](https://elecbyte.com/mugendocs/cns.html)
- [HitDef y Projectile: air.juggle](https://elecbyte.com/mugendocs/sctrls.html)
- [Tutorial oficial de juggling](https://elecbyte.com/mugendocs/tutorial4.html)

### Ikemen GO

- [Pin 4aa0ba38: HitDef air.juggle y actualización de c.juggle](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L999-L1005)
- [Pin 4aa0ba38: gasto y reset tras contacto](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11490-L11505)
- [Pin 4aa0ba38: reset fuera de ataque](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11983-L11989)
- [Pin 4aa0ba38: admisión directa](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L13308-L13322)
- [Pin 4aa0ba38: StateDef juggle en compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler.go#L6661-L6674)
- [Pin 4aa0ba38: aplicación de StateDef juggle](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L4896-L4905)
- [Wiki oficial: sistema de juggle](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#juggle-system-nightly-build-only)
- [Wiki oficial: HitDef air.juggle](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-(changed)#airjuggle-changed-nightly-build-only)
- [Wiki oficial: JugglePoints](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-(new)#jugglepoints-nightly-build-only)

### Plataforma web y procedencia

- [IndexedDB 3.0](https://w3c.github.io/IndexedDB/)
- [File System Access](https://wicg.github.io/file-system-access/)
- [RFC 8785, JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785)
- [SPDX 3.0.1](https://spdx.github.io/spdx-spec/v3.0.1/)

No se abrió una decisión nueva de Three.js en esta ejecución. El delta desde
T388 pertenece a runtime y evidencia; el renderer no cambió y su aceptación
continúa en T342. La tarea visual DA26-13 exige revisar Three.js oficial cuando
fije orden, mezcla, material o ciclo de vida de recursos.

## NO CODE CHANGED

Esta auditoría sólo creó o actualizó documentos bajo `docs/` y
`.scratch/roadmap/`. No modificó código, runtime, UI, tests, fixtures ni assets.
No ejecutó suites de código, commits ni push.
