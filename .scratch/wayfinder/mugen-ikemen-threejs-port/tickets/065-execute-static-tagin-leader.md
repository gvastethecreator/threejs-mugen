# Execute static TagIn leader

Type: implementation
Status: open
Blocked by: None

## Question

How should static one-based stable PlayerNo TagIn `leader` rotate explicit Tag order with live KO status and aggregate validation?

## Acceptance

- Static positive integer `leader` compiles only for TagIn.
- Runtime maps stable PlayerNo to same-side root id in explicit Tag mode.
- Leader/order mutation follows state/member/control ordering and sinks dead non-leaders.
- Invalid/missing/opposing leader leaves every Tag mutation unchanged.
- Stable root slots, scheduler, selection, gameplay, and rendering remain unchanged.
