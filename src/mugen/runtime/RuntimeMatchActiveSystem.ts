export type RuntimeMatchActiveInput<
  TRoundTimer = void,
  TCommandBuffer = void,
  TInputControl = void,
  TFighterAdvance = void,
  TPostFighter = void,
  TFinish = void,
> = {
  tickRoundTimer: () => TRoundTimer;
  pushNormalCommandBuffers: () => TCommandBuffer;
  applyInputControl: () => TInputControl;
  advanceFighters: () => TFighterAdvance;
  advancePostFighter: () => TPostFighter;
  finishRoundIfNeeded: () => TFinish;
};

export type RuntimeMatchActiveResult<
  TRoundTimer = void,
  TCommandBuffer = void,
  TInputControl = void,
  TFighterAdvance = void,
  TPostFighter = void,
  TFinish = void,
> = {
  roundTimer: TRoundTimer;
  commandBuffer: TCommandBuffer;
  inputControl: TInputControl;
  fighterAdvance: TFighterAdvance;
  postFighter: TPostFighter;
  finish: TFinish;
};

export class RuntimeMatchActiveWorld {
  advance<
    TRoundTimer = void,
    TCommandBuffer = void,
    TInputControl = void,
    TFighterAdvance = void,
    TPostFighter = void,
    TFinish = void,
  >(
    input: RuntimeMatchActiveInput<
      TRoundTimer,
      TCommandBuffer,
      TInputControl,
      TFighterAdvance,
      TPostFighter,
      TFinish
    >,
  ): RuntimeMatchActiveResult<TRoundTimer, TCommandBuffer, TInputControl, TFighterAdvance, TPostFighter, TFinish> {
    const roundTimer = input.tickRoundTimer();
    const commandBuffer = input.pushNormalCommandBuffers();
    const inputControl = input.applyInputControl();
    const fighterAdvance = input.advanceFighters();
    const postFighter = input.advancePostFighter();
    const finish = input.finishRoundIfNeeded();

    return {
      roundTimer,
      commandBuffer,
      inputControl,
      fighterAdvance,
      postFighter,
      finish,
    };
  }
}
