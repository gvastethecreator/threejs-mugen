# Round No-damage Resource-controller Closeout

Date: 2026-07-18  
Ticket: Wayfinder 280  
Implementation commit: `f5023017`

## Result

The internal `roundNoDamage` read model now reaches the shared imported
controller dispatch boundary. During the bounded close, player/root state
controllers continue to scan and emit telemetry, but life, red life, guard,
dizzy, and power writes are suppressed according to the bounded local policy.
`CtrlSet` remains writable. Dead-actor life/red-life cleanup is preserved.

The playable time-over regression starts a new imported state while the
no-damage interval is active. Its active state and State -1 setup controllers
attempt life/power writes, the fighter still reaches state `200`, and life/power
remain unchanged.

## Evidence

- `pnpm exec vitest run src/tests/RuntimeControllerDispatchSystem.test.ts src/tests/PlayableMatchRuntime.test.ts`: passed, `2` files / `280` tests.
- `pnpm typecheck`: passed with TypeScript `7.0.2`.
- `git diff --check`: passed for the implementation and focused tests.
- No full suite, production build, browser smoke, or `qa:trace` was rerun after
  this slice; those remain deferred to the next grouped runtime checkpoint.

## Ownership and risk

| Surface | Result |
| --- | --- |
| `RuntimeControllerDispatchWorld` | Owns internal round-policy injection into the executor context. |
| `StateControllerExecutor` | Owns the bounded resource mutation guard and preserves telemetry. |
| `PlayableMatchRuntime` | Supplies the round flag across active, pause, standby, active-motion, and State -1 setup routes. |
| Helpers and Target resources | Not changed; remain separate owner/redirect contracts. |
| Snapshot/trace schema | Unchanged; no new public field or checksum input. |

## Claim ceiling

Allowed: bounded imported player/root state-controller suppression during the
source-mapped no-damage interval. Blocked: helper/effect-owner resources,
Target* resource controllers, team sharing, exact source enable predicates,
full post-round power ownership, `over.forcewintime`, exact frame order,
release fade/motif/dialogue, Common1/ZSS, score, rollback/netplay, and full
MUGEN/IKEMEN parity.

## Next frontier

The next grouped round slice should audit `over.forcewintime` and then extend
resource policy evidence to helper and Target routes only after their dispatch
ownership is explicit. Full checkpoint gates remain the release boundary.
