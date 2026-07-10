# Choose next runtime gap after player Projectile GetHitVar sound typed audio

Type: research
Status: open
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after player-owned and helper-parented Projectile normal-hit GetHitVar sound typed `audio:playsnd` telemetry to keep the port moving with evidence?

## Answer

Open. Candidate inputs: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`, `docs/WORKPLAN.md`, current `pnpm qa:trace` coverage, Projectile/helper `hitcountpersist`, exact SND lookup/playback and channel semantics, remaining helper Projectile normal-hit routes, target ownership, dynamic pause params, renderer parity proof, and parser-only controller families that can become typed no-crash runtime operations.
