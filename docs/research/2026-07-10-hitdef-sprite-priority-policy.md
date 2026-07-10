# HitDef Sprite Priority Policy

Date: 2026-07-10

## Question

How should the runtime preserve and resolve static `HitDef p1sprpriority` / `p2sprpriority` without hiding MUGEN-versus-Ikemen behavior or coupling compatibility state to Three.js?

## Answer

Preserve authored values as optional typed data through compilation and `currentMove`. Resolve omitted values only at accepted contact through a named profile policy. The executable MUGEN 1.1 policy uses P1 = 1 and P2 = 0. Non-normative Ikemen and unknown profiles apply explicit values but preserve current priorities for omitted values and mark that branch unsupported.

## Primary Sources

- [Elecbyte MUGEN 1.1 State Controller Reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html) - `p1sprpriority` and `p2sprpriority` apply when a move hits or is guarded; documented defaults are 1 and 0.
- [Elecbyte MUGEN history](https://www.elecbyte.com/mugendocs-11b1/history.html) - legacy `sprpriority` was renamed to `p1sprpriority` and `p2sprpriority` was added.
- [Ikemen GO pinned HitDef compilation](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/compiler_functions.go#L1872-L1887) - parses explicit P1/P2 values and the legacy P1 alias.
- [Ikemen GO pinned initialization](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L751-L752) and [contact application](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L10790-L10793) - observed code initializes P1 with a sentinel, P2 with 0, and applies P1 only when present.

## Findings

- Compilation must not materialize MUGEN defaults because the compile context has no executable compatibility profile.
- The immediate static slice does not need a clamp; the primary reference defines integer values but no semantic range for these two HitDef parameters.
- HitDef drawing priority is separate from HitDef collision `priority` and from Three.js z, `renderOrder`, transparency, and depth policy.
- The pinned Ikemen behavior is evidence of divergence, not sufficient authority for a normative Ikemen profile in this runtime.

## Uncertainty And Boundary

Legacy `sprpriority` aliasing, dynamic expressions, Projectile inheritance, exact Ikemen defaults, equal-priority ties, and renderer queue policy remain unresolved. They must not be inferred from this policy seam.

## Implementation Decision

Add optional `p1SpritePriority` / `p2SpritePriority` fields to typed HitDef operations and active move data. Add a pure `HitDefPriorityPolicy` returning resolved value, provenance, and support state. Contact mutation and trace provenance are the next vertical slice.

## Implementation Outcome

- Package assessment now maps MUGEN 1.1, observed Ikemen, and unknown profiles into the policy seam.
- Shared direct-combat contact applies resolved priorities to player and first-generation helper routes only after accepted hit or guard.
- Runtime diagnostics retain profile, role, contact kind, previous value, final value, source, and support state outside the legacy behavior checksum projection.
- Required player trace checksum `4dafe2f3` / final `f30f3c78` proves omitted MUGEN 1.1 defaults for both actors.
- Required helper trace checksum `53833d9e` / final `8b1b11a1` proves authored values for helper P1 and player P2.
- `pnpm qa:trace` passes 526/526 artifacts: 495 required and 31 optional.

Next decision: define the smallest renderer-independent semantic order record and controlled player/effect/stage overlap gate. Dynamic HitDef values, Projectile inheritance, exact Ikemen defaults, equal ties, and full visual parity remain blocked.
