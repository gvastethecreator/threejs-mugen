# DA32-027: observacion de escritura de fuente tras reload

Fecha: 2026-07-28
Tipo: recuperacion de Studio, estado durable y observacion de fuente

## Pregunta

Que debe mostrar Studio cuando un stream externo ya cerro, pero la aplicacion
se cerro antes de guardar un `SourceWriteReceipt/v1`.

## Fuentes oficiales

- [MDN: FileSystemHandle.queryPermission](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/queryPermission)
  distingue permisos de lectura y lectura/escritura para un handle.
- [MDN: FileSystemFileHandle.createWritable](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
  documenta la apertura de un stream de escritura y sus opciones.
- [MDN: File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
  describe el acceso a archivos y directorios desde el navegador y sus limites
  de permiso.
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
  sirve como base para conservar el intent y su evidencia local.
- [MDN: IDBObjectStore.getAll](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/getAll)
  respalda la lectura de todos los intents al reconstruir el estado de Studio.

## Decision implementada

`StudioSourceWriteIntent/v1` admite `observation` con los estados:

- `needs-observation`: el intent esta en `write-closed`, no tiene resultado y
  no tiene recibo.
- `matches-preimage`: la lectura externa coincide byte a byte con la
  preimagen durable.
- `matches-draft`: la lectura externa no coincide con la preimagen, pero su
  digest semantico coincide con el draft.
- `changed`: la lectura no coincide con ninguno de los dos puntos conocidos.
- `unavailable`: no hay handle, permiso de lectura o bytes observables.

Al abrir Studio, un intent antiguo en `write-closed` se marca de forma durable
como `needs-observation`. La accion `Observe source` usa permiso de lectura y
lee el archivo indicado sin escribirlo. Cada resultado conserva hora, digest,
longitud, permiso y diagnostico. La observacion no crea un recibo ni cambia la
fase del intent. `Load preimage` sigue disponible y conserva el intent
pendiente.

## Evidencia

- `scripts/qa_browser_gate_da32_027_source_write_observation.cjs` cubre
  desktop `1440x900` y mobile `390x844`.
- El gate lee el registro real de IndexedDB, el bridge de Studio y el DOM.
- El caso sin handle pasa de `needs-observation` a `unavailable`, mantiene
  `write-closed`, no crea recibo, carga la preimagen exacta y no escribe un
  handle.
- El gate registra cero errores de consola inesperados y cero overflow
  horizontal en ambas vistas.
- `11` tests focales, `pnpm typecheck`, `pnpm build` y `pnpm qa:smoke` pasan.
  El smoke global termina con cero fallos, pero su artefacto no contiene
  `subjectSha`.

## Techo del claim

Permitido: estado durable de observacion, lectura de recuperacion sin escritura,
clasificacion pura de preimagen/draft/cambio, resultado `unavailable` y la
retencion de fase en la ruta nombrada.

Abierto: inyeccion fisica de crash entre `close()` y recibo, lectura exitosa con
un handle real concedido, finalizacion explicita del recibo a partir de una
observacion, reintento, restauracion externa, cuota, eviction, multi-tab,
multi-file, reescritura ZIP, blobs binarios y paridad completa MUGEN/IKEMEN.
