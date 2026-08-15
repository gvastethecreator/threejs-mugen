# Issue 331 — Projectile `AttackMulSet.RedLife` creation snapshot

## Estado

- **T757 — ready / implementación en curso**
- **Área:** runtime / Projectile / AttackMulSet / red-life resource
- **Dependencia:** T756 / issue 330 (`DizzyPoints` snapshot)

## Objetivo

Capturar el multiplicador finito y efectivo de `AttackMulSet redlife` cuando
se crea un Projectile. El contacto posterior debe usar ese snapshot para el
delta de red-life en hit y guard, aunque el atacante cambie su multiplicador
después. El valor authored debe seguir viajando por separado para
`GetHitVar(redlife)` / `GetHitVar(guardredlife)`.

## Autoridad

Ikemen-GO pin local `149402f`:

- `src/char.go:2444` define `attackMul[1]` como Red Life.
- `src/char.go:2489` copia `c.attackMul` a `parentAttackMul` al crear un
  Projectile, con la regla de que el multiplicador se decide en creación.
- `src/char.go:10692` selecciona `parentAttackMul` para el Projectile.
- `src/char.go:11238-11268` usa el índice 1 para red-life en hit, guard y
  metadata de GetHitVar.
- `src/bytecode.go:11005-11011` actualiza el índice 1 con `AttackMulSet`.

## Alcance permitido

- `AttackMulSet redlife` estático y caller-context dinámico.
- Snapshot en Projectile raíz y Projectile parentado por Helper.
- Consumo dedicado en contacto hit y guard, con fallback compatible para
  Projectiles sintéticos que no traen snapshot.
- Propagación a `RuntimeCombatAttack`, resolución directa y Projectile.
- Pruebas unitarias, integración root/Helper y una required trace root.

## Fuera de alcance

- `ModifyProjectile`, `TargetRedLifeAdd`, `GetHitVarSet`, `NoRedLifeDamage`,
  ownership de bancos/team, redondeo/int32 exacto, rollback y paridad completa.
- Cambiar el significado del metadata authored `redlife`/`guardredlife`.
- Declarar soporte total MUGEN/Ikemen por este corte.

## Evidencia requerida

- `DamageScaleSystem` prueba redlife-only estático/dinámico y aislamiento de
  los multiplicadores de daño/dizzy/guardpoints.
- `CombatResolver` prueba hit y guard con snapshot que vence al multiplicador
  vivo del atacante.
- `ProjectileSystem` prueba snapshot finito al crear Projectile.
- `ProjectileCombatSystem` prueba consumo hit/guard y mantiene
  `GetHitVar(redlife)` authored.
- Required trace root: `VarSet -> AttackMulSet(redlife) -> Projectile ->
  AttackMulSet(redlife) posterior -> hit`, con delta final demostrando el
  snapshot de creación y branch separado para metadata authored.
