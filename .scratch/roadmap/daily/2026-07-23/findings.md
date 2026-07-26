# Hallazgos 2026-07-23

## Estado

- HEAD: 188c4462.
- Delta desde el informe previo: 23 commits.
- T388 es el último cierre focal.
- T383 es el último gate global.
- T342 es el último gate visual.
- Entry 573 es la última entrada formal.
- Scores sin cambio.

## P0 runtime

- RuntimeCombatResolutionSystem busca el HitOverride de ReversalDef en defender.runtime.
- En esa rama, defender es el reversor y attacker es quien trae el HitDef.
- Ikemen hitResultCheck usa el HitDef del reversor y recorre getter.hover.
- getter es el atacante contrarrestado.
- La misma regla aparece en 05b7d98 y 4aa0ba38.
- Los tests del HEAD colocan HitOverride y ReversalDef en el mismo actor.
- Falta separar papeles, usar el payload heredado correcto y cubrir Projectile.

## Evidencia y control

- T383: TypeScript 7, 241 archivos / 2706 tests, 650 trazas, build de 329 módulos y límites.
- T384–T388: gates focales.
- HEAD post-T388: sin ticket, reporte, mapa o entrada formal.
- Los docs de control principales aún muestran T287/T288 en su selector.
- Los issues 01–07 aún usan el override post-T268.
- Corpus v1.1: 358 commits detrás por sourceRevision; 4 de 8 hashes distintos.
- Studio GateEvidence: 354 commits detrás; un solo gate de límites.
- El snapshot de corpus compara observedAt y referenceAt guardados. No envejece contra el reloj al leer.
- Studio fija Runtime playtest como ok/runnable/exportable sin artefacto actual.

## Fuente

- La comparación 05b7d98...4aa0ba38 tiene 51 commits y 34 archivos.
- Líneas relevantes iguales entre pins:
  - compiler_functions.go: 18 de 18 líneas de tokens; delta 0.
  - bytecode.go: 24 de 24; delta 0.
  - char.go: 13 de 13; delta 0.
- Tokens: missonoverride, ModifyReversalDef, reversal.guardflag, p1sprpriority y p2sprpriority.
- Deltas reales fuera de esa familia:
  - char.go: caso de ancho cero y push.
  - fightscreen.go y system.go: round y match.
  - state.go: stage y stats dentro de rollback.
  - system.go: Turns preload y flujo de rollback.
- SourceAuthorityManifest/v0 omite compiler_functions.go y fightscreen.go; semanticReview sigue unclassified.

## Runtime restante

- RuntimeRedirectedTargetDispatchSystem ya tiene lease, identidad y generación.
- deferredRootConstraintRedirects aún guarda cierres crudos.
- Turns prepara un plan y confirma cambios por pasos sin rollback integral.
- MatchInteractionSystem resuelve proyectiles por lado; no hay scheduler global.
- GamepadInputAdapter devuelve un conjunto vacío.
- No hay prueba visual directa de FightScreen importado.

## Studio, scanner, assets y módulos

- T342 está 119 commits detrás.
- Package Analysis v1 ya funciona en Studio y ZIP; no replanificar.
- Falta historia y diff de reanálisis.
- Scanner sólo usa recognized, unsupported y unknown.
- data/select.def puede activar una señal IKEMEN aunque sea un screenpack MUGEN común.
- findingId incluye estado y detalle; un cambio de reglas puede cambiar la identidad.
- Nova sigue como único asset listo; 9 quedan sólo para diagnóstico.
- AssetReleasePolicy no liga revisión de política y proyecto.
- check_boundaries omite src/core, src/modules/platformer y src/platformer cuando faltan.
- El único archivo de src/engine queda permitido por lista.
- Dos adaptadores de EvidenceEnvelope alimentan un solo flujo Studio; faltan dos consumidores de dominio.

## Fuentes primarias

- GitHub oficial: comparación de pins y char.go en ambos pins.
- W3C IndexedDB 3.
- WICG File System Access.
- RFC 8785.
- Three.js Object3D.renderOrder.

## Fallos de herramientas y corrección

- CODEX_HOME estaba vacío. Se usó la ruta literal C:/Users/cristian/.codex.
- Un glob de rg para una fecha falló en PowerShell. Se usó la opción -g.
- Varias agregaciones PowerShell terminaron en An empty pipe element is not allowed al enviar un foreach directo a Format-Table. Se materializó una lista en la variable rows.
- ConvertFrom-Json convirtió una fecha según locale y Parse falló. Se usó cast directo a DateTimeOffset.
- Una llamada functions.exec recibió PowerShell fuera del wrapper JavaScript. Se repitió mediante shell_command.
- Búsquedas amplias truncaron salida. Se cambiaron por archivos y rangos concretos.

## Claim ceiling

Permitido:

- T388 como último cierre focal.
- T383 como último gate global.
- T342 como último gate visual.
- Contradicción estática P0 y tareas propuestas.

Bloqueado:

- T389 como cierre formal.
- Verde global de HEAD.
- Paridad de missonoverride.
- Promoción global de 4aa0ba38.
- Alza de scores.
- Release de proyecto, MUGEN completo o IKEMEN completo.
