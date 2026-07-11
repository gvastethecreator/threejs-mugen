# Execute static TagIn leader

Type: implementation
Status: resolved
Blocked by: None

## Question

How should static one-based stable PlayerNo TagIn `leader` rotate explicit Tag order with live KO status and aggregate validation?

## Acceptance

- Static positive integer `leader` compiles only for TagIn.
- Runtime maps stable PlayerNo to same-side root id in explicit Tag mode.
- Leader/order mutation follows state/member/control ordering and sinks dead non-leaders.
- Invalid/missing/opposing leader leaves every Tag mutation unchanged.
- Stable root slots, scheduler, selection, gameplay, and rendering remain unchanged.

## Answer

Static positive `leader` compiles only for TagIn as one-based stable `leaderPlayerNo`. Explicit Tag runtime resolves `pN`, prevalidates existence, side, and Tag membership before all mutations, then rotates leader after caller state/member/control and before standby. Rotation reads live root life, sinks dead non-leaders through `RuntimeTagTeamOrder`, updates mutable order/leader diagnostics, and preserves stable slots plus all unrelated consumers. Missing or opposing ids fail atomically.
