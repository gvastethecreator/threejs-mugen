# Auditoría diaria de roadmap y arquitectura post-Wayfinder 296

Fecha: 2026-07-19

Tipo: investigación, arquitectura y roadmap; sin implementación

Corte auditado: `80eec106a49dd2d73adbe82f50e821949f5ca162`

Ledger numérico canónico: Entry 562

Frontera Wayfinder: T296

Estado de rama observado: `master...origin/master [ahead 164]`

## Resumen ejecutivo

Desde la ejecución anterior entraron 95 commits hasta el corte auditado. El
avance real se agrupa en cuatro cadenas:

1. T257-T265 amplió defensa de caída y admisión `HitFlag`, incluida la ruta de
   proyectiles.
2. T266-T270 añadió manifiesto de autoridad upstream, SOCD temporal por asiento,
   diagnóstico de precedencia y procedencia de State 5900.
3. T271-T281 materializó `RuntimeRoundPhase` y varias ventanas de fin de ronda,
   match-over, win pose, timer, recursos y force-win.
4. T282-T296 construyó la ruta acotada de FightScreen: fadeout/fadein, timings de
   intro, shutter/skip/reset, anuncios Round/Fight, HUD/audio/variantes, render
   AIR/SFF y finalización `AnimTextSnd` derivada de fuente.

El último corte, T296, declara 6 archivos y 329 tests enfocados más typecheck
TypeScript 7. Su ticket referencia como checkpoint amplio anterior 235 archivos,
2502 tests, 633/633 trazas, build, boundaries, CSS y browser smoke. Ese checkpoint
es anterior a T296: no demuestra whole-HEAD en `80eec106`.

Los scores permanecen en **65 / 36 / 20 / 10-12 / 6-8 / 25**. No existe una
adjudicación nueva y el corpus versionado no está fresco. El trabajo T289-T296
vive en tickets Wayfinder y commits, mientras `BUILD_EXECUTION_BACKLOG.md` y los
documentos de navegación siguen en Entry 562/T288 o antes. Por eso deben
mantenerse tres fronteras distintas:

- implementación comprometida: T296 / `80eec106`;
- ledger canónico: Entry 562;
- evidencia amplia vigente: el último checkpoint explícitamente declarado antes
  de T296, no el HEAD actual.

## Cambios y contradicciones desde la ejecución anterior

### Hechos verificados

- El backlog numérico no contiene Entries 563-570, aunque los tickets T289-T295
  mencionan Entries 563-569. T296 no está registrado en el ledger numérico.
- `PORT_COMPLETION_SCORECARD.md`, `ROADMAP_EXECUTION_BOARD.md`,
  `ROADMAP_NAVIGATION.md`, `ROADMAP_PACKAGE_MILESTONES.md`,
  `ROADMAP_CONTINUITY_GUIDE.md` y `WORKPLAN.md` siguen en T288/Entry 562;
  `NEXT_BUILD_ROADMAP.md` sigue incluso en T287/Entry 561.
- `source-authority-manifest-v0.json` fija el commit oficial
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, registra seis de nueve archivos
  diferentes contra el cache local y conserva `semanticReview.status =
  unclassified`.
- `compatibility-corpus-snapshot-v1.json` observa el source revision
  `a2c84f05...` el 2026-07-16, con política de frescura de 24 horas. Está vencido
  y no corresponde al HEAD auditado. Además contiene dos rutas legales requeridas
  aprobadas, pero su claim permitido aún dice “one repository-owned legal
  journey”. La segunda ruta es principalmente de stage, no una segunda amplitud
  independiente de personaje.
- `RuntimeTurnsContinuationSystem.prepare()` produce un plan sin mutar, pero
  `PlayableMatchRuntime.tryAutomaticTurnsContinuation()` aplica el handoff antes
  de resolver todos los roots activos y luego reinicia/reconstruye estado sin una
  transacción ni rollback. La preflight reduce fallos, pero no hace atómico el
  commit.
- No existe un `GlobalProjectileSchedule` ni un commit global equivalente. Las
  rutas actuales prueban muchos casos acotados de proyectil, no una política
  total de arbitraje multi-owner/multi-root.
- `scripts/check_boundaries.cjs` omite roots inexistentes. `src/core` y los roots
  de platformer no existen, por lo que parte del verde es vacuo; `src/engine`
  sí existe y se inspecciona.
- Durante el cierre reapareció trabajo ajeno sin commit en
  `MugenSystemAssetsLoader.ts` y `MugenSystemAssets.ts`. Se preservó y quedó fuera
  del corte T296 y de todos los claims de esta auditoría.

### Inferencias arquitectónicas

- El riesgo dominante de FightScreen ya no es cargar un asset aislado. Es fijar
  quién posee fase, finalización, capa, transformación y persistencia sin hacer
  que el renderer gobierne la simulación.
- El siguiente corte de Turns debería ser transaccional antes de ampliar casos de
  Simul/Tag. Seguir agregando ramas sobre el commit secuencial aumenta el costo de
  rollback y hace ambiguos los fallos intermedios.
- La amplitud de proyectiles sólo será acumulable cuando exista un orden global
  observable. Más traces sobre loops locales no resuelven conflictos entre
  propietarios.
- IndexedDB puede dar atomicidad a su propio scope, pero no convierte una escritura
  a un handle externo en parte de la misma transacción. Studio necesita journal y
  compensación explícitos para coordinar ambos dominios.

### Preguntas abiertas

- ¿El producto adoptará JSON Canonicalization Scheme (RFC 8785) o mantendrá
  `stable-json/v0` con una especificación y corpus de conformidad propios?
- ¿Qué conjunto mínimo de archivos upstream debe entrar a revisión semántica para
  permitir claims de configuración/input: los nueve actuales o también
  `fightscreen.go`, `common.go`, `stage.go` y compiladores ZSS/Lua?
- ¿La segunda ruta legal de personaje debe validar sólo MUGEN 1.0/1.1 o incluir
  deliberadamente una extensión IKEMEN para separar ambos denominadores?
- ¿La capa FightScreen `layerno` se proyectará sobre una gramática cerrada del
  renderer o se expondrá como orden numérico abierto? La primera opción es más
  portable; la segunda conserva más authored intent pero complica transparencia.

## Mapa de gaps por horizonte y sistema

| Horizonte | Ya demostrado | Gap que limita el claim | Gate mínimo siguiente |
| --- | --- | --- | --- |
| Sandbox jugable | Loop jugable y cadena FightScreen acotada hasta T296 | No hay checkpoint whole-HEAD ni prueba visual actual de T296 | Suite agrupada + browser matrix en el commit exacto |
| MUGEN-lite MVP | Score 36 y una ruta legal de personaje más una ruta legal de stage | Snapshot vencido, claims internos contradictorios y sin segunda amplitud de personaje | Segundo personaje CC0 + snapshot fresco + adjudicación separada |
| MUGEN 1.0/1.1 | Score 20; bastante VM/controller/Common/round evidence acotada | Input final, Common.Fx browser, FNT/screenpack, Turns atómico y proyectiles globales | Cerrar autoridad/input/presentación; luego transacciones y scheduler |
| MUGEN completo | Score 10-12 | Orden exacto, equipos, Common/expresiones/controllers amplios, assets/paletas y estados complejos | Corpus por familias y gates de orden con claims explícitos |
| IKEMEN | Score 6-8; scanner y varias extensiones runtime acotadas | Semántica upstream sin clasificar, ZSS/Lua/Modules, Simul/Tag, rollback/netplay | Manifiesto semántico + matriz recognized/parsed/compiled/executed |
| Studio/producto | Score 25; envelopes, decisiones y export semántico acotados | Stale-source browser, reanalysis/diff persistido, proyecto releaseable y crash recovery | Evidencia revision-bound + journal multiarchivo recuperable |
| Assets/provenance | Una política releaseable de Nova | Sin segundo record independiente ni prueba de revisión cruzada | Segundo asset propio/generado con licencia, hashes y policy fresca |
| Scanner | PackageAnalysis y múltiples hallazgos | No hay inventario común uniforme para AIR/CMD/CNS/ST/ZSS/Lua/Modules | `CommonSourceRecord/v1` y capability matrix persistida |
| Modularización | `src/engine` tiene una boundary check acotada | Roots faltantes pasan de forma vacua; evidencia/canonicalización vive en `app` | Gates que fallen por roots requeridos + core realmente consumido |

## Decisiones arquitectónicas propuestas

### D1. Cursor de control con tres fronteras

Adoptar un tuple explícito `{implementationFrontier, ledgerFrontier,
broadEvidenceFrontier}`. Los documentos de navegación deben mostrar los tres.
Alternativa: promover automáticamente el Entry mencionado por cada ticket. Es
más simple, pero convierte una etiqueta local en ledger sin verificar closeout.

### D2. Autoridad upstream semántica fail-closed

Extender el manifiesto con `SourceSemanticDelta/v0`: path, commit normativo,
digest normativo/local, clasificación (`equivalent`, `adapted`, `divergent`,
`unknown`), reviewer/evidence y claim impact. Los bytes diferentes y no
clasificados nunca habilitan paridad semántica. Alternativa: conservar sólo
hashes; sirve para identidad, no para significado.

### D3. Snapshot único de política de input por match

Resolver configuración global, sistema, personaje y override explícito una vez
en `MatchInputPolicySnapshot/v0`; luego derivar estado temporal por asiento.
Separar dirección física, dirección lógica relativa al facing, SOCD y
ButtonAssist antes de reconocimiento CMD. Alternativa: resolver precedencia en
cada consumidor; mantiene flexibilidad pero permite discrepancias entre VM,
replay y UI.

### D4. Simulación de ronda separada de presentación FightScreen

`RuntimeRoundPhase` conserva la autoridad de gameplay. Los tracks Round/Fight,
FNT/AIR/SND y su finalización sólo producen presentación. Definir una gramática
cerrada de capas y mapearla a `renderOrder`, con política explícita de
`depthTest/depthWrite`; Three.js ordena opaque/transparent por separado, por lo
que un número solo no garantiza toda la composición. Alternativa: dejar que el
fin del asset avance la ronda; acopla contenido y simulación y rompe headless.

### D5. Turns como transacción recuperable

La secuencia debe ser `prepare -> validate-all -> snapshot -> commit -> verify`,
con rollback ante cualquier fallo después del primer write. El plan debe incluir
roots activos, team state, variables, recursos, round context, efectos y State
5900. Alternativa: conservar mutaciones secuenciales; es menor cambio inmediato,
pero deja estados parciales observables.

### D6. Scheduler global de proyectiles en dos fases

Recolectar intents de todos los owners, ordenar por una key estable documentada,
resolver contactos/cancelaciones y aplicar un commit único. Proxy/redirect y
telemetría deben consumir el resultado, no re-arbitrar. Alternativa: iteración
por owner; no define choques cross-root ni conserva determinismo al reordenar
colecciones.

### D7. Fuente común y capacidad separadas

Usar `CommonSourceRecord/v1` para identidad/procedencia y una capability matrix
separada con estados `recognized`, `parsed`, `compiled`, `executed`, `verified`.
Esto impide que un hallazgo del scanner se presente como soporte runtime.

### D8. Persistencia Studio con journal entre dominios

Guardar proyecto, PackageAnalysis/diff y journal en una transacción IndexedDB
corta. Tratar escrituras File System Access como efectos externos con preimage,
receipt, estado `prepared/applied/verified/compensated` y recovery al reabrir.
Alternativa: declarar una transacción cross-storage; la plataforma no ofrece esa
atomicidad.

### D9. Canonicalización en core, con contrato público

Extraer digest/canonicalización de `src/app` a un core sin MUGEN/UI. Elegir RFC
8785 o documentar exhaustivamente la divergencia de `stable-json/v0`, con vectors
de números, Unicode, ordering y round-trip. Alternativa: duplicar helpers por
módulo; genera envelopes incompatibles.

## Roadmap restante por fases y dependencias

1. **Fase A - verdad reproducible:** reconciliar cursor, ejecutar checkpoint
   whole-HEAD, clasificar upstream y reparar schema/claims del corpus.
2. **Fase B - sandbox/MUGEN-lite presentable:** cerrar Common.Fx browser, autoridad
   de input y FightScreen visual/FNT/screenpack. Depende de A para claims.
3. **Fase C - semántica multi-actor:** transacción Turns y scheduler global de
   proyectiles. Depende de políticas de estado/input estables.
4. **Fase D - amplitud y score:** segundo personaje legal, snapshot fresco y
   adjudicación independiente. Depende de A-C y no hereda score por volumen.
5. **Fase E - IKEMEN/scanner/producto:** unificar common sources, capability
   matrix, persistir reanalysis/diff, release de proyecto y recovery.
6. **Fase F - assets y modularización:** segunda procedencia independiente,
   canonicalización en core y boundaries no vacuos.
7. **Programa posterior:** Simul/Tag completos, ZSS/Lua execution, rollback y
   netplay determinista, corpus público más amplio, packaging/release rehearsal y
   extracción de módulos adicionales. Cada uno requiere ADR, corpus y evidencia
   propios; ninguno queda implícitamente cerrado por las 30 tareas inmediatas.

## Próximas 30 tareas listas para ejecución

| ID | Alcance, dependencias y sistemas probables | Criterio de aceptación y evidencia requerida | Riesgo y claims |
| --- | --- | --- | --- |
| R297 | Reconciliar T289-T296 con el ledger; depende de tickets/commits. `docs/BUILD_EXECUTION_BACKLOG.md`, scorecard y docs `ROADMAP_*`. | Cada slice queda enlazado a commit, ticket, gates y ceiling; todos los cursores muestran las tres fronteras; `git diff --check`. | Riesgo: convertir números citados en hechos sin closeout. Permite claim documental de cursor; no whole-HEAD ni score. |
| R298 | Checkpoint whole-HEAD en el commit elegido; depende de R297 y árbol estable. QA/typecheck/build/traces/boundaries/CSS/browser. | Un reporte identifica SHA exacto, comandos, versiones, pass/fail/skips y artifacts; cero fallos no explicados. | Riesgo: artifacts stale o fixture opcional. Permite sólo la amplitud ejecutada en ese SHA. |
| R299 | Clasificar los seis deltas upstream del manifiesto; depende del commit normativo materializable. `SourceAuthorityManifest`, ADR 0035, research. | Cada path cambiado tiene diff semántico, clasificación, adaptación y evidencia; `unknown` bloquea claims afectados. | Riesgo: confundir equivalencia de salida con equivalencia total. Permite autoridad revisada por path, no paridad global. |
| R300 | Diseñar `CompatibilityCorpusSnapshot/v1.2`; depende de R298. Evidence schema/materializer. | El schema deriva claims de entries, detecta claim/denominator contradictorio, fija SHA y expira artifacts fuera de policy; fixtures de migración. | Riesgo: invalidar consumidores v1.1. Permite consistencia del snapshot, no breadth nueva. |
| R301 | Cerrar residual Common.Fx en browser; depende de R298. Loader/provider/renderer/audio + smoke focal. | Fixture legal carga AIR/SFF/SND common/FightFX, produce frame/axis/layer/audio diagnostics visibles y no usa fallback inesperado. | Riesgo: una sola ruta feliz. Permite esa ruta browser; no lookup/palette/audio total. |
| R302 | Materializar `MatchInputPolicySnapshot/v0`; depende de R299. Config loader, imported fighter, runtime init, replay schema. | Precedencia global/system/character/override resuelta una vez; conflictos y origen visibles; round-trip determinista. | Riesgo: cambiar defaults actuales. Permite autoridad de config acotada, no raw-device parity. |
| R303 | Separar dirección física y lógica; depende de R302. Input bridge, facing transform, command buffer. | Matriz P1/P2, facing swap, keyboard/gamepad y replay prueba que SOCD opera en el espacio documentado y CMD recibe dirección lógica estable. | Riesgo: double-flip. Permite mapping probado, no todos los dispositivos. |
| R304 | Fijar ButtonAssist y orden del pipeline; depende de R302-R303. Input policy/command recognition. | Source audit, truth table de botones simultáneos, SOCD + assist + remap y reset de asiento; traces con orden observable. | Riesgo: asistencia altera comandos históricos. Permite modos cubiertos, no IKEMEN input completo. |
| R305 | Crear contrato de capas FightScreen; depende de T296. Renderer/presentation types + ADR. | Gramática background/fighter/foreground/HUD, mapping `renderOrder` y depth policy con prueba de transparencia/occlusion. | Riesgo: Three.js separa opaque/transparent sorting. Permite orden del corpus, no todos los screenpacks. |
| R306 | Añadir ruta FNT acotada para Round/Fight; depende de R305. Loader, font atlas, renderer. | Fuente legal con glyph metrics, alineación, escala y fallback; test de caracteres faltantes y captura desktop/mobile. | Riesgo: encoding y métricas MUGEN. Permite la fuente/charset probado, no FNT parity total. |
| R307 | Resolver `localcoord`, palette y motif inheritance; depende de R305. System assets, projection, material. | Tabla de precedencia y transforms para 320x240/640x480, palette selection y fallback; golden diagnostics y capturas. | Riesgo: mezclar coordenadas de stage/character/screenpack. Permite combinaciones probadas. |
| R308 | Browser matrix de FightScreen T282-T307; depende de R301 y R305-R307. QA smoke focal. | Fade/intro/shutter/skip/reset/Round/Fight/default/single/final/FNT/layers en resoluciones y reduced-motion relevantes; cero console/page errors. | Riesgo: screenshots vacuos. Permite rutas capturadas, no exact pixel parity upstream. |
| R309 | Definir `TurnsContinuationTransaction/v0`; depende de T270-T281. Runtime Turns/round/resources/effects. | Plan inmutable enumera reads/writes/preconditions y snapshot de rollback antes de mutar; ninguna escritura en `prepare`. | Riesgo: omitir estado oculto. Permite contrato de plan, no commit atómico aún. |
| R310 | Implementar commit/rollback Turns con fault injection; depende de R309. Playable runtime + test seams. | Fallos inyectados tras handoff, reset, root selection, resource apply y State 5900 restauran checksum pre-commit; success checksum estable. | Riesgo: rollback incompleto de efectos/audio. Permite atomicidad en matriz, no rollback/netplay. |
| R311 | Journey Turns 1->2->3; depende de R310 y R298. Fixture legal, trace y browser. | Reemplazos, winner carry, recursos, vars, round context, State 5900 y presentation se prueban en tres miembros; cero estado parcial. | Riesgo: fixture demasiado sintético. Permite ese journey Turns, no Simul/Tag. |
| R312 | Diseñar `GlobalProjectileSchedule/v0`; depende del tick schedule existente. Runtime projectile/effect owners + ADR. | Snapshot enumera intents de roots/helpers con stable key, phase y source identity; permutación de containers no cambia orden. | Riesgo: key codifica accidentalmente P1-first. Permite orden de intents, no contactos aún. |
| R313 | Commit global de contactos/cancelaciones; depende de R312. Collision, HitDef, target memory, terminal effects. | Matriz hit/guard/dodge/miss/cancel/trade, same-ID y cross-owner produce un resultado único y determinista. | Riesgo: cambiar traces existentes. Permite matriz global, no toda física de proyectil. |
| R314 | Proxy/multi-root map para projectiles; depende de R313. RedirectID, teams, helper/root ownership. | IDs, owner/root/parent, target lifetime y redirects se resuelven desde el resultado global; stale proxies fallan cerrado. | Riesgo: aliasing al reciclar actores. Permite topologías probadas, no netplay. |
| R315 | Materializar `CommonSourceRecord/v1`; depende de R299. Loader/scanner/package report. | AIR/CMD/CNS/ST/Fx/ZSS/Lua/Modules registran path, origin, precedence, digest, selected/shadowed/missing y consumer. | Riesgo: schema demasiado genérico. Permite provenance uniforme, no ejecución. |
| R316 | Capability matrix IKEMEN; depende de R315. Scanner/report/Studio. | Cada feature/source declara recognized/parsed/compiled/executed/verified con evidencia o blocker; UI/export no promueve estados. | Riesgo: inflación manual. Permite soporte por celda verificada, no score global. |
| R317 | Segundo personaje CC0 independiente; depende de R301-R304. Fixture repository-owned, loader/trace/browser. | Paquete distinto en estructura y rutas prueba idle/walk/crouch/jump/attack/guard/get-hit/fall/recovery, licencia y hashes, sin assets terceros. | Riesgo: duplicar el primer fixture. Permite segunda amplitud legal acotada. |
| R318 | Rebuild corpus v1.2; depende de R300, R311, R317 y checkpoint fresco. Evidence materializer. | Snapshot SHA-bound incluye ambos personajes y stage, artifacts actuales, denominadores legales/privados separados y cero contradicción de claims. | Riesgo: mezclar breadth de stage y character. Permite corpus observado, no score automático. |
| R319 | Adjudicación escrita de scores; depende de R318. Scorecard/report. | Evaluador compara criterios de banda con evidencia y registra move/no-move, reservas y claims; docs no cuentan como evidencia funcional. | Riesgo: premiar volumen. Sólo permite el score explícitamente adjudicado. |
| R320 | Changed-source stale envelope en browser; depende de R298. Studio source link/Evidence UI. | Tras mutar fixture legal, envelope pasa current->stale, Build/Evidence coinciden y release falla cerrado; captura y machine record. | Riesgo: estado sólo simulado. Permite invalidación browser demostrada. |
| R321 | Persistir reanalysis y semantic diff; depende de R320. ProjectStorage/PackageAnalysis/Studio. | Reopen conserva input revision, producer/ruleset, findings/delta y envelope; cambio de source genera nueva revisión y diff reproducible. | Riesgo: crecimiento de storage. Permite historia del proyecto probado. |
| R322 | Proyecto guardado releaseable; depende de R321 y R324. ReleaseDecision/export/package. | Revisión guardada limpia, evidence current, asset policies frescas y export determinista producen `canRelease=true`; dirty/stale/tampered bloquean. | Riesgo: una policy hardcoded. Permite ese proyecto releaseable, no release pública. |
| R323 | Journal multiarchivo y crash recovery; depende de R321. IndexedDB + File System Access receipts. | Kill/reopen en prepared/applied/verified recupera o compensa; preimages/digests y permisos se validan; no mixed revision observable. | Riesgo: permiso revocado impide compensar. Permite recovery de la matriz, no atomicidad del filesystem externo. |
| R324 | Segundo AssetReleasePolicy independiente; depende de pipeline actual. Asset registry/provenance/export. | Asset propio/generado distinto de Nova registra prompt/source, licencia, hashes, revisión, transformations y policy fresca consumida por R322. | Riesgo: provenance autorreferencial. Permite dos records internos, no derechos de terceros. |
| R325 | Boundary gates no vacuos; depende de inventario modular. `scripts/check_boundaries.cjs`, required roots manifest. | Roots requeridos faltantes fallan; roots futuros opcionales se declaran; output reporta archivos inspeccionados y allowlist usage. | Riesgo: bloquear transición antes de crear roots. Permite afirmar cobertura del gate, no buena arquitectura por sí sola. |
| R326 | Extraer canonicalización/evidence core; depende de D9 y R325. `EvidenceEnvelope`, source manifest, shared core. | Un solo paquete sin UI/MUGEN pasa vectors RFC8785 o divergencia documentada; todos los envelopes conservan/migran digests; app consume el core. | Riesgo: romper artifacts persistidos. Permite contrato canónico versionado, no autenticidad criptográfica. |

## Claims permitidos y bloqueados al cierre de esta auditoría

Permitido:

- afirmar que T296 está comprometido con evidencia enfocada declarada;
- afirmar que existe una cadena FightScreen AIR/SFF acotada con finalización
  `AnimTextSnd` derivada del commit upstream fijado;
- afirmar que el ledger, el snapshot del corpus y varios cursores de roadmap están
  detrás de la implementación;
- afirmar que el score vigente continúa en 65 / 36 / 20 / 10-12 / 6-8 / 25.

Bloqueado:

- whole-HEAD verde en T296;
- browser parity o pixel parity de FightScreen;
- segunda amplitud legal independiente de personaje;
- semantic parity con el cache IKEMEN local;
- Turns atómico, orden global de proyectiles, Simul/Tag, rollback/netplay;
- FNT/screenpack/palette/dialogue completos;
- proyecto públicamente releaseable, derechos sobre assets externos o full
  MUGEN/IKEMEN parity.

## Fuentes primarias consultadas

- IKEMEN GO fijado, [`AnimTextSnd` y `End`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go#L1465-L1570).
- IKEMEN GO fijado, [FightScreen round intro](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3485-L3650).
- IKEMEN GO fijado, [configuración](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/config.go) e [input](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/input.go).
- Elecbyte MUGEN 1.1, [Trigger Reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html), especialmente `RoundState` y `MatchOver`.
- Three.js, [`Object3D.renderOrder`](https://threejs.org/docs/pages/Object3D.html) y [`Material.depthTest/depthWrite`](https://threejs.org/docs/pages/Material.html).
- W3C, [Indexed Database API 3.0](https://www.w3.org/TR/IndexedDB-3/), transacciones, abort y commit atómico dentro del scope.
- WICG, [File System Access](https://wicg.github.io/file-system-access/), handles, permisos y acceso a archivos externos.
- IETF, [RFC 8785 JSON Canonicalization Scheme](https://datatracker.ietf.org/doc/html/rfc8785).

## Documentos modificados por esta ejecución

- Creado este informe. No se actualizaron los roadmaps concurrentemente editados;
  R297 describe la reconciliación segura cuando sus closeouts puedan verificarse.

## NO CODE CHANGED

Esta ejecución no modificó código, runtime, UI, tests ni configuración; no creó
commits y no hizo push. No ejecutó suites de código. Sólo creó este documento de
investigación/arquitectura/roadmap. Los cambios fuente ajenos observados al cierre
se preservaron sin edición ni atribución.
