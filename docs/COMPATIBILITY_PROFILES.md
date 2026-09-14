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

## Fresh Projectile `forcestand` / `forcecrouch`

A fresh root or Helper Projectile evaluates authored `forcestand` and
`forcecrouch` expressions once in the creator context and stores the resulting
booleans. Later creator-variable changes do not rewrite that Projectile.
Finite nonzero values become true; explicit zero becomes false; a non-finite
component stays unset without discarding its finite sibling. Omitted fields stay
unset on this spawn path. Helper `var()` evaluation uses the Helper caller, not
the root owner. Accepted default get-hit selection consumes the stored flags;
guard contact does not.

This adapts boolean `evalB` posture cases from Ikemen-GO
`149402fa8b50a64e9af8316772e0cd266025133a`, `src/bytecode.go` `hitDef.runSub`
(`hitDef_forcestand` / `hitDef_forcecrouch`) and Projectile `Run` delegation
into that same HitDef path. Local compiler, spawn, Helper, and imported
root-contact tests cover the stored flags. Existing combat tests already route
stored `forceStand`/`forceCrouch` into Common1 5000/5010 for imported defenders.

Allowed: this local compilation, spawn-once storage, Helper-versus-root caller,
and accepted-versus-guard contact behavior. Not established: HitDef
`finalizeParams` omitted `forcestand` ground-Y default on fresh Projectiles,
full get-hit posture physics, ModifyProjectile-retention copied onto fresh
spawn, nested Helper contact, airborne/lying posture, teams, rollback, or full
MUGEN/Ikemen compatibility.

`ModifyProjectile` uses the existing decimal caller evaluator for dynamic
`forcenofall` before conversion to a boolean. The focused mutation test distinguishes
0.5 from an integer evaluator's zero and preserves nonselected Projectiles.
This focused proof does not establish redirected contact or full mutation parity.

The same decimal evaluation applies to dynamic `kill`, `guard.kill`, `fall.kill`,
`forcestand`, `forcecrouch`, and `fall.recover`. Mutation coverage checks positive
and negative fractions, a later explicit zero, unchanged omitted recovery time,
and an unselected Projectile. These are local mutation claims, not full contact
or recovery-timing parity.

## HitDef boolean evaluation

`HitDef` and `ModifyHitDef` preserve fractional `forcestand`, `forcecrouch`, and
`forcenofall` values through compilation and caller evaluation. Finite nonzero
values become true; explicit zero becomes false. Omitted fresh `forcestand`
still derives from ground Y velocity, while omitted mutation fields keep their
current values. Root dispatch and Helper dispatch use decimal evaluation.

Source basis: Ikemen-GO `149402fa8b50a64e9af8316772e0cd266025133a`,
`src/bytecode.go:7647-7652`, evaluates these fields as booleans before converting
posture flags to integers. Local compiler, HitDef, Helper, and redirected root
mutation tests cover fractional values and unchanged omission behavior.

Allowed: this local compilation and active-move evaluation behavior. Not
established: fractional contact parity against upstream, every redirected or
nested Helper path, other boolean field families, or full engine compatibility.

## HitDef fall and lethal flags

Direct `HitDef` and `ModifyHitDef` preserve finite fractions in `fall`,
`air.fall`, `fall.kill`, `kill`, `guard.kill`, and `hitonce`. Compiler and Helper
evaluation no longer truncate these values before the final nonzero check.
Existing caller-context tests retain independent mutation and omission checks;
literal coverage includes positive fractions, negative fractions, and zero.

The source basis is the same pinned Ikemen-GO revision above, `bytecode.go`
lines 7586-7593 and 7717-7720, with corresponding mutation cases. Local imported
contact tests observe `fall = 0.5` on the receiver and lethal guarded damage for
`guard.kill = 0.5` and `-0.5`; explicit zero still leaves one life.

Allowed: these local evaluation and contact observations. Not established:
upstream differential parity, every Helper
contact path, complete recovery timing, or full MUGEN/Ikemen compatibility.

## Projectile fall boolean evaluation

Fresh Projectile `fall`, `air.fall`, and `fall.kill` preserve finite fractional
values in the Projectile, root caller, and Helper caller evaluators. Literal
tests cover positive/negative fractions and zero; existing tests preserve
non-finite sibling filtering, missing fields, and Helper ownership assertions.
An imported root contact with `fall = Time + 0.5` observes the receiver falling
and preserves its fall damage, velocity, and GetHitVar values.

At the pinned Ikemen-GO revision, `projectile.Run` delegates HitDef parameters to
`hitDef.runSub` (`bytecode.go:8294`) before finalization. This is the source basis
for preserving boolean evaluation rather than truncating its numeric input.

Allowed: these local creation and root-contact observations. Not established:
all Helper contact paths, complete fall-kill/recovery timing, upstream
differential parity, or full engine compatibility.

## Recovery and bounce boolean evaluation

`ModifyProjectile` also preserves fractional dynamic `fall` and `air.fall`
values through its existing decimal caller callback. Mutation tests cover
positive and negative fractions, explicit zero, unchanged recovery metadata,
and an unselected Projectile. This is local mutation evidence, not proof of
every post-mutation contact or upstream differential parity.

Recovery and bounce evaluation is locally covered for `fall.recover`,
`down.recover`, and `down.bounce`: finite nonzero fractions become true while
recovery times remain integers. Fresh Projectile recovery retains its typed
package even for literals. Dynamic Projectile bounce is compiled and evaluated
once in the root or Helper caller context; zero is false and non-finite results
remain unset. ModifyProjectile down-recovery and bounce use decimal evaluation.
The source basis is the pinned Ikemen-GO `evalB` cases at `bytecode.go:7662`,
`7724`, and `7898`, distinct from integer recovery-time cases.

These are compilation, creation, mutation, and payload observations. They do
not establish complete rebound trajectories, recovery windows, nested Helper
contact parity, or upstream differential parity.

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
