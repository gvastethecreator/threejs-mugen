# Official M.U.G.E.N / Ikemen-GO roadmap comparison — 2026-07-30

## Question

Which next tasks move the current port toward real M.U.G.E.N 1.1 and
Ikemen-GO compatibility, based on each project's official documentation and
the repository's current implementation rather than on old task volume?

## Bottom line

The selected queue is **T424 -> T425 -> T426 -> T427 -> T428 -> T429 ->
T430 -> T431 -> T432 -> T433 -> T434 -> T435 -> T436 -> T437 -> T438 ->
T463 -> T464 -> T465 -> T466 -> T467 -> T468 -> T469 -> T472 -> T473 ->
T474 -> T475 -> T476 -> T477 -> T478 -> T479 -> T480 -> T481**.
T424-T469, T472, T473, T474, T475, T476, T477, T478, T479, T480 and T481 are
closed-bounded. T471 remains the active content cursor; T480's bounded Ikemen
depth-velocity slice is complete:

1. make imported `select.def` own one real roster/stage selection path;
2. replace the disconnected ZSS model with a loader-to-live-runtime vertical
   slice; and
3. prove the ZSS `ignoreHitPause` wrapper reaches the same live pause scheduler
   as its CNS counterpart; and
4. preserve the official combined `ignoreHitPause persistent(n)` cadence while
    state time is frozen by that scheduler; and
5. prove raw-CNS positive `persistent(n)` cadence only during ordinary active
   root execution;
6. prove raw-CNS `persistent = 0` once per ordinary active-root state entry;
   and
7. prove only the paired raw-CNS `ignorehitpause = 1` plus `persistent = 0`
   pause route; and
8. prove only paired raw-CNS positive `persistent = 2` cadence while the
   HitPause scheduler freezes state time; and
9. align raw-CNS positive persistence with trigger-passing counts rather than
   elapsed state ticks;
10. extend the same bounded trigger-count contract to `StateDef -2`, which is
    checked before the current state and survives current-state entry; and
11. extend it to `StateDef -3`, with the official no-other-player-state
    exclusion preserved; and
12. extend the bounded trigger-count contract to imported CMD `StateDef -1`
    setup controllers, preserving the existing input/AI ownership seam; and
13. materialize omitted `fall.recover` / `fall.recovertime` defaults at the
    direct/projectile HitFall seam without overriding explicit values;
14. materialize omitted `fall.yvelocity` from the target/projectile localcoord
    width, preserving authored fall and hit velocities; and
15. isolate raw `persistent = 0` for imported CMD State -1 setup without
    sharing normal-state or special-state markers; and
16. apply that same isolated one-shot admission to static State -1
    `ChangeState`, after triggers and before destination resolution.
17. apply the isolated positive trigger-count map to the same static route,
    proving interval two across destination/current-state transitions; and
18. advance the default-runtime guard slide/control windows while preserving
    the authored `GetHitVar` values used by imported Common1 states.
19. carry official `airguard.ctrltime` through HitDef/projectile parsing and
    runtime, defaulting it to `guard.ctrltime` and selecting overrides only for
    air guard contacts; and
20. carry official `air.hittime` through HitDef/ModifyHitDef/projectile parsing
   and runtime, selecting it only for airborne normal hits and defaulting
   omitted values to 20 while preserving `ground.hittime` for ground hits.
21. preserve the official `fall=1` precedence so an airborne falling direct hit
    does not use `air.hittime` as its effective resolver stun.
22. carry official `down.hittime` and `down.velocity` through the HitDef,
    ModifyHitDef, Projectile, and lying-target runtime seams; use air timing when
    the down velocity launches vertically.
23. keep official `air.fall` separate from `fall`, selecting it only when the
    defender is airborne while preserving shared fall metadata and defaults.
24. carry the horizontal `down.velocity` component through direct and
    projectile lying-target hits, including authored `air.velocity` fallback;
25. preserve authored signed `fall.xvelocity` through the direct/projectile
    fall bounce seam, with omitted X retaining no-change semantics.
26. carry Ikemen `fall.zvelocity` through HitDef/projectile/HitFallSet metadata
    and apply authored depth velocity without inventing omitted-Z motion.
27. carry the official Ikemen three-component HitDef velocity vectors through
    direct and projectile contact, selecting authored Z by ground/air/down/
    guard context without inventing omitted depth motion.

This order keeps one bounded continuation from T419-T423, but gives priority
to shared M.U.G.E.N VM and package foundations. No score moves from this
research or task creation.

## Authority boundary

- Elecbyte's [M.U.G.E.N 1.1 Beta 1 overview and file inventory](https://www.elecbyte.com/mugendocs-11b1/mugen.html),
  [CNS format](https://www.elecbyte.com/mugendocs-11b1/cns.html), and
  [1.1 state-controller reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
  define the legacy baseline.
- The official [Ikemen-GO README](https://github.com/ikemen-engine/Ikemen-GO)
  targets backward compatibility on par with M.U.G.E.N 1.1 Beta while adding
  features. Its [wiki home](https://github.com/ikemen-engine/Ikemen-GO/wiki)
  explicitly documents Ikemen additions and sends legacy behavior back to
  Elecbyte.
- The Ikemen wiki is mutable. It selects candidate behavior, but implementation
  still has to agree with the repository's normative source pin
  [`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`](https://github.com/ikemen-engine/Ikemen-GO/tree/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703).

## Comparison with the current port

| Surface | Official contract | Current repository evidence | Roadmap decision |
| --- | --- | --- | --- |
| State execution | Elecbyte runs `-3`, `-2`, `-1`, then the current state. A `ChangeState` in the current state skips the remaining controllers and continues from the beginning of the destination state in the same tick. Controller order is significant; parameters are evaluated when the controller triggers. | Root and helper negative-state order, bounded Ikemen `-4`/`+1`, negative-state append, and helper `keyctrl` already have tests. `runActiveStateControllers` invokes the current state once and does not consume its scan result to continue a destination-state chain. | **T424** closes the shared root/helper current-state transition loop with a deterministic cycle guard and trace. Do not replan negative-state order. |
| P2 selection | Ikemen's [new P2 redirection documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29#p2) says the selected enemy ignores state 5150, drives automatic facing, and changes only when another enemy is at least 30 pixels closer. | T419-T423 provide filtered P2/Partner rosters, source-shaped distance, names, and a live expression consumer. T425 additionally routes the live roster to controller values. | **T425 closed:** 05b remains normative because the pin and reviewed master have no 30-pixel branch. Source-visible movement/candidate change refreshes P2; `EnemyNear`, Partner, and legacy profiles stay unchanged. |
| Game package selection | Elecbyte lists `select.def` as the character/stage configuration and `system.def` as the title/select-screen definition. Character, stage, motif, AIR, SFF, and SND files form one assembled game. | `select.def` is recognized by package/scanner tests, while the App's playable roster and stage remain owned by local project/demo state. Existing Common1/FightFX loading is partial but real. | **T426** creates a versioned `select.def` roster/stage manifest and connects it to one real Play/Studio selection path. Full arcade rules and screenpack rendering remain later gates. |
| Controller persistence | Elecbyte lists `persistent` and `ignorehitpause` as optional integer constants on every state controller; its CNS reference says `persistent = 0` activates only once in a state and positive values count trigger-passing activations. The official [ZSS guide](https://github.com/ikemen-engine/Ikemen-GO/wiki/ZSS) defines `persistent(n)` as an execution-frame interval and shows the CNS spelling `persistent = 5`; its combined ZSS wrapper can precede `if`. | Direct/fallback sources lower a named `StateDef`/controller subset into shared IR. T428/T429 prove bounded ZSS HitPause routes. T430-T438 cover bounded raw normal/paused/special/CMD setup persistence; T463/T464 cover static State -1 ChangeState zero and interval-two admission. | **T427-T438/T463-T464 closed-bounded:** trace/build proof covers loader, pause filter, ZSS cadence, raw normal/paused/special-state persistence, CMD `-1` setup (`ba3d289d` / `27e1ffb7`), and static CMD `-1` ChangeState zero/two (`88931500` / `3681fafa`). Other intervals, failed-value activation order, player-owned custom states, dynamic values, ZSS grammar, and generic VM parity remain blocked. |

## Selected task contracts

### T424 — M.U.G.E.N same-tick state transition chain

Priority: P0. Dependencies: T423 only as the current repository checkpoint.

The executor must expose whether `ChangeState` stopped a state pass, restart at
the destination state in the same tick, and apply the rule to imported roots
and helpers under `mugen-1.1` and `ikemen-go`. A bounded transition budget must
turn cycles into deterministic diagnostics instead of freezing the browser.
Proof requires focused order/cycle tests and one required imported trace.

### T425 — Ikemen stable P2 switch contract

Priority: P1. Dependency: T419-T423 and a recorded 05b/current-wiki source
decision. **Closed-bounded.**

The task distinguished the behind-distance penalty already implemented from the
wiki's 30-pixel target-retention wording. The authoritative pin does not
contain that branch, so T425 retained source-visible cache invalidation instead
of adopting 29/30 thresholds. Tests cover a one-pixel overtake, KO/ineligible
removal, deterministic order, and a live `P2Name` controller value. Required
trace `synthetic-imported-ikemen-p2-value` passed as part of 668/668
artifacts; full parity remains out of scope.

### T426 — M.U.G.E.N `select.def` playable roster/stage authority

Priority: P1. Dependency: the existing VFS/character/stage loaders.

The first contract covers direct character and stage entries, stable source
locations/fingerprints, safe path resolution, missing/malformed diagnostics,
and one real product consumer. It must preserve the existing manual/demo
fallback when no valid manifest exists. Browser proof is required when the
selection UI changes.

### T427 — Ikemen live ZSS state pipeline

Priority: P2. Dependencies: T424 and the existing scanner/source-authority
contracts.

The parser/compiler path must lower declared supported ZSS constructs to the
same runtime IR as CNS, keep unsupported constructs located and fail-closed,
support direct `.zss` and `.cns.zss` fallback, and execute through the real
character loader and match runtime. The isolated DA30 model is historical
evidence only and cannot satisfy this task.

**Closed-bounded:** `Null`, `PosAdd`, `ChangeState`, and `VelSet` execute from
the named ZSS grammar only; direct/fallback ZIP fixtures, M.U.G.E.N rejection,
and required trace `ikemen-zss-live` (`47c627a2`) passed. General ZSS remains
blocked.

### T428 — Ikemen ZSS HitPause wrapper semantics

Priority: P2. Dependency: T427.

Elecbyte documents `persistent` and `ignorehitpause` as optional constant
controller parameters, while the official ZSS guide expresses them as enclosing
blocks. Reuse the existing CNS hit-pause baseline to prove a real parsed ZSS
`ignoreHitPause` block runs during global hit pause and an unwrapped ZSS
controller remains frozen. Do not add ZSS `HitDef`, dynamic persistent, or new
controller families.

**Closed-bounded:** a separate mixed CNS/ZSS fixture starts real hit pause in
CNS `StateDef 200`, runs source-located wrapped ZSS `VelSet`, and leaves the
unwrapped ZSS `PosAdd` frozen. The M.U.G.E.N rejection remains located;
`ikemen-zss-hitpause-wrapper` checksum `b6533370` passed within 670/670 trace
artifacts. This remains only one `ignoreHitPause` route, not wrapper parity.

### T429 — Ikemen ZSS combined wrapper persistence

Priority: P2. Dependencies: T427 and T428.

The official ZSS guide expressly permits
`ignoreHitPause persistent(5) if ... { ... }`, while Elecbyte requires both
controller parameters to be integer constants. The current T427 interval
predicate uses state elapsed time, and T428 shows that clock is intentionally
frozen during hit pause. Implement a per-actor/controller cadence that starts
on the first eligible paused execution, skips the next eligible frame for
`persistent(2)`, resets on state entry, and changes no CNS behavior. Do not
admit dynamic persistence or broader ZSS grammar/controllers.

**Closed-bounded:** the mixed fixture
executes the wrapper on pause ticks 2 and 4, skips tick 3, then resets on the
CNS state-200-to-201 transition and executes in state 201 on tick 5. Required
trace `ikemen-zss-combined-persistent-wrapper` checksum `4ff43eb7` passed in
671/671 artifacts (637 required); focused/core runtime, full 311/3260 suite,
typecheck, boundaries, and the production build passed. This does not expand
raw CNS persistence, dynamic values, broader ZSS grammar/controllers, Lua, or
compatibility scores.

### T430 — M.U.G.E.N CNS positive persistent cadence

Priority: P1. Dependency: T429's isolated paused-ZSS cadence boundary.

Elecbyte exposes `persistent` as an optional integer constant on each state
controller; its CNS reference defines positive values as every Nth trigger pass.
T430/T434 prove only `persistent = 2` in a raw CNS normal active root state:
first pass, sparse trigger-count skip, next trigger interval, and reset after a
state transition. The callback does not leak this behavior into global or
special states, standby roots, pause-only scans, helpers, `persistent = 0`,
dynamic/non-integer values, or raw CNS `ignorehitpause` pairing.

**Closed-bounded:** required `mugen-cns-persistent-cadence` remains a normal
active-root positive constant gate; T434 adds the sparse trigger-count proof in
the final trace corpus. The claim remains normal active-root positive constants
only.

### T431 — M.U.G.E.N CNS persistent zero

Priority: P1. Dependency: T430.

Elecbyte's CNS reference defines `persistent = 0` as one activation during a
state. T431 adds an actor/controller-local marker after trigger evaluation for
ordinary raw-CNS active-root normal scans only. The required fixture proves the
first execution, repeated skips, and `200 -> 201 -> 200` re-entry reset while
an unparameterized controller keeps executing.

**Closed-bounded:** required `mugen-cns-persistent-zero` checksum `d13ad12a`
passes in 673/673 artifacts (639 required), with focused coverage, typecheck,
313/3264 suite, build, and boundaries. Direct same-id `ChangeState` timing,
ZSS zero, paused CNS, helpers/specials, dynamic values, and generic VM parity
remain blocked.

### T432 — M.U.G.E.N CNS HitPause persistent zero

Priority: P1. Dependency: T431.

T432 audited and proved only the raw-CNS intersection
`ignorehitpause = 1` plus `persistent = 0` during ordinary active-root
pause-only scans. It runs on the first eligible paused scan and skips later
ones until state re-entry, while preserving normal T431 behavior and the T429
ZSS counter. It does not infer raw positive pause cadence from the normal-state
clock or establish a ZSS-zero or generic wrapper rule.

**Closed-bounded:** the CNS-owned HitPause fixture executes the paired `PosAdd`
at pause ticks 2 and 6 around `200 -> 201 -> 200`, skips repeated scans, and
keeps its unwrapped `VelSet` frozen. Required
`mugen-cns-hitpause-persistent-zero` checksum `94b49516` passed in 674/674
artifacts (640 required), with focused 5/333 coverage, typecheck, 314/3266
suite, build, and boundaries. No UI changed, so smoke is N/A.

### T433 — M.U.G.E.N CNS HitPause persistent cadence

Priority: P1. Dependency: T432.

T433 must prove only a paired raw-CNS `ignorehitpause = 1` plus
`persistent = 2` controller in ordinary active-root pause scans. Because state
time is frozen, it needs a source-separated paused-pass counter for
first/skip/interval/reset behavior; it cannot use T430's state clock or claim
an interval range, ZSS grammar behavior, helper/special scope, or general VM
timing.

**Closed-bounded:** paired raw-CNS `PosAdd` executes at pause ticks `2, 4, 6`
around `200 -> 201 -> 200` while unwrapped `VelSet` stays frozen. Required
trace `mugen-cns-hitpause-persistent-cadence` checksum `d6d00fd0` passed in
675/675 artifacts (641 required, 34 optional), with focused 6/335 coverage,
full 315/3268 suite, typecheck, build, and boundaries.

### T434 — M.U.G.E.N CNS persistent trigger count

Priority: P1. Dependency: T433.

Elecbyte's CNS reference says positive `persistent = n` activates on every Nth
time the trigger is true. T434 replaces the raw-CNS normal positive state-clock
shortcut with an actor/controller-local trigger-pass counter, still bounded to
`persistent = 2` and ordinary active-root current-state scans. A CC0 fixture
uses sparse `StageTime = 1, 3, 4` triggers so tick modulo and trigger count
diverge; the controller must execute on ticks 1 and 4, not tick 3.

Other intervals in new scopes, paused/global/special/standby/helper owners,
dynamic values, ZSS grammar, generic VM timing, and full parity remain blocked.

### T435 — M.U.G.E.N CNS State -2 persistent

Priority: P1. Dependency: T434.

Elecbyte's CNS reference defines `StateDef -2` as a global state checked every
tick before the current state. T435 applies the already-proven raw-CNS
trigger-count rule to only `persistent = 2` in an ordinary playable root. The
counter is separate from normal-state, paused, zero, and ZSS maps, so a
`0 -> 200` current-state transition cannot reset it. A CC0 fixture uses sparse
`StageTime = 1, 3, 4` triggers; the source-located controller executes at ticks
1 and 4 and skips tick 3.

**Closed-bounded:** required trace `mugen-cns-special-persistent` checksum
`6fce3962` passed in 677/677 artifacts (643 required), with focused 1/2,
317/3272 full suite, typecheck, build, boundaries, and hygiene. `-3`/`-1`,
player-owned custom states, pause, helpers, dynamic values, and generic VM
parity remain blocked.

### T436 — M.U.G.E.N CNS State -3 persistent

Priority: P1. Dependency: T435.

Elecbyte's CNS reference defines `StateDef -3` as a global state checked every
tick before the current state, except while the player is using another
player's state. T436 applies the same narrow raw-CNS `persistent = 2`
trigger-count contract to an ordinary playable root. Its controller-local
counter is separate from normal, paused, zero, ZSS, and `-2` maps and survives
current-state entry. The runtime explicitly requires `fighter.stateOwner` to
be undefined, preserving the official exclusion.

**Closed-bounded:** a CC0 fixture with sparse `StageTime = 1, 3, 4` triggers
executes the source-located `-3` controller at ticks 1 and 4, skips tick 3, and
continues after `0 -> 200`. Required trace
`mugen-cns-state-minus-three-persistent` checksum `b2719d71` passed in 678/678
artifacts (644 required), with focused 1/2, 318/3274 full suite, typecheck,
build, boundaries, and hygiene. `-1`, player-owned custom states, pause,
helpers, dynamic values, generic VM timing, and full parity remain blocked.

### T437 — M.U.G.E.N CMD State -1 setup persistent

Priority: P1. Dependency: T436.

Elecbyte checks State -1 setup controllers in the command-driven pre-current
state seam. T437 applies raw `persistent = 2` trigger-count semantics only to
an imported CMD `VarSet`, preserving existing input/AI ownership and keeping a
separate counter across current-state entry.

**Closed-bounded:** sparse `StageTime = 1, 3, 4` executes at ticks 1 and 4,
skips tick 3, and survives `0 -> 200`. Required trace
`mugen-cns-state-minus-one-persistent` checksum `ba3d289d` passed in 679/679
artifacts (645 required, 34 optional), with 319/3276 full suite, typecheck,
build, boundaries, hygiene, and docs. T437 alone leaves State -1
ChangeState/zero, pause,
helpers, dynamic values, and generic VM parity remain blocked.

### T438 — M.U.G.E.N CMD State -1 setup persistent zero

Priority: P1. Dependency: T437.

Elecbyte's controller-wide `persistent = 0` rule is applied to the existing
imported CMD State -1 setup seam with its own actor/controller-local marker.
Current-state entry does not clear it, while the next actor lifecycle does.

**Closed-bounded:** required trace
`mugen-cns-state-minus-one-persistent-zero` checksum `27e1ffb7` passed in
680/680 artifacts. State -1 ChangeState was deliberately left to a separate
route because it resolves and mutates destination state.

### T463 — M.U.G.E.N CMD State -1 ChangeState persistent zero

Priority: P1. Dependency: T438.

Elecbyte documents `persistent` as a controller-wide constant and describes
zero as one activation in the controller's state lifetime. T463 applies only
that bounded zero admission to imported CMD State -1 static `ChangeState`:
triggers pass first, the isolated State -1 marker is claimed second, and the
destination is resolved last. This keeps destination evaluation outside the
setup-controller path without sharing normal, paused, `-2`, or `-3` maps.

**Closed-bounded:** a CC0 loader fixture routes once at tick 1 through the
same-tick `0 -> 200 -> 201` chain, returns to state 0 through existing input
control, and does not reroute at later eligible StageTime ticks 3/4. Required
trace `mugen-cns-state-minus-one-changestate-persistent-zero` checksum
`88931500` passed in 681/681 artifacts (647 required, 34 optional), with
focused 4/12, full 323/3285, typecheck, build and boundaries. Positive
intervals, failed-value activation order, pause, helpers, custom owners,
dynamic values, ZSS and generic VM parity remain blocked.

### T464 — M.U.G.E.N CMD State -1 ChangeState persistent cadence

Priority: P1. Dependency: T463.

Elecbyte's positive `persistent = n` rule counts trigger-passing activations.
T464 applies the existing isolated State -1 positive map only to static CMD
State -1 `ChangeState persistent = 2`; the compiled destination guard keeps
dynamic and failed-value order outside this cut.

**Closed-bounded:** sparse `StageTime = 1, 3, 4` triggers execute at ticks 1
and 4, skip tick 3, and preserve one counter through both
`0 -> 200 -> 201 -> 0` chains. Required trace
`mugen-cns-state-minus-one-changestate-persistent` checksum `3681fafa` passed
in 682/682 artifacts (648 required, 34 optional), with focused coverage, full
324/3287, typecheck, build and boundaries. Other intervals, failed-value
activation order, pause, helpers, custom owners, dynamic values, ZSS and
generic VM parity remain blocked.

### T465 — M.U.G.E.N guard timing cadence

Priority: P1. Dependency: T464.

Elecbyte defines `guard.slidetime` as the guarded slide duration (defaulting to
`guard.hittime`) and `guard.ctrltime` as the control-return duration (defaulting
to `guard.slidetime`); Common1 reads those authored values through
`GetHitVar(slidetime)` and `GetHitVar(ctrltime)`. T465 keeps those values stable
and adds separate remaining counters to the default runtime. The default route
stops horizontal guard slide at the remaining-slide boundary and restores
control at the remaining-control boundary; imported authored guard states keep
their own Common1 controllers authoritative.

**Closed-bounded:** direct/projectile guard contact, normal non-pause stun
cadence, and reset paths pass focused coverage; the full 324/3289 suite,
typecheck, build, boundaries, and 682/682 trace corpus remain green. Air guard
selection, new Common1 authoring, hitpause scheduling, exact friction, and
broad parity remain out of scope. Source authority: [M.U.G.E.N controller
reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html) and [M.U.G.E.N
trigger reference](https://elecbyte.com/mugendocs-11b1/trigger.html).

### T466 — M.U.G.E.N air-guard control time

Priority: P1. Dependency: T465.

The same Elecbyte controller reference defines `airguard.ctrltime` as the
air-guard control window and defaults it to `guard.ctrltime`. T466 carries the
field through HitDef/ModifyHitDef and projectile compiler/runtime paths. The
resolver uses the ground guard control value when the air field is omitted;
CombatResolver selects the explicit air value only for air guard contacts.

**Closed-bounded:** parser/compiler, imported fighter/projectile data,
fallback/override resolution, and ground-versus-air combat selection are
covered by focused tests. The 324/3289 suite, typecheck, build, boundaries,
and 682/682 trace corpus pass with unchanged checksums. Air-guard state
selection, hitpause, new Common1 authoring, exact physics and broad parity
remain out of scope. Source authority: [M.U.G.E.N controller
reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html).

### T467 — M.U.G.E.N air hit time

Priority: P1. Dependency: T466.

Elecbyte defines `air.hittime` as the duration P2 remains in an airborne hit
state before it can guard again, with a default of 20 when omitted; it is
separate from `ground.hittime`. T467 carries the field through
HitDef/ModifyHitDef and Projectile compiler/parser data, imported
move/projectile materialization, and normal-hit combat resolution. Airborne
defenders select the authored air value
or the 20-tick default, while ground hits continue to use `ground.hittime` and
guard contacts retain their guard-specific timing.

**Closed-bounded:** focused compiler/HitDef/projectile/combat coverage,
`RuntimeTraceGatePresets` regression coverage, and the full 324-file/3290-test
suite pass. `pnpm qa:trace` remains 682/682 with unchanged checksums; exact airborne physics, landing/Common1
animation, hitpause timing, dynamic expressions, and broad parity remain out
of scope. Source authority: [M.U.G.E.N controller
reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html) and [M.U.G.E.N
trigger reference](https://elecbyte.com/mugendocs-11b1/trigger.html).

### T468 — M.U.G.E.N air hit time / fall interaction

Priority: P1. Dependency: T467.

Elecbyte's HitDef reference states that `air.hittime` has no effect when the
`fall` parameter is set to 1, while `fall=1` routes P2 into the fall state. T468
applies that precedence at the effective direct-hit resolver: airborne hits
without fall keep the authored/default 20-tick `air.hittime`, while airborne
falling hits use the existing bounded ground `hitStun` fallback. Ground hits,
guard contacts, projectile no-fall paths, and direct fall metadata are left
unchanged.

**Closed-bounded:** 27 resolver tests and the targeted fall trace subset pass;
the final closeout passes 324/3291 tests, typecheck, build, boundaries,
`qa:trace` 682/682, and diff hygiene. The claim is intentionally below exact
Common1 fall/landing behavior: current
Ikemen-GO source still stores airborne hit time in `GetHitVar` data while also
setting the air-fall flag, so T468 does not claim exact `GetHitVar(hittime)`
lifetime or full Ikemen parity. Source authority: [M.U.G.E.N controller
reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html), [M.U.G.E.N
trigger reference](https://elecbyte.com/mugendocs-11b1/trigger.html), and
[Ikemen-GO `src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/src/char.go).

### T469 — M.U.G.E.N down hit time / down velocity

Priority: P1. Dependency: T468.

Elecbyte defines `down.hittime` as the slide duration when P2 is already lying
down and explicitly ignores it when the Y component of `down.velocity` is
non-zero. Omitted `down.velocity` inherits the air velocity. Ikemen-GO's
current `HitDef` reset sets `down_hittime` to 20 and its lying-target branch
assigns both `hittime` and `ctrltime` from that field before applying
`down_velocity`. T469 mirrors that bounded selection in the port: zero-Y
lie-down hits use authored/default 20-tick down timing, while non-zero-Y hits
use airborne timing and the launch velocity.

**Closed-bounded:** typed compiler/runtime propagation and focused
compiler/HitDef/projectile/combat coverage pass, alongside the existing down-hit
trace subset pass. Final closeout passes 324/3292 tests, typecheck, build,
boundaries, `qa:trace` 682/682, and diff hygiene. Exact lie-down Common1 tables, bounce/recovery, and full
`GetHitVar` lifetime parity remain outside the claim. Source authority:
[M.U.G.E.N controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
and [Ikemen-GO `src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/src/char.go).

### T472 — M.U.G.E.N `down.bounce` hit-fall contract

Priority: P1. Dependency: T469.

Elecbyte defines `down.bounce` as a boolean that makes P2 bounce once using
the authored fall velocities, while ignoring it when `down.velocity.y` is zero.
The current bounded slice carries the flag through direct HitDef,
ModifyHitDef and Projectile data, materializes projectile fall metadata, and
gates the `HitFallVel` seam: explicit `0` clears bounce velocity, while
explicit `1` and omitted values preserve the compatibility path used by the
existing Common1 fixture.

**Closed-bounded:** focused compiler/HitDef/direct/projectile/HitFall coverage
passes 198 tests; final gates pass 324 files / 3294 tests, typecheck, build,
boundaries, `qa:trace` 682/682 and diff hygiene. UI smoke is N/A. Exact default
adjudication, Common1 landing tables, bounce lifetime and full `GetHitVar`
parity remain outside the slice. Source authority:
[M.U.G.E.N controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
and [Ikemen-GO `src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/src/char.go).

### T473 — M.U.G.E.N `fall.recover` / `fall.recovertime` defaults

Priority: P1. Dependency: T472.

Elecbyte's HitDef reference documents `fall.recover` with a default of `1` and
`fall.recovertime` with a default of `4`; an explicit zero disables recovery.
The bounded implementation applies those defaults only when `fall = 1` is
active, for both direct HitDef and projectile materialization. Explicit
`recover = 0`, authored recovery times, and disabled-fall metadata are left
unchanged.

**Closed-bounded:** focused resolver/direct/projectile coverage passes 102 tests;
the final suite passes 324/3296 tests, typecheck, build, boundaries and
`qa:trace` 682/682. UI smoke is N/A because no visible surface changed. Exact
Common1 recovery-state choreography, landing timing and full parity remain
outside the claim. Source authority:
[M.U.G.E.N controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html).

### T474 — M.U.G.E.N `fall.yvelocity` localcoord defaults

Priority: P1. Dependency: T473.

Elecbyte's HitDef reference documents omitted `fall.yvelocity` as `-4.5` in
240p, `-9` in 480p, and `-18` in 720p. The bounded implementation keeps the
existing precedence for authored `fall.yvelocity` and authored hit velocity,
then resolves the final default from the fighter/projectile localcoord width
using the documented 320px baseline. Direct hits use the defender localcoord;
projectiles use their carried localcoord.

**Closed-bounded:** focused resolver/direct/projectile coverage passes 105 tests;
the final suite passes 324/3299 tests, typecheck, build, boundaries and
`qa:trace` 682/682. UI smoke is N/A because no visible surface changed. Exact
Common1 landing physics, non-linear viewport scaling and full fall parity remain
outside the claim. Source authority:
[M.U.G.E.N controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html).

### T475 — M.U.G.E.N `air.fall` airborne-only selection

Priority: P1. Dependency: T474.

Elecbyte's HitDef reference defines `air.fall` as the fall toggle used when P2
is in the air and states that omitted `air.fall` defaults to `fall`. The bounded
implementation now keeps the flag typed instead of merging it into the base
fall toggle: `fall = 0, air.fall = 1` falls only for an airborne defender,
while an enabled base `fall` remains effective in every eligible state. Direct
and projectile materialization reuse the existing recovery and localcoord-aware
velocity defaults after the effective flag is selected.

**Closed-bounded:** compiler, HitDef dispatch, resolver, direct combat,
projectile parser/combat and imported metadata regressions pass; the full suite,
typecheck, build, boundaries, `qa:trace`, and diff hygiene pass. UI smoke is N/A
because no visible surface changed. Exact Common1 fall/landing choreography and
full parity remain outside the claim. Source authority:
[M.U.G.E.N controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html).

### T476 — M.U.G.E.N/Ikemen `down.velocity.x` propagation

Priority: P1. Dependency: T475.

Elecbyte defines `down.velocity` as an X/Y pair assigned when P2 is already
lying down, with omitted values inheriting `air.velocity`. Ikemen-GO's current
`src/char.go` reset and hit path materialize both components and apply the X
component to the target's `GetHitVar.xvel` for a grounded lie-down target. The
port previously retained only Y (`downVelocityY`), so direct and projectile
contacts replaced authored horizontal down velocity with the generic push.
T476 adds typed `downVelocityX` propagation for HitDef/ModifyHitDef, imported
state moves and projectiles, and applies the signed X velocity only for
lie-down hits. Synthetic moves that omit the field keep the compatibility
push fallback.

**Closed-bounded:** focused resolver, direct, projectile, parser and imported
metadata regressions pass; final 324/3308 suite, typecheck, build, boundaries,
`qa:trace` 682/682 and diff hygiene pass. Exact Z velocity, Common1 tick order,
custom-state ownership and full M.U.G.E.N/Ikemen parity remain outside the
slice. Source authority:
[M.U.G.E.N controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
and [Ikemen-GO `src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/src/char.go).

### T477 — M.U.G.E.N/Ikemen `fall.xvelocity` signed bounce

Priority: P1. Dependency: T476.

Elecbyte defines `fall.xvelocity` as the X velocity P2 receives when bouncing
off the ground and specifies that omission means no change. Ikemen-GO keeps the
authored value in `GetHitVar.fall_xvelocity` and assigns it directly in
`HitFallVel`, without mirroring by attacker or projectile facing. The port had
been applying `facing * abs(value)` in direct and projectile fall materialization.
T477 preserves the authored signed value and leaves omitted X undefined.

**Closed-bounded:** focused direct/projectile/HitFall regressions pass (121
tests), and the final 324-file / 3310-test suite, typecheck, build, boundaries
and `qa:trace` 682/682 gates pass. Exact Common1 landing/friction choreography,
Z velocity, dynamic-expression breadth and full M.U.G.E.N/Ikemen parity remain
outside the slice. Source authority:
[M.U.G.E.N controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
and [Ikemen-GO `src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/src/char.go).

### T478 — Ikemen CommonFX `fx.scale` propagation

Priority: P1. Dependency: T477.

The official Ikemen-GO CommonFX contract defines prefixed graphic/sound packs
through a DEF `[Info]` section with `prefix`, `fx.scale`, and `localcoord`, then
resolves AIR/SFF/SND files from `[Files]`. The port already selected prefixed
FightFX packages and their AIR/SFF/SND payloads, but discarded `fx.scale` before
runtime presentation. T478 parses the positive scale and carries it through
the imported fighter, resolved hit-spark AIR frames, and Three.js sprite
dimensions/axis offsets. Omitted, invalid, and unit scale values retain the
existing path.

**Closed-bounded:** focused loader/importer/asset/renderer regressions pass (38
tests), and typecheck passes. `localcoord` is recorded as package metadata but
is not yet used for projection; ZSS CommonFX sources, `sys.ffx` cache/refcount,
audio arbitration, palette/layer parity, and full FightFX compatibility remain
open. Source authority: [Ikemen-GO Common files / CommonFX](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#common-files-air-cmd-const-fx-states).

### T479 — Ikemen CommonFX `localcoord` scale projection

Priority: P1. Dependency: T478.

The official CommonFX definition couples `fx.scale` with an authored
`localcoord`. The pinned Ikemen-GO `char.go` animation path calculates the
CommonFX factor as `fx.scale * 320 / fx.localcoord.x`, then applies the owning
character's `localcoord.x / 320` ratio before presenting the animation. T479
keeps the package coordinate pair on every resolved CommonFX/FightFX AIR frame
and derives that effective factor at asset resolution, so a 640-wide package
used by a 320-wide character resolves to half the authored scale while unit
metadata remains unchanged.

**Closed-bounded:** focused asset-resolution/importer coverage passes 39 tests
and typecheck passes. Exact custom-state localcoord transitions, animation
timing, palette/layer/audio/cache parity, and full FightFX compatibility remain
open. Sources: [Ikemen-GO Common files / CommonFX](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#common-files-air-cmd-const-fx-states)
and [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go).

### T480 — Ikemen-GO `fall.zvelocity` depth propagation

Priority: P1. Dependency: T477.

Ikemen-GO stores `fall_zvelocity` in `GetHitVar`, copies the authored value
from the HitDef fall group, and applies it directly to the character's depth
velocity in `hitFallVel`; omitted X/Z values remain no-change values. T480
keeps that optional Z component through HitDef, imported state moves,
projectile, and `HitFallSet` compilation, then applies it to the existing
`combatDepth.velocity` seam. The existing X/Y behavior is unchanged.

**Closed-bounded:** focused compiler/direct/projectile/HitFall/imported-fighter/
expression-context coverage passes 230/230; the final suite is 324/3316 with
typecheck/build/boundaries and 682/682 trace gates green. This is an Ikemen
depth-metadata slice, not a claim of exact M.U.G.E.N Z support or full
Common1 depth physics. Source authority: [Ikemen-GO `src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go).

### T481 — Ikemen-GO HitDef velocity Z propagation

Priority: P1. Dependency: T480.

The official changed state-controller reference documents three-component
`ground.velocity`, `air.velocity`, `down.velocity`, `guard.velocity` and
`airguard.velocity`; the third component is the authored Z velocity. T481
preserves that optional component through typed HitDef/imported state and
player-owned Projectile paths, selects it for the defender's actual
ground/air/down/guard context, and writes explicit results to
`combatDepth.velocity`. Omitted Z stays absent.

**Closed-bounded:** focused compiler/HitDef/resolver/direct/projectile/
imported-fighter coverage passes 251/251; final suite is 324/3317 with
typecheck/build/boundaries and 682/682 trace gates green. This bounded vector
slice excludes ModifyHitDef Z mutation, Common1 acceleration/friction, helper
ownership and full depth physics. Source authority: [Ikemen-GO changed state-controller reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitdef-parameters).

## Work deliberately not recreated

- M.U.G.E.N/Ikemen negative-state source precedence and Ikemen append behavior.
- Root `-3/-2/-1` order, Ikemen root/helper `-4/+1`, and bounded helper
  `keyctrl` inheritance already present in focused runtime tests.
- Existing Common1 state-source fallback, FightFX AIR/SFF/SND plumbing, and
  scanner-only ZSS recognition.
- T419-T423 P2 candidate filtering, distance order, P2-family/Partner name
  reads, and active expression context wiring.

## Closed uncertainty and next action

T425's wiki/pin cache discrepancy remains recorded and bounded. T426 through
T437/T438/T463/T464/T465/T466/T467/T468 closed their loader-to-product and loader-to-runtime cuts without score
motion. T429 has final proof for the official combined wrapper interval while a
real HitPause scheduler freezes state time; T430/T431/T434 cover raw-CNS normal
paths, T432/T433 cover paired raw-CNS pause routes, and T435/T436 cover the
`-2`/`-3` special-state routes with the `-3` owner boundary, T437/T438 cover
CMD State -1 setup, and T463/T464 cover only static State -1 ChangeState
zero/interval-two routes. T465 is now closed-bounded for the guard/Common1
timing slice, T466 closes its adjacent air-control parameter seam, T467
closes the adjacent air-hit timing parameter seam, T468 closes the
`fall=1` precedence seam, T472 closes the explicit `down.bounce` hit-fall
velocity gate, T473 owns the bounded fall-recovery default seam, T474 owns the
localcoord-aware omitted fall velocity seam, T475 owns airborne-only
`air.fall` selection, T476 closes the lying-target horizontal `down.velocity`
seam, T477 owns the closed-bounded signed `fall.xvelocity` seam, T478/T479 own
the bounded CommonFX scale/localcoord seams, and T480 owns the bounded Ikemen
`fall.zvelocity` depth seam. T481 closes the three-component HitDef velocity
Z continuation; all claim ceilings are
deliberately separate from
Common1 authored-state parity. The user-directed content queue remains
separate in `docs/ROADMAP_CONTENT_PACK.md`. Scores remain unchanged until independent
adjudication. T471 is now in progress: Bruno Giro has four provider-generated
rows with fresh provenance, alignment and fourteen runtime previews; aggregate
spritesheet identity/contract gates remain open.
