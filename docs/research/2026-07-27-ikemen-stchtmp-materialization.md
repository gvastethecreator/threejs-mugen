# IKEMEN `stchtmp` materialization

Date: 2026-07-27

Question: which small part of IKEMEN's pending state-change flag can the
current root runtime carry without claiming the full state VM?

## Source

The pinned source is commit
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- `Char.stchtmp` is declared beside `hittmp` and `acttmp`:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L3183-L3191>
- `stateChange1` sets the flag after installing the destination state:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L6153-L6259>
- `stateChange2` clears it only when hitpause has ended:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L6286-L6306>
- Projectile admission rejects the pending state-change case when the target
  is in get-hit or active action phase:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L12908-L12920>

## Findings

`stchtmp` is a transient state-change marker, not a second state number. The
important local behavior is its lifetime: a normal state change is settled in
the same root advance, while a change made during hitpause remains pending
until an active advance can settle it. The Projectile predicate also needs the
other source phase signals: get-hit (`hittmp > 0`) or active action (`acttmp >
0`). A reversal value (`hittmp = -1`) does not satisfy that get-hit branch.

## Local contract

`RuntimeStateChangeTmpWorld` owns `mark` and `settle`. `RuntimeStateEntryWorld`
marks a root transition and settles it at once when the actor is not in
hitpause. `RuntimeFighterAdvanceWorld` exposes a final settle hook after root
state and recovery work. `RuntimeProjectileCombatWorld` consumes the combined
predicate before HitOverride and damage. The runtime keeps the field optional
so older handcrafted fixtures retain their behavior.

## Result

Commit `c7214b50` adds the typed `stateChangeTmp` field, root state-entry and
advance wiring, and the IKEMEN Projectile rejection path. Focused verification
passed 5 files / 60 tests. A PlayableMatchRuntime smoke selection passed 2
tests with 318 filtered; `node --check scripts/qa_traces.cjs` and
`git diff --check` passed.

The global typecheck was not rerun in this cut. The last batch still reports
the pre-existing unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`.

## Claim ceiling

Allowed: bounded root `stchtmp` mark/settle behavior and the named IKEMEN
Projectile admission gate during hitpause.

Blocked: exact `stateChange1`/`stateChange2` ordering, persistent-controller
correction, Explod and sound cleanup, normal global pause behavior, Helpers,
MUGEN behavior, direct-contact gates, camera gates, teams/clashes, score
movement, full state VM parity, and full port parity.
