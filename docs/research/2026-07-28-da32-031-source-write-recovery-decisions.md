# DA32-031: decisiones durables de retry y abandono

## Objetivo

Dar una salida explícita a un intent `write-closed` que quedó sin receipt.
`Prepare retry` registra la decisión y vuelve a cargar el preimage para revisión.
`Abandon recovery` cierra el intent con un receipt rechazado y conserva la
evidencia de que la aplicación no tocó el archivo externo.

## Implementación

- `StudioSourceWriteIntent/v1` conserva `recoveryDecision`, `recoveryAttempt`
  y `recoveryDecidedAt`.
- `retry` sólo se admite para `write-closed`, vuelve a dejar la observación en
  `needs-observation` y carga el preimage exacto en el editor.
- `abandon` exige confirmación, crea un receipt `recovery-abandoned` con
  `status = rejected`, y persiste `phase = settled`, `result = aborted` y
  `recovery = none`.
- Ninguna de las dos acciones solicita permiso `readwrite`, abre
  `createWritable` o restaura bytes por cuenta propia.

## Evidencia

`pnpm qa:browser:da32-031-source-write-recovery-decisions` pasó en desktop
`1440x900` y mobile `390x844`. Los once pasos pasan por viewport: intent
pendiente, acciones visibles, retry durable, preimage cargado, intento contado,
receipt rechazado, settlement, decisión de abandono, estado de handle no ligado
y overflow. Hay cero errores inesperados de consola.

La evidencia es provisional porque el árbol conserva cambios documentales no
relacionados. Implementación y gate: `3826f0ea`.

## Límite de claim

El resultado cubre la decisión y persistencia en el navegador simulado para un
intent de una sola fuente. Quedan abiertos cortes físicos entre stream e
IndexedDB, retry con escritura real, permisos físicos, crash recovery, cuota,
eviction, multi-file, ZIP, blobs binarios, prompts físicos, release y paridad
completa MUGEN/IKEMEN.

## Fuentes oficiales

- [MDN: File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
- [MDN: FileSystemFileHandle.createWritable](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
- [MDN: FileSystemHandle.queryPermission](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/queryPermission)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: IDBTransaction](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction)
