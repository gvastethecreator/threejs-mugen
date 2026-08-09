# Official M.U.G.E.N / Ikemen-GO roadmap comparison — 2026-08-08

## 2026-08-08 continuation — T561-T608 ModifyProjectile

Pinned Ikemen GO `develop` commit `149402f` resolves ModifyProjectile `id` and
`index` before applying Projectile and shared HitDef fields to selected live
objects. T561-T602 now mirror that structure through the port's typed seams:
oldest-first active owner selection, separate `projid` mutation, active and
terminal owner AIR replacement, and static `attr`, `guardflag`, and
`affectteam`, `hitflag`, reaction types, target/chain IDs, lethal flags, and
`air.juggle`, damage, givepower metadata, `numhits`, separate HitDef priority,
custom P1/P2 states, `missonoverride`, P2 sprite-priority mutation, and
`forcenofall`, `forcestand`, `forcecrouch`, and core fall
damage/velocity/recovery, supported fall envshake fields, `dizzypoints`,
`guardpoints`, hit/guard `redlife` and floating-point `score` pairs, and static
`p2clsncheck`/`p2clsnrequire` target-collision policies, plus `down.recover`
and `down.recovertime` fall/get-up metadata. Current
T589-T600 additionally port the final `attack.depth` switch case plus
`p2facing`, air/ground/guard/down hit durations, and ground/air guard control
timers, one-to-three component `down.velocity` with zero defaults, and
`fall`/`air.fall`/`down.bounce`, guard/air-guard velocity, and airborne hit
velocity through static or bounded dynamic root/helper values. Grounded hit
velocity is component-wise: each supplied X/Y/Z value replaces only that live
component, while the MUGEN `n` token preserves it. T601 adds
`ground.slidetime`; T602 ports both normal and guard pause values. Pinned source
uses the first value for `Projectile.hitpause`, the second for defender hit
shake, zero defaults for a missing normal pair, and normal-pair inheritance for
a missing guard pair. Current
combat, GetHitVar, fall, juggle, custom-state, HitOverride, and renderer seams
consume the changed normalized metadata. Accepted Projectile hits clear the
target fall flag when `forcenofall` is enabled; guards do not. Projectile
contacts skip P1 priority
replacement; ModifyProjectile also ignores P1 priority, matching pinned
Ikemen. Visual `projsprpriority` remains separate.

This is an adaptation, not a full engine claim. The port uses string flags and
`F/B/E` team-affinity normalization instead of Ikemen's internal integer masks,
and omits dynamic flag/enum expressions, full team-mode topology, exact tick
order, rollback serialization, and remaining shared HitDef fields. T603 closes
old/new width plus height/depth guard-distance pairs. T604 closes live
Projectile spark refs, angles, and offsets. T605 closes one-to-three component
`mindist`/`maxdist` replacement and later Projectile-origin target correction.
T606 closes selected `xaccel`/`yaccel`/`zaccel` metadata and accepted-contact
GetHitVar readback. T607 selects `envshake.time/freq/ampl/phase/mul/dir` plus
accepted hit/guard camera emission. Pinned contact resets `diradd = 0` and
`decay = 1`, so those compiled ModifyProjectile fields remain outside the
slice. T608 selects `fall.envshake.dir`, which pinned accepted contact copies
to the getter and `FallEnvShake` later applies. Pinned contact does not copy
`fall.envshake.diradd` or `fall.envshake.decay`, so both remain outside this
slice. The five
compiled corner-push fields are not selected because Ikemen's ModifyProjectile
bytecode cases are commented out.

## 2026-08-08 continuation — T543-T560

The current Ikemen trigger reference defines
`ClsnVar(value_type,index,elem)` as a current-box coordinate read for
`clsn1`, `clsn2`, or `size`, with `back`, `front`, `top`, and `bottom`
selectors in AIR coordinate space. Current `develop` source returns `NaN` for
missing boxes and converts redirected reads across `localcoord` widths.

T543 is closed-bounded. The port reads current-frame AIR boxes, runtime
`OverrideClsn`, and the composed size box through shared CNS/controller
contexts and the read-only Testbench. It does not apply `TransformClsn` to the
raw coordinate read. Focused coverage is 5 files / 80 tests; runtime and
browser gates pass.

T544 is closed-bounded. The same official reference defines
`ClsnOverlap(box_type_1, playerID, box_type_2)` as a transformed player-box
overlap query that accounts for angle and scale. The port now resolves dynamic
player IDs and applies the existing world-box collision system; focused
coverage is 5 files / 83 tests and runtime gates pass.

T545 is a user-selected product slice, not a compatibility claim. Character
Matrix shows every loaded fighter, action, and package-health group and drives
the existing Fighter Lab runtime and Testbench lens.

T546 is closed-bounded. The current official reference and
`develop` compiler/runtime source define
`ProjClsnOverlap(index, playerID, box_type)`: an owner-relative projectile
index, a target player ID, and target `clsn1`, `clsn2`, or `size`. Current
source checks projectile Clsn1 or Clsn2, applies angle/scale/local coordinates,
and leaves target size boxes unscaled and unrotated. The port now exposes that
read through shared CNS/controller contexts, uses deterministic oldest-first
active-projectile indexing, and keeps collision scale/angle separate from draw
scale. Focused coverage is 8 files / 258 tests and runtime gates pass.

T547 is closed-bounded. The same official reference defines
`ProjVar(id, index, param)`, where `id = -1` accepts all projectiles owned by
the caller and `index` selects from that filtered list. The local scanner
recognizes the token. The expression runtime now reads bounded numeric state
already owned by `RuntimeProjectile`, preserves redirects and oldest-first
indexing, and converts coordinate-like values to caller output `localcoord`.
Focused coverage is 5 files / 172 tests and runtime gates pass.

T548 is closed-bounded. Pinned `develop` commit `149402f` treats `attr`,
`guardflag`, and `hitflag` as comparison-only `ProjVar` parameters and
complements the compiled mask for `!=`. The port reuses typed HitDef metadata,
the T547 selector, and redirects without exposing a general string channel.
Focused coverage is 5 files / 173 tests and runtime gates pass.

T549 is closed-bounded. The same pinned source stores
`pausemovetime` and `supermovetime` on Projectile, uses them to decide whether
the Projectile advances during Pause/SuperPause, decrements positive counters
on active ticks, and exposes the current values through `ProjVar`. The port
connects those fields to its existing pause lifecycle without claiming
hitpause, stacking, or rollback parity.

T550 is closed-bounded. Pinned source compiles and stores three-axis
`remvelocity`, lets ModifyProjectile replace it, copies it into current
velocity when removal begins, clears acceleration, resets velocity
multiplication, and exposes all axes through `ProjVar`. The port applies the
same bounded terminal transition and caller-local numeric reads. T551 is also
closed-bounded against the adjacent official three-axis `velmul` contract:
Ikemen multiplies every velocity axis after acceleration and exposes `velmul
z` through `ProjVar`; the port now carries the same static spawn/modify and
active-motion slice.

T552 follows the official `projlayerno` contract. Pinned Ikemen initializes a
Projectile from the owner's layer, normalizes explicit spawn and modify values
by sign to `-1`, `0`, or `1`, carries the result into sprite draw data, and
returns it through `ProjVar`. The port targets the equivalent bounded typed
state, readback, and existing presentation-order bands without claiming exact
interleaving with every stage, FightScreen, motif, or auxiliary effect layer.

T553 closes the adjacent official `projangle` contract. Pinned Ikemen stores
the authored float in the first Projectile rotation component, lets
ModifyProjectile replace it, copies that rotation into draw data, and returns
it through `ProjVar`. The port targets the same static typed value and its
existing live `renderAngle` mesh path; shear and rotation-aware collision remain
separate cuts.

T554 closes the two adjacent official rotation components. Pinned Ikemen
compiles `projxangle` and `projyangle` as floats, stores them in Projectile
rotation components 1 and 2, replaces them through ModifyProjectile, returns
them through `ProjVar(angle x|y)`, and applies negative X / positive Y matrix
rotations before Z. The port targets the same static state/readback with a
bounded orthographic Three.js projection; focal-length and facing-reflection
equivalence remain outside this cut.

T555 closes the adjacent official `projxshear` field. Pinned Ikemen compiles
one float, stores or replaces it on Projectile, returns it through `ProjVar`,
and applies its shear matrix before sprite rotation. The port targets the same
static state/readback with a bounded centered-quad deformation; exact anchor,
aspect, tiling, projection, and focal-length behavior remain outside this cut.

T556 follows the official `projshadow` vector. Pinned Ikemen starts the three
integer channels at zero, overwrites only supplied ModifyProjectile channels,
returns each through `ProjVar(shadow r|g|b)`, packs RGB, and creates a shadow
only for a non-zero color. The port targets the same static state/readback and
a bounded live tint; exact stage shadow transforms remain separate.

T557 follows the adjacent official `projreflection` integer. Pinned Ikemen
starts Projectile reflection at `-1`, replaces it through ModifyProjectile,
forces reflection on for positive values, disables it at zero, and in negative
auto mode follows the Projectile's non-zero shadow color. The port targets the
same static selection state with a bounded mirrored sprite; exact stage
reflection transforms remain separate.

T558 follows the official `projprojection` and `projfocallength` pair. Pinned
Ikemen accepts orthographic, perspective, and perspective2 names, defaults new
Projectiles to orthographic, uses `2048` when focal length is non-positive, and
replaces both values through ModifyProjectile. The port targets static state
and bounded live orthographic/perspective projection; exact perspective2 and
camera/localcoord compensation remain separate.

T559 follows the official four-float `projwindow` field. Pinned Ikemen starts
the window at zero, replaces all four values through ModifyProjectile, scales
them into the redirected owner's coordinate space, sorts both axes, and applies
the result as a sprite-local scissor rectangle. The port carries static state,
local-coordinate renderer snapshots, and bounded live quad/UV clipping; exact
GPU scissor, camera/aspect, redirected localcoord, and transformed-window parity
remain separate.

T560 follows the official Projectile `ownpal`/`remappal` spawn pair and
`ProjVar(DrawPal.Group/Index)` reads. Pinned Ikemen inherits owner PalFX by
default, creates independent PalFX only when `ownpal` is true, preserves the
current remap, and then forces the requested palette. ModifyProjectile leaves
both cases commented out. The port therefore targets spawn-only typed palette
state and existing renderer lookup without inventing modify support.

## 2026-08-06 continuation — T542 and T543

The official [Ikemen new triggers reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29)
defines `AnimPlayerNo` as the player number of the current animation owner.
The Elecbyte [M.U.G.E.N 1.1 state-controller reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
does not define this Ikemen-only trigger. The port therefore keeps the read
inside the Ikemen profile and does not change the M.U.G.E.N animation contract.

T542 is closed-bounded. `ChangeAnim2` passes the state-owner actor to the typed
animation boundary, which stores `animationOwnerPlayerNo` outside
`CharacterRuntimeState`. CNS and controller contexts read the value through
`AnimPlayerNo`. The slice does not cover Helper, Projectile, team, rollback, or
netplay ownership.

T543 was selected here and is now closed by the 2026-08-08 checkpoint above.

## Question

Which next tasks move the current port toward real M.U.G.E.N 1.1 and
Ikemen-GO compatibility, based on each project's official documentation and
the repository's current implementation rather than on old task volume?

## Bottom line

The selected queue is **T424 -> T425 -> T426 -> T427 -> T428 -> T429 ->
T430 -> T431 -> T432 -> T433 -> T434 -> T435 -> T436 -> T437 -> T438 ->
T463 -> T464 -> T465 -> T466 -> T467 -> T468 -> T469 -> T472 -> T473 ->
T474 -> T475 -> T476 -> T477 -> T478 -> T479 -> T480 -> T481 -> T482 ->
T483 -> T484 -> T485 -> T486 -> T487 -> T488 -> T489 -> T490 -> T491 ->
T492 -> T506 -> T507 -> T508 -> T509 -> T510 -> T511 -> T512 -> T513 -> T514 -> T515 -> T516 -> T517 -> T518 -> T519 -> T520 -> T521 -> T522 -> T523 -> T524 -> T525 -> T526 -> T527 -> T528**.
T424-T469, T472, T473, T474, T475, T476, T477, T478, T479, T480, T481,
T482, T483, T484, T485, T486, T487, T488, T489, T490, T491, T492, T506, T507, T508, T509, T510, T511, T512, T513, T514, T515, T516, T517, T518, T519, T520, T521, T522, T523, T524, T525, T526, T527 and T528 are closed-bounded. T504 remains the active content cursor and T505's Gallery extension is closed-bounded;
T480's bounded Ikemen depth-velocity slice is complete, T482 closes its static
ModifyHitDef mutation continuation, and T483 closes the acceleration metadata
handoff; T484 closes static ModifyHitDef acceleration mutation; T485 closes
dynamic HitDef/ModifyHitDef acceleration evaluation:

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
28. carry the authored third component through static `ModifyHitDef` mutation
     of an active normal HitDef, preserving omitted-Z and no-active-hitdef
     behavior.
29. carry static HitDef/Projectile `xaccel`, `yaccel` and `zaccel` through
    imported/direct/projectile hit metadata and expose them via
    `GetHitVar(xaccel|yaccel|zaccel)` with official zero defaults.
30. allow static `ModifyHitDef` to mutate those three acceleration metadata
    fields on an active normal HitDef without widening dynamic evaluation; and
31. retain supported scalar expressions for those three HitDef and
    `ModifyHitDef` fields, evaluating them in the active controller context
    without claiming acceleration physics; and
32. expose the selected optional HitDef/Projectile depth velocity through the
    Ikemen-only `GetHitVar(zvel)` read-model key with a zero fallback.
33. carry the Ikemen `HitVelSet` `z` flag through typed kinematic IR and, when
    enabled, hand the selected HitDef/Projectile depth velocity to the runtime
    combat-depth channel.
34. preserve the last direct HitDef/Projectile ground, air, down, guard and
    airguard velocity triples for Ikemen dotted `GetHitVar` x/y/z readback,
    returning zero for omitted families/components.
35. preserve the first and second HitDef damage components through direct and
    player-owned Projectile contacts as Ikemen `GetHitVar(hitdamage)` and
    `GetHitVar(guarddamage)` readback.
36. preserve the authored fall EnvShake multiplier through direct/projectile
    and imported fall metadata as `GetHitVar(fall.envshake.mul)`, defaulting
    omitted values to the official `1`.
37. expose the source attacker's zero-based `playerno` through the same
    direct HitDef and player-owned Projectile hit metadata read model, with a
    zero fallback when no source metadata exists.
38. retain Ikemen's separate numeric `playerid` for the last source character
    across root and verified Helper direct/Projectile contacts, without
    deriving it from `playerno` or string actor IDs.
39. preserve the current official deprecated `GetHitVar(ID)` spelling as a
    read alias of `playerid`, with the same missing-source fallback.

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

### T491 — Ikemen-GO `GetHitVar(fall.envshake.mul)`

Priority: P1. Dependency: T490.

The changed-trigger reference exposes `fall.envshake.mul` as the multiplier
from the last HitDef. Ikemen's `HitDef` and `GetHitVar` structures default this
field to `1` and copy the authored value into get-hit variables. T491 retains
that value through HitDef/Projectile compilation, imported moves, and direct or
projectile fall materialization without changing EnvShake playback ownership.

**Closed-bounded:** focused compiler/runtime/import coverage passes 7 test
files / 258 tests; the final suite is 324/3329 with typecheck/build/boundaries,
682/682 trace artifacts, asset-path hygiene and diff hygiene green. Exact
EnvShake waveform/timing, dynamic values, and helper/team breadth remain outside
the claim. Source authority:
[Ikemen-GO changed triggers — GetHitVar](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#GetHitVar)
and [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go).

### T492 — Ikemen-GO `GetHitVar(playerno)`

Priority: P1. Dependency: T491.

The official changed-trigger reference exposes `GetHitVar(playerno)` as the
`PlayerNo` of the last character that hit the player. T492 reuses the existing
source metadata populated by direct HitDef and player-owned Projectile
contacts, exposing the attacker slot through the shared numeric read model
and returning `0` when no source metadata exists. The defender's own runtime
identity remains separate.

**Closed-bounded:** focused RuntimeExpressionContext/DirectCombat/
ProjectileCombat coverage passes 3 test files / 119 tests; the final suite is
324/3330 with typecheck/build/boundaries, 682/682 trace artifacts,
asset-path hygiene and diff hygiene green. String-valued attributes,
helper/team ownership and full parity remain outside the claim. Browser smoke
is N/A because no visible surface changed. Source authority:
[Ikemen-GO changed triggers — GetHitVar](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#GetHitVar)
and [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go).

### T506 — Ikemen-GO `GetHitVar(playerid)`

Priority: P1. Dependency: T492.

The current changed-trigger reference defines `GetHitVar(playerid)` as the
numeric ID of the last character that hit the player. Current Ikemen-GO source
copies `hd.playerid` and `hd.playerno` into separate get-hit fields. T506 keeps
that distinction in the local typed hit-source metadata: roots use their
registered runtime ID, while a verified Helper uses its own ID and still
inherits the root player slot. Direct HitDef and root/Helper-parented Projectile
contacts feed the same read model; missing numeric source identity returns `0`.

**Closed-bounded:** five focused expression/direct/projectile/helper/runtime
files pass 178 tests, and five affected deterministic IKEMEN trace checks pass
with intentional checksum updates. TypeScript, the 356-module production build,
boundaries, and asset-path hygiene pass. T508 later clears the two inherited
retired-roster aggregate-trace labels; browser smoke is N/A. String-valued
attributes, unverified custom-state/team ownership, score movement and full
parity remain outside the claim. Source authority:
[Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
and [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go).

### T507 — Ikemen-GO deprecated `GetHitVar(ID)` alias

Priority: P1. Dependency: T506.

The current changed-trigger reference marks the old `ID` parameter deprecated
but still valid. T507 normalizes case-insensitive `ID` to the same numeric
`sourcePlayerId` read used by `playerid`, including the `0` fallback. It does
not add parallel storage or widen the expression value model.

**Closed-bounded:** the focused shared-expression file passes 27 tests covering
direct read, omitted fallback, and parsed `GetHitVar(ID)` evaluation. Existing
T506 propagation remains unchanged. String-
valued parameters, score movement and full parity remain outside the claim.
Source authority: [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar).

### T508 — required trace binding to the active roster

Priority: P0. Dependency: T499.

Two required synthetic presets still duplicated the retired `Mira Volt` label
after the public roster reset. T508 binds their setup and expected hit event to
the active second demo fighter while preserving every routed state, damage,
life, and actor-source requirement.

**Closed-bounded:** focused `RuntimeTraceGatePresets` coverage passes 2/2 and
the full aggregate passes 682/682 artifacts (648 required, 34 optional). This
is evidence ownership repair only; it restores no retired character, changes no
combat semantic, moves no score, and makes no broader parity claim.

### T509 — Ikemen-GO `GetHitVar(guardko)`

Priority: P1. Dependency: T508.

The current changed-trigger reference defines `guardko` as true when guard
damage knocked out the player. Current Ikemen-GO source retains this flag in
get-hit variables. The local combat path already had equivalent typed
`sourceGuardKo` metadata for round-win cause; T509 exposes it through the shared
numeric expression reader without adding state.

**Closed-bounded:** shared-expression, direct guard-KO, and root Projectile
guard-KO coverage passes 3 files / 121 tests. TypeScript, the 356-module build,
boundaries, and 682/682 trace artifacts pass; browser smoke is N/A. Exact guard
damage/point accumulation, string-valued fields, teams/simul breadth, score
movement, and full parity remain outside the claim. Source authority:
[Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
and [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go).

### T510 — Ikemen-GO `GetHitVar(attr)`

Priority: P1. Dependency: T509.

The current changed-trigger reference defines `attr` as the last HitDef
attribute assignment and requires comparison with known flags, for example
`GetHitVar(attr) = SCA, HA`. Current Ikemen-GO source copies the HitDef `attr`
value into get-hit variables. The local contact path already retains that
value as `sourceAttr`.

**Closed-bounded:** the compiler accepts static state/attack literals and the
evaluator handles equality and inequality through the shared attribute matcher.
Missing metadata, compound expressions, and actor redirects are covered. Three
focused files / 118 tests, TypeScript, the 356-module build, boundaries, and
682/682 trace artifacts pass; browser smoke is N/A. Dynamic filters, general
string-valued `GetHitVar`, `guardflag`, `hitflag`, score movement, and full
parity remain outside the claim. Source authority:
[Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
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

### T482 — Ikemen-GO ModifyHitDef velocity Z mutation

Priority: P1. Dependency: T481.

Ikemen documents `ModifyHitDef` as updating the active HitDef with the same
optional parameter family. T482 compiles static `ground/air/down/guard/airguard
velocity` vectors, retains their authored third component, and mutates the
active normal HitDef move used by the T481 direct/projectile resolver. Omitted Z
remains unchanged and a missing active normal HitDef is rejected.

**Closed-bounded:** focused compiler/active-HitDef mutation coverage passes
2 files / 89 tests; final suite is 324/3317 with typecheck/build/boundaries and
682/682 trace gates green. This bounded mutation slice excludes dynamic
expressions, helper/team ownership and Common1/full depth physics. Source
authority: [Ikemen-GO changed state-controller reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitdef-parameters).

### T483 — Ikemen-GO HitDef acceleration metadata

Priority: P1. Dependency: T482.

The official Ikemen changed-controller reference adds optional `xaccel` and
`zaccel` to HitDef alongside the existing `yaccel`; the official runtime stores
all three on get-hit variables when a hit lands. T483 compiles static values,
preserves them through imported state and player-owned Projectile paths, copies
them into direct/projectile defender hit metadata, and exposes
`GetHitVar(xaccel|yaccel|zaccel)`. Omitted horizontal/depth values return zero.

**Closed-bounded:** focused compiler/HitDef/direct/projectile/imported-fighter/
expression coverage passes 7 files / 249 tests; `pnpm typecheck` and
`pnpm check:boundaries` pass. This is authored metadata only: Ikemen
localcoord/facing scaling, Common1 acceleration/friction, Z physics, dynamic
expressions, ModifyHitDef acceleration mutation and helper/team breadth remain
outside the claim. Source authority: [Ikemen-GO changed state-controller reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitdef-parameters) and [Ikemen-GO `src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go).

### T484 — Ikemen-GO ModifyHitDef acceleration metadata

Priority: P1. Dependency: T483.

Because Ikemen treats `ModifyHitDef` as an update to the active HitDef, T484
admits static `xaccel`, `yaccel` and `zaccel`, mutates the active normal
`DemoMove.hitVars`, and leaves the existing direct/projectile `GetHitVar`
handoff authoritative. Omitted fields remain unchanged and dynamic expressions
are rejected from the typed operation.

**Closed-bounded:** focused compiler/active-HitDef mutation coverage passes
2 files / 89 tests and `pnpm typecheck` passes. This slice excludes dynamic
expressions, localcoord/facing scaling, Common1 acceleration/friction, Z
physics, helper/team breadth and full parity. Source authority: [Ikemen-GO
changed state-controller reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitdef-parameters).

### T485 — Ikemen-GO dynamic HitDef acceleration metadata

Priority: P1. Dependency: T484.

The same official numeric controller parameters may be authored as supported
scalar expressions. T485 retains executable expressions for `HitDef` and
`ModifyHitDef` `xaccel`, `yaccel` and `zaccel`, then evaluates them through the
active controller context before writing typed hit metadata. Static numbers
keep the existing operation shape; an omitted or failed evaluation leaves the
existing value unchanged.

**Closed-bounded:** focused compiler/active-HitDef coverage passes 7 files /
250 tests; final 324/3321 suite, typecheck/build/boundaries, 682/682 trace
artifacts, asset-path hygiene and diff hygiene pass. This slice excludes
acceleration physics/friction, localcoord/facing scaling, dynamic vectors and
all other dynamic `ModifyHitDef` fields. Source authority: [Ikemen-GO changed
state-controller reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitdef-parameters) and [Ikemen-GO
`src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go).

### T486 — Ikemen-GO `GetHitVar(zvel)` readback

Priority: P1. Dependency: T481.

Ikemen's `GetHitVar` model carries a third active-hit velocity component even
though the legacy M.U.G.E.N trigger reference stops at `xvel`/`yvel`. T486
exposes the already materialized `hitVelocity.z` as `GetHitVar(zvel)` through
the shared runtime expression context and returns `0` when the selected
HitDef/Projectile omitted depth. The alias is isolated from `fall.zvel` and
does not synthesize physics.

**Closed-bounded:** `RuntimeExpressionContextSystem` coverage passes 27/27
focused tests, including direct readback, omitted fallback and expression
context routing. The M.U.G.E.N legacy key list remains unchanged; depth
integration, scaling and broader Ikemen GetHitVar parity remain outside this
slice. Source authority: [Elecbyte trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html) and [Ikemen-GO `char.go` GetHitVar source](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go).

### T487 — Ikemen-GO `HitVelSet z` handoff

Priority: P1. Dependency: T486/T481.

Ikemen's changed state-controller reference documents a `z` flag on
`HitVelSet`: when nonzero, the active get-hit velocity's depth component is
applied to the player. T487 preserves that flag through typed kinematic IR,
reads the selected `hitVelocity.z`, and writes it to the existing combat-depth
velocity channel without inventing Z physics.

**Closed-bounded:** focused `KinematicControllerSystem`/`RuntimeCompiler`
coverage passes 2 files / 71 tests; the final suite is 324/3321 with
typecheck/build/boundaries, 682/682 trace artifacts, asset-path hygiene and
diff hygiene green. Browser smoke is N/A because this is a runtime-only seam.
Full depth physics, dynamic vector parity and legacy M.U.G.E.N expansion remain
outside the claim. Source authority: [Ikemen-GO changed state-controller
reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitvelset-parameters).

### T488 — Ikemen-GO `GetHitVar` HitDef velocity vectors

Priority: P1. Dependency: T481/T487.

The official changed-trigger reference lists dotted `GetHitVar` aliases for
the last `ground.velocity`, `air.velocity`, `down.velocity`, `guard.velocity`
and `airguard.velocity` parameters, each with x/y/z components. T488 carries
those parsed/effective triples through direct HitDef and player-owned Projectile
contacts and resolves them through the shared runtime read model with zero
fallback for missing data.

**Closed-bounded:** focused compiler/runtime/import coverage passes 4 files /
133 tests; the final suite is 324/3324 with typecheck/build/boundaries,
682/682 trace artifacts, asset-path hygiene and diff hygiene green. Dynamic
vector expressions, exact omitted-value defaults, Z physics, string attributes
and helper/team breadth remain outside the claim. Source authority: [Ikemen-GO
changed triggers — GetHitVar](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#GetHitVar).

### T489 — Ikemen-GO `GetHitVar(hitdamage|guarddamage)`

Priority: P1. Dependency: T488.

Ikemen's changed-trigger reference distinguishes the first `damage` component
(`hitdamage`) from the second guard component (`guarddamage`). T489 preserves
those authored components on direct HitDef and player-owned Projectile contacts
while leaving the existing effective contact `damage` field authoritative for
combat resolution.

**Closed-bounded:** focused RuntimeExpressionContext/DirectCombat/
ProjectileCombat coverage passes 3 files / 114 tests; the final suite remains
324/3324 with typecheck/build/boundaries, 682/682 trace artifacts, asset-path
hygiene and diff hygiene green. Resource gains, scaling, string attributes, KO
policy and helper/team breadth remain outside the claim. Source authority:
[Ikemen-GO changed triggers — GetHitVar](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#GetHitVar).

### T490 — Ikemen-GO `GetHitVar` animtype fields

Priority: P1. Dependency: T489.

Ikemen's changed-trigger reference exposes separate `ground.animtype`,
`air.animtype`, and `fall.animtype` values from the last HitDef. T490 retains
these fields through HitDef compilation, imported state moves, direct contacts,
and player-owned Projectiles. Omitted air values use ground; omitted fall values
use the resolved air reaction for `up`/`diagup`, otherwise `back`. Existing
effective `GetHitVar(animtype)` remains unchanged.

**Closed-bounded:** focused compiler/runtime/import coverage passes 7 test
files / 256 tests; the final suite is 324/3327 with typecheck/build/boundaries,
682/682 trace artifacts, asset-path hygiene and diff hygiene green. Common1
reaction-state choreography, dynamic values, string-valued semantics and
helper/team breadth remain outside the claim. Source authority:
[Ikemen-GO changed triggers — GetHitVar](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#GetHitVar)
and [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go).

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
Z continuation, T482 closes the static ModifyHitDef mutation cursor, and T483
closes the HitDef acceleration metadata/GetHitVar cursor, T484 closes its
static ModifyHitDef acceleration mutation continuation, and T485 closes the
supported dynamic acceleration evaluation handoff. T486 closes the
Ikemen-only active depth `GetHitVar(zvel)` readback seam. T487 closes the
bounded `HitVelSet z` combat-depth handoff. T488 closes the five-family
`GetHitVar` velocity-vector readback seam. T489 closes the paired damage
component readback seam. T490 closes the ground/air/fall reaction animation
readback seam. T491 closes the `fall.envshake.mul` readback seam. T492 closes
the source `playerno` readback seam, T506 closes its separate numeric
`playerid` continuation, and T507 preserves the deprecated `ID` alias; all
claim ceilings are deliberately separate from Common1 authored-state parity.
The user-directed content queue remains separate in
`docs/ROADMAP_CONTENT_PACK.md`. Scores remain unchanged until independent
adjudication. T499 superseded the former fighter expansion; T504 remains active
for Rocco/Nadia identity pre-package closure, while T505 Fighter Lab is
closed-bounded. Aggregate spritesheet promotion remains blocked on the current
identity-consistency gate rather than on the retired provider-row queue.

### T511 — Ikemen-GO `GetHitVar(guardflag)`

The current changed-trigger reference defines the field as the guard flag of
the last HitDef and requires comparison with known flags. Current
[`char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)
copies `hd.guardflag` to `ghv.guardflag`;
[`compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
expands `M` to `H|L`, and
[`bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
tests mask overlap. The bounded implementation retains the effective
direct/Projectile/Helper flag (default `MA`) and evaluates static
equality/inequality for active or redirected actors. Six focused files / 224
tests plus typecheck, build, boundaries, and 682/682 traces pass. The nightly
wiki also lists `GetHitVar(hitflag)`, but current `develop` compiler source has
no matching GetHitVar opcode, so that field remains explicitly unclaimed.

### T512 — Ikemen-GO `GetHitVar(projid)`

### T535 — Ikemen-GO `GetHitVar(hitflag)`

The changed-trigger reference defines this read as the hitflag of the last
HitDef that hit the player and requires comparison with known flags. Elecbyte's
HitDef reference documents the same H/L/A/M/F/D/+/- vocabulary and the omitted
`MAF` default. The bounded local seam now preserves effective direct/Projectile
`sourceHitFlag` metadata and evaluates static equality/inequality filters with
typed overlap (`M` expands to `H|L`), including redirected contexts. Five
focused compiler/context/CNS/direct/projectile files / 238 tests pass; the
existing `686/686` trace corpus is unchanged. Dynamic expressions, reset/
lifetime parity, and full M.U.G.E.N/IKEMEN parity remain unclaimed.

The changed-trigger reference defines `GetHitVar(projid)` as the `projID` of
the last Projectile that hit the player and returns `-1` when the last hit was
not authored by a Projectile. Current
[`compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
maps the field to `OC_ex_gethitvar_projid`, while
[`bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
returns the stored integer. The local active slice retains Projectile IDs in
last-hit metadata and exposes the numeric readback; four focused files / 186
tests pass, with final aggregate gates recorded in the T512 closeout.

### T513 — Ikemen-GO `GetHitVar(teamside)`

The changed-trigger reference defines `GetHitVar(teamside)` as the effective
team side of the last HitDef that hit the player. Current `develop`
[`char.go`](https://raw.githubusercontent.com/Ikemen-GO/Ikemen-GO/develop/src/char.go)
stores `hd.teamside` in get-hit state, while
[`bytecode.go`](https://raw.githubusercontent.com/Ikemen-GO/Ikemen-GO/develop/src/bytecode.go)
returns the internal zero-based value plus one; reset state reads `-1`.
The bounded local seam retains explicit HitDef/Projectile side values and
derives omitted local values from the attacker/root identity. Direct and
Projectile contacts, including verified Helper-parented sources, expose the
numeric read through `GetHitVar(teamside)`, while missing metadata returns
`-1`. Four focused files / 186 tests pass; `qa:trace` passes 682/682
artifacts, typecheck/build/boundaries and diff hygiene pass. Team topology,
dynamic filters, `GetHitVar(hitflag)`, `GetHitVarSet`, and full parity remain
outside the claim.

### T514 — Ikemen-GO `GetHitVar(keepstate)`

Current `develop` [`compiler.go`](https://raw.githubusercontent.com/Ikemen-GO/Ikemen-GO/develop/src/compiler.go)
maps `GetHitVar(keepstate)` to `OC_ex_gethitvar_keepstate`; [`bytecode.go`](https://raw.githubusercontent.com/Ikemen-GO/Ikemen-GO/develop/src/bytecode.go)
reads the boolean stored in the last-hit record, and [`char.go`](https://raw.githubusercontent.com/Ikemen-GO/Ikemen-GO/develop/src/char.go)
copies the authored HitDef `keepstate` flag into that record while reset state
is false. The bounded local seam retains the authored flag for imported and
dynamic direct HitDef contacts and exposes numeric `1`/`0` through
`GetHitVar(keepstate)`; Projectile and Reversal paths keep the false fallback.
Five focused files / 212 tests pass; `qa:trace` passes 682/682 artifacts,
typecheck/build/boundaries and diff hygiene pass. Projectile/Reversal authoring,
HitOverride timing, `GetHitVar(frame)`, and full parity remain outside the claim.

### T515 — Ikemen-GO `GetHitVar(frame)`

The changed-trigger reference defines `GetHitVar(frame)` as true only during
the same frame in which the player was hit. Current `develop`
[`compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
maps the field to `OC_ex_gethitvar_frame`, while
[`bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
pushes the stored boolean. [`char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)
sets the marker on hit/guard contact, preserves it through hitpause, and clears
it in the non-paused action finish path. The bounded local seam mirrors this
for direct HitDef and Projectile hit/guard contacts through an ephemeral typed
bit, with frame-start reset and no ReversalDef/HitOverride-only timing claim.
Six focused files / 191 tests pass; `qa:trace` passes 682/682 artifacts,
typecheck/build/boundaries and diff hygiene pass. Paused-action parity beyond
the local marker and full parity remain outside the claim.

### T516 — Ikemen-GO `GetHitVar(priority)`

The changed-trigger reference defines `GetHitVar(priority)` as the numerical
attack priority of the last HitDef. Current `develop` [`compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
maps the field to `OC_ex_gethitvar_priority`; [`bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
pushes `ghv.priority`; and [`char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)
copies `hd.priority` into the defender's last-hit record. The bounded local
seam now carries normalized direct HitDef priority and the Projectile HitDef
default through typed metadata. It deliberately keeps the local
`RuntimeProjectile.priority` field as Projectile `projpriority` clash data,
matching the separate engine concepts. Four focused files / 188 tests pass;
`qa:trace` 682/682, typecheck, build, boundaries, full-suite baseline capture,
and diff hygiene pass. `GetHitVar(facing)`, priority type, ReversalDef/
HitOverride timing, and full parity remain outside the claim.

### T517 — Ikemen-GO `GetHitVar(dizzypoints)`

The changed-trigger reference defines `GetHitVar(dizzypoints)` as the last
HitDef `dizzypoints` value. Current `develop`
[`compiler.go`](https://raw.githubusercontent.com/Ikemen-GO/Ikemen-GO/develop/src/compiler.go)
maps it to `OC_ex_gethitvar_dizzypoints`; [`bytecode.go`](https://raw.githubusercontent.com/Ikemen-GO/Ikemen-GO/develop/src/bytecode.go)
pushes `ghv.dizzypoints`; and [`char.go`](https://raw.githubusercontent.com/Ikemen-GO/Ikemen-GO/develop/src/char.go)
carries the value in get-hit metadata while applying dizzy-point damage. The
bounded local seam retains authored direct and Projectile HitDef values in
`sourceDizzyPoints`, keeps them separate from the defender's mutable
`dizzyPoints` pool, and returns `0` when metadata is absent. Five focused files /
220 tests pass; `qa:trace` 682/682, typecheck, build, boundaries, full-suite
baseline capture, and diff hygiene pass. Cumulative multi-hit/reset semantics,
`GetHitVar(guardpoints)`, and full parity remain outside the claim.

### T518 — Ikemen-GO `GetHitVar(guardpoints)`

The changed-trigger reference defines `GetHitVar(guardpoints)` as the last
HitDef `guardpoints` value. Current `develop`
[`compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
maps it to `OC_ex_gethitvar_guardpoints`; [`bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
pushes `ghv.guardpoints`; and [`char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)
carries the value in get-hit metadata while applying guard-point damage. The
bounded local seam retains authored direct and Projectile HitDef values in
`sourceGuardPoints`, keeps them separate from the defender's mutable
`guardPoints` pool, and returns `0` when metadata is absent. Five focused files /
222 tests pass; `qa:trace` 682/682, typecheck, build, boundaries, full-suite
baseline capture, and diff hygiene pass. Cumulative multi-hit/reset semantics,
`GetHitVar(guardpower)`, and full parity remain outside the claim.

### T519 — Ikemen-GO `GetHitVar(redlife)`

The changed-trigger reference defines `GetHitVar(redlife)` as the last HitDef
`redlife` value. Current `develop`
[`compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
maps it to `OC_ex_gethitvar_redlife`; [`bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
pushes `ghv.redlife`; and [`char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)
keeps HitDef red-life metadata distinct from the defender's mutable red-life
resource. Issue 93 is closed-bounded. The bounded implementation retains
authored direct and Projectile HitDef values, default missing metadata to `0`,
and avoids claiming `guardredlife`, cumulative reset semantics, or full parity.

### T520 — Ikemen-GO `GetHitVar(guardpower)`

The changed-trigger reference defines `GetHitVar(guardpower)` as the second
value of the last HitDef `givepower` parameter. Current `develop`
[`compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
maps it to `OC_ex_gethitvar_guardpower`; [`bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
pushes `ghv.guardpower`; and [`char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)
retains the authored value in last-hit metadata. Issue 94 is in progress. The
bounded implementation carries the second `givepower` value through direct and
Projectile contacts, defaults missing metadata to `0`, and keeps current
power-resource, hitpower, cumulative reset, and full-parity claims out. Five
focused files / 226 tests pass; `qa:trace` 682/682, typecheck, build,
boundaries, full-suite baseline capture, and diff hygiene pass. Issue 94 is
closed-bounded.

### T521 — Ikemen-GO `GetHitVar(hitpower)` (selected next)

The changed-trigger reference defines `GetHitVar(hitpower)` as the first value
of the last HitDef `givepower` parameter. Current `develop`
[`compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
maps it to `OC_ex_gethitvar_hitpower`; [`bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
pushes `ghv.hitpower`; and [`char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)
retains the authored value in last-hit metadata. Issue 95 is in progress. The
bounded implementation will carry the first `givepower` value through direct
and Projectile contacts, default missing metadata to `0`, and keep current
power-resource, hitflag, cumulative reset, and full-parity claims out.

### T522-T524 — last-hit score, power and facing metadata

The changed-trigger reference exposes authored HitDef `score`, effective
`givepower`, and `p2facing` through the last-hit record. The local bounded
seams retain those values independently from score adjudication, the mutable
power resource, and live facing. Direct and player-owned Projectile contacts
are covered; guard-facing and ReversalDef choreography remain outside the
claim. Issues 96-98 are closed-bounded.

### T525-T526 — mutable guard and combo counters

Ikemen's `char.go` increments `guardcount` for consecutive guarded contacts and
resets it on idle, while `hitcount` increments only for an already-get-hit,
non-guarded combo-eligible contact. The local runtime stores `guardCount` and
`comboHitCount` separately from authored `numhits`, with direct/player-owned
Projectile first, consecutive, guarded and reset coverage. Issues 99-100 are
closed-bounded.

### T527 — authored multi-hit `GetHitVar(hitcount)`

The explicit `ikemen-go` profile now applies the mutable counter even when a
player-owned Projectile carries authored `numhits`. Required trace
`synthetic-imported-ikemen-projectile-gethitvar-hitcount-multihit` proves two
eligible contacts followed by one guarded break, with trace/final checksums
`c6582760` / `78e24146` in the `683/683` aggregate. Static/imported M.U.G.E.N
routes retain the authored fallback. Helper/team/multi-target arbitration and
`GetHitVarSet` remain unclaimed.

### T528 — selected next `GetHitVar(xveladd|yveladd)`

The current Ikemen source maps both keys to dedicated opcodes and reads
`ghv.xveladd`/`ghv.yveladd`. During KO velocity application it records the
difference between the starting get-hit velocity and the post-addition value;
M.U.G.E.N leaves these documented fields dummied out. Issue 102 will add a
bounded `ikemen-go` readback that preserves authored `xvel`/`yvel` and live
velocity as separate fields, with zero fallback for non-KO/non-profile routes.
