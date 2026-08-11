# Ikemen `ModifyHitDef guard.sparkangle` — T731

## Referencia fijada

- Ikemen-GO pin `149402f`, `src/compiler_functions.go:1953-1954`:
  `guard.sparkangle` es un escalar `VT_Float` dentro de `hitDefSub`.
- Ikemen-GO pin `149402f`, `src/bytecode.go:7673-7674`: la expresión se
  evalúa en el caller y se escribe en el HitDef activo.
- Ikemen-GO pin `149402f`, `src/char.go:11446-11450`: el valor llega al
  constructor del guard-spark en un contacto guardado.

## Ledger local

T730 ya transporta `sparkangle` para la ruta de hit y el snapshot/trace
preserva el escalar resuelto. La ruta guard todavía entrega `undefined` al
evento porque `RuntimeContactPresentationSystem` sólo selecciona el ángulo
para contactos `hit`; el siguiente corte debe añadir el campo guardado sin
reabrir identidad, offset o escala.

## Resultado T731

El runtime ahora transporta `guard.sparkangle` fresco y vivo a través de
root/RedirectID y Helper. La omisión o una expresión no finita preserva el
valor activo; el guard aceptado publica el ángulo en `RuntimeHitEffectEvent`
sin cambiar identidad ni `sparkxy`. La traza requerida
`synthetic-imported-modifyhitdef-dynamic-guard-sparkangle.json` prueba
`var(0)=19`, `ModifyHitDef`, evento `guard` y ausencia de evento `hit`.

## Claim cerrado

Root/RedirectID y Helper-owned live `ModifyHitDef guard.sparkangle` estático o
dinámico, con evaluación caller-context, preservación en omisión y ángulo
observable en el evento de guard-effect.

## Fuera de claim

Hit `sparkangle`, identidad de spark, `sparkxy`, escala, palette, sonido,
FightFX/common lookup exacto, timing de renderer, Projectiles,
ModifyProjectile, localcoord, equipos, rollback y paridad completa.
