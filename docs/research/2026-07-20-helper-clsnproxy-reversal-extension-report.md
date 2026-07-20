# T356 research report: Helper clsnproxy ReversalDef extension

Date: 2026-07-20

## Question

Does the bounded root `clsnproxy` extension also need to feed ReversalDef
contact and ReversalDef-versus-ReversalDef clashes?

## Primary source

The pinned local checkout and the official revision of
[`src/char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10497-L10530)
show that ReversalDef priority uses a counter-check which calls
`clsnCheck(getter, 1, ...)`. The collision routine
[`clsnCheck`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10196-L10285)
flattens proxy descendants and compares current `clsn1` boxes while keeping
proxies out of direct actor admission.

## Implementation

`RuntimeReversalWorld.findActive` now accepts world-space boxes as a single
box or a read-only list. The direct runtime path maps the resolved root
`clsn1` list into world space before testing a defender's ReversalDef. The
equal-priority path uses the same list. The match bridge now passes the
collision accessor into the ReversalDef clash resolver, and root team/tag
admission compares resolved `clsn1` lists for both reversal actors.

The existing move-box fallback still serves isolated callers without a
collision accessor. Helper-owned direct combat and projectile reversal remain
separate because their ownership and source contracts differ from root
`clsnproxy` flattening.

## Evidence

- `ReversalSystem.test.ts` covers one-or-many incoming world boxes.
- `RuntimeCombatResolutionSystem.test.ts` covers direct reversal contact and
  a ReversalDef clash whose authored move box misses while resolved `clsn1`
  boxes connect.
- `RuntimeRootDirectHitAdmissionSystem.test.ts` covers root clash admission
  from resolved boxes.
- Focused Vitest: `350/350` across `5` files.
- Full Vitest: `240/240` files and `2612/2612` tests.
- TypeScript 7 typecheck, production build (`327` modules), boundary check,
  and `634/634` trace artifacts passed.
- `diagnostics.json` reports `600` required and `34` optional artifacts,
  `634` passed, `0` failed, and `0` skipped fixtures.

## Limits and next work

Projectile reversal, helper-owned reversal, complete collision scale and angle,
renderer diagnostics, and paired upstream/local traces remain open. The next
bounded collision slice should choose one of those paths with source evidence
before any broader parity claim.
