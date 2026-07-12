# IKEMEN depth player-push report

## Outcome

`RuntimeRootBodyPushWorld` now resolves depth-dominant overlap along logical Z and similar normalized overlap along both X/Z. Existing pair enrollment, `PlayerPush` opt-out, stable traversal, and X-only fallback remain intact.

## Evidence

Required `synthetic-imported-ikemen-depth-player-push.json` places active P3/P4 at X `0/1`, Z `-4/4`, expands body depth to `5/5`, and proves depth-dominant push reaches Z `-5/5` without moving X or producing combat/targets.

- Checksum: `5870f7de`
- Final checksum: `cf226647`
- Tests: 180 files / 1878 tests passed.
- TypeScript 7 typecheck: passed.
- Build: passed; existing chunk-size advisory remains.
- `pnpm check:boundaries`: passed.
- Trace QA: 561/561 artifacts, 530 required and 31 optional.

## Boundary

This is bounded symmetric body push. Priority, weights, push factors, AffectTeam, Clsn/Y filtering, helper participation, interpolation, exact ties/tick order, and full parity remain unsupported claims.
