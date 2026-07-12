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

export type RuntimeMatchTickInputRoute<TActor extends RuntimeMatchTickInputActor> = {
  actorId: string;
  actor: TActor;
  input: Set<string>;
};

export type RuntimeMatchTickMappedInputFrame<TActor extends RuntimeMatchTickInputActor> = {
  tick: number;
  routes: readonly RuntimeMatchTickInputRoute<TActor>[];
};

export class RuntimeMatchTickInputWorld {
  stampFrame<TActor extends RuntimeMatchTickInputActor>(input: RuntimeMatchTickInputFrame<TActor>): void {
    this.stampMappedActors({
      tick: input.tick,
      routes: [
        { actorId: "p1", actor: input.p1, input: input.p1Input },
        { actorId: "p2", actor: input.p2, input: input.p2Input },
      ],
    });
  }

  pushNormalCommandBuffers<TActor extends RuntimeMatchTickInputActor>(input: RuntimeMatchTickInputFrame<TActor>): void {
    this.pushMappedNormalCommandBuffers({
      tick: input.tick,
      routes: [
        { actorId: "p1", actor: input.p1, input: input.p1Input },
        { actorId: "p2", actor: input.p2, input: input.p2Input },
      ],
    });
  }

  stampMappedActors<TActor extends RuntimeMatchTickInputActor>(
    input: RuntimeMatchTickMappedInputFrame<TActor>,
  ): void {
    assertUniqueRoutes(input.routes);
    for (const route of input.routes) stampActor(route.actor, input.tick, route.input);
  }

  pushMappedNormalCommandBuffers<TActor extends RuntimeMatchTickInputActor>(
    input: RuntimeMatchTickMappedInputFrame<TActor>,
  ): void {
    assertUniqueRoutes(input.routes);
    for (const route of input.routes) route.actor.commandBuffer.push(input.tick, route.input);
  }
}

function stampActor(actor: RuntimeMatchTickInputActor, tick: number, input: Set<string>): void {
  actor.compatibilityTick = tick;
  actor.currentInput = new Set(input);
}

function assertUniqueRoutes(routes: readonly RuntimeMatchTickInputRoute<RuntimeMatchTickInputActor>[]): void {
  const actorIds = new Set<string>();
  const actors = new Set<RuntimeMatchTickInputActor>();
  for (const route of routes) {
    if (actorIds.has(route.actorId) || actors.has(route.actor)) {
      throw new Error(`Duplicate mapped input actor ${route.actorId}`);
    }
    actorIds.add(route.actorId);
    actors.add(route.actor);
  }
}
