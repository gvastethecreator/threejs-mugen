# Research - RuntimeTeamResourceBank/v0

Date: 2026-07-13
Status: source-backed ownership boundary

## Question

What is the smallest safe resource cut after visible team lifebars: shared
values, or explicit ownership resolution first?

## Primary evidence

- The official [IKEMEN-GO screenpack features
  reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Screenpack-features)
  lists `teamlifeshare` and `teampowershare` as separate options. They must
  therefore remain independent policy switches.
- The official [IKEMEN-GO lifebar features
  reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Lifebar-features)
  documents player-scoped life and power value elements. A team bank owner
  cannot be inferred from the visible leader or active root without a separate
  policy contract.
- The official [IKEMEN-GO miscellaneous
  reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
  exposes per-player life/power quick-VS inputs and team-mode selection. This
  supports keeping actor values and team policy as separate inputs.

## Decision

`RuntimeTeamResourceBankWorld/v0` publishes ownership only:

1. Non-shared life and power each resolve to an actor-local bank and
   `resourceOwnerId`.
2. `teamlifeshare` and `teampowershare` resolve independently to a side bank
   (`team:1` or `team:2`) while the bank kind remains distinct.
3. A deterministic representative actor is diagnostic metadata only; it is
   not the bank owner and does not change when Tag active/standby state changes
   unless the valid roster itself changes.
4. The diagnostic is snapshot/trace data outside the behavior checksum. No
   existing resource mutation path is redirected in this cut.

## Local evidence

- `src/mugen/runtime/RuntimeTeamResourceBankSystem.ts` owns validation,
  side/member ordering, independent policy resolution, and stable bank ids.
- `PlayableMatchRuntime`, `RuntimeSnapshotWorld`, `RuntimeTrace`, and
  `RuntimeTraceArtifact` carry the contract without changing current resource
  values or checksums.
- `MatchWorld.test.ts`,
  `RuntimeTeamResourceBankSystem.test.ts`, and the required team handoff trace
  assert root-local owners, independent side owners, and stable ownership
  through KO/promotion.

## Claim boundary

Allowed: explicit per-root/per-side resource-bank identity and
`resourceOwnerId` resolution for the bounded IKEMEN team snapshots.

Blocked: shared bank mutation, damage/power routing, LifeShare/PowerShare
round reset, Pause/SuperPause ownership, target/helper redirects, red-life,
guard/stun sharing, variable-map sharing, rollback/netplay, and full parity.
