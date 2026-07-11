# Choose next gap after root activation

Type: research
Status: resolved
Blocked by: None

## Question

How should Player, Partner, Enemy, EnemyNear, and P2 selection consume complete roots versus `activeRootIdsBySide` without widening CNS scheduling?

## Current boundary

Atomic host/test standby batches and plural active-root projection exist. Storage, scheduler, input, combat, round, presentation, and effect stores remain P1/P2. CNS TagIn/TagOut is not compiled or executed.

## Answer

Use `RuntimeRootSelection/v0`: current identity stays actor-local; Partner enumerates complete same-side roots excluding self; Enemy enumerates active opposing roots including over-KO; P2 enumerates active opposing player roots excluding over-KO. Stable registry order is the bounded ordering policy. Expression-context routing and nearest-distance P2 ordering remain separate follow-up gates.
