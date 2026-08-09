# T701 — Projectile `projmisstime` dinámico

- **Estado:** cerrado-bounded.
- **Alcance:** Projectile fresco creado por un controlador root o Helper.
  La expresión se evalúa una vez en el contexto del caller y controla la
  ventana de recontacto de un Projectile con múltiples impactos.
- **Fuente M.U.G.E.N 1.1:** `sctrls.html:2494` documenta `projmisstime` como
  entero, aplicado después de cada impacto y con default `0`.
- **Fuente Ikemen GO fijada:** commit `149402f`,
  `compiler_functions.go:2391-2392` (expresión entera),
  `bytecode.go:8110-8111` (evaluación en el caller al crear),
  `char.go:2416,2434,2803,2822-2823,13661` (estado, decremento y admisión de
  contacto).
- **Implementación local:** IR typed `missTimeExpression`, resolución root a
  través de `PlayableMatchRuntime`/`EffectSpawnSystem`/`ProjectileSystem`, y
  resolución Helper a través de `HelperSystem`/`EffectActorSystem`. El runtime
  existente conserva el payload, decrementa `missTimeRemaining` y bloquea el
  contacto hasta que la ventana expira.
- **Evidencia:** cobertura focal de compiler/runtime/Helper `295/295`,
  typecheck y build verdes; `pnpm qa:trace` pasa `783/783` artifacts
  (`749` required, `34` optional). Root: checksum `90c039b1`, final
  `6868ca24`; Helper: checksum `24a8156a`, final `ce715b91`. Suite completa:
  `3819/3819` tests en `328` archivos.
- **Claim permitido:** resolución dinámica caller-context, truncado/clamp del
  dominio temporal local, cooldown multi-hit, lifecycle, target links y
  ownership root/Helper/parent.
- **Fuera de alcance:** `ModifyProjectile`, orden exacto con hitpause/tick,
  negativos/overflow de la VM, selección multi-target/team, helpers anidados,
  rollback y paridad completa del lifecycle Projectile.

Siguiente mapa: T702 debe comparar el siguiente seam de Projectile/effect con
el pin upstream antes de abrir otra mutación live.
