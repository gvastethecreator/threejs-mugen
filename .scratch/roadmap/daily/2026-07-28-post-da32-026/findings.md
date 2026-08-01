# Hallazgos diarios — 2026-07-28

## Hechos del repo

- El corte empezó en `5bc4cb90`, limpio y 94 commits delante de `origin/master`.
  Trabajo concurrente movió HEAD a `c632ceba`, 95 commits delante, y dejó su
  closeout documental en curso. El dueño lo cerró después en `1b1ba28f`, 96
  commits delante.
- Entry 629 ya registra DA32-026, con sujeto limpio `f18adb2d`, pin documental
  `5bc4cb90` y smoke `c632ceba`.
- DA31-001…040 tiene estado cerrado; DA31-017…040 conserva techo `accepted-model`.
- Gate formal/global: `f5f2315e`. Foco runtime: T416/T417 (`b07c4e88`, `19f1693e`).
- Watermarks: `recordedThrough=DA30-120`; `adjudicatedThrough=DA30-020`; DA30-021 sigue como propuesta.
- Scores: `65 / 36 / 20 / 10-12 / 6-8 / 25`.
- El artefacto global de smoke marca cero fallos, pero no incluye `subjectSha`; no sirve como gate formal del HEAD actual.
- `source-authority-epoch-v1.json` sólo marca la familia juggle como revisada entre 05b y 4aa. Las familias `hittmp`, `acttmp`, `stchtmp` y projectile/ReversalDef siguen sin revisión formal del pin normativo.

## Hechos de fuentes primarias

- IndexedDB aporta transacciones atómicas sobre sus object stores. No cubre una escritura externa mediante File System Access.
- File System Access separa permisos de lectura y escritura; un handle persistido puede volver a estado `prompt`.
- Gamepad expone índice, id, mapping y conexión. El índice no basta como identidad estable entre reconexiones.
- Three.js exige liberar recursos WebGL de forma explícita y ofrece pérdida/restauración forzada de contexto para pruebas.
- WCAG 2.2 exige foco visible/no oculto, orden de foco, reflow, mensajes de estado, entrada concurrente y tamaño mínimo de objetivos aplicable.

## Inferencias

- Studio necesita un diario de recuperación explícito para coordinar IndexedDB con escrituras externas.
- El próximo corte I2 debe revisar familias de fuente antes de ampliar semántica apoyada sólo en 4aa.
- La prueba de modelo DA31 reduce riesgo de diseño, pero no prueba CLI, CI, paquete, segundo consumidor ni ejecución plural.
- Los siguientes puntos de score dependen de corpus legal nuevo, rutas importadas y revisión independiente.

## Preguntas abiertas

- ¿Quién firma DA30-021 y qué artefacto guarda esa firma?
- ¿Qué bytes y recursos forman el snapshot mínimo completo de una partida?
- ¿Qué política de recuperación debe usar Studio tras cierre de stream sin recibo?
- ¿Qué segunda obra legal se usará para la ruta importada y la cadena de assets?
- ¿Qué familia de Ikemen tendrá prioridad tras la revisión 05b/4aa?
