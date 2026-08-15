# Port Completion Scorecard

## 2026-08-15 T786 Helper `ModifyProjectile RedirectID` `airguard.velocity` — closed-bounded, no score movement

Issue 360 closes Helper-owned live `ModifyProjectile RedirectID` over a root
destination Projectile. The required trace
`synthetic-imported-helper-modifyprojectile-redirect-airguard-velocity` proves
caller-context `var(4)` resolution, mutation to `airguard.velocity=-9,-4,6`,
accepted airborne guard, GetHitVar/physical velocity, lifecycle, ownership and
target link. This is bounded Ikemen-only evidence with no score movement;
broadcast/team/nested topology, fresh/default derivation, dynamic `n`, exact
timing, rollback and full parity remain blocked. See [issue 360]
(../.scratch/roadmap/issues/360-helper-modifyprojectile-redirect-airguard-velocity.md).

## Next scorecard slice — 2026-08-15 T787 queued

Issue 361 queues live `ModifyHitDef down.velocity` X/Y component-preserving
mutation for root/RedirectID callers. It remains unscored until focused
caller/preservation tests and a required down-contact trace close. See [issue
361](../.scratch/roadmap/issues/361-modifyhitdef-down-velocity-component-preserve.md).

## Historical checkpoint — 2026-08-15 T781 Helper `ModifyProjectile` `down.velocity` index

Issue 355 closed Helper-owned live `ModifyProjectile down.velocity` explicit
`index` selection; evidence remains in `29aba4bb` / `b9b0752d`.

## Historical checkpoint — 2026-08-15 T780 Helper `ModifyProjectile` `air.velocity` index — closed-bounded, no score movement

Issue 354 closed Helper-owned live `ModifyProjectile air.velocity` explicit
`index` selection; evidence remains in `8e41ec21` / `d846fca3`.

## Historical checkpoint — 2026-08-15 T776 Helper `ModifyProjectile` `down.velocity` matrix — closed-bounded, no score movement

Issue 350 closes the first-generation Helper-authored live `ModifyProjectile`
`down.velocity` matrix for one root-owned Projectile and one accepted lying
hit. Evidence commit `a47c329c` and required trace `becc3b9c` prove Helper
caller-context replacement, pinned zero-fill `[x,0,0]` / `[x,y,0]` /
`[x,y,z]`, `GetHitVar(xvel/yvel/zvel)`, physical `HitVelSet`, lifecycle,
ownership and target links. Focused compiler, Projectile and Helper tests,
typecheck and diff hygiene pass. Aggregate QA retains the inherited
`synthetic-imported-helper-bind-to-target-redirect` target-link blocker; no
score movement. Fresh/default derivation, air/airguard/ground selection,
nested/shared topology, exact timing, rollback and full parity remain blocked.
See [issue 350](../.scratch/roadmap/issues/350-helper-modifyprojectile-down-velocity.md).

## Historical checkpoint — 2026-08-15 T775 Helper `ModifyProjectile` `guard.velocity` Y/Z matrix — closed-bounded, no score movement

Issue 349 closes the first-generation Helper-authored ground-guard velocity
Y/Z matrix. Evidence commit `a5cec411` and required trace `a6bfe6bd` ->
`b6d30a1d` add focused Projectile/Helper regressions and accepted guard
evidence for omission/no-op plus single, pair, and triple zero-fill writes.
`ProjectileSystem` passes `100/100`, typecheck and diff hygiene pass. The
broader EffectActorSystem suite retains one unrelated `guardPoints`
expectation failure, and aggregate QA retains the inherited helper-bind
target-link blocker. No score movement: fresh/default derivation, airborne
guard, nested/shared topology, exact physics/timing, rollback and full parity
remain blocked. See [issue
349](../.scratch/roadmap/issues/349-helper-modifyprojectile-guard-velocity-yz.md).

## Historical checkpoint — 2026-08-15 T773 Helper `ModifyProjectile` `airguard.velocity` Z air guard — closed-bounded, no score movement

Issue 347 closes the first-generation Helper-authored airborne guard velocity
Z seam. Evidence commit `44361ac3`; required trace `c1d1e70f`
(`b7850d2e` -> `76075e30`) passes. The root-owned Projectile keeps the
Helper-context Z replacement through an accepted airborne guard; physical
`maxVelZ=9`, `GetHitVar(zvel)` and defender life `998` are observed. Focused
Helper/trace tests, typecheck and diff hygiene pass. Aggregate QA retains the
inherited helper-bind target-link blocker. No score movement: fresh/default
derivation, full component preservation, nested/shared-resource topology,
exact physics/timing, rollback and full parity remain blocked. See [issue
347](../.scratch/roadmap/issues/347-helper-modifyprojectile-airguard-velocity-z.md).

## Historical checkpoint — 2026-08-15 T772 Helper `ModifyProjectile` `airguard.velocity` Y air guard — closed-bounded, no score movement

Issue 346 closes the first-generation Helper-authored airborne guard velocity
Y seam. Evidence commit `309eb94a`; required trace `8b9552db`
(`b7850d2e` -> `bce06ab9`) passes. The root-owned Projectile keeps the
Helper-context Y replacement through an accepted airborne guard; the physical
Y response is observed and defender life ends at `998`. Focused Helper/trace
tests, typecheck and diff hygiene pass. Aggregate QA retains the inherited
helper-bind target-link blocker. No score movement: Z/default derivation, full
component preservation, nested/shared-resource topology, exact physics/timing,
rollback and full parity remain blocked. See [issue
346](../.scratch/roadmap/issues/346-helper-modifyprojectile-airguard-velocity-y.md).

## 2026-08-15 T777 Helper `ModifyProjectile` `ground.velocity` matrix — closed-bounded, no score movement

Issue 351 closes the bounded Helper-owned live `ModifyProjectile ground.velocity`
matrix and one accepted grounded hit. Evidence commit `2a03d5db` and required
trace `52926706` prove caller-context replacement, omitted live sibling
preservation, GetHitVar/physical response, lifecycle, ownership and target
links. Focused tests, typecheck and diff hygiene pass; aggregate QA retains the
inherited helper-bind target-link blocker. No score movement: fresh/default
derivation, down/air/airguard selection, nested/shared-resource topology,
exact timing, rollback and full parity remain blocked. See [issue
351](../.scratch/roadmap/issues/351-helper-modifyprojectile-ground-velocity.md).

## 2026-08-15 T778 Helper `ModifyProjectile` `air.velocity` matrix — closed-bounded, no score movement

Issue 352 closes the bounded Helper-owned live `ModifyProjectile air.velocity`
matrix and one accepted airborne hit. Evidence commit `9f7044c0` and required
trace checksums `b36b10a7` / `6fd7f175` prove caller-context evaluation,
pinned zero-fill `[x,0,0]` / `[x,y,0]` / `[x,y,z]`, GetHitVar/physical response,
lifecycle, ownership and target links. Focused tests, typecheck and diff
hygiene pass; aggregate QA retains the inherited helper-bind target-link
blocker. No score movement: fresh/default derivation, dynamic `n`,
down/ground/airguard selection, nested/shared-resource topology, exact timing,
rollback and full parity remain blocked. See [issue
352](../.scratch/roadmap/issues/352-helper-modifyprojectile-air-velocity.md).

## 2026-08-15 T779 Helper `ModifyProjectile` broadcast — closed-bounded, no score movement

Issue 353 closes Helper caller-context `ModifyProjectile air.velocity` broadcast
to selected ids while trap id `8914` remains unchanged. Evidence commit
`513d8e58` and required trace `d0d4ca95` / `2dc85e6f` prove selected id `8913`
reaches an accepted airborne hit with GetHitVar/HitVelSet, lifecycle, ownership
and target links. Focused tests, typecheck and diff hygiene pass. Aggregate QA
retains the inherited helper-bind target-link blocker; no score movement.
Fresh/default derivation, id/index edge selection, dynamic `n`, nested/shared
topology, exact timing, rollback and full parity remain blocked. See [issue
353](../.scratch/roadmap/issues/353-helper-modifyprojectile-air-velocity-broadcast.md).

## 2026-08-15 T780 Helper `ModifyProjectile` index selection — queued

Issue 354 queues explicit oldest-first `index` selection among same-id
Projectiles from a Helper. No score movement is expected; id-zero/omitted
selection, fresh/default derivation, dynamic `n`, nested/shared topology,
aggregate QA repair, exact timing, rollback and full parity remain blocked. See
[issue 354](../.scratch/roadmap/issues/354-helper-modifyprojectile-air-velocity-index.md).

## 2026-08-15 T771 Helper `ModifyProjectile` `airguard.velocity` X air guard — historical closed-bounded, no score movement

Issue 345 closed the first-generation Helper-authored airborne guard velocity
X seam. Evidence commit `c3438d6e`; required trace `641792d6` passes. The
accepted guard observed `maxVel.x=6` and defender life `998`. See [issue
345](../.scratch/roadmap/issues/345-helper-modifyprojectile-airguard-velocity.md).

## 2026-08-15 T770 Helper `ModifyProjectile` `guard.velocity` ground guard — historical closed-bounded, no score movement

Issue 344 closed the first-generation Helper-authored ground guard velocity
seam. Evidence commit `3c7ca64c`; required trace `3d47deb8` passes. The
accepted guard exposed `GetHitVar(xvel)=8`, physical guard velocity, and
defender life `20`. See [issue
344](../.scratch/roadmap/issues/344-helper-modifyprojectile-guard-velocity.md).

## Historical checkpoint — 2026-08-15 T769 Helper `ModifyProjectile` `damage` guard readback — closed-bounded, no score movement

Issue 343 closes the first-generation Helper-authored damage guard seam.
Evidence commit `79c377cd`; required trace `65253f37`
(`1c4e9c53` -> `fb2ad29f`) passes. Guard damage is `10`, defender life ends
at `40`, and `GetHitVar(guarddamage)=10` remains separate. Aggregate QA
retains the inherited target-link blocker. See [issue
343](../.scratch/roadmap/issues/343-helper-modifyprojectile-damage-guard.md).

## Historical checkpoint — 2026-08-15 T768 Helper `ModifyProjectile` `getpower` guard readback — closed-bounded, no score movement

Issue 342 closes the Helper caller-context getpower guard path. Evidence
commit `c61755fa`; required trace `0c233b3f` (`8a99549b` -> `7587197d`)
passes. Attacker power ends at `8`, defender life remains `20`, and guarded
state evidence is present without using `GetHitVar(power)` as getpower proof.
Aggregate QA retains the inherited target-link blocker. See [issue
342](../.scratch/roadmap/issues/342-helper-modifyprojectile-getpower-guard.md).

## Historical checkpoint — 2026-08-15 T766 Helper `ModifyProjectile` `givepower` hit readback — closed-bounded, no score movement

Issue 340 closes the first-generation Helper-authored givepower hit seam.
Evidence commit `b2a300f1`; required trace `90cb9340` (`d26f12db` ->
`508dbf8f`) passes. The root-owned Projectile keeps its Helper-context
`givepower=var(0)*4,var(0)-3` replacement through an accepted unguarded hit;
defender power ends at `44`, life at `5`, and authored `GetHitVar(power)=44`
remains separate. Focused tests, typecheck and diff hygiene pass. Aggregate
QA retains the inherited helper-bind target-link blocker. No score movement:
guard contact, getpower mutation, nested/shared-resource topology, exact
arithmetic/timing, rollback and full parity remain blocked. See [issue
340](../.scratch/roadmap/issues/340-helper-modifyprojectile-givepower-hit.md).

## Historical checkpoint — 2026-08-15 T765 Helper `ModifyProjectile` `getpower` hit readback — closed-bounded, no score movement

Issue 339 closes the first-generation Helper-authored getpower hit seam.
Evidence commit `c27b658e`; required trace `d1f1edf2` (`6ae1a86b` ->
`efa376d6`) passes. The root-owned Projectile keeps its Helper-context
`getpower=var(0)*4,var(0)-3` replacement through an accepted unguarded hit;
attacker power ends at `44`, defender life at `5`, and authored
`GetHitVar(power)` remains separate. Focused tests, typecheck and diff hygiene
pass. Aggregate QA retains the inherited helper-bind target-link blocker.
No score movement: givepower, guard contact, nested/shared-resource topology,
exact arithmetic/timing, rollback and full parity remain blocked. See [issue
339](../.scratch/roadmap/issues/339-helper-modifyprojectile-getpower-hit.md).

## Historical checkpoint — 2026-08-15 T764 Helper `ModifyProjectile` `AttackMulSet.RedLife` guard contact — closed-bounded, no score movement

Issue 338 closes the first-generation Helper-authored guard snapshot. Evidence
commit `90156937`; required trace `4e97fdba` -> `eff1e719` passes. The
root-owned Projectile keeps its creation multiplier `0.5` after Helper
`ModifyProjectile` resolves `redlife=var(0),var(0)`; authored
`GetHitVar(redlife)=40` remains separate and the defender ends at
`life=20/redLife=20`. Focused red-life traces are 4/4, typecheck and diff
hygiene pass. Aggregate QA retains the inherited helper-bind target-link
blocker; the pre-existing EffectActor guardpoints assertion remains separate.
No score movement: hit contact, nested/shared-resource topology, exact
arithmetic/timing, rollback and full parity remain blocked. See [issue
338](../.scratch/roadmap/issues/338-helper-modifyprojectile-attackmulset-redlife-guard.md).

## Historical checkpoint — 2026-08-15 T763 Helper `ModifyProjectile` `AttackMulSet.RedLife` hit contact — closed-bounded, no score movement

Issue 337 closes the first-generation Helper-authored hit snapshot. Evidence
commit `d96c7015`; required trace `938303dd` -> `0073df18` passes. The
root-owned Projectile keeps its creation multiplier `0.5` after Helper
`ModifyProjectile` resolves `redlife=var(0),0`; authored
`GetHitVar(redlife)=40` remains separate and the defender ends at
`life=5/redLife=20`. Focused tests, typecheck and diff hygiene pass. Aggregate
QA retains the inherited helper-bind target-link blocker; the full trace suite
is 810/811 and the unrelated EffectActor guardpoints assertion remains known.
No score movement: guard contact, nested/shared-resource topology, exact
arithmetic/timing, rollback and full parity remain blocked. See [issue
337](../.scratch/roadmap/issues/337-helper-modifyprojectile-attackmulset-redlife-hit.md).

## Historical checkpoint — 2026-08-15 T762 `ModifyProjectile` `AttackMulSet.RedLife` hit contact — closed-bounded, no score movement

Issue 336 closes the root-owned hit snapshot after `ModifyProjectile` replaces
the live redlife pair. Evidence commit `a98fb9c0`; required trace
`a09849a1` -> `fff29f85` passes. The accepted hit keeps authored
`GetHitVar(redlife)=40` separate and ends the defender at
`life=5/redLife=20` after the creation-time `0.5` multiplier, despite the
later live value `2`. Projectile coverage is 111/111; focused trace and
typecheck/diff hygiene pass. Aggregate QA retains the inherited helper-bind
target-link blocker. No score movement: Helper-authored ModifyProjectile,
resource-owner topology, exact clamp/rounding/timing, rollback and full parity
remain blocked. See [issue
336](../.scratch/roadmap/issues/336-modifyprojectile-attackmulset-redlife-hit.md).

## Historical checkpoint — 2026-08-14 T759 Projectile `AttackMulSet.RedLife` guard contact — closed-bounded, no score movement

Issue 333 closes the root Projectile guard-contact snapshot for the effective
`AttackMulSet.RedLife` multiplier. Evidence commit `953788b3`; required trace
`9051894a` -> `7434fbdc` passes. The accepted guard keeps authored
`GetHitVar(redlife)=20` separate and ends the defender at `life=20/redLife=20`
after the creation-time `0.5` multiplier, despite a later live value of `2`.
Aggregate QA retains the inherited helper-bind target-link blocker. No score
movement: Helper-parented guard breadth, ModifyProjectile, resource-owner
topology, exact clamp/rounding/timing, rollback and full parity remain
blocked. See [issue
333](../.scratch/roadmap/issues/333-projectile-attackmulset-redlife-guard.md).

## Historical checkpoint — T758 Helper Projectile `AttackMulSet.RedLife` snapshot — closed-bounded, no score movement

Issue 332 closes the Helper-parented creation-time snapshot for the effective
`AttackMulSet.RedLife` multiplier. Accepted contact keeps authored
`GetHitVar(redlife)` separate and applies the captured multiplier after a live
update. Evidence commit `092e0565`; required trace `74274e6d` -> `8dbd5b52`
passes. Aggregate QA retains the inherited helper-bind target-link blocker.
No score movement: guard routes, ModifyProjectile, resource-owner topology,
exact clamp/rounding/timing, rollback and full parity remain blocked. See
[issue 332](../.scratch/roadmap/issues/332-helper-projectile-attackmulset-redlife.md).

## 2026-08-12 T756 Projectile `AttackMulSet.DizzyPoints` snapshot — closed-bounded, no score movement

Issue 330 closes the creation-time snapshot for the effective
`AttackMulSet.DizzyPoints` multiplier on root Projectiles. Accepted unguarded
hits consume the captured value against the defender pool and keep authored
`GetHitVar(dizzypoints)` separate. Product/evidence commits are
`76222e0f` / `c8c7daa1`; required trace `a2d32251` -> `91bf5a3a` passes.
Aggregate QA retains the inherited helper-bind target-link blocker. No score
movement: guarded contacts, ModifyProjectile, resource-owner topology, exact
clamp/rounding/timing, rollback and full parity remain blocked. See [issue
330](../.scratch/roadmap/issues/330-projectile-attackmulset-dizzypoints.md).

## Historical checkpoint — T755 superseded by T728

T755 duplicated the already closed T728/issue 302 live `ModifyHitDef
down.velocity` work. Issue 329 remains superseded audit history and is not a
new score candidate.

## Next selection — T767 Helper ModifyProjectile givepower guard

Close the Helper-owned `ModifyProjectile givepower` readback on an accepted guard;
keep unguarded hit, getpower mutation, nested helpers, aggregate QA repair and
resource topology separate. See [issue
341](../.scratch/roadmap/issues/341-helper-modifyprojectile-givepower-guard.md).

## Historical checkpoint — 2026-08-12 T753 `AttackMulSet guardpoints` — closed-bounded, no score movement

Issue 327 closes typed, finite caller-context `AttackMulSet guardpoints` for
direct accepted guards. The dedicated multiplier scales authored guard-points
deltas independently from damage/dizzy scaling and resets on intro skip.
Required trace `5a4b2841` -> `90fe9bf9`; focused tests and typecheck pass. No
score movement: Projectile/Helper ownership, omitted defaults, resource
clamp/rounding, `NoGuardPointsDamage`, int32 edges, teams, rollback and full
parity remain blocked. See [issue
327](../.scratch/roadmap/issues/327-attackmulset-guardpoints-dynamic.md).

## Historical checkpoint — 2026-08-12 T752 Projectile `guardpoints` expressions — closed-bounded, no score movement

Issue 326 closes fresh Projectile `guardpoints` static and caller-context
dynamic resolution for root and Helper-parented Projectiles, with accepted
contact `GetHitVar(guardpoints)=19`. Required trace pairs are
`e369c409` -> `90b185ad` and `76244e57` -> `c5cb237b`; focused tests and
typecheck pass. No score movement: omitted defaults/reset, ModifyProjectile,
int32 edge behavior, teams, rollback and full parity remain blocked. Aggregate
QA retains the inherited helper-bind missing-target-link blocker. See [issue
326](../.scratch/roadmap/issues/326-projectile-guardpoints-dynamic.md).

## Next selection — T753 upstream seam selection

Choose one bounded source contract after the aggregate T752 trace gate.

## Historical checkpoint — T751 direct `HitDef guardpoints` expressions — closed-bounded, no score movement

Issue 325 closes caller-context dynamic integer `guardpoints` for fresh direct
HitDef activation through root and Helper dispatch, with accepted grounded
guard readback through `GetHitVar(guardpoints)`. Required trace checksum
`4c227a07` and final checksum `c67b5998` pass independently. No score
movement: the authored value stays separate from the defender's current guard
resource. Fresh default/reset parity, Projectile/ModifyProjectile, exact guard
timing, teams, rollback and full parity remain blocked. Aggregate QA retains
the inherited helper-bind missing-target-link blocker. See [issue
325](../.scratch/roadmap/issues/325-hitdef-guardpoints-dynamic.md).

## Next selection — T752 upstream seam selection

Choose one bounded source contract after the aggregate T751 trace gate.

## Historical checkpoint — T750 `HitDef guard.dist` bounds — closed-bounded, no score movement

Issue 324 closes direct `HitDef guard.dist.width/height/depth` static, mixed and
caller-context dynamic bounds through root/RedirectID and Helper callers.
Fresh dimensions use bounded defaults; live Ikemen `ModifyHitDef` preserves
omitted siblings. Product `194c0b6`, evidence `5b46f71c`, required trace
`489865dc` are committed and green independently. No score movement: the
legacy M.U.G.E.N scalar remains separate, while Projectile/ModifyProjectile,
ReversalDef, exact geometry/timing, teams, rollback and full parity remain
blocked. Aggregate QA still has the inherited helper-bind missing-target-link
blocker. See [issue
324](../.scratch/roadmap/issues/324-hitdef-guard-distance-bounds.md).

## Historical checkpoint — T749 `HitDef attack.depth` — closed-bounded, no score movement

Issue 323 closes direct `HitDef attack.depth` expressions and live Ikemen
`ModifyHitDef attack.depth` static, mixed and caller-context dynamic mutation
through root/RedirectID and Helper callers. Product `689a02c5`, tests
`076d1f5f` and evidence `4ddbd63e` are committed; the required imported trace
is green (`7ef8aace` / `170aacf6`). No score movement: fresh defaults,
Projectile/ModifyProjectile, ReversalDef breadth, exact depth timing, teams,
rollback and full M.U.G.E.N/Ikemen parity remain blocked. Aggregate QA still
has the inherited helper-bind missing-target-link blocker. See [issue
323](../.scratch/roadmap/issues/323-hitdef-attack-depth.md).

## Historical checkpoint — T747 live `ModifyHitDef` pause pairs — closed-bounded, no score movement

Issue 321 closes live Ikemen `ModifyHitDef` `pausetime` and
`guard.pausetime` pair mutation through root/RedirectID and Helper callers.
Product `1100d384` and evidence `c6c88173` are committed; focused tests,
typecheck and the required imported trace are green. No score movement: exact
pause scheduling, fresh/Projectile breadth, ModifyProjectile, ReversalDef,
teams, rollback and full M.U.G.E.N/Ikemen timing parity remain blocked. See
[issue 321](../.scratch/roadmap/issues/321-modifyhitdef-pausetime.md).

## Next selection — T748 upstream seam selection

Choose one bounded source contract after the aggregate T747 trace gate.

## Historical checkpoint — T746 fresh `HitDef snap` X/Y/Z/`snaptime` — closed-bounded, no score movement

Issue 320 carries fresh direct `HitDef snap` X/Y/Z plus `snaptime` through typed
IR, root/Helper caller-context evaluation, `GetHitVar` offsets, imported
metadata and accepted-hit target binding. Focused coverage is `391/391`,
typecheck passes, and product/evidence commits are `d8363efa` / `11623ca3`.
No score movement: the required trace is landed but aggregate QA remains the
promotion gate; M.U.G.E.N 1.1 only documents X/Y, while Z/fourth-component
binding are bounded Ikemen support. Live ModifyHitDef/Projectile snap Z and
exact positioning parity remain blocked. See [issue
320](../.scratch/roadmap/issues/320-hitdef-snaptime-bind.md).

## 2026-08-11 T744 live `ModifyHitDef snap` X/Y — closed-bounded, no score movement

Issue 318 closes live Ikemen `ModifyHitDef snap` X/Y replacement through
root/RedirectID and Helper callers. Single values preserve active Y/Z, pairs
preserve Z, and omission is a no-op. Focused compiler/runtime/Helper coverage
and Playable integration pass; product commit is `f9ae0eca`. No score movement:
fresh snap defaults, snap Z/`snaptime`, Projectiles, exact bind/tick and full
positioning parity remain blocked. See [issue
318](../.scratch/roadmap/issues/318-modifyhitdef-snap-expressions.md).

## Historical checkpoint — 2026-08-11 T742 fresh dynamic `HitDef snap` X/Y — closed-bounded, no score movement

Issue 316 closes fresh direct `HitDef snap` X/Y expression resolution for root
and Helper callers. Caller `var(0)=7,var(1)=-5` reaches accepted contact
`GetHitVar(xoff/yoff/zoff)=7/-5/0`, and the required trace observes the
defender's snapped Y position. Trace/final checksums are `3d153556` /
`fe79d540`; aggregate QA passes `828/828` artifacts (`794` required, `34`
optional). No score movement: snap Z, `snaptime`,
Projectiles, exact bind/tick/localcoord/facing and full positioning parity
remain blocked. See [issue
316](../.scratch/roadmap/issues/316-hitdef-snap-dynamic.md).

## Historical checkpoint — 2026-08-11 T741 `ModifyHitDef` cornerpush offsets — closed-bounded, no score movement

Issue 315 closes root/RedirectID and Helper caller-context live `ModifyHitDef`
cornerpush offsets for `ground`, `air`, `down`, and `guard`; T740 already
closed `airguard.cornerpush.veloff`. Required trace/final checksums are
`27dae2dd` / `a571323c`; aggregate QA passes `827/827` artifacts (`793`
required, `34` optional). No score movement: fresh/direct defaults,
airborne/down timing, Projectiles, ModifyProjectile, exact decay and physics
parity remain blocked. See [issue
315](../.scratch/roadmap/issues/315-modifyhitdef-cornerpush-dynamic.md).

T740 / issue 314 is historical and remains closed-bounded with trace/final
checksums `ce2f48e5` / `09df4342`.

T739 / issue 313 is superseded by closed T678 / issue 252.

## Historical checkpoint — 2026-08-11 T738 Helper `ModifyHitDef guard.velocity` Y/Z — closed-bounded, no score movement

Issue 312 closes Ikemen-only Helper-owned live `ModifyHitDef guard.velocity`
Y/Z component replacement. Caller-context single, pair, and triple values
preserve omitted live components and reach accepted ground-guard
`GetHitVar`/velocity metadata with Helper/root/parent ownership. Required trace
checksum is `da73f66a` / `4231487d`; aggregate QA passes `825/825` artifacts
(`791` required, `34` optional). No score movement: fresh defaults, air guard,
Projectiles and exact physics parity remain blocked. See [issue
312](../.scratch/roadmap/issues/312-helper-modifyhitdef-guard-velocity-yz.md).

## Historical checkpoint — 2026-08-11 T737 `ModifyHitDef guard.velocity` Y/Z — closed-bounded, no score movement

Issue 311 closes Ikemen-only live `ModifyHitDef guard.velocity` Y/Z component
replacement through root/RedirectID. Single, pair, and triple caller-context
values preserve omitted live components and reach accepted ground-guard
`GetHitVar`/velocity metadata. Required trace checksum is `a2eb52db` /
`f0fb19a8`; aggregate QA passes `824/824` artifacts (`790` required,
`34` optional). No score movement: M.U.G.E.N 1.1 only documents ground-guard X,
while Y/Z, air guard, Projectiles and exact physics parity remain blocked. See
[issue 311](../.scratch/roadmap/issues/311-modifyhitdef-guard-velocity-yz.md).

## Historical checkpoint — 2026-08-11 T736 `ModifyHitDef guardsound.channel` — closed-bounded, no score movement

Issue 310 closes Ikemen-only live `ModifyHitDef guardsound.channel` through
root, RedirectID and Helper callers. Static/dynamic caller-context finite
values reach typed guarded `audio:playsnd` channel `8`, omission preserves the
active guard channel, and the required trace checksum is `a689adf2` /
`d5bc517f`; aggregate QA passes `823/823` artifacts (`789` required, `34`
optional). No score movement: fresh defaults, exact SND lookup/playback/
mixing/priority, Projectiles and full audio parity remain blocked. See [issue
310](../.scratch/roadmap/issues/310-modifyhitdef-guardsound-channel.md).

## Historical checkpoint — 2026-08-11 T735 `ModifyHitDef hitsound.channel` — closed-bounded, no score movement

Issue 309 closes Ikemen-only live `ModifyHitDef hitsound.channel` through root,
RedirectID and Helper callers. Static/dynamic caller-context finite values reach
typed hit `audio:playsnd` channel `7`, omission preserves the active channel,
and the required trace checksum is `b5f4c11e` / `421be8fe`; aggregate QA passes
`822/822` artifacts (`788` required, `34` optional). No score movement: fresh
defaults, guardsound channel, exact SND lookup/playback/mixing/priority,
Projectiles and full audio parity remain blocked. See [issue
309](../.scratch/roadmap/issues/309-modifyhitdef-hitsound-channel.md).

## Historical checkpoint — 2026-08-11 T734 `ModifyHitDef hitsound` expressions — closed-bounded, no score movement

Issue 308 closes Ikemen-only live `ModifyHitDef hitsound` through root,
RedirectID and Helper callers. Static/dynamic caller-context refs retain their
`F`/`S` prefix, omission preserves the active sound, and the accepted hit
event records typed `audio:playsnd` `F6,4` from raw `Fvar(0),var(1)`. Required
trace checksum is `8d56e467` / final `d2d70840`; aggregate QA passes `821/821`
artifacts (`787` required, `34` optional). No score movement: fresh defaults,
channels, exact SND lookup/playback/mixing/priority, Projectiles and full audio
parity remain blocked. See [issue
308](../.scratch/roadmap/issues/308-modifyhitdef-hitsound-expressions.md).

## Historical selection — T747 closed-bounded

Issue 321 closed the live Ikemen ModifyHitDef pause-pair seam without score
movement. T748 is the next bounded selection after the aggregate T747 gate.

## Historical checkpoint — 2026-08-11 T733 `ModifyHitDef guardsound` expressions — closed-bounded, no score movement

Issue 307 closes Ikemen-only live `ModifyHitDef guardsound` through root,
RedirectID and Helper callers. Static/dynamic caller-context refs retain their
`F`/`S` prefix, omission preserves the active sound, and the accepted guard
event records typed `audio:playsnd` `F6,4` from raw `Fvar(0),var(1)`. Required
trace checksum is `2ade8da5` / final `f88990bd`; aggregate QA passes `820/820`
artifacts (`786` required, `34` optional). No score movement: fresh defaults,
channels, exact SND lookup/playback/mixing, Projectiles and full audio parity
remain blocked. See [issue
307](../.scratch/roadmap/issues/307-modifyhitdef-guardsound-expressions.md).

## Historical checkpoint — 2026-08-11 T732 `ModifyHitDef guard.sparkno` expressions — closed-bounded, no score movement

Issue 306 closes Ikemen-only live `ModifyHitDef guard.sparkno` through root,
RedirectID and Helper callers. Static/dynamic caller-context suffixes retain
their prefix, omission preserves the active identity, and the accepted guard
event records `F19` without changing angle or offset. No score movement: fresh
defaults, normal hit identity, scale, palette, Projectiles, exact FightFX/common
lookup and full presentation parity remain blocked. See [issue
306](../.scratch/roadmap/issues/306-modifyhitdef-guard-sparkno-expressions.md).

## Historical checkpoint — 2026-08-11 T727 ReversalDef `hitonce` expressions — closed-bounded, no score movement

Issue 301 closes the bounded direct/root `ReversalDef` and root/RedirectID
`ModifyReversalDef` `hitonce` path. Static and caller-context values resolve
once; zero disables the one-contact gate, finite non-zero values enable it,
and live omission preserves the active flag. Explicit target memory permits a
distinct target only while disabled. Focused compiler/runtime coverage passes
`184/184`; resolution/helper coverage passes `78/78`; no causal trace is
claimed. No score movement: Helper-owned mutation, Projectile, priority,
exact tick/combo parity, overflow/int32, teams, rollback and full ReversalDef
parity remain blocked. See [issue
301](../.scratch/roadmap/issues/301-reversaldef-hitonce-expressions.md).

## Latest closed-bounded — T729 `ModifyHitDef sparkxy` expressions

Issue 303 closes Ikemen-only live X/Y replacement for `ModifyHitDef sparkxy`
through root/RedirectID and Helper caller paths. Single-component values
preserve Y, pairs replace both axes, and omission preserves the active offset.
The required trace observes `sparkxy = 24,-72` in the hit-effect event;
focused coverage passes `289/289`, and `pnpm qa:trace` passes `816/816`
artifacts (`782` required, `34` optional). Fresh defaults, spark identity,
scale, angle, palette, Projectiles and exact renderer timing remain blocked.
See [issue
303](../.scratch/roadmap/issues/303-modifyhitdef-sparkxy-expressions.md).

## Historical checkpoint — T729 `ModifyHitDef sparkxy` expressions

Issue 303 closes Ikemen-only live X/Y replacement through root/RedirectID and
Helper callers. See [issue
303](../.scratch/roadmap/issues/303-modifyhitdef-sparkxy-expressions.md).

## Historical checkpoint — T728 `ModifyHitDef down.velocity` expressions

Issue 302 closes Ikemen-only live X/Y replacement with Y/Z preservation for
root/RedirectID and Helper callers, with required lying-contact evidence.
See [issue
302](../.scratch/roadmap/issues/302-modifyhitdef-down-velocity-expressions.md).

## Historical checkpoint — T726 completed

Issue 300 closes the bounded direct/root `ReversalDef` and root/RedirectID
`ModifyReversalDef` `nochainid` path. Static, dynamic, and mixed lists up to
eight entries resolve once in caller context; finite values truncate and
matching non-negative incoming `HitDef` ids are rejected. Focused
compiler/runtime coverage passes `181/181`; no causal end-to-end trace is
claimed. No score movement: `hitonce`, Helper-owned mutation, Projectile,
priority, exact tick parity, overflow/int32, teams, rollback and full
ReversalDef parity remain blocked. See [issue
300](../.scratch/roadmap/issues/300-reversaldef-nochainid-expressions.md).

## 2026-08-11 T725 ReversalDef `chainid` expressions — closed-bounded, no score movement

Issue 299 closes the bounded direct/root `ReversalDef` and root/RedirectID
`ModifyReversalDef` `chainid` path. Fresh/live values resolve once in caller
context, finite values truncate, explicit negatives disable the requirement,
and incompatible latest `HitDef` ids are rejected. Focused compiler/runtime
coverage passes `179/179`; no causal end-to-end trace is claimed. No score
movement: `nochainid`, Helper-owned mutation, Projectile/ModifyProjectile,
priority/hitonce, exact tick parity, overflow/int32, teams, rollback and full
ReversalDef parity remain blocked. See [issue
299](../.scratch/roadmap/issues/299-reversaldef-chainid-expressions.md).

## Historical queue — T726 ReversalDef `nochainid` expressions completed

Issue 300 queues caller-context lists up to eight entries on the same bounded
root/RedirectID route. See [issue
300](../.scratch/roadmap/issues/300-reversaldef-nochainid-expressions.md).

## 2026-08-11 T724 ReversalDef `id` expressions — closed-bounded, no score movement

Issue 298 closes the bounded direct/root `ReversalDef` and root/RedirectID
`ModifyReversalDef` `id` path. Fresh and live values resolve once in caller
context, clamp to a non-negative target id, and accepted reversal contact
publishes `GetHitVar(hitid)` plus target memory. Required trace passes with
`27b44d26/c0adb366`; aggregate QA passes `815/815` artifacts (`781` required,
`34` optional). No score movement: `chainid`/`nochainid`, Helper-owned
ModifyReversalDef, Projectile/ModifyProjectile, priority/hitonce, exact
id/tick parity, overflow/int32, teams, rollback and full ReversalDef parity
remain blocked. See [issue 298](../.scratch/roadmap/issues/298-reversaldef-id-expressions.md).

## 2026-08-11 T723 ReversalDef `attack.depth` expressions — closed-bounded, no score movement

Issue 297 closes the bounded direct/root `ReversalDef` and root/RedirectID
`ModifyReversalDef` `attack.depth` path. Static, dynamic, and mixed one/two
component values resolve once in caller context; fresh single-component
activation duplicates and live omitted components preserve the active pair.
Required trace passes with `6de330e0/18f6ef72`; aggregate QA passes `814/814`
artifacts (`780` required, `34` optional). No score movement: Helper-owned
ModifyReversalDef, Projectile/ModifyProjectile, exact depth/tick parity,
overflow/int32, teams, rollback and full ReversalDef parity remain blocked.
See [issue 297](../.scratch/roadmap/issues/297-reversaldef-attack-depth-expressions.md).

## 2026-08-11 T722 ReversalDef `p1facing` expressions — closed-bounded, no score movement

Issue 296 closes the bounded direct/root `ReversalDef` and root/RedirectID
`ModifyReversalDef` `p1facing` / `p1getp2facing` path. Caller-context values
resolve once and accepted reversal contact applies `p1getp2facing` before
negative `p1facing`. Required trace passes with `ef3cc6e6/807d5ba2`; aggregate
QA passes `813/813` artifacts (`779` required, `34` optional). No score
movement: Helper-owned ModifyReversalDef, Projectile reflection, exact tick
parity, overflow/int32, teams, rollback and full ReversalDef parity remain
blocked. See [issue 296](../.scratch/roadmap/issues/296-reversaldef-p1facing-expressions.md).

## 2026-08-11 T721 ReversalDef `numhits` expressions — closed-bounded, no score movement

Issue 295 closes the bounded direct/root `ReversalDef` and root/RedirectID
`ModifyReversalDef` `numhits` path. Typed static/dynamic values resolve once
in caller context and accepted reversal contact consumes the resulting
hit-count metadata. Required trace passes with `92c3151e/4cecfee3`; aggregate
QA passes `812/812` artifacts (`778` required, `34` optional). No score
movement: this follows pinned Ikemen shared HitDef-parameter behavior rather
than claiming a standalone M.U.G.E.N ReversalDef `numhits` field. Helper-owned
ModifyReversalDef, Projectile reflection, negative/overflow parity, exact
combo/tick ordering, teams, rollback and full ReversalDef parity remain
blocked. See [issue
295](../.scratch/roadmap/issues/295-reversaldef-numhits-expressions.md).

## 2026-08-11 T720 ReversalDef sprite-priority expressions — closed-bounded, no score movement

Issue 294 closes the bounded direct/root `ReversalDef` and root/RedirectID
`ModifyReversalDef` path for `p1sprpriority` and `p2sprpriority`. Static,
dynamic, and mixed values resolve once in caller context; live omitted
components preserve their active values; accepted reversal contact applies
the P1/P2 roles through the existing sprite-priority telemetry. Required
trace passes with `12eb3cbb/616b336f`; aggregate QA passes `811/811`
artifacts (`777` required, `34` optional). No score movement: Helper-owned
ModifyReversalDef, Projectile reflection, default profile negotiation,
renderer ordering, exact contact timing, teams, rollback and full
ReversalDef parity remain blocked.

## 2026-08-11 T716 Dynamic `ModifyProjectile` state expressions — closed-bounded, no score movement

Issue 290 closes the Ikemen-only typed caller-context path for live
`ModifyProjectile p1stateno`, `p2stateno`, and `p2getp1state`. Root execution
resolves finite expressions once and applies them to the selected Projectile,
preserving the existing state-transition ownership path and authored-state
default for `p2getp1state`. Required trace passes with
`16fdce2c/8ed5f8c8`; aggregate QA passes `807/807` artifacts (`773` required,
`34` optional). No score movement: p1facing/p1getp2facing, reversals, guards,
exact tick parity, teams, rollback and full Projectile parity remain blocked.
See [issue
290](../.scratch/roadmap/issues/290-modifyprojectile-state-expressions.md).

## 2026-08-11 T715 Dynamic `ModifyProjectile p2facing` — closed-bounded, no score movement

Issue 289 closes the Ikemen-only typed caller-context path for live
`ModifyProjectile p2facing` in root and Helper ownership routes. Required trace
passes with `00ed1b03/b0693d99`; aggregate QA passes `806/806` artifacts
(`772` required, `34` optional). No score movement: guards, p1facing,
reversals, noautoturn, exact tick parity, teams, rollback and full Projectile
parity remain blocked. See [issue
289](../.scratch/roadmap/issues/289-modifyprojectile-p2facing-dynamic.md).

## 2026-08-11 T714 Dynamic Projectile `p2facing` — closed-bounded, no score movement

Issue 288 adds finite dynamic `p2facing` for root and Helper fresh
Projectiles. Required trace passes with `0aceed69/2d5de80d`; aggregate QA is
`805/805` artifacts (`771` required, `34` optional). No score movement:
ModifyProjectile, guards, p1facing, reversals, noautoturn, exact tick parity,
teams, rollback and full parity remain blocked. See [issue
288](../.scratch/roadmap/issues/288-projectile-p2facing-dynamic.md).

## 2026-08-11 T713 Projectile `p2facing` — closed-bounded, no score movement

Issue 287 closes root-owned fresh Projectile `p2facing` for accepted
unguarded hits. The Projectile facing drives the deferred target-facing latch,
while authored `GetHitVar(facing)` remains intact. Required trace passes with
`8c77a6f3/3d34f24a`; aggregate QA passes `804/804` artifacts (`770` required,
`34` optional). No score movement: caller expressions, Helper ownership,
`ModifyProjectile`, `p1facing`, guards, reversals, noautoturn, exact tick
parity, teams, rollback and full parity remain blocked. See [issue
287](../.scratch/roadmap/issues/287-projectile-p2facing.md).

## 2026-08-11 T712 Projectile `keepstate` release — closed-bounded, no score movement

Issue 286 releases transient Projectile `keepstate` after the active stun
window, before the next state-controller pass, while preserving the remaining
hit metadata. Required root and Helper traces pass with
`05c07804/3445d810` and `46636488/719f5d6e`. The global runner generated
`803/803` artifacts before timing out, so no aggregate score movement is
claimed. Exact actionRun timing, resource cleanup, hitonce, facing,
custom-state ownership, teams, rollback and full parity remain blocked. See
[issue 286](../.scratch/roadmap/issues/286-projectile-keepstate-release.md).

## 2026-08-11 T711 Projectile `keepstate` — closed-bounded, no score movement

Issue 285 extends static and caller-context Projectile `keepstate` into
bounded state preservation for direct and fresh root/Helper contacts. Accepted
hit/guard metadata remains available while automatic Common1/custom get-hit
entry and `moveType H` are suppressed. Required traces pass with
`79f6c56d/4d3ba455` and `ffa9c089/89be6138`; aggregate QA passes `801/801`
artifacts (`767` required, `34` optional). No score movement: resource
cleanup, `hitonce`, facing, custom-state ownership, exact timing, teams,
rollback and full parity remain blocked. See [issue
285](../.scratch/roadmap/issues/285-projectile-keepstate-state-preservation.md).

## 2026-08-11 T710 Projectile `keepstate` — closed-bounded, historical

Issue 284 supplied the typed metadata carrier consumed by T711. See [issue
284](../.scratch/roadmap/issues/284-projectile-keepstate-dynamic.md).

## 2026-08-11 T709 Projectile damage — closed-bounded, no score movement

Issue 283 wires finite typed `damage` pairs through fresh Projectile root/
Helper spawns and live Ikemen `ModifyProjectile`, with focused compiler,
runtime and caller tests green. Required traces are `a00bf194`, `a2c03112`
and `6bb8fe78`; full Vitest is `328/3849`, build is green, and aggregate QA
is `797/797` artifacts (`763` required, `34` optional). No score movement:
negative/healing, exact VM overflow/int32, teams, rollback and full Projectile
parity stay blocked. See [issue
283](../.scratch/roadmap/issues/283-projectile-damage-dynamic.md).

## 2026-08-11 T708 `ModifyProjectile` pause/super movetime closed-bounded - no score movement

T708 closes typed caller-context expressions for Ikemen-only live
`pausemovetime` and `supermovetime` in root and Helper `ModifyProjectile`
routes. Required traces pass with checksums `5cd62713/ba3572e4` (root) and
`6494c296/39225ffb` (Helper); aggregate QA is `794/794` artifacts (`760`
required, `34` optional). No score movement: exact Pause/SuperPause layering,
overflow/int32 behavior, broadcast, teams, rollback and full
Projectile/Helper parity remain outside the claim. See [issue
282](../.scratch/roadmap/issues/282-ikemen-modifyprojectile-pause-supermovetime.md).

## Previous checkpoint — T707 `ModifyProjectile` terminal animations closed-bounded - no score movement

T707 closes typed caller-context expressions for live Ikemen
`projhitanim`, `projremanim` and `projcancelanim` in root and Helper resolver
paths. Required trace `synthetic-imported-modifyprojectile-dynamic-terminal-anim`
passes with checksum `67162459` / final `96ff2073`; terminal-focused coverage
passes `25/25`. Aggregate QA passes `792/792` artifacts (`758` required,
`34` optional). No score movement: FFX, exact warning/overflow behavior,
invalid-action timing, namespace broadcast, teams, rollback and full Projectile
parity remain blocked.

## 2026-08-11 T706 Helper `ModifyProjectile projanim` closed-bounded - no score movement

T706 closes the Helper-owned live Ikemen `ModifyProjectile projanim` seam.
The typed one-value expression resolves once in Helper caller context, mutates
only the helper-parented Projectile, resets AIR playback, and preserves a
same-id player-owned Projectile. Required trace is `705a96e0/f47441cf`;
aggregate QA is `791/791` (`757` required, `34` optional), with focused
Helper/runtime coverage `140/140`. No score movement: FFX, namespace broadcast,
nested teams, terminal timing, rollback, and full Helper/Projectile parity stay
outside the claim. See [issue 280](../.scratch/roadmap/issues/280-helper-modifyprojectile-anim-dynamic.md).

## 2026-08-11 T705 `ModifyProjectile projanim` closed-bounded - no score movement

T705 is closed-bounded for the root-owned live Ikemen `ModifyProjectile
projanim` seam. Typed one-value static/dynamic caller-context resolution,
selected AIR action replacement, playback reset, and `ProjVar(id, index, anim)`
readback pass. Required trace checksum is `ed1f6e8a/43956cf2`; focused
compiler/spawn coverage is `162/162`; aggregate QA is `790/790` (`756`
required, `34` optional), with typecheck and diff hygiene green. No score
movement: FFX, exact invalid-action and negative/overflow behavior, Helper
mutation, terminal playback, teams, rollback, and full Projectile parity
remain outside the claim. See [issue
279](../.scratch/roadmap/issues/279-modifyprojectile-anim-dynamic.md).

## 2026-08-11 T704 Projectile `projanim` checkpoint - no score movement

T704 is closed-bounded for fresh root/Helper Projectile `projanim`: typed
static/dynamic caller-context resolution, existing AIR action lookup, and
selected-action/ownership/lifecycle evidence are required and pass. Root trace
checksum is `0e1c310f` / final `42890c95`; Helper is `4a23726b` / final
`93048c4f`; aggregate QA is `789/789` (`755` required, `34` optional), and
focused compiler/spawn coverage is `238/238`. No score movement: live
`ModifyProjectile` animation mutation, FFX prefixes, exact invalid-action
timing, teams, rollback, and full Projectile animation parity remain outside
the bounded claim.

## 2026-08-09 T703 Projectile `projhits` checkpoint - no score movement

T703 is closed-bounded for fresh root/Helper Projectile `projhits`: typed VT_Int
preservation, caller-context resolution, initial `hitsRemaining`/`hitsMax`,
`ProjVar`, and two-contact lifecycle/ownership evidence are required and pass.
Root checksum is `a670156c` / final `b2c3da50`; Helper checksum is `223d0865`
/ final `e6c928ed`; aggregate QA is `787/787` (`753` required, `34` optional),
full Vitest is `3827/3827` across `328` files, and typecheck, boundaries,
redirected-target boundaries, build, and diff hygiene pass. This bounded
checkpoint does not move the score. `ModifyProjectile`, exact VM
overflow/negative semantics, fine timing, rollback, and full Projectile parity
remain blocked. See [issue
277](../.scratch/roadmap/issues/277-projectile-hits-dynamic.md).

## 2026-08-09 T702 Projectile priority addendum - no score movement

Final T702 verification: `785/785` trace artifacts (`751` required, `34`
optional), full `3823/3823` Vitest across `328` files, typecheck, boundaries,
the `363`-module production build, and diff hygiene pass. Required root
Projectile priority trace is `cabff6a` / final `070ee2a6`; the Helper trace is
`6ac655e1` / final `2667efd6`.

Fresh root- and Helper-authored Projectiles now resolve dynamic `projpriority`
once in the original caller context, normalize it through the local bounded
`0..10` domain, and feed the existing clash/cancel/decrement path. This is a
bounded compatibility seam with no score movement: live `ModifyProjectile`,
exact Ikemen priority classes/overflow, fine tick ordering, nested helper/team
topology, rollback, and full Projectile parity remain blocked. See [issue
276](../.scratch/roadmap/issues/276-projectile-priority-dynamic.md).

## 2026-08-09 T701 Projectile misstime addendum - no score movement

Final T701 verification: `783/783` trace artifacts (`749` required, `34`
optional), full `3819/3819` Vitest across `328` files, typecheck, the
`363`-module production build, and diff hygiene pass. Required root Projectile
misstime trace is `90c039b1` / final `6868ca24`; the Helper trace is
`24a8156a` / final `ce715b91`.

Fresh root- and Helper-authored Projectiles now resolve dynamic `projmisstime`
once in the original caller context, truncate/clamp it through the bounded
Projectile-time domain, and gate the next accepted multi-hit contact. This is
a bounded compatibility seam with no score movement: live `ModifyProjectile`,
exact hitpause/tick ordering, negative/overflow semantics, nested helper/team
topology, rollback, and full Projectile timing parity remain blocked. See
[issue 275](../.scratch/roadmap/issues/275-projectile-misstime-dynamic.md).

## 2026-08-09 T700 Projectile removetime addendum - no score movement

Final T700 verification: `781/781` trace artifacts (`747` required, `34`
optional), full `3815/3815` Vitest across `328` files, typecheck, the
`363`-module production build, and diff hygiene pass. Required root Projectile
removetime trace is `63ef5373` / final `2824a6bb`; the Helper trace is
`c35241e4` / final `23b1bac3`.

Fresh root- and Helper-authored Projectiles now resolve dynamic
`projremovetime` once in the original caller context, truncate/clamp it
through the bounded Projectile-time domain, persist the timeout payload, and
complete timeout removal with root/Helper/parent ownership. This is a bounded
compatibility seam with no score movement: live `ModifyProjectile`, exact
terminal animation/tick preemption, bounds-removal ordering, negative/overflow
values, nested helper/team topology, rollback, and full Projectile lifecycle
parity remain blocked. See [issue
274](../.scratch/roadmap/issues/274-projectile-removetime-dynamic.md).

## 2026-08-09 T699 Projectile pause-pair addendum - no score movement

Final T699 verification: `779/779` trace artifacts (`745` required, `34`
optional), full `3812/3812` Vitest across `328` files, typecheck, the
`363`-module production build, and diff hygiene pass. Required root Projectile
pause-pair trace is `1380caf8` / final `54d26b60`; the Helper trace is
`f342d3ad` / final `a7e23112`.

Fresh root and Helper-authored Projectiles now resolve dynamic/mixed
`pausetime` and `guard.pausetime` pairs once in caller context. Accepted hit or
guard contact preserves Projectile-local pause payload and defender
`GetHitVar(hitshaketime)`, plus lifecycle, target, and Helper/root/parent
ownership. The first component is local `hitPauseRemaining`, not owner-player
HitPause. This is a bounded compatibility seam with no score movement: live
`ModifyProjectile`, exact stacking/preemption/tick order, negative/overflow
values, nested helper/team topology, rollback, and full Projectile timing
parity remain blocked. See [issue
273](../.scratch/roadmap/issues/273-projectile-pause-pairs-dynamic.md).

## 2026-08-09 T698 Projectile air.hittime addendum - no score movement

Final T698 verification: `777/777` trace artifacts (`743` required, `34`
optional), the full `3810/3810` Vitest suite across `328` files, typecheck,
the `363`-module production build, and diff hygiene pass. Required root
Projectile trace `synthetic-imported-projectile-dynamic-air-hittime` has
checksum `d95c52d1` and final checksum `cf7a06ba`; the Helper trace has
`c153c511` and `0e089466`.

Fresh root and Helper-authored Projectiles now resolve dynamic `air.hittime`
once in the original caller context. Accepted airborne non-falling contact
exposes `GetHitVar(hittime)=16` with authored air velocity, Projectile payload,
lifecycle, target links, and Helper/root/parent ownership. This remains a
bounded compatibility seam with no score movement: fresh default recalculation
beyond the local seam, live `ModifyProjectile`, ground/down/guard timing,
exact countdown/landing/physics, negative/overflow values, teams, rollback,
and full Projectile timing parity remain blocked. See [issue
272](../.scratch/roadmap/issues/272-projectile-air-hittime-dynamic.md).

## 2026-08-09 T696 Projectile guard.hittime addendum - no score movement

Final T696 verification: `773/773` trace artifacts (`739` required, `34`
optional), the full `3802/3802` Vitest suite across `328` files, typecheck,
the `363`-module production build, and diff hygiene pass. Required root Projectile trace
`synthetic-imported-projectile-dynamic-guard-hittime` has checksum `8fcfa764`
and final checksum `1217ab52`; the Helper trace has `aa2462b7` and `a94faad0`.

Fresh root and Helper-authored Projectiles now resolve dynamic
`guard.hittime` once in the original caller context. Accepted guard contact
exposes `GetHitVar(hittime)=17` with Projectile payload, lifecycle, target
links, and Helper/root/parent ownership. This remains a bounded compatibility
seam with no score movement: fresh default policy changes, live
`ModifyProjectile`, guard slide/control and air/down timing, exact
countdown/tick phase, negative/overflow values, teams, rollback, and full
Projectile timing parity remain blocked.

## 2026-08-09 T694 Helper Projectile down.hittime addendum - no score movement

Final T694 verification: `769/769` trace artifacts (`735` required, `34`
optional), `3794/3794` Vitest tests across `328` files, typecheck, the
`363`-module build, and diff hygiene pass. Required trace
`synthetic-imported-helper-projectile-dynamic-down-hittime` has checksum
`258bc45a` and final checksum `bd70be12`.

Helper-authored fresh Projectiles now resolve dynamic `down.hittime` once in
Helper caller context. Accepted lying contact exposes `GetHitVar(hittime)=17`
with Helper/root/parent ownership, Projectile payload, lifecycle, target links,
and imported Common1-style progression. This remains a bounded compatibility
seam with no score movement: live `ModifyProjectile`, non-zero down launch,
exact countdown/landing timing, negative/overflow values, teams, rollback, and
full Projectile timing parity remain blocked.

## 2026-08-09 T693 Projectile down.hittime addendum - no score movement

Final T693 verification: `768/768` trace artifacts (`734` required, `34`
optional), `3793/3793` Vitest tests across `328` files, typecheck, the
`363`-module build, and diff hygiene pass. Required trace
`synthetic-imported-projectile-dynamic-down-hittime` has checksum `800059f`
and final checksum `ac8eff48`.

Fresh root Projectiles now resolve dynamic `down.hittime` in caller context,
reset omission to the pinned `20`, and expose accepted lying-hit
`GetHitVar(hittime)` with Projectile payload, target, and lifecycle evidence.
This remains a bounded compatibility seam with no score movement: Helper
caller resolution is focused, while live `ModifyProjectile`, non-zero down
launch, exact countdown/landing timing, negative/overflow values, and full
Projectile timing parity remain blocked.

## 2026-08-09 T692 Helper ModifyHitDef down.hittime addendum - no score movement

Final T692 verification: `767/767` trace artifacts (`733` required, `34`
optional), `3790/3790` Vitest tests across `328` files, typecheck, the
`363`-module build, and diff hygiene pass. Required trace
`synthetic-imported-helper-modifyhitdef-dynamic-down-hittime` has checksum
`7e836797` and final checksum `3597b35b`.

Helper-owned live `ModifyHitDef down.hittime` now resolves typed caller-context
values, mutates the active Helper HitDef, and reaches an accepted lying hit
with `GetHitVar(hittime)=17`, Helper/root lifecycle, and target-link evidence.
This remains a bounded compatibility seam with no score movement: root fresh
defaults are T691; Projectile, nonzero down launch, exact countdown/landing
timing, and full Helper timing parity remain blocked.

## 2026-08-09 T691 direct HitDef down.hittime addendum - no score movement

Final T691 verification: `766/766` trace artifacts (`732` required, `34`
optional), `3788/3788` Vitest tests across `328` files, typecheck, the
`363`-module build, and diff hygiene pass. Required trace
`synthetic-imported-dynamic-direct-down-hittime` has checksum `e3cfd800` and
final checksum `6401d0a9`.

Fresh direct HitDefs now retain typed dynamic `down.hittime` in root/Helper
caller context, reset omission to the pinned fresh `20` default, and avoid
inheriting previous move metadata. Root-owned `ModifyHitDef` replaces or
preserves the live scalar, and an accepted lying hit exposes
`GetHitVar(hittime)=17` through imported Common1-style progression. This is a
bounded timing seam only; no score movement: Projectile breadth, nonzero down
launch, Helper-owned live mutation, exact countdown/landing timing, and full
M.U.G.E.N/Ikemen timing parity remain blocked.

## 2026-08-09 T690 fresh Projectile guard.velocity addendum - no score movement

Final T690 verification: `765/765` trace artifacts (`731` required, `34`
optional), `3784/3784` Vitest tests across `328` files, typecheck, the
`363`-module build, and diff hygiene pass. Required trace
`synthetic-imported-projectile-dynamic-guard-velocity` has checksum
`781a8381` and final checksum `968a063c`.

Fresh root/Helper Projectiles now retain typed static/mixed/dynamic
`guard.velocity` X/Y/Z, resolve caller-context values once, derive missing
fresh X/Z from effective ground velocity, default fresh Y to zero, and expose
the accepted ground-guard vector through GetHitVar/physics, target, and
Projectile lifecycle evidence. This is a bounded pinned-Ikemen seam, not a
score movement: live mutation, other vector defaults, exact timing/topology,
and full M.U.G.E.N/Ikemen Projectile parity remain excluded.

## 2026-08-09 T689 fresh Projectile ground.velocity addendum — no score movement

Final T689 verification: `764/764` trace artifacts (`730` required, `34`
optional), `3780/3780` Vitest tests across `328` files, typecheck, the
`363`-module build, and diff hygiene pass. Required trace
`synthetic-imported-projectile-dynamic-ground-velocity` has checksum
`7782fd2a` and final checksum `494ad91d`.

Fresh root/Helper Projectiles now retain typed static/mixed/dynamic
`ground.velocity` X/Y/Z, resolve caller-context values once, default missing
fresh siblings to zero, and expose the accepted grounded-hit vector through
GetHitVar/physics, target, and Projectile lifecycle evidence. This is a
bounded pinned-Ikemen seam, not a score movement: dynamic `n`, live mutation,
other vector families, exact timing/topology, and full M.U.G.E.N/Ikemen
Projectile parity remain excluded.

## 2026-08-09 T688 live ModifyProjectile ground.velocity addendum — no score movement

Final T688 verification: `763/763` trace artifacts (`729` required, `34`
optional), `3776/3776` Vitest tests across `328` files, typecheck, the
`363`-module build, and diff hygiene pass. Required trace
`synthetic-imported-modifyprojectile-dynamic-ground-velocity` has checksum
`0cda3247`.

Root-owned live `ModifyProjectile ground.velocity` now retains typed
static/mixed/dynamic X/Y/Z components, evaluates them once in root caller
context, and replaces selected Projectile components while preserving omitted
siblings. The required grounded-hit trace proves resulting GetHitVar/physics,
target link, and Projectile lifecycle. This is a bounded Ikemen owner-side
seam, not a score movement: Helper-owned mutation, dynamic `n`, fresh default
recalculation, exact timing/topology, cornerpush, and full M.U.G.E.N/Ikemen
Projectile parity remain excluded.

## 2026-08-09 T687 live ModifyProjectile guard.velocity addendum — no score movement

Final T687 verification: `762/762` trace artifacts (`728` required, `34`
optional), `3772/3772` Vitest tests across `328` files, typecheck, the
`363`-module build, and diff hygiene pass. Required trace
`synthetic-imported-modifyprojectile-dynamic-guard-velocity` has checksum
`f1a7b429` and final checksum `df93f663`.

Root-owned live `ModifyProjectile guard.velocity` now retains typed
static/mixed/dynamic components, evaluates them once in root caller context,
and broadcasts Ikemen's zero-filled one/two/three-component replacement to
selected Projectiles. The required ground-guard trace proves the resulting
GetHitVar/guard-physics vector, target link, and Projectile lifecycle. This is
a bounded Ikemen owner-side seam, not a score movement: Helper-owned
`ModifyProjectile` remains blocked by the upstream helper guard, as do dynamic
`n`, fresh default recalculation, exact timing/topology, cornerpush, and full
M.U.G.E.N/Ikemen Projectile parity.

## 2026-08-09 T686 live ModifyProjectile air.velocity addendum — no score movement

Final T686 verification: `761/761` trace artifacts (`727` required, `34`
optional), `3768/3768` Vitest tests across `328` files, typecheck, the
`363`-module build, and diff hygiene pass. Required trace
`synthetic-imported-modifyprojectile-dynamic-air-velocity` has checksum
`c335ca9d` and final checksum `2ecb639a`.

Root-owned live `ModifyProjectile air.velocity` now retains typed
static/mixed/dynamic components, evaluates them once in root caller context,
and broadcasts Ikemen's zero-filled one/two/three-component replacement to
selected Projectiles. The required airborne-hit trace proves the resulting
physics/GetHitVar vector, target link, and Projectile lifecycle. This is a
bounded Ikemen owner-side seam, not a score movement: Helper-owned
`ModifyProjectile` remains blocked by the upstream helper guard, as do dynamic
`n`, fresh default recalculation during mutation, exact timing/topology, and
full M.U.G.E.N/Ikemen Projectile parity.

## 2026-08-09 T685 live ModifyProjectile airguard.velocity addendum — no score movement

Final T685 verification: `760/760` trace artifacts (`726` required, `34`
optional), `3764/3764` Vitest tests across `328` files, typecheck, the
`363`-module build, and diff hygiene pass. Required trace
`synthetic-imported-modifyprojectile-dynamic-airguard-velocity` has checksum
`c4d55bd9` and final checksum `f0982ef8`.

Root-owned live `ModifyProjectile airguard.velocity` now retains typed
static/mixed/dynamic components, evaluates them once in root caller context,
and broadcasts Ikemen's zero-filled one/two/three-component replacement to
selected Projectiles. The required airborne-guard trace proves the resulting
physics/GetHitVar vector, target link, and Projectile lifecycle. This is a
bounded Ikemen owner-side seam, not a score movement: Helper-owned
`ModifyProjectile` remains blocked by the upstream helper guard, as do dynamic
`n`, fresh default recalculation during mutation, exact timing/topology, and
full M.U.G.E.N/Ikemen Projectile parity.

## 2026-08-09 T684 live ModifyProjectile down.velocity addendum — no score movement

Final T684 verification: `759/759` trace artifacts (`725` required, `34`
optional), `3760/3760` Vitest tests across `328` files, typecheck, the
`363`-module build, and diff hygiene pass. Required trace
`synthetic-imported-modifyprojectile-dynamic-down-velocity` checksum is
`f0bd0d1a`; final checksum is `0664ee31`.

Root-owned live `ModifyProjectile down.velocity` now preserves dynamic/mixed
expression fields through typed compilation, evaluates supplied values once
in the original caller context, and broadcasts the pinned Ikemen replacement
vector to selected Projectiles. One and two authored components intentionally
zero-fill omitted siblings (`[x,0,0]` / `[x,y,0]`); a full triple writes all
three components, while omission is a no-op. The required lying-hit trace
proves the resulting physics/GetHitVar vector, target link, and Projectile
payload lifecycle. This is a bounded owner-side compatibility seam, not a
score movement: Helper-owned ModifyProjectile, dynamic `n`, fresh
default/inheritance recalculation during mutation, exact tick/landing order,
team/rollback topology, and full Projectile parity remain blocked.

## 2026-08-09 T651-T678 direct contact timing, admission, and velocity addendum — no score movement

Final T678 verification: `751/751` trace artifacts (`717` required, `34`
optional), `3739/3739` Vitest tests across `328` files, typecheck, and the
`363`-module build pass. The T678 required
`synthetic-imported-helper-modifyhitdef-dynamic-airguard-velocity` trace
checksum is `3eeaa993`; final checksum is `438713d1`.

Direct HitDef pause pairs now preserve independent attacker pause and receiver
hit-shake time for root and Helper contacts. Dynamic direct `ground.hittime`
now resolves in root/Helper caller context, uses the official fresh zero
default, supports bounded live ModifyHitDef replacement, and feeds grounded
stun plus `GetHitVar(hittime)`. Dynamic direct `ground.slidetime` also reaches
accepted grounded-hit `GetHitVar(slidetime)`. Dynamic direct `guard.hittime`
uses the pinned profile-specific fresh default and reaches accepted guard stun
plus `GetHitVar(hittime)`. Dynamic `guard.slidetime`, `guard.ctrltime`, and
`airguard.ctrltime` complete the bounded fresh-default chain and ground/air
guard GetHitVar metadata. Dynamic `air.hittime` uses fresh default 20 and feeds
airborne non-fall stun. T659 adds dynamic legacy scalar `guard.dist` and a
precontact horizontal latch. T660 adds dynamic and mixed direct
`ground.velocity` X/Y with live component-wise mutation, accepted grounded
velocity, and GetHitVar readback. T661 adds the official fresh omitted
`0,0,0` reset through root/Helper activation and preserves live ModifyHitDef
omission. T662 adds caller-resolved direct and root-owned live
`guard.velocity` X, fresh inheritance, accepted ground guard, and live
omission preservation. T663 adds caller-resolved direct `airguard.velocity`
X/Y and official omission defaults. T664 adds exact X/Y live ModifyHitDef
replacement with Z/omission preservation and accepted airborne guard. T665
adds the pinned-Ikemen one-component form with fresh Y derivation and live Y/Z
preservation. T666 adds the pinned-Ikemen missing-Z fresh direct-HitDef
default. T667 adds the same missing-Z default for fresh root-owned Projectiles.
T668 adds Helper-created Projectile root/parent ownership and accepted-contact
evidence for that shared default. T669 completes the same missing-component
defaults in static imported HitDef metadata. T670 selects the existing static
air vector for accepted root/Helper direct airborne hits. T671 adds root/Helper
caller-resolved X/Y expressions. T672 adds live root-owned ModifyHitDef X/Y
mutation with component preservation. T673 adds fresh root/Helper
`down.velocity` X/Y expressions with air-vector inheritance and lying-hit
consumption. T674 adds live root-owned ModifyHitDef X/Y mutation with
component-wise preservation and a required lying-hit trace. T675 adds the
pinned-Ikemen-only live dynamic Z component, preserving active X/Y and proving
the resulting vector through the lying-hit trace. T676 adds the same live
dispatch for Helper-owned callers with X/Y/Z component preservation and
required lying-hit evidence. T677 adds Helper-owned live `ModifyHitDef
air.velocity` X/Y mutation with omitted-component preservation and accepted
airborne physics/GetHitVar evidence. T678 adds Helper-owned live
`ModifyHitDef airguard.velocity` X/Y mutation with omitted-component and Z
preservation, accepted airborne-guard physics/GetHitVar evidence, and
Helper/root/parent ownership. The global totals are refreshed after the T678
gate. T679 is source-mapped but unclaimed. These are
bounded timing, admission, and
velocity seams, not full HitDef or tick-order parity. Compatibility scores
remain unchanged.

## 2026-08-02 T535 `GetHitVar(hitflag)` addendum — no score movement

The explicit Ikemen last-hit read model now preserves effective direct and
Projectile HitDef `hitflag` values, defaults omission to `MAF`, and evaluates
static equality/inequality filters with M→H/L overlap. Five focused files / 238
tests pass and the existing trace corpus remains `686/686`. This is a bounded
read-only metadata seam; compatibility scores remain unchanged.

## 2026-08-02 T528 KO velocity-add addendum — no score movement

The explicit `ikemen-go` profile now reads separate `xveladd`/`yveladd`
metadata on lethal direct and player-owned Projectile contacts. Focused
coverage passes 801/801 tests and the aggregate trace corpus passes 684/684
(650 required, 34 optional). Non-KO/non-profile reads retain zero; helper and
full KO-physics parity remain bounded. Compatibility scores remain unchanged.

## 2026-08-02 T527 authored multi-hit addendum — no score movement

The explicit `ikemen-go` profile now gates one player-owned Projectile with
authored `numhits` through two eligible contacts and a guarded break. Trace
`c6582760` / `78e24146` and aggregate 683/683 pass, while static/imported
fallback, helper/team arbitration and full combo parity remain bounded. T528
is closed-bounded by the T528 slice above. Compatibility scores remain
unchanged.

## 2026-08-01 T478/T479 presentation addendum — no score movement

CommonFX/FightFX hit-spark packages now preserve authored `fx.scale` and apply
the package/character `localcoord` ratio before sprite binding. This is a
bounded visual presentation claim backed by loader/importer/asset/renderer
tests, not full FightFX parity; exact timing, layering, palette, audio, cache,
screenpack ownership and browser visual equivalence remain open. Scores stay
unchanged pending the independent score-adjudication gates.

## 2026-08-01 T480 combat addendum — no score movement

Ikemen `fall.zvelocity` now has a bounded compiler-to-`combatDepth` path with
`GetHitVar` aliases and focused regression coverage. This improves a named
runtime slice but does not add a second legal imported route, full Z physics,
Common1 bounce parity, or a release gate; compatibility scores remain unchanged.

## 2026-08-01 T481 combat addendum — no score movement

HitDef `ground/air/down/guard/airguard.velocity` now carries an optional
authored Z component through imported and player-owned Projectile contact, with
explicit results reaching `combatDepth.velocity`. The 251/251 focused and
324/3317 full gates are green, but this remains one bounded runtime seam: no
second legal imported route, Common1 Z physics, ModifyHitDef mutation or release
adjudication was added. Scores remain unchanged.

## 2026-08-01 T482 combat addendum — no score movement

Static `ModifyHitDef` now retains authored vector-Z fields on an active normal
HitDef and leaves them on the shared T481 direct/projectile contact path. This
is a narrow metadata mutation seam; dynamic expressions, Common1 depth physics,
and final adjudication remain open. Scores remain unchanged.

## 2026-08-01 T483 combat addendum — no score movement

Static HitDef/Projectile `xaccel`, `yaccel` and `zaccel` now reach direct and
projectile defender `GetHitVars`, including imported state moves and official
zero defaults for omitted horizontal/depth values. This is metadata coverage,
not acceleration/depth physics or a new legal imported route; scores remain
unchanged.

## 2026-08-01 T484 combat addendum — no score movement

Static `ModifyHitDef` can now mutate active HitDef `xaccel`, `yaccel` and
`zaccel` metadata before direct/projectile contact. This closes a narrow
metadata continuation only; dynamic mutation, physics and adjudication remain
open, so scores remain unchanged.

## 2026-08-01 T485 combat addendum — no score movement

Supported scalar HitDef/ModifyHitDef acceleration expressions now evaluate in
the active controller context before writing typed hit metadata. This closes
only dynamic metadata evaluation; acceleration physics, scaling, and score
adjudication remain unchanged.

## 2026-08-01 T486 combat addendum — no score movement

Ikemen-only `GetHitVar(zvel)` now reads the selected HitDef/Projectile depth
velocity with a zero omitted-depth fallback. This is a read-model seam only;
depth physics and score adjudication remain unchanged.

## 2026-08-01 T487 combat addendum — no score movement

Ikemen `HitVelSet z` now carries the typed nonzero flag into the runtime
combat-depth velocity channel. This closes one controller handoff only; full Z
physics, dynamic vectors and score adjudication remain unchanged.

## 2026-08-01 T488 combat addendum — no score movement

Direct HitDef and player-owned Projectile contacts now preserve the five
Ikemen HitDef velocity families for dotted `GetHitVar` readback. This closes a
metadata seam only; dynamic vectors, depth physics and score adjudication remain
unchanged.

## 2026-08-01 T489 combat addendum — no score movement

Direct HitDef and player-owned Projectile contacts now retain the first and
second HitDef damage components for `GetHitVar(hitdamage|guarddamage)`. This is
readback metadata only; resource/scaling semantics and score adjudication remain
unchanged.

## 2026-08-01 T490 combat addendum — no score movement

Direct HitDef, player-owned Projectile, and imported moves now retain separate
ground, air, and fall reaction animation types for the Ikemen dotted
`GetHitVar` aliases. This closes a readback metadata seam only; Common1
reaction choreography, dynamic values and score adjudication remain unchanged.

## 2026-07-28 post-DA32-026 audit — no score movement

T407…T417 and DA32-001…026 add useful focal evidence, but they do not add a
second legal imported route, full replay, reviewed source families, a second
consumer or a release gate. DA31-017…040 remain model-level at their stated
ceilings. Scores remain: sandbox **65**, MUGEN-lite **36**, MUGEN MVP **20**,
full MUGEN **10-12**, IKEMEN **6-8**, Studio **25**.

See the [audit](research/2026-07-28-daily-roadmap-architecture-audit-post-da32-026.md).

## Historical 2026-07-27 post-DA30-120 audit — no score movement

Machine rows reach DA30-120. The first open consecutive written-clause gate is
DA30-021, so the proposed human cursor remains DA30-020 pending DA31-007.
Model-only tasks, generated records, native fixtures, and docs add no imported
compatibility, product, visual, SDK, or release credit.

Scores remain: sandbox **65**, MUGEN-lite **36**, MUGEN MVP **20**, full MUGEN
**10-12**, IKEMEN **6-8**, Studio **25**. See the
[audit](research/2026-07-27-daily-roadmap-architecture-audit-post-da30-120.md)
and [DA31 roadmap](DA31_EVIDENCE_ADOPTION_ROADMAP.md).

## Historical 2026-07-27 post-DA30-025 audit — no score movement

Current machine control records DA30-025. Written acceptance remains partial
for the current formal, Play, and Studio/Inspect gates. Their narrow facts add
no denominator-backed compatibility, product, visual, SDK, or release credit.

Scores remain: sandbox **65**, MUGEN-lite **36**, MUGEN MVP **20**, full MUGEN
**10-12**, IKEMEN **6-8**, Studio **25**. Native/browser observations and docs
carry zero imported-package breadth credit. See the
[post-DA30-025 audit](research/2026-07-27-daily-roadmap-architecture-audit-post-da30-025.md).

## 2026-07-27 DA29 completion audit - no score movement

The audit rejects the generated DA29-200 watermark and grants no new runtime,
product, visual, compatibility, SDK, or release credit. Useful DA29 artifacts
remain candidates for clause-level revalidation. Scores stay
`65 / 36 / 20 / 10-12 / 6-8 / 25`. DA30 adds 120 recovery and completion cuts;
task counts and docs do not move scores. See the
[completion audit](research/2026-07-27-da29-completion-audit-and-da30-recovery.md)
and [DA30 roadmap](DA30_RECOVERY_ROADMAP.md).

## Historical 2026-07-26 post-DA28 expanded audit - no score movement

The audit introduced a 200-task plan and no executable evidence. Scores stayed
`65 / 36 / 20 / 10-12 / 6-8 / 25`. DA28 remains closed at written ceilings;
the generated queue remains empty until DA29-001. See the
[expanded audit](research/2026-07-26-expanded-master-roadmap-audit-post-da28.md)
and [master roadmap](MASTER_REVIEW_ROADMAP.md).

## 2026-07-26 DA28-05 score adjudication hold - no score movement

**Selector:** [docs/AUTHORITY_SELECTOR.md](AUTHORITY_SELECTOR.md).
DA28-05 materializes score adjudication from corpus v1.2 and current evidence.
`movement=none`. Scores stay `65 / 36 / 20 / 10-12 / 6-8 / 25`.
See [P0 closeout](research/2026-07-26-da28-p0-browser-corpus-scores.md).

## 2026-07-26 DA28-02 global re-gate - no score movement

**Selector:** [docs/AUTHORITY_SELECTOR.md](AUTHORITY_SELECTOR.md).
Global evidence is DA28-02 at **`32466c6e`**: 270 files / 2850 tests / 663
traces plus build and boundaries. Scores stay held after DA28-05.
See [global checkpoint](research/2026-07-26-global-checkpoint-da28-02.md).

## 2026-07-26 post-DA27-09 audit - no score movement (historical)

Current HEAD was `aa85cb84`; formal/global was still `b7d23801` at audit time.
DA27 drained; scores held. See the
[post-DA27-09 audit](research/2026-07-26-daily-roadmap-architecture-audit-post-da27-09.md).

## 2026-07-26 DA27-06 global + score hold - no score movement (historical)

**Selector:** [docs/AUTHORITY_SELECTOR.md](AUTHORITY_SELECTOR.md).
Global evidence was DA27-06 at **`b7d23801`**: 268 files / 2845 tests / 663
traces plus build and boundaries. Superseded by DA28-02. Scores remain
`65 / 36 / 20 / 10-12 / 6-8 / 25`. See
[global checkpoint](research/2026-07-26-global-checkpoint-da27-06.md).

## 2026-07-26 score adjudication hold - no score movement (historical)

**Selector:** [docs/AUTHORITY_SELECTOR.md](AUTHORITY_SELECTOR.md).
DA26-21 `ScoreAdjudication/v1` holds scores with per-lane denominator/SHA refs.
Docs-only rows contribute zero. Scores remain `65 / 36 / 20 / 10-12 / 6-8 / 25`.
Historical global pin before DA27-06 was `7d9b15f8`. Focal T406. Visual/product
T342. See [ladder drain](research/2026-07-26-da26-ladder-drain.md).

## 2026-07-26 audit note - no score movement (historical control)

**Selector:** [docs/AUTHORITY_SELECTOR.md](AUTHORITY_SELECTOR.md).
Historical global evidence DA26-08 at **`7d9b15f8`**: 242 files / 2768 tests /
663 traces. Scores remain `65 / 36 / 20 / 10-12 / 6-8 / 25`. See
[AUTHORITY_SELECTOR](AUTHORITY_SELECTOR.md).

## 2026-07-18 historical T288 bounded FightScreen intro-skip character-reset checkpoint

The current implementation frontier is HEAD `a12a2672`, Entry 562, and
Wayfinder T288. The source-shaped shutter edge now resets roots before the
fighter pass, enters state `0`, restores stage position/idle/control state,
clears transient target/hit/guard/command memory, and removes owner-scoped
effects while preserving round resources, variables, team state, and
compatibility history. The focused gate is 5 files / 392 tests plus TypeScript
7 typecheck and diff hygiene. The broad checkpoint is pending.

This does not move a score. Exact global asset clearing, announcement or
round/fight display suppression, dialogue, Common1/ZSS, motif/localcoord,
teams/Turns, rollback/netplay, and full parity remain blocked.

## 2026-07-18 T287 bounded FightScreen intro shutter/skip checkpoint

The current implementation frontier is HEAD `4d615c8f`, Entry 561, and
Wayfinder T287. Scores remain **65 / 36 / 20 / 10-12 / 6-8 / 25**. Imported
`shutter.time` and `shutter.col` now flow through loader/runtime timing,
edge-triggered skip, the raw `roundnotskip` guard, `RuntimeRoundShutter/v0`,
and symmetric Three.js bars. The focused gate is 4 files / 300 tests. The
full checkpoint also passes TypeScript 7.0.2, 233 files / 2484 tests, Vite
317 modules, 633/633 traces, repository/redirect boundaries, CSS budget, and
64 browser capture paths with 0 console issues and 0 page errors.

This does not move a score. Character asset/position/state reset, exact
announcement or round/fight display skipping, motif/dialogue, Common1/ZSS,
screenpack transforms, teams/Turns, rollback/netplay, and full parity remain
blocked. The existing Vite chunk-size warning remains non-blocking.

## 2026-07-18 T286 bounded FightScreen round-intro checkpoint

The current implementation frontier is HEAD `e978fa3c`, Entry 560, and
Wayfinder T286. Scores remain **65 / 36 / 20 / 10-12 / 6-8 / 25**. Imported
`start.waittime` and `ctrl.time` now flow through loader, runtime timing,
`RuntimeRoundIntro/v0`, and the existing round phase world; the live timer and
finish decision wait until `fight`. Focused loader/runtime/round evidence is
3 files / 289 tests. The full checkpoint also passes TypeScript 7.0.2,
233 files / 2480 tests, Vite 316 modules, 633/633 traces,
repository/redirect boundaries, CSS budget, and 64 browser capture paths with
0 console issues and 0 page errors.

This does not move a score. Announcement/shutter/skip, character intro
control/reset, exact Fight tick order, motif/dialogue, Common1/ZSS,
screenpack transforms, teams/Turns, rollback/netplay, and full parity remain
blocked. The existing Vite chunk-size warning remains non-blocking; no score
movement follows from this bounded phase/timer evidence.

## Previous 2026-07-18 T285 bounded FightScreen round-start checkpoint

The current implementation frontier is HEAD `c688f04d`, Entry 559, and
Wayfinder T285. Scores remain **65 / 36 / 20 / 10-12 / 6-8 / 25**. Imported
`fadein.time`/`fadein.col`/`fadein.anim`/`fadein.snd` now have source-backed
loader, reset-owned pre-round snapshot, FightFX AIR/SFF renderer, reverse
fallback, and global audio evidence. The grouped checkpoint passes 233/233
test files, 2479/2479 tests, TypeScript 7, Vite build, 633/633 traces,
repository/redirect/CSS gates, and 64 browser capture paths with zero
console/page errors.

This does not move a score. Exact intro/shutter/frame-start ordering, timer or
input gating, screenpack localcoord transforms, motif/dialogue/skip,
Common1/ZSS, teams/Turns, rollback/netplay, and full MUGEN/IKEMEN parity remain
blocked. The next score-relevant work still requires current
corpus/independent-breadth adjudication and a separate source-backed gate.

## 2026-07-18 post-Wayfinder-256 architecture audit

The audited tuple is HEAD `b241cc65`, Entry 555, and the T266-T268 closeout.
Scores stay
**65 / 36 / 20 / 10-12 / 6-8 / 25**. Wayfinders 230-256 add substantial
bounded product/runtime/loader/input evidence, but no written band
adjudication. The latest declared checkpoint is 231/231 files, 2435/2435 tests
and 633/633 traces.

The next score review requires a current corpus rebuild, a second independent
character-centered legal journey, and a separate adjudication. Stateful SOCD
1/3 is now bounded at the reconstructed Set boundary, while raw event/InputBuffer
parity and match-level config ownership remain open. Common.Fx lacks browser
proof; source authority has a manifest contract but normative checkout
reconciliation and semantic review remain open.
Documentation and architecture do not move scores. See
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.

## Historical 2026-07-16 post-Wayfinder-229 architecture audit

The audited tuple is HEAD `83f85bae`, Entry 555, and Wayfinder 229. Scores stay
**65 / 36 / 20 / 10-12 / 6-8 / 25**. Snapshot v1.1 now records two required
legal passing routes, but its embedded claim strings remain stale and the new
route is stage-centered rather than independent character breadth. The latest
declared full suite is Wayfinder 221 at 2294/2294; subsequent focused/QA
closeouts are not a whole-HEAD suite claim. The next score review requires a
versioned claim reconciliation, a separate written adjudication, and later a
second character-centered legal journey. Architecture, product gates, and
documentation do not move compatibility scores. See
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md`.

## Historical 2026-07-16 post-Wayfinder-209 architecture audit

Entry 555 is the maximum numbered entry and Wayfinder 209 is the later
unnumbered runtime checkpoint. The branch reports 633/633 traces and 2262/2263
full-suite tests. `CompatibilityCorpusSnapshot/v1` is materialized but still
represents one required route, zero portable routes, and a hardcoded old source
revision; it does not establish independent breadth or freshness. Scores stay
**65 / 36 / 20 / 10-12 / 6-8 / 25**. The next score consideration requires a
fresh snapshot, a second repository-authored CC0 route with loader/trace/
browser proof, and a separate written adjudication. Architecture and docs do
not move scores. See
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.

## 2026-07-16 Entry 555 runtime evidence

Entry 555 closes a bounded `ProjTypeCollision` runtime policy: typed
`AssertSpecial` capability, strict projectile `Clsn2` contact, `HitFlag = P`
cancel, and paired-player `Clsn2` direct/priority admission. Focal 110/110,
TypeScript 7, build, boundaries, and 633/633 trace artifacts pass. Scores
remain **65 / 36 / 20 / 10-12 / 6-8 / 25**. This is a runtime evidence slice,
not a new written compatibility-band threshold. Exact projectile trade
ordering, remaining `p2` collision parameters, rollback/netplay, and full
MUGEN/IKEMEN parity remain open. Full-suite residual failures are recorded in
`docs/reports/2026-07-16-projtypecollision-v1-closeout.md`.

## Historical 2026-07-15 post-Entry-554 architecture audit

Entry 554 remains the maximum numbered backlog entry. Audited HEAD 05d85137
establishes a later report frontier at 633/633 traces, 599 required and 34
optional, through bounded root/helper auxiliary Target resource RedirectID.
The work is concentrated in one ownership/controller family and does not meet
a new score threshold. Scores remain **65 / 36 / 20 / 10-12 / 6-8 / 25**.

Next score consideration requires a materialized compatibility snapshot plus
materially independent legal package/stage breadth and a separate written
adjudication. Dispatch refactors, Turns architecture, scanner consumers,
Studio trust contracts, asset release records, and docs do not move MUGEN or
IKEMEN scores by themselves. The detailed Studio 25 and modular-engine 10
estimates must stay distinct even though the summary table currently combines
their horizon label. See
docs/research/2026-07-15-daily-roadmap-architecture-audit-post-entry-554.md.

## Historical 2026-07-15 Entry 549 architecture audit

The committed frontier is Entry 549 with 610/610 declared traces. Entries
531-549 add bounded stage, Studio/scanner/provenance, identity, and root-only
RedirectID evidence, but do not satisfy another written score-band threshold.
Scores remain **65 / 36 / 20 / 10-12 / 6-8 / 25**. The dirty State -1
TargetPowerAdd follow-up is not counted. Next score consideration requires a
materialized corpus snapshot and new independent package breadth; docs,
refactors, scanner consumers, and product trust contracts do not move scores.
See `docs/research/2026-07-15-daily-roadmap-architecture-audit-entry-549.md`.

## 2026-07-14 Entry 530 score-band adjudication

Entry 530 applies the written `36-55` practical MVP criterion to the expanded
compatibility corpus. Passed local official KFM movement, attack/special,
guard, get-hit, fall, and recovery traces plus visible loader/Studio reports
meet the bounded criterion for the first point in that band. Practical MUGEN
compatibility moves from **35 to 36 / 100**. The private sandbox remains 65,
MUGEN 1.0/1.1 MVP remains 20, full MUGEN remains 10-12, IKEMEN remains 6-8,
and Creator Studio remains 25. This is a minimum threshold promotion, not
public breadth, commercial redistribution, or full MUGEN/IKEMEN parity.

## 2026-07-14 Entry 525 compatibility corpus closeout

Entry 525 adds the first immutable `CompatibilityCorpus/v0` denominator over
the existing journey evidence. Required legal, portable legal, and optional
private routes remain separate, and the aggregate exposes package identity,
route coverage, unsupported-feature density, diagnostics, and checksum without
copying binary payloads. Focused 3/3 tests, the full 210-file / 2125-test
suite, TypeScript 7 build, boundaries, CSS budget, and 600/600 trace artifacts
pass. Scores remain unchanged: this is an evidence-index boundary, not a new
compatibility route. Written score-band adjudication, an independent legal
stage/package, public breadth, and full MUGEN/IKEMEN parity remain open.

## 2026-07-14 Entry 518 focal closeout

Entry 518 closes bounded sequential per-root round context. The reset
transaction preserves the live counter, CNS exposes `RoundNo`/
`RoundsExisted`/`MatchOver`, and the required imported trace proves two KO
transitions through rounds 1 -> 2 -> 3 for both roots. Focal coverage passes
202 focal tests and the full suite passes 207 files / 2102 tests; TypeScript 7,
build, boundaries, CSS budget, desktop/mobile/Studio smoke, and 600/600 traces
(566 required / 34 optional) pass. Scores remain unchanged. Turns continuation,
winpose/motif ownership, rollback/netplay, and full MUGEN/IKEMEN parity remain
open.

## 2026-07-14 Entry 517 focal closeout

Entry 517 closes bounded match outcome and imported state-5900 next-round
sequencing. Focused outcome/state/Playable/round/trace coverage, TypeScript 7,
build, architecture/CSS gates, 599/599 trace artifacts, and desktop/mobile/
Studio smoke pass. Scores remain unchanged: this is a runtime evidence
boundary, not full tournament or compatibility parity. Exact winpose/motif,
per-actor round context, automatic Turns continuation, rollback/netplay, and
full MUGEN/IKEMEN parity remain open.

## 2026-07-14 Entry 516 planning reconciliation

The committed evidence frontier remains entry 517: 599/599 declared traces,
565 required and 34 optional, with scores unchanged at 65 / 35 / 20 / 10-12 /
6-8 / 25. This audit changes no score. `CompatibilityCorpus/v0` must expose the
legal/portable/optional denominator and unsupported/failure density before an
adjudicator can move a compatibility band. Match-outcome/state-5900 is now
evidence-backed by Entry 517; the score still does not move. See
`docs/reports/2026-07-14-match-outcome-state-5900.md`.

## 2026-07-14 Entry 516 focal closeout

Entry 516 closes the bounded imported red-life/resource transition between a
completed round and the next numbered round. Focused resource/round/trace
coverage passes 592/592; the Playable/trace set passes 778/778. TypeScript 7,
build, 598/598 trace artifacts, architecture/CSS gates, and desktop/mobile/
Studio Playwright smoke pass. Scores do not move. Match-over adjudication,
state-5900 choreography, complete variable/map/remap persistence,
rollback/netplay, and full MUGEN/IKEMEN parity remain separate gates.

## 2026-07-14 Entry 515 focal closeout

Entry 515 adds bounded runtime-owned red-life presentation to solo and
IKEMEN team HUD paths through normalized lifebar slot data. Focused 17/17
tests, TypeScript 7, build, 597/597 trace artifacts, architecture/CSS gates,
and desktop/mobile Playwright smoke pass. Scores do not move. Exact
screenpack/motif ownership, animated recovery, round persistence,
rollback/netplay, native HUD triggers, and full parity remain separate gates.

## 2026-07-14 Entry 514 focal closeout

Entry 514 closes bounded imported red-life reset/rebind lifecycle. Typed team
handoff reconciles the root-only bank immediately, standby/active changes do
not rebuild its topology, and match reset rebinds shared value from the
representative root. Focused lifecycle, handoff, and trace coverage passes
588/588 tests. The accumulated gate passes 203 test files / 2082 tests under
`--maxWorkers=4`, TypeScript 7 typecheck, build, 597/597 trace artifacts,
architecture boundaries, CSS budget, and desktop/mobile Playwright smoke;
scores do not move. The unconstrained default Vitest run still has one
byte-level JSZip round-trip nondeterminism, so the bounded worker command is
the reproducible gate. Exact multi-round persistence, native triggers,
projectile/Explod/team-helper sharing, HUD bars, rollback/netplay, and full
parity remain separate gates.

## 2026-07-14 Entry 513 focal closeout

Entry 513 closes bounded imported root red-life `TeamLifeShare` behavior through
`RuntimeRedLifeShareSystem/v0`. Shared IKEMEN roots mirror a separate team
bank, local mode remains actor-owned, positive values clamp from current life
to life max, and KO sides clear red-life. Required shared, local, and
Helper-local artifacts pass inside the focal 611/611 test set. Full corpus,
TypeScript 7, build, and repository gates are batched; scores do not move.
Native triggers, projectile/Explod/team-helper sharing, reset/persistence, HUD
bars, rollback/netplay, exact round semantics, and full parity remain separate
gates.

## 2026-07-14 Entry 512 focal closeout

Entry 512 closes the bounded imported direct-hit dizzy break transition into
the available common `StateDizzy` `6565300` / `AnimDizzy` `5300` route after a
positive-to-zero resource crossing. Explicit `p2stateno`, unavailable common
states, repeated zero-floor hits, sharing, reset/persistence, HUD bars, and
full parity remain separate gates. The required focused artifact and tests
pass; the global corpus and repository gates are batched. Scores do not move.

## 2026-07-14 Entry 511 focal closeout

Entry 511 closes omitted direct HitDef dizzy defaults from authored normal and
Super multipliers plus dedicated `AttackMulSet.DizzyPoints` scaling before
defender defence scaling. Both required focused artifacts pass. Full corpus
regeneration and repository gates are batched for the next checkpoint. Break
transitions, sharing, reset/persistence, HUD bars, and full parity remain
separate gates. Scores do not move.

## 2026-07-14 Entry 510 focal closeout

Entry 510 closes defender-owned `AssertSpecial NoDizzyPointsDamage` for
explicit direct HitDef `dizzypoints`. The required suppression artifact passes
with checksum `29e75f2a` inside 591/591 traces, with 23 focal tests green.
Full repository gates are batched for the next implementation round. Omitted
defaults, `AttackMulSet` dizzy scaling, break transitions, sharing,
reset/persistence, HUD bars, and full parity remain separate gates. Scores do
not move.

## 2026-07-14 Entry 509 non-score closeout

Entry 509 closes bounded actor-local dizzy points: authored maximum/life
fallback, fighter/Helper state, `DizzyPointsAdd`/`DizzyPointsSet`, explicit
direct HitDef `dizzypoints` signed scaling, projection, and required trace
evidence. Verification is 201 files / 2061 tests, TypeScript 7, a 280-module
build, and 590/590 trace artifacts. `NoDizzyPointsDamage`, omitted defaults,
`AttackMulSet` dizzy scaling, break transitions, sharing, reset/persistence,
HUD bars, and full parity remain separate gates. Scores do not move.

## 2026-07-14 Entry 508 non-score closeout

Entry 508 closes the read-only `RuntimeAuxiliaryResourceProjection/v0` with
201 files / 2056 tests, TypeScript 7, a 280-module build, and 589/589 trace
artifacts. It adds no compatibility-score movement: dizzy mutation, red-life
LifeShare mutation, suppression, HUD bars, reset/persistence, and full parity
remain separate gates.

## 2026-07-14 Entry 505 evidence reconciliation

Numbered committed truth is entry 505. Its closeout report declares 587/587 trace artifacts plus 200 files / 2045 tests, build, boundaries, CSS QA, and browser smoke. This audit does not rerun those implementation gates. Entries 477-505 close every previously selected gate through independent legal character evidence, Studio folder editing, team round/handoff/lifebar/life-power resources, and Helper-local life/power.

Scores remain 65 / 35 / 20 / 10-12 / 6-8 / 25. Entry 479 accepted M2 only at bounded fixture scope, and entry 481 supplied the independent legal package. Before any practical-MUGEN promotion, `CompatibilityCorpus/v0` must make the denominator, route coverage, package diversity, optional/unavailable policy, and unsupported density reproducible. Auxiliary-resource, semantic-editor, provenance, scanner, and modular-planning work does not move compatibility scores without executable evidence. See `docs/research/2026-07-14-daily-roadmap-architecture-audit.md`.

## 2026-07-13 Entry 476 evidence reconciliation

Numbered committed truth is entry 476: 576/576 traces, 545 required. Entries 456-468 close bounded post-KO/`NoKOSlow` plus one repository-owned legal package through ZIP, loader, runtime, browser movement/combat/recovery, multi-frame AIR, and visible KO. Entries 412-476 close bounded active-root admission/contact/priority/reversal/depth/HitOverride/guard breadth. Wayfinder 127 is open uncommitted work and is not evidence here.

Scores remain unchanged in this docs-only audit. The demonstrated legal journey now overlaps the written M2/36-55 evidence language, so a dedicated adjudication must either accept the existing artifacts or name the exact independent package/palette/corpus gate still missing.

## 2026-07-12 Active-root plural body-push evidence note

Entry 411 declares bounded explicit-Tag plural X/Width body push under `RuntimeRootPhaseCapabilities/v3`, exact pair/Single fallback, fresh reset/tick diagnostics, 177 files / 1802 tests, and 543/543 traces with no target/effect/combat widening. This automation did not re-run those concurrent gates. Scores remain unchanged because exact IKEMEN AffectTeam/geometry/priority/tie behavior and hit admission/combat remain blocked.

## 2026-07-12 Active-root diagnostic collision evidence note

`RuntimeRootPresentation/v1`, 543/543 traces, and desktop/mobile smoke now prove bounded active-root Clsn1/Clsn2 diagnostic handoff with strict pair/reserve resolution and stale cleanup. Scores remain unchanged because body push, hit admission, targets, exact standby Clsn2 classes, and multi-root combat remain blocked.

## 2026-07-12 Active-root stage constraint evidence note

Required checksum `870f8871` and 543/543 traces prove already-live explicit-Tag P3-P8 roots can apply current sandbox stage-X constraints after local motion while targets, effects, push, collision debug, and combat remain unchanged. `RuntimeRootPhaseCapabilities/v2` exposes this narrow capability. Scores remain unchanged because collision/push/combat and exact IKEMEN bounds parity remain blocked.

## 2026-07-12 Active-root constraint/collision research reconciliation

Wayfinder 100 maps active-root constraints/collision and selects stage-X clamp for Wayfinder 101. Research adds no capability score: P3-P8 still lack stage constraints, push, diagnostic collision, and combat until executable evidence lands. Verified totals remain the Wayfinder 099 baseline.

## 2026-07-11 IKEMEN active-root presentation evidence note

The repository now declares 542/542 traces (511 required, 31 optional). Required `synthetic-imported-ikemen-active-root-presentation` checksum `97255586` plus desktop/mobile browser proof establish bounded P3/P2 body/shadow/camera handoff while `snapshot.actors`, HUD, hit sparks, collision debug, effects, combat, round, audio, and resources remain pair-owned. Scores remain unchanged because stage clamp/push, collision/combat, exact Tag ZSS choreography, root-key effects, and later gameplay owners remain blocked.

## 2026-07-11 IKEMEN active-root motion evidence note

The repository now declares 541/541 traces (510 required, 31 optional). Required `synthetic-imported-ikemen-active-root-motion` checksum `8ee92f65` proves an already-live P3 can execute bounded imported CNS-driven local motion and animation on normal explicit-Tag ticks without same-pass promotion, effects, contact, presentation, or round/resource ownership. Scores remain unchanged because P3-P8 are still invisible/non-collidable and lack direct native input/AI plus every later gameplay owner.

## 2026-07-11 IKEMEN phase-capability evidence note

Explicit IKEMEN `MatchWorld` registries now expose `RuntimeRootPhaseCapabilities/v0`, making current P1/P2 gameplay ownership and P3-P8 command/bounded-CNS limits machine-readable. The trace aggregate remains 540/540 and scores remain unchanged because the model does not schedule or execute a new phase.

## 2026-07-11 IKEMEN Tag command-routing evidence note

The repository now declares 540/540 traces (509 required, 31 optional). Required `synthetic-imported-ikemen-tag-side-command` proves opposite-side isolation and one P1-to-P3 standby CNS transition through independent same-side command state. Scores remain unchanged: direct input/AI, full fighter advancement, effects, combat, round, camera, renderer, lifebar, and resources remain P1/P2-owned.

## 2026-07-11 IKEMEN Helper-owned Tag trace evidence note

The repository now declares 539/539 traces (508 required, 31 optional). Required `synthetic-imported-ikemen-helper-self-tag` proves one Helper-owned default-self TagOut/TagIn cycle with standby/effective-control transition, continued CNS, concrete telemetry, and a preserved parented Projectile. Scores remain unchanged: active-root input, effects, combat, round, camera, renderer, lifebar, and resources remain P1/P2-owned.

## 2026-07-10 SprPriority evidence note

Player controller range and effective higher-priority-front z ordering reach bounded L2 proof on desktop/mobile. Score unchanged pending HitDef pair priorities, equal ties, Explod ontop, stage occlusion, overlap baselines, and reference parity.

## 2026-07-10 renderer evidence note

Bounded player sprite axis placement reaches L2 adapter proof and general L3 visibility on desktop/mobile. Score unchanged pending flips, rotation, draw order, palettes, effects, screenpack composition, L4 baselines, and L5 reference captures.

## 2026-07-10 Studio scene-authoring evidence note

Single-match name/P1/CPU/stage authoring now has dirty state and persistent save/reopen proof. Score unchanged because source-bound state/collision editing, multi-scene graphs, undo/redo, conflicts, and filesystem writes remain open.

## 2026-07-10 Studio authoring evidence note

Project-name editing now persists through manifest/local save and browser reopen. Score unchanged because practical editor completion still requires scene, state/controller, collision, source-write, migration, and conflict workflows.

## 2026-07-10 KO sound evidence note

Automatic common KO sound and tick-active `NoKOSnd` suppression are green under focused tests and required trace evidence. Score unchanged because post-KO timing, slowdown, motif ownership, teams, and full round/audio parity remain open.

## 2026-07-10 evidence note

Contextual player/common SND routing is green under focused tests and 524/524 traces. Score unchanged because broader ownership and full audio parity remain open.

Last updated: 2026-07-15

This is the answer source for "how far are we from a usable port?" It measures the current repo against three different horizons, because a playable local sandbox, practical MUGEN compatibility, and a full IKEMEN-GO-class port are not the same milestone.

Latest evidence note: entry 476 declares 576/576 traces, 545 required, after bounded active-root admission/contact/priority/reversal/depth/HitOverride/guard execution. Scores remain unchanged because generic Common1/landing, plural Helper/Projectile combat, team round/replacement, lifebars/resources, exact Tag choreography, and broad parity remain open.

Latest evidence note: numbered Web Audio playback channels are now actor-local, so matching P1/P2/helper channel numbers do not cross-interrupt. This is meaningful playable-audio correctness but does not move scores until broader imported corpus, free-channel allocation, voice-channel cancellation, common/system audio ownership, and perceptual/browser evidence are closed.

Latest evidence note: five required first-generation helper direct-HitDef/persistence routes now carry resolved contact sound refs into owner-attributed typed `audio:playsnd` telemetry while preserving helper-local contact and StateDef persistence evidence. `pnpm qa:trace` remains 524/524. This closes a bounded R1 evidence gap but does not justify score movement because exact SND playback, broader ownership, renderer parity, and corpus breadth remain open.

## Current Scores

| Horizon | Score | Current truth |
| --- | ---: | --- |
| Playable private sandbox | 65 / 100 | Usable local Three.js match exists with native/generated fighters, original stage, HUD, hit/hurt boxes, debug panels, Studio surfaces, and trace/smoke QA. |
| Practical MUGEN compatibility | 36 / 100 | The written practical MVP threshold is met by passed local official KFM common routes, visible reports, the legal journey, and one optional-private official stage route; broad character compatibility remains partial. |
| MUGEN 1.0/1.1 MVP port | 20 / 100 | Enough parser/runtime/render infrastructure exists to keep marching toward KFM/Common1-style compatibility, but exact VM, combat, helpers, screenpack, palette, audio, and tick-order parity remain open. |
| Full MUGEN-compatible engine | 10-12 / 100 | Foundation and evidence discipline exist. Complete behavior parity across real characters/stages/screenpacks is still a large engine project. |
| Full IKEMEN-GO-class port | 6-8 / 100 | Scanner/reporting plus bounded explicit-profile scheduling/topology/Tag/Helper, active-root combat, team decision/handoff, lifebar/resource/red-life/dizzy seams, bounded automatic Turns continuation, root identity reads, root-only RedirectID, and T427's named ZSS character-state subset exist. Direct reserve input/AI, plural Helper/Projectile combat, exact Simul/Tag/round choreography, motif/screenpack, general ZSS/Lua, rollback/netplay, and broad team semantics remain absent. |
| Creator Studio / modular engine | 25 / 100 | Studio workbench/evidence/build/assets surfaces exist. Real authoring, persistent asset DB, export pipeline, and non-fighting modules are still early. |

## What "Usable" Means Next

The next usable milestone is not "full IKEMEN." It is:

```txt
MUGEN-lite playable MVP
  -> load official/local KFM-style package
  -> run common idle/walk/crouch/jump/attack/get-hit/guard/fall/recovery paths
  -> inspect every unsupported controller/trigger
  -> export trace/report evidence
  -> keep native generated roster playable
```

Target score for that milestone: playable sandbox 75+, practical MUGEN compatibility 45+, MUGEN MVP port 30+.

## Completion Bands

| Band | Meaning | Required proof |
| --- | --- | --- |
| 0-15 | Foundation only | Project builds, app opens, docs state limits. |
| 16-35 | Partial runtime | Real parsers, partial controller execution, synthetic trace gates. |
| 36-55 | Practical MVP | Official/local KFM-style fixture can execute common authored routes with visible reports. |
| 56-75 | Broad MUGEN subset | Many public character/stage packages load and play common move sets without custom patches. |
| 76-90 | Near-parity MUGEN | Exact-ish CNS/CMD/tick/combat/helper/projectile/screenpack behavior for a broad regression corpus. |
| 91-100 | Full engine parity | IKEMEN/MUGEN edge behavior, ZSS/Lua where applicable, teams, rollback/netplay, screenpacks, audio/video parity, tooling, release QA. |

The project is currently at the first point of the **36-55 practical MVP
band** for imported compatibility and in the **56-75 practical playable band**
for the private native sandbox. This minimum promotion does not demonstrate
broad package compatibility.

## Evidence Ledger

Current aggregate override: the latest declared trace aggregate is 633/633,
599 required and 34 optional. Entry 530 remains the only score movement,
promoting Practical MUGEN compatibility to 36/100; all other scores remain
unchanged. Wayfinder 221 is the latest declared full suite at 2294/2294, while
later lane closeouts carry only their stated focused/browser/QA evidence.
Older aggregate paragraphs below are historical snapshots and must not be read
as current totals.

| Area | Score | Evidence | Main blocker |
| --- | ---: | --- | --- |
| Project control | 80 | `AGENTS.md`, `docs/agents/*`, `CONTEXT.md`, `docs/adr/0001-roadmap-control-and-local-issues.md`, `docs/ROADMAP_PROGRESS_SYSTEM.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/ROADMAP_RELEASE_TARGETS.md`, `docs/ROADMAP_EXECUTION_BOARD.md`, `.scratch/roadmap/*`, this scorecard. | Keep docs synchronized after each gate. |
| Native runtime | 65 | Local roster, Rooftop Dojo, HUD, controls, debug, smoke QA. | Gameplay depth, polish, broader move/system coverage. |
| File loading/parsers | 55 | ZIP/folder loader, DEF/AIR/CMD/CNS/ST/SFF/SND partial parsers. | More corpus coverage, exact raw preservation, edge formats. |
| SFF/render import | 40 | SFF v1 PCX and current SFF v2 RAW/RLE/LZ paths render current fixtures. | Palette parity, v2 edge formats, sprite/group fallback policy. |
| CMD/CNS expression VM | 30 | Many triggers/controllers parse and partially execute through gates, including a required imported input-control movement trace for bounded walk/crouch/jump/idle routing, required `synthetic-imported-gamespace.json` checksum `b6f248ab` for bounded stage-localcoord `GameWidth` / `GameHeight`, required `synthetic-imported-screenspace.json` checksum `5330bacd` for bounded zoom-stable `ScreenWidth` / `ScreenHeight`, required `synthetic-imported-config-gamespace.json` checksum `2f3c0a63` for bounded INI `[Config] GameWidth` / `GameHeight` game-space override, required `synthetic-imported-const-coordinate.json` checksum `ea879c1b` for bounded `Const240p` / `Const480p` / `Const720p` player-local coordinate conversion, required `synthetic-imported-const-controller-param.json` checksum `2dad3a50` for bounded `VelSet` controller-param conversion plus static/dynamic `kinematic:velset` telemetry, required `synthetic-imported-statetypeset-dynamic.json` checksum `577404e4` / final checksum `083a76de` for bounded active-state dynamic `StateTypeSet` enum-param typed metadata telemetry, required `synthetic-imported-dynamic-veladd.json` checksum `daf99fb4` for bounded active-state dynamic `VelAdd` typed telemetry, required `synthetic-imported-dynamic-velmul.json` checksum `4d241401` for bounded active-state dynamic `VelMul` typed telemetry, required `synthetic-imported-dynamic-posset.json` checksum `aeb730fb` for bounded active-state dynamic `PosSet` typed telemetry, required `synthetic-imported-dynamic-posadd.json` checksum `8ac604b1` for bounded active-state dynamic `PosAdd` typed telemetry, required `synthetic-imported-helper-controller-param-parentroot.json` checksum `94919326` for bounded first-generation helper-local dynamic `VelSet` Parent/Root typed telemetry, required `synthetic-imported-helper-dynamic-veladd.json` checksum `fbb8bcae` for bounded first-generation helper-local dynamic `VelAdd` Parent/Root typed telemetry, required `synthetic-imported-helper-dynamic-velmul.json` checksum `08220a98` for bounded first-generation helper-local dynamic `VelMul` Parent/Root typed telemetry, required `synthetic-imported-helper-dynamic-posset.json` checksum `50596bc2` for bounded first-generation helper-local dynamic `PosSet` Parent/Root typed telemetry, and required `synthetic-imported-helper-dynamic-posadd.json` checksum `97ec15d0` for bounded first-generation helper-local dynamic `PosAdd` Parent/Root typed telemetry. | Full AST/IR, redirects, helpers, broad dynamic params, exact tick timing, broad string-param parity, exact physics side effects, broad coordinate translation across all controller params, dynamic typed lowering for every controller family, helper-local dynamic typed telemetry beyond current `VelSet` / `VelAdd` / `VelMul` / `PosSet` / `PosAdd`, renderer/screenpack viewport ownership, camera animation parity, IKEMEN `config.json` execution, and Common1 movement semantics. |
| Combat/Common1 | 30 | Direct HitDef, guard, hitstun, fall/get-hit/recovery gates, bounded stand guard-hold walk-control, synthetic crouch guard-hold crouch-control, optional private KFM `152 -> 153 -> 131 -> 11` crouch route-shape evidence, bounded `HitFall && !CanRecover` trigger evidence, bounded direct-HitDef lowest matching HitOverride slot-priority evidence through required `synthetic-imported-hitoverride-slot-priority.json`, bounded helper-parented Projectile `missonoverride = 1` HitOverride miss evidence through required `synthetic-imported-helper-projectile-hitoverride-missonoverride-one.json`, bounded player-owned Projectile `missonoverride = 1` HitOverride miss evidence through required `synthetic-imported-projectile-hitoverride-missonoverride-one.json`, bounded helper-parented Projectile `p2stateno` HitOverride redirect evidence through required `synthetic-imported-helper-projectile-hitoverride-p2stateno.json`, bounded player-owned Projectile `p2stateno` HitOverride redirect evidence through required `synthetic-imported-projectile-hitoverride-p2stateno.json`, bounded IKEMEN direct-HitDef `p2getp1state = 0` HitOverride miss evidence through required `synthetic-imported-hitoverride-p2getp1state-zero-miss.json`, bounded IKEMEN `HitDef missonoverride = 1` HitOverride miss evidence through required `synthetic-imported-hitoverride-missonoverride-one.json`, bounded IKEMEN `HitDef missonoverride = 0` HitOverride redirect evidence through required `synthetic-imported-hitoverride-missonoverride-zero.json`, bounded direct-HitDef default `missonoverride = -1` custom-state HitOverride force-flag miss evidence through required `synthetic-imported-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json`, bounded direct-HitDef HitOverride plus owner-backed `p2stateno` miss evidence through required `synthetic-imported-hitoverride-p2stateno-miss.json`, bounded direct-HitDef `p2stateno` ignored-on-successful-guard evidence through required `synthetic-imported-p2stateno-guard-ignored.json`, bounded defender-owned normal get-hit metadata reads including `GetHitVar(hitcount)`, `GetHitVar(hitid/chainid)`, velocity, damage, kill, hittime, and hitshaketime, bounded defender-owned stand/crouch/air guard-hit `GetHitVar(kill)` metadata through `synthetic-imported-gethitvar-guard-kill.json`, `synthetic-imported-gethitvar-crouch-guard-kill.json`, and `synthetic-imported-gethitvar-air-guard-kill.json`, bounded player-owned and helper-parented Projectile normal-hit `GetHitVar(damage/hittime/xvel/yvel)` metadata through `synthetic-imported-projectile-gethitvar-hit-metadata.json` and `synthetic-imported-helper-projectile-gethitvar-hit-metadata.json`, bounded player-owned and helper-parented Projectile normal-hit `GetHitVar(hitid/chainid)` metadata with separate Projectile id vs HitDef id through `synthetic-imported-projectile-gethitvar-hitid-chainid.json` and `synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json`, bounded player-owned and helper-parented Projectile normal-hit `GetHitVar(hitcount)` metadata with HitDef `numhits` separate from Projectile `projhits` through `synthetic-imported-projectile-gethitvar-hitcount.json` and `synthetic-imported-helper-projectile-gethitvar-hitcount.json`, bounded player-owned and helper-parented Projectile guard-hit `GetHitVar(kill)` metadata through `synthetic-imported-projectile-gethitvar-guard-kill.json` and `synthetic-imported-helper-projectile-gethitvar-guard-kill.json`, bounded owner-backed custom-state guard-hit `GetHitVar(kill)` metadata through required `synthetic-imported-custom-state-gethitvar-guard-kill.json`, bounded owner-backed snap offset reads through `GetHitVar(xoff/yoff/zoff)`, bounded owner-backed custom-state `GetHitVar(hitcount/hitid/chainid)` metadata inheritance through required `synthetic-imported-custom-state-gethitvar-hitcount-hitid-chainid.json`, bounded owner-backed guarded timing inheritance through required `synthetic-imported-custom-state-gethitvar-guard-timing.json`, bounded owner-backed custom-state `GetHitVar(fall.damage/fall.kill/fall.xvel/fall.yvel)` inheritance through required `synthetic-imported-custom-state-gethitvar-fall-metadata.json`, bounded owner-backed custom-state `GetHitVar(fall.envshake.time/freq/ampl/phase)` inheritance through required `synthetic-imported-custom-state-gethitvar-fall-envshake.json`, bounded owner-backed and target-owned custom-state routes including owner-backed custom-state `GetHitVar(yaccel)`, `GetHitVar(type/groundtype/airtype)`, `GetHitVar(isbound)`, `GetHitVar(guarded/hitshaketime/hittime)`, `GetHitVar(xvel/yvel)`, and `GetHitVar(down.recover/down.recovertime/recovertime)`, bounded hit/guard-sound and hit/guard-spark telemetry, combined hit/guard sound + FightFX spark trace evidence with shared contact package metadata, plus smoke-gated player AIR spark sprite rendering/source metadata. | Exact combo accumulation, chain-hit eligibility arbitration, multi-hit timing, exact guard/fall/recovery, exact camera waveform and pause/stage/layer interaction for fall envshake presentation, exact guard KO/no-KO round-flow behavior, helper/projectile/custom-state HitOverride slot-priority breadth, helper-parented Projectile default `missonoverride` custom-state breadth, helper/projectile custom-state guard kill metadata routes, exact get-hit animation selection and air-hit arbitration, exact physics integration/fall acceleration arbitration, exact bind tick-order/lifetime and visual bind parity, exact velocity lifetime after later physics/controllers, exact metadata lifetime/stacking, exact lie-down tables, exact custom-state timing/ownership breadth, exact target lifetime, exact throw positioning, z-axis and guard snap parity, public KFM support, required portable KFM fixture coverage when local fixture is absent, full custom states, throws, priority, KO/round flow. |
| Helpers/projectiles/explods | 25 | Bounded effect actors, projectile/Helper/Explod traces, pause budgets, player-owned Projectile target redirect reads, direct `HitDef` plus player-owned `Projectile` target-memory mix evidence, player-owned Projectile `Proj*Time(...)` timing gates, player-owned Projectile `ProjCancelTime(77)` owner-state cancel evidence, player-owned Projectile `ProjContact` later owner-StateDef transition evidence through required `synthetic-imported-projectile-projcontactpersist.json` checksum `8e678b1b`, player-owned fixed-id legacy `ProjContact[ID] = value, [oper] value2` suffix syntax/state-transition evidence through required `synthetic-imported-projectile-projcontact-suffix.json` checksum `c904ded7`, player-owned omitted-ID / ID `0` any-projectile `ProjContact` suffix evidence through required `synthetic-imported-projectile-projcontact-suffix-any.json` checksum `2fb80418`, player-owned multi-id `ProjContact` arbitration evidence through required `synthetic-imported-projectile-projcontact-multi-id.json` checksum `e790ec3e`, player-owned multi-id `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` arbitration evidence through required `synthetic-imported-projectile-projhittime-multi-id.json` checksum `5d897825`, `synthetic-imported-projectile-projcontacttime-multi-id.json` checksum `d9b3cecf`, and `synthetic-imported-projectile-projguardedtime-multi-id.json` checksum `e52d0d01`, player-owned multi-id `ProjHit` / `ProjGuarded` arbitration evidence through required `synthetic-imported-projectile-projhit-multi-id.json` checksum `ab0f3fb3` and `synthetic-imported-projectile-projguarded-multi-id.json` checksum `023921e3`, player-owned fixed-id legacy `ProjHit[ID] = value, [oper] value2` suffix evidence through required `synthetic-imported-projectile-projhit-suffix.json` checksum `dd3db5ee`, player-owned fixed-id legacy `ProjGuarded[ID] = value, [oper] value2` suffix evidence through required `synthetic-imported-projectile-projguarded-suffix.json` checksum `80bbe439`, player-owned omitted-ID / ID `0` any-projectile `ProjHit` suffix evidence through required `synthetic-imported-projectile-projhit-suffix-any.json` checksum `35ffd57d`, player-owned omitted-ID / ID `0` any-projectile `ProjGuarded` suffix evidence through required `synthetic-imported-projectile-projguarded-suffix-any.json` checksum `4000bc4f`, helper-local redirects including required `synthetic-imported-helper-parentroot.json` checksum `5154220c`, helper-local controller-param Parent/Root typed `VelSet` evidence through required `synthetic-imported-helper-controller-param-parentroot.json` checksum `94919326`, helper-local dynamic `VelAdd` typed evidence through required `synthetic-imported-helper-dynamic-veladd.json` checksum `fbb8bcae`, helper-local dynamic `VelMul` typed evidence through required `synthetic-imported-helper-dynamic-velmul.json` checksum `08220a98`, helper-local dynamic `PosSet` typed evidence through required `synthetic-imported-helper-dynamic-posset.json` checksum `50596bc2`, helper-local dynamic `PosAdd` typed evidence through required `synthetic-imported-helper-dynamic-posadd.json` checksum `97ec15d0`, helper-local direct `HitDef` combat, helper-owned/direct and helper-parented Projectile target memory/Target* gates, helper-local caller-provided `EnemyNear(index)` redirect context, helper-local `NumExplod(id)` / `NumHelper(id)` / `NumProjID(id)` count evidence, helper-local `Projectile` spawn/mutation, helper-local `ProjHit(id)` / `ProjGuarded(id)` / `ProjContact(id)` contact-trigger evidence, helper-local `ProjContact` later-StateDef transition evidence through required `synthetic-imported-helper-projcontactpersist.json` checksum `65639428`, helper-local any-id hit/guard/contact/cancel timing gates, helper-local fixed-id `ProjCancelTime(8868)` cancel-time evidence, and helper-local expression-derived `ProjCancelTime(8869 + var(0))` / focused nonzero `ProjCancelTime(var(n))` cancel-time evidence. Helper-parented Projectile contact gates now also require owner-side target-link, sound/FightFX spark package telemetry, and typed `audio:playsnd` for guard-contact routes. | Real helper VM, ownership, broader indexed/team/helper-owned redirects beyond caller-provided `EnemyNear(index)` lists, broader invalid-destination bottom parity beyond the current Cond/parser-expression/controller-param gates, nested helper ancestry where root differs from parent, helper-spawned helpers, helper target multi-target parity beyond direct-HitDef/helper-parented Projectile gates, helper-owned custom state tables, helper-local dynamic typed lowering beyond current `VelSet` / `VelAdd` / `VelMul` / `PosSet` / `PosAdd`, Target* mutation mixing, throws/teams, exact helper hitpause/tick order, exact helper effect-count parity, exact helper Projectile target lifetime parity, exact helper/player projectile contact/cancel timing/lifetime and same-ID selection beyond bounded routes, broad dynamic expression parity, exact player-owned projectile cancel tick-order/lifetime, player-state helper binding parity, exact lifecycle/pause parity. |
| Stages/presentation/audio | 25 | Basic imported stage route, EnvShake/EnvColor, required dynamic `EnvColor value/time/under` typed stage-flash evidence, required dynamic `EnvShake time/freq/ampl/phase` typed telemetry evidence, bounded stage BG `trans`/`alpha` material handoff, bounded rectangular stage BG `window`/`maskwindow` clip handoff, required EnvColor `under = 0` and `under = 1` stage-flash trace evidence, required same-actor `PalFX` + `RemapPal` telemetry evidence, required static `AngleMul` render-angle telemetry evidence, required dynamic `Angle*` typed render-angle/render-scale telemetry evidence, required dynamic `AfterImage` typed ghost-trail telemetry evidence, required dynamic `AfterImageTime` typed duration telemetry evidence, required dynamic `Trans alpha` typed sprite-effect telemetry evidence, required dynamic `PalFX` typed material telemetry evidence, required dynamic `SprPriority` typed sprite-effect telemetry evidence, required dynamic `RemapPal` source/dest typed sprite-effect telemetry evidence, first-pass ACT + indexed SFF `RemapPal` texture handoff for loaded ACT destination palettes, partial SND event path, required dynamic `PlaySnd value` group/index fallback sound-event evidence, required dynamic `PlaySnd` / `SndPan` / `StopSnd` numeric fallback sound-event evidence, required dynamic direct `HitDef hitsound` and `guardsound` fallback sound-event evidence, required dynamic `SuperPause sound` fallback sound-event evidence, required explicit and dynamic `SuperPause anim/pos` metadata evidence, bounded HitDef hit/guard sound plus hit/guard spark telemetry, combined hit/guard-effect package telemetry with shared contact id/tick/kind, source metadata, selected AIR-frame offset/duration trace requirements, first-frame player AIR spark sprite lookup, first-pass `fight.def`/FightFX AIR/SFF/SND loading, character `[Files] fx` FightFX prefix package selection, decoded system-SFF provider registration, bounded prefixed-SND archive lookup, bounded explicit-channel Web Audio arbitration for `PlaySnd lowpriority` / `SndPan` / `StopSnd`, bounded `PlaySnd legacy volume` diagnostic telemetry as `legacyVolume`, bounded `PlaySnd volumescale` Web Audio gain scaling, bounded `PlaySnd freqmul` playback-rate scaling, bounded `PlaySnd loop` source looping, bounded `PlaySnd pan` / required `PlaySnd abspan` stereo-pan handoff, bounded common/FightFX provider handoff, and 180-frame fallback Three.js spark overlay. | BGCtrl parity, screenpacks/lifebars, exact stage transparency blend math/palette/windowdelta/zoom/mask behavior, exact source-bank/palette ownership, truecolor/PNG palette remap, exact PalFX/RemapPal palette math/blend order, exact Trans add/sub alpha math, exact Angle axis pivot/collision rotation-scale/draw-order interaction, exact AfterImage/AfterImageTime trail blending/palette math/sampling cadence/no-active-effect behavior, exact EnvShake waveform/`mul`/pause/stage/layer behavior, exact EnvColor blend/layer/window/pause behavior, default SuperPause anim selection, FightFX/common SuperPause anim lookup/rendering, dynamic `S` player-AIR prefix breadth, exact super background layering, exact FightFX/common layering, scale, palette, timing, `sys.ffx` lifetime/refcount/cache semantics, global channel fallback, priority classes, pre-RC8 legacy `volume` gain semantics, typed lowering for dynamic audio params, exact panning semantics, motif ownership, super-background audio, and audio mixing/timing. |
| IKEMEN profile | 10 | I1 scanner recognizes source-mapped signals; I2 explicit `ikemen-go` has bounded P1-P8 ownership/selection, standby CNS, root/helper identity, root-to-Helper Tag aggregates, Helper-authored self standby, required Helper Tag evidence, same-side Tag command routing, normal-tick active-root local motion/animation, body/shadow/camera presentation, and T427 direct/fallback character-state ZSS subset. No score movement. | Active-root direct native input/AI, stage constraints, collision/combat, root-key effects, round/lifebar/resources, exact Tag presentation choreography, Helper-authored redirect/aggregate Tag, model/video stages, `sys.ffx`, general ZSS/Lua, rollback/netplay, or broad IKEMEN parity. |
| Studio/product surface | 25 | Workbench, Assets, Inspector, Debug, Evidence, Modules, Build. | True editing, regeneration, persistent projects, export/publish workflow. |
| Modular engine | 10 | Boundary docs and module contract draft. | Platformer/shared core proof blocked until fighting contracts stabilize. |

CMD/CNS expression VM latest evidence addendum: required `synthetic-imported-helper-dynamic-posadd.json` checksum `97ec15d0` proves bounded first-generation helper-local dynamic `PosAdd` params can resolve `Parent,Life - 984` and `Root,StateNo - 220`, emit typed `kinematic:posadd` telemetry after a static `PosSet` seed, reach helper position `18,-17`, and route to state/action `1405` / anim `945`, without score movement. `pnpm qa:trace` passes 517/517 artifacts, 486 required and 31 optional. Previous required `synthetic-imported-helper-dynamic-posset.json` checksum `50596bc2` remains required for bounded helper-local dynamic `PosSet` typed telemetry. Previous required `synthetic-imported-helper-dynamic-velmul.json` checksum `08220a98` remains required for bounded helper-local dynamic `VelMul` typed telemetry. Previous required `synthetic-imported-helper-dynamic-veladd.json` checksum `fbb8bcae` remains required for bounded helper-local dynamic `VelAdd` typed telemetry. Previous required `synthetic-imported-helper-controller-param-parentroot.json` checksum `94919326` remains required for bounded helper-local dynamic `VelSet` typed telemetry. Previous required `synthetic-imported-dynamic-posadd.json` checksum `8ac604b1` remains required for bounded active-state dynamic `PosAdd`; previous required `synthetic-imported-dynamic-posset.json` checksum `aeb730fb` remains required for bounded active-state dynamic `PosSet`; previous required `synthetic-imported-dynamic-velmul.json` checksum `4d241401` remains required for bounded active-state dynamic `VelMul`; previous required `synthetic-imported-dynamic-veladd.json` checksum `daf99fb4` remains required for bounded active-state dynamic `VelAdd`; previous required `synthetic-imported-const-controller-param.json` checksum `2dad3a50` remains required for bounded active-state `VelSet` params resolving `Const240p(3) + Const480p(6)` to velocity `12` and `0 - Const720p(12)` to velocity `-6` for a 640x480 player localcoord, with static and dynamic resolved `kinematic:velset` telemetry. Previous required `synthetic-imported-const-coordinate.json` checksum `ea879c1b` remains required for bounded imported State -1 routing through `Const240p(3) = 6`, `Const480p(6) = 6`, and `Const720p(12) = 6`. Previous required `synthetic-imported-config-gamespace.json` checksum `2f3c0a63` remains required for bounded parsed-config-equivalent `ScreenWidth = 1280`, `ScreenHeight = 720`, `GameWidth = 2560`, and `GameHeight = 1440` at zoom `0.5`. Previous `synthetic-imported-screenspace.json` checksum `5330bacd` remains required for bounded `ScreenWidth = 640`, `ScreenHeight = 480`, `GameWidth = 1280`, and `GameHeight = 960`; previous `synthetic-imported-gamespace.json` checksum `b6f248ab` remains required for bounded `GameWidth = 640` and `GameHeight = 480`. Remaining blockers are broad coordinate translation across all controller params, dynamic typed lowering for every kinematic controller, helper-local dynamic typed telemetry beyond current helper `VelSet` / `VelAdd` / `VelMul` / `PosSet` / `PosAdd`, exact coordinate/facing ownership, renderer/screenpack viewport ownership, camera animation parity, IKEMEN `config.json` execution, full viewport/camera/screenpack split, helper/team/simul namespace breadth, score movement, and full viewport parity.

Combat/Common1 previous evidence addendum: required `synthetic-imported-modifyprojectile-omitted-bounds.json` checksum `24cbb1dc` / final checksum `e94d1480` and `synthetic-imported-helper-modifyprojectile-omitted-bounds.json` checksum `9db04bbc` / final checksum `555d744b` prove bounded owner-side/helper-local `ModifyProjectile` preserve explicit Projectile bounds when later mutation omits `projedgebound`, `projstagebound`, and `projheightbound`, without score movement. That checkpoint passed 504/504 artifacts, 473 required and 31 optional. Previous owner dynamic params (`6ffbef92` / `5665a98e`), helper dynamic params (`2d88a550` / `edb6d2d2`), helper/owner dynamic bounds, static owner/helper `ModifyProjectile`, paired 640x480 localcoord default-bound gates (`af7ee80e` / `46b0164c`), 240p player/helper default bounds, helper/player explicit bound gates, terminal fallback/cancel, and guard gates also remain required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-helper-projectile-default-bounds-terminal.json` checksum `e85d7bbf` / final checksum `bea653fa` proves bounded helper-parented/root-owned Projectile official 240p omitted bounds defaults and remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-helper-projectile-cancel-remove-fallback-terminal.json` checksum `cf33c924` / final checksum `bd3a1279` proves bounded helper-parented/root-owned Projectile cancel-removal fallback playback without score movement. The trace spawns helper `p1-helper-0`, then root-owned Projectile `p1-projectile-0` with parent `p1-helper-0`, priority `1`, authored `projremanim = 1028`, omitted `projcancelanim`, and id `8870`; P2 spawns a priority `3` Projectile, wins the clash, and leaves P1's helper Projectile in visible terminal anim `1028`. That checkpoint passed 485/485 artifacts, 455 required and 30 optional. Remaining blockers are exact cancel tick-order/lifetime, exact terminal timing, bounds-removal parity, broader fallback breadth, exact sprite/layer/palette parity, team/simul breadth, score movement, and full helper Projectile terminal parity. Previous `synthetic-imported-projectile-cancel-remove-fallback-terminal.json` checksum `4966ed30` / final checksum `98170d08` remains required as bounded player-owned cancel fallback evidence.

Combat/Common1 previous evidence addendum: required `synthetic-imported-projectile-cancel-remove-fallback-terminal.json` checksum `4966ed30` / final checksum `98170d08` proves bounded player-owned Projectile cancel-removal fallback playback without score movement. The trace executes imported Projectiles from both players, gives P1 priority `3`, gives P2 priority `1`, authors P2 `projremanim = 921`, omits P2 `projcancelanim`, then records clash/cancel evidence with `3 > 1`, P2 Projectile remove lifecycle evidence, P1 active Projectile evidence, visible projectile actor-frame evidence for terminal anim `921`, and payload evidence with `hasHit = true`, `removeAnimNo = 921`, `removalReason = cancel`, `terminalReason = cancel`, and terminal duration `2`. That checkpoint passed 484/484 artifacts, 454 required and 30 optional. Remaining blockers are exact cancel tick-order/lifetime, exact terminal timing, bounds-removal parity, broader fallback breadth, exact sprite/layer/palette parity, team/simul breadth, score movement, and full Projectile terminal parity. Previous `synthetic-imported-projectile-remove-hit-fallback-terminal.json` checksum `3bbdfbfc` / final checksum `76ca3f77` remains required as bounded timeout fallback evidence.

Combat/Common1 previous evidence addendum: required `synthetic-imported-projectile-remove-hit-fallback-terminal.json` checksum `3bbdfbfc` / final checksum `76ca3f77` proves bounded player-owned Projectile timeout-removal fallback playback without score movement. The trace executes imported Projectile id `77` with authored `projhitanim = 920`, omitted `projremanim`, static position/velocity so no contact occurs, Projectile spawn/remove lifecycle evidence, visible projectile actor-frame evidence for terminal anim `920`, and payload evidence with `hasHit = false`, `hitsRemaining = 1`, `hitAnimNo = 920`, `removalReason = timeout`, `terminalReason = timeout`, `removeTime = 24`, and terminal duration `2`. `pnpm qa:trace` now passes 483/483 artifacts, 453 required and 30 optional. Remaining blockers are exact terminal timing, bounds-removal parity, helper-owned cancel fallback parity and broader fallback breadth, exact sprite/layer/palette parity, helper-owned remove fallback parity, team/simul breadth, score movement, and full Projectile terminal parity. Previous `synthetic-imported-projectile-remove-terminal.json` checksum `8a65629c` / final checksum `7ba3479b` remains required as bounded authored-`projremanim` timeout terminal evidence; previous `synthetic-imported-helper-projectile-guard-terminal.json` checksum `c6937f42` / final checksum `e0835e33` remains required as bounded helper-parented/root-owned Projectile guarded-contact terminal playback evidence; previous `synthetic-imported-projectile-guard-terminal.json` checksum `26f1e7f9` / final checksum `f9df24d0` remains required as bounded player-owned Projectile guarded-contact terminal playback evidence; previous `synthetic-imported-projectile-guard-kill.json` checksum `905eb8e3` / final checksum `c6cc7787` remains required as bounded player-owned Projectile `guard.kill = 0` no-KO evidence; previous `synthetic-imported-helper-projectile-guard-kill.json` checksum `33930a00` / final checksum `8412e638` remains required as bounded helper-parented/root-owned Projectile `guard.kill = 0` no-KO evidence; previous `synthetic-imported-helper-projectile-guard-ko.json` checksum `05dbcded` / final checksum `98b8bf17` remains required as bounded helper-parented/root-owned Projectile default lethal guard-chip KO evidence; previous `synthetic-imported-projectile-guard-ko.json` checksum `2285474a` / final checksum `c968c723` remains required as bounded player-owned Projectile guard-chip KO evidence; previous `synthetic-imported-hitdef-guard-ko.json` checksum `b7db75f4` / final checksum `0f9afa50` remains required as bounded direct `HitDef` guard-chip KO evidence; previous `synthetic-imported-guarddist-reversal-no-contact.json` checksum `ca20c823` / final checksum `2bc9b86d` remains required as bounded negative `guard.dist` / `ReversalDef` no-contact evidence.

Combat/Common1 previous evidence addendum: required `synthetic-imported-air-guard-reversal.json` checksum `966b17b8` / final checksum `2fa19142` proves bounded air guard-input `ReversalDef` priority and remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-crouch-guard-reversal.json` checksum `405f475e` / final checksum `d1f39c08` proves bounded crouch guard-input `ReversalDef` priority and remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-guard-reversal.json` checksum `6f8df3a4` / final checksum `e0771a15` proves bounded held-back stand guard-input `ReversalDef` priority and remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-custom-state-reversal.json` checksum `18065db0` / final checksum `ac8d0073` proves bounded direct custom-state `ReversalDef` priority without score movement and remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-helper-projectile-reversal.json` checksum `a1d82380` / final checksum `ca66a49a` proves bounded helper-parented/root-owned Projectile `ReversalDef` priority without score movement and remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-projectile-reversal.json` checksum `5c4ddf48` / final checksum `bb0bbb99` proves bounded player-owned Projectile `ReversalDef` priority without score movement and remains required.

Presentation latest evidence addendum: required `synthetic-imported-superpause-pausebg.json` checksum `49bcfe16` / final checksum `397a8fae` adds bounded imported `SuperPause pausebg = 0` metadata without score movement. The route executes `pausebg = 0`, requires match-pause/freeze evidence plus `pauseBg = false`, and `pnpm qa:trace` passes 465/465 artifacts, 435 required and 30 optional. Remaining blockers are actual renderer/background update parity, exact stage/BGCtrl pause timing, renderer visual suppression/playback parity, actual FightFX/common asset lookup/rendering, dynamic `S` player-AIR prefix breadth, unhittable interactions, super backgrounds, helper/redirect ownership, score movement, and full super presentation parity.

Previous presentation evidence addendum: required `synthetic-imported-superpause-anim-disabled.json` checksum `fc7a2ca4` / final checksum `5be3ca6c` adds bounded imported `SuperPause anim = -1` metadata suppression without score movement. The route executes `anim = -1`, requires match-pause/freeze evidence plus `superAnimAbsent = true`.

Previous presentation evidence addendum: required `synthetic-imported-superpause-default-anim.json` checksum `318c5e9f` / final checksum `747e7619` adds bounded omitted `SuperPause anim` default metadata without score movement. The route omits `anim`, requires match-pause evidence with `superAnim.raw = 30`, `source = fightfx`, `actionNo = 30`, and `offset = 0,0`.

Earlier presentation evidence addendum: required `synthetic-imported-superpause-anim-pos.json` checksum `f7dcdc9d` / final checksum `7bd4afe8` adds bounded imported explicit `SuperPause anim/pos` metadata without score movement. The route executes `anim = S200` and `pos = 24,-48`, requiring `superAnim.raw = S200`, `source = player`, `actionNo = 200`, and `offset = 24,-48`.

Audio latest evidence addendum: player-owned Projectile normal-hit GetHitVar artifacts `8e5df79b` / `4d078c5d`, `4356b5cb` / `4b270d45`, and `df2619f9` / `5469bc69` add bounded `S5,45/46/47`, typed `audio:playsnd`, and FightFX `F7002` package telemetry without score movement. Exact SND playback/channel semantics, broader ownership, renderer parity, and full audio parity remain blocked.

Audio previous evidence addendum: required `synthetic-imported-projectile-hitcount.json` trace checksum `ee8f4e19` / final checksum `0fd4adf8` and `synthetic-imported-helper-projectile-hitcount.json` trace checksum `c8f5dc55` / final checksum `e1569fab` add bounded player-owned and first-generation helper-parented/root-owned Projectile normal-hit attacker-side HitCount sound typed `audio:playsnd` telemetry without score movement. The player route preserves `Projectile hitsound = S5,44`, P1 `200 -> 341`, target link `p1 -> p2 / 77`, projectile lifecycle evidence, and FightFX `F7002`; the helper route preserves helper-local `Projectile hitsound = S5,43`, helper `1257 -> 1258`, owner/helper target links, helper/projectile lifecycle evidence, and FightFX `F7002`. Previous required `synthetic-imported-helper-projectile-gethitvar-hit-metadata.json` trace checksum `28afbcea` / final checksum `c960b1cf`, `synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json` trace checksum `616e0b2c` / final checksum `0aebcc73`, `synthetic-imported-helper-projectile-gethitvar-hitcount.json` trace checksum `40ec4f4b` / final checksum `6f15ff30`, `synthetic-imported-helper-projectile-guard-ko.json` trace checksum `05dbcded` / final checksum `98b8bf17`, `synthetic-imported-helper-projectile-guard-kill.json` trace checksum `33930a00` / final checksum `8412e638`, `synthetic-imported-helper-projectile-guard-terminal.json` trace checksum `c6937f42` / final checksum `e0835e33`, `synthetic-imported-projectile-contact.json` trace checksum `57b3b556` / final checksum `e0f3e41c`, `synthetic-imported-projectile-guard.json` trace checksum `eb9c2e58` / final checksum `b1c74e5e`, `synthetic-imported-hitdef-dynamic-hitsound.json` checksum `fe3c0f3d` / final checksum `855df386`, `synthetic-imported-hitdef-dynamic-guardsound.json` checksum `bb38362a` / final checksum `3e0ddeb0`, `synthetic-imported-superpause-sound.json` checksum `3e19cb86` / final checksum `c5fb9428`, `synthetic-imported-sound-dynamic-pan.json` checksum `879afcf4` / final checksum `b780e5e9`, and `synthetic-imported-sound-dynamic-value.json` checksum `bcdafe32` / final checksum `31b8a7b3` remain required for bounded imported helper/player Projectile, direct HitDef, SuperPause, and active-state dynamic audio typed telemetry. Remaining blockers are broader helper Projectile normal-hit contact sound breadth, exact common/player SND archive lookup/channel priority/timing/mixing, panning semantics, super-background audio, broader helper/redirect/team ownership, score movement, and full audio parity.

Runtime presentation current evidence addendum: required `synthetic-imported-remappal-dynamic.json` checksum `5f04f2d4` / final checksum `71ad06f0` upgrades bounded active imported dynamic `RemapPal source/dest` fallback into typed sprite-effect telemetry without score movement. The route seeds `var(0)=5` and `var(1)=7`, executes `RemapPal source = 1,var(0)` with `dest = 2,var(1)`, requires actor-frame/final `paletteRemap source [1,5] -> dest [2,7]`, and records `variable:varset`, `sprite-effect:remappal`, and `hitdef` evidence after runtime expression resolution; that checkpoint passed 523/523 artifacts, 492 required and 31 optional. Remaining blockers are exact source-bank/default/removal semantics, ACT/SFF pixel parity, truecolor/PNG remap, exact PalFX order/math, renderer parity, helper/redirect ownership, score movement, and full palette parity.

Runtime resource previous evidence addendum: required `synthetic-imported-resourceset-dynamic.json` checksum `1bd04945` / final checksum `35db4dcd` adds bounded active imported dynamic `LifeSet` / `PowerAdd` / `PowerSet` typed resource telemetry without score movement and remains required.

Runtime control previous evidence addendum: required `synthetic-imported-control-dynamic.json` checksum `885cc464` / final checksum `ecf2bec6` adds bounded active imported dynamic `CtrlSet value` typed resource telemetry without score movement. The route seeds `var(0)=1`, executes `CtrlSet value = IfElse(var(0), 1, 0)`, requires actor-frame state/action `200`, final owner `ctrl = true`, and records `variable:varset`, `resource:ctrlset`, and `hitdef` evidence after runtime expression resolution; that checkpoint passed 521/521 artifacts, 490 required and 31 optional. Remaining blockers are exact state-entry control timing, persistent-controller timing, helper/team/redirect ownership, broad dynamic resource lowering, score movement, and full CtrlSet/control parity.

Previous runtime metadata evidence addendum: required `synthetic-imported-statetypeset-dynamic.json` checksum `577404e4` / final checksum `083a76de` adds bounded active imported dynamic `StateTypeSet statetype/movetype/physics` typed metadata telemetry without score movement. The route seeds `var(0)=1`, `var(1)=1`, and `var(2)=1`, executes `IfElse(var(n), enum, enum)` metadata params, requires actor-frame/final `stateType = C`, `moveType = A`, `physics = N`, and records `variable:varset`, `metadata:statetypeset`, and `hitdef` evidence after runtime expression resolution; that checkpoint passed 520/520 artifacts, 489 required and 31 optional. Remaining blockers are broad string-param parity, exact physics side effects, exact tick order, helper/team/redirect ownership, score movement, and full StateTypeSet parity.

Runtime constraints previous evidence addendum: required `synthetic-imported-screenbound-dynamic.json` checksum `9797bdfe` / final checksum `d76b641a` adds bounded active imported dynamic `ScreenBound value/movecamera` typed bounds telemetry without score movement. The route seeds `var(0)=0`, `var(1)=0`, and `var(2)=1`, executes `ScreenBound value = var(0), movecamera = var(1),var(2)` plus an offstage `PosAdd` probe, requires actor-frame `screenBound = false`, `moveCameraX = false`, `moveCameraY = true`, stage-frame right bound/camera evidence, and records `variable:varset`, `bounds:screenbound`, and `kinematic:posadd` evidence after runtime expression resolution; that checkpoint passed 519/519 artifacts, 488 required and 31 optional. Remaining blockers are exact camera/screen-edge behavior, exact tick order, pause/hitpause/helper/team ownership, score movement, and full constraint parity.

Previous runtime constraints evidence addendum: required `synthetic-imported-posfreeze-dynamic.json` checksum `8de0c2e9` / final checksum `6c40bb79` adds bounded active imported dynamic `PosFreeze x/y` typed bounds telemetry without score movement. The route seeds `var(0)=1` and `var(1)=0`, executes `PosFreeze x = var(0), y = var(1)`, requires actor-frame/final `posFreezeX = true` and `posFreezeY = false`, and records `variable:varset`, `hitdef`, and typed `bounds:posfreeze` evidence after runtime expression resolution.

Previous runtime constraints evidence addendum: required `synthetic-imported-playerpush-dynamic.json` checksum `b7775652` / final checksum `92aca1cd` remains the bounded active imported dynamic `PlayerPush value` typed collision telemetry gate. The route seeds `var(0)=0`, executes `PlayerPush value = var(0)`, requires actor-frame/final `playerPush = false`, and records `variable:varset`, `hitdef`, and typed `collision:playerpush` evidence after runtime expression resolution.

Previous runtime constraints evidence addendum: required `synthetic-imported-width-dynamic.json` checksum `51554c91` / final checksum `84a85277` adds bounded active imported dynamic `Width player` typed collision telemetry without score movement. The route seeds `var(0)=21` and `var(1)=43`, executes `Width player = var(0),var(1)`, requires actor-frame/final telemetry `front = 21`, `back = 43`, and records `variable:varset`, `hitdef`, and typed `collision:width` evidence after runtime expression resolution; that checkpoint passed 517/517 artifacts, 486 required and 31 optional. Remaining blockers are `edge` width parity, exact push overlap, team/helper ownership, exact tick order, score movement, and full constraint parity.

Presentation current evidence addendum: required `synthetic-imported-envcolor-dynamic.json` checksum `845c3d5e` / final checksum `282fc77f` adds bounded active imported dynamic `EnvColor value/time/under` typed stage-flash telemetry without score movement. The route seeds `var(0)=32`, `var(1)=128`, `var(2)=240`, `var(3)=14`, and `var(4)=1`, executes `EnvColor value = var(0),var(1),var(2), time = var(3), under = var(4)`, requires stage-frame telemetry `color = 32,128,240`, `under = true`, and records `variable:varset`, typed `envcolor`, and `hitdef` evidence; `pnpm qa:trace` passes 523/523 artifacts, 492 required and 31 optional. Remaining blockers are exact blend math, layer/window behavior, pause timing, renderer parity, helper/redirect ownership, score movement, and full presentation parity.

Presentation current evidence addendum: required `synthetic-imported-envshake-dynamic.json` checksum `e1bf593f` / final checksum `8f52f1f4` adds bounded active imported dynamic `EnvShake time/freq/ampl/phase` typed camera-shake telemetry without score movement. The route seeds `var(0)=18`, `var(1)=45`, `var(2)=-9`, and `fvar(0)=0.25`, executes `EnvShake time = var(0), freq = var(1), ampl = var(2), phase = fvar(0)`, requires runtime env-shake telemetry `time = 18`, `freq = 45`, `ampl = -9`, and `phase = 0.25`, records `variable:varset`, `envshake`, and `hitdef` evidence, and passed 523/523 artifacts with 492 required and 31 optional. Remaining blockers are `mul`, exact camera waveform, pause/stage/layer interaction, helper ownership, screenpack ownership, score movement, and full presentation parity.

Presentation previous evidence addendum: required `synthetic-imported-anglemul-dynamic.json` checksum `0bb54a1c` / final checksum `c9f2b557` adds bounded active imported dynamic `AngleMul value` typed sprite-effect telemetry without score movement. The route seeds `var(0)=30` and `fvar(0)=1.5`, executes `AngleSet value = var(0)`, `AngleMul value = fvar(0)`, and static `AngleDraw`, requires imported actor-frame `renderAngle = 45`, and records typed `sprite-effect:angleset`, `sprite-effect:anglemul`, and `sprite-effect:angledraw` evidence; that checkpoint passed 523/523 artifacts, 492 required and 31 optional. Remaining blockers are exact axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, score movement, and full presentation parity.

Presentation previous evidence addendum: required `synthetic-imported-anglemul.json` checksum `e0dae072` / final checksum `5048aa5c` adds bounded active imported static `AngleMul value` operation/render-angle evidence without score movement. The route executes `AngleSet value = 30`, `AngleMul value = 1.5`, and `AngleDraw`, requires imported actor-frame `renderAngle = 45`, and records typed `sprite-effect:anglemul` evidence; that checkpoint passed 448/448 artifacts, 418 required and 30 optional. Remaining blockers are exact axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, score movement, and full presentation parity.

Presentation previous evidence addendum: required `synthetic-imported-angle-dynamic.json` checksum `13560dcd` / final checksum `4d7c4726` adds bounded active imported dynamic `AngleSet value`, `AngleAdd value`, and `AngleDraw value/scale` typed sprite-effect telemetry without score movement. The route seeds `var(0)=40`, `var(1)=-10`, `var(2)=35`, `var(3)=2`, and `fvar(0)=0.5`, requires imported actor-frame/final `renderAngle = 35` plus `renderScale = 2,0.5`, and records typed `sprite-effect:angleset`, `sprite-effect:angleadd`, and `sprite-effect:angledraw` evidence; that checkpoint passed 523/523 artifacts, 492 required and 31 optional. Remaining blockers are exact axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, score movement, and full presentation parity.

Presentation previous evidence addendum: required `synthetic-imported-palfx-dynamic.json` checksum `36cdca15` / final checksum `7a1a4525` adds bounded active imported dynamic `PalFX time/add/mul/color/invertall` typed sprite-effect telemetry without score movement. The route seeds `var(0..7)`, executes dynamic material params, requires imported actor-frame/final `paletteFx.time = 12`, `add [64,-16,255]`, `mul [224,144,256]`, `color = 200`, `invert = true`, and typed `sprite-effect:palfx` operation evidence after runtime expression resolution; that checkpoint passed 523/523 artifacts, 492 required and 31 optional. Remaining blockers are `sinadd`, exact palette math/blend/remap order, ACT/SFF pixel parity beyond existing bounded handoff, renderer parity, helper/redirect ownership, score movement, and full MUGEN/IKEMEN presentation parity.

Presentation previous evidence addendum: required `synthetic-imported-afterimagetime-dynamic.json` checksum `c5ef6fff` / final checksum `661a233d` adds bounded active imported dynamic `AfterImageTime value/time` typed sprite-effect telemetry without score movement. The route seeds `var(0)=14`, executes static `AfterImage` plus `AfterImageTime value = var(0)`, requires imported actor-frame/final `afterImageTime = 14`, `afterImageLength = 4`, `afterImageTimeGap = 1`, `afterImageFrameGap = 1`, at least one ghost-trail sample, opacity `0.34`, and typed `sprite-effect:afterimagetime` operation evidence after runtime expression resolution; that checkpoint passed 523/523 artifacts, 492 required and 31 optional. Remaining blockers are exact no-active-afterimage behavior, trail blending, palette math, sampling cadence, renderer parity, helper/redirect ownership, score movement, and full MUGEN/IKEMEN presentation parity.

Presentation current evidence addendum: required `synthetic-imported-afterimage-dynamic.json` trace checksum `e7299ac5` / final checksum `b946d805` adds bounded active imported dynamic `AfterImage` typed sprite-effect telemetry without score movement. The route seeds `var(0..7)`, executes dynamic `time`, `length`, `timegap`, `framegap`, `paladd`, and `palmul` with `trans = add`, requires imported actor-frame/final `afterImageTime = 18`, `afterImageLength = 5`, `afterImageTimeGap = 2`, `afterImageFrameGap = 3`, at least one ghost-trail sample, opacity `0.34`, and typed `sprite-effect:afterimage` operation evidence after runtime expression resolution; that checkpoint passed 523/523 artifacts, 492 required and 31 optional. Remaining blockers are exact trail blending, palette math, sampling cadence, renderer parity, helper/redirect ownership, score movement, and full MUGEN/IKEMEN presentation parity.

Trans superseded evidence addendum: required `synthetic-imported-trans-dynamic.json` previously checksumed `91a7baf9` as bounded active imported dynamic `Trans alpha` expression fallback without typed operation evidence. Current checksum `4bffcd82` / final checksum `5beea0f0` now requires typed `sprite-effect:trans` evidence after runtime expression resolution while retaining actor-frame/final `renderOpacity = 0.375`. Remaining blockers are dynamic typed lowering for other sprite-effect params, exact add/sub alpha math, palette/remap interaction, draw-order parity, renderer parity, helper/redirect ownership, score movement, and full MUGEN/IKEMEN presentation parity.

PalFX superseded evidence addendum: required `synthetic-imported-palfx-dynamic.json` previously checksumed `c56e955a` added bounded active imported dynamic `PalFX time/add/mul/color/invertall` expression fallback without typed operation evidence. Current checksum `36cdca15` / final checksum `7a1a4525` now requires typed `sprite-effect:palfx` evidence after runtime expression resolution while retaining actor-frame/final `paletteFx.time = 12`, `add [64,-16,255]`, `mul [224,144,256]`, `color = 200`, and `invert = true`. Remaining blockers are `sinadd`, exact palette math/blend/remap order, ACT/SFF pixel parity beyond existing bounded handoff, renderer parity, helper/redirect ownership, score movement, and full MUGEN/IKEMEN presentation parity.

SprPriority superseded evidence addendum: required `synthetic-imported-sprpriority-dynamic.json` previously checksumed `b57c1bfa` as bounded active imported dynamic `SprPriority value` expression fallback without typed operation evidence. Current checksum `a9e0862d` / final checksum `4919326d` now requires typed `sprite-effect:sprpriority` evidence after runtime expression resolution while retaining actor-frame/final `spritePriority = 4`. Remaining blockers are dynamic typed lowering for other sprite-effect params, exact layer/shadow/helper/Explod draw-order parity, renderer parity, helper/redirect ownership, score movement, and full MUGEN/IKEMEN presentation parity.

RemapPal previous evidence addendum: required `synthetic-imported-remappal-dynamic.json` checksum `a44ec542` adds bounded active imported dynamic `RemapPal source/dest` expression fallback without score movement. The route seeds `var(0) = 5` and `var(1) = 7`, executes `source = 1,var(0)` and `dest = 2,var(1)`, and requires final imported actor `paletteRemap` telemetry `source [1,5] -> dest [2,7]`; that checkpoint passed 441/441 artifacts, 411 required and 30 optional. Remaining blockers are typed-operation lowering for dynamic params, exact source-bank/default/removal semantics, ACT/SFF pixel parity, truecolor/PNG remap, helper/redirect ownership, exact PalFX order/math, renderer parity, score movement, and full MUGEN/IKEMEN palette parity.

AssertSpecial previous evidence addendum: required `synthetic-imported-assertspecial-juggle-telemetry.json` checksum `9436dfa0` adds bounded official `NoJuggleCheck` typed-operation/runtime/final-actor telemetry without score movement. Static `NoJuggleCheck` lowers into typed `assertspecial` evidence, runtime execution stores `noJuggleCheck`, and final imported actor evidence requires normalized `assertSpecialFlags: ["nojugglecheck"]`; `pnpm qa:trace` passed 440/440 artifacts, 410 required and 30 optional. Remaining blockers are juggle-point accounting, actual juggle bypass behavior, helper/team/global ownership, pause layering, score movement, and full MUGEN/IKEMEN juggle parity.

Helpers/projectiles latest evidence addendum: required `synthetic-imported-helper-projtime-same-id-last-contact.json` checksum `4e74aec3` adds bounded helper-local same-ID `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` guard-then-hit evidence without score movement. A visual Helper spawns two root-owned helper-parented Projectiles with id `8918`; first contact is guarded, later contact hits, and helper route `1200 -> 1306 -> 1307` requires fixed-id plus ID `0` hit/contact time reads while fixed-id plus ID `0` guarded time reads stay inactive. It preserves forbidden helper trap state `1308`, helper/projectile lifecycle rows, owner/root `p1`, parent `p1-helper-0`, owner target-link id `8918`, guard package `S6,34` / `F7038` / `sparkxy = 35,-77`, hit package `S5,35` / `F7038` / `sparkxy = 36,-78`, and current `pnpm qa:trace` 439/439 artifacts, 409 required and 30 optional. Together with `synthetic-imported-helper-projtime-same-id-hit-then-guard.json` checksum `f4c1da3b`, both helper-local same-ID two-contact orders are now required. Previous player same-ID order pair, Proj*Time multi-id, ProjHit/ProjGuarded multi-id, ProjContact multi-id, any-id/fixed-id suffix, player/helper ProjContact state-transition, helper/direct persistence, Projectile/helper `HitCount`, Projectile `GetHitVar`, guard slide-stop/control, and default guard timing/velocity/cornerpush gates remain required. The remaining blockers are exact Proj*Time tick order/lifetime, Move* interaction breadth, helper custom-state breadth beyond these owner-side routes, Projectile/custom-state hitcountpersist breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, visual/audio parity beyond bounded contact packages, score movement, and full Projectile parity.

Helpers/projectiles previous evidence addendum: required `synthetic-imported-helper-projtime-same-id-hit-then-guard.json` checksum `f4c1da3b` adds bounded helper Projectile same-ID hit-then-guard `Proj*Time` evidence without score movement and remains required.

Helpers/projectiles previous evidence addendum: required `synthetic-imported-projectile-projtime-same-id-hit-then-guard.json` checksum `d49ee334` adds bounded player Projectile same-ID `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` hit-then-guard evidence without score movement. Two Projectiles share id `8916`; first contact hits, later contact is guarded, and owner `200 -> 383 -> 384` requires fixed-id plus ID `0` guard/contact time reads while fixed-id plus ID `0` hit time reads stay inactive. It preserves forbidden trap state `385`, two Projectile payloads/lifecycle rows, owner target-link id `8916`, hit package `S5,30` / `F7036` / `sparkxy = 31,-73`, guard package `S6,31` / `F7036` / `sparkxy = 32,-74`, and that checkpoint passed `pnpm qa:trace` 437/437 artifacts, 407 required and 30 optional. Previous guard-then-hit same-ID Proj*Time, Proj*Time multi-id, ProjHit/ProjGuarded multi-id, ProjContact multi-id, any-id/fixed-id suffix, player/helper ProjContact state-transition, helper/direct persistence, Projectile/helper `HitCount`, Projectile `GetHitVar`, guard slide-stop/control, and default guard timing/velocity/cornerpush gates remain required. The remaining blockers are exact Proj*Time tick order/lifetime, Move* interaction breadth, helper custom-state breadth, Projectile/custom-state hitcountpersist breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, visual/audio parity beyond bounded contact packages, score movement, and full Projectile parity.

Helpers/projectiles previous evidence addendum: required `synthetic-imported-projectile-projtime-same-id-last-contact.json` checksum `fb4c2450` adds bounded player Projectile same-ID guard-then-hit `Proj*Time` evidence and remains required.

Helpers/projectiles previous evidence addendum: required `synthetic-imported-projectile-projhittime-multi-id.json` checksum `5d897825`, `synthetic-imported-projectile-projcontacttime-multi-id.json` checksum `d9b3cecf`, and `synthetic-imported-projectile-projguardedtime-multi-id.json` checksum `e52d0d01` add bounded player Projectile `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` multi-id arbitration evidence without score movement and remain required.

Helpers/projectiles previous evidence addendum: required `synthetic-imported-projectile-projhit-multi-id.json` checksum `ab0f3fb3` and `synthetic-imported-projectile-projguarded-multi-id.json` checksum `023921e3` add bounded player Projectile `ProjHit` / `ProjGuarded` multi-id arbitration evidence and remain required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-helper-movereversedpersist.json` checksum `ef8ffdf5` adds bounded helper-owned reversed `StateDef movehitpersist` evidence without score movement. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-helper-moveguardedpersist.json` checksum `d5ce7897` adds bounded helper-owned guarded `StateDef movehitpersist` evidence without score movement. That checkpoint remains required. Previous helper hit-route `synthetic-imported-helper-movehitpersist.json` checksum `2354ef95` remains required too.

Combat/Common1 previous evidence addendum: required `synthetic-imported-helper-hitcountpersist.json` checksum `fc9588d8` adds bounded helper-owned `StateDef hitcountpersist` evidence without score movement. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-helper-hitdefpersist.json` checksum `9d5c64c4` adds bounded helper-owned `StateDef hitdefpersist` evidence without score movement. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-hitdefpersist.json` checksum `4bb3e86c` adds bounded direct `StateDef hitdefpersist` evidence without score movement. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-movehitpersist.json` checksum `5c1ef583` adds bounded direct `StateDef movehitpersist` evidence without score movement. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-hitcountpersist.json` checksum `6f032088` adds bounded direct `StateDef hitcountpersist` evidence without score movement. That checkpoint remains required.

Combat/Common1 current evidence addendum: player-owned Projectile normal-hit GetHitVar artifacts `8e5df79b` / `4d078c5d`, `4356b5cb` / `4b270d45`, and `df2619f9` / `5469bc69` preserve defender states `5000 -> 335/337/339`, target/lifecycle evidence, exact gated metadata, and typed contact audio packages without score movement.

Combat/Common1 previous evidence addendum: upgraded `synthetic-imported-projectile-hitcount.json` trace checksum `ee8f4e19` / final checksum `0fd4adf8` and upgraded `synthetic-imported-helper-projectile-hitcount.json` trace checksum `c8f5dc55` / final checksum `e1569fab` add player-owned and helper-parented/root-owned Projectile normal-hit attacker-side `HitCount` / `UniqHitCount` evidence without score movement. Both routes now require typed `audio:playsnd` and FightFX `F7002` package telemetry, with player-owned `S5,44` and helper-local `S5,43`. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-projectile-gethitvar-hitcount.json` trace checksum `df2619f9` / final checksum `5469bc69` and upgraded `synthetic-imported-helper-projectile-gethitvar-hitcount.json` trace checksum `40ec4f4b` / final checksum `6f15ff30` add player-owned and helper-parented/root-owned Projectile normal-hit `GetHitVar(hitcount)` metadata evidence without score movement. Both routes require typed `audio:playsnd` and FightFX `F7002`, with player `S5,47` and helper-local `S5,42`. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-projectile-gethitvar-hitid-chainid.json` trace checksum `4356b5cb` / final checksum `4b270d45` and upgraded `synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json` trace checksum `616e0b2c` / final checksum `0aebcc73` add player-owned and helper-parented/root-owned Projectile normal-hit `GetHitVar(hitid/chainid)` metadata evidence without score movement. Both routes require typed `audio:playsnd` and FightFX `F7002`, with player `S5,46` and helper-local `S5,41`. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-projectile-gethitvar-hit-metadata.json` trace checksum `8e5df79b` / final checksum `4d078c5d` and upgraded `synthetic-imported-helper-projectile-gethitvar-hit-metadata.json` trace checksum `28afbcea` / final checksum `c960b1cf` add player-owned and helper-parented/root-owned Projectile normal-hit `GetHitVar(damage/hittime/xvel/yvel)` metadata evidence without score movement. Both routes require typed `audio:playsnd` and FightFX `F7002`, with player `S5,45` and helper-local `S5,40`. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-projectile-guard-slide-stop.json` trace checksum `965c2d12` / final checksum `0973a73c` and `synthetic-imported-helper-projectile-guard-slide-stop.json` trace checksum `6c42a378` / final checksum `df8b7a42` add player-owned and helper-parented Projectile guard slide-stop/control evidence without score movement. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-guard-velocity-default.json` checksum `e6bd9b40`, `synthetic-imported-projectile-guard-velocity-default.json` checksum `b72451a4`, and `synthetic-imported-helper-projectile-guard-velocity-default.json` checksum `2067ba99` add official default `guard.velocity` derivation evidence without score movement. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-guard-cornerpush-default.json` checksum `95293bc4`, `synthetic-imported-projectile-guard-cornerpush-default.json` checksum `58798e7a`, and `synthetic-imported-helper-projectile-guard-cornerpush-default.json` checksum `292b2015` add bounded default `guard.cornerpush.veloff` evidence without score movement. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-air-hit-cornerpush-default.json` checksum `73129a04`, `synthetic-imported-projectile-air-hit-cornerpush-default.json` checksum `9bfae4d6`, and `synthetic-imported-helper-projectile-air-hit-cornerpush-default.json` checksum `9c81047d` add bounded default `air.cornerpush.veloff` derivation evidence without score movement. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-air-guard-cornerpush-default.json` checksum `c32781ad`, `synthetic-imported-projectile-air-guard-cornerpush-default.json` checksum `90f5e385`, and `synthetic-imported-helper-projectile-air-guard-cornerpush-default.json` checksum `0271a2b9` add bounded default `airguard.cornerpush.veloff` evidence without score movement. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-air-guard-cornerpush.json` checksum `9fdb8a81`, `synthetic-imported-projectile-air-guard-cornerpush.json` checksum `15f26082`, and `synthetic-imported-helper-projectile-air-guard-cornerpush.json` checksum `35d7148b` add bounded explicit `airguard.cornerpush.veloff` evidence without score movement. Direct `HitDef`, player-owned Projectile, and helper-parented Projectile routes parse/preserve the HitDef corner-push family, guard an airborne defender at the stage edge, route P2 through Common1-style state `155`, and require attacker/owner X velocity evidence from corner pushback; helper Projectile also keeps owner/helper target links and lifecycle payload evidence. That checkpoint remains required.

Combat/Common1 previous evidence addendum: required `synthetic-imported-air-guard-velocity-default.json` checksum `b1710269`, `synthetic-imported-projectile-air-guard-velocity-default.json` checksum `bd1a774e`, and `synthetic-imported-helper-projectile-air-guard-velocity-default.json` checksum `3351e770` add bounded official default `airguard.velocity` derivation evidence without score movement. Direct `HitDef`, player-owned Projectile, and helper-parented Projectile routes omit `airguard.velocity`, author `air.velocity = -6,-8`, derive X/Y air-guard velocity as `air.x * 1.5` and `air.y / 2`, route airborne guarding defenders through Common1-style state `155`, and require actor-frame velocity evidence with X at least `9` and Y at most `-3.5`; helper Projectile also keeps owner/helper target links and lifecycle payload evidence. The remaining blockers are exact air guard physics/landing/timing, exact guard effects, helper/projectile custom-state guard breadth, score movement, and full guard parity.

Combat/Common1 previous evidence addendum: required `synthetic-imported-hitoverride-missonoverride-default-guardflag-filter.json` checksum `05725ecb`, `synthetic-imported-projectile-hitoverride-missonoverride-default-guardflag-filter.json` checksum `c1402d31`, and `synthetic-imported-helper-projectile-hitoverride-missonoverride-default-guardflag-filter.json` checksum `889d77c1` add bounded direct/player/helper default `missonoverride = -1` custom-state HitOverride guardflag-filter evidence without score movement. Direct `HitDef` with `p2stateno = 888`, omitted `missonoverride`, and `guardflag = H` rejects before target memory, override state entry, owner-backed custom-state `888`, default get-hit, or guard states. Player-owned Projectile id `77` and helper-parented Projectile id `8882` omit `missonoverride`, use `p2stateno = 889` / `p2getp1state = 1` / `guardflag = H`, skip slots `1/2`, select slot `5 -> 779`, suppress projectile custom-state `889`, and end P2 in state/action `779`; helper route also records owner/helper target links, helper `targetCount = 1`, projectile `hasHit = true` / `hitsRemaining = 0`, and suppresses helper branch `1293`. Previous explicit `missonoverride = 0`, slot-priority, forceair/forceguard/keepstate, guardflag, Projectile, direct-HitDef, guard, and GetHitVar gates remain required as listed below. The remaining blockers are exact guard timing/guarded contact semantics, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, and full HitOverride/custom-state parity.

Combat/Common1 previous evidence addendum: required `synthetic-imported-hitoverride-missonoverride-zero-guardflag-filter.json` checksum `058b335f`, `synthetic-imported-projectile-hitoverride-missonoverride-zero-guardflag-filter.json` checksum `af29f125`, and `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-guardflag-filter.json` checksum `9edbf3d0` add bounded direct/player/helper explicit `missonoverride = 0` custom-state HitOverride guardflag-filter evidence without score movement. Direct `HitDef`, player-owned Projectile id `77`, and helper-parented Projectile id `8881` all use `guardflag = H`; P2 installs slots `1 -> 776` with `guardflag.not = HA`, `2 -> 778` with `guardflag = A`, and `5 -> 779` with `guardflag = H`; all three routes skip slots `1/2`, select slot `5`, suppress the custom state, and end P2 in state/action `779`, life `1000`, moveType `I`; the helper route also records owner/helper target links, helper `targetCount = 1`, projectile `hasHit = true` / `hitsRemaining = 0`, and suppresses helper branch `1291`. Previous slot-priority proof, default proof, direct default miss proof, explicit `missonoverride = 0` direct/player/helper custom-state force flags, helper-parented/player-owned Projectile guardflag, `missonoverride`, helper-parented/player-owned Projectile, and direct-HitDef HitOverride gates remain required as listed below. The remaining blockers are exact guard timing/guarded contact semantics, forceair/forceguard priority combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, and full HitOverride/custom-state parity.

Combat/Common1 previous evidence addendum: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-slot-priority.json` checksum `9a5a149f` and `synthetic-imported-projectile-hitoverride-missonoverride-zero-slot-priority.json` checksum `96b6b7de` add bounded helper-parented/player-owned Projectile explicit `missonoverride = 0` custom-state HitOverride slot-priority evidence without score movement. Player-owned Projectile id `77` and helper-parented Projectile id `8878` both use `p2stateno = 889`, `p2getp1state = 1`, and `missonoverride = 0`; P2 installs matching slots `5 -> 779` and `2 -> 778`; both routes select slot `2`, consume/remove the projectile, suppress projectile custom-state `889`, and end P2 in state/action `778`, life `1000`, moveType `I`; the helper route also records owner/helper target links, helper `targetCount = 1`, projectile `hasHit = true` / `hitsRemaining = 0`, and suppresses helper `ProjHit` branch `1288`. Previous default proof, direct default miss proof, explicit `missonoverride = 0` direct/player/helper custom-state force flags, helper-parented/player-owned Projectile guardflag, `missonoverride`, helper-parented/player-owned Projectile, and direct-HitDef HitOverride gates remain required as listed below. The remaining blockers are custom-state guardflag breadth beyond the latest explicit route, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, and full Projectile HitOverride/custom-state parity.

Combat/Common1 previous evidence addendum: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` checksum `e23a33af` adds bounded helper-parented Projectile explicit `missonoverride = 0` custom-state `HitOverride forceair` / `forceguard` / `keepstate` evidence without score movement. A visual Helper spawns owner-side Projectile id `8876` with `parentId = p1-helper-0`, `p2stateno = 889`, `p2getp1state = 1`, and `missonoverride = 0`; P2 installs active slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records owner target link `p1 -> p2 / 8876` plus helper target link `p1-helper-0 -> p2 / 8876`; combat selects slot `3`, consumes/removes the projectile, records helper payload `targetCount = 1`, records projectile payload `hasHit = true` / `hitsRemaining = 0`, observes P2 actor-frame evidence with `stateType = A`, `physics = A`, and `guardingFrames >= 1`, avoids override state `780`, suppresses projectile custom-state `889` and helper `ProjHit` branch `1284`, and ends with P2 in state/action `0`, life `1000`, moveType `I`. Previous player-owned Projectile explicit `missonoverride = 0` custom-state force flags, direct/helper/player forceair/forceguard/keepstate, helper-parented/player-owned Projectile guardflag, `missonoverride`, helper-parented/player-owned Projectile, and direct-HitDef HitOverride gates remain required as listed below. The remaining blockers are helper-parented Projectile default `missonoverride` custom-state force flag breadth, custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, and full helper Projectile HitOverride/custom-state parity.

Combat/Common1 previous evidence addendum: required `synthetic-imported-helper-projectile-hitoverride-forceair-forceguard-keepstate.json` checksum `84dc3969` adds bounded helper-parented Projectile `HitOverride forceair` / `forceguard` / `keepstate` evidence without score movement. A visual Helper spawns owner-side Projectile id `8875` with `parentId = p1-helper-0`, `p2stateno = 889`, and `p2getp1state = 0`; P2 installs active slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records owner target link `p1 -> p2 / 8875` plus helper target link `p1-helper-0 -> p2 / 8875`; combat selects slot `3`, records projectile payload evidence with `hasHit = true` / `hitsRemaining = 0`, observes P2 actor-frame evidence with `stateType = A`, `physics = A`, and `guardingFrames >= 1`, avoids state `780`, projectile custom state `889`, and helper `ProjHit` branch `1282`, and ends with P2 in state/action `0`, life `1000`, moveType `I`. Previous player/direct forceair/forceguard/keepstate, helper-parented/player-owned Projectile guardflag, `missonoverride`, helper-parented/player-owned Projectile, and direct-HitDef HitOverride gates remain required as listed below. The remaining blockers are final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, and full helper Projectile HitOverride parity.

Combat/Common1 previous evidence addendum: required `synthetic-imported-projectile-hitoverride-forceair-forceguard-keepstate.json` checksum `3806a769` adds bounded player-owned Projectile `HitOverride forceair` / `forceguard` / `keepstate` evidence without score movement. P1 fires Projectile id `77` with `p2stateno = 889` / `p2getp1state = 0`; P2 installs active slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records target link `p1 -> p2 / 77`; combat selects slot `3`, records projectile hit/removal lifecycle evidence, observes P2 actor-frame evidence with `stateType = A`, `physics = A`, and `guardingFrames >= 1`, avoids state `780` and projectile custom state `889`, and ends with P2 in state/action `0`, life `1000`, moveType `I`. Previous direct-HitDef forceair/forceguard/keepstate and adjacent HitOverride gates remain required as listed below. The remaining blockers are final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, and full Projectile HitOverride parity.

Combat/Common1 previous evidence addendum: required `synthetic-imported-hitoverride-guardflag-filter.json` checksum `b88a2da3` adds bounded direct-HitDef `HitOverride guardflag` / `guardflag.not` filtering evidence without score movement. P1 hits with `attr = S,NA` and `guardflag = H`; P2 installs attr-matching slots `1 -> 776` with `guardflag.not = HA`, `2 -> 778` with `guardflag = A`, and `5 -> 779` with `guardflag = H`; contact records target link `p1 -> p2 / 77`; combat skips slots `1` and `2`, selects slot `5`, redirects P2 through state `779`, keeps life `1000`, and forbids states `776`, `778`, `5000`, `150`, and `151`. The remaining blockers are custom-state guardflag inheritance/timing, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, and full HitOverride parity.

Combat/Common1 previous evidence addendum: required `synthetic-imported-hitoverride-missonoverride-zero-slot-priority.json` checksum `92fefd6a` adds bounded direct-HitDef `missonoverride = 0` custom-state lowest matching HitOverride slot-priority evidence without score movement. P1 declares `p2stateno = 888`, `p2getp1state = 1`, and explicit `missonoverride = 0`; P2 installs matching slots `5 -> 779` and `2 -> 778`; contact records target link `p1 -> p2 / 77`; combat selects slot `2`, redirects P2 through state `778`, keeps life `1000`, and forbids state `779`, owner-backed custom state `888`, and default Common1 states `5000`, `150`, and `151`. Previous helper-parented/player-owned Projectile and direct-HitDef HitOverride gates remain required as listed below. The remaining blockers are helper/projectile custom-state slot-priority breadth, broader `missonoverride` custom-state breadth, custom-state guardflag inheritance/timing, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, and full HitOverride parity.

Combat/Common1 evidence addendum: required `synthetic-imported-helper-projectile-hitoverride-slot-priority.json` checksum `1d058518` adds bounded helper-parented Projectile lowest matching HitOverride slot-priority evidence without score movement. Previous required `synthetic-imported-projectile-hitoverride-slot-priority.json` checksum `378d9ce8` remains the bounded player-owned Projectile counterpart; previous required `synthetic-imported-hitoverride-slot-priority.json` checksum `8de62354` remains the bounded direct-HitDef counterpart. Previous required `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero.json` checksum `62d7d6b8` remains bounded helper-parented Projectile `missonoverride = 0` HitOverride redirect evidence, previous required `synthetic-imported-projectile-hitoverride-missonoverride-zero.json` checksum `5c12f3cc` remains the player-owned Projectile `missonoverride = 0` counterpart, previous required `synthetic-imported-helper-projectile-hitoverride-missonoverride-one.json` checksum `a99979bb` remains bounded helper-parented Projectile `missonoverride = 1` HitOverride miss evidence, previous required `synthetic-imported-projectile-hitoverride-missonoverride-one.json` checksum `2dc86467` remains the player-owned Projectile `missonoverride = 1` counterpart, previous required `synthetic-imported-helper-projectile-hitoverride-p2stateno.json` checksum `ce4c1d9a` remains helper-parented Projectile `p2stateno` HitOverride redirect evidence, and previous required `synthetic-imported-projectile-hitoverride-p2stateno.json` checksum `2ec0725a` remains the player-owned `p2stateno` counterpart. The remaining blockers are broader `missonoverride` custom-state breadth, custom-state slot-priority breadth, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, and full Projectile/HitOverride parity.

Previous runtime behavior checkpoint: required `synthetic-imported-hitoverride-missonoverride-zero-guardflag-filter.json` trace checksum `058b335f`, `synthetic-imported-projectile-hitoverride-missonoverride-zero-guardflag-filter.json` trace checksum `af29f125`, and `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-guardflag-filter.json` trace checksum `9edbf3d0` prove bounded direct/player/helper explicit `missonoverride = 0` custom-state HitOverride guardflag filtering: `guardflag = H` skips slot `1 -> 776` with `guardflag.not = HA` and slot `2 -> 778` with `guardflag = A`, selects slot `5 -> 779`, suppresses the custom state, and returns P2 to state/action `779`, life `1000`, moveType `I`; helper route also proves owner/helper target links and helper branch suppression. This is not exact guard timing/guarded contact semantics, score movement, or full HitOverride/custom-state parity.

Previous runtime behavior checkpoint: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-slot-priority.json` trace checksum `9a5a149f` plus `synthetic-imported-projectile-hitoverride-missonoverride-zero-slot-priority.json` trace checksum `96b6b7de` prove bounded Projectile explicit `missonoverride = 0` custom-state HitOverride slot priority: player-owned Projectile id `77` and helper-parented Projectile id `8878` both select slot `2 -> 778` over slot `5 -> 779`, suppress projectile custom state `889`, and return P2 to state/action `778`, life `1000`, moveType `I`; helper route also proves owner/helper target links and helper `ProjHit` suppression. This is not custom-state guardflag breadth beyond the latest explicit route, score movement, or full Projectile HitOverride/custom-state parity.

Previous runtime behavior checkpoint: required `synthetic-imported-projectile-hitoverride-forceair-forceguard-keepstate.json` trace checksum `3806a769` proves bounded player-owned Projectile `HitOverride forceair` / `forceguard` / `keepstate` behavior: P1 fires Projectile id `77` with `p2stateno = 889` / `p2getp1state = 0`; P2 installs slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; combat selects slot `3`, records target link `p1 -> p2 / 77`, records projectile hit/removal lifecycle evidence, observes P2 actor-frame evidence with `stateType = A`, `physics = A`, and `guardingFrames >= 1`, avoids states `780` and `889`, and ends with P2 in state/action `0`, life `1000`, moveType `I`. This is not final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state forceair/forceguard/keepstate breadth, score movement, or full Projectile HitOverride parity.

Previous runtime behavior checkpoint: required `synthetic-imported-hitoverride-forceair-forceguard-keepstate.json` trace checksum `19787fb2` proves bounded direct-HitDef `HitOverride forceair` / `forceguard` / `keepstate` behavior: P1 direct-hits with `attr = S,NA`; P2 installs slot `3 -> 780` with `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; combat selects slot `3`, records target link `p1 -> p2 / 77`, observes P2 actor-frame evidence with `stateType = A`, `physics = A`, and `guardingFrames >= 1`, avoids state `780`, and ends with P2 in state/action `0`, life `1000`, moveType `I`. This is not final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state forceair/forceguard/keepstate breadth, score movement, or full HitOverride parity.

Previous runtime behavior checkpoint: required `synthetic-imported-helper-projectile-hitoverride-guardflag-filter.json` trace checksum `41a87267` proves bounded helper-parented Projectile `HitOverride guardflag` / `guardflag.not` filtering: visual Helper spawns Projectile id `8874` with `guardflag = H` and `p2stateno = 889`; attr-matching slot `1 -> 776` is skipped because `guardflag.not = HA` overlaps, slot `2 -> 778` is skipped because `guardflag = A` does not overlap, slot `5 -> 779` is selected because `guardflag = H` overlaps, owner target link `p1 -> p2 / 8874` and helper target link `p1-helper-0 -> p2 / 8874` are recorded, projectile payload reaches `hitsRemaining = 0` / `hasHit = true`, P2 redirects through state `779`, keeps life `1000`, and states `776`, `778`, `889`, `1280`, `5000`, `150`, and `151` are forbidden. This is not custom-state guardflag inheritance/timing, custom-state forceair/forceguard/keepstate breadth, score movement, or full helper Projectile/HitOverride parity.

Previous runtime behavior checkpoint: required `synthetic-imported-hitoverride-guardflag-filter.json` trace checksum `b88a2da3` proves bounded direct-HitDef `HitOverride guardflag` / `guardflag.not` filtering: a direct `HitDef attr = S,NA` / `guardflag = H` skips attr-matching slot `1 -> 776` because `guardflag.not = HA` overlaps, skips slot `2 -> 778` because `guardflag = A` does not overlap, selects slot `5 -> 779` because `guardflag = H` overlaps, records target link `p1 -> p2 / 77`, redirects P2 through state `779`, keeps P2 life `1000`, and forbids states `776`, `778`, `5000`, `150`, and `151`. This is not custom-state guardflag inheritance/timing, forceair/forceguard/keepstate combinations, score movement, or full HitOverride parity.

Previous runtime behavior checkpoint: required `synthetic-imported-helper-projectile-hitoverride-slot-priority.json` trace checksum `1d058518` proves bounded helper-parented Projectile HitOverride slot priority: a visual Helper spawns Projectile id `8873` with `parentId = p1-helper-0`, `p2stateno = 889`, and `p2getp1state = 0`; P2 installs matching `HitOverride` slot `5 -> 779` and slot `2 -> 778` in high-to-low controller order; contact records owner target link `p1 -> p2 / 8873` plus helper target link `p1-helper-0 -> p2 / 8873`, marks projectile payload `hitsRemaining = 0` / `hasHit = true`, combat selects slot `2`, redirects P2 through state `778`, keeps P2 life `1000`, and forbids state `779`, projectile custom state `889`, helper `ProjHit` branch `1278`, and default Common1 states `5000`, `150`, and `151`. This is not custom-state slot-priority breadth, broader `missonoverride` custom-state breadth, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, score movement, or full Projectile/HitOverride parity. Previous runtime behavior checkpoint: required `synthetic-imported-projectile-hitoverride-slot-priority.json` trace checksum `378d9ce8` proves bounded player-owned Projectile HitOverride slot priority. Previous runtime behavior checkpoint: required `synthetic-imported-hitoverride-slot-priority.json` trace checksum `8de62354` proves bounded direct-HitDef HitOverride slot priority. Previous runtime behavior checkpoint: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero.json` trace checksum `62d7d6b8` proves bounded helper-parented Projectile `missonoverride = 0` HitOverride redirect behavior. Previous runtime behavior checkpoint: required `synthetic-imported-projectile-hitoverride-missonoverride-zero.json` trace checksum `5c12f3cc` proves bounded player-owned Projectile `missonoverride = 0` HitOverride redirect behavior. Previous runtime behavior checkpoint: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-one.json` trace checksum `a99979bb` proves bounded helper-parented Projectile `missonoverride = 1` HitOverride miss behavior. Previous runtime behavior checkpoint: required `synthetic-imported-projectile-hitoverride-missonoverride-one.json` trace checksum `2dc86467` proves bounded player-owned Projectile `missonoverride = 1` HitOverride miss behavior. Previous runtime behavior checkpoint: required `synthetic-imported-helper-projectile-hitoverride-p2stateno.json` trace checksum `ce4c1d9a` proves bounded helper-parented Projectile `p2stateno` HitOverride behavior. Previous runtime behavior checkpoint: required `synthetic-imported-projectile-hitoverride-p2stateno.json` trace checksum `2ec0725a` proves bounded player-owned Projectile `p2stateno` HitOverride behavior. Previous direct-HitDef HitOverride, guard, GetHitVar, custom-state, `AssertSpecial`, helper controller-param, shadow/global telemetry, fast lie-down recovery, suppression, controller-param redirect/bottom, and movement checkpoints remain required as listed in the backlog.

Latest runtime QA-hardening checkpoint: `synthetic-imported-default-fall-official-air-recovery` is now in the required artifact coverage-summary contract. The artifact already existed as required with checksum `b0363be9`; this prevents required-coverage drift only and does not move any score or behavior claim.

Latest ownership checkpoint: `RuntimeMatchActorRosterWorld` owns bounded current P1/P2 actor roster projection for `PlayableMatchRuntime`: stable P1/P2 actor order, explicit id lookup, fail-closed opponent projection for actors outside the roster, effect-store owner ids, helper-owned `TargetState` actor lookup, imported compatibility-session actor lists, and effect-store summaries route through one named boundary. Focused `RuntimeMatchActorRosterSystem` and match-runtime coverage prove roster order, live refs, id lookup, mirrored one-on-one opponent projection, unknown-actor rejection, and snapshot/effect compatibility preservation. This is ownership cleanup only, not real teams/simul roster ownership, helper-owned actor discovery, dynamic roster mutation, richer identity metadata, exact VM scheduling, new broad parity, or score movement.

Previous ownership checkpoint: `RuntimeActiveControllerTelemetryWorld` owns bounded active-controller telemetry hook construction outside `PlayableMatchRuntime`: active state hooks, side-effect dispatchers, and fallback runtime-controller dispatch share one controller/operation hook set before forwarding into `RuntimeCompatibilityTelemetryWorld`. Focused `RuntimeActiveControllerTelemetrySystem` coverage proves controller and operation forwarding through the seam. This is ownership cleanup only, not exact telemetry event semantics, imported-only filtering, event retention limits, helper/team/redirect telemetry breadth, visual/debug UI parity, new broad parity, or score movement.

Previous ownership checkpoint: `RuntimeMatchCombatStateHooksWorld` owns bounded combat state-hook adapter construction outside `PlayableMatchRuntime`: direct/projectile combat hooks preserve state-owner availability and entry options, while helper combat hooks keep self-owned availability checks and still forward entry options. Focused `RuntimeMatchCombatStateHooksSystem` coverage proves both contracts, and the match runtime builds both hook sets through the seam before combat bridge handoff. This is ownership cleanup only, not helper-owned custom-state table breadth, throws, teams/simul actor registries, multi-target helper ownership, exact combat/helper tick order, visual/audio parity, new broad parity, or score movement.

Previous ownership checkpoint: `RuntimeMatchOpponentContextWorld` owns bounded current 1v1 match-opponent context construction for active/pause/hitpause lifecycle bridges outside `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld`: mirrored P1/P2 opponent selection, singleton lifecycle `opponents` list projection, and unknown-actor fail-closed behavior now sit behind one named seam. Focused `RuntimeMatchOpponentContextSystem` coverage proves mirrored contexts and fail-closed behavior; existing match/pause/hitpause tests prove callers still forward direct opponent plus explicit one-opponent lifecycle context. This is ownership cleanup only, not real teams/simul roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond actor refs, exact helper lifecycle/pause/combat ordering, visual/audio parity, new broad parity, or score movement.

Previous ownership checkpoint: `RuntimeEffectHelperContextWorld` owns bounded visual Helper lifecycle context construction outside `RuntimeEffectLifecycleWorld`: complete-owner validation, parent/root runtime-state projection, current opponent id/state fallback, explicit lifecycle opponent-list to nearest-order helper `opponentRoster` projection, explicit roster override, target-candidate forwarding, and helper `TargetState` / telemetry hook forwarding now sit behind one named seam. Focused `RuntimeEffectHelperContextSystem` coverage proves nearest roster ordering, explicit roster preservation, target/hook forwarding, and incomplete-owner fail-closed behavior; existing `EffectLifecycleSystem` coverage proves active/paused lifecycle callers still forward context. This is ownership cleanup only, not real teams/simul lifecycle roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond ids/runtime state, exact helper lifecycle/pause/combat ordering, visual/audio parity, new broad parity, or score movement.

Previous ownership checkpoint: `RuntimeMatchHelperProjectileTargetWorld` owns bounded match-level helper-parented Projectile target-memory bridge wiring outside `PlayableMatchRuntime`: normal post-fighter combat forwards owner, defender, projectile, and `RuntimeTargetWorld` through one named seam before lower helper target-memory logic runs. Focused `RuntimeMatchHelperProjectileTargetSystem` coverage proves forwarding and owner-projectile fail-closed behavior. This is ownership cleanup only, not helper-owned Projectile contact timing, helper-owned custom-state table breadth, teams/simul actor registry, multi-target helper ownership, exact target lifetime, visual/audio parity, new broad parity, or score movement.

Previous ownership checkpoint: `RuntimeMatchHelperBindingWorld` now owns bounded match-level helper callback wiring outside `PlayableMatchRuntime`: helper-owned `TargetState` owner handlers and helper-local Projectile telemetry handlers attach through one named seam, while target entry still delegates to `RuntimeMatchHelperTargetStateWorld` and telemetry filtering still delegates to `RuntimeHelperTelemetryWorld`. Focused `RuntimeMatchHelperBindingSystem` coverage proves owner-specific target-state route forwarding, stale handler replacement, helper-state/owner-state telemetry attribution, and non-Projectile telemetry ignore behavior. This is ownership cleanup only, not helper custom-state table breadth, throws, teams/simul actor registry, multi-target helper ownership, exact helper TargetState/projectile timing, broad helper telemetry semantics, visual/audio parity, new broad parity, or score movement.

Previous ownership checkpoint: `RuntimeMatchFighterAdvanceWorld` owns bounded active 1v1 fighter-advance orchestration outside `PlayableMatchRuntime`: P1 advance, P2 auto-guard start, pause-gated P2 advance, and P1 auto-guard start route through one named world. Focused `RuntimeMatchFighterAdvanceSystem` coverage proves normal P1/P2 ordering and pause-after-P1 skip behavior. This is ownership cleanup only, not exact player tick order, pause-start arbitration, teams/simul roster advance, helper/team/redirect actor advance semantics, guard-start parity, visual/audio parity, new broad parity, or score movement.

Previous ownership checkpoint: `RuntimeMatchPauseControllerWorld` owns bounded Pause/SuperPause controller result side effects outside `PlayableMatchRuntime`: pause application routes through `RuntimePauseWorld`, SuperPause power delta routes through an injected resource hook, and the existing match log line emits through one named world. Focused `PauseSystem` coverage proves tick/controller/op forwarding, power-delta handoff, log emission, and zero-length no-side-effect behavior. This is ownership cleanup only, not exact pause layering, SuperPause background/effects/sound timing, helper/team/redirect pause ownership, pause/hitpause command parity, visual/audio parity, new broad parity, or score movement.

Previous ownership checkpoint: `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld` now pass explicit one-opponent lifecycle `opponents` lists into `RuntimeEffectLifecycleWorld` from the real 1v1 match, pause, and hitpause bridges while preserving the legacy direct opponent argument for current `opponentId` / `opponentState` fallback routes. `RuntimeEffectLifecycleWorld` accepts those explicit lifecycle lists, builds id-bearing nearest-order `opponentRoster` entries through `RuntimeOpponentSelectionWorld`, and strips the `opponents` control field before helper options reach `HelperSystem`. `RuntimeOpponentSelectionWorld` builds those roster entries without cloning runtime states, `HelperSystem` accepts the shared roster-entry contract, and `RuntimeOpponentSelectionWorld` keeps metadata attached while sorting so `EnemyNear(index), TeamSide` can resolve non-current entries after nearest ordering when a broader caller supplies them. `HelperSystem` also continues to route legacy caller-supplied helper-local `opponentStates` through `RuntimeOpponentSelectionWorld`, so helper-local `EnemyNear(index)`, `EnemyNear(var(n))`, `NumEnemy`, and direct helper opponent context share the nearest-roster ordering boundary already used by `RuntimeExpressionContextWorld`. `RuntimeOpponentSelectionWorld` still owns bounded horizontal body-distance scoring and stable nearest-roster ordering for runtime opponent lists, while `RuntimeExpressionContextWorld` delegates caller-supplied `EnemyNear(index)` roster ordering through that boundary. `ExpressionEvaluator` still owns the explicit enemy-near redirect callback. Focused `MatchInteractionSystem`, `PauseSystem`, `RuntimeHitPauseSystem`, `EffectLifecycleSystem`, `RuntimeOpponentSelectionSystem`, `RuntimeExpressionContextSystem`, `RuntimeCnsSubset`, and `EffectActorSystem` coverage proves concrete 1v1 lifecycle roster source forwarding, explicit lifecycle opponent-list roster construction, no control-field leakage into helper options, id-bearing roster construction, lifecycle active/paused roster forwarding, nearest ordering, raw runtime-state list ordering, runtime-context integration, direct evaluator support, dynamic `var(n)` index expressions, helper-local nearest indexed routing, non-current helper-roster `TeamSide`, and missing-index fail-closed behavior. The broader `HelperSystem` micro-VM still owns helper-local state/action/kinematic/destruction, control/metadata/resource/variable trigger branches, bounded identity/parent/root/opponent reads, helper direct combat, helper and helper-parented Projectile target memory/Target* routes, helper-local effect/projectile spawn/mutation/count reads, helper-local contact markers, and helper-local Projectile timing reads. `RuntimeStunWorld`, `RuntimeStateAvailabilityWorld`, `RuntimeHitStateTransitionWorld`, `RuntimeGetHitStateWorld`, `RuntimeGuardWorld`, `RuntimeOrientationWorld`, `RuntimeHitEligibilityWorld`, `RuntimeTargetWorld.applyTargetBindings` / `applyBindToTarget`, `RuntimeRecoverySystem`, `HitSparkAssetSystem`, `RuntimeRandomSystem`, and `RuntimeContactMemoryWorld` remain earlier ownership checkpoints. These are ownership cleanups plus bounded helper-local evidence only, not real teams/simul roster ownership, automatic multi-opponent match roster discovery, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, broad indexed redirect ownership, new broad parity, or score movement.

Latest R2 fighter advance ownership checkpoint: `RuntimeFighterAdvanceWorld` now owns bounded per-fighter advance order from `PlayableMatchRuntime`: sprite-effect tick, hit eligibility slots, HitOverride slots, contact timers, render-angle reset, state clock, frame constraints, recovery-window tick, preserve-moveType read, stun, move lifecycle, kinematics, animation, active controllers, ground-recovery landing, lie-down recovery, and frozen-position preservation. `PlayableMatchRuntime` still supplies concrete worlds, state/action callbacks, active-controller execution, and stage/tick context. Focused system coverage plus the runtime gate suite passed, but this is debt reduction only and does not move any score because exact MUGEN/IKEMEN player tick order, persistent-controller timing, helper/team/redirect actor advance semantics, recovery/stun/physics arbitration, visual parity, and full VM parity remain blocked.

Previous R2 dispatch ownership checkpoint: `RuntimeActiveControllerDispatchWorld` owns bounded active-controller route orchestration after active scan/trigger pass: it tries `RuntimeActiveStateDispatchWorld` first, routes shared runtime-controller execution through the existing runtime-controller handoff, routes side effects through `RuntimeActiveSideEffectDispatchWorld`, and keeps unsupported dispatches fail-soft/reportable. `PlayableMatchRuntime` still supplies concrete state/action/world/telemetry hooks, frame lookup, target-entry callbacks, stage/tick context, and active-loop order. Focused dispatch-system coverage plus the full runtime gate suite passed, but this is debt reduction only and does not move any score because exact CNS VM tick order, persistent-controller semantics, helper/team/redirect controller scopes, side-effect ordering parity, target/combat/presentation semantic parity, missing-action fallback parity, unsupported-feature reporting breadth, and full active-controller parity remain blocked.

Latest runtime/render palette addendum: DEF `pal1..pal12` ACT refs now load into character palettes, indexed SFF v1/v2 sprite decoders preserve palette-index pixels plus palette bytes, `SffSpriteProvider` can rebuild a decoded indexed sprite canvas using a loaded ACT destination palette when runtime `RemapPal` is active, `CharacterRenderer` forwards actor `paletteRemap`, and `CompatibilityReport.palettes` exposes total/parsed/color/transparency counts. Focused `ActParser`, `SffParser`, `SffSpriteProvider`, `CharacterRenderer`, `MugenCharacterLoader`, and `CompatibilityReport` tests prove this handoff. This is bounded indexed palette handoff only; exact source-bank semantics, truecolor/PNG remap, helper/team/redirect palette ownership, exact PalFX/RemapPal math/blend order, browser fixture parity, score movement, and full palette/presentation parity remain blocked.

Previous runtime read-context addendum: `RuntimeExpressionContextWorld` now sorts explicit opponent rosters by bounded nearest body-distance before resolving `EnemyNear(index)`, preserving caller order for stable ties and keeping `NumEnemy` tied to supplied roster length. Focused `RuntimeExpressionContextSystem` coverage proves `EnemyNear(0..3)` resolves nearest/stable-tie/far order from an unsorted roster. This is shared read-context cleanup only; real teams/simul roster ownership, helper-owned opponent rosters, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous runtime adapter addendum: `RuntimeDispatchEvaluationWorld` and `RuntimeTriggerEvaluationWorld` now forward optional explicit opponent rosters into their context factories, and `PlayableMatchRuntime` routes its current one-opponent list through that seam. Focused `RuntimeDispatchEvaluationSystem` and `RuntimeTriggerEvaluationSystem` coverage proves roster forwarding plus `NumEnemy` evaluation through dynamic controller-param and trigger paths. This is shared adapter/read-context cleanup only; real teams/simul roster ownership, helper-owned opponent rosters, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous runtime read-context addendum: `RuntimeExpressionContextWorld` accepts an optional explicit opponent roster and wires `EnemyNear(index)` plus `NumEnemy` through that list before falling back to the current one-opponent context. Focused `RuntimeExpressionContextSystem` coverage proves roster-backed `EnemyNear(1)` / `EnemyNear(var(n))`, `NumEnemy = 2`, default one-opponent fallback, and missing-index fail-closed behavior. This is shared read-context cleanup only; real teams/simul roster ownership, helper-owned opponent rosters, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous helper-count addendum: `ExpressionEvaluator` can read `NumEnemy` from an explicit provider, and `HelperSystem` derives helper-local `NumEnemy` from supplied `opponentStates` lists. Focused `RuntimeCnsSubset` and `EffectActorSystem` coverage proves explicit opponent-count reads beside the existing caller-provided `EnemyNear(index)` route. This is context/redirect/count cleanup only; teams/simul opponent ordering, helper-owned opponent rosters, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper VM parity remain blocked.

Previous trace aggregate (historical 432-artifact checkpoint): `pnpm qa:trace` passed 432/432 artifacts, with 402 required and 30 optional local-fixture artifacts when private fixtures exist. The latest required R1 runtime oracles at that checkpoint were `synthetic-imported-projectile-projhit-multi-id.json` checksum `ab0f3fb3` and `synthetic-imported-projectile-projguarded-multi-id.json` checksum `023921e3`, proving bounded player-owned two-projectile `ProjHit` / `ProjGuarded` arbitration: wrong-id/non-contact Projectile ids `8905` / `8907` do not route forbidden states `367` / `370`, while valid hit/guard Projectile ids `8906` / `8908` route owner `200 -> 365 -> 366` and `200 -> 368 -> 369` through fixed-id, any-id, and ID `0` forms, with two Projectile payloads, owner target-links, hit/guard sounds, and FightFX evidence. Previous multi-id `ProjContact`, any-id/fixed-id ProjHit/ProjGuarded/ProjContact, player/helper `ProjContact` state-transition, helper reversed/guarded/hit-route `movehitpersist`, helper `hitcountpersist`, helper `hitdefpersist`, direct `hitdefpersist`, direct `movehitpersist`, direct `hitcountpersist`, Projectile attacker-side `HitCount` / `UniqHitCount`, Projectile `GetHitVar(hitcount)`, `hitid/chainid`, `damage/hittime/xvel/yvel`, guard slide-stop/control, default `guard.hittime/slidetime/ctrltime`, default `guard.velocity`, default/explicit stand/down/air corner-push, default/explicit `airguard.cornerpush.veloff`, default/explicit `airguard.velocity`, HitOverride, explicit/default `missonoverride`, slot-priority, forceair/forceguard/keepstate, guardflag, Projectile, direct-HitDef, guard, GetHitVar, and custom-state oracles remain required as detailed in the backlog. This does not move scores because exact `ProjHit` / `ProjGuarded` / `ProjContact` tick order/lifetime, same-ID selection priority, Move* interaction breadth, helper Projectile/custom-state movehitpersist breadth, Projectile/custom-state hitcountpersist breadth, exact reversal priority/target-state semantics, exact combo accumulation, chain-hit eligibility arbitration, multi-hit/multi-target/team counting, exact hitpause lifetime, exact target lifetime/tick order, helper-owned custom-state tables, custom-state inheritance, lie-down/guard tables, recovery timing, guard velocity decay/friction, corner-push timing/decay, wall friction, exact down-hit/air-hit/guard timing/physics/landing/effects, guard KO/no-KO round flow, throws, teams/simul, visual/audio parity, and full Common1/combat parity remain blocked.

Previous trace aggregate: `pnpm qa:trace` passed 364/364 artifacts, with 334 required and 30 optional local-fixture artifacts when private fixtures exist. The latest required R1 runtime oracles are `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-slot-priority.json` checksum `9a5a149f` and `synthetic-imported-projectile-hitoverride-missonoverride-zero-slot-priority.json` checksum `96b6b7de`, proving bounded helper-parented/player-owned Projectile explicit `missonoverride = 0` custom-state HitOverride slot-priority evidence. Previous `synthetic-imported-helper-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json` checksum `fb964bfb`, `synthetic-imported-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json` checksum `4ce42cf3`, `synthetic-imported-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json` checksum `20e40425`, `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` checksum `e23a33af`, `synthetic-imported-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` checksum `15bc955b`, `synthetic-imported-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` checksum `4d9043a5`, `synthetic-imported-helper-projectile-hitoverride-forceair-forceguard-keepstate.json` checksum `84dc3969`, `synthetic-imported-projectile-hitoverride-forceair-forceguard-keepstate.json` checksum `3806a769`, `synthetic-imported-hitoverride-forceair-forceguard-keepstate.json` checksum `19787fb2`, `synthetic-imported-helper-projectile-hitoverride-guardflag-filter.json` checksum `41a87267`, `synthetic-imported-projectile-hitoverride-guardflag-filter.json` checksum `a51e82ec`, `synthetic-imported-hitoverride-guardflag-filter.json` checksum `b88a2da3`, `synthetic-imported-hitoverride-missonoverride-zero-slot-priority.json` checksum `92fefd6a`, `synthetic-imported-helper-projectile-hitoverride-slot-priority.json` checksum `1d058518`, `synthetic-imported-projectile-hitoverride-slot-priority.json` checksum `378d9ce8`, and `synthetic-imported-hitoverride-slot-priority.json` checksum `8de62354` remain required for bounded direct/helper/player forceair, guardflag, slot-priority, and custom-state routes. Previous Projectile/direct-HitDef `missonoverride`, `p2stateno`, guard, GetHitVar, and custom-state oracles remain required as detailed in the backlog. This does not move scores because custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, exact camera waveform, pause/stage/layer interaction, metadata lifetime/stacking, exact guard timing, helper/projectile custom-state guard metadata inheritance, exact combo accumulation, chain-hit eligibility arbitration, multi-hit timing, exact throw positioning, z-axis and guard snap parity, exact physics integration, fall acceleration arbitration, exact get-hit animation selection, air-hit arbitration, throws, exact bind tick-order/lifetime, visual bind parity, exact lie-down tables, helper/root/parent redirects, teams/simul, exact target lifetime, exact recovery threshold behavior, and full get-hit/custom-state parity remain blocked.

Historical 2026-07-08 trace aggregate: `pnpm qa:trace` passes 523/523 artifacts, with 492 required and 31 optional local-fixture artifacts when private fixtures exist. The current required R1 sprite-effect oracle is `synthetic-imported-afterimage-dynamic.json` trace checksum `e7299ac5` / final checksum `b946d805`, proving bounded active imported dynamic AfterImage expression fallback into typed `sprite-effect:afterimage` telemetry plus actor-frame/final ghost-trail evidence. Previous dynamic Angle oracles `synthetic-imported-angle-dynamic.json` checksum `13560dcd` / final checksum `4d7c4726` and `synthetic-imported-anglemul-dynamic.json` checksum `0bb54a1c` / final checksum `c9f2b557`, dynamic PalFX oracle `synthetic-imported-palfx-dynamic.json` checksum `36cdca15` / final checksum `7a1a4525`, dynamic AfterImageTime oracle `synthetic-imported-afterimagetime-dynamic.json` checksum `c5ef6fff` / final checksum `661a233d`, dynamic RemapPal oracle `synthetic-imported-remappal-dynamic.json` checksum `5f04f2d4` / final checksum `71ad06f0`, dynamic Trans oracle `synthetic-imported-trans-dynamic.json` checksum `4bffcd82` / final checksum `5beea0f0`, dynamic SprPriority oracle `synthetic-imported-sprpriority-dynamic.json` checksum `a9e0862d` / final checksum `4919326d`, dynamic resource oracle `synthetic-imported-resourceset-dynamic.json` checksum `1bd04945` / final checksum `35db4dcd`, dynamic `LifeAdd` oracle `synthetic-imported-lifeadd-dynamic.json` checksum `8b0493f8` / final checksum `cbe4ab51`, dynamic `ScreenBound` oracle `synthetic-imported-screenbound-dynamic.json` checksum `9797bdfe` / final checksum `d76b641a`, dynamic `PosFreeze` oracle `synthetic-imported-posfreeze-dynamic.json` checksum `8de0c2e9` / final checksum `6c40bb79`, dynamic `PlayerPush` oracle `synthetic-imported-playerpush-dynamic.json` checksum `b7775652` / final checksum `92aca1cd`, dynamic `Width` oracle `synthetic-imported-width-dynamic.json` checksum `51554c91` / final checksum `84a85277`, helper dynamic `PosAdd` oracle `synthetic-imported-helper-dynamic-posadd.json` checksum `97ec15d0`, helper dynamic `PosSet` oracle `synthetic-imported-helper-dynamic-posset.json` checksum `50596bc2`, helper dynamic `VelMul` oracle `synthetic-imported-helper-dynamic-velmul.json` checksum `08220a98`, helper dynamic `VelAdd` oracle `synthetic-imported-helper-dynamic-veladd.json` checksum `fbb8bcae`, and helper dynamic `VelSet` oracle `synthetic-imported-helper-controller-param-parentroot.json` trace checksum `94919326` remain required. Previous Common1 recovery/guard/presentation/audio/env, controller-param, target/redirect, AssertSpecial, Projectile/helper, ReversalDef, and movement oracles remain active. This does not move scores because `sinadd`, exact axis pivot/collision rotation/scale, exact no-active-afterimage behavior, trail blending, palette math, sampling cadence, exact source-bank/default/removal semantics, ACT/SFF pixel parity, exact add/sub alpha math, exact layer/shadow/helper/Explod draw-order parity, renderer parity, broader dynamic resource-family lowering beyond current owner-local routes, exact KO/round/lifebar flow, exact camera/screen-edge behavior, exact PosFreeze tick order, pause/hitpause/helper/team parity, exact movement, timer/round ownership, intro/KO slow-motion/winpose/KO/lifebar/round-transition behavior, pause interaction, global/team/helper ownership, exact guard/recovery timing, broader redirects, teams/simul, visual/audio parity, Target* mutation mixing, helper-owned custom states, throws, keyctrl, and broader VM behavior remain blocked.

Recent required oracles remain stable or intentionally strengthened: `synthetic-imported-crouch-guard-hold-crouch-return.json` checksum `83ecb699`, `synthetic-imported-default-guard-hold-walk-return.json` checksum `75d4db9c`, `synthetic-imported-default-fall-ground-recovery-priority.json` checksum `e83b2db7`, `synthetic-imported-default-fall-recovery-input-priority.json` checksum `f5e72e07`, `synthetic-imported-hitfall-canrecover-ready.json` checksum `c0097d7f`, `synthetic-imported-basic-movement.json` checksum `917ff3e5`, `synthetic-imported-assertspecial-roundnotover.json` checksum `342d49f0`, `synthetic-imported-palfx-remappal.json` checksum `ba5fc1e6`, `synthetic-imported-envcolor-under.json` checksum `0a7b5c96`, `synthetic-imported-hitfall-recover-true.json` checksum `f1e3424a`, `synthetic-imported-hitfall-recover-false.json` checksum `236df0a8`, `synthetic-imported-hitfall-false.json` checksum `1d538e43`, `synthetic-imported-hitfall-canrecover.json` checksum `7cf7ab46`, and the previously listed Common1, Projectile, Helper, Target, FightFX/audio, HitBy, HitPauseTime, and ModifyExplod oracles remain active in `pnpm qa:trace`.

The current HitDef-effect oracle set is `synthetic-imported-hitdef-hit-sound.json` checksum `6fc00d8a`, `synthetic-imported-hitdef-guard-sound.json` checksum `fdf1f7f6`, `synthetic-imported-hitdef-hit-spark.json` checksum `b6554124`, `synthetic-imported-hitdef-guard-spark.json` checksum `72c8fa3a`, `synthetic-imported-hitdef-common-spark.json` checksum `5ea054d7`, `synthetic-imported-hitdef-fightfx-spark.json` checksum `11537b56`, `synthetic-imported-hitdef-common-guard-spark.json` checksum `7650a09c`, `synthetic-imported-hitdef-fightfx-guard-spark.json` checksum `32f3e92d`, `synthetic-imported-hitdef-hit-effect-package.json` checksum `46aa5ce1`, and `synthetic-imported-hitdef-guard-effect-package.json` checksum `1c3167b7`; the package gates now require sound and spark evidence to share non-empty contact id/tick/kind metadata, preserve selected AIR-frame local offset/duration before renderer handoff, and preserve `soundPrefix = kfm` for the F-prefixed hit package sound. `HitSparkRenderer` treats `S` spark refs as player AIR action refs, classifies unprefixed refs as common/default and `F` refs as FightFX, preserves runtime-provided package frames from `hitSparkLibraries`, synthesizes bounded common/FightFX system lookup frames when no package frame exists, and `pnpm qa:smoke` requires active desktop/mobile sparks plus player-source resolved-sprite diagnostics. `MugenCharacterLoader` can load optional `data/fight.def` / `fightfx.air` / `fightfx.sff` / `fightfx.snd`, `createImportedFighterDefinition` can hand those AIR actions and SND archives to runtime `hitSparkLibraries`, and `App` can register decoded system SFF sprites plus prefix-keyed SND archives through the global provider/audio routes; exact intra-tick sound/spark ordering, common/FightFX render lookup, layering, scale, palette, timing, channel ownership/fallback, motif/screenpack ownership, hit/guard-effect parity, and full presentation parity remain blocked.

The latest optional official KFM get-hit oracle is `kfm-official-default-crouch-gethit-progression.json` checksum `3d197fae`. The latest optional official KFM presentation oracles are `kfm-official-x-hit-sound.json` checksum `bd153db9` and `kfm-official-x-hit-spark.json` checksum `bd153db9`. The latest optional official KFM guard-hit oracles include `kfm-official-default-guard-hold-walk-return.json` checksum `885bb1da`, `kfm-official-default-guard-hold-return.json` checksum `885bb1da`, `kfm-official-default-crouch-guard-slide-stop.json` checksum `d11153d0`, `kfm-official-default-guard-slide-stop.json` checksum `885bb1da`, `kfm-official-default-guard-state.json` checksum `885bb1da`, `kfm-official-default-crouch-guard-state.json` checksum `d11153d0`, and `kfm-official-default-air-guard-state.json` checksum `62367dac`, now proving real KFM/Common1 `154 -> 155 -> 52 -> 20` air guard landing walk-control when the private fixture exists.

## Gap To Full Port

| Remaining area | Why it is still large |
| --- | --- |
| CNS VM and expression parity | Needs full source-located AST/IR, redirects, dynamic params, helper/parent/root ownership, exact trigger lifetime, and error compatibility. |
| Common1/combat parity | Needs exact get-hit, guard, fall, recovery, throws, custom states, priority, KO/round flow, sparks/sounds, and tick order across real fixtures. |
| Helpers/projectiles/explods | Current visual/effect actors are bounded and Helpers have a tiny helper-local micro-VM with local control/metadata/variables plus bounded helper-local int `VarRandom`, `IsHelper` / `IsHelper(id)` identity triggers, parent/root owner reads, current-opponent `EnemyNear, ...` reads, caller-provided `EnemyNear(index)` / `EnemyNear(var(n))` reads when an explicit opponent-state list exists, explicit/default/bare helper `HitDef` target memory with `NumTarget(id)` / `Target(id), Life` / bare `Target, Life`, bounded helper-owned direct-HitDef and explicit/default helper-parented Projectile `TargetLifeAdd`, `TargetPowerAdd`, `TargetVelSet`, `TargetVelAdd`, `TargetFacing`, `TargetBind`, and `TargetDrop`, bounded owner-backed helper `TargetState` from direct HitDef and helper-parented Projectile target memory, helper-owned direct HitDef explicit/default/bare target memory and helper-parented Projectile explicit/default target memory, static helper-local `BindToParent` / `BindToRoot` owner binding, static helper-local `Explod`, static helper-local `RemoveExplod` cleanup by id, static helper-local `ModifyExplod` mutation by id, helper-local `NumExplod(id)` / `NumHelper(id)` counts, static helper-local `Projectile` spawn, static helper-local `ModifyProjectile` mutation, bounded helper-local `ProjHit(id)` / `ProjGuarded(id)` / `ProjContact(id)` reads against helper-parented Projectile contact markers, and owner-side sound/FightFX spark package telemetry for those helper-parented Projectile contacts. Full port still needs broader indexed/team/helper-owned redirect ownership beyond caller-provided `EnemyNear(index)` lists, helper `TargetState` breadth beyond the owner-backed direct-HitDef/helper-parented Projectile gates / helper-owned custom-state tables / multi-target parity, full helper state machines, pause behavior, exact contact trigger timing/lifetime, player-state binding parity, helper fvar/sysvar `VarRandom`, exact random stream parity, helper-owned effect namespaces, exact helper effect-count/ownership scopes, and lifecycle parity. |
| Rendering/palettes/audio | Needs full SFF/ACT palette behavior, FightFX, lifebars, screenpacks, blend/shadow behavior, SND timing/mixing, and presentation parity. |
| IKEMEN-specific runtime | Root/helper RunOrder, helper-appended execution, Pause/SuperPause ownership/defense, team topology/eligibility/registry/live state, P3-P8 participation/activation, bounded Tag/RedirectID, standby CNS, same-side command routing, and T427's named ZSS character-state subset are bounded. Direct reserve input/AI, full fighter phases, root-key effects, combat/round/presentation/lifebar/resources, general ZSS/Lua, rollback/netplay, model/video stages, screenpack extensions, and broad team gameplay remain absent. |
| Corpus and tooling | Full port needs many fixture packages, golden traces, compatibility profiles, automated diffing, authoring tools, and release QA. |

Practical reading: from today's evidence, a private playable sandbox is roughly two-thirds usable, a practical MUGEN subset is about one-third there, and a full IKEMEN-GO-class port remains a multi-stage engine project.

## Historical Next Ten Gates

1. Close the reserved State -1 TargetPowerAdd RedirectID cut independently.
2. Materialize `CompatibilityCorpusSnapshot/v1` from actual journey artifacts.
3. Extract `RuntimeRedirectedTargetDispatch/v0` after the reserved cut.
4. Add active `TargetLifeAdd RedirectID` through that seam.
5. Preflight and commit Turns through `RuntimeTurnsTransitionPlan/v1`.
6. Decide state-5900 missing-state policy and model phase-aware `RoundState`.
7. Replace hardcoded Studio greens with fresh `GateEvidenceResult/v0` artifacts.
8. Create `PackageAnalysis/v1` and surface it through a production consumer.
9. Prove `AssetReleasePolicy/v0` on one complete owned/generated record.
10. Add `SourceWriteReceipt/v0`, then extract `EvidenceContract/v0` with two real consumers.

## Score Movement Rules

Docs-only roadmap/setup work can improve handoff quality but does not raise compatibility or port scores. Scores move only when one of these changes:

- Required runtime trace or focused test proves new behavior.
- Browser visual QA proves a visible runtime/Studio/render workflow.
- Fixture evidence proves a local imported package route.
- Package/build evidence proves a new export or persistence capability.

When a score changes, update this file, `docs/PROGRESS_TRACKER.md`, and `docs/ROADMAP_EXECUTION_BOARD.md` in the same round.

## Claim Rules

- Do not say "MUGEN compatible" without naming the fixture or trace artifact.
- Do not say "IKEMEN supported" from scanner evidence or one bounded root scheduler slice.
- Do not count generated/native fighters as imported compatibility evidence.
- Do not raise scores from docs alone; scores move when tests, traces, browser evidence, or fixture results improve.
- Any changed score must update this file, `docs/PROGRESS_TRACKER.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.
- Any changed release-target wording must update `docs/ROADMAP_RELEASE_TARGETS.md`.
