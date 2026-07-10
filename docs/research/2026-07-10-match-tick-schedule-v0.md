# Match Tick Schedule v0

Date: 2026-07-10

## Question

How can the project expose its current match-tick order before changing controller, movement, animation, combat, or presentation ownership without claiming exact MUGEN/IKEMEN parity?

## Primary sources

- Elecbyte CNS documentation: a player evaluates the current state every tick; special states `-3`, `-2`, and `-1` run in that order; controllers run top-to-bottom; an applied state transition stops the remaining controllers in that state: https://www.elecbyte.com/mugendocs/cns.html
- Elecbyte CNS trigger documentation: `GameTime` advances with the engine tick that updates players, collisions, and drawing, but this does not define a complete global subsystem schedule: https://www.elecbyte.com/mugendocs/cns.html
- Official IKEMEN GO repository: IKEMEN GO targets MUGEN compatibility plus extensions, but its project overview is not a normative cross-engine tick-order specification: https://github.com/ikemen-engine/Ikemen-GO

## Local observation

The current active branch executes:

```txt
stamp input
  -> frame start
  -> hitpause check
  -> pause check
  -> round timer
  -> command buffers
  -> input control
  -> fighter pair
       P1: kinematics -> animation -> controllers
       P2: kinematics -> animation -> controllers
  -> post-fighter combat
  -> presentation effects
  -> round finish
  -> expired SuperPause defence restoration
  -> presentation snapshot
  -> external snapshot materialization
```

Hitpause has precedence over Pause/SuperPause, which has precedence over the active branch. A paused source with remaining movetime can execute the same fighter-level kinematics, animation, and controller sequence. A `step()` at playback speed above one may execute multiple ticks; `MatchTickSchedule/v0` intentionally reports the last completed tick represented by the returned snapshot.

## Decision

- Add a renderer-independent `MatchTickSchedule/v0` snapshot contract.
- Record actual callbacks rather than generating an expected schedule after execution.
- Give every marker an owner, mutable-store inventory, and observable side-effect inventory.
- Include actor identity on fighter-level semantic stamps.
- Preserve the schedule in runtime traces and trace artifacts as diagnostics. Artifacts store static phase metadata once and compact phase/actor stamps per frame.
- Keep schedule data outside frame and aggregate behavior-checksum projections, with a differential checksum test.
- Compare the observed critical order with the roadmap target. Current `kinematics < controllers` and `animation < combat` are recorded as known divergences, not gate failures.
- Treat snapshot projection phases as a declared post-tick tail. They run when the external snapshot is materialized, after the last completed tick.

## Allowed claims

The sandbox can expose its current active, pause, and hitpause macro-order; identify critical fighter/combat/presentation stamps and their actors; persist the sidecar through trace artifacts; and prove that changing only schedule diagnostics does not change behavior checksums.

## Blocked claims

Exact MUGEN or IKEMEN global tick parity, controller-before-movement correction, animation-after-combat correction, complete nested subphase instrumentation, multi-tick history for accelerated steps, rollback/netplay scheduling, and parity score movement remain blocked.
