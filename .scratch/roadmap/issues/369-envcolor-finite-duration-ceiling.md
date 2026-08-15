# Issue 369 — finite `EnvColor` duration without the local ceiling

## Estado

- **T794 — queued (2026-08-15)**
- **Área:** active EnvColor / finite lifetime / presentation evidence
- **Dependencia:** T793 / issue 368

## Objetivo

Eliminar el límite local de 240 ticks para una duración positiva finita de
`EnvColor`, si la ruta observable puede conservar una duración authored mayor.
M.U.G.E.N 1.1 documenta `time` como número de ticks sin un máximo y el pin
Ikemen GO `149402f` almacena el entero evaluado y lo decrementa mientras sea
positivo.

## Claim previsto

Un `EnvColor` root o Helper con duración positiva mayor que 240 conserva su
contador authored hasta expirar, sin convertirse en duración indefinida. La
evidencia debe distinguirlo de `time = -1`, del cero ignorado y de una
sustitución posterior.

## Criterios de cierre

- Comparar la documentación M.U.G.E.N 1.1 y el pin Ikemen antes de cambiar el
  clamp local.
- Probar duración positiva mayor a 240 en el mundo y una traza requerida
  acotada con expiración observable.
- Mantener las rutas zero e indefinida de T793 y el reset sin regresión.

## Fuera de alcance

Overflow/int32, límites de memoria para historiales largos, mezcla/capas/
ventanas, pausa/hitpause, nested/team ownership, renderer exacto, rollback y
paridad completa no forman parte del corte.
