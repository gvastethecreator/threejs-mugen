# Choose next runtime gap after dynamic damage-scale

Type: research
Status: open
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after dynamic `AttackMulSet` / `DefenceMulSet` typed telemetry to keep moving the port toward MUGEN/IKEMEN compatibility without weakening evidence quality?

## Answer

Open. Candidate inputs: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`, `docs/WORKPLAN.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, current `pnpm qa:trace` coverage, and blocked claims around helper/redirect ownership, exact presentation timing, renderer parity, raw-fallback controller telemetry, target ownership, projectile/helper damage scaling, and parser-only controllers that can become typed no-crash runtime operations.
