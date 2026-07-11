# IKEMEN expression selection research

## Finding

IKEMEN does not treat current identity, Partner, Enemy, and P2 as one interchangeable opponent pointer. P2 identity uses the P2 selection path, while Enemy/EnemyNear enumerate eligible opposing roots and Partner stays same-side.

Primary anchors at pinned revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`:

- [Partner, Enemy, P2, and base eligibility](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4968-L5109)
- [EnemyNear and P2 candidate construction](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13962-L14057)
- [P2-P8 identity routing](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L2705-L2741)

## Decision

Keep EnemyNear roster and P2 actor as independent optional expression-context inputs. Preserve the legacy opponent fallback only when no explicit selection row is supplied.
