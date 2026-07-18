# ADR 0013: Bounded root State -4/+1 scheduling

Status: Accepted (bounded IKEMEN root global-state route)

Date: 2026-07-18

Last reviewed: 2026-07-18 at HEAD `9dac35d2`

Decision owners: runtime compatibility and IKEMEN bounded-runtime lanes

Related decisions: [`docs/adr/0011-helper-state-plus-one.md`](0011-helper-state-plus-one.md), [`docs/adr/0012-root-negative-state-scheduling.md`](0012-root-negative-state-scheduling.md)

Research: [`docs/research/2026-07-18-root-state-minus-four-plus-one-scheduling.md`](../research/2026-07-18-root-state-minus-four-plus-one-scheduling.md)

Closeout: [`docs/reports/2026-07-18-root-state-minus-four-plus-one-closeout.md`](../reports/2026-07-18-root-state-minus-four-plus-one-closeout.md)

## Context

The official [IKEMEN-GO Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info) places root State -4 before States -3/-2 and State +1 after the normal state. It describes both special passes as not halted by Pause/SuperPause. MUGEN's baseline does not define these IKEMEN additions.

The root scheduler already executes bounded -3/-2 passes. The parser, source
resolver, compiler IR, and helper runner already preserve literal `+1` as a
distinct `plus-one` identity. The active scan seam needed to carry that
identity, and the paused actor seam needed a root-only hook for actors whose
normal state was frozen.

## Decision

1. When `runtimeProfile === "ikemen-go"`, execute root State -4 before root
   States -3/-2, the normal state, and root State +1 after the normal state.
2. Resolve root +1 using `id = 1` plus `special = "plus-one"`; never normalize
   it to numeric State 1.
3. Execute root -4 and +1 with the pause filter disabled. During global
   hitpause, run those two special passes while retaining `ignorehitpause`
   filtering for root -3, root -2, and normal controllers.
4. During regular IKEMEN Pause, run -4/+1 for a root that cannot advance its
   normal state, without advancing that normal state or consuming move time.
5. Keep MUGEN/unknown profiles and helper execution unchanged.

## Alternatives rejected

### Treat root +1 as numeric State 1

Rejected because it can select normal State 1 and lose the post-current global
identity already preserved by ADR 0011.

### Run special states only when the root can move

Rejected because Pause/SuperPause immunity would be lost for frozen roots.

### Disable the hitpause filter for all root passes

Rejected because States -3/-2 and normal controllers must keep existing
`ignorehitpause` behavior.

### Create a second root VM

Rejected. The existing active scan/run seam can select special identity and the
paused actor seam can host the two bounded passes without another execution
language.

## Consequences

Positive:

- IKEMEN root global order is explicit and profile-gated;
- literal +1 identity is shared by parser, resolver, compiler, and scheduler;
- pause immunity is exercised for active, hitpause, and frozen regular-Pause
  paths.

Negative:

- exact global priority with State -1 and Common1/multi-file append order are
  still separate decisions;
- helper input buffers, rollback/netplay, and full MUGEN/IKEMEN parity remain
  outside the claim.

## Evidence

- Implementation: `9dac35d2`.
- Focal: `264/264` tests passed across active scan, paused actor, and
  PlayableMatchRuntime slices.
- `pnpm build`: passed with TypeScript 7 and Vite production output. The
  existing large JavaScript chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed; existing CRLF normalization warnings remain in
  unrelated dirty documentation files.

## Claim boundary

Allowed:

- bounded IKEMEN root `-4 -> -3 -> -2 -> normal -> +1` scheduling;
- special +1 identity selection;
- pause-immune root -4/+1 passes for hitpause and frozen regular Pause;
- MUGEN/unknown profile gating.

Still blocked:

- State -1 command priority and exact complete global order;
- Common1/multi-file source append precedence and helper input-buffer parity;
- rollback/netplay and complete MUGEN/IKEMEN compatibility.
