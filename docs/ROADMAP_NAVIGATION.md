# Roadmap Navigation

Last updated: 2026-08-11

## Current implementation route — T738 closed-bounded (2026-08-11)

T738 / [issue 312](../.scratch/roadmap/issues/312-helper-modifyhitdef-guard-velocity-yz.md)
closes Helper-owned live `ModifyHitDef guard.velocity` Y/Z replacement. Single,
pair, and triple caller-context values preserve omitted components and reach
accepted ground-guard `GetHitVar`/velocity metadata with Helper/root/parent
ownership. Trace/final checksums are `da73f66a` / `4231487d`.

## Historical implementation route — T737 closed-bounded (2026-08-11)

T737 / [issue 311](../.scratch/roadmap/issues/311-modifyhitdef-guard-velocity-yz.md)
closes live `ModifyHitDef guard.velocity` Y/Z replacement through root/RedirectID.
Single, pair, and triple caller-context values preserve omitted components and
reach accepted ground-guard `GetHitVar`/velocity metadata. Trace/final checksums
are `a2eb52db` / `f0fb19a8`.

## Historical implementation route — T736 closed-bounded (2026-08-11)

T736 / [issue 310](../.scratch/roadmap/issues/310-modifyhitdef-guardsound-channel.md)
closes live `ModifyHitDef guardsound.channel` through root/RedirectID and
Helper callers. Caller-context finite values reach typed guarded audio channel
`8`, omission/unresolved input preserves the active channel; trace/final
checksums are `a689adf2` / `d5bc517f`.

## Historical implementation route — T735 closed-bounded (2026-08-11)

T735 / [issue 309](../.scratch/roadmap/issues/309-modifyhitdef-hitsound-channel.md)
closes live `ModifyHitDef hitsound.channel` through root/RedirectID and Helper
callers. Caller-context finite values reach typed hit-audio channel `7`, with
omission/unresolved preservation; trace/final checksums are `b5f4c11e` /
`421be8fe`.

## Historical implementation route — T734 closed-bounded (2026-08-11)

T734 / [issue 308](../.scratch/roadmap/issues/308-modifyhitdef-hitsound-expressions.md)
closes live `ModifyHitDef hitsound` through root/RedirectID and Helper callers.
Caller-context static/dynamic/mixed refs retain their prefix and omission
preservation is required; the accepted hit-audio event carries typed `F6,4`
telemetry from raw `Fvar(0),var(1)` with no guard route. Trace/final checksums
are `8d56e467` / `d2d70840`.

## Next implementation route — T739 queued

T739 / [issue 313](../.scratch/roadmap/issues/313-helper-modifyhitdef-airguard-velocity-xy.md)
queues Helper-owned live `ModifyHitDef airguard.velocity` X/Y replacement with
root/parent ownership evidence and Z/omission preservation.

## Historical implementation route — T733 closed-bounded (2026-08-11)

T733 / [issue 307](../.scratch/roadmap/issues/307-modifyhitdef-guardsound-expressions.md)
closes live `ModifyHitDef guardsound` through root/RedirectID and Helper
callers. Caller-context refs retain their prefix and omission preservation
is required; the accepted guard-audio event carries typed `F6,4` telemetry from
raw `Fvar(0),var(1)` with no hit route.

## Historical implementation route — T732 closed-bounded (2026-08-11)

T732 / [issue 306](../.scratch/roadmap/issues/306-modifyhitdef-guard-sparkno-expressions.md)
closes live `ModifyHitDef guard.sparkno` through root/RedirectID and Helper
callers. Caller-context suffixes retain their prefix and omission preservation
is required; the accepted guard-effect event carries `F19` with angle/offset
unchanged and no hit route.

T729 / [issue 303](../.scratch/roadmap/issues/303-modifyhitdef-sparkxy-expressions.md)
closes live `ModifyHitDef sparkxy` X/Y replacement with omitted-axis
preservation and required offset evidence.

T728 / [issue 302](../.scratch/roadmap/issues/302-modifyhitdef-down-velocity-expressions.md)
closes live `ModifyHitDef down.velocity` X/Y replacement for root/RedirectID
and Helper callers. Omitted Y/Z components remain active and required lying
contact traces pass.

T727 / [issue 301](../.scratch/roadmap/issues/301-reversaldef-hitonce-expressions.md)
closes caller-context `hitonce` for direct/root `ReversalDef` and
root/RedirectID `ModifyReversalDef`. Zero disables the one-contact gate,
finite non-zero values enable it, live omission preserves the active value,
and explicit target memory permits distinct targets only while disabled.
Focused compiler/runtime coverage is `184/184`; resolution/helper coverage is
`78/78`; no causal end-to-end trace is promoted.

## Historical queue — T726 completed

T726 / [issue 300](../.scratch/roadmap/issues/300-reversaldef-nochainid-expressions.md)
closes typed caller-context `nochainid` lists for direct/root `ReversalDef`
and root/RedirectID `ModifyReversalDef`. Lists up to eight entries resolve
once, truncate finite values, and reject a matching non-negative incoming
`HitDef` id. Focused compiler/runtime coverage is `181/181`; no end-to-end
trace is promoted because the evidence is scheduling-isolated.

## Previous implementation route — T725 closed-bounded (2026-08-11)

T725 / [issue 299](../.scratch/roadmap/issues/299-reversaldef-chainid-expressions.md)
closes typed caller-context `chainid` for direct/root `ReversalDef` and
root/RedirectID `ModifyReversalDef`. Fresh/live values truncate finite inputs,
explicit negatives disable the requirement, and admission rejects a mismatched
latest `HitDef` id. Focused compiler/runtime coverage is `179/179`; typecheck
and diff hygiene pass. No end-to-end trace is promoted because scheduling was
not isolated.

## Previous implementation route — T724 closed-bounded (2026-08-11)

T724 / [issue 298](../.scratch/roadmap/issues/298-reversaldef-id-expressions.md)
closes typed `id` for direct/root `ReversalDef` and root/RedirectID
`ModifyReversalDef`. Fresh/live values resolve once in caller context, clamp to
a non-negative target id, and accepted reversal contact exposes target memory
plus `GetHitVar(hitid)`. Required trace `27b44d26/c0adb366`; aggregate QA passes
`815/815` artifacts (`781` required, `34` optional). `chainid`/`nochainid`,
Helper-owned mutation, Projectile/ModifyProjectile, priority/hitonce, exact
id/tick timing, overflow/int32, teams, rollback and full parity remain
blocked.

## Historical queue — T725 completed

T725 / [issue 299](../.scratch/roadmap/issues/299-reversaldef-chainid-expressions.md)
is queued for caller-context `chainid` matching plus incompatible-chain
rejection on the same root/RedirectID route.

## Previous implementation route — T723 closed-bounded (2026-08-11)

T723 / [issue 297](../.scratch/roadmap/issues/297-reversaldef-attack-depth-expressions.md)
closes typed `attack.depth` for direct/root `ReversalDef` and root/RedirectID
`ModifyReversalDef`, including static, dynamic, mixed, fresh single-component
duplication, and live omission preservation. Required trace
`6de330e0/18f6ef72`; aggregate QA passes `814/814` artifacts (`780` required,
`34` optional). Helper-owned ModifyReversalDef, Projectile reflection, exact
depth/tick timing, overflow/int32, teams, rollback and full parity remain
blocked.

## Previous implementation route — T722 closed-bounded (2026-08-11)

T722 / [issue 296](../.scratch/roadmap/issues/296-reversaldef-p1facing-expressions.md)
closes typed `ReversalDef` and `ModifyReversalDef` `p1facing` /
`p1getp2facing` for direct/root and root RedirectID paths. Required trace
`ef3cc6e6/807d5ba2`; aggregate QA passes `813/813` artifacts (`779` required,
`34` optional). Helper-owned ModifyReversalDef, Projectile reflection, exact
deferred tick timing, overflow/int32, teams, rollback and full parity remain
blocked.

## Current implementation route — official parity queue (2026-08-08)

Latest runtime cursor: T522 through T637 are closed-bounded; T638 is active.
T616-T621 close typed HitDef/Projectile `unhittabletime`, actor-role contact
writes, admission/defaults, HitOverride writes, and dynamic Projectile spawn
expressions. T622 carries independent ground-friction values through
root/Helper HitDef and Projectile, normal contact, `GetHitVar`, and grounded
get-hit physics; T623 closes root and redirected `ModifyHitDef` mutation. T624
closes Ikemen hit/guard spark scale through creation, mutation, accepted
presentation, required trace evidence, and rendering. T625 closes official
direct-HitDef `p1facing` / `p1getp2facing` through root/Helper HitDef,
redirected `ModifyHitDef`, accepted contact, and required trace evidence. T626
closes explicit HitDef `getpower` hit/guard values and attacker power gain.
T627 closes official omitted damage/constants-derived normal and super rewards.
T628 closes static explicit and omitted `givepower`, accepted defender power
mutation, and effective delta readback. T629 closes dynamic caller-context
`givepower` with controller-specific one-value rules. T630 closes pinned-Ikemen
`ModifyProjectile getpower`. T631 closes M.U.G.E.N `[Rules]` attack/get-hit
life-to-power multipliers. T632 closes direct HitDef and Projectile
successful-hit `palfx.*`. T633 closes direct HitDef and live `ModifyHitDef`
contact `envshake.*`; T634 closes dynamic `fall.envshake.*` creation, live
mutation, and ground-impact emission. T635 closes dynamic fall impact damage
and velocity; T636 closes dynamic fall/down recovery policy and timers. T637
closes dynamic fall, air-fall, and fall-kill policy. T638 owns dynamic
down-bounce policy. Latest evidence is 3542/3600 tests with the same 58
inherited failures, a 363-module build, and 709/709 traces (675 required, 34 optional).

Historical T601-T608 route:
T601 closes Projectile ground slide time. T602 closes full hit/guard pause
pairs and keeps Projectile-local pause separate from owner hit pause. T603
closes two-value width/height/depth Projectile guard-distance bounds. T604
closes selected hit/guard spark refs, angles, and offsets. T605 closes
Projectile-origin target-distance correction. T606 closes selected hit
acceleration metadata and later GetHitVar readback. T607 closes selected
contact EnvShake metadata and later camera-shake telemetry. T608 owns selected
fall EnvShake direction through GetHitVar and `FallEnvShake`.
Fighter Lab Gallery/Showcase/Testbench/Matrix/Compare extensions are
closed-bounded. The routes are
`?mode=lab&labView=gallery|showcase|testbench|matrix|compare`. The dedicated
browser gate passes with all views, selection, reload, and zero errors. The
broad smoke attempt timed out after 124 seconds. T534/issue 108 records the opt-in Helper red-life
LifeShare trace at `686/686`. Keep the broad smoke timeout and the inherited
retired-roster/projectile baseline explicit when handing off. T535/issue 109
adds static `GetHitVar(hitflag)` overlap comparisons for direct/Projectile
last-hit metadata with the official `MAF` default; focused coverage is 5 files /
238 tests, without a new trace artifact.
T536 / [issue 110](../.scratch/roadmap/issues/110-ikemen-roundstate-semantics.md)
is closed-bounded: the named `RoundState` projection covers the
control-locked Fight screen and the full `0/1/2/3/4` lifecycle in both
compatibility profiles. T538 / [issue 112](../.scratch/roadmap/issues/112-ikemen-introstate-fightscreenstate.md)
is closed-bounded for the `IntroState`, four `FightScreenState` booleans, and
numeric timing/localcoord `FightScreenVar` read.
T539 / [issue 113](../.scratch/roadmap/issues/113-ikemen-fighttime-gamevar.md)
is closed-bounded: the round-owned `FightTime` clock and bounded timing
`GameVar` reads are projected through the same typed FightScreen context. T540 /
[issue 114](../.scratch/roadmap/issues/114-ikemen-animelemvar.md) is now
closed-bounded for supported active-frame `AnimElemVar` metadata in CNS,
controller expressions, and Testbench. T541 / [issue 115](../.scratch/roadmap/issues/115-ikemen-animlength.md)
is now closed-bounded for the effective `AnimLength` action total exposed to
CNS/controller expressions and Testbench. T542 / [issue 116](../.scratch/roadmap/issues/116-ikemen-animplayerno.md)
is closed-bounded for `AnimPlayerNo` through the active animation-owner seam.
T543 / [issue 117](../.scratch/roadmap/issues/117-ikemen-clsnvar.md) is
closed-bounded for current-frame `ClsnVar` reads through CNS/controller
contexts and the Testbench. T544 / [issue 118](../.scratch/roadmap/issues/118-ikemen-clsnoverlap.md)
is closed-bounded for transformed `ClsnOverlap` player collision queries.
T545 / [issue 119](../.scratch/roadmap/issues/119-fighter-lab-character-matrix.md)
closes the Character Matrix product view. T546 /
[issue 120](../.scratch/roadmap/issues/120-ikemen-projclsnoverlap.md) closes
transformed owner-relative Projectile collision overlap. The next
T547 / [issue 121](../.scratch/roadmap/issues/121-ikemen-projvar.md) closes
bounded numeric Projectile state reads. T548 /
[issue 122](../.scratch/roadmap/issues/122-ikemen-projvar-flags.md) closes typed
Projectile flag comparisons. T549 /
[issue 123](../.scratch/roadmap/issues/123-ikemen-projectile-pause-movetime.md)
closes Projectile Pause/SuperPause movement counters and reads. T550 /
[issue 124](../.scratch/roadmap/issues/124-ikemen-projectile-remvelocity.md)
closes Projectile removal velocity and terminal motion. T551 /
[issue 125](../.scratch/roadmap/issues/125-ikemen-projectile-velmul-z.md) closes
the third Projectile velocity-multiplier axis and Z motion. T552 /
[issue 126](../.scratch/roadmap/issues/126-ikemen-projectile-layerno.md) closes
normalized Projectile layer state and presentation ordering. T553 /
[issue 127](../.scratch/roadmap/issues/127-ikemen-projectile-angle.md) closes
Projectile Z-angle state and live renderer rotation. T554 /
[issue 128](../.scratch/roadmap/issues/128-ikemen-projectile-xy-angle.md) is
closed for Projectile X/Y angle state and bounded live renderer rotation. T555 /
[issue 129](../.scratch/roadmap/issues/129-ikemen-projectile-xshear.md) is
closed for Projectile X shear state and bounded live sprite deformation. T556 /
[issue 130](../.scratch/roadmap/issues/130-ikemen-projectile-shadow.md) is
closed for Projectile RGB shadow state, readback, and live tint. T557 /
[issue 131](../.scratch/roadmap/issues/131-ikemen-projectile-reflection.md) is
closed for Projectile reflection state and bounded live mirrored presentation.
T558 / [issue 132](../.scratch/roadmap/issues/132-ikemen-projectile-projection.md)
is closed for Projectile named projection, focal length, and bounded live
perspective projection. T559 / [issue 133](../.scratch/roadmap/issues/133-ikemen-projectile-window.md)
is closed for four-value window state and bounded live clipping. T560 /
[issue 134](../.scratch/roadmap/issues/134-ikemen-projectile-palette.md) is closed-bounded
for spawn-only palette ownership/remap and draw-palette readback.
T526 uses `comboHitCount` for bounded direct/player-owned Projectile contacts
and retains authored `numhits` as a static-trace fallback. T527's required
trace proves two authored-`numhits` Projectile hits and one guarded break in
the `ikemen-go` profile; T528 now targets separate KO velocity deltas.

Start with the
[official M.U.G.E.N / Ikemen-GO comparison](research/2026-07-30-official-mugen-ikemen-roadmap-comparison.md),
then the [execution board](ROADMAP_EXECUTION_BOARD.md). T424-T438 and T463/T469 are
closed-bounded; T472 is the preceding closed-bounded hit-fall cursor after T469,
T473 is the closed recovery-default slice, T474 is the closed localcoord
fall-velocity slice, T475 is the closed airborne-only `air.fall` slice, T476 is
the closed horizontal `down.velocity` X slice, and T477 is the closed signed
`fall.xvelocity` bounce slice. T478-T492 and T506-T520 close the CommonFX,
Ikemen hit-metadata, and aggregate-trace continuations. T507 is the latest
bounded runtime identity cursor, T508 the evidence-baseline repair, and T516
the latest bounded runtime-feature cursor.
T504 remains the active content cursor; T505 Fighter Lab and its Gallery
extension are closed-bounded.
T517 closes the adjacent `GetHitVar(dizzypoints)` metadata cursor and T518
closes the following `GetHitVar(guardpoints)` cursor.
T426 is closed-bounded after
its direct roster/stage consumer, browser reimport, and final gates; T427 is
closed-bounded after real ZSS source-to-runtime proof; T428 is closed-bounded
after its live wrapper proof. T429/T430/T431/T432 are closed after trace/type/
suite/build proof; T433 is closed with raw-CNS positive paused cadence, T434
with normal trigger-count semantics, T435 with `StateDef -2`, T436 with
`StateDef -3` plus its no-`stateOwner` boundary, T437 with imported CMD
`StateDef -1` setup persistence, T438 with imported CMD `persistent = 0`, and
T463/T464 add the bounded static State -1 `ChangeState` zero and interval-two
routes (`88931500` / `3681fafa`); T465 advances default guard timing while
preserving authored `GetHitVar` values (issue 50); T466 carries
`airguard.ctrltime` through the same HitDef/projectile seam (issue 51); T467
adds `air.hittime` with its official 20-tick omitted default across HitDef/
ModifyHitDef/Projectile (issue 52); T468 closes fall precedence and T469
closes down timing/velocity (issues 53-54). T472 carries explicit
`down.bounce` through direct/projectile fall metadata and gates `HitFallVel`
(issue 57). Its 198 focused tests, 324/3294 full suite, typecheck/build/
boundaries and 682/682 trace gates pass; exact Common1 default and landing
parity remain open. T473 (issue 58) is now closed-bounded: enabled direct/projectile
falls default omitted recovery to `recover=1`, `recovertime=4`, while explicit
values and disabled falls stay intact. T474 (issue 59) now scales omitted
`fall.yvelocity` from fighter/projectile localcoord width while preserving
authored fall and hit velocities. T475 (issue 60) keeps `air.fall` separate from
base `fall` and selects it only for airborne defenders. T476 (issue 61) carries
authored/default `down.velocity` X into lying-target direct and projectile
contacts with the official attacker-relative sign. T477 (issue 62) keeps
authored `fall.xvelocity` signed at bounce time instead of mirroring it by
attacker/projectile facing.

T478-T480 close CommonFX scale/localcoord and Ikemen depth-velocity metadata;
T481-T485 close velocity-Z, acceleration metadata, and dynamic acceleration
readback; T486-T490 close the `GetHitVar(zvel)`, `HitVelSet z`, vector, damage,
and ground/air/fall animtype continuations. T490 is closed-bounded with seven
focused test files / 256 tests and final 324/3327 gates. T491 adds
`GetHitVar(fall.envshake.mul)` with seven focused test files / 258 tests and
final 324/3329 gates. T492 adds `GetHitVar(playerno)` with three focused test
files / 119 tests and final 324/3330 gates. T506 adds the separate numeric
`GetHitVar(playerid)` across root and verified Helper direct/Projectile paths;
five focused files / 178 tests and five deterministic trace checks pass. T507
adds deprecated `GetHitVar(ID)` as a focused alias over the same field. T508
binds two required opponent-name traces to the active roster and restores
`qa:trace` to 682/682. T509 exposes the retained guard-KO contact flag through
numeric `GetHitVar(guardko)` with 3 files / 121 tests. T510 executes static
`GetHitVar(attr)` equality/inequality filters with 3 files / 118 tests.
T511 executes static `GetHitVar(guardflag)` overlap filters with 6 files / 224
tests; typecheck/build/boundaries and 682/682 traces pass.
T512 closes the numeric `GetHitVar(projid)` cursor: four focused files / 186
tests plus typecheck/build/boundaries and 682/682 traces pass.
T513 closes the numeric `GetHitVar(teamside)` cursor: four focused files / 186
tests, 682/682 traces, typecheck/build/boundaries, and diff hygiene pass; the
broad suite retains the retired-roster baseline.
T514 closes the numeric `GetHitVar(keepstate)` cursor: five focused files / 212
tests, 682/682 traces, typecheck/build/boundaries, and diff hygiene pass; only
direct authored HitDef keepstate is claimed and the broad suite retains the
retired-roster baseline.
T515 closes the numeric `GetHitVar(frame)` cursor: six focused files / 191
tests, 682/682 traces, typecheck/build/boundaries, and diff hygiene pass; the
same-frame marker is bounded to direct HitDef and Projectile hit/guard contacts.
T516 closes the numeric `GetHitVar(priority)` cursor: four focused files / 188
tests pass; direct priority is normalized and Projectile `projpriority` remains
separate from the Projectile HitDef default. The full non-browser gates pass;
the broad suite retains the retired-roster baseline.
T517 closes the numeric `GetHitVar(dizzypoints)` cursor: five focused files /
220 tests pass; authored direct/Projectile metadata remains separate from the
current dizzy resource and missing metadata reads `0`. The full non-browser
gates pass; the broad suite retains the retired-roster baseline.
T518 closes the numeric `GetHitVar(guardpoints)` cursor: five focused files /
222 tests pass; authored direct/Projectile metadata remains separate from the
current guard resource and missing metadata reads `0`. The full non-browser
gates pass; the broad suite retains the retired-roster baseline.
T519 closes the selected issue 93 cursor: expose numeric `GetHitVar(redlife)`
while keeping authored HitDef metadata separate from the defender's current
red-life resource.
T519 is now closed-bounded with 5 focused files / 224 tests and the full
non-browser gates. T520 under issue 94 closes the next cursor with 5 focused
files / 226 tests and the same gates; T522/T523/T524 are now closed-bounded
with the same non-browser gates, and T525 issue 99 is the next selected
research cursor. Gallery browser evidence is tracked in issue 79.

Use issue 09 for the closed current state-chain contract, issue 10 for the
closed P2 source-epoch decision, issue 11 for closed imported `select.def`,
and issue 12 for the closed live ZSS path, issue 13 for the closed HitPause
wrapper proof, then issues 14-23 and 48-54 for the closed persistence and guard/hit
timing slices; issues 57-62 are now closed-bounded. The DA32 and
older selectors below remain evidence/control context;
they do not override this new implementation queue. Scores and delivery
authority remain held. Issues 63-77 and 80-94 are the closed-bounded runtime/evidence contracts
for this continuation and must be checked before selecting the next official
slice.

For the active content lane use [ROADMAP_CONTENT_PACK.md](ROADMAP_CONTENT_PACK.md),
issue [78](../.scratch/roadmap/issues/78-roster-reset-two-karate-fighters.md)
and issue [79](../.scratch/roadmap/issues/79-fighter-lab.md).
T499-T503 reduce the public roster to Rocco Vidal and Nadia Arce and complete
their 14-state atlas/runtime/MUGEN-lite packages. T504 owns identity proxy and
global browser-smoke closure; T505 closes the direct animation/frame/atlas/
collision/VFX workbench. T439-T445, T447-T461 and T470-T471 are superseded;
T446/T462 stage evidence remains valid. Do not mix native art evidence into
compatibility scores.

## Current audit route — post-DA32-026 (2026-07-28)

Start with the
[post-DA32-026 audit](research/2026-07-28-daily-roadmap-architecture-audit-post-da32-026.md),
[ADR 0073](adr/0073-studio-source-write-recovery-journal.md) and the active
[DA32 roadmap](DA32_NEXT_PROGRAM_ROADMAP.md). The audit closed at `1b1ba28f`;
formal/global is `f5f2315e`; focal runtime is T416/T417; focal Studio is
DA32-026; source is 05b/4aa. The machine record stays DA30-120, human
adjudication stays DA30-020, and scores stay
`65 / 36 / 20 / 10-12 / 6-8 / 25`.

Route the next work through P0 control, P1 Studio recovery, P2 real shell and
P3 replay plus a second legal import. Review source families before more I2
runtime work.

## Historical audit route — post-DA30-120

Start with the
[post-DA30-120 audit](research/2026-07-27-daily-roadmap-architecture-audit-post-da30-120.md)
and [DA31 roadmap](DA31_EVIDENCE_ADOPTION_ROADMAP.md). Machine control records
DA30-120; the safe proposed human cursor is DA30-020 pending the clause ledger.
Audit HEAD is `67481fbc`; formal/global is `ee23122f`; focal is T406; broad
visual/product is T342; source is 05b/4aa; backlog is Entry 615. Scores stay
`65 / 36 / 20 / 10-12 / 6-8 / 25`.

Generated selectors describe the machine record. Human implementation routing
starts with DA31-002…008, then follows the five phases in the DA31 roadmap.

## Historical audit route — post-DA30-025

Start with [AUTHORITY_SELECTOR.md](AUTHORITY_SELECTOR.md) and the
[post-DA30-025 audit](research/2026-07-27-daily-roadmap-architecture-audit-post-da30-025.md).
Generated control records DA30-025, while the audit disputes written completion
for DA30-021/024/025. Current HEAD is `c2245fe8`; formal/global observation is
`27b88f0a`; browser observations are `c47cfa4e`; focal remains T406; broad
visual/product remains T342; scores stay `65 / 36 / 20 / 10-12 / 6-8 / 25`.

Next order: adjudicate the three gate records, materialize their clause
manifests, rerun the full formal gate, repair semantic Play and Studio/Inspect
journeys, then execute DA30-026 input lifecycle. DA30-027…120 remain a
dependency graph; non-consecutive accepted models do not close live consumers.

This is the fast map for agents and humans who need to know where to look, what to update, and when a task is allowed to claim progress.

## Current authority selector

**Human authority:** [AUTHORITY_SELECTOR.md](AUTHORITY_SELECTOR.md) ·
[post-DA30-120 audit](research/2026-07-27-daily-roadmap-architecture-audit-post-da30-120.md) ·
[DA31 roadmap](DA31_EVIDENCE_ADOPTION_ROADMAP.md)

- `recordedThrough`: **DA30-120** (machine)
- `adjudicatedThrough`: **DA30-020** (written-clause ceiling)
- formal/global: **`ee23122f`**; audit HEAD: **`67481fbc`**
- DA29 remains unadjudicated; scores held
- historical formal/global: **`a6e91520`** with a summary-only DA29-002 record
- focal: **T406** `07ad9227`
- visual/product: **T342** `1085badb` (DA28 browser routes are bounded children)
- source: epoch dual pins 05b / 4aa (juggle=`same`)
- proposed next queue: **DA30-001…010**
- scores held: `65 / 36 / 20 / 10-12 / 6-8 / 25`.

The machine selector still says DA29-200 and is quarantined until DA30-003/004
replace the split control source. Plan sources:
[DA29 completion audit](research/2026-07-27-da29-completion-audit-and-da30-recovery.md),
[DA30 recovery roadmap](DA30_RECOVERY_ROADMAP.md), and
[DA29 master plan](MASTER_REVIEW_ROADMAP.md).

The T287/T288 selectors below are **historical**.

Historical 2026-07-18 cursors: implementation HEAD `a12a2672`; maximum ledger Entry
562; latest closed lane T288. The latest broad checkpoint remains the T287
233/233-file, 2484/2484-test, TypeScript 7.0.2, 633/633-trace, and 64-browser
path result; T288's current focused checkpoint is 5 files / 392 tests plus
TypeScript 7. T266-T268 and Wayfinder 256 remain historical
control references. The current cross-lane task contract is
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.
Use lane-specific reports for evidence; do not project Wayfinder 256's
230/230-file, 2388/2388-test result onto later HEADs; use the T266-T268 grouped
checkpoint for current runtime evidence. Keep the
HEAD, numbered backlog, and Wayfinder cursors separate.

T288 current claim: the T287 shutter edge now resets root position/state,
animation/control, transient actor state, command history, and owner-scoped
effects before the fighter pass while preserving resources, variables, team
state, and compatibility history. Exact global asset clearing, announcements/
display suppression, dialogue,
Common1/ZSS, teams/Turns, rollback/netplay, and full parity remain open. See
`docs/reports/2026-07-18-round-intro-skip-character-reset-closeout.md`.

## Start Here

For any non-trivial pass, read in this order:

1. `AGENTS.md`
2. `CONTEXT.md`
3. `docs/ROADMAP_NAVIGATION.md`
4. `docs/ROADMAP_PROGRESS_SYSTEM.md`
5. `docs/ROADMAP_PACKAGE_MILESTONES.md`
6. `docs/ROADMAP_EXECUTION_BOARD.md`
7. `docs/ROADMAP_CONTINUITY_GUIDE.md`
8. Relevant `.scratch/roadmap/issues/<NN>-*.md`

For a status answer, also read:

1. `docs/PORT_COMPLETION_SCORECARD.md`
2. `docs/PROGRESS_TRACKER.md`

For architecture or source-of-truth changes, also read:

1. `docs/adr/`
2. `docs/ARCHITECTURE.md`
3. `docs/ENGINE_PORT_ARCHITECTURE.md`
4. `docs/MODULE_BOUNDARY_CONTRACT.md`

## Ownership Map

| Question | Source |
| --- | --- |
| What rules should agents follow? | `AGENTS.md` |
| What is this product/engine trying to become? | `CONTEXT.md` |
| What is the current queue? | `docs/ROADMAP_EXECUTION_BOARD.md` |
| What package should move next? | `docs/ROADMAP_PACKAGE_MILESTONES.md` |
| What are the next 10 build slices? | `docs/NEXT_BUILD_ROADMAP.md` |
| How far are we from playable/full ports? | `docs/PORT_COMPLETION_SCORECARD.md` |
| What changed recently? | `docs/BUILD_EXECUTION_BACKLOG.md` |
| What is the compact current truth? | `docs/PROGRESS_TRACKER.md` |
| What gates define done? | `docs/ROADMAP_PROGRESS_SYSTEM.md` and `docs/QA_AND_ACCEPTANCE_GATES.md` |
| What are the phase-by-phase delivery checkpoints? | `docs/DELIVERY_ROADMAP.md` |
| How do we continue long-running work without drifting? | `docs/ROADMAP_CONTINUITY_GUIDE.md` |
| What checklist should I follow for this task type? | `docs/ROADMAP_OPERATIONAL_CHECKLIST.md` |
| What can the runtime currently support? | `docs/SUPPORTED_FEATURES.md` and `docs/CONTROLLER_SUPPORT_REGISTRY.md` |
| What must Studio become? | `docs/ENGINE_STUDIO_ROADMAP.md` and `docs/INTERFACE_SYSTEM.md` |
| What must generated assets prove? | `docs/GENERATED_ASSET_QA_CONTRACT.md` |
| What is only scanner-level IKEMEN work? | `docs/IKEMEN_GO_REFERENCE.md` and `docs/COMPATIBILITY_PROFILES.md` |
| What is shared-core vs fighting-specific? | `docs/MODULE_BOUNDARY_CONTRACT.md` |
| Which "latest" checkpoint belongs to which lane? | `docs/ROADMAP_PROGRESS_SYSTEM.md#checkpoint-taxonomy` |

## Decision Tree

Use this quick route when a task is broad:

| If task asks for... | Treat as | Open next |
| --- | --- | --- |
| AGENTS, setup-project, tracker, roadmap, progress docs, closeout rules | G1 project control | `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md` |
| Imported character behavior, CNS/CMD/trigger/controller semantics, Common1, guard/fall/recovery | R1 runtime compatibility | `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` |
| Moving mutable match behavior out of `PlayableMatchRuntime` | R2 runtime ownership | `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` |
| Studio Evidence/Build/Assets/Debug workflow | S1 Studio trust chain | `.scratch/roadmap/issues/02-studio-evidence-workflow.md` |
| Generated fighters, imagegen, sprite atlas, locomotion/scale QA | A1 generated assets | `.scratch/roadmap/issues/03-generated-assets-pipeline.md` |
| Ikemen-GO docs/source scan, ZSS/Lua/config/screenpack detection | I1 scanner | `.scratch/roadmap/issues/04-ikemen-scan-and-reference.md` |
| Explicit-profile IKEMEN scheduling, pause, team topology, root participation, activation, or tag-runtime semantics | I2 bounded runtime | `.scratch/roadmap/issues/07-ikemen-runtime-topology.md` |
| Shared engine contracts, module boundaries, future platformer support | M1 modular boundary | `.scratch/roadmap/issues/05-modular-engine-boundaries.md` |

If a task spans more than one row, pick the row that changes executable behavior first, then update the control docs that became stale.

## Package Lanes

| Lane | Current goal | Issue |
| --- | --- | --- |
| R1 runtime compatibility | KFM/Common1, FightFX/common assets, guard/fall/recovery precision. | `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` |
| R2 runtime ownership | Move mutable match behavior behind named worlds/systems. | `.scratch/roadmap/issues/01-runtime-compatibility-gates.md` |
| S1 Studio trust chain | Evidence and Build share one status/next-action contract. | `.scratch/roadmap/issues/02-studio-evidence-workflow.md` |
| A1 generated assets | Prompt/source/atlas/QA/collision/playtest provenance. | `.scratch/roadmap/issues/03-generated-assets-pipeline.md` |
| I1 IKEMEN scanner | More recognized/unsupported/unknown scanner findings. | `.scratch/roadmap/issues/04-ikemen-scan-and-reference.md` |
| I2 IKEMEN bounded runtime | Source-pinned, profile-gated runtime semantics with explicit consumer isolation and trace claims. | `.scratch/roadmap/issues/07-ikemen-runtime-topology.md` |
| M1 modular engine | One shared contract proven free of fighting leakage. | `.scratch/roadmap/issues/05-modular-engine-boundaries.md` |
| G1 roadmap control | Keep docs, issue tracker, gates, and claims synchronized. | `.scratch/roadmap/issues/06-roadmap-control-and-qa-ledger.md` |

## Score Movement Rules

Scores move only when evidence moves.

Allowed score evidence:

- focused unit/integration tests for parser, compiler, runtime, or boundary behavior
- `pnpm qa:trace` artifacts/checksums for compatibility behavior
- `pnpm qa:smoke` plus screenshot inspection for visible runtime, renderer, Studio, sprite, stage, or debug UI work
- private fixture evidence when the fixture exists locally
- exported build/package evidence for Studio or modular-engine claims

Not score evidence:

- docs-only cleanup
- UI mockups without data binding
- parser counts without execution/reporting gates
- generated/native assets counted as imported MUGEN compatibility
- IKEMEN scanner findings counted as IKEMEN execution

## Claim Checklist

Every meaningful closeout should answer:

```txt
Changed:
Evidence:
Claim allowed:
Claim blocked:
Next:
```

Compatibility claims must name the trace, test, fixture, checksum, or browser evidence that proves them.

## Setup-Project Profile

Current setup:

- Agent file: `AGENTS.md`
- Parent router: `D:\DEV\mugen-sandbox-prototypes\AGENTS.md` only points agents into this repo.
- Issue tracker: local markdown under `.scratch/<feature-slug>/`
- Triage labels: canonical `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`
- Domain layout: single-context repo with root `CONTEXT.md` and ADRs under `docs/adr/`
- GitHub remote: present, but not the working issue tracker unless user asks

See:

- `docs/agents/issue-tracker.md`
- `docs/agents/triage-labels.md`
- `docs/agents/domain.md`
- `docs/ROADMAP_PACKAGE_MILESTONES.md`
- `docs/NEXT_BUILD_ROADMAP.md`

## Continuity Guide

Use `docs/ROADMAP_CONTINUITY_GUIDE.md` when a task asks to continue the broader port, update the roadmap, or choose the next autonomous implementation slice. It summarizes the active horizon, continuity rules, workstream ladder, documentation update matrix, and closeout template. Use `docs/NEXT_BUILD_ROADMAP.md` when the question is "what should we actually build next?" and the package ladder is already understood.

## Anti-Drift Rules

- Do not raise port scores from docs-only work.
- Do not call scanner support runtime support.
- Do not fold I2 runtime evidence back into I1 scanner counts or infer tag/team gameplay from structural root ownership.
- Do not call generated/native roster compatibility with imported MUGEN.
- Do not bundle commercial or third-party characters.
- Do not close an issue without evidence and blocked claims.
- Do not start platformer or generic SDK runtime work before fighting contracts stay green.
- Do not treat the latest overall backlog entry as the latest runtime checkpoint unless it is actually runtime/port evidence.
