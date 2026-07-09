# Choose next runtime gap after Projectile contact sound typed audio

Type: research
Status: open
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after player-owned `Projectile hitsound` / `guardsound` typed `audio:playsnd` telemetry to keep the MUGEN/IKEMEN Three.js port moving without weakening evidence quality?

## Answer

Open. Candidate inputs: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`, `docs/WORKPLAN.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, current `pnpm qa:trace` coverage, and blocked claims around helper-owned Projectile contact sound operation telemetry, helper/redirect/team ownership, exact presentation timing, renderer parity proof, target ownership, projectile/helper damage scaling, dynamic pause params, and parser-only controllers that can become typed no-crash runtime operations.
