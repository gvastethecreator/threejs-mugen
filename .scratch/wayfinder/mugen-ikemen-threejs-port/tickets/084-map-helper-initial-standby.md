# Map initial Helper standby creation

Type: research
Status: open
Blocked by: None

## Question

How does IKEMEN compile, evaluate, and apply the Helper controller's `standby` parameter, including defaults and expression timing?

## Acceptance

- Pin the current official wiki and pinned source implementation for `standby` on Helper creation.
- Determine static/dynamic expression semantics, default value, caller context, and mutation timing relative to Helper identity and initial state entry.
- Audit compiler operation shape, raw fallback, spawn order, identity registration, first-tick CNS, snapshots, direct combat, and projectiles locally.
- Define profile gating and failure behavior without widening Helper-created Helpers, aggregate Tag, incoming hurt/push/camera/opponent breadth, or gameplay ownership.
- Produce a durable research note, implementation sequence, roadmap update, and a claimed implementation ticket only if evidence is sufficient.
