# Research: Redirect lease v1.1

Date: 2026-07-16
Question: What is the smallest lease contract that makes RedirectID freshness
and operation attribution explicit without prematurely migrating writeback?

## Primary sources

- [IKEMEN-GO repository](https://github.com/ikemen-engine/Ikemen-GO) states that
  the engine supports MUGEN resources and targets backwards compatibility with
  MUGEN 1.1 Beta.
- [IKEMEN-GO releases](https://github.com/ikemen-engine/Ikemen-GO/releases)
  include redirect-related fixes and trigger-redirection additions. The source
  history supports keeping redirect identity and failure behavior observable,
  but it does not define this repository's internal lease API.
- [Wayfinder T11 audit](2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md)
  sets the local acceptance boundary: typed result, actor generation/freshness,
  operation class, selected/mutated ids, attribution, and stale same-id or
  unsupported-destination fail-closed behavior.

## Findings

1. A nullable lease cannot tell callers whether a redirect was invalid, missing,
   stale, or unsupported. A discriminated result gives diagnostics without
   changing the legacy adapter's return shape.
2. Reference identity catches replacement objects, but a lease also needs an
   explicit revision/generation callback for an actor whose object reference is
   retained while its identity token changes.
3. `effect` and `controllerType` alone leave downstream consumers to rebuild
   operation semantics. The bounded classifier keeps resource, motion, binding,
   state, and BindToTarget attribution in the dispatch selection.
4. The result contract can be introduced before the commit-owner migration. The
   current helper wrapper writeback remains visible through T10, while T12 can
   replace it with a revalidating mutation owner after characterization.

## Decision impact

T11 is implemented in `RuntimeRedirectedTargetDispatchSystem`,
`PlayableMatchRuntime`, `TargetSystem`, and the shared runtime types. Root and
helper resolution now consume `resolveResult()`. Unsupported helper-destination
TargetState remains rejected before any dispatch mutation.

## Remaining uncertainty

The generation token is intentionally supplied by the current runtime adapter;
the identity registry does not yet own a reusable actor-generation abstraction.
T12 must decide whether that token becomes a registry-owned revision and must
delete duplicate writeback/telemetry paths before ADR 0006 can be accepted.
