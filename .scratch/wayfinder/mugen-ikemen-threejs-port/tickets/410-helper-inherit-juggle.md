# T410 Helper `inheritJuggle` budget

Type: task

Status: resolved bounded in `1ae8a98e`

Blocked by: None

## Question

Can the local runtime carry IKEMEN Helper `inheritjuggle = 1|2` into the
existing air-juggle admission path while keeping the source target-list work
and exact hit timing separate?

## Answer

Yes, for the pre-admission budget copy. Static values `0`, `1`, and `2` plus
scalar expressions compile. Under `ikemen-go`, mode `1` copies an existing
Parent target entry and mode `2` copies an existing Root entry into the Helper
entry before direct Helper or root-owned Helper Projectile admission. A second
preparation call does not overwrite an existing Helper entry.

The required imported trace passes: the root leaves one point, the Helper
Projectile spends that inherited point, the next contact rejects through
`air.juggle`, and the active Projectile retains one hit. Final P2 life is
`946`, with `{ p1: 1, p1-helper-0: 0 }`.

## In scope

- Typed static and scalar-expression `inheritjuggle` compilation.
- IKEMEN spawn resolution and MUGEN/unknown stripping.
- Helper runtime state needed for juggle admission.
- Parent mode `1` and Root mode `2` origin selection.
- Idempotent copy-before-admission for direct Helper and Helper Projectile
  combat.
- Focused tests, required trace, research, roadmap, and backlog updates.

## Out of scope

- Exact source `sendJuggle` target-list transfer after contact.
- A live Root mode trace.
- Nested or destroyed Helper owners.
- Exact `hittmp`/`acttmp`, pause persistence, MUGEN branch, teams/clashes,
  global checkpoint, scores, and full parity.

## Evidence

- Commit: `1ae8a98e`.
- Focused closure: 7 files / 843 tests passed.
- Required artifact:
  `synthetic-imported-ikemen-helper-inherit-juggle-golden`.
- `node --check scripts/qa_traces.cjs` passed.
- `git diff --check` passed.
- Broad typecheck remains blocked only by the pre-existing unused `advanced` at
  `src/mugen/da32/ClauseAdjudicationSample.ts:149`.

## Source

Pinned Ikemen-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.
See [the research note](../../../../docs/research/2026-07-27-ikemen-helper-inherit-juggle.md)
for the official source links and claim ceiling.
