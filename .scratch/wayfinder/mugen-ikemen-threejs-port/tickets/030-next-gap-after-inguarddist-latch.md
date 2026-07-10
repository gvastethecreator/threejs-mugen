# Choose next gap after InGuardDist latch lifecycle

Type: research
Status: open
Blocked by: None

## Question

What is the smallest behavior package that can represent IKEMEN's pre-controller and post-controller automatic guard-start checkpoints without introducing player-order bias or unsupported pause-time state changes?

## Candidate Inputs

- IKEMEN GO `actionPrepare` and post-current-state guard checks.
- Current P1/P2 sequential `RuntimeMatchFighterAdvanceWorld` order.
- Latched `InGuardDist` direct/projectile lifecycle.
- Pause/SuperPause and hitpause branch contracts.
- Official KFM standing, crouching, and air guard-start traces.

## Answer

Pending source-order and owner-boundary review.
