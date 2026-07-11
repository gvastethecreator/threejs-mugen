# IKEMEN static TagIn control checkpoint

## Outcome

Exact static TagIn `ctrl` and `partnerctrl` now apply after corresponding state entry through one prevalidated transition.

## Evidence

- Compiler tests cover caller/partner control, omitted-self implication, target requirement, invalid scalars, and TagOut rejection.
- Imported fixtures prove caller and partner control override StateDef `ctrl = 0` after state 200 entry.
- Missing partner preserves caller control/standby and records no successful operation.
- Gates: 168 files / 1640 tests, TypeScript 7 typecheck/build, boundaries, diff check, and 538/538 traces (507 required, 31 optional).

## Blocked

Dynamic control, TagOut control, redirects, member/leader order, gameplay ownership, and full IKEMEN parity.
