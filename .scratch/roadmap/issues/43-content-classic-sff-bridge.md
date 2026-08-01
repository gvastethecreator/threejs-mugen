# T458 — Puente SFF binario para el roster clásico

Estado: planificada.

Exportar una representación SFF binaria mínima desde los atlas 192 px, con
índices de grupo/acción, ejes de pies, transparencia y mapa de paleta. El
loader debe aceptar el arte generado por la ruta MUGEN existente; el atlas web
seguirá siendo el fallback explícito.

Aceptación: bytes reproducibles, VFS con DEF/AIR/CMD/CNS/SFF, lectura de al
menos idle, walk, crouch, jump, light/heavy y hitstun, y reporte de cualquier
fila que no pueda representarse sin pérdida.

Dependencias: T449-T456 y T457. Bloquear promoción si el SFF no conserva
dimensiones, ejes o alpha.
