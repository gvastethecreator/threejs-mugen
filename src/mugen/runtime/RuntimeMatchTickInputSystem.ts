import type { CommandBuffer } from "./CommandBuffer";

export type RuntimeMatchTickInputActor = {
  compatibilityTick: number;
  currentInput: Set<string>;
  commandBuffer: Pick<CommandBuffer, "push">;
};

export type RuntimeMatchTickInputFrame<TActor extends RuntimeMatchTickInputActor> = {
  tick: number;
  p1: TActor;
  p2: TActor;
  p1Input: Set<string>;
  p2Input: Set<string>;
};

export class RuntimeMatchTickInputWorld {
  stampFrame<TActor extends RuntimeMatchTickInputActor>(input: RuntimeMatchTickInputFrame<TActor>): void {
    stampActor(input.p1, input.tick, input.p1Input);
    stampActor(input.p2, input.tick, input.p2Input);
  }

  pushNormalCommandBuffers<TActor extends RuntimeMatchTickInputActor>(input: RuntimeMatchTickInputFrame<TActor>): void {
    input.p1.commandBuffer.push(input.tick, input.p1Input);
    input.p2.commandBuffer.push(input.tick, input.p2Input);
  }
}

function stampActor(actor: RuntimeMatchTickInputActor, tick: number, input: Set<string>): void {
  actor.compatibilityTick = tick;
  actor.currentInput = new Set(input);
}
