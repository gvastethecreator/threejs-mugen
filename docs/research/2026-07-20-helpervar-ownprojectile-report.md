# Reporte de implementación: HelperVar ownprojectile

Fecha: 2026-07-20
Área: compilador y micro-VM de Helpers
Alcance: T344, lectura local de ownership

## Resultado

Una expresión authored `HelperVar(ownprojectile)` ahora puede consultar el
ownership explícito del Helper durante la ejecución `ikemen-go`. El valor se
expone como `1` para un Helper propietario y `0` para false, estado ausente,
contexto root o perfiles legados.

El soporte queda limitado a esa clave. El compilador sigue marcando otras
claves de `HelperVar` como unsupported, lo que evita convertir una función
parcial en una promesa amplia.

## Fuente y adaptación

La fuente local fijada en
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` enumera
`OC_ex3_helpervar_ownprojectile`, admite `HelperVar` solo para Helpers y lee
`c.ownProjectile` desde `bytecode.go`.

La adaptación usa `ExpressionContext.helperOwnProjectile`. El contexto del
Helper solo publica el valor cuando `runtimeProfile === "ikemen-go"`; el
evaluador trata los demás contextos como false. El campo no se agrega a
redirect targets, por lo que `Parent, HelperVar(...)` queda fuera del alcance
actual.

## Evidencia

- `RuntimeCnsSubset.test.ts`: evaluación true/false/root.
- `RuntimeCompiler.test.ts`: clasificación executable y función preservada.
- `HelperSystem.test.ts`: trigger de micro-VM con IKEMEN y perfil legado.
- Focal: 3 archivos / 112 tests.
- TypeScript 7: `pnpm typecheck` verde.

Esta ronda aún requiere el checkpoint acumulado de suite completa, build,
trazas y boundaries antes del cierre global. No mueve puntajes ni claims de
paridad.

## Pendientes explícitos

- Completar el resto de `HelperVar` con fuentes y contratos separados.
- Decidir el valor bottom exacto para consultas fuera de Helper.
- Cubrir redirected Parent/Root y ownership anidado.
- Añadir una traza de producción si la capacidad entra en un corpus ejecutado.

## Fuente primaria

- [Ikemen-GO `bytecode.go` fijado](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go)
- `.scratch/external/Ikemen-GO/src/bytecode.go`
