export type RuntimeMatchOpponentContextPair<TActor> = {
  p1: TActor;
  p2: TActor;
};

export type RuntimeMatchOpponentContext<TActor> = {
  opponent: TActor;
  opponents: readonly [TActor];
};

export class RuntimeMatchOpponentContextWorld {
  forActor<TActor>(
    pair: RuntimeMatchOpponentContextPair<TActor>,
    actor: TActor,
  ): RuntimeMatchOpponentContext<TActor> | undefined {
    if (actor === pair.p1) {
      return { opponent: pair.p2, opponents: [pair.p2] };
    }
    if (actor === pair.p2) {
      return { opponent: pair.p1, opponents: [pair.p1] };
    }
    return undefined;
  }

  opponentFor<TActor>(pair: RuntimeMatchOpponentContextPair<TActor>, actor: TActor): TActor | undefined {
    return this.forActor(pair, actor)?.opponent;
  }

  opponentsFor<TActor>(pair: RuntimeMatchOpponentContextPair<TActor>, actor: TActor): readonly TActor[] {
    return this.forActor(pair, actor)?.opponents ?? [];
  }
}
