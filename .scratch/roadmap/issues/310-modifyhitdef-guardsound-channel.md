# Issue 310 — `ModifyHitDef` `guardsound.channel`

Status: **closed-bounded** (T736, 2026-08-11)

## Objective

Close the next bounded Ikemen-only live `ModifyHitDef guardsound.channel`
replacement through root/RedirectID and Helper caller paths, preserving the
active guard channel when the parameter is omitted or unresolved.

## Official basis

The pinned Ikemen-GO `149402f` HitDef subcompiler accepts `guardsound.channel`
as a separate integer parameter and the shared `ModifyHitDef` `runSub` evaluates
it in the original caller context before mutating the redirected active HitDef.
This is the guard-side counterpart to T735. Fresh defaults, playback/mixing and
full audio parity must remain separate claims.

## Bounded scope

- static and caller-context dynamic `guardsound.channel` on live `ModifyHitDef`;
- root/RedirectID and Helper caller evaluation;
- omission/unresolved preservation of the active guard channel;
- typed guard-contact audio metadata and one required accepted-guard trace.

## Evidence

- `src/mugen/compiler/ControllerOps.ts` now preserves static and dynamic
  `guardsound.channel` in the typed ModifyHitDef IR and rejects malformed
  expressions.
- `HitDefSystem`, root/RedirectID, and Helper caller paths resolve finite
  values once in caller context; omission or unresolved values preserve the
  active channel.
- Guard contact presentation emits the resolved channel in typed
  `audio:playsnd` telemetry without changing hit-only channel selection.
- Focused compiler/runtime/contact coverage passes `338/338`; typecheck and
  diff hygiene pass.
- Required artifact
  `synthetic-imported-modifyhitdef-dynamic-guardsound-channel.json` passes
  with trace checksum `a689adf2`, final checksum `d5bc517f`, channel `8`, and
  guard-only combat evidence. Aggregate QA passes `823/823` artifacts (`789`
  required, `34` optional).

## Excluded

Fresh defaults, `hitsound.channel`, sound group/index replacement, exact SND
lookup/playback/mixing/priority, Projectiles, ModifyProjectile, renderer timing,
teams, rollback and full M.U.G.E.N/Ikemen audio parity remain out of scope.
