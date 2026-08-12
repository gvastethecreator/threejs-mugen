# Roadmap Continuity Guide

Last updated: 2026-08-12

## Current T749 closeout / T750 selection

T749 / [issue 323](../.scratch/roadmap/issues/323-hitdef-attack-depth.md)
adds direct `HitDef attack.depth` expressions and live Ikemen
`ModifyHitDef attack.depth` mutation for root/RedirectID and Helper callers.
Fresh single values duplicate their component; live omission preserves the
active sibling and is a no-op. Product `689a02c5`, tests `076d1f5f`, evidence
`4ddbd63e`, and trace `7ef8aace` -> `170aacf6` pass independently. Aggregate
QA still has the inherited helper-bind missing-target-link blocker. Fresh
M.U.G.E.N support and live Ikemen support are separate claims; Projectile,
ModifyProjectile, ReversalDef breadth, exact depth timing, teams, rollback and
full parity remain blocked. T750 is the next source-selection checkpoint.

## Historical T747 closeout / T748 selection

T747 / [issue 321](../.scratch/roadmap/issues/321-modifyhitdef-pausetime.md)
adds live Ikemen `ModifyHitDef` `pausetime` and `guard.pausetime` pair mutation
for root/RedirectID and Helper callers. Caller-context static, mixed and
dynamic components are typed; omitted live siblings survive and omission is a
no-op. Product `1100d384`, evidence `c6c88173`, focused tests and typecheck
pass; the required imported trace is registered. M.U.G.E.N 1.1 supports fresh
HitDef pause parameters, but not an official ModifyHitDef controller, so keep
this live claim Ikemen-only. Exact tick scheduling, Projectile,
ModifyProjectile, ReversalDef, teams, rollback and full timing parity remain
blocked. T748 is the next source-selection checkpoint.

## Historical T746 closeout / T747 selection

T746 / issue 320 carries fresh direct `HitDef snap` X/Y/Z plus the fourth
`snaptime` component through typed IR, root/Helper caller-context evaluation,
`GetHitVar(xoff/yoff/zoff)`, imported metadata and the existing target-memory
binding tick. Product commit `d8363efa`; evidence commit `11623ca3`; focused
coverage is `391/391` and typecheck passes. The required imported trace is
landed; aggregate `pnpm qa:trace` is the remaining promotion gate. M.U.G.E.N
1.1 documents only X/Y; Z, `snaptime` and binding are bounded Ikemen support.
Live ModifyHitDef/Projectile snap Z and full positioning parity remain blocked.
T743 / issue 317 is superseded by the already closed T728 / issue 302; T747
must be selected as the next distinct source seam after the aggregate gate.

## Historical T742 closeout

T742 closes fresh direct `HitDef snap` X/Y expressions for root and Helper
caller contexts. Caller `var(0)=7,var(1)=-5` reaches accepted contact
`GetHitVar(xoff/yoff/zoff)=7/-5/0`, and the required trace observes the
defender's snapped Y position. Trace/final checksums are `3d153556` /
`fe79d540`; `pnpm qa:trace` passes `828/828` artifacts (`794` required,
`34` optional). Snap Z, `snaptime`, Projectiles, exact
bind/tick/localcoord/facing and full positioning parity remain blocked. T743 /
issue 317 was superseded by the already closed T728 / issue 302; T739 / issue
313 remains superseded by closed T678 / issue 252.

## Historical T741 closeout

T741 closes bounded Ikemen-only root/RedirectID and Helper caller-context live
`ModifyHitDef` corner-push offsets for `ground`, `air`, `down`, and `guard`;
T740 already closed `airguard.cornerpush.veloff`. Required trace/final
checksums are `27dae2dd` / `a571323c`; `pnpm qa:trace` passes `827/827`
artifacts (`793` required, `34` optional). Fresh/direct defaults,
airborne/down timing, Projectiles, ModifyProjectile, exact decay, teams,
rollback and full parity remain blocked. T739 / issue 313 is superseded by
closed T678 / issue 252 and must not be reactivated as a duplicate.

## Historical T737 guard-velocity checkpoint

T737 closes bounded Ikemen-only live `ModifyHitDef guard.velocity` Y/Z
replacement through root/RedirectID. Single, pair, and triple caller-context
values preserve omitted live components and reach accepted ground-guard
`GetHitVar`/velocity metadata. Required trace/final checksums are `a2eb52db` /
`f0fb19a8`; `pnpm qa:trace` passes `824/824` artifacts (`790` required,
`34` optional). T738 is now historical above; T743 is superseded by T728 and
T745 is the next selection checkpoint. M.U.G.E.N 1.1 only documents ground-guard X; Projectiles,
exact timing, teams, rollback and full parity remain blocked.

## Historical T736-T737 audio/guard checkpoint

T736 closes bounded Ikemen-only live `ModifyHitDef guardsound.channel` through
root/RedirectID and Helper callers. Static and caller-context dynamic finite
values reach typed guarded `audio:playsnd` channel `8`; omission/unresolved
values preserve the active channel. Required
`synthetic-imported-modifyhitdef-dynamic-guardsound-channel.json` has
trace/final checksums `a689adf2` / `d5bc517f`; `pnpm qa:trace` passes `823/823`
artifacts (`789` required, `34` optional). T736 is now historical above; T737
closed the live ground guard-velocity Y/Z counterpart. Exact playback/mixing,
air guard, Projectiles, timing, teams, rollback and full parity remain blocked.

## Historical T735-T736 audio checkpoint

T735 closed bounded Ikemen-only live `ModifyHitDef hitsound.channel` through
root/RedirectID and Helper callers. Static and caller-context dynamic finite
values reach typed hit `audio:playsnd` channel `7`; omission/unresolved values
preserve the active channel. Required
`synthetic-imported-modifyhitdef-dynamic-hitsound-channel.json` has trace/final
checksums `b5f4c11e` / `421be8fe`; `pnpm qa:trace` passes `822/822` artifacts
(`788` required, `34` optional). T736 is now closed above. Fresh defaults, exact SND
lookup/playback/mixing/priority, Projectiles, renderer timing, teams, rollback
and full audio parity remain blocked.

## Historical T733 audio checkpoint

T733 closes bounded Ikemen-only live `ModifyHitDef guardsound` through
root/RedirectID and Helper callers. Static and caller-context dynamic refs
retain their prefix, omission/unresolved values preserve the active sound, and
required `synthetic-imported-modifyhitdef-dynamic-guardsound.json` records
typed `audio:playsnd` `F6,4` on a real guard contact. Trace/final checksums are
`2ade8da5` / `f88990bd`; `pnpm qa:trace` passes `820/820` artifacts (`786`
required, `34` optional). T734 is now historical above; T735 closed the live
hit-channel cut and T736 closed the guard-channel counterpart above. Exact SND
lookup/playback/mixing/channel priority, fresh defaults, Projectiles, renderer
timing, teams, rollback and full audio parity remain blocked.

## Current T608-T638 runtime checkpoint

T608-T637 are closed-bounded. T616-T621 cover typed HitDef/Projectile
`unhittabletime`, actor-role contact writes, admission, official defaults,
HitOverride writes, and dynamic Projectile spawn expressions. T622 carries
independent ground-friction values through root/Helper HitDef and Projectile,
normal contact, `GetHitVar`, and grounded get-hit physics; T623 closes root and
redirected `ModifyHitDef` mutation. T624 carries Ikemen hit/guard spark-scale
pairs through root/Helper HitDef and Projectile, redirected `ModifyHitDef`,
accepted presentation, snapshots, trace gates, and rendering. T625 closes
official direct-HitDef attacker facing through root/Helper HitDef, redirected
`ModifyHitDef`, accepted contact, and a required trace. T626 closes explicit
HitDef `getpower` creation, redirected mutation, contact, and attacker power
gain. T627 closes official omitted damage/constants-derived normal and super
rewards. T628 closes static explicit and omitted `givepower`, accepted defender
power mutation, and effective delta readback. T629 closes dynamic caller-context
`givepower` and its controller-specific one-value rules. T630 closes
pinned-Ikemen `ModifyProjectile getpower` through root/Helper and later
contact. T631 closes M.U.G.E.N `[Rules]` attack/get-hit life-to-power
multipliers with common/character precedence. T632 closes positive-time direct
HitDef/Projectile contact `palfx.*` through the defender's existing PalFX
state. T633 closes direct HitDef and live `ModifyHitDef` contact EnvShake
through accepted unguarded hits and the existing camera path. T634 closes
dynamic direct HitDef fall EnvShake creation, live mutation, and ground-impact
emission. T635 closes dynamic fall impact damage and velocity; T636 closes
dynamic fall/down recovery policy and timers. T637 closes dynamic fall,
air-fall, and fall-kill policy. T638 is active for dynamic down-bounce policy.
Latest evidence is 3542/3600 tests with the same 58 inherited failures, a
363-module build, and 709/709 traces (675
required, 34 optional).
Do not claim Projectile
attacker-facing, exact deferred facing/power order, broader `data/mugen.cfg`,
rollback, or full HitDef parity from these slices.

## Historical T561-T608 runtime checkpoint

ModifyProjectile now separates `id`/`index` selection from `projid` mutation,
selects active owner Projectiles oldest-first, replaces numeric active/terminal
owner AIR actions, and mutates static flags, team affinity, reaction types,
target/chain IDs, lethal flags, `air.juggle`, damage, givepower metadata,
`numhits`, separate HitDef priority, custom P1/P2 states, and
`missonoverride`, P2 sprite priority, `forcenofall`, and forced stand/crouch
posture. HitDef `sprpriority` is separate from visual `projsprpriority`.
Accepted hits clear the target fall flag while guards leave it unchanged;
forced posture only changes bounded default get-hit selection. Root and
helper-parented paths are covered. T582 core coverage passes 5 files / 299
tests plus the focused root runtime case. T583 adds static/dynamic fall damage,
X/Y/Z velocity, recovery, and recovery time with fractional root/helper
evaluation; the full suite remains 3392/3450 with the same 58 inherited
failures. T584 adds supported fall envshake time/frequency/amplitude/phase/mul
with frequency clamping and fractional root/helper evaluation. T585 adds
`dizzypoints` and `guardpoints` mutation/readback without changing current
pools; the previous full suite remained 3393/3451 with the same 58 inherited
failures. T586 adds hit/guard `redlife` and floating-point `score` pairs with
zero guard defaults, effective contact readback, and no resource mutation.
Four core files / 252 tests plus root/helper cases pass; the full suite remains
at the same 58 inherited failures with 3394/3452 tests passing. T587 adds
static official `p2clsncheck`/`p2clsnrequire` mutation and later contact
admission. Four core files / 253 tests plus root/helper cases pass; the full
suite remains at the same 58 inherited failures with 3395/3453 tests passing.
T588 adds static/dynamic root/helper `down.recover` and `down.recovertime`
mutation consumed by later target fall/get-up metadata. Four core files / 253
tests plus root/helper cases and all gates pass. T589-T600 add attack depth,
accepted-hit facing, air/ground/guard/down hit durations, and guard control
timers plus down velocity and fall flags through static or bounded dynamic
root/helper values. Five focused files pass 574 tests plus isolated
root/helper/contact cases, plus guard, air-guard, air-hit, and component-wise
grounded X/Y/Z vectors. Five focused files pass 583 tests. The full suite
  passes 3415/3473 with the same 58 inherited failures, and all gates pass.
  T601 adds selected ground slide time and unguarded readback. T602 adds full
  normal/guard pause pairs: the Projectile consumes the first value and the
  defender consumes the second without pausing the owner. The full suite now
  passes 3423/3481 with the same 58 inherited failures; all gates pass. T603
  closes typed width/height/depth Projectile guard-distance bounds and the
  origin-based `InGuardDist` consumer. The full suite now passes 3426/3484
  with the same 58 inherited failures; all gates pass. T604 closes the selected
  Projectile spark payload. T605 closes Projectile-origin `mindist`/`maxdist`
  correction with 3432/3490 tests passing and the same 58 failures. T606 closes
  selected hit acceleration metadata and GetHitVar readback with 3433/3491
  tests passing and the same 58 failures. T607 closes selected contact EnvShake
  metadata with 3436/3494 tests passing and the same 58 failures. T608 is active
  for selected fall EnvShake direction. Keep dynamic
flags/enums, full team topology, exact tick order, rollback, and full
ModifyProjectile parity outside the claim.

## 2026-08-08 continuation checkpoint — T543-T562

T522/T523/T524/T525 are closed-bounded with focused 230/232/234/220-test coverage,
682/682 trace artifacts, typecheck, build, boundaries, and diff hygiene. The
Fighter Lab now has Gallery, Showcase, Animation Testbench, Character Matrix,
and Character Compare routes
(`?mode=lab&labView=gallery|showcase|testbench|matrix|compare`) for roster
inventory, quick playback, frame tests, component health, evidence links, and
action-by-action roster comparison. `pnpm qa:browser:fighter-lab` passes with
all views and zero errors. T526
issue 100 is closed-bounded: `comboHitCount` covers direct/player-owned
Projectile first/consecutive/guarded contacts while authored `numhits` remains
the static trace fallback. T527 issue 101 and issue 102/T528 are closed-bounded
for authored multi-hit and KO-delta readback. T534/issue 108 now closes the
opt-in Helper red-life LifeShare mutation with required trace `686/686`.
T535/issue 109 now closes static `GetHitVar(hitflag)` overlap comparisons for
direct and Projectile last-hit metadata, including the official `MAF` default;
five focused files / 238 tests pass and the existing trace corpus stays
`686/686`.
T536 / issue 110 is closed-bounded: `runtimeRoundStateFromPhase` names the
`RoundState` projection, and the two-profile lifecycle fixture covers the
control-locked Fight screen (`1`), Fight (`2`), KO/over (`3/4`), and next-round
reset (`0`). T538 / issue 112 is closed-bounded: the runtime projects
`IntroState`, four `FightScreenState` booleans, and numeric timing/localcoord
`FightScreenVar` reads from the imported clock. T539 / issue 113 is now
closed-bounded: the round owns resettable `FightTime`, while the typed
FightScreen context exposes bounded timing `GameVar` reads for intro, outro,
pause, KO slow, and SuperPause. T540 / issue 114 is closed-bounded for
supported active-frame `AnimElemVar` metadata shared by CNS/controller reads
and the read-only Testbench (4 files / 72 tests; browser gate pass). T541 /
issue 115 is now closed-bounded: `AnimLength` sums effective imported AIR
frame durations (`max(1, duration)`) and is visible in CNS/controller reads
and Testbench (5 files / 78 focused tests; browser gate pass). T542 / issue 116
is now closed-bounded: `AnimPlayerNo` reads the active animation owner's
`playerNo` through the shared animation, CNS, and controller contexts. Focused
coverage is 5 files / 81 tests; typecheck passes. T543 / issue 117 is now
closed-bounded: `ClsnVar` reads current-frame `clsn1`, `clsn2`, and `size`
coordinates through shared CNS/controller contexts, redirects, `localcoord`,
and the Testbench. Focused coverage is 5 files / 80 tests; typecheck, build,
boundaries, 686/686 traces, and the browser gate pass. T544 / issue 118 is now
closed-bounded for transformed `ClsnOverlap` player queries (5 files / 83
tests). T545 / issue 119 closes the Character Matrix with 2 fighters, 34
actions, 12 component checks, and dedicated browser/visual evidence. T546 /
issue 120 closes transformed `ProjClsnOverlap` with owner-relative
oldest-first indexing and 8 files / 258 focused tests. T547 / issue 121 closes
bounded numeric Ikemen `ProjVar` reads with 5 files / 172 focused tests. Next
T548 / issue 122 closes typed static `ProjVar` flag comparisons with 5 files /
173 focused tests and official complemented-mask inequality semantics. T549 /
issue 123 closes Projectile Pause/SuperPause counters with 8 files / 278
focused tests and green runtime/trace gates. T550 / issue 124 closes Projectile
removal velocity and terminal motion with 8 files / 292 focused tests. T551 /
issue 125 closes Projectile `velmul` Z with 8 files / 292 focused tests and
green runtime/trace gates. T552 / issue 126 closes normalized Projectile
`projlayerno`, presentation ordering, and numeric reads with 9 files / 290
focused tests and green runtime/trace gates. T553 / issue 127 closes Projectile
`projangle`, live Z rotation, and numeric reads with 9 files / 278 focused tests
and green runtime/trace gates. T554 / issue 128 closes Projectile
`projxangle`/`projyangle`, bounded X/Y rotation, traces, and numeric reads with
9 files / 278 focused tests and green runtime/trace gates. T555 / issue 129 is
closed for Projectile `projxshear`, bounded deformation, traces, and numeric
reads with 9 files / 279 focused tests and green runtime/trace gates. T556 /
issue 130 is closed for Projectile RGB shadow state, partial modification,
readback, and live tint with 9 files / 280 focused tests and green runtime/trace
gates. T557 / issue 131 is closed for Projectile reflection auto/off/on state,
snapshots, and bounded live mirrored presentation with 9 files / 281 focused
tests and green runtime/trace gates. T558 / issue 132 closes Projectile named
projection, focal length, and bounded live perspective with 9 files / 282
focused tests. T559 / issue 133 closes four-value Projectile window state,
local-coordinate snapshots, and bounded live quad/UV clipping with 3 files /
112 focused tests. T560 / issue 134 is active for spawn-only Projectile palette
ownership/remap and draw-palette readback.
T525's guard-count field is bounded to direct/Projectile contacts and idle reset.
The broad smoke timed out after 180 seconds. The full suite retains 13 failed
files / 58 failed tests with 3378/3436 passing in the documented inherited
retired-roster/Studio/log-label baseline.

## 2026-08-01 official parity continuation checkpoint

Resume from the next source-selected task after rechecking Git. Open the
[official comparison](research/2026-07-30-official-mugen-ikemen-roadmap-comparison.md)
and issue 12. T424's typed root/helper same-tick chaining, source-tail
skipping, and 32-hop cycle protection are closed with 305/3234 tests,
typecheck, build, boundaries, diff hygiene, and 667/667 trace artifacts.
T425 is also closed: 05b prevailed over the wiki-only 30 px wording, a live
`P2Name` controller value refresh is covered, and its required trace passed
inside the 668/668 matrix. Keep existing dirty roadmap/DA32 work untouched
unless the selected task explicitly owns a small top-level update.

T426 through T428 are closed-bounded. T427 proves direct/fallback/mixed ZSS
through the loader, shared IR, and runtime with required trace `47c627a2`.
T428 proves one mixed CNS/ZSS global-hit-pause wrapper route with required trace
`b6533370`. T429 closes constant combined-wrapper cadence with required trace
`4ff43eb7` and final production build. T430/T434 close raw-CNS positive normal
cadence and trigger-count behavior; T431 closes raw-CNS zero normal one-shot
behavior (`d13ad12a`). T432 closes paired raw-CNS paused zero (`94b49516`) and
T433 closes paired raw-CNS positive pause cadence (`d6d00fd0`). T434 closes
sparse trigger-count semantics (`3eb88436`), T435 closes `StateDef -2`
(`6fce3962`), and T436 closes `StateDef -3` with the no-`stateOwner` boundary
(`b2719d71`). Continue from the official comparison, not interval-range
support or a general VM claim.
T465-T469 then closed the guard and direct-hit timing seams. T472 is now
closed-bounded: `down.bounce` reaches direct/projectile fall metadata and
explicit `0` suppresses the `HitFallVel` bounce velocity; omitted/`1` preserve
the current compatibility fallback. Its 198 focused tests, 324/3294 full
suite, typecheck/build/boundaries and 682/682 trace gates pass. Do not recreate
negative-state order/append/keyctrl,
T419-T425 selection/name work, or first-pass
Common1/FightFX loading. No score or watermark moved when this queue was
selected.
T473 is now closed-bounded: a shared runtime resolver applies official
`fall.recover=1` and `fall.recovertime=4` defaults only to enabled falls, with
focused 102 tests and the same full type/build/boundary/trace gates green.
T474 is now closed-bounded: omitted `fall.yvelocity` resolves from localcoord
width (`-4.5/-9/-18` at 320/640/1280px) for direct/projectile materialization,
with focused 105 tests and the same full gates green. Exact Common1 recovery /
landing choreography remains outside the claim.
T475 is now closed-bounded: `air.fall` remains a typed airborne-only override,
so `fall = 0, air.fall = 1` falls only against airborne defenders while base
`fall = 1` remains effective in every eligible state. Compiler, HitDef,
resolver, direct/projectile and parser regressions plus the final gates pass.

T476 is now closed-bounded: `down.velocity.x` survives HitDef,
ModifyHitDef, imported move and Projectile materialization. Lie-down contacts
apply the authored X component with attacker-relative sign; 247 focused tests,
full 324/3308 tests, typecheck/build/boundaries and `qa:trace` 682/682 pass.
T477 is now closed-bounded: authored `fall.xvelocity` remains signed through
direct/projectile fall materialization without facing mirroring; focused 121
tests and final 324/3310, typecheck/build/boundaries and `qa:trace` 682/682
gates pass.
T478-T492 and T506-T524 are also closed-bounded CommonFX, Ikemen metadata, and
trace-baseline continuations. T522/T523/T524 are the latest closed-bounded
runtime-feature cursors; T525 is the selected next official research cursor.
T506 passes five focused files /
178 tests plus five deterministic IKEMEN trace checks; typecheck, build,
boundaries and asset hygiene pass. T507's alias passes one focused file / 27
tests. T508 clears the two retired-label trace failures; `qa:trace` passes
682/682 while broader stale-roster Vitest debt remains. T509 reuses the existing
guard-KO flag for `GetHitVar(guardko)` and passes 3 files / 121 tests. T510
compares static `GetHitVar(attr)` filters with existing `sourceAttr` and passes
3 files / 118 tests. T511 compares retained effective `guardflag` masks with
Ikemen overlap semantics and passes 6 files / 224 tests.
T512 closes the numeric `GetHitVar(projid)` continuation: Projectile contacts
retain the authored ID and direct/missing metadata read as `-1`; four focused
files / 186 tests plus typecheck/build/boundaries and 682/682 traces pass.
T513 closes the numeric `GetHitVar(teamside)` continuation: direct and
Projectile contacts retain the effective 1-based source side, explicit values
win, omitted local values derive from the attacker/root, and missing metadata
reads `-1`; four focused files / 186 tests plus typecheck/build/boundaries and
682/682 traces pass. The broad suite remains at 14 failed / 311 passed files
and 58 failed / 3277 passed tests from retired Nova/Mira/Rook fixtures.
T514 closes the numeric `GetHitVar(keepstate)` continuation: direct HitDef
metadata retains authored `keepstate`, reads `1` only for `keepstate = 1`, and
falls back to `0` for false/missing metadata. Projectile and Reversal keepstate
remain outside the bounded claim; five focused files / 212 tests plus
typecheck/build/boundaries, diff hygiene, and 682/682 traces pass.
T515 closes the numeric `GetHitVar(frame)` continuation: direct HitDef and
Projectile hit/guard contacts set an ephemeral same-frame marker, frame-start
reset clears it after non-paused contact, and hitpause preserves it; six
focused files / 191 tests plus typecheck/build/boundaries, diff hygiene, and
682/682 traces pass. ReversalDef/HitOverride-only timing remains outside scope.
T516 closes the numeric `GetHitVar(priority)` continuation: direct HitDef
contacts use normalized authored priority, Projectile contacts use the HitDef
default, and Projectile `projpriority` clash data remains separate. Focused
compiler/runtime-context/direct/Projectile coverage passes 4 files / 188 tests;
`qa:trace` 682/682, typecheck, build, boundaries, full-suite baseline capture,
and diff hygiene pass.
T517 closes the numeric `GetHitVar(dizzypoints)` continuation: direct and
Projectile contacts retain authored HitDef dizzy-point metadata separately from
the defender's current dizzy resource, with missing metadata reading `0`.
Focused compiler/runtime-context/direct-combat/Projectile-system/
Projectile-combat coverage passes 5 files / 220 tests; `qa:trace` 682/682,
typecheck, build, boundaries, full-suite baseline capture, and diff hygiene
pass. Cumulative multi-hit reset parity and `GetHitVar(guardpoints)` remain out.
T518 closes the numeric `GetHitVar(guardpoints)` continuation: direct and
Projectile contacts retain authored HitDef guard-point metadata separately from
the defender's current guard resource, with missing metadata reading `0`.
Focused compiler/runtime-context/direct-combat/Projectile-system/
Projectile-combat coverage passes 5 files / 222 tests; `qa:trace` 682/682,
typecheck, build, boundaries, full-suite baseline capture, and diff hygiene
pass. Cumulative multi-hit reset parity and `GetHitVar(guardpower)` remain out.
T519 is closed-bounded: `GetHitVar(redlife)` retains authored direct/Projectile
HitDef redlife separately from the defender's current red-life resource and
defaults missing metadata to `0`; five focused files / 224 tests, `qa:trace` 682/682,
typecheck, build, boundaries, full-suite baseline capture, and diff hygiene
pass. T520 is now closed-bounded with five focused files / 226 tests and the
same full non-browser gates. T521-T524 are also closed-bounded under issues
95-98; T525 is in progress under issue 99 for `GetHitVar(guardcount)` research.

The user-directed content queue is separate: follow
[ROADMAP_CONTENT_PACK.md](ROADMAP_CONTENT_PACK.md), then issue
[78](../.scratch/roadmap/issues/78-roster-reset-two-karate-fighters.md) and
issue [79](../.scratch/roadmap/issues/79-fighter-lab.md). Keep
provider provenance, spritesheet QA and runtime integration evidence distinct
from official parity gates. T499-T503 reduce the public roster to two original
karate fighters, T504 owns identity/pre-package plus global browser closure,
and T505 closes the focused Fighter Lab browser path. The
former T439-T445, T447-T461 and T470-T471 fighter lanes are superseded;
T446/T462 stage work remains. Keep
T472/T473/T474/T475/T476/T477/T478/T479/T480/T481/T482/T483/T484/T485/T486/
T487/T488/T489/T490/T491/T492/T506/T507/T509/T510/T511/T512/T513/T514/T515/T516/T517/T518 combat evidence and T508
trace-baseline evidence on the official lane.

## 2026-07-28 post-DA32-026 continuation checkpoint

Resume by checking Git again. This audit closed at `1b1ba28f`, with machine
record DA30-120, human cursor DA30-020, formal/global `f5f2315e`, runtime focal
T416/T417, Studio focal DA32-026 and source 05b/4aa. Bind smoke to a SHA and
produce one clean current-head gate before any global promotion.

Use the [daily audit](research/2026-07-28-daily-roadmap-architecture-audit-post-da32-026.md)
and [ADR 0073](adr/0073-studio-source-write-recovery-journal.md). Keep scores
held.

## Historical 2026-07-27 post-DA30-120 continuation checkpoint

Resume from HEAD `67481fbc`, Entry 615, machine record DA30-120, proposed human
cursor DA30-020, formal/global `ee23122f`, focal T406, visual/product T342, and
source 05b/4aa. Start DA31-002. Do not edit generated selectors by hand.
Preserve later DA30 rows as bounded inputs while DA31-007 reviews their
original clauses. Scores remain held.

Audit: `docs/research/2026-07-27-daily-roadmap-architecture-audit-post-da30-120.md`.
Plan: `docs/DA31_EVIDENCE_ADOPTION_ROADMAP.md`.

## Historical 2026-07-27 post-DA30-025 continuation checkpoint

Resume from HEAD `c2245fe8`, Entry 613, machine watermark DA30-025, partial
formal observation `27b88f0a`, browser observation `c47cfa4e`, focal T406,
visual/product T342, and source 05b/4aa. First repair DA30-021/024/025 against
their written clauses. Then execute DA30-026 and follow the AUD27 dependency
chain. Keep non-consecutive accepted ADRs/models as inputs until a live
consumer closes their dependency. Scores remain held.

Audit: `docs/research/2026-07-27-daily-roadmap-architecture-audit-post-da30-025.md`.

This guide exists so the project can keep moving without losing the thread. It does not replace the scorecard, execution board, or workplan. It explains how to continue the port in a way that produces usable software instead of scattered experiments.

## 2026-07-26 continuation checkpoint

**Current authority:** [docs/AUTHORITY_SELECTOR.md](AUTHORITY_SELECTOR.md)
(`closedThrough` DA28-30). Formal/global gate `32466c6e` (270/2850, 663 traces);
focal T406 `07ad9227`; visual/product T342 `1085badb`; source epoch 05b/4aa.
DA26, DA27, and DA28-01…30 are closed at named ceilings. The generated queue
is empty. Continue at **DA29-001** control adoption, then current-HEAD global,
product/browser, corpus, and score gates. See the
[expanded audit](research/2026-07-26-expanded-master-roadmap-audit-post-da28.md)
and [master roadmap](MASTER_REVIEW_ROADMAP.md).

## 2026-07-18 T288 continuation checkpoint

Resume from implementation HEAD `a12a2672`, Entry 562, and Wayfinder T288.
The focused actor-reset slice is green at 5 files / 392 tests plus TypeScript
7; broad suite/build/trace/browser evidence is deliberately pending. Continue
with source-backed FightScreen announcement/display ownership, preserve the
T288 claim ceiling, and keep the pre-existing dirty roadmap/research files
untouched unless they are explicitly part of the next closeout.

## 2026-07-18 Post-T268 Daily Audit Override

Resume from runtime HEAD `b241cc65`, with Entry 555 and Wayfinder 256 retained
as historical roadmap cursors. The grouped current checkpoint is 633/633 traces
and 231/231 files / 2435/2435 tests. Do not replan closed
release/evidence/redirect/global state/common loader/helper buffer/SOCD slices;
T266-T268 are closed at their written ceilings.

First reconcile normative `05b7d98` with local `044da720` and classify semantic
deltas, settle match-config authority, rebuild current evidence, and obtain
Common.Fx browser proof. Then follow T15-T30 for round/Turns/projectile
determinism, legal character breadth, product trust and modular extraction.
Full task contracts:
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.

## Historical 2026-07-16 Post-Wayfinder-229 Daily Audit Override

Resume from HEAD `83f85bae`, Entry 555, and Wayfinder 229. Treat 633/633 as the
latest declared trace aggregate and Wayfinder 221's 2294/2294 as the latest
declared full suite, not a current-HEAD rerun. Preserve concurrent dirty
AssetReleasePolicy work as reserved and do not count it. The next work is the
30-task dependency chain in
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md`;
older selectors are historical. Never replan AffectTeam/depth, snapshot v1.1,
the second CC0 stage route, GateEvidence/receipt v0, PackageAnalysis v1 and its
consumer, or asset hygiene.

## Historical 2026-07-16 Post-Wayfinder-209 Daily Audit Override

Entry 555 is the maximum numbered ledger entry; Wayfinder 209 is a later
unnumbered checkpoint. Do not rebuild it. Resume with: control and 2262/2263
baseline reconciliation; immutable IKEMEN pin; snapshot v1.1; a second
repository-authored CC0 route; lease v1.1 before ADR 0006 acceptance; atomic
Turns plus State 5900/RoundState; then separated projectile and product trust
gates. Scores stay unchanged. The exact 30 tasks are in
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.

## Historical 2026-07-15 Post-Entry-554 Daily Audit Override

Entry 554 is the maximum numbered ledger entry. Audited HEAD 05d85137 is an
unnumbered report frontier at 633/633 traces after bounded root/helper
RedirectID expansion. Do not rebuild those closeouts, invent Entries 555
onward, or infer score movement.

Resume in this order: reconcile control and the Ikemen pin; materialize corpus
snapshot v1 and independent legal breadth; characterize and centralize
redirected-target dispatch with explicit mutation/telemetry identity; decide
helper TargetState separately; make Turns preflight/commit atomic; resolve
State 5900 and RoundState; then add real Studio, scanner, asset, and shared
Evidence consumers. The exact 30 tasks are in
docs/research/2026-07-15-daily-roadmap-architecture-audit-post-entry-554.md.
Older current/next sections below are historical when they conflict.

## Historical 2026-07-15 Entry-549 Daily Audit Override

Entry 549 and 610/610 traces are the committed frontier. Do not rebuild the
closed Turns continuation, corpus/adjudication, legal stage journey, BGCtrl,
StudioSemanticDraft, PackageAnalysis/v0, AssetProvenance/v2, root identity, or
active TargetPowerAdd RedirectID gates. Preserve the dirty State -1 follow-up
as in-flight work.

Continue with a materialized corpus snapshot, then a target-family dispatch
seam and active TargetLifeAdd. Before expanding team modes, make Turns
preflight/commit atomic and model RoundState after resolving state-5900 policy.
In product lanes, replace hardcoded readiness with evidence artifacts, surface
PackageAnalysis in a real consumer, prove one complete asset release record,
and promote only the resulting Evidence contract into shared core. See
`docs/research/2026-07-15-daily-roadmap-architecture-audit-entry-549.md`.

## 2026-07-14 Entry-516 Daily Audit Override

Entry 525 closes the first `CompatibilityCorpus/v0` denominator. Required
legal, portable legal, and optional private evidence are distinct, binary
payloads stay outside the index, and normalized/checksum drift fails closed.
Scores remain unchanged. Continue with written score-band adjudication, then
one independent legal stage/package route. The I2 route remains automatic Turns
decision -> handoff -> resource reset -> state-5900 -> continuation.

Entry 518 supersedes the entry-516 selector. Do not rebuild omitted dizzy defaults/scaling/break, red-life `LifeShare`, lifecycle rebind, HUD meters, match outcome/state 5900, or sequential round context.

Continue the product lane with `CompatibilityCorpus/v0`, written score adjudication, and one independent legal stage/package route. In the I2 runtime lane, connect automatic Turns decision -> handoff -> resource reset -> state-5900 -> continuation over the verified 1 -> 2 -> 3 context. In parallel, Studio preflights semantics before writing; provenance v2 stays fail-closed; scanner analysis precedes shared-core promotion. See `docs/research/2026-07-14-round-context-sequence.md`.

## Previous 2026-07-14 Daily Audit Override

Entry 510 supersedes the entry-505 implementation cursor. Do not rebuild journey-v1, M2 adjudication, the independent character routes, global AssertSpecial, explicit Turns handoff, team lifebar/HUD, root life/power banks, Helper-local life/power, red-life, guard points, auxiliary projection, dizzy mutation, or bounded folder editing.

Continue with a versioned compatibility corpus and score-band decision, then an independent legal stage/package route. In Studio, preflight a semantic draft before writing. In I2, close omitted dizzy defaults, `AttackMulSet` scaling, and break policy, then land red-life `LifeShare` as a separate adapter. Automatic Turns continuation waits on reset and reference-transfer semantics. See `docs/research/2026-07-14-dizzy-points-suppression.md`.

## 2026-07-13 Daily Audit Override

Entry 476, not 411, is the numbered committed cursor. Post-KO/`NoKOSlow`, the legal MUGEN-lite journey, and active-root admission/contact/priority/reversal/depth/HitOverride/guard are closed bounded gates. Wayfinder 127 is open dirty-tree work; preserve it. After it closes, continue with `CompatibilityJourney/v1`, explicit milestone adjudication, and independent legal-package/palette evidence. Before team KO, decide global AssertSpecial ownership. See `docs/research/2026-07-13-daily-roadmap-architecture-audit.md`.

## 2026-07-12 Daily Audit Override

Entry 411 closes Wayfinder 105 bounded plural X/Width body push in the current working tree with declared full gates and no score movement. Return now to R1 post-KO / `NoKOSlow`; Wayfinder 106 may map hit admission in parallel, and later executable I2 work begins with a root combat-candidate/getter-order read model before mutation. See `docs/research/2026-07-12-daily-roadmap-architecture-audit.md`.

## Current Horizon

The active horizon is:

```txt
MUGEN-lite playable MVP
  -> official/local KFM-style package runs common authored routes
  -> native/generated roster remains playable
  -> unsupported features are visible, classified, and non-crashing
  -> Studio can show what is loaded, stale, blocked, exportable, and proven
  -> every compatibility claim has a test, trace, fixture, screenshot, or build artifact
```

The project is not currently trying to claim full MUGEN or IKEMEN parity. It is building the engine shape that can eventually reach those horizons.

## Continuity Rules

1. Preserve the playable sandbox.
2. Prefer one score-moving gate over broad unfinished work.
3. Treat scanner support, parser support, runtime execution, and visual parity as separate claims.
4. Keep generated/native fighters separate from imported MUGEN compatibility.
5. Do not move scores from docs-only work.
6. Every runtime compatibility cut must name what is still blocked.
7. Every frontend/render cut must close with visual QA.
8. Every broad planning pass must leave a smaller next implementation slice.

## Workstream Ladder

| Order | Workstream | Goal | Evidence that counts |
| --- | --- | --- | --- |
| 1 | R1 Runtime compatibility | More KFM/Common1-style authored routes execute. | `pnpm qa:trace`, focused runtime tests, optional KFM fixture gates. |
| 2 | R2 MatchWorld ownership | Mutable runtime behavior moves behind named systems. | Focused system tests, stable or documented trace checksums. |
| 3 | S1 Studio trust chain | Evidence and Build agree on status and next action. | `pnpm qa:smoke`, screenshots, real evidence rows. |
| 4 | A1 Generated assets | Prompt/source/atlas/QA/playtest/collision records stay linked. | Asset QA records, Studio surfacing, visual smoke if UI changes. |
| 5 | I1 IKEMEN scanner | More IKEMEN source/docs signals are recognized and classified. | Scanner tests and blocked runtime wording. |
| 6 | I2 IKEMEN bounded runtime | Explicit-profile semantics advance through source-pinned, isolated gates. | Focused runtime tests, required traces, blocked consumer claims. |
| 7 | M1 Modular engine | Shared contracts prove no fighting-specific leakage. | `pnpm check:boundaries`, contract tests, docs. |

## Historical Next Useful Runtime Gates

Current R1 truth: bounded post-KO / `NoKOSlow` and one legal end-to-end MUGEN-format fixture journey are closed. After Wayfinder 127 closes independently, aggregate the existing route as `CompatibilityJourney/v1`, adjudicate the written MUGEN-lite milestone without documentary score inflation, then add one materially independent legal package or ACT/palette route.

Current I2 truth: entry 476 closes bounded active-root admission/contact/priority/reversal/depth/HitOverride and grounded/air guard entry. Wayfinder 127 owns the open fixture-specific air-guard landing. Before widening team KO, Helper/Projectile, lifebar, or resource consumers, decide global per-tick AssertSpecial ownership and keep the shallow motion orchestrator delegating stun semantics to `RuntimeStunWorld`.

The HitDef priority policy/contact, `MugenPresentationOrder/v0`, `MatchTickSchedule/v0`, Common1 source precedence, automatic guard ordering, and subsequent IKEMEN RunOrder/Pause/team-topology gates are closed. The ledger below is historical context and must not be selected as current work.

### Historical Gate Ledger

Selected next R1/renderer sequence: first preserve authored-versus-omitted direct `HitDef p1sprpriority` / `p2sprpriority` behind a minimal profile/default-source policy; then apply static player/helper values on accepted hit and guard through the MUGEN 1.1 policy and trace resolved source before Three.js adaptation. Projectile inheritance, dynamic values, IKEMEN normative behavior, equal ties, stage/effect interleaving, `Explod ontop`, score movement, and parity remain blocked. Proposed ADR 0002 must be adopted or replaced before runtime mutation.

Selected next R2 architecture gate: version the actual controller/movement/animation/combat schedule as `MatchTickSchedule/v0`; keep diagnostics outside the legacy behavior-checksum projection and assert schedule separately. Do not continue extracting transparent callback wrappers without an ownership or deletion rationale.

Historical closed R1/R2 slice: shared combat emits an explicit received-hit sequence and browser audio uses it for one-shot actor-local channel `0` voice cancellation. Its Wayfinder 018 selector is superseded by current ticket 024.

Historical closed R1/R2 slice: browser audio numbered channels are actor-local, preventing matching channel numbers from cross-interrupting between runtime actors while preserving global `StopSnd -1`. Its Wayfinder 017 selector is superseded by current ticket 024.

Historical closed R1 slice: five required first-generation helper-local direct HitDef/persistence traces resolve helper-local contact sound refs and record owner-attributed typed `audio:playsnd`, with fail-closed rejection coverage. Its Wayfinder 016 selector is superseded by current ticket 024; exact playback, broader ownership, and renderer claims remain outside that slice.

These are good next implementation slices because they can be proven without pretending to finish the full VM:

- Preserve authored HitDef p1/p2 presence and profile default source before adding contact mutation.
- Add static player/helper direct contact priority with required semantic traces.
- Follow it with a controlled renderer overlap oracle, keeping tie and `ontop` behavior blocked.
- Version the actual match schedule before changing or further splitting it.
- Prove Common1 source precedence first, then hard guard order as a separate fact.
- After Wayfinder 127 is independently green, prefer the aggregate Compatibility Journey and milestone-adjudication gates before another narrow I2 matrix.

Avoid starting full helper VM, full ZSS/Lua, rollback, teams, or screenpack parity until the smaller routes above stay green.

The compact package ladder lives in `docs/ROADMAP_PACKAGE_MILESTONES.md`; the tactical next-10-slices queue lives in `docs/NEXT_BUILD_ROADMAP.md`. After docs/setup work, return to both before choosing code.

Latest closed R1 runtime checkpoint: required player-owned Projectile normal-hit GetHitVar artifacts use trace/final checksums `8e5df79b` / `4d078c5d`, `4356b5cb` / `4b270d45`, and `df2619f9` / `5469bc69`. They preserve defender Common1 `5000 -> 335/337/339`, target links, Projectile lifecycle payloads, exact gated metadata, typed `audio:playsnd`, attacker-side `S5,45/46/47`, and FightFX `F7002` package evidence. `pnpm qa:trace` passes 524/524 artifacts, 493 required and 31 optional. This is bounded player-owned Projectile GetHitVar sound telemetry only; exact SND playback/channel semantics, combo/chain arbitration, Projectile/helper persistence breadth, broader ownership, renderer parity, score movement, and full parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-hitcount.json` trace checksum `ee8f4e19` / final checksum `0fd4adf8` and `synthetic-imported-helper-projectile-hitcount.json` trace checksum `c8f5dc55` / final checksum `e1569fab` prove bounded player-owned and first-generation helper-parented/root-owned Projectile normal-hit attacker-side HitCount sounds preserve their owner/helper branches, target links, Projectile lifecycle evidence, FightFX `F7002` package metadata, and typed `audio:playsnd` telemetry. The player route packages `S5,44`; the helper route packages helper-local `S5,43`. `pnpm qa:trace` passes 524/524 artifacts, 493 required and 31 optional. Official Elecbyte State Controller Reference defines `Projectile` as taking HitDef parameters and helper-created Projectiles as root-owned; Elecbyte Trigger Reference defines `HitCount` / `UniqHitCount` as current-attack counters. This is bounded player/helper Projectile attacker-side HitCount sound telemetry only; broader helper Projectile normal-hit sound breadth beyond the gated routes, exact SND playback/channel/timing/mixing/panning, renderer parity, broader helper/redirect/team ownership, score movement, and full audio/Projectile/HitCount parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-projectile-guard-ko.json` trace checksum `05dbcded` / final checksum `98b8bf17`, `synthetic-imported-helper-projectile-guard-kill.json` trace checksum `33930a00` / final checksum `8412e638`, and `synthetic-imported-helper-projectile-guard-terminal.json` trace checksum `c6937f42` / final checksum `e0835e33` prove bounded first-generation helper-parented/root-owned Projectile guard-contact `guardsound = S6,0` refs resolve through the helper-local spawn path, preserve sound-event/FightFX package metadata, and record typed `audio:playsnd` telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-afterimage-dynamic.json` trace checksum `e7299ac5` / final checksum `b946d805` proves bounded imported active-state dynamic `AfterImage time/length/timegap/framegap/paladd/palmul` params resolve owner-local expressions through the active sprite-effect boundary, record typed `sprite-effect:afterimage` telemetry after resolution, and preserve actor-frame/final ghost-trail evidence.

Previous closed R1 runtime checkpoint: required `synthetic-imported-angle-dynamic.json` checksum `13560dcd` / final checksum `4d7c4726` and `synthetic-imported-anglemul-dynamic.json` checksum `0bb54a1c` / final checksum `c9f2b557` prove bounded imported active-state dynamic Angle typed sprite-effect telemetry and remain required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-palfx-dynamic.json` checksum `36cdca15` / final checksum `7a1a4525` proves bounded imported active-state dynamic `PalFX time/add/mul/color/invertall` typed sprite-effect telemetry and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-afterimagetime-dynamic.json` checksum `c5ef6fff` / final checksum `661a233d` proves bounded imported active-state dynamic `AfterImageTime value/time` typed sprite-effect telemetry and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-remappal-dynamic.json` checksum `5f04f2d4` / final checksum `71ad06f0` proves bounded imported active-state dynamic `RemapPal source/dest` typed sprite-effect telemetry and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-lifeadd-dynamic.json` checksum `8b0493f8` / final checksum `cbe4ab51` proves bounded imported active-state dynamic `LifeAdd value = IfElse(var(8), -2000, 0), kill = var(9)` resolves owner-local numeric expressions through runtime expression fallback, records typed `resource:lifeadd` telemetry after resolution, and preserves nonlethal owner life at `1`.

Previous closed R1 runtime checkpoint: required `synthetic-imported-control-dynamic.json` checksum `885cc464` / final checksum `ecf2bec6` proves bounded imported active-state dynamic `CtrlSet value = IfElse(var(0), 1, 0)` resolves owner-local numeric expressions through runtime expression fallback, records typed `resource:ctrlset` telemetry after resolution, preserves actor-frame state/action evidence, and preserves final `ctrl = true`.

Previous closed R1 runtime checkpoint: required `synthetic-imported-statetypeset-dynamic.json` checksum `577404e4` / final checksum `083a76de` proves bounded imported active-state dynamic `StateTypeSet statetype = IfElse(var(0), C, S), movetype = IfElse(var(1), A, I), physics = IfElse(var(2), N, S)` resolves owner-local enum expressions through runtime expression fallback, records typed `metadata:statetypeset` telemetry after resolution, and preserves actor-frame/final `stateType = C`, `moveType = A`, `physics = N`.

Previous closed R1 runtime checkpoint: required `synthetic-imported-screenbound-dynamic.json` checksum `9797bdfe` / final checksum `d76b641a` proves bounded imported active-state dynamic `ScreenBound value = var(0), movecamera = var(1),var(2)` resolves owner-local vars through runtime expression fallback, records typed `bounds:screenbound` telemetry after resolution, skips the X stage clamp, and excludes the actor from X camera centering for the same bounded tick. `pnpm qa:trace` passed 519/519 artifacts, 488 required and 31 optional. Official Elecbyte State Controller Reference defines numeric controller params as expression-capable unless otherwise specified and defines one-tick `ScreenBound value/movecamera` semantics/defaults. This is bounded dynamic ScreenBound value/movecamera resolution plus typed bounds telemetry only; exact camera/screen-edge behavior, exact tick order, pause/hitpause behavior, helper/team ownership, score movement, and full constraint parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-posfreeze-dynamic.json` checksum `8de0c2e9` / final checksum `6c40bb79` remains required for bounded imported active-state dynamic `PosFreeze` typed bounds telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-playerpush-dynamic.json` checksum `b7775652` / final checksum `92aca1cd` remains required for bounded imported active-state dynamic `PlayerPush` typed telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-width-dynamic.json` checksum `51554c91` / final checksum `84a85277` remains required for bounded imported active-state dynamic `Width` typed telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-dynamic-posadd.json` checksum `97ec15d0` remains required for bounded imported helper-local dynamic `PosAdd` typed telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-dynamic-posset.json` checksum `50596bc2` remains required for bounded imported helper-local dynamic `PosSet` typed telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-dynamic-velmul.json` checksum `08220a98` remains required for bounded imported helper-local dynamic `VelMul` typed telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-dynamic-veladd.json` checksum `fbb8bcae` remains required for bounded imported helper-local dynamic `VelAdd` typed telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-controller-param-parentroot.json` checksum `94919326` remains required for bounded imported helper-local dynamic `VelSet` typed telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-dynamic-posset.json` checksum `aeb730fb` remains required for bounded imported active-state dynamic `PosSet` typed telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-dynamic-velmul.json` checksum `4d241401` remains required for bounded imported active-state dynamic `VelMul` typed telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-dynamic-veladd.json` checksum `daf99fb4` remains required for bounded imported active-state dynamic `VelAdd` typed telemetry.

Previous closed R1 runtime checkpoint: required `synthetic-imported-const-controller-param.json` checksum `2dad3a50` proves bounded imported active-state `VelSet` params can evaluate `Const240p(3) + Const480p(6)` to velocity `12` and `0 - Const720p(12)` to velocity `-6` for a 640x480 player localcoord, with static and dynamic resolved `VelSet` both recorded as `kinematic:velset`. That checkpoint passed 509/509 artifacts, 478 required and 31 optional. Official Elecbyte State Controller Reference defines numeric controller params as expression-capable unless otherwise specified, and Elecbyte Trigger Reference defines `Const240p`, `Const480p`, and `Const720p` as player-coordinate width-ratio conversions. This is bounded `VelSet` param-context conversion plus active-state dynamic `VelSet` typed telemetry only; broad coordinate translation across all controller params, dynamic typed-operation lowering beyond active-state `VelSet`, renderer/screenpack viewport ownership, camera animation parity, IKEMEN `config.json` execution, team/simul/helper namespace breadth, score movement, and full viewport parity remain blocked. Previous `synthetic-imported-const-coordinate.json` checksum `ea879c1b` remains required for State -1 const route evidence.

Previous closed R1 runtime checkpoint: required `synthetic-imported-config-gamespace.json` checksum `2f3c0a63` proves bounded imported State -1 routing through parsed-config-equivalent `ScreenWidth = 1280`, `ScreenHeight = 720`, `GameWidth = 2560`, and `GameHeight = 1440` at camera zoom `0.5`, with INI `[Config] GameWidth` / `GameHeight` preferred over stage localcoord. `pnpm qa:trace` passes 507/507 artifacts, 476 required and 31 optional. Official Elecbyte Coordinate Space Notes define `mugen.cfg` `[Config] GameWidth` / `GameHeight` as the game coordinate space, and Elecbyte Trigger Reference defines inverse camera-zoom scaling plus non-zooming `ScreenWidth` / `ScreenHeight`. This is bounded config parsing plus current runtime trigger expression precedence evidence only; broader player-local coordinate translation, renderer/screenpack viewport ownership, camera animation parity, IKEMEN `config.json` execution, team/simul/helper namespace breadth, score movement, and full viewport parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-screenspace.json` checksum `5330bacd` proves bounded imported State -1 routing through `ScreenWidth = 640` and `ScreenHeight = 480` while the same zoom `0.5` route validates `GameWidth = 1280` and `GameHeight = 960`.

Previous closed R1 runtime checkpoint: required `synthetic-imported-gamespace.json` checksum `b6f248ab` proves bounded imported State -1 routing through `GameWidth = 640` and `GameHeight = 480` from stage localcoord plus camera zoom context and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-modifyprojectile-omitted-bounds.json` checksum `24cbb1dc` / final checksum `e94d1480` and `synthetic-imported-helper-modifyprojectile-omitted-bounds.json` checksum `9db04bbc` / final checksum `555d744b` prove bounded owner-side/helper-local `ModifyProjectile` preserves existing explicit Projectile removal bounds when later mutation omits `projedgebound`, `projstagebound`, and `projheightbound`. That checkpoint passed 504/504 artifacts, 473 required and 31 optional. Previous required dynamic params and dynamic bounds gates remain paired evidence: helper params `synthetic-imported-helper-modifyprojectile-dynamic-params.json` checksum `2d88a550` / final checksum `edb6d2d2`, owner params `synthetic-imported-modifyprojectile-dynamic-params.json` checksum `6ffbef92` / final checksum `5665a98e`, helper bounds `synthetic-imported-helper-modifyprojectile-dynamic-bounds.json` checksum `f582153e` / final checksum `adc63407`, and owner bounds `synthetic-imported-modifyprojectile-dynamic-bounds.json` checksum `e2f7a077` / final checksum `aa78704a`. This is bounded owner-side/helper-local omitted-bound preservation and mutation evidence only; exact camera/screen/stage split, exact tick order, helper/team namespace breadth, team/simul helper selection, score movement, and full Projectile parity remain blocked. Previous static owner/helper `ModifyProjectile` gates (`63a87da1`, `09d3f7e4`) and player/helper localcoord default-bound gates (`af7ee80e` / `46b0164c`) remain required.

Previous closed R1 runtime checkpoints remain required for helper/player explicit height/edge/stage bounds (`helper projstagebound` checksum `488ce550`, `helper projedgebound` checksum `8482f4f3`, helper `projheightbound` checksum `debb08b1`, player explicit height/edge/stage gates), generic player bounds (`1d7479d3`), Projectile terminal fallback/cancel, guard chip KO/no-KO, ReversalDef, SuperPause, audio/presentation, AssertSpecial, helper/target/custom-state, and Common1 routes.

Previous closed R1 runtime checkpoint: required `synthetic-imported-hitdef-guard-ko.json` checksum `b7db75f4` / final checksum `0f9afa50` proves bounded default lethal direct guard-chip KO. The route executes a guarded imported direct `HitDef` with `guard.damage = 2000` and default `guard.kill`; it requires typed `hitdef` operation evidence, guard event/reason evidence, round KO winner/message evidence, and final P2 life `0`. That checkpoint passed 475/475 artifacts, 445 required and 30 optional.

Previous closed R1 runtime checkpoint: required `synthetic-imported-guarddist-reversal-no-contact.json` checksum `ca20c823` / final checksum `2bc9b86d` proves bounded negative `guard.dist` / `ReversalDef` contact priority. The route executes a guardable imported direct `HitDef` with `guard.dist = 96` in the near-but-not-contacting guard-distance stage while P2 has active `ReversalDef p1stateno = 777` / `p2stateno = 888` and an explicit `InGuardDist` guard-start route; it requires imported player actors, routed state `200`, executed states `130` and `200`, typed `hitdef` / `reversaldef` operation evidence, P2 state-0 `ReversalDef` controller evidence, `ChangeState` evidence for guard-start, whiff combat reason, final P2 state/action `130`, and forbidden reversal/get-hit/guard-hit states `777`, `888`, `5000`, `150`, and `151`. That checkpoint passed 474/474 artifacts, 444 required and 30 optional. This is bounded no-contact rejection evidence only; exact guard-distance boxes, positive proximity-only `guard.dist` ReversalDef contact, exact guard-start timing, custom-state breadth beyond direct routes, projectile reflection/removal after reversal, helper-owned custom-state tables, exact attr grammar, hitpause/tick order, multi-projectile/multi-target/team breadth, score movement, and full ReversalDef/guard parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-projectile-reversal.json` checksum `a1d82380` / final checksum `ca66a49a` proves bounded helper-parented/root-owned Projectile `ReversalDef` priority and remains required. The route creates a visual Helper that spawns Projectile id `8878` with `ownerId = p1`, `rootId = p1`, and `parentId = p1-helper-0`, stops at the initial reversal contact, and proved the helper-parented/root-owned Projectile version before the direct custom-state reversal gate was added.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-reversal.json` checksum `5c4ddf48` / final checksum `bb0bbb99` proves bounded player-owned Projectile `ReversalDef` priority and remains required. The route executes imported Projectile id `77` against a defender with active `ReversalDef`, stops at the initial reversal contact, and proved the player-owned version of the same priority order before the helper-parented trace was added.

Previous closed R1 runtime checkpoint: required `synthetic-imported-superpause-pausebg.json` checksum `49bcfe16` / final checksum `397a8fae` proves bounded imported `SuperPause pausebg = 0` metadata. The route executes typed SuperPause evidence with `pausebg = 0`, requires match-pause/freeze evidence, records `hitdef` and `pause:superpause` operation evidence, and observes `pauseBg = false` in the required match-pause gate. That checkpoint passed 465/465 artifacts, 435 required and 30 optional. This is bounded SuperPause pause-background snapshot evidence only; actual renderer/background update parity, exact stage/BGCtrl pause timing, renderer visual suppression/playback parity, actual FightFX/common asset lookup/rendering, dynamic `S` player-AIR prefix breadth, `unhittable`, super backgrounds, helper/team/redirect ownership, score movement, and full super presentation parity remain blocked. Previous anim-disabled, default, dynamic, and explicit SuperPause anim/pos, SuperPause dynamic params, p2defmul, SuperPause sound, dynamic HitDef guardsound/hitsound, dynamic `PlaySnd value`, dynamic sound-pan, and helper/player Projectile gates remain required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-superpause-anim-disabled.json` checksum `fc7a2ca4` / final checksum `5be3ca6c` proves bounded imported `SuperPause anim = -1` metadata suppression and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-superpause-default-anim.json` checksum `318c5e9f` / final checksum `747e7619` proves bounded imported omitted `SuperPause anim` default metadata and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-superpause-dynamic-params.json` checksum `052bb481` / final checksum `1847a3f3` proves bounded imported dynamic `SuperPause time/movetime/darken/poweradd` fallback. The route seeds `var(2)=9`, `var(3)=2`, `var(4)=0`, and `var(5)=75`, executes `SuperPause time = var(2), movetime = var(3), darken = var(4), poweradd = var(5)`, requires match-pause/freeze evidence plus P1 source-movetime advance, records `variable:varset`, `hitdef`, and `pause:superpause` operation evidence, and ends P1 at power `75` with max remaining `9`, max move time `2`, and `darken = false`. This is bounded dynamic SuperPause numeric-param telemetry only; typed-operation lowering for dynamic pause params, bottom-to-zero exactness, Pause-over-Pause/SuperPause preemption/delay, `pausebg`, `unhittable`, super backgrounds, helper/team/redirect ownership, score movement, and full pause VM parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-superpause-p2defmul.json` checksum `ec1ba95e` / final checksum `6d009665` proves bounded imported positive `SuperPause p2defmul = 2` current-target damage scaling and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-projtime-same-id-last-contact.json` checksum `4e74aec3` proves bounded helper-local same-ID `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` guard-then-hit last-contact-kind arbitration. A visual Helper spawns two helper-parented owner-side Projectiles with id `8918`; guarded contact happens first, hit contact happens later, and helper route `1200 -> 1306 -> 1307` requires fixed-id plus ID `0` hit/contact time reads while fixed-id plus ID `0` guarded time reads are inactive. Forbidden helper state `1308` proves stale helper-local same-id guarded time does not survive. The gate retains two helper-parented Projectile lifecycle rows, owner/root `p1`, parent `p1-helper-0`, owner target-link id `8918`, guard package `S6,34` / `F7038` / `sparkxy = 35,-77`, hit package `S5,35` / `F7038` / `sparkxy = 36,-78`, and that `pnpm qa:trace` checkpoint passed 439/439 artifacts, 409 required and 30 optional. Together with `synthetic-imported-helper-projtime-same-id-hit-then-guard.json` checksum `f4c1da3b`, both helper-local same-ID two-contact orders are now required. This is bounded helper-local owner-side same-ID Proj*Time evidence only; exact Proj*Time tick order/lifetime, helper custom-state breadth beyond these routes, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, score movement, visual/audio parity beyond bounded packages, and full Projectile parity remain blocked. Previous player same-ID order pair, multi-id Proj*Time, multi-id ProjHit/ProjGuarded, multi-id ProjContact, player/helper Projectile `ProjContact` state-transition, Projectile `hitcount`, Projectile `GetHitVar`, guard slide-stop/control, and guard timing/velocity/cornerpush gates remain required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-projtime-same-id-hit-then-guard.json` checksum `f4c1da3b` proves bounded helper-local same-ID hit-then-guard `Proj*Time` arbitration and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-projtime-same-id-hit-then-guard.json` checksum `d49ee334` proves bounded player-owned same-ID `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` hit-then-guard last-contact-kind arbitration. Two Projectiles share id `8916`; hit contact happens first, guard contact happens later, and owner `200 -> 383 -> 384` requires fixed-id plus ID `0` guard/contact time reads while fixed-id plus ID `0` hit time reads are inactive. Forbidden state `385` proves stale same-id hit time does not survive. The gate retains two Projectile payloads/lifecycle rows, owner target-link id `8916`, hit package `S5,30` / `F7036` / `sparkxy = 31,-73`, guard package `S6,31` / `F7036` / `sparkxy = 32,-74`, and that checkpoint passed 437/437 artifacts, 407 required and 30 optional. This is bounded two-contact same-id Proj*Time evidence only; exact Proj*Time tick order/lifetime, helper custom-state breadth, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, score movement, visual/audio parity beyond bounded packages, and full Projectile parity remain blocked. Previous guard-then-hit same-id, multi-id Proj*Time, multi-id ProjHit/ProjGuarded, multi-id ProjContact, player/helper Projectile `ProjContact` state-transition, Projectile `hitcount`, Projectile `GetHitVar`, guard slide-stop/control, and guard timing/velocity/cornerpush gates remain required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-projtime-same-id-last-contact.json` checksum `fb4c2450` proves bounded player-owned same-ID `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` guard-then-hit last-contact-kind arbitration. Two Projectiles share id `8915`; guarded contact happens first, hit happens later, and owner `200 -> 380 -> 381` requires fixed-id plus ID `0` hit/contact time reads while fixed-id plus ID `0` guarded time reads are inactive. Forbidden state `382` proves stale same-id guarded time does not survive. The gate retains two Projectile payloads/lifecycle rows, owner target-link id `8915`, guard package `S6,28` / `F7035` / `sparkxy = 29,-71`, hit package `S5,29` / `F7035` / `sparkxy = 30,-72`, and that checkpoint passed 436/436 artifacts, 406 required and 30 optional. This remains required as the guard-then-hit half of the same-id pair; exact Proj*Time tick order/lifetime, helper Projectile/custom-state persistence breadth, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, score movement, visual/audio parity beyond bounded packages, and full Projectile parity remain blocked. Previous multi-id Proj*Time, multi-id ProjHit/ProjGuarded, multi-id ProjContact, any-id ProjContact, any-id ProjHit/ProjGuarded, fixed-id ProjHit/ProjGuarded, player/helper Projectile `ProjContact` state-transition, Projectile `hitcount`, Projectile `GetHitVar`, guard slide-stop/control, and guard timing/velocity/cornerpush gates remain required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-projhittime-multi-id.json` checksum `5d897825`, `synthetic-imported-projectile-projcontacttime-multi-id.json` checksum `d9b3cecf`, and `synthetic-imported-projectile-projguardedtime-multi-id.json` checksum `e52d0d01` prove bounded player-owned Projectile `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` multi-id arbitration. The routes spawn wrong-id/non-contact Projectile ids `8909` / `8911` / `8913` and valid hit/contact/guard Projectile ids `8910` / `8912` / `8914`; owner `200 -> 371 -> 372`, `200 -> 374 -> 375`, and `200 -> 377 -> 378` require fixed-id plus ID `0` time reads, while forbidden states `373` / `376` / `379` prove wrong ids do not route. They retain two Projectile payloads, owner target-link ids `8910` / `8912` / `8914`, hit/guard sounds, and FightFX package telemetry. That checkpoint passed 435/435 artifacts, 405 required and 30 optional. This is bounded two-projectile Proj*Time arbitration evidence only; exact Proj*Time tick order/lifetime, same-ID selection priority, helper Projectile/custom-state persistence breadth, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, score movement, visual/audio parity beyond bounded packages, and full Projectile parity remain blocked. Previous multi-id ProjHit/ProjGuarded, multi-id ProjContact, any-id ProjContact, any-id ProjHit/ProjGuarded, fixed-id ProjHit/ProjGuarded, player Projectile `ProjContact` fixed-id suffix/state-transition, helper Projectile `ProjContact` state-transition, Projectile `hitcount`, Projectile `GetHitVar(hitcount)`, Projectile `hitid/chainid`, Projectile `damage/hittime/xvel/yvel`, guard slide-stop/control, default `guard.hittime/slidetime/ctrltime`, default `guard.velocity`, default/explicit `guard.cornerpush.veloff`, and default/explicit `down.cornerpush.veloff` gates remain required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-projhit-multi-id.json` checksum `ab0f3fb3` and `synthetic-imported-projectile-projguarded-multi-id.json` checksum `023921e3` prove bounded player-owned Projectile `ProjHit` / `ProjGuarded` multi-id arbitration. That checkpoint passed 432/432 artifacts, 402 required and 30 optional, and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-gethitvar-hitid-chainid.json` trace checksum `4356b5cb` / final checksum `4b270d45` and upgraded `synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json` trace checksum `616e0b2c` / final checksum `0aebcc73` prove bounded player-owned and helper-parented/root-owned Projectile normal-hit `GetHitVar(hitid/chainid)` metadata, with player/helper typed `audio:playsnd`, `S5,46/S5,41`, and FightFX `F7002` package telemetry. That checkpoint remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-gethitvar-hit-metadata.json` trace checksum `8e5df79b` / final checksum `4d078c5d` and upgraded `synthetic-imported-helper-projectile-gethitvar-hit-metadata.json` trace checksum `28afbcea` / final checksum `c960b1cf` prove bounded player-owned and helper-parented/root-owned Projectile normal-hit `GetHitVar(damage/hittime/xvel/yvel)` metadata, with player/helper typed `audio:playsnd`, `S5,45/S5,40`, and FightFX `F7002` package telemetry. That checkpoint remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-guard-slide-stop.json` trace checksum `965c2d12` / final checksum `0973a73c` and `synthetic-imported-helper-projectile-guard-slide-stop.json` trace checksum `6c42a378` / final checksum `df8b7a42` extend the existing direct `synthetic-imported-default-guard-slide-stop.json` proof to player-owned `Projectile` and helper-parented `Projectile` stand-guard routes. That checkpoint passed 405/405 artifacts, 375 required and 30 optional, and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-guard-velocity-default.json` trace checksum `e6bd9b40`, `synthetic-imported-projectile-guard-velocity-default.json` trace checksum `b72451a4`, and `synthetic-imported-helper-projectile-guard-velocity-default.json` trace checksum `2067ba99` prove official default `guard.velocity` derivation. That checkpoint passed 400/400 artifacts, 370 required and 30 optional, and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-air-hit-cornerpush-default.json` trace checksum `73129a04`, `synthetic-imported-projectile-air-hit-cornerpush-default.json` trace checksum `9bfae4d6`, and `synthetic-imported-helper-projectile-air-hit-cornerpush-default.json` trace checksum `9c81047d` prove bounded default `air.cornerpush.veloff` derivation for direct `HitDef`, player-owned `Projectile`, and helper-parented `Projectile` air-hit routes. That checkpoint passed 388/388 artifacts, 358 required and 30 optional, and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-air-guard-cornerpush-default.json` trace checksum `c32781ad`, `synthetic-imported-projectile-air-guard-cornerpush-default.json` trace checksum `90f5e385`, and `synthetic-imported-helper-projectile-air-guard-cornerpush-default.json` trace checksum `0271a2b9` prove bounded default `airguard.cornerpush.veloff` support. That `pnpm qa:trace` pass was 385/385 artifacts, 355 required and 30 optional, and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-air-guard-cornerpush.json` trace checksum `9fdb8a81`, `synthetic-imported-projectile-air-guard-cornerpush.json` trace checksum `15f26082`, and `synthetic-imported-helper-projectile-air-guard-cornerpush.json` trace checksum `35d7148b` prove bounded explicit `airguard.cornerpush.veloff` support. That `pnpm qa:trace` pass was 382/382 artifacts, 352 required and 30 optional, and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-air-guard-velocity-default.json` trace checksum `b1710269`, `synthetic-imported-projectile-air-guard-velocity-default.json` trace checksum `bd1a774e`, and `synthetic-imported-helper-projectile-air-guard-velocity-default.json` trace checksum `3351e770` prove bounded official default `airguard.velocity` derivation for direct `HitDef`, player-owned `Projectile`, and helper-parented `Projectile` guard routes. That `pnpm qa:trace` pass was 379/379 artifacts, 349 required and 30 optional, and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-air-guard-velocity.json` trace checksum `5ebc1e7b`, `synthetic-imported-projectile-air-guard-velocity.json` trace checksum `0094c369`, and `synthetic-imported-helper-projectile-air-guard-velocity.json` trace checksum `b547dfb3` prove bounded explicit `airguard.velocity = 8,-4` support. That `pnpm qa:trace` pass was 376/376 artifacts, 346 required and 30 optional, and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-hitoverride-guardflag-forceair-forceguard-keepstate.json` trace checksum `35fa8224`, `synthetic-imported-projectile-hitoverride-guardflag-forceair-forceguard-keepstate.json` trace checksum `1fd6c321`, and `synthetic-imported-helper-projectile-hitoverride-guardflag-forceair-forceguard-keepstate.json` trace checksum `7efa40bb` prove bounded `guardflag` / `guardflag.not` filtering before selected-slot `forceair` / `forceguard` / `keepstate` application. That `pnpm qa:trace` pass was 373/373 artifacts, 343 required and 30 optional, and remains required.

Previous closed R1 runtime checkpoint: required `synthetic-imported-hitoverride-missonoverride-default-guardflag-filter.json` trace checksum `05725ecb`, `synthetic-imported-projectile-hitoverride-missonoverride-default-guardflag-filter.json` trace checksum `c1402d31`, and `synthetic-imported-helper-projectile-hitoverride-missonoverride-default-guardflag-filter.json` trace checksum `889d77c1` prove bounded default `missonoverride = -1` custom-state HitOverride guardflag filtering. Direct `HitDef` with `p2stateno = 888` omits `missonoverride`, carries `guardflag = H`, and rejects before target memory, override state entry, owner-backed custom-state `888`, default get-hit, or guard states. Player-owned Projectile id `77` and helper-parented Projectile id `8882` omit `missonoverride`, use `p2stateno = 889` / `p2getp1state = 1` / `guardflag = H`, skip slots `1 -> 776` and `2 -> 778`, select slot `5 -> 779`, suppress Projectile custom-state `889`, and end P2 in state/action `779`, life `1000`, moveType `I`. The helper route also records owner/helper target links, helper payload `targetCount = 1`, projectile payload `hasHit = true` / `hitsRemaining = 0`, and suppresses helper branch `1293`. That `pnpm qa:trace` pass was 370/370 artifacts, 340 required and 30 optional. This is bounded direct/player/helper default custom-state guardflag-filter evidence only; exact guard timing/guarded contact semantics, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full HitOverride/custom-state parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-hitoverride-missonoverride-zero-guardflag-filter.json` trace checksum `058b335f`, `synthetic-imported-projectile-hitoverride-missonoverride-zero-guardflag-filter.json` trace checksum `af29f125`, and `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-guardflag-filter.json` trace checksum `9edbf3d0` prove bounded explicit `missonoverride = 0` custom-state HitOverride guardflag filtering. Direct `HitDef`, player-owned Projectile id `77`, and helper-parented Projectile id `8881` all use `guardflag = H`; P2 installs slots `1 -> 776` with `guardflag.not = HA`, `2 -> 778` with `guardflag = A`, and `5 -> 779` with `guardflag = H`; all three routes skip slots `1` and `2`, select slot `5`, suppress the custom state, and end P2 in state/action `779`, life `1000`, moveType `I`. The helper route also records owner/helper target links, helper payload `targetCount = 1`, projectile payload `hasHit = true` / `hitsRemaining = 0`, and suppresses helper branch `1291`. That `pnpm qa:trace` pass was 367/367 artifacts, 337 required and 30 optional. This is bounded direct/player/helper explicit `missonoverride = 0` custom-state guardflag-filter evidence only; exact guard timing/guarded contact semantics, forceair/forceguard priority combinations, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full HitOverride/custom-state parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-slot-priority.json` trace checksum `9a5a149f` and `synthetic-imported-projectile-hitoverride-missonoverride-zero-slot-priority.json` trace checksum `96b6b7de` prove bounded Projectile explicit `missonoverride = 0` custom-state HitOverride slot priority. Player-owned Projectile id `77` and helper-parented Projectile id `8878` both declare `p2stateno = 889`, `p2getp1state = 1`, and `missonoverride = 0`; P2 installs matching slots `5 -> 779` and `2 -> 778`; both routes select slot `2`, consume/remove the projectile, emit override telemetry, suppress projectile custom state `889`, forbid default get-hit/guard states, and end P2 in state/action `778`, life `1000`, moveType `I`. The helper route also records owner/helper target links, helper payload `targetCount = 1`, projectile payload `hasHit = true` / `hitsRemaining = 0`, and suppresses helper `ProjHit` branch `1288`. That `pnpm qa:trace` pass was 364/364 artifacts, 334 required and 30 optional. This is bounded player-owned/helper-parented Projectile explicit custom-state slot-priority evidence only; custom-state guardflag breadth beyond the latest explicit route, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full Projectile HitOverride/custom-state parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json` trace checksum `fb964bfb` proves bounded helper-parented Projectile default `missonoverride = -1` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. A visual Helper spawns owner-side Projectile id `8877` with `parentId = p1-helper-0`, `p2stateno = 889`, `p2getp1state = 1`, and omitted `missonoverride`; P2 installs slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records owner target link `p1 -> p2 / 8877` plus helper target link `p1-helper-0 -> p2 / 8877`, consumes/removes the projectile, selects slot `3`, emits override telemetry, records helper payload `targetCount = 1`, records projectile payload `hasHit = true` / `hitsRemaining = 0`, observes P2 actor-frame evidence with `stateType = A`, `physics = A`, and `guardingFrames >= 1`, avoids state `780`, suppresses projectile custom state `889` and helper `ProjHit` branch `1286`, and ends with P2 in state/action `0`, life `1000`, moveType `I`. That `pnpm qa:trace` pass was 362/362 artifacts, 332 required and 30 optional. This is one bounded helper-parented Projectile default `missonoverride = -1` custom-state route only; custom-state guardflag inheritance/timing, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full helper Projectile HitOverride/custom-state parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json` trace checksum `4ce42cf3` proves bounded player-owned Projectile default `missonoverride = -1` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. P1 Projectile id `77` declares `p2stateno = 889` and `p2getp1state = 1` while omitting `missonoverride`; P2 installs slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records target link `p1 -> p2 / 77`, consumes/removes the projectile, selects slot `3`, emits override telemetry, observes P2 actor-frame evidence with `stateType = A`, `physics = A`, and `guardingFrames >= 1`, avoids state `780`, suppresses projectile custom state `889`, and ends with P2 in state/action `0`, life `1000`, moveType `I`. That `pnpm qa:trace` pass was 361/361 artifacts, 331 required and 30 optional. This is one bounded player-owned Projectile default `missonoverride = -1` custom-state route only; custom-state guardflag inheritance/timing, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full Projectile HitOverride/custom-state parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json` trace checksum `20e40425` proves bounded direct-HitDef default `missonoverride = -1` custom-state `HitOverride forceair` / `forceguard` / `keepstate` miss behavior. P1 direct `HitDef` declares `p2stateno = 888` and `p2getp1state = 1` while omitting `missonoverride`; P2 installs slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact rejects before target memory, damage, guard, forceair/forceguard actor frames, keepstate redirect handling, override state `780`, owner-backed custom state `888`, default get-hit state `5000`, or guard states `150`/`151`; no target links are recorded; final P2 stays state/action `0`, life `1000`, ctrl true, moveType `I`. That `pnpm qa:trace` pass was 360/360 artifacts, 330 required and 30 optional. This is one bounded direct default custom-state miss route only; custom-state guardflag inheritance/timing, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full HitOverride/custom-state parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` trace checksum `e23a33af` proves bounded helper-parented Projectile explicit `missonoverride = 0` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. A visual Helper spawns owner-side Projectile id `8876` with `parentId = p1-helper-0`, `p2stateno = 889`, `p2getp1state = 1`, and `missonoverride = 0`; P2 installs slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records owner target link `p1 -> p2 / 8876` plus helper target link `p1-helper-0 -> p2 / 8876`, consumes/removes the projectile, selects slot `3`, emits override telemetry, records helper payload `targetCount = 1` plus projectile payload `hasHit = true` / `hitsRemaining = 0`, observes P2 actor-frame evidence with `stateType = A`, `physics = A`, and `guardingFrames >= 1`, avoids state `780`, suppresses projectile custom state `889` and helper `ProjHit` branch `1284`, and ends with P2 in state/action `0`, life `1000`, moveType `I`. That `pnpm qa:trace` pass was 359/359 artifacts, 329 required and 30 optional. This is one bounded helper-parented Projectile explicit `missonoverride = 0` custom-state forceair/forceguard/keepstate route only; helper-parented Projectile default `missonoverride` custom-state force flag breadth, custom-state guardflag inheritance/timing, final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full helper Projectile HitOverride/custom-state parity remain blocked. Previous closed R1 player/direct/helper forceair/forceguard/keepstate, helper/player/direct guardflag, HitOverride slot-priority, and `missonoverride` checkpoints remain required below.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` trace checksum `15bc955b` proves bounded player-owned Projectile explicit `missonoverride = 0` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. This remains required for player-owned Projectile explicit `missonoverride = 0` custom-state force flags only; helper-parented Projectile default `missonoverride` breadth and full Projectile HitOverride/custom-state parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` trace checksum `4d9043a5` proves bounded direct-HitDef explicit `missonoverride = 0` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. This remains required for direct custom-state force flags only; helper/projectile breadth and full HitOverride/custom-state parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-forceair-forceguard-keepstate.json` trace checksum `84dc3969` proves bounded helper-parented Projectile `HitOverride forceair` / `forceguard` / `keepstate` behavior. A visual Helper spawns owner-side Projectile id `8875` with `parentId = p1-helper-0`, `p2stateno = 889`, and `p2getp1state = 0`; P2 installs slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records owner target link `p1 -> p2 / 8875` plus helper target link `p1-helper-0 -> p2 / 8875`, selects slot `3`, emits override telemetry, records projectile payload evidence with `hasHit = true` / `hitsRemaining = 0`, observes P2 actor-frame evidence with `stateType = A`, `physics = A`, and `guardingFrames >= 1`, avoids state `780`, projectile custom state `889`, and helper `ProjHit` branch `1282`, and ends with P2 in state/action `0`, life `1000`, moveType `I`. That `pnpm qa:trace` pass was 356/356 artifacts, 326 required and 30 optional. This is one bounded helper-parented Projectile forceair/forceguard/keepstate route only; final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full helper Projectile HitOverride parity remain blocked. Previous closed R1 player/direct forceair/forceguard/keepstate, helper/player/direct guardflag, HitOverride slot-priority, and `missonoverride` checkpoints remain required below.

Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-forceair-forceguard-keepstate.json` trace checksum `3806a769` proves bounded player-owned Projectile `HitOverride forceair` / `forceguard` / `keepstate` behavior. P1 fires Projectile id `77` with `p2stateno = 889` / `p2getp1state = 0`; P2 installs slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records target link `p1 -> p2 / 77`, selects slot `3`, emits override telemetry, records projectile hit/removal lifecycle evidence, observes P2 actor-frame evidence with `stateType = A`, `physics = A`, and `guardingFrames >= 1`, avoids state `780` and projectile custom state `889`, and ends with P2 in state/action `0`, life `1000`, moveType `I`. That `pnpm qa:trace` pass was 355/355 artifacts, 325 required and 30 optional. This is one bounded player-owned Projectile forceair/forceguard/keepstate route only; final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full Projectile HitOverride parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-hitoverride-forceair-forceguard-keepstate.json` trace checksum `19787fb2` proves bounded direct-HitDef `HitOverride forceair` / `forceguard` / `keepstate` behavior. P1 direct-hits with `attr = S,NA`; P2 installs slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records target link `p1 -> p2 / 77`, selects slot `3`, emits override telemetry, observes P2 actor-frame evidence with `stateType = A`, `physics = A`, and `guardingFrames >= 1`, avoids state `780`, and ends with P2 in state/action `0`, life `1000`, moveType `I`. That `pnpm qa:trace` pass was 354/354 artifacts, 324 required and 30 optional. This is one bounded direct-HitDef forceair/forceguard/keepstate route only; final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state forceair/forceguard/keepstate breadth, custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full HitOverride parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-guardflag-filter.json` trace checksum `41a87267` proves bounded helper-parented Projectile `HitOverride guardflag` / `guardflag.not` filtering before slot priority. A visual Helper spawns owner-side Projectile id `8874` with `parentId = p1-helper-0`, `guardflag = H`, `p2stateno = 889`, and `p2getp1state = 0`; P2 installs attr-matching slots `1 -> 776` with `guardflag.not = HA`, `2 -> 778` with `guardflag = A`, and `5 -> 779` with `guardflag = H`; contact records owner target link `p1 -> p2 / 8874` plus helper target link `p1-helper-0 -> p2 / 8874`, marks projectile payload `hitsRemaining = 0` / `hasHit = true`, skips slots `1` and `2`, selects slot `5`, redirects P2 through state `779`, keeps life `1000`, and forbids states `776`, `778`, `889`, `1280`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 353/353 artifacts, 323 required and 30 optional. This is one bounded helper-parented Projectile guardflag-filter route only; custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full helper Projectile/HitOverride parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-hitoverride-guardflag-filter.json` trace checksum `b88a2da3` proves bounded direct-HitDef `HitOverride guardflag` / `guardflag.not` filtering before slot priority. P1 hits with `attr = S,NA` and `guardflag = H`; P2 installs attr-matching slots `1 -> 776` with `guardflag.not = HA`, `2 -> 778` with `guardflag = A`, and `5 -> 779` with `guardflag = H`; contact records target link `p1 -> p2 / 77`, skips slots `1` and `2`, selects slot `5`, redirects P2 through state `779`, keeps life `1000`, and forbids states `776`, `778`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 351/351 artifacts, 321 required and 30 optional. This is one bounded direct-HitDef guardflag-filter route only; custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full HitOverride parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-hitoverride-missonoverride-zero-slot-priority.json` trace checksum `92fefd6a` proves bounded direct-HitDef `missonoverride = 0` custom-state HitOverride slot-priority routing. P1 declares `p2stateno = 888`, `p2getp1state = 1`, and explicit `missonoverride = 0`; P2 installs matching `HitOverride` slot `5 -> 779` and slot `2 -> 778` in high-to-low controller order; contact records target link `p1 -> p2 / 77`, selects slot `2`, redirects P2 through state `778`, keeps life `1000`, and forbids state `779`, owner-backed custom state `888`, and default Common1 states `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 350/350 artifacts, 320 required and 30 optional. This is one bounded direct-HitDef `missonoverride = 0` slot-priority route only; helper/projectile custom-state slot-priority breadth, broader `missonoverride` custom-state breadth, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full HitOverride parity remain blocked. Previous closed R1 runtime checkpoints for helper-parented Projectile, player-owned Projectile, and direct-HitDef slot priority remain required below.

Previous closed R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-slot-priority.json` trace checksum `1d058518` proves bounded helper-parented Projectile HitOverride slot-priority routing. A visual Helper spawns Projectile id `8873` with `parentId = p1-helper-0`, `p2stateno = 889`, and `p2getp1state = 0`; P2 installs matching `HitOverride` slot `5 -> 779` and slot `2 -> 778` in high-to-low controller order; contact records owner target link `p1 -> p2 / 8873` plus helper target link `p1-helper-0 -> p2 / 8873`, marks projectile payload `hitsRemaining = 0` / `hasHit = true`, selects slot `2`, redirects P2 through state `778`, keeps life `1000`, and forbids state `779`, projectile custom state `889`, helper `ProjHit` branch `1278`, and default Common1 states `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 349/349 artifacts, 319 required and 30 optional. This is one bounded helper-parented Projectile slot-priority route only; custom-state slot-priority breadth, broader `missonoverride` custom-state breadth, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, teams/simul, and full Projectile/HitOverride parity remain blocked. Previous closed R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-slot-priority.json` checksum `378d9ce8` remains required for bounded player-owned Projectile HitOverride slot-priority routing; required `synthetic-imported-hitoverride-slot-priority.json` checksum `8de62354` remains required for bounded direct-HitDef HitOverride slot-priority routing; required `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero.json` checksum `62d7d6b8` remains required for bounded helper-parented Projectile `missonoverride = 0` HitOverride redirect routing; required `synthetic-imported-projectile-hitoverride-missonoverride-zero.json` checksum `5c12f3cc` remains required for bounded player-owned Projectile `missonoverride = 0` HitOverride redirect routing; required `synthetic-imported-helper-projectile-hitoverride-missonoverride-one.json` trace checksum `a99979bb` remains required for bounded helper-parented Projectile `missonoverride = 1` HitOverride miss routing; required `synthetic-imported-projectile-hitoverride-missonoverride-one.json` checksum `2dc86467` remains required for bounded player-owned Projectile `missonoverride = 1` HitOverride miss routing; required `synthetic-imported-helper-projectile-hitoverride-p2stateno.json` trace checksum `ce4c1d9a` remains required for bounded helper-parented Projectile `p2stateno` HitOverride routing; required `synthetic-imported-projectile-hitoverride-p2stateno.json` trace checksum `2ec0725a` remains required for bounded IKEMEN-style player-owned Projectile `p2stateno` HitOverride routing; required `synthetic-imported-hitoverride-p2getp1state-zero-miss.json` trace checksum `656730c8` remains required for bounded IKEMEN direct `HitDef p2stateno` / `p2getp1state = 0` HitOverride miss routing; required `synthetic-imported-hitoverride-missonoverride-one.json` checksum `78cfedf4` remains required for bounded IKEMEN `missonoverride = 1` HitOverride miss routing; required `synthetic-imported-hitoverride-missonoverride-zero.json` checksum `8ffd5678` remains required for bounded IKEMEN `missonoverride = 0` HitOverride redirect routing; required `synthetic-imported-hitoverride-p2stateno-miss.json` checksum `6f41eeb1` remains required for default direct-HitDef custom-state HitOverride miss routing; required `synthetic-imported-p2stateno-guard-ignored.json` checksum `76d1becd` remains required for direct-HitDef successful-guard `p2stateno` ignore routing; required `synthetic-imported-custom-state-gethitvar-guard-kill.json` checksum `c889a534` remains required for direct-HitDef custom-state guard `GetHitVar(kill)` routing through `888 -> 904`; required `synthetic-imported-helper-projectile-gethitvar-guard-kill.json` checksum `7f9aa699` remains required for helper-parented Projectile guard `GetHitVar(kill)` routing through `150 -> 151 -> 334`; required `synthetic-imported-projectile-gethitvar-guard-kill.json` checksum `3feae5a7` remains required for player-owned Projectile guard `GetHitVar(kill)` routing through `150 -> 151 -> 333`; required `synthetic-imported-gethitvar-air-guard-kill.json` checksum `4382207e` remains required for air guard `GetHitVar(kill)` routing through `154 -> 155 -> 332`; required `synthetic-imported-gethitvar-crouch-guard-kill.json` checksum `2976fb8c` remains required for crouch guard `GetHitVar(kill)` routing through `152 -> 153 -> 331`; required `synthetic-imported-gethitvar-guard-kill.json` checksum `abb4e468` remains required for stand guard `GetHitVar(kill)` routing through `150 -> 151 -> 330`; required `synthetic-imported-gethitvar-kill.json` checksum `ef5ffabf` remains required for normal-hit `GetHitVar(kill)` routing through `5000 -> 329`.
Previous closed R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-guard-timing.json` trace checksum `ba77beec` proves bounded owner-backed custom-state `GetHitVar(slidetime/ctrltime)` guard timing routing. Guarded direct `HitDef` target memory feeds owner-local `TargetState`, P2 enters P1-owned state data, then `GetHitVar(guarded) = 1 && GetHitVar(slidetime) = 5 && GetHitVar(ctrltime) = 7 && GetHitVar(hitshaketime) > 0` branches into state/action `901` before `SelfState` returns to state `0`/control. That `pnpm qa:trace` pass was 326/326 artifacts, 296 required and 30 optional. This is one bounded guarded target-memory-to-custom-state timing route only; `p2stateno`-on-guard behavior, exact guard timing, throws, helper/root/parent redirects, score movement, teams/simul, and full custom-state/get-hit parity remain blocked.
Previous closed R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-hitcount-hitid-chainid.json` trace checksum `250f77c2` proves bounded owner-backed custom-state `GetHitVar(hitcount/hitid/chainid)` routing. Direct `HitDef id = 77, chainID = 43, numhits = 3` routes P2 through `p2stateno = 888` / `p2getp1state = 1` into P1-owned state data, then `GetHitVar(hitcount/hitid/chainid)` branches into state/action `900` before `SelfState`. That `pnpm qa:trace` pass was 325/325 artifacts, 295 required and 30 optional. This is one bounded direct-HitDef metadata inheritance route only; exact combo accumulation, chain-hit eligibility arbitration, helper/projectile inheritance, exact target lifetime, score movement, teams/simul, and full custom-state/get-hit parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-gethitvar-fallcount.json` trace checksum `c391d938` proves bounded owner-backed state-`5100` `GetHitVar(fallcount)` routing. A fall `HitDef` routes P2 into state `5100`, `HitFallDamage` records one Common1-style ground-impact count and consumes stored `fall.damage`, then `GetHitVar(fallcount) = 1 && GetHitVar(fall.damage) = 0` branches into state/action `328`. That `pnpm qa:trace` pass was 324/324 artifacts, 294 required and 30 optional. This is one bounded ground-impact count only; exact multi-ground-hit combo accumulation, lifetime/reset parity, non-Common1 impact detection, score movement, helper/projectile/custom-state inheritance, and full fall/get-hit parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-snap.json` trace checksum `ce4680b9` proves bounded owner-backed custom-state `GetHitVar(xoff/yoff/zoff)` snap-offset metadata inheritance. Direct `HitDef p2stateno = 888, snap = 16,-24` stores bounded snap metadata, routes P2 into P1-owned state `888`, branches to state/action `899` through `GetHitVar(xoff) = 16 && GetHitVar(yoff) = -24 && GetHitVar(zoff) = 0`, preserves actor-frame `customOwnerId = p1`, and returns through `SelfState`. That `pnpm qa:trace` pass was 323/323 artifacts, 293 required and 30 optional. This is bounded p2stateno custom-state snap metadata inheritance only; exact throw positioning, z-axis support, guard snap behavior, helper/projectile inheritance breadth, teams/simul, visual/audio parity, score movement, and full throw/get-hit parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-gethitvar-snap.json` trace checksum `312a53fc` proves bounded owner-backed get-hit `GetHitVar(xoff/yoff/zoff)` snap-offset metadata. Direct `HitDef snap = 16,-24` stores bounded snap metadata, applies simple attacker-relative direct-contact positioning, P2 enters owner-backed state `5100`, and routes to state/action `288` through `GetHitVar(xoff) = 16 && GetHitVar(yoff) = -24 && GetHitVar(zoff) = 0`. That `pnpm qa:trace` pass was 322/322 artifacts, 292 required and 30 optional. This is bounded direct-HitDef snap metadata and simple positioning only; exact throw positioning, z-axis support, guard snap behavior, helper/projectile/custom-state inheritance breadth, teams/simul, visual/audio parity, score movement, and full throw/get-hit parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-gethitvar-hitcount.json` trace checksum `a4685842` proves bounded defender-owned normal get-hit `GetHitVar(hitcount)` metadata. Direct `HitDef numhits = 3` stores bounded hit-count metadata, P2 enters defender-owned state `5000`, and routes to state/action `327` through `GetHitVar(hitcount) = 3 && !GetHitVar(guarded)`. That `pnpm qa:trace` pass was 321/321 artifacts, 291 required and 30 optional. This is bounded direct-HitDef numhits metadata only; exact combo accumulation, multi-hit timing, helper/projectile/custom-state inheritance breadth, teams/simul, exact target lifetime/tick order, visual/audio parity, score movement, and full get-hit parity remain blocked.

Previous closed R1 runtime checkpoint: required `synthetic-imported-gethitvar-hitid-chainid.json` trace checksum `18df99ed` proves bounded defender-owned normal get-hit `GetHitVar(hitid)` / `GetHitVar(chainid)` metadata. Direct `HitDef id = 77, chainID = 43` records target memory, P2 enters defender-owned state `5000`, and routes to state/action `326` through `GetHitVar(hitid) = 77 && GetHitVar(chainid) = 43 && !GetHitVar(guarded)`. That `pnpm qa:trace` pass was 320/320 artifacts, 290 required and 30 optional. This is bounded direct-HitDef id/chainID metadata only; exact chain-hit eligibility arbitration, helper/projectile/custom-state inheritance breadth, teams/simul, exact target lifetime/tick order, visual/audio parity, score movement, and full get-hit parity remain blocked.

Current closed R1 helper/controller checkpoint: required `synthetic-imported-helper-controller-param-parentroot.json` trace checksum `94919326` proves bounded helper-local dynamic controller-param `Parent` / `Root` redirect evaluation with typed `kinematic:velset` telemetry. A first-generation visual Helper executes `VelSet x = Parent,Life - 995` / `y = Root,StateNo - 203`, reaches actor-frame velocity `5,-3`, and routes to state/action `1401` / anim `941`. This is bounded helper-local dynamic `VelSet` typed telemetry only; nested helper ancestry where root differs from parent, helper-spawned helpers, player `Parent` controller-param redirects, helper-local dynamic typed lowering beyond this route, recursive redirection, debug warning text, teams/simul, helper-owned controller breadth, visual/audio parity, score movement, and full helper/controller expression parity remain blocked.

Previous closed R1 runtime/renderer checkpoint: required `synthetic-imported-assertspecial-helper-explod-shadow.json` trace checksum `83f61b48` proves bounded `AssertSpecial GlobalNoShadow` helper/explod shadow actor-frame evidence. The gate requires `AssertSpecial` controller evidence, typed `assertspecial` operation evidence, `Helper` controller evidence, helper/explod lifecycle evidence, final-actor `assertSpecialGlobalFlags` evidence, and actor-frame `shadowVisible=false` evidence for P1, P2, Helper, and Explod. Previous required `synthetic-imported-assertspecial-shadow-telemetry.json` trace checksum `2b9c8fac` remains the bounded player shadow renderer oracle for normalized `noshadow` and `globalnoshadow`. Previous `synthetic-imported-assertspecial-global-telemetry.json` checksum `fc793d29` remains required and proves bounded global-style telemetry for `nobardisplay`, `nobg`, `nofg`, `nokosnd`, and `nomusic`. Previous `synthetic-imported-default-liedown-fast-recovery.json` checksum `74bdac97` remains required and proves bounded positive fast lie-down recovery in Common1-style state `5110`; previous `synthetic-imported-assertspecial-nofastrecoverfromliedown.json` checksum `74bf5d85` remains required and proves bounded IKEMEN `AssertSpecial NoFastRecoverFromLieDown` suppression for that shortcut. Previous controller-param Root evidence remains active: `synthetic-imported-controller-param-root-redirect.json` checksum `1d4a73f7` proves bounded `Root, Life` / `Root, StateNo` controller-param redirect in current player `VelSet`. Previous controller-param Target evidence remains active: `synthetic-imported-controller-param-target-redirect.json` checksum `55bb7b1f` proves bounded `Target(77), Life` controller-param redirect after direct `HitDef` target memory. Previous controller-param bottom evidence remains active: `synthetic-imported-controller-param-bottom.json` checksum `28ef21ad` proves bounded missing-redirect bottom fallback to `0`. Previous IfElse-bottom evidence remains active: `synthetic-imported-target-ifelse-bottom.json` checksum `be7554d4` proves bounded `IfElse(...)` invalid-redirect branch-result isolation. Previous Cond-bottom evidence remains active: `synthetic-imported-target-cond-bottom.json` checksum `e882a2bb` proves bounded `Cond(...)` lazy branch isolation for missing `Target(999)`. Previous redirect-bottom evidence remains active: `synthetic-imported-target-redirect-bottom.json` checksum `5e50a90a` proves bounded invalid-redirect bottom propagation through `(Target(999), Life = 0) || 1`. Previous helper redirect evidence remains active: `synthetic-imported-helper-parentroot.json` checksum `5154220c` proves bounded helper-local `Parent` / `Root` redirect routing through cloned owner/root runtime state and a `1200 -> 1400` / anim `940` helper route. Previous required Common1 guard/recovery evidence remains active: `synthetic-imported-assertspecial-nogetupfromliedown.json` checksum `4c3b6281`, `synthetic-imported-air-guard-landing.json` checksum `d6986d7f`, optional `kfm-official-default-air-guard-state.json` checksum `62367dac`, `synthetic-imported-crouch-guard-hold-crouch-return.json` checksum `83ecb699`, `synthetic-imported-default-guard-hold-walk-return.json` checksum `75d4db9c`, and `synthetic-imported-default-fall-ground-recovery-priority.json` checksum `e83b2db7`. This is bounded shadow presentation plus bounded synthetic recovery/redirect evidence only; exact shadow skew/stage parameters, projectile shadow semantics, exact ownership beyond the current spawned helper/explod route, lifebar hiding, stage BG/FG suppression, KO sound suppression, music pause, exact global/team/helper ownership, exact mashing thresholds, player Parent controller-param redirects, dynamic-parameter typed lowering, recursive redirect evaluation, debug warning text, broad bottom/redirect parity for every controller family, team/helper-owned redirects, redirect mutation, keyctrl, public KFM support, exact guard/recovery timing, full visual/audio parity, score movement, and full controller/redirect/helper/Common1 parity remain blocked.

Latest closed R2 ownership checkpoint: `RuntimeEffectActorAdvanceWorld` owns bounded effect-actor advance ordering inside `RuntimeEffectActorWorld`: active effects advance Helpers before Projectiles, paused presentation advances Helpers before Explods, and normal presentation advances Explods without ticking Helpers. Focused `EffectActorSystem` coverage proves both order contracts. This is ownership cleanup only; no exact helper pause/combat ordering, projectile lifetime parity, remove-trigger timing, teams/simul roster ownership, visual/audio parity, score movement, or full Helper/Projectile VM parity claim.

Previous closed R2 ownership checkpoint: `RuntimeControllerExpressionContextSystem` owns the shared raw controller-number expression context used by passive/runtime controller worlds, so dynamic numeric params route through one redirect-aware helper for `Target(...)`, `Parent`, `Root`, `Const`, `HitPauseTime`, `StageTime`, and `GetHitVar` reads. Focused coverage proves redirect-aware numeric evaluation plus helper/team metadata forwarding. This is ownership cleanup only; no new expression language support, no `ID`/player unique-id semantics, recursive redirection, helper/team scope expansion, visual/audio parity, score movement, or full controller VM parity claim.

Previous closed R2 ownership checkpoint: `RuntimeFighterAdvanceHookSetWorld` owns bounded per-fighter advance hook-set construction outside `PlayableMatchRuntime`, with focused coverage proving sprite effects, hit eligibility, HitOverride ticking, contact timers, state clock, frame constraints, recovery windows, stun, move lifecycle, kinematics, animation, active controllers, recovery landing, lie-down recovery, and frozen-position preservation all forward through one named seam before `RuntimeFighterAdvanceWorld` executes. This is ownership cleanup only; no new player-advance semantics, exact MUGEN/IKEMEN tick order, persistent-controller timing, helper/team/redirect actor advance semantics, recovery/stun/physics arbitration, visual/audio parity, score movement, or full player VM parity claim.

Previous closed R2 ownership checkpoint: `RuntimeActiveExpressionContextWorld` owns bounded active CNS expression-context factory construction outside `PlayableMatchRuntime`, with focused coverage proving dynamic controller-param fallback and trigger evaluation share stage bounds/time, owner const routing, runtime RNG, animation timing callbacks, and `InGuardDist` through one named seam before expression evaluation. This is ownership cleanup only; no new expression semantics, exact CNS VM timing, helper/team/redirect expansion, exact `InGuardDist` parity, deterministic MUGEN/IKEMEN RNG stream parity, visual/audio parity, score movement, or full expression/trigger VM parity claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchPausedBridgeWorld` owns the bounded match-level bridge into `RuntimePausedMatchWorld.advanceRuntime(...)` outside `PlayableMatchRuntime`, with focused coverage proving pause snapshot lookup, source-movetime eligibility, pause tick mutation, hitpause-style command buffering, stage/time metadata, world forwarding, and paused player/AI/fighter callback forwarding before paused-match ordering runs. This is ownership cleanup only; no new Pause/SuperPause semantics, exact pause layering, helper/team/redirect pause ownership, pause/hitpause command parity, visual/audio parity, score movement, or full paused-match VM parity claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchPreFacingAssertSpecialWorld` owns the bounded pre-facing imported `AssertSpecial` trigger/dispatch context bridge outside `PlayableMatchRuntime`, with focused coverage proving stage-bound trigger handoff and controller execution context forwarding for owner constants, actor hitpause, actor random, stage bounds, and stage time before auto-facing. This is ownership cleanup only; no new `AssertSpecial` flags, exact lifetime/global/team/helper ownership, pause/hitpause parity, visual/audio parity, score movement, or full match-frame VM parity claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchActorRosterWorld` owns bounded current P1/P2 actor roster projection for `PlayableMatchRuntime`, with focused coverage proving stable order, live refs, id lookup, mirrored one-on-one opponent projection, fail-closed unknown actors, and match-runtime snapshot/effect compatibility preservation. This is ownership cleanup only; no real teams/simul roster ownership, helper-owned actor discovery, dynamic roster mutation, richer identity metadata, exact VM scheduling, visual/audio parity, score movement, or full actor-registry parity claim.

Latest closed R1 palette/presentation checkpoint: first-pass ACT + indexed SFF `RemapPal` texture handoff is implemented with focused parser/provider/renderer/loader/report evidence: DEF `pal1..pal12` ACT refs load into character palettes, indexed SFF sprites preserve source pixels/palettes, `SffSpriteProvider` rebuilds decoded indexed canvases from loaded ACT destination palettes, `CharacterRenderer` forwards runtime `paletteRemap`, and `CompatibilityReport.palettes` reports palette coverage. The required palette trace oracle remains `synthetic-imported-palfx-remappal.json` checksum `ba5fc1e6`, proving bounded same-actor imported `PalFX` + `RemapPal` execution lowers into typed `sprite-effect:palfx` / `sprite-effect:remappal` operation evidence and reaches combined actor-frame palette telemetry. This is bounded indexed pixel handoff plus palette telemetry only; no exact source-bank semantics, truecolor/PNG remap, exact palette math, `sinadd`, blend order, renderer parity, visual parity, score movement, or full presentation parity claim. Previous R1 presentation checkpoint: `synthetic-imported-envcolor-under.json` checksum `0a7b5c96` remains required for bounded imported `EnvColor under = 1`; `synthetic-imported-envcolor.json` checksum `956b0f4b` remains the `under = 0` route.

Latest closed R1 audio diagnostic checkpoint: `synthetic-imported-helper-projectile-guard-ko.json` trace checksum `05dbcded` / final checksum `98b8bf17`, `synthetic-imported-helper-projectile-guard-kill.json` trace checksum `33930a00` / final checksum `8412e638`, and `synthetic-imported-helper-projectile-guard-terminal.json` trace checksum `c6937f42` / final checksum `e0835e33` are required in `pnpm qa:trace` and prove bounded first-generation helper-parented/root-owned Projectile guard-contact sounds resolve into typed `audio:playsnd` operation telemetry while preserving sound-event and FightFX package metadata. Previous `synthetic-imported-projectile-contact.json` trace checksum `57b3b556` / final checksum `e0f3e41c`, `synthetic-imported-projectile-guard.json` trace checksum `eb9c2e58` / final checksum `b1c74e5e`, `synthetic-imported-hitdef-dynamic-hitsound.json` checksum `fe3c0f3d` / final checksum `855df386`, `synthetic-imported-hitdef-dynamic-guardsound.json` checksum `bb38362a` / final checksum `3e0ddeb0`, `synthetic-imported-superpause-sound.json` checksum `3e19cb86` / final checksum `c5fb9428`, `synthetic-imported-sound-dynamic-pan.json` checksum `879afcf4` / final checksum `b780e5e9`, and `synthetic-imported-sound-dynamic-value.json` checksum `bcdafe32` / final checksum `31b8a7b3` remain required for bounded imported player-owned Projectile, direct HitDef, SuperPause, and active-state dynamic audio typed telemetry. Previous `synthetic-imported-sound.json` checksum `cc9c8c49` remains required for static `PlaySnd` / `SndPan` / `StopSnd` typed-operation metadata including `abspan = -64`, `legacyVolume`, `lowPriority`, `volumeScale`, `freqMul`, `loop`, and `pan`. Playback still ignores legacy `volume` gain and uses bounded pan math. This is bounded Projectile/contact sound typed telemetry plus active-state dynamic audio, SuperPause, and direct HitDef contact sound typed telemetry only; no helper Projectile normal-hit sound claim, exact panning semantics, pre-RC8 legacy volume gain semantics, exact priority classes, global channel fallback, super-background audio, timing/mixing, visual/audio parity, score movement, or full audio parity claim.

Previous closed R2 ownership checkpoint: `RuntimeActiveControllerTelemetryWorld` owns bounded active-controller telemetry hook construction outside `PlayableMatchRuntime`, with focused coverage proving controller and operation forwarding through one shared hook set for active state hooks, side-effect dispatchers, and fallback runtime-controller dispatch. This is ownership cleanup only; no exact telemetry event semantics, imported-only filtering, event retention limits, helper/team/redirect telemetry breadth, visual/debug UI parity, score movement, or full CNS VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchCombatStateHooksWorld` owns bounded combat state-hook adapter construction outside `PlayableMatchRuntime`, with focused coverage proving direct/projectile combat hooks preserve state-owner availability/entry options and helper combat hooks keep self-owned availability checks while forwarding entry options. This is ownership cleanup only; no helper-owned custom-state table breadth, throws, teams/simul actor registries, multi-target helper ownership, exact combat/helper tick order, visual/audio parity, score movement, or full combat/helper VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchOpponentContextWorld` owns bounded current 1v1 match-opponent context construction for active/pause/hitpause lifecycle bridges outside `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld`, with focused coverage for mirrored P1/P2 contexts and unknown-actor fail-closed behavior. This is ownership cleanup only; no real teams/simul roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond actor refs, exact helper lifecycle/pause/combat ordering, visual/audio parity, score movement, or full match/helper VM claim.

Previous closed R2 ownership checkpoint: `RuntimeEffectHelperContextWorld` owns bounded visual Helper lifecycle context construction outside `RuntimeEffectLifecycleWorld`, with focused coverage for nearest-order explicit opponent roster construction, explicit roster preservation, target-candidate and helper hook forwarding, and incomplete-owner fail-closed behavior. This is ownership cleanup only; no real teams/simul lifecycle roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond ids/runtime state, exact helper lifecycle/pause/combat ordering, visual/audio parity, score movement, or full Helper VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchHelperProjectileTargetWorld` owns bounded match-level helper-parented Projectile target-memory bridge wiring outside `PlayableMatchRuntime`, with focused coverage for forwarding owner, defender, projectile, and `RuntimeTargetWorld` plus owner-projectile fail-closed behavior. This is ownership cleanup only; no helper-owned Projectile contact timing, helper-owned custom-state table breadth, teams/simul actor registry, multi-target helper ownership, exact target lifetime, visual/audio parity, score movement, or full Helper/Projectile VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchHelperBindingWorld` owns bounded match-level helper callback wiring outside `PlayableMatchRuntime`, with focused coverage for owner-specific helper `TargetState` route forwarding, stale handler replacement, helper-state/owner-state Projectile telemetry attribution, and non-Projectile telemetry ignore behavior. This is ownership cleanup only; no helper custom-state table breadth, throws, teams/simul actor registry, multi-target helper ownership, exact helper TargetState/projectile timing, broad helper telemetry semantics, visual/audio parity, score movement, or full Helper VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchHelperTargetStateWorld` owns bounded match-roster target resolution for helper-owned `TargetState` entry outside `PlayableMatchRuntime`, with focused coverage for roster-backed target resolution, stale target payload isolation, missing-target no-op behavior, and owner-mismatch fail-closed behavior. This is ownership cleanup only; no helper-owned custom-state tables, throws, teams/simul actor registries, multi-target helper ownership, exact helper TargetState timing, visual/audio parity, score movement, or full Helper VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchPostFighterWorld` owns bounded normal active-match post-fighter bridge wiring outside `PlayableMatchRuntime`, with focused coverage for target memory, effect lifecycle, projectile clash, actor constraints, target bindings, direct/projectile/helper combat, clamps, and presentation effect forwarding after resolver construction. This is ownership cleanup only; no exact MUGEN/IKEMEN post-fighter tick order, combat priority parity, projectile/helper contact timing, helper/team/redirect ownership, target lifetime parity, visual/audio parity, score movement, or full match VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchInputControlWorld` owns bounded normal active-match P1/P2-controlled/simple-AI input dispatch outside `PlayableMatchRuntime`, with focused coverage for P1-before-controlled-P2 ordering, mirrored opponent arguments, and P1-before-AI fallback ordering. This is ownership cleanup only; no exact MUGEN/IKEMEN input priority, command timing, input-conflict resolution, pause/hitpause command parity, helper/team/redirect command ownership, AI parity, visual/audio parity, score movement, or full input VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchRoundWorld` owns bounded active-match round timer delegation plus finish side effects outside `PlayableMatchRuntime`, with focused coverage for timer delegation, finish stop/log mutation, and no-finish no-op behavior. This is ownership cleanup only; no exact round-flow timing, intros/winposes, KO slowdown, continue flow, teams/simul/turns, lifebar/screenpack behavior, visual/audio parity, score movement, or full round VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchFighterAdvanceWorld` owns bounded active 1v1 fighter-advance orchestration outside `PlayableMatchRuntime`, with focused coverage for normal P1/P2 ordering and pause-after-P1 skip behavior. This is ownership cleanup only; no exact player tick order, pause-start arbitration, teams/simul roster advance, helper/team/redirect actor advance semantics, guard-start parity, visual/audio parity, score movement, or full match VM claim.

Previous closed R2 ownership checkpoint: `RuntimeMatchPauseControllerWorld` owns bounded Pause/SuperPause controller result side effects outside `PlayableMatchRuntime`, with focused coverage for tick/controller/op forwarding, power-delta handoff, log emission, and zero-length no-side-effect behavior. This is ownership cleanup only; no exact pause layering, SuperPause background/effects/sound timing, helper/team/redirect pause ownership, pause/hitpause command parity, visual/audio parity, score movement, or full pause VM claim.

Previous R2 ownership checkpoint: `RuntimeMatchCombatBridgeWorld` owns bounded priority/direct/projectile/helper combat resolver construction outside `PlayableMatchRuntime`, with focused coverage for route wiring, hurtbox forwarding, projectile target-memory callback forwarding, and log forwarding. This is ownership cleanup only; no exact combat priority, helper-owned contact timing, projectile hit/cancel timing, teams/simul/multi-target breadth, visual/audio parity, score movement, or full combat VM claim.

Previous closed trace checkpoint: `synthetic-imported-helper-projcanceltime-id.json` checksum `fc412176` proves bounded helper-local `ProjCancelTime(8868)` routing after a matching helper-parented owner-side Projectile is canceled by an opposing Projectile clash, then routes the Helper from state/action `1268` into `1269` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `1008`, helper/projectile lifecycle, effect-store, and payload evidence; `pnpm qa:trace` was 251/251 artifacts, 231 required and 20 optional at that checkpoint.

Previous closed implementation checkpoint: `synthetic-imported-helper-projcanceltime-any.json` checksum `f7e7fa01` proves bounded helper-local `ProjCancelTime(0)` routing after a helper-parented owner-side Projectile is canceled by an opposing Projectile clash, then routes the Helper from state/action `1266` into `1267` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `998`, helper/projectile lifecycle, effect-store, and payload evidence.

Previous closed implementation checkpoint: `synthetic-imported-projectile-canceltime.json` checksum `64e8dec4` proves bounded owner-state `ProjCancelTime(77)` routing after that owner's player-owned Projectile is canceled by an opposing Projectile clash, then routes P2 into state/action `283` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback, projectile lifecycle, effect-store, and payload evidence.

Previous closed implementation checkpoint: `synthetic-imported-helper-projguardedtime-any.json` checksum `1f1a38e4` and `synthetic-imported-helper-projcontacttime-any.json` checksum `0d9f7829` prove bounded helper-local `ProjGuardedTime(0)` and `ProjContactTime(0)` any-projectile routing after helper-parented Projectile guard/contact markers, then route the Helper into state/actions `1263` and `1265` with guard event/reason, helper/projectile lifecycle, effect-store, target-link, and sound/FightFX package evidence.

Previous closed implementation checkpoint: `synthetic-imported-helper-projhittime-any.json` checksum `bca9f47b` proves bounded helper-local `ProjHitTime(0)` any-projectile hit-time routing after a helper-parented Projectile hit, then routes the Helper into state/action `1261` with hit event/reason, helper/projectile lifecycle, effect-store, target-link, and sound/FightFX package evidence.

Previous closed Projectile hit-time checkpoint: `synthetic-imported-projectile-hittime-any.json` checksum `47c1cf7f` proves bounded owner-state `ProjHitTime(0)` any-projectile hit-time routing after a player-owned Projectile hit, then routes P1 into state/action `282` with hit event/reason, Projectile lifecycle, effect-store, and target-link evidence.

Previous closed Projectile contact-time checkpoint: `synthetic-imported-projectile-contacttime-any.json` checksum `f1751155` remains required and proves bounded owner-state `ProjContactTime(0)` any-projectile contact-time routing after a player-owned Projectile contact, then routes P1 into state/action `281` with hit event/reason, Projectile lifecycle, effect-store, and target-link evidence.

Previous closed Projectile guarded-time checkpoint: `synthetic-imported-projectile-guardedtime-any.json` checksum `c8473340` remains required and proves bounded owner-state `ProjGuardedTime(0)` any-projectile guard-time routing after a player-owned Projectile guard, then routes P1 into state/action `279` with guard event/reason, Projectile lifecycle, effect-store, and target-link evidence.

Previous closed target-memory checkpoint: `synthetic-imported-hitdef-projectile-target-mix.json` checksum `e98d4857` remains required and proves bounded owner-local target memory can retain separate direct `HitDef` id `77` and player-owned `Projectile` id `78` in one active state, then route P1 through `NumTarget(77)`, `Target(77), Life`, `NumTarget(78)`, and `Target(78), Life` into state/action `278`.

Previous R1 trigger checkpoints include `synthetic-imported-projectile-gethitvar-guard-kill.json` checksum `3feae5a7`, `synthetic-imported-gethitvar-air-guard-kill.json` checksum `4382207e`, `synthetic-imported-gethitvar-guard-kill.json` checksum `abb4e468`, `synthetic-imported-gethitvar-kill.json` checksum `ef5ffabf`, `synthetic-imported-custom-state-gethitvar-fall-metadata.json` checksum `4a3a1c6b`, `synthetic-imported-custom-state-gethitvar-fall-envshake.json` checksum `5c9d1653`, `synthetic-imported-gethitvar-fallcount.json` checksum `c391d938`, `synthetic-imported-helper-projectile-gethitvar-air-guard-hitshaketime.json` checksum `3c3f2e25`, `synthetic-imported-projectile-gethitvar-air-guard-hitshaketime.json` checksum `3fcf1421`, `synthetic-imported-gethitvar-air-guard-hitshaketime.json` checksum `703e9328`, `synthetic-imported-gethitvar-crouch-guard-hitshaketime.json` checksum `b31d1dac`, `synthetic-imported-helper-projectile-gethitvar-guard-hitshaketime.json` checksum `64a1a8bd`, `synthetic-imported-projectile-gethitvar-guard-hitshaketime.json` checksum `724f66d6`, `synthetic-imported-gethitvar-guard-hitshaketime.json` checksum `31d76de9`, `synthetic-imported-gethitvar-hitshaketime.json` checksum `655107b9`, `synthetic-imported-gethitvar-hittime.json` checksum `a11beef0`, `synthetic-imported-gethitvar-guard-timing.json` checksum `cf92c669`, `synthetic-imported-gethitvar-down-recover.json` checksum `b8a7aef0`, `synthetic-imported-gethitvar-fall-envshake.json` checksum `6364632a`, `synthetic-imported-gethitvar-fall-metadata.json` checksum `474fa734`, `synthetic-imported-teamside.json` checksum `f55695b7`, `synthetic-imported-helper-projectile-gethitvar-guarded.json` checksum `2b413bd7`, `synthetic-imported-projectile-gethitvar-guarded.json` checksum `a0104472`, `synthetic-imported-gethitvar-guarded.json` checksum `7c36defb`, `synthetic-imported-gethitvar-fall-recover.json` checksum `259b300f`, `synthetic-imported-animelemtime.json` checksum `2036557d`, `synthetic-imported-animtime.json` checksum `9e42b546`, and `synthetic-imported-selfanimexist.json` checksum `99930032`. Latest R2 checkpoint: `RuntimeMatchEnvColorBridgeWorld` owns bounded match-level EnvColor callback handoff for active, pause, and hitpause ignored-controller routes while `PlayableMatchRuntime` still owns trigger filtering, loop ordering, stage-world lifetime, and broad presentation timing. Previous R2 checkpoint: `RuntimeFighterStateWorld` owns bounded fighter runtime-state construction while `PlayableMatchRuntime` still owns stage starts, actor ids, definitions, and injected match worlds.

Do not reselect the Helper Projectile cancel remove fallback terminal gate; `synthetic-imported-helper-projectile-cancel-remove-fallback-terminal.json` is now required in `pnpm qa:trace`.
Do not reselect the player Projectile cancel remove fallback terminal gate; `synthetic-imported-projectile-cancel-remove-fallback-terminal.json` is already required in `pnpm qa:trace`.

Do not reselect the Projectile remove hit fallback terminal gate; `synthetic-imported-projectile-remove-hit-fallback-terminal.json` is now required in `pnpm qa:trace`.

Do not reselect the Projectile remove terminal gate, Helper Projectile guard terminal gate, player Projectile guard terminal gate, ACT/SFF indexed RemapPal handoff, PalFX + RemapPal combined telemetry gate, AssertSpecial unguardable coverage hardening gate, PlaySnd abspan trace telemetry gate, PlaySnd legacy volume telemetry gate, EnvColor under-layer gate, Projectile guard kill `GetHitVar(kill)` gate, Projectile cancel-time gate, helper Projectile guard/contact-time any gates, helper Projectile hit-time any gate, Projectile guarded-time any gate, HitDef plus Projectile target-memory mix gate, air/stand guard `GetHitVar(kill)` gates, normal `GetHitVar(kill)` gate, custom-state GetHitVar fall metadata gate, custom-state GetHitVar fall envshake gate, custom-state GetHitVar guard timing gate, custom-state GetHitVar hitcount/id gate, custom-state GetHitVar yaccel gate, custom-state GetHitVar type gate, custom-state TargetBind GetHitVar isbound gate, custom-state guarded GetHitVar gate, helper Projectile air guard hitshaketime GetHitVar gate, player Projectile air guard hitshaketime GetHitVar gate, air guard hitshaketime GetHitVar gate, crouch guard hitshaketime GetHitVar gate, helper Projectile guard hitshaketime GetHitVar gate, player Projectile guard hitshaketime GetHitVar gate, direct guard hitshaketime GetHitVar gate, normal hitshaketime GetHitVar gate, normal hittime GetHitVar gate, guard timing GetHitVar gate, down-recover GetHitVar gate, fall env-shake GetHitVar gate, fall metadata GetHitVar gate, TeamSide gate, helper Projectile guarded GetHitVar gate, player Projectile guarded GetHitVar gate, direct guarded GetHitVar gate, fall-recover GetHitVar gate, full-chain fall recovery gate, AnimElemTime, AnimTime, SelfAnimExist, SelfStateNoExist, EnemyNear index, identity, fighter-state factory ownership, match reset ownership, `VarRandom`, `MakeDust`, `RuntimeFighterAdvanceHookSetWorld`, `RuntimeActiveExpressionContextWorld`, `RuntimeHelperTargetStateWorld` handler binding, `RuntimeMatchHelperBindingWorld`, `RuntimeEffectHelperContextWorld`, `RuntimeMatchPresentationSnapshotWorld`, `RuntimeActiveControllerHookSetWorld`, `RuntimeActiveControllerTelemetryWorld`, `RuntimeMatchCombatStateHooksWorld`, `RuntimeContactMemoryWorld`, `RuntimeRandomSystem`, `RuntimeExpressionContextWorld`, `RuntimeFrameWorld`, `RuntimeAfterImageSampleWorld`, `RuntimeControllerEvaluationContextWorld`, `RuntimeDispatchEvaluationWorld`, `RuntimeTriggerEvaluationWorld`, `RuntimeTriggerGateWorld`, `HitSparkAssetSystem`, `RuntimeRecoverySystem`, `BindToTarget` target-system ownership, active target-binding position ownership, `RuntimeHitEligibilityWorld`, `RuntimeStateTransitionControllerWorld`, `RuntimeAnimationControllerWorld`, `RuntimeKinematicControllerWorld`, `RuntimeBoundsControllerWorld`, `RuntimeHitFallControllerWorld`, `RuntimeStateTypeWorld`, `RuntimeDamageScaleWorld`, `RuntimeHitDefenseWorld`, `RuntimeAssertSpecialWorld`, `RuntimeSnapshotWorld` stage/camera ownership, `RuntimeSnapshotWorld` player actor projection, `RuntimeCompatibilityTelemetryWorld`, `RuntimeOrientationWorld`, `RuntimeGuardWorld`, `RuntimeGetHitStateWorld`, `RuntimeHitStateTransitionWorld`, `RuntimeStateAvailabilityWorld`, `RuntimeStunWorld`, `RuntimeStateEntryWorld`, `RuntimeResourceWorld`, `RuntimeControllerDispatchWorld`, `RuntimeStateEntrySetupWorld`, `RuntimeSpriteEffectControllerWorld`, `RuntimeTargetControllerDispatchWorld`, `RuntimeContactControllerDispatchWorld`, `RuntimeAudioControllerDispatchWorld`, `RuntimeEnvColorControllerDispatchWorld`, `RuntimeMatchEnvColorBridgeWorld`, `RuntimeEnvShakeControllerDispatchWorld`, `RuntimePauseControllerDispatchWorld`, `RuntimeActorConstraintControllerDispatchWorld`, `RuntimeFallEnvShakeControllerDispatchWorld`, `RuntimeEffectSpawnControllerDispatchWorld`, `RuntimeReversalControllerDispatchWorld`, `RuntimeHitDefControllerDispatchWorld`, `RuntimeMatchFighterAdvanceWorld`, `RuntimeMatchPauseControllerWorld`, `RuntimeMatchCombatBridgeWorld`, `RuntimeMatchRoundWorld`, `RuntimeMatchInputControlWorld`, or `RuntimeMatchPostFighterWorld` ownership as the next cut; continue into palette parity fixture/browser evidence, R1 guard/FightFX/Common1 precision, or a deeper R2 helper/effect/combat ownership seam.

## Next Useful Studio Gates

Studio should become a production workbench, not a static dashboard. Good next slices:

- One shared status contract consumed by Evidence and Build.
- One primary next action for each blocked/stale/missing/exportable row.
- Trace comparison rows that link to frame or actor evidence.
- Asset provenance record that joins source prompt, image sheet, atlas manifest, QA report, collision data, and playtest entry.
- Export readiness that refuses decorative success states when sources are missing.

## Documentation Update Matrix

Use this table when closing a slice:

| Slice type | Must update |
| --- | --- |
| Runtime support or controller semantics | `docs/SUPPORTED_FEATURES.md`, `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, relevant `.scratch/roadmap/issues/` file. |
| Trace or fixture claim | `docs/QA_AND_ACCEPTANCE_GATES.md`, `docs/FIXTURE_GOLDENS.md` if golden policy changes, relevant issue. |
| Score change | `docs/PORT_COMPLETION_SCORECARD.md`, `docs/PROGRESS_TRACKER.md`, `docs/ROADMAP_EXECUTION_BOARD.md`. |
| Studio workflow | `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, `docs/PROGRESS_TRACKER.md`, relevant issue. |
| Generated asset pipeline | `docs/GENERATED_ASSET_QA_CONTRACT.md`, `docs/ENGINE_STUDIO_ROADMAP.md`, relevant issue. |
| IKEMEN scanner | `docs/IKEMEN_GO_REFERENCE.md`, `docs/COMPATIBILITY_PROFILES.md`, `docs/SUPPORTED_FEATURES.md`, relevant issue. |
| Modular boundary | `docs/MODULE_BOUNDARY_CONTRACT.md`, `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`, relevant issue. |
| Docs/setup only | `AGENTS.md`, `docs/agents/*`, `docs/ROADMAP_NAVIGATION.md`, `docs/PROGRESS_TRACKER.md` if the navigation model changes. |

## Closeout Template

Use this exact shape for meaningful progress:

```txt
Changed:
Evidence:
Claim allowed:
Claim blocked:
Next:
```

For docs-only work, say `No score movement`.

## Stop Conditions

Pause and ask the user only when:

- a fixture or asset is required and cannot be generated or downloaded safely,
- a product decision changes the horizon or public/private boundary,
- a third-party asset would need to be committed to the repo,
- the same blocker repeats across multiple attempts and no smaller route remains.

Otherwise keep making small, verified progress.
