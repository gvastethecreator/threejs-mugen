# IKEMEN Tag RedirectID research checkpoint

## Outcome

RedirectID ownership is source-pinned and the missing architecture boundary is explicit: the sandbox needs a live numeric character PlayerID registry before redirected Tag mutation.

## Evidence

- The official wiki defines RedirectID as an optional global state-controller parameter targeting a designated PlayerID and confirms TagIn can affect Helpers.
- Pinned compiler/runtime source proves caller-context integer evaluation, redirect-first lookup, global root/Helper identity, and no controller mutation on invalid lookup.
- Pinned lookup rejects negative, missing, destroyed, and disabled characters but does not reject standby characters.
- Local audit found only string actor/debug identities; no live numeric PlayerID, `ID`/`PlayerNo` trigger context, or Helper Tag mutation model exists.
- [Research note](../research/2026-07-11-ikemen-tag-redirect-mutation.md) records source links, local gaps, and the staged implementation decision.
- `git diff --check`: required gate for this research-only checkpoint.
- Runtime tests/traces/smoke: N/A; no executable or visible behavior changed.

## Audit

The strongest failure mode was treating stable `pN` or Helper serial strings as upstream PlayerID, or limiting lookup to teammates despite the global root/Helper map. The decision keeps numeric PlayerID, PlayerNo, and actor ids separate. Independent review was unavailable in this host; this is an internal adversarial audit.

## Blocked

Numeric identity integration, `ID`/`PlayerNo` triggers, Helper lifecycle identity, redirected Tag execution, exact partial-mutation parity, and broad RedirectID parity.
