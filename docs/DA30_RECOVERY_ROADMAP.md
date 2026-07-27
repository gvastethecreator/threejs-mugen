# DA30 recovery and completion roadmap

Last updated: 2026-07-27

This plan follows the DA29 completion audit. It contains 120 small cuts in 12
waves. DA29 artifacts remain candidate inputs. A DA29 closeout earns no task
credit until a DA30 semantic revalidation names the clauses it proves.

## Use contract

- `[R]` research, `[A]` architecture/control, `[I]` implementation, `[G]`
  evidence gate.
- Complete dependencies before the task unless the task says it can run in
  parallel.
- Close every acceptance clause with revision-matched evidence. File existence,
  source text searches, non-empty result objects, and self-reported green flags
  cannot close a task.
- Record scope, inputs, command or route, expected failure, output, commit,
  digest, environment, result, allowed claim, and blocked claims.
- Reuse existing issue contracts and closed bounded behavior. Do not rebuild a
  closed runtime slice to satisfy an evidence task.
- Keep current HEAD, formal/global, focal, visual/product, source, release, and
  backlog cursors separate.
- Use repository-authored, generated, or clearly permitted fixtures. Keep
  commercial and third-party assets outside the repo.

## Dependency spine

1. DA30-001…010 repair control authority.
2. DA30-011…020 repair semantic acceptance and revalidate the first candidates.
3. DA30-021…030 establish current formal, product, performance, renderer, and
   security facts.
4. DA30-031…070 close playable and compatibility routes from small deterministic
   units through a bounded MUGEN milestone.
5. DA30-071…100 close Studio, assets, scanner, and bounded IKEMEN lanes.
6. DA30-101…110 prove reusable boundaries, a second consumer, CLI, and CI.
7. DA30-111…120 run product quality, release, score, and independent review.

## Wave 0 — Control recovery and DA29 adjudication

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-001 `[A]` | Publish the DA29 audit hold. Depends on the 2026-07-27 audit. Systems: selector doc, execution board, tracker, workplan, navigation, issues. | Every current view marks DA29-200 unaccepted, names the preserved pins and held scores, and points to DA30. Proof: reference audit with zero stale “queue empty/DA29 complete” current claims. Allows control hold only. |
| DA30-002 `[R]` | Build a 200-row DA29 verdict ledger. Depends on DA30-001. | Each ID records acceptance clauses, artifact, producer, revision, validator class, live consumer, verdict, preserved fact, missing proof, and carryover ID. Proof: schema check plus manual samples from all 20 waves. Allows audit inventory only. |
| DA30-003 `[A]` | Choose one source model for current queue, scores, and independent cursors. Depends on DA30-001. | ADR compares one checked input, event ledger plus projection, and paired generators; chooses ownership, edit flow, failure rule, history, and migration. Proof: decision with alternatives and rollback. Allows control design only. |
| DA30-004 `[I]` | Generate selector and roadmap cursor from the chosen source. Depends on DA30-003. | A fixture pin or queue change updates both outputs; current files agree byte-for-byte on shared fields; stale DA27 constants fail. Proof: focused positive and negative tests plus generated diff. Allows synchronized controls only. |
| DA30-005 `[G]` | Audit every current control reference. Depends on DA30-004. | Scanner covers docs, issues, evidence indexes, backlog heads, and generated files; marked history is exempt; stale queue, score, formal, visual, product, and source facts fail. Proof: six negative fixtures. Allows reference consistency only. |
| DA30-006 `[A]` | Define closeout state transitions. Depends on DA30-002 and 003. | Schema defines proposed, active, blocked, partial, candidate, accepted, superseded, and rejected states; only accepted advances a watermark. Proof: transition table and invalid transition cases. Allows status semantics only. |
| DA30-007 `[I]` | Add revision/freshness rules to closeouts. Depends on DA30-006. | Closeout records implementation SHA, evidence SHA, producer SHA, input digests, dirty exclusions, and valid inheritance; mismatched or post-gate product changes mark stale. Proof: current CSS-after-gate fixture fails. Allows freshness evaluation only. |
| DA30-008 `[G]` | Reconcile DA29-002/003/004/005/007 as historical evidence. Depends on DA30-002 and 007. | Report preserves exact proven facts, rejects missing counts/focus/commit/current-state claims, and maps each missing clause to DA30. Proof: signed verdict rows and artifact digests. Allows historical bounded facts only. |
| DA30-009 `[A]` | Compact current roadmap surfaces. Depends on DA30-004 and 006. | Ownership map names one current selector, one execution view, append-only backlog, master plans, generated summaries, and archive policy. Proof: no current fact requires edits in more than its named owner and projections. Allows doc design only. |
| DA30-010 `[G]` | Gate the control recovery. Depends on DA30-002…009. | One report proves shared controls agree, all 200 DA29 verdict rows exist, current docs link DA30, old claims are historical, and scores stay held. Proof: command log, counts, diffs, and reviewer checklist at one SHA. Allows DA30 queue adoption only. |

## Wave 1 — Semantic acceptance and evidence integrity

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-011 `[A]` | Define `TaskAcceptanceManifest/v1`. Depends on DA30-006. | Each clause has ID, evidence kind, producer, assertion, expected failure, revision policy, environment, and claim. Alternatives include code-owned and doc-owned manifests. Proof: ADR plus JSON schema. Allows acceptance design only. |
| DA30-012 `[I]` | Implement manifest validation. Depends on DA30-011. | Validator rejects missing clauses, duplicate IDs, unknown evidence types, empty assertions, absent negative cases, and claim widening. Proof: table tests and malformed fixtures. Allows manifest shape and invariant claims only. |
| DA30-013 `[A]` | Define observation, gate, adjudication, and claim artifacts. Depends on DA30-011. | Contracts forbid an observation from declaring its own acceptance; gate outputs cite observations; adjudication cites gates; claims cite adjudication. Proof: type/schema map and invalid-edge examples. Allows evidence architecture only. |
| DA30-014 `[I]` | Build evidence lineage validation. Depends on DA30-013 and DA30-007. | Every edge verifies artifact digest, producer version, subject revision, environment, target clause, and freshness; cycles fail. Proof: valid DAG plus tamper, stale, missing, and circular fixtures. Allows lineage integrity only. |
| DA30-015 `[A]` | Define reviewer identity and independence. Depends on DA30-013. | Policy records author, runner, reviewer, tool/agent provenance, conflict, review time, and changed facts; same-author review stays labeled self-review. Proof: accepted and rejected examples. Allows review provenance only. |
| DA30-016 `[I]` | Capture raw command gates. Depends on DA30-014. | Runner records command, cwd, env allowlist, tool versions, start/end/duration, stdout/stderr digest, exit, warnings, counts, and SHA; reconstruction from summaries fails. Proof: passing and failing command fixtures. Allows recorded-command facts only. |
| DA30-017 `[I]` | Generate browser evidence facts. Depends on DA30-014. | Runner records route, query/state, browser/version, OS, viewport, DPR, input, commit, screenshot/video/trace digest, console/page errors, focus checks, and result. Proof: one green and one forced-error route. Allows named route facts only. |
| DA30-018 `[I]` | Require failure-path evidence. Depends on DA30-012…017. | Each I/G manifest declares at least one rejection, malformed, stale, missing, permission, or recovery case where relevant; reused success evidence cannot satisfy it. Proof: validator negative fixtures. Allows failure-evidence coverage only. |
| DA30-019 `[I]` | Compile claims from passed clauses. Depends on DA30-012 and 014. | Allowed claims are an explicit intersection of passed clauses and task ceiling; absent or stale clauses block the claim; scores and release need their own adjudication. Proof: widening and stale tests. Allows machine-derived claim ceilings only. |
| DA30-020 `[G]` | Pilot semantic revalidation on DA29-012, 013, 041, and 072. Depends on DA30-012…019. | Four manifests run against existing artifacts; each clause receives pass/fail/unknown; missing proof creates DA30 carryover without changing scores. Proof: clause reports and manual review. Allows only passed clause claims. |

## Wave 2 — Current formal, browser, performance, renderer, and security baseline

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-021 `[G]` | Run a current raw formal/global gate. Depends on DA30-010 and 016. | Typecheck, full Vitest, aggregate traces, build, both boundary checks, and required QA scripts run at one clean SHA with exact counts, versions, durations, warnings, exits, and raw-log digests. Allows formal/global at that SHA only. |
| DA30-022 `[A]` | Set warning and flaky-test policy. Depends on DA30-021. | Inventory classifies compiler, test, build, browser, WebGL, accessibility, and deprecation warnings; owners, fatal lanes, quarantine, retry limits, and expiry are set. Proof: decision matrix. Allows policy only. |
| DA30-023 `[R]` | Inventory real product routes and states. Depends on DA30-001 and linked issues. | Machine-readable manifest lists Play, Inspect, Studio, import, save/write, select, error/recovery, desktop/mobile, and user role with exact setup and expected state. Proof: owners and omissions. Allows route inventory only. |
| DA30-024 `[G]` | Gate the core Play route. Depends on DA30-017, 021, and 023. | Browser journey loads exact packages/stage, starts combat, executes input/contact/round reset, checks canvas/HUD/focus, and records zero unexpected console/page errors at one SHA. Proof: trace, screenshots, facts. Allows one Play route only. |
| DA30-025 `[G]` | Gate Studio and Inspect routes. Depends on DA30-017, 021, and 023. | Browser journeys open a project, inspect source/capability facts, preview, attempt valid/invalid save, retain work, and return safely. Proof: desktop/mobile captures, focus log, state facts, errors. Allows named routes only. |
| DA30-026 `[G]` | Gate keyboard, gamepad, focus, and mobile input. Depends on DA30-024/025 and input policy work. | Matrix covers tab order, focus loss, held key, gamepad disconnect/reconnect, two seats, touch/mobile controls, reduced motion, and recovery. Proof: event log and visible status. Allows tested inputs/devices only. |
| DA30-027 `[G]` | Build a frame-gap harness. Depends on DA30-024 and 022. | Worst owned route records p50/p95/p99/max frame gaps, FPS, long tasks, seed, warmup, sample count, browser, CPU/GPU, draw calls, and memory; thresholds and breach owner are explicit. Allows measured device/route facts only. |
| DA30-028 `[G]` | Re-run renderer resource baselines. Depends on DA30-024/025 and 027. | Five distinct route setups record defined-frame calls/primitives/programs/geometries/textures, `info.autoReset` policy, before/after teardown, and repeated-cycle deltas. Proof: route URLs/state differ and teardown calls dispose. Allows route resource facts only. |
| DA30-029 `[G]` | Gate renderer lifecycle failures. Depends on DA30-028. | Repeated route swaps, resize, DPR change, hidden tab, context loss/restore, project reopen, and failed asset load keep bounded resources and recover visibly. Proof: browser facts, deltas, heap/GPU proxies, errors. Allows tested lifecycle claims only. |
| DA30-030 `[G]` | Run local security and trust boundary baseline. Depends on DA30-021 and 023. | Audit covers archive traversal, URLs, blobs, file handles, storage, CSP needs, unsafe eval, worker messages, export paths, secrets, and dependency scripts. Proof: threat list and negative probes. Allows local boundary findings only. |

## Wave 3 — Input, clock, state, replay, and rollback feasibility

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-031 `[A]` | Reconcile input authority. Depends on DA30-023 and existing MatchInputPolicy contracts. | ADR names seat ownership, UI/game focus, keyboard/gamepad/touch merge, edge/hold order, demo/replay priority, disconnect, and deterministic sample point. Proof: conflict table. Allows input design only. |
| DA30-032 `[I]` | Close gamepad lifecycle gaps. Depends on DA30-031. | Tests and browser route cover mid-hold unplug, stale release, changed index reconnect, non-standard mapping failure, two seats, keyboard fallback, and visible status. Allows listed lifecycle routes only. |
| DA30-033 `[I]` | Persist input/SOCD profiles by seat. Depends on DA30-031/032. | Reopen, migration, reset, seat swap, corrupt profile, and replay metadata prove stable ownership and fail-safe defaults. Proof: storage and match snapshots. Allows versioned profile behavior only. |
| DA30-034 `[I]` | Produce a canonical per-frame input log. Depends on DA30-031 and evidence envelope. | Log stores sampled state, edges, seat map, policy revision, device class, focus, tick, and checksum; same seed/route yields identical canonical bytes. Proof: repeat and mutation tests. Allows input-log determinism only. |
| DA30-035 `[A]` | Assign deterministic RNG streams. Depends on DA30-034. | ADR separates gameplay, AI, visual, audio, and asset streams with seed derivation, snapshot/reset, and forbidden cross-use. Proof: owner map and planned tests. Allows RNG ownership design only. |
| DA30-036 `[R]` | Audit clock domains against pinned sources. Depends on DA30-020 and source epoch. | Map covers normal time, pause, superpause, hitpause, input buffers, animation, effects, audio, round, UI, and replay per profile; open order questions stay explicit. Allows timing research only. |
| DA30-037 `[A]` | Define canonical match-state serialization. Depends on DA30-035/036. | Versioned schema lists every deterministic owner, exclusion, ordering, float policy, unknown-version behavior, migration, and SHA-256 bytes. Proof: ownership census. Allows snapshot design only. |
| DA30-038 `[I]` | Round-trip and restore match state. Depends on DA30-037. | Native route snapshots/restores roots, helpers, projectiles, effects, inputs, clocks, RNG, targets, team and round state; unknown/corrupt data fails atomically. Proof: equality and failure tests. Allows named snapshot route only. |
| DA30-039 `[G]` | Record/replay one full round. Depends on DA30-034 and 038. | Periodic and final checksums, controller telemetry, contacts, winner, resources, and frame count match; mutation reports first divergent owner/frame. Proof: required trace and deterministic rerun. Allows one replay route only. |
| DA30-040 `[R]` | Run an offline rewind/resim feasibility spike. Depends on DA30-039. | Measure snapshot size, restore time, resim time, memory, divergence, unsupported owners, and frame budget across three rewind depths. Proof: report and raw samples. Allows feasibility data; blocks rollback/netplay readiness. |

## Wave 4 — Combat, controllers, helpers, projectiles, camera, and reset

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-041 `[G]` | Revalidate Nova contact semantically. Depends on DA30-020, 021, and 039. | Imported command reaches authored state and collision; HitDef admission, contact, damage, hitpause, target state, telemetry, final checksum, miss, guard, and malformed routes are asserted. Allows this package route only. |
| DA30-042 `[G]` | Revalidate reciprocal Mira contact/guard. Depends on DA30-041. | Distinct authored CMD/CNS/AIR path proves Mira attack, Nova hit/guard, damage/chip/power/pause, failure, replay, and browser correlation. Allows reciprocal route only. |
| DA30-043 `[G]` | Validate the independent Rook package. Depends on DA30-041 and provenance gate. | Permission, distinct syntax, asset digests, import, command, animation, collision, contact, malformed variants, reset, and replay pass. Proof compares syntax family with Nova/Mira. Allows one third native family only. |
| DA30-044 `[G]` | Gate guard, priority, trade, fall, and recovery matrix. Depends on DA30-041…043. | Named cases assert high/low/air guard, chip, priority/type, simultaneous trade, miss, fall, bounce, recover/no-recover, landing, pause, and deterministic order. Allows listed cases only. |
| DA30-045 `[I]` | Execute a real nested Helper journey. Depends on DA30-037 and existing Helper issue contracts. | Repository fixture spawns Helper, routes its command/state, resolves parent/root redirects, creates owned effect, destroys cleanly, resets, snapshots, and replays; zero-controller evidence fails. Allows one Helper journey only. |
| DA30-046 `[G]` | Gate plural projectile lifecycle and clash. Depends on DA30-041 and existing projectile schedule. | Three owners plus Helper cover spawn, move, hit, clash/cancel, affect-team, depth, removal, pause, reset, snapshot, and stable global order. Proof includes rejected same-side and stale-owner cases. Allows named matrix only. |
| DA30-047 `[I]` | Execute one atomic throw/custom-state route. Depends on DA30-037, 041, and existing ownership ADRs. | Success, miss, interruption, invalid target, KO, reset, snapshot, and replay prove atomic target/state/bind ownership. Failure cannot strand either actor. Allows named throw route only. |
| DA30-048 `[G]` | Reconcile camera, stage, screen, and player bounds. Depends on DA30-024 and 041. | Browser/runtime route covers follow, zoom policy, edge widths, ScreenBound/StageBound, corner pressure, shake, reset, resize, localcoord, and runtime/render correlation. Allows named stage/camera route only. |
| DA30-049 `[G]` | Prove round and match cleanup. Depends on DA30-044…048. | Ledger asserts clear/persist behavior for hits, binds, targets, pauses, effects, helpers, projectiles, inputs, vars, power, team state, camera, audio, and renderer resources across round/match reset. Allows reset ledger only. |
| DA30-050 `[G]` | Publish controller and trigger support from proof. Depends on DA30-012, 041…049, and source pins. | One registry separates parse, compile, execute, branch, trace, browser, profile, failure, and source-review states; docs and scanner consume it; no row derives support from name presence. Allows registry facts only. |

## Wave 5 — Selection, modes, teams, FightScreen, animation, and audio

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-051 `[I]` | Build exact character/stage selection state. Depends on DA30-023, 043, and 048. | Data model enforces legal, blocked, missing, duplicate, profile, palette, stage, seat, and revision choices; selected package IDs feed launch without fallback substitution. Proof: state tests. Allows selection model only. |
| DA30-052 `[G]` | Gate selection in browser. Depends on DA30-026 and 051. | Keyboard/gamepad desktop/mobile journey chooses characters, palettes, order, stage, and profile; blocked/missing entries explain why; back/cancel/start preserve seat and exact revision. Allows one local versus flow only. |
| DA30-053 `[A]` | Define mode state machine. Depends on DA30-051 and existing mode docs. | ADR separates versus, arcade, team modes, demo/watch, training, survival, results, continue, and return paths; names shared and mode-owned state. Proof: transition and failure table. Allows mode design only. |
| DA30-054 `[I]` | Close bounded Simul/Tag/Turns team selection and handoff. Depends on DA30-052/053 and existing issue 07 gates. | One mode per team policy proves roster order, standby/active IDs, input owner, KO/handoff, resources, reset, replay, and unchanged 1v1. Allows exercised team routes only. |
| DA30-055 `[G]` | Gate FightScreen round presentation. Depends on DA30-024, 049, and source-backed FightScreen work. | Browser/runtime route proves fade, shutter, intro/fight timing, skip policy, announcements, timer/input gates, reset, mobile geometry, and exact source assets. Allows named FightScreen subset only. |
| DA30-056 `[I]` | Reconcile lifebar/HUD ownership. Depends on DA30-049, 054, and 055. | HUD reads exact actor/team/resource owner for life, power, guard/stun/red life, timer, rounds, combo, and team slots; stale/standby/missing owners fail visibly. Allows named HUD fields only. |
| DA30-057 `[G]` | Gate audio dispatch and lifecycle. Depends on DA30-024, 049, and owned audio fixtures. | Gesture unlock, player/common/system banks, channels, hit cancel, KO, BGM, mute/volume, missing archive, route swap, reset, and post-mixer nonzero output are measured. Heard/perceptual parity stays blocked. |
| DA30-058 `[G]` | Gate animation, palette, sprite, and effect ownership. Depends on DA30-043, 046, and 049. | AIR/SFF/ACT routes cover authored frames, loop/interpolation policy, palette choice, effect sprite bank, shadow/order, missing resources, reset, and browser correlation. Allows named asset routes only. |
| DA30-059 `[I]` | Execute Common CNS/Fx/FightFX ownership. Depends on DA30-050, 055, 057, and source review. | One route resolves character/common state, FightFX animation, Common.Fx sound, missing bank failure, source provenance, profile, reset, and replay without silent local fallback. Allows selected common resources only. |
| DA30-060 `[G]` | Run the playable sandbox product matrix. Depends on DA30-041…059. | Desktop/mobile Play, selection, one team route, FightScreen, audio signal, camera, reset, error/recovery, focus, frame gaps, renderer resources, and zero unexpected errors share one SHA. Allows playable sandbox milestone only. |

## Wave 6 — MUGEN-lite and MUGEN breadth

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-061 `[R]` | Rebuild lawful package/stage corpus inventory. Depends on DA30-002, provenance rules, and issue history. | Rows classify repository-authored, generated, portable legal, optional private, and forbidden inputs; record package identity, profile, feature density, route, permissions, and expected failure. Allows corpus inventory only. |
| DA30-062 `[I]` | Add unsupported-heavy repository fixtures. Depends on DA30-061 and source census. | Small authored fixtures isolate at least ten high-risk controller/trigger/format families with valid, malformed, unknown, and profile-mismatch variants; provenance is complete. Allows fixture breadth only. |
| DA30-063 `[G]` | Run parser/compiler mutation corpus. Depends on DA30-050 and 062. | Mutations cover casing, whitespace, duplicates, sections, numbers, strings, comments, includes, redirects, coercion, malformed bytes, and limits; diagnostics have locations and no crashes. Allows tested syntax resilience only. |
| DA30-064 `[A]` | Define archive and package profile policy. Depends on DA30-030, 061, and scanner work. | ADR covers ZIP/path rules, DEF roots, encodings, case, duplicates, size/count/depth caps, URLs, nested archives, profile detection, and quarantine. Allows import policy only. |
| DA30-065 `[I]` | Execute DEF/system/config dependency graph. Depends on DA30-064. | Resolver loads exact character, stage, motif, common, sound, font, and palette edges with canonical paths/digests; missing, cycle, ambiguity, traversal, and profile mismatch fail. Allows named graph subset only. |
| DA30-066 `[G]` | Gate CMD/AI breadth. Depends on DA30-050, 062, and deterministic input. | Matrix proves command parsing, buffering, priority, hold/release, AI levels, random stream, state choice, invalid expressions, pause/reset, and replay for named cases. Allows tested CMD/AI subset only. |
| DA30-067 `[R]` | Audit motif, screenpack, lifebar, and storyboard families. Depends on DA30-061 and pinned references. | Source-backed matrix names formats, sections, assets, transforms, timing, modes, scanner state, runtime owner, and open risk; MUGEN and IKEMEN extensions stay separate. Allows research map only. |
| DA30-068 `[I]` | Execute one bounded motif/screenpack flow. Depends on DA30-052, 055, 056, 065, and 067. | Repository fixture proves title/select/versus/fight/results transitions, localcoord, fonts/sounds, missing assets, mobile fit, reset, and return. Allows one motif flow only. |
| DA30-069 `[G]` | Gate stage breadth. Depends on DA30-048, 058, 061, and 063. | At least three distinct owned stages cover localcoord, camera/bounds, normal/animated layers, parallax policy, BGCtrl subset, sound, resetBG, malformed and missing resources, resize, and browser facts. Allows named stage matrix only. |
| DA30-070 `[G]` | Adjudicate MUGEN-lite and practical-MUGEN milestones. Depends on DA30-060…069. | Independent review samples happy, unsupported-heavy, malformed, mutation, profile, product, performance, and failure routes; records denominators, accepted/rejected claims, gaps, scores, and next queue. Allows signed bounded milestones only. |

## Wave 7 — Studio storage, trust, authoring, preview, and export

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-071 `[A]` | Choose Studio storage authority. Depends on DA30-003, 030, and current IDB/file work. | ADR compares IndexedDB, file authority, and port-backed hybrid across consistency, offline, quota, permission, recovery, conflict, migration, backup, and browser support; one option is chosen. Allows storage design only. |
| DA30-072 `[I]` | Version the Studio project envelope. Depends on DA30-071. | Envelope records project/revision, source graph, edits, assets, scanner facts, profile, tool chain, evidence, timestamps, and migration; unknown/corrupt versions open read-only or fail safely. Allows project schema only. |
| DA30-073 `[I]` | Make save/write transactional. Depends on DA30-071/072. | Prepare, validate, commit, journal, rollback, cancel, quota, permission loss, worker failure, and crash-reopen routes leave either old or new coherent revision. Proof: fault injection. Allows named write paths only. |
| DA30-074 `[I]` | Handle edit conflicts and recovery. Depends on DA30-073. | Stale base, parallel tab, external file change, partial asset update, autosave, retry, discard, export-copy, and reopen preserve work and show exact choices. Allows named conflict routes only. |
| DA30-075 `[I]` | Connect source writes to reanalysis. Depends on DA30-073/074 and scanner revision model. | Successful source commit creates one revision receipt, invalidates affected facts, schedules bounded reanalysis, and blocks preview/export until current; failed write changes no authority. Allows revision bridge only. |
| DA30-076 `[G]` | Make trust failures actionable in Studio. Depends on DA30-017, 030, and 073…075. | Browser matrix covers quota, permission, stale/tampered evidence, scanner failure, blocked asset, conflict, cancellation, and recovery with cause, item, retained work, safe action, and retry. Allows named states only. |
| DA30-077 `[I]` | Build separate authoring views. Depends on DA30-072 and product route inventory. | Character, state/controller, command, animation, palette, stage, asset, evidence, and project settings have direct views with validation, source location, undo/redo, keyboard access, and narrow ownership. Allows named authoring views only. |
| DA30-078 `[G]` | Gate preview fidelity and isolation. Depends on DA30-075/077 and playable sandbox gate. | Preview consumes exact unsaved/saved revision by explicit mode, never overwrites project state, reports unsupported facts, resets runtime cleanly, and matches exported config for named route. Allows one Studio preview flow only. |
| DA30-079 `[G]` | Export a deterministic local playable bundle. Depends on DA30-065, 072, 075, 078, and asset gates. | Same project/revision/tool chain yields identical manifest and content digests, safe paths, current evidence, runtime config, provenance, limits, and local play smoke; blocked facts stop export. Allows deterministic local export only. |
| DA30-080 `[G]` | Make ProjectReleaseDecision a live product gate. Depends on DA30-076, 079, and claim compiler. | Build/export/release actions consume one immutable decision; missing, stale, tampered, blocked asset, scanner fail, and fresh-ready routes match exported evidence and explain the next action. Allows one local decision flow only. |

## Wave 8 — Assets, provenance, transforms, and scanner

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-081 `[A]` | Define the asset/provenance graph. Depends on DA30-013, 030, and existing asset policy. | ADR assigns source, license/permission, creator/tool, prompt when generated, transform chain, digest, consumer, revision, release state, and deletion policy; unknown provenance blocks release. Allows provenance design only. |
| DA30-082 `[I]` | Materialize permission and license decisions. Depends on DA30-081. | Every shipped asset edge has repository-authored/generated/allowed status, evidence, constraints, attribution, and scope; forbidden/unknown/commercial samples stay metadata-only and fail inclusion. Allows listed asset permissions only. |
| DA30-083 `[I]` | Record reproducible transform chains. Depends on DA30-081/082. | Crop, resize, palette, alpha, atlas, audio conversion, compression, and generated transforms record tool/version/params/input/output digests; rerun matches or declares nondeterminism. Allows named transforms only. |
| DA30-084 `[G]` | Gate generated asset QA. Depends on DA30-082/083 and generated-asset contract. | Owned sample passes dimensions, alpha, seams, palette, animation timing, audio peak/RMS, provenance, path, budget, preview, and rollback; failure samples show useful reasons. Allows sample pipeline only. |
| DA30-085 `[G]` | Enforce asset budgets and cleanup. Depends on DA30-027…029 and 083. | Per-route/package limits cover count, raw/compressed bytes, decode size, texture dimensions, audio duration, GPU memory proxy, cache, orphan cleanup, and repeated import/export. Allows named budget facts only. |
| DA30-086 `[I]` | Harden scanner archive/path limits. Depends on DA30-030 and 064. | ZIP bombs, traversal, absolute/UNC, case collision, symlink metadata, nested archive, huge count, huge file, encoding, cancel, timeout, and worker crash fail safely with capped facts. Allows tested scanner safety only. |
| DA30-087 `[I]` | Emit profile-aware capability reasons. Depends on DA30-050, 063, and 086. | Scanner separates recognized, parsed, compiled, executed, unsupported, blocked, unknown, profile-only, and malformed with source location, owner, next action, and registry revision. Allows scanner facts only. |
| DA30-088 `[I]` | Make reanalysis incremental and revision-bound. Depends on DA30-075 and 087. | Changed graph nodes invalidate exact dependents, unchanged facts retain digests, cancel/retry is atomic, stale worker output cannot publish, and full rebuild matches incremental output. Allows reanalysis behavior only. |
| DA30-089 `[G]` | Prove scanner parity across Studio and CLI adapter. Depends on DA30-087/088 and CLI design. | Same package bytes, profile, limits, and registry yield identical canonical facts and failure codes in browser worker and headless adapter; environment-only fields stay separate. Allows parity for named fixtures only. |
| DA30-090 `[G]` | Gate asset-to-export closure. Depends on DA30-079 and 081…089. | Project graph proves every exported asset was scanned, permitted, transformed, budgeted, revision-current, included once, and locally loaded; blocked/orphan/stale/tampered edges stop export. Allows one asset closure chain only. |

## Wave 9 — IKEMEN source, ZSS, modules, teams, replay, and bounded milestone

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-091 `[R]` | Reconcile Ikemen source authority by family. Depends on DA30-002 and source epoch. | For scheduler, teams, triggers, controllers, projectile, ZSS, Lua/modules, config, and screenpack, record normative/working pin, files/symbols, digest relation, review state, consumer, and open questions. Allows source provenance only. |
| DA30-092 `[A]` | Separate scanner, source, runtime, and product IKEMEN lanes. Depends on DA30-087 and 091. | Capability model forbids scanner recognition or source review from implying execution; every claim names profile, lane, operation, fixture, trace, and product route. Proof: invalid promotion cases. Allows lane taxonomy only. |
| DA30-093 `[A]` | Define a bounded ZSS capability registry. Depends on DA30-091/092. | Registry names declarations, operations, types, scope, reset, permissions, parser/compiler/runtime owners, diagnostics, unsupported features, and pin references. No generic “ZSS support” row exists. Allows design only. |
| DA30-094 `[I]` | Execute one source-reviewed ZSS subset. Depends on DA30-093 and deterministic state. | Owned fixture proves selected declarations/operations, deterministic failures, runtime trace, snapshot/reset, caps, and explicit rejection of every ungranted feature. Allows named operations only. |
| DA30-095 `[R]` | Bound Lua and external-module scope. Depends on DA30-030 and 091/092. | Research maps host APIs, filesystem/network/process/time/random access, lifecycle, trust, packaging, diagnostics, and browser constraints; recommends deny, isolate, translate, or omit per surface. Allows research decision input only. |
| DA30-096 `[A]` | Define module packaging and permissions. Depends on DA30-081 and 095. | ADR covers manifest, identity, versions, deps, capabilities, digest/signature limits, trust, updates, isolation, budgets, errors, disable, and uninstall cleanup. Allows module design only. |
| DA30-097 `[G]` | Revalidate plural team topology and schedule. Depends on DA30-020, 039, 050, 091, and issue 07. | Distinct P1-P4 fixture proves complete registry, active/standby, Partner/Enemy/P2 identity, prepared order, Tag transitions, reset, and unchanged 1v1 checksums. Allows named topology/schedule only. |
| DA30-098 `[G]` | Gate team consumers. Depends on DA30-054, 056, 097. | Separate evidence covers input, commands, effects, collision/combat, KO/round, camera/render, HUD, audio, resources, and reset for one chosen team mode; unproven consumers remain disabled. Allows exercised consumers only. |
| DA30-099 `[R]` | Design replay/network boundary. Depends on DA30-039/040 and 097/098. | ADR/spike plan covers input delay, rollback state, resim, desync hash, spectator, protocol version, transport, security, disconnect, host authority, and browser limits; no network claim is made. Allows design/feasibility only. |
| DA30-100 `[G]` | Adjudicate a bounded IKEMEN milestone. Depends on DA30-091…099. | Independent review separates scanner, source, ZSS, modules, team, replay, product, and performance facts; records supported profile/operations, blocked extensions, risks, denominators, scores, and next queue. Allows signed scope only. |

## Wave 10 — Shared engine, second consumer, SDK, CLI, CI, and package proof

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-101 `[R]` | Re-audit module boundaries and live imports. Depends on DA30-021 and linked boundary issue. | Graph lists package owners, forbidden edges, browser globals, app/runtime coupling, cycles, file/LOC weight, test owners, and candidate ports; historical diagrams are checked against imports. Allows boundary inventory only. |
| DA30-102 `[A]` | Select extraction candidates from two-consumer needs. Depends on DA30-101 and second-consumer spec. | ADR ranks clock, input, renderer, storage, evidence, asset, worker, and lifecycle ports by coupling, stability, migration risk, and both consumer needs; combat semantics stay MUGEN-owned. Allows extraction order only. |
| DA30-103 `[I]` | Add a minimal non-fighting playable consumer. Depends on DA30-031, 035…037, 102, and repository-owned assets. | Platformer/testbed has its own model and uses chosen clock/input/renderer/storage/evidence ports in a browser route; no MUGEN import or copied combat model exists. Allows two-consumer proof for used ports only. |
| DA30-104 `[I]` | Extract renderer, clock, and input ports. Depends on DA30-060, 102, and 103. | Both consumers use one contract with explicit lifecycle, resize, focus, seed, sampling, teardown, and diagnostics; compatibility adapters keep prior MUGEN checksums/routes. Allows these ports only. |
| DA30-105 `[I]` | Extract storage and evidence ports. Depends on DA30-072…080, 102, and 103. | Both consumers use versioned load/save/revision/evidence contracts with atomic failure, cancellation, quota, migration, and no browser globals in core. Allows named ports only. |
| DA30-106 `[A]` | Define local package and extension API. Depends on DA30-104/105. | ADR names public/private modules, versioning, capabilities, lifecycle, errors, cancellation, compatibility, deprecation, tree-shaking, and extension limits; unstable surfaces stay internal. Allows API design only. |
| DA30-107 `[I]` | Add headless import/analyze/build CLI. Depends on DA30-064, 089, 079, 105, and 106. | Commands have stable exits, JSON facts, stdin/path policy, cancellation, caps, deterministic output, no browser globals, help/version, malformed cases, and Studio parity fixtures. Allows named local CLI commands only. |
| DA30-108 `[I]` | Add reproducible CI workflows. Depends on DA30-016, 022, 030, and 107. | Pinned runtime installs lockfile, caches by safe keys, runs PR/nightly/release lanes, typecheck/unit/build/boundaries/control audit, uploads facts, enforces fatal warnings, and tests one forced failure. Allows named CI environment only. |
| DA30-109 `[G]` | Pack and smoke the local SDK/CLI. Depends on DA30-106…108. | Clean temp consumers install packed artifacts, run browser and headless examples, reject private imports, verify exports/types/assets/licenses, uninstall cleanly, and reproduce digests. Allows local package smoke only. |
| DA30-110 `[G]` | Enforce non-vacuous boundaries. Depends on DA30-101…109. | Boundary checker fails on app-to-core leaks, MUGEN import in second consumer, browser globals in headless core, private package imports, cycles, and unused ports; both live consumers pass. Allows enforced boundary claims only. |

## Wave 11 — Product quality, migration, release, score, and final review

| ID | Scope and dependencies | Acceptance, evidence, and claim ceiling |
| --- | --- | --- |
| DA30-111 `[G]` | Run full accessibility audit. Depends on DA30-025/026, 052, 076/077, and 103. | Keyboard, focus order/visibility, landmarks, labels, names/roles/states, contrast, zoom/reflow, reduced motion, status/errors, canvas alternatives, and screen-reader paths pass on desktop/mobile. Allows named accessibility routes only. |
| DA30-112 `[G]` | Enforce performance and size budgets. Depends on DA30-027…029, 060, 078, and 103. | PR/release facts cover route bytes, chunks, asset/decode/GPU proxies, startup, input delay, p95/p99/max frame gaps, long tasks, repeated navigation, and breach owners. Allows measured environment facts only. |
| DA30-113 `[A]` | Complete product threat model and response plan. Depends on DA30-030, 064, 081, 086, 096, and 107. | Trust zones, assets, threats, controls, residual risk, logging, disclosure, dependency response, data deletion, CSP/headers, module limits, and release blockers are owned. Allows security plan only. |
| DA30-114 `[A]` | Define privacy and telemetry rules. Depends on DA30-013, 017, 113. | ADR names local diagnostics, opt-in data, redaction, retention, export/delete, crash reports, user assets, paths, prompts, and hosted-preview boundaries; default behavior and consent are explicit. Allows privacy policy design only. |
| DA30-115 `[I]` | Prove project/evidence/API migrations. Depends on DA30-072, 083, 087, and 106. | N-1 fixtures migrate deterministically or open read-only; rollback/export copy, unknown future versions, failed migration, partial data, and retry preserve originals. Allows named migration paths only. |
| DA30-116 `[A]` | Design hosted preview and rollback. Depends on DA30-079/080, 109, 113/114. | Architecture covers static hosting, CSP/headers, cache keys, asset limits, privacy, artifact promotion, preview isolation, smoke, status, rollback, domain and secret authority; no deployment occurs. Allows deployment design only. |
| DA30-117 `[G]` | Run a local release rehearsal. Depends on DA30-070, 080, 090, 100, 109…116. | Clean checkout builds, packs, imports owned project, runs browser/CLI smokes, checks licenses/SBOM/provenance, signs local manifest, tests rollback, and records every warning/blocker. Allows local rehearsal only. |
| DA30-118 `[G]` | Recalculate completion scores. Depends on DA30-002, 019, 070, 100, 112, and 117. | Each lane has denominator, eligible passed clauses, rejected/stale evidence, confidence, movement, rationale, and blocked claims; docs and task counts contribute zero runtime credit. Allows recorded score decision only. |
| DA30-119 `[G]` | Run an independent adversarial review. Depends on DA30-015 and 117/118. | Reviewer with separate provenance samples success/failure artifacts, reruns selected gates, checks current SHAs, rejects circular facts, records disputes, accepted/rejected claims, gaps, and release view. Allows signed review only. |
| DA30-120 `[G]` | Adjudicate the remaining product/SDK roadmap. Depends on DA30-119 and every task required by the chosen milestone. | Final record names shipped, local-only, experimental, and blocked surfaces; API stability, extension risk, migrations, source/profile scope, evidence freshness, scores, release authority, and next bounded program are explicit. Allows only the signed final scope. |

## Claims while DA30 is open

Allowed now: 120 proposed recovery cuts, held scores, historical bounded pins,
and candidate reuse of DA29 artifacts.

Blocked now: DA29 series completion, current-HEAD formal/global or visual
health, score movement, MUGEN or IKEMEN parity, Studio release readiness,
reusable-engine or SDK readiness, CI readiness, hosted deployment, and public
release authority.
