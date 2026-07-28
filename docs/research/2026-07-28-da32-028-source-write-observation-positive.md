# DA32-028: observacion positiva de fuente con handle concedido

Fecha: 2026-07-28
Tipo: lectura de fuente, permiso de File System Access y evidencia Studio

## Alcance

DA32-027 ya cubria `needs-observation` y el resultado `unavailable`. Este corte
comprueba la rama positiva con el fixture KFM: Studio relinka una carpeta,
recibe permiso de lectura, lee `chars/kfm/kfm.cns` y compara los bytes con la
preimagen durable.

## Fuentes oficiales

- [MDN: FileSystemHandle.queryPermission](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/queryPermission)
  respalda la consulta separada del permiso de lectura.
- [MDN: File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
  respalda la lectura de archivos y directorios mediante handles del navegador.
- [MDN: FileSystemFileHandle.createWritable](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
  fija el limite de la prueba: la rama de observacion no debe abrir ese stream.
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
  respalda la persistencia del intent y su resultado de observacion.

## Resultado implementado

El gate enlaza el fixture mediante un picker de carpeta simulado. El handle
devuelve permiso `granted` para lectura y hace fallar cualquier llamada a
`createWritable`. Studio lee el archivo real desde el handle, guarda el digest
SHA-256 y la longitud, clasifica `matches-preimage`, conserva la fase
`write-closed` y deja el recibo ausente.

## Evidencia

- `scripts/qa_browser_gate_da32_028_source_write_observation_positive.cjs`.
- `docs/evidence/da32/da32-028-source-write-observation-positive-browser-gate.json`.
- Desktop `1440x900` y mobile `390x844`, once pasos por viewport, todos verdes.
- `createWritable` se invoca cero veces. No hay overflow horizontal ni errores
  de consola inesperados.
- La importacion KFM deja un warning visible por `sound/kfm.mid` ausente en el
  fixture. El warning queda fuera del claim de errores inesperados y sigue
  visible en la captura.

## Techo del claim

Permitido: relink de carpeta, permiso de lectura simulado, lectura de bytes
reales del fixture, coincidencia exacta con la preimagen, digest/longitud
durables, retencion de intent y ausencia de stream de escritura.

Abierto: `matches-draft`, `changed`, permisos fisicos, crash real entre cierre
de stream y recibo, aceptacion explicita de una observacion, reimportacion como
parte de la aceptacion, reintento, cuota, eviction, multi-tab, multi-file,
reescritura ZIP, blobs binarios y paridad completa MUGEN/IKEMEN.
