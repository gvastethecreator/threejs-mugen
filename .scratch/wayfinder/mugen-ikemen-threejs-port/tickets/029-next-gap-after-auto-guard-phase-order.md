# Choose next gap after automatic guard-start phase order

Type: research
Status: resolved
Blocked by: None

## Question

What is the smallest behavior package that can add latched `InGuardDist` lifecycle semantics without prematurely implementing both IKEMEN guard-start checkpoints?

## Candidate Inputs

- IKEMEN GO `actionFinish` reset and subsequent player/projectile hit-detection writes.
- Current live `RuntimeGuardDistanceWorld` evaluation.
- Direct HitDef and Projectile guard-distance traces.
- Pause/hitpause persistence and one-tick activation latency.
- Checksum changes and compatibility-profile gating.

## Answer

Implement an opponent-scoped runtime latch with direct/projectile/combined provenance, refresh it before active contact and at Pause/hitpause branch tails, and make authored plus automatic guard checks consume only the stored value. Keep the two IKEMEN action checkpoints separate.

Research and checksum migration: `docs/research/2026-07-10-inguarddist-latch-lifecycle.md`.
