# ADR 0073: diario de recuperación para escrituras de fuente de Studio

- Estado: Propuesto
- Fecha: 2026-07-28
- Dueño: Studio/producto
- Depende de: ADR 0065, ADR 0072, DA32-021…026

## Contexto

Studio ya usa IndexedDB como autoridad de envelopes, revisiones, snapshots,
intenciones de escritura, fases y recibos. File System Access conserva el
handle externo y pide permisos propios. IndexedDB puede confirmar una
transacción sobre sus object stores; esa confirmación no incluye el stream del
archivo externo.

DA32-026 prueba la rehidratación de un recibo ya persistido. Aún faltan las
ventanas de caída entre apertura, escritura, cierre, reimportación y alta del
recibo; también faltan cuota, eviction y grupos de archivos.

## Decisión propuesta

1. IndexedDB conserva el proyecto, la revisión y el diario de recuperación.
2. Cada escritura externa usa un id estable, revisión base, digest previo,
   digest esperado, bytes o referencia de preimage, fase y estado de permiso.
3. El recibo de cierre queda inmutable y se valida por digest al rehidratar.
4. `write-closed` sin recibo entra en estado `needs-observation`. Studio hace
   readback cuando tiene permiso y compara longitud y digest.
5. Studio ofrece acciones explícitas: aceptar el archivo observado, restaurar
   preimage, reintentar con permiso nuevo o abandonar la intención.
6. Studio no crea un recibo ni repite una escritura sólo porque el stream se
   cerró. Cada acción requiere una observación o una orden del usuario.
7. Un grupo de archivos usa un manifiesto y una saga por archivo. El producto
   no promete atomicidad entre IndexedDB, archivos sueltos o ZIP.
8. El registro conserva causa, fase, sujeto, navegador y resultado para que el
   gate pueda reproducir fallos.

## Alternativas

### A. Reintento automático tras recarga

Reduce pasos, pero puede sobrescribir una edición externa y no resuelve la
incertidumbre de un stream cerrado. Se descarta.

### B. Tratar IndexedDB y File System Access como una transacción única

Simplifica la interfaz conceptual, pero las APIs no comparten commit ni
rollback. Se descarta.

### C. Escribir siempre una copia nueva y reemplazar al final

Ayuda en algunos sistemas, pero File System Access no ofrece un rename
transaccional portable para todo el grupo. Puede quedar como táctica por
adaptador, sin elevar el claim general.

### D. Diario explícito, observación y acciones del usuario

Expone la incertidumbre, evita sobrescrituras ocultas y permite pruebas por
ventana de fallo. Es la opción propuesta.

## Consecuencias

- La interfaz debe distinguir `pending`, `permission-required`,
  `write-started`, `write-closed`, `needs-observation`, `observed-match`,
  `observed-divergence`, `receipt-settled` y `abandoned`.
- Los gates deben inyectar cada corte y probar bytes, digest, revisión, permiso,
  mensaje, acción y ausencia de escrituras ocultas.
- Cuota, eviction, multi-tab y multi-file quedan como cortes propios.
- El claim permitido cubre sólo el sujeto, navegador y ventana que pasó.

## Criterio de aceptación del ADR

- Revisión conjunta de Studio, persistencia y QA.
- Matriz completa de fases y transiciones válidas.
- Al menos un caso positivo y un caso negativo por ventana de caída.
- Decisión explícita sobre retención y cifrado de preimages.
- Ningún claim de commit atómico entre IndexedDB y el sistema de archivos.

## Fuentes

- [Indexed Database API 3.0](https://www.w3.org/TR/IndexedDB/)
- [File System Access](https://wicg.github.io/file-system-access/)
