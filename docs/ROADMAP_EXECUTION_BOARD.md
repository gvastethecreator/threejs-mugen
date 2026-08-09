# Roadmap Execution Board

## Current official-parity queue — T424-T492 and T506-T662 closed-bounded; T663 runtime active; Wayfinder 127 closed-bounded; T504 content active (2026-08-08)

### Active runtime checkpoint — direct HitDef air-guard velocity

T589 / issue 163 is closed-bounded: static and bounded dynamic root/helper
`attack.depth` pairs replace the selected live Projectile HitDef depth bounds.
The official one-value ModifyProjectile form writes `[value, 0]`, and later
Projectile contact admission consumes the changed pair. Focused coverage passes
256/256; the full suite passes 3398/3456 with the same 58 inherited failures.
Build, 686/686 traces, boundaries, and redirect-boundary gates pass.

T590 / issue 164 is closed-bounded: static and bounded dynamic root/helper
`ModifyProjectile p2facing` replaces the selected live Projectile HitDef field.
Later accepted hit contact exposes the changed facing; guard contact does not.
Five focused files pass 566 tests plus isolated root/helper cases and typecheck.

T591 / issue 165 is closed-bounded: static and bounded dynamic root/helper
`ModifyProjectile air.hittime` replaces the selected Projectile airborne hit
duration, and later airborne contact consumes it. Five focused files pass 567
tests plus isolated root/helper cases and typecheck.

T592 / issue 166 is closed-bounded: static and bounded dynamic root/helper
`ModifyProjectile ground.hittime` replaces the selected Projectile grounded
hit duration, and later grounded contact consumes it. Five focused files pass
568 tests plus isolated root/helper cases and typecheck.

T593 / issue 167 is closed-bounded: static and bounded dynamic root/helper
`ModifyProjectile guard.hittime` replaces the selected Projectile guard-hit
duration, and later guard contact consumes it. Five focused files pass 569
tests plus isolated root/helper cases and typecheck.

T594 / issue 168 is closed-bounded: static and bounded dynamic root/helper
`guard.slidetime`, `guard.ctrltime`, and `airguard.ctrltime` replace selected
Projectile guard timers consumed by later ground/air guard contacts. Five
focused files pass 570 tests plus isolated root/helper cases and typecheck.

T595 / issue 169 is closed-bounded: static and bounded dynamic root/helper
`ModifyProjectile down.hittime` replaces the selected Projectile lying-hit
duration, and later state-`L` contact consumes it. Five focused files pass 571
tests plus isolated root/helper cases and typecheck.

T596 / issue 170 is closed-bounded: static one-, two-, and three-component
`ModifyProjectile down.velocity` values use Ikemen's zero defaults, bounded
dynamic root/helper expressions retain fractional values, and later lying-state
contact consumes the changed X/Y/Z velocity. Five focused files pass 573 tests
plus isolated root/helper/contact cases. The full suite passes 3405/3463 with
the same 58 inherited failures. Build, 686/686 traces, boundaries, and
redirect-boundary gates pass.

T597 / issue 171 is closed-bounded: static and bounded dynamic root/helper
`ModifyProjectile fall`, `air.fall`, and `down.bounce` replace selected live
Projectile HitDef flags. Later grounded/airborne contact consumes the changed
fall policy and lying-hit metadata receives the changed bounce flag. Five
focused files pass 574 tests plus isolated root/helper/contact cases. The full
suite passes 3406/3464 with the same 58 inherited failures. Build, 686/686
traces, boundaries, and redirect-boundary gates pass.

T598 / issue 172 is closed-bounded: one-to-three component static and bounded
dynamic root/helper `ModifyProjectile guard.velocity` and
`airguard.velocity` values use Ikemen zero defaults. Later ground/air guard
contacts consume the changed X/Y/Z vectors. Five focused files pass 577 tests;
the full suite passes 3409/3467 with the same 58 inherited failures. Build,
686/686 traces, boundaries, and redirect-boundary gates pass.

T599 / issue 173 is closed-bounded: one-to-three component static and bounded
dynamic root/helper `ModifyProjectile air.velocity` values use Ikemen zero
defaults. The Projectile combat contract now carries X/Y/Z, and later airborne
hit contact consumes the changed vector. Five focused files pass 580 tests;
the full suite passes 3412/3470 with the same 58 inherited failures. Build,
686/686 traces, boundaries, and redirect-boundary gates pass.

T600 / issue 174 is closed-bounded: static and bounded dynamic root/helper
`ModifyProjectile ground.velocity` values replace only supplied X/Y/Z
components. The MUGEN `n` token preserves the corresponding live component,
including around Parent/Root redirects, and later grounded hit contact consumes
the changed vector. Five focused files pass 583 tests; the full suite passes
3415/3473 with the same 58 inherited failures. Typecheck, build, 686/686
traces, boundaries, and redirect-boundary gates pass.

T601 / issue 175 is closed-bounded: static and bounded dynamic root/helper
`ModifyProjectile ground.slidetime` replaces the selected live Projectile
ground slide value. Later unguarded contact exposes the changed value through
`GetHitVar(slidetime)` while guard contact keeps `guard.slidetime`. Five
focused files pass 586 tests; the full suite passes 3418/3476 with the same 58
inherited failures. Typecheck, build, 686/686 traces, boundaries, and
redirect-boundary gates pass.

T602 / issue 176 is closed-bounded: static and bounded dynamic root/helper
`ModifyProjectile pausetime` and `guard.pausetime` pairs replace the selected
live Projectile HitDef fields. The first value freezes only the Projectile; the
second value pauses the defender and drives `GetHitVar(hitshaketime)`. Missing
normal values default to `0,0`, a missing guard pair inherits the normal pair,
and the Projectile owner remains unpaused. Focused coverage passes 281/281 plus
the isolated Playable consumer; the full suite passes 3423/3481 with the same
58 inherited failures. Typecheck, build, 686/686 traces, boundaries, and
redirect-boundary gates pass.

T603 / issue 177 is closed-bounded: Projectile `guard.dist` and
`guard.dist.width` now share an X pair, with separate `guard.dist.height` and
`guard.dist.depth` pairs. Static and bounded dynamic root/helper values mutate
selected live Projectiles; negative components preserve the live value. The
Projectile `InGuardDist` consumer checks the same typed front/back,
top/bottom, and depth bounds from the Projectile origin. Focused coverage
passes 132/132 plus isolated root/helper cases; the full suite passes
3426/3484 with the same 58 inherited failures. Typecheck, build, 686/686
traces, boundaries, and redirect-boundary gates pass.

T604 / issue 178 is closed-bounded: static and bounded dynamic root/helper
`sparkno`, `sparkangle`, `guard.sparkno`, `guard.sparkangle`, and `sparkxy`
replace the selected live Projectile presentation payload. Later hit and guard
events consume the changed references, angles, and offsets. Focused coverage
passes 133/133 plus isolated root/helper cases; the full suite passes
3429/3487 with the same 58 inherited failures. Typecheck, build, 686/686
traces, boundaries, redirect-boundary, and diff hygiene pass. Dynamic spark
prefixes and the five commented-out `cornerpush.veloff` ModifyProjectile cases
remain outside the claim.

T605 / issue 179 is closed-bounded: static and bounded dynamic root/helper
`mindist` and `maxdist` replace selected live Projectile X/Y/Z target-distance
bounds. Omitted ModifyProjectile components become zero. Later accepted hit
and guard contact clamps the defender from the Projectile origin, including
Projectile-facing X and typed combat depth. Focused coverage passes 220/220
plus isolated root/helper cases; the full suite passes 3432/3490 with the same
58 inherited failures. Typecheck, build, 686/686 traces, boundaries,
redirect-boundary, and diff hygiene pass. Exact localcoord scaling, `snap`,
`snaptime`, and target binding remain outside the claim.

T606 / issue 180 is closed-bounded: static and bounded dynamic root/helper
`xaccel`, `yaccel`, and `zaccel` replace selected live Projectile HitDef
metadata. Later accepted contact exposes the changed values through
`GetHitVar(xaccel|yaccel|zaccel)`. Focused coverage passes 221/221 plus
isolated root/helper cases; the full suite passes 3433/3491 with the same 58
inherited failures. Typecheck, build, 686/686 traces, boundaries,
redirect-boundary, and diff hygiene pass. Velocity-formula integration,
localcoord scaling, exact contact tick order, rollback, and full Projectile
parity remain outside the claim.

T607 / issue 181 is closed-bounded: static and bounded dynamic root/helper
`envshake.time`, `envshake.freq`, `envshake.ampl`, `envshake.phase`,
`envshake.mul`, and `envshake.dir` replace selected live Projectile HitDef
metadata. Later accepted hit and guard contact emits the changed typed camera
shake payload; `mul` and `dir` feed the deterministic camera projection.
Focused coverage passes 285/285 plus isolated root/helper cases; the full suite
passes 3436/3494 with the same 58 inherited failures. Typecheck, build, 686/686
traces, boundaries, redirect-boundary, and diff hygiene pass. Exact phase
defaults, localcoord amplitude scaling, waveform/tick order, pause/stage/layer
interaction, rollback, `diradd`, `decay`, and full Projectile parity remain
outside the claim.

T608 / issue 182 is closed-bounded: static and bounded dynamic root/helper
Projectile and ModifyProjectile `fall.envshake.dir` values reach selected live
Projectiles, accepted-hit `GetHitVar(fall.envshake.dir)` storage, deterministic
`FallEnvShake` events, imported/direct HitDef routes, and runtime trace evidence.
Focused coverage passes 350/350; the full suite passes 3436/3494 with the same
58 inherited failures. Typecheck, build, 686/686 traces, boundaries,
redirect-boundary, and diff hygiene pass. The pinned contact path does not copy
`fall.envshake.diradd` or `fall.envshake.decay`, so they remain outside the
claim.

T609 / issue 183 is closed-bounded: pinned Projectile `chainid` contact
admission now consumes static and bounded dynamic root/helper
ModifyProjectile values. A non-negative chain ID may hit only when the
defender's previous `GetHitVar(id)` matches it; omitted or negative values
remain unrestricted. Focused coverage passes 150/150; the full suite passes
3438/3496 with the same 58 inherited failures. Typecheck, build (359 modules),
686/686 traces, boundaries, redirect-boundary, and diff hygiene pass.
`nochainid`, exact hitshake/targetedBy timing, cross-player ownership, and full
chain/priority parity remain outside the claim.

T610 / issue 184 is closed-bounded: Projectile `nochainid` lists now flow
through static spawn and bounded dynamic root/helper ModifyProjectile
selection. Up to eight integer IDs reject matching repeat contact only for the
same source player while current hitshake or the same last targeting actor is
proven; omitted, negative, non-matching, cross-player, and expired unrelated
sources remain unrestricted. Focused coverage passes 230/230; the full suite
passes 3441/3499 with the same 58 inherited failures. Typecheck, build (359
modules), 687/687 traces, boundaries, redirect-boundary, and diff hygiene pass.
Exact Ikemen `targetedBy` lifetime/order, team/tag ownership,
chainID/nochainID equality precedence, direct HitDef NoChainID, and full HitDef
parity remain outside the claim.

T611 / issue 185 is closed-bounded: pinned direct HitDef `chainid` admission
now runs before normal and equal-priority contact is consumed. A non-negative
current move chain ID may hit only when the defender's previous
`GetHitVar(id)` matches it; omitted or negative values remain unrestricted.
Two imported fixtures now use real seed HitDefs before their chained contacts.
Focused coverage passes 7/7; the full suite passes 3443/3501 with the same 58
inherited character-package failures. Typecheck, build (359 modules), 687/687
traces, boundaries, redirect-boundary, and diff hygiene pass. Projectile
chains, NoChainID, exact override/reversal ordering, dynamic ModifyHitDef
breadth, and full HitDef priority parity remain outside the claim.

T612 / issue 186 is closed-bounded: direct HitDef `nochainid` lists now flow
through static and bounded dynamic root/helper HitDef plus root RedirectID
ModifyHitDef routes. Up to eight integer IDs reject matching repeat contact for
the same source actor, or the same explicit player while hitshake is active.
Omitted, negative, non-matching, cross-player, and expired unrelated sources
remain unrestricted. Helper direct ChainID admission now shares the same
pre-contact boundary. Focal commands pass 224/224; the full suite passes
3449/3507 with the same 58 inherited character-package failures. Typecheck,
build (359 modules), 688/688 traces (654 required / 34 optional), boundaries,
redirect-boundary, and diff hygiene pass. Exact Ikemen `targetedBy`
lifetime/order, team/tag ownership, ChainID/NoChainID equality behavior,
product Helper ModifyHitDef, and full HitDef parity remain outside the claim.

T613 / issue 187 is closed-bounded: direct root/helper HitDef ChainID and
NoChainID admission now runs before a defender's ReversalDef can consume the
incoming attack. Rejected chains leave both actors, reversal contact memory,
targets, hit pause, and state unchanged; an accepted chain preserves the
existing reversal result. Focused coverage passes 68/68; the full suite passes
3451/3509 with the same 58 inherited character-package failures. Typecheck,
build (359 modules), 688/688 traces, boundaries, redirect-boundary, and diff
hygiene pass. Projectile ordering, ReversalDef-vs-ReversalDef arbitration,
exact priority/override ordering, and full collision scheduling remain outside
the claim.

T614 / issue 188 is closed-bounded: equal ChainID/NoChainID handling now splits
by runtime profile across root, Helper, and Projectile contact. MUGEN 1.1 lets
a matching ChainID override the equal NoChainID entry; pinned Ikemen GO and
unknown profiles keep NoChainID rejection. Required traces prove both the
Ikemen rejection and MUGEN target id 77 contact after a real seed HitDef id 43.
Focused coverage passes 827/827; the full suite passes 3455/3513 with the same
58 inherited character-package failures. Typecheck, build (360 modules),
689/689 traces (655 required / 34 optional), boundaries, redirect-boundary,
and diff hygiene pass. Other MUGEN versions, ownership, targeter lifetime,
Projectile reversal ordering, and broader chain parity remain outside the
claim.

T615 / issue 189 is closed-bounded: Projectile ChainID and NoChainID admission
now runs after proven collision but before a defender's ReversalDef callback.
Rejected chains leave reversal state, targets, projectile hit/removal counters,
hit pause, and life unchanged; matching ChainID preserves the existing
Projectile reversal route. Focused coverage passes 153/153; the full suite
passes 3456/3514 with the same 58 inherited character-package failures.
Typecheck, build (360 modules), 689/689 traces, boundaries, redirect-boundary,
and diff hygiene pass. Projectile priority, ReversalDef-vs-ReversalDef,
cross-frame collision scheduling, and full Projectile parity remain outside
the claim.

T616 / issue 190 is closed-bounded: the official two-value HitDef
`unhittabletime` contract now compiles static and bounded dynamic root/helper
HitDef values plus root RedirectID ModifyHitDef changes. Accepted direct hits
and ReversalDef contacts write the non-negative receiver component, normal
actor ticks decrement it, and positive windows reject later HitDef/ReversalDef
admission before mutation. Focused coverage passes 225/225 plus the isolated
RedirectID and trace checks. The full suite passes 3463/3521 with the same 58
inherited character-package failures. Typecheck, build (361 modules), 690/690
traces (656 required / 34 optional), boundaries, redirect-boundary, and diff
hygiene pass. The required `synthetic-imported-hitdef-unhittabletime` trace
passes with checksum `628ee772`. Attacker-side throw arbitration, ModifyPlayer,
Projectile breadth, default throw/ReversalDef derivation, exact pause tick
order, rollback, and full priority parity remain outside the claim.

T617 / issue 191 is closed-bounded: accepted root and Helper direct HitDef hit
or guard contacts now write non-negative `unhittabletime[0]` to the attacker,
and accepted root ReversalDef writes the same component to its owner. Negative
and omitted values preserve the live timer. The resulting positive window
blocks later incoming HitDef/ReversalDef admission through the T616 gate.
Focused runtime coverage passes 141/141 and the isolated attacker-window trace
passes. The full suite passes 3466/3524 with the same 58 inherited
character-package failures. Typecheck, build (361 modules), 691/691 traces
(657 required / 34 optional), boundaries, redirect-boundary, and diff hygiene
pass. The required `synthetic-imported-hitdef-attacker-unhittabletime` trace
passes with checksum `7354557f`. Throw default derivation and random
same-priority throw arbitration, HitOverride redirects, Helper ReversalDef,
ModifyPlayer, Projectile breadth, exact pause tick order, rollback, and full
priority parity remain outside the claim.

T618 / issue 192 is closed-bounded: omitted `unhittabletime` now follows the
pinned Ikemen GO defaults for root/Helper throw HitDef and root ReversalDef.
Throw HitDef derives both components from attacker pause time plus one;
ReversalDef derives only the receiver component. Explicit authored values
still win. Focused compiler/runtime coverage passes 100/100 and the isolated
default-window trace passes. The full suite passes 3469/3527 with the same 58
inherited asset/roster failures. Typecheck, the 361-module production build,
all 692 traces (658 required / 34 optional), boundaries, redirect-boundary,
and diff hygiene pass. The required
`synthetic-imported-hitdef-default-unhittabletime` trace passes with checksum
`913ff8ea`. Random same-priority throw arbitration, HitOverride redirects,
Helper ReversalDef, ModifyPlayer, Projectile breadth, exact pause tick order,
rollback, and full priority parity remain outside the claim.

T619 / issue 193 is closed-bounded: accepted direct HitOverride contact now
writes non-negative HitDef `unhittabletime` components by actor role. Root and
Helper HitDef redirects write the attacker and receiver timers; root-player
ReversalDef redirects write the same roles in the reversed direction.
Miss-on-override still returns before timer, target, pause, or state mutation.
Focused coverage passes 95/95 plus the isolated required trace. The full suite
passes 3471/3529 with the same 58 inherited character-package failures.
Typecheck, the 361-module production build, all 693 traces (659 required / 34
optional), boundaries, redirect-boundary, and diff hygiene pass. The required
`synthetic-imported-hitoverride-unhittabletime` trace passes with checksum
`49fcdc42`. Projectile HitOverride, Helper ReversalDef, ModifyPlayer, exact
pause tick order, rollback, and full priority parity remain outside the claim.

T620 / issue 194 is closed-bounded: static root and Helper Projectile spawn now
retains the HitDef `unhittabletime` pair. Positive receiver timers reject
Projectile contact before Projectile Reversal, HitOverride, target, pause,
damage, or state mutation. Accepted unguarded normal and HitOverride contact
writes only non-negative component one to the receiver; guard contact and
negative values preserve it, and component zero never arms the Projectile
owner. Focused compiler/runtime/trace coverage passes 899/899. The full suite
passes 3477/3535 with the same 58 inherited character-package failures.
Typecheck, the 361-module build, all 694 traces (660 required / 34 optional),
boundaries, redirect-boundary, and diff hygiene pass. The required
`synthetic-imported-projectile-unhittabletime` trace passes with checksum
`1c83889e`. Dynamic spawn expressions, ModifyProjectile mutation,
throw-default derivation, exact timer decrement/pause order, rollback, and full
Projectile priority parity remain outside the claim.

T621 / issue 195 is closed-bounded: Projectile `unhittabletime` now retains
one- or two-component static/dynamic integer expressions in typed IR and
resolves them in the active root or Helper caller context at spawn. One
component normalizes to `[value, -1]`; invalid or unresolved expressions fail
closed. The resolved receiver component drives the T620 contact gate. Focused
compiler/runtime/trace coverage passes 969/969; the full suite passes
3479/3537 with the same 58 inherited character-package failures. Typecheck,
the 361-module build, all 695 traces (661 required / 34 optional), boundaries,
redirect-boundary, and diff hygiene pass. The required
`synthetic-imported-projectile-dynamic-unhittabletime` trace passes with
checksum `ec9bacaa`. ModifyProjectile mutation remains excluded because the
pinned official `modifyProjectile.Run` switch has no
`hitDef_unhittabletime` case.

T622 / issue 196 is closed-bounded: root and Helper HitDef plus root and Helper
Projectile spawn retain and resolve independent static/dynamic
`stand.friction` and `crouch.friction` values. Normal accepted hit and guard
contact copy the authored values to receiver GetHitVar metadata. Grounded
physics consumes the authored override only while move type is `H`; omitted,
invalid, and non-get-hit paths keep the receiver movement constants. Focused
coverage passes 1114/1114; the full suite passes 3483/3541 with the same 58
inherited character-package failures. Typecheck, the 361-module build, all
696 traces (662 required / 34 optional), boundaries, redirect-boundary, and
diff hygiene pass. The required
`synthetic-imported-projectile-ground-friction` trace passes with checksum
`25618613` and final-frame checksum `8e1b2405`. Projectile HitOverride and
ModifyProjectile mutation remain outside the claim.

T623 / issue 197 is closed-bounded: `ModifyHitDef` retains and resolves
independent static or bounded dynamic `stand.friction` and `crouch.friction`
values in the active root or redirected caller context. Each supplied finite
value mutates only an already-active normal HitDef and preserves the other
field. Later accepted contact and get-hit physics consume the changed metadata.
Focused compiler/runtime coverage passes 166/166 plus the isolated real
`RedirectID` consumer. The full suite passes 3483/3541 with the same 58
inherited character-package failures. Typecheck, the 361-module build, all
696 traces (662 required / 34 optional), boundaries, redirect-boundary, and
diff hygiene pass. Helper-owned `ModifyHitDef`, Projectile and
ModifyProjectile mutation, air/lying friction, exact corner-push coupling,
rollback, and full HitDef physics parity remain outside the claim.

T624 / issue 198 is closed-bounded: HitDef `sparkscale` and
`guard.sparkscale` retain one or two static/dynamic float expressions through
root and Helper HitDef, root or redirected `ModifyHitDef`, and root or Helper
Projectile spawn. Fresh HitDefs and Projectiles default omitted or unresolved
components independently to `1`; `ModifyHitDef` preserves omitted live
components. Accepted hit/guard contact selects the correct pair, snapshots and
trace evidence clone it, and the renderer composes independent X/Y values with
the existing scalar spark size without clamping zero or negative values.
Focused coverage passes 1003/1003 plus the isolated real `RedirectID`
consumer. The full suite passes 3488/3546 with the same 58 inherited retired
character-package failures. Typecheck, the 361-module build, all 697 traces
(663 required / 34 optional), boundaries, redirect-boundary, and diff hygiene
pass. The required `synthetic-imported-projectile-spark-scale` trace passes
with checksum `95d51442` and final-frame checksum `221c7660`.
`ModifyProjectile` spark-scale mutation, Projectile HitOverride presentation,
exact localcoord scaling, rollback, and full hit-effect parity remain outside
the claim.

T625 / issue 199 is closed-bounded: direct-HitDef `p1facing` and
`p1getp2facing` compile as static or dynamic integer expressions, reset on a
fresh HitDef, mutate independently through root `ModifyHitDef`/`RedirectID`,
and resolve in root or Helper caller context. Accepted unguarded direct contact
applies `p1getp2facing` precedence before facing-dependent velocity and snap;
guard contact does not turn the attacker. Focused coverage passes 234/234 plus
the isolated required trace and real redirected `ModifyHitDef` consumer. The
full suite passes 3494/3552 with the same 58 inherited retired
character-package failures. Typecheck, the 361-module build, all 698 traces
(664 required / 34 optional), boundaries, redirect-boundary, and diff hygiene
pass. The required `synthetic-imported-hitdef-attacker-facing` trace passes
with checksum `65949aa4` and final-frame checksum `5bb54e40`. Projectile and
ModifyProjectile facing, ReversalDef, exact deferred tick synchronization,
complete back-hit reaction choreography, teams, rollback, and full parity
remain outside the claim.

T626 / issue 200 is closed-bounded: typed one/two-component HitDef `getpower`
flows through root/Helper HitDef and Projectile creation, root or redirected
`ModifyHitDef`, accepted hit/guard contact, and attacker power gain. Focused
coverage passes 451/451 plus isolated real Helper, redirected mutation, and
trace cases. The full suite passes 3502/3560 with the same 58 inherited
retired-character failures. Typecheck, the 361-module build, all 699 traces
(665 required / 34 optional), boundaries, redirect-boundary, and diff hygiene
pass. Required trace `synthetic-imported-hitdef-getpower` has checksum
`2f881236` and final-frame checksum `90ee3934`.

T627 / issue 201 is closed-bounded: fresh direct HitDef and Projectile creation
derive omitted `getpower` from authored damage and pinned normal/super
`attack.lifetopowermul` defaults, then derive guard reward from the effective
hit value. Root/Helper paths use the current owner constants projection, and
Projectile derivation precedes runtime attack scaling. Core focused coverage
passes 166/166 plus targeted integrations. The full suite passes 3505/3563
with the same 58 inherited failures. Typecheck, the 362-module build, all 700
traces (666 required / 34 optional), boundaries, redirect-boundary, and diff
hygiene pass. Required trace checksum is `fa12664b`; final-frame checksum is
`f18ad68f`.

T628 / issue 202 is closed-bounded: static explicit and omitted `givepower`
defaults flow through fresh direct HitDef and Projectile creation, accepted
hit/guard contact, defender power mutation, existing ModifyProjectile
givepower, and `GetHitVar(power)` delta metadata. Focused coverage passes
326/326; the full suite passes 3508/3566 with the same 58 inherited failures.
The 362-module build, 700/700 traces, boundaries, redirect-boundary, typecheck,
and diff hygiene pass. Required trace checksum is `d4ec2081`; final checksum is
`4b9e7e61`, with attacker power 7 and defender power 6.

T629 / issue 203 is closed-bounded: dynamic one/two-component `givepower`
resolves in caller context for fresh HitDef/Projectile and supported Ikemen
mutations, with one-value half/preserve/zero semantics per controller. Compiler
and runtime focused suites pass 322/322 plus root integrations. The full suite
passes 3513/3571 with the same 58 inherited failures. The 362-module build,
701/701 traces, typecheck, boundaries, redirect-boundary, and diff hygiene
pass. Required trace checksum is `37f80f37`; final checksum is `9da06f48`.

T630 / issue 204 is closed-bounded: pinned-Ikemen `ModifyProjectile getpower`
replaces selected root/Helper Projectile attacker hit/guard rewards, including
caller-context expressions and the one-value guard-zero rule. Core coverage
passes 147/147 plus 3 root/Helper integrations. The full suite passes
3516/3574 with the same 58 inherited failures. The 362-module build, 702/702
traces, typecheck, boundaries, redirect-boundary, and diff hygiene pass.
Required trace checksum is `8d08be3e`; final checksum is `7b9b7719`.

T631 / issue 205 is closed-bounded: M.U.G.E.N `[Rules]` attack/get-hit
life-to-power multipliers parse case-insensitively, seed runtime constants
before Common.Const and character overlays, and feed omitted direct HitDef and
Projectile defaults. Parser/loader coverage passes 18/18 and default consumers
pass 98/98. The full suite passes 3522/3580 with the same 58 inherited
failures. The 362-module build, 703/703 traces, typecheck, boundaries,
redirect-boundary, and diff hygiene pass. Required trace checksum is
`6de46366`; final checksum is `e18a32ed`.

T632 / issue 206 is closed-bounded: positive-time `palfx.time/add/mul/color/
invertall` resolves for root/Helper HitDef, root or redirected `ModifyHitDef`,
and root/Helper Projectile creation. Accepted unguarded hits apply it to the
defender's existing PalFX/render state; guard does not. The full suite passes
3528/3586 with the same 58 inherited failures. The 363-module build, 704/704
traces, typecheck, boundaries, redirect-boundary, and diff hygiene pass.
Required trace checksum is `2227beb9`.

T633 / issue 207 is closed-bounded: direct HitDef contact
`envshake.time/freq/ampl/phase/mul/dir` resolves for root/Helper HitDef and
root or redirected `ModifyHitDef`. Accepted unguarded direct hits emit through
the existing camera-shake world; guard does not. Focused coverage passes
290/290. The full suite passes 3531/3589 with the same 58 inherited failures.
The 363-module build, 705/705 traces, typecheck, boundaries,
redirect-boundary, and diff hygiene pass. Required trace checksum is
`46bdbe87`.

T634 / issue 208 is closed-bounded: dynamic direct HitDef
`fall.envshake.time/freq/ampl/phase/mul/dir` resolves through root/Helper caller
contexts and root or redirected `ModifyHitDef`, then reaches the existing
ground-impact camera event. Focused coverage passes 189/189 plus the real
RedirectID route. The full suite passes 3533/3591 with the same 58 inherited
failures. The 363-module build, 706/706 traces, typecheck, boundaries,
redirect-boundary, and diff hygiene pass. Required trace checksum is
`dcdb8f61`.

T635 / issue 209 is closed-bounded: dynamic direct HitDef `fall.damage` and
`fall.x/y/zvelocity` resolve through root/Helper caller contexts and root or
redirected `ModifyHitDef`, then transfer into accepted get-hit metadata.
Focused coverage passes 179/179 plus the real RedirectID route. The full suite
passes 3536/3594 with the same 58 inherited failures. The 363-module build,
707/707 traces, typecheck, boundaries, and redirect-boundary pass. Required
trace checksum is `c4a23ee8`.

T636 / issue 210 is closed-bounded: dynamic direct HitDef `fall.recover`,
`fall.recovertime`, `down.recover`, and `down.recovertime` resolve through
root/Helper caller contexts and root or redirected `ModifyHitDef`, then
transfer into accepted GetHitVar aliases. Focused coverage passes 181/181 plus
the real RedirectID route. The full suite passes 3539/3597 with the same 58
inherited failures. The 363-module build, 708/708 traces, typecheck,
boundaries, and redirect-boundary pass. Required trace checksum is `b90e7fe3`.

T637 / issue 211 is closed-bounded: dynamic direct HitDef `fall`, `air.fall`,
and `fall.kill` resolve through root/Helper caller contexts and root or
redirected `ModifyHitDef`, then transfer into accepted HitFall/GetHitVar
consumers. Focused coverage passes 183/183 plus the real RedirectID route. The
full suite passes 3542/3600 with the same 58 inherited failures. The 363-module
build, 709/709 traces, typecheck, boundaries, and redirect-boundary pass.
Required trace checksum is `571e29ee`.

T638 / issue 212 is closed-bounded: dynamic direct HitDef `down.bounce`
resolves through root/Helper caller contexts and root or redirected
`ModifyHitDef`, then transfers into accepted HitFall metadata. Focused coverage
passes 186 tests plus the real RedirectID route. The full suite passes
3545/3603 with the same 58 inherited failures. The 363-module build, 710/710
traces, typecheck, boundaries, and redirect-boundary pass. Required trace
checksum is `d2ba2261`.

T639 / issue 213 is closed-bounded: dynamic direct HitDef `kill`, `guard.kill`,
and `hitonce` resolve through root/Helper caller contexts and live root or
redirected `ModifyHitDef`. Core coverage passes 187/187 plus the real
redirected route; the full suite passes 3548/3606 with the same 58 inherited
failures. The 363-module build and 711/711 aggregate traces pass. Required
trace checksum is `bf9a76a0`; final-frame checksum is `aebf3ff6`.

T640 / issue 214 is closed-bounded: fresh direct HitDef `air.juggle`
expressions resolve through root/Helper caller contexts and arm the existing
Ikemen direct-juggle cost path. Focused coverage passes 189/189; the full suite
passes 3551/3609 with the same 58 inherited failures. The 363-module build and
712/712 aggregate traces pass. Required trace checksum is `8493e479`;
final-frame checksum is `3129764a`.

T641 / issue 215 is closed-bounded: dynamic direct HitDef `numhits` resolves
through root/Helper caller contexts and live root or redirected
`ModifyHitDef`. Accepted hits add the authored value to `HitCount` without
conflating the separate consecutive-contact `GetHitVar(hitcount)` counter.
Focused coverage passes 250 tests; the full suite passes 3555/3613 with the
same 58 inherited failures. The 363-module build and 713/713 aggregate traces
pass. Required trace checksum is `280d23dc`; final checksum is `64811f55`.

T642 / issue 216 is closed-bounded: dynamic direct HitDef sprite priorities
and the legacy alias resolve through root/Helper callers and live root or
redirected `ModifyHitDef`, then reach accepted hit/guard priority telemetry.
Focused coverage passes 195 tests; the full suite passes 3557/3615 with the
same 58 inherited failures. The 363-module build and 714/714 traces pass.
Required trace checksum is `19e6c03b`; final checksum is `2d18f025`.

T643 / issue 217 is closed-bounded: dynamic direct HitDef `priority` resolves
through root/Helper caller contexts and live root or redirected
`ModifyHitDef`, then decides the existing direct priority clash. Focused
coverage passes 197 tests; the full suite passes 3560/3618 with the same 58
inherited failures. The 363-module build and 715/715 traces pass. Required
trace checksum is `ab581cb1`; final checksum is `5c8d1d55`.

T644 / issue 218 is closed-bounded: direct HitDef `forcestand` and Ikemen
`forcecrouch` resolve through root/Helper caller contexts, official
`ground.velocity.y` defaulting, root or redirected live mutation, and accepted
default get-hit posture selection. Focused coverage passes 219 tests; the
363-module build and 716/716 traces pass. Required trace checksum is
`4075d9df`; final checksum is `44651ca4`. The full suite is 3564/3623: the 58
inherited missing-roster failures plus one unrelated concurrent evidence-JSON
read that passes 6/6 alone.

T645 / issue 219 is closed-bounded: root-owned direct HitDef resolves dynamic
`p1stateno`, `p2stateno`, and `p2getp1state` once in caller context and feeds
the existing accepted-hit state/animation ownership path. Focused coverage
passes 147 tests; the full suite is 3572/3630 with the same 58 inherited
failures. The 363-module build and 717/717 traces pass. Required trace checksum
is `fae17231`; final checksum is `8157ef3e`.

T646 / issue 220 is closed-bounded: direct HitDef/ModifyHitDef resolves dynamic
`forcenofall` through root/Helper caller contexts. Accepted hits preserve the
fall payload while clearing its flag unless effective `fall = 1`; guards do
not mutate it. Focused coverage passes 205 tests; the full suite is 3577/3635
with the same 58 inherited failures. The 363-module build and 718/718 traces
pass. Required trace checksum is `9d4b53d7`.

T647 / issue 221 is closed-bounded: direct HitDef/ModifyHitDef resolves dynamic
`p2facing` through root/Helper caller contexts. Accepted hits retain
`GetHitVar(facing)` and arm a one-shot defender-facing override consumed after
the next auto-facing pass; guards and zero do not mutate facing. Focused
coverage passes 281 tests; the full suite is 3581/3639 with the same 58
inherited failures. The 363-module build and 719/719 traces pass. Required
trace checksum is `e954df15`.

T648 / issue 222 is closed-bounded: direct HitDef/ModifyHitDef resolves dynamic
`id` and `chainid` through root/Helper caller contexts. Existing target memory,
GetHitVar metadata, and ChainID admission consume the resolved values. Focused
coverage passes 281 tests; the full suite is 3586/3644 with the same 58
inherited failures. The 363-module build and 720/720 traces pass. Required
trace checksum is `dd7aeeed`.

T649 / issue 223 is closed-bounded: explicit dynamic direct
HitDef/ModifyHitDef `damage` pairs resolve through root/Helper caller contexts,
feed hit/guard life and GetHitVar, and drive fresh default-power derivation.
Focused coverage passes 225 tests and required trace checksum is `a42d3700`.
The aggregate trace report contains 721/721 green artifacts, but its wrapper
timed out after writing them, so the aggregate command remains inconclusive.

T650 / issue 224 is closed-bounded: fresh direct HitDef omission now resets
damage to 0/0, one component resolves to hit/0, and neither inherits prior
move metadata. Existing live ModifyHitDef behavior stays component-wise.
Focused coverage passes 130 tests; the full suite is 3595/3653 with the same
58 inherited failures. The 363-module build and 722/722 traces pass. Required
trace checksum is `72489df2`.

T651 / issue 225 is closed-bounded: dynamic direct HitDef `pausetime` /
`guard.pausetime` pairs resolve in root and Helper caller contexts, component
zero pauses the attacker, and component one pauses the receiver and feeds
`GetHitVar(hitshaketime)` on accepted hit and guard contact. Focused coverage
passes 1015/1015; typecheck and the 363-module build pass. Required trace
checksum is `764f1808`; aggregate traces pass 723/723 with 689 required.

T652 / issue 226 is closed-bounded: dynamic direct HitDef/ModifyHitDef
`ground.hittime` resolves through root/Helper caller contexts, fresh omission
resets to zero, live omission preserves the active value, and accepted
grounded contact feeds receiver stun plus `GetHitVar(hittime)`. Compiler and
HitDef coverage passes 152/152; the full suite passes 3603/3661 with the same
58 inherited failures. Typecheck and the 363-module build pass. Required trace
checksum is `b1d162f8`; aggregate traces pass 724/724 with 690 required.

T653 / issue 227 is closed-bounded: dynamic direct HitDef/ModifyHitDef
`ground.slidetime` resolves through root/Helper caller contexts, fresh omission
resets to zero, live omission preserves the active value, and accepted
grounded contact copies the authored value into `GetHitVar(slidetime)`.
Focused coverage passes 216/216; the full suite passes 3606/3664 with the same
58 inherited failures. Typecheck and the 363-module build pass. Required trace
checksum is `0f6fdb82`; aggregate traces pass 725/725 with 691 required.

T654 / issue 228 is closed-bounded: dynamic direct HitDef/ModifyHitDef
`guard.hittime` resolves through root/Helper callers, preserves the pinned
legacy/Ikemen fresh-default split, and feeds accepted guard stun plus
`GetHitVar(hittime)`. Focused coverage passes 219/219; the full suite passes
3610/3668 with the same 58 inherited failures. Typecheck and the 363-module
build pass. Required trace checksum is `2c62eba3`; aggregate traces pass
726/726 with 692 required.

T655 / issue 229 is closed-bounded: dynamic direct HitDef/ModifyHitDef
`guard.slidetime` resolves through root/Helper callers, derives fresh omission
from effective `guard.hittime`, and feeds accepted guard timers plus
`GetHitVar(slidetime)`. Integrated coverage passes 920/920; typecheck and the
363-module build pass. Required trace checksum is `fd7f5334`; aggregate traces
pass 727/727 with 693 required.

T656 / issue 230 is closed-bounded: dynamic direct HitDef/ModifyHitDef
`guard.ctrltime` resolves through root/Helper callers, derives fresh omission
from effective `guard.slidetime`, and feeds accepted ground-guard control
metadata plus `GetHitVar(ctrltime)`. Integrated coverage passes 924/924 and
typecheck passes. Required trace checksum is `4bc6e574`; aggregate traces pass
728/728 with 694 required.

T657 / issue 231 is closed-bounded: dynamic direct HitDef/ModifyHitDef
`airguard.ctrltime` resolves through root/Helper callers, derives fresh
omission from effective `guard.ctrltime`, and feeds accepted air-guard control
metadata plus `GetHitVar(ctrltime)`. Focused runtime coverage passes 227/227;
typecheck and the 363-module build pass. Required trace checksum is `f0e5904e`;
aggregate traces pass 729/729 with 695 required. The full suite executes
3620/3679; all 59 failures are deleted/stale roster expectations, including
one newly exposed concurrent `Nova Boxer` log assertion.

T658 / issue 232 is closed-bounded: dynamic direct HitDef/ModifyHitDef
`air.hittime` resolves through root/Helper callers, uses the official fresh
default 20, and feeds accepted airborne non-fall stun plus
`GetHitVar(hittime)`. Focused runtime coverage passes 230/230; typecheck and
the 363-module build pass. Required trace checksum is `0fbe2966`; aggregate
traces pass 730/730 with 696 required. The full suite executes 3624/3683; all
59 failures remain deleted/stale roster expectations outside this cut.

T659 / issue 233 is closed-bounded: dynamic direct HitDef/ModifyHitDef legacy
scalar `guard.dist` resolves through root/Helper callers and feeds the existing
horizontal `InGuardDist` latch before contact. Integrated coverage passes
875/875; typecheck and the 363-module build pass. Required trace checksum is
`ccd433c7`; aggregate traces pass 731/731 with 697 required. The full suite
executes 3628/3686; all 58 failures are deleted/stale roster expectations.

T660 / issue 234 is closed-bounded: dynamic and mixed direct
HitDef/ModifyHitDef `ground.velocity` X/Y resolves through root/Helper callers.
Fresh one-component values use Y zero. Live ModifyHitDef replaces only
resolved components and preserves the sibling and Z. Accepted grounded hits
apply the vector and expose it through GetHitVar. Focused coverage passes
235/235; required trace checksum is `9c99ac6e`; aggregate traces pass 732/732
with 698 required. Typecheck, the 363-module build, boundaries, and redirect
boundaries pass. After migrating the retired roster expectations to Rocco and
Nadia, the full suite passes 3690/3690.

T661 / issue 235 is closed-bounded: fresh direct HitDef omission resets
`ground.velocity` X/Y/Z to zero in root and Helper paths. Accepted grounded
contact exposes zero through GetHitVar, while live ModifyHitDef omission
preserves the vector. The full suite passes 3693/3693; required trace checksum
is `15babb9c`; aggregate traces pass 733/733 with 699 required; typecheck and
the 363-module build pass.

T662 / issue 236 is closed-bounded: direct HitDef and root-owned live
ModifyHitDef `guard.velocity` X expressions resolve in caller context. Fresh
omission inherits ground X; live mutation preserves Y/Z and omission; accepted
ground guard exposes X through GetHitVar. The full suite passes 3698/3698;
required trace checksums are `fa6f8aa1` and `1621b9be`; aggregate traces pass
735/735 with 701 required; typecheck and the 363-module build pass.

T663 / issue 237 is active-research: resolve root-owned direct HitDef
`airguard.velocity` X/Y expressions and accepted airborne-guard consumption.

### Latest visual checkpoint — Character Compare

T562 / issue 136 is closed-bounded. `?mode=lab&labView=compare` compares one
animation action across the complete loaded roster. Each fighter card reports
availability, frames, timing, collision totals, and package components. A card
loads that fighter and action into the isolated stage and the diagnostic lens.
The browser gate proves 2 roster cards, 17 unique actions, selection, reload,
and zero console/page errors. Typecheck, build, boundaries, CSS budget, and
visual review pass. The broad smoke gate timed out after 124 seconds and is
inconclusive. This tooling does not change compatibility scores.

### Latest checkpoint — Character Matrix, collision reads, and Helper red-life LifeShare

T545 / issue 119 is closed-bounded: `?mode=lab&labView=matrix` shows the full
loaded roster, all 34 available actions, and 12 sprite/AIR/Clsn/VFX/runtime/QA
component checks in one view. Any action selects its fighter and drives the
existing isolated runtime plus Testbench detail lens. The focused browser gate,
typecheck, build, boundaries, CSS budget, and visual review pass with zero
page/console errors. The broad smoke gate timed out and remains inconclusive.

T537 / issue 111 is closed-bounded: `?mode=lab&labView=testbench` inventories
all loaded actions, supports frame testing, reports collision totals, and shows
sprites/AIR/VFX/runtime/motion-QA component health. The browser gate passes 17
action cards, 6 component cards, action selection, WebGL rendering, and zero
console/page errors. It remains a read-only view over current runtime data.

T534 is closed-bounded: an explicitly opted-in imported Helper red-life write
now reaches the root/team LifeShare bank, reconciles active and reserve roots,
and exposes a chained `RedLife` shadow without mutating Helper-local red life.
The required/optional trace corpus passes `686/686` (`652/34`); typecheck,
build, boundaries, and diff hygiene pass. Issue 108 owns the bounded contract.

T535 / issue 109 is closed-bounded: direct and Projectile last-hit metadata
retain effective `hitflag` (`MAF` when omitted), and static
`GetHitVar(hitflag) =/!= <flags>` expressions use typed M→H/L overlap with
redirect support. Five focused files / 238 tests pass; the existing trace
corpus remains `686/686` and no dynamic/lifetime parity is claimed.

T536 / issue 110 is closed-bounded: `runtimeRoundStateFromPhase` names the
typed `RoundState` read and a two-profile fixture covers control-locked intro
`1`, Fight `2`, KO/pre-over `3`, over `4`, and next-round reset `0`. Focused
coverage is 3 files / 65 tests; announcement choreography remains separate.

T538 / issue 112 is closed-bounded: the imported round clock now projects
`IntroState` `1/2/3/4/0`, all four `FightScreenState` display booleans, and
numeric `FightScreenVar` timing/localcoord values. The real `ikemen-go`
fixture follows intro, round display, Fight call, and return to `0`; focused
coverage is 4 files / 69 tests. String info and Helper redirection remain
outside the claim.

T539 / issue 113 is closed-bounded: `RuntimeRoundSystem` owns a resettable
`FightTime` clock beginning at phase `2`, while the typed FightScreen context
projects `GameVar(introtime|outrotime|pausetime|slowtime|superpausetime)` from
round and pause snapshots. Focused coverage is 4 files / 71 tests; the
686/686 trace corpus, typecheck, build, boundaries, and diff hygiene pass.

T540 / issue 114 is closed-bounded: `AnimElemVar` reads supported active-frame
metadata from the AIR cursor through CNS/controller expressions and the
read-only Testbench. Focused coverage is 4 files / 72 tests; browser evidence
passes with zero page/console errors. Unsupported alpha/angle/scale and full
AIR parity remain blocked.

T541 / issue 115 is closed-bounded: `AnimLength` sums effective imported AIR
frame durations through CNS/controller expressions and the read-only Testbench.
Focused coverage is 5 files / 78 tests; browser evidence passes with zero
page/console errors. Raw duration and loop/alternate-action semantics remain
blocked.

T542 / issue 116 is closed-bounded: the runtime keeps the active animation owner
outside `CharacterRuntimeState`, records the owner `playerNo` on `ChangeAnim` and
`ChangeAnim2`, and exposes `AnimPlayerNo` through CNS/controller expressions.
Focused coverage is 5 files / 81 tests; typecheck passes. Full
Helper/Projectile/team ownership, rollback/netplay, and animation parity remain
blocked.

T543 / issue 117 is closed-bounded: `ClsnVar` reads `clsn1`, `clsn2`, and
`size` coordinates from the current AIR frame through shared CNS/controller
contexts and redirect-aware `localcoord` conversion. Runtime `OverrideClsn`
is included, missing indexes return `NaN`, and `TransformClsn` stays outside
the raw AIR-space read. Focused coverage is 5 files / 80 tests; typecheck,
build, boundaries, 686/686 traces, and the Fighter Lab browser gate pass.

T544 / issue 118 is closed-bounded: `ClsnOverlap` resolves a dynamic player ID
and compares `clsn1`, `clsn2`, or `size` through shared CNS/controller
contexts. Non-size boxes use `localcoord`, facing, scale, and angle; size boxes
keep the official no-scale/no-rotation exception. Focused coverage passes 5
files / 83 tests; typecheck, build, boundaries, and 686/686 traces pass.

T546 / issue 120 is closed-bounded: `ProjClsnOverlap(index, playerID,
box_type)` selects active caller-owned projectiles in official oldest-first
order and checks both projectile Clsn groups against target `clsn1`, `clsn2`,
or `size`. Projectile local coordinates, facing, collision scale, and collision
angle flow through the shared world-box boundary; target size keeps the
official no-scale/no-rotation exception. Focused coverage passes 8 files / 258
tests; typecheck, build, boundaries, redirect boundaries, 686/686 traces, and
diff hygiene pass. The full suite retains its inherited 58 failures with
3366/3424 tests passing.

T547 / issue 121 is closed-bounded: `ProjVar(id, index, param)` filters active
caller-owned projectiles by ID (`-1` accepts all), preserves oldest-first
indexing, and exposes numeric identity, animation, position, motion, bounds,
hit capacity, priority, removal, scale, time, and team-side fields already
owned by `RuntimeProjectile`. Redirects keep the caller output `localcoord`.
Focused coverage passes 5 files / 172 tests; typecheck, build, boundaries,
redirect boundaries, and 686/686 traces pass. The full suite keeps the same 58
inherited failures with 3366/3424 tests passing.

T548 / issue 122 is closed-bounded: static `ProjVar` `attr`, `guardflag`, and
`hitflag` comparisons reuse T547's dynamic ID/index selector and redirects.
The port preserves Ikemen's mask-complement `!=` behavior instead of applying
logical negation, expands official grouped attribute/guard flags, and fails
closed when the selected projectile is missing. Focused coverage passes 5
files / 173 tests; typecheck, build, boundaries, redirect boundaries, and
686/686 traces pass. The full suite keeps the same inherited 58 failures with
3367/3425 tests passing.

T549 / issue 123 is closed-bounded: Projectile and ModifyProjectile carry
typed `pausemovetime`/`supermovetime` counters with Ikemen's non-negative
spawn-tick increment, active-tick decrement, zero/below-`-1` freeze, and `-1`
unlimited movement. Pause/SuperPause presentation now checks each projectile's
own counter even when its source actor can move, and numeric `ProjVar` exposes
the current values. Focused coverage passes 8 files / 278 tests; typecheck,
build, boundaries, redirect boundaries, and 686/686 traces pass. The required
SuperPause projectile trace has artifact checksum `a88253a3` and final checksum
`d0c71cda`. The full suite retains the inherited 58 failures with 3369/3427
tests passing.

T550 / issue 124 is closed-bounded: Projectile and ModifyProjectile carry
typed three-axis `remvelocity`; live actors retain the authored vector and
`ProjVar(remvelocity x|y|z)` applies caller `localcoord` conversion. Terminal
playback applies current facing to X, replaces active velocity, clears
acceleration, resets velocity multiplication, and advances X/Y/Z for the AIR
terminal lifetime. Focused coverage passes 8 files / 292 tests; typecheck,
build, boundaries, redirect boundaries, and 686/686 traces pass. The full
suite retains the inherited 58 failures with 3370/3428 tests passing.

T551 / issue 125 is closed-bounded: Projectile and ModifyProjectile carry the
official third `velmul` component. Active motion applies every multiplier after
its matching acceleration, terminal removal resets all three axes to one, and
numeric `ProjVar(velmul z)` works through direct and redirected contexts.
Focused coverage passes 8 files / 292 tests; typecheck, build, boundaries,
redirect boundaries, and 686/686 traces pass. The full suite retains the same
13 inherited failed files / 58 failures with 3370/3428 tests passing.

T552 / issue 126 is closed-bounded: Projectile and ModifyProjectile carry
normalized `projlayerno` state (`-1/0/1`), numeric `ProjVar(projlayerno)` reads
work through direct and redirected contexts, and effect snapshots feed the
existing underlay, actor, and foreground presentation bands consumed by the
renderer. The local spawn seam can inherit an owner layer and defaults current
root actors to zero. Focused coverage passes 9 files / 290 tests; typecheck,
build, boundaries, redirect boundaries, 686/686 traces, and diff hygiene pass.
The full suite retains the same 13 inherited failed files / 58 failures with
3371/3429 tests passing.

T553 / issue 127 is closed-bounded: Projectile and ModifyProjectile carry
static `projangle`; numeric `ProjVar(projangle)` reads work through direct and
redirected contexts, and non-zero angles reach effect/runtime snapshots plus
the live Three.js sprite mesh. Default zero stays absent from runtime snapshots
to preserve existing trace checksums. Focused coverage passes 9 files / 278
tests; typecheck, build, boundaries, redirect boundaries, 686/686 traces, and
diff hygiene pass. The full suite retains the same 13 inherited failed files /
58 failures with 3372/3430 tests passing.

T554 / issue 128 is closed-bounded: Projectile and ModifyProjectile carry
static `projxangle`/`projyangle`; numeric `ProjVar(angle x|y)` reads work
through direct and redirected contexts, and non-zero values reach effect,
runtime, and trace snapshots plus bounded live Three.js X/Y sprite rotation.
Focused coverage passes 9 files / 278 tests; typecheck, build, boundaries,
redirect boundaries, 686/686 traces, and diff hygiene pass. The full suite
retains the same 13 inherited failed files / 58 failures with 3372/3430 tests
passing.

T555 / issue 129 is closed-bounded: Projectile and ModifyProjectile carry
static `projxshear`; numeric `ProjVar(xshear)` reads work through direct and
redirected contexts, and non-zero values reach effect, runtime, and trace
snapshots plus a bounded live centered-quad deformation. Geometry resets from
stored base vertices instead of accumulating shear. Focused coverage passes 9
files / 279 tests; typecheck, build, boundaries, redirect boundaries, 686/686
traces, and diff hygiene pass. The full suite retains the same 13 inherited
failed files / 58 failures with 3373/3431 tests passing.

T556 / issue 130 is closed-bounded: Projectile and ModifyProjectile carry
static one-to-three-channel `projshadow` RGB state; omitted modify channels keep
their current values, numeric `ProjVar(shadow r|g|b)` reads work through direct
and redirected contexts, and non-zero colors reach effect, runtime, and trace
snapshots plus bounded live tinted shadows. Zero color removes the live shadow
and stays absent from snapshots. Focused coverage passes 9 files / 280 tests;
typecheck, build, boundaries, redirect boundaries, 686/686 traces, and diff
hygiene pass. The full suite retains the same 13 inherited failed files / 58
failures with 3374/3432 tests passing.

T557 / issue 131 is closed-bounded: Projectile and ModifyProjectile carry
static `projreflection` state with the official `-1` auto / `0` off / positive
on selection. Non-default values reach effect, runtime, and trace snapshots;
the live renderer creates a bounded mirrored sprite for forced-on mode and for
auto mode with non-zero `projshadow`, then removes it when disabled. Focused
coverage passes 9 files / 281 tests; typecheck, build, boundaries, redirect
boundaries, 686/686 traces, and diff hygiene pass. The full suite retains the
same 13 inherited failed files / 58 failures with 3375/3433 tests passing.

T558 / issue 132 is closed-bounded: Projectile and ModifyProjectile carry
static named `projprojection` plus numeric `projfocallength` state. Non-default
values reach effect, runtime, and trace snapshots; the live renderer preserves
orthographic presentation, applies bounded focal-length perspective, resets
cleanly, and explicitly suppresses unsupported `perspective2`. Focused coverage
passes 9 files / 282 tests; typecheck, build, boundaries, redirect boundaries,
686/686 traces, and diff hygiene pass. The full suite retains the same 13
inherited failed files / 58 failures with 3376/3434 tests passing.

T559 / issue 133 is closed-bounded: Projectile and ModifyProjectile carry
static four-value `projwindow` state with official zero-window defaults.
Non-default values reach effect snapshots and local-coordinate-scaled runtime
and trace snapshots; the live renderer clips Projectile quad geometry and UVs,
resets cleanly, and suppresses fully disjoint windows. Focused coverage passes
3 files / 112 tests; typecheck, build, boundaries, redirect boundaries, and
686/686 traces pass. The full suite retains the same 13 inherited failed files /
58 failures with 3378/3436 tests passing.

T560 / issue 134 is closed-bounded: Projectile spawn compiles static
`ownpal`/`remappal`, retains independent draw-palette state, routes authored
remaps through the existing sprite lookup, and exposes
`ProjVar(DrawPal.Group/Index)`. Effect/runtime/trace projection uses the shared
palette-remap seam. Focused coverage passes 5 files / 183 tests; typecheck,
build, boundaries, redirect boundaries, 686/686 traces, and diff hygiene pass.
ModifyProjectile palette mutation remains unsupported in pinned upstream
source.

T561 / issue 135 is closed-bounded: ModifyProjectile now compiles and resolves
official `id` and `index` selectors separately from the shared `projid`
mutation. Active owner Projectiles are selected oldest-first; negative or
omitted selectors preserve official all-match behavior, explicit indexes pick
one match, and removed/terminal or foreign-owned actors stay excluded. Focused
coverage passes 4 files / 190 tests plus 3 PlayableMatchRuntime cases;
typecheck, build, boundaries, redirect boundaries, and 686/686 traces pass.
The full suite retains its inherited 13 failed files / 58 failures with
3381/3439 tests passing.

T563 / issue 137 is closed-bounded: numeric ModifyProjectile `projanim` now
replaces the selected Projectile's active owner AIR action and resets its
frame cursor only when the animation number changes. Static and dynamic root
paths plus helper-parented dynamic resolution are covered. Focused coverage
passes 4 files / 191 tests plus 1 PlayableMatchRuntime case; typecheck, build,
boundaries, redirect boundaries, and 686/686 traces pass. The full suite keeps
the inherited 13 failed files / 58 failures with 3382/3440 tests passing.

T564 / issue 138 is closed-bounded: numeric ModifyProjectile `projhitanim`,
`projremanim`, and `projcancelanim` now refresh terminal animation numbers and
owner AIR references for selected root-owned and helper-parented Projectiles.
Focused coverage passes 4 files / 192 tests plus 1 PlayableMatchRuntime case;
typecheck, build, boundaries, redirect boundaries, diff hygiene, and 686/686
traces pass. The full suite keeps the inherited 13 failed files / 58 failures
with 3383/3441 tests passing.

T565 / issue 139 is closed-bounded: static ModifyProjectile HitDef `attr` and
`guardflag` now mutate selected active Projectiles, while expression-shaped
strings fail closed. Later attribute reads and standing/air guard eligibility
consume the changed metadata. Focused coverage passes 4 files / 192 tests plus
1 PlayableMatchRuntime case; typecheck, build, boundaries, redirect boundaries,
diff hygiene, and 686/686 traces pass. The latest full-suite baseline remains
the inherited 13 failed files / 58 failures with 3383/3441 tests passing.

T566 / issue 140 is closed-bounded: static ModifyProjectile HitDef
`affectteam` now mutates the normalized team-affinity policy on T561-selected
active Projectiles without changing `teamside`. Root, helper-parented, combat
eligibility, and renderer snapshot seams consume the changed value. Focused
coverage passes 4 files / 192 tests plus 1 PlayableMatchRuntime case; typecheck
passes. The latest full-suite baseline remains the inherited 13 failed files /
58 failures with 3383/3441 tests passing.

T567 / issue 141 is closed-bounded: static ModifyProjectile HitDef `hitflag`
mutates T561-selected active Projectiles and the changed mask feeds later
Projectile/player contact admission and renderer snapshots. Focused coverage
passes 5 files / 263 tests plus 1 PlayableMatchRuntime case; typecheck passes.
Dynamic masks and exact upstream integer storage remain outside the claim.

T568 / issue 142 is closed-bounded: static ModifyProjectile HitDef `animtype`,
`air.animtype`, and `fall.animtype` replace selected Projectile reaction
metadata, which later reaches combat GetHitVar projection. Focused coverage
passes 5 files / 264 tests plus 1 PlayableMatchRuntime case; typecheck passes.

T569 / issue 143 is closed-bounded: authored ModifyProjectile `id` now remains
the T561 selector and also replaces selected Projectile HitDef target IDs, as
the pinned compiler feeds the same parameter into both namespaces. Negative
explicit IDs select all and clamp HitDef target IDs to zero; `projid` remains a
separate mutation. Focused coverage passes 5 files / 264 tests plus 1
PlayableMatchRuntime case; typecheck passes.

T570 / issue 144 is closed-bounded: static and bounded dynamic ModifyProjectile
HitDef `chainid` now mutate T561-selected active Projectiles, and later contact
projects the changed value through current GetHitVar metadata. Focused coverage
passes 5 files / 264 tests plus 1 PlayableMatchRuntime case; typecheck passes.

T571 / issue 145 is closed-bounded: static and bounded dynamic
ModifyProjectile HitDef `kill`, `guard.kill`, and `fall.kill` now mutate
T561-selected active Projectiles. Current direct, guarded, and stored fall
paths consume the changed lethal flags. Focused coverage passes 5 files / 265
tests plus 1 PlayableMatchRuntime case; typecheck passes.

T572 / issue 146 is closed-bounded: static and bounded dynamic
ModifyProjectile HitDef `air.juggle` now mutates T561-selected active
Projectiles. Current IKEMEN root Projectile combat consumes the changed juggle
cost. Focused coverage passes 5 files / 265 tests plus 1 PlayableMatchRuntime
case; typecheck passes.

T566-T572 integration gates pass: production build, boundaries, redirected
dispatch boundary, diff hygiene, and all 686/686 trace artifacts. The full
suite retains the same inherited 13 failed files / 58 failures, now with
3386/3444 tests passing after three new focused cases.

T573 / issue 147 is closed-bounded: static and bounded dynamic
ModifyProjectile HitDef `damage` now replaces hit and guard damage on
T561-selected active Projectiles. A single value sets guard damage to zero,
matching the pinned runtime path. Later hit and guarded contacts consume the
changed non-negative values. Focused coverage passes 5 files / 265 tests plus
1 PlayableMatchRuntime case; typecheck passes.

T574 / issue 148 is closed-bounded: static and bounded dynamic
ModifyProjectile HitDef `givepower` now replaces hit and guard power metadata
on T561-selected active Projectiles. A single value sets guard power to zero,
matching the pinned runtime path. Later hit and guarded contacts expose the
changed values through current GetHitVar metadata without directly changing
either fighter's power pool. Focused coverage passes 5 files / 265 tests plus
1 PlayableMatchRuntime case; typecheck passes.

T575 / issue 149 is closed-bounded: static and bounded dynamic
ModifyProjectile HitDef `numhits` now replaces impact metadata on T561-selected
active Projectiles. The mutation leaves `projhits` contact capacity unchanged;
later combat records the authored hit count separately from the mutable IKEMEN
combo counter. Focused coverage passes 5 files / 266 tests plus 1
PlayableMatchRuntime case; typecheck passes.

T576 / issue 150 is closed-bounded: Projectile spawn and ModifyProjectile now
store HitDef `priority` plus its trade type separately from `projpriority`.
Static and bounded dynamic root/helper values preserve projectile clash
capacity while later contacts expose the changed HitDef numeric priority.
Focused coverage passes 5 files / 266 tests plus 1 PlayableMatchRuntime case;
typecheck passes.

T577 / issue 151 is closed-bounded: static and bounded dynamic
ModifyProjectile HitDef `p2stateno` and `p2getp1state` now mutate selected
Projectiles. Later contact routes the changed target state and owner flag
through the existing custom target-state path. Focused coverage passes 5 files
/ 266 tests plus 1 PlayableMatchRuntime case; typecheck passes.

T578 / issue 152 is closed-bounded: Projectile spawn and ModifyProjectile now
carry static or bounded dynamic HitDef `p1stateno`. Later contact enters the
changed attacker state and still executes the defender's authored target state
or normal imported get-hit path. Focused coverage passes 6 files / 314 tests
plus 1 PlayableMatchRuntime case; typecheck passes.

T579 / issue 153 is closed-bounded: static and bounded dynamic
ModifyProjectile HitDef `missonoverride` now mutates selected Projectiles. A
later active HitOverride consumes the changed boolean and either admits its
redirect or leaves the projectile unresolved. Focused coverage passes 6 files
/ 314 tests plus 1 PlayableMatchRuntime case; typecheck passes.

T573-T579 integration gates pass: production build, boundaries, redirected
dispatch boundary, diff hygiene, and all 686/686 trace artifacts. The full
suite retains the same inherited 13 failed files / 58 failures, now with
3388/3446 tests passing after two new focused cases.

T580 / issue 154 is closed-bounded: Projectile spawn retains HitDef
`p1sprpriority` / legacy `sprpriority` and `p2sprpriority` separately from
`projsprpriority`. Accepted hit and guard contacts apply only P2 priority, as
in pinned Ikemen. ModifyProjectile mutates static or bounded dynamic
`p2sprpriority`; its P1 field remains ignored like upstream. Root/helper
coverage passes 5 files / 267 tests plus 1 PlayableMatchRuntime case.
Typecheck, production build, boundaries, redirected dispatch boundary, diff
hygiene, and 686/686 traces pass. The full suite retains the same inherited 13
failed files / 58 failures with 3389/3447 tests passing.

T581 / issue 155 is closed-bounded: Projectile spawn and ModifyProjectile now
carry static or bounded dynamic HitDef `forcenofall`. Accepted hits clear the
target's fall flag while retaining current fall metadata; guard contact and
omitted values remain unchanged. Root and helper-parented mutation paths are
covered. Four core files / 249 tests plus the focused root runtime case pass;
the broad five-file slice retains only its 19 inherited
PlayableMatchRuntime failures with 559/578 tests passing. Typecheck,
production build, boundaries, redirected dispatch boundaries, and all 686/686
trace artifacts pass.

T582 / issue 156 is closed-bounded: Projectile spawn and ModifyProjectile now
carry static or bounded dynamic HitDef `forcestand` and `forcecrouch`.
Accepted hits choose standing `5000` for a forced crouching target or crouching
`5010` for a forced standing target. Airborne, guarded, custom P2 state, and
omitted-value routes remain unchanged. Five core files / 299 tests plus the
focused root runtime case pass. Typecheck, production build, boundaries,
redirected dispatch boundaries, and all 686/686 trace artifacts pass.

T583 / issue 157 is closed-bounded: ModifyProjectile now replaces static or
bounded dynamic `fall.damage`, X/Y/Z fall velocity, `fall.recover`, and
`fall.recovertime`. Dynamic float evaluation preserves fractional values on
root and helper paths. Later accepted hit contact consumes the changed payload;
guard and omitted routes stay unchanged. Four core files / 250 tests plus the
focused root runtime case pass. Typecheck, production build, boundaries,
redirected dispatch boundaries, diff hygiene, and all 686/686 trace artifacts
pass. The full suite retains the same 13 failed files / 58 inherited failures
with 3392/3450 tests passing.

T584 / issue 158 is closed-bounded: ModifyProjectile now replaces static or
bounded dynamic `fall.envshake.time`, `freq`, `ampl`, `phase`, and `mul`.
Dynamic floats retain fractional values, negative frequency clamps to zero,
and later hit contact consumes the changed metadata. Four core files / 250
tests plus the focused root runtime case pass. Typecheck, production build,
boundaries, redirected dispatch boundaries, diff hygiene, and all 686/686
trace artifacts pass. The latest full-suite baseline remains 3392/3450 with
the same 58 inherited failures.

T585 / issue 159 is closed-bounded: ModifyProjectile now replaces static or
bounded dynamic `dizzypoints` and `guardpoints`. Later hit and guard contact
expose the changed authored values through `GetHitVar` without mutating the
current dizzy or guard pools. Root and helper paths are covered. Four core
files / 251 tests plus the focused root runtime case pass. Typecheck,
production build, boundaries, redirected dispatch boundaries, diff hygiene,
and all 686/686 trace artifacts pass. The full suite retains the same 13
failed files / 58 inherited failures with 3393/3451 tests passing.

T586 / issue 160 is closed-bounded: Projectile and ModifyProjectile now retain
static or bounded dynamic `redlife` and floating-point `score` hit/guard
pairs. One-value forms use the official zero guard default. Later hit and guard
contacts expose the effective pair member through `GetHitVar` without mutating
the defender's current red-life pool or any match-score resource. Root and
helper `Parent`/`Root` paths preserve fractional score values. Four core files
/ 252 tests plus focused root/helper runtime cases pass. Typecheck, production
build, boundaries, redirected dispatch boundaries, diff hygiene, and all
686/686 trace artifacts pass. The full suite retains the same 13 failed files
/ 58 inherited failures with 3394/3452 tests passing.

T587 / issue 161 is closed-bounded: ModifyProjectile now compiles the official
static `none`/`Clsn1`/`Clsn2`/`Size` names for `p2clsncheck` and
`p2clsnrequire`, replaces both policies on selected root or helper-owned
Projectiles, and feeds the changed values to later contact admission. Invalid
or expression-shaped enums fail closed and omitted fields stay unchanged.
Four core files / 253 tests plus focused root/helper runtime cases pass.
Typecheck, production build, boundaries, redirected dispatch boundaries, diff
hygiene, and all 686/686 trace artifacts pass. The full suite retains the same
13 failed files / 58 inherited failures with 3395/3453 tests passing.

T588 / issue 162 is closed-bounded: ModifyProjectile now replaces static or
bounded dynamic `down.recover` and `down.recovertime` on selected root or
helper-owned Projectile fall metadata. Later accepted hit contact carries the
changed values into the target's existing fall/get-up state; guard and omitted
routes stay unchanged. Four core files / 253 tests plus focused root/helper
runtime cases pass. Typecheck, production build, boundaries, redirected
dispatch boundaries, diff hygiene, and all 686/686 trace artifacts pass. The
latest full-suite baseline remains the T587 result: 13 failed files / 58
inherited failures and 3395/3453 tests passing.

Current implementation gate: T589 / issue 163 aligns ModifyProjectile
`attack.depth` with existing Projectile depth-contact admission.

### Previous checkpoint — Gallery inspection view and last-hit metadata

T522 `GetHitVar(score)`, T523 `GetHitVar(power)`, and T524
`GetHitVar(facing)` are closed-bounded. Their direct and player-owned
Projectile contact seams have focused coverage (230/232/234 tests), the
682/682 required/optional trace corpus, typecheck, production build,
boundaries, and diff hygiene. T522 keeps authored score out of score
adjudication; T523 selects effective hit/guard `givepower` without mutating the
power resource; T524 carries authored `p2facing` only for non-guard contacts.
The Fighter Lab now has `?mode=lab&labView=gallery`: all loaded fighters are
inventory cards with action/frame/box totals and a complete action index, and a
card opens the existing timeline. `pnpm qa:browser:fighter-lab` passes with
`character-gallery.png`; the broad `pnpm qa:smoke` attempt timed out and is not
claimed as a pass. T525 `GetHitVar(guardcount)` and T526
`GetHitVar(hitcount)` are now closed-bounded after official write/read/reset
research. T526 keeps mutable `comboHitCount` separate from authored `numhits`;
T527's required Ikemen Projectile trace proves two eligible hits and one
guarded break while static/imported fallback remains intact. T528 closes the
bounded `GetHitVar(xveladd|yveladd)` KO-delta cursor for direct and
player-owned Projectile contacts under `ikemen-go`; non-KO and other profiles
retain the zero fallback.

Wayfinder 127 is now closed-bounded. Its active-root air-guard landing fixture
 proves the authored `40/A -> 132/A -> 154/A -> 155/A -> 52/S -> 20/S` route,
 ordered landing controllers, one zero-chip `p4 -> p3` guard, and final control
 without claiming generic aerial physics or full guard parity. The current
trace corpus passes 684/684 artifacts (650 required, 34 optional).

T529 closes the first global AssertSpecial ownership slice: team round-finish
reduction now observes all live roots and Helpers, including reserves, while single-mode and
legacy pair behavior remain unchanged. Match snapshots and resource/lifebar
projections consume the same reducer. Focused coverage is 30/30 and the
existing trace corpus remains 684/684.

Authority: [official M.U.G.E.N / Ikemen-GO comparison](research/2026-07-30-official-mugen-ikemen-roadmap-comparison.md).
T424 through T438, T463/T464 and T465-T480 are closed-bounded with final
gates. T475 is the preceding closed source-selected R1 airborne-only `air.fall`
slice; T476 is the closed lying-target `down.velocity.x` continuation; T477 is
the closed signed `fall.xvelocity` bounce correction; T478 is the closed CommonFX
visual-scale and localcoord propagation; T480 is the closed Ikemen
`fall.zvelocity` depth continuation. T481 closes the three-component HitDef
velocity-Z continuation. T482 closes the static ModifyHitDef vector-Z mutation
cursor; T483 closes the bounded HitDef acceleration metadata/GetHitVar handoff;
T484 closes static ModifyHitDef acceleration metadata mutation; T485 closes
dynamic HitDef/ModifyHitDef acceleration metadata evaluation; T486 exposes
the selected Ikemen depth velocity through `GetHitVar(zvel)`; T487 closes
Ikemen `HitVelSet z` depth application; T488 exposes the five Ikemen
`GetHitVar` velocity-vector families; T489 exposes the authored HitDef damage
components through `GetHitVar(hitdamage|guarddamage)`; T490 exposes the
ground/air/fall HitDef animation-type fields through `GetHitVar`. T499-T505
replace the former broad content lane with a two-fighter karate roster reset;
the old provider-row work is superseded and scores remain held.
T491 exposes Ikemen `fall.envshake.mul` through the same direct/projectile and
imported fall metadata seam. T492 exposes the source attacker's `playerno`
through the existing hit metadata read model. T506 adds the separate numeric
`playerid` for root and verified Helper HitDef/Projectile contacts; it is the
typed identity cursor. T507 adds the official deprecated-but-valid `ID` alias
over that same numeric field. T508 binds the two required opponent-name traces
to the active roster and restores the 682/682 aggregate trace baseline. T509
exposes the already-retained guard-KO flag as `GetHitVar(guardko)`. T510
compares existing last-hit `sourceAttr` through static `GetHitVar(attr)`
equality and inequality filters.

T511 compares retained effective `guardflag` masks with Ikemen overlap
semantics. T512 exposes numeric last-hit Projectile IDs with the official `-1`
direct/missing fallback. T513 exposes numeric 1-based last-hit team side with
explicit-side precedence and the same `-1` missing fallback.
T514 exposes numeric `GetHitVar(keepstate)` for direct HitDef contacts, returning
`1` only when the authored last HitDef carries `keepstate = 1` and `0` for the
false/missing fallback; Projectile and Reversal keepstate remain outside scope.
T515 exposes numeric `GetHitVar(frame)` during the direct HitDef and Projectile
hit/guard contact frame, preserves the marker through hitpause, and clears it at
the next non-paused frame; ReversalDef and HitOverride-only timing remain out.
T516 exposes numeric `GetHitVar(priority)` from the last HitDef, normalizing
direct priority to the shared default of 4 and keeping Projectile `projpriority`
clash values separate from the Projectile HitDef default.
T517 exposes numeric `GetHitVar(dizzypoints)` from direct and Projectile HitDef
metadata, keeps it separate from the defender's current dizzy resource, and
defaults missing bounded metadata to `0`.
T518 exposes numeric `GetHitVar(guardpoints)` from direct and Projectile HitDef
metadata, keeps it separate from the defender's current guard resource, and
defaults missing bounded metadata to `0`.
T519 exposes numeric `GetHitVar(redlife)` from authored direct/Projectile
HitDef metadata while keeping the defender's current red-life resource
separate. T519 is now closed-bounded with 5 focused files / 224 tests and full
non-browser gates; T520 is the next selected cursor for numeric
`GetHitVar(guardpower)` from the second authored `givepower` value.
T520 is now closed-bounded with 5 focused files / 226 tests and full
non-browser gates; T521-T527 are now closed-bounded for hitpower, score,
effective power, authored facing, guardcount, hitcount, and authored multi-hit
contacts. T528 is closed-bounded for Ikemen
`GetHitVar(xveladd|yveladd)`; the next cursor remains subject to the official
source-selection rule below.

### Active content cursor — T499-T505

Issues: [78](../.scratch/roadmap/issues/78-roster-reset-two-karate-fighters.md),
[79](../.scratch/roadmap/issues/79-fighter-lab.md)

| Order | Task | Lane | Status | Exit evidence |
| --- | --- | --- | --- | --- |
| 44 | T499 retire legacy public roster | C1 | closed-bounded | 17 packages moved to recoverable scratch archive; KFM remains private fixture |
| 45 | T500 Rocco Vidal identity | C1 | closed-bounded | Original sober karate design, accepted anchor and hashed Imagegen sources |
| 46 | T501 Nadia Arce identity | C1 | closed-bounded | Original sober karate design, accepted anchor and hashed Imagegen sources |
| 47 | T502 complete sprite production | C1 | closed-bounded | 28 state rows, 158 frames, two atlases, provenance, contacts and runtime previews |
| 48 | T503 roster and MUGEN-lite integration | C4 | closed-bounded | Two public packages, 14 runtime actions each, focused tests/typecheck/build green |
| 49 | T504 pre-package and browser closure | C5 | in progress | Roster, Studio and ZIP pass; identity proxy retains 34 pose/occlusion alerts; global smoke is red only on 6 prior MUGEN-lite visuals |
| 50 | T505 Fighter Lab | C4 | closed-bounded | Direct roster/action/frame/VFX/atlas/Clsn view; focused browser gate passes without console or page errors |

| Order | Task | Lane | Status | Exit evidence | Issue |
| --- | --- | --- | --- | --- | --- |
| 1 | T424 M.U.G.E.N same-tick current-state transition chain | R1 | closed-bounded | Root + helper same-tick order, cycle telemetry, 305/3234 suite, build/boundaries, 667/667 trace artifacts | [09](../.scratch/roadmap/issues/09-mugen-current-state-transition-loop.md) |
| 2 | T425 Ikemen stable P2 switch contract | I2 | closed-bounded | 05b decision (no wiki-only 30 px), one-pixel/KO invalidation, live controller `P2Name`, required trace 668/668 | [10](../.scratch/roadmap/issues/10-ikemen-p2-stable-switch-contract.md) |
| 3 | T426 M.U.G.E.N `select.def` playable roster/stage authority | R1 | closed-bounded | Manifest, hostile VFS cases, owner-routed roster consumer, desktop/mobile browser reimport, 668/668 trace, smoke, 307/3245 suite | [11](../.scratch/roadmap/issues/11-mugen-select-def-playable-roster.md) |
| 4 | T427 Ikemen live ZSS state pipeline | I2 | closed-bounded | Direct/fallback/mixed loader tests, shared IR, live trace `47c627a2`, 669/669 trace corpus | [12](../.scratch/roadmap/issues/12-ikemen-zss-live-state-pipeline.md) |
| 5 | T428 Ikemen ZSS HitPause wrapper semantics | I2 | closed-bounded | Mixed CNS/ZSS global-pause fixture, source-located wrapped execution, frozen unwrapped control, 310/3257 suite, trace `b6533370` in 670/670 | [13](../.scratch/roadmap/issues/13-ikemen-zss-hitpause-wrapper-semantics.md) |
| 6 | T429 Ikemen ZSS combined wrapper persistence | I2 | closed-bounded | ZSS-only pause cadence/reset, source-located M.U.G.E.N rejection, trace `4ff43eb7` in 671/671, 311/3260 suite, production build | [14](../.scratch/roadmap/issues/14-ikemen-zss-combined-wrapper-persistence.md) |
| 7 | T430 M.U.G.E.N CNS persistent cadence | R1 | closed-bounded | Raw CNS positive `persistent = 2` normal trigger-count cadence/reset, trace `f7c32a53` in 676/676 | [15](../.scratch/roadmap/issues/15-mugen-cns-persistent-cadence.md) |
| 8 | T431 M.U.G.E.N CNS persistent zero | R1 | closed-bounded | Raw CNS `persistent = 0` once per normal state entry via `200 -> 201 -> 200`, trace `d13ad12a` in 673/673 | [16](../.scratch/roadmap/issues/16-mugen-cns-persistent-zero.md) |
| 9 | T432 M.U.G.E.N CNS HitPause persistent zero | R1 | closed-bounded | Paired raw CNS zero once per paused state entry, trace `94b49516` in 674/674 | [17](../.scratch/roadmap/issues/17-mugen-cns-hitpause-persistent-zero.md) |
| 10 | T433 M.U.G.E.N CNS HitPause persistent cadence | R1 | closed-bounded | Paired raw CNS `ignorehitpause = 1` + `persistent = 2` at pause ticks 2/4/6, trace `d6d00fd0` in 675/675 | [18](../.scratch/roadmap/issues/18-mugen-cns-hitpause-persistent-cadence.md) |
| 11 | T434 M.U.G.E.N CNS persistent trigger count | R1 | closed-bounded | Raw CNS `persistent = 2` counts sparse trigger passes, trace `3eb88436` in 676/676 | [19](../.scratch/roadmap/issues/19-mugen-cns-persistent-trigger-count.md) |
| 12 | T435 M.U.G.E.N CNS `StateDef -2` persistent | R1 | closed-bounded | Raw CNS `-2` persistent `= 2` survives current-state entry, trace `6fce3962` in 677/677 | [20](../.scratch/roadmap/issues/20-mugen-cns-special-persistent.md) |
| 13 | T436 M.U.G.E.N CNS `StateDef -3` persistent | R1 | closed-bounded | Raw CNS `-3` persistent `= 2` survives current-state entry with no `stateOwner`, trace `b2719d71` in 678/678 | [21](../.scratch/roadmap/issues/21-mugen-cns-state-minus-three-persistent.md) |
| 14 | T437 M.U.G.E.N CNS `StateDef -1` persistent | R1 | closed-bounded | Imported CMD setup `persistent = 2` counts sparse trigger passes across `0 -> 200`, trace `ba3d289d` in 679/679 | [22](../.scratch/roadmap/issues/22-mugen-cns-state-minus-one-persistent.md) |
| 15 | T438 M.U.G.E.N CNS `StateDef -1` persistent zero | R1 | closed-bounded | Imported CMD setup `persistent = 0` fires once per controller/actor cycle, trace `27e1ffb7` in 680/680 | [23](../.scratch/roadmap/issues/23-mugen-cns-state-minus-one-persistent-zero.md) |
| 16 | T463 M.U.G.E.N CMD `StateDef -1` `ChangeState` persistent zero | R1 | closed-bounded | State-entry persistence hook before value resolution; one tick-1 route survives `0 -> 200 -> 201 -> 0`, trace `88931500` in 681/681 | [48](../.scratch/roadmap/issues/48-mugen-cmd-state-minus-one-changestate-persistent-zero.md) |
| 17 | T464 M.U.G.E.N CMD `StateDef -1` `ChangeState` persistent cadence | R1 | closed-bounded | Static `persistent = 2` routes on trigger passes 1/3 at ticks 1/4 across repeated state chains, trace `3681fafa` in 682/682 | [49](../.scratch/roadmap/issues/49-mugen-cmd-state-minus-one-changestate-persistent.md) |
| 18 | T465 M.U.G.E.N guard timing cadence | R1 | closed-bounded | Separate default-runtime slide/control countdowns; authored `GetHitVar` values remain stable; direct/projectile/reset coverage; 324/3289 suite, typecheck, build, boundaries, 682/682 traces | [50](../.scratch/roadmap/issues/50-mugen-guard-timing-cadence.md) |
| 19 | T466 M.U.G.E.N `airguard.ctrltime` resolution | R1 | closed-bounded | HitDef/projectile parse + resolver fallback/override; air guard selects override while ground guard is unchanged; 324/3289 suite, typecheck, build, boundaries, 682/682 traces | [51](../.scratch/roadmap/issues/51-mugen-airguard-ctrl-time.md) |
| 20 | T467 M.U.G.E.N `air.hittime` resolution | R1 | closed-bounded | HitDef/ModifyHitDef/projectile parse + imported/runtime propagation; airborne normal hits select authored/default 20 while ground hits retain `ground.hittime`; focused/compiler/runtime regressions, trace 682/682 | [52](../.scratch/roadmap/issues/52-mugen-air-hit-time.md) |
| 21 | T468 M.U.G.E.N `air.hittime` / `fall=1` precedence | R1 | closed-bounded | Airborne falling direct hits use the bounded ground `hitStun` fallback; non-falling air hits keep authored/default `air.hittime`; ground/guard/projectile paths unchanged; focused resolver + fall traces | [53](../.scratch/roadmap/issues/53-mugen-air-hit-time-fall-interaction.md) |
| 22 | T469 M.U.G.E.N `down.hittime` / `down.velocity` interaction | R1 | closed-bounded | Lying hits carry authored/default 20-tick down timing; non-zero down Y launches into air timing; direct/ModifyHitDef/projectile compiler and resolver coverage; 324/3292 suite, typecheck, build, boundaries, 682/682 traces | [54](../.scratch/roadmap/issues/54-mugen-down-hit-time.md) |
| 23 | T472 M.U.G.E.N `down.bounce` hit-fall contract | R1 | closed-bounded | Typed direct/ModifyHitDef/Projectile propagation, explicit `HitFallVel` false/true gate, projectile fall metadata; 198 focused, 324/3294 full, typecheck/build/boundaries, 682/682 trace | [57](../.scratch/roadmap/issues/57-mugen-down-bounce.md) |
| 24 | T473 M.U.G.E.N `fall.recover` / `fall.recovertime` defaults | R1 | closed-bounded | Shared direct/projectile default resolver; 102 focused, 324/3296 full, typecheck/build/boundaries, 682/682 trace | [58](../.scratch/roadmap/issues/58-mugen-fall-recovery-defaults.md) |
| 25 | T474 M.U.G.E.N `fall.yvelocity` localcoord defaults | R1 | closed-bounded | Shared localcoord-aware default resolver; 105 focused, 324/3299 full, typecheck/build/boundaries, 682/682 trace | [59](../.scratch/roadmap/issues/59-mugen-fall-yvelocity-localcoord.md) |
| 26 | T475 M.U.G.E.N `air.fall` airborne-only selection | R1 | closed-bounded | Typed compiler/HitDef/projectile flag; standing vs airborne resolver/materialization; focused compiler/runtime regressions, full gates, 682/682 trace | [60](../.scratch/roadmap/issues/60-mugen-air-fall-default-selection.md) |
| 27 | T476 M.U.G.E.N/Ikemen `down.velocity.x` propagation | R1 | closed-bounded | Typed X propagation with official sign; 247 focused, 324/3308 full, typecheck/build/boundaries, 682/682 trace | [61](../.scratch/roadmap/issues/61-mugen-down-velocity-x.md) |
| 28 | T477 M.U.G.E.N/Ikemen `fall.xvelocity` signed bounce | R1 | closed-bounded | Direct/projectile fall X remains authored and signed across opposite facing; 121 focused, 324/3310 full, typecheck/build/boundaries and 682/682 trace pass | [62](../.scratch/roadmap/issues/62-mugen-fall-xvelocity-sign.md) |
| 29 | T478 Ikemen CommonFX `fx.scale` propagation | I2 | closed-bounded | DEF metadata -> imported library -> AIR frame -> resolved sprite dimensions/offsets; 38 focused, 324/3313 full, typecheck/build/boundaries, 682/682 trace | [63](../.scratch/roadmap/issues/63-ikemen-commonfx-scale.md) |
| 30 | T479 Ikemen CommonFX `localcoord` scale projection | I2 | closed-bounded | Package/character coordinate ratio derives effective AIR scale; 39 focused, 324/3314 full, typecheck/build/boundaries, 682/682 trace; exact timing/cache/palette/layer/audio remain open | [64](../.scratch/roadmap/issues/64-ikemen-commonfx-localcoord.md) |
| 31 | T480 Ikemen-GO `fall.zvelocity` depth propagation | I2 | closed-bounded | HitDef/imported/projectile/HitFallSet metadata reaches `combatDepth.velocity`; 7 files/230 focused, 324/3316 full, typecheck/build/boundaries, 682/682 trace; exact M.U.G.E.N Z/Common1 depth physics remain open | [65](../.scratch/roadmap/issues/65-ikemen-fall-zvelocity.md) |
| 32 | T481 Ikemen-GO HitDef velocity Z propagation | I2 | closed-bounded | Three-component ground/air/down/guard/airguard vectors reach direct/projectile contact and explicit `combatDepth.velocity`; 251 focused, 324/3317 full, typecheck/build/boundaries, 682/682 trace; ModifyHitDef/Common1 Z physics remain open | [66](../.scratch/roadmap/issues/66-ikemen-hitdef-velocity-z.md) |
| 33 | T482 Ikemen-GO ModifyHitDef velocity Z mutation | I2 | closed-bounded | Static ModifyHitDef vector-Z fields mutate an active normal HitDef; 2 files/89 focused, 324/3317 full, typecheck/build/boundaries, 682/682 trace; dynamic expressions/Common1 Z remain open | [67](../.scratch/roadmap/issues/67-ikemen-modifyhitdef-velocity-z.md) |
| 34 | T483 Ikemen-GO HitDef acceleration metadata | I2 | closed-bounded | Static xaccel/yaccel/zaccel compile through direct/imported/projectile hit metadata and GetHitVar; 7 files/249 focused, typecheck, boundaries; physics/scaling/dynamic mutation remain open | [68](../.scratch/roadmap/issues/68-ikemen-hitdef-acceleration-metadata.md) |
| 35 | T484 Ikemen-GO ModifyHitDef acceleration metadata | I2 | closed-bounded | Static ModifyHitDef xaccel/yaccel/zaccel mutate active normal HitDef hitVars; 2 files/89 focused, typecheck; dynamic expressions/physics remain open | [69](../.scratch/roadmap/issues/69-ikemen-modifyhitdef-acceleration-metadata.md) |
| 36 | T485 Ikemen-GO dynamic HitDef acceleration metadata | I2 | closed-bounded | Supported xaccel/yaccel/zaccel expressions remain typed and evaluate in active HitDef/ModifyHitDef context; 7 files/250 focused, 324/3321 full, typecheck/build/boundaries, 682/682 trace, asset hygiene | [70](../.scratch/roadmap/issues/70-ikemen-hitdef-acceleration-dynamic.md) |
| 37 | T486 Ikemen-GO `GetHitVar(zvel)` readback | I2 | closed-bounded | Existing HitDef/Projectile depth velocity is exposed through shared `GetHitVar(zvel)` with zero fallback; 27 focused, 324/3321 full, typecheck/build/boundaries, 682/682 trace | [71](../.scratch/roadmap/issues/71-ikemen-gethitvar-zvel.md) |
| 38 | T487 Ikemen-GO `HitVelSet z` | I2 | closed-bounded | Static `z` flag compiles and copies active hit depth velocity into `combatDepth.velocity`; 71 focused, 324/3321 full, typecheck/build/boundaries, 682/682 trace | [72](../.scratch/roadmap/issues/72-ikemen-hitvelset-z.md) |
| 39 | T488 Ikemen-GO `GetHitVar` velocity vectors | I2 | closed-bounded | Direct HitDef/Projectile preserve ground/air/down/guard/airguard vector components; 4 focused files/133 tests, 324/3324 full, typecheck/build/boundaries, 682/682 trace | [73](../.scratch/roadmap/issues/73-ikemen-gethitvar-velocity-vectors.md) |
| 40 | T489 Ikemen-GO `GetHitVar` damage components | I2 | closed-bounded | Direct HitDef/Projectile preserve first/second damage components as `hitdamage`/`guarddamage`; 3 focused files/114 tests, 324/3324 full, typecheck/build/boundaries, 682/682 trace | [74](../.scratch/roadmap/issues/74-ikemen-gethitvar-damage.md) |
| 41 | T490 Ikemen-GO `GetHitVar` animtype fields | I2 | closed-bounded | Direct HitDef/Projectile and imported moves preserve ground/air/fall reaction types with alias fallback; 7 test files/256 tests, 324/3327 full, typecheck/build/boundaries, 682/682 trace | [75](../.scratch/roadmap/issues/75-ikemen-gethitvar-animtype.md) |
| 42 | T491 Ikemen-GO `GetHitVar(fall.envshake.mul)` | I2 | closed-bounded | Direct HitDef/Projectile and imported moves preserve authored/default fall EnvShake multiplier; 7 test files/258 tests, 324/3329 full, typecheck/build/boundaries, 682/682 trace | [76](../.scratch/roadmap/issues/76-ikemen-gethitvar-fall-envshake-mul.md) |
| 43 | T492 Ikemen-GO `GetHitVar(playerno)` | I2 | closed-bounded | Direct HitDef and player-owned Projectile contacts expose the source attacker's player slot through the shared read model; 3 test files/119 tests, 324/3330 full, typecheck/build/boundaries, 682/682 trace, asset hygiene | [77](../.scratch/roadmap/issues/77-ikemen-gethitvar-playerno.md) |
| 44 | T506 Ikemen-GO `GetHitVar(playerid)` | I2 | closed-bounded | Direct and verified root/Helper HitDef/Projectile contacts retain numeric source identity separately from `playerno`; 5 files/178 focused tests, 5 deterministic trace checks, typecheck/build/boundaries/asset hygiene green; T508 later clears the inherited aggregate-trace label debt | [80](../.scratch/roadmap/issues/80-ikemen-gethitvar-playerid.md) |
| 45 | T507 Ikemen-GO deprecated `GetHitVar(ID)` | I2 | closed-bounded | Case-insensitive `ID` resolves through T506 `sourcePlayerId` with the same zero fallback; 1 focused file/27 tests | [81](../.scratch/roadmap/issues/81-ikemen-gethitvar-id-alias.md) |
| 46 | T508 required trace active-roster binding | R1 | closed-bounded | Identity and nonlethal HitDef expectations use the active second demo fighter; focused 2/2 and aggregate 682/682 traces pass without restoring retired characters | [82](../.scratch/roadmap/issues/82-required-trace-active-roster-decoupling.md) |
| 47 | T509 Ikemen-GO `GetHitVar(guardko)` | I2 | closed-bounded | Existing direct/root-Projectile guard-KO metadata is exposed as numeric 1/0; 3 files/121 tests, typecheck/build/boundaries and 682/682 traces pass | [83](../.scratch/roadmap/issues/83-ikemen-gethitvar-guardko.md) |
| 48 | T510 Ikemen-GO `GetHitVar(attr)` | I2 | closed-bounded | Static equality/inequality filters use existing `sourceAttr` in active and redirected actor contexts; 3 files/118 tests, typecheck/build/boundaries and 682/682 traces pass | [84](../.scratch/roadmap/issues/84-ikemen-gethitvar-attr.md) |
| 49 | T511 Ikemen-GO `GetHitVar(guardflag)` | I2 | closed-bounded | Effective direct/Projectile/Helper flags use static overlap comparison (`M = H|L`) in active and redirected contexts; 6 files/224 tests, typecheck/build/boundaries and 682/682 traces pass | [85](../.scratch/roadmap/issues/85-ikemen-gethitvar-guardflag.md) |
| 50 | T512 Ikemen-GO `GetHitVar(projid)` | I2 | closed-bounded | Numeric last-hit Projectile ID readback is implemented for Projectile contacts, with `-1` for direct/missing metadata; 4 focused files/186 tests, typecheck/build/boundaries and 682/682 traces pass | [86](../.scratch/roadmap/issues/86-ikemen-gethitvar-projid.md) |
| 51 | T513 Ikemen-GO `GetHitVar(teamside)` | I2 | closed-bounded | Effective 1-based source team side is retained for direct/Projectile contacts with explicit-side precedence and `-1` missing fallback; 4 focused files/186 tests, 682/682 traces, typecheck/build/boundaries pass; broad suite remains at the retired-roster baseline | [87](../.scratch/roadmap/issues/87-ikemen-gethitvar-teamside.md) |
| 52 | T514 Ikemen-GO `GetHitVar(keepstate)` | I2 | closed-bounded | Authored direct HitDef keepstate is retained and read numerically as 1/0; Projectile/Reversal paths keep the false fallback; 5 focused files/212 tests, 682/682 traces, typecheck/build/boundaries and diff hygiene pass; broad suite remains at the retired-roster baseline | [88](../.scratch/roadmap/issues/88-ikemen-gethitvar-keepstate.md) |
| 53 | T515 Ikemen-GO `GetHitVar(frame)` | I2 | closed-bounded | Same-frame direct HitDef and Projectile hit/guard marker reads 1, frame-start reset clears it after non-paused contact, and hitpause preserves it; 6 focused files/191 tests, 682/682 traces, typecheck/build/boundaries and diff hygiene pass; broad suite remains at the retired-roster baseline | [89](../.scratch/roadmap/issues/89-ikemen-gethitvar-frame.md) |
| 54 | T516 Ikemen-GO `GetHitVar(priority)` | I2 | closed-bounded | Numeric direct HitDef priority and Projectile HitDef default readback; `projpriority` clash data remains separate; 4 focused files/188 tests, 682/682 traces, typecheck/build/boundaries and diff hygiene pass; broad suite remains at the retired-roster baseline | [90](../.scratch/roadmap/issues/90-ikemen-gethitvar-priority.md) |
| 55 | T517 Ikemen-GO `GetHitVar(dizzypoints)` | I2 | closed-bounded | Authored direct/Projectile HitDef dizzypoints readback stays separate from the current dizzy pool; missing metadata reads 0; 5 focused files/220 tests, 682/682 traces, typecheck/build/boundaries and diff hygiene pass; broad suite remains at the retired-roster baseline | [91](../.scratch/roadmap/issues/91-ikemen-gethitvar-dizzypoints.md) |
| 56 | T518 Ikemen-GO `GetHitVar(guardpoints)` | I2 | closed-bounded | Authored direct/Projectile HitDef guardpoints readback stays separate from the current guard pool; missing metadata reads 0; 5 focused files/222 tests, 682/682 traces, typecheck/build/boundaries and diff hygiene pass; broad suite remains at the retired-roster baseline | [92](../.scratch/roadmap/issues/92-ikemen-gethitvar-guardpoints.md) |
| 57 | T519 Ikemen-GO `GetHitVar(redlife)` | I2 | closed-bounded | Authored direct/Projectile HitDef redlife readback stays separate from the current red-life pool; missing metadata reads 0; 5 focused files/224 tests, 682/682 traces, typecheck/build/boundaries and diff hygiene pass; broad suite remains at the retired-roster baseline | [93](../.scratch/roadmap/issues/93-ikemen-gethitvar-redlife.md) |
| 58 | T520 Ikemen-GO `GetHitVar(guardpower)` | I2 | closed-bounded | Second authored `givepower` guardpower readback stays separate from the current power pool; missing metadata reads 0; 5 focused files/226 tests, 682/682 traces, typecheck/build/boundaries and diff hygiene pass; broad suite remains at the retired-roster baseline | [94](../.scratch/roadmap/issues/94-ikemen-gethitvar-guardpower.md) |
| 59 | T521 Ikemen-GO `GetHitVar(hitpower)` | I2 | closed-bounded | First authored `givepower` is retained for direct/Projectile hit contacts separately from the current power resource; 5 files/232 focused tests, 682/682 traces, typecheck/build/boundaries/diff pass | [95](../.scratch/roadmap/issues/95-ikemen-gethitvar-hitpower.md) |
| 60 | T522 Ikemen-GO `GetHitVar(score)` | I2 | closed-bounded | Authored HitDef score is retained for direct/Projectile contacts without score movement; 5 files/230 focused tests, 682/682 traces, typecheck/build/boundaries/diff pass | [96](../.scratch/roadmap/issues/96-ikemen-gethitvar-score.md) |
| 61 | T523 Ikemen-GO `GetHitVar(power)` | I2 | closed-bounded | Effective hit/guard `givepower` readback is selected from the last contact without mutating the defender power resource; 5 files/232 focused tests, 682/682 traces, typecheck/build/boundaries/diff pass | [97](../.scratch/roadmap/issues/97-ikemen-gethitvar-power.md) |
| 62 | T524 Ikemen-GO `GetHitVar(facing)` | I2 | closed-bounded | Authored direct/Projectile HitDef `p2facing` is retained for non-guard contacts; live facing/ReversalDef choreography remains out; 5 files/234 focused tests, 682/682 traces, typecheck/build/boundaries/diff pass | [98](../.scratch/roadmap/issues/98-ikemen-gethitvar-facing.md) |
| 63 | T505 Gallery extension | C4 | closed-bounded | `?mode=lab&labView=gallery` inventories all loaded fighters, actions, frames and boxes, with card-to-timeline navigation; dedicated browser gate and visual screenshot pass | [79](../.scratch/roadmap/issues/79-fighter-lab.md) |
| 64 | T525 Ikemen-GO `GetHitVar(guardcount)` | I2 | closed-bounded | Cumulative direct/Projectile guard contacts increment while the defender remains in get-hit state and clear on idle; 6 files/220 focused tests, source notes, 682/682 traces, typecheck/build/boundaries/diff pass | [99](../.scratch/roadmap/issues/99-ikemen-gethitvar-guardcount.md) |
| 65 | T526 Ikemen-GO `GetHitVar(hitcount)` | I2 | closed-bounded | Mutable `comboHitCount` covers first/consecutive direct and player-owned Projectile hits, preserves through guard, and resets after guarded contact; `ikemen-go` also tracks authored `numhits`, while M.U.G.E.N trace fallback preserves 682/682; issue 100 closeout | [100](../.scratch/roadmap/issues/100-ikemen-gethitvar-hitcount.md) |
| 66 | T527 Ikemen-GO `GetHitVar(hitcount)` multi-hit reconciliation | I2 | closed-bounded | Required player-owned Projectile trace proves two authored-`numhits` eligible hits, combo/guard branches, one guarded break, target/lifecycle evidence; `c6582760` / `78e24146`, aggregate 683/683 | [101](../.scratch/roadmap/issues/101-ikemen-gethitvar-hitcount-multihit.md) |
| 67 | T528 Ikemen-GO `GetHitVar(xveladd|yveladd)` | I2 | closed-bounded | KO velocity delta is tracked separately for lethal direct and player-owned Projectile contacts under `ikemen-go`; zero fallback for non-KO/non-profile routes; 801 focused tests and 684/684 trace artifacts pass | [102](../.scratch/roadmap/issues/102-ikemen-gethitvar-veladd.md) |

Selection rule: the official Ikemen wiki delegates legacy behavior to
Elecbyte's M.U.G.E.N 1.1 docs. Shared VM/package gaps therefore outrank broad
Ikemen feature breadth. T427 closed the source-to-runtime cut, T428 closed
the basic wrapper pause filter, and T429 closed the combined paused-ZSS
cadence. T430/T431 close normal raw-CNS interval/zero behavior and T432 closes
the paired raw-CNS paused zero gap. T433 closes paired raw-CNS positive paused
cadence, T434 corrects normal raw-CNS positive cadence to count trigger
passes, T435 closes `StateDef -2`, T436 closes `StateDef -3` with its
no-`stateOwner` boundary, and T437 closes imported CMD `StateDef -1` setup
`persistent = 2`; T438 closes its matching imported `persistent = 0`
setup one-shot route, and T463 applies that same isolated marker to the static
State -1 `ChangeState` route. T464 applies the isolated T437 positive
trigger-count map to that same static route. T465/T466/T467 close the bounded
guard and direct-hit timing parameter seams; T468 gives `fall=1` precedence over
airborne `air.hittime` in the effective resolver stun. T469 closes the bounded
lie-down timing/velocity seam; T472 carries the explicit bounce flag into the
hit-fall seam with explicit false/true coverage; T473 applies the documented
fall recovery defaults at direct/projectile materialization; T474 applies the
localcoord-aware omitted fall velocity at the same seam; T475 keeps `air.fall`
airborne-only while preserving the base fall flag; T476 carries authored
horizontal `down.velocity` into lie-down direct/projectile contacts; T477 keeps
authored fall bounce X signed without facing mirroring; T478 closes the bounded
CommonFX `fx.scale` metadata seam, T479 derives the package/character
`localcoord` scale, and T480 carries Ikemen `fall.zvelocity` into depth
without changing the score movement; T481 carries authored HitDef velocity Z
through direct/projectile context selection without changing the score movement.
Exact Common1 default, landing tables, bounce lifetime, velocity scaling,
recovery-state choreography, and M.U.G.E.N Z parity remain outside the claim.

## Superseded content expansion queue — T439-T471 (historical)

This original-content queue is separate from official parity and is retained
only as historical evidence: six satirical,
original fighters, eight classic-uniform recolors, shared VFX/FightFX, four
parallax stages, and roster/runtime integration. The eight classic packs now
expose regenerated subdued Imagegen 4x4 action grids, 14-state atlases, CC0
permission manifests and MUGEN-lite DEF/CMD/CNS/AIR templates; binary SFF,
palettes, collision audit and per-package trace remain open. T461 tracks the
v2 classic regeneration and T462 tracks the v2 four-stage regeneration. T462 is
closed-bounded for generation, parallax proof and browser selection; T457-
T460 still own closure steps. T470 closes the spritesheet coverage audit across
all public character packages. T499 supersedes T439-T445, T447-T461 and
T470-T471; T446/T462 keep the stage work. None of the former fighter packages
remains in the active public roster. Don Rayo, La Jefa del Combo y Monje Wi-Fi ya
tienen una fila `idle` Imagegen aislada con extracción, animation, alignment,
identity y visual en verde; sus preflights completos permanecen rojos porque
faltan 13 filas por perfil. Contracts live in [ROADMAP_CONTENT_PACK.md](ROADMAP_CONTENT_PACK.md);
issues 24-47 and 55-56 retain historical bounded evidence. T465 through T492
plus T506-T528 are closed-bounded; T504 is the active content cursor and T505's Gallery is its closed
product-tooling companion. T508 is the evidence-baseline repair and T527 the
latest closed source-selected runtime feature. No score movement is claimed.

| Order | Task | Lane | Status | Issue |
| --- | --- | --- | --- | --- |
| 15 | T439 Don Rayo | C1 | superseded | [24](../.scratch/roadmap/issues/24-content-don-rayo.md) |
| 16 | T440 La Jefa del Combo | C1 | superseded | [25](../.scratch/roadmap/issues/25-content-la-jefa-del-combo.md) |
| 17 | T441 Turbo Abuela | C1 | superseded | [26](../.scratch/roadmap/issues/26-content-turbo-abuela.md) |
| 18 | T442 Tanque de Cartón | C1 | superseded | [27](../.scratch/roadmap/issues/27-content-tanque-de-carton.md) |
| 19 | T443 Monje Wi‑Fi | C1 | superseded | [28](../.scratch/roadmap/issues/28-content-monje-wifi.md) |
| 20 | T444 Sombra del Súper | C1 | superseded | [29](../.scratch/roadmap/issues/29-content-sombra-del-super.md) |
| 21 | T445 VFX/FightFX satírico | C2 | superseded | [30](../.scratch/roadmap/issues/30-content-vfx-fightfx.md) |
| 22 | T446 stages parallax | C3 | in progress | [31](../.scratch/roadmap/issues/31-content-parallax-stages.md) |
| 23 | T447 roster/runtime integration | C4 | superseded | [32](../.scratch/roadmap/issues/32-content-roster-runtime-integration.md) |
| 24 | T448 variantes de vestuario homenaje | C1 | superseded | [33](../.scratch/roadmap/issues/33-content-homage-costume-variants.md) |
| 25 | T449 Mara Cinta | C1 | superseded | [34](../.scratch/roadmap/issues/34-content-mara-cinta.md) |
| 26 | T450 Toro Pixel | C1 | superseded | [35](../.scratch/roadmap/issues/35-content-toro-pixel.md) |
| 27 | T451 Nico Guante | C1 | superseded | [36](../.scratch/roadmap/issues/36-content-nico-guante.md) |
| 28 | T452 Luna Codo | C1 | superseded | [37](../.scratch/roadmap/issues/37-content-luna-codo.md) |
| 29 | T453 Sargento Pila | C1 | superseded | [38](../.scratch/roadmap/issues/38-content-sargento-pila.md) |
| 30 | T454 Bruno Giro | C1 | superseded | [39](../.scratch/roadmap/issues/39-content-bruno-giro.md) |
| 31 | T455 Vera Patada | C1 | superseded | [40](../.scratch/roadmap/issues/40-content-vera-patada.md) |
| 32 | T456 Rulo Viento | C1 | superseded | [41](../.scratch/roadmap/issues/41-content-rulo-viento.md) |
| 33 | T461 classic roster v2 sobrio/Baki | C1 | superseded | [46](../.scratch/roadmap/issues/46-content-classic-baki-regeneration.md) |
| 34 | T462 escenarios v2 sobrios/parallax | C3 | closed-bounded | [47](../.scratch/roadmap/issues/47-content-stages-baki-regeneration.md) |
| 35 | T470 spritesheet coverage audit | C1 | superseded | [55](../.scratch/roadmap/issues/55-content-spritesheet-coverage-audit.md) |
| 36 | T471 provider regeneration de filas bloqueadas | C1 | superseded | Historical evidence retained under scratch; no former atlas remains public. [56](../.scratch/roadmap/issues/56-content-spritesheet-provider-regeneration.md) |
| 38 | T457 classic palettes | C1 | superseded | [42](../.scratch/roadmap/issues/42-content-classic-palettes.md) |
| 39 | T458 classic SFF bridge | C2 | superseded | [43](../.scratch/roadmap/issues/43-content-classic-sff-bridge.md) |
| 40 | T459 classic collision QA | C2 | superseded | [44](../.scratch/roadmap/issues/44-content-classic-collision-qa.md) |
| 41 | T460 classic roster traces | C4 | superseded | [45](../.scratch/roadmap/issues/45-content-classic-traces.md) |

## Runtime continuation checkpoint — T427 live ZSS state pipeline (closed-bounded, 2026-07-30)

Direct `.zss`, missing-CNS `.cns.zss` fallback, and deterministic CNS/ZSS
source mixing now flow through `MugenCharacterLoader`, shared state IR, and
`PlayableMatchRuntime` only under `ikemen-go`. The exact executable list is
`Null`, `PosAdd`, `ChangeState`, and `VelSet`; syntax/controller violations
block the whole source and M.U.G.E.N gets a located rejection. Required
`ikemen-zss-live` trace checksum is `47c627a2`; `pnpm qa:trace` passed 669/669
artifacts (635 required).

## Runtime continuation checkpoint — T428 ZSS HitPause wrapper (closed-bounded, 2026-07-30)

A separate CC0 mixed fixture preserves the T427 route while CNS `StateDef 200`
starts global hit pause. Appended ZSS `StateDef -2` executes source-located
`ignoreHitPause VelSet` during the pause and leaves its unwrapped `PosAdd`
frozen; M.U.G.E.N rejects the same ZSS source. Required
`ikemen-zss-hitpause-wrapper` checksum is `b6533370`; the trace corpus passed
670/670 artifacts (636 required). T429 addresses only the next official
combined `persistent(n)` cadence gap, not generic ZSS support.

## Runtime continuation checkpoint — T429 combined wrapper persistence (closed-bounded, 2026-07-30)

During real CNS-owned HitPause, a source-located ZSS
`ignoreHitPause persistent(2)` controller runs on scheduler ticks 2 and 4,
skips tick 3, then resets after the CNS state-200-to-201 transition and runs
again on tick 5. The actor/controller-local counter is ZSS-only; the unwrapped
ZSS `PosAdd` stays frozen and CNS persistence is unchanged. Loader/source-order
tests preserve the located M.U.G.E.N rejection. Required
`ikemen-zss-combined-persistent-wrapper` checksum is `4ff43eb7` in a passing
671/671 trace corpus (637 required); typecheck and 311/3260 suite pass.

After a monitored build allowed the slow `vite:prepare-out-dir` copy to finish,
`pnpm build` passed in 3m59s; it emits only the existing large-chunk advisory.
No UI changed, so smoke is N/A; no score movement or general ZSS/CNS
persistence claim follows. T430 owns the separate raw-CNS positive cadence gap.

## Runtime continuation checkpoint — T430 M.U.G.E.N CNS persistent cadence (closed-bounded, 2026-07-30)

 Raw CNS `persistent = 2` now counts trigger-passing ordinary active-root
normal scans, skips the second trigger, runs on the third, and resets on state
entry. Required `mugen-cns-persistent-cadence` checksum `f7c32a53` remains
passed in the expanded 676/676 corpus; T434 adds sparse-trigger checksum
`3eb88436`. Focused coverage, typecheck, full suite, build, and boundaries pass.
Paused CNS, zero values, helpers, special states, dynamic values, and generic VM
parity remain out of scope.

## Runtime continuation checkpoint — T431 M.U.G.E.N CNS persistent zero (closed-bounded, 2026-07-30)

Raw CNS `persistent = 0` now claims the first trigger-passing ordinary
active-root normal scan once per state entry. The fixture proves executions at
ticks 1 and 4 around `200 -> 201 -> 200`, with repeated scans skipped and an
unparameterized controller still running. Required
`mugen-cns-persistent-zero` checksum `d13ad12a` passed in 673/673 artifacts
(639 required); focused coverage, typecheck, 3264-test suite, build, and
boundaries pass. Direct same-id `ChangeState` timing stays blocked because the
current state clock does not reset there.

## Runtime continuation checkpoint — T432 M.U.G.E.N CNS HitPause persistent zero (closed-bounded, 2026-07-30)

The paired raw-CNS `ignorehitpause = 1` plus `persistent = 0` controller now
executes once on its first eligible paused scan, skips later scans, and executes
again after `200 -> 201 -> 200`; its unwrapped sibling stays frozen. Required
`mugen-cns-hitpause-persistent-zero` checksum `94b49516` passed in 674/674
artifacts (640 required), alongside focused 5/333 coverage, typecheck, full
314/3266 suite, build, and boundaries. No UI changed, so smoke is N/A. Raw
positive paused cadence, unpaired wrappers, ZSS zero, helpers/specials, and
generic controller-VM parity remain out of scope.

## Runtime continuation checkpoint — T433 M.U.G.E.N CNS HitPause persistent cadence (closed-bounded, 2026-07-30)

T433 audits only a paired raw-CNS `ignorehitpause = 1` plus `persistent = 2`
controller in an ordinary active-root current state. It must use paused
scheduler passes rather than frozen state time for first/skip/interval/reset
behavior; trace `d6d00fd0` passed in 675/675 artifacts, with 6/335 focused,
315/3268 full suite, typecheck, build, and boundaries. All other values,
wrappers, actor scopes, and VM timing remain blocked.

## Runtime continuation checkpoint — T434 M.U.G.E.N CNS persistent trigger count (closed-bounded, 2026-07-30)

T434 aligns raw-CNS normal `persistent = 2` with the official trigger-pass
contract. Sparse trigger proof executes on the first and third trigger passes,
not on a state-time modulo; trace `3eb88436` passed in 676/676 artifacts, with
316/3270 full suite, typecheck, build, boundaries, and hygiene. Pause, ZSS,
globals/specials, helpers, and generic VM timing remain blocked.

## Runtime continuation checkpoint — T435 M.U.G.E.N CNS State -2 persistent (closed-bounded, 2026-07-30)

Raw CNS `StateDef -2` is checked every tick before the current state. Its
`persistent = 2` controller counts sparse trigger passes at ticks 1 and 4,
skips tick 3, and keeps its separate counter across the `0 -> 200` transition.
Trace `6fce3962` passed in 677/677 artifacts (643 required); focused 1/2,
317/3272 full suite, typecheck, build, boundaries, and hygiene pass. This does
not claim `-3`/`-1`, player-owned custom states, pause, helpers, dynamic values,
or generic VM parity.

## Runtime continuation checkpoint — T436 M.U.G.E.N CNS State -3 persistent (closed-bounded, 2026-07-30)

Raw CNS `StateDef -3` now has the same bounded trigger-count route as `-2`:
`persistent = 2` executes on sparse trigger passes 1 and 4 and skips pass 3
across the `0 -> 200` transition. The counter is separate and survives current
state entry, while the runtime admits it only when `fighter.stateOwner` is
undefined, matching the official exclusion for another player's state.
Trace `b2719d71` passed in 678/678 artifacts (644 required); focused 1/2,
318/3274 full suite, typecheck, build, boundaries, and hygiene pass. No UI
changed, so smoke is N/A. `-2`/`-1` expansion, custom-state ownership, pause,
helpers, dynamic values, and generic VM parity remain blocked.

## Runtime continuation checkpoint — T464 M.U.G.E.N CMD State -1 ChangeState persistent cadence (closed-bounded, 2026-08-01)

The static State -1 `ChangeState` route now reuses T437's isolated positive
trigger-count map. Sparse eligible triggers at StageTime 1/3/4 route on the
first and third passes (ticks 1/4), skip tick 3, and preserve the counter
through each `0 -> 200 -> 201 -> 0` chain. Required trace
`mugen-cns-state-minus-one-changestate-persistent` checksum `3681fafa` passes
in 682/682 artifacts (648 required, 34 optional); 324/3287 full tests,
typecheck, build and boundaries pass. No UI changed, so smoke is N/A.

## Runtime continuation checkpoint — T465 M.U.G.E.N guard timing cadence (closed-bounded, 2026-08-01)

The runtime now keeps authored `guardSlideTime` / `guardControlTime` stable for
`GetHitVar(slidetime)` / `GetHitVar(ctrltime)` and tracks separate remaining
windows for the default guard route. Direct and projectile guards seed those
windows; normal hits, hit overrides, reversals, and intro reset clear them.
Default runtime slide velocity stops and control returns at their respective
boundaries, while imported authored guard states remain in charge of Common1
presentation. Focused 102-test guard/stun suite, full 324/3289 suite,
typecheck, build, boundaries, and the 682/682 trace corpus pass. UI smoke is
N/A because no visible surface changed.

## Runtime continuation checkpoint — T466 M.U.G.E.N air-guard control time (closed-bounded, 2026-08-01)

`airguard.ctrltime` now parses and compiles for HitDef and ModifyHitDef,
resolves to `guard.ctrltime` when omitted, and carries through imported
fighters and projectiles. CombatResolver chooses the explicit air value only
for air guard contacts; ground guard keeps the ground value. Focused
HitDef/projectile/combat suite (149 tests), full 324/3289 suite, typecheck,
build, boundaries, and 682/682 traces pass. No checksum changed and UI smoke
is N/A.

## Runtime continuation checkpoint — T467 M.U.G.E.N air hit time (closed-bounded, 2026-08-01)

`air.hittime` now parses and compiles for HitDef, ModifyHitDef, and Projectile, propagates
through imported/runtime moves and projectiles, and is selected only for
airborne normal hits. Omitted values use the official 20-tick default; ground
hits retain `ground.hittime`, and guard timing is unchanged. Focused compiler,
HitDef, projectile, and combat regressions pass; `pnpm qa:trace` remains
682/682 with unchanged checksums. Final suite, typecheck, build, boundaries,
and diff hygiene pass: full suite 324 files / 3290 tests, with content gates
recorded separately below; UI smoke is N/A.

## Runtime continuation checkpoint — T468 M.U.G.E.N air hit time / fall interaction (closed-bounded, 2026-08-01)

The effective direct-hit resolver now gives `fall=1` precedence over airborne
`air.hittime`: an airborne falling hit uses the existing bounded ground
`hitStun` fallback, while an airborne non-falling hit keeps the authored/default
20-tick `air.hittime`. Ground hits, guard contacts, projectile no-fall paths,
and direct `runtime.hitFall` metadata are unchanged. Focused resolver coverage
is 27 tests and the targeted fall trace subset is 2 tests. Final closeout passes
324 files / 3291 tests, typecheck, build, boundaries, `qa:trace` 682/682, and
diff hygiene. This is a resolver cut only, not exact Common1 fall/landing or
`GetHitVar(hittime)` lifetime parity; UI smoke is N/A.

## Runtime continuation checkpoint — T469 M.U.G.E.N down hit time / velocity interaction (closed-bounded, 2026-08-01)

The typed HitDef, ModifyHitDef, Projectile, imported move, and projectile
contracts now carry `down.hittime` plus the effective Y component of
`down.velocity`. The resolver selects the bounded 20-tick/default or authored
down timing while a defender is lying down with zero vertical velocity, and
switches to airborne timing when the down hit launches vertically. Focused
compiler/HitDef/projectile/combat coverage and the existing down-hit trace
subset pass. Final closeout passes 324 files / 3292 tests, typecheck, build,
boundaries, `qa:trace` 682/682, and diff hygiene; UI smoke is N/A. Exact
lie-down Common1 tables, bounce/recovery, and full `GetHitVar` lifetime parity
remain outside the claim.

## Runtime continuation checkpoint — T472 M.U.G.E.N `down.bounce` (closed-bounded, 2026-08-01)

`down.bounce` now compiles on direct HitDef, ModifyHitDef and Projectile
controllers, persists on direct/projectile fall metadata, and gates
`HitFallVel`: explicit `0` clears bounce velocity while omitted/`1` preserve
the current compatibility path. Focused coverage passes 198 tests; the full
suite passes 324 files / 3294 tests; typecheck, build, boundaries and
`qa:trace` pass 682/682 artifacts. UI smoke is N/A because no visible surface
changed. Exact Common1 default and landing parity stay outside the claim.

## Runtime continuation checkpoint — T473 M.U.G.E.N fall recovery defaults (closed-bounded, 2026-08-01)

The shared runtime resolver now applies the official enabled-fall defaults:
omitted `fall.recover` becomes `true` and omitted `fall.recovertime` becomes
`4`. Explicit `recover = 0`, authored times, and disabled falls remain
unchanged across direct and projectile materialization. Focused coverage is
102 tests and the full suite is 324 files / 3296 tests; typecheck, build,
boundaries and `qa:trace` 682/682 pass. UI smoke is N/A because no visible
surface changed; exact Common1 recovery-state choreography is outside the
bounded claim.

## Runtime continuation checkpoint — T474 M.U.G.E.N localcoord fall velocity defaults (closed-bounded, 2026-08-01)

The shared runtime helper now resolves omitted `fall.yvelocity` from the
documented 320px baseline: `-4.5` at 320px, `-9` at 640px, and `-18` at
1280px. Direct hits read the defender localcoord; projectiles read their
carried localcoord. Authored fall Y velocity, authored hit velocity, and
invalid/missing localcoord fallback remain unchanged. Focused coverage is 105
tests and the full suite is 324 files / 3299 tests; typecheck, build,
boundaries and `qa:trace` 682/682 pass. UI smoke is N/A because no visible
surface changed; exact Common1 landing physics and non-linear viewport scaling
remain outside the bounded claim.

## Previous runtime checkpoint — T463 M.U.G.E.N CMD State -1 ChangeState persistent zero (closed-bounded, 2026-08-01)

`RuntimeStateEntryRouteWorld` now invokes a bounded persistence admission hook
after triggers and before static/dynamic destination resolution. The raw CMD
State -1 `persistent = 0` marker is actor/controller-local and survives the
same-tick `0 -> 200 -> 201` chain plus the later idle return to state 0, so
eligible StageTime triggers at ticks 3/4 cannot reroute. Required trace
`mugen-cns-state-minus-one-changestate-persistent-zero` checksum `88931500`
passes in 681/681 artifacts (647 required, 34 optional); 323/3285 full tests,
typecheck, build and boundaries pass. No UI changed, so smoke is N/A.

## Previous runtime checkpoint — T438 M.U.G.E.N CNS State -1 persistent zero (closed-bounded, 2026-07-30)

Imported CMD `StateDef -1` setup controllers now honor raw `persistent = 0`
as one execution per controller/actor cycle. The fixture covers repeated
scans, a `0 -> 200` transition, reset on the next cycle, and the existing
input/AI ownership seam. Required trace `27e1ffb7` passed in 680/680
artifacts (646 required, 34 optional); focused coverage, full suite,
typecheck, build, boundaries, hygiene, and docs pass. State -1 ChangeState,
helpers, pause, dynamic values, and generic VM parity remain blocked.

## Runtime continuation checkpoint — T437 M.U.G.E.N CNS State -1 persistent (closed-bounded, 2026-07-30)

Imported CMD `StateDef -1` setup controllers now apply the bounded raw-CNS
`persistent = 2` trigger-count contract. The separate counter executes on
trigger passes 1 and 4, skips pass 3, and survives the current `0 -> 200`
transition. Required trace `ba3d289d` passed in 679/679 artifacts (645
required, 34 optional); full suite 319/3276, typecheck, build, boundaries,
hygiene, and docs pass. State -1 `ChangeState`, `persistent = 0`, helpers,
pause, dynamic values, and generic VM parity remain blocked.

## Runtime continuation checkpoint — T425 stable P2 switch (closed-bounded, 2026-07-30)

The normative 05b pin remains the runtime authority: the current wiki's
30-pixel retention wording is not ported because neither 05b nor reviewed
current master has that branch. Local P2 cache invalidates on source-visible
candidate/position changes. Controller value expressions now receive the same
live P2 roster bindings as active triggers, so `VarSet value = P2Name` sees
the refreshed P4 candidate.

Focused proof: 5 files / 342 tests. Final gates: serial suite 305 files /
3240 tests, `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
`git diff --check` passed. Required
`synthetic-imported-ikemen-p2-value` trace checksum is `fa72c6f2`;
`pnpm qa:trace` passed 668/668 artifacts (634 required, 34 optional).
Claim remains bounded to explicit `ikemen-go` P2 selection and live controller
values; full CharList timing, teams, rollback/netplay, and wiki-only hysteresis
remain blocked.

## Runtime continuation checkpoint — T424 current-state transition chain (closed-bounded, 2026-07-30)

Root/helper current-state `ChangeState` now returns typed transition metadata
and continues the destination in the same tick. Source tails skip. Special-state
order remains unchanged. Shared 32-transition budget prevents authored cycles
from hanging a frame; imported root diagnostics land in
`compatibilitySession.stateTransitionCycles`.

Focused proof: 5 files / 403 tests passed. Final gates: serial suite 305 files
/ 3234 tests, `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
`git diff --check` passed; `pnpm qa:trace` passed 667/667 artifacts (633
required, 34 optional). Claim ceiling: tested imported root/helper profiles,
not full CNS/ZSS or complete parity.

## Runtime continuation checkpoint — T423 active expression root selection (closed-bounded, 2026-07-30)

El factory de contextos de controllers activos ya recibe `RuntimeRootSelection/v0`
por resolver inyectado y transporta la policy P2 explícita. `PlayableMatchRuntime`
lo habilita sólo en `ikemen-go`; MUGEN/unknown conserva el fallback sin
selección explícita. La prueba live confirma `P2Name` sobre P4 después de la
orientación automática del actor; el factory cubre también el fallback legacy.

Prueba focal: 4 archivos / 33 tests seleccionados. Prueba ampliada: 6 archivos
/ 450 tests. `pnpm typecheck` verde. Ledger:
`docs/research/2026-07-30-ikemen-active-expression-selection.md`.

Suite serial: 305 archivos / 3231 tests. Typecheck, build, boundaries y diff
hygiene verdes. `qa:trace` volvió a quedar sin salida por 124 s en el bloqueo
SSR recurrente de `StateSourceResolver.ts`; el runner se verificó y detuvo sin
churn de evidencia, y el baseline T419 sigue en 667/667. No hay score movement.

Claim permitido: selección root y P2-family/Partner names en el context factory
activo IKEMEN. Claim bloqueado: estado/vida completos, helpers `type=player`,
Tag/Simul/Turns, rollback/netplay y paridad completa.

## Runtime continuation checkpoint — T422 P5/P7 partner name reads (closed-bounded, 2026-07-30)

T422 expone `P5Name` y `P7Name` con los índices 1 y 2 del roster Partner,
junto a `P3Name` en el índice 0. El pin usa `partner(1/2, false)`; no se
mezcla con el roster P2 ni con `EnemyNear`. Compiler/evaluator y la prueba
explícita quedan alineados; `Partner(index)` y legacy no cambian.

Prueba focal: 3 archivos / 118 tests. Ledger:
`docs/research/2026-07-30-ikemen-partner-name-reads.md`.

Suite serial: 305 archivos / 3230 tests, typecheck, build, boundaries y diff
hygiene verdes. `qa:trace` quedó sin materializar por el mismo bloqueo SSR de
Vite en `StateSourceResolver.ts`; no hubo churn de evidencia y el baseline
T419 continúa en 667/667.

Claim permitido: nombres P5/P7 source-shaped en `rootSelection` 046b/T419.
Claim bloqueado: Partner state/life completo, Helpers `type=player`, cache
frame-start exacto, Tag/Simul/Turns, rollback/netplay, score movement y
paridad completa.

## Runtime continuation checkpoint — T421 P6/P8 name reads (closed-bounded, 2026-07-30)

T421 expone `P6Name` y `P8Name` con los índices 2 y 3 del mismo roster P2
source-shaped que usan P2/P4Name. El compilador y el evaluador reconocen los
dos identificadores; `Partner`/P5/P7, `EnemyNear` y la ruta legacy no cambian.

Prueba focal: 3 archivos / 118 tests. Ledger:
`docs/research/2026-07-30-ikemen-p2-family-name-reads.md`.

Claim permitido: nombres P6/P8 source-shaped en el contexto explícito
`rootSelection` ya filtrado por 046b/T419. Claim bloqueado: P5/P7, lecturas de
vida/estado P6/P8, Helpers `type=player`, cache frame-start exacto,
Tag/Simul/Turns, rollback/netplay, score movement y paridad completa.

## Runtime continuation checkpoint — T420 P2-family reads (closed-bounded, 2026-07-30)

T420 conecta `P4Name` al mismo roster P2 source-shaped que ya usa `P2` en el
contexto explícito `rootSelection`. La ruta `EnemyNear` mantiene su lista y
orden legacy, y la ruta sin selección explícita conserva el comportamiento del
caller. El cambio corrige la divergencia upstream donde `P4Name` usa el índice
1 de `p2EnemyList`, no el índice 1 de `EnemyNear`.

Prueba focal: 2 archivos / 36 tests; prueba ampliada de contexto, compilador,
subset CNS, MatchWorld, runtime live y selector: 6 archivos / 464 tests.
Ledger: `docs/research/2026-07-30-ikemen-p2-family-reads.md`.

Suite completa: 305 archivos / 3230 tests, typecheck, build, boundaries y
diff hygiene verdes. `qa:trace` conserva la evidencia T419 de 667/667; tres
reintentos post-T420 y un probe mínimo de Vite quedan limitados por el mismo
timeout SSR de 60 s en `StateSourceResolver.ts`, sin churn de artefactos.

Claim permitido: `P2` y `P4Name` comparten el roster P2 source-shaped dentro
del dominio 046b/T419. Claim bloqueado: `P6/P8`, Helpers `type=player`, cache
frame-start exacto, `bindToId`/escala, Tag/Simul/Turns, rollback/netplay,
score movement y paridad MUGEN/IKEMEN.

## Runtime continuation checkpoint — T419 P2 source-shaped distance (closed-bounded, 2026-07-30)

T419 queda cerrado con la policy P2 separada del selector legacy: distancia X
relativa al facing, penalización behind, Z opcional gobernado por el stage,
desempates deterministas y cache local invalidada por firma. La matriz 046b de
candidatos no cambia; tampoco se amplían `EnemyNear`, Helpers, Tag/Simul/Turns
ni el score.

Puertas finales: `pnpm test` 305 archivos / 3229 tests, `pnpm typecheck`,
`pnpm build`, `pnpm check:boundaries` y `git diff --check` pasaron;
`pnpm qa:trace` pasó 667/667 (633 required, 34 optional). No hubo superficie
visual, por lo que smoke es N/A. Un intento de traza tuvo timeout transitorio
de transporte SSR; el reintento limpio completó la matriz. Ledger:
`docs/research/2026-07-30-ikemen-p2-source-distance.md`.

Claim permitido: orden P2 X/facing/Z source-shaped y cache local acotados al
perfil IKEMEN y al filtro de elegibilidad existente. Claim bloqueado: timing
exacto del cache upstream, flags completos de `CharList`, `bindToId`/escala,
Helpers `type=player`, modos de equipo completos, rollback/netplay y paridad
MUGEN/IKEMEN.

## Current Studio product board - DA32-031 (closed-bounded, 2026-07-28)

DA32-031 makes the unresolved source-write recovery choice explicit. A pending
`write-closed` intent exposes `Prepare retry`, which persists
`recoveryDecision = retry`, increments `recoveryAttempt`, resets observation to
`needs-observation`, and loads the exact preimage. `Abandon recovery` requires
confirmation, creates a rejected `recovery-abandoned` receipt, and settles the
intent as `aborted` with `recovery = none`.

The provisional desktop/mobile gate passes all eleven steps at `1440x900` and
`390x844`, including IndexedDB, bridge, DOM, exact preimage, receipt
settlement, not-linked handle state, overflow, and console checks. Implementation
and gate/evidence subject: `3826f0ea`.
Evidence:
`docs/evidence/da32/da32-031-source-write-recovery-decisions-browser-gate.json`.
The gate records zero unexpected console errors and no granted source handle.

Next Studio proof: physical crash cuts, real retry writes, quota and eviction,
and multi-file transaction boundaries. ZIP rewrite, binary source, release,
and full parity claims remain blocked.

## Previous Studio product board - DA32-030 (closed-bounded, 2026-07-28)

DA32-030 proves the explicit acceptance route after a positive source
observation. Studio relinks a KFM fixture, records `matches-draft`, exposes
`Accept observed source`, reads the file again, explicitly reimports the
folder, resolves the logical VFS path, verifies the draft digest, and settles
the original intent with a committed `observed-write-and-reimport` receipt.
The settled intent keeps `recovery = observed`; the mock handle records zero
writable-stream calls and zero `readwrite` permission requests.

The provisional desktop/mobile gate passes all fourteen steps at `1440x900` and
`390x844`, including IndexedDB, bridge, DOM, exact draft bytes, committed
fingerprint, receipt settlement, overflow, and console checks. Implementation:
`bf719ef5`; gate/evidence: `9a0a7d41`.
Evidence:
`docs/evidence/da32/da32-030-source-write-observation-finalize-browser-gate.json`.
The fixture keeps one visible missing `sound/kfm.mid` warning. Unrelated
roadmap documentation changes keep the subject provisional.

Next Studio proof: physical crash windows, retry/abandon, quota and eviction,
and multi-file transaction boundaries. ZIP rewrite, binary source, release,
and full parity claims remain blocked.

## Previous Studio product board - DA32-028 (closed-bounded, 2026-07-28)

DA32-028 proves the positive source observation route. Studio relinks the KFM
fixture through a simulated folder picker, receives read permission, reads the
real `chars/kfm/kfm.cns` bytes, records `matches-preimage` with digest and
length, and keeps the intent `write-closed` without a receipt. The mock handle
records zero writable-stream calls.

The provisional desktop/mobile gate passes all eleven steps at `1440x900` and
`390x844`, including IndexedDB, bridge, DOM, pending retention, no receipt,
overflow, and console checks. Implementation/gate: `57600085`; compact
evidence: `ced7d734`.
Evidence:
`docs/evidence/da32/da32-028-source-write-observation-positive-browser-gate.json`.
The fixture keeps one visible missing `sound/kfm.mid` warning. Unrelated
roadmap documentation changes keep the subject provisional.

Next Studio proof: `matches-draft` acceptance, explicit receipt finalization,
then physical crash windows, quota and eviction, and multi-file transaction
boundaries.

## Previous Studio product board - DA32-027 (closed-bounded, 2026-07-28)

DA32-027 closes the observation-state slice after an external source stream
closes before receipt finalization. Reload marks a pending `write-closed`
intent as `needs-observation`; Observe source records a read classification or
an explicit `unavailable` result without settling the intent or creating a
receipt. Load preimage remains available and exact.

The provisional desktop/mobile gate covers `1440x900` and `390x844`, direct
IndexedDB readback, bridge and DOM state, the no-handle negative path, pending
retention, no source-handle write, overflow, and zero unexpected console
errors. Implementation: `3027b948`. Evidence:
`docs/evidence/da32/da32-027-source-write-observation-browser-gate.json`.
The tree contains unrelated roadmap documentation changes, so this gate is
not a clean subject pin. Smoke is green with zero failures, but the smoke JSON
has no subject SHA.

Next Studio proof: granted-handle byte classification, explicit receipt
finalization, physical crash windows, quota and eviction, and multi-file
transaction boundaries. Automatic retry, ZIP rewrite, binary source, release,
and full parity claims remain blocked.

## Previous Studio product board - DA32-026 (closed-bounded, 2026-07-28)

DA32-026 closes the settled receipt readback slice. A settled source-write
intent retains the validated `SourceWriteReceipt/v1` payload and restores it
into the App bridge after reload. The recovery surface keeps the committed
status, reason, compensation state, and digest visible. Invalid receipt
digests fail closed before storage consumption.

Clean desktop/mobile browser evidence: `f18adb2d`, pinned in `5bc4cb90`,
`docs/evidence/da32/da32-026-source-write-receipt-recovery-browser-gate.json`.
Global smoke is green at `c632ceba` with zero failures, including bridge and
durable receipt-field checks in the folder write/reimport route.
Next Studio proof: physical crash or receipt-finalization recovery, quota and
eviction handling, and multi-file transaction boundaries. Automatic retry, ZIP
rewrite, binary source, release, and full parity claims remain blocked.

## Previous Studio product board - DA32-025 (closed-bounded, 2026-07-28)

DA32-025 closes the incomplete source-write phase slice. The durable intent
records the last phase after preimage capture, writable stream close, explicit
reimport, and receipt settlement. After reload, Studio shows `write-closed`
when a receipt is still absent. Loading the preimage restores exact editor
bytes and keeps the intent pending without writing a source handle.

Clean desktop/mobile browser evidence: `4e0d399c`, pinned in `a258bea7`,
`docs/evidence/da32/da32-025-source-write-phase-recovery-browser-gate.json`.
Global smoke is green at `5c0d0c68` with zero failures, including settled phase
and receipt-field checks in the folder write/reimport route.
Next Studio proof: physical crash or receipt recovery, quota and eviction
handling, and multi-file transaction boundaries. Automatic retry, ZIP rewrite,
binary source, release, and full parity claims remain blocked.

## Previous Studio product board - DA32-024 (closed-bounded, 2026-07-28)

DA32-024 closes the pending source-intent write/reimport slice. Studio can
relink a pending intent through the native folder picker, load the exact
preimage as a dirty draft when the active source differs, and write only after
the explicit Save & Reimport action. Read permission and `readwrite`
permission stay separate in the source handle record, bridge, and folder
transaction.

Clean desktop/mobile browser evidence: `0c39d9e9`, pinned in `ae16132a`,
`docs/evidence/da32/da32-024-source-intent-write-recovery-browser-gate.json`.
Global smoke is green at `bd9680fb` with zero failures.
Next Studio proof: crash/receipt recovery, quota and eviction handling, and
multi-file transaction boundaries. Physical permission prompts, durable
browser-restart handle claims, ZIP rewrite, binary source, release, and full
parity claims remain blocked.

## Previous Studio product board - DA32-023 (closed-bounded, 2026-07-28)

DA32-023 closes the pending source-write recovery slice. IndexedDB now keeps
`StudioSourceWriteIntent/v1` before and after a source-folder write; the live
Studio recovery view can load the exact pending preimage into the editor while
preserving pending status and showing the unlinked-handle boundary.

Clean desktop/mobile browser evidence: `ef2bf99c`,
`docs/evidence/da32/da32-023-source-write-intent-browser-gate.json`.
DA32-024 now records the permission-aware handle relink and write/reimport
recovery. Next Studio proof: crash/receipt recovery, quota and eviction
handling, and multi-file transaction boundaries. Binary source, release, and
full parity claims remain blocked.
## Current audit queue — DA31 evidence adoption

Machine rows exist through DA30-120. Human review stops its consecutive
written-clause cursor at DA30-020 because DA30-021 is the first incomplete
original gate. Execute DA31-002…008 first: immutable task contracts, separate
watermarks, computed verdicts, hermetic evidence promotion, exact subject
revisions, a 120-row ledger, and one clean current gate. Keep scores held.

Then execute DA31-009…040 in dependency order across product/browser,
determinism/MUGEN, Studio/assets/scanner, IKEMEN, the second consumer, package,
and local release review. Authority:
[post-DA30-120 audit](research/2026-07-27-daily-roadmap-architecture-audit-post-da30-120.md)
and [DA31 roadmap](DA31_EVIDENCE_ADOPTION_ROADMAP.md).

## Current runtime compatibility board - T419 (closed bounded, 2026-07-30)

T419 replaces the horizontal-only P2 ordering gap with a named source-shaped
policy after the existing eligibility filter. `RuntimeOpponentSelectionWorld`
now keeps P2 distance separate from legacy `EnemyNear`: relative X/facing,
the upstream behind adjustment, optional stage-gated Z weighting, deterministic
identity ties, and a signature-invalidated P2-only cache are covered by tests.
The explicit expression context and the live IKEMEN primary opponent consume
the policy; non-IKEMEN profiles retain the previous body-distance selector.

Focused proof is green at 2 files / 35 tests, plus the live
`PlayableMatchRuntime` policy test. Research and port ledger:
[`2026-07-30-ikemen-p2-source-distance.md`](research/2026-07-30-ikemen-p2-source-distance.md).

Claim allowed: bounded source-shaped P2 X/facing/Z ordering with local cache
invalidation after the existing eligibility filter. Claim blocked: exact
frame-start cache timing and all upstream invalidation flags, full
`bindToId`/scale semantics, Helper `type=player`, complete Tag/Simul/Turns
gameplay, rollback/netplay, score movement, and full MUGEN/IKEMEN parity.

## Previous runtime compatibility board - T418 (closed bounded, 2026-07-30)

T418 closes the narrow consumer gap left by the 046b root-selection matrix:
the filtered P2 candidate set now resolves through the shared nearest-body
selection boundary instead of taking the first roster id. `Enemy` keeps stable
root enumeration and `Partner` remains a same-side addressable roster.

Focused proof is green at 3 files / 46 tests; closure also passes 305 test
files / 3223 tests, TypeScript, build, boundaries, diff hygiene, and
`pnpm qa:trace` at 667/667 artifacts (633 required, 34 optional):
`RuntimeOpponentSelectionSystem`, `RuntimeExpressionContextSystem`, and
`MatchWorld`. The implementation is in
`docs/research/2026-07-30-ikemen-p2-nearest-selection.md`.

Claim allowed: bounded P2 nearest-body selection
after the existing eligibility filter. Claim blocked: exact P2 cache refresh,
Z/behind-facing policy, Helper `type=player`, Tag/Simul/Turns gameplay,
rollback/netplay, score movement, and full parity.

## Previous runtime compatibility board - T415 (closed bounded, 2026-07-27)

T415 closes in `40c297aa`. Active ReversalDef direct contacts and ReversalDef
clashes now consume the shared `stchtmp` predicate with the ReversalDef as
source: `p1stateno` targets the reverser and `p2stateno` targets the getter.
Root admission and runtime resolution keep that role swap explicit and fail
before state, target, hitpause, or power mutation.

Focused closure passed 3 files / 75 tests, including direct role swapping,
clash admission, and pre-mutation resolution. `node --check
scripts/qa_traces.cjs` and diff hygiene passed. `pnpm typecheck` reaches only
the unrelated pre-existing unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`. Claim blocked: exact
state-owner/source order, Projectile-to-ReversalDef tri-state routing,
Helpers, MUGEN, global pause, persistent cleanup, camera, teams beyond this
clash gate, global checkpoint, score movement, and full parity. Research:
`docs/research/2026-07-27-ikemen-stchtmp-reversal-state-redirect.md`.

## Previous runtime compatibility board - T414 (closed bounded, 2026-07-27)

T414 closes in `4dc23da4`. Root direct admission, direct combat resolution,
and equal-priority preparation now consume the bounded `stchtmp` predicate for
authored `p1stateno`/`p2stateno` redirects. Root admission checks after contact
and depth resolution; direct routes fail before HitOverride and damage.

Focused closure passed 3 files / 70 tests, including the no-contact negative
case and equal-priority non-mutation. `node --check scripts/qa_traces.cjs` and
diff hygiene passed. `pnpm typecheck` reaches only the unrelated pre-existing
unused `advanced` at `src/mugen/da32/ClauseAdjudicationSample.ts:149`.
Claim blocked: exact state-owner identity/order, ReversalDef, Projectile,
Helpers, MUGEN, global pause, persistent cleanup, camera, teams/clashes,
global checkpoint, score movement, and full parity. Research:
`docs/research/2026-07-27-ikemen-stchtmp-direct-state-redirect.md`.

## Previous runtime compatibility board - T413 (closed bounded, 2026-07-27)

T413 closes in `c7214b50`. Root state entry marks typed `stateChangeTmp`,
settles ordinary transitions outside hitpause, and retains the marker through
hitpause until active root advance. Projectile admission consumes it with
`hitTmp` and `actTmp` before HitOverride and damage.

Focused closure passed 5 files / 60 tests, a selected PlayableMatchRuntime
smoke with 2 passed and 318 filtered, `node --check scripts/qa_traces.cjs`,
and diff hygiene. The broad typecheck was deferred by batch policy; the last
known error is the unrelated pre-existing unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`. Claim blocked: exact
`stateChange1`/`stateChange2` order, persistent correction, Explod and sound
cleanup, global pause, Helpers, MUGEN, direct gates, camera, teams/clashes,
global checkpoint, score movement, and full parity. Research:
`docs/research/2026-07-27-ikemen-stchtmp-materialization.md`.

## Previous runtime compatibility board - T412 (closed bounded, 2026-07-27)

T412 closes in `ce6e2b81`. Root fighter advance now materializes IKEMEN
`actTmp` through source-shaped prepare/finish arithmetic: ordinary action
`0 -> 1`, hitpause `-1`, global pause `-2`, and simultaneous signals `-3`.
Active roots and paused root bridges use the live pause query.

Focused closure passed 4 files / 328 tests, `node --check
scripts/qa_traces.cjs`, and diff hygiene. The broad typecheck reaches only the
unrelated pre-existing unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`. Claim blocked: normal
global-hitpause branch, Helper action timing, full `stchtmp` lifecycle, camera gates,
state-change persistence, exact scheduler order, MUGEN, teams/clashes, global
checkpoint, score movement, and full parity. Research:
`docs/research/2026-07-27-ikemen-acttmp-materialization.md`.

## Previous runtime compatibility board - T411 (closed bounded, 2026-07-27)

T411 closes in `9d58730c`. The runtime now materializes IKEMEN `hitTmp` as
`-1|0|1|2`, synchronizes ordinary root fighters after frame mutation, and
marks accepted ReversalDef targets with `-1` from the idle value. HitFlag,
direct air-juggle, and Projectile air-juggle admission consume the explicit
field; missing fields keep the older projection.

Focused closure passed 7 files / 105 tests, `node --check
scripts/qa_traces.cjs`, and diff hygiene. The broad typecheck reaches only the
unrelated pre-existing unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`. Claim blocked: exact source
update order, `acttmp`, `stchtmp`, pause and hitpause persistence, state-entry
reset rules, custom-state or active Helper motion, MUGEN, teams/clashes,
target-list transfer, global checkpoint, score movement, and full parity.
Research: `docs/research/2026-07-27-ikemen-hittmp-materialization.md`.

## Previous runtime compatibility board - T410 (closed bounded, 2026-07-27)

T410 closes in `1ae8a98e`. Helper `inheritjuggle` values `0|1|2` now have
typed compiler and spawn support under `ikemen-go`, with scalar expressions
resolved before the Helper enters the effect world. Direct Helper and
Helper-owned Projectile admission initializes a missing target budget from the
Parent or Root and preserves the already-spent value on later contacts.
MUGEN and unknown profiles strip this field.

Required imported trace:
`synthetic-imported-ikemen-helper-inherit-juggle-golden` proves the root leaves
one point, the Helper Projectile spends that inherited point, a later contact
rejects through `air.juggle`, the Projectile stays active, and final P2 has
`{ p1: 1, p1-helper-0: 0 }` with life `946`. Focused closure passed 7 files /
843 tests, the named trace, `node --check scripts/qa_traces.cjs`, and diff
hygiene. `pnpm typecheck` reaches only the unrelated pre-existing unused
`advanced` at `src/mugen/da32/ClauseAdjudicationSample.ts:149`. Claim blocked:
exact source target-list transfer, live Root mode trace, nested/destroyed
owners, `hittmp`/`acttmp`, MUGEN, teams/clashes, global checkpoint, score
movement, and full parity. Scores stay unchanged. Research:
`docs/research/2026-07-27-ikemen-helper-inherit-juggle.md`.

## Previous runtime compatibility board - T409 (closed bounded, 2026-07-27)

T409 closes in `4395f2dd`. The ordered projectile combat pass now keeps a
pass-local `AP` contact mark for each owner/defender pass. The first accepted
`AP` hit, guard, or HitOverride contact blocks later `AP` projectiles before
HitOverride and damage; non-`AP` projectiles remain eligible and the next pass
starts clear.

Required imported trace:
`synthetic-imported-ikemen-projectile-same-frame-ap-contact-golden` proves
one accepted contact, one same-frame rejection, retained second-projectile
evidence, and final P2 life `983`. Focused closure passed 6 files / 258 tests
with 582 filtered, the named trace, `node --check scripts/qa_traces.cjs`, and
diff hygiene. The broad typecheck was deferred after the batch; its known
unrelated blocker is the pre-existing unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`. Claim blocked: exact
`hittmp`/`acttmp`, pause persistence, MUGEN, teams/clashes, helper ancestry,
`inheritJuggle`, global checkpoint, score movement, and full parity. Scores
stay unchanged. Research:
`docs/research/2026-07-27-ikemen-projectile-same-frame-ap-contact.md`.

## Previous runtime compatibility board - T408 (closed bounded, 2026-07-27)

T408 closes in `0f9dd991`. The T407 Projectile `air.juggle` path now resolves
the budget owner from `RuntimeProjectile.ownerId` for a root-owned
`ownprojectile` Helper. The matching Helper contributes its own
`NoJuggleCheck`; root-owned Helper-parented projectiles continue to use the
root fighter key. Missing Helper records fall back to the root actor.

Required imported trace:
`synthetic-imported-ikemen-helper-projectile-air-juggle-golden` proves the
Helper owner lifecycle, `3`-point spend from `data.airjuggle = 4`, rejection
before HitOverride, active projectile retention, and owner/helper target links.
Focused closure passed 6 files / 255 tests with 582 filtered, the named trace,
`node --check scripts/qa_traces.cjs`, and diff hygiene. `pnpm typecheck` stays
blocked by the unrelated pre-existing unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`. Claim blocked: exact
`hittmp`/`acttmp`, `inheritJuggle`, nested/destroyed owners, MUGEN,
teams/clashes, ModifyHitDef, global checkpoint, score movement, and full
parity. Scores stay unchanged. Research:
`docs/research/2026-07-27-ikemen-helper-projectile-air-juggle.md`.

## Previous runtime compatibility board - T407 (closed bounded, 2026-07-27)

T407 closes in `1899eb97`. Root-owned CNS Projectiles now carry optional
`air.juggle` from compiler through runtime spawn and effect snapshots. Under
`ikemen-go`, admission runs after `HitBy` and before `HitOverride`; falling
contacts spend target `data.airjuggle` points by direct attacker id, later
over-budget contacts reject without contact/removal mutation, and
`NoJuggleCheck` bypasses without spending or resetting attacker `c.juggle`.
MUGEN/unknown profiles and helper/child projectiles retain the prior path.

Required imported trace:
`synthetic-imported-ikemen-projectile-air-juggle-golden` proves direct falling
setup, `4 -> 1` spend, rejection, active projectile retention, and snapshot
`airJuggle = 3`. Focused closure passed 6 files / 253 tests, trace gate,
`node --check scripts/qa_traces.cjs`, and diff hygiene. `pnpm typecheck` is
blocked by the unrelated pre-existing unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`. Claim blocked: exact
`hittmp`, helper/nested ownership, MUGEN branch, teams/clashes, ModifyHitDef,
global gate inheritance, scores, and full parity. Scores stay unchanged.
Research: `docs/research/2026-07-27-ikemen-projectile-air-juggle.md`.

## Historical audit queue — repair gates before DA30-026

Machine control records DA30-025 at HEAD `c2245fe8`. The written DA30 roadmap
still has open clauses in DA30-021, DA30-024, and DA30-025. First adjudicate
those statuses, add clause manifests, rerun the complete formal gate with raw
facts, and prove semantic Play plus Studio/Inspect journeys. Then start
DA30-026 keyboard/gamepad/focus/touch lifecycle.

Keep DA30-027 frame-gap code, DA30-028 renderer baseline, DA30-029 lifecycle
checklist, and DA30-030 security baseline at their current unit/design scope
until live route gates pass. Scores remain held. See the
[post-DA30-025 audit](research/2026-07-27-daily-roadmap-architecture-audit-post-da30-025.md)
and tasks AUD27-01…28.

## Historical recovery queue — DA30-001…010 (proposed, 2026-07-27)

The DA29 completion audit rejects the generated DA29-200 watermark. The
selector and roadmap cursor disagree; 61 R/A cuts closed from generated note
shape and 123 I/G cuts closed through a generic non-empty-result rule. DA29
artifacts remain candidate inputs. Scores stay held. Execute DA30 control and
semantic-evidence repair before runtime work.

Sources: [completion audit](research/2026-07-27-da29-completion-audit-and-da30-recovery.md)
and [120-task DA30 roadmap](DA30_RECOVERY_ROADMAP.md).

## Historical expanded audit - DA29 proposed (superseded, 2026-07-26)

The post-DA28 audit defines 200 cuts in 20 waves. The generated selector still
has an empty queue; **DA29-001** is the next control cut to adopt the first
approved batch. Authority and current-HEAD evidence come before a new runtime
feature. Sources: [expanded audit](research/2026-07-26-expanded-master-roadmap-audit-post-da28.md)
and [master roadmap](MASTER_REVIEW_ROADMAP.md).

## Historical DA28 series - drained (closed-bounded, 2026-07-26)

DA28-01…30 closed. `nextQueue` empty. Report:
`docs/research/2026-07-26-da28-11-30-drain.md`.

## Historical gamepad input - DA28-10 (closed-bounded, 2026-07-26)

Gamepad API polling + App keyboard/gamepad merge.
Report: `docs/research/2026-07-26-da28-10-gamepad-input.md`.

## Historical Turns browser matrix - DA28-09 (closed-bounded, 2026-07-26)

Unit multi-path matrix + desktop/mobile browser gate.
Report: `docs/research/2026-07-26-da28-09-turns-browser-matrix.md`.

## Historical live Turns bridge - DA28-08 (closed-bounded, 2026-07-26)

RuntimeTurnsTransaction receipts around live handoff.
Report: `docs/research/2026-07-26-da28-08-live-turns-bridge.md`.

## Historical live plural oracle - DA28-07 (closed-bounded, 2026-07-26)

Live roots/helpers feed PluralCombatOracle with mutation integrity.
Report: `docs/research/2026-07-26-da28-07-live-plural-oracle.md`.

## Historical live projectiles - DA28-06 (closed-bounded, 2026-07-26)

GlobalProjectileSchedule ordered through EffectActorWorld combat/clash.
Report: `docs/research/2026-07-26-da28-06-live-projectile-schedule.md`.

## Historical P0 evidence - DA28-03/04/05 (closed, 2026-07-26)

Browser subcursors, corpus v1.2, score adjudication hold.
Report: `docs/research/2026-07-26-da28-p0-browser-corpus-scores.md`.

## Historical global re-gate - DA28-02 (closed, 2026-07-26)

Pin `32466c6e`: typecheck, 270/2850 Vitest, 663 traces, build, boundaries.
Report: `docs/research/2026-07-26-global-checkpoint-da28-02.md`.

## Historical DA28-01 adoption (control, 2026-07-26)

DA28-02…30 were adopted into the selector nextQueue. Historical after DA28-02.
Report:
`docs/research/2026-07-26-daily-roadmap-architecture-audit-post-da27-09.md`.

## Historical planning audit - proposed DA28 (docs-only, 2026-07-26)

Entry 602 maps the remaining work after DA27-09 into DA28-01…30. Historical
note: adoption landed in Entry 603.

## Historical Common.Fx + FightScreen - DA27-09 (closed-bounded, 2026-07-26)

Common.Fx/FightFX libraries + fake-`AudioContext` unit dispatch + browser
package, shell, and gesture reachability. Nonzero browser output and heard
hardware audio remain open.
Report: `docs/research/2026-07-26-commonfx-fightscreen-da27-09.md`.

## Historical qa:smoke matrix - DA27-08 (closed, 2026-07-26)

Full `pnpm qa:smoke` green. Report: `docs/research/2026-07-26-qa-smoke-da27-08.md`.

## Historical Turns browser HUD - DA27-07 (closed-bounded, 2026-07-26)

Team mode selector, Turns HUD journey, browser evidence.
Report: `docs/research/2026-07-26-turns-browser-hud-da27-07.md`.

## Historical global re-gate - DA27-06 (closed, 2026-07-26)

Pin `b7d23801`: typecheck, 268/2845 Vitest, 663 traces, build, boundaries.
Superseded by DA28-02 pin `32466c6e`.
Report: `docs/research/2026-07-26-global-checkpoint-da27-06.md`.

## Historical DA27 product wiring (closed-bounded, 2026-07-26)

DA27-01…05 closed: snapshot/journal bridges, envelope facts, dual character
legal journey, package analysis revision bridge. Report:
`docs/research/2026-07-26-da27-product-wiring-batch.md`.

## Historical DA26 ladder - drained (closed-bounded, 2026-07-26)

DA26-01…30 closed under claim ceilings. Report:
`docs/research/2026-07-26-da26-ladder-drain.md`.

## Historical browser gate - DA26-13 (closed-bounded, 2026-07-26)

Desktop/tablet/mobile runtime shell with clean console, contact log, skip link,
and screenshot SHA evidence. Report:
`docs/research/2026-07-26-browser-gate-da26-13.md`.

## Historical studio/oracle/core batch (closed, 2026-07-26)

Closed: DA26-18 PluralCombatOracle, DA26-24 StudioProjectSnapshot, DA26-25
PackageAnalysisRevision diff, DA26-26 SourceWriteJournal, DA26-28 dual
AssetReleasePolicy chains, DA26-30 CommonEvidenceFacts. Report:
`docs/research/2026-07-26-studio-oracle-core-batch.md`.

## Historical runtime/control batch (closed, 2026-07-26)

Closed: DA26-15 Turns transaction, DA26-17 projectile schedule, DA26-22
EvidenceSubject readiness, DA26-23 asset closure, DA26-27 scanner capability
vector, DA26-29 BoundaryManifest. Report:
`docs/research/2026-07-26-runtime-control-batch.md`.

## Historical input policy - DA26-14 bounded (closed, 2026-07-26)

MatchInputPolicySnapshot/v1 covers two seats, deadzone, remap, disconnect, and
deterministic equality. Browser Gamepad API remains open with DA26-13.

Next queue head: **empty** (DA28 drained).

## Historical FightScreen fixture - DA26-12 (closed, 2026-07-26)

Sandbox FightScreen CC0 package ships as folder + ZIP with license, stable
hashes, and loader evidence for round/KO/DKO/draw/time-over/win/skip/fade/
reset/fallback surfaces. Paths: `public/data/sandbox-fightscreen/`,
`public/system/sandbox-fightscreen.zip`. Report:
`docs/research/2026-07-26-sandbox-fightscreen-fixture.md`. Scores do not move.

## Historical authority selector - DA26-11 (closed, 2026-07-26)

Single live selector: [docs/AUTHORITY_SELECTOR.md](AUTHORITY_SELECTOR.md) and
`docs/evidence/authority-selector-v1.json`. formal/global remain `7d9b15f8`.
Docs and issues 01–07 point at the selector. Reference auditor:
`pnpm audit:authority-references`.

## Historical source authority - DA26-10 Epoch/Manifest v1 (closed, 2026-07-26)

SourceAuthorityEpoch/v1 records pins `05b7d98a` and `4aa0ba38` with per-family
status. Juggle is `same` under pin-era equality; other families start
`unreviewed`. Manifest v1 wraps the epoch and points at legacy v0 without
inheriting its claims. Artifact:
`docs/evidence/source-authority-epoch-v1.json`. ADR 0054. Report:
`docs/research/2026-07-26-source-authority-epoch-v1.md`. Scores do not move.

## Historical control cursor - DA26-09 RoadmapCursor/v1 (closed, 2026-07-26)

RoadmapCursor/v1 stores the seven control cursors with branch, scores, dirty
exclusions, and per-cursor SHA/date/artifact/claimLimit. Freshness evaluation
distinguishes `current`, `stale`, and `mismatch`. formal/global pin DA26-08
gate `7d9b15f8`. Artifact: `docs/evidence/roadmap-cursor-v1.json`. Report:
`docs/research/2026-07-26-roadmap-cursor-v1.md`. Scores do not move.

## Historical global checkpoint - DA26-08 after T406 (closed, 2026-07-26)

Global gate green at **`7d9b15f8`**. TypeScript 7, full Vitest
(**242 files / 2768 tests**), aggregate traces (**663/663**, 629 required /
34 optional), production build (332 modules; JS 2136.15 kB / gzip 534.28 kB),
`check:boundaries`, and `check:redirect-boundary` all passed. RoadmapCursor
`formal`/`global` pin this SHA and must not track later feature tips. This
replaces T383 as the latest global runtime cursor. Scores do not move. Browser
smoke is N/A for this batch. Report:
`docs/research/2026-07-26-global-checkpoint-after-t406.md`.

## Historical runtime compatibility board - T406 (closed, 2026-07-26)

T406 closes in `07ad9227` (DA26-01..07 / Phase 0 after the post-T405 audit). The
incomplete StateDef juggle write-set that landed inside `c62eabe5` is owned and
finished:
StateDef `juggle` parses and merges, active `runtime.juggle` arms from StateDef
entry and explicit HitDef `air.juggle` under `ikemen-go`, omitted HitDef fields
leave the prior cost, IKEMEN non-A entry resets, falling contact zeros cost,
and JuggleTrace snapshots carry origin plus remaining points. The T405 direct
rejection sequence still holds. Official pin matrix:
`docs/research/2026-07-26-ikemen-juggle-official-matrix.md`. Closeout:
`docs/research/2026-07-26-ikemen-statedef-hitdef-juggle.md`.

Claim allowed: named StateDef/HitDef direct active-cost path under `ikemen-go`
with focused tests and the required air.juggle artifact. Claim blocked:
Projectile/Helper juggle, ModifyHitDef air.juggle, full tick-order parity,
global gate inheritance from T383, and any score movement.

Verification: focused juggle/combat/HitDef/state-entry/parser/compiler suites
and the required direct air.juggle trace pass; DA26-08 later ran the full global
gate on `7d9b15f8`. Scores stay `65 / 36 / 20 / 10-12 / 6-8 / 25`.

## Previous runtime compatibility board - T405 (closed, 2026-07-23)

T405 closes in `462591ad`. Pinned IKEMEN source stores target juggle points by
attacker id, defaults the target budget to `data.airjuggle`, and admits an
IKEMEN direct contact below falling `hittmp` even when its cost exceeds the
saved points. Static normal direct HitDef `air.juggle` now reaches local move
metadata. Under explicit `ikemen-go`, the runtime starts a target budget at 15
when data omits it, retains the remaining value by attacker id, rejects an
over-budget falling contact, and lets `NoJuggleCheck` bypass it without a
deduction. Required imported trace evidence proves a 4 point target becomes
1 after a 3 point hit, rejects the next 3 point contact, then accepts the
bypass and ends at life 966. StateDef character juggle, omitted-cost
persistence, attack-state resets, ModifyHitDef, Projectile/Helper routes,
target membership, timing, and full parity remain deferred.

Verification: focused Juggle, combat-resolution, compiler, HitDef, and
match-bridge coverage passes 5 files / 130 tests. The focused required trace
passes 1 test with 647 skipped by its name filter. Trace-script syntax and
diff hygiene pass. The accumulated TypeScript 7 gate, full Vitest, aggregate
traces, build, and boundaries remain queued. See
`docs/research/2026-07-23-ikemen-direct-air-juggle.md`.

Next: audit the source character `juggle` value and StateDef handoff, or take
the accumulated global checkpoint after a larger runtime batch.

## Previous runtime compatibility board - T404 (closed, 2026-07-23)

T404 closes in `c12f54e3`. Pinned IKEMEN source delegates `hitonce` through
root ModifyHitDef to one active normal receiver and consumes it after direct
contact. Static numeric values now mutate only that field in place: zero clears
it and a nonzero value sets it. Direct admission, equal-priority preparation,
and priority lookup reject the consumed move. Required imported Tag RedirectID
trace evidence proves P4 reaches two opposing active roots, damages P1 for 37,
and leaves P3 at full life. Dynamic values, throw defaults, target dropping,
exact target membership, `air.juggle`, Projectile/Helper routes, timing, and
full parity remain deferred.

Verification: focused compiler, HitDef, combat-resolution, direct-combat, and
trace-preset coverage passes 5 files / 794 tests. Trace-script syntax and diff
hygiene pass. The accumulated TypeScript 7 gate, full Vitest, aggregate traces,
build, and boundaries remain queued. See
`docs/research/2026-07-23-ikemen-modifyhitdef-hitonce.md`.

Next: audit `air.juggle` as its own source-backed model, or reserve the global
checkpoint for a larger accumulated batch.

## Previous runtime compatibility board - T403 (closed, 2026-07-23)

T403 closes in `799749b3`. Pinned IKEMEN source delegates `fall.kill` through
root ModifyHitDef to one active normal receiver and registers it as a boolean
HitDef field. Static numeric values now mutate only that fall field in place:
zero clears it and a nonzero value restores it. Required imported RedirectID
trace evidence proves a receiver with fall enabled and 2000 deferred damage
leaves its target at one life after `HitFallDamage` consumes `fall.kill = 0`.
Dynamic values, other fall fields, `air.juggle`, exact source boolean/default
behavior, Projectile/Helper routes, timing, and full parity remain deferred.

Verification: focused compiler, HitDef, and trace-preset coverage passes 3
files / 730 tests. Trace-script syntax and diff hygiene pass. The accumulated
TypeScript 7 gate, larger focal batch, full Vitest, aggregate traces, build,
and boundaries remain queued. See
`docs/research/2026-07-23-ikemen-modifyhitdef-fall-kill.md`.

Next: select the next source-pinned shared field or reserve the global
checkpoint for a larger accumulated batch.

## Previous runtime compatibility board - T402 (closed, 2026-07-23)

T402 closes in `a0b3617a`. Pinned IKEMEN source delegates `kill` and
`guard.kill` through root ModifyHitDef to one active normal receiver and
registers both as boolean HitDef fields. Static numeric values now mutate only
the supplied fields in place: zero clears them and a nonzero value restores
them. Required imported traces prove a redirected `kill = 0` clamps 2000
direct damage at one life, while `guard.kill = 0` clamps 2000 guarded damage
at one life. The Tag setup in the guard trace only routes input to its
defender; it does not claim team behavior. Dynamic values, exact source
boolean/default behavior, Projectile/Helper routes, timing, and full parity
remain deferred.

Verification: focused compiler, HitDef, direct-combat, combat-resolution,
reversal, imported-route, and trace-preset coverage passes 8 files / 1151
tests. TypeScript 7, trace-script syntax, and diff hygiene pass. Full Vitest,
aggregate traces, build, and boundaries remain queued. See
`docs/research/2026-07-23-ikemen-modifyhitdef-kill.md`.

Next: select another source-pinned shared field or reserve the global
checkpoint for a larger accumulated batch.

## Previous runtime compatibility board - T401 (closed, 2026-07-23)

T401 closes in `e21ae170`. Pinned IKEMEN source evaluates HitDef priority as
an integer, permits negative IKEMEN values, and delegates root ModifyHitDef
fields through one active normal receiver. Static `priority = value[, H|M|D]`
now mutates that move in place. Shared direct activation and clash comparison
retain finite truncated values instead of the former `0..10` and `1..7`
clamps. Required imported trace evidence proves RedirectID changes a receiver
from `-4` to priority `12`, which defeats priority `8` at direct contact.
Dynamic values, exact source integer overflow, broad priority-type behavior,
aliases, Projectile/Helper routes, timing, and full parity remain deferred.

Verification: focused compiler, HitDef, direct-combat, combat-resolution,
reversal, imported-route, and trace-preset coverage passes 8 files / 1149
tests. TypeScript 7, trace-script syntax, and diff hygiene pass. Full Vitest,
aggregate traces, build, and boundaries remain queued. See
`docs/research/2026-07-23-ikemen-modifyhitdef-priority.md`.

Next: select another source-pinned shared field or reserve the global
checkpoint for a larger accumulated batch.

## Previous runtime compatibility board - T400 (closed, 2026-07-23)

T400 closes in `f846e862`. Pinned IKEMEN source delegates root ModifyHitDef
sprite-priority fields to one active normal receiver and evaluates both as
integers. Static `p1sprpriority` and `p2sprpriority` now mutate that move in
place. Required imported trace evidence proves a RedirectID mutation changes
the receiver-to-target accepted hit priorities to authored `5/-4` with
role/provenance telemetry. Dynamic values, aliases, omitted/default policy,
collision priority, Projectile/Helper routes, renderer ordering, timing, and
full parity remain deferred.

Verification: focused compiler, HitDef, direct-combat, CombatResolver,
reversal, imported-route, and trace-preset coverage passes 7 files / 1109
tests. TypeScript 7, trace-script syntax, and diff hygiene pass. Full Vitest,
aggregate traces, build, and boundaries remain queued. See
`docs/research/2026-07-23-ikemen-modifyhitdef-sprite-priority.md`.

Next: select another source-pinned shared field or reserve the global
checkpoint for a larger accumulated batch.

## Previous runtime compatibility board - T399 (closed, 2026-07-23)

T399 closes in `cb21362e`. IKEMEN's shared HitDef route assigns static
`p1stateno`, then `p2stateno`, defaults `p2getp1state` to true, and allows an
explicit value to replace that default. The active normal root receiver now
keeps that source order under `ikemen-go`. Dynamic input, source-range
behavior, Projectile/Helper, timing, and full parity remain deferred.

Verification: focused compiler, HitDef, direct-combat, CombatResolver,
reversal, and imported route coverage passes 6 files / 467 tests. TypeScript
7, trace-script syntax, and diff hygiene pass. Full Vitest, aggregate traces,
build, and boundaries remain queued. See
`docs/research/2026-07-23-ikemen-modifyhitdef-target-state.md`.

Next: select another source-pinned shared field or reserve the global
checkpoint for a larger accumulated batch.

## Previous runtime compatibility board - T397-T398 (closed, 2026-07-23)

T397-T398 close in `3239e0f0`. Pinned IKEMEN source delegates root
ModifyHitDef `attr`, `guardflag`, `hitflag`, `id`, and `chainid` into the
active normal receiver's shared HitDef. Static fields now mutate only supplied
move filters and identity in place; a field-only update retains damage,
contact state, and receiver identity. Dynamic input, other fields,
Projectile/Helper routes, exact timing, and full parity remain outside this
cut.

Verification: focused compiler, HitDef, direct-combat, CombatResolver,
reversal, and imported route coverage passes 6 files / 467 tests. TypeScript
7, trace-script syntax, and diff hygiene pass. Full Vitest, aggregate traces,
build, and boundaries remain queued. See
`docs/research/2026-07-23-runtime-modifyhitdef-fields-t397-t398-closeout.md`.

Next: select a new source-pinned runtime frontier or accumulate a larger
compatibility batch before the next global checkpoint.

## Previous runtime compatibility board - T394-T396 (closed, 2026-07-23)

T394-T396 close in `c8676b20`. Pinned IKEMEN source carries shared HitDef
`numhits` through ReversalDef, ModifyReversalDef, and ModifyHitDef. Static
integer input now adds authored state-scoped received hits for direct and
reversal contact, while root ModifyHitDef updates one active normal HitDef in
place through RedirectID. FightScreen combo display and score stay outside
this cut.

Verification: focused compiler, contact-memory, direct-combat, reversal,
HitDef, and imported-route coverage passes 6 files / 459 tests. TypeScript 7,
trace-script syntax, and diff hygiene pass. Full Vitest, aggregate traces,
build, and boundaries remain queued. See
`docs/research/2026-07-23-runtime-numhits-t394-t396-closeout.md`.

Next: select a new source-pinned runtime frontier or accumulate a larger
compatibility batch before the next global checkpoint.

## Previous runtime compatibility board - T391-T393 (2026-07-23)

T391 `a9837e49` carries static ReversalDef `p2getp1state` into active state
metadata. T392 `3bb7fc3c` carries static HitDef `ignorereversaldef` into the
active move and skips direct plus equal-priority reversal admission. T393
`a9837e49` carries static `p2facing` through ReversalDef and root
ModifyReversalDef, using the reverser's facing captured before p1 state entry.
`aa992740` proves the imported target-owned state route, direct opt-out, and
activation plus RedirectID target-facing routes.

Focused compiler, HitDef, reversal, combat, imported-match, and matcher
coverage passes 6 files / 478 tests. TypeScript 7 typecheck, trace-script
syntax, and diff hygiene pass. Full Vitest, aggregate traces, build, and
boundaries remain queued. Dynamic expressions, Projectile/Helper routes,
reversal clashes, deferred source facing and hitpause order, renderer work,
and full parity remain outside this claim.

Next: audit one inherited ReversalDef field with direct source behavior that
does not depend on the deferred facing route, or isolate that scheduler order
before widening target-facing coverage.

## Previous runtime compatibility board - T388 (2026-07-22)

T388 `b245afb0` adds static `p1sprpriority` and `p2sprpriority` across
ReversalDef activation and active root ModifyReversalDef RedirectID. The
accepted reversal calls the same profile-aware priority policy as direct
HitDef contact, with the reverser as p1 and incoming attacker as p2. Required
trace evidence proves root mutation changes `4/-3` to `5/-4` before counter
contact and preserves authored role/provenance telemetry. Dynamic values,
aliases, omitted IKEMEN default-policy claims, HitOverride arbitration,
Helpers as receivers, renderer ordering, teams, source timing, and full parity
remain outside the current claim.

## Global runtime checkpoint after T383 (2026-07-22)

The grouped T381-T383 runtime checkpoint closes at `38d62678`. TypeScript 7,
full Vitest (241 files / 2706 tests), Trace QA (650 artifacts: 616 required and
34 optional), the 329-module production build, repository boundary,
redirect-boundary, and diff hygiene pass. The checkpoint repaired the deferred
ModifyReversalDef `ControllerOp` union and hook-set fixture type debt. Browser
smoke is N/A for this runtime-only batch; scores stay unchanged. See
`docs/research/2026-07-22-global-checkpoint-after-t383.md`.

## Previous runtime compatibility board - T383 (2026-07-22)

T383 closes the local core `ModifyReversalDef RedirectID` continuation in
`739ac163`. A valid caller expression can patch one verified active root
reversal with any supplied static `reversal.attr`, first `pausetime` value,
`p1stateno`, `id`, and `attack.depth`. The receiver keeps move identity,
contact state, frame/control state, and telemetry. The required core trace
proves changed attack depth admits receiver-owned counter contact, then changed
state and target metadata take effect. Focused runtime coverage passes 7 files
/ 1051 tests. Scores stay unchanged.

Allowed claim: static root-to-root core ModifyReversalDef mutation through a
caller-evaluated RedirectID under explicit `ikemen-go`. Blocked: `p2stateno`,
`p2getp1state`, guard fields, all other inherited HitDef fields, dynamic
payloads, exact scheduler/hitpause behavior, Helpers, custom states, teams,
rollback/netplay, renderer work, and full MUGEN/IKEMEN parity. The grouped
typecheck, full Vitest, trace aggregate, build, and boundary checkpoint passed
at `38d62678`.

## Previous runtime compatibility board - T382 (2026-07-22)

T382 closes root `ModifyReversalDef RedirectID` in `0f30280e`. A valid caller
expression now resolves one verified IKEMEN root and patches only its existing
reversal with static `reversal.attr`. The receiver keeps move identity, active
frame, contact state, reversal timing/state payload, control, and telemetry.
The required trace proves the modified receiver-owned counter contact; focused
runtime coverage also proves `var(0)` selection and missing active-reversal or
unsupported paths block before mutation. The focal gate passes 7 files / 1050
tests. Scores stay unchanged.

Allowed claim: static root-to-root `ModifyReversalDef` attr mutation through a
caller-evaluated RedirectID under explicit `ikemen-go`. Blocked:
`reversal.guardflag`, `reversal.guardflag.not`, inherited HitDef fields,
dynamic payloads, exact scheduler/hitpause behavior, Helpers, custom states,
teams, rollback/netplay, renderer work, and full MUGEN/IKEMEN parity. Typecheck,
full Vitest, trace aggregate, build, and boundary checks remain deliberately
queued for the next runtime batch.

## Historical implementation board - T288 / Entry 562 (2026-07-18)

T288 closes the bounded imported FightScreen character-reset path in
`a12a2672`: the source-shaped shutter edge is consumed before the active
fighter pass, roots return to stage starts and state `0`, transient state and
command history clear, and owner-scoped effects are removed. Persistent round
resources, variables, team state, and compatibility history remain. Focused
evidence is 5 files / 392 tests plus TypeScript 7 and diff hygiene; the broad
checkpoint is pending. Scores do not move. Next board item is
announcement/display ownership.

## Previous implementation board - T287 / Entry 561 (2026-07-18)

T287 closes the bounded imported FightScreen shutter/skip path in
`4d615c8f`: `shutter.time`/`shutter.col` parse, new hard-button edges request
skip, raw `roundnotskip` rejects it, `RuntimeRoundShutter/v0` exposes the
countdown, and Three.js renders symmetric bars. Evidence is focused 4 files /
300 tests plus TypeScript 7.0.2, full 233 / 2484 tests, Vite 317 modules,
633/633 traces, boundaries, CSS budget, and 64 browser paths with no
console/page errors. Scores do not move. Next board item is announcement/
display ownership or independent character control/reset.

## Previous implementation board - T286 / Entry 560 (2026-07-18)

T286 closes the bounded imported FightScreen round-intro timing path in
`e978fa3c`: `start.waittime` and `ctrl.time` parse, publish
`RuntimeRoundIntro/v0`, drive `pre-intro` -> `intro` -> `fight`, and hold the
live timer and finish decision until `fight`. Missing fields preserve the
legacy immediate route. Evidence is focused 3 files / 289 tests plus TypeScript
7.0.2, full 233 / 2480 tests, Vite 316 modules, 633/633 traces, boundaries,
CSS budget, and 64 browser capture paths with no console/page errors. The
existing build warning is non-blocking; scores do not move. Next board item is
announcement/shutter/skip ownership or independent character breadth.

## Historical cross-lane reconciliation - post-T268 (2026-07-18)

Runtime HEAD `b241cc65` closes T266-T268; concurrent working-tree roadmap edits
still contain open Wayfinder 257 and are not a closeout. Entry 555 and the
post-Wayfinder-256 audit remain historical control references.
Wayfinders 230-256 close the previously queued policy/evidence/redirect/global
state/common source/input slices at bounded scope. T266-T268 add source
authority metadata, stateful SOCD, and authority diagnostics. Latest declared
evidence is 231/231 files, 2435/2435 tests, and 633/633 traces. Scores do not
move.

P0 is now source authority plus evidence residuals: reconcile normative
`05b7d98` against local `044da720`, classify semantic deltas, choose match-level
input config ownership, rebuild current corpus facts, and obtain Common.Fx
browser proof. Follow with round/Turns/projectile
determinism, a second character-centered legal journey, persisted reanalysis,
one releaseable project, and non-vacuous modular extraction. See
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.

## Historical cross-lane reconciliation - post-Wayfinder 229 (2026-07-16)

Audited HEAD `83f85bae`, Entry 555, and Wayfinder 229 are the current control
tuple. Wayfinders 210-229 close AffectTeam/depth, corpus v1.1 and the second
legal stage route, GateEvidence/write receipts, PackageAnalysis v1/multikind,
and asset permission/path hygiene. Scores remain unchanged. The next ordered
cuts are evidence revision binding and snapshot-claim adjudication;
redirected lease/ADR; atomic Turns/round phases; global projectile order;
second character-centered breadth; scanner reanalysis; and non-vacuous
evidence boundaries. AssetReleasePolicy/v0 is now closed at bounded scope:
Nova is the only fresh ZIP-ready record and blocked records remain diagnostic.
See
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md`.

## Current asset release checkpoint - T29 (2026-07-16)

`AssetReleasePolicy/v0` is integrated into Studio Assets, Build Readiness,
Trust Chain, diagnostics, project manifest, and required ZIP export. The final
browser smoke passes in 398.9s with 0 page/console errors. Policy evidence is
fail-closed for missing, failed, unknown, stale, or non-fresh required facts;
Nova is `ready`/`canRelease: true`, while 9 records are diagnostic-only.
This does not authorize legal/commercial use, imported MUGEN credit, IKEMEN
execution, parity, or a score move.

## Current license-expression checkpoint - T28 (2026-07-16)

`mugen-web-sandbox/spdx-expression-subset/v0` is now the explicit shared
syntax boundary for permission and provenance. It accepts identifier,
`AND`, and `OR` forms only; unsupported normative SPDX forms block release.
Metadata and ZIP smoke expose the profile. Focused 16/16, TypeScript 7,
asset hygiene, and full browser smoke pass. No full SPDX conformance or legal
license claim is made.

## Historical numbered runtime closeout - Entry 555 (2026-07-16)

`c068de80` closes bounded `ProjTypeCollision` semantics: typed flag capability,
strict projectile `Clsn2`, `HitFlag = P` cancellation, and paired-player
`Clsn2` direct/priority admission. Focal 110/110, TypeScript 7, build,
boundaries, and `qa:trace` 633/633 pass. Scores stay unchanged. Wayfinder 209
then closed the bounded projectile trade-box and remaining `p2clsn*` selector
cut. The latest report records 2262/2263 full-suite tests with one residual
scheduling-contract failure.

## Historical daily architecture reconciliation - post-Wayfinder 209 (2026-07-16)

Audited HEAD `90ab79b7` is 38 commits after the prior `05d85137` cursor. Entry
555 is the maximum numbered entry and Wayfinder 209 is the later unnumbered
checkpoint. No score moves. First restore the full-suite/control/source-pin
baseline; then harden CompatibilityCorpusSnapshot freshness and prove one
second repository-authored CC0 route. Runtime risk order is redirected lease
v1.1 before ADR 0006 acceptance, atomic Turns, State 5900 provenance and
RuntimeRoundPhase, then projectile affectteam/depth/exact order. Studio,
scanner, asset, and modular trust gates stay separate. See
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.

## Historical daily architecture reconciliation - post-Entry-554 (2026-07-15)

Entry 554 is still the maximum numbered ledger entry. The real committed branch
continued to audited HEAD 05d85137, where the latest report declares 633/633
traces, 599 required and 34 optional. This is an unnumbered report frontier,
not permission to create retrospective Entries 555 onward. The post-554 chain
closes bounded root/helper Target and binding RedirectID variants through
auxiliary Target resources. Helper-destination TargetState, root-to-helper
policy, recursive redirects, exact target ordering, Turns atomicity, State
5900 source policy, and dynamic RoundState remain open.

Scores stay 65 / 36 / 20 / 10-12 / 6-8 / 25. Prioritize: reconcile control
truth; materialize corpus v1; add independent legal breadth; decide proposed
ADR 0006 and characterize dispatch; make Turns transactional; then close
Studio, scanner, asset, and shared-Evidence trust gates. See
docs/research/2026-07-15-daily-roadmap-architecture-audit-post-entry-554.md.
All older active/next selectors in this file are historical when they conflict
with this override.

## Historical daily reconciliation - Entry 549 (2026-07-15)

Entry 549 is the committed cursor and declares 610/610 traces. Root-only
RedirectID is closed through active-CNS TargetPowerAdd; the dirty State -1
follow-up is reserved and is not evidence. Entries 539-542 also close the old
StudioSemanticDraft, PackageAnalysis/v0, and AssetProvenance/v2 selectors. No
score moves in this planning pass.

After the reserved closeout: materialize CompatibilityCorpusSnapshot/v1;
extract a redirected-target dispatch seam; add active TargetLifeAdd RedirectID;
make Turns preflight/commit atomic; decide state-5900 policy and model
RoundState; replace hardcoded Studio greens with GateEvidenceResult/v0; surface
PackageAnalysis/v1; prove one complete asset release record; then promote the
evidence model as the first real shared contract. See
`docs/research/2026-07-15-daily-roadmap-architecture-audit-entry-549.md`.

## Latest score adjudication - Entry 530 (2026-07-14)

Entry 530 applies the written `36-55` practical MVP criterion to the expanded
corpus. Passed local official KFM common movement/attack/guard/get-hit/fall/
recovery routes plus visible reports meet the bounded threshold, so Practical
MUGEN compatibility moves from 35 to 36/100. All other scores remain
unchanged. This is the first point of the band, not public breadth or parity.
See `docs/reports/2026-07-14-score-band-adjudication-entry-530.md`.

## Latest implementation closeout - CompatibilityCorpus/v0 (2026-07-14)

Entry 525 adds the normalized package-level compatibility index. Required legal,
portable legal, and optional private classes stay separate; missing required
journeys, duplicate identities, unverified licenses, claim drift, and checksum
tampering fail closed. The broad suite passes 210 files / 2125 tests, TypeScript
7 build, boundaries, CSS budget, and 600/600 traces. Scores do not move. The
next R1 gate is written score-band adjudication, followed by one independent
legal stage/package route.

## Latest implementation closeout - sequential round context (2026-07-14)

Entry 518 preserves the live round counter during the next-round reset,
publishes bounded per-root `RoundNo`/`RoundsExisted`/`MatchOver` CNS context,
and proves two imported KO transitions through rounds 1 -> 2 -> 3. Required
traces pass 600/600 (566 required / 34 optional); 207 files / 2102 full-suite
tests, TypeScript 7, build, boundaries, CSS budget, and desktop/mobile/Studio
smoke are green. Scores do not move. The next I2 gate is automatic
Turns decision -> handoff -> resource reset -> state 5900 -> continuation.

## Latest implementation closeout - match outcome and state 5900 (2026-07-14)

Entry 517 closes the reserved match-outcome/state-5900 slice. The runtime now
tracks bounded side wins and draws, blocks next-round application after the
configured match-win threshold, preflights imported state 5900, enters
available roots after a successful reset, and exposes score/control state in
Runtime. Required traces pass 599/599 (565 required / 34 optional), with
TypeScript 7, build, boundaries, CSS budget, and desktop/mobile/Studio smoke
green. Scores do not move. The next I2 gate is atomic 1 -> 2 -> 3 continuity
with per-actor `RoundsExisted`, followed by automatic Turns continuation.

## Latest planning reconciliation - entry 516 (2026-07-14)

Entry 517 is the latest committed closeout and declares 599/599 traces with no
score movement. Entries 511-517 close the formerly selected dizzy defaults,
scaling and break work plus red-life LifeShare, lifecycle, HUD, and first
post-KO resource reset, match outcome, and state-5900 transition. Do not select
those gates again.

The product lane remains `CompatibilityCorpus/v0 -> score adjudication ->
independent legal stage/package`. Match-outcome and state-5900 are now closed by
Entry 517. The next I2 successor is an atomic 1 -> 2 -> 3 transition with
per-actor `RoundsExisted`, followed by automatic Turns continuation. Studio
semantic preflight, provenance v2, package analysis, and modular extraction
remain separate lanes. See
`docs/reports/2026-07-14-match-outcome-state-5900.md`.

## Latest implementation closeout - exact red-life round reset (2026-07-14)

Entry 516 adds an explicit post-KO next-round boundary backed by
`RuntimeRoundResourceResetSystem/v0`. Life is restored according to Single/
Tag/Turns policy, power/guard/dizzy carry within maxima, red-life becomes zero,
variables and match tick remain continuous, and round 2 is visible through the
runtime API/UI. The required imported trace proves pre-KO red-life, the full
post-KO window, round 2, zero red-life, and a complete tick schedule. Focused
resource/round/trace coverage is 592/592; the Playable/trace set is 778/778;
TypeScript 7, build, 598/598 traces, boundaries, CSS, and browser smoke pass.
Next: exact match-over/round-outcome ownership and state-5900 sequencing;
scores remain unchanged.

## Latest implementation closeout - red-life HUD presentation (2026-07-14)

Entry 515 adds the bounded runtime-owned recoverable-life meter to solo and
IKEMEN team HUD paths. `RuntimeTeamRoundLifebar/v0` emits normalized red-life
values per slot, the App binds every bar to its actor/slot id, and P2 meters
remain right-aligned. Focused 17/17 tests, TypeScript 7, build, 597/597 trace
artifacts, architecture/CSS gates, and desktop/mobile Playwright smoke pass.
Next: exact multi-round persistence and independent compatibility adjudication;
screenpack/motif ownership and full HUD parity remain separate.

## Latest implementation closeout - red-life lifecycle rebind (2026-07-14)

Entry 514 closes the bounded imported red-life lifecycle edge. Typed team
handoff now reconciles the root-only red-life bank immediately, standby/active
changes preserve the bank topology, and match reset rebinds shared value from
the representative root. Focused lifecycle, handoff, and trace coverage is
588/588 tests. The accumulated gate is green with 203/203 test files and
2082/2082 tests under `--maxWorkers=4`, TypeScript 7 typecheck, production
build, 597/597 trace artifacts, architecture boundaries, CSS budget, and
desktop/mobile Playwright smoke. The default unconstrained ZIP round-trip
test remains a worker-level nondeterminism risk; the bounded worker command is
the reproducible gate. Next: exact multi-round persistence as an independent
gate.

## Latest implementation closeout - red-life LifeShare root adapter (2026-07-14)

Entry 513 closes the bounded imported IKEMEN `TeamLifeShare` red-life route.
`RuntimeRedLifeShareSystem/v0` keeps shared team red-life separate from the
existing life/power bank, mirrors root mutations only in explicit shared
IKEMEN matches, preserves actor-local values in local mode, applies the
current-life/life-max clamp, and clears a KO side's red-life. Required shared,
local, and Helper-local artifacts pass inside the focal 611/611 test set. The
global corpus, TypeScript 7, build, and repository gates remain batched. Next:
red-life reset/persistence, then HUD/resource-bar presentation as independent
gates.

## Latest implementation closeout - dizzy break transition (2026-07-14)

Entry 512 closes the bounded imported direct-hit transition from a positive
dizzy resource to the available common `StateDizzy` `6565300` / `AnimDizzy`
`5300`. Explicit `p2stateno`, unavailable states, repeated zero-floor hits,
sharing, reset/persistence, HUD, and full parity remain separate gates. The
required focused artifact and transition tests are green; the global corpus
and full repository gates remain batched. Next: red-life `LifeShare`, then
dizzy reset/persistence and presentation as independent gates.

## Latest implementation closeout - dizzy-points defaults and AttackMulSet (2026-07-14)

Entry 511 closes omitted direct HitDef dizzy defaults from authored normal and
Super multipliers, plus dedicated `AttackMulSet.DizzyPoints` scaling before
defender defence scaling. The two required focused artifacts are green; the
global corpus and full repository gates remain batched for the next checkpoint.
Next: dizzy break transition policy, then red-life `LifeShare`, reset/persistence,
and presentation as separate gates.

## Latest implementation closeout - dizzy-points suppression (2026-07-14)

Entry 510 closes defender-owned `AssertSpecial NoDizzyPointsDamage` for
explicit direct HitDef `dizzypoints`. Required checksum `29e75f2a` passes inside
591/591 traces; 23 focal tests pass across four files. Full repository gates
remain batched for the next implementation round. Scores remain unchanged.
Next: omitted dizzy defaults and `AttackMulSet` dizzy scaling, then dizzy break
policy and red-life LifeShare as separate gates.

## Previous implementation closeout - dizzy-points runtime (2026-07-14)

Entry 509 closes bounded actor-local dizzy points: authored max/life fallback,
fighter/Helper initialization, `DizzyPointsAdd`/`DizzyPointsSet`, explicit
direct HitDef values, signed scaling, projection, and trace evidence. Required
checksum `00d3b052` passes inside 590/590 traces. Full verification passes 201
files / 2061 tests, TypeScript 7, a 280-module build, boundaries, CSS QA, and
diff hygiene. Scores remain unchanged. Next: default/suppression and break
policy, then red-life LifeShare and reset/persistence as separate gates.

## Previous implementation closeout - auxiliary resource projection (2026-07-14)

Entry 508 adds `RuntimeAuxiliaryResourceProjection/v0` to explicit IKEMEN
snapshots/traces. Roots and Helpers publish actor-local red-life and guard-point
owners/maxima, dizzy-point unavailability, suppression status, deterministic
identity ordering, and normalization diagnostics. Projectile/Explod actors are
excluded and the contract stays outside behavior checksums. Full verification
passes 201 files / 2056 tests, TypeScript 7, a 280-module build, 589/589 traces,
boundaries, CSS QA, and diff hygiene. Scores remain unchanged. Next:
dizzy-point state/mutation as a separate gate, then reset/persistence before
automatic Turns continuation.

## Latest implementation closeout - guard-points ownership (2026-07-14)

Entry 507 closes the bounded actor-local guard-points route. Explicit direct
HitDef `guardpoints` values preserve signed attack/defence scaling, while
`GuardPointsAdd`/`GuardPointsSet` use authored `[Data] guardpoints` maxima with
life fallback and clamping. Required trace `b4942998` proves p2 `1000 -> 988`
and p1 controller writes ending at `900`. Full verification passes 200 files /
2052 tests, TypeScript 7 typecheck, 279-module production build, 589/589
trace artifacts (555 required / 34 optional), boundaries, CSS QA, and diff
hygiene. Browser smoke is N/A because no visible surface changed. Next
auxiliary-resource decision remains read-only projection, followed by dizzy
points, reset/persistence, and HUD as separate gates; scores remain unchanged.

## Previous planning closeout - entry 505 reconciliation (2026-07-14)

Numbered backlog maximum 505 is current committed truth; the entry-505 report declares 587/587 trace artifacts and full implementation gates green. Entries 477-505 closed the complete 2026-07-13 selector plus bounded Studio source/provenance work, team round/handoff/lifebar/life-power banks, and Helper-local life/power. The scores remain unchanged.

Primary order now: `CompatibilityCorpus/v0` -> explicit score-band adjudication -> one independent legal stage/package route. In parallel, Studio may add an in-memory semantic source-draft preflight over the existing folder transaction. I2 has closed the read-only auxiliary-resource projection; dizzy points, red life, HUD, reset/persistence, and automatic Turns continuation remain separate dependent gates. See `docs/research/2026-07-14-auxiliary-resource-projection.md`.

## Latest implementation closeout - persistent source handle recovery (2026-07-13)

Entry 493 adds the bounded `SourceHandle/v0` Studio lane. ZIP source handles
can be remembered through IndexedDB when the browser supports structured-clone
handles, queried/requested for read permission, and used to recover a missing
source package through the existing fingerprinted `SourceTransaction/v0`
boundary. The bridge and Build Center expose explicit `not-linked`,
`not-requested`, `granted`, `stale`, and recovery states. Folder recovery,
source writes, background reacquire, and compatibility scores remain blocked;
this is Studio trust-chain progress, not MUGEN/IKEMEN parity.

## Latest planning closeout - daily architecture reconciliation (2026-07-13)

Numbered backlog maximum 476 is current committed truth: the repo declares 576/576 traces, 545 required, after the legal MUGEN-lite journey, bounded post-KO/`NoKOSlow`, and the active-root direct contact/priority/reversal/depth/HitOverride/guard sequence. Wayfinder 127 is open uncommitted work for a fixture-owned air-guard landing and must not be claimed by this docs pass.

After that independent cut closes, prioritize `CompatibilityJourney/v1`, explicit MUGEN-lite milestone/score adjudication, and a materially independent repository-owned package or ACT/palette route before more I2 micro-matrix breadth. Global AssertSpecial ownership is the next I2 architecture decision before team KO/Helper/Projectile widening. Scores remain unchanged. See `docs/research/2026-07-13-daily-roadmap-architecture-audit.md`.

## Previous planning closeout - daily architecture reconciliation (2026-07-12)

Entry 411 closes Wayfinder 105 plural X/Width body push in the current working tree; its report declares exact non-Tag preservation, fresh diagnostics, schema alignment, 177 files / 1802 tests, and 543/543 traces. This automation did not re-run those gates. Return now to R1 post-KO / `NoKOSlow`; Wayfinder 106 maps later getter-order/candidate admission before direct mutation. Research/docs audit adds no score movement. See `docs/research/2026-07-12-daily-roadmap-architecture-audit.md`.

## Latest closeout - IKEMEN active-root body-push research (2026-07-12)

Pinned IKEMEN push is a run-order global pass with eligibility, AffectTeam, size-box Y/X/Z geometry, priority/weight/pushfactor, tie policy, and reclamp before hits. Wayfinder 105 selects a named plural runtime owner using stable roots and current bounded X/Width separation; diagnostics and combat remain independent. Research only; scores unchanged.

## Previous closeout - IKEMEN active-root diagnostic collision runtime (2026-07-12)

`RuntimeRootPresentation/v1` now selects diagnostic Clsn roots independently from draw/camera and Three.js resolves them strictly across pair/reserve storage. Required trace remains green at 543/543; desktop/mobile smoke proves exact collision handoff/reset, two boxes, nonblank canvases, and stale cleanup. Full gates pass 176 files / 1798 tests. Wayfinder 104 maps plural body push; gameplay and scores remain unchanged.

## Previous closeout - IKEMEN active-root diagnostic collision research (2026-07-12)

Pinned source separates debug Clsn from push/hit admission. Wayfinder 103 upgrades presentation v1 with independent collision ids and routes selected roots only into collision rendering; invisible/camera-disabled roots remain inspectable, standby proxies stay excluded. Docs/source/diff only; metrics and scores unchanged.

## Previous closeout - IKEMEN active-root stage constraints (2026-07-12)

Already-live explicit-Tag P3-P8 roots now apply actor-local stage-X constraints after motion. `RuntimeRootPhaseCapabilities/v2` and actor-scoped `fighter:constraints` expose the owner; required checksum `870f8871` passes inside 543/543 traces with final P3 `x=-154` and zero target/effect/combat widening. Full gates pass 176 files / 1797 tests. Wayfinder 102 maps diagnostic collision; scores unchanged.

## Previous closeout - IKEMEN active-root constraint/collision research (2026-07-12)

Pinned IKEMEN source separates actor-local bounds, global plural push, debug Clsn projection, and hit admission. Local audit selects active-root stage-X clamp as Wayfinder 101: explicit capability plus actor-scoped post-motion phase, with push/collision/combat unchanged. Docs/source/diff gates only; runtime metrics and scores remain at the 099 baseline.

## Previous closeout - IKEMEN active-root presentation runtime (2026-07-11)

`RuntimeRootPresentation/v0` now publishes independent body/shadow draw and camera ids while preserving P1/P2 snapshot/HUD/gameplay storage. Required checksum `97255586` passes inside 542/542 traces; desktop/mobile smoke proves exact `[p1,p2] -> [p3,p2] -> [p1,p2]` handoff/reset, stable HUD, matching renderer/capability ids, nonblank canvases, and stale-mesh cleanup. Wayfinder 100 maps stage constraints, push, collision, and combat admission. Scores remain unchanged.

## Previous closeout - IKEMEN active-root presentation research (2026-07-11)

Pinned IKEMEN source separates character draw, `invisible`/shadow suppression, standby camera filtering, and authored Tag entering/leaving/waiting choreography. Local audit rejected widening `snapshot.actors` because renderer, HUD, audio, collision, hit sparks, and app indexing share that pair. Wayfinder 099 selected runtime-owned draw/camera ids and an immediate P1-to-P3 visual handoff with pair gameplay unchanged. This docs-only closeout added no runtime, trace, browser, or score movement.

## Previous closeout - IKEMEN active-root motion runtime (2026-07-11)

Explicit IKEMEN Tag normal ticks now snapshot `playable`, `active-motion`, and `bounded-standby` before actor execution. Already-live P3-P8 roots run restricted side-effect-free CNS, local kinematics, and animation; same-pass TagIn promotion, direct native input/AI, Pause/hitpause motion, effects, combat, round, presentation, audio/HUD, and resources remain blocked. Required checksum `8ee92f65` passes inside 541/541 traces; full verification passes 174 files / 1781 tests. Wayfinder 098 maps the first browser-visible presentation cut. Scores remain unchanged.

## Previous closeout - IKEMEN active-root phase promotion research (2026-07-11)

Pinned IKEMEN action order and local owner audit reject full `advanceFighter` reuse for P3-P8. Wayfinder 097 now owns one normal-tick `active-motion` phase: precomputed root participation, restricted motion CNS, kinematics, then animation. Direct control/AI, Pause/hitpause, effects, combat, round, presentation, audio/HUD, resources, visuals, traces, and scores remain unchanged in this docs-only closeout.

## Previous closeout - IKEMEN active-root phase capabilities (2026-07-11)

`RuntimeRootPhaseCapabilities/v0` now reconciles Tag/Single command mapping, playable/bounded CNS, direct input/AI, kinematics, animation, effects, combat, round, presentation, and resources in the explicit IKEMEN `MatchWorld` registry. P3-P8 gain no new execution. Full gates pass 172 files / 1769 tests and unchanged 540/540 traces. Wayfinder 096 maps the first playable phase promotion; visuals and scores remain unchanged.

## Previous closeout - IKEMEN Tag side command routing (2026-07-11)

Explicit `ikemen-go` Tag normal ticks now clone P1 commands into odd-root buffers and P2 commands into even-root buffers through `RuntimeRootInputRouting/v0`. Required trace checksum `dff92731` proves P2 isolation and a P1-driven standby P3 state transition. Full gates pass 171 files / 1762 tests and 540/540 traces. Wayfinder 095 models per-phase active-root capabilities; direct gameplay, effects, combat, round, presentation, resources, visuals, and scores remain unchanged.

## Previous closeout - IKEMEN active-root gameplay ownership research (2026-07-11)

Pinned IKEMEN source confirms Human Tag maps one side controller to independent command lists for every same-side root, while standby masks effective control and the team leader consumes switch commands. Local audit separates structural roots from scheduling, command mapping, direct control, effects, combat, round, presentation, resources, reset, and trace. Wayfinder 094 now owns side command routing plus reserve-root trace observability; no runtime, visual, trace, or score movement.

## Previous closeout - IKEMEN Helper-originated Tag trace (2026-07-11)

Required `synthetic-imported-ikemen-helper-self-tag` checksum `08014285` now proves a Helper-owned default-self TagOut/TagIn cycle, standby/effective-control transition, continued CNS, concrete telemetry, and preserved parented Projectile. Full gates pass 170 files / 1749 tests and 539/539 traces. Wayfinder 093 maps active-root gameplay ownership; no runtime, visual, or score movement.

## Previous closeout - IKEMEN Helper-originated self Tag runtime (2026-07-11)

Helper CNS now executes unredirected self-only TagIn/TagOut with live omitted/static/deferred self resolution, concrete owner/state telemetry, and existing standby participation. Aggregate/lifecycle/legacy routes fail closed. Reset now removes stale optional actor state and rebinds all Helper hooks. Full gates pass 170 files / 1748 tests and 538/538 traces. Wayfinder 092 promotes the cycle to required trace evidence; no visual or score movement.

## Previous closeout - IKEMEN Helper aggregate closure audit (2026-07-11)

Pinned-source and local-ownership reconciliation closes every root-to-Helper aggregate axis under documented atomic prevalidation. Helper-authored Tag still stops before a match hook; active-root gameplay spans input, combat, round, and presentation. Wayfinder 091 selects unredirected Helper self standby as the next isolated slice. Research/source/diff gates only; no runtime, visual, trace, or score movement.

## Previous closeout - IKEMEN Helper-relative Tag member runtime (2026-07-11)

Explicit Tag mode now admits static/deferred Helper-targeted TagIn/TagOut `memberno`. Exact root ownership anchors team side, while a dedicated order operation swaps from mutable position one without inventing a Helper root slot. Atomic validation precedes state, member, control, leader, self, and partner mutation. Full gates pass 170 files / 1736 tests and 538/538 traces. Wayfinder 090 closed the aggregate audit; no visual or score movement.

## Previous closeout - IKEMEN Helper-relative TagIn leader runtime (2026-07-11)

Explicit Tag mode now admits static/deferred Helper-targeted TagIn leader rotation through exact root/team ownership and stable same-side PlayerNo. Atomic validation covers Helper, partner, state, root, leader, and mode before mutation; order is Helper state/control, leader, self, partner. Full gates pass 170 files / 1730 tests and 538/538 traces. Wayfinder 089 closed Helper `memberno`; no visual or score movement.

## Previous closeout - IKEMEN Helper-relative partner Tag runtime (2026-07-11)

Explicit `ikemen-go` Helper RedirectID now composes local state/control/self with stable-root-relative partner standby/state/control. Dynamic values resolve once in original-caller source order; exact root anchoring and dual state prevalidation preserve local atomicity. Full gates pass 170 files / 1727 tests and 538/538 traces. Continue at Wayfinder 088 for TagIn leader; no visual or score movement.

## Previous closeout - IKEMEN Helper aggregate Tag ownership research (2026-07-11)

Pinned compiler/runtime source confirms that redirected Helpers keep state/control/self locally, select partner roots through inherited stable PlayerNo, and route member/leader into root Tag order. It also exposes a zero-initialized Helper `memberNo` quirk and incremental partial-failure behavior. Local execution keeps atomic prevalidation. Wayfinder 087 now executes partner only; no runtime, trace, visual, or score movement.

## Previous closeout - IKEMEN initial Helper standby runtime (2026-07-11)

Explicit `ikemen-go` Helper creation now resolves optional static/deferred standby in the original root context, blocks invalid/unresolved authored values, stores final standby before identity observation, and initializes control from StateDef-over-true fallback. Effective control/direct combat remain filtered while same-tick CNS, identity, snapshots, and Helper-parented projectiles continue. Full gates pass 170 files / 1721 tests and 538/538 traces. Continue at Wayfinder 086 for aggregate Helper Tag ownership; no visual or score movement.

## Previous closeout - IKEMEN initial Helper standby research (2026-07-11)

Pinned IKEMEN compiler/runtime source establishes optional caller-owned boolean `standby`, false omission/zero default, identity allocation before parameter evaluation, mutation before initial state entry, requested control true with authored StateDef `ctrl` override, and same-frame CNS. Local identity/scheduler order already aligns; typed IR/profile resolution and hardcoded standby/control defaults were the bounded gaps. Wayfinder 085 implemented the bounded root-created path without visual or score movement.

## Previous closeout - IKEMEN Helper standby participation (2026-07-11)

Root-executed TagIn/TagOut RedirectID can now set or clear a live Helper's standby flag after local state/control mutation. Standby projects effective `Ctrl = 0` and blocks direct Helper HitDef while preserving raw control, CNS/state time, identity, targets, snapshots/drawing, and Helper-parented projectile spawn/advance. The single-Helper IKEMEN RunOrder path now shares bulk effect context. Full gates pass 170 files / 1714 tests and 538/538 traces. Continue at Wayfinder 084 for initial Helper `standby`; no score movement.

## Previous closeout - IKEMEN inert P3-P8 roots (2026-07-11)

Explicit `ikemen-go` matches can now construct/reset up to six P3-P8 reserve roots with interleaved side ids and standby state. `MugenSnapshot.reserveActors` and `MatchWorld` registry/lifecycle expose them, while playable actors, renderer, schedule, input, combat, round, compatibility execution, and effect stores remain P1/P2. Continue at Wayfinder 046 for an explicit activation/read-model contract. No score movement.

## Daily architecture decision - I2 root participation before activation (2026-07-11)

Separate I1 scanner/reporting from I2 explicit-profile runtime work. Before mutating standby, close direct P3-P8/cap/start/reset/lifecycle evidence and publish a versioned root-participation read model whose executable phase owners remain P1/P2. Then add a plural batch standby transition without assuming one active root per side; identity/Partner/Enemy/P2, standby CNS scheduling, input, effects, combat, round, presentation/lifebar, and resources remain separate gates. After this small I2 prefactor, return to a bounded MUGEN-lite post-KO / `NoKOSlow` timeline. No score movement.

## Previous closeout - IKEMEN SuperPause opposing-team defense (2026-07-10)

Explicit `ikemen-go` now resolves omitted/non-positive `p2defmul` through the game-level `1.5` default, accepts a match-level override, and projects a separate temporary defense multiplier to the current opposing root plus existing helpers without target memory. Required `synthetic-imported-ikemen-superpause-team-defense.json` checksum `76873f0d` / final `b4425c66` passes inside 538/538 traces. Its Wayfinder 041 frontier is resolved by the newer team-topology closeout. No score movement.

## Previous closeout - IKEMEN helper-owned Pause (2026-07-10)

Helper CNS now routes Pause/SuperPause through the shared match pause controller. Dynamic helper expressions resolve time, movetime, power, sound, animation/position, and float `p2defmul`; global ownership uses helper serial id, power uses the root resource, sound remains helper-attributed, and helper current-target damage honors defense scaling. Required helper-SuperPause checksum `d1444550` / final `f6c7da6a` passes inside 537/537 traces. Continue at Wayfinder 040 for opposing-team defense breadth and `p2defmul = 0`. No score movement.

## Previous closeout - IKEMEN root/helper actor RunOrder (2026-07-10)

Explicit `ikemen-go` now prepares one shared root/helper actor list, applies source-backed RunFirst/RunLast and MoveType/root/helper priorities, and appends newly spawned helpers to the end for same-tick execution. Required `synthetic-imported-ikemen-helper-runorder.json` checksum `174f927d` / final `3906023d` proves P1 spawns `p1-helper-0`, the helper reads `RunOrder = 3`, routes state `1282`, and advances exactly once in frame 1. The aggregate is 532/532 gates. Continue at Wayfinder 036 for simultaneous Pause/SuperPause ownership. No score movement.

## Previous closeout - IKEMEN root RunOrder trigger (2026-07-10)

Explicit `ikemen-go` now stamps one-based sorted root indices before frame triggers. Required `synthetic-imported-ikemen-runorder.json` checksum `04d433de` proves P2 `RunOrder = 1` routes state `282` alongside `p2 -> p1` controller order inside 531/531 gates. Continue at Wayfinder 035. No score movement.

## Previous closeout - IKEMEN root run flags (2026-07-10)

Explicit `ikemen-go` now consumes previous-tick exclusive `RunFirst` / `RunLast` before MoveType/id order. Required trace `synthetic-imported-ikemen-runfirst.json` checksum `56e17803` passes inside 530/530 gates using the new named schedule-phase actor-order requirement. Continue at Wayfinder 034. No score movement.

## Previous closeout - IKEMEN root RunOrder (2026-07-10)

Explicit `ikemen-go` matches now prepare/run two roots by previous-tick MoveType priority and deterministic id tie-break; MUGEN/unknown preserve existing order. Full tests and 529/529 traces are green. Continue at Wayfinder 033. No score movement.

## Latest closeout - Same-tick Pause symmetry (2026-07-10)

`RuntimeMatchFighterAdvanceWorld` now lets both prepared root-player passes finish when P1 starts Pause/SuperPause; the paused branch begins next tick. Focused tests and 529/529 trace gates are green. Continue at Wayfinder 032 for the next source-backed actor-scheduling cut. No score movement.

## Historical planning decision - HitDef presentation semantics (2026-07-10)

The daily architecture audit selects a two-step R1/renderer sequence: preserve authored-versus-omitted `HitDef p1sprpriority` / `p2sprpriority` behind a minimal profile/default policy, then apply static direct player/helper values on accepted hit/guard through the MUGEN 1.1 policy. The gate must not conflate draw priority with direct-combat attack priority. Browser proof follows through a renderer-independent semantic order key and controlled compositing diagnostics. Proposed ADR 0002 is a contingent guardrail and must be adopted or replaced before runtime work. Scores remain unchanged.

## Latest closeout - SprPriority draw order (2026-07-10)

Player SprPriority now clamps `-5..5`; CharacterRenderer diagnostics and browser oracle prove effective z ordering while preserving effect ranges. Continue at Wayfinder 024.

## Latest closeout - Renderer axis-parity oracle (2026-07-10)

Effective Three.js character mesh transforms now pass an independent SFF/AIR/facing/scale oracle on desktop/mobile. Renderer ladder L0-L5 is defined; this route reaches L2 plus general L3. Historical selector Wayfinder 023 is superseded by 024.

## Latest closeout - Persistent Studio scene authoring (2026-07-10)

## Latest closeout - TypeScript 7 toolchain follow-up (2026-07-10)

TypeScript remains on direct `typescript@~7.0.2` with explicit `rootDir: "src"`, no `@typescript/typescript6` compatibility alias, and current compiler evidence.

- `pnpm exec tsc --version` reports `Version 7.0.2`.
- `pnpm why typescript` and `pnpm list typescript` resolve only `typescript@7.0.2` in the workspace.
- Toolchain audit remains clean against the official TS7 posture: no local TypeScript compiler API consumers were found and both `typecheck`/`build` paths still use local TS7.

Continue at Wayfinder 024 for runtime/render next, with no score movement in this toolchain control cut.

Name/matchup/stage mutations now mark `Unsaved`, invalidate outputs, save exact manifest entry, and reopen as `Saved`. Browser and visual proof are green. Historical selector Wayfinder 022 is superseded by 024; authoring-spine ticket 003 remains reference history.

## Latest closeout - Persistent Studio project naming (2026-07-10)

Validated project-name editing now propagates through manifests and survives local save/reload/reopen under browser smoke. Closed without score movement; historical selector Wayfinder 021 is superseded by 024.

## Latest closeout - KO sound handoff (2026-07-10)

Normal/double KO emit common `f:11,0`, time-over is silent, and global `NoKOSnd` suppresses emission. Focused tests and required trace `bfd5f073` are green. Closed without score movement; historical selector Wayfinder 020 is superseded by 024.

## Latest closeout - Contextual SND banks (2026-07-10)

`PlaySnd` defaults to player SND; `HitDef` and `SuperPause` default to common prefix `f`. Focused tests and 524/524 traces are green. Closed without score movement; historical selector Wayfinder 019 is superseded by 024.

Last updated: 2026-07-11

This is the short operating board for choosing the next slice without re-reading every roadmap file. It does not replace `docs/ROADMAP_PROGRESS_SYSTEM.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/ROADMAP_RELEASE_TARGETS.md`, `docs/WORKPLAN.md`, `docs/PORT_COMPLETION_SCORECARD.md`, or `docs/BUILD_EXECUTION_BACKLOG.md`; it points at the exact next packages and the docs that must change when progress moves.

Use `docs/ROADMAP_CONTINUITY_GUIDE.md` when turning this board into a next implementation cut or when resuming after a long pause. Use `docs/NEXT_BUILD_ROADMAP.md` for the tactical next-10-slices order.

## Read Order

Use this order before starting broad work:

1. `CONTEXT.md`
2. `AGENTS.md`
3. `docs/ROADMAP_PROGRESS_SYSTEM.md`
4. `docs/ROADMAP_PACKAGE_MILESTONES.md`
5. `docs/NEXT_BUILD_ROADMAP.md`
6. `docs/ROADMAP_RELEASE_TARGETS.md`
7. `docs/ROADMAP_EXECUTION_BOARD.md`
8. `docs/ROADMAP_CONTINUITY_GUIDE.md`
9. `docs/PROGRESS_TRACKER.md`
10. `docs/WORKPLAN.md`
11. Relevant `.scratch/roadmap/issues/<NN>-*.md`

Use `docs/PORT_COMPLETION_SCORECARD.md` when answering "how far are we?" or changing scores.

## Release Target Now

Current release target: **MUGEN-lite playable MVP**.

This means the default native/generated match stays playable while an imported KFM/Common1-style package gains more fixture-backed routes. The next score-moving work must produce runtime trace, focused test, visual QA, fixture, or build/export evidence. This docs/setup pass improves R0 project control only and does not move scores.

Latest project-control checkpoint: the 2026-07-10 daily audit reconciles the active queue around HitDef priority policy/contact evidence, semantic renderer order, and schedule diagnostics while retaining local markdown issues, canonical labels, single-context docs, and no-score rules. This is control evidence only; it proves no runtime behavior.

Latest I1 IKEMEN scanner checkpoint: scanner-only recognition now includes source-mapped IKEMEN stage/BGDef presentation signals from the local Ikemen-GO snapshot: `scenenumber`, `modeloffset`, `modelrotate`, `modelscale`, and `type = video` background layers. Focused `IkemenFeatureScanner` coverage proves these features are counted as recognized/unsupported. This is scanner evidence only, not model-stage rendering, video decoding, screenpack parity, score movement, or IKEMEN execution.

Latest focused R1/R2 audio checkpoint: accepted normal hits increment defender `receivedHitSequence`; guard does not. Browser audio consumes each new sequence once and cancels only actor-local channel `0`, including pending same-frame voices, without stopping another actor or repeatedly cancelling later voices during unchanged hitstun. `pnpm qa:trace` remains 524/524 with stable checksums. Broader defender kinds, exact multi-hit ordering, common/system/BGM ownership, KO voice policy, perceptual parity, score movement, and full parity are not claimed.

Latest focused R1/R2 audio checkpoint: numbered `PlaySnd` playback channels are actor-local in `MugenAudioSystem`; matching P1/P2 channel numbers play concurrently, and replacement/pan/numbered-stop resolves against the emitting actor. `StopSnd -1` remains global. Focused store and controlled AudioContext integration tests are green. This is bounded browser playback ownership only; exact free-channel allocation, voice-channel hit cancellation, broader priority/mix semantics, common/system/BGM ownership, perceptual parity, score movement, and full parity are not claimed.

Latest focused R1 runtime checkpoint: five required first-generation helper-local direct HitDef/persistence traces now resolve `S5,0/1/2/3` hit sounds and `S6,4` guard sound, preserve helper contact and StateDef persistence behavior, and require owner-attributed typed `audio:playsnd`. Trace/final checksums are `99b55e47` / `cd02ded0`, `61b3ffbf` / `b005d52a`, `ba2a19f4` / `e9ccdc9c`, `1e37fd5c` / `4d6e93b5`, and `4b48e97d` / `c7ce0ae6`; `pnpm qa:trace` verifies 524/524 artifacts. Exact SND playback/channel/mix timing, nested helper/redirect/team ownership, renderer parity, score movement, and full parity are not claimed.

Latest focused R1 runtime checkpoint: required player-owned Projectile normal-hit GetHitVar traces `8e5df79b` / `4d078c5d`, `4356b5cb` / `4b270d45`, and `df2619f9` / `5469bc69` preserve Common1 `5000 -> 335/337/339`, target/lifecycle evidence, and now require `projectile` plus `audio:playsnd` with `S5,45/46/47` and FightFX `F7002` packages. `pnpm qa:trace` verifies 524/524 artifacts, 493 required and 31 optional. This is bounded player-owned Projectile GetHitVar sound telemetry only; exact SND playback/channel semantics, exact combo/chain arbitration, Projectile/helper persistence breadth, broader ownership, renderer parity, score movement, and full parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-hitcount.json` trace checksum `ee8f4e19` / final checksum `0fd4adf8` and `synthetic-imported-helper-projectile-hitcount.json` trace checksum `c8f5dc55` / final checksum `e1569fab` assert bounded imported player-owned and helper-parented/root-owned Projectile normal-hit attacker-side `HitCount` / `UniqHitCount` sound typed audio telemetry. The player gate preserves P1 `200 -> 341`, target link `p1 -> p2 / 77`, projectile lifecycle evidence, and now requires `audio:playsnd` operation evidence alongside `projectile`, with attacker-side `S5,44` plus FightFX `F7002` contact metadata. The helper gate preserves helper `1257 -> 1258`, owner/helper target links for target id `8893`, helper/projectile lifecycle evidence, and requires `audio:playsnd` alongside `helper` and `projectile`, with helper-local `S5,43` plus FightFX `F7002`. `pnpm qa:trace` verifies 524/524 artifacts, 493 required and 31 optional. Official Elecbyte State Controller docs were checked for `Projectile` taking HitDef parameters and helper-created Projectiles becoming root-owned; Elecbyte Trigger docs were checked for `HitCount` / `UniqHitCount` current-attack counters. This is bounded Projectile attacker-side HitCount sound typed telemetry only; broader helper Projectile normal-hit sound breadth beyond current helper routes, exact common/player SND archive lookup, channel priority classes, timing, mixing, panning semantics, broader helper/redirect/team ownership, exact presentation ordering, renderer parity, super-background audio, score movement, and full audio/Projectile/HitCount parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-gethitvar-hit-metadata.json` trace checksum `28afbcea` / final checksum `c960b1cf`, `synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json` trace checksum `616e0b2c` / final checksum `0aebcc73`, and `synthetic-imported-helper-projectile-gethitvar-hitcount.json` trace checksum `40ec4f4b` / final checksum `6f15ff30` assert bounded imported helper-parented/root-owned Projectile normal-hit GetHitVar sound typed audio telemetry. The gates execute helper Projectile normal-hit damage/timing/velocity, hitid/chainid, and hitcount routes, preserve owner/helper target links, route P2 through defender-owned Common1-style `5000 -> 336/338/340`, and require `audio:playsnd` operation evidence alongside `helper` and `projectile`. They package helper-local `S5,40/41/42` sound telemetry with FightFX `F7002` contact metadata and remain required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-guard-ko.json` trace checksum `05dbcded` / final checksum `98b8bf17`, `synthetic-imported-helper-projectile-guard-kill.json` trace checksum `33930a00` / final checksum `8412e638`, and `synthetic-imported-helper-projectile-guard-terminal.json` trace checksum `c6937f42` / final checksum `e0835e33` assert bounded imported helper-parented/root-owned Projectile guard-contact sound typed audio telemetry and remain required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-contact.json` trace checksum `57b3b556` / final checksum `e0f3e41c` and `synthetic-imported-projectile-guard.json` trace checksum `eb9c2e58` / final checksum `b1c74e5e` assert bounded imported player-owned Projectile contact sound typed audio telemetry and remain required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitdef-dynamic-hitsound.json` trace checksum `fe3c0f3d` / final checksum `855df386` and `synthetic-imported-hitdef-dynamic-guardsound.json` trace checksum `bb38362a` / final checksum `3e0ddeb0` assert bounded imported dynamic direct HitDef contact sound typed audio telemetry and remain required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-sound-dynamic-pan.json` trace checksum `879afcf4` / final checksum `b780e5e9` and `synthetic-imported-sound-dynamic-value.json` trace checksum `bcdafe32` / final checksum `31b8a7b3` assert bounded imported dynamic active-state audio typed telemetry and remain required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-damage-scale-dynamic.json` trace checksum `3433b369` / final checksum `e3db6dd9` asserts bounded imported dynamic AttackMulSet/DefenceMulSet typed telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-envcolor-dynamic.json` trace checksum `845c3d5e` / final checksum `282fc77f` asserts bounded imported active-state dynamic EnvColor typed telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-afterimage-dynamic.json` trace checksum `e7299ac5` / final checksum `b946d805` asserts bounded imported active-state dynamic AfterImage typed sprite-effect telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-angle-dynamic.json` checksum `13560dcd` / final checksum `4d7c4726` and `synthetic-imported-anglemul-dynamic.json` checksum `0bb54a1c` / final checksum `c9f2b557` assert bounded imported active-state dynamic Angle typed sprite-effect telemetry and remain required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-remappal-dynamic.json` checksum `5f04f2d4` / final checksum `71ad06f0` asserts bounded imported active-state dynamic `RemapPal source/dest` typed sprite-effect telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-trans-dynamic.json` checksum `4bffcd82` / final checksum `5beea0f0` asserts bounded imported active-state dynamic `Trans alpha` typed sprite-effect telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-sprpriority-dynamic.json` checksum `a9e0862d` / final checksum `4919326d` asserts bounded imported active-state dynamic `SprPriority value` typed sprite-effect telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-resourceset-dynamic.json` checksum `1bd04945` / final checksum `35db4dcd` asserts bounded imported active-state dynamic `LifeSet` / `PowerAdd` / `PowerSet` typed resource telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-lifeadd-dynamic.json` checksum `8b0493f8` / final checksum `cbe4ab51` asserts bounded imported active-state dynamic `LifeAdd` typed resource telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-control-dynamic.json` checksum `885cc464` / final checksum `ecf2bec6` asserts bounded imported active-state dynamic `CtrlSet` typed resource telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-statetypeset-dynamic.json` checksum `577404e4` / final checksum `083a76de` asserts bounded imported active-state dynamic `StateTypeSet` enum-param typed metadata telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-screenbound-dynamic.json` checksum `9797bdfe` / final checksum `d76b641a` asserts bounded imported active-state dynamic `ScreenBound value/movecamera` typed bounds telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-posfreeze-dynamic.json` checksum `8de0c2e9` / final checksum `6c40bb79` asserts bounded imported active-state dynamic `PosFreeze x/y` typed bounds telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-playerpush-dynamic.json` checksum `b7775652` / final checksum `92aca1cd` asserts bounded imported active-state dynamic `PlayerPush value` typed collision telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-width-dynamic.json` checksum `51554c91` / final checksum `84a85277` asserts bounded imported active-state dynamic `Width player` typed collision telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-dynamic-posadd.json` checksum `97ec15d0` asserts bounded imported helper-local dynamic `PosAdd` typed telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-dynamic-posset.json` checksum `50596bc2` asserts bounded imported helper-local dynamic `PosSet` typed telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-dynamic-velmul.json` checksum `08220a98` asserts bounded imported helper-local dynamic `VelMul` typed telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-dynamic-veladd.json` checksum `fbb8bcae` asserts bounded imported helper-local dynamic `VelAdd` typed telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-controller-param-parentroot.json` checksum `94919326` asserts bounded imported helper-local dynamic `VelSet` typed telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-dynamic-posset.json` checksum `aeb730fb` asserts bounded imported active-state dynamic `PosSet` typed telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-dynamic-velmul.json` checksum `4d241401` asserts bounded imported active-state dynamic `VelMul` typed telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-dynamic-veladd.json` checksum `daf99fb4` asserts bounded imported active-state dynamic `VelAdd` typed telemetry and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-const-controller-param.json` checksum `2dad3a50` asserts bounded `Const240p` / `Const480p` / `Const720p` coordinate conversion inside imported active-state `VelSet` controller params. The gate presses `x`, uses player `localCoord = 640,480`, enters state/action `200`, executes `VelSet x = Const240p(3) + Const480p(6)` and `y = 0 - Const720p(12)`, and requires actor-frame velocity telemetry `x = 12` / `y = -6` plus ordered static and dynamic `kinematic:velset` evidence. `pnpm qa:trace` verified 509/509 artifacts, 478 required and 31 optional. Official Elecbyte State Controller Reference was checked for arithmetic-expression-capable numeric controller params, and Elecbyte Trigger Reference was checked for width-ratio conversion into the player's coordinate space. This is bounded `VelSet` param-context conversion plus active-state dynamic `VelSet` typed telemetry only; broad coordinate translation across all controller params, dynamic typed-operation lowering beyond active-state `VelSet`, renderer/screenpack viewport ownership, camera animation parity, IKEMEN `config.json` execution, team/simul/helper namespace breadth, score movement, and full viewport parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-const-coordinate.json` checksum `ea879c1b` asserts bounded `Const240p` / `Const480p` / `Const720p` coordinate conversion in imported State -1 routing. The gate presses `x`, uses player `localCoord = 640,480`, evaluates `Const240p(3) = 6`, `Const480p(6) = 6`, and `Const720p(12) = 6`, routes into state/action `9304`, and remains required by `pnpm qa:trace`. That checkpoint passed 508/508 artifacts, 477 required and 31 optional. Official Elecbyte Trigger Reference was checked for width-ratio conversion into the player's coordinate space. This is bounded expression-context conversion only; broader coordinate translation remains active work.

Previous focused R1 runtime checkpoint: required `synthetic-imported-config-gamespace.json` checksum `2f3c0a63` now asserts bounded INI `[Config] GameWidth` / `GameHeight` parsing and runtime game-space override in imported State -1 routing. The gate presses `x`, uses parsed-config-equivalent `1280x720` dimensions over a `640x480` stage localcoord, evaluates zoom-stable `ScreenWidth = 1280` and `ScreenHeight = 720` while validating inverse-scaled `GameWidth = 2560` and `GameHeight = 1440` at camera zoom `0.5`, routes into state/action `9303`, and is required by `pnpm qa:trace`. `pnpm qa:trace` verifies 507/507 artifacts, 476 required and 31 optional. Official Elecbyte Coordinate Space docs were checked for `mugen.cfg` `[Config]` game coordinate dimensions, and Elecbyte 1.1 Trigger Reference was checked for inverse camera-zoom scaling plus non-zooming `ScreenWidth` / `ScreenHeight`. This is bounded INI config parsing plus current runtime expression context precedence only; broader player-local coordinate translation, renderer/screenpack viewport ownership, camera animation parity, IKEMEN `config.json` execution, team/simul/helper namespace breadth, score movement, and full viewport parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-screenspace.json` checksum `5330bacd` asserts bounded `ScreenWidth` / `ScreenHeight` trigger support in imported State -1 routing. The gate presses `x`, evaluates zoom-stable `ScreenWidth = 640` and `ScreenHeight = 480` while validating inverse-scaled `GameWidth = 1280` and `GameHeight = 960` at camera zoom `0.5`, routes into state/action `9302`, and remains required by `pnpm qa:trace`.

Previous focused R1 runtime checkpoint: required `synthetic-imported-gamespace.json` checksum `b6f248ab` asserts bounded `GameWidth` / `GameHeight` trigger support in imported State -1 routing. The gate presses `x`, evaluates stage-derived `GameWidth = 640` and `GameHeight = 480`, routes into state/action `9301`, and remains required by `pnpm qa:trace`.

Previous focused R1 runtime checkpoint: required `synthetic-imported-modifyprojectile-omitted-bounds.json` checksum `24cbb1dc` / final checksum `e94d1480` and `synthetic-imported-helper-modifyprojectile-omitted-bounds.json` checksum `9db04bbc` / final checksum `555d744b` now assert owner-side/helper-local `ModifyProjectile` omitted-bound preservation: existing explicit `projedgebound`, `projstagebound`, and `projheightbound` payloads survive later partial mutation that omits those params. `pnpm qa:trace` verifies 504/504 artifacts, 473 required and 31 optional. Previous dynamic params remain required at `synthetic-imported-helper-modifyprojectile-dynamic-params.json` checksum `2d88a550` / final checksum `edb6d2d2` and `synthetic-imported-modifyprojectile-dynamic-params.json` checksum `6ffbef92` / final checksum `5665a98e`; paired dynamic bounds gates remain required at `synthetic-imported-helper-modifyprojectile-dynamic-bounds.json` checksum `f582153e` / final checksum `adc63407` and `synthetic-imported-modifyprojectile-dynamic-bounds.json` checksum `e2f7a077` / final checksum `aa78704a`; static owner/helper `ModifyProjectile` gates remain required at checksums `63a87da1` and `09d3f7e4`. Exact camera/screen/stage split, exact tick order, helper/team namespace breadth, team/simul helper selection, and full Projectile parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-localcoord-default-bounds-terminal.json` checksum `af7ee80e` / final checksum `3fcb4661` and `synthetic-imported-helper-projectile-localcoord-default-bounds-terminal.json` checksum `46b0164c` / final checksum `b1531c44` promote bounded 640x480 character `localcoord` omitted Projectile bounds defaults into `pnpm qa:trace`. Parsed `[Info] localcoord = 640,480` reaches imported fighter definitions, player-owned Projectile spawns, and helper-parented/root-owned Projectile spawns; omitted defaults derive `projedgebound = 80`, `projstagebound = 80`, and `projheightbound = -480,2`, while explicit bounds remain authored. `pnpm qa:trace` passes 497/497 artifacts, 467 required and 30 optional; focused runtime verification passes. Official Elecbyte Coordinate Space and State Controller docs were checked for character `localcoord`, width-ratio coordinate translation, 480p omitted Projectile defaults, and Helper-created Projectiles becoming root-owned. This is bounded localcoord-derived default-bound evidence only; exact GameWidth/GameHeight negotiation, exact camera/screen/stage split, full localcoord scaling across all Projectile params/controllers, exact terminal timing, exact sprite/layer/palette parity, team/simul breadth, score movement, and full Projectile bounds parity are not claimed. Previous helper/player 240p default-bound gates remain required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-stagebound-terminal.json` checksum `488ce550` / final checksum `dd0d956d` remains required as bounded explicit helper-parented/root-owned Projectile `projstagebound = 24` terminal playback evidence.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-edgebound-terminal.json` checksum `8482f4f3` / final checksum `1ab7d718` remains required as bounded explicit helper-parented/root-owned Projectile `projedgebound = 24` terminal playback evidence.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-heightbound-terminal.json` checksum `debb08b1` / final checksum `0821ec70` remains required as bounded explicit helper-parented/root-owned Projectile `projheightbound = -120,60` terminal playback evidence.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-heightbound-terminal.json` checksum `1164a584` / final checksum `363aced8` remains required as bounded explicit player-owned Projectile `projheightbound = -120,60` terminal playback evidence.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-edgebound-terminal.json` checksum `e4361063` / final checksum `6dcae566` remains required as bounded explicit player-owned Projectile `projedgebound = 24` terminal playback evidence.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-stagebound-terminal.json` checksum `fe3df8e7` / final checksum `b467573f` remains required as bounded explicit player-owned Projectile `projstagebound = 24` terminal playback evidence.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-bounds-remove-terminal.json` checksum `1d7479d3` / final checksum `39b81931` remains required for bounded player-owned Projectile bounds-removal terminal playback after official default-bound drift.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-remove-hit-fallback-terminal.json` checksum `0ed9e229` / final checksum `9cd6d27b` remains required as bounded helper-parented/root-owned Projectile timeout-removal fallback playback evidence from omitted `projremanim` to authored `projhitanim = 1122`. That checkpoint passed 486/486 artifacts, 456 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-cancel-remove-fallback-terminal.json` checksum `cf33c924` / final checksum `bd3a1279` remains required as bounded helper-parented/root-owned Projectile cancel-removal fallback playback evidence from omitted `projcancelanim` to authored `projremanim = 1028`. That checkpoint passed 485/485 artifacts, 455 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-cancel-remove-fallback-terminal.json` checksum `4966ed30` / final checksum `98170d08` remains required as bounded player-owned Projectile cancel-removal fallback playback evidence from omitted `projcancelanim` to authored `projremanim = 921`. That checkpoint passed 484/484 artifacts, 454 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-remove-hit-fallback-terminal.json` checksum `3bbdfbfc` / final checksum `76ca3f77` remains required as bounded player-owned Projectile timeout-removal fallback playback evidence from omitted `projremanim` to authored `projhitanim = 920`. That checkpoint passed 483/483 artifacts, 453 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-remove-terminal.json` checksum `8a65629c` / final checksum `7ba3479b` remains required as bounded player-owned Projectile timeout-removal terminal playback evidence from authored `projremanim = 919`. That checkpoint passed 482/482 artifacts, 452 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-guard-terminal.json` checksum `c6937f42` / final checksum `e0835e33` remains required as bounded helper-parented/root-owned Projectile guarded-contact terminal playback evidence. That checkpoint passed 481/481 artifacts, 451 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-guard-terminal.json` checksum `26f1e7f9` / final checksum `f9df24d0` remains required as bounded player-owned Projectile guarded-contact terminal playback evidence. That checkpoint passed 480/480 artifacts, 450 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-guard-kill.json` checksum `905eb8e3` / final checksum `c6cc7787` remains required as bounded player-owned Projectile `guard.kill = 0` nonlethal guard-chip clamp evidence. The route executes imported Projectile id `77` with `damage = 31,2000` and explicit `guard.kill = 0`; it requires typed projectile operation evidence, Projectile spawn/remove lifecycle evidence, target-link evidence, guard event/reason evidence, no KO round frame, and final P2 life `1`. That checkpoint passed 479/479 artifacts, 449 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-guard-kill.json` checksum `33930a00` / final checksum `8412e638` remains required as bounded helper-parented/root-owned Projectile `guard.kill = 0` nonlethal guard-chip clamp evidence. The route spawns helper `p1-helper-0`, then root-owned Projectile `p1-projectile-0` with parent `p1-helper-0`, `damage = 18,2000`, and explicit `guard.kill = 0`; it requires typed helper/projectile operation evidence, helper/projectile spawn+active evidence, owner/helper target-link evidence, guard event/reason evidence, helper branch state `1313`, no KO round frame, and final P2 life `1`. That checkpoint passed 478/478 artifacts, 448 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-guard-ko.json` checksum `05dbcded` / final checksum `98b8bf17` remains required as bounded helper-parented/root-owned Projectile default lethal guard-chip KO evidence. The route spawns helper `p1-helper-0`, then root-owned Projectile `p1-projectile-0` with parent `p1-helper-0`, `damage = 18,2000`, and default `guard.kill`; it requires typed helper/projectile operation evidence, helper/projectile spawn evidence, owner/helper target-link evidence, guard event/reason evidence, round KO winner/message evidence, and final P2 life `0`. That checkpoint passed 477/477 artifacts, 447 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-guard-ko.json` checksum `2285474a` / final checksum `c968c723` remains required as bounded player-owned Projectile default lethal guard-chip KO evidence. The route executes an imported Projectile with `damage = 31,2000` and default `guard.kill`, requires typed `projectile` operation evidence, Projectile lifecycle and target-link evidence, guard event/reason evidence, round KO winner/message evidence, and final P2 life `0`. That checkpoint passed 476/476 artifacts, 446 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitdef-guard-ko.json` checksum `b7db75f4` / final checksum `0f9afa50` remains required as bounded default lethal direct `HitDef` guard-chip KO evidence. The route executes a guarded imported direct `HitDef` with `guard.damage = 2000` and default `guard.kill`, requires typed `hitdef` operation evidence, guard event/reason evidence, round KO winner/message evidence, and final P2 life `0`. That checkpoint passed 475/475 artifacts, 445 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-guarddist-reversal-no-contact.json` checksum `ca20c823` / final checksum `2bc9b86d` promotes bounded negative `guard.dist` / `ReversalDef` priority into `pnpm qa:trace`. The route executes a guardable imported direct `HitDef` with `guard.dist = 96` in the near-but-not-contacting guard-distance stage while P2 has active `ReversalDef p1stateno = 777` / `p2stateno = 888` and an explicit `InGuardDist` guard-start route. It requires typed `hitdef` and `reversaldef` operation evidence, P2 state-0 `ReversalDef` controller evidence, guard-start `ChangeState` evidence, whiff combat reason, final P2 state/action `130`, and forbids reversal/get-hit/guard-hit states `777`, `888`, `5000`, `150`, and `151`. That checkpoint passed 474/474 artifacts, 444 required and 30 optional. Official Elecbyte State Controller docs were checked for `guard.dist` guard-entry distance and ReversalDef Clsn1/Clsn1 contact. This is bounded no-contact rejection evidence only; exact guard-distance boxes, positive proximity-only `guard.dist` ReversalDef contact, exact guard-start timing, custom-state breadth beyond direct routes, projectile reflection/removal semantics after reversal, helper-owned custom-state tables, exact attr grammar, hitpause/tick order, multi-projectile/multi-target/team breadth, score movement, and full ReversalDef/guard parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-walkback-guard-reversal.json` checksum `70c83b8c` / final checksum `b7a8cb9d` remains required and proves bounded authored walk-back state `20` `ReversalDef` priority before default get-hit `5000` or stand guard states `150` / `151`.

Previous focused R1 runtime checkpoint: required `synthetic-imported-air-guard-reversal.json` checksum `966b17b8` / final checksum `2fa19142` remains required and proves bounded no-walk-stabilized air guard-input `ReversalDef` priority before default get-hit `5000`, stand guard states `150` / `151`, crouch guard states `152` / `153`, or air guard states `154` / `155`.

Previous focused R1 runtime checkpoint: required `synthetic-imported-crouch-guard-reversal.json` checksum `405f475e` / final checksum `d1f39c08` remains required and proves bounded no-walk-stabilized down-back crouch-state `ReversalDef` priority before default get-hit `5000`, stand guard states `150` / `151`, or crouch guard states `152` / `153` execute.

Previous focused R1 runtime checkpoint: required `synthetic-imported-guard-reversal.json` checksum `6f8df3a4` / final checksum `e0771a15` remains required and proves bounded no-walk-stabilized held-back guard-input `ReversalDef` priority before default get-hit `5000` or guard states `150` / `151` execute.

Previous focused R1 runtime checkpoint: required `synthetic-imported-custom-state-reversal.json` checksum `18065db0` / final checksum `ac8d0073` remains required and proves bounded direct owner-backed custom-state `ReversalDef` priority before state `889`, default get-hit `5000`, or guard states `150` / `151`.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-reversal.json` checksum `a1d82380` / final checksum `ca66a49a` promotes bounded helper-parented/root-owned Projectile `ReversalDef` priority into `pnpm qa:trace`. The route creates a visual Helper that spawns Projectile id `8878` with `ownerId = p1`, `rootId = p1`, and `parentId = p1-helper-0`, stops at the initial reversal contact, requires typed `helper`, `projectile`, and `reversaldef` operation evidence, requires reversal event/combat reason evidence, keeps helper target memory empty and the Projectile payload unconsumed at that sampled frame, forbids hit/guard/override/reject routes, and ends P2 in state/action `777` while P1 enters owner-backed state/action `888` with both actors at life `1000`. `pnpm qa:trace` passed 468/468 artifacts, 438 required and 30 optional. This is bounded helper-parented Projectile reversal-priority evidence only; projectile reflection/removal semantics after reversal, helper-owned custom-state tables, broader guard/custom-state counter breadth, exact attr grammar, hitpause/tick order, multi-projectile/multi-target/team breadth, score movement, and full ReversalDef parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-reversal.json` checksum `5c4ddf48` / final checksum `bb0bbb99` promotes bounded player-owned Projectile `ReversalDef` priority into `pnpm qa:trace`. The route executes imported Projectile id `77`, stops at the initial reversal contact, requires typed `projectile` and `reversaldef` operation evidence, requires reversal event/combat reason evidence, keeps the Projectile payload unconsumed at that sampled frame, and ends P2 in state/action `777` while P1 enters owner-backed state/action `888` with both actors at life `1000`. `pnpm qa:trace` passed 467/467 artifacts, 437 required and 30 optional. This is bounded player Projectile reversal-priority evidence only; projectile reflection/removal semantics after reversal, guard/custom-state counter breadth, exact attr grammar, hitpause/tick order, score movement, and full ReversalDef parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-superpause-unhittable.json` checksum `1598af8f` / final checksum `f59f5704` promotes Elecbyte's default `unhittable = 1` SuperPause source immunity into `pnpm qa:trace` as bounded match-pause combat metadata. The route executes imported SuperPause while a demo striker attempts same-tick direct contact; required evidence proves `pause:superpause`, match-pause/freeze, reject event substring `via SuperPause unhittable`, and final imported P1 life `1000`. `pnpm qa:trace` now passes 466/466 artifacts, 436 required and 30 optional. Official Elecbyte 1.1 State Controller Reference was checked for `unhittable` default player hit immunity during SuperPause and `unhittable = 0` opt-out. This is bounded source-immunity/direct-contact rejection evidence only; exact MUGEN/IKEMEN projectile/helper/team breadth, broader reversal priority, exact pause layering, renderer/super-background presentation, score movement, and full SuperPause parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-superpause-pausebg.json` checksum `49bcfe16` / final checksum `397a8fae` promotes Elecbyte's `pausebg = 0` SuperPause background-update flag into `pnpm qa:trace` as bounded metadata. The route executes imported `SuperPause pausebg = 0`; required evidence proves `pause:superpause`, match-pause/freeze, and `pauseBg = false`. That checkpoint passed 465/465 artifacts, 435 required and 30 optional. Official Elecbyte 1.1 State Controller Reference was checked for `pausebg = 0` continuing background updates during pause and default `pausebg = 1` stopping them. This is bounded SuperPause pause-background snapshot metadata only; actual renderer/background update parity, exact stage/BGCtrl pause timing, renderer visual suppression/playback parity, actual FightFX/common asset lookup/rendering, dynamic `S` player-AIR prefix breadth, super backgrounds, helper/team/redirect ownership, score movement, and full super presentation parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-superpause-anim-disabled.json` checksum `fc7a2ca4` / final checksum `5be3ca6c` promotes Elecbyte's `anim = -1` SuperPause no-animation route into `pnpm qa:trace`. The route executes imported `SuperPause anim = -1`; required evidence proves `pause:superpause`, match-pause/freeze, and absence of optional `superAnim` metadata through `superAnimAbsent = true`.

Previous focused R1 runtime checkpoint: required `synthetic-imported-superpause-default-anim.json` checksum `318c5e9f` / final checksum `747e7619` promotes Elecbyte's omitted-`anim` SuperPause default into `pnpm qa:trace`. The route executes imported `SuperPause` without `anim`; required evidence proves `pause:superpause`, match-pause/freeze, and `superAnim` metadata `raw = 30`, `source = fightfx`, `actionNo = 30`, `offset = 0,0`.

Previous focused R1 runtime checkpoint: required `synthetic-imported-superpause-dynamic-anim-pos.json` checksum `e6bfbf75` / final checksum `eb49d9db` promotes bounded imported dynamic `SuperPause anim/pos` telemetry into `pnpm qa:trace`. The route seeds `var(6)=7001`, `var(7)=18`, and `var(8)=-36`, then executes `SuperPause anim = var(6)` and `pos = var(7),var(8)`. Required evidence proves `variable:varset`, `pause:superpause`, match-pause/freeze, and `superAnim` metadata `raw = var(6)`, `source = fightfx`, `actionNo = 7001`, `offset = 18,-36`.

Previous focused R1 runtime checkpoint: required `synthetic-imported-superpause-anim-pos.json` checksum `f7dcdc9d` / final checksum `7bd4afe8` promotes bounded imported explicit `SuperPause anim/pos` telemetry into `pnpm qa:trace`. The route executes `SuperPause anim = S200` and `pos = 24,-48`, and required evidence proves `superAnim` metadata `raw = S200`, `source = player`, `actionNo = 200`, `offset = 24,-48`. That checkpoint passed 461/461 artifacts, 431 required and 30 optional.

Previous focused R1 runtime checkpoint: required `synthetic-imported-superpause-dynamic-params.json` current checksum `052bb481` / final checksum `1847a3f3` promotes bounded imported `SuperPause time/movetime/darken/poweradd` expression fallback into `pnpm qa:trace`. The route seeds `var(2)=9`, `var(3)=2`, `var(4)=0`, and `var(5)=75`, then executes `SuperPause time = var(2), movetime = var(3), darken = var(4), poweradd = var(5)`. Required evidence proves `pause:superpause`, match-pause/freeze, P1 source-movetime advance, `darken = false`, max remaining `9`, max move time `2`, and final P1 power `75`. Its current checksum includes default `superAnim` metadata from the default-anim cut. This is bounded dynamic SuperPause numeric-param telemetry only; typed-operation lowering for dynamic pause params, bottom-to-zero exactness, Pause-over-Pause/SuperPause preemption/delay, `pausebg`, `unhittable`, super backgrounds, helper/team/redirect ownership, score movement, and full pause VM parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-superpause-p2defmul.json` current checksum `ec1ba95e` / final checksum `6d009665` promotes bounded imported `SuperPause p2defmul = 2` target damage scaling into `pnpm qa:trace`. The route starts SuperPause after direct target memory exists, requires match-pause/freeze plus P1 source-movetime evidence, then runs `TargetLifeAdd -20` while P2 is under temporary damage multiplier `0.5`; final P2 life `953` proves the target controller applied `-10` after the initial hit left P2 at `963`. Its current checksum includes default `superAnim` metadata from the default-anim cut. This is bounded positive-p2defmul current-target damage telemetry only; `p2defmul = 0` / `Super.TargetDefenceMul`, exact recovery lifetime, stacking, helper/redirect/multi-target ownership, score movement, and full super damage-scaling parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-superpause-sound.json` current checksum `de3ac4b2` / final checksum `6e227fe6` promotes bounded imported `SuperPause sound = Svar(0),var(1)` group/index params into `pnpm qa:trace`. The route seeds `var(0)=10` and `var(1)=0`, starts `SuperPause`, requires match-pause/freeze evidence, and emits attacker-side `PlaySnd` group `10`, index `0`, raw `Svar(0),var(1)` while typed `audio:*` operation evidence stays absent. Its current checksum includes default `superAnim` metadata from the default-anim cut. Official Elecbyte 1.1 State Controller Reference was checked for `SuperPause sound = snd_grp, snd_no` and numeric controller-expression behavior. This is bounded SuperPause sound telemetry only; exact common/player SND archive lookup, channel priority/timing/mixing, super-background audio, helper/redirect ownership, score movement, and full audio parity are not claimed.

Previous focused R1 runtime checkpoint, superseded by the current typed contact-audio cut: required `synthetic-imported-hitdef-dynamic-guardsound.json` previously checksumed `cb061b1c` / final checksum `8d25e54e` as guarded direct-contact `HitDef guardsound = Fvar(0),var(1)` sound-event fallback without typed `audio:*` operation evidence. The current checksum `bb38362a` / final checksum `3e0ddeb0` keeps attacker-side guard contact `PlaySnd` group `6`, index `4`, raw `Fvar(0),var(1)`, contact kind `guard`, and `soundPrefix = kfm` while adding typed `audio:playsnd` evidence for `F6,4`.

Previous focused R1 runtime checkpoint: required `synthetic-imported-sound-dynamic-value.json` checksum `cd0bf458` / final checksum `0ded35cd` promotes bounded active imported dynamic `PlaySnd value` group/index params into `pnpm qa:trace`. The route seeds `var(0)=5` and `var(1)=3`, then executes `PlaySnd value = Fvar(0),var(1), channel = 4`. Required sound events prove `PlaySnd` group `5`, index `3`, channel `4`, and `soundPrefix = kfm`; typed `audio:*` operation evidence stays absent while `variable:varset` and `hitdef` evidence remain present. That checkpoint passed 455/455 artifacts, 425 required and 30 optional. Official Elecbyte 1.1 State Controller Reference was checked for `PlaySnd value`, F-prefixed common/fight sound refs, and numeric controller-expression behavior. This is bounded active-state dynamic sound-ref telemetry only; SuperPause sound refs, typed-operation lowering for dynamic audio params, exact Web Audio archive lookup/panning/channel priority/timing/mixing, helper/redirect ownership, score movement, and full audio parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-sound-dynamic-pan.json` checksum `24c0cce2` / final checksum `dea16ed4` promotes bounded active imported dynamic `PlaySnd` / `SndPan` / `StopSnd` numeric params into `pnpm qa:trace`. The route seeds `var(0)=-24`, `var(1)=2`, and `var(2)=64`, then executes `PlaySnd value = S5,2, channel = var(1), pan = var(0)`, `SndPan channel = var(1), abspan = var(2)`, and `StopSnd channel = var(1)`. Required sound events prove `PlaySnd` channel `2` pan `-24`, `SndPan` channel `2` absPan `64`, and `StopSnd` channel `2`; typed `audio:*` operation evidence stays absent while `variable:varset` and `hitdef` evidence remain present. That checkpoint passed 454/454 artifacts, 424 required and 30 optional. Official Elecbyte 1.1 State Controller Reference was checked for `SndPan`, `StopSnd`, `PlaySnd` panning linkage, and numeric controller-expression behavior. This is bounded active-state dynamic audio numeric telemetry only; typed-operation lowering for dynamic audio params, exact Web Audio panning, channel priority/timing/mixing, helper/redirect ownership, score movement, and full audio parity are not claimed.

Previous focused R1 runtime checkpoint, superseded by the current typed telemetry cut: required `synthetic-imported-playerpush-dynamic.json` previously checksumed `13c5f954` / final checksum `0627d0e5` as bounded active imported dynamic `PlayerPush value` body-push-only fallback. Current required checksum `b7775652` / final checksum `92aca1cd` preserves the same `var(0)=0` and `playerPush = false` evidence while requiring typed `collision:playerpush` operation telemetry after runtime expression resolution.

Previous focused R1 runtime checkpoint, superseded by the current typed telemetry cut: required `synthetic-imported-width-dynamic.json` previously checksumed `79baa5de` / final checksum `395b0b1a` as bounded active imported dynamic `Width player` body-width-only fallback. Current required checksum `51554c91` / final checksum `84a85277` preserves the same `var(0)=21`, `var(1)=43`, and `front = 21`, `back = 43` evidence while requiring typed `collision:width` operation telemetry after runtime expression resolution.

Superseded focused R1 runtime checkpoint: required `synthetic-imported-envcolor-dynamic.json` previously checksumed `dbe548a7` / final checksum `2ff8dd42` promoted bounded active imported dynamic `EnvColor value/time/under` fallback into `pnpm qa:trace` without typed `envcolor` operation evidence. Current checksum `845c3d5e` / final checksum `282fc77f` upgrades the same route to require typed `envcolor` telemetry after runtime expression resolution while retaining stage-frame color telemetry `32,128,240` with `under = true`. `pnpm qa:trace` verifies 523/523 artifacts, 492 required and 31 optional. Official Elecbyte State Controller and CNS docs were checked for `EnvColor value/time/under` and numeric controller-expression behavior. This is bounded active-state dynamic EnvColor stage-flash telemetry only; exact MUGEN/IKEMEN blend math, layer/window behavior, pause timing, renderer parity, score movement, and full presentation parity are not claimed.

Current focused R1 runtime checkpoint: required `synthetic-imported-envshake-dynamic.json` checksum `e1bf593f` / final checksum `8f52f1f4` promotes bounded active imported dynamic `EnvShake time/freq/ampl/phase` into typed telemetry in `pnpm qa:trace`. The route seeds `var(0)=18`, `var(1)=45`, `var(2)=-9`, and `fvar(0)=0.25`, executes `EnvShake time = var(0), freq = var(1), ampl = var(2), phase = fvar(0)`, then requires runtime env-shake telemetry `time = 18`, `freq = 45`, `ampl = -9`, and `phase = 0.25`; typed `envshake` operation evidence is now present beside `variable:varset` and `hitdef` evidence. That checkpoint passed 523/523 artifacts, 492 required and 31 optional. Official Elecbyte 1.1 State Controller Reference was checked for `EnvShake time/freq/ampl/phase`. This is bounded active-state dynamic EnvShake typed telemetry only; `mul`, exact MUGEN/IKEMEN camera waveform, pause/stage/layer interaction, helper ownership, screenpack ownership, score movement, and full presentation parity are not claimed.

Superseded focused R1 runtime checkpoint: required `synthetic-imported-anglemul-dynamic.json` previously checksumed `418ed880` / final checksum `4a6a3045` proved bounded active imported dynamic `AngleMul value` fallback without typed `sprite-effect:angleset` / `sprite-effect:anglemul` evidence. Current checksum `0bb54a1c` / final checksum `c9f2b557` upgrades the same route to require typed `sprite-effect:angleset`, `sprite-effect:anglemul`, and `sprite-effect:angledraw` telemetry after runtime expression resolution while retaining imported actor-frame `renderAngle = 45`. Official Elecbyte 1.1 State Controller Reference was checked for `AngleMul value`, defined as an `angle_multiplier` float that multiplies the drawing angle used by `AngleDraw`. This is bounded active-state dynamic AngleMul typed sprite-effect telemetry only; exact MUGEN/IKEMEN axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, score movement, and full presentation parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-anglemul.json` checksum `e0dae072` / final checksum `5048aa5c` promotes bounded active imported static `AngleMul value` lowering into `pnpm qa:trace`. The route executes `AngleSet value = 30`, `AngleMul value = 1.5`, and `AngleDraw`, then requires imported actor-frame telemetry `renderAngle = 45` with typed `sprite-effect:angleset`, `sprite-effect:anglemul`, and `sprite-effect:angledraw` operation evidence. That checkpoint passed 448/448 artifacts, 418 required and 30 optional. This is bounded active-state static AngleMul render telemetry only; exact MUGEN/IKEMEN axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, score movement, and full presentation parity are not claimed.

Superseded focused R1 runtime checkpoint: required `synthetic-imported-angle-dynamic.json` previously checksumed `8f788bf8` proved bounded active imported dynamic `AngleSet value`, `AngleAdd value`, and `AngleDraw value/scale` expression fallback without typed `sprite-effect:angle*` evidence. Current checksum `13560dcd` / final checksum `4d7c4726` upgrades the same route to require typed `sprite-effect:angleset`, `sprite-effect:angleadd`, and `sprite-effect:angledraw` telemetry after runtime expression resolution while retaining imported actor-frame/final `renderAngle = 35` plus `renderScale = 2,0.5`. Official Elecbyte 1.1 State Controller Reference was checked for `AngleSet value`, `AngleDraw value`, `AngleDraw scale`, and collision-box non-rotation wording. This is bounded active-state dynamic Angle typed sprite-effect telemetry only; exact MUGEN/IKEMEN axis pivot, collision rotation/scale, draw-order interaction, palette interaction, renderer parity, helper/redirect ownership, score movement, and full presentation parity are not claimed.

Superseded focused R1 runtime checkpoint: required `synthetic-imported-afterimagetime-dynamic.json` previously checksumed `16edc106` promoted bounded active imported dynamic `AfterImageTime value/time` expression fallback into `pnpm qa:trace` without typed operation evidence. Current checksum `c5ef6fff` / final checksum `661a233d` upgrades the same route to require `sprite-effect:afterimagetime` after runtime expression resolution while retaining imported actor-frame/final ghost-trail telemetry. Official Elecbyte 1.1 State Controller Reference was checked for `AfterImageTime time`, alternate `value`, and numeric controller-expression behavior. This is bounded active-state dynamic AfterImageTime ghost-trail duration telemetry only; exact no-active-afterimage behavior, trail blending, palette math, sampling cadence, renderer parity, helper/redirect ownership, score movement, and full presentation parity are not claimed.

Current focused R1 runtime checkpoint: required `synthetic-imported-afterimage-dynamic.json` trace checksum `e7299ac5` / final checksum `b946d805` upgrades bounded active imported dynamic `AfterImage` expression evidence into typed `sprite-effect:afterimage` telemetry. The route seeds owner-local `var(0..7)`, executes `AfterImage time/length/timegap/framegap/paladd/palmul` from expressions with `trans = add`, and requires imported actor-frame/final telemetry `afterImageTime = 18`, `afterImageLength = 5`, `afterImageTimeGap = 2`, `afterImageFrameGap = 3`, at least one ghost-trail sample, opacity `0.34`, and typed operation evidence after runtime expression resolution. `RuntimeSpriteEffectControllerWorld` resolves dynamic AfterImage through `resolveRuntimeAfterImageControllerOperation`; `PlayableMatchRuntime` resolves scalar/triplet params through the same active expression context used by controller params. That checkpoint passed `pnpm qa:trace` 523/523 artifacts, 492 required and 31 optional. Official Elecbyte State Controller Reference was checked for `AfterImage` params and numeric controller-expression behavior. This is bounded active-state dynamic AfterImage ghost-trail telemetry only; exact trail blending, palette math, sampling cadence, renderer parity, helper/redirect ownership, score movement, and full presentation parity are not claimed.

Superseded focused R1 runtime checkpoint: required `synthetic-imported-trans-dynamic.json` previously checksumed `91a7baf9` promoted bounded active imported dynamic `Trans alpha` expression fallback into `pnpm qa:trace` without typed operation evidence. Current checksum `4bffcd82` / final checksum `5beea0f0` upgrades the same route to require `sprite-effect:trans` after runtime expression resolution while retaining imported actor-frame/final `renderOpacity = 0.375`. `RuntimeSpriteEffectControllerWorld` forwards a dynamic alpha resolver into `RuntimeSpriteEffectWorld.applyTrans`; `PlayableMatchRuntime` resolves the alpha pair through the same active expression context used by controller params. `pnpm qa:trace` now passes 523/523 artifacts, 492 required and 31 optional. Official Elecbyte 1.1 State Controller Reference was checked for `Trans alpha` and numeric controller-expression behavior. This is bounded active-state dynamic Trans opacity evidence only; dynamic typed lowering for other sprite-effect params, exact add/sub alpha math, palette/remap interaction, draw-order parity, renderer parity, helper/redirect ownership, score movement, and full presentation parity are not claimed.

Superseded focused R1 runtime checkpoint: required `synthetic-imported-palfx-dynamic.json` previously checksumed `c56e955a` promoted bounded active imported dynamic `PalFX time/add/mul/color/invertall` expression fallback into `pnpm qa:trace` without typed operation evidence. Current checksum `36cdca15` / final checksum `7a1a4525` upgrades the same route to require `sprite-effect:palfx` after runtime expression resolution while retaining imported actor-frame/final palette-effect telemetry. Official Elecbyte 1.1 State Controller Reference was checked for `PalFX` params and numeric controller-expression behavior. This is bounded active-state dynamic PalFX evidence only; `sinadd`, exact palette math/blend/remap order, ACT/SFF pixel parity beyond existing bounded handoff, renderer parity, helper/redirect ownership, score movement, and full presentation parity are not claimed.

Superseded focused R1 runtime checkpoint: required `synthetic-imported-sprpriority-dynamic.json` previously checksumed `b57c1bfa` proved bounded active imported dynamic `SprPriority value` expression fallback without typed operation evidence. The current checksum `a9e0862d` / final checksum `4919326d` upgrades the same route to require typed `sprite-effect:sprpriority` telemetry after runtime expression resolution while preserving actor-frame/final `spritePriority = 4`.

Superseded focused R1 runtime checkpoint: required `synthetic-imported-remappal-dynamic.json` previously checksumed `a44ec542` promoted bounded active imported dynamic `RemapPal source/dest` expression fallback into `pnpm qa:trace` without typed operation evidence. Current checksum `5f04f2d4` / final checksum `71ad06f0` upgrades the same route to require `sprite-effect:remappal` after runtime expression resolution while retaining imported actor-frame/final `paletteRemap source [1,5] -> dest [2,7]`. `RuntimeSpriteEffectControllerWorld` forwards a dynamic pair resolver into `RuntimeSpriteEffectWorld.applyRemapPal`; `PlayableMatchRuntime` resolves the pair through the active expression context. Official Elecbyte 1.1 State Controller Reference was checked for `RemapPal source/dest` and numeric controller-expression behavior. This is bounded active-state dynamic RemapPal evidence only; exact source-bank/default/removal semantics, ACT/SFF pixel parity, truecolor/PNG remap, helper/redirect ownership, exact PalFX order/math, renderer parity, score movement, and full palette parity are not claimed.

Previous focused R2 runtime ownership checkpoint: active-state `RemapPal` now routes through `RuntimeSpriteEffectControllerWorld` as a sprite-effect side effect. `StateProgramExecutor` classifies `RemapPal` as side-effect `remappal`, `RuntimeActiveSideEffectDispatchWorld` forwards it through `spriteEffect`, and `RuntimeSpriteEffectWorld.applyRemapPal` owns bounded `paletteRemap` mutation from typed `sprite-effect:remappal` operations or raw params while `StateControllerExecutor` preserves dynamic raw fallback. Focused verification passed 4 files / 68 tests. Official Elecbyte 1.1 State Controller Reference was checked for `RemapPal source/dest`. This is ownership cleanup only; exact source-bank/default/removal semantics, truecolor/PNG remap, helper/redirect ownership, exact PalFX order, score movement, and full palette parity are not claimed.

Previous focused R1 AssertSpecial checkpoint: required `synthetic-imported-assertspecial-juggle-telemetry.json` checksum `9436dfa0` promotes bounded official `AssertSpecial NoJuggleCheck` telemetry into `pnpm qa:trace`. Static `NoJuggleCheck` lowers into typed `assertspecial` operation evidence, runtime execution stores `noJuggleCheck`, and final imported actor evidence requires normalized `assertSpecialFlags: ["nojugglecheck"]`. `pnpm qa:trace` now passes 440/440 artifacts, 410 required and 30 optional. Official Elecbyte `AssertSpecial` docs list `nojugglecheck`. This is bounded parser/normalization/runtime/final-actor telemetry only; juggle-point accounting, actual juggle bypass behavior, helper/team/global ownership, pause layering, score movement, and full MUGEN/IKEMEN juggle parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-localcoord-default-bounds-terminal.json` checksum `af7ee80e` / final checksum `3fcb4661` and `synthetic-imported-helper-projectile-localcoord-default-bounds-terminal.json` checksum `46b0164c` / final checksum `b1531c44` promote bounded 640x480 character `localcoord` omitted Projectile bounds defaults into `pnpm qa:trace`. Parsed `[Info] localcoord = 640,480` reaches imported fighter definitions, player-owned Projectile spawns, and helper-parented/root-owned Projectile spawns; omitted defaults derive `projedgebound = 80`, `projstagebound = 80`, and `projheightbound = -480,2`, while explicit bounds remain authored. `pnpm qa:trace` now passes 497/497 artifacts, 467 required and 30 optional; focused runtime verification passes. Official Elecbyte Coordinate Space and State Controller docs were checked for character `localcoord`, width-ratio coordinate translation, 480p omitted Projectile defaults, and Helper-created Projectiles becoming root-owned. This is bounded localcoord-derived default-bound evidence only; exact GameWidth/GameHeight negotiation, exact camera/screen/stage split, full localcoord scaling across all Projectile params/controllers, exact terminal timing, exact sprite/layer/palette parity, team/simul breadth, score movement, and full Projectile bounds parity are not claimed. Previous helper/player 240p default-bound gates remain required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projtime-same-id-hit-then-guard.json` checksum `f4c1da3b` promotes bounded helper-local same-ID `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` hit-then-guard last-contact-kind arbitration into `pnpm qa:trace`. A visual Helper spawns two helper-parented owner-side Projectiles with id `8917`; both are root-owned by `p1` and parented to `p1-helper-0`. The first contact hits, the second is guarded later, and helper route `1200 -> 1303 -> 1304` requires fixed-id plus ID `0` guard/contact time reads while fixed-id plus ID `0` hit time reads stay inactive. Forbidden helper trap state `1305` proves stale helper-local same-id hit time does not survive the later guard. Runtime fix: helper-local `runtimeHelperProjectileContactTime` now selects the latest helper-parented Projectile contact for the requested id/any-id before checking hit vs guard kind. Evidence includes two Projectile controller/op executions, two helper-parented Projectile lifecycle rows, root owner target-link id `8917`, hit package `S5,32` / `F7037` / `sparkxy = 33,-75`, and guard package `S6,33` / `F7037` / `sparkxy = 34,-76`. That checkpoint passed 438/438 artifacts, 408 required and 30 optional. This is bounded helper-local owner-side same-ID hit-then-guard timing evidence only; exact Proj* tick order/lifetime, helper custom-state breadth beyond this route, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, visual/audio parity beyond bounded packages, score movement, and full MUGEN/IKEMEN Projectile parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-projtime-same-id-hit-then-guard.json` checksum `d49ee334` promotes bounded player-owned same-ID `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` hit-then-guard last-contact-kind arbitration into `pnpm qa:trace`. P1 spawns two Projectiles with id `8916`; the first hits, the second is guarded later, and owner routes `200 -> 383 -> 384` through fixed-id plus ID `0` guard/contact time reads while fixed-id plus ID `0` hit time reads stay inactive. Forbidden trap state `385` proves stale same-id hit time does not survive the later guard. Evidence includes two Projectile controller/op executions, two Projectile payloads/lifecycle rows, owner target-link id `8916`, hit package `S5,30` / `F7036` / `sparkxy = 31,-73`, and guard package `S6,31` / `F7036` / `sparkxy = 32,-74`. That checkpoint passed 437/437 artifacts, 407 required and 30 optional. Official Elecbyte docs define `Proj*Time` as last-projectile-contact reads where ID `0` skips projectile-ID filtering; Elecbyte CNS docs list legacy forms as superseded by `Proj*Time`. This is bounded two-contact same-id owner-state timing evidence only; exact Proj* tick order/lifetime, helper custom-state breadth, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, visual/audio parity beyond bounded packages, score movement, and full MUGEN/IKEMEN Projectile parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-projtime-same-id-last-contact.json` checksum `fb4c2450` promotes bounded player-owned same-ID `ProjHitTime` / `ProjContactTime` / `ProjGuardedTime` guard-then-hit last-contact-kind arbitration into `pnpm qa:trace`. P1 spawns two Projectiles with id `8915`; the first is guarded, the second hits later, and owner routes `200 -> 380 -> 381` through fixed-id plus ID `0` hit/contact time reads while fixed-id plus ID `0` guarded time reads stay inactive. Forbidden trap state `382` proves stale same-id guard time does not survive the later hit. Evidence includes two Projectile controller/op executions, two Projectile payloads/lifecycle rows, owner target-link id `8915`, guard package `S6,28` / `F7035` / `sparkxy = 29,-71`, and hit package `S5,29` / `F7035` / `sparkxy = 30,-72`. That checkpoint passed 436/436 artifacts, 406 required and 30 optional. Official Elecbyte docs define `Proj*Time` as last-projectile-contact reads where ID `0` skips projectile-ID filtering; Elecbyte CNS docs list legacy forms as superseded by `Proj*Time`. This remains required as the guard-then-hit half of the same-id pair; exact Proj* tick order/lifetime, helper Projectile/custom-state persistence breadth, Move* interaction breadth, redirects, teams, helper-owned custom-state targets, broader same-id/multi-target arbitration, visual/audio parity beyond bounded packages, score movement, and full MUGEN/IKEMEN Projectile parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-localcoord-default-bounds-terminal.json` checksum `af7ee80e` / final checksum `3fcb4661` and `synthetic-imported-helper-projectile-localcoord-default-bounds-terminal.json` checksum `46b0164c` / final checksum `b1531c44` promote bounded 640x480 character `localcoord` omitted Projectile bounds defaults into `pnpm qa:trace`. Parsed `[Info] localcoord = 640,480` reaches imported fighter definitions, player-owned Projectile spawns, and helper-parented/root-owned Projectile spawns; omitted defaults derive `projedgebound = 80`, `projstagebound = 80`, and `projheightbound = -480,2`, while explicit bounds remain authored. `pnpm qa:trace` now passes 497/497 artifacts, 467 required and 30 optional; focused runtime verification passes. Official Elecbyte Coordinate Space and State Controller docs were checked for character `localcoord`, width-ratio coordinate translation, 480p omitted Projectile defaults, and Helper-created Projectiles becoming root-owned. This is bounded localcoord-derived default-bound evidence only; exact GameWidth/GameHeight negotiation, exact camera/screen/stage split, full localcoord scaling across all Projectile params/controllers, exact terminal timing, exact sprite/layer/palette parity, team/simul breadth, score movement, and full Projectile bounds parity are not claimed. Previous helper/player 240p default-bound gates remain required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-projhit-multi-id.json` checksum `ab0f3fb3` and `synthetic-imported-projectile-projguarded-multi-id.json` checksum `023921e3` prove bounded player-owned Projectile `ProjHit` / `ProjGuarded` multi-id arbitration. That checkpoint passed 432/432 artifacts, 402 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-projcontact-multi-id.json` checksum `e790ec3e` proves bounded player-owned Projectile `ProjContact` multi-id arbitration through owner `200 -> 362 -> 363`. That checkpoint passed 430/430 artifacts, 400 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-projcontact-suffix-any.json` checksum `2fb80418` proves bounded Elecbyte omitted-ID / ID `0` any-projectile `ProjContact` suffix syntax through owner `200 -> 360 -> 361`. That checkpoint passed 429/429 artifacts, 399 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-projhit-suffix-any.json` checksum `35ffd57d` and `synthetic-imported-projectile-projguarded-suffix-any.json` checksum `4000bc4f` prove bounded omitted-ID / ID `0` any-projectile `ProjHit` and `ProjGuarded` suffix syntax through owner `200 -> 356 -> 357` and `200 -> 358 -> 359`. That checkpoint passed 428/428 artifacts, 398 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-projhit-suffix.json` checksum `dd3db5ee` and `synthetic-imported-projectile-projguarded-suffix.json` checksum `80bbe439` prove bounded fixed-id `ProjHit[ID] = value, [oper] value2` and `ProjGuarded[ID] = value, [oper] value2` syntax through owner `200 -> 352 -> 353` and `200 -> 354 -> 355`. That checkpoint passed 426/426 artifacts, 396 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-projcontact-suffix.json` checksum `c904ded7` proves bounded Elecbyte legacy `ProjContact[ID] = value, [oper] value2` suffix syntax through owner `200 -> 350 -> 351` after guarded Projectile id `8897` contact with active projectile payload, owner target-link, guard sound, and FightFX package evidence. That checkpoint passed 424/424 artifacts, 394 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-projcontactpersist.json` checksum `8e678b1b` promotes bounded player-owned Projectile `ProjContact` state-transition support into `pnpm qa:trace`. P1 spawns Projectile id `8896` with `projremove = 0`, P2 guards it, owner state `200` observes `ProjContact(8896)` / `ProjContactTime(8896)`, transitions into state `348`, and branches to state `349` from that later owner `StateDef` with active post-contact projectile payload, owner target-link, guard sound, and FightFX spark package evidence. That checkpoint passed 423/423 artifacts, 393 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projcontactpersist.json` checksum `65639428` promotes bounded helper Projectile `ProjContact` state-transition support into `pnpm qa:trace`. A visual Helper spawns helper-parented owner-side Projectile id `8895`, P2 guards it, helper state `1300` observes `ProjContact(8895)` / `ProjContactTime(8895)`, transitions into helper state `1302`, and branches to helper state `1301` from that later StateDef with helper/projectile lifecycle and owner target-link evidence. That checkpoint passed 422/422 artifacts, 392 required and 30 optional, and remains required. This is bounded helper-local ProjContact/ProjContactTime state-transition evidence only; exact helper Projectile contact lifetime/order, multi-projectile selection, helper-owned custom-state targets, visual/audio parity beyond the bounded guard contact package, score movement, and full helper Projectile parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-movereversedpersist.json` checksum `ef8ffdf5` promotes bounded helper-owned reversed `StateDef movehitpersist` support into `pnpm qa:trace`. The route proves a helper-local direct `HitDef` can be countered by defender-side `ReversalDef`, record helper-side `MoveReversed`, transition into helper state `1232` with `movehitpersist = 1`, keep `MoveReversed >= 1` readable while `MoveContact = 0`, `MoveHit = 0`, `MoveGuarded = 0`, `HitCount = 0`, and `UniqHitCount = 0`, and branch helper `1200 -> 1232 -> 1233` with P2 reversal state `779` evidence. That checkpoint passed 421/421 artifacts, 391 required and 30 optional, and remains required. This is bounded helper-owned reversed Move* state-transition evidence only; helper Projectile/custom-state movehitpersist breadth, exact reversal priority/target-state semantics, multi-hit/multi-target/team counting, chain-hit eligibility arbitration, exact helper hitpause/target lifetime, visual/audio parity beyond the bounded reversal route, score movement, and full MUGEN/IKEMEN helper Move* lifetime parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-moveguardedpersist.json` checksum `d5ce7897` promotes bounded helper-owned guarded `StateDef movehitpersist` support into `pnpm qa:trace`. That checkpoint passed 420/420 artifacts, 390 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-movehitpersist.json` checksum `2354ef95` promotes bounded helper-owned hit `StateDef movehitpersist` support into `pnpm qa:trace`. The route proves a helper-local `HitDef` contact can record helper-side `MoveContact` / `MoveHit`, transition into helper state `1228` with `movehitpersist = 1`, keep `MoveContact >= 1 && MoveHit >= 1` readable while `HitCount = 0 && UniqHitCount = 0`, and branch helper `1200 -> 1228 -> 1229` with helper-owned sound/FightFX contact evidence. That checkpoint passed 419/419 artifacts, 389 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-hitcountpersist.json` checksum `fc9588d8` promotes bounded helper-owned `StateDef hitcountpersist` support into `pnpm qa:trace`. The route proves a helper-local `HitDef` contact can record helper-side `HitCount` / `UniqHitCount`, transition into helper state `1226` with `hitcountpersist = 1`, keep `HitCount >= 1 && UniqHitCount >= 1` readable while `MoveHit = 0`, and branch helper `1200 -> 1226 -> 1227` with helper-owned sound/FightFX contact evidence. That checkpoint passed 418/418 artifacts, 388 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-hitdefpersist.json` checksum `9d5c64c4` promotes bounded helper-owned `StateDef hitdefpersist` support into `pnpm qa:trace`. The route proves a helper-local `HitDef` can activate in helper state `1200`, transition into helper state `1224` with `hitdefpersist = 1`, remain active there, hit from the destination state with helper-owned sound/FightFX evidence, and branch helper `1200 -> 1224 -> 1225`. That checkpoint passed 417/417 artifacts, 387 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitdefpersist.json` checksum `4bb3e86c` promotes bounded direct `StateDef hitdefpersist` support into `pnpm qa:trace`. The route proves a direct `HitDef` can activate in state `200`, transition into state `346` with `hitdefpersist = 1`, remain active there, hit from the destination state, and branch P1 `200 -> 346 -> 347`. That checkpoint passed 416/416 artifacts, 386 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-movehitpersist.json` checksum `5c1ef583` promotes bounded direct `StateDef movehitpersist` support into `pnpm qa:trace`. The route proves a direct `HitDef` contact can record attacker-side `MoveContact` / `MoveHit`, enter state `344` with `movehitpersist = 1`, keep `MoveContact >= 1 && MoveHit >= 1` readable while `HitCount = 0 && UniqHitCount = 0`, and branch P1 `200 -> 344 -> 345`. That checkpoint passed 415/415 artifacts, 385 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitcountpersist.json` checksum `6f032088` promotes bounded direct `StateDef hitcountpersist` support into `pnpm qa:trace`. The route proves a direct `HitDef` contact can record attacker-side `HitCount` / `UniqHitCount`, enter state `342` with `hitcountpersist = 1`, keep `HitCount >= 1 && UniqHitCount >= 1` readable while `MoveHit = 0`, and branch P1 `200 -> 342 -> 343`. That checkpoint passed 414/414 artifacts, 384 required and 30 optional, and remains required.

Current focused R1 runtime checkpoint, upgraded by the player/helper typed-audio cuts: required `synthetic-imported-projectile-hitcount.json` trace checksum `ee8f4e19` / final checksum `0fd4adf8` and `synthetic-imported-helper-projectile-hitcount.json` trace checksum `c8f5dc55` / final checksum `e1569fab` promote bounded player-owned and helper-parented/root-owned Projectile normal-hit attacker-side `HitCount` / `UniqHitCount` contact memory into `pnpm qa:trace`. The player-owned route feeds owner `MoveContact` / `MoveHit` / `HitCount`, records target link `p1 -> p2 / 77`, preserves projectile lifecycle, requires typed `audio:playsnd` with `S5,44` and FightFX `F7002`, and branches P1 to state `341` through `HitCount >= 1 && UniqHitCount >= 1`. The helper-parented route mirrors hit-count memory into the visual helper, records target links `p1 -> p2 / 8893` and `p1-helper-0 -> p2 / 8893`, preserves helper/projectile lifecycle payload evidence, branches helper `1257 -> 1258` through helper-local `HitCount >= 1 && UniqHitCount >= 1`, and now requires typed `audio:playsnd`, helper-local `S5,43`, and FightFX `F7002` package telemetry. Current `pnpm qa:trace` passes 524/524 artifacts, 493 required and 31 optional, and the gates remain required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-gethitvar-hitcount.json` trace checksum `df2619f9` / final checksum `5469bc69` and upgraded `synthetic-imported-helper-projectile-gethitvar-hitcount.json` trace checksum `40ec4f4b` / final checksum `6f15ff30` promote bounded player-owned and helper-parented/root-owned Projectile normal-hit `GetHitVar(hitcount)` metadata from HitDef `numhits` into `pnpm qa:trace`, with player/helper typed `audio:playsnd`, `S5,47/S5,42`, and FightFX `F7002` package telemetry. That checkpoint remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-gethitvar-hitid-chainid.json` trace checksum `4356b5cb` / final checksum `4b270d45` and upgraded `synthetic-imported-helper-projectile-gethitvar-hitid-chainid.json` trace checksum `616e0b2c` / final checksum `0aebcc73` promote bounded player-owned and helper-parented/root-owned Projectile normal-hit `GetHitVar(hitid/chainid)` metadata into `pnpm qa:trace`, with player/helper typed `audio:playsnd`, `S5,46/S5,41`, and FightFX `F7002` package telemetry. That checkpoint remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-gethitvar-hit-metadata.json` trace checksum `8e5df79b` / final checksum `4d078c5d` and upgraded `synthetic-imported-helper-projectile-gethitvar-hit-metadata.json` trace checksum `28afbcea` / final checksum `c960b1cf` promote bounded player-owned and helper-parented/root-owned Projectile normal-hit `GetHitVar(damage/hittime/xvel/yvel)` metadata into `pnpm qa:trace`, with player/helper typed `audio:playsnd`, `S5,45/S5,40`, and FightFX `F7002` package telemetry. That checkpoint remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-guard-slide-stop.json` trace checksum `965c2d12` / final checksum `0973a73c` and `synthetic-imported-helper-projectile-guard-slide-stop.json` trace checksum `6c42a378` / final checksum `df8b7a42` extend the existing direct `synthetic-imported-default-guard-slide-stop.json` guard-control proof to player-owned Projectile and helper-parented Projectile stand-guard routes. That checkpoint passed 405/405 artifacts, 375 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-guard-timing-default.json` trace checksum `859cb873` / final checksum `bae55cbc`, `synthetic-imported-projectile-guard-timing-default.json` trace checksum `21dc44c4` / final checksum `1c3d9c20`, and `synthetic-imported-helper-projectile-guard-timing-default.json` trace checksum `d421498c` / final checksum `1733494a` gate official default `guard.hittime`, `guard.slidetime`, and `guard.ctrltime` derivation for direct `HitDef`, player-owned `Projectile`, and helper-parented `Projectile` stand-guard routes. That checkpoint passed 403/403 artifacts, 373 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-guard-velocity-default.json` trace checksum `e6bd9b40`, `synthetic-imported-projectile-guard-velocity-default.json` trace checksum `b72451a4`, and `synthetic-imported-helper-projectile-guard-velocity-default.json` trace checksum `2067ba99` gate official default `guard.velocity` derivation for direct `HitDef`, player-owned `Projectile`, and helper-parented `Projectile` stand-guard routes. That checkpoint passed 400/400 artifacts, 370 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-guard-cornerpush-default.json` trace checksum `95293bc4`, `synthetic-imported-projectile-guard-cornerpush-default.json` trace checksum `58798e7a`, and `synthetic-imported-helper-projectile-guard-cornerpush-default.json` trace checksum `292b2015` gate bounded default `guard.cornerpush.veloff` derivation. That checkpoint passed 397/397 artifacts, 367 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-down-hit-cornerpush-default.json` trace checksum `04557813`, `synthetic-imported-projectile-down-hit-cornerpush-default.json` trace checksum `b302e3b9`, and `synthetic-imported-helper-projectile-down-hit-cornerpush-default.json` trace checksum `fe0c3ff1` gate bounded default `down.cornerpush.veloff` derivation. That checkpoint passed 394/394 artifacts, 364 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-down-hit-cornerpush.json` trace checksum `b372c07b`, `synthetic-imported-projectile-down-hit-cornerpush.json` trace checksum `5f2a653f`, and `synthetic-imported-helper-projectile-down-hit-cornerpush.json` trace checksum `5231ad5c` gate bounded explicit `down.cornerpush.veloff` runtime selection for direct `HitDef`, player-owned `Projectile`, and helper-parented `Projectile` down-hit routes. That checkpoint passed 391/391 artifacts, 361 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-air-hit-cornerpush-default.json` trace checksum `73129a04`, `synthetic-imported-projectile-air-hit-cornerpush-default.json` trace checksum `9bfae4d6`, and `synthetic-imported-helper-projectile-air-hit-cornerpush-default.json` trace checksum `9c81047d` gate bounded default `air.cornerpush.veloff` derivation for direct `HitDef`, player-owned `Projectile`, and helper-parented `Projectile` air-hit routes. That checkpoint passed 388/388 artifacts, 358 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-air-guard-cornerpush-default.json` trace checksum `c32781ad`, `synthetic-imported-projectile-air-guard-cornerpush-default.json` trace checksum `90f5e385`, and `synthetic-imported-helper-projectile-air-guard-cornerpush-default.json` trace checksum `0271a2b9` gate bounded default `airguard.cornerpush.veloff` support for direct `HitDef`, player-owned `Projectile`, and helper-parented `Projectile` guard routes. That checkpoint passed 385/385 artifacts, 355 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-air-guard-cornerpush.json` trace checksum `9fdb8a81`, `synthetic-imported-projectile-air-guard-cornerpush.json` trace checksum `15f26082`, and `synthetic-imported-helper-projectile-air-guard-cornerpush.json` trace checksum `35d7148b` gate bounded explicit `airguard.cornerpush.veloff` support for direct `HitDef`, player-owned `Projectile`, and helper-parented `Projectile` guard routes. That checkpoint passed 382/382 artifacts, 352 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-air-guard-velocity-default.json` trace checksum `b1710269`, `synthetic-imported-projectile-air-guard-velocity-default.json` trace checksum `bd1a774e`, and `synthetic-imported-helper-projectile-air-guard-velocity-default.json` trace checksum `3351e770` gate bounded official default `airguard.velocity` derivation for direct `HitDef`, player-owned `Projectile`, and helper-parented `Projectile` guard routes. That checkpoint passed 379/379 artifacts, 349 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-air-guard-velocity.json` trace checksum `5ebc1e7b`, `synthetic-imported-projectile-air-guard-velocity.json` trace checksum `0094c369`, and `synthetic-imported-helper-projectile-air-guard-velocity.json` trace checksum `b547dfb3` gate bounded explicit `airguard.velocity = 8,-4` support for direct `HitDef`, player-owned `Projectile`, and helper-parented `Projectile` guard routes. That checkpoint passed 376/376 artifacts, 346 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitoverride-guardflag-forceair-forceguard-keepstate.json` checksum `35fa8224`, `synthetic-imported-projectile-hitoverride-guardflag-forceair-forceguard-keepstate.json` checksum `1fd6c321`, and `synthetic-imported-helper-projectile-hitoverride-guardflag-forceair-forceguard-keepstate.json` checksum `7efa40bb` gate bounded direct/player/helper `HitOverride guardflag` filtering before selected-slot `forceair` / `forceguard` / `keepstate` application. That checkpoint passed 373/373 artifacts, 343 required and 30 optional, and remains required.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitoverride-missonoverride-default-guardflag-filter.json` trace checksum `05725ecb`, `synthetic-imported-projectile-hitoverride-missonoverride-default-guardflag-filter.json` trace checksum `c1402d31`, and `synthetic-imported-helper-projectile-hitoverride-missonoverride-default-guardflag-filter.json` trace checksum `889d77c1` gate bounded default `missonoverride = -1` custom-state HitOverride guardflag filtering. Direct `HitDef` (`p2stateno = 888`) omits `missonoverride`, uses `guardflag = H`, and rejects before target memory, override state entry, owner-backed custom-state `888`, default get-hit, or guard states; P2 stays idle/control with life `1000`. Player-owned Projectile id `77` and helper-parented Projectile id `8882` omit `missonoverride`, use `p2stateno = 889` / `p2getp1state = 1` / `guardflag = H`, skip attr-matching slots `1 -> 776` with `guardflag.not = HA` and `2 -> 778` with `guardflag = A`, select slot `5 -> 779`, emit override telemetry containing `HitOverride slot 5`, suppress projectile custom-state `889`, and end P2 in state/action `779`, life `1000`, moveType `I`; the helper route also records owner/helper target links, helper payload `targetCount = 1`, projectile payload `hasHit = true` / `hitsRemaining = 0`, and suppresses helper branch `1293`. That `pnpm qa:trace` pass was 370/370 artifacts, 340 required and 30 optional. This is bounded direct/player/helper default custom-state guardflag-filter evidence only; exact guard timing/guarded contact semantics, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN HitOverride/custom-state parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitoverride-missonoverride-zero-guardflag-filter.json` trace checksum `058b335f`, `synthetic-imported-projectile-hitoverride-missonoverride-zero-guardflag-filter.json` trace checksum `af29f125`, and `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-guardflag-filter.json` trace checksum `9edbf3d0` gate bounded explicit `missonoverride = 0` custom-state HitOverride guardflag filtering. Direct `HitDef` (`p2stateno = 888`), player-owned Projectile id `77` (`p2stateno = 889`), and helper-parented Projectile id `8881` (`p2stateno = 889`) all use `guardflag = H`; P2 installs attr-matching `HitOverride` slots `1 -> 776` with `guardflag.not = HA`, `2 -> 778` with `guardflag = A`, and `5 -> 779` with `guardflag = H`. All three routes skip slots `1` and `2`, select slot `5`, emit override telemetry containing `HitOverride slot 5`, suppress the custom state, forbid default get-hit/guard states, and end P2 in state/action `779`, life `1000`, moveType `I`; the helper route also records owner/helper target links, helper payload `targetCount = 1`, projectile payload `hasHit = true` / `hitsRemaining = 0`, and suppresses helper branch `1291`. That `pnpm qa:trace` pass was 367/367 artifacts, 337 required and 30 optional. This is bounded direct/player/helper explicit `missonoverride = 0` custom-state guardflag-filter evidence only; exact guard timing/guarded contact semantics, forceair/forceguard priority combinations, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN HitOverride/custom-state parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-slot-priority.json` trace checksum `9a5a149f` plus `synthetic-imported-projectile-hitoverride-missonoverride-zero-slot-priority.json` trace checksum `96b6b7de` gate bounded Projectile explicit `missonoverride = 0` custom-state HitOverride slot priority. The player-owned route fires Projectile id `77` with `p2stateno = 889`, `p2getp1state = 1`, and `missonoverride = 0`; the helper-parented route has a visual Helper spawn owner-side Projectile id `8878` with `parentId = p1-helper-0`, `p2stateno = 889`, `p2getp1state = 1`, and `missonoverride = 0`. P2 installs matching `HitOverride` slots `5 -> 779` and `2 -> 778`; both routes select slot `2`, emit override telemetry containing `HitOverride slot 2`, consume/remove the projectile as a hit, suppress projectile custom state `889`, and end P2 in state/action `778`, life `1000`, moveType `I`; the helper route also records owner/helper target links, helper payload `targetCount = 1`, projectile payload `hasHit = true` / `hitsRemaining = 0`, and suppresses helper `ProjHit` branch `1288`. Required forbidden states are `779`, `889`, `5000`, `150`, and `151` for player-owned plus `1288` for helper-parented. That `pnpm qa:trace` pass was 364/364 artifacts, 334 required and 30 optional. This is bounded player-owned/helper-parented Projectile explicit custom-state slot-priority evidence only; custom-state guardflag breadth beyond the latest explicit route, exact target lifetime, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile HitOverride/custom-state parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json` trace checksum `fb964bfb` gates bounded helper-parented Projectile default `missonoverride = -1` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. A visual Helper spawns owner-side Projectile id `8877` with `parentId = p1-helper-0`, `p2stateno = 889` / `p2getp1state = 1`, and omitted `missonoverride`; P2 installs active `HitOverride` slot `3 -> 780` with `time = 30`, `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records owner target link `p1 -> p2 / 8877` plus helper target link `p1-helper-0 -> p2 / 8877`, consumes/removes the projectile as a hit, selects slot `3`, emits override event/combat telemetry containing `HitOverride slot 3`, records helper payload `targetCount = 1`, records projectile payload `hasHit = true` / `hitsRemaining = 0`, and requires actor-frame evidence where P2 remains in state/action `0` while `stateType = A`, `physics = A`, and `guardingFrames >= 1`. State `780`, projectile custom state `889`, helper `ProjHit` branch `1286`, default get-hit state `5000`, and guard states `150` / `151` are forbidden; final P2 returns to state/action `0`, life `1000`, moveType `I`. The gate requires executed `ChangeState`, `Helper`, `Projectile`, and `HitOverride`, typed `helper` / `projectile` / `hitoverride`, active `x`, owner/helper target-link evidence, helper/projectile lifecycle-payload evidence, override telemetry, the aerial/guarding actor-frame requirement, and final idle/control evidence. That `pnpm qa:trace` pass was 362/362 artifacts, 332 required and 30 optional. This is one bounded helper-parented Projectile default `missonoverride = -1` custom-state forceair/forceguard/keepstate route only; custom-state guardflag inheritance/timing, final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN helper Projectile HitOverride/custom-state parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json` trace checksum `4ce42cf3` gates bounded player-owned Projectile default `missonoverride = -1` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. P1 fires Projectile id `77` with `p2stateno = 889` / `p2getp1state = 1` and omits `missonoverride`; P2 installs active `HitOverride` slot `3 -> 780` with `time = 30`, `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records target link `p1 -> p2 / 77`, consumes/removes the projectile as a hit, selects slot `3`, emits override event/combat telemetry containing `HitOverride slot 3`, and requires actor-frame evidence where P2 remains in state/action `0` while `stateType = A`, `physics = A`, and `guardingFrames >= 1`. State `780`, projectile custom state `889`, default get-hit state `5000`, and guard states `150` / `151` are forbidden; final P2 returns to state/action `0`, life `1000`, moveType `I`. The gate requires executed `ChangeState`, `Projectile`, and `HitOverride`, typed `projectile` / `hitoverride`, active `x`, target-link evidence, projectile lifecycle/payload evidence, override telemetry, the aerial/guarding actor-frame requirement, and final idle/control evidence. That `pnpm qa:trace` pass was 361/361 artifacts, 331 required and 30 optional. This is one bounded player-owned Projectile default `missonoverride = -1` custom-state forceair/forceguard/keepstate route only; custom-state guardflag inheritance/timing, final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile HitOverride/custom-state parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitoverride-missonoverride-default-forceair-forceguard-keepstate.json` trace checksum `20e40425` gates bounded direct-HitDef default `missonoverride = -1` custom-state `HitOverride forceair` / `forceguard` / `keepstate` miss behavior. P1 declares `p2stateno = 888` / `p2getp1state = 1` and omits `missonoverride`; P2 installs active `HitOverride` slot `3 -> 780` with `time = 30`, `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact rejects before target memory, damage, guard, forceair/forceguard actor-frame effects, keepstate redirect handling, override state `780`, owner-backed custom-state `888`, default get-hit state `5000`, or guard states `150` / `151`. State `780`, owner-backed custom state `888`, default get-hit state `5000`, and guard states `150` / `151` are forbidden; final P2 remains state/action `0`, life `1000`, ctrl true, moveType `I`, and no target links are recorded. The gate requires executed `ChangeState`, `HitDef`, and `HitOverride`, typed `hitdef` / `hitoverride`, active `x`, reject event/combat telemetry containing `custom-state HitDef`, forbidden target-link evidence, final idle/control evidence, and no aerial/guarding force-frame evidence. That `pnpm qa:trace` pass was 360/360 artifacts, 330 required and 30 optional. This is one bounded direct default custom-state miss force-flag route only; custom-state guardflag inheritance/timing, final-frame forced aerial persistence on non-rejected routes, exact guarded get-hit variable/chip semantics, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN HitOverride/custom-state parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` trace checksum `e23a33af` gates bounded helper-parented Projectile explicit `missonoverride = 0` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. A visual Helper spawns owner-side Projectile id `8876` with `parentId = p1-helper-0`, `p2stateno = 889`, `p2getp1state = 1`, and `missonoverride = 0`; P2 installs active `HitOverride` slot `3 -> 780` with `time = 30`, `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records owner target link `p1 -> p2 / 8876` plus helper target link `p1-helper-0 -> p2 / 8876`, consumes/removes the projectile as a hit, selects slot `3`, emits override event/combat telemetry containing `HitOverride slot 3`, records helper payload evidence with `targetCount = 1`, records projectile payload evidence with `hasHit = true` / `hitsRemaining = 0`, and requires actor-frame evidence where P2 remains in state/action `0` while `stateType = A`, `physics = A`, and `guardingFrames >= 1`. State `780`, projectile custom state `889`, helper `ProjHit` branch `1284`, default get-hit state `5000`, and guard states `150` / `151` are forbidden; final P2 returns to state/action `0`, life `1000`, moveType `I`. The gate requires executed `ChangeState`, `Helper`, `Projectile`, and `HitOverride`, typed `helper` / `projectile` / `hitoverride`, active `x`, owner/helper target-link evidence, helper/projectile lifecycle payload evidence, override telemetry, the aerial/guarding actor-frame requirement, and final idle/control evidence. That `pnpm qa:trace` pass was 359/359 artifacts, 329 required and 30 optional. This is one bounded helper-parented Projectile explicit `missonoverride = 0` custom-state forceair/forceguard/keepstate route only; custom-state guardflag inheritance/timing, final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN helper Projectile HitOverride/custom-state parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` trace checksum `15bc955b` gates bounded player-owned Projectile explicit `missonoverride = 0` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. P1 fires Projectile id `77` with `p2stateno = 889`, `p2getp1state = 1`, and `missonoverride = 0`; P2 installs active `HitOverride` slot `3 -> 780` with `time = 30`, `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records target link `p1 -> p2 / 77`, consumes/removes the projectile as a hit, selects slot `3`, emits override event/combat telemetry containing `HitOverride slot 3`, and requires actor-frame evidence where P2 remains in state/action `0` while `stateType = A`, `physics = A`, and `guardingFrames >= 1`. State `780`, projectile custom state `889`, default get-hit state `5000`, and guard states `150` / `151` are forbidden; final P2 returns to state/action `0`, life `1000`, moveType `I`. That `pnpm qa:trace` pass was 358/358 artifacts, 328 required and 30 optional. This remains one bounded player-owned Projectile explicit `missonoverride = 0` custom-state forceair/forceguard/keepstate route only; default direct custom-state miss force-flag breadth, custom-state guardflag inheritance/timing, final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile HitOverride/custom-state parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitoverride-missonoverride-zero-forceair-forceguard-keepstate.json` trace checksum `4d9043a5` gates bounded direct-HitDef explicit `missonoverride = 0` custom-state `HitOverride forceair` / `forceguard` / `keepstate` behavior. P1 declares `p2stateno = 888`, `p2getp1state = 1`, and `missonoverride = 0`; P2 installs active `HitOverride` slot `3 -> 780` with `time = 30`, `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records target link `p1 -> p2 / 77`, selects slot `3`, emits override event/combat telemetry containing `HitOverride slot 3`, and requires actor-frame evidence where P2 remains in state/action `0` while `stateType = A`, `physics = A`, and `guardingFrames >= 1`. State `780`, owner-backed custom state `888`, default get-hit state `5000`, and guard states `150` / `151` are forbidden; final P2 returns to state/action `0`, life `1000`, moveType `I`. That `pnpm qa:trace` pass was 357/357 artifacts, 327 required and 30 optional. This is one bounded explicit `missonoverride = 0` direct custom-state forceair/forceguard/keepstate route only; default `missonoverride = -1` custom-state force flag breadth, helper/projectile custom-state force flag breadth, custom-state guardflag inheritance/timing, final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN HitOverride/custom-state parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-forceair-forceguard-keepstate.json` trace checksum `84dc3969` gates bounded helper-parented Projectile `HitOverride forceair` / `forceguard` / `keepstate` behavior. A visual Helper spawns owner-side Projectile id `8875` with `parentId = p1-helper-0`, `p2stateno = 889`, and `p2getp1state = 0`; P2 installs active `HitOverride` slot `3 -> 780` with `time = 30`, `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records owner target link `p1 -> p2 / 8875` plus helper target link `p1-helper-0 -> p2 / 8875`, selects slot `3`, emits override event/combat telemetry containing `HitOverride slot 3`, records projectile payload evidence with `hasHit = true` / `hitsRemaining = 0`, and requires actor-frame evidence where P2 remains in state/action `0` while `stateType = A`, `physics = A`, and `guardingFrames >= 1`. State `780`, projectile custom state `889`, helper `ProjHit` branch `1282`, default get-hit state `5000`, and guard states `150` / `151` are forbidden; final P2 returns to state/action `0`, life `1000`, moveType `I`. The gate requires executed `ChangeState`, `Helper`, `Projectile`, and `HitOverride`, typed `helper` / `projectile` / `hitoverride`, active `x`, owner/helper target-link evidence, helper/projectile lifecycle/payload evidence, override telemetry, the aerial/guarding actor-frame requirement, and final idle/control evidence. That `pnpm qa:trace` pass was 356/356 artifacts, 326 required and 30 optional. This is one bounded helper-parented Projectile forceair/forceguard/keepstate route only; final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN helper Projectile HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-forceair-forceguard-keepstate.json` trace checksum `3806a769` gates bounded player-owned Projectile `HitOverride forceair` / `forceguard` / `keepstate` behavior. P1 fires Projectile id `77` with `p2stateno = 889` / `p2getp1state = 0`; P2 installs active `HitOverride` slot `3 -> 780` with `time = 30`, `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records target link `p1 -> p2 / 77`, selects slot `3`, emits override event/combat telemetry containing `HitOverride slot 3`, records projectile spawn/remove payload evidence, and requires actor-frame evidence where P2 remains in state/action `0` while `stateType = A`, `physics = A`, and `guardingFrames >= 1`. State `780`, projectile custom state `889`, default get-hit state `5000`, and guard states `150` / `151` are forbidden; final P2 returns to state/action `0`, life `1000`, moveType `I`. The gate requires executed `ChangeState`, `Projectile`, and `HitOverride`, typed `projectile` / `hitoverride`, active `x`, target-link evidence, projectile lifecycle/payload evidence, override telemetry, the aerial/guarding actor-frame requirement, and final idle/control evidence. That `pnpm qa:trace` pass was 355/355 artifacts, 325 required and 30 optional. This is one bounded player-owned Projectile forceair/forceguard/keepstate route only; final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitoverride-forceair-forceguard-keepstate.json` trace checksum `19787fb2` gates bounded direct-HitDef `HitOverride forceair` / `forceguard` / `keepstate` behavior. P1 hits with `attr = S,NA`; P2 installs active `HitOverride` slot `3 -> 780` with `time = 30`, `forceair = 1`, `forceguard = 1`, and `keepstate = 1`; contact records target link `p1 -> p2 / 77`, selects slot `3`, emits override event/combat telemetry containing `HitOverride slot 3`, and requires actor-frame evidence where P2 remains in state/action `0` while `stateType = A`, `physics = A`, and `guardingFrames >= 1`. State `780`, default get-hit state `5000`, and guard states `150` / `151` are forbidden; final P2 returns to state/action `0`, life `1000`, moveType `I`. That `pnpm qa:trace` pass was 354/354 artifacts, 324 required and 30 optional. This is one bounded direct-HitDef forceair/forceguard/keepstate route only; final-frame forced aerial persistence, exact guarded get-hit variable/chip semantics, custom-state forceair/forceguard/keepstate breadth, custom-state guardflag inheritance/timing, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-guardflag-filter.json` trace checksum `41a87267` gates bounded helper-parented Projectile `HitOverride guardflag` / `guardflag.not` slot filtering. A visual Helper spawns owner-side Projectile id `8874` with `parentId = p1-helper-0`, `guardflag = H`, `p2stateno = 889`, and `p2getp1state = 0`; P2 installs attr-matching `HitOverride` slot `1 -> 776` with `guardflag.not = HA`, slot `2 -> 778` with `guardflag = A`, and slot `5 -> 779` with `guardflag = H`; contact records owner target link `p1 -> p2 / 8874` plus helper target link `p1-helper-0 -> p2 / 8874`, marks projectile payload `hitsRemaining = 0` / `hasHit = true`, skips slots `1` and `2`, selects slot `5`, redirects P2 through state `779`, keeps P2 life `1000`, and forbids states `776`, `778`, `889`, helper `ProjHit` branch `1280`, `5000`, `150`, and `151`. The gate requires executed `ChangeState`, `Helper`, `Projectile`, and at least three `HitOverride` controllers, typed `helper`, `projectile`, plus at least three `hitoverride` operations, active `x`, helper/projectile lifecycle/payload evidence, owner/helper target-link evidence, override event/combat telemetry containing `HitOverride slot 5`, final P2 state `779`/life `1000`, and forbidden states `776`, `778`, `889`, `1280`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 353/353 artifacts, 323 required and 30 optional. This is one bounded helper-parented Projectile guardflag-filter route only; custom-state guardflag inheritance/timing, custom-state forceair/forceguard/keepstate breadth, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN helper Projectile/HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-guardflag-filter.json` trace checksum `a51e82ec` gates bounded player-owned Projectile `HitOverride guardflag` / `guardflag.not` slot filtering. P1 fires Projectile id `77` with `guardflag = H` and `p2stateno = 889`; P2 installs attr-matching `HitOverride` slot `1 -> 776` with `guardflag.not = HA`, slot `2 -> 778` with `guardflag = A`, and slot `5 -> 779` with `guardflag = H`; contact records target link `p1 -> p2 / 77`, consumes/removes the projectile as a hit, skips slots `1` and `2`, selects slot `5`, redirects P2 through state `779`, keeps P2 life `1000`, and forbids states `776`, `778`, `889`, `5000`, `150`, and `151`. That gate requires executed `ChangeState`, `Projectile`, and at least three `HitOverride` controllers, typed `projectile` plus at least three `hitoverride` operations, active `x`, projectile lifecycle/payload evidence, target-link evidence, override event/combat telemetry containing `HitOverride slot 5`, final P2 state `779`/life `1000`, and forbidden states `776`, `778`, `889`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 352/352 artifacts, 322 required and 30 optional. This is one bounded player-owned Projectile guardflag-filter route only; custom-state guardflag inheritance/timing, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile/HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitoverride-guardflag-filter.json` trace checksum `b88a2da3` gates bounded direct-HitDef `HitOverride guardflag` / `guardflag.not` slot filtering. P1 hits with `attr = S,NA` and `guardflag = H`; P2 installs attr-matching `HitOverride` slot `1 -> 776` with `guardflag.not = HA`, slot `2 -> 778` with `guardflag = A`, and slot `5 -> 779` with `guardflag = H`; contact records target link `p1 -> p2 / 77`, skips slots `1` and `2`, selects slot `5`, redirects P2 through state `779`, keeps P2 life `1000`, and forbids states `776`, `778`, `5000`, `150`, and `151`. The gate requires executed `ChangeState`, `HitDef`, and at least three `HitOverride` controllers, typed `hitdef` plus at least three `hitoverride` operations, active `x`, target-link evidence, override event/combat telemetry containing `HitOverride slot 5`, final P2 state `779`/life `1000`, and forbidden states `776`, `778`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 351/351 artifacts, 321 required and 30 optional. This is one bounded direct-HitDef guardflag-filter route only; custom-state guardflag inheritance/timing, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitoverride-missonoverride-zero-slot-priority.json` trace checksum `92fefd6a` gates bounded direct-HitDef `missonoverride = 0` custom-state slot priority. P1 declares `p2stateno = 888`, `p2getp1state = 1`, and explicit `missonoverride = 0`; P2 installs matching `HitOverride` slot `5 -> 779` and slot `2 -> 778` in high-to-low controller order; contact records target link `p1 -> p2 / 77`, selects slot `2`, redirects P2 through state `778`, keeps P2 life `1000`, and forbids state `779`, owner-backed custom state `888`, and default Common1 states `5000`, `150`, and `151`. The gate requires executed `ChangeState`, `HitDef`, and at least two `HitOverride` controllers, typed `hitdef` plus at least two `hitoverride` operations, active `x`, override event/combat telemetry containing `HitOverride slot 2`, target-link evidence, final P2 state `778`/life `1000`, and forbidden states `779`, `888`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 350/350 artifacts, 320 required and 30 optional. This is one bounded direct-HitDef `missonoverride = 0` slot-priority route only; helper/projectile custom-state slot-priority breadth, helper/projectile `guardflag` / `guardflag.not` edge timing, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-slot-priority.json` trace checksum `1d058518` gates bounded helper-parented Projectile HitOverride slot priority. A visual Helper spawns Projectile id `8873` with `parentId = p1-helper-0`, `p2stateno = 889`, and `p2getp1state = 0`; P2 installs matching `HitOverride` slot `5 -> 779` and slot `2 -> 778` in high-to-low controller order; contact records owner target link `p1 -> p2 / 8873` plus helper target link `p1-helper-0 -> p2 / 8873`, marks projectile payload `hitsRemaining = 0` / `hasHit = true`, selects slot `2`, redirects P2 through state `778`, keeps P2 life `1000`, and forbids state `779`, projectile custom state `889`, helper `ProjHit` branch `1278`, and default Common1 states `5000`, `150`, and `151`. The gate requires executed `ChangeState`, `Helper`, `Projectile`, and at least two `HitOverride` controllers, typed `helper`, `projectile`, plus at least two `hitoverride` operations, active `x`, override event/combat telemetry containing `HitOverride slot 2`, helper/projectile lifecycle/payload evidence, owner/helper target-link evidence, final P2 state `778`/life `1000`, and forbidden states `779`, `889`, `1278`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 349/349 artifacts, 319 required and 30 optional. This is one bounded helper-parented Projectile slot-priority route only; custom-state slot-priority breadth, `guardflag` / `guardflag.not` edge timing, forceair/forceguard/keepstate combinations, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile/HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-slot-priority.json` trace checksum `378d9ce8` gates bounded player-owned Projectile HitOverride slot priority. P2 installs matching `HitOverride` slot `5 -> 779` and slot `2 -> 778` in high-to-low controller order; P1 fires Projectile id `77` with `p2stateno = 889`; contact records target link `p1 -> p2 / 77`, consumes/removes the projectile as a hit, selects slot `2`, redirects P2 through state `778`, keeps P2 life `1000`, and forbids state `779`, projectile custom state `889`, and default Common1 states `5000`, `150`, and `151`. The gate requires executed `ChangeState`, `Projectile`, and at least two `HitOverride` controllers, typed `projectile` plus at least two `hitoverride` operations, active `x`, override event/combat telemetry containing `HitOverride slot 2`, projectile lifecycle/payload evidence, target-link evidence, final P2 state `778`/life `1000`, and forbidden states `779`, `889`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 348/348 artifacts, 318 required and 30 optional. This is one bounded player-owned Projectile slot-priority route only; custom-state slot-priority breadth, `guardflag` / `guardflag.not` edge timing, forceair/forceguard/keepstate combinations, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile/HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitoverride-slot-priority.json` trace checksum `8de62354` gates bounded direct-HitDef HitOverride slot priority. P2 installs matching `HitOverride` slot `5 -> 779` and slot `2 -> 778` in high-to-low controller order; P1 hits with `attr = S,NA`; combat selects slot `2`, redirects P2 through state `778`, keeps P2 life `1000`, and forbids state `779` plus default Common1 states `5000`, `150`, and `151`. The gate requires executed `ChangeState`, `HitDef`, and at least two `HitOverride` controllers, typed `hitdef` plus at least two `hitoverride` operations, active `x`, override event/combat telemetry containing `HitOverride slot 2`, final P2 state `778`/life `1000`, and forbidden states `779`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 347/347 artifacts, 317 required and 30 optional. This is one bounded direct-HitDef slot-priority route only; helper-parented Projectile/custom-state slot-priority breadth, `guardflag` / `guardflag.not` edge timing, forceair/forceguard/keepstate combinations, exact guard KO/no-KO round flow, throws, teams/simul, score movement, and full MUGEN/IKEMEN HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-zero.json` trace checksum `62d7d6b8` gates bounded helper-parented Projectile `missonoverride = 0` HitOverride redirect behavior. A visual Helper spawns Projectile id `8872` with `parentId = p1-helper-0`, `p2stateno = 889`, `p2getp1state = 1`, and explicit `missonoverride = 0`; defender P2 has active matching `HitOverride` slot `777`; contact records owner target link `p1 -> p2 / 8872` plus helper target link `p1-helper-0 -> p2 / 8872`; projectile payload evidence reaches `hitsRemaining = 0` / `hasHit = true`; and P2 redirects through state `777` instead of missing, entering projectile custom state `889`, taking helper `ProjHit` branch `1276`, or default Common1 states `5000`, `150`, and `151`. The gate requires executed `Helper`, `Projectile`, and `HitOverride`, typed `helper`, `projectile`, and `hitoverride`, active `x`, override event/combat telemetry, helper/projectile lifecycle and payload evidence, both target links, final P2 state `777`/life `1000`, and forbidden states `889`, `1276`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 346/346 artifacts, 316 required and 30 optional. This is one bounded helper-parented Projectile `missonoverride = 0` plus HitOverride redirect route only; broader `missonoverride` custom-state breadth, helper/projectile/custom-state slot-priority breadth, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile/HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-missonoverride-zero.json` trace checksum `5c12f3cc` gates bounded player-owned Projectile `missonoverride = 0` HitOverride redirect behavior. A Projectile declares `p2stateno = 889`, `p2getp1state = 1`, and `missonoverride = 0`, defender P2 has active matching `HitOverride` slot `777`, and contact records target id `77`, consumes/removes the projectile as a hit, and redirects P2 through state `777` instead of missing or entering projectile custom state `889`. That `pnpm qa:trace` pass was 345/345 artifacts, 315 required and 30 optional. This is one bounded player-owned Projectile `missonoverride = 0` plus HitOverride redirect route only; helper-parented Projectile `missonoverride = 0` is covered by the latest checkpoint, while broader `missonoverride` custom-state breadth, exact slot priority, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile/HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-missonoverride-one.json` trace checksum `a99979bb` gates bounded helper-parented Projectile `missonoverride = 1` HitOverride miss behavior. A visual Helper spawns Projectile id `8871` with `parentId = p1-helper-0` and `missonoverride = 1`, defender P2 has active matching `HitOverride` slot `777`, and contact rejects before owner/helper target memory, projectile contact consumption, damage, guard, normal HitOverride redirect, helper `ProjHit` branch `1275`, or projectile custom-state entry. The gate requires executed `Helper`, `Projectile`, and `HitOverride`, typed `helper`, `projectile`, and `hitoverride`, active `x`, reject event/combat telemetry, helper/projectile lifecycle and payload evidence, no target links, active projectile payload evidence with `hitsRemaining = 1` / `hasHit = false`, final P2 state `0`/life `1000`/control, and forbidden states `777`, `889`, `1275`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 344/344 artifacts, 314 required and 30 optional. This is one bounded helper-parented Projectile `missonoverride = 1` plus HitOverride miss route only; player-owned/helper-parented Projectile `missonoverride = 0` are covered by later checkpoints, while broader `missonoverride` custom-state breadth, exact slot priority, exact helper/projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile/HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-missonoverride-one.json` trace checksum `2dc86467` gates bounded player-owned Projectile `missonoverride = 1` HitOverride miss behavior. A Projectile declares `missonoverride = 1`, defender P2 has active matching `HitOverride` slot `777`, and contact rejects before target memory, projectile contact consumption, damage, guard, normal HitOverride redirect, or projectile custom-state entry. The gate requires executed `Projectile` and `HitOverride`, typed `projectile` and `hitoverride`, active `x`, reject event/combat telemetry, no target links, active projectile payload evidence with `hitsRemaining = 1` / `hasHit = false`, final P2 state `0`/life `1000`/control, and forbidden states `777`, `889`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 343/343 artifacts, 313 required and 30 optional. This is one bounded player-owned Projectile `missonoverride = 1` plus HitOverride miss route only; helper-parented Projectile `missonoverride = 1` is covered by the latest checkpoint, while `missonoverride = 0` projectile/custom-state breadth, exact slot priority, exact projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile/HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-projectile-hitoverride-p2stateno.json` trace checksum `ce4c1d9a` gates bounded helper-parented owner-side Projectile `p2stateno` HitOverride behavior. A visual Helper spawns Projectile id `8870` with `parentId = p1-helper-0`, `p2stateno = 889`, and `p2getp1state = 0`; defender P2 has active matching `HitOverride` slot `777`; contact records owner target link `p1 -> p2 / 8870` and helper target link `p1-helper-0 -> p2 / 8870`; P2 redirects through state `777` / life `1000` instead of entering projectile custom state `889`, helper `ProjHit` branch `1273`, or default Common1 get-hit/guard states `5000`, `150`, and `151`. The gate requires executed `Helper`, `Projectile`, and `HitOverride`, typed `helper`, `projectile`, and `hitoverride`, active `x`, override event/combat telemetry, helper/projectile lifecycle and payload evidence, both target links, final P2 state `777`/life `1000`, and forbidden states `889`, `1273`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 342/342 artifacts, 312 required and 30 optional. This is one bounded helper-parented Projectile `p2stateno` plus HitOverride redirect route only; player-owned and helper-parented Projectile `missonoverride = 1` are covered by later checkpoints, while `missonoverride = 0` projectile/custom-state breadth, exact slot priority, exact helper-projectile target lifetime/tick order, helper-owned custom-state tables, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile/HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-projectile-hitoverride-p2stateno.json` trace checksum `2ec0725a` gates bounded IKEMEN-style player-owned Projectile `p2stateno` HitOverride behavior. A Projectile declares `p2stateno = 889` / `p2getp1state = 0`, defender P2 has active matching `HitOverride` slot redirecting to state `777`, and contact records target id `77` plus redirects P2 through state `777` instead of taking the direct-HitDef custom-state miss path or entering projectile custom state `889`; the gate requires executed `Projectile` and `HitOverride`, typed `projectile` and `hitoverride`, active `x`, override event/combat telemetry, projectile lifecycle/payload evidence, target link `p1 -> p2 / 77`, final P2 state `777`/life `1000`, and forbids states `889`, `5000`, `150`, and `151`. That `pnpm qa:trace` pass was 341/341 artifacts, 311 required and 30 optional. This is one bounded player-owned Projectile `p2stateno` plus HitOverride redirect route only; projectile `missonoverride` breadth, exact slot priority, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, throws, teams/simul, score movement, and full MUGEN/IKEMEN Projectile/HitOverride parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-hitoverride-p2getp1state-zero-miss.json` trace checksum `656730c8` gates bounded IKEMEN direct `HitDef p2stateno` / `p2getp1state = 0` HitOverride miss behavior. A direct `HitDef` declares `p2stateno = 889` / `p2getp1state = 0`, defender P2 has an active matching `HitOverride` slot redirecting to state `777`, P2-owned state `889` data exists, and contact rejects before target memory, damage, guard, normal HitOverride redirect, or target-owned custom-state entry; the gate requires executed `HitDef` and `HitOverride`, typed `hitdef` and `hitoverride`, active `x`, reject event/combat telemetry, no target links, final P2 state `0`/life `1000`/control, and forbids states `777`, `889`, `888`, `5000`, `150`, and `151`. `pnpm qa:trace` now passes 340/340 artifacts, 310 required and 30 optional. This is one bounded direct-HitDef target-owned `p2getp1state = 0` HitOverride miss route only; helper/projectile `p2stateno`, exact slot priority, helper/projectile `missonoverride` breadth, exact guard KO/no-KO round flow, helper/projectile custom-state guard metadata, throws, teams/simul, score movement, and full MUGEN/IKEMEN HitOverride/custom-state parity are not claimed. Previous focused R1 checkpoint: `synthetic-imported-hitoverride-missonoverride-one.json` checksum `78cfedf4` remains required for bounded IKEMEN `missonoverride = 1` HitOverride miss behavior; `synthetic-imported-hitoverride-missonoverride-zero.json` checksum `8ffd5678` remains required for bounded IKEMEN `missonoverride = 0` HitOverride redirect behavior; `synthetic-imported-hitoverride-p2stateno-miss.json` checksum `6f41eeb1` remains required for default direct-HitDef HitOverride/custom-state miss behavior; `synthetic-imported-p2stateno-guard-ignored.json` checksum `76d1becd` remains required for direct-HitDef successful-guard `p2stateno` ignore behavior, `synthetic-imported-custom-state-gethitvar-guard-kill.json` checksum `c889a534` remains required for direct-HitDef custom-state guard kill metadata after owner-local `TargetState`, `synthetic-imported-helper-projectile-gethitvar-guard-kill.json` checksum `7f9aa699` remains required for helper-parented Projectile guard kill metadata, `synthetic-imported-projectile-gethitvar-guard-kill.json` checksum `3feae5a7` remains required for player-owned Projectile guard kill metadata, `synthetic-imported-gethitvar-air-guard-kill.json` checksum `4382207e` remains required for defender-owned air guard kill metadata, `synthetic-imported-gethitvar-crouch-guard-kill.json` checksum `2976fb8c` remains required for defender-owned crouch guard kill metadata, `synthetic-imported-gethitvar-guard-kill.json` checksum `abb4e468` remains required for defender-owned stand guard kill metadata, and `synthetic-imported-gethitvar-kill.json` checksum `ef5ffabf` remains required for defender-owned normal-hit kill metadata.
Previous focused R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-fall-metadata.json` trace checksum `4a3a1c6b` gates bounded owner-backed custom-state fall damage/kill/velocity metadata evidence. A direct fall `HitDef p2stateno = 888` / `p2getp1state = 1` records target memory plus `fall.damage = 70`, `fall.kill = 0`, `fall.xvel = 3`, and `fall.yvel = -6`, then P2 executes P1-owned state data and branches `888 -> 903` through `GetHitVar(fall) && GetHitVar(fall.damage) = 70 && GetHitVar(fall.kill) = 0 && GetHitVar(fall.xvel) = 3 && GetHitVar(fall.yvel) = -6` before `SelfState` returns to state `0`/control. That `pnpm qa:trace` pass was 328/328 artifacts, 298 required and 30 optional. This is one bounded direct-HitDef fall metadata inheritance route only; exact metadata lifetime/stacking, helper/projectile inheritance, throws, teams/simul, score movement, and full custom-state fall parity are not claimed. Previous focused R1 checkpoint: `synthetic-imported-custom-state-gethitvar-fall-envshake.json` checksum `5c9d1653` remains required for fall envshake metadata inheritance and fall presentation handoff evidence.
Previous focused R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-guard-timing.json` trace checksum `ba77beec` gates bounded owner-backed custom-state guarded timing evidence. A guarded direct `HitDef` records target memory, owner-local `TargetState` sends P2 into P1-owned state data, then `GetHitVar(guarded) = 1 && GetHitVar(slidetime) = 5 && GetHitVar(ctrltime) = 7 && GetHitVar(hitshaketime) > 0` branches P2 into state/action `901` before `SelfState` returns to state `0`/control. That `pnpm qa:trace` pass was 326/326 artifacts, 296 required and 30 optional. This is one bounded guarded target-memory-to-custom-state timing route only; `p2stateno`-on-guard behavior, exact guard timing, throws, helper/root/parent redirects, teams/simul, score movement, and full custom-state/get-hit parity are not claimed.
Previous focused R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-hitcount-hitid-chainid.json` trace checksum `250f77c2` gates bounded owner-backed custom-state `GetHitVar(hitcount/hitid/chainid)` evidence. Direct `HitDef id = 77, chainID = 43, numhits = 3` sends P2 into P1-owned state data through `p2stateno = 888` / `p2getp1state = 1`, then `GetHitVar(hitcount) = 3 && GetHitVar(hitid) = 77 && GetHitVar(chainid) = 43 && GetHitVar(hittime) > 0 && !GetHitVar(guarded)` branches P2 into state/action `900` before `SelfState` returns to state `0`/control. That `pnpm qa:trace` pass was 325/325 artifacts, 295 required and 30 optional. This is one bounded direct-HitDef metadata inheritance route only; exact combo accumulation, chain-hit eligibility arbitration, helper/projectile inheritance, exact target lifetime, teams/simul, score movement, and full custom-state/get-hit parity are not claimed.
Latest R2 runtime ownership checkpoint: `RuntimeMatchEnvShakeBridgeWorld` owns bounded match-level `EnvShake` / `FallEnvShake` controller emission outside `PlayableMatchRuntime`. Active controller routes now forward controller source, optional typed `envshake` / `fallenvshake` operation data, runtime tick, telemetry hooks, and `RuntimeEnvShakeWorld` through one named boundary. Focused `RuntimeMatchEnvShakeBridgeSystem` coverage proves typed EnvShake forwarding, FallEnvShake hit-fall metadata emission/clearing, telemetry forwarding, and no-pending-fall no-event behavior. This is ownership cleanup only; no score movement or new trace checksum is claimed, and exact camera waveform, pause/stage/layer timing, helper/redirect ownership breadth, renderer parity, and full presentation parity remain blocked.
Previous focused R1 runtime checkpoint: required `synthetic-imported-gethitvar-fallcount.json` trace checksum `c391d938` gates bounded owner-backed state-`5100` `GetHitVar(fallcount)` evidence. A fall `HitDef` sends P2 into state `5100`, `HitFallDamage` records one Common1-style ground-impact count and consumes stored `fall.damage`, then `GetHitVar(fallcount) = 1 && GetHitVar(fall.damage) = 0` branches P2 into state/action `328`. That `pnpm qa:trace` pass was 324/324 artifacts, 294 required and 30 optional. This is one bounded fallcount route only; exact multi-ground-hit combo accumulation, non-Common1 ground-impact detection, lifetime/reset parity, helper/projectile/custom-state inheritance, score movement, and full fall/get-hit parity are not claimed.
Previous focused R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-snap.json` trace checksum `ce4680b9` gates bounded owner-backed custom-state `GetHitVar(xoff/yoff/zoff)` snap-offset metadata inheritance. Direct `HitDef snap = 16,-24` plus `p2stateno = 888` / `p2getp1state = 1` stores defender hit vars while P2 executes P1-owned state data, branches `888 -> 899` through `GetHitVar(xoff) = 16 && GetHitVar(yoff) = -24 && GetHitVar(zoff) = 0`, then returns P2 to state `0`/control through `SelfState`. That `pnpm qa:trace` pass was 323/323 artifacts, 293 required and 30 optional. This is bounded direct-HitDef snap metadata inheritance in one attacker-owned custom-state route only; exact throw positioning, z-axis support, guard snap behavior, helper/projectile inheritance, broader custom-state inheritance breadth, teams, visual/audio parity, score movement, and full throw/custom-state parity are not claimed.
Previous focused R1 runtime checkpoint: required `synthetic-imported-gethitvar-snap.json` trace checksum `312a53fc` gates bounded owner-backed get-hit `GetHitVar(xoff/yoff/zoff)` snap-offset metadata. Direct `HitDef snap = 16,-24` stores defender hit vars, applies bounded attacker-relative contact positioning, P2 enters owner-backed state `5100`, then `GetHitVar(xoff) = 16 && GetHitVar(yoff) = -24 && GetHitVar(zoff) = 0` branches P2 into state/action `288`. `pnpm qa:trace` passed 322/322 artifacts, 292 required and 30 optional. This is bounded direct-HitDef snap metadata and simple direct-contact positioning only; exact throw positioning, z-axis support, guard snap behavior, helper/projectile/custom-state inheritance breadth, teams, visual/audio parity, score movement, and full throw/get-hit parity are not claimed.
Previous focused R1 runtime checkpoint: required `synthetic-imported-gethitvar-hitcount.json` trace checksum `a4685842` gates bounded defender-owned normal get-hit `GetHitVar(hitcount)` metadata. Direct `HitDef numhits = 3` records defender hit vars, P2 enters defender-owned state `5000`, then `GetHitVar(hitcount) = 3 && !GetHitVar(guarded)` branches P2 into state/action `327`. `pnpm qa:trace` passed 321/321 artifacts, 291 required and 30 optional. This is bounded direct-HitDef numhits metadata only; exact combo accumulation, multi-hit timing, helper/projectile/custom-state inheritance breadth, teams, exact target lifetime/tick order, score movement, and full get-hit parity are not claimed.
Previous focused R1 runtime checkpoint: required `synthetic-imported-gethitvar-hitid-chainid.json` trace checksum `18df99ed` gates bounded defender-owned normal get-hit `GetHitVar(hitid)` / `GetHitVar(chainid)` metadata. Direct `HitDef id = 77, chainID = 43` records target memory, P2 enters defender-owned state `5000`, then `GetHitVar(hitid) = 77 && GetHitVar(chainid) = 43 && !GetHitVar(guarded)` branches P2 into state/action `326`. `pnpm qa:trace` passed 320/320 artifacts, 290 required and 30 optional. This is bounded direct-HitDef id/chainID metadata only; exact chain-hit eligibility arbitration, helper/projectile/custom-state inheritance breadth, teams, exact target lifetime/tick order, score movement, and full get-hit parity are not claimed.
Previous focused R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-yaccel.json` trace checksum `549fe48d` gates bounded owner-backed custom-state `GetHitVar(yaccel)` metadata inheritance. Direct `HitDef p2stateno = 888` stores `yaccel = 0.62`, P2 enters P1-owned state data, then `GetHitVar(yaccel)` branches P2 into state `898` before `SelfState` returns to P2 state `0`/control. `pnpm qa:trace` passed 319/319 artifacts, 289 required and 30 optional. This is bounded direct-hit yaccel metadata inheritance only; exact physics integration, fall acceleration arbitration, guard metadata inheritance, throws, helper/root/parent redirects, teams, exact bind tick-order, score movement, and full custom-state parity are not claimed.
Previous focused R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-type.json` trace checksum `38542874` gates bounded owner-backed custom-state `GetHitVar(type)` metadata inheritance. Direct `HitDef p2stateno = 888` stores `ground.type = Low` plus `air.type = Trip`, P2 enters P1-owned state data, then `GetHitVar(type)` branches P2 into state `897` before `SelfState` returns to P2 state `0`/control. That `pnpm qa:trace` aggregate was 318/318 artifacts, 288 required and 30 optional. This is bounded direct-hit type metadata inheritance only; exact get-hit animation selection, air-hit arbitration, guard metadata inheritance, throws, helper/root/parent redirects, teams, exact bind tick-order, score movement, and full custom-state parity are not claimed.
Previous focused R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-guarded.json` trace checksum `54f62821` gates bounded owner-backed custom-state `GetHitVar` guarded metadata inheritance. Guarded direct `HitDef` target memory feeds typed owner-local `TargetState`, P2 enters P1-owned state data, then `GetHitVar(guarded)`, `GetHitVar(hitshaketime)`, and `GetHitVar(hittime)` branch P2 into state `895` before `SelfState` returns to P2 state `0`/control. That `pnpm qa:trace` aggregate was 316/316 artifacts, 286 required and 30 optional. This is guarded target-memory-to-custom-state metadata inheritance only; `p2stateno`-on-guard behavior, exact guard timing, throws, helper/root/parent redirects, teams, exact bind/tick order, score movement, and full custom-state parity are not claimed.
Previous focused R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-velocity.json` trace checksum `e9d8da9e` gates bounded owner-backed custom-state `GetHitVar` velocity metadata inheritance. Direct `HitDef p2stateno = 888` with `p2getp1state = 1` and `ground.velocity = 4,-2` routes P2 into P1-owned state data, then `GetHitVar(xvel)` / `GetHitVar(yvel)` branch P2 into state `894` before `SelfState` returns to P2 state `0`/control. That `pnpm qa:trace` aggregate was 315/315 artifacts, 285 required and 30 optional. This is direct-hit velocity metadata inheritance only; exact velocity lifetime after later physics/controllers, throws, helper/root/parent redirects, teams, exact bind/tick order, score movement, and full custom-state parity are not claimed.
Previous focused R1 runtime checkpoint: required `synthetic-imported-custom-state-gethitvar-down-recover.json` trace checksum `5bd94568` gates bounded owner-backed custom-state `GetHitVar` down-recovery metadata inheritance. Direct fall `HitDef p2stateno = 888` with `p2getp1state = 1` routes P2 into P1-owned state data, then `GetHitVar(down.recover)`, `down.recovertime`, and alias `recovertime` branch P2 into state `893` before `SelfState` returns to P2 state `0`/control. That `pnpm qa:trace` aggregate was 314/314 artifacts, 284 required and 30 optional. This is direct-hit down-recovery metadata inheritance only; exact lie-down tables, guard metadata inheritance, throws, helper/root/parent redirects, teams, exact bind/tick order, exact recovery threshold behavior, score movement, and full custom-state parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-helper-controller-param-parentroot.json` trace checksum `94919326` gates bounded helper-local dynamic controller-param `Parent` / `Root` redirect evaluation with typed `kinematic:velset` telemetry. A first-generation visual Helper executes `VelSet x = Parent,Life - 995` / `y = Root,StateNo - 203`, records the resolved dynamic operation, reaches actor-frame velocity `5,-3`, and routes to state `1401` / anim `941`. That checkpoint passed 513/513 artifacts, 482 required and 31 optional. This is bounded helper-local `VelSet` typed telemetry only; nested helper ancestry where root differs from parent, helper-spawned helpers, player `Parent` controller-param redirects, helper-local dynamic typed lowering beyond this route, recursive redirection, debug warning text, teams/simul, score movement, and full helper/controller expression parity are not claimed.

Previous focused R1 runtime/renderer checkpoint: required `synthetic-imported-assertspecial-helper-explod-shadow.json` trace checksum `83f61b48` gates bounded `AssertSpecial GlobalNoShadow` helper/explod shadow actor-frame evidence. The synthetic imported fixture executes official-style grouped `AssertSpecial` controllers, spawns a visual Helper and helper-parented Explod route, requires final-actor `assertSpecialGlobalFlags`, and requires actor-frame `shadowVisible=false` evidence for P1, P2, Helper, and Explod. Previous required `synthetic-imported-assertspecial-shadow-telemetry.json` trace checksum `2b9c8fac` remains the bounded player shadow renderer oracle for normalized `noshadow` and `globalnoshadow`. At that checkpoint `pnpm qa:trace` passed 308/308 artifacts, 278 required and 30 optional. Exact shadow skew/stage parameters, projectile shadow semantics, exact ownership beyond the current spawned helper/explod route, pause/layer behavior, score movement, and full renderer/global parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-assertspecial-global-telemetry.json` checksum `fc793d29` gates bounded `AssertSpecial` global flag telemetry. The synthetic imported fixture executes official-style grouped `AssertSpecial` controllers for normalized `nobardisplay`, `nobg`, `nofg`, `nokosnd`, and `nomusic`, and the gate requires final-actor `assertSpecialGlobalFlags` evidence. This is telemetry/gate coverage only; lifebar hiding, stage BG/FG rendering suppression, KO sound suppression, music pause, exact global/team/helper ownership, pause/layer behavior, score movement, and full MUGEN/IKEMEN global flag parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-default-liedown-fast-recovery.json` checksum `74bdac97` gates the positive bounded fast lie-down recovery shortcut. The synthetic imported fixture omits the authored `5110` `Get Up` `ChangeState`, keeps fresh `recovery` input active while `down.recovertime` is still positive in Common1-style state `5110`, and still routes `5110 -> 5120 -> 0` through `RuntimeRecoverySystem.advanceCommon1LieDownRecovery`. Previous `synthetic-imported-assertspecial-nofastrecoverfromliedown.json` checksum `74bf5d85` remains required and gates bounded IKEMEN `AssertSpecial NoFastRecoverFromLieDown` suppression for that shortcut. This is bounded synthetic recovery evidence only; exact mashing thresholds, exact controller-loop timing, public KFM proof, global/team/helper ownership, pause/hitpause layering, score movement, and full recovery parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-controller-param-root-redirect.json` checksum `1d4a73f7` gates bounded controller-parameter `Root` redirect evaluation in current player controller execution. The trace seeds P1 velocity with static `VelSet x = 4, y = -2`, then runs dynamic `VelSet` params that read `Root, Life - 995` / `Root, StateNo - 203` and move P1 velocity to `5,-3`; named controller order, the static typed `kinematic:velset` seed, and actor-frame velocity telemetry guard the route. This is bounded current player `VelSet` controller-param Root redirect evidence only; player `Parent` controller-param redirects, nested helper ancestry where root differs from parent, helper-spawned helpers, dynamic-parameter typed lowering, recursive redirect evaluation, debug warning text, broad bottom/redirect parity for every controller/parameter family, helper/team ownership, score movement, and full MUGEN/IKEMEN controller/expression parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-controller-param-target-redirect.json` checksum `55bb7b1f` gates bounded controller-parameter `Target(77)` redirect evaluation in current controller execution. The trace seeds P1 velocity with static `VelSet x = 4, y = -2`, records direct `HitDef` target id `77`, then runs dynamic `VelSet` params that read `Target(77), Life - 960` / `Target(77), Life - 966` and move P1 velocity to `3,-3`; target-link evidence, named controller order, the static typed `kinematic:velset` seed, `HitDef`, and actor-frame velocity telemetry guard the route. This is bounded current `VelSet` controller-param Target redirect evidence only; broad controller-param redirect parity is not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-controller-param-bottom.json` checksum `28ef21ad` gates bounded controller-parameter bottom fallback in current controller execution. The trace seeds P1 velocity with static `VelSet x = 4, y = -2`, then runs a dynamic `VelSet` whose `Parent,Vel X` / `Parent,Vel Y` parameters evaluate through a missing parent redirect and fall back to `0,0`; actor-frame evidence observes the velocity range `4 -> 0` and `-2 -> 0`, with named controller order plus static typed `kinematic:velset` evidence. This is bounded controller-param bottom evidence only; broad bottom parity is not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-target-ifelse-bottom.json` checksum `be7554d4` gates bounded `IfElse(...)` invalid-redirect branch-result isolation in current parser-expression trigger evaluation. The trace proves a direct `HitDef` target-memory route does not execute forbidden state `400` when `IfElse(0, MoveHit >= 1, (Target(999), Life = 0))` selects a missing target branch, then routes through fallback state/action `401` when `IfElse(1, MoveHit >= 1, (Target(999), Life = 0))` selects valid `MoveHit` evidence while the unused missing target branch stays isolated from the returned value; focused CNS coverage also proves `IfElse(...)` still eagerly evaluates unused missing branches and reports warning-style unsupported diagnostics, unlike `Cond(...)`. This is bounded IfElse/bottom result-isolation evidence only; Cond-style lazy evaluation, recursive redirection, debug warning text, broader invalid-destination bottom parity, teams/simul, target mutation through redirects, score movement, and full MUGEN/IKEMEN redirect/bottom parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-target-cond-bottom.json` checksum `e882a2bb` gates bounded `Cond(...)` invalid-redirect branch isolation in current parser-expression trigger evaluation. The trace proves a direct `HitDef` target-memory route does not execute forbidden state `398` when `Cond(1, (Target(999), Life = 0), MoveHit >= 1)` selects a missing target branch, then routes through fallback state/action `399` when `Cond(0, (Target(999), Life = 0), MoveHit >= 1)` skips that missing target branch and selects valid `MoveHit` evidence; focused CNS coverage also proves skipped `Cond(...)` branches do not call the unsupported-redirect reporter while selected missing redirects fail closed. This is bounded Cond/bottom evidence only; recursive redirection, debug warning text, broader invalid-destination bottom parity, teams/simul, target mutation through redirects, score movement, and full MUGEN/IKEMEN redirect/bottom parity are not claimed.

Previous focused R1 runtime checkpoint: required `synthetic-imported-target-redirect-bottom.json` checksum `5e50a90a` gates bounded invalid-redirect bottom propagation in current parser-expression trigger evaluation. The trace proves a direct `HitDef` target-memory route does not execute forbidden state `396` when `(Target(999), Life = 0) || 1` references a missing target destination, then routes through fallback state/action `397`; focused CNS coverage also proves missing `Parent` redirects propagate through composite expressions while unused `IfElse(...)` branches stay isolated. This is bounded expression/trigger bottom evidence only; recursive redirection, debug warning text, broader invalid-destination bottom parity, teams/simul, target mutation through redirects, score movement, and full MUGEN/IKEMEN redirect/bottom parity are not claimed.

Previous focused R1 helper redirect checkpoint: required `synthetic-imported-helper-parentroot.json` checksum `5154220c` gates bounded helper-local `Parent` / `Root` redirect routing. A visual Helper reads cloned owner/root runtime state through `Parent,StateNo`, `Parent,Vel X`, `Root,Anim`, and a redirected-value `ChangeState` expression before routing `1200 -> 1400` / anim `940`. This is read-only first-generation visual-helper evidence only; nested helper ancestry where root differs from parent, player-state parent/root ownership, team/helper-owned redirects, redirect mutation, keyctrl, score movement, and full MUGEN/IKEMEN helper redirect parity are not claimed.

Previous focused R1 custom-state checkpoint: required `synthetic-imported-custom-state-gethitvar-yaccel.json` checksum `549fe48d` gates bounded owner-backed custom-state `GetHitVar(yaccel)` metadata inheritance. Direct `HitDef p2stateno = 888` stores `yaccel = 0.62`, P2 enters P1-owned state data, then `GetHitVar(yaccel) = .62 && GetHitVar(hittime) > 0 && !GetHitVar(guarded)` branches P2 into state `898` before `SelfState` returns to P2 state `0`/control. That `pnpm qa:trace` aggregate was 319/319 artifacts, 289 required and 30 optional. This is bounded direct-hit yaccel metadata inheritance only; exact physics integration, fall acceleration arbitration, guard metadata inheritance, throws, helper/root/parent redirects, teams, exact bind tick-order, score movement, and full custom-state parity are not claimed.

Previous focused R1 custom-state checkpoint: required `synthetic-imported-custom-state-gethitvar-type.json` checksum `38542874` gates bounded owner-backed custom-state `GetHitVar(type)` metadata inheritance. Direct `HitDef p2stateno = 888` stores `ground.type = Low` and `air.type = Trip`, P2 enters P1-owned state data, then `GetHitVar(type) = 2 && GetHitVar(groundtype) = 2 && GetHitVar(airtype) = 3 && !GetHitVar(guarded)` branches P2 into state `897` before `SelfState` returns to P2 state `0`/control. It remains required coverage but no longer latest.

Previous focused R1 recovery checkpoint: required `synthetic-imported-assertspecial-nogetupfromliedown.json` checksum `4c3b6281` gates bounded IKEMEN `AssertSpecial NoGetUpFromLieDown`. Static flags lower into typed `assertspecial` operation data, runtime execution exposes `noGetUpFromLieDown`, and `RuntimeRecoverySystem.advanceCommon1LieDownRecovery` suppresses the hardcoded Common1 `5110 -> 5120` get-up transition while state `5110` counts `down.recovertime` to `0`; the trace forbids `5120` and leaves P2 in `5110`. Focused recovery/compiler/runtime tests still prove this handoff. This is bounded synthetic get-up suppression evidence only; public KFM evidence, exact controller-loop tick order, global/team/helper ownership, pause/hitpause layering, score movement, and full MUGEN/IKEMEN recovery parity are not claimed.

Latest runtime/QA hardening checkpoint: `synthetic-imported-default-fall-official-air-recovery` is now listed in the `pnpm qa:trace` required artifact coverage-summary contract. The artifact was already generated as required with checksum `b0363be9`; this cut only makes the coverage contract fail if that required oracle drops out of required summaries. No runtime behavior, checksum, score, public KFM, exact recovery-table, velocity, or parity claim changed.

Previous runtime/QA checkpoint: required `synthetic-imported-air-guard-landing.json` checksum `d6986d7f` now proves portable synthetic Common1-style air guard-hit landing walk-control: held-back airborne P2 blocks an A-guardable direct `HitDef`, routes `154 -> 155 -> 52 -> 20`, keeps active `holdback`/`x`, preserves bounded controller/typed-operation order through `155` landing `VelSet`/`PosSet`, records state-`52` y = 0 landing evidence, and ends in imported walk state/action `20` with control. Optional `kfm-official-default-air-guard-state.json` checksum `62367dac` mirrors the real KFM/Common1 air route when the private fixture exists. Previous optional KFM crouch checkpoint `kfm-official-default-crouch-guard-hold-crouch-return.json` checksum `d11153d0` proves private real KFM/Common1 crouch guard-hit `152 -> 153 -> 131 -> 11`, active `holdback`/`holddown`/`x`, preserved `153` slide-stop controller/typed-operation order, and final KFM crouch state/action `11` with control when the local fixture exists. Latest required portable crouch checkpoint remains `synthetic-imported-crouch-guard-hold-crouch-return.json` checksum `83ecb699`, proving bounded synthetic crouch guard-hit `152 -> 153 -> 130 -> 10`; previous required stand guard checkpoint `synthetic-imported-default-guard-hold-walk-return.json` checksum `75d4db9c` proves bounded synthetic stand guard-hit `150 -> 151 -> 130 -> 20`; optional private-fixture `kfm-official-default-guard-hold-walk-return.json` checksum `885bb1da` mirrors that real KFM/Common1 stand route when the local fixture exists. Previous required `synthetic-imported-default-fall-ground-recovery-priority.json` checksum `e83b2db7` remains the portable ground-recovery oracle: P2 routes `5000 -> 5030 -> 5050 -> 5200 -> 5201 -> 52 -> 0`, keeps active `recovery` command evidence, executes ordered ground-recovery controller/typed-operation evidence, and forbids generic air-recovery state `5210` plus lie-down chain states. At that checkpoint `pnpm qa:trace` passed 296/296 artifacts, 266 required and 30 optional; current aggregate is 310/310 artifacts, 280 required and 30 optional after the AssertSpecial round-flow telemetry checkpoint. This is bounded synthetic air/crouch/stand guard-hold plus optional private-fixture KFM mirrors and ground-over-air selection evidence only, not public KFM support, required portable KFM-specific fixture coverage when the fixture is absent, exact guard-hold duration, exact air guard physics/landing/state-52 internals, exact guard timing/proximity/effects, exact recovery threshold tables, controller-loop timing, ground/air recovery arbitration constants, velocity math, visual/audio parity, score movement, or full MUGEN/IKEMEN guard/recovery parity. Previous runtime/QA checkpoint: required `synthetic-imported-default-fall-recovery-input-priority.json` checksum `f5e72e07` proves generic recovery input over a competing `HitFall && CanRecover` probe; latest required portable movement checkpoint remains `synthetic-imported-basic-movement.json` checksum `917ff3e5`.

Previous runtime/render checkpoint: bounded stage BG `window` / `maskwindow` clipping now sits beside the previous stage `trans`/`alpha` material handoff and required presentation trace oracles. Stage DEF `[BG ...]` layers preserve rectangular clip metadata, `StageCompatibilityReport` reports bounded clipped layers, Studio Stage layer rows display the clip, and the Three.js renderer clips fallback/asset/SFF sprite placements with UV adjustment instead of source squeezing. Focused `StageDefParser`, `StageCompatibilityReport`, and `stageProjection` tests prove parser/report/projection behavior; browser smoke plus screenshots own visible regression. This is bounded rectangular stage presentation only, not exact `windowdelta`, zoom, endpoint, render-mode, color-zero `mask`, score movement, or full stage parity.

Previous R2 runtime ownership checkpoint: `RuntimeMatchEnvColorBridgeWorld` owns bounded match-level EnvColor callback routing for active, pause, and hitpause ignored-controller paths, preserving controller source, optional typed `envcolor` op data, runtime tick, and `RuntimeEnvColorWorld` emission. This is ownership cleanup only; exact EnvColor blend math, layer/window ordering, pause layering/timing, renderer parity, score movement, and full presentation parity are not claimed.

Previous R2 runtime ownership checkpoint: `RuntimeControllerExpressionContextSystem` owns shared raw controller-number expression context construction for passive/runtime controller worlds. Dynamic fallback params now reuse one redirect-aware helper for `Target(...)`, `Parent`, `Root`, `Const`, `HitPauseTime`, `StageTime`, and `GetHitVar` reads, with focused coverage proving redirects plus helper/team metadata forwarding. This is ownership cleanup only; no new expression language support, `ID`/player unique-id semantics, recursive redirection, helper/team scope expansion, exact CNS controller-loop timing, visual/audio parity, score movement, or full controller VM parity is claimed.

Previous R2 runtime ownership checkpoint: `RuntimeFighterAdvanceHookSetWorld` owns bounded per-fighter advance hook-set construction outside `PlayableMatchRuntime`: sprite effects, hit eligibility, HitOverride ticking, contact timers, state clock, frame constraints, recovery windows, stun, move lifecycle, kinematics, animation, active controllers, recovery landing, lie-down recovery, and frozen-position preservation now route through one named seam before `RuntimeFighterAdvanceWorld` executes. Focused `RuntimeFighterAdvanceHookSetSystem`, `RuntimeFighterAdvanceSystem`, and `RuntimeMatchFighterAdvanceSystem` coverage proves the handoff. This is ownership cleanup only; no new player-advance semantics, exact MUGEN/IKEMEN tick order, persistent-controller timing, helper/team/redirect actor advance semantics, recovery/stun/physics arbitration, visual/audio parity, score movement, or full player VM parity is claimed.

Previous R2 runtime ownership checkpoint: `RuntimeActiveExpressionContextWorld` owns bounded active CNS expression-context factory construction outside `PlayableMatchRuntime`: dynamic controller-param fallback and trigger evaluation share one named seam for stage bounds/time, owner const routing, runtime RNG, animation timing callbacks, and `InGuardDist` before `RuntimeDispatchEvaluationWorld` / `RuntimeTriggerEvaluationWorld` evaluate expressions. Focused coverage proves the handoff. This is ownership cleanup only; no new expression semantics, exact CNS VM timing, helper/team/redirect expansion, exact `InGuardDist` parity, deterministic MUGEN/IKEMEN RNG stream parity, visual/audio parity, score movement, or full expression/trigger VM parity is claimed.

Previous R2 runtime ownership checkpoint: `RuntimeActiveControllerHookSetWorld` owns bounded active-controller hook-set construction outside `PlayableMatchRuntime`: state mutation hooks, side-effect controller hooks, and fallback runtime-controller hooks are grouped through one named boundary before `RuntimeActiveControllerRunWorld` executes. Focused coverage proves every current hook route is preserved plus optional unsupported-hook omission. This is ownership cleanup only; no new controller semantics, exact hook ordering parity, helper/team/redirect scopes, unsupported-controller breadth, visual/audio parity, score movement, or full CNS VM parity is claimed.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchPausedBridgeWorld` owns the bounded match-level bridge into `RuntimePausedMatchWorld.advanceRuntime(...)` outside `PlayableMatchRuntime`: pause snapshot lookup, source-movetime eligibility, pause tick mutation, hitpause-style command buffering, stage/time metadata, actor-constraint/effect-lifecycle worlds, and paused player/AI/fighter callbacks are assembled through one named boundary before paused-match ordering runs. Focused coverage proves the bridge payload and callback hooks. This is ownership cleanup only; no new Pause/SuperPause semantics, exact pause layering, helper/team/redirect pause ownership, pause/hitpause command parity, visual/audio parity, score movement, or full paused-match VM parity is claimed.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchPreFacingAssertSpecialWorld` owns the bounded pre-facing imported `AssertSpecial` trigger/dispatch context bridge outside `PlayableMatchRuntime`: trigger gating receives stage bounds through the frame-start route, and controller execution context creation forwards owner constants, actor hitpause, actor random, stage bounds, and stage time through one named system before auto-facing. Focused coverage proves the bridge payload and dispatch context. This is ownership cleanup only; no new `AssertSpecial` flags, exact lifetime/global/team/helper ownership, pause/hitpause parity, visual/audio parity, score movement, or full match-frame VM parity is claimed.

Previous R2 active-controller ownership checkpoint: `RuntimeActiveControllerRunWorld` owns bounded active-controller scan-to-dispatch orchestration for imported state programs outside `PlayableMatchRuntime`: owner-backed state lookup, trigger pass handoff, `ignorehitpause` filtering, compiled controller dispatch creation, route execution, and stop-on-state-change now pass through one bridge before concrete state/runtime/side-effect hooks run. Focused coverage proves owner-backed active-controller routing and hitpause-only filtering. This is ownership cleanup only; exact CNS VM timing, persistent-controller semantics, helper/team/redirect scopes, side-effect ordering parity, unsupported-feature breadth, visual/audio parity, score movement, and full active-controller parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchActorRosterWorld` owns bounded current P1/P2 actor roster projection for `PlayableMatchRuntime`. Helper-owned `TargetState` actor lookup, imported compatibility session projection, and effect-store owner summaries now consume one roster boundary; focused coverage proves stable order, live references, id lookup, mirrored one-on-one opponent projection, and fail-closed unknown actors. This is ownership cleanup only; real teams/simul roster ownership, helper-owned actor discovery, dynamic roster mutation, richer identity metadata, exact VM scheduling, visual/audio parity, score movement, and full actor registry parity remain blocked.

Previous QA-hardening checkpoint: `scripts/qa_traces.cjs` includes `synthetic-imported-assertspecial-unguardable` in the required artifact coverage-summary contract. The artifact was already required; this hardening makes `pnpm qa:trace` fail if the bounded attacker-side `AssertSpecial Unguardable` oracle stops contributing required coverage. `synthetic-imported-assertspecial-unguardable.json` checksum is `e84aa12d`. This is QA hardening only, not new guard semantics, score movement, or full AssertSpecial parity.

Latest R1 palette/presentation checkpoint: focused stage parser/report/projection tests prove bounded BG `window`/`maskwindow` clipping; focused parser/provider/renderer/loader/report tests also prove first-pass ACT + indexed SFF `RemapPal` texture handoff, while required `synthetic-imported-palfx-remappal.json` checksum `ba5fc1e6` continues to prove bounded same-actor `PalFX` + `RemapPal` typed operation and actor-frame telemetry. Previous R1 presentation checkpoint remains `synthetic-imported-envcolor-under.json` checksum `0a7b5c96`, proving bounded imported `EnvColor` under-layer evidence; `synthetic-imported-envcolor.json` checksum `956b0f4b` remains the matching `under = 0` route. Current `pnpm qa:trace` passes 444/444 artifacts, 414 required and 30 optional after the dynamic `Trans alpha` gate. This is bounded stage clipping plus indexed palette handoff/telemetry only; exact `windowdelta`/zoom/mask color-key behavior, palette math, source-bank semantics, truecolor/PNG remap, EnvColor blend math, renderer parity, visual parity, score movement, and full presentation parity remain blocked.

Previous R1 Common1 checkpoint: required `synthetic-imported-hitfall-recover-true.json` checksum `f1e3424a` proves bounded synthetic recover-enabled but still not recoverable fall routing: a defender takes a fall `HitDef` with `fall.recover = 1` and no `p2stateno`, routes `5000 -> 5030 -> 5050 -> 5240 -> 0`, executes ordered `HitVelSet`, typed `kinematic:hitvelset`, `VelAdd`, and named `HitFall Recover Enabled Probe` `ChangeState` through `HitFall && GetHitVar(fall.recover) && !CanRecover`, requires positive `fall.recovertime` metadata in `5050` and `5240`, and forbids recovery states `5210`/`5200`. That checkpoint passed 280/280 artifacts, 255 required and 25 optional. This is bounded recover-enabled trigger/order evidence only; exact recovery threshold tables, exact Common1 controller-loop timing, recovery arbitration, fall/CanRecover precedence, visual/audio parity, score movement, and full fall/recovery parity remain blocked.

Previous R1 Common1 checkpoint: required `synthetic-imported-hitfall-recover-false.json` checksum `236df0a8` proves bounded synthetic recover-disabled fall routing: a defender takes a fall `HitDef` with `fall.recover = 0` and no `p2stateno`, routes `5000 -> 5030 -> 5050 -> 5230 -> 0`, executes ordered `HitVelSet`, typed `kinematic:hitvelset`, `VelAdd`, and named `HitFall Recover Disabled Probe` `ChangeState`, requires positive `fall.recovertime` metadata in `5050` and `5230`, and forbids recovery states `5210`/`5200`. This is bounded recover-disabled trigger/order evidence only; exact recovery threshold tables, exact Common1 controller-loop timing, recovery arbitration, fall/CanRecover precedence, visual/audio parity, score movement, and full fall/recovery parity remain blocked.

Previous R1 Common1 checkpoint: required `synthetic-imported-hitfall-false.json` checksum `1d538e43` proves bounded synthetic normal get-hit `!HitFall` / `!GetHitVar(fall)` routing: a defender takes a direct `HitDef` without fall metadata or `p2stateno`, enters defender-owned `5000`, branches through named `Normal HitFall False Probe` into state/action `325`, requires ordered actor-frame evidence `5000 -> 325`, final P2 state `325` / moveType `H`, and forbids fall/recovery states `5001`, `5030`, `5050`, `5210`, and `5200`. This is bounded HitFall-false trigger evidence only; exact normal get-hit timing, fall arbitration, custom-state/helper/team inheritance, visual/audio parity, score movement, and full Common1 get-hit parity remain blocked.

Previous R1 Common1 checkpoint: required `synthetic-imported-hitfall-canrecover.json` checksum `7cf7ab46` proves bounded synthetic `HitFall` true / `CanRecover` false routing: a defender takes a fall `HitDef` without `p2stateno`, routes `5000 -> 5030 -> 5050 -> 5220 -> 0`, executes ordered `HitVelSet`, typed `kinematic:hitvelset`, `VelAdd`, and named `HitFall CanRecover Probe` `ChangeState`, observes positive `fall.recovertime` in `5050` and `5220`, forbids recovery states `5210`/`5200`, and returns to idle/control. That checkpoint passed at 277/277 artifacts, 252 required and 25 optional. This is bounded trigger/order evidence only; exact recovery threshold tables, exact Common1 controller-loop timing, recovery arbitration, visual/audio parity, score movement, and full fall/recovery parity remain blocked.

Previous R1 Common1 checkpoint now tightened by the latest runtime/QA entry: required `synthetic-imported-air-guard-landing.json` checksum `d6986d7f` proves a bounded synthetic air guard landing handoff plus final walk-control route `154 -> 155 -> 52 -> 20`, not only the earlier state-`52` landing bucket. Exact air guard physics/timing, state-`52` internals, proximity guard, guard effects, visual/audio parity, score movement, and full guard parity remain blocked.

Previous R1 audio/FightFX static checkpoint: static `PlaySnd lowpriority = 1`, `volumescale = 50`, legacy `volume = -8`, `freqmul = 0.5`, `loop = 1`, `pan = 32`, `abspan = -64`, and static `SndPan channel = 2, pan = -48` compile into typed `audio:playsnd` / `audio:sndpan` metadata, survive as `RuntimeSoundEvent.lowPriority` / `volumeScale` / `legacyVolume` / `freqMul` / `loop` / `pan` / `absPan`, and are required by `RuntimeTrace.requiredSoundEvents`. Required `synthetic-imported-sound.json` is checksum `cc9c8c49` while gating `PlaySnd channel = 2`, legacy volume diagnostics, `PlaySnd channel = 3` absolute pan diagnostics, `SndPan channel = 2`, and `StopSnd channel = 2` metadata; current dynamic sound-value audio evidence is `synthetic-imported-sound-dynamic-value.json` checksum `bcdafe32` / final checksum `31b8a7b3`, dynamic numeric evidence is `synthetic-imported-sound-dynamic-pan.json` checksum `879afcf4` / final checksum `b780e5e9`, SuperPause sound evidence is `synthetic-imported-superpause-sound.json` checksum `3e19cb86` / final checksum `c5fb9428`, and direct dynamic HitDef sound evidence now includes `synthetic-imported-hitdef-dynamic-hitsound.json` checksum `fe3c0f3d` / final checksum `855df386` plus `synthetic-imported-hitdef-dynamic-guardsound.json` checksum `bb38362a` / final checksum `3e0ddeb0`. `MugenAudioSystem` resolves explicit-channel Web Audio actions through a pure channel boundary, applies `volumescale` as bounded gain scaling, ignores legacy `volume` during modern playback while preserving diagnostics, applies `freqmul` as bounded playback-rate scaling, maps `loop` to source looping, tracks unchannelled sources for stop-all cleanup, and maps `pan` / `abspan` through a bounded actor/camera-aware stereo-pan boundary. Previous FightFX package selection remains current: character `[Files] fx = ...` entries load IKEMEN-style FightFX DEF `[Info] prefix` packages with AIR/SFF/SND assets, imported `[Info] fightfx.prefix` selects the matching prefixed library for runtime `F` spark frames and `F` sound refs before global `data/fightfx.*` fallback, decoded prefixed SFF archives register through the existing global hit-spark provider route, and prefixed SND archives register into the Web Audio route by `soundPrefix`. Required `synthetic-imported-hitdef-fightfx-spark.json` remains checksum `11537b56`; required `synthetic-imported-hitdef-hit-effect-package.json` remains checksum `46aa5ce1` and gates `hitsound = F5,0` with `soundPrefix = kfm` beside FightFX spark metadata. This is bounded channel arbitration, `volumescale`, legacy volume diagnostics, `freqmul`, `loop`, `pan`, `abspan`, `SndPan`, package-selection, dynamic sound-value, dynamic numeric event telemetry, SuperPause sound typed telemetry, dynamic direct HitDef contact sound typed telemetry, and prefixed-SND lookup support only; exact IKEMEN `sys.ffx` lifetime/refcount semantics, pre-RC8 `volume` gain semantics, exact panning semantics, global channel fallback, priority classes, timing/mixing, motif/screenpack ownership, renderer/audio layering/scale/palette parity, score movement, and full hit-effect/audio parity remain blocked.

Latest R2 presentation snapshot ownership checkpoint: `RuntimeMatchPresentationSnapshotWorld` owns bounded match presentation snapshot input construction outside `PlayableMatchRuntime`: camera shake, stage flash, and P1/P2 effect snapshot groups route through one seam before `RuntimeSnapshotWorld.match()` builds the renderer-independent snapshot. Focused `RuntimeMatchPresentationSnapshotSystem` coverage proves shake/flash/effect-group forwarding and P1/P2 ordering. This is ownership cleanup only; exact stage/motif camera logic, effect lifecycle semantics, renderer/audio parity, visual/debug UI parity, score movement, and full match snapshot parity remain blocked.

Previous R2 active-controller telemetry ownership checkpoint: `RuntimeActiveControllerTelemetryWorld` owns bounded active-controller telemetry hook construction outside `PlayableMatchRuntime`: active state hooks, side-effect dispatchers, and fallback runtime-controller dispatch now share one controller/operation hook set before forwarding into `RuntimeCompatibilityTelemetryWorld`. Focused `RuntimeActiveControllerTelemetrySystem` coverage proves controller and operation forwarding through the seam. This is ownership cleanup only; exact telemetry event semantics, imported-only filtering, event retention limits, helper/team/redirect telemetry breadth, visual/debug UI parity, score movement, and full CNS VM parity remain blocked.

Previous R2 combat/helper ownership checkpoint: `RuntimeMatchCombatStateHooksWorld` owns bounded combat state-hook adapter construction outside `PlayableMatchRuntime`: direct/projectile combat hooks preserve state-owner availability and entry options, while helper combat hooks keep self-owned availability checks and still forward entry options into state entry. Focused `RuntimeMatchCombatStateHooksSystem` coverage proves both contracts, and `PlayableMatchRuntime` now creates both hook sets through the seam before `RuntimeMatchCombatBridgeWorld` routes them into direct/projectile/helper combat. This is ownership cleanup only; helper-owned custom-state table breadth, throws, teams/simul actor registries, multi-target helper ownership, exact combat/helper tick order, visual/audio parity, score movement, and full combat/helper VM parity remain blocked.

Previous R2 helper/effect lifecycle ownership checkpoint: `RuntimeMatchOpponentContextWorld` owns bounded current 1v1 match-opponent context construction for active/pause/hitpause lifecycle bridges outside `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld`: mirrored P1/P2 opponent selection, singleton lifecycle `opponents` list projection, and unknown-actor fail-closed behavior now route through one named seam. Focused `RuntimeMatchOpponentContextSystem` coverage proves mirrored contexts and fail-closed behavior; existing match/pause/hitpause coverage proves active, pause, and hitpause callers still forward the direct opponent plus explicit one-opponent lifecycle list. This is ownership cleanup only; real teams/simul roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond actor refs, exact helper lifecycle/pause/combat ordering, visual/audio parity, score movement, and full match/helper VM parity remain blocked.

Previous R2 helper/effect lifecycle ownership checkpoint: `RuntimeEffectHelperContextWorld` owns bounded visual Helper lifecycle context construction outside `RuntimeEffectLifecycleWorld`: complete-owner validation, parent/root runtime-state projection, current opponent id/state fallback, explicit lifecycle opponent-list to nearest-order helper `opponentRoster` projection, explicit roster override, target-candidate forwarding, and helper `TargetState` / telemetry hook forwarding now route through one named seam. Focused `RuntimeEffectHelperContextSystem` coverage proves nearest roster ordering, explicit roster preservation, target/hook forwarding, and incomplete-owner fail-closed behavior; `EffectLifecycleSystem` coverage proves active/paused lifecycle callers still forward context. This is ownership cleanup only; real teams/simul lifecycle roster ownership, automatic multi-opponent match discovery, helper-owned opponent roster discovery, richer identity beyond ids/runtime state, exact helper lifecycle/pause/combat ordering, visual/audio parity, score movement, and full Helper VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchHelperProjectileTargetWorld` owns bounded match-level helper-parented Projectile target-memory bridge wiring outside `PlayableMatchRuntime`: the normal post-fighter combat callback forwards owner, defender, projectile, and `RuntimeTargetWorld` through one named seam before lower `RuntimeHelperProjectileTargetWorld` target-memory logic runs. Focused `RuntimeMatchHelperProjectileTargetSystem` coverage proves forwarding and owner-projectile fail-closed behavior. This is ownership cleanup only; helper-owned Projectile contact timing, helper-owned custom-state tables, teams/simul actor registries, multi-target helper ownership, exact target lifetime, visual/audio parity, score movement, and full Helper/Projectile VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchHelperBindingWorld` owns bounded match-level helper callback wiring outside `PlayableMatchRuntime`: helper-owned `TargetState` owner handlers and helper-local Projectile telemetry handlers now attach through one named seam, while target entry still delegates to `RuntimeMatchHelperTargetStateWorld` and telemetry filtering still delegates to `RuntimeHelperTelemetryWorld`. Focused `RuntimeMatchHelperBindingSystem` coverage proves owner-specific target-state route forwarding, stale handler replacement, helper-state/owner-state telemetry attribution, and non-Projectile telemetry ignore behavior. This is ownership cleanup only; helper-owned custom-state tables, throws, teams/simul actor registries, multi-target helper ownership, exact helper TargetState/projectile timing, broad helper telemetry semantics, visual/audio parity, score movement, and full Helper VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchHelperTargetStateWorld` owns bounded match-roster target resolution for helper-owned `TargetState` entry outside `PlayableMatchRuntime`: helper owner validation still routes through `RuntimeHelperTargetStateWorld`, but roster lookup, state availability, and state entry now sit behind one match-level seam. Focused `RuntimeMatchHelperTargetStateSystem` coverage proves roster-backed target resolution, stale target payload isolation, missing-target no-op behavior, and owner-mismatch fail-closed behavior. This is ownership cleanup only; helper-owned custom-state tables, throws, teams/simul actor registries, multi-target helper ownership, exact helper TargetState timing, visual/audio parity, score movement, and full Helper VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeSnapshotWorld.match()` owns the bounded full match snapshot envelope outside `PlayableMatchRuntime`: selected P1 action, playback/speed/toggles, match pause handoff, stage/camera snapshot, round snapshot, player actor snapshots, effect snapshots, compatibility-session handoff, and 80-line log trimming route through one named boundary. Focused `RuntimeSnapshotSystem` coverage proves envelope fields, actor/effect clone isolation, and log cap behavior. This is ownership cleanup only; snapshot schema changes, compatibility telemetry semantics, exact camera/effect/renderer parity, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchTickBranchWorld` owns bounded per-tick branch arbitration outside `PlayableMatchRuntime`: hitpause wins before pause/active, match pause wins before active after hitpause clears, and active match runs only when neither pause layer owns the tick. Focused `RuntimeMatchTickBranchSystem` coverage proves this order. This is ownership cleanup only; exact MUGEN/IKEMEN pause layering/arbitration, hitpause/pause tick semantics, helper/team actor scheduling, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchStepWorld` owns bounded public match-step cadence outside `PlayableMatchRuntime`: stopped playback snapshots without frame-clock ticks, forced stepping advances exactly one tick, sub-1x speed samples on frame-clock divisors, multi-step speed loops advance in order, and round-over checks stop remaining iterations. Focused `RuntimeMatchStepSystem` coverage proves these edges. This is ownership cleanup only; exact MUGEN/IKEMEN pause/round arbitration, frame pacing, replay/rollback timing, helper/team actor scheduling, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous R1 trace restoration checkpoint: `synthetic-imported-envshake.json` checksum `061f17d5` is back in the required `pnpm qa:trace` artifact set. It gates imported `EnvShake` through required `ChangeState`, `EnvShake`, `HitDef`, typed `envshake` operation evidence, and bounded `RuntimeEnvShakeEvent` telemetry for P1 state `200`; current `pnpm qa:trace` after later presentation/Common1 gates passes 281/281 artifacts, 256 required and 25 optional. This is evidence-pipeline restoration only; exact camera waveform, pause/stage/layer interaction, helper/redirect ownership, visual parity, score movement, and full MUGEN/IKEMEN presentation parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchActiveWorld` now owns bounded normal active-match orchestration outside `PlayableMatchRuntime` after hitpause/pause gates: round timer tick, normal command-buffer writes, input control, fighter advance, post-fighter interaction/combat, and round-finish handling route through one named boundary. Focused `RuntimeMatchActiveSystem` coverage proves order and sub-world result preservation. This is ownership cleanup only; exact MUGEN/IKEMEN active tick order, pause-start arbitration, helper/team/redirect actor ownership, combat priority parity, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchHitPauseWorld` now owns bounded normal active-match hitpause handoff outside `PlayableMatchRuntime`: `RuntimeHitPauseWorld.advanceRuntime` delegation, P1/P2 inputs, stage/runtime ticks, paused presentation lifecycle, and ignorehitpause controller execution route through one named boundary before the normal pause branch. Focused `RuntimeMatchHitPauseSystem` coverage proves delegate payload forwarding and paused/not-paused result preservation. This is ownership cleanup only; exact MUGEN/IKEMEN hitpause tick order, pause arbitration/layering, helper/team/redirect hitpause ownership, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchFrameStartWorld` now owns bounded normal active-match frame-start ordering outside `PlayableMatchRuntime`: per-frame hit/assert flag reset, pre-facing `AssertSpecial`, and auto-facing route through one named boundary before hitpause/pause handling. Focused `RuntimeMatchFrameStartSystem` coverage proves reset-before-assert and assert-before-facing order for both players. This is ownership cleanup only; exact MUGEN/IKEMEN frame-start tick order, pause/hitpause arbitration, helper/team/redirect frame-start ownership, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchPostFighterWorld` now owns bounded normal active-match post-fighter bridge wiring outside `PlayableMatchRuntime`: combat resolver construction and `RuntimeMatchInteractionWorld.advanceRuntime` handoff route through one named boundary. Focused `RuntimeMatchPostFighterSystem` coverage proves target memory, effect lifecycle, projectile clash, actor constraints, target bindings, direct/projectile/helper combat, clamps, and presentation effect forwarding after resolver construction. This is ownership cleanup only; exact MUGEN/IKEMEN post-fighter tick order, combat priority parity, projectile/helper contact timing, helper/team/redirect ownership, target lifetime parity, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchInputControlWorld` now owns bounded normal active-match P1/P2-controlled/simple-AI input dispatch outside `PlayableMatchRuntime`: P1 player input, controlled P2 player input, and uncontrolled P2 simple-AI fallback route through one named boundary after normal command-buffer writes. Focused `RuntimeMatchInputControlSystem` coverage proves P1-before-controlled-P2 ordering, mirrored opponent arguments, and P1-before-AI fallback ordering. This is ownership cleanup only; exact MUGEN/IKEMEN input priority, command timing, input-conflict resolution, pause/hitpause command parity, helper/team/redirect command ownership, AI parity, visual/audio parity, score movement, and full input VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchRoundWorld` now owns bounded active-match round timer delegation plus finish side effects outside `PlayableMatchRuntime`: timer tick routes through the boundary, and KO/time-over finish routes match stop plus log emission through one named world. Focused `RuntimeMatchRoundSystem` coverage proves timer delegation, finish stop/log mutation, and no-finish no-op behavior. This is ownership cleanup only; exact round-flow timing, intros/winposes, KO slowdown, continue flow, teams/simul/turns, lifebar/screenpack behavior, visual/audio parity, score movement, and full round VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchFighterAdvanceWorld` owns bounded active 1v1 fighter-advance orchestration outside `PlayableMatchRuntime`: P1 advance, P2 auto-guard start, pause-gated P2 advance, and P1 auto-guard start route through one named world. Focused `RuntimeMatchFighterAdvanceSystem` coverage proves normal P1/P2 ordering and pause-after-P1 skip behavior. This is ownership cleanup only; exact player tick order, pause-start arbitration, teams/simul roster advance, helper/team/redirect actor advance semantics, guard-start parity, visual/audio parity, score movement, and full match VM parity remain blocked.

Previous R2 MatchWorld ownership checkpoint: `RuntimeMatchPauseControllerWorld` owns bounded Pause/SuperPause controller result side effects outside `PlayableMatchRuntime`, while `RuntimePauseWorld` still owns current pause-state mutation/snapshot/tick and `RuntimePausedMatchWorld` still owns paused-match ordering. Focused `PauseSystem` coverage proves tick/controller/op forwarding, power-delta handoff, log emission, and zero-length no-side-effect behavior. This is ownership cleanup only; exact pause layering, SuperPause background/effects/sound timing, helper/team/redirect pause ownership, pause/hitpause command parity, visual/audio parity, score movement, and full pause VM parity remain blocked.

Previous R2 combat-bridge checkpoint: `RuntimeMatchCombatBridgeWorld` owns bounded priority/direct/projectile/helper combat resolver construction outside `PlayableMatchRuntime`, with focused coverage for route wiring, hurtbox forwarding, projectile target-memory callback forwarding, and log forwarding. This is ownership cleanup only; exact combat priority, helper-owned contact timing, projectile hit/cancel timing, teams/simul/multi-target breadth, visual/audio parity, score movement, and full combat VM parity remain blocked.

Latest R1 optional KFM/Common1 crouch guard slide-stop checkpoint: `kfm-official-default-crouch-guard-slide-stop.json` checksum `d11153d0` now passes when private `.scratch/fixtures/kfm-official.zip` exists. It proves real KFM/Common1 crouch guard-hit state `153` executes ordered `HitVelSet`, `kinematic:hitvelset`, `VelSet`, `kinematic:velset`, `CtrlSet`, `resource:ctrlset`, and final `ChangeState` after direct guarded contact while holding down-back. Current `pnpm qa:trace` passes 281/281 artifacts, 256 required and 25 optional. This is private-fixture confidence only; public KFM support, exact guard timing, proximity guard, guard effects, public `130` guard-hold return, visual/audio parity, score movement, and full guard parity remain blocked.

Previous R1 Common1 crouch guard slide-stop checkpoint: `synthetic-imported-crouch-guard-slide-stop.json` checksum `2bea7311` is required and proves bounded defender-owned crouch guard-hit routing through `152 -> 153 -> 130` after direct guarded contact. The gate requires active `holddown` / `x`, named controller/typed-operation order through `ChangeAnim`, `ChangeState`, `HitVelSet`, `kinematic:hitvelset`, `VelSet`, `kinematic:velset`, `CtrlSet`, `resource:ctrlset`, and final `ChangeState`, plus actor-frame velocity evidence showing crouch guard-slide velocity before stop/control. This is crouch guard slide-stop/control evidence only; exact guard timing, proximity guard, guard effects, controller-loop tick parity, visual/audio parity, score movement, and full guard parity remain blocked.

Previous R1 Common1 stand guard slide-stop checkpoint: `synthetic-imported-default-guard-slide-stop.json` checksum `a9663641` is required and proves bounded defender-owned stand guard-hit routing through `150 -> 151 -> 130` after direct guarded contact. The gate requires named controller/typed-operation order through `ChangeAnim`, `ChangeState`, `HitVelSet`, `kinematic:hitvelset`, `VelSet`, `kinematic:velset`, `CtrlSet`, `resource:ctrlset`, and final `ChangeState`, plus actor-frame velocity evidence showing guard-slide velocity before stop/control. That required checkpoint passed `pnpm qa:trace` at 271/271 artifacts, 248 required and 23 optional. This is stand guard slide-stop/control evidence only; exact guard timing, proximity guard, guard effects, crouch/air parity, controller-loop tick parity, visual/audio parity, score movement, and full guard parity remain blocked.

Previous optional R1 KFM/Common1 stand guard slide-stop checkpoint: `kfm-official-default-guard-slide-stop.json` checksum `885bb1da` passes when private `.scratch/fixtures/kfm-official.zip` exists. Latest optional stand guard-hold walk-control checkpoint `kfm-official-default-guard-hold-walk-return.json` checksum `885bb1da` extends that same route with actor-frame sequence evidence that real KFM/Common1 stand guard-hit `150 -> 151` returns through observable guard-hold state `130` and then resumes held-back walking state/action `20` with control. The hold-only subset remains `kfm-official-default-guard-hold-return.json` checksum `885bb1da`. This is private-fixture confidence only; public KFM support, exact guard-hold duration, exact guard timing, proximity guard, guard effects, crouch/air guard-hold parity, visual/audio parity, score movement, and full guard parity remain blocked.

Previous R1 GetHitVar velocity checkpoint: `synthetic-imported-gethitvar-velocity.json` checksum `878a03f7` is required and proves bounded defender-owned normal get-hit CNS can branch from `5000` into state/action `324` through `GetHitVar(xvel) = 4 && GetHitVar(yvel) = -2 && !GetHitVar(fall) && !GetHitVar(guarded)` after direct `HitDef` contact. That checkpoint passed `pnpm qa:trace` at 270/270 artifacts, 247 required and 23 optional. This is direct-contact normal-hit velocity metadata trigger evidence only; exact velocity lifetime after later physics/controllers, helper/projectile/custom-state inheritance breadth, teams/simul, visual/audio parity, score movement, and full get-hit parity remain blocked.

Previous R1 GetHitVar damage checkpoint: `synthetic-imported-gethitvar-damage.json` checksum `2c726114` is required and proves bounded defender-owned normal get-hit CNS can branch from `5000` into state/action `323` through `GetHitVar(damage) = 37 && !GetHitVar(guarded)` after direct `HitDef` contact. Direct and projectile combat store bounded applied damage in shared runtime hit vars, but this trace only claims the direct-contact normal-hit branch. This is damage metadata trigger evidence only; exact damage lifetime/rounding, guard-chip semantics, helper/projectile/custom-state inheritance breadth, teams/simul, visual/audio parity, score movement, and full get-hit parity remain blocked.

Previous R1 Common1 default crouch get-hit progression checkpoint: `synthetic-imported-default-crouch-gethit-progression.json` checksum `fd986a9e` is required and proves bounded defender-owned state order `5010 -> 5011 -> 0` when P2 holds crouch and a direct `HitDef` omits `p2stateno`, including ordered `5010:ChangeState -> 5011:ChangeState` controller evidence, ordered actor-frame evidence, crouch state/physics telemetry, `Clsn2` telemetry, final checksum `d6b64044`, and final idle/control. That required checkpoint passed at 267/267 artifacts, 245 required and 22 optional before later addenda. This is crouch HitShakeOver/HitOver progression evidence only; exact tick timing, exact crouch get-hit animation/slide tables, fall routing, custom-state/helper/team breadth, visual/audio parity, score movement, and full Common1 get-hit parity remain blocked.

Latest optional R1 KFM/Common1 crouch get-hit progression checkpoint: `kfm-official-default-crouch-gethit-progression.json` checksum `3d197fae` passes when private `.scratch/fixtures/kfm-official.zip` exists. The gate confirms real KFM held-crouch prep state `11`, Common1 `5010 -> 5011 -> 0` through `HitShakeOver` / `HitOver`, final checksum `f469a942`, KFM-specific frame evidence for `5010` anim `5010`, `5011` anim `5020`, `Clsn2 = 2/3`, body width `39/39`, bounded crouch slide velocity, and ordered KFM crouch slide controller/typed-operation evidence through `5010` `ChangeAnim` / `ChangeState`, `5011` `HitVelSet`, `VelMul`, `VelSet`, `DefenceMulSet`, and final `ChangeState`. This is private-fixture confidence only; public KFM support, exact tick timing, exact crouch get-hit animation/slide tables beyond this bounded frame/controller profile, fall routing, custom-state/helper/team breadth, visual/audio parity, score movement, and full Common1 get-hit parity remain blocked.

Latest optional R1 KFM/Common1 air-entry recovery checkpoint: `kfm-official-default-air-fall-recovery-input.json` checksum `a431028a` and `kfm-official-default-air-fall-recovery-too-early.json` checksum `a1db1589` pass when private `.scratch/fixtures/kfm-official.zip` exists. The input route confirms real KFM `5020 -> 5030 -> 5035 -> 5050 -> 5210 -> 52 -> 0`, with the `5030` countdown reaching `0` before KFM's intermediate `5035`; the negative route confirms `5020 -> 5030 -> 5035 -> 5050` rejects early `command = "recovery"` while recovery/landing/ground-impact states stay forbidden. `pnpm qa:trace` now passes 266/266 artifacts, 244 required and 22 optional. This is private-fixture confidence only; public KFM support, exact thresholds, velocity math, tick-order parity, visual/audio parity, score movement, and full Common1 recovery parity remain blocked.

Latest R1 Common1 default air recovery too-early checkpoint: `synthetic-imported-default-air-fall-recovery-too-early.json` checksum `48a2e708` is now required and proves bounded defender-owned state order `5020 -> 5030 -> 5050` when P2 is airborne and a fall `HitDef` omits `p2stateno`, including active early `recovery` command evidence, positive `fall.recovertime` in `5050` from `11` to `6`, forbidden recovery/landing states `5210`, `5200`, `5201`, `52`, `5100`, `5101`, `5110`, and `5120`, and final P2 still in `5050` without control. `pnpm qa:trace` now passes 264/264 artifacts, 244 required and 20 optional. This is air-entry early recovery-input rejection evidence only; exact recovery threshold tables, exact air get-hit animation, exact velocity math, exact controller-loop timing, recovery arbitration between air/ground branches, visual/audio parity, score movement, and full Common1 recovery parity remain blocked.

Previous R1 Common1 default air recovery-input checkpoint: `synthetic-imported-default-air-fall-recovery-input.json` checksum `334a419e` remains required and proves bounded defender-owned state order `5020 -> 5030 -> 5050 -> 5210 -> 52 -> 0` when P2 is airborne and a fall `HitDef` omits `p2stateno`, including active `recovery` command evidence, positive-to-zero `fall.recovertime` in `5050`, `5210` air-recovery velocity, `52` y = 0 landing, and final idle/control evidence. That checkpoint passed 263/263 artifacts, 243 required and 20 optional. This is air-entry recovery-input evidence only; exact recovery threshold tables, exact air get-hit animation, exact velocity math, exact controller-loop timing, recovery arbitration between air/ground branches, visual/audio parity, score movement, and full Common1 recovery parity remain blocked.

Previous R1 Common1 default air lie-down recovery checkpoint: `synthetic-imported-default-air-liedown-recovery.json` checksum `56a8f236` remains required and proves bounded defender-owned state order `5020 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0` when P2 is airborne and a fall `HitDef` omits `p2stateno`, including `5101` `HitFallVel`, `5110` `HitFallDamage`, `hitfall:hitfallvel` / `hitfall:hitfalldamage`, bounded `5110` `downRecoverTime` countdown, and final idle/control evidence. That checkpoint passed 262/262 artifacts, 242 required and 20 optional. This is air fall get-hit state/order plus bounce, lie-down countdown, get-up, and idle-return evidence only; exact air get-hit animation, exact `HitShakeOver` / `HitOver` timing, exact ground-impact timing/position, exact bounce physics, exact lie-down duration tables, recovery input, landing nuance, controller-loop timing, visual/audio parity, score movement, and full Common1 fall/get-hit parity remain blocked.

Previous R1 Common1 default air ground-impact checkpoint: `synthetic-imported-default-air-ground-impact.json` checksum `0ba3c80f` remains required and proves bounded defender-owned state order `5020 -> 5030 -> 5050 -> 5100` when P2 is airborne and a fall `HitDef` omits `p2stateno`, including `5100` `HitFallDamage` / `hitfall:hitfalldamage` evidence. That checkpoint passed 261/261 artifacts, 241 required and 20 optional. This is air fall get-hit state/order plus ground-impact controller evidence only; exact air get-hit animation, exact `HitShakeOver` / `HitOver` timing, exact ground-impact timing/position, bounce physics, lie-down timing, landing, recovery input, controller-loop timing, visual/audio parity, score movement, and full Common1 fall/get-hit parity remain blocked.

Previous R1 Common1 default air fall get-hit checkpoint: `synthetic-imported-default-air-fall-gethit.json` checksum `1230a2f3` remains required and proves bounded defender-owned state order `5020 -> 5030 -> 5050` when P2 is airborne and a fall `HitDef` omits `p2stateno`. That checkpoint passed 260/260 artifacts, 240 required and 20 optional. This is air fall get-hit state/order evidence only; exact air get-hit animation, exact `HitShakeOver` / `HitOver` timing, ground impact, bounce, lie-down, landing, recovery input, controller-loop timing, visual/audio parity, score movement, and full Common1 fall/get-hit parity remain blocked.

Previous R1 Common1 default air get-hit checkpoint: `synthetic-imported-default-air-gethit.json` checksum `dc4fb7c9` remains required and proves bounded defender-owned state selection into `5020` when P2 is airborne and a direct `HitDef` omits `p2stateno`. That checkpoint passed 259/259 artifacts, 239 required and 20 optional. This is air default get-hit state-selection evidence only; exact air get-hit animation, fall route, landing route, air recovery, `HitShakeOver`/`HitOver` progression, controller-loop timing, visual/audio parity, score movement, and full Common1 get-hit parity remain blocked.

Previous R1 Common1 default crouch get-hit checkpoint: `synthetic-imported-default-crouch-gethit.json` checksum `7ec18c61` remains required and proves bounded defender-owned state selection into `5010` when P2 holds crouch and a direct `HitDef` omits `p2stateno`. That checkpoint passed 258/258 artifacts, 238 required and 20 optional. This is crouch default get-hit state-selection evidence only; exact crouch get-hit animation, slide timing, fall routing, `HitShakeOver`/`HitOver` progression, controller-loop timing, visual/audio parity, score movement, and full Common1 get-hit parity remain blocked.

Previous R1 Projectile fixed-id contact/guard-time checkpoint: `synthetic-imported-projectile-contacttime-id.json` checksum `e9ebf36a` and `synthetic-imported-projectile-guardedtime-id.json` checksum `dfd08f28` are required and prove bounded owner-state `ProjContactTime(77)` / `ProjGuardedTime(77)` branching after player-owned Projectile contact/guard markers, routing P1 from state/action `200` into `321` and `322` with hit/guard event/reason, Projectile lifecycle, effect-store, and target-link evidence. That checkpoint passed 257/257 artifacts, 237 required and 20 optional. This is fixed-id contact/guard-time trigger evidence only; exact contact/guard tick-order/lifetime, multi-projectile same-id selection, helper-owned projectile routing, redirects, teams/simul, visual/audio parity, score movement, and full Projectile timing parity remain blocked.

Previous R1 Projectile cancel-time owner any-id checkpoint: `synthetic-imported-projectile-canceltime-any.json` checksum `5bff1961` remains required and proves bounded owner-state `ProjCancelTime(0)` branching after that owner's player-owned Projectile id `77` is canceled by an opposing Projectile clash, routing P2 from state/action `200` into `320` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `918`, projectile lifecycle, effect-store, and payload evidence. This is owner-state any-id cancel-time trigger evidence for one canceled Projectile route only; exact cancel tick-order/lifetime, broad dynamic expression parity, multi-projectile any-id arbitration beyond this route, exact priority classes, helper-owned projectile routing, redirects, teams/simul, visual/audio parity, score movement, and full Projectile cancel parity remain blocked.

Previous R1 Projectile cancel-time owner var-id checkpoint: `synthetic-imported-projectile-canceltime-var.json` checksum `e057e102` remains required and proves bounded owner-state `ProjCancelTime(var(0))` branching after owner-local `VarSet` seeds canceled player-owned Projectile id `77`, routing P2 from state/action `200` into `319` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `917`, projectile lifecycle, effect-store, and payload evidence.

Previous R1 Projectile cancel-time owner dynamic-id checkpoint: `synthetic-imported-projectile-canceltime-dynamic.json` checksum `0da26c87` remains required and proves bounded owner-state expression-derived `ProjCancelTime(77 + var(0))` branching after that owner's player-owned Projectile is canceled by an opposing Projectile clash, routing P2 from state/action `200` into `318` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `916`, projectile lifecycle, effect-store, and payload evidence.

Previous R1 Helper Projectile cancel-time dynamic-id checkpoint: `synthetic-imported-helper-projcanceltime-dynamic.json` checksum `cc78dde2` remains required and proves bounded helper-local expression-derived `ProjCancelTime(8869 + var(0))` branching after that helper-parented owner-side Projectile is canceled by an opposing Projectile clash, routing the Helper from state/action `1270` into `1271` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `1018`, helper/projectile lifecycle, effect-store, and payload evidence. Focused helper-local runtime coverage separately proves nonzero `ProjCancelTime(var(n))` id selection against helper-parented canceled Projectiles. This is helper-local dynamic-id cancel-time trigger evidence only; exact cancel tick-order/lifetime, broad dynamic expression parity, multi-projectile same-id selection, exact priority classes, helper-owned custom states, redirects, teams/simul, visual/audio parity, score movement, and full Helper/Projectile cancel parity remain blocked.

Previous R1 Helper Projectile cancel-time fixed-id checkpoint: `synthetic-imported-helper-projcanceltime-id.json` checksum `fc412176` remains required and proves bounded helper-local `ProjCancelTime(8868)` branching after that helper-parented owner-side Projectile is canceled by an opposing Projectile clash, routing the Helper from state/action `1268` into `1269` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `1008`, helper/projectile lifecycle, effect-store, and payload evidence. This is helper-local fixed-id cancel-time trigger evidence only; exact cancel tick-order/lifetime, multi-projectile same-id selection, exact priority classes, helper-owned custom states, redirects, teams/simul, visual/audio parity, score movement, and full Helper/Projectile cancel parity remain blocked.

Previous R1 Helper Projectile cancel-time any checkpoint: `synthetic-imported-helper-projcanceltime-any.json` checksum `f7e7fa01` remains required and proves bounded helper-local `ProjCancelTime(0)` branching after a helper-parented owner-side Projectile is canceled by an opposing Projectile clash, routing the Helper from state/action `1266` into `1267` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback anim `998`, helper/projectile lifecycle, effect-store, and payload evidence. This is helper-local cancel-time trigger evidence only; exact cancel tick-order/lifetime, exact priority classes, multi-projectile any-id selection semantics beyond this route, helper-owned custom states, redirects, teams/simul, visual/audio parity, score movement, and full Helper/Projectile cancel parity remain blocked.

Previous R1 Projectile cancel-time checkpoint: `synthetic-imported-projectile-canceltime.json` checksum `64e8dec4` remains required and proves bounded owner-state `ProjCancelTime(77)` branching after that owner's player-owned Projectile is canceled by an opposing Projectile clash, routing P2 into state/action `283` with clash/cancel runtime-event evidence, loser `projcancelanim` terminal playback, projectile lifecycle, effect-store, and payload evidence. This is owner-state cancel-time trigger evidence only; exact cancel tick-order/lifetime, exact priority classes, multi-projectile id `0` selection, redirects, teams/simul, visual/audio parity, score movement, and full Projectile cancel parity remain blocked.

Previous R1 helper Projectile guard/contact-time checkpoint: `synthetic-imported-helper-projguardedtime-any.json` checksum `1f1a38e4` and `synthetic-imported-helper-projcontacttime-any.json` checksum `0d9f7829` remain required and prove bounded helper-local `ProjGuardedTime(0)` / `ProjContactTime(0)` any-projectile branching after helper-parented Projectile guard/contact markers, routing the Helper into state/actions `1263` and `1265` with guard event/reason, helper/projectile lifecycle, effect-store, target-link, and sound/FightFX package evidence. This is helper-local guard/contact-time trigger evidence only; exact contact/guard tick-order/lifetime, multi-projectile any-id selection, helper-owned custom-state targets, redirects, teams/simul, visual/audio parity, score movement, and full Helper/Projectile parity remain blocked.

Previous R1 helper Projectile hit-time checkpoint: `synthetic-imported-helper-projhittime-any.json` checksum `bca9f47b` remains required and proves bounded helper-local `ProjHitTime(0)` any-projectile hit-time branching after a helper-parented Projectile hit, routing the Helper into state/action `1261` with hit event/reason, helper/projectile lifecycle, effect-store, target-link, and sound/FightFX package evidence. This is helper-local hit-time trigger evidence only; exact hit tick-order/lifetime, multi-projectile any-id selection, helper-owned custom-state targets, redirects, teams/simul, visual/audio parity, score movement, and full Helper/Projectile parity remain blocked.

Previous R1 projectile hit-time checkpoint: `synthetic-imported-projectile-hittime-any.json` checksum `47c1cf7f` remains required and proves bounded owner-state `ProjHitTime(0)` any-projectile hit-time branching after a player-owned Projectile hit, routing P1 into state/action `282` with hit event/reason, Projectile lifecycle, effect-store, and target-link evidence. This is player-owned hit-time trigger evidence only; exact hit tick-order/lifetime, multi-projectile id=0 selection, exact helper-local timing beyond bounded helper gates, redirects, teams/simul, visual/audio parity, score movement, and full Projectile hit parity remain blocked.

Previous R1 projectile contact-time checkpoint: `synthetic-imported-projectile-contacttime-any.json` checksum `f1751155` remains required and proves bounded owner-state `ProjContactTime(0)` any-projectile contact-time branching after a player-owned Projectile contact, routing P1 into state/action `281` with hit event/reason, Projectile lifecycle, effect-store, and target-link evidence. This is contact-time trigger evidence only; exact contact tick-order/lifetime, multi-projectile id=0 selection, exact helper-local timing beyond bounded helper gates, redirects, teams/simul, visual/audio parity, score movement, and full Projectile contact parity remain blocked.

Previous R1 projectile guarded-time checkpoint: `synthetic-imported-projectile-guardedtime-any.json` checksum `c8473340` remains required and proves bounded owner-state `ProjGuardedTime(0)` any-projectile guard-time branching after a player-owned Projectile guard, routing P1 into state/action `279` with guard event/reason, Projectile lifecycle, effect-store, and target-link evidence. This is guarded contact-time trigger evidence only; exact guard tick-order/lifetime, multi-projectile id=0 selection, exact helper-local timing beyond bounded helper gates, redirects, teams/simul, visual/audio parity, score movement, and full Projectile guard parity remain blocked.

Previous R1 target-memory mix checkpoint: `synthetic-imported-hitdef-projectile-target-mix.json` checksum `e98d4857` remains required and proves bounded owner-local target memory can retain separate direct `HitDef` id `77` and player-owned `Projectile` id `78` in one active state, then branch through `NumTarget(77)`, `Target(77), Life`, `NumTarget(78)`, and `Target(78), Life` into state/action `278`. This is target-memory trigger evidence only; Target* mutation mixing, helper-owned projectile targets, helper-owned custom state tables, teams/simul, multi-target selection, exact target lifetime/tick order, visual parity, score movement, and full target/combat parity remain blocked.

Previous R1 helper Projectile air guard hitshake-time checkpoint: `synthetic-imported-helper-projectile-gethitvar-air-guard-hitshaketime.json` checksum `3c3f2e25` remains required and proves bounded defender-owned Common1-style air guard-hit routing through helper-parented Projectile air guard `GetHitVar(hitshaketime)` into state/action `317`.

Previous R1 player Projectile air guard hitshake-time checkpoint: `synthetic-imported-projectile-gethitvar-air-guard-hitshaketime.json` checksum `3fcf1421` remains required and proves bounded defender-owned Common1-style air guard-hit routing through player-owned Projectile air guard `GetHitVar(hitshaketime)` into state/action `316`.

Previous R1 air guard hitshake-time checkpoint: `synthetic-imported-gethitvar-air-guard-hitshaketime.json` checksum `703e9328` remains required and proves bounded defender-owned Common1-style air guard-hit routing through direct-`HitDef` air guard `GetHitVar(hitshaketime)` into state/action `315`.

Previous R1 crouch guard hitshake-time checkpoint: `synthetic-imported-gethitvar-crouch-guard-hitshaketime.json` checksum `b31d1dac` remains required and proves bounded defender-owned Common1-style crouch guard-hit routing through direct-`HitDef` crouch guard `GetHitVar(hitshaketime)` into state/action `314`.

Previous R1 helper Projectile guard hitshake-time checkpoint: `synthetic-imported-helper-projectile-gethitvar-guard-hitshaketime.json` checksum `64a1a8bd` remains required and proves bounded defender-owned Common1-style guard-hit routing through helper-parented Projectile `GetHitVar(hitshaketime)` into state/action `313`.

Previous R1 player Projectile guard hitshake-time checkpoint: `synthetic-imported-projectile-gethitvar-guard-hitshaketime.json` checksum `724f66d6` remains required and proves bounded defender-owned Common1-style guard-hit routing through player-owned Projectile `GetHitVar(hitshaketime)` into state/action `312`.

Previous R1 direct guard hitshake-time checkpoint: `synthetic-imported-gethitvar-guard-hitshaketime.json` checksum `31d76de9` remains required and proves bounded defender-owned Common1-style guard-hit routing through direct-`HitDef` `GetHitVar(hitshaketime)` into state/action `311`.

Previous R1 normal hitshake-time checkpoint: `synthetic-imported-gethitvar-hitshaketime.json` checksum `655107b9` remains required and proves bounded defender-owned Common1-style normal get-hit routing through `GetHitVar(hitshaketime) > 0 && !GetHitVar(guarded)` into state/action `310` after a direct `HitDef` hit.

Previous R1 normal hit-time checkpoint: `synthetic-imported-gethitvar-hittime.json` checksum `a11beef0` remains required and proves bounded defender-owned Common1-style normal get-hit routing through `GetHitVar(hittime) > 0 && !GetHitVar(guarded)` into state/action `309` after a direct `HitDef` hit.

Previous R1 guard timing hit-var checkpoint: `synthetic-imported-gethitvar-guard-timing.json` checksum `cf92c669` remains required and proves bounded defender-owned Common1-style guard-hit routing through `GetHitVar(hittime)`, `GetHitVar(slidetime)`, and `GetHitVar(ctrltime)` into state/action `308` after a direct `HitDef` guard.

Previous R1 get-hit down-recovery metadata checkpoint: `synthetic-imported-gethitvar-down-recover.json` checksum `b8a7aef0` remains required and proves bounded owner-backed get-hit state routing through `GetHitVar(down.recover) = 1`, `GetHitVar(down.recovertime) = 45`, and alias `GetHitVar(recovertime) = 45` into state/action `307` before lie-down recovery consumes the timer.

Previous R1 get-hit env-shake metadata checkpoint: `synthetic-imported-gethitvar-fall-envshake.json` checksum `6364632a` remains required and proves bounded owner-backed get-hit routing through `GetHitVar(fall.envshake.time) = 15`, `GetHitVar(fall.envshake.freq) = 178`, `GetHitVar(fall.envshake.ampl) = 6`, and `GetHitVar(fall.envshake.phase) = 0` into state/action `306` before `FallEnvShake` presentation executes.

Previous R1 get-hit fallcount checkpoint: `synthetic-imported-gethitvar-fallcount.json` checksum `c391d938` remains required and proves bounded owner-backed get-hit routing where state `5100` `HitFallDamage` records one ground impact, consumes `fall.damage`, and `GetHitVar(fallcount) = 1 && GetHitVar(fall.damage) = 0` routes into state/action `328`.

Previous R1 get-hit metadata checkpoint: `synthetic-imported-gethitvar-fall-metadata.json` checksum `474fa734` remains required and proves bounded owner-backed get-hit routing through `GetHitVar(fall.damage) = 70`, `GetHitVar(fall.kill) = 0`, `GetHitVar(fall.xvel) = 3`, and `GetHitVar(fall.yvel) = -6` into state/action `305` before `HitFallDamage` resolves.

Previous R1 trigger evidence includes `synthetic-imported-teamside.json` checksum `f55695b7` for bounded imported State -1 `TeamSide` / `EnemyNear, TeamSide` routing, `synthetic-imported-helper-projectile-gethitvar-guarded.json` checksum `2b413bd7` for bounded helper-parented Projectile guarded metadata, `synthetic-imported-projectile-gethitvar-guarded.json` checksum `a0104472` for bounded player-owned Projectile guarded metadata, `synthetic-imported-gethitvar-guarded.json` checksum `7c36defb` for bounded direct-`HitDef` guarded metadata, `synthetic-imported-gethitvar-fall-recover.json` checksum `259b300f` for bounded `GetHitVar(fall.recover)` vs `CanRecover` routing, `synthetic-imported-animelem-offset.json` checksum `4484031d` for bounded `AnimElem = 2, = 4` routing, `synthetic-imported-animelem.json` checksum `683d9a10` for bounded `AnimElem = 2, = 0` routing, `synthetic-imported-owner-metrics.json` checksum `1a61aaeb` for bounded owner metric routing, `synthetic-imported-p2-distance.json` checksum `2c584be0` for bounded current-opponent spacing routing, `synthetic-imported-p2-state-context.json` checksum `caf32557` for bounded current-opponent metadata routing, `synthetic-imported-state-context.json` checksum `cb9c3d1e` for bounded owner-context routing, `synthetic-imported-gametime.json` checksum `bab573f3` for bounded global tick routing, `synthetic-imported-edge-distance.json` checksum `785de452` for bounded stage edge-distance routing, `synthetic-imported-animelemtime.json` checksum `2036557d` for bounded animation-element timing, `synthetic-imported-animtime.json` checksum `9e42b546` for bounded animation-end routing, and `synthetic-imported-selfanimexist.json` checksum `99930032` for bounded State -1 own-animation lookup.

Latest R2 expression-context checkpoint: `FrontEdgeDist`, `BackEdgeDist`, `FrontEdgeBodyDist`, and `BackEdgeBodyDist` now read supplied stage bounds through active trigger contexts, dynamic controller-param fallback, extracted passive controller systems, and first-generation visual Helper micro-VM contexts; required `synthetic-imported-edge-distance.json` checksum `785de452` promotes the imported State -1 route into `qa:trace`. Focused evaluator/context/helper tests still prove bounded values plus the no-stage fallback. This is trigger/expression plumbing only; exact screen/camera edge parity, localcoord scaling, teams/simul/helper namespace breadth, visual parity, score movement, and full MUGEN/IKEMEN edge-distance parity remain blocked.

Latest R2 EnvShake bridge ownership checkpoint: `RuntimeMatchEnvShakeBridgeWorld` now owns the bounded match-level EnvShake and FallEnvShake handoff used by active controller routes. `PlayableMatchRuntime` delegates controller source, typed operation data when available, runtime tick, telemetry hooks, and `RuntimeEnvShakeWorld` emission through that named boundary while still owning trigger filtering, loop ordering, actor-world lifetime, and broad presentation timing. This is ownership cleanup only; exact camera waveform, pause/stage/layer timing, helper/redirect ownership breadth, renderer parity, visual parity, and score movement remain blocked.

Previous R2 EnvColor bridge ownership checkpoint: `RuntimeMatchEnvColorBridgeWorld` now owns the bounded match-level EnvColor handoff used by active, pause, and hitpause ignored-controller routes. `PlayableMatchRuntime` delegates controller source, typed `envcolor` operation data when available, runtime tick, and `RuntimeEnvColorWorld` emission through that named boundary while still owning trigger filtering, loop ordering, stage-world lifetime, and broad presentation timing. This is ownership cleanup only; exact EnvColor blend math, layer/window ordering, pause layering/timing, renderer parity, visual parity, and score movement remain blocked.

Previous R2 fighter state ownership checkpoint: `RuntimeFighterStateWorld` now owns bounded fighter runtime-state construction for resource maxima, damage multipliers, initial runtime/action/control state, command buffers, contact memory, telemetry buckets, injected world references, deterministic RNG seed, and lazy runtime-program compilation. `PlayableMatchRuntime` delegates P1/P2 construction while still supplying stage starts, actor ids, definitions, and injected match worlds. This is ownership cleanup only; exact player lifecycle parity, helper/custom-state clone breadth, team/simul roster ownership, intro/round lifecycle, visual parity, and score movement remain blocked.

Previous R2 match reset ownership checkpoint: `RuntimeMatchResetWorld` now owns bounded match reset orchestration for round timer reset, pause reset, EnvColor reset, effect actor store reset, in-place P1/P2 recreation, helper TargetState handler reattachment, and reset logging. `PlayableMatchRuntime` delegates the reset lifecycle through that boundary while still supplying concrete fighter construction, stage starts, injected worlds, and field assignment. This is ownership cleanup only; exact round-flow parity, continue/round intro semantics, helper/custom-state reset breadth, screenpack/lifebar reset behavior, visual parity, and score movement remain blocked.

Previous R2 helper TargetState handler ownership checkpoint: `RuntimeHelperTargetStateWorld` now owns bounded helper TargetState handler attach/re-attach wiring for match actors. `PlayableMatchRuntime` delegates constructor/reset callback binding through the same helper TargetState world that already validates owner identity, target lookup, unavailable target states, and owner-backed entry. This is ownership cleanup only; helper-owned custom-state table parity, throws, teams/simul, multi-target/helper-owned opponent selection, exact helper TargetState timing, visual parity, and score movement remain blocked.

Previous R2 frame/collision ownership checkpoint: `RuntimeFrameWorld` now owns bounded current AIR frame lookup plus cloned `Clsn1` / `Clsn2` projection for runtime and snapshot consumers. `PlayableMatchRuntime` delegates current-frame reads, guard-distance hurtbox fallback, and `AfterImage` sample frame reads through the named boundary while preserving direct frame `Clsn1` handoff for `ReversalDef`; `RuntimeSnapshotWorld` delegates active move hitbox, frame hitbox, and missing-frame default hurtbox projection through the same contract. This is ownership cleanup only; exact collision priority, frame timing, guard-distance thresholds, rotated/scaled box semantics, helper/team/redirect collision ownership, renderer parity, visual parity, and score movement remain blocked.

Previous R2 afterimage sample ownership checkpoint: `RuntimeAfterImageSampleWorld` now owns bounded `AfterImage` sample projection from actor runtime state plus the current AIR frame before `RuntimeSpriteEffectWorld` captures ghost-trail samples. `PlayableMatchRuntime` still supplies the current-frame lookup, actor/state-owner selection context, trigger/controller order, and broader render projection. This is ownership cleanup only; exact ghost-trail sampling cadence, material/blend parity, helper/team/redirect presentation ownership, renderer parity, visual parity, and score movement remain blocked.

Previous R2 controller evaluation context ownership checkpoint: `RuntimeControllerEvaluationContextWorld` now owns bounded `StateControllerExecutor` context creation from `PlayableMatchRuntime`: owner const reads, actor hitpause reads, actor random callbacks, and stage-time forwarding route through a named context factory before active runtime-controller dispatch. This is ownership cleanup only; full passive-controller parity, exact CNS controller-loop timing, helper/team/redirect context scopes, exact random stream parity, visual parity, and score movement remain blocked.

Previous R2 dispatch evaluation ownership checkpoint: `RuntimeDispatchEvaluationWorld` now owns bounded dynamic active-controller dispatch-param fallback from `PlayableMatchRuntime`: compiled numeric/Boolean values short-circuit, dynamic fallback expressions request a context through `RuntimeExpressionContextWorld`, numeric results are finite/truncated, Boolean params use numeric truthiness, and actor/opponent/owner/tick forwarding is covered by focused tests. This is ownership cleanup only; full dynamic-param parity, persistent-controller timing, exact CNS controller tick order, helper/team/redirect parameter scopes, visual parity, and score movement remain blocked.

Previous R2 trigger evaluation ownership checkpoint: `RuntimeTriggerEvaluationWorld` now owns bounded normalized `TriggerIr` expression evaluation from `PlayableMatchRuntime`: actor/opponent/owner/tick forwarding, context-factory handoff, raw expression result capture, and Boolean pass/fail projection. `RuntimeExpressionContextWorld` still owns concrete read-model creation and `RuntimeTriggerGateWorld` still owns trigger grouping/order. This is ownership cleanup only; full expression language parity, persistent-controller timing, exact CNS trigger tick order, helper/team/redirect trigger scopes, visual parity, and score movement remain blocked.

Previous R2 trigger gate ownership checkpoint: `RuntimeTriggerGateWorld` now owns bounded CNS trigger grouping/order from `PlayableMatchRuntime`: `triggerall` AND preconditions, numbered `triggerN` OR groups, no-numbered-trigger pass-through, and short-circuit ordering. `PlayableMatchRuntime` now supplies single-trigger pass/fail through `RuntimeTriggerEvaluationWorld`, actor/opponent/owner context through `RuntimeExpressionContextWorld`, concrete dispatch, and exact VM timing. Focused `RuntimeTriggerGateSystem` coverage proves `triggerall` failure skips numbered groups, first passing numbered group wins, no-numbered groups pass after `triggerall`, all-failing numbered groups fail, and callback actor/opponent/owner/tick context is forwarded. This is ownership cleanup only; full expression language parity, persistent-controller timing, exact CNS trigger tick order, helper/team/redirect trigger scopes, visual parity, and score movement remain blocked.

Latest R2 auto guard-start ownership checkpoint: `RuntimeAutoGuardStartWorld` now owns bounded imported auto guard-start orchestration from `PlayableMatchRuntime`: imported-defender filtering, current input/current move/hitpause/hitstun eligibility handoff to `RuntimeGuardWorld`, `InGuardDist` gating, guard-start state selection/availability, clear-state-owner entry, and guard-start runtime mutation. `RuntimeGuardWorld` still owns guard rule primitives, and `PlayableMatchRuntime` still supplies `InGuardDist`, concrete state availability/entry, and broader combat/guard timing. Focused `RuntimeAutoGuardStartSystem` coverage proves successful imported guard start plus non-imported, ineligible, out-of-distance, and unavailable-state fail-closed paths. This is ownership cleanup only; exact proximity-guard timing, guard-end/effects/audio, helper/team/redirect guard ownership, visual parity, and score movement remain blocked.

Latest R2 active controller scan ownership checkpoint: `RuntimeActiveControllerScanWorld` now owns the bounded active-state controller scan from `PlayableMatchRuntime`: owner/state-owner selection, imported/owner-backed guard, active state lookup, `ignorehitpause` filtering, trigger gating, controller iteration, and stop/continue flow after state-changing controllers. `PlayableMatchRuntime` still supplies trigger evaluation, controller classification, concrete controller side effects, and mutation ordering. Focused `RuntimeActiveControllerScanSystem` coverage proves owner-backed scanning, hitpause-only filtering, stop-after-ChangeState flow, missing-state skip, non-imported skip, and failed-trigger no-op. This is ownership cleanup only; exact CNS VM tick order, persistent controller semantics, helper/team/redirect controller scopes, full controller-loop parity, visual parity, and score movement remain blocked.

Latest R2 fighter advance ownership checkpoint: `RuntimeFighterAdvanceWorld` now owns bounded per-fighter advance order from `PlayableMatchRuntime`: sprite-effect tick, hit eligibility slots, HitOverride slots, contact timers, render-angle reset, state clock, frame constraints, recovery-window tick, preserve-moveType read, stun, move lifecycle, kinematics, animation, active controllers, ground-recovery landing, lie-down recovery, and frozen-position preservation. `PlayableMatchRuntime` still supplies concrete worlds, state/action callbacks, active-controller execution, and stage/tick context. Focused coverage proves order, render-angle cleanup before state-clock handoff, preserve flag forwarding, and tick-start position capture after recovery-window tick but before kinematics. This is ownership cleanup only; exact MUGEN/IKEMEN player tick order, persistent-controller timing, helper/team/redirect actor advance semantics, recovery/stun/physics arbitration, visual parity, and score movement remain blocked.

Previous R2 active controller dispatch ownership checkpoint: `RuntimeActiveControllerDispatchWorld` owns bounded active-controller route orchestration after scan/trigger pass. It tries `RuntimeActiveStateDispatchWorld` first for state/animation mutation, routes shared runtime-controller execution through the existing runtime-controller handoff, routes side effects through `RuntimeActiveSideEffectDispatchWorld`, and keeps unsupported dispatches fail-soft/reportable. `PlayableMatchRuntime` still supplies concrete hooks, world instances, frame lookup, target hooks, telemetry callbacks, stage/tick context, and active-loop order. Focused dispatch coverage proves state-first stop, runtime-controller routing, side-effect routing, and unsupported pass-through. This is ownership cleanup only; exact CNS VM tick order, persistent-controller semantics, helper/team/redirect scopes, side-effect ordering parity, target/combat/presentation semantic parity, missing-action fallback parity, visual parity, and score movement remain blocked.

Previous R2 active side-effect dispatch ownership checkpoint: `RuntimeActiveSideEffectDispatchWorld` owns bounded active-state side-effect routing from `PlayableMatchRuntime`: singleton routes for `HitDef`, `ReversalDef`, `Width`, `FallEnvShake`, `Pause` / `SuperPause`, sound, `EnvColor`, `EnvShake`, and contact controllers plus grouped sprite-effect, effect-spawn, and `Target*` / `BindToTarget` routes. Existing controller worlds still own concrete semantics, while `PlayableMatchRuntime` supplies world instances, frame lookup, target hooks, telemetry callbacks, stage/tick context, and active-loop ordering. Focused `RuntimeActiveSideEffectDispatchSystem` coverage proves every current side-effect route maps to the expected handler, missing hooks fail soft, and non-side-effect dispatches pass through. This is ownership cleanup only; exact CNS VM tick order, persistent-controller semantics, helper/team/redirect scopes, side-effect ordering parity, target/combat/presentation semantic parity, visual parity, and score movement remain blocked.

Latest R2 TargetState entry ownership checkpoint: `RuntimeTargetStateEntryWorld` now owns the bounded active-state `TargetState` state-entry adapter from `PlayableMatchRuntime`: existing owner-backed custom-state ownership is preserved, the controller actor becomes the owner otherwise, unavailable target states fail closed, and successful entries route the target into owner-backed state data through explicit hooks. `RuntimeTargetControllerDispatchWorld` still owns Target-controller dispatch and `RuntimeTargetWorld` still owns target-memory/candidate filtering, while `PlayableMatchRuntime` supplies concrete state availability and state entry mutation. Focused `RuntimeTargetStateEntrySystem` coverage proves controller-owned entry, owner-backed custom-state preservation, and unavailable-state no-op. This is ownership cleanup only; exact TargetState tick order, throws, helper/team/multi-target target state selection, full custom-state parity, visual parity, and score movement remain blocked.

Latest R2 helper TargetState ownership checkpoint: `RuntimeHelperTargetStateWorld` now owns the bounded helper-owned `TargetState` state-entry adapter from `PlayableMatchRuntime`: helper/owner identity is checked before target lookup, missing targets fail closed, unavailable target states fail closed, and successful entries route the target into owner-backed state data through explicit state-entry hooks. `PlayableMatchRuntime` still supplies concrete target lookup, state availability, state entry implementation, and broader helper/effect/controller ordering. Focused `RuntimeHelperTargetStateSystem` coverage proves owner-backed entry, owner-mismatch skip, missing-target no-op, and unavailable-state no-op. This is ownership cleanup only; helper-owned custom state table parity, throws, teams/simul, multi-target/helper-owned opponent selection, exact helper TargetState timing, visual parity, and score movement remain blocked.

Latest R2 helper Projectile target mirror ownership checkpoint: `RuntimeHelperProjectileTargetWorld` now owns the bounded helper-parented Projectile target-memory mirror from `PlayableMatchRuntime`: owner-parented Projectile contacts skip, helper-parented Projectile contacts resolve the parent Helper by runtime serial, missing helpers fail closed, and successful contacts write the Projectile target id into helper-local target memory through `TargetSystem`. `PlayableMatchRuntime` still supplies the concrete projectile-combat callback, owner/defender/projectile tuple, effect actor store, target world, and broader combat/effect ordering. Focused `RuntimeHelperProjectileTargetSystem` coverage proves mirror, owner-projectile skip, and missing-helper no-op behavior. This is ownership cleanup only; exact helper Projectile target lifetime, helper-owned custom-state tables, teams/simul, multi-target/helper-owned opponent selection, exact combat/effect tick order, visual parity, and score movement remain blocked.

Latest R2 State -1 route ownership checkpoint: `RuntimeStateEntryRouteWorld` now owns the bounded State -1 `ChangeState` route scan from `PlayableMatchRuntime`: state-entry iteration, non-ChangeState filtering, trigger gating, dynamic state-id resolution handoff, route telemetry, authored state-move selection, and raw state-entry fallback. `PlayableMatchRuntime` still supplies trigger evaluation, expression resolution, concrete state entry, move startup, runtime tick order, and broader controller execution. Focused `RuntimeStateEntryRouteSystem` coverage proves route-to-move, route-to-state, failed-trigger/unresolved no-op scans, dynamic expression handoff, and empty-list skip. This is ownership cleanup only; exact State -1 VM timing, persistent-controller semantics, helper/team/redirect routing breadth, full CNS/IKEMEN command-state parity, visual parity, and score movement remain blocked.

Latest R2 player Projectile target redirect checkpoint: required `synthetic-imported-projectile-target-redirect.json` checksum `cd099094` proves bounded player state `200` can spawn Projectile id `77`, record owner contact memory `p1 -> p2 / 77`, and branch through `NumTarget(77)` plus `Target(77), Life <= 969` into state/action `277`. The trace aggregate is now 204/204 artifacts, 184 required and 20 optional. Evidence includes Projectile anim `911`, final P2 `life = 969`, lifecycle spawn/remove, effect payload `ownerId = p1` / `effectId = 77` / `hasHit = true` / `removalReason = hit` / `terminalReason = hit`, and no direct HitDef controller requirement in this isolated fixture. Previous helper Projectile bare Target proof remains required as `synthetic-imported-helper-projectile-bare-target.json` checksum `8c9129c1`; previous helper Projectile default TargetState proof remains required as `synthetic-imported-helper-projectile-default-targetstate.json` checksum `918c42a1`; previous helper Projectile explicit TargetState proof remains required as `synthetic-imported-helper-projectile-targetstate.json` checksum `b12e1cb3`; previous helper Projectile default Target-controller proof remains required as `synthetic-imported-helper-projectile-default-target-controllers.json` checksum `0c4c69ae`; previous helper Projectile explicit Target-controller proof remains required as `synthetic-imported-helper-projectile-target-controllers.json` checksum `58688be8`; previous helper TargetState proof remains required as `synthetic-imported-helper-targetstate.json` checksum `011633b8`; previous helper target-controller proof remains required as `synthetic-imported-helper-target-controllers.json` checksum `61f4c61e`; previous helper direct bare `Target, Life` proof remains required as `synthetic-imported-helper-bare-target.json` checksum `15f3c1db`; previous player bare `Target, Life` proof remains required as `synthetic-imported-bare-target-redirect.json` checksum `f9c90aa8`; previous default `Target(0), Life` proof remains required as `synthetic-imported-default-target-redirect.json` checksum `d43caabf`; previous default `NumTarget(0)` proof remains required as `synthetic-imported-default-numtarget.json` checksum `5869ebbd`; previous helper direct default-target proof remains required as `synthetic-imported-helper-default-target.json` checksum `e1bcced0`; previous helper Projectile default-target proof remains required as `synthetic-imported-helper-projectile-default-target.json` checksum `b0daddf6`; previous helper Projectile explicit-id proof remains required as `synthetic-imported-helper-projectile-target.json` checksum `49261b53`; previous helper direct-target proof remains required as `synthetic-imported-helper-target.json` checksum `68f95b67`; previous helper direct-combat proof remains required as `synthetic-imported-helper-hitdef.json` checksum `89f9e876`. This is direct player bare/default/static/dynamic target trigger evidence, player-owned Projectile target redirect evidence, explicit/default/bare helper HitDef plus helper-parented Projectile target memory evidence, bounded helper-owned direct-HitDef and explicit/default helper-parented Projectile Target side effects, and bounded helper-local direct-HitDef plus explicit/default helper-parented Projectile TargetState into owner-backed state data only; Target* mutation mixing, helper-owned custom state tables, throws, teams/simul, multi-target/helper-owned opponent selection, exact target lifetime/tick order, exact helper hitpause/tick order, exact helper HitDef/Projectile lifetime parity, visual parity, score movement, and full target/combat/projectile parity remain blocked.

Latest R1 presentation AIR-frame checkpoint: `RuntimeTraceGate.requiredHitEffectEvents` now supports `assetFrameOffsetX`, `assetFrameOffsetY`, and `assetFrameDuration`, and common/FightFX direct HitSpark plus direct HitDef, Projectile, and helper-parented Projectile package gates require selected first-frame offset/duration before renderer/audio handoff. This is presentation evidence precision only; exact renderer binding, timing, layering, scale, palette, SND playback, helper-owned presentation ownership, score movement, and full presentation parity remain blocked.

Latest R1 Common1 air-recovery checkpoint: required `synthetic-imported-default-fall-official-air-recovery.json` checksum `b0363be9` proves bounded official-style synthetic air recovery through `5050 -> 5210 -> 52 -> 0`. The required trace gates positive-to-zero `fall.recovertime` actor-frame sequence, recovery input while airborne, `5210` velocity telemetry, landing state `52`, `VelAdd` / `ChangeState` / `VelSet` / `HitFallSet` / `CtrlSet` controller order, typed `kinematic:*`, `hitfall:hitfallset`, and `resource:ctrlset` operation evidence, and final idle/control. The trace aggregate is now 187/187 artifacts, 167 required and 20 optional. This is Common1 recovery precision only; exact `fall.recovertime` tables, velocity math, controller-loop timing, public bundled KFM support, visual parity, score movement, and full Common1 recovery parity remain blocked.

Previous R1 Common1 ground-recovery checkpoint: required `synthetic-imported-default-fall-official-ground-recovery.json` checksum `74b72495` proves bounded official-style synthetic ground recovery through `5050 -> 5200 -> 5201 -> 52 -> 0` with positive-to-zero `fall.recovertime`, recovery/landing kinematic order, `NotHitBy` safety telemetry, and final idle/control.

Previous R2 helper ProjContact checkpoint: required `synthetic-imported-helper-projcontact.json` checksum `4dcbdd25` proves bounded helper-local `ProjContact(8855)` plus `ProjContactTime(8855) >= 1` against helper-parented owner-side Projectile generic contact after helper-local spawn. The required trace routes a visual Helper through `1200 -> 1220 -> 1221` / anims `949` and `950`, spawns owner-side Projectile anim `951` with `parentId = p1-helper-0`, and requires guard/contact payload evidence with `hasHit = true` and `hitsRemaining = 0`. Focused `EffectActorSystem` coverage proves same-id player-owned Projectile contact stays invisible to helper-local `ProjContact`, while helper-parented Projectile contact branches the helper after contact age advances. This is helper-local generic projectile-contact trigger evidence only; helper-owned Projectile combat/contact presentation, exact `ProjContact` / `ProjHit` / `ProjGuarded` tick order and lifetime, exact projectile namespaces/scopes, dynamic ids/params, teams, visual parity, score movement, and full Helper/Projectile parity remain blocked.

Previous R1 Common1 recovery checkpoint: required `synthetic-imported-default-fall-official-recovery-threshold.json` checksum `86804271` and `synthetic-imported-default-fall-official-recovery-too-early.json` checksum `ef945ff5` promote official-style synthetic recovery threshold and early-input rejection into `pnpm qa:trace`. This is trace precision only; exact `fall.recovertime` tables, exact controller-loop timing, velocity math, public bundled KFM support, broad Common1 parity, and score movement remain blocked.

Latest R2 combat-resolution ownership checkpoint: `RuntimeCombatResolutionWorld` now owns bounded active direct/projectile contact orchestration from `PlayableMatchRuntime`: direct move eligibility, reversal checks, HitBy/NotHitBy reject logging, HitOverride redirect hooks, target-memory remembering, direct hit/guard result handoff, projectile-combat callbacks, received-damage/contact memory, and contact presentation emission. `PlayableMatchRuntime` still supplies runtime tick, frame hurtboxes, state-entry hooks, trigger/controller order, active effect stores, and actor roster. Focused `RuntimeCombatResolutionSystem` coverage proves direct target/contact/presentation ordering and projectile callback routing through target/contact/presentation/damage hooks. This is ownership cleanup only; helper-owned combat, projectile target ownership, exact direct/projectile tick order, multi-target/team behavior, exact ReversalDef/HitOverride priority, visual parity, and score movement remain blocked.

Previous R2 target-candidate ownership checkpoint: `RuntimeTargetWorld.resolveCandidates` now owns bounded target-candidate filtering from live target memory before current Target* / BindToTarget controller application and active TargetBind / BindToTarget position application. `PlayableMatchRuntime` and the match/pause loops still supply the currently materialized concrete actor roster and own trigger ordering, state validation, helper/projectile actor materialization, and combat context. Focused `TargetSystem` coverage proves actor-id and target-id filtering plus mutation only against remembered targets. This is ownership cleanup only; helper/projectile target ownership, exact team/multi-target selection, exact target lifetime, throw binding, exact bind tick order, visual parity, and score movement remain blocked.

Previous R2 expression-context ownership checkpoint: `RuntimeExpressionContextWorld` now owns bounded active runtime expression/trigger context creation for imported state triggers and dynamic controller-param fallback. `PlayableMatchRuntime` delegates target redirects, contact/projectile/effect count reads, command/const/state/anim/hitvar reads, `HitDefAttr`, `HitPauseTime`/`HitOver`/`HitShakeOver`, `InGuardDist`, random/stage/time wiring through that world while still owning active-state dispatch, next-random source, animation timing callbacks, and exact VM timing. Focused `RuntimeExpressionContextSystem` coverage proves numeric reads, `Target` redirect, compiled trigger evaluation, const/state/HitVar helpers, and shared context creation. This is ownership cleanup only; full expression language parity, composite `HitDefAttr` parity, helper/team/redirect mutation, exact VM timing, visual parity, and score movement remain blocked.

Previous R2 state-transition-controller ownership checkpoint: `RuntimeStateTransitionControllerWorld` now owns bounded passive `ChangeState` / `SelfState` setup in the basic `StateControllerExecutor` path. `StateControllerExecutor` delegates raw-param `value` / `stateno` expression fallback, previous-state metadata writes, frame/time reset, optional `ctrl`, and missing-value reporting while still owning controller routing, expression context creation, and broad runtime-controller execution; `RuntimeStateEntryWorld` and `PlayableMatchRuntime` still own active-state entry, concrete state/action lookup, custom-state owner selection, and controller tick order. Focused `StateTransitionControllerSystem` coverage proves expression fallback, metadata writes, reset, ctrl, missing-value no-op/reporting, unchanged-state timing reset, and executor routing. This is ownership cleanup only; exact ChangeState/SelfState tick-order parity, persistent controller semantics, redirects/helper/team ownership, full custom-state breadth, state-entry VM parity, and score movement remain blocked.

Previous R2 animation-controller ownership checkpoint: `RuntimeAnimationControllerWorld` now owns bounded passive `ChangeAnim` / `ChangeAnim2` setup in the basic `StateControllerExecutor` path. `StateControllerExecutor` delegates raw-param animation retargeting, self/state-owner source marking, reset, and bounded `elem` / `elemtime` seeding while still owning controller routing, expression context creation, and broad runtime-controller execution; `PlayableMatchRuntime` still owns active-state action lookup, state-owner selection, and controller tick order. Focused `AnimationControllerSystem` coverage proves expression fallback, known-AIR `elem` / `elemtime` seeding, clamped/fallback element behavior, missing-value no-op, and executor routing. This is ownership cleanup only; missing-action fallback, full active-state `elem`/`elemtime` parity, redirects/helper/team ownership, full state-owner namespace behavior, exact animation-source parity, and score movement remain blocked.

Previous R2 kinematic-controller ownership checkpoint: `RuntimeKinematicControllerWorld` now owns bounded passive `VelSet`, `VelAdd`, `VelMul`, `HitVelSet`, `PosSet`, `PosAdd`, and `Gravity` setup from typed `kinematic:*` operations or raw controller params. `StateControllerExecutor` delegates those mutations while still owning controller routing, expression context creation, and broad runtime-controller execution; `RuntimeKinematicsWorld` still owns per-frame actor integration, sandbox gravity, ground snap, and landing hooks. Focused `KinematicControllerSystem` coverage proves typed setup, raw expression fallback, default-axis behavior, hit-velocity flags, gravity defaults, and executor routing. This is ownership cleanup only; exact MUGEN/IKEMEN physics, velocity tick order, `yaccel` constants, helper/team/redirect ownership, full kinematic VM parity, and score movement remain blocked.

Previous R2 bounds-controller ownership checkpoint: `RuntimeBoundsControllerWorld` now owns bounded passive `PlayerPush`, `PosFreeze`, and `ScreenBound` setup from typed `collision:playerpush` / `bounds:*` operations or raw controller params. `StateControllerExecutor` delegates those mutations while still owning controller routing, expression context creation, and broad runtime-controller execution; `RuntimeActorConstraintWorld` still owns per-frame reset/projection, stage clamp, and body-push separation. Focused `BoundsControllerSystem` coverage proves typed setup, raw defaults, raw expression fallback, and executor routing. This is ownership cleanup only; exact player/edge collision, team/helper push behavior, screen-edge/camera parity, PosFreeze tick order, full constraint VM parity, and score movement remain blocked.

Previous R2 hit-fall ownership checkpoint: `RuntimeHitFallControllerWorld` owns bounded passive `HitFallVel`, `HitFallDamage`, and `HitFallSet` mutation from typed `hitfall:*` operations or raw controller params. `StateControllerExecutor` delegates those mutations while still owning controller routing, expression context creation, and broad runtime-controller execution. Focused `HitFallControllerSystem` coverage proves typed `HitFallSet`, raw expression fallback, stored fall velocity application, bounded `fall.defence_up` scaling, and nonlethal deferred fall damage. This is ownership cleanup only; exact Common1 controller-loop order, helper/team/redirect ownership, exact recovery thresholds/velocity math, full fall/get-hit parity, and score movement remain blocked.

Previous R2 state-type ownership checkpoint: `RuntimeStateTypeWorld` owns bounded passive `StateTypeSet` `stateType` / `moveType` / `physics` setup from typed `metadata:statetypeset` operations, raw controller params, and the later bounded enum-expression gate. `StateControllerExecutor` delegates those mutations while still owning controller routing and broad runtime-controller execution. Focused `StateTypeSystem` coverage proves typed setup, raw case-normalized fallback, invalid raw no-op behavior, and current bounded dynamic enum fallback evidence. Broad dynamic metadata expressions, helper/team/redirect ownership, exact physics/tick-order interactions, full StateTypeSet parity, and score movement remain blocked.

Previous R2 damage-scale ownership checkpoint: `RuntimeDamageScaleWorld` owns bounded passive `AttackMulSet` and `DefenceMulSet` multiplier setup from typed `damage-scale:*` operations or raw controller params. `StateControllerExecutor` delegates those mutations while still owning controller routing, expression context creation, and broad runtime-controller execution. Focused `DamageScaleSystem` coverage proves typed setup, raw expression fallback, clamp behavior, and no-value no-op behavior. This is ownership cleanup only; exact MUGEN/IKEMEN scaling stack/order, helper/projectile/custom-state/guard edge cases, redirect ownership, controller-loop timing, full damage-scale parity, and score movement remain blocked.

Previous R2 hit-defense ownership checkpoint: `RuntimeHitDefenseWorld` owns bounded passive `HitBy`, `NotHitBy`, and `HitOverride` slot setup/removal from typed `eligibility:*` / `hitoverride` operations or raw controller params. `StateControllerExecutor` delegates those mutations while still owning controller routing, expression context creation, and broad runtime-controller execution. Focused `HitDefenseSystem` coverage proves typed and raw setup/removal semantics. This is ownership cleanup only; exact attr grammar, slot priority, helper/custom-state redirect breadth, forceair/forceguard edge order, controller-loop timing, full defensive-slot parity, and score movement remain blocked.

Previous R2 HitDef-controller dispatch ownership checkpoint: `RuntimeHitDefControllerDispatchWorld` now owns bounded active-state HitDef activation dispatch from compiled CNS classification into the current attack payload. `PlayableMatchRuntime` delegates controller telemetry, typed `hitdef` operation selection, raw fallback attack params, fired-HitDef dedupe, current-frame `Clsn1` hitbox handoff, currentMove mutation, attack movetype/control writes, and operation telemetry while still owning trigger filtering, active-state order, current-frame lookup, direct/projectile contact resolution, Common1/custom-state routing, and target/reversal consequences. Focused `HitDefSystem` coverage proves activation payloads and duplicate suppression through the dispatch boundary. This is ownership cleanup only; exact HitDef trigger lifetime, contact ordering, multi-hit windows, helper/projectile/custom-state ownership, broad attr grammar, hitpause/tick order, full HitDef VM parity, and score movement remain blocked.

Previous R2 ReversalDef-controller dispatch ownership checkpoint: `RuntimeReversalControllerDispatchWorld` now owns bounded active-state ReversalDef side-effect dispatch from compiled CNS classification into `RuntimeReversalWorld`. `PlayableMatchRuntime` delegates controller telemetry, typed `reversaldef` operation selection, raw fallback activation payload, activation handoff, and operation telemetry while still owning trigger filtering, active-state order, current-frame hitbox lookup, and later counter-result state routing. Focused `ReversalSystem` coverage proves controller/op telemetry plus ReversalDef activation through the boundary. This is ownership cleanup only; exact ReversalDef priority, guard/projectile/helper/custom-state counter breadth, attr grammar, trigger lifetime, hitpause/tick order, full ReversalDef VM parity, and score movement remain blocked.

Latest R2 concrete lifecycle opponent-source checkpoint: `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld` now pass explicit one-opponent lifecycle `opponents` lists into `RuntimeEffectLifecycleWorld` from concrete 1v1 match/pause/hitpause routes while preserving the legacy direct opponent argument. Focused `MatchInteractionSystem`, `PauseSystem`, and `RuntimeHitPauseSystem` coverage proves active and paused lifecycle options carry `[current opponent]` plus stage/runtime ticks. This is ownership cleanup only; real teams/simul roster registry, automatic multi-opponent match roster discovery, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous R2 effect-lifecycle explicit-opponent-list checkpoint: `RuntimeEffectLifecycleWorld` now accepts an explicit lifecycle `opponents` list, builds an id-bearing nearest-order `opponentRoster` through `RuntimeOpponentSelectionWorld`, and keeps the legacy current `opponentId` / `opponentState` separate for one-opponent fallback routes. Focused `EffectLifecycleSystem` coverage proves an unsorted `[far, near, tied]` list becomes a nearest-order helper roster and the `opponents` control field does not leak into helper options. This is ownership cleanup only; real teams/simul roster registry, automatic match-level multi-opponent lifecycle wiring, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous R2 opponent-selection roster-builder checkpoint: `RuntimeOpponentSelectionWorld` now builds id-bearing `opponentRoster` entries in nearest order without cloning runtime states, and `RuntimeEffectLifecycleWorld` delegates current-opponent lifecycle roster construction through that boundary. Focused `RuntimeOpponentSelectionSystem` coverage proves ids and state refs survive nearest ordering; `EffectLifecycleSystem` coverage keeps active/paused lifecycle forwarding green. This is ownership cleanup only; real teams/simul roster registry, multi-opponent lifecycle roster sources, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous R2 effect-lifecycle opponent-roster bridge checkpoint: `RuntimeEffectLifecycleWorld` now forwards the current opponent as an id-bearing `opponentRoster` into active and paused Helper lifecycle contexts while preserving legacy `opponentId` / `opponentState`. Focused `EffectLifecycleSystem` coverage proves active and paused lifecycle options carry the current opponent id plus runtime state. This is ownership cleanup only; real teams/simul roster registry, multi-opponent lifecycle roster construction, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous R2 helper-local opponent-roster metadata checkpoint: `HelperSystem` now accepts caller-supplied helper-local `opponentRoster` entries with id plus runtime state, and `RuntimeOpponentSelectionWorld` keeps that metadata attached while sorting. Focused `EffectActorSystem` coverage proves an unsorted roster with ids resolves `EnemyNear(1), TeamSide = 2` after nearest/stable-tie ordering. This is ownership cleanup only; real teams/simul roster registry, helper-owned opponent roster discovery, richer identity metadata beyond ids/team side, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous R2 helper-local opponent-selection checkpoint: `HelperSystem` routes caller-supplied helper-local `opponentStates` through `RuntimeOpponentSelectionWorld`, so helper-local `EnemyNear(index)`, `EnemyNear(var(n))`, `NumEnemy`, and direct helper opponent context share the same nearest-roster ordering boundary used by active runtime expression contexts. Focused `RuntimeOpponentSelectionSystem` coverage proves raw runtime-state list ordering, and focused `EffectActorSystem` coverage proves a visual Helper resolves an unsorted `[far, near, tie]` list by nearest/stable-tie order.

Previous R2 opponent-selection ownership checkpoint: `RuntimeOpponentSelectionWorld` owns bounded horizontal body-distance scoring and stable nearest-roster ordering for runtime opponent lists, and `RuntimeExpressionContextWorld` delegates explicit `EnemyNear(index)` roster ordering through that boundary. Focused `RuntimeOpponentSelectionSystem` coverage proves nearest ordering, stable ties, finite-before-nonfinite sorting, and distance values, while focused `RuntimeExpressionContextSystem` coverage keeps `EnemyNear` integration green.

Previous R2 EnemyNear nearest-roster checkpoint: `RuntimeExpressionContextWorld` now sorts explicit opponent rosters by bounded nearest body-distance before resolving `EnemyNear(index)`, preserving caller order for stable ties and keeping `NumEnemy` tied to supplied roster length. Focused `RuntimeExpressionContextSystem` coverage proves `EnemyNear(0..3)` resolves nearest/stable-tie/far order from an unsorted roster. This is shared read-context cleanup only; real teams/simul roster ownership, helper-owned opponent rosters, y-axis/priority selection parity, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous R2 trigger/dispatch opponent-roster checkpoint: `RuntimeDispatchEvaluationWorld` and `RuntimeTriggerEvaluationWorld` now forward optional explicit opponent rosters into their context factories, and `PlayableMatchRuntime` routes its current one-opponent list through that seam into `RuntimeExpressionContextWorld`. Focused `RuntimeDispatchEvaluationSystem` and `RuntimeTriggerEvaluationSystem` coverage proves roster forwarding plus `NumEnemy` evaluation through dynamic controller-param and trigger paths. This is shared adapter/read-context cleanup only; real teams/simul roster ownership, helper-owned opponent rosters, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous R2 runtime expression opponent-roster checkpoint: `RuntimeExpressionContextWorld` now accepts an optional explicit opponent roster and wires `EnemyNear(index)` plus `NumEnemy` through that list before falling back to the current single-opponent context. Focused `RuntimeExpressionContextSystem` coverage proves roster-backed `EnemyNear(1)`, `EnemyNear(var(n))`, `NumEnemy = 2`, default one-opponent fallback, and missing-index fail-closed behavior. This is shared read-context cleanup only; real teams/simul roster ownership, helper-owned opponent rosters, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper/team VM parity remain blocked.

Previous R2 helper explicit-opponent context checkpoint: `ExpressionEvaluator` resolves `EnemyNear(index)` through an explicit enemy-near redirect callback and can read `NumEnemy` from an explicit provider, while `HelperSystem` can pass an explicit `opponentStates` list into helper-local trigger/value evaluation and derives helper-local `NumEnemy` from that list. Focused `RuntimeCnsSubset` and `EffectActorSystem` coverage proves direct evaluator support, dynamic index expressions through `var(n)`, helper-local indexed routing, explicit opponent-count reads, and missing-index fail-closed behavior. This is context/redirect/count cleanup only; teams/simul opponent ordering, helper-owned opponent rosters, broader indexed redirect ownership beyond supplied lists, visual parity, score movement, and full helper VM parity remain blocked.

Previous R2 helper lifecycle context ownership checkpoint: `RuntimeEffectLifecycleWorld` now forwards `stageBounds`, `stageTime`, and `runtimeTick` into helper-local active and paused lifecycle passes. `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, `RuntimeHitPauseWorld`, and `PlayableMatchRuntime` pass current tick context through that boundary. Focused `EffectLifecycleSystem` coverage proves helper-local `GameTime` rejection/pass behavior, `FrontEdgeDist` param evaluation from stage bounds, `PlaySnd` `runtimeTick` telemetry, and `ChangeState` handoff. This is ownership/context cleanup only; exact helper clock parity, pause/combat ordering parity, broader indexed/team redirects, teams/simul, visual parity, score movement, and full helper VM parity remain blocked.

Previous R2 animation retarget ownership checkpoint: `RuntimeAnimationWorld` now owns bounded active action lookup/reset plus `elem` / `elemtime` seeding for known AIR actions. `PlayableMatchRuntime` delegates its local `changeAction` helper through this boundary while still owning active controller dispatch, state-owner selection, concrete state/action entry, and controller ordering. Focused `RuntimeAnimationSystem` coverage proves authored-action retargeting, same-action element retargeting, and missing-action no-mutation behavior; `pnpm qa:trace` remains stable at 251/251 artifacts, 231 required and 20 optional. This is ownership cleanup only; exact AIR negative-duration semantics, missing-action fallback parity, full `elem` / `elemtime` parity, helper/team redirect namespaces, controller tick-order parity, visual parity, score movement, and full animation VM parity remain blocked.

Latest R2 effect-spawn-controller dispatch ownership checkpoint: `RuntimeEffectSpawnControllerDispatchWorld` now owns bounded active-state Explod / RemoveExplod / ModifyExplod / Helper / Projectile / ModifyProjectile side-effect dispatch from compiled CNS classification into `RuntimeEffectSpawnWorld`. `PlayableMatchRuntime` delegates controller telemetry, typed effect operation selection, spawn/count mutation handoff, and success-gated operation telemetry while still owning trigger filtering, active-state order, actor/opponent context, effect actor world ownership, and exact spawn/combat ordering. Focused `EffectSpawnSystem` coverage proves successful Explod telemetry/mutation and failed ModifyExplod no-operation gating through the boundary. This is ownership cleanup only; exact effect spawn tick order, helper-owned effect namespaces, dynamic effect params, helper-owned projectile combat/contact/target memory, full effect/helper/projectile VM parity, and score movement remain blocked.

Latest R2 FallEnvShake-controller dispatch ownership checkpoint: `RuntimeFallEnvShakeControllerDispatchWorld` now owns bounded active-state FallEnvShake side-effect dispatch from compiled CNS classification into `RuntimeEnvShakeWorld`. `PlayableMatchRuntime` delegates controller telemetry, typed `fallenvshake` operation selection, fall-shake event handoff, `hitFall.envShake` cleanup, and operation telemetry after a real event while still owning trigger filtering, active-state order, actor/world ownership, and upstream HitDef fall metadata. Focused `EnvShakeSystem` coverage proves `FallEnvShake` telemetry/mutation through the boundary. This is ownership cleanup only; exact waveform, pause/stage/layer interaction, helper/redirect ownership, full presentation parity, and score movement remain blocked.

Latest R2 actor-constraint controller dispatch ownership checkpoint: `RuntimeActorConstraintControllerDispatchWorld` now owns bounded active-state `Width` side-effect dispatch from compiled CNS classification into `RuntimeActorConstraintWorld`. `PlayableMatchRuntime` delegates controller telemetry, typed `collision:width` operation selection, operation telemetry, and body-width mutation handoff while still owning trigger filtering, active-state order, per-frame constraint reset, stage clamp, and body-push ordering. Focused `ActorConstraintSystem` coverage proves `Width` telemetry/mutation through the boundary. This is ownership cleanup only; exact player/edge collision, team/helper push behavior, screen-edge/camera parity, Width edge semantics, full constraint VM parity, and score movement remain blocked.

Latest R2 pause-controller dispatch ownership checkpoint: `RuntimePauseControllerDispatchWorld` owns bounded active-state Pause/SuperPause side-effect dispatch from compiled CNS classification into the match pause handler. `RuntimeMatchPauseControllerWorld` now owns result side effects after that handoff, while `PlayableMatchRuntime` still owns trigger filtering, active-state order, paused-match progression, and hitpause ignored routing. Focused `PauseSystem` coverage proves `SuperPause` telemetry/application through the boundary. This is ownership cleanup only; exact pause layering, super background/sound/spark timing, helper/redirect ownership, full pause VM parity, and score movement remain blocked.

Latest R2 EnvShake-controller dispatch ownership checkpoint: `RuntimeEnvShakeControllerDispatchWorld` now owns bounded active-state EnvShake side-effect dispatch from compiled CNS classification into `RuntimeEnvShakeWorld`. `PlayableMatchRuntime` delegates controller telemetry, typed `envshake` operation selection, operation telemetry, and camera-shake event handoff while still owning trigger filtering, active-state order, actor/world ownership, and FallEnvShake routing. Focused `EnvShakeSystem` coverage proves `EnvShake` telemetry/mutation through the boundary. This is ownership cleanup only; exact waveform, pause/stage/layer interaction, helper/redirect ownership, full presentation parity, and score movement remain blocked.

Latest R2 EnvColor-controller dispatch ownership checkpoint: `RuntimeEnvColorControllerDispatchWorld` now owns bounded active-state EnvColor side-effect dispatch from compiled CNS classification into `RuntimeEnvColorWorld`. `PlayableMatchRuntime` delegates controller telemetry, typed `envcolor` operation selection, operation telemetry, and stage-flash event handoff while still owning trigger filtering, active-state order, stage-world ownership, and pause/hitpause callback routing. Focused `EnvColorSystem` coverage proves `EnvColor` telemetry/mutation through the boundary. This is ownership cleanup only; exact blend math, layer/window ordering, pause timing, renderer parity, full presentation parity, and score movement remain blocked.

Latest R2 audio-controller dispatch ownership checkpoint: `RuntimeAudioControllerDispatchWorld` now owns bounded active-state audio side-effect dispatch from compiled CNS classification into `RuntimeAudioWorld`. `PlayableMatchRuntime` delegates controller telemetry, typed `audio:*` operation selection, operation telemetry, and `PlaySnd` / `StopSnd` event handoff while still owning trigger filtering, active-state order, hit/contact timing, and actor context. Focused `AudioEventSystem` coverage proves `PlaySnd` telemetry/mutation through the boundary. This is ownership cleanup only; exact SND playback, channel priority, mixing, FightFX/common fallback, full audio parity, and score movement remain blocked.

Latest R2 contact-controller dispatch ownership checkpoint: `RuntimeContactControllerDispatchWorld` now owns bounded active-state contact-memory side-effect dispatch from compiled CNS classification into `RuntimeContactMemoryWorld`. `PlayableMatchRuntime` delegates controller telemetry, typed `contact:*` operation selection, operation telemetry, `HitAdd` mutation, and `MoveHitReset` direct contact reset while still owning trigger filtering, active-state order, and direct/projectile contact creation. Focused `ContactMemorySystem` coverage proves `HitAdd` telemetry/mutation and `MoveHitReset` reset telemetry through the boundary. This is ownership cleanup only; exact combo lifetime, helper/projectile contact ownership, guard-count parity, full CNS VM parity, and score movement remain blocked.

Latest R2 target-controller dispatch ownership checkpoint: `RuntimeTargetControllerDispatchWorld` now owns bounded active-state Target / BindToTarget side-effect dispatch from compiled CNS classification into `RuntimeTargetWorld`. `PlayableMatchRuntime` delegates controller telemetry, typed `target:*` / `bindtotarget` operation selection, operation telemetry, damage-scaling callback handoff, TargetState state-entry callback handoff, and target-constant callback handoff while still owning trigger filtering, active-state order, concrete state validation, and candidate target selection. Focused `TargetSystem` coverage proves `TargetLifeAdd` telemetry/mutation and `BindToTarget` anchor/position telemetry through the boundary. This is ownership cleanup only; helper/projectile target ownership, exact multi-target semantics, throw binding, full CNS VM parity, and score movement remain blocked.

Latest R2 sprite-effect controller ownership checkpoint: `RuntimeSpriteEffectControllerWorld` owns bounded active-state sprite-effect side-effect dispatch from compiled CNS classification into `RuntimeSpriteEffectWorld`. `PlayableMatchRuntime` delegates controller telemetry, typed `sprite-effect:*` operation selection, operation telemetry, dynamic `SprPriority` / `AfterImage time/length/timegap/framegap/paladd/palmul` / `AfterImageTime value/time` / `RemapPal source/dest` / `Trans alpha` / `PalFX` / `Angle value/scale` typed-operation resolution, and mutation handoff for `SprPriority`, `PalFX`, `RemapPal`, `AfterImage`, `AfterImageTime`, `Trans`, and `AngleSet` / `AngleAdd` / `AngleMul` / `AngleDraw` while still owning trigger filtering, active-state order, hitpause selection, and render projection. Focused `SpriteEffectSystem` coverage proves PalFX telemetry/mutation, AfterImage dynamic typed operation recording plus sampling, AfterImageTime dynamic typed operation recording, RemapPal dynamic typed operation recording, `Trans` render-opacity mutation plus dynamic typed `sprite-effect:trans` telemetry, and dynamic Angle typed operation recording plus rotation/scale telemetry through the boundary. This is ownership cleanup plus bounded dynamic AfterImage/AfterImageTime/RemapPal/Trans/SprPriority/PalFX/Angle telemetry only; exact visual tick order, exact palette-bank semantics, exact Trans alpha math, exact trail cadence/blending, exact angle pivot/scale parity, helper/redirect ownership, renderer parity, full CNS VM parity, and score movement remain blocked.

Latest R2 controller-dispatch ownership checkpoint: `RuntimeControllerDispatchWorld` now owns bounded runtime-controller execution dispatch for active imported state controllers, State -1 setup controllers, and pre-facing `AssertSpecial` application. `PlayableMatchRuntime` delegates runtime replacement, evaluation context handoff, controller telemetry, typed-operation telemetry, and unsupported-controller reporting through the named world while still owning trigger filtering, `ChangeState` / `ChangeAnim`, side-effect dispatch, and tick order. Focused `RuntimeControllerDispatchSystem` coverage proves runtime mutation, telemetry hook behavior, dynamic `HitPauseTime` context, and unsupported reporting. This is ownership cleanup only; exact CNS controller-loop order, persistent controller semantics, side-effect VM parity, helper/team/redirect execution, and score movement remain blocked.

Latest R2 State -1 setup ownership checkpoint: `RuntimeStateEntrySetupWorld` now owns bounded imported State -1 setup-controller selection before command routing. `PlayableMatchRuntime` delegates imported-only guard, `ChangeState` bypass, trigger gating, setup-controller classification, and execution handoff through the named world while concrete mutation still routes through `RuntimeControllerDispatchWorld`. Focused `RuntimeStateEntrySetupSystem` coverage proves imported setup execution, non-imported skip, trigger failure, and non-setup filtering. This is ownership cleanup only; exact State -1 ordering, persistent controller semantics, redirect/helper/team scopes, full CNS VM parity, and score movement remain blocked.

Latest R2 state-entry ownership checkpoint: `RuntimeStateEntryWorld` now owns bounded state-entry mutation that was still inline in `PlayableMatchRuntime`: availability lookup, state-number transition metadata, changed-state elapsed reset, owner-backed custom-state assignment/clearing, stale current-move cancellation, `firedHitDefs` clearing, contact reset callback, StateDef `type` / `movetype` / `physics` / `ctrl` / `velset` application, and self/state-owner animation handoff. Focused `RuntimeStateEntrySystem` tests prove normal state entry, owner-backed custom states, owner-derived previous-state metadata, and metadata normalization. This is ownership cleanup only; exact CNS `ChangeState` / `SelfState` tick-order parity, persistent-controller timing, helper/team/root redirects, full state-entry parity, and score movement remain blocked.

Latest R2 state-clock ownership checkpoint: `RuntimeStateClockWorld` now owns bounded `Time` / state elapsed clock mutation for per-frame advance and changed-state elapsed reset. `PlayableMatchRuntime` delegates both active-frame increment and reset-on-transition behavior through this boundary while preserving the existing `-1 -> 0` first-frame convention. Focused `RuntimeStateClockSystem` tests prove advance, reset, and no-op transition behavior. This follows the previous state-metadata checkpoint where `RuntimeStateMetadataWorld` took ownership of `PrevStateNo`, `PrevAnim`, `PrevStateType`, and `PrevMoveType` writes. This is ownership cleanup only; exact CNS `Time` tick-order parity, persistent-controller timing parity, pause/hitpause timing changes, helper/team/redirect state clocks, full previous-state parity, and score movement remain blocked.

Historical implementation rollup correction: at that checkpoint, required runtime evidence was `synthetic-imported-projectile-contacttime-id.json` checksum `e9ebf36a` and `synthetic-imported-projectile-guardedtime-id.json` checksum `dfd08f28`, proving bounded owner-state `ProjContactTime(77)` / `ProjGuardedTime(77)` after player-owned Projectile contact/guard markers, with hit/guard event/reason, Projectile lifecycle, effect-store, target-link evidence, and P1 routing from state/action `200` into `321` and `322`. That `pnpm qa:trace` pass was 257/257 artifacts, 237 required and 20 optional. This does not move the score or claim exact contact/guard tick-order/lifetime, multi-projectile same-id selection, helper-owned projectile routing, redirects, teams/simul, visual/audio parity, or full Projectile timing parity. Previous owner any-id cancel-time evidence remains required as `synthetic-imported-projectile-canceltime-any.json` checksum `5bff1961`; previous owner var-id cancel-time evidence remains required as `synthetic-imported-projectile-canceltime-var.json` checksum `e057e102`; previous owner dynamic-id cancel-time evidence remains required as `synthetic-imported-projectile-canceltime-dynamic.json` checksum `0da26c87`; previous helper dynamic-id cancel-time evidence remains required as `synthetic-imported-helper-projcanceltime-dynamic.json` checksum `cc78dde2` with focused nonzero helper-local `ProjCancelTime(var(n))` id-selection coverage; previous helper fixed-id cancel-time evidence remains required as `synthetic-imported-helper-projcanceltime-id.json` checksum `fc412176`; previous helper any-id cancel-time evidence remains required as `synthetic-imported-helper-projcanceltime-any.json` checksum `f7e7fa01`; previous owner-state fixed-id cancel-time evidence remains required as `synthetic-imported-projectile-canceltime.json` checksum `64e8dec4`; previous helper-owned guard/contact-time evidence remains required as `synthetic-imported-helper-projguardedtime-any.json` checksum `1f1a38e4` and `synthetic-imported-helper-projcontacttime-any.json` checksum `0d9f7829`; previous helper-owned hit-time evidence remains required as `synthetic-imported-helper-projhittime-any.json` checksum `bca9f47b`; previous player-owned hit-time evidence remains required as `synthetic-imported-projectile-hittime-any.json` checksum `47c1cf7f`; previous any-id contact-time evidence remains required as `synthetic-imported-projectile-contacttime-any.json` checksum `f1751155`; previous any-id guarded-time evidence remains required as `synthetic-imported-projectile-guardedtime-any.json` checksum `c8473340`; and previous target-memory mix evidence remains required as `synthetic-imported-hitdef-projectile-target-mix.json` checksum `e98d4857`.

Previous implementation rollup: helper Projectile bare Target evidence adds required `synthetic-imported-helper-projectile-bare-target.json` checksum `8c9129c1`, proving bounded helper-parented Projectile target memory for id `8863` can branch through `NumTarget(8863)` / bare `Target, Life` into helper state `1242/978` with owner/helper target links and shared `S5,11` / FightFX `F7017` package telemetry. Previous helper Projectile default TargetState evidence remains required as `synthetic-imported-helper-projectile-default-targetstate.json` checksum `918c42a1`, proving the owner-backed default target-state route for target id `0`. Previous helper Projectile explicit TargetState evidence remains required as `synthetic-imported-helper-projectile-targetstate.json` checksum `b12e1cb3`, proving the same owner-backed route for target id `8862`. Previous helper Projectile default Target-controller evidence remains required as `synthetic-imported-helper-projectile-default-target-controllers.json` checksum `0c4c69ae`, proving the omitted `projid` / `id` default target id `0` side-effect subset. Previous helper Projectile explicit Target-controller evidence remains required as `synthetic-imported-helper-projectile-target-controllers.json` checksum `58688be8`, proving the same bounded side-effect subset for target id `8861`. Previous helper target-state evidence remains required as `synthetic-imported-helper-targetstate.json` checksum `011633b8`, proving bounded helper-owned direct `HitDef` target memory can execute helper-local `TargetState value = 888`, route P2 through owner-backed custom state data `888 -> 889`, and return through `SelfState`. Previous helper target-controller evidence remains required as `synthetic-imported-helper-target-controllers.json` checksum `61f4c61e`, proving bounded helper-owned direct `HitDef` target memory can apply the same Target side-effect subset to remembered P2 target id `8879`. Previous helper bare target evidence remains required as `synthetic-imported-helper-bare-target.json` checksum `15f3c1db`; previous player bare target evidence remains required as `synthetic-imported-bare-target-redirect.json` checksum `f9c90aa8`; previous default `Target(0), Life` evidence remains required as `synthetic-imported-default-target-redirect.json` checksum `d43caabf`; previous default `NumTarget(0)` evidence remains required as `synthetic-imported-default-numtarget.json` checksum `5869ebbd`; previous helper target evidence remains required as `synthetic-imported-helper-default-target.json` checksum `e1bcced0`, `synthetic-imported-helper-projectile-default-target.json` checksum `b0daddf6`, `synthetic-imported-helper-projectile-target.json` checksum `49261b53`, and `synthetic-imported-helper-target.json` checksum `68f95b67`; previous helper direct-combat evidence remains required as `synthetic-imported-helper-hitdef.json` checksum `89f9e876`. Latest presentation precision adds selected AIR-frame offset/duration requirements before renderer/audio handoff. Required Common1/FightFX/helper/target/identity gates remain active. This is R1/R2 evidence for bounded direct/default target memory, helper-local direct HitDef combat, explicit/default/bare helper HitDef plus helper-parented Projectile target memory, bounded helper-owned direct-HitDef and explicit/default helper-parented Projectile Target side effects, bounded helper-owned helper-parented Projectile explicit/default TargetState into owner-backed state data, visual Explod spawning/removal/mutation/counting, helper-local owner/root binding, helper-local opponent redirects, helper-local owner-side Projectile spawn, target redirects, Common1/FightFX routes, identity-trigger routing, and current ownership cleanup; it is not public bundled KFM support, exact Common1 tick-order parity, exact `down.recovertime` or `fall.recovertime` tables, helper-owned custom state tables, throw/team/multi-target parity, exact helper Projectile lifetime parity, exact CNS `Time` tick-order parity, exact State -1 setup/order parity, exact presentation parity, exact MUGEN random stream, or VM parity.

Historical runtime compatibility correction: `synthetic-imported-projectile-target-redirect.json` checksum `cd099094` superseded the older helper Projectile bare Target rollup at that point in the evidence ladder. It is now previous evidence, not the current latest runtime gate.

Rollup correction: the latest R2 ownership checkpoint is now `RuntimeAnimationControllerWorld`, not the older State -1 setup-controller or kinematic-controller boundaries named in older rollups above.

Previous R2 ownership update: `RuntimeAnimationControllerWorld` superseded the older kinematic-controller setup line at that checkpoint. `RuntimeKinematicControllerWorld`, `RuntimeBoundsControllerWorld`, `RuntimeHitFallControllerWorld`, `RuntimeStateTypeWorld`, `RuntimeDamageScaleWorld`, `RuntimeHitDefenseWorld`, `RuntimeHitDefControllerDispatchWorld`, `RuntimeReversalControllerDispatchWorld`, `RuntimeEffectSpawnControllerDispatchWorld`, `RuntimeFallEnvShakeControllerDispatchWorld`, `RuntimeActorConstraintControllerDispatchWorld`, `RuntimePauseControllerDispatchWorld`, `RuntimeEnvShakeControllerDispatchWorld`, `RuntimeEnvColorControllerDispatchWorld`, `RuntimeAudioControllerDispatchWorld`, `RuntimeContactControllerDispatchWorld`, `RuntimeTargetControllerDispatchWorld`, `RuntimeSpriteEffectControllerWorld`, `RuntimeStateEntrySetupWorld`, and `RuntimeControllerDispatchWorld` remain previous checkpoints; current runtime evidence is summarized near the top of this board.

Latest R1 Common1 full-chain recovery addendum: `synthetic-imported-default-fall-recovery.json` checksum `d83797d9` now requires bounded controller and actor-frame order across the full imported P2 fall recovery route: `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120`. It preserves the bounded `hitFall.downRecoverTime` countdown range (`max >= 58`, `min <= 54`, first-to-last drop `>= 1`, at least 2 summarized frames) for `5110` before get-up state `5120`. This is trace-evidence precision only; it does not prove exact `down.recovertime` / `fall.recovertime` tables, exact Common1 controller-loop timing, animation timing, bounce physics, recovery-input breadth, full KFM parity, or score movement.

Latest R1 Common1 recovery-input addendum: `RuntimeTraceGate.requiredActorFrames` can now require `observedHitFallRecoverTimeDropAtLeast`, and actor-frame evidence records first/last observed `hitFall.recoverTime` for summarized buckets. Required `synthetic-imported-default-fall-recovery-threshold.json` checksum `7bb15a5f` and `synthetic-imported-default-fall-recovery-tick-order.json` checksum `e2691aab` now prove imported P2 state/action `5050` drops from first `recoverTime = 1` to last `recoverTime = 0` across 5 summarized frames before `5210`. This is trace-evidence precision only; it does not prove exact `fall.recovertime` threshold tables, exact Common1 controller-loop timing, velocity math, recovery-input branching, official/public KFM parity, or score movement.

Latest R1 Common1 too-early recovery-input addendum: `RuntimeTraceGate.requiredActorFrames` can now require `observedHitFallRecoverTimeMinAtLeast`, so negative recovery-input gates can prove the summarized `5050` window stayed before the threshold instead of only showing one positive sample. Required `synthetic-imported-default-fall-recovery-too-early.json` checksum `050e7e3c` and optional `kfm-official-default-fall-recovery-too-early.json` checksum `0ad7ae02` now require state `5050` actor-frame evidence with minimum observed `recoverTime >= 1`, first-to-last drop `>= 1`, and at least 2 summarized frames while early `command = "recovery"` is active and recovery states stay forbidden. This is trace-evidence precision only; it does not prove exact threshold tables, controller-loop timing, velocity math, or score movement.

Previous R1 official-style synthetic recovery addendum: required `synthetic-imported-default-fall-official-recovery-threshold.json` checksum `86804271` proves the official-style synthetic threshold branch through `5050 -> 5200 -> 5201 -> 52 -> 0`, and required `synthetic-imported-default-fall-official-recovery-too-early.json` checksum `ef945ff5` proves the matching early-input rejection window keeps the defender in `5050`. That checkpoint passed 180/180 artifacts, 160 required and 20 optional. This is portable required evidence for the official-style branch shape only; exact threshold tables, velocity math, controller-loop tick order, public KFM support, and score movement remain blocked.

Latest R1 resource actor-frame addendum: `RuntimeTraceGate.requiredActorFrames` can now require observed life/power ranges. Required `synthetic-imported-resource.json` checksum `7bbcb2e4` now requires imported P1 state/action `289` actor-frame evidence with life `750` and power `900` after typed `resource:lifeadd`, `resource:lifeset`, `resource:poweradd`, and `resource:powerset` route through `Life` / `Power` triggers. This is resource evidence precision only; it does not prove exact scaling, redirects, helper/team resource ownership, round/KO flow, or score movement.

Latest R2 resource ownership addendum: `RuntimeResourceWorld` now owns bounded life/power/control/variable mutation inside `RuntimeResourceSystem`, and exported helper functions delegate through that world to preserve current call sites. Focused `RuntimeResourceSystem` coverage proves direct world mutation for life, power, ctrl, and vars. This is ownership cleanup only; it does not prove new resource semantics, exact CNS resource timing, helper/team/redirect resource ownership, round/KO flow, or score movement.

Latest R2 controller dispatch addendum: `RuntimeControllerDispatchWorld` now owns the current runtime-controller bridge into `StateControllerExecutor` for active imported state controllers, State -1 setup controllers, and pre-facing `AssertSpecial`. This is architecture debt reduction only; it does not add new controller semantics, exact CNS controller-loop order, persistent-controller parity, helper/team/redirect execution, side-effect VM parity, or score movement.

Latest R1 presentation addendum: the existing required hit/guard-effect package traces now require shared contact package metadata. `synthetic-imported-hitdef-hit-effect-package.json` checksum `46aa5ce1` must tie attacker-side `hitsound = F5,0` `PlaySnd` telemetry, `soundPrefix = kfm`, and FightFX `sparkno = F7002` multi-frame metadata to the same non-empty `contactId` / `contactTick` / `contactKind = hit`; `synthetic-imported-hitdef-guard-effect-package.json` checksum `1c3167b7` applies the same shape to `guardsound = S6,0` plus FightFX `guard.sparkno = F7004` with `contactKind = guard`. This is required trace correlation and bounded prefixed-SND lookup before renderer/audio handoff only; it does not prove exact intra-tick audio/spark ordering, channel/mixing parity, exact FightFX/common render lookup, layering, scale, palette, motif ownership, hit/guard-effect parity, or score movement.

Latest R1 target-redirect addendum: required `synthetic-imported-bare-target-redirect.json` checksum `f9c90aa8` proves `ExpressionEvaluator`, `ExpressionCompiler`, and `PlayableMatchRuntime` can evaluate bounded bare `Target, ...` trigger redirect reads from direct `HitDef` target memory. Required `synthetic-imported-default-target-redirect.json` checksum `d43caabf` proves bounded static `Target(0), ...` trigger redirect reads from omitted-id direct `HitDef` target memory. Required `synthetic-imported-target-dynamic-redirect.json` checksum `9985b62a` proves bounded dynamic executable `Target(expr), ...` trigger redirect reads from current two-player target memory. The dynamic trace routes P1 from state `200` to `287` through `Target(var(0)), Life < 1000` after direct `HitDef` contact and owner-local `var(0) = 77`, and requires `VarSet`, `HitDef`, and target-link evidence for P2 target id `77`. Previous `synthetic-imported-target-redirect.json` checksum `89580963` keeps static `Target(77), Life < 1000` routing gated. This is a bounded trigger-read gate only; it does not prove helper/projectile targets, unsupported or negative target-id expressions, mutation through redirects, teams, multi-target selection, exact target lifetime/tick order, full target redirects, or score movement.

Latest R2 helper-effect addendum: required `synthetic-imported-helper-target-controllers.json` checksum `61f4c61e` proves the current visual Helper micro-VM can mirror target id `8879` memory from a direct helper-owned `HitDef` contact and apply bounded helper-owned `TargetLifeAdd`, `TargetPowerAdd`, `TargetVelSet`, `TargetVelAdd`, `TargetFacing`, `TargetBind`, and `TargetDrop` with target-link/binding and final P2 resource evidence. Required `synthetic-imported-helper-targetstate.json` checksum `011633b8` proves the same helper-owned direct-HitDef target memory can execute helper-local `TargetState value = 888`, route P2 through owner-backed custom state data `888 -> 889`, and return through `SelfState`. Required `synthetic-imported-helper-bare-target.json` checksum `15f3c1db` remains the helper-local bare `Target, Life` proof. Required `synthetic-imported-helper-default-target.json` checksum `e1bcced0` remains the default target id `0` memory proof. Required `synthetic-imported-helper-projectile-default-target.json` checksum `b0daddf6` remains the helper-parented Projectile default target-memory proof. Required `synthetic-imported-helper-projectile-target.json` checksum `49261b53` remains the matching explicit-id helper-parented Projectile target-memory proof. Required `synthetic-imported-helper-target.json` checksum `68f95b67` remains the helper-local direct `HitDef` target-memory proof. Required `synthetic-imported-helper-hitdef.json` checksum `89f9e876` remains the bounded helper-owned direct `HitDef` proof with helper-side sound/FightFX spark package telemetry. Required `synthetic-imported-helper-projcontact.json` checksum `4dcbdd25` proves bounded helper-local `ProjContact(id)` / `ProjContactTime(id)` against helper-parented owner-side Projectile generic contact markers. Required `synthetic-imported-helper-projguard.json` checksum `d2e2f20d` remains the helper-local `ProjGuarded(id)` / `ProjGuardedTime(id)` proof, required `synthetic-imported-helper-projhit.json` checksum `2d9a281e` remains the helper-local `ProjHit(id)` contact proof, required `synthetic-imported-helper-modifyprojectile.json` checksum `09d3f7e4` remains the helper-local Projectile mutation proof, required `synthetic-imported-helper-projectile.json` checksum `b6269136` remains the helper-local `Projectile` spawn proof, `synthetic-imported-helper-numproj.json` checksum `3312a554` remains the helper-local projectile-count proof, previous `synthetic-imported-helper-numhelper.json` checksum `4e32e951` remains the helper-local `NumHelper(id)` proof, previous `synthetic-imported-helper-numexplod.json` checksum `4328278a` remains the helper-local `NumExplod(id)` proof, previous `synthetic-imported-helper-modifyexplod.json` checksum `0749041c` remains the helper-local Explod mutation proof, previous `synthetic-imported-helper-removeexplod.json` checksum `ff8658a2` remains the helper-local cleanup proof, and previous `synthetic-imported-helper-explod.json` checksum `87ae363f` remains the helper-local static spawn proof. This is helper-local direct HitDef explicit/default/bare target memory, bounded direct-HitDef Target side effects, and Projectile spawn/count/mutate/contact-trigger evidence plus owner-backed helper TargetState evidence only; it does not prove helper-owned custom state tables, throws, teams, exact helper hitpause/tick order, exact helper HitDef/Projectile lifetime parity, exact `ProjContact` / `ProjHit` / `ProjGuarded` timing and lifetime, exact helper effect-count/ownership parity, helper-owned effect namespaces, dynamic effect/projectile params, position rebinding, FightFX/common routing, nested helper ancestry, team/keyctrl ownership, or score movement.

Previous R2 helper-binding addendum: required `synthetic-imported-helper-bindtoroot.json` checksum `bf72306c` proves `HelperSystem` can execute bounded helper-local static `BindToRoot` against supplied root runtime state and route a spawned visual Helper from state `1200` to `1204` / anim `924` with actor-frame position plus `ownerBindTarget = root` and offset payload evidence. Previous `synthetic-imported-helper-bindtoparent.json` checksum `f9922c0e` proves the matching bounded `BindToParent` route with `ownerBindTarget = parent` and offset payload evidence. This is a helper-local static owner/root-binding gate only; it does not prove player-state `BindToParent` / `BindToRoot`, dynamic bind params, nested helper ancestry where root differs from parent, team/keyctrl ownership, exact parent/root selection, exact bind tick order, full helper binding parity, or score movement.

Previous R2 helper-trigger addendum: required `synthetic-imported-helper-enemynear.json` checksum `35498955` proves `ExpressionEvaluator` and `HelperSystem` can evaluate bounded helper-local `EnemyNear, StateNo` plus `EnemyNear, Life` against the current two-player opponent and route a spawned visual Helper from state `1200` to `1202` / anim `922`. Previous `synthetic-imported-helper-ishelper.json` checksum `37877602` still proves bounded `IsHelper` / `IsHelper(42)` routing to state `1201` / anim `921`. The latest indexed-context cut adds caller-provided `EnemyNear(index)` tests on top of this older gate. This is a bounded helper-local trigger gate only; it does not prove caller-independent indexed selection, `keyctrl`, nested helper ancestry, team helper ownership, helper-owned opponents/combat/effects/projectiles, exact helper scopes, exact opponent selection, exact tick order, full helper VM, or score movement.

Previous R1 identity-trigger addendum: required `synthetic-imported-identity.json` checksum `c9be5cf1` proves imported State -1 routing can compare `Name`, `P1Name`, `P2Name`, `AuthorName`, and redirected `EnemyNear, AuthorName` against current runtime fighter metadata before entering state `276`. This is a bounded two-actor identity-trigger gate only; it does not prove team/simul/turns identity selection, helper-owned identity, indexed player identity, parent/root/target identity redirects, exact string/localization parity, or score movement.

Previous R1 Projectile presentation addendum: required `synthetic-imported-projectile-contact.json` trace checksum `57b3b556` / final checksum `e0f3e41c` and `synthetic-imported-projectile-guard.json` trace checksum `eb9c2e58` / final checksum `b1c74e5e` now require bounded Projectile contact-effect packages plus typed `audio:playsnd` evidence and authored spark offsets. The hit route ties attacker-side `hitsound = S5,0` `PlaySnd` telemetry, typed audio telemetry, FightFX `sparkno = F7002`, and `sparkxy = 18,-68` multi-frame metadata to the same projectile `contactId` / `contactTick` / `contactKind = hit`; the guard route applies the same shape to `guardsound = S6,0`, typed audio telemetry, FightFX `guard.sparkno = F7004`, `sparkxy = 15,-63`, and `contactKind = guard`. Focused Projectile combat/trace preset coverage proves the callback and gate evidence. This is required Projectile presentation telemetry before renderer/audio handoff only; it does not prove exact projectile effect timing, SND playback/mixing, FightFX/common renderer lookup, binding, layering, scale, palette, helper-owned projectile effects, multi-target presentation, full Projectile parity, or score movement.

Previous R2 ownership addendum: `RuntimeStateClockWorld` owns bounded `Time` / state elapsed clock mutation that previously lived inline in `PlayableMatchRuntime`: per-frame state elapsed advance and changed-state elapsed reset. Focused `RuntimeStateClockSystem` coverage proves advance, reset, and no-op transition behavior while preserving the current `-1 -> 0` first-frame convention. This is architecture debt reduction only; it does not add exact CNS `Time` tick-order parity, persistent-controller timing parity, pause/hitpause timing changes, helper/team/redirect state clocks, or score movement.

Previous R2 ownership addendum: `RuntimeStateMetadataWorld` now owns bounded previous-state transition metadata writes that previously lived inline in `PlayableMatchRuntime`: `prevStateNo`, `prevAnimNo`, `prevStateType`, and `prevMoveType`. The basic `StateControllerExecutor` `ChangeState` / `SelfState` path also uses the same helper for runtime-only executor output. Focused `RuntimeStateMetadataSystem`, `RuntimeCnsSubset`, and `PlayableMatchRuntime` Prev-trigger coverage prove changed-state capture and unchanged-state no-op behavior. This is architecture debt reduction only; it does not add exact state-entry tick order, redirects/helper/team previous-state ownership, persistent controller semantics, full `ChangeState` / `SelfState` parity, or score movement.

Previous R2 ownership addendum: `RuntimeContactPresentationWorld` now owns bounded direct `HitDef` and `Projectile` contact presentation package emission that previously lived inline in `PlayableMatchRuntime`: shared `contactId` / `contactTick` / `contactKind` creation, attacker-side `PlaySnd` telemetry, attacker-side HitSpark telemetry, and current hit-spark asset-frame handoff. Focused `RuntimeContactPresentationSystem` coverage proves direct hit and projectile guard packages share metadata across sound and spark events. This is architecture debt reduction only; it does not add exact intra-tick audio/spark ordering, SND playback/mixing/channel priority, exact FightFX/common lookup/binding/layering/timing/scale/palette, helper-owned contact presentation, multi-target presentation, or score movement.

Previous R2 ownership addendum: `RuntimeGuardDistanceWorld` owns the bounded `InGuardDist`/auto-guard proximity decision that previously lived inline in `PlayableMatchRuntime`: current move presence, spent-hit rejection, pre-active guard-distance window, guardflag/AssertSpecial/unguardable filtering, caller-supplied hurtboxes, and authored/default `guard.dist` checks. Focused `RuntimeGuardDistanceSystem` coverage proves the pre-active window, missing/spent/out-of-window rejects, guardflag and AssertSpecial rejects, unguardable attacks, and authored `guard.dist` thresholds. This is architecture debt reduction only; it does not add exact MUGEN/IKEMEN proximity guard parity, guard-end timing, guard effects, air-guard landing, broad Common1 controller-loop parity, or score movement.

Previous R2 ownership addendum: `RuntimeAnimationWorld` owns bounded actor animation advancement and timing helpers that previously lived inline in `PlayableMatchRuntime`. Focused `RuntimeAnimationSystem` coverage proves empty actions, authored durations, frame changes, `loopStart` completion, final-frame hold, invalid-duration clamping, and `AnimTime` / `AnimElemTime` helper math. This is architecture debt reduction only; it does not add exact AIR negative-duration semantics, `elem` / `elemtime` parity, state-owner namespace behavior, controller tick-order parity, or score movement.

Previous R2 ownership addendum: `RuntimeKinematicsWorld` owns bounded actor position integration, sandbox gravity, ground snap, and landing idle-action request that previously lived inline in `PlayableMatchRuntime`. Focused `RuntimeKinematicsSystem` coverage proves grounded movement, airborne gravity, landing snap/idle, active-move landing, and imported hit-state ground-snap preservation. This is architecture debt reduction only; it does not add exact MUGEN physics, yaccel constants, landing timing, air recovery parity, helper physics ownership, or score movement.

Previous R2 ownership addendum: `RuntimeInputControlWorld` now owns bounded local player and simple AI control intent that previously lived inline in `PlayableMatchRuntime`: blocked input gates, State -1 setup/entry precedence, local punch/kick intent, crouch/jump/walk/idle mutation, airborne drift, `AssertSpecial NoWalk` suppression, AI chase, and AI attack cooldown. Focused `RuntimeInputControlSystem` coverage proves blocked input, state-entry precedence, movement branches, NoWalk/air drift, and AI chase/attack routes. This is architecture debt reduction only; it does not add new input semantics, exact command timing, exact AI behavior parity, full MUGEN/IKEMEN control routing, or score movement.

Previous R2 ownership addendum: `RuntimeMoveLifecycleWorld` now owns bounded active-move lifecycle mutation that previously lived inline in `PlayableMatchRuntime`: active move tick increment, non-reversal attack `moveType` / horizontal velocity lock, completed move cleanup, reversal cleanup, and non-reversal idle/control restoration via injected callbacks. Focused `RuntimeMoveLifecycleSystem` coverage proves no-op, active move, completed attack, and completed reversal routes. This is architecture debt reduction only; it does not add new move semantics, exact input/cancel timing, exact MUGEN/IKEMEN active-move lifecycle parity, or score movement.

Previous R2 ownership addendum: `RuntimeHitPauseWorld.advanceRuntime(...)` now owns the concrete runtime-system bridge for current global hitpause command buffering and paused presentation. Focused `RuntimeHitPauseSystem` coverage proves runtime command buffers receive current tick/input with `hitPause: true`, and paused presentation routes through `RuntimeEffectLifecycleWorld` with pause kind `hitpause`. This is architecture debt reduction only; it does not add new hitpause semantics, helper-owned hitpause execution, broad side-effect ordering during hitpause, exact first-frame decrement order, exact MUGEN/IKEMEN hitpause parity, or score movement.

Latest R2 helper redirect/bind addendum: `ExpressionEvaluator` and `HelperSystem` now support bounded `Parent, ...`, `Root, ...`, helper-local `EnemyNear, ...`, caller-provided helper-local `EnemyNear(index)` read-only redirects, explicit-provider `NumEnemy`, and static helper-local `BindToParent` / `BindToRoot` owner binding for current visual Helper actors when owner/root/opponent runtime state is provided by `RuntimeEffectLifecycleWorld` and an explicit `opponentStates` list is supplied for indexed reads/counts. Focused `EffectActorSystem` coverage proves helper-local controllers can branch on owner/root `Var`, `StateNo`, and `Vel X`, use `Root,Var(...)` as a `ChangeState` value, evaluate parent/root operands inside composite arithmetic/boolean/`IfElse(...)` expressions, read opponent `StateNo`, `Life`, `Pos X`, and `Var(...)`, read explicit indexed opponent state/counts when supplied, bind against supplied owner/root state, and fail closed when no parent/root/opponent state is available; required `synthetic-imported-helper-bindtoroot.json` checksum `bf72306c` proves the root-binding route in trace evidence with root `ownerBind` payload metadata, required `synthetic-imported-helper-bindtoparent.json` checksum `f9922c0e` remains the parent-binding proof with parent `ownerBind` payload metadata, and `synthetic-imported-helper-enemynear.json` checksum `35498955` remains the opponent redirect proof. This is a bounded helper redirect/bind/count slice only; it does not add broader indexed/team/helper-owned redirects beyond caller-provided `EnemyNear(index)` lists, player-state `BindToParent` / `BindToRoot`, dynamic bind params, team/keyctrl ownership, helper-owned opponents/combat/effects/projectiles, parent/root mutation outside the bounded bind path, nested helper ancestry where root differs from parent, exact state-owner/opponent resource scopes, exact tick order, full helper VM, or score movement.

Previous R2 helper lifecycle addendum: `HelperSystem` now owns a bounded helper-local micro-VM for current visual Helper actors spawned with owner runtime-program data. `RuntimeEffectSpawnWorld` hands the owner runtime program and animation map to Helpers; focused `EffectActorSystem` coverage proves helper-local `Time` trigger evaluation, `VelSet`, `ChangeAnim`, `ChangeState`, `DestroySelf` removal, helper-local `CtrlSet` / `StateTypeSet`, helper-local `LifeAdd` / `LifeSet` / `PowerAdd` / `PowerSet`, `VarSet` / `VarAdd` / `VarRandom` / `VarRangeSet` trigger branches, and helper-local `PlaySnd` / `StopSnd` sound-event telemetry, while `EffectSpawnSystem` coverage proves the runtime-program/animation handoff. `MugenAudioSystem` now scans effect actor snapshots as well as player snapshots, so helper-local sound telemetry can reach the browser audio adapter. This is architecture debt reduction plus a tiny helper-local execution subset; it does not add team ownership, `keyctrl`, helper fvar/sysvar `VarRandom`, exact helper-local sound timing/channel/redirect ownership, helper-owned Projectile combat/contact, helper TargetState breadth/multi-target parity beyond the owner-backed direct-HitDef gate, helper-owned custom state tables, exact helper `HitDef` lifetime/multi-hit parity, helper-bound Explod timing/mutation, full helper combat parity, exact helper resource semantics, exact random stream parity, exact tick-order/pause parity, full custom-state helper lifecycle, or score movement.

Previous R2 ownership addendum: `RuntimePausedMatchWorld.advanceRuntime(...)` now owns the concrete runtime-system bridge for current source-movetime pause side effects: target-memory aging, active-effect advance, presentation-effect advance, active target binding, stage clamp, and frozen-actor paused presentation. Focused `PauseSystem` coverage proves actor-local `targetWorld`, `effectLifecycleWorld`, and `RuntimeActorConstraintWorld` wiring while preserving the existing bounded source-movetime order, and `pnpm qa:trace` stays stable at the current 163/163 artifacts. This is architecture debt reduction only; it does not add new pause semantics, helper VM execution during pause, exact MUGEN/IKEMEN pause layering, exact paused effect tick order, parent/root/team redirects, or score movement.

Previous R2 ownership addendum: `RuntimeMatchInteractionWorld.advanceRuntime(...)` now owns the concrete runtime-system bridge for current normal-loop post-fighter interaction side effects: target-memory aging, active-effect advance, projectile clash, body separation, active target binding, stage clamp, and presentation-effect advance. Focused `MatchInteractionSystem` coverage proves actor-local `targetWorld`, `effectLifecycleWorld`, `effectActorWorld.resolveProjectileClashes(...)`, and `RuntimeActorConstraintWorld` wiring while preserving the existing bounded order. This is architecture debt reduction only; it does not add helper VM execution, new target/projectile/effect semantics, exact post-fighter tick-order parity, parent/root/team redirects, or score movement.

Previous R2 ownership addendum: `RuntimeResourceSystem` now owns shared authored life/power max resolution, runtime power-delta clamping, bounded life deltas, and control-flag writes used by `PlayableMatchRuntime`, `RuntimeDirectCombatWorld`, `RuntimeProjectileCombatWorld`, `RuntimeReversalWorld`, and `RuntimeTargetWorld`, replacing duplicate local resource-max helpers and inline power/control/life mutation paths for the current bounded routes. Focused resource, direct-combat, projectile-combat, target-system, reversal, and playable-runtime tests prove existing bounded semantics stay intact. This is architecture debt reduction only; it does not add new controller semantics, exact CNS resource timing, helper/team/redirect resource ownership, target parity, projectile parity, or score movement.

Previous R2 ownership addendum: `RuntimeEffectActorWorld.countActors(...)` owns the unified bounded effect-count query consumed by `PlayableMatchRuntime` for `NumExplod`, `NumHelper`, and `NumProj`/`NumProjID` trigger callbacks. Focused `EffectActorSystem` coverage proves Explod/Helper/Projectile counts, id filters, and removed-projectile exclusion through one world query. This is architecture debt reduction only; it does not add helper VM execution, exact projectile lifetime parity, parent/root/team scopes, or broader effect semantics.

Current R2 helper proof: `HelperSystem` / `RuntimeEffectActorWorld` own explicit visual-helper removal by helper id or runtime serial, all-owner helper clear, p1/p2 store isolation, and a bounded helper-local micro-VM for visual Helper actors. `RuntimeEffectSpawnWorld` passes owner runtime-program data and animations into the helper store, and `RuntimeEffectLifecycleWorld` provides owner runtime state for bounded read-only `Parent, ...` / `Root, ...` helper redirects plus current-opponent runtime state/id for bounded helper-local `EnemyNear, ...`, optional explicit `opponentStates` for caller-provided `EnemyNear(index)` and `NumEnemy`, explicit-id `Target(id)` reads, and direct-HitDef Target side-effect candidates. Focused `EffectActorSystem` and `EffectSpawnSystem` tests prove the bounded helper-store mutation and helper-local execution boundary, including helper-local control/metadata/resources/variables, helper-local int `VarRandom`, helper-local `IsHelper` / `IsHelper(id)` identity branches, helper-local `PlaySnd` / `StopSnd` sound-event telemetry, parent/root redirect branches/values both as leading expressions and as operands inside composite arithmetic, boolean, and `IfElse(...)` expressions, helper-local opponent reads through `EnemyNear, StateNo`, `EnemyNear, Life`, `EnemyNear, Pos X`, `EnemyNear, Var(...)`, explicit indexed opponent state when supplied, and explicit opponent-count reads through `NumEnemy`, explicit-id helper target memory through `synthetic-imported-helper-target.json`, bounded helper-owned direct-HitDef Target side effects through `synthetic-imported-helper-target-controllers.json`, owner-backed helper-local TargetState through `synthetic-imported-helper-targetstate.json`, static helper-local `BindToParent` / `BindToRoot`, static helper-local visual `Explod` handoff into the owner-side Explod store with helper `parentId` evidence, static helper-local `RemoveExplod` cleanup by id from that owner-side Explod store, static helper-local `ModifyExplod` mutation by id of only helper-parented owner-side Explods, helper-local `NumExplod(id)` counts for helper-parented owner-side Explods, helper-local `NumHelper(id)` counts for owner-side visual Helpers, static helper-local `Projectile` spawn into the owner-side projectile store with helper `parentId` evidence, and helper-local `NumProjID(id)` counts for helper-parented owner-side Projectiles with removed-projectile exclusion. Broader indexed/team/helper-owned redirects beyond caller-provided `EnemyNear(index)` lists, team/keyctrl ownership, redirect mutation beyond the gated subset, nested helper ancestry, helper-owned opponents/effect namespaces, helper fvar/sysvar `VarRandom`, exact helper-local sound timing/channel/redirect ownership, helper-owned combat/projectile contact beyond bounded direct `HitDef` and helper-parented Projectile target memory, helper TargetState breadth/multi-target parity beyond the owner-backed direct-HitDef gate, helper-bound Explod timing/mutation beyond bounded static spawn/remove/modify/count-id/count-projectile routes, exact helper effect-count/ownership parity, exact helper resource semantics, exact helper random stream/tick-order, and full Helper parity remain blocked.

Latest Studio/UI checkpoint: the Studio CSS cascade uses a single Studio CSS entrypoint: `src/main.ts` imports `src/style.css` for base/reset and `src/styles/studio.css` for the ordered Studio/app module graph. `src/styles/studio.css` preserves the existing order through category entrypoints and subfolders for legacy, editor, runtime, desktop, shell, command, and workflow modules, then imports `src/styles/surfaces/studio-status-rails.css` as the late shared rail owner. Active command shell ownership is split across `src/styles/command/*`; reusable Studio drawer/header/truncation ownership lives in `src/styles/surfaces/*`; Assets rows live in `src/styles/workflows/studio-assets-ledger.css`; Build/Evidence Trust Chain rows live in `src/styles/workflows/studio-trust-ledgers.css`. Current `pnpm qa:css` passes as an audit at 581,084 active CSS bytes, 2,576 scanned rules, 1 duplicate selector key, 0 exact duplicate rules, 126 repeated declaration groups, 155 cross-file duplicate selectors, and 17 fully shadowed cross-file rules. `pnpm qa:css:budget` currently fails against older 536,051-byte / 2,364-rule / 119 repeated-group / 108-overlap ceilings, so CSS budget recovery remains a separate cleanup task. Broader shared row/action primitives, dense typography cleanup, and remaining Studio cross-file selector reduction remain open. This is Studio/product-surface hygiene only; it does not replace the runtime next slice, prove new Studio workflows, or move port scores.

Latest Studio/UI addendum: Studio Build and Evidence now share one Trust Chain contract sourced from Build Readiness data for runtime manifest, QA evidence, project package, asset validation, source packages, compatibility gates, and architecture boundaries. The rows expose lane, state, proof, evidence, impact, blockers, and one primary next action. Trust Chain package/source rows now drill into concrete `package-file` export-manifest entries and `source-file` required paths, with visible focused destination rows and QA bridge fields for package/source focus. `pnpm qa:smoke` now asserts shared row ids, next-action binding, package/source file targets, destination row visibility, and focused-row state on Build/Evidence. Current `pnpm qa:css` passes as an audit at 581,084 bytes, 2,576 rules, 126 repeated declaration groups, and 155 cross-file overlaps; `pnpm qa:css:budget` is red against older ceilings and remains cleanup work. This is S1 product workflow evidence only; it does not change runtime compatibility or port scores.

Latest Studio/UI readability addendum: the desktop command palette and bottom console now use larger readable rows, aligned meta/source columns, severity cells, hard neutral surfaces, visible scrollbars, and focus-visible treatment in `src/styles/command/studio-command-palette.css`, `src/styles/command/studio-command-console.css`, and `src/styles/desktop/studio-desktop-command-polish.css`. `pnpm qa:smoke` confirms command-palette keyboard/focus behavior and captured Workbench/Build/Evidence/command screenshots were visually inspected. This is product-surface polish only; it does not add editing/export/runtime compatibility behavior or score movement.

Latest CSS cleanup addendum: `pnpm qa:css:budget` no longer reflects a green ceiling for the current tree; the latest run fails at 581,084 bytes, 2,576 rules, 1 duplicate selector key, 126 repeated declaration groups, 155 cross-file overlaps, and 17 fully shadowed cross-file rules against the older ceilings. Treat budget recovery as its own cleanup slice with shared primitive extraction and cascade ownership review. This does not block the current S1 package/source drilldown behavior because `pnpm qa:smoke`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass, but it must not be reported as a green budget gate.

## Historical Operating Snapshot

| Priority | Workstream | Next shippable proof | Evidence gate | Score effect |
| --- | --- | --- | --- | --- |
| P0 | Project control | Keep entry 516 authoritative while the concurrent outcome/5900 owner closes independently. | Numbered closeout plus focused/aggregate evidence; docs diff gate. | No documentary score movement. |
| P1 | R1 compatibility corpus | Publish `CompatibilityCorpus/v0` over the existing legal/portable/optional routes. | Deterministic report, denominator, failure taxonomy and tamper/absence cases. | Evidence organization only. |
| P1 | R1 score adjudication | Apply the written band to exactly one corpus version. | Decision links denominator, failures, evidence and blocked claims. | Move only if the written gate is met. |
| P1 | R1 independent breadth | Prove one independent legal stage/package route. | Legal digest plus loader/runtime/trace/browser proof. | Bounded confidence, not broad parity. |
| P2 | I2 match lifecycle | After the reserved slice closes, prove atomic 1 -> 2 -> 3 and per-actor round context. | Required multi-round and Turns traces plus focused contracts. | No automatic score movement. |
| P2 | S1 Studio source workflow | Add `StudioSemanticDraft/v0` before write/reimport. | Invalid-no-write and valid-save/reimport tests plus smoke. | Studio movement only with real persistence evidence. |
| P2 | A1 generated assets | Add provenance v2 and one fail-closed readiness consumer. | Canonical schema/migration/readiness tests. | Generated/native confidence only. |
| P3 | I1 IKEMEN scanner | Add source-mapped `PackageAnalysis/v0` across four package kinds. | Focused scanner tests and blocked runtime wording. | Scanner-only movement. |
| P3 | M1 modular boundary | Extract only after two real consumers prove one Project/Evidence/Build seam. | Contract/import test plus stable fighting gates. | Modular readiness only. |

## Historical Current Position

| Track | Current status | Next package | Blocked claim |
| --- | --- | --- | --- |
| Playable sandbox | Playable native/generated match with Three.js, HUD, stage, debug, smoke evidence. | Keep stable while compatibility and Studio move. | Does not prove imported MUGEN parity. |
| MUGEN runtime | Legal journey and independent character/palette routes plus broad bounded runtime gates are closed. | Corpus v0, adjudication, then an independent legal stage/package. | Full CNS VM/Common1, broad corpus, screenpacks and parity. |
| IKEMEN | Team topology/combat/decision/handoff/lifebar/resources and first next-round reset are bounded; outcome/5900 is uncommitted. | Close reserved work, then 1 -> 2 -> 3 context and automatic Turns continuation. | Exact Simul/Tag/Turns, motif, ZSS/Lua, rollback/netplay. |
| Studio | Source identity/transaction/provenance v1/folder editing and Trust Chain surfaces exist. | Semantic draft preflight before write/reimport. | General structured editor, asset DB, production export. |
| Generated assets | Native/generated assets and provenance v1 have bounded evidence. | Provenance v2 plus fail-closed readiness. | Imported compatibility credit or inferred permission. |
| Modular engine | Boundary docs and metadata registry exist; platformer slice intentionally delayed. | After higher dependencies, prove one real Project/Evidence/Build contract and stronger import gate. | Production multi-genre engine or generic fighting VM. |

See `docs/ROADMAP_RELEASE_TARGETS.md` for the release-train ladder and score-movement rules.

## Historical Next Concrete Gates

These are ordered candidates, not new score claims:

1. R1: publish `CompatibilityCorpus/v0`.
2. R1: adjudicate the score band from that exact corpus.
3. R1/renderer: add one independent legal stage/package route.
4. I2 owner: close and audit the reserved outcome/state-5900 slice.
5. I2: prove atomic 1 -> 2 -> 3 and per-actor round context.
6. I2: automate Turns continuation after state 5900.
7. S1: add `StudioSemanticDraft/v0` before writes.
8. A1: add provenance v2 and fail-closed readiness.
9. I1: add scanner-only `PackageAnalysis/v0`.
10. M1: promote a shared contract only after two real consumers.

## Historical Active Implementation Queue

The detailed queue below is retained as implementation history. The latest
planning reconciliation, operating snapshot, current position, and concrete
gates above supersede any older selector text inside those subsections.

### I2 - Bounded Tag Runtime

Issue: `.scratch/roadmap/issues/07-ikemen-runtime-topology.md`

Current checkpoint and next build:

- Closed: P3-P8 ownership/participation, plural structural activation, identity/Partner versus Enemy/P2 selection, standby CNS scheduling, static Tag options, explicit member/leader order, and bounded dynamic execution for every admitted optional axis.
- Closed: RedirectID semantics, numeric root/Helper identity, root RedirectID execution, and Helper-local state/control/standby participation.
- Closed: source-pinned Helper standby map, direct-combat/effective-control execution, and root-created static/dynamic initial standby; projectiles and drawing remain active.
- Closed: Helper aggregate ownership research; partner is stable-root-relative, member/leader own root order, and exact source failure is incremental.
- Closed: Helper-relative partner root standby/state/control with source-ordered expressions and local atomic validation.
- Closed: Helper-relative TagIn stable-PlayerNo leader rotation with local/self/partner composition.
- Closed: Helper-relative static/deferred TagIn/TagOut member mutation from mutable position one without a Helper root-order slot.
- Closed: complete root-to-Helper aggregate audit under explicit local atomicity; upstream incremental failure remains divergent.
- Closed: Helper-originated unredirected self TagIn/TagOut with live Helper expressions, local standby, telemetry, and reset-safe hook rebinding.
- Closed: required Helper-owned TagOut/TagIn trace with standby/effective-control transition, continued CNS, and preserved parented Projectile.
- Closed: pinned active-root ownership map across scheduler, command/direct input, effects, combat, round, presentation, resources, reset, and trace.
- Closed: explicit Tag side command routing plus reserve-root trace observability, with P2 isolation and P1-to-P3 required evidence.
- Closed: explicit per-root phase-capability matrix across command/CNS/gameplay owners with no execution change.
- Closed: pinned active-root phase-order research plus immutable normal-tick `active-motion` execution with restricted CNS, local kinematics/animation, and required checksum `8ee92f65`.
- Closed: pinned draw/shadow/camera/Tag choreography research plus a selected renderer-independent immediate handoff policy.
- Closed: `RuntimeRootPresentation/v0`, required checksum `97255586`, and desktop/mobile `[p1,p2] -> [p3,p2] -> [p1,p2]` browser proof with stable pair gameplay/HUD ownership.
- Closed: entry 411 / Wayfinder 105 bounded plural X/Width body push with exact pair/Single fallback and no combat widening.
- Closed through entry 476: active-root direct-hit admission/contact/priority/reversal/depth/HitOverride plus grounded/air guard entry.
- Open and independently owned: Wayfinder 127 fixture-specific active-root air-guard landing.
- Next architecture boundary after 127: global per-tick AssertSpecial ownership before team KO, incoming Helper/Projectile breadth, lifebar, audio, or resources; exact Tag overlap remains blocked.

Acceptance:

- Every semantic claim names pinned Ikemen-GO SHA `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
- Focused runtime/system tests cover participation invariants and `pnpm qa:trace` remains stable until executable behavior intentionally changes.
- Helper standby preserves aggregate validation and does not widen input, incoming Helper hurt, push, camera, opponent breadth, round, renderer, lifebar, Studio detail, or resources.
- Claim blocked: exact incremental partial mutation, Helper-originated redirect/aggregate Tag, tag/simul/turns gameplay, ZSS/Lua, rollback/netplay, and full IKEMEN parity.

### R1 - Post-KO And NoKOSlow Timeline

Issue: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

Build next:

- Treat HitDef priority/contact, semantic presentation order, `MatchTickSchedule/v0`, Common1 source precedence, and automatic guard ordering as closed gates.
- Gate one exact-enough KO/time-over frame sequence and the per-tick `NoKOSlow` assertion window without adding motif, team, continue, or broad lifebar behavior.
- Preserve current KO sound/no-duplicate behavior and make any checksum drift intentional.

Acceptance:

- Focused round tests plus one required ordered trace distinguish normal KO, `NoKOSlow`, and time-over.
- Claim allowed remains one bounded MUGEN-lite post-KO timeline.
- Claim blocked: exact slowdown curve/duration, motif/lifebar ownership, teams, win/continue flow, broad audio, score movement without wider fixture evidence, and full round parity.

### R1 - KFM/Common1 Recovery Precision

Issue: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

Build next:

- Current proof: required `synthetic-imported-default-fall-recovery.json` checksum `d83797d9` now gates bounded imported P2 controller/actor-frame order for `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120`, including the `hitFall.downRecoverTime` countdown-range plus first-to-last-drop evidence in lie-down state/action `5110` before `5120`. This narrows the bounded Common1 full fall-recovery chain without claiming exact `down.recovertime` / `fall.recovertime` tables, exact controller-loop timing, bounce physics, or score movement.
- Current proof: required `synthetic-imported-default-fall-recovery-threshold.json` checksum `7bb15a5f` observes imported defender actor-frame `5050` with positive `hitFall.recoverTime`, requires first-to-last `recoverTime` drop evidence in that summarized bucket, then observes `5210` with `recoverTime = 0` after `CanRecover` plus `command = "recovery"` routes.
- Current proof: required `synthetic-imported-common-gethit.json` checksum `713e49b7` now gates bounded P2 FallEnvShake runtime event telemetry for state `5100` plus ordered custom get-hit controller/typed-operation evidence through `HitFallVel -> HitFallDamage -> HitFallSet -> FallEnvShake`.
- Current proof: required `synthetic-imported-default-fall-recovery-tick-order.json` checksum `e2691aab` gates summarized actor-frame order where `5050` with positive recover time and first-to-last drop evidence appears before `5210` recovery evidence, and now also gates a bounded named controller/operation sequence from `5050` `VelAdd` `Gravity` before recovery `ChangeState` into `5210` `VelSet` / `kinematic:velset` / `HitFallSet` / `hitfall:hitfallset` / `ChangeState`.
- Current proof: required `synthetic-imported-default-fall-air-recovery-velocity.json` checksum `560f6308` gates bounded air-recovery velocity telemetry in `5210` after `CanRecover` plus `command = "recovery"`.
- Current proof: required `synthetic-imported-default-fall-ground-recovery.json` checksum `7945fd93` gates bounded near-ground selection through `5050 -> 5200 -> 5201 -> 52 -> 0`, with `SelfState`, `VelSet`, `PosSet`, actor-frame velocity telemetry for synthetic ground-recovery constants, and ordered named controller/typed-operation evidence from `5050` gravity/recovery input through `5200` self-land, `5201` safety/land, and `52` control restore.
- Current proof: required `synthetic-imported-default-gethit-progression.json` checksum `ef2a67f8` gates bounded stand get-hit progression with ordered `5000` `ChangeState` before `5001` `ChangeState`, actor-frame `5000 -> 5001`, and final idle/control evidence.
- Current optional fixture proof: `kfm-official-default-crouch-gethit-progression.json` checksum `3d197fae` gates private real KFM held-crouch prep `11` plus Common1 `5010 -> 5011 -> 0` through `HitShakeOver` / `HitOver`, KFM-specific `5010`/`5011` actor-frame telemetry, ordered `HitVelSet` / `VelMul` / `VelSet` / `DefenceMulSet` typed-operation evidence, and final `0`/control when `.scratch/fixtures/kfm-official.zip` exists.
- Current visual-effect proof: required `synthetic-imported-modifyexplod.json` checksum `bca75991` gates bounded typed `ModifyExplod` operation evidence and live owner-side visual Explod mutation for static velocity, acceleration, scale, remove time, sprite priority, remove-on-get-hit, and pause-budget telemetry through `RuntimeEffectSpawnWorld` / `RuntimeEffectActorWorld`; required `synthetic-imported-helper-modifyexplod.json` checksum `0749041c` adds the helper-local static route for helper-parented owner-side Explods. Dynamic params, position rebinding, helper-owned effect namespaces, FightFX/common routing, remove-trigger parity, exact tick order, and full Explod lifecycle parity remain blocked.
- Current trigger proof: focused compiler/evaluator/runtime-controller tests cover bounded `HitPauseTime` expression support against the current actor hitpause counter, and required `synthetic-imported-hitpausetime-ignorehitpause.json` checksum `a3a78bb8` proves an imported active-state `ChangeState` with `ignorehitpause = 1` can branch on `HitPauseTime > 0` into state `220` during global hitpause while P1 records `HitPause:player` advance and P2 records player freeze. Persistent controller semantics, helper-owned controller execution, broad side-effect ordering, and exact hitpause tick-order parity remain blocked.
- Current hit-eligibility proof: required `synthetic-imported-hitby-allow.json` checksum `c75d5c7d` gates bounded `HitBy value = S,NA` allow-list acceptance through typed `eligibility:hitby`, accepted direct-hit contact, and final P2 life `963`; required `synthetic-imported-hitby-reject.json` checksum `65185fd1` gates bounded `HitBy value = S,NT` mismatch rejection against `HitDef attr = S,NA` through typed `eligibility:hitby`, reject telemetry, and final P2 life `1000`; required `synthetic-imported-reject.json` checksum `5aca7dc0` gates the matching `NotHitBy` deny-list reject route through typed `eligibility:nothitby`. Exact attr grammar, slot priority, edge timing, helper/custom-state ownership, and full hit-eligibility parity remain blocked.
- Current normal get-hit metadata proof: required `synthetic-imported-gethitvar-kill.json` checksum `ef5ffabf` gates bounded defender-owned Common1-style `GetHitVar(kill)` routing after direct `HitDef kill = 0`, branching P2 `5000 -> 329`. Current custom-state ownership proof remains required `synthetic-imported-custom-state-gethitvar-fall-metadata.json` checksum `4a3a1c6b`, which gates bounded direct fall-`HitDef` target memory feeding P1-owned state data, P1-owned `GetHitVar(fall.damage/fall.kill/fall.xvel/fall.yvel)` branch from state `888` into state `903`, actor-frame `customOwnerId = p1`, target-link id `77`, P2 `SelfState`, and final state `0`/control. Required `synthetic-imported-custom-state-gethitvar-fall-envshake.json` checksum `5c9d1653` remains the fall envshake metadata branch proof, required `synthetic-imported-custom-state-gethitvar-guarded.json` checksum `54f62821` gates bounded guarded direct-`HitDef` target memory feeding typed owner-local `TargetState`, required `synthetic-imported-custom-state-gethitvar-velocity.json` checksum `e9d8da9e` remains the direct-hit velocity metadata branch proof, required `synthetic-imported-custom-state-gethitvar-down-recover.json` checksum `5bd94568` remains the down-recovery metadata branch proof, required `synthetic-imported-custom-state-gethitvar-animtype.json` checksum `bbe8777c` remains the type metadata branch proof, required `synthetic-imported-custom-state-gethitvar-fall.json` checksum `2ccfeb43` remains the fall/recover metadata branch proof, required `synthetic-imported-custom-state-gethitvar.json` checksum `40705e74` remains the direct-hit `damage/hittime/guarded` branch proof, required `synthetic-imported-target-owned-custom-state.json` checksum `410fb8c0` gates the complementary `p2getp1state = 0` route through defender-owned state/action `888`, and owner-backed `synthetic-imported-custom-state.json` checksum `bf632df3` remains the basic `888 -> 889 -> SelfState` chain. These do not claim `guard.kill`, KO/round-flow behavior, `p2stateno`-on-guard behavior, exact guard timing, exact velocity lifetime after later physics/controllers, exact lie-down tables, exact get-hit animation selection, throws, helpers/root/parent redirects, teams, exact bind/tick order, exact recovery threshold behavior, metadata lifetime/stacking, or full MUGEN/IKEMEN get-hit/custom-state parity.
- Current guard proof: required `synthetic-imported-default-guard-state.json` checksum `016938a1`, `synthetic-imported-crouch-guard-state.json` checksum `6c4321af`, `synthetic-imported-diagonal-crouch-guard-state.json` checksum `1dd33fb5`, and `synthetic-imported-air-guard-state.json` checksum `ce9cc9ba` gate bounded stand/crouch/atomic-`DB`/air guard-hit controller/operation routes through `ChangeAnim`, `ChangeState`, `HitVelSet`, `kinematic:hitvelset`, `CtrlSet`, `resource:ctrlset`, and final `ChangeState`, plus actor-frame state/physics/body/push telemetry; stand and air also gate bounded velocity evidence, and air gates `VelAdd` gravity evidence.
- Current auto guard proof: required `synthetic-imported-auto-guard-start.json` checksum `0c734290` now gates P2 state `120` `ChangeState` `Guard Start Done` plus ordered actor-frame evidence for `120` before `130`, and required `synthetic-imported-auto-guard-end.json` checksum `d1dc0aa3` gates P2 `120` `Guard Start Done` before state `130` `ChangeState` `Stop Guarding`, actor-frame `120 -> 130 -> 140`, plus final idle/control evidence. This is minimum bounded guard-start/end controller/state-order evidence, not exact proximity guard, guard-end timing, full Common1 controller-loop parity, or full guard VM parity.
- Current AssertSpecial/Target proof: required `synthetic-imported-target-dynamic-redirect.json` checksum `9985b62a` gates bounded `Target(var(0)), Life` trigger redirect reads from current target memory after owner-local target-id seeding; previous `synthetic-imported-target-redirect.json` checksum `89580963` gates static `Target(77), Life`; required `synthetic-imported-target-noko.json` checksum `321a1eba` gates bounded P2 state `0` `Passive AssertSpecial` before P1 state `200` `HitDef` and lethal `TargetLifeAdd`, with target-link evidence and final P2 life `1`; previous `synthetic-imported-assertspecial-noko.json` checksum `f2f60521` still gates direct lethal `HitDef` no-KO. This is minimum target-read and NoKO flag-before-hit/target-damage evidence only, not exact round/no-KO or target parity.
- Current AssertSpecial guard-deny proof: required `synthetic-imported-assertspecial-guarddeny.json` checksum `fd2eb239`, `synthetic-imported-assertspecial-crouch-guarddeny.json` checksum `757cb87a`, and `synthetic-imported-assertspecial-air-guarddeny.json` checksum `810a1679` now gate defender-side `AssertSpecial` before attacker-side guardable `HitDef` for stand/crouch/air denial routes; this is minimum flag-before-hit evidence only, not exact guard-rule parity.
- Current HitDef-effect proof: required `synthetic-imported-hitdef-hit-sound.json` checksum `6fc00d8a` gates bounded `HitDef hitsound = S5,0` into attacker-side `PlaySnd` telemetry, required `synthetic-imported-hitdef-guard-sound.json` checksum `fdf1f7f6` gates bounded `HitDef guardsound = S6,0` into attacker-side `PlaySnd` telemetry, required `synthetic-imported-hitdef-hit-spark.json` checksum `b6554124` gates bounded `sparkno = S7001` plus `sparkxy = 10,-72` into attacker-side hit `HitSpark` telemetry, required `synthetic-imported-hitdef-guard-spark.json` checksum `72c8fa3a` gates bounded `guard.sparkno = S7000` plus `sparkxy = 12,-64` into attacker-side guard `HitSpark` telemetry after imported direct-hit routes, required `synthetic-imported-hitdef-common-spark.json` checksum `5ea054d7` gates unprefixed common/default hit source-frame plus selected-frame/multi-frame AIR metadata, required `synthetic-imported-hitdef-fightfx-spark.json` checksum `11537b56` gates `F`-prefixed FightFX hit source-frame plus selected-frame/multi-frame AIR metadata, required `synthetic-imported-hitdef-common-guard-spark.json` checksum `7650a09c` gates unprefixed common/default guard source-frame plus selected-frame/multi-frame AIR metadata, required `synthetic-imported-hitdef-fightfx-guard-spark.json` checksum `32f3e92d` gates `F`-prefixed FightFX guard source-frame plus selected-frame/multi-frame AIR metadata, required `synthetic-imported-hitdef-hit-effect-package.json` checksum `46aa5ce1` gates one direct hit contact that emits bounded `hitsound = F5,0` telemetry with `soundPrefix = kfm` plus FightFX `sparkno = F7002` selected-frame/multi-frame metadata, and required `synthetic-imported-hitdef-guard-effect-package.json` checksum `1c3167b7` gates one guarded contact that emits both bounded `guardsound = S6,0` telemetry and FightFX `guard.sparkno = F7004` selected-frame/multi-frame metadata. `HitSparkRenderer` now treats `S` refs as player AIR action ids, resolves local player AIR frames into sprite textures when available, classifies unprefixed refs as common/default and `F` refs as FightFX, preserves runtime-provided package frames from `hitSparkLibraries`, synthesizes bounded common/FightFX system lookup frames through the global sprite namespace when no package frame exists, draws bounded fallback geometry when AIR/sprite lookup fails, and `pnpm qa:smoke` warms the renderer, resets the round, drives native contact, and checks active desktop/mobile sparks plus player-source resolved-sprite diagnostics. `MugenCharacterLoader` now discovers optional `data/fight.def`, resolves `fightfx.air` / `fightfx.sff` / `fightfx.snd`, parses those AIR actions as both `common` and `fightfx` hit-spark libraries, decodes the system SFF and SND when possible, `createImportedFighterDefinition` carries those package-backed libraries into the runtime fighter definition, `App` registers decoded system SFF sprites through a global hit-spark provider route and decoded FightFX SND archives through prefix-keyed audio lookup, focused renderer coverage proves package-backed `common`/`fightfx` frames resolve through that global provider route without player-owner context, package-backed frame lists advance by AIR frame duration, resolved spark sprite meshes bind around the `sparkxy` anchor using AIR frame offsets plus SFF axes with facing applied, and QA diagnostics expose selected frame/sprite-axis/local-position metadata for inspection. This is first-pass package asset discovery/handoff/provider/lookup/timed-frame/axis-binding/source-frame plus selected-frame/multi-frame trace evidence and bounded prefixed-SND lookup, not exact same-tick sound/spark ordering, channel/timing/mixing, render lookup, layering, scale, palette, motif ownership, hit/guard-effect parity, or full system-effect parity.
- Current required guard proof: `synthetic-imported-default-guard-hold-walk-return.json` checksum `75d4db9c` now makes the stand guard-hit actor-frame sequence `150 -> 151 -> 130 -> 20` portable, with held-back walk/control final evidence on top of the existing `synthetic-imported-default-guard-slide-stop.json` checksum `a9663641` stand `151` slide-stop/control gate. Current optional fixture guard proof remains `kfm-official-default-guard-hold-walk-return.json` checksum `885bb1da`, which mirrors the same real KFM/Common1 route on top of `kfm-official-default-guard-slide-stop.json` checksum `885bb1da`; `kfm-official-default-guard-hold-return.json` checksum `885bb1da` remains the hold-only subset. `kfm-official-default-crouch-guard-slide-stop.json` checksum `d11153d0` keeps stricter real KFM/Common1 crouch guard-hit state `153` slide-stop/control order evidence on top of `kfm-official-default-crouch-guard-state.json` checksum `d11153d0`. `kfm-official-default-air-guard-state.json` checksum `62367dac` requires ordered controller/typed-operation evidence plus actor-frame state/physics/body telemetry for real KFM/Common1 air `154 -> 155 -> 52 -> 20` guard-hit routes when the private fixture exists; air also requires bounded velocity/landing frame telemetry and final held-back walk/control evidence. `kfm-official-auto-guard-start.json` checksum `ad493cde` and `kfm-official-auto-guard-end.json` checksum `ee962d04` now also require ordered real KFM auto guard-start/end evidence through `120 -> 130 -> 140 -> 0`, including `StateTypeSet`/`metadata:statetypeset` and return-to-idle `VelSet` evidence.
- Current optional fixture proof: `kfm-official-default-fall-recovery-threshold.json` checksum `19ec5148` confirms real KFM/Common1 reaches state `5050` while `hitFall.recoverTime` is still positive, proves a first-to-last `recoverTime` drop inside that summarized `5050` bucket, then accepts recovery into the ground branch `5200 -> 5201 -> 52 -> 0` when the private fixture is present; the gate now also requires ordered actor-frame evidence where the dropping `5050` observation precedes `5200` with `recoverTime = 0`. `kfm-official-default-fall-ground-recovery.json` checksum `6079c8c9` now also requires bounded official KFM controller/typed-operation order through `5050` `VelAdd`/`ChangeState`, `5200` `VelAdd`/`SelfState`, and `52` landing `VelSet`/`PosSet`/`kinematic:*`/`ChangeState` evidence.
- Build next recovery/guard proof not already covered by default stand get-hit progression controller/frame order, threshold/actor-frame tick-order/named controller-operation order/synthetic auto guard-start-end controller order/synthetic guard-hit actor-frame telemetry/early-reject/positive/air-velocity/ground-selection/official ordered-threshold/official auto guard-start-end/official guard-hit frame-physics/required hit/guard sound plus hit/guard spark telemetry/player-AIR, bounded common/FightFX system render/source-metadata routes, required common/FightFX source-frame plus selected-frame/multi-frame trace gates, package-frame handoff tests, first-pass real fight.def/FightFX/common AIR/SFF loading/provider registration tests, renderer global-provider lookup tests, AIR-duration frame advance tests, bounded AIR/SFF axis binding, and frame/axis QA diagnostics: broader recovery parity, deeper VM tick-order coverage, exact FightFX/common render lookup/layering/scale/palette, or broader guard-effect parity.

Acceptance:

- Focused tests or `pnpm qa:trace` required artifact.
- Claim allowed names artifact and route.
- Claim blocked keeps exact tick-order, full recovery parity, and broad character claims out of scope.

### R2 - MatchWorld Ownership Deepening

Issue: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`

Build next:

- Current proof: `RuntimeMoveStartWorld` owns bounded native/imported state-move startup consumed by `PlayableMatchRuntime`, with focused coverage for selected move metadata/reset behavior and control-before-state-entry hook order while trace behavior is expected to remain stable.
- Current proof: `RuntimeMatchTickInputWorld` owns bounded normal-match input/tick stamping consumed by `PlayableMatchRuntime`, with focused coverage for `compatibilityTick`, cloned `currentInput`, normal non-hitpause command-buffer writes, and separation from pause/hitpause buffering while trace behavior is expected to remain stable.
- Current proof: `RuntimeHelperTelemetryWorld` owns bounded helper-local Projectile controller/op telemetry binding consumed by `PlayableMatchRuntime`, with focused coverage for projectile controller/operation recording, helper-state attribution, owner-state fallback, non-projectile ignore behavior, and stale handler replacement while trace behavior is expected to remain stable.
- Current proof: `RuntimeRoundSystem` owns bounded round timer, KO/time-over finish state, winner/message projection, and reset semantics, with focused unit coverage and unchanged `pnpm qa:trace` aggregate behavior.
- Current proof: required `synthetic-imported-round-ko.json` checksum `bfd5f073` and `synthetic-imported-round-timeover.json` checksum `7d9f7907` use `RuntimeTraceGate.requiredRoundFrames` to gate bounded `RoundSnapshot` KO and time-over/draw evidence.
- Current proof: required `synthetic-imported-target-dynamic-redirect.json` checksum `9985b62a` gates bounded `Target(var(0)), Life` trigger redirect reads through current target memory, proving P1 can branch from state `200` to `287` after direct `HitDef` target creation and owner-local `var(0) = 77`; previous `synthetic-imported-target-redirect.json` checksum `89580963` keeps static `Target(77), Life` routing gated.
- Current proof: required `synthetic-imported-helper-explod.json` checksum `87ae363f` gates bounded helper-local static `Explod` visual side effects through `HelperSystem`, proving a visual Helper effect actor can route from state `1200` to `1205` / anim `925` and spawn owner-side Explod anim `939` with `parentId = p1-helper-0` lifecycle/payload evidence; previous `synthetic-imported-helper-bindtoroot.json` checksum `bf72306c` remains required for bounded helper-local `BindToRoot`, previous `synthetic-imported-helper-bindtoparent.json` checksum `f9922c0e` remains required for bounded helper-local `BindToParent`, previous `synthetic-imported-helper-enemynear.json` checksum `35498955` remains required for bounded helper-local opponent reads, and previous `synthetic-imported-helper-ishelper.json` checksum `37877602` remains required for `IsHelper(42)` routing.
- Current proof: required `synthetic-imported-helper-projectile-default-targetstate.json` checksum `918c42a1` gates bounded helper-parented Projectile default TargetState with owner/helper target-link evidence for target id `0`, P2 owner-backed custom-state frames `888 -> 889`, `SelfState` return, helper payload `targetCount = 1`, projectile default-id parent payload, and contact package telemetry; required `synthetic-imported-helper-projectile-targetstate.json` checksum `b12e1cb3` remains the explicit-id `8862` helper-parented Projectile TargetState proof; required `synthetic-imported-helper-projectile-default-target-controllers.json` checksum `0c4c69ae` remains the bounded helper-parented Projectile default Target side-effect proof for target id `0`; required `synthetic-imported-helper-projectile-target-controllers.json` checksum `58688be8` remains the explicit-id `8861` helper-parented Projectile Target side-effect proof; required `synthetic-imported-helper-targetstate.json` checksum `011633b8` gates bounded helper-local TargetState routing through owner-backed custom state data; required `synthetic-imported-helper-target-controllers.json` checksum `61f4c61e` gates bounded helper direct-HitDef Target side effects with helper target-link/binding evidence, helper payload `targetCount = 0`, and final P2 life/power evidence; required `synthetic-imported-helper-bare-target.json` checksum `15f3c1db` gates bounded helper direct HitDef current target reads with helper target-link evidence and helper-local bare `Target, Life`; required `synthetic-imported-bare-target-redirect.json` checksum `f9c90aa8` gates bounded player direct HitDef current target reads with target-link evidence and owner-local bare `Target, Life`; required `synthetic-imported-default-numtarget.json` checksum `5869ebbd` gates bounded player direct HitDef default target id `0` memory with target-link evidence and owner-local `NumTarget(0)`; required `synthetic-imported-default-target-redirect.json` checksum `d43caabf` gates the matching player direct default target id `0` memory with owner-local `Target(0), Life`; required `synthetic-imported-helper-default-target.json` checksum `e1bcced0` gates bounded helper-owned direct HitDef default target id `0` memory with helper target-link evidence and helper-local `NumTarget(0)` / `Target(0), Life`; required `synthetic-imported-helper-projectile-default-target.json` checksum `b0daddf6` gates bounded helper-parented Projectile default target id `0` memory with owner/helper target-link evidence and helper-local `NumTarget(0)` / `Target(0), Life`; required `synthetic-imported-helper-projectile-target.json` checksum `49261b53` gates the matching explicit-id helper-parented Projectile target memory; required `synthetic-imported-helper-target.json` checksum `68f95b67` remains the bounded helper-owned explicit-id direct `HitDef` target-memory proof; required `synthetic-imported-helper-hitdef.json` checksum `89f9e876` remains the bounded helper-owned direct `HitDef` combat proof with helper-side contact package telemetry; required Common1, helper projectile/contact, target-owned custom-state, hitby, presentation, no-op, and identity gates remain active. Current trace aggregate: 202/202 artifacts passed, 182 required and 20 optional; controller-family coverage is 78.
- Current proof: required `synthetic-imported-target-noko.json` checksum `321a1eba` gates bounded defender-side NoKO clamping for lethal `TargetLifeAdd` through ordered AssertSpecial/HitDef/TargetLifeAdd controller evidence, target-link evidence, and final P2 life `1`; previous `synthetic-imported-target.json` checksum `f5a16dc9` gates bounded TargetLifeAdd/TargetPowerAdd/TargetVel*/TargetFacing/TargetBind/BindToTarget/TargetDrop side effects through typed operations, target-link/binding evidence, P2 facing/velocity actor-frame evidence, final P1 `targetCount = 0`, and final P2 `life = 943` / `power = 40`.
- Current proof: `RuntimeTargetWorld.snapshotRuntimeState` owns cloned target-memory snapshots consumed by `MatchWorld` actor records, with focused tests proving target refs, TargetBind bindings, and `BindToTarget` registry evidence remain stable.
- Current proof: `RuntimePauseWorld` owns current match pause state, snapshot projection, source-movetime checks, countdown ticks, controller application, and reset while preserving existing `Pause`/`SuperPause` trace behavior.
- Current proof: `RuntimePausedMatchWorld` owns bounded regular `Pause` / `SuperPause` paused-match ordering consumed by `PlayableMatchRuntime`, with focused `PauseSystem` coverage for source `movetime`, frozen actor presentation, pause replacement interruption, pause countdown ticking, and the concrete `advanceRuntime(...)` bridge for source-movetime target/effect/constraint side effects plus explicit one-opponent lifecycle roster source forwarding while trace behavior is expected to remain stable.
- Current proof: `RuntimeHitPauseWorld` owns bounded global hitpause ordering consumed by `PlayableMatchRuntime`, with focused `RuntimeHitPauseSystem` coverage for command buffering, `ignorehitpause` dispatch, paused presentation, actor countdown, no-op behavior outside hitpause, and the concrete `advanceRuntime(...)` bridge for command-buffer plus paused-presentation side effects plus explicit one-opponent lifecycle roster source forwarding while trace behavior is expected to remain stable.
- Current proof: `RuntimeKinematicsWorld` owns bounded actor position integration, sandbox gravity, ground snap, and landing idle-action request consumed by `PlayableMatchRuntime`, with focused `RuntimeKinematicsSystem` coverage for grounded movement, airborne gravity, landing snap/idle, active-move landing, and imported hit-state ground-snap preservation.
- Current proof: `RuntimeGuardDistanceWorld` owns bounded `InGuardDist`/auto-guard proximity checks consumed by `PlayableMatchRuntime`, with focused `RuntimeGuardDistanceSystem` coverage for pre-active guard-distance windows, missing/spent/out-of-window rejects, guardflag/AssertSpecial/unguardable filtering, and authored `guard.dist` thresholds.
- Current proof: `RuntimeAnimationWorld` owns bounded actor animation advancement and timing helpers consumed by `PlayableMatchRuntime`, with focused `RuntimeAnimationSystem` coverage for empty actions, authored durations, frame changes, loop completion, final-frame hold, invalid-duration clamping, and `AnimTime` / `AnimElemTime` helper math.
- Current proof: `RuntimeInputControlWorld` owns bounded local player and simple AI control intent consumed by `PlayableMatchRuntime`, with focused `RuntimeInputControlSystem` coverage for blocked input, State -1 setup/entry precedence, crouch/jump/walk/idle, NoWalk suppression, air drift, AI chase/cooldown, and punch/kick intent.
- Current proof: `RuntimeAssertSpecialWorld` owns bounded imported pre-facing `AssertSpecial` lookup/filter/trigger/application consumed by `PlayableMatchRuntime`, with focused system coverage for imported current-state, owner-backed state-owner, trigger filtering, and non-imported skip behavior while trace behavior is expected to remain stable.
- Current proof: `RuntimeSnapshotWorld.match()` owns bounded full match snapshot envelope assembly consumed by `PlayableMatchRuntime`, on top of the existing stage/camera, player actor, and final effect snapshot projection boundaries. Focused system coverage proves selected P1 action, playback/speed/toggles, match pause handoff, stage/camera, round, actor/effect projection, compatibility-session handoff, and 80-line log trimming, while earlier snapshot coverage still proves `ScreenBound` camera exclusion/fallback, EnvShake/EnvColor handoff, actor identity/source/sprite-owner metadata, cloned runtime/event histories, target refs/bindings, active/frame collision boxes, missing-frame fallback hurtbox, and cloned p1/p2 Explod/Helper/Projectile snapshot ordering.
- Current proof: `RuntimeCompatibilityTelemetryWorld` owns imported compatibility telemetry/session projection consumed by `PlayableMatchRuntime`, with focused system coverage for imported/owner-backed filtering, state-entry/session projection, controller-event caps, operation key stability, active-command projection, and command-history handoff while trace behavior stays stable.
- Current proof: `RuntimeEnvShakeWorld` owns bounded EnvShake/FallEnvShake event insertion plus deterministic multi-actor camera-shake projection consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeAudioWorld` owns bounded `PlaySnd`/`StopSnd` event insertion consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEnvColorWorld` owns bounded `EnvColor` event history, stage-flash projection, and reset consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEnvColorControllerDispatchWorld` owns bounded active-state EnvColor controller dispatch/telemetry into `RuntimeEnvColorWorld`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEnvShakeControllerDispatchWorld` owns bounded active-state EnvShake controller dispatch/telemetry into `RuntimeEnvShakeWorld`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEffectSpawnControllerDispatchWorld` owns bounded active-state Explod / RemoveExplod / ModifyExplod / Helper / Projectile / ModifyProjectile dispatch/telemetry into `RuntimeEffectSpawnWorld`, with focused `EffectSpawnSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeFallEnvShakeControllerDispatchWorld` owns bounded active-state FallEnvShake dispatch/telemetry into `RuntimeEnvShakeWorld`, with focused `EnvShakeSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimePauseControllerDispatchWorld` owns bounded active-state Pause/SuperPause controller dispatch/telemetry into the match pause handler, with focused `PauseSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeSpriteEffectWorld` owns current match-runtime `SprPriority`, `PalFX`, `AfterImage`, `AfterImageTime`, `Trans`, and `Angle*` mutation/ticking consumed by `PlayableMatchRuntime`, with focused `SpriteEffectSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeSpriteEffectControllerWorld` routes active-state `AfterImage` through the sprite-effect side-effect boundary and now resolves bounded dynamic `AfterImage time/length/timegap/framegap/paladd/palmul` into typed `sprite-effect:afterimage` telemetry after runtime expression resolution. Focused `SpriteEffectSystem` and `RuntimeTraceGatePresets` coverage plus required `synthetic-imported-afterimage-dynamic.json` trace checksum `e7299ac5` / final checksum `b946d805` prove bounded ghost-trail mutation and operation evidence.
- Previous proof: `RuntimeSpriteEffectControllerWorld` routes active-state `PalFX` through the sprite-effect side-effect boundary and resolves bounded dynamic `PalFX time/add/mul/color/invertall` into typed `sprite-effect:palfx` telemetry after runtime expression resolution. Focused `SpriteEffectSystem` and `RuntimeTraceGatePresets` coverage plus required `synthetic-imported-palfx-dynamic.json` checksum `36cdca15` / final checksum `7a1a4525` prove bounded palette-effect mutation and operation evidence.
- Previous proof: `RuntimeSpriteEffectControllerWorld` routes active-state `AfterImageTime` through the sprite-effect side-effect boundary and resolves bounded dynamic `AfterImageTime value/time` into typed `sprite-effect:afterimagetime` telemetry after runtime expression resolution. Focused `SpriteEffectSystem` and `RuntimeTraceGatePresets` coverage plus required `synthetic-imported-afterimagetime-dynamic.json` checksum `c5ef6fff` / final checksum `661a233d` prove bounded `afterImageTime = 14` ghost-trail mutation and operation evidence.
- Previous proof: `RuntimeSpriteEffectControllerWorld` routes active-state `RemapPal` through the sprite-effect side-effect boundary and resolves bounded dynamic `RemapPal source/dest` into typed `sprite-effect:remappal` telemetry after runtime expression resolution. Focused `SpriteEffectSystem` and `RuntimeTraceGatePresets` coverage plus required `synthetic-imported-remappal-dynamic.json` checksum `5f04f2d4` / final checksum `71ad06f0` prove bounded `paletteRemap source [1,5] -> dest [2,7]` mutation and operation evidence.
- Current proof: `RuntimeSpriteEffectControllerWorld` routes active-state `Trans` through the sprite-effect side-effect boundary and resolves bounded dynamic `Trans alpha` into typed `sprite-effect:trans` telemetry after runtime expression resolution. Focused `SpriteEffectSystem` and `RuntimeTraceGatePresets` coverage plus required `synthetic-imported-trans-dynamic.json` checksum `4bffcd82` / final checksum `5beea0f0` prove bounded `renderOpacity = 0.375` mutation and operation evidence.
- Current proof: `RuntimeActorConstraintWorld` owns bounded static and dynamic-fallback `Width`, per-frame `PlayerPush`/`PosFreeze`/`ScreenBound` constraint reset/projection, stage clamping, and body-push separation consumed by `PlayableMatchRuntime`, with focused `ActorConstraintSystem` coverage plus required dynamic Width, PlayerPush, PosFreeze, and ScreenBound trace evidence.
- Current proof: `RuntimeBoundsControllerWorld` owns static typed plus dynamic raw-expression `PlayerPush`, `PosFreeze`, and `ScreenBound` handoff with typed telemetry after runtime expression resolution, with focused bounds-controller coverage plus required `synthetic-imported-playerpush-dynamic.json`, `synthetic-imported-posfreeze-dynamic.json`, and `synthetic-imported-screenbound-dynamic.json` trace evidence.
- Current proof: `RuntimeActorConstraintControllerDispatchWorld` owns bounded active-state Width controller dispatch/telemetry, typed-op selection, and dynamic resolver fallback into `RuntimeActorConstraintWorld`, with focused `ActorConstraintSystem` coverage and required dynamic Width trace evidence.
- Current proof: `RuntimeDirectCombatWorld` owns bounded direct hit/guard result mutation consumed by `PlayableMatchRuntime`, including same-tick direct `HitDef` priority win/trade mutation, life, pause, stun, velocity, hit vars, hit fall metadata, power gain, contact memory, received-damage memory, and get-hit cleanup, with focused `DirectCombatSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeCombatResolutionWorld` owns bounded active direct/projectile contact orchestration consumed by `PlayableMatchRuntime`, including direct eligibility/reversal/reject/HitOverride routing, target-memory remembering, projectile-combat callbacks, received-damage/contact memory routing, and contact-presentation emission, with focused `RuntimeCombatResolutionSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeHitOverrideWorld` owns bounded HitOverride slot ticking and redirect mutation consumed by direct and projectile combat paths, with focused `HitOverrideSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeControllerEvaluationContextWorld` owns bounded `StateControllerExecutor` context creation for active runtime-controller dispatch, with focused system coverage for owner const reads, actor hitpause reads, actor random callbacks, and stage-time forwarding.
- Current proof: `RuntimeDispatchEvaluationWorld` owns bounded dynamic active-controller dispatch-param fallback between compiled dispatch data and `RuntimeExpressionContextWorld` read-model creation, with focused system coverage for compiled-value precedence, numeric fallback evaluation, Boolean truthiness, and actor/opponent/owner/tick forwarding.
- Current proof: `RuntimeActiveStateDispatchWorld` owns bounded active-state `ChangeState` / `SelfState` and `ChangeAnim` / `ChangeAnim2` mutation dispatch from `PlayableMatchRuntime`, with focused coverage for dynamic state/animation params, ctrl, owner-backed `ChangeAnim2`, unresolved no-ops, and non-state pass-through.
- Current proof: `RuntimeActiveSideEffectDispatchWorld` owns bounded active-state side-effect dispatch routing from `PlayableMatchRuntime`, with focused coverage for every current singleton/grouped route, missing-hook fail-soft behavior, and non-side-effect pass-through while existing controller worlds keep concrete semantics.
- Current proof: `RuntimeActiveControllerDispatchWorld` owns bounded active-controller route orchestration after scan/trigger pass, with focused coverage for state-first stop, shared runtime-controller handoff, active side-effect handoff, and unsupported fail-soft pass-through.
- Current proof: `RuntimeActiveControllerHookSetWorld` owns bounded active-controller hook-set construction before active controller dispatch runs, with focused coverage proving every current state, side-effect, and runtime-controller hook route is preserved plus optional unsupported-hook omission.
- Current proof: `RuntimeFighterAdvanceWorld` owns bounded per-fighter advance order from sprite/effect and hit-slot ticks through state clock, recovery, stun, movement, animation, active controllers, recovery landing, lie-down recovery, and frozen-position preservation, with focused coverage proving order, preserve flag forwarding, and tick-start position capture.
- Current proof: `RuntimeTriggerEvaluationWorld` owns bounded normalized single-trigger expression evaluation between `RuntimeTriggerGateWorld` grouping and `RuntimeExpressionContextWorld` read-model creation, with focused system coverage for context forwarding, normalized expression use, and false zero-result behavior.
- Current proof: `RuntimeExpressionContextWorld` owns bounded active runtime expression/trigger context creation for imported state triggers and dynamic controller-param fallback, with focused `RuntimeExpressionContextSystem` coverage for numeric reads, target redirects, compiled trigger evaluation, const/state/HitVar helpers, and unchanged trace behavior expected.
- Current proof: `RuntimeStateTransitionControllerWorld` owns bounded passive `ChangeState` / `SelfState` setup in the basic `StateControllerExecutor` path, with focused `StateTransitionControllerSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeAnimationControllerWorld` owns bounded passive `ChangeAnim` / `ChangeAnim2` setup in the basic `StateControllerExecutor` path, with focused `AnimationControllerSystem` coverage and unchanged trace behavior expected. Required `synthetic-imported-changeanim2-elem.json` checksum `b0b46d33` now separately gates one active-state `ChangeAnim2` owner-AIR `elem` / `elemtime` positioning route.
- Current proof: `RuntimeKinematicControllerWorld` owns bounded passive `VelSet`, `VelAdd`, `VelMul`, `HitVelSet`, `PosSet`, `PosAdd`, and `Gravity` setup from typed `kinematic:*` operations or raw controller params, with focused `KinematicControllerSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeBoundsControllerWorld` owns bounded passive `PlayerPush`, `PosFreeze`, and `ScreenBound` setup from typed `collision:playerpush` / `bounds:*` operations or raw controller params; dynamic `PlayerPush value`, `PosFreeze x/y`, and `ScreenBound value/movecamera` now record resolved typed telemetry through required traces.
- Current proof: `RuntimeHitFallControllerWorld` owns bounded passive `HitFallVel`, `HitFallDamage`, and `HitFallSet` mutation from typed `hitfall:*` operations or raw controller params, with focused `HitFallControllerSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeStateTypeWorld` owns bounded passive `StateTypeSet` `stateType` / `moveType` / `physics` setup from typed `metadata:statetypeset` operations or raw controller params, with focused `StateTypeSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeDamageScaleWorld` owns bounded passive `AttackMulSet` and `DefenceMulSet` multiplier setup from typed `damage-scale:*` operations or raw controller params, with focused `DamageScaleSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeHitDefenseWorld` owns bounded passive `HitBy`, `NotHitBy`, and `HitOverride` slot setup/removal from typed `eligibility:*` / `hitoverride` operations or raw controller params, with focused `HitDefenseSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeReversalWorld` owns bounded ReversalDef activation, active counter detection, and counter-result mutation consumed by direct HitDef contact paths, with focused `ReversalSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeProjectileCombatWorld` owns bounded projectile contact/reject/HitOverride/hit-or-guard/cleanup mutation plus projectile clash trade/cancel/decrement mutation consumed by `RuntimeEffectActorWorld`, with focused `ProjectileCombatSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeContactPresentationWorld` owns bounded direct `HitDef` and `Projectile` contact presentation package emission consumed by `PlayableMatchRuntime`, with focused coverage proving direct hit and projectile guard packages share contact metadata across sound/spark telemetry while preserving authored spark offsets and selected asset-frame offset/duration handoff.
- Current proof: `RuntimeEffectSpawnWorld` owns bounded Explod/Helper/Projectile spawn resolution, RemoveExplod dispatch, and ModifyProjectile dispatch consumed by `PlayableMatchRuntime`, with focused `EffectSpawnSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEffectLifecycleWorld` owns bounded active-effect tick, presentation tick, paused presentation tick, effect snapshot grouping, shared get-hit cleanup orchestration, and explicit lifecycle opponent-list conversion into helper-local roster data consumed by `PlayableMatchRuntime`, `RuntimeDirectCombatWorld`, `RuntimeHitOverrideWorld`, `RuntimeReversalWorld`, `RuntimeMatchInteractionWorld`, `RuntimePausedMatchWorld`, and `RuntimeHitPauseWorld`, with focused lifecycle and bridge coverage and unchanged trace behavior expected.
- Current proof: `RuntimeEffectActorAdvanceWorld` owns bounded effect-actor advance ordering inside `RuntimeEffectActorWorld`: active effects advance Helpers before Projectiles, paused presentation advances Helpers before Explods, and normal presentation advances Explods without ticking Helpers, with focused `EffectActorSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeMatchInteractionWorld` owns bounded post-fighter interaction ordering for target-memory aging, active-effect advance, explicit one-opponent lifecycle roster source forwarding, projectile clash, body separation, target bindings, direct priority/direct combat, projectile combat, stage clamp, and presentation-effect advance. It now also exposes `advanceRuntime(...)` as the concrete normal-loop runtime bridge for the target/effect/constraint/projectile-clash parts of that order, with focused `MatchInteractionSystem` coverage and stable trace behavior expected.
- Current proof: `RuntimeContactMemoryWorld` now owns bounded direct/projectile contact-memory creation, reset, mutation, and readback consumed by `PlayableMatchRuntime`, `RuntimeDirectCombatWorld`, and `RuntimeReversalWorld`, with focused `ContactMemorySystem`, `DirectCombatSystem`, and `ReversalSystem` coverage and unchanged trace behavior expected.
- Current proof: `RuntimeRandomSystem` now owns deterministic sandbox-side random seed creation, LCG advance, controller-safe unit clamping, and fallback `VarRandom` unit derivation consumed by `PlayableMatchRuntime` and `StateControllerExecutor`, with focused system coverage and stable `synthetic-imported-variable.json` checksum `3b33f7a8`.
- Current proof: `HitSparkAssetSystem` now owns bounded player/common/FightFX HitDef spark asset-frame resolution consumed by `PlayableMatchRuntime` before `RuntimeHitEffectWorld` event insertion, with focused system coverage and unchanged renderer behavior expected.
- Current proof: `RuntimeRecoverySystem` now owns bounded `fall.recovertime` countdown, Common1 liedown recovery countdown/defaulting, and imported `5201 -> 52` ground-recovery landing hooks consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeTargetWorld.applyBindToTargetController` now owns bounded `BindToTarget` lookup, raw/typed postype parsing, duration binding, facing-aware position application, and operation reporting; `PlayableMatchRuntime` only supplies target size anchors and evidence callbacks.
- Current proof: `RuntimeTargetWorld.applyTargetBindings` / `applyBindToTarget` now own bounded active `TargetBind` target-position application and active `BindToTarget` owner-position application; `PlayableMatchRuntime` delegates the same interaction-order callbacks without changing behavior.
- Current proof: `RuntimeTargetWorld.resolveCandidates` now owns bounded target-candidate filtering from live target memory before current Target* / BindToTarget controller application and active TargetBind / BindToTarget position application; focused `TargetSystem` coverage proves actor-id and target-id filtering plus mutation only against remembered targets.
- Current proof: `RuntimeHitEligibilityWorld` now owns bounded `HitBy`/`NotHitBy` slot ticking plus per-frame `AssertSpecial`/render-opacity reset consumed by `PlayableMatchRuntime`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeOrientationWorld` now owns bounded auto-facing and `Turn` facing flips consumed by `PlayableMatchRuntime` and `StateControllerExecutor`, with focused system coverage and unchanged trace behavior expected.
- Current proof: `RuntimeGuardWorld` now owns bounded guard-hit state selection plus auto guard-start eligibility/mutation consumed by direct combat, projectile combat, and the match loop, with focused system coverage and stable trace behavior.
- Current proof: `RuntimeGetHitStateWorld` now owns bounded default get-hit state selection consumed by imported direct and projectile hit routes, with focused system coverage and stable trace behavior.
- Current proof: `RuntimeHitStateTransitionWorld` now owns bounded direct-hit and ReversalDef state-transition routing for `p1stateno`, `p2stateno`, and `p2getp1state`, with focused system coverage and stable trace behavior.
- Current proof: `RuntimeStateAvailabilityWorld` now owns bounded state/action availability lookup consumed by current state-entry validation routes, with focused system coverage and stable trace behavior.
- Current proof: `RuntimeStunWorld` now owns bounded hitstun/guardstun timer advance plus the former match-loop glue for hitstun presentation requests, imported hit-state moveType preservation, current-move guardrails, and non-imported idle moveType restoration, with focused system coverage and stable trace behavior.
- Move one mutable runtime area behind a named world/system boundary without changing behavior: deeper helper/projectile/explod VM lifecycle, helper-owned combat/effect ordering, deeper target ownership, deeper audio semantics beyond package emission, or the next slice after `RuntimeCombatResolutionWorld`.
- Gate ownership through existing trace fields where possible rather than adding new UI.

Acceptance:

- Existing checksums either stay stable or drift is intentional and documented.
- Focused unit tests cover boundary contract.
- No new compatibility claim unless trace proves behavior.

### S1 - Studio Evidence/Build Trust Chain

Issue: `.scratch/roadmap/issues/02-studio-evidence-workflow.md`

Build next:

- Current proof: package/source Trust Chain rows can target concrete `package-file` and `source-file` rows from existing export/project metadata, and smoke verifies visible destination focus through the bridge and DOM.
- Add deeper target-specific trace, asset, gate, and report row jumps after the focused Trust Chain row has identified the selected package, source, trace, asset, or gate record.
- Keep every Trust Chain row tied to trace/report/runtime/project data already produced by the app.

Acceptance:

- Browser visual QA with `pnpm qa:smoke`.
- Screenshot/diagnostic inspection confirms no decorative green status.
- Docs update `docs/INTERFACE_SYSTEM.md` and this board if workflow meaning changes.

### A1 - Generated Asset Provenance And QA

Issue: `.scratch/roadmap/issues/03-generated-assets-pipeline.md`

Build next:

- T28 is closed at bounded scope: Nova Boxer asset-permission/v0, public path
  hygiene, stable source/output digests, Studio provenance, and ZIP checks pass.
- Next asset cut: define AssetReleasePolicy/v0 separately; keep unknown/stale
  permission, license, QA, collision, playtest, transform, and digest evidence
  fail-closed.
- Store source prompt, source image/sheet path, atlas manifest, contact sheet/GIF, collision/action data, and QA report links in one record.
- Add motion/scale/baseline QA status that can fail generated walk/crouch/jump frames.

Acceptance:

- Bad locomotion requires source regeneration, not atlas cropping.
- Studio shows QA state and next action.
- Generated/native assets remain separate from imported MUGEN compatibility scores.

### I1 - IKEMEN Reference Expansion

Issue: `.scratch/roadmap/issues/04-ikemen-scan-and-reference.md`

Build next:

- Current proof: `IkemenFeatureScanner` recognizes source-mapped character `fightfx.prefix` metadata, runtime carries that metadata into bounded F-prefixed FightFX hit-spark and hit-sound trace events, and character `[Files] fx` packages can be loaded/selected by matching FightFX prefix for runtime spark frames plus prefixed SND lookup. Full `sys.ffx` lifetime/refcount/cache semantics, exact channel fallback, exact visual/audio parity, general ZSS `[Statedef ...]` / `[State ...]` execution outside T427's character-state subset, IKEMEN-GO data ZSS presentation/text-system controllers `LifeBarAction`, `GameMakeAnim`, `Text`, `ModifyText`, `RemoveText`, and `RedLifeSet`, plus the text-count trigger `NumText`, remain scanner-only unsupported findings with focused scanner coverage.
- Map more Ikemen-GO source/docs signals into scanner-only findings.
- Keep every finding classified as recognized, unsupported, or unknown unless runtime execution is gated.

Acceptance:

- Scanner tests prove the new signals.
- Docs keep MUGEN 1.0, MUGEN 1.1, IKEMEN scan-only, and IKEMEN runtime future work separate.

### M1 - Shared Contract Readiness

Issue: `.scratch/roadmap/issues/05-modular-engine-boundaries.md`

Build next:

- Current proof: `pnpm check:boundaries` runs `scripts/check_boundaries.cjs` and guards future `src/core/**`, future platformer module paths, and `src/engine/**` shared contracts against fighting/MUGEN leakage outside explicit boundary registries; `runtime-manifest/v0` also exports this proof command as `contracts.verificationCommands.boundary`.
- Identify one shared contract candidate from project, asset, input, tick, snapshot, render, audio, debug, build, or QA.
- Prove it is not importing CNS, CMD, HitDef, rounds, helpers, targets, or MUGEN command routing.

Acceptance:

- Docs or boundary tests show what is shared vs fighting-specific.
- `pnpm check:boundaries` passes for any shared/module boundary move.
- No platformer runtime begins until fighting smoke/trace gates remain stable.

## Progress Update Rules

Update these files when a package moves:

| Change type | Required docs |
| --- | --- |
| Support level or compatibility behavior | `docs/SUPPORTED_FEATURES.md`, `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/QA_AND_ACCEPTANCE_GATES.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, relevant issue. |
| Score or answer to "0 to 100" changes | `docs/PORT_COMPLETION_SCORECARD.md`, `docs/PROGRESS_TRACKER.md`, this board. |
| Release target or usable-milestone wording changes | `docs/ROADMAP_RELEASE_TARGETS.md`, `docs/PROGRESS_TRACKER.md`, this board. |
| Studio workflow meaning changes | `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, `docs/PROGRESS_TRACKER.md`, relevant issue. |
| Generated asset pipeline changes | `docs/GENERATED_ASSET_QA_CONTRACT.md`, `docs/ENGINE_STUDIO_ROADMAP.md`, relevant issue. |
| Modular boundary moves | `docs/MODULE_BOUNDARY_CONTRACT.md`, `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`, relevant issue. |

## Agent Handoff Contract

Before closing a round:

- State exact files changed.
- State checks run.
- State why `pnpm qa:trace` or `pnpm qa:smoke` was or was not required.
- State whether the round was docs-only/setup and therefore had no score movement.
- Do not mark an issue done unless evidence exists and docs name the blocked scope.
- Do not raise scores from docs-only changes.

Use `docs/ROADMAP_PROGRESS_SYSTEM.md` for package lifecycle, update matrix, and the closeout template when a slice touches more than one doc family.

## Current Anti-Claims

- No full MUGEN/IKEMEN parity.
- No general ZSS/Lua execution.
- No rollback/netplay.
- No full helper/custom-state/throw VM.
- No full screenpack/lifebar engine.
- No public bundled commercial/third-party characters.
- No platformer/module runtime until fighting contracts stabilize.
