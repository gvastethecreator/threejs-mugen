# Choose next runtime gap after player Projectile GetHitVar sound typed audio

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after player-owned and helper-parented Projectile normal-hit GetHitVar sound typed `audio:playsnd` telemetry to keep the port moving with evidence?

## Answer

Resolved 2026-07-10: select five existing required first-generation helper-local direct HitDef/persistence routes as the next bounded R1 gap.

Why: the routes already proved helper direct contact plus `hitdefpersist`, `hitcountpersist`, `movehitpersist`, and guarded persistence semantics, but required only `helper` and `hitdef`. The shared missing boundary was helper-local sound resolution and owner-attributed typed audio operation forwarding.

Result: `synthetic-imported-helper-hitdef` `99b55e47` / `cd02ded0`, `helper-hitdefpersist` `61b3ffbf` / `b005d52a`, `helper-hitcountpersist` `ba2a19f4` / `e9ccdc9c`, `helper-movehitpersist` `1e37fd5c` / `4d6e93b5`, and `helper-moveguardedpersist` `4b48e97d` / `c7ce0ae6` now require typed `audio:playsnd`. Focused tests prove accepted hit, guard, bridge ownership, five traces, and no audio after HitBy rejection. `pnpm qa:trace` passes 524/524.

Claim blocked: exact SND lookup/playback, channel/mix/timing parity, nested helper ancestry, redirects, teams, renderer parity, score movement, and full helper/audio parity.

Next frontier: `016-next-runtime-gap-after-helper-hitdef-persistence-sound-audio.md`.
