# IKEMEN PlayerPush Width/size-box report

## Outcome

PlayerPush X no longer uses the runtime's historical fixed body-width proxy. It now uses state size-box X plus one-frame bounded Width deltas, matching IKEMEN's current-size ownership model.

## Evidence

- Actor-constraint tests prove Width delta creation and frame reset.
- Root body-push tests prove base size-box overlap and delta-driven separation.
- Required policy behavior now resolves from size width `16` to weighted positions `-2.75/43` instead of proxy-width `39` positions `-8.5/112`.
- Active-root constraint trace updates only frames where plural body push participates.
- Independent adversarial review found interval-containment and stale Width-reset defects; both are closed with focused regression coverage.
- Full tests: 180 files / 1894 tests passed.
- TypeScript 7 typecheck, build, and boundaries passed; existing large-chunk advisory remains.
- Trace QA: 563/563 artifacts, 532 required and 31 optional.

## Global port state

Root PlayerPush now covers exact state size-box X intervals, bounded Width composition/reset, legacy minimum width, Y/Clsn2 admission, SizePushOnly, team/weight/factor policy, X/Z axis choice, and X ties. Remaining constraint debt: P2BodyDist size-box ownership, Height, negative/zero Width, hitpause persistence, OverrideClsn/proxies, helpers, duplicate visitation, Z corners, interpolation, and exact pause/reset order.
