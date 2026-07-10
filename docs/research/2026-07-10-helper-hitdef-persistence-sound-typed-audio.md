# Helper HitDef Persistence Sound Typed Audio

Date: 2026-07-10
Status: implemented and trace-verified

## Question

How should first-generation helper-local direct HitDef routes expose authored contact sounds in deterministic runtime telemetry without claiming browser playback parity?

## Primary Sources

- Elecbyte State Controller Reference: <https://www.elecbyte.com/mugendocs/sctrls.html>
  - `HitDef hitsound` and `guardsound` use sound group/index refs; `S` selects the player's SND archive.
- Elecbyte CNS Reference: <https://www.elecbyte.com/mugendocs/cns.html>
  - StateDef `hitdefpersist`, `movehitpersist`, and `hitcountpersist` govern which attack/contact counters survive state changes.

## Baseline

Five required traces already proved first-generation helper direct contact and persistence behavior, but their operation requirements were only `helper` and `hitdef`. `RuntimeContactPresentationWorld` could record typed audio when active move metadata contained a resolved sound value, but helper direct HitDef activation did not supply the helper expression resolver and helper combat did not forward audio operations to the owner trace.

## Implementation

- `HelperSystem` now resolves direct HitDef `hitsound` / `guardsound` through the existing helper-local numeric expression context.
- `RuntimeHelperCombatWorld` forwards accepted contact audio operations while attributing them to the root player owner; helper-side sound and FightFX events remain on the helper actor.
- `RuntimeMatchCombatBridgeWorld` forwards the typed operation into match trace telemetry.
- HitBy rejection remains fail-closed: no sound event, FightFX event, or typed audio operation is emitted.

## Evidence

| Required trace | Trace | Final | Contact sound |
| --- | --- | --- | --- |
| `synthetic-imported-helper-hitdef` | `99b55e47` | `cd02ded0` | `S5,0` |
| `synthetic-imported-helper-hitdefpersist` | `61b3ffbf` | `b005d52a` | `S5,1` |
| `synthetic-imported-helper-hitcountpersist` | `ba2a19f4` | `e9ccdc9c` | `S5,2` |
| `synthetic-imported-helper-movehitpersist` | `1e37fd5c` | `4d6e93b5` | `S5,3` |
| `synthetic-imported-helper-moveguardedpersist` | `4b48e97d` | `c7ce0ae6` | `S6,4` |

Focused green: 7 helper/bridge tests, 1 direct dynamic-resolution test, 5 selected trace tests, TypeScript typecheck, and `pnpm qa:trace` 524/524 artifacts with 493 required and 31 optional. Full regression passes 153 files / 1504 tests, production build, and architecture boundaries.

## Claim Boundary

Allowed: these five bounded first-generation helper routes resolve helper-local contact sound refs, retain helper contact/persistence behavior, and record owner-attributed typed `audio:playsnd` after accepted hit or guard contact.

Blocked: exact SND archive lookup and playback, channel priority, timing, mixing, panning, nested helper ancestry, redirect/team ownership, exact presentation ordering, renderer parity, score movement, and full MUGEN/IKEMEN helper/audio parity.
