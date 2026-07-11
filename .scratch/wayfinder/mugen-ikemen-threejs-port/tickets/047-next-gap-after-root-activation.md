# Choose next gap after root activation

Type: research
Status: open
Blocked by: None

## Question

How should Player, Partner, Enemy, EnemyNear, and P2 selection consume complete roots versus `activeRootIdsBySide` without widening CNS scheduling?

## Current boundary

Atomic host/test standby batches and plural active-root projection exist. Storage, scheduler, input, combat, round, presentation, and effect stores remain P1/P2. CNS TagIn/TagOut is not compiled or executed.
