# External Local Fixtures

This project does not commit external MUGEN characters. For private/local QA, downloaded characters live under `.scratch/external/` and generated browser-upload packages live under `.scratch/fixtures/`; both are ignored by Git.

## Rebuild Packages

```bash
python scripts/package_external_mugen_fixtures.py
```

The script expects these local downloads:

| Fixture | Source URL | Local input |
| --- | --- | --- |
| `kfm-official` | https://www.elecbyte.com/mugenfiles/1.1/mugen-1.1b1.zip | `.scratch/external/mugen-1.1b1/chars/kfm/` plus `data/common1.cns` and `stages/kfm.*` |
| `kfm720-official` | https://www.elecbyte.com/mugenfiles/1.1/mugen-1.1b1.zip | `.scratch/external/mugen-1.1b1/chars/kfm720/` plus `data/common1.cns` and `stages/stage0-720.*` |
| `codefuman` | https://github.com/Jesuszilla/CodeFuMan | `.scratch/external/CodeFuMan-master/CodeFuMan-master/` |
| `sf3-ryu-demo-mugenjs` | https://github.com/Tatayecorp/demo_mugenJS | `.scratch/external/demo_mugenJS-master/demo_mugenJS-master/chars/SF3_Ryu/` |

Output manifest:

```txt
.scratch/fixtures/external-fixtures.json
```

## Current Visual QA

Latest full browser upload pass:

```txt
output/playwright/external-fixtures-final/fixture-load-results.json
```

Screenshots:

```txt
output/playwright/external-fixtures-final/kfm-official.png
output/playwright/external-fixtures-final/kfm720-official.png
output/playwright/external-fixtures-final/codefuman.png
output/playwright/external-fixtures-final/sf3-ryu-demo-mugenjs.png
output/playwright/external-fixtures-final/kfm-official-folder.png
```

Results from that pass:

| Fixture | Load path | Character | Files | Animation coverage | State coverage | Sprite coverage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `kfm-official.zip` | ZIP | Kung Fu Man | DEF/SFF/AIR/CMD/CNS/SND true | 117 actions, 113 with collision boxes | 167 parsed, 34 runtime-routable | 281/281 SFF v2 | Imports one stage, missing only stage music file |
| `kfm720-official.zip` | ZIP | Kung Fu Man | DEF/SFF/AIR/CMD/CNS/SND true | 117 actions, 113 with collision boxes | 169 parsed, 34 runtime-routable | 281/281 SFF v2 | Imports one 720p training stage |
| `codefuman.zip` | ZIP | Code Fu Man | DEF/SFF/AIR/CMD/CNS/SND true | 111 actions, 107 with collision boxes | 165 parsed, 30 runtime-routable | 274/274 SFF v1 PCX | Exercises SFF v1 previous-palette PCX sprites |
| `sf3-ryu-demo-mugenjs.zip` | ZIP | Ryu | DEF/SFF/AIR/CMD/CNS true, SND false | 712 actions, 483 with collision boxes | 1686 parsed, 4 runtime-routable | 1285/1285 SFF v1 PCX | Heavy parser stress fixture with `.txt` CNS/CMD paths and many unsupported triggers |
| `.scratch/external/mugen-1.1b1/chars/kfm` | Folder | Kung Fu Man | DEF/SFF/AIR/CMD/CNS/SND true | 117 actions, 113 with collision boxes | 116 parsed, 32 runtime-routable | 281/281 SFF v2 | Correctly warns that `common1.cns` is missing when only the character folder is selected |

## SFF v1 Regression Covered

CodeFuMan and Ryu previously decoded only a handful of SFF v1 sprites because the PCX reader treated the last 768 bytes as an embedded palette even when the SFF subfile used `samePalette`. The decoder now uses the SFF subfile flag: previous-palette sprites decode the full PCX RLE stream and borrow the previous palette. Unit coverage lives in `src/tests/SffParser.test.ts`.

## Current Runtime QA

Latest imported-runtime frame-step pass:

```txt
output/playwright/imported-runtime-frame-step/frame-step-runtime-audit.json
output/playwright/imported-runtime-command-debug/kfm-qcf-command-debug.json
```

Screenshots:

```txt
output/playwright/imported-runtime-frame-step/kfm-after-x-step5.png
output/playwright/imported-runtime-frame-step/codefuman-after-x-step5.png
output/playwright/imported-runtime-frame-step/codefuman-after-qcf-x-step9.png
output/playwright/imported-runtime-command-debug/kfm-qcf-command-debug.png
output/playwright/runtime-session-debug-panel/kfm-runtime-session-fields-focused.png
```

Runtime evidence from those passes:

| Fixture | Runtime route | Evidence |
| --- | --- | --- |
| `kfm-official.zip` | Physical `A` maps to MUGEN `x`, routes `[State -1, Stand Light Punch]` into state `200`, executes `HitDef`, and renders real KFM SFF sprites on the imported Mountainside Temple stage. | `kfm-after-x-step5.png`, session `executedStates: [200]`, `routedStates: [200]`, `executedControllers.HitDef: 1` |
| `kfm-official.zip` | `D, DF, F, x` routes `[State -1, Light Kung Fu Palm]` into state `1000` when frame-stepped with the correct MUGEN `x` button. | `kfm-qcf-command-debug.png`, active commands include `QCF_x`, `lastRoutedState: { stateId: 1000, name: "Light Kung Fu Palm" }` |
| `codefuman.zip` | Physical `A` maps to MUGEN `x`, routes state `200`, executes `HitDef`, and renders real CodeFuMan SFF v1 sprites. | `codefuman-after-x-step5.png`, session `executedStates: [200]`, `executedControllers.HitDef: 1` |
| `codefuman.zip` | `D, DF, F, x` routes state `1000`, executes `HitDef` and `PlaySnd` in the partial imported runtime. | `codefuman-after-qcf-x-step9.png`, session `executedStates: [1000]`, `executedControllers.HitDef: 1`, `PlaySnd: 1` |

This is still partial runtime support. It proves real CMD State -1 routing, AIR/SFF rendering, selected CNS controllers, hitbox timing, and compatibility-session reporting; it does not prove full authored MUGEN behavior for those characters.

`src/tests/RuntimeTrace.test.ts` also contains optional official KFM trace gates. They run only when `.scratch/fixtures/kfm-official.zip` exists locally, load the ZIP through the normal browser loader path, route MUGEN `x` into state `200`, verify the target reaches the current partial hitstun/get-hit snapshot, verify a longer `x` recovery script returns P1 to idle/control, and route `D, DF, F, x` into Light Kung Fu Palm state `1000`. The gates verify imported actor source, routed/executed state IDs, executed controllers, active commands such as `x` and `QCF_x`, and final actor state/control constraints where relevant. The required portable test uses a synthetic imported CMD/CNS fixture so the repository test suite does not depend on ignored external assets.
