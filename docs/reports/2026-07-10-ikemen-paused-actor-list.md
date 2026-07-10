# IKEMEN paused actor-list checkpoint

## Outcome

Explicit `ikemen-go` now advances all eligible roots and helpers during Pause/SuperPause in prepared RunOrder. Actor-local movement allowances are independent of global pause ownership, newly created helpers append to the same paused pass, and positive same-frame SuperPause `p2defmul` values stack multiplicatively for current target actors.

## Evidence

- `synthetic-imported-ikemen-actor-pausemove.json`: checksum `e3cc937d`, final `b0174a37`.
- `synthetic-imported-ikemen-superpause-p2defmul-stack.json`: checksum `c55fb135`, final `5e843572`.
- `pnpm qa:trace`: 535/535, 504 required and 31 optional.
- `pnpm test`: 161 files, 1581 tests.
- `pnpm typecheck`, `pnpm build`, and `pnpm check:boundaries`: passed. Build retains the known Vite large-chunk warning.

## Quality verdict

Artifact: better. Verification: verified for bounded explicit-IKEMEN 1v1 root/helper fixtures. No visual gate was applicable.

## Blocked

Deferred Pause/SuperPause activation during the paused actor pass, helper/custom-state pause ownership, team-wide target breadth, `p2defmul = 0`, exact hitpause interaction, teams/simul/tag, rollback, and full IKEMEN parity.
