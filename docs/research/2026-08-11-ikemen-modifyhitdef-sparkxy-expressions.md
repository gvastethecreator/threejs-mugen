# Ikemen `ModifyHitDef sparkxy` — T729

## Referencia fijada

- Ikemen-GO pin `149402f`, `src/compiler_functions.go` `hitDefSub`: compila
  `sparkxy` como hasta dos expresiones float.
- Ikemen-GO pin `149402f`, `src/bytecode.go` `hitDef_sparkxy`: evalúa X y sólo
  evalúa/escribe Y cuando el segundo componente fue authored. El mismo
  `runSub` sirve para `ModifyHitDef`, por lo que live omission preserva Y.
- Ikemen-GO pin `149402f`, `src/char.go` hit presentation: aplica el offset al
  punto de contacto antes de publicar el hit-spark.
- M.U.G.E.N 1.1 `docs/sctrls.html`: `sparkxy=spark_x,spark_y`, offset relativo
  al frente de P2 y default `0,0`.

## Ledger local

La activación fresca ya materializa `DemoMove.sparkXy` y
`RuntimeContactPresentationSystem`/`HitEffectSystem` ya transportan el offset.
El hueco de T729 es sólo `ModifyHitDef`: su IR no conserva `sparkxy`, el runtime
no lo muta y los caller resolvers no exponen el par para live dispatch.

## Claim permitido

Root/RedirectID y Helper-owned live `ModifyHitDef sparkxy` estático, mixto o
dinámico, con evaluación caller-context, reemplazo por componente y offset
observable en el evento de hit-effect.

## Fuera de claim

No se reclama mutación de identidad spark, sonido, ángulo, escala, palette,
FightFX/common lookup, renderer timing, Projectile/ModifyProjectile, fresh
defaults, localcoord, equipos, rollback ni paridad completa M.U.G.E.N/Ikemen.
