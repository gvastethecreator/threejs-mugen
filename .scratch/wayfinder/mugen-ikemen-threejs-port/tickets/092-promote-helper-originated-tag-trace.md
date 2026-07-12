# Promote Helper-originated Tag trace

Type: task
Status: resolved
Blocked by: None

## Question

Can the now-stable Helper-authored self TagOut/TagIn cycle become one required cross-system trace oracle without widening runtime semantics or gameplay ownership?

## Acceptance

- Add one required synthetic imported fixture that executes Helper-owned default-self TagOut then TagIn through the public trace harness.
- Observe concrete controller/operation telemetry, Helper standby/effective-control transition, continued CNS, and at least one preserved Helper-owned effect or projectile path.
- Use literal expected frames/checksum owned by the trace artifact; do not recompute runtime logic in the assertion.
- Keep RedirectID/aggregate Helper-caller axes, P3-P8 gameplay, incoming Helper breadth, renderer, Studio, round, resources, and score unchanged.
- Pass focused trace tests if present, full tests, TypeScript 7 typecheck/build, all required/optional traces, boundaries, and diff check.

## Answer

Yes. Required `synthetic-imported-ikemen-helper-self-tag` now executes a Helper-owned default-self TagOut/TagIn cycle through the public trace harness. Literal checksum `08014285` and four literal frame checksums cover standby/effective-control suppression and restoration, continued CNS state `1283`, concrete Tag/Projectile telemetry, and a Helper-parented Projectile that survives the cycle.

The trace promotion required no runtime widening. The adversarial pass caught actor-frame over-partitioning against official KFM air guard and evidence-count sorting drift against AssertSpecial; both were corrected before full gates. Final evidence is 170 files / 1749 tests and 539/539 traces, with 508 required and 31 optional.
