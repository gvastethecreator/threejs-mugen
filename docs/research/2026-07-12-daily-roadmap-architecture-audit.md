# Daily Roadmap And Architecture Audit

Date: 2026-07-12
Repository checkpoint: backlog entry 411; Wayfinder 105 is resolved in the current uncommitted working tree and Wayfinder 106 is ready
Pinned IKEMEN GO revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

After the active-root motion, presentation, stage-constraint, and diagnostic-collision gates landed, what is the smallest sequence that closes the current body-push risk, returns the primary product lane to MUGEN-lite, and prepares multi-root combat without widening the 1v1 transaction accidentally?

## Bottom Line

Wayfinder 105 closed concurrently during this audit. Entry 411 and its runtime report declare exact non-Tag pair preservation, tick-local diagnostics, schema alignment, 177 files / 1802 tests, TypeScript/build/boundaries/diff gates, and 543/543 traces. This automation did not re-run those suites; it verified that the final source shape resolves the three static blockers observed in the earlier dirty snapshot.

Return now to the already-ready R1 post-KO / `NoKOSlow` timeline. The long I2 sequence has reduced architecture risk, but MUGEN-lite remains the declared usable milestone. Wayfinder 106 may proceed as bounded research in parallel; its executable follow-up should be a combat-candidate/order read model before any P3-P8 damage mutation. Current combat is a pair transaction with one pair-wide priority clash, pair target/guard/effect routing, and a single `hasHit` latch; repeating it across roots would not reproduce the pinned getter-centric order safely.

No score moves in this research/docs pass.

## Changes Since The 2026-07-11 Audit

- 62 runtime/research commits landed after the previous automation timestamp.
- Root participation, plural activation/selection, standby CNS, Tag/Helper ownership, side command routing, active-root motion, body/shadow/camera presentation, actor-local stage constraints, and diagnostic collision projection are now closed bounded gates.
- The repository declares 543/543 trace artifacts at entry 409/407-era evidence; this run did not re-run them.
- Backlog entry 411 now closes Wayfinder 105 in the working tree and selects Wayfinder 106 hit-admission research. No commit was made by this automation.
- `ROADMAP_PACKAGE_MILESTONES`, `NEXT_BUILD_ROADMAP`, the lower execution-board queues, issue 07, and parts of the scorecard still describe earlier inert-root or pre-collision frontiers.

## Transient 105 Risks And Final Resolution

| Risk found in the earlier dirty snapshot | Final source/report state | Audit status |
| --- | --- | --- |
| Non-Tag behavior drift | The plural callback is now supplied only when `tagTeamOrder` exists; legacy/unknown/Single retain `separateActors`. | Resolved statically; entry 411 reports pair/Single tests green. |
| Stale diagnostics | `lastRootBodyPush` is cleared at tick start and reset; pause/hitpause skip active post-fighter push. | Resolved statically; runtime report records reset/pause isolation. |
| Schema drift | Production and MatchWorld/unit expectations now agree on `RuntimeRootPhaseCapabilities/v3`. | Resolved statically; entry 411 reports the full suite green. |

The closeout remains uncommitted working-tree state at the audit cutoff. Preserve it and do not recreate or overwrite it.

## Gap Map By Horizon And System

| Horizon | Demonstrated now | Highest-value remaining gap | Claim ceiling |
| --- | --- | --- | --- |
| Private sandbox | 65/100; native/generated match, HUD, debug, trace/smoke discipline. | Preserve as a regression baseline while imported work grows. | Demoable private sandbox, not imported compatibility. |
| MUGEN-lite | 35/100 practical, 20/100 MVP. | Post-KO/`NoKOSlow`, then one end-to-end legal MUGEN-format fixture route covering common movement/combat/recovery with unsupported gaps visible. | Partial KFM/Common1-style compatibility only. |
| Broad MUGEN | 10-12/100 full-engine horizon. | VM/tick breadth, multi-target combat, helpers/projectiles/explods, palettes/ACT, stage BGCtrl, audio, screenpacks, and a multi-package corpus. | No broad parity from controller counts or synthetic gates alone. |
| IKEMEN scanner | Recognized/unsupported/unknown findings exist. | One versioned VFS/package analyzer shared by character, stage, system, and screenpack inputs. | Detection/reporting only. |
| IKEMEN runtime | Bounded scheduling, Tag/Helper, topology, motion, presentation, constraints, diagnostic collision, and plural X/Width body push. | Combat candidate/order model, direct hit/hurt admission, root-key effects, team round/lifebar/resources. | No ZSS/Lua, rollback/netplay, full Tag/Simul/Turns, or broad parity. |
| Studio/product | Persistent local project fields and Build/Evidence Trust Chain exist. | Source identity/fingerprint, permissions, external conflict, write/reimport, invalidation, and rollback transaction. | Workbench/diagnostics, not a complete editor. |
| Assets/provenance | QA contract and native/imported separation exist. | Permission-aware, content-addressed `AssetProvenance/v0` connected to export readiness. | Unknown license or local path is not provenance. |
| Modular engine | Boundary checker and draft contracts exist. | One real Project/Evidence/Build contract with a production consumer and MUGEN adapter. | No platformer/runtime SDK from metadata-only registries. |

## Architecture Decisions Proposed

### A. Preserve the legacy pair path as a separate policy

Preferred: make plural body-push/combat ownership explicit only for the `ikemen-go` Tag path; preserve the previous pair callback for legacy/unknown/Single.

Alternative: run every profile through plural owners with two roots. This is conceptually uniform but changes validation, clamp, diagnostics, and failure behavior before parity is proven.

Tradeoff: the preferred option duplicates a small routing choice but gives a falsifiable compatibility boundary and safer rollback.

### B. Insert a combat-candidate/order contract before mutation

Preferred: publish `RuntimeRootCombatCandidates/v0` from stable runtime roots, with independent getter order and attacker candidates. Exclude standby/disabled roots on both axes, encode side/`affectteam` policy, and keep direct, Projectile, Helper, target, guard-distance, and presentation consumers separate.

Alternative: nested-loop all active attacker/defender pairs through the current 1v1 resolver. This is small code but conflicts with pinned IKEMEN ordering and current single-target `hasHit`/pair-priority assumptions.

Tradeoff: the read-model prefactor adds one no-score gate, but prevents order-dependent damage, double contacts, and accidental effect/target widening.

### C. Keep Studio and modular-engine progress conceptually separate

Preferred: retain the current score this run, but plan a later scorecard ADR that separates Studio product readiness from modular-engine extraction.

Alternative: keep the combined 25/100 row. It is compact but obscures the existing 25/100 Studio versus 10/100 modular evidence split.

## Prioritized Remaining Roadmap

1. Return to R1 post-KO / `NoKOSlow`, then close one end-to-end MUGEN-lite fixture journey.
2. Complete Wayfinder 106 as source/owner/adversarial research without runtime mutation.
3. Add the I2 combat-candidate/order read model, then one bounded direct-root contact gate. Keep Projectiles, Helpers, targets, and root effects blocked.
4. Introduce root-keyed effect stores before helper/projectile multi-root combat.
5. Add team defeat/replacement, lifebar, and resource-bank policies only after direct/effect ownership is stable.
6. In parallel, build the Studio source transaction; layer permission-aware asset provenance over it.
7. Advance I1 through a shared package/VFS analyzer, independently from I2 runtime.
8. Promote one real Project/Evidence/Build shared contract after Studio stabilizes it; platformer remains later.

## Next Tasks Ready For Future Agents

### 1. R1 post-KO / `NoKOSlow` timeline

- Scope: required KO versus time-over ordering and one explicit `NoKOSlow` policy; no motif/team/continue work.
- Acceptance: KO, time-over, suppression, and normal-speed negative paths are ordered and trace-visible.
- Evidence: focused round tests plus one required trace; stable existing KO sound/`NoKOSnd` gates.

### 2. Legal end-to-end MUGEN-lite fixture journey

- Scope: one repo-owned synthetic MUGEN-format package exercising idle, walk, crouch, jump, attack, guard, get-hit, fall, and recovery without commercial assets.
- Acceptance: one reproducible session reaches every route and reports unsupported syntax/features rather than hiding them.
- Evidence: package manifest, required trace sequence, compatibility report, and smoke only if visible assets change.

### 3. Complete Wayfinder 106 hit-admission research

- Scope: pin getter/attacker eligibility, ordering, team policy, Clsn, priority, guard-distance, target, and mutation ownership without runtime widening.
- Acceptance: owner map separates admission, mutation, targets, effects, round/resources, HUD/audio, and Helper/Projectile loops; adversarial cases and deletion criteria are explicit.
- Evidence: pinned-source note, local owner references, roadmap/issue handoff, diff gate only.

### 4. `RuntimeRootCombatCandidates/v0`

- Scope: read-only getter order and direct-attacker candidate matrix over stable roots; no damage mutation.
- Acceptance: standby/disabled exclusion, valid side/player identity, default enemy-only policy, deterministic id ties, legacy pair preservation, and no target/effect/projectile/helper admission.
- Evidence: table-driven tests and serialized diagnostic fixture; stable behavior traces.

### 5. One bounded P3 direct HitDef contact

- Dependency: task 4 closed.
- Scope: one active P3 direct attack against P2 under explicit Tag; no same-side/friendly-fire, multi-target, Projectile, Helper, or custom throw claim.
- Acceptance: accepted contact mutates exactly P3/P2; standby and same-side candidates reject; order is deterministic; 1v1 traces stay stable.
- Evidence: focused combat/priority tests plus required accepted/rejected/tie traces.

### 6. Studio source transaction v0

- Scope: source id/fingerprint, permission, external conflict, write, reimport, invalidation, rollback; undo/migration deferred.
- Acceptance: failure leaves prior project/source/build evidence coherent and offers one next action.
- Evidence: service/model tests plus desktop/mobile smoke and visual inspection.

### 7. `AssetProvenance/v0`

- Dependency: source identity/permission concepts from task 6.
- Scope: ownership/license, input/tool/config/transform/output digests, QA/playtest links, public-path redaction.
- Acceptance: missing permission or digest blocks export readiness; no absolute local path leaks.
- Evidence: validator tests, manifest snapshot, Studio smoke if surfaced.

### 8. IKEMEN package/VFS analyzer v0

- Scope: shared character/stage/system/screenpack entry with source location, dependency, pinned profile/version, and recognized/unsupported/unknown result.
- Acceptance: at least one stage-only and one system/screenpack-only fixture; no runtime claim.
- Evidence: focused scanner/report tests and snapshots.

### 9. Real Project/Evidence/Build shared contract

- Dependencies: Studio transaction stable; boundary checker green.
- Scope: one production consumer, one MUGEN adapter, keep/delete rationale, stronger forbidden-import gate.
- Acceptance: no CNS/CMD/HitDef/Common1/round/helper/target leakage into shared core.
- Evidence: contract tests, `pnpm check:boundaries`, stable fighting traces/smoke as applicable.

## Verified Source Facts

1. Pinned IKEMEN player hit detection rejects a standby or disabled getter and skips standby or disabled attackers; attacker admission also applies `affectteam`: [player hit loop](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13207-L13229).
2. Collision detection sorts getter processing by ReversalDef, then HitDef, then stable id; push runs before player hits, followed by Projectile hits: [collision ordering](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13879-L13931).
3. Pinned player contact checks juggle/target history, hit eligibility, Z depth, Clsn contact, and hit-result policy before mutation: [player contact gate](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13283-L13316).
4. Projectile/player contact is a separate loop with owner, team, guard distance, platform, juggle, collision, and one-projectile-per-frame policy: [Projectile loop](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13434-L13620).
5. Elecbyte defines HitDef contact through Clsn1 versus opponent Clsn2, default `affectteam = E`, and priority/tie classes that can trade or suppress hits: [State Controller Reference](https://www.elecbyte.com/mugendocs/sctrls.html#hitdef).

## Inferences And Open Questions

- Inference: a getter-centric diagnostic is safer than reusing current pair priority mutation because upstream order and local `hasHit` semantics are not isomorphic.
- Inference: the MUGEN-lite return gate should precede more I2 mutation because the documented usable milestone has not changed.
- Open: whether current local `hasHit` should become per-HitDef target memory before any multi-target root gate.
- Open: exact adaptation of ReversalDef/HitDef ordering versus Elecbyte pair priority classes when three or more direct roots contact in one tick.
- Open: which evidence threshold should move the IKEMEN 6-8/100 band; bounded ownership/read models alone should not.
- Open: whether Studio and modular-engine scores should be split by ADR in a later planning run.

## No-Code Statement

This note and its roadmap synchronization change documentation only. No source, runtime, UI, test, fixture, asset, commit, or remote state is part of this automation.
