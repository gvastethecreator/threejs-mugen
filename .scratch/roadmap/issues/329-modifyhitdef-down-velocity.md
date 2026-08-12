# T755 — live ModifyHitDef `down.velocity` X/Y

- **Estado:** queued
- **Área:** runtime / HitDef / ModifyHitDef / lying-hit kinematics
- **Objetivo:** completar el seam Ikemen de `ModifyHitDef down.velocity` con reemplazo por componente para root/RedirectID, preservando los hermanos omitidos y el Z vivo.

## Fuente de paridad

Ikemen-GO pin `149402f` compila `down.velocity` como uno a tres floats y `ModifyHitDef` reutiliza el HitDef vivo sin reset/finalize. Un componente reemplaza X y preserva Y/Z; dos reemplazan X/Y y preservan Z; omisión no muta. MUGEN 1.1 documenta `down.velocity` para HitDef fresco, no `ModifyHitDef`.

## Alcance permitido

- Root-owned `ModifyHitDef` y RedirectID con caller-context finite expressions.
- Single/pair X/Y, static triple Z coexistente, accepted lying-hit consumption and `GetHitVar`.
- Focused compiler/runtime tests plus a required root RedirectID trace.

## Fuera de alcance

- Fresh defaults (T673), dynamic Z/`n`, Helper-authored controller, Projectile/ModifyProjectile, exact landing/tick parity, teams, rollback and full parity.

## Evidencia requerida

Seed live `down.velocity=-2,-8,2`; caller applies single dynamic X before accepted lying hit; trace must show `VarSet`, `HitDef`, `ModifyHitDef`, `StateTypeSet`, `HitVelSet`, target link and `GetHitVar(xvel/yvel/zvel)` with X replaced and Y/Z preserved.
