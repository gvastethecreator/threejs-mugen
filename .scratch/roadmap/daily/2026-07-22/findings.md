# Hallazgos — 2026-07-22

## Verificados en el repo

- Hay 100 commits desde `a91da04e` y 33 desde la ejecucion fallida del 2026-07-21.
- T340–T377 agregan evidencia estrecha sobre Helper, colisiones, restricciones y `RedirectID`.
- T369 conserva el ultimo gate global: Vitest `241/241` y `2661/2661`, TypeScript 7, build de 329 modulos, trazas `636/636` y boundaries.
- T370–T377 solo registran pruebas focales y control de diff. Sus gates amplios quedaron diferidos.
- Los documentos de control principales siguen apuntando a T288 / Entry 562. `PROGRESS_TRACKER.md` y `WORKPLAN.md` llegan a T376.
- El manifiesto de autoridad fija Ikemen `05b7d98`; los tickets T370–T377 citan `4aa0ba38`.
- La comparacion oficial entre esas revisiones contiene 51 commits y 34 archivos cambiados.
- El corpus v1 sigue ligado a `a2c84f` y tiene 4 de 8 hashes distintos.
- La evidencia de Studio sigue ligada a `d69d12`, 330 commits detras del corte.
- El control de boundaries omite raices ausentes. Tres raices no existen y la unica pieza de `src/engine` queda permitida por lista; el gate actual puede pasar sin probar una separacion real.
- `GamepadInputAdapter` sigue devolviendo un conjunto vacio.
- Turns aplica pasos en serie sin snapshot global ni rollback.
- No existe un calendario global de proyectiles.

## Inferencias de arquitectura

- Los microcortes de controladores ya necesitan una matriz de capacidad y un checkpoint agrupado para frenar claims parciales y rutas sin cubrir.
- El cambio de pin oficial requiere una epoca de fuente, una revision semantica y un manifiesto nuevo antes de admitir exactitud amplia.
- Las referencias de actor necesitan identidad y generacion para cerrar destinos reciclados y redirecciones recursivas.
- Studio, scanner y assets necesitan una identidad de sujeto compartida para unir analisis, escritura, reanalisis y evidencia.
- El gate modular debe fallar si falta una raiz requerida y necesita dos consumidores reales antes de sostener un claim de extraccion.
- La fila de Build Readiness para `Runtime playtest` usa un `ok` fijo y no debe satisfacer release sin un artefacto actual.
- La politica y el script de activos demuestran Nova; no sostienen un claim para Mira, Rook ni un pipeline general.
- `PackageAnalysis` v1 y la referencia documental v0 discrepan; el scanner necesita una revision de analisis y una fase por señal.
- La cola diferida root debe guardar operaciones tipadas y revalidar ambos extremos al commit.

## Preguntas abiertas

- ¿T370–T377 conservan el mismo sentido bajo `05b7d98`, o deben migrar todos los enlaces y fixtures a `4aa0ba38`?
- ¿Cuando se revalida el destino de una restriccion diferida si el actor muere o cambia de generacion antes de ejecutarla?
- ¿Que orden exacto usa Ikemen para `id`, `index` y destinos multiples en redirecciones?
- ¿La escritura de Studio debe separar transaccion IndexedDB y journal de sistema de archivos, con recuperacion idempotente?
- ¿Que segunda pieza CC0 sirve como prueba de cierre de assets sin ampliar alcance legal?

## Fuentes primarias

- Ikemen GO commits `05b7d98` y `4aa0ba38`, su comparacion oficial y sus archivos fuente fijados por SHA.
- W3C IndexedDB 3.0 para transacciones, commit y abort.
- WICG File System Access para permisos y escrituras fuera de IndexedDB.
- RFC 8785 para JSON canonico y hashes repetibles.
- Three.js `Object3D.renderOrder` para el limite del orden visual frente al orden de simulacion.

## Plan resultante

- Fase 0: checkpoint global, cursor, IDs, selectores, fuente y matriz.
- Fase 1: ActorRef, orden, geometria, lifecycle y Helper anidado.
- Fase 2: FightScreen, Common.Fx e input.
- Fase 3: Turns y proyectiles globales.
- Fase 4: corpus, segundo personaje y puntajes.
- Fase 5: Studio, scanner y activos.
- Fase 6: boundaries y extraccion con dos consumidores.
- Fases 7–8: MUGEN amplio e IKEMEN amplio.
