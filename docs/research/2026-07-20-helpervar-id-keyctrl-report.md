# Reporte de implementación: HelperVar id y keyctrl

Fecha: 2026-07-20
Área: expresión y micro-VM de Helpers
Alcance: T345, campos locales con datos existentes

## Resultado

El evaluador de expresiones ahora procesa `HelperVar` con argumentos raw.
Eso permite distinguir tokens de propiedad como `id` y `keyctrl` de los
identificadores de trigger con el mismo nombre. El runtime expone tres campos
source-backed dentro del perfil `ikemen-go`: ID del Helper, key control y
ownership de Projectiles.

La compilación mantiene un conjunto cerrado. `HelperVar(ownpal)`,
`HelperVar(preserve)`, `HelperVar(helpertype)` y otras claves siguen fuera del
perfil hasta que exista un campo runtime y una prueba propia.

## Adaptación

La fuente fijada en `bytecode.go` lee `c.helperId`, `c.keyctrl[0]` y
`c.ownProjectile`. El port ya tenía `RuntimeHelper.helperId`, `keyCtrl` y
`ownProjectile`, por lo que T345 solo añade el contexto de lectura y el gate
`runtimeProfile === "ikemen-go"`.

El parser usa `parseRawArguments` para `HelperVar`, una ruta que ya servía a
otras funciones con nombres simbólicos. La normalización de soporte reconoce
solo las tres claves cerradas; una clave nueva conserva diagnóstico
unsupported.

## Evidencia

- `RuntimeCnsSubset.test.ts`: evaluación combinada de los tres campos y
  contexto vacío.
- `RuntimeCompiler.test.ts`: clasificación executable y rechazo de `ownpal`.
- `HelperSystem.test.ts`: lectura desde el micro-VM, perfil legacy y valores
  false.
- Focal: 3 archivos / 112 tests.

La ronda requiere el checkpoint acumulado de suite, typecheck, build, trazas y
boundaries. No mueve puntajes ni claims de paridad.

## Pendientes

- Añadir contratos para `helpertype`, `ownpal`, `ownclsnscale` y `preserve`.
- Resolver `HelperVar` bajo Parent/Root y el valor bottom fuera de Helper.
- Probar los campos en una traza de producción y en una ruta importada real.

## Fuente primaria

- [Ikemen-GO `bytecode.go` fijado](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go)
- `.scratch/external/Ikemen-GO/src/bytecode.go`
