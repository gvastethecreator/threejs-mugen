# T754 — Projectile AttackMulSet guardpoints snapshot

- **Estado:** in-progress
- **Área:** runtime / Projectile / Helper / guardpoints
- **Objetivo:** congelar el multiplicador `AttackMulSet, guardpoints` en el momento de creación del Projectile y consumir ese snapshot en contactos de guardia, tanto para Projectiles creados por el actor raíz como para Projectiles parentados por un Helper.

## Fuente de paridad

Ikemen-GO pin `149402f` mantiene `attackMul[3]` en el Projectile (`char.go:2489`, `10685-10692`, `11258`) porque el multiplicador del Projectile se decide al crearlo, no al contacto. El fallback local conserva el multiplicador vivo existente cuando no hay snapshot para no romper Projectiles construidos por fixtures o integraciones antiguas.

## Alcance permitido

- Snapshot finito de `guardPointsAttackMultiplier` al crear Projectile raíz.
- Snapshot finito del multiplicador efectivo del Helper al crear Projectile parentado.
- Consumo del snapshot sólo en `guardpoints` durante guardia; daño, dizzy y recursos siguen sus multiplicadores actuales.
- Pruebas unitarias y una evidencia de traza para cada topología.

## Fuera de alcance

- Defaults de `[Constants]`/`mugen.cfg`, power-owner/team banks, rollback y orden exacto de todos los ticks.
- Rehacer `ModifyProjectile`, Projectile dinámico de otros multiplicadores o paridad completa de `attackMul[0..2]`.

## Evidencia requerida

Un Projectile con guardpoints authored negativo debe conservar el multiplicador de creación aunque el atacante cambie después a otro `AttackMulSet`; las rutas root y Helper deben registrar lifecycle, ownership/parent y contacto guardado.
