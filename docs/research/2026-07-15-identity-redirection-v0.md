# Identity and Roster Redirection v0

## Scope

Entry 543 closes a bounded runtime slice for MUGEN CNS identity and roster
reads. The implementation reuses the existing `RuntimeRootSelection/v0`
projection instead of creating a second team roster. It adds `partner`,
`enemy`, indexed roster reads, `NumPartner`, `P3Name`, and `P4Name` while
preserving the existing nearest-distance `EnemyNear` policy.

## Official references

- [Elecbyte MUGEN 1.1 trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
  defines `NumPartner`, `P1Name`, `P2Name`, `P3Name`, and `P4Name` identity
  reads. The reference distinguishes partners from normal helpers and neutral
  players and describes the primary and secondary opponent names.
- [Elecbyte CNS redirection reference](https://elecbyte.com/mugendocs/cns.html)
  documents `partner`, `enemy`, `enemy(n)`, `enemyNear`, `enemyNear(n)`, and
  other redirection keywords. A destination that cannot be resolved is a
  bottom/false-style result for the bounded evaluator route.

## Implemented mapping

| Read | Runtime source | Bounded policy |
| --- | --- | --- |
| `partner`, `partner(n)` | `rootSelection.partnerIds` | Stable authored root order; missing entries fail closed. |
| `enemy`, `enemy(n)` | `rootSelection.enemyIds` | Stable root order, intentionally distinct from nearest `EnemyNear`. |
| `EnemyNear` | existing opponent-selection world | Nearest body-distance order and current fallback remain unchanged. |
| `NumPartner` | projected partner roster length | Counts the current root-selection projection, including its existing addressability policy. |
| `P3Name` | first projected partner | Empty when no projected partner exists. |
| `P4Name` | second projected enemy | Empty when no secondary projected enemy exists. |
| `P2Name` / `P2*` | existing `p2CandidateIds` | No fallback to a non-selected opponent when explicit root selection is present. |

Static and dynamic non-negative indices are accepted. Negative and non-finite
indices report typed unsupported features such as `partner(negative)` and fail
closed. Compiler support scanning removes the redirect context before
classifying the redirected expression, so `Enemy(var(0)), Life` remains
executable when `var` is supported.

## Evidence and limits

- 4 focused runtime/compiler files: 95 tests passed.
- New synthetic `Enemy` trace: passed.
- Full `pnpm qa:trace`: 601/601 artifacts, 567 required, 34 optional, 0
  failed, 0 skipped.
- `pnpm typecheck`: passed on TypeScript 7.
- `node --check scripts/qa_traces.cjs`: passed.

This does not claim exact Simul/Tag lifecycle, P3-P8 scheduling, playerid or
helper/neutral redirection, recursive redirects, input ownership, combat/effect
targeting, or full MUGEN/IKEMEN parity. Visual smoke was not rerun because the
slice has no frontend or renderer surface.

## Next cut

Keep one topology source of truth and extend the next R2 slice through root-aware
CNS scheduling or Tag input ownership. Add lifecycle traces before allowing
standby roots to mutate combat, effects, presentation, or resources.
