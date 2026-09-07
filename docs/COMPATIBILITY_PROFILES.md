# Compatibility profiles

A feature can parse, scan, compile, execute partially, or match parity. Those are different claims.

Current operating sentence:

```txt
Partial MUGEN 1.1 fixture-backed runtime, native generated roster, IKEMEN
scanner/reporting plus explicitly gated runtime slices.
```

## Profiles

| Profile | Purpose | Current level | Runtime claim |
| --- | --- | --- | --- |
| `native-runtime` | Authored and generated fighters and stages for this sandbox. | Playable baseline. | Playable through local atlas and runtime data. |
| `mugen-1.0` | Legacy MUGEN 1.0 character and stage content. | Loader/parser plus partial SFF v1 and CMD/CNS routes. | Partial only when a trace proves execution. |
| `mugen-1.1` | Elecbyte MUGEN 1.1 content such as official KFM. | Primary imported fixture target. | Partial KFM/Common1 fixture-backed runtime. |
| `ikemen-go-scan` | IKEMEN-GO content classification. | Scanner and reporting only. | No execution claim. |
| `ikemen-go` | Explicit IKEMEN-GO runtime policy. | Executed partial for named source-backed slices. | No general IKEMEN content execution claim. |
| `ikemen-go-exec-later` | Future IKEMEN-specific execution. | Blocked. | No general ZSS, Lua, rollback, netplay, or model-stage claim. |
| `shared-module-later` | Future non-fighting modules. | Blocked by fighting contracts. | No generic engine claim until one non-fighting slice runs. |

## Fresh Projectile `forcenofall`

The runtime evaluates `forcenofall` expressions when a root or Helper creates a
Projectile. The result stays on that Projectile even if the creator's variables
change. Explicit zero remains false; non-finite results leave the flag unset.
Helper expression context remains distinct from root Projectile ownership.

This adapts boolean caller evaluation from Ikemen-GO
`149402fa8b50a64e9af8316772e0cd266025133a`, `compiler_functions.go` and
`bytecode.go`. The required local trace
`synthetic-imported-projectile-dynamic-forcenofall` observes the flag overriding
enabled fall on accepted root contact. Existing combat tests preserve receiver
fall metadata on guard contact. The required local trace
`synthetic-imported-helper-projectile-dynamic-forcenofall` also uses
`var(0) / 2.0` to distinguish a nonzero fractional Helper value from the root's
zero value. It checks the receiver's cleared fall state and root/Helper ownership.

Allowed: these local expression, spawn, and contact behaviors. Not established:
upstream differential parity, nested Helper contact coverage, full fall recovery
timing, team/rollback behavior, or complete MUGEN/Ikemen compatibility.

`ModifyProjectile` uses the existing decimal caller evaluator for dynamic
`forcenofall` before conversion to a boolean. The focused mutation test distinguishes
0.5 from an integer evaluator's zero and preserves nonselected Projectiles.
This focused proof does not establish redirected contact or full mutation parity.

The same decimal evaluation applies to dynamic `kill`, `guard.kill`, `fall.kill`,
`forcestand`, `forcecrouch`, and `fall.recover`. Mutation coverage checks positive
and negative fractions, a later explicit zero, unchanged omitted recovery time,
and an unselected Projectile. These are local mutation claims, not full contact
or recovery-timing parity.

## Support levels

Use these labels from [QA_AND_ACCEPTANCE_GATES.md](QA_AND_ACCEPTANCE_GATES.md):

```txt
Parsed
Decoded
Recognized
Compiled
Executed Partial
Executed Parity
Unsupported
Unknown
```

Do not write `supported` without naming the level.

Examples:

- `SFF v2 LZ5 decoded for KFM sprites` is a decoded asset claim.
- `HitDef compiled into typed operation evidence` is a compiler claim.
- `KFM state 200 routes and hits in kfm-official-x.json` is an executed-partial fixture claim.
- `ZSS recognized as IKEMEN-only unsupported` is a scanner claim.

## Profile rules

Native and generated fighters can be playable without proving MUGEN compatibility. They never prove imported MUGEN compatibility.

MUGEN 1.0 claims stay on DEF/AIR/CMD/CNS parsing, SFF v1 decoding, and simple controller execution when traces exist. Parser success is not a MUGEN 1.1 or IKEMEN runtime claim.

MUGEN 1.1 is the near-term imported runtime target. A runtime claim must name the fixture, the trace artifact, and the routed command or state.

`ikemen-go-scan` classifies content. `ikemen-go` executes only the named slices that have source-backed traces. Lua, rollback, netplay, and model stages stay blocked.

## Evidence

Tracked gate artifacts live under `docs/evidence/`. Generated traces and smoke captures stay under ignored `.scratch/qa/`. Optional official KFM confirmation uses ignored `.scratch/fixtures/kfm-official.zip`.
