import type { CharacterRuntimeState } from "./types";

export function applyBasicPhysics(state: CharacterRuntimeState): CharacterRuntimeState {
  const next = structuredClone(state);
  next.pos.x += next.vel.x;
  next.pos.y += next.vel.y;
  if (next.physics === "A") {
    next.vel.y += 0.45;
  }
  if (next.pos.y > 0) {
    next.pos.y = 0;
    next.vel.y = 0;
    next.stateType = "S";
  }
  return next;
}
