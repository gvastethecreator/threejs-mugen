# Issue 361 — live `ModifyHitDef` down.velocity component preservation

## Estado

- **T787 — closed-bounded (2026-08-15)**
- **Área:** runtime / HitDef / ModifyHitDef / down hit / velocity
- **Dependencia:** T786 / issue 360

## Cierre

- **Producto:** `1e83fc36` (`feat(mugen): preserve live ModifyHitDef down velocity`)
- **Trace requerida:** `synthetic-imported-modifyhitdef-dynamic-down-velocity`
- **Trace checksum:** `7b1f4341`
- **Final checksum:** `fc695cca`
- **Focused proof:** RuntimeCompiler 42 tests, HitDefSystem live-preservation test,
  RuntimeTraceGatePresets 2 tests, typecheck and diff hygiene pass.
- **Aggregate QA:** the T787 artifact passes; `pnpm qa:trace` still exits on the
  inherited `synthetic-imported-helper-bind-to-target-redirect` target-link
  blocker. This remains visible and is not attributed to T787.

## Objetivo

Completar el siguiente corte Ikemen acotado para que un `ModifyHitDef` root
owner reemplace `down.velocity` X/Y por componente en el HitDef vivo, sin
perder los componentes omitidos ni el Z estático ya soportado.

## Alcance permitido

- `ModifyHitDef` root-owned y `RedirectID` explícito, con caller-context
  estático o `var()` finito.
- Un componente reemplaza X y conserva Y/Z; dos reemplazan X/Y y conservan Z;
  omisión no muta el vector vivo.
- Contacto lying/down, `GetHitVar` y evidencia física mínima del vector.

## Fuera de alcance

Fresh `HitDef` defaults/herencia (T673), dynamic Z/forma `n`, Helper-authored
controller, Projectile/ModifyProjectile, air/guard velocity, exact landing y
countdown, equipos/simul, rollback y full M.U.G.E.N/Ikemen parity.

## Autoridad

Ikemen GO `149402f` reutiliza `hitDefSub` para `ModifyHitDef` y evalúa
`down.velocity` en el caller, escribiendo sólo los componentes authored. La
herencia desde `air.velocity` pertenece al HitDef fresco y no debe ejecutarse
durante Modify. M.U.G.E.N 1.1 documenta `down.velocity`, pero no
`ModifyHitDef`; el live mutation claim es Ikemen-only.

## Evidencia requerida

- Compiler/HitDef/Helper focused tests para single, pair, malformed y
  preservación de omisión/Z.
- Required trace con `ModifyHitDef` root/RedirectID antes de un down contact,
  `GetHitVar` y velocidad observables.
- Typecheck, `git diff --check` y aggregate QA con blockers heredados
  registrados sin ocultarlos.

## Resultado

The bounded root/RedirectID path is closed. A one-component live mutation
replaces X and preserves Y/Z; a two-component mutation replaces X/Y and
preserves Z; omission is a no-op. The accepted lying-hit trace exposes the
effective `GetHitVar(xvel/yvel/zvel)` and physical velocity. Helper-authored
controllers, fresh defaults, dynamic Z/`n`, Projectile variants, and complete
timing/parity remain separate claims.
