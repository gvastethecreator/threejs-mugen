# Playable v0 status

This page separates the playable local prototype from real MUGEN compatibility.

## Playable prototype

- Vite, TypeScript, and Three.js local app.
- First screen opens in Runtime Mode.
- Original atlas-backed fighters under `public/characters/`.
- Original stages under `public/stages/`, plus Training Grid fallback.
- P1 keyboard and touch control, CPU P2.
- Idle, walk, crouch, jump, punch, kick, hitstun, hit pause, knockback, damage, life, and power.
- Round HUD with life/power bars, timer, KO/time-over, pause, frame-step, speed, and reset.
- Inspector ZIP/folder loading for DEF/AIR/CMD/CNS/ST inspection.
- Studio workbench for manifests, assets, evidence, and build status.

## Imported compatibility

Partial imported routes exist for decoded SFF sprites, standard AIR actions, CMD `[State -1]`, a small CNS/HitDef subset, and selected Common1-style guard/get-hit/recovery gates. Each executed claim needs a named fixture and a trace.

This is not full CNS execution, exact Common1, FightFX, helper VM, projectile, Explod, pause layering, or screenpack parity.

## Evidence

- Tracked gate artifacts: `docs/evidence/`.
- Generated traces and smoke captures: ignored `.scratch/qa/`.
- Optional official KFM confirmation: ignored `.scratch/fixtures/kfm-official.zip`.

See [QUALITY_AUDIT.md](QUALITY_AUDIT.md) for the latest engineering-gate snapshot.
