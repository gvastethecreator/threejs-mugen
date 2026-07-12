# IKEMEN PlayerPush policy report

## Outcome

`RuntimeRootBodyPushWorld` now applies IKEMEN team admission, priority, `size.weight`, and `size.pushfactor` policy to root X/Z separation. `PlayerPush` also executes for active Tag roots and preserves root RedirectID expressions through the shared bounds-controller route.

## Evidence

Required `synthetic-imported-ikemen-playerpush-policy.json` places enemy P3/P4 at X `0/10`, uses equal priority with weights `300/100` and push factors `0.5/2`, and proves asymmetric final positions `-8.5/112` without combat or targets.

- Checksum: `fb580dee`
- Final checksum: `f0591f13`
- Tests: 180 files / 1884 tests passed.
- TypeScript 7 typecheck: passed.
- Build: passed; existing large-chunk advisory remains.
- `pnpm check:boundaries`: passed.
- Trace QA: 563/563 artifacts, 532 required and 31 optional.

The historical active-root motion trace keeps checksum `8ee92f65`; its gate now asserts official enemy-only default behavior instead of relying on same-team push.

## Global port state

- PlayerPush: policy-complete for bounded player roots across X/logical Z.
- Root RedirectID: shared live-root route covers Depth, ScreenBound, and PlayerPush.
- Remaining high-risk constraint debt: Clsn/Y admission, helpers, corner/tie interpolation, exact pause/reset ordering, and renderer projection.
- Aggregate project completion scores remain unchanged; this closes a compatibility subfeature, not full engine parity.

## Boundary

No claim is made for helper push, Clsn/Y collision, exact corner interpolation, warning parity, renderer parity, or full MUGEN/IKEMEN constraint behavior.
