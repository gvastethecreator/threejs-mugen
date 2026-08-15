# Issue 363 — active EnvShake `mul` / `dir`

## Estado

- **T788 — closed-bounded (2026-08-15)**
- **Área:** active state controller / camera shake / Ikemen parity
- **Producto:** `eeb3a2f1`
- **Dependencia:** issue 362

## Contrato cerrado

El `EnvShake` activo conserva y resuelve `mul` y `dir` como expresiones
escalares en el contexto del actor. Los valores estáticos se tipan en el IR;
los dinámicos se resuelven una vez al ejecutar el controller y llegan al
evento de cámara. El cálculo existente de cámara consume ambos campos sin
alterar el comportamiento de los eventos que los omiten.

Autoridad comparada:

- M.U.G.E.N 1.1 documenta el controller base con `time`, `freq`, `ampl` y
  `phase` en `.scratch/external/mugen-1.1b1/docs/sctrls.html`.
- Ikemen GO `149402f` compila `envshake.mul`/`envshake.dir` en
  `compiler_functions.go:3350-3356`, los evalúa en
  `bytecode.go:10289-10292` y los usa para proyectar el offset de cámara.

## Evidencia

- Compiler/runtime focal: `EnvShakeSystem.test.ts` y `RuntimeCompiler.test.ts`.
- Trace requerida: `synthetic-imported-envshake-dynamic.json`, con
  `mul=1.5`, `dir=30`, evidencia de operación/evento y contacto activo.
- Typecheck y `git diff --check` pasan.

## Exclusiones

`diradd`, `decay`, waveform exacta/local-coordinate scaling, interacción con
pause/stage/layer, Helper activo, RedirectID, Projectile/ModifyProjectile,
rollback, equipos y paridad completa de cámara siguen fuera del claim.
