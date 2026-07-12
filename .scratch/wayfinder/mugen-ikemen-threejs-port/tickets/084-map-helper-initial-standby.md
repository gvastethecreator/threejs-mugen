# Map initial Helper standby creation

Type: research
Status: resolved
Blocked by: None

## Question

How does IKEMEN compile, evaluate, and apply the Helper controller's `standby` parameter, including defaults and expression timing?

## Acceptance

- Pin the current official wiki and pinned source implementation for `standby` on Helper creation.
- Determine static/dynamic expression semantics, default value, caller context, and mutation timing relative to Helper identity and initial state entry.
- Audit compiler operation shape, raw fallback, spawn order, identity registration, first-tick CNS, snapshots, direct combat, and projectiles locally.
- Define profile gating and failure behavior without widening Helper-created Helpers, aggregate Tag, incoming hurt/push/camera/opponent breadth, or gameplay ownership.
- Produce a durable research note, implementation sequence, roadmap update, and a claimed implementation ticket only if evidence is sufficient.

## Answer

IKEMEN compiles Helper `standby` as one optional `VT_Bool` expression. Omission leaves the fresh zeroed Helper flag false; zero clears it and any non-zero value sets it. Every parameter evaluates against the original controller caller, including when Helper `redirectid` chooses another creator. The Helper receives numeric identity and enters character lists before parameter evaluation, then standby is applied before `helperInit` requests control enabled, enters the initial state, applies any authored StateDef `ctrl` override, and prepares same-frame CNS execution.

Locally, typed Helper IR lacks standby metadata, effect dispatch lacks a profile-aware resolver, and Helper construction hardcodes both standby and stored control false instead of StateDef-over-true-fallback precedence. Identity notification and same-tick discovery already occur in the correct relative order, while ticket 083 already supplies direct-combat suppression, effective-control projection, projectile continuation, and snapshot visibility. Wayfinder 085 will close only root-created explicit-IKEMEN initial standby; unsupported expressions fail the spawn and all broader Helper/team/gameplay ownership remains blocked.
