# Official M.U.G.E.N / Ikemen-GO roadmap comparison — 2026-07-30

## Question

Which next tasks move the current port toward real M.U.G.E.N 1.1 and
Ikemen-GO compatibility, based on each project's official documentation and
the repository's current implementation rather than on old task volume?

## Bottom line

The next queue is **T424 -> T425 -> T426 -> T427**:

1. close same-tick current-state transition chaining for M.U.G.E.N roots and
   helpers;
2. reconcile and implement Ikemen's documented stable P2 switching contract;
3. make imported `select.def` own one real roster/stage selection path; and
4. replace the disconnected ZSS model with a loader-to-live-runtime vertical
   slice.

This order keeps one bounded continuation from T419-T423, but gives priority
to shared M.U.G.E.N VM and package foundations. No score moves from this
research or task creation.

## Authority boundary

- Elecbyte's [M.U.G.E.N 1.1 Beta 1 overview and file inventory](https://www.elecbyte.com/mugendocs-11b1/mugen.html),
  [CNS format](https://www.elecbyte.com/mugendocs-11b1/cns.html), and
  [1.1 state-controller reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
  define the legacy baseline.
- The official [Ikemen-GO README](https://github.com/ikemen-engine/Ikemen-GO)
  targets backward compatibility on par with M.U.G.E.N 1.1 Beta while adding
  features. Its [wiki home](https://github.com/ikemen-engine/Ikemen-GO/wiki)
  explicitly documents Ikemen additions and sends legacy behavior back to
  Elecbyte.
- The Ikemen wiki is mutable. It selects candidate behavior, but implementation
  still has to agree with the repository's normative source pin
  [`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`](https://github.com/ikemen-engine/Ikemen-GO/tree/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703).

## Comparison with the current port

| Surface | Official contract | Current repository evidence | Roadmap decision |
| --- | --- | --- | --- |
| State execution | Elecbyte runs `-3`, `-2`, `-1`, then the current state. A `ChangeState` in the current state skips the remaining controllers and continues from the beginning of the destination state in the same tick. Controller order is significant; parameters are evaluated when the controller triggers. | Root and helper negative-state order, bounded Ikemen `-4`/`+1`, negative-state append, and helper `keyctrl` already have tests. `runActiveStateControllers` invokes the current state once and does not consume its scan result to continue a destination-state chain. | **T424** closes the shared root/helper current-state transition loop with a deterministic cycle guard and trace. Do not replan negative-state order. |
| P2 selection | Ikemen's [new P2 redirection documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29#p2) says the selected enemy ignores state 5150, drives automatic facing, and changes only when another enemy is at least 30 pixels closer. | T419-T423 provide filtered P2/Partner rosters, source-shaped distance, names, and a live expression consumer. The local cache signature includes every position, so observable movement causes immediate reordering rather than retaining the prior P2. | **T425** first reconciles the current wiki with pinned `char.go`, then implements the selected source-epoch retention/invalidation contract without changing `EnemyNear`, Partner, or legacy profiles. |
| Game package selection | Elecbyte lists `select.def` as the character/stage configuration and `system.def` as the title/select-screen definition. Character, stage, motif, AIR, SFF, and SND files form one assembled game. | `select.def` is recognized by package/scanner tests, while the App's playable roster and stage remain owned by local project/demo state. Existing Common1/FightFX loading is partial but real. | **T426** creates a versioned `select.def` roster/stage manifest and connects it to one real Play/Studio selection path. Full arcade rules and screenpack rendering remain later gates. |
| Ikemen state language | The official [ZSS guide](https://github.com/ikemen-engine/Ikemen-GO/wiki/ZSS) defines ZSS as an executable alternative to CNS, allows CNS/ZSS mixing, and supports `.cns.zss` fallback. | The scanner recognizes ZSS syntax, but product loaders report it unsupported. `src/mugen/da30/ZssSubsetRuntime.ts` executes isolated model operations and is not a character loader/compiler/live runtime path. | **T427** parses a named ZSS state subset into the existing state IR, honors direct and fallback loading, mixes with CNS deterministically, and proves one live `PlayableMatchRuntime` route with explicit unsupported diagnostics. |

## Selected task contracts

### T424 — M.U.G.E.N same-tick state transition chain

Priority: P0. Dependencies: T423 only as the current repository checkpoint.

The executor must expose whether `ChangeState` stopped a state pass, restart at
the destination state in the same tick, and apply the rule to imported roots
and helpers under `mugen-1.1` and `ikemen-go`. A bounded transition budget must
turn cycles into deterministic diagnostics instead of freezing the browser.
Proof requires focused order/cycle tests and one required imported trace.

### T425 — Ikemen stable P2 switch contract

Priority: P1. Dependency: T419-T423 and a recorded 05b/current-wiki source
decision.

The task must distinguish the behind-distance penalty already implemented from
the documented 30-pixel target-retention threshold. Tests cover 29, exact 30,
greater-than-30, KO/ineligible removal, ties, and a live `P2Name` consumer.

### T426 — M.U.G.E.N `select.def` playable roster/stage authority

Priority: P1. Dependency: the existing VFS/character/stage loaders.

The first contract covers direct character and stage entries, stable source
locations/fingerprints, safe path resolution, missing/malformed diagnostics,
and one real product consumer. It must preserve the existing manual/demo
fallback when no valid manifest exists. Browser proof is required when the
selection UI changes.

### T427 — Ikemen live ZSS state pipeline

Priority: P2. Dependencies: T424 and the existing scanner/source-authority
contracts.

The parser/compiler path must lower declared supported ZSS constructs to the
same runtime IR as CNS, keep unsupported constructs located and fail-closed,
support direct `.zss` and `.cns.zss` fallback, and execute through the real
character loader and match runtime. The isolated DA30 model is historical
evidence only and cannot satisfy this task.

## Work deliberately not recreated

- M.U.G.E.N/Ikemen negative-state source precedence and Ikemen append behavior.
- Root `-3/-2/-1` order, Ikemen root/helper `-4/+1`, and bounded helper
  `keyctrl` inheritance already present in focused runtime tests.
- Existing Common1 state-source fallback, FightFX AIR/SFF/SND plumbing, and
  scanner-only ZSS recognition.
- T419-T423 P2 candidate filtering, distance order, P2-family/Partner name
  reads, and active expression context wiring.

## Uncertainty and next action

The current Ikemen wiki and the pinned 05b source may describe different P2
cache epochs. T425 therefore cannot change runtime behavior until that delta is
recorded in the source-authority ledger. The immediate executable task is
T424; after its focused red/green proof, run the relevant expanded runtime
suite and add a required trace before any compatibility claim or score review.
