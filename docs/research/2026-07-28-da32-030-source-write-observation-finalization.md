# DA32-030: finalización explícita de una observación de fuente

## Objetivo

Cerrar la ventana `write-closed` después de un reload sin repetir una escritura
por cuenta propia. La acción requiere una lectura nueva con `matches-draft`,
reimporta la carpeta y recién después crea el receipt y resuelve el intent.

## Implementación

- `StudioSourceWriteIntent/v1` conserva `baseSourceFingerprint` y admite
  `recovery = observed`.
- `SourceWriteReceipt/v1` admite `observed-write-and-reimport` como causa
  explícita del cierre posterior a una observación.
- `Accept observed source` sólo aparece para un intent `write-closed` cuya
  observación actual es `matches-draft`.
- La acción vuelve a leer el archivo, comprueba bytes y digest semántico, carga
  la carpeta y resuelve la ruta lógica contra el prefijo real del VFS antes de
  validar el texto reimportado.
- La confirmación persiste `phase = settled`, `result = committed`,
  `recovery = observed`, receipt, digest de fuente y bytes observados.
- La ruta no solicita permiso `readwrite` ni abre `createWritable`.

## Evidencia

`pnpm qa:browser:da32-030-source-write-observation-finalize` pasó en
`1440x900` y `390x844`. Los catorce pasos pasan por viewport, con cero errores
de consola inesperados y sin overflow horizontal. La advertencia visible de
`sound/kfm.mid` pertenece al fixture KFM y queda fuera del claim de error.

El gate es provisional: el subject `9a0a7d41` conserva trabajo documental no
relacionado en el árbol. La implementación está en `bf719ef5` y la evidencia
en `docs/evidence/da32/da32-030-source-write-observation-finalize-browser-gate.json`.

## Límite de claim

El resultado cubre la ruta nombrada, el fixture KFM, el navegador simulado, la
observación positiva, la reimportación explícita, el receipt y la recuperación
`observed`. Quedan abiertos cortes físicos de crash, retry/abandon, cuota,
eviction, multi-file, ZIP, blobs binarios, prompts físicos, autoridad de
release y paridad completa MUGEN/IKEMEN.

## Fuentes oficiales

- [MDN: File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
- [MDN: FileSystemHandle.queryPermission](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/queryPermission)
- [MDN: FileSystemFileHandle.createWritable](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: IDBTransaction](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction)
