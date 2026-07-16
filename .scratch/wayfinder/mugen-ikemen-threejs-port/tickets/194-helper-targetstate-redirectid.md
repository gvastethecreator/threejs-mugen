# Implement helper TargetState RedirectID

Type: task
Status: resolved
Blocked by: None

## Question

Can a live helper route `TargetState` through a root `RedirectID` destination
while preserving destination-owned target memory and custom-state ownership?

## Answer

Yes, within a bounded `ikemen-go` helper route. `fd7336f7` adds an explicit
redirected state-entry path and propagates it through active, post-fighter,
interaction, and hit-pause runtime lifecycles. `121c0fee` adds the imported
trace, direct ownership coverage, and invalid redirect fail-closed coverage.

Evidence: required trace checksum `d995fa81`; full trace `628/628` with `594`
required, `34` optional, and `0` skipped; affected suite `882/882`; TypeScript
7, build, boundaries, syntax, and diff checks pass.

## Boundary

The helper resolves `RedirectID = 57` to root `p2`, reads target `77` from
that root, enters `p1` through custom states `888 -> 889` with `p2` as
`customOwnerId`, then returns via `SelfState`. Normal helper owner validation
remains intact. Invalid or missing redirects fail closed before mutation.

Helper State -1/global-state execution, helper/projectile/team ownership,
recursive redirects, exact multi-target order, persistence, rollback/netplay,
presentation, and full parity remain open.

## Sources

- [Elecbyte TargetState and SelfState](https://www.elecbyte.com/mugendocs/sctrls.html)
- [IKEMEN RedirectID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)

## Next

Select the next independent helper RedirectID ownership boundary.
