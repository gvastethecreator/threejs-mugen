# MUGEN AIR Multi-frame Fixture Research

Date: 2026-07-12
Roadmap entry: 467

## Primary source

- Elecbyte, [The AIR format and standard](https://www.elecbyte.com/mugendocs-11b1/air.html).

The official AIR reference defines an animation action as a sequence of animation elements. Each element stores sprite group, image index, X/Y offsets, and a display duration in game ticks; normal speed is 60 ticks per second. A finite action may also declare loop behavior, but that behavior is outside this fixture cut.

## Local decision

The repository-owned CC0 MUGEN-lite package adds a second action-`200` element:

```text
200,0,0,0,4
200,1,0,0,4
```

Both entries use distinct indexed SFF v1 sprites under group `200`. This proves parser, loader, imported runtime, animation progression, trace evidence, and Three.js presentation of one bounded multi-frame action.

`RuntimeTrace` records observed AIR element indices and per-index frame counts on aggregated actor-frame evidence. It intentionally does not split the historical aggregate key by element index, so existing unqualified `minFrames` gates still represent state/action duration across all elements; a gate that names `observedFrameIndex` evaluates `minFrames` against that element's count. Browser smoke establishes the rendered `200,0 -> 200,1` order with exact paused captures.

## Scope boundary

This does not establish AIR loop or loopstart semantics, interpolation, arbitrary offsets, flip/trans parameters, arbitrary timing, multi-frame coverage for other actions, production-art fidelity, or MUGEN/IKEMEN visual parity.
