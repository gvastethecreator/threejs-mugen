# ADR 0002 - MUGEN Presentation Order And Profile Boundaries

Status: proposed

Date: 2026-07-10

## Context

The current runtime already carries actor `spritePriority` into snapshots, traces, renderer diagnostics, and Three.js character meshes. The latest browser gate proves bounded player `SprPriority` ordering. The direct HitDef compiler/runtime path does not yet carry `p1sprpriority` or `p2sprpriority`.

MUGEN 1.1 documents contact-driven priority defaults of P1 = 1 and P2 = 0 on hit or guard. In the repo-pinned Ikemen GO snapshot, P1 initializes to a sentinel and is applied only when a value exists. This is an observed divergence; upstream intent and normative profile behavior are not established. It must be isolated behind a profile seam pending an oracle or maintainer rationale.

Three.js cannot be used as the semantic truth directly. `Object3D.renderOrder` participates inside render-list sorting, but opaque and transparent objects are sorted in separate lists. Depth and blending settings can therefore defeat an apparently correct numeric z/order mapping.

## Decision Proposed

1. Preserve a renderer-independent presentation order record.
2. Include compatibility profile, presentation phase/layer, semantic sprite priority, source kind, blend policy, and explicit tie policy or unknown-tie marker.
3. Treat Three.js z, `renderOrder`, queue selection, `depthTest`, and `depthWrite` as adapter outputs.
4. Preserve whether each HitDef priority value was authored or omitted through compilation; do not materialize profile defaults in a profile-blind compile context.
5. Resolve omitted values at accepted contact through an explicit policy input. Implement the next static direct, non-projectile player/helper HitDef slice against explicit MUGEN 1.1 semantics:
   - apply P1/P2 sprite priorities after accepted hit or guard;
   - default omitted P1 to 1 and omitted P2 to 0;
   - do not mutate on whiff, eligibility reject, reversal miss, or other non-contact outcomes;
   - do not invent a semantic clamp without reference evidence;
   - keep Projectile behavior and IKEMEN default behavior out of the slice.
6. Record resolved-value provenance (`authored`, named profile default, or unsupported/preserve-current) in diagnostics and in a future parameter-level capability schema.
7. Do not claim equal-priority tie parity until a reference oracle identifies it.

## Alternatives

### Encode compatibility directly as Three.js z or renderOrder

Rejected as semantic architecture. It is smaller, but it couples compatibility to the current renderer and does not control the opaque/transparent queue split or depth policy.

### Copy current Ikemen behavior globally

Rejected for the active MUGEN 1.1/MUGEN-lite lane. Ikemen is an important reference and future profile, but its omitted-P1 behavior must not silently replace the documented MUGEN target.

### Build the complete profile system before the next gate

Deferred. It is architecturally cleaner but too broad for the immediate evidence gap. The next slice can name MUGEN 1.1 explicitly and leave a typed seam for future profile selection.

### Keep semantic priority but defer any renderer policy

Accepted only as the first half of the vertical slice. Runtime/trace proof may land before browser proof, but no visual parity claim is allowed until the adapter passes deterministic overlap evidence.

## Consequences

- Runtime priority and visual ordering become independently testable.
- A future renderer can change without rewriting compatibility semantics.
- Profile differences are explicit instead of hidden in defaults.
- The renderer needs diagnostics for semantic order, selected phase/list, effective render order/z, material transparency, depth test/write, and tie serial/policy.
- Stage layer 0/1, players, FightFX, Explods, afterimages and overlays can join the same order vocabulary incrementally.
- The immediate slice does not settle equal ties, `Explod ontop`, stage foreground quirks, Projectile priority inheritance, or IKEMEN runtime semantics.

## Planning Use And Implementation Validation

- This ADR remains proposed. The queue uses it as a contingent guardrail; the implementing agent must adopt it or record a replacement decision before changing runtime behavior.
- Focused tests prove authored presence survives compilation and the selected policy resolves MUGEN 1.1 explicit and omitted P1/P2 values on hit and guard.
- Player and current helper direct-contact coverage prove both actors change only after accepted contact.
- Renderer diagnostics expose semantic and effective order separately.
- Desktop and mobile overlap proof stays within one controlled compositing policy.
- Documentation names the compatibility profile and keeps the tie policy blocked where unknown.

## Primary References

- [Elecbyte MUGEN 1.1 State Controller Reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
- [Elecbyte MUGEN history](https://www.elecbyte.com/mugendocs/history.html)
- [Repo-pinned Ikemen GO HitDef compilation](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/compiler_functions.go#L1872-L1887)
- [Repo-pinned Ikemen GO P1 sentinel initialization](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L751-L752)
- [Repo-pinned Ikemen GO runtime application](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L10790-L10793)
- [Three.js Object3D](https://threejs.org/docs/pages/Object3D.html)
- [Three.js Material](https://threejs.org/docs/pages/Material.html)
- [Three.js r184 WebGL render lists](https://github.com/mrdoob/three.js/blob/r184/src/renderers/webgl/WebGLRenderLists.js)

## Claim Boundary

This ADR is a proposed architecture decision. It does not prove implementation, runtime behavior, renderer parity, profile switching, score movement, or MUGEN/IKEMEN parity.
