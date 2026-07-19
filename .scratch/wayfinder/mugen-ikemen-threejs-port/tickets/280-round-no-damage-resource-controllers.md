# Ticket 280: Round no-damage resource-controller gate

- Status: resolved bounded
- Date: 2026-07-18
- Scope: suppress source-backed resource-controller mutations during the
  internal `roundNoDamage` close interval without stopping controller scans,
  telemetry, control writes, or runtime presentation
- Depends on: [T279](279-round-no-damage-window.md)
- Research: [`docs/research/2026-07-18-round-no-damage-resource-controllers.md`](../../../../docs/research/2026-07-18-round-no-damage-resource-controllers.md)

## Contract

1. `RuntimeControllerDispatchWorld` accepts the internal `roundNoDamage`
   policy bit and merges it into the executor context without changing the
   public snapshot or trace schema.
2. `StateControllerExecutor` blocks `LifeAdd`, `LifeSet`, `RedLifeAdd`,
   `RedLifeSet`, guard points, dizzy points, `PowerAdd`, and `PowerSet` writes
   while the actor is alive and the close interval is active. Dead-actor life
   and red-life cleanup keeps the upstream exception; `CtrlSet` remains
   writable because it is not a combat-resource guard in the cited source.
3. The flag reaches imported active controllers and imported `State -1` setup
   controllers for normal, IKEMEN active-motion, standby, pause, and deferred
   input routes. Operation/controller telemetry remains recorded even when the
   state mutation is suppressed.
4. The playable time-over regression starts a new imported state during the
   no-damage interval and proves that active and State -1 life/power writes do
   not change the fighter's resources while the state still advances.

## Evidence

- Implementation commit: `f5023017`.
- Focused runtime coverage: `RuntimeControllerDispatchSystem.test.ts` and
  `PlayableMatchRuntime.test.ts` pass, `2` files / `280` tests.
- `pnpm typecheck` passes with TypeScript `7.0.2`.
- `git diff --check` passes for the implementation and focused test files.

## Claim ceiling

Allowed: bounded source-backed suppression for imported player/root runtime
controllers and State -1 setup controllers during the local `roundNoDamage`
interval, with preserved telemetry and playable regression evidence.

Blocked: helper/effect-owner resource controllers, `TargetLifeAdd` and other
target-resource controllers, team life-share, exact `dizzyEnabled`/
`guardBreakEnabled`/`redLifeEnabled` conditions, full post-round `intro < 0`
power ownership, `over.forcewintime`, exact frame-start ordering, release
fade/motif/dialogue, Common1/ZSS, score, rollback/netplay, and full
MUGEN/IKEMEN parity.
