# Choose next runtime gap after helper Projectile guard sound typed audio

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after first-generation helper-parented/root-owned Projectile guard-contact sound typed `audio:playsnd` telemetry to keep the port moving with evidence?

## Answer

Resolved: implement bounded helper Projectile normal-hit GetHitVar sound typed audio telemetry first.

Closure evidence:

- `synthetic-imported-helper-projectile-gethitvar-hit-metadata.json` trace checksum `28afbcea` / final checksum `c960b1cf`.
- `synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json` trace checksum `616e0b2c` / final checksum `0aebcc73`.
- `synthetic-imported-helper-projectile-gethitvar-hitcount.json` trace checksum `40ec4f4b` / final checksum `6f15ff30`.
- Focused RuntimeTraceGatePresets tests and `pnpm qa:trace` 524/524 artifacts, 493 required and 31 optional.

Next frontier moved to `012-next-runtime-gap-after-helper-projectile-normal-hit-sound-audio.md`: choose between broader helper Projectile normal-hit sound breadth, exact SND playback/channel/timing, helper/redirect/team ownership, renderer parity proof, target ownership, dynamic pause params, or parser-only controllers that can become typed no-crash runtime operations.
