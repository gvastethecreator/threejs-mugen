# Research: FightScreen layout PalFX

Date: 2026-07-20
Question: Which `AnimLayout.palfx` fields can the current FightScreen
renderer carry with a bounded claim?

## Findings

- Pinned `common.go` defines `AnimLayout` with a `PalFX`, calls
  `ReadPalFX(pre+"palfx.", ...)` during layout loading, advances the effect in
  `Action`, and passes it into `DrawAnim`.
- Pinned `common.go` reads layout PalFX values for `time`, `add`, `mul`, the
  sinusoidal fields, `invertall`, `invertblend`, `color`, and `hue`.
- Pinned `image.go` enables a `PalFX` while `time != 0`, updates its effective
  values, decrements positive time once per engine tick, and maps the result to
  shader palette state. This is broader than the current MeshBasicMaterial
  adapter.
- The local actor renderer already has a bounded material adaptation for
  `add`, `mul`, `color`, duration, and inversion. Sharing that calculation
  avoids two local interpretations for the same visible runtime effect.

## Port decision

- Add `MugenFightScreenPaletteFx` to the system-asset contract.
- Parse integer `time`, integer RGB `add`/`mul`, numeric `color`, and boolean
  `invertall` from `top.palfx.*` and `bgN.palfx.*`.
- Resolve positive duration against the FightScreen announcement frame tick;
  keep negative or omitted time active and treat explicit zero as disabled.
- Apply the shared material adapter while retaining the authored layout blend
  policy, and expose `paletteFxApplied`/`paletteFxExpired` diagnostics.

## Uncertainty and next boundary

The local material path does not reproduce the source indexed-palette shader,
negative color arithmetic, sine cycles, hue shift, invert blend modes,
interpolation, or effect composition. Primary text, KO/winner families,
screenpack browser fixtures, and complete draw interleaving remain separate.
The next boundary can add one source transform or extend the effect contract
after exact palette ownership is settled.

## Evidence

- Focused loader, FightScreen renderer, and CharacterRenderer tests pass:
  3 files / 11 tests.
- TypeScript 7 typecheck and production build pass; the build reports the
  known large-chunk warning.
- The first browser smoke attempt timed out in Studio project reopen. The
  second `pnpm qa:smoke` run passed with `status: passed` and produced the
  Runtime/Studio matrix.
- Reviewed captures:
  `.scratch/qa/qa-smoke/runtime-desktop.png`,
  `.scratch/qa/qa-smoke/runtime-mobile.png`,
  `.scratch/qa/qa-smoke/studio-project-authoring.png`, and
  `.scratch/qa/qa-smoke/studio-debug.png`.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/image.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/common.go`,
  `.scratch/external/Ikemen-GO/src/fightscreen.go`, and
  `.scratch/external/Ikemen-GO/src/image.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
