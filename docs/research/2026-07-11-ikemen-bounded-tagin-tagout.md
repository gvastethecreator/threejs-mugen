# IKEMEN bounded TagIn/TagOut research

## Question

What minimum TagIn/TagOut subset can enter the typed runtime without widening standby roots into gameplay consumers?

## Answer

Compile and execute only parameterless, self-targeted `TagIn` and `TagOut` first. `TagIn` clears the caller root's standby flag; `TagOut` sets it. Reject controllers containing `self`, `partner`, `stateno`, `partnerstateno`, `ctrl`, `leader`, `partnerctrl`, or `memberno` from this bounded route. Do not infer an opposite partner transition.

This isolates one official semantic axis: standby mutation. The existing plural active-root projection can then refresh selection after each root controller phase without adding input, combat, round, presentation, resource, leader, or member-order ownership.

## Primary sources

- [Pinned IKEMEN GO TagIn/TagOut bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5227-L5397)
- [Official IKEMEN GO TagIn/TagOut controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#tagin)

## Findings

- Both controllers have no required parameters and default to affecting the caller.
- TagIn removes standby; TagOut adds standby.
- Partner selection and caller suppression are optional TagOut axes, not required base behavior.
- State, control, leader, partner control, and member order are independent optional mutations.
- Official behavior does not automatically tag another root in or out.

## Implementation consequence

Add one typed team-standby operation carrying only `standby: boolean`. Admit `tagin` and `tagout` to the standby CNS capability list only when compilation proves the controller is parameterless. Execute through a root-team hook that validates player-root identity, mutates the caller, and makes subsequent roots resolve selection from live team state in the same tick.

## Uncertainty and blocked scope

Exact expression timing and precedence for every optional parameter remain outside this cut. Partner targeting, helper effects, state changes, control, leader/member order, implicit tag-mode cardinality, gameplay ownership, and full IKEMEN parity remain blocked.
