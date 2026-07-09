# Choose next runtime gap after dynamic damage-scale

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after dynamic `AttackMulSet` / `DefenceMulSet` typed telemetry to keep moving the port toward MUGEN/IKEMEN compatibility without weakening evidence quality?

## Answer

Selected bounded dynamic audio typed telemetry because two required traces already proved event-level fallback but explicitly lacked typed `audio:*` operation evidence. Implemented `resolveRuntimeAudioControllerOperation` for active-state `PlaySnd`, `SndPan`, and `StopSnd`, strengthened `synthetic-imported-sound-dynamic-pan.json` to require `audio:playsnd`, `audio:sndpan`, and `audio:stopsnd`, and strengthened `synthetic-imported-sound-dynamic-value.json` to require `audio:playsnd`.

Proof: `synthetic-imported-sound-dynamic-pan.json` checksum `879afcf4` / final checksum `b780e5e9`, `synthetic-imported-sound-dynamic-value.json` checksum `bcdafe32` / final checksum `31b8a7b3`, and `pnpm qa:trace` 524/524 artifacts, 493 required and 31 optional.
