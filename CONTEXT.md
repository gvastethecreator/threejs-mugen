# Project context

`mugen-web-sandbox` is a TypeScript + Three.js progressive MUGEN/IKEMEN-GO browser port, playable sandbox, and first Creator Studio module.

This file is the short domain map. Public architecture lives in `docs/ARCHITECTURE.md`. Durable decisions live in `docs/adr/`. Live operator queue lives in ignored `.scratch/roadmap/` and `.scratch/architecture/`.

## Product shape

- **Runtime Mode**: playable fight sandbox with local generated fighters, stages, input, HUD, hitboxes, hit pause, hit stun, life/power, trace evidence, and a partial imported fighter route.
- **Inspector Mode**: local ZIP/folder loader for MUGEN character and stage resources, parsers, animation preview, collision boxes, and compatibility reports.
- **Studio Mode**: project workbench for assets, evidence, build/export status, debug state, module status, and source provenance.

## North star

```txt
playable MUGEN-like sandbox
  -> fixture-backed MUGEN compatibility layers
  -> IKEMEN-GO scan/report bridge
  -> evidence-first Creator Studio
  -> reusable modular browser game engine
```

Near-term language stays honest: this is **partial MUGEN compatibility with trace and fixture gates**, plus **IKEMEN scanner/reporting and explicitly gated runtime slices**. It is not a full MUGEN or IKEMEN-GO port.

## Vocabulary

- **Compatibility gate**: a falsifiable trace or test that proves one bounded behavior.
- **Claim allowed**: what evidence proves.
- **Claim blocked**: what remains unsupported or unproven.
- **Imported fighter**: character data loaded from MUGEN-like files.
- **Native/generated fighter**: project-owned atlas-backed fighter.
- **MatchWorld**: renderer-independent world and evidence boundary for actors, effects, target links, lifecycle, and snapshots.

## Hard rules

- Do not claim full MUGEN or IKEMEN-GO parity from partial gates.
- Do not add commercial or third-party character assets to the repo.
- Do not hardcode one character, one stage, or one fixture path into runtime behavior.
- `src/mugen/*` cannot import Three.js.
