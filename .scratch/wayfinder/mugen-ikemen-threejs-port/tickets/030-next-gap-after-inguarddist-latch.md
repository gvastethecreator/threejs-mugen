# Choose next gap after InGuardDist latch lifecycle

Type: research
Status: resolved
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

Implement two explicit active-branch checkpoints. Run P1 and P2 `pre` checks before either fighter advances, then run each fighter's `post` check immediately after that fighter's completed controller pass. Preserve the established P1-started Pause cutoff, so P2 does not advance or receive a post check after that cutoff. Pause/SuperPause and hitpause branches keep their established no-auto-entry behavior.

Evidence: owner-backed `MatchTickSchedule/v0` phases, exact pair-order unit tests, active runtime schedule assertions, and the required automatic guard-start trace oracle.
