# Choose next gap after automatic guard-start phase order

Type: research
Status: open
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

Pending source, fixture, and behavior-risk review.
