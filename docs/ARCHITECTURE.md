# Architecture

The sandbox is a progressive MUGEN/IKEMEN-GO browser port. Three.js is the presentation adapter, not the engine. MUGEN data and match behavior stay renderer-independent.

## Shape

```txt
Local ZIP / folder
  -> Virtual file system
  -> Resource discovery and path resolution
  -> Parsers
  -> Normalized immutable models
  -> Optional compiler IR
  -> Deterministic match runtime
  -> Runtime snapshots
  -> Three.js / Web Audio / DOM adapters
  -> Debug UI and compatibility reports
```

Creator Studio sits above that flow. The studio owns authoring and project management. The engine owns deterministic runtime behavior.

## Layers

- **Package**: ZIP/folder loading, case-insensitive paths, DEF/stage discovery.
- **Parser**: DEF, AIR, CMD, CNS/ST, SFF, ACT, SND, stage DEF. Output is immutable.
- **Model**: `MugenCharacter`, animations, sprites, statedefs, commands, stages, and `CompatibilityReport`. Models describe what was found, not what can execute.
- **Compiler**: `src/mugen/compiler/` lowers CMD/CNS into `CommandIr`, `ExpressionIr`, `ControllerIr`, and `RuntimeProgramIr`. Each piece is executable, partial, no-op, recognized, unsupported, or invalid.
- **Runtime**: `PlayableMatchRuntime` plus named worlds for tick order, combat, helpers, projectiles, pause, and snapshots. `RuntimeTraceGate` records evidence without renderer coupling.
- **Adapters**: Three.js sprites and stage layers, Web Audio for imported `PlaySnd`, DOM HUD and Studio.

## Constraints

- `src/mugen/*` cannot import Three.js.
- Parsed data is immutable. Runtime instances are mutable and serialize into snapshots.
- Unsupported-feature tracking is a first-class output.
- Browser-local loading is the default security boundary.
- Generated original characters and external MUGEN fixtures stay separate.
- A compatibility claim names a profile, a fixture, and blocked scope. See [COMPATIBILITY_PROFILES.md](COMPATIBILITY_PROFILES.md).

## Tick order

1. Capture input.
2. Update command buffers.
3. Resolve pause/hitpause eligibility.
4. Evaluate state triggers.
5. Execute controller IR.
6. Resolve movement and physics.
7. Resolve combat overlaps.
8. Apply hit/guard/target side effects.
9. Advance animation frames.
10. Emit render/audio/debug snapshots.

Exact MUGEN/IKEMEN ordering is still open. Trace gates exercise this order with scripted inputs. Durable decisions live in [docs/adr/](adr/).
