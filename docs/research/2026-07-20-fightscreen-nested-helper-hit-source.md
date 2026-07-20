# FightScreen nested Helper hit source

Date: 2026-07-20
Ticket: T340
Status: implemented at bounded nested-helper source scope

## Question

Can a nested Helper and its Projectile carry root-owned hit source metadata
into the FightScreen WinType path without trusting `rootId` alone?

## Answer

Yes, when the live parent chain reaches the declared root and the existing
identity registry checks pass. The combat bridge now uses that verifier for
`ikemen-go` direct Helper HitDef and Helper-parented Projectile source
metadata. A rejected or stale chain remains ineligible for root-owned cause
classification.

## Findings

The pinned Ikemen-GO source carries Helper parent/root identity and inherited
player ownership into hit context. `char.go` consumes that context when a root
character reaches zero life, while `bytecode.go` resolves controller-side
dispatch against live character identity. Those facts support one shared
runtime predicate for direct and Projectile source admission.

The implementation adds `RuntimeHelperRootOwnershipResolver`, threads it
through `RuntimeMatchCombatBridgeWorld`, and supplies
`PlayableMatchRuntime.verifiedRootForHelper` for `ikemen-go`. The direct and
Projectile paths preserve the nested Helper serial as source actor identity,
the root as source root, and the inherited player slot.

## Evidence

- `RuntimeHelperCombatSystem.test.ts`: nested direct HitDef metadata passes only
  through the ownership callback.
- `RuntimeCombatResolutionSystem.test.ts`: nested Projectile metadata reaches
  the hit-state result path after verified ownership.
- `RuntimeMatchCombatBridgeSystem.test.ts`: callback identity reaches both
  Helper and Projectile resolvers.
- Focal run: 3 files / 43 tests passed.
- TypeScript 7 typecheck passed.
- Diff hygiene passed.

## Uncertainty and limits

The evidence covers source metadata and the root-victim hit-state result path.
It does not establish exact engine timing, Helper-victim attribution,
recursive RedirectID ownership, reversal/reflection rules, screenpack render
parity, or full MUGEN/IKEMEN compatibility.

## Decision

Keep nested combat source admission behind the existing live ancestry verifier.
Next runtime work should target one separate ownership boundary, such as
Helper-victim resource causes or reversal/reflection source identity, with its
own focused evidence.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
