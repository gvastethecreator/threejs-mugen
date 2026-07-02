export type RuntimeMatchInputControlOptions<TActor, TResult = void> = {
  p1: TActor;
  p2: TActor;
  p1Input: Set<string>;
  p2Input: Set<string>;
  p2Controlled: boolean;
  handlePlayerInput: (actor: TActor, input: Set<string>, opponent: TActor) => TResult;
  handleAi: (actor: TActor, opponent: TActor) => TResult;
};

export type RuntimeMatchInputControlResult<TResult = void> = {
  p1: TResult;
  p2: TResult;
  p2Controlled: boolean;
};

export class RuntimeMatchInputControlWorld {
  apply<TActor, TResult = void>(
    input: RuntimeMatchInputControlOptions<TActor, TResult>,
  ): RuntimeMatchInputControlResult<TResult> {
    const p1 = input.handlePlayerInput(input.p1, input.p1Input, input.p2);
    const p2 = input.p2Controlled
      ? input.handlePlayerInput(input.p2, input.p2Input, input.p1)
      : input.handleAi(input.p2, input.p1);

    return { p1, p2, p2Controlled: input.p2Controlled };
  }
}
