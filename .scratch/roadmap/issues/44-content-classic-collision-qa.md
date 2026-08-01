# T459 — Colisiones y hitboxes por frame

Estado: planificada.

Autorizar Clsn1/Clsn2 por frame para los ocho atlas clásicos. Las cajas deben
seguir pies y torso, acompañar light/heavy/special/throw, y distinguir guard,
hitstun, knockdown y KO sin cajas de ataque residuales.

Aceptación: `collision.contract.json`, preview de contacto, validación de
solapamiento y pruebas de runtime que demuestren hit, guard, whiff y recovery.
Los warnings de alineación actuales no se pueden ocultar: se resuelven o se
declaran como bloqueo por personaje.

Dependencias: T449-T456 y T458.
