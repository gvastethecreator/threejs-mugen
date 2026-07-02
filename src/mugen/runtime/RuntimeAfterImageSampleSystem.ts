import type { MugenAnimationFrame } from "../model/MugenAnimation";
import type { CharacterRuntimeState, RuntimeAfterImageSample } from "./types";

export type RuntimeAfterImageSampleOwner = {
  id: string;
  label: string;
  definition: {
    id: string;
  };
};

export type RuntimeAfterImageSampleActor = RuntimeAfterImageSampleOwner & {
  runtime: Pick<CharacterRuntimeState, "pos" | "facing">;
  stateOwner?: RuntimeAfterImageSampleOwner;
};

export type RuntimeAfterImageSampleFrame = Pick<
  MugenAnimationFrame,
  "spriteGroup" | "spriteIndex" | "offsetX" | "offsetY"
>;

export type RuntimeAfterImageSampleInput<TActor extends RuntimeAfterImageSampleActor> = {
  actor: TActor;
  frame?: RuntimeAfterImageSampleFrame;
};

export class RuntimeAfterImageSampleWorld {
  create<TActor extends RuntimeAfterImageSampleActor>(
    input: RuntimeAfterImageSampleInput<TActor>,
  ): RuntimeAfterImageSample | undefined {
    const frame = input.frame;
    if (!frame) {
      return undefined;
    }

    const owner = input.actor.stateOwner ?? input.actor;
    return {
      age: 0,
      pos: { ...input.actor.runtime.pos },
      facing: input.actor.runtime.facing,
      spriteOwnerId: owner.id,
      spriteOwnerDefinitionId: owner.definition.id,
      spriteOwnerLabel: owner.label,
      spriteGroup: frame.spriteGroup,
      spriteIndex: frame.spriteIndex,
      offsetX: frame.offsetX,
      offsetY: frame.offsetY,
    };
  }
}
