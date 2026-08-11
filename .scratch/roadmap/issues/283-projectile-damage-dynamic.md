# Issue 283 — Projectile damage dinámico en contexto caller

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: T708 / issue 282
Date: 2026-08-11

## Contrato oficial fijado

- M.U.G.E.N 1.1 documenta `Projectile` con `damage = hit_damage,
  guard_damage` entero; ambos valores son cero cuando se omite el parámetro.
- Ikemen-GO `149402fa` reutiliza `hitDefSub` en `projectileSub`, por lo que
  `damage` acepta una o dos expresiones `VT_Int` y se evalúa en el caller.
- El `ModifyProjectile` de Ikemen reutiliza el mismo bloque y evalúa una vez
  antes de transmitir a los projectiles seleccionados; un componente deja el
  guard damage en cero y dos componentes reemplazan ambos valores.
- M.U.G.E.N no documenta `ModifyProjectile`; esa rama se reclama sólo como
  compatibilidad Ikemen acotada.

Fuentes pinned: `.scratch/upstream-ikemen-go` en `149402fa`; M.U.G.E.N
1.1b1 en `.scratch/external/mugen-1.1b1`.

## Ledger de port

| Comportamiento | Estado | Evidencia prevista |
| --- | --- | --- |
| `Projectile damage` estático | preservado | compiler/runtime existente |
| `Projectile damage` dinámico/mixed, root caller | adaptado | IR pair + caller resolver + contacto |
| `Projectile damage` dinámico/mixed, Helper caller | adaptado | Helper resolver + parent/lifecycle |
| `ModifyProjectile damage` dinámico, selector existente | adaptado | IR typed + resolver/selector tests + trace `6bb8fe78` |
| defaults frescos no authored | reemplazado local | se conserva el default local 30 de Projectile; este corte sólo cambia authored dinámico |
| overflow/int32 exacto, daño negativo/healing, teams/rollback | omitido | límites explícitos en roadmap |

## Alcance

El corte resuelve componentes finitos en el contexto original del caller,
trunca a entero y conserva el selector/ownership/lifecycle existentes.
Projectile fresh usa guard damage cero cuando sólo se authored el primer
componente. ModifyProjectile mantiene su reemplazo Ikemen de guard=0 para un
solo componente y mutación de ambos para dos componentes.

## Evidencia cerrada

- compiler: estático, expresión, mixed, single, pair y malformed fail-closed;
- runtime: root y Helper fresh con `GetHitVar(damage/hitdamage/guarddamage)`;
- runtime: ModifyProjectile root selector con reemplazo component-wise; Helper
  queda cubierto por el resolver/selector focused existente;
- traza required fresh root `a00bf194`, fresh Helper `a2c03112` y
  ModifyProjectile root `6bb8fe78`: spawn → contacto → daño/guard damage,
  target/lifecycle/ownership y rama de get-hit observable;
- `pnpm qa:trace`: 797/797 artefactos, 763 required y 34 optional, 0 fallos;
- `pnpm test`: 328 archivos, 3849 tests, 0 fallos;
- `pnpm build`: typecheck + Vite build verde; queda sólo el warning de chunk
  >500 kB; `git diff --check` limpio salvo avisos CRLF heredados.

La evidencia confirma el claim acotado de T709: pares finitos estáticos,
dinámicos, mixed y single/pair en caller root/Helper para Projectile fresco,
y reemplazo root de `ModifyProjectile`; el guard damage de un solo componente
en ModifyProjectile queda en cero. El default local omitido `30` se conserva.

## Fuera de alcance

Daño negativo/healing, overflow exacto del VM, redondeo global de defensa y
ataque, `GetHitVarSet`, ReversalDef, broadcast complejo, teams, rollback,
Projectile/Helper parity total y `ModifyProjectile` no documentado por MUGEN.
