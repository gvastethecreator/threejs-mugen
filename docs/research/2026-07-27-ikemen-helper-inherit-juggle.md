# IKEMEN Helper `inheritJuggle` Research

## Question

What part of IKEMEN Helper `inheritJuggle` can the local runtime implement
without claiming the full target-list and hit-timing behavior?

## Answer

The bounded slice is the pre-admission budget copy. IKEMEN accepts mode `1` to
inherit the Parent target budget and mode `2` to inherit the Root target budget.
The local runtime now resolves that value when a Helper spawns, copies an
existing Parent or Root entry into the Helper entry before direct or
Helper-owned Projectile admission, and leaves an existing Helper entry alone
on later contacts. This preserves spent points within the local target-budget
model.

## Pinned source

- Repository: `ikemen-engine/Ikemen-GO`
- Commit: `4aa0ba38f851c52549ba182310e9e53361cd472a`
- [`inheritJuggle` field and Helper runtime state](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L3188-L3203)
- [`hitDetectionPlayer` Parent/Root budget copy](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L12627-L12643)
- [`setGetHitVars` post-contact `sendJuggle` path](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10830-L10848)

## Findings

1. The source stores `inheritJuggle` on the character and checks it while
   resolving a Helper's hit admission.
2. Mode `1` reads the Parent entry and mode `2` reads the Root entry before the
   Helper is admitted into the hit path.
3. After a Helper hit, the source has a separate `sendJuggle(origin)` path that
   moves and reduces target entries. That path depends on the engine's full
   target list, actor ancestry, and hit lifecycle.
4. The local runtime already has target air-juggle points keyed by actor id, but
   it does not yet model the source target-list transfer as a complete object.
   Copy-before-admission is therefore the safe first slice.

## Local implementation contract

Under `ikemen-go`:

- `Helper` compiles static `0|1|2` values and scalar expressions.
- A scalar expression resolves at Helper spawn. Values outside `0|1|2` fail
  closed at the dispatch boundary.
- MUGEN and unknown profiles strip the authored field.
- Mode `1` selects the Helper Parent. Mode `2` selects the Helper Root.
- The copy runs only when the Helper target entry is missing. It therefore
  cannot restore points spent by a previous accepted contact.
- Direct Helper combat and root-owned Helper Projectile combat use the same
  preparation function before their existing air-juggle admission.
- An unresolved origin or missing source entry leaves the prior local path.

## Implementation result

Commit `1ae8a98e` implements the bounded path in:

- `src/mugen/compiler/ControllerOps.ts`
- `src/mugen/runtime/EffectSpawnSystem.ts`
- `src/mugen/runtime/HelperSystem.ts`
- `src/mugen/runtime/RuntimeJuggleSystem.ts`
- `src/mugen/runtime/RuntimeHelperCombatSystem.ts`
- `src/mugen/runtime/RuntimeCombatResolutionSystem.ts`
- `src/mugen/runtime/ProjectileCombatSystem.ts`

The production bridge passes `ikemen-go` through Helper combat. The required
trace `synthetic-imported-ikemen-helper-inherit-juggle-golden` seeds one root
point after a direct `air.juggle = 3` contact, spends it through a Helper-owned
Projectile with `inheritjuggle = 1` and `air.juggle = 1`, then rejects the next
contact while retaining the Projectile. Final P2 life is `946` and the budget
map is `{ p1: 1, p1-helper-0: 0 }`.

## Evidence

- Focused closure: 7 files / 843 tests passed.
- Focus includes compiler static/expression/invalid values, IKEMEN/MUGEN spawn
  routing, idempotent budget copy, direct Helper combat, root-owned Helper
  Projectile combat, and T407-T409 regression paths.
- `node --check scripts/qa_traces.cjs` passed.
- `git diff --check` passed.
- `pnpm typecheck` reaches only the unrelated pre-existing unused `advanced`
  at `src/mugen/da32/ClauseAdjudicationSample.ts:149`.

## Claim ceiling

This evidence supports bounded Parent inheritance before local direct and
Helper Projectile air-juggle admission. It does not establish exact source
target-list transfer after contact, live Root mode behavior, nested or
destroyed owner semantics, `hittmp`/`acttmp`, pause behavior, MUGEN behavior,
teams/clashes, or full MUGEN/IKEMEN parity.
