# Ikemen `ModifyHitDef sparkangle` — T730

## Referencia fijada

- Ikemen-GO pin `149402f`, `src/compiler_functions.go:1944-1945`: `sparkangle`
  es un escalar `VT_Float` dentro de `hitDefSub`.
- Ikemen-GO pin `149402f`, `src/bytecode.go:7668-7669`: la expresión se evalúa
  en el caller y se escribe en el HitDef activo; `ModifyHitDef` reutiliza
  `runSub` sin resetear el resto del payload.
- Ikemen-GO pin `149402f`, `src/char.go:11358,11431-11433`: el valor llega al
  constructor del hit-spark en un contacto hit.

## Ledger local

El runtime ya transporta la presentación del hit-spark y T729 ya demuestra
mutación live de `sparkxy`. El hueco siguiente era el ángulo: el IR de
`ModifyHitDef` no conservaba `sparkangle`, el dispatch no lo resolvía y el
seam directo entregaba `undefined` al evento. T730 lo cerró con soporte tipado
y evidencia requerida.

## Claim permitido

Root/RedirectID y Helper-owned live `ModifyHitDef sparkangle` estático o
dinámico, con evaluación caller-context, preservación en omisión y ángulo
observable en el evento de hit-effect. La evidencia requerida pasa `817/817`
artifacts (`783` required, `34` optional), con `var(0)=27` en la ruta
RedirectID.

## Fuera de claim

`guard.sparkangle`, identidad de spark, `sparkxy`, escala, palette, sonido,
FightFX/common lookup exacto, timing de renderer, Projectiles,
ModifyProjectile, localcoord, equipos, rollback y paridad completa.
