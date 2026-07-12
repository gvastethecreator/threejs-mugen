export type RuntimeRootMotionAdvanceHooks<TActor> = {
  advanceStateClock: (actor: TActor) => void;
  runMotionControllers: (actor: TActor) => void;
  advanceKinematics: (actor: TActor) => void;
  advanceAnimation: (actor: TActor) => void;
};

export type RuntimeRootMotionAdvanceInput<TActor> = {
  actor: TActor;
  hooks: RuntimeRootMotionAdvanceHooks<TActor>;
};

export class RuntimeRootMotionAdvanceWorld {
  advance<TActor>(input: RuntimeRootMotionAdvanceInput<TActor>): void {
    const { actor, hooks } = input;
    hooks.advanceStateClock(actor);
    hooks.runMotionControllers(actor);
    hooks.advanceKinematics(actor);
    hooks.advanceAnimation(actor);
  }
}
