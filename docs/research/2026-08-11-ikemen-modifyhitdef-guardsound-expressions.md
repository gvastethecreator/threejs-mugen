# IKEMEN `ModifyHitDef` `guardsound` expressions

Date: 2026-08-11

## Fuentes fijadas

- [Ikemen compiler `guardsound`](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/compiler_functions.go#L1828-L1835)
- [Ikemen HitDef sound evaluation](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/bytecode.go#L7621-L7626)
- [Ikemen accepted guard sound consumption](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/char.go#L11448-L11458)
- [M.U.G.E.N 1.1 HitDef reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html#hitdef)

## Decisión de port

`ModifyHitDef guardsound` conserva una referencia prefijada `F`/`S` con uno o
dos componentes numéricos. La compilación diferencia referencias estáticas de
expresiones; root/RedirectID y Helper resuelven las expresiones una vez en el
contexto del caller. Una omisión o resolución no finita no borra el valor vivo.
El contacto de guardia publica el grupo, índice, prefijo y evento tipado
`audio:playsnd` existentes.

Esto es un corte de compatibilidad Ikemen: M.U.G.E.N 1.1 documenta el
`guardsound` de un HitDef fresco, pero no un `ModifyHitDef` vivo.

## Evidencia

- `RuntimeCompiler.test.ts`, `HitDefSystem.test.ts` y `HelperSystem.test.ts`:
  `298/298`.
- Required trace:
  `synthetic-imported-modifyhitdef-dynamic-guardsound.json`, trace checksum
  `2ade8da5`, final checksum `f88990bd`.
- `pnpm qa:trace`: `820/820` artifacts (`786` required, `34` optional).
- `pnpm run typecheck`: pass.

## Claim permitido

Metadata de sonido de guardia en `ModifyHitDef` vivo para root/RedirectID y
Helper callers, con preservación de omisión/unresolved y evidencia de contacto
aceptado.

## Bloqueado

Fresh defaults, `guardsound.channel`, `hitsound`, exact SND lookup/playback/
mixing/priority, Projectiles/ModifyProjectile, renderer timing, equipos,
rollback y paridad completa M.U.G.E.N/Ikemen.
